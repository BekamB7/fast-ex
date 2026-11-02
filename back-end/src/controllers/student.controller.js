// src/controllers/student.controller.js
import { prisma } from '../utils/db.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const validateCodeSchema = z.object({
  examCode: z.string().min(3).max(20),
})

function normalizePhone(phone) {
  const hasPlus = phone.trim().startsWith('+')
  const digits = phone.replace(/\D/g, '')
  return `${hasPlus ? '+' : ''}${digits}`
}

const startExamSchema = z.object({
  examCode: z.string().min(3).max(20),
  studentName: z.string().trim().min(2).max(100),
  studentPhone: z.string()
    .trim()
    .regex(/^\+?[0-9\s().-]+$/, 'Enter a valid phone number')
    .transform(normalizePhone)
    .refine((phone) => {
      const digits = phone.replace(/\D/g, '')
      return digits.length >= 7 && digits.length <= 15
    }, 'Phone number must contain 7 to 15 digits'),
  studentEmail: z.preprocess(
    (email) => email === '' ? undefined : email,
    z.string().email().optional(),
  ),
})

const submitExamSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(z.string(), z.any()),
})

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * Validate Exam Code
 * Check if exam code exists and is active
 */
export async function validateExamCode(req, res) {
  try {
    const { examCode } = validateCodeSchema.parse(req.body)

    const exam = await prisma.exam.findUnique({
      where: { examCode: examCode },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { attempts: true },
        },
      },
    })

    if (!exam) {
      return res.status(404).json({ 
        error: 'Invalid exam code. Please check and try again.' 
      })
    }

    if (!exam.isActive) {
      return res.status(403).json({ 
        error: 'This exam is currently inactive. Please contact your administrator.' 
      })
    }

    return res.json({
      valid: true,
      exam: {
        id: exam.id,
        examCode: exam.examCode,
        title: exam.title,
        description: exam.description,
        organization: exam.organization.name,
        organizationSlug: exam.organization.slug,
        batchYear: exam.batchYear,
        language: exam.language,
        totalQuestions: exam.totalQuestions,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        totalAttempts: exam._count.attempts,
      },
    })

  } catch (error) {
    console.error('Validate code error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      })
    }
    if (respondWithDatabaseUnavailable(res, error)) return

    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Start Exam
 * Create new attempt or resume existing one
 */
export async function startExam(req, res) {
  try {
    const validated = startExamSchema.parse(req.body)

    // Get organization from URL param if available
    const { slug } = req.params || {}

    // Find the exam
    const whereClause = {
      examCode: validated.examCode,
      isActive: true,
    }

    // If slug is provided, filter by organization
    if (slug) {
      const organization = await prisma.organization.findUnique({
        where: { slug: slug, isActive: true },
      })

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' })
      }

      whereClause.organizationId = organization.id
    }

    const exam = await prisma.exam.findFirst({
      where: whereClause,
      include: {
        questions: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            questionType: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            marks: true,
          },
          orderBy: { questionNumber: 'asc' },
        },
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' })
    }

    const examAttempts = await prisma.studentAttempt.findMany({
      where: {
        examId: exam.id,
      },
      select: { id: true, studentName: true, studentPhone: true, status: true, score: true, totalQuestions: true, percentage: true, submittedAt: true, startedAt: true, answersJson: true, studentEmail: true },
    })

    const normalizedPhone = normalizePhone(validated.studentPhone)
    const matchingPhone = examAttempts.filter(
      (attempt) => normalizePhone(attempt.studentPhone) === normalizedPhone,
    )
    const matchingName = (name) =>
      name.trim().replace(/\s+/g, ' ').toLocaleLowerCase() ===
      validated.studentName.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
    const sameStudentAttempt = matchingPhone.find((attempt) => matchingName(attempt.studentName))
    const phoneConflict = matchingPhone.find((attempt) => !matchingName(attempt.studentName))

    if (phoneConflict) {
      const message = `This phone number is already registered to ${phoneConflict.studentName}. Contact your organization if this is incorrect.`
      await prisma.blockedExamAttempt.create({
        data: {
          examId: exam.id,
          studentName: validated.studentName.trim(),
          studentPhone: normalizedPhone,
          matchedStudentName: phoneConflict.studentName,
          reason: 'phone_name_conflict',
        },
      })
      return res.status(409).json({
        error: message,
        reason: 'phone_name_conflict',
      })
    }

    if (sameStudentAttempt && ['submitted', 'timeout'].includes(sameStudentAttempt.status)) {
      await prisma.blockedExamAttempt.create({
        data: {
          examId: exam.id,
          studentName: validated.studentName.trim(),
          studentPhone: normalizedPhone,
          matchedStudentName: sameStudentAttempt.studentName,
          reason: 'duplicate_attempt',
        },
      })
      return res.status(403).json({
        error: 'You have already taken this exam.',
        attempt: {
          id: sameStudentAttempt.id,
          score: sameStudentAttempt.score,
          totalQuestions: sameStudentAttempt.totalQuestions,
          percentage: Number(sameStudentAttempt.percentage),
          status: sameStudentAttempt.status,
          submittedAt: sameStudentAttempt.submittedAt,
        },
      })
    }

    // Check if there's an in-progress attempt (resume)
    const inProgressAttempt = sameStudentAttempt?.status === 'in_progress'
      ? sameStudentAttempt
      : null

    if (inProgressAttempt) {
      return res.json({
        attemptId: inProgressAttempt.id,
        exam: {
          id: exam.id,
          title: exam.title,
          examCode: exam.examCode,
          organization: exam.organization.name,
          organizationSlug: exam.organization.slug,
          batchYear: exam.batchYear,
          language: exam.language,
          timeLimitMinutes: exam.timeLimitMinutes,
          totalQuestions: exam.totalQuestions,
        },
        questions: exam.questions,
        studentInfo: {
          name: inProgressAttempt.studentName,
          phone: inProgressAttempt.studentPhone,
          email: inProgressAttempt.studentEmail,
        },
        answers: inProgressAttempt.answersJson || {},
        startedAt: inProgressAttempt.startedAt,
        isResume: true,
      })
    }

    // Create new attempt
    const attempt = await prisma.studentAttempt.create({
      data: {
        examId: exam.id,
        studentName: validated.studentName,
        studentPhone: validated.studentPhone,
        studentEmail: validated.studentEmail,
        batchYear: exam.batchYear,
        language: exam.language,
        examCode: exam.examCode,
        totalQuestions: exam.totalQuestions,
        status: 'in_progress',
      },
    })

    return res.json({
      attemptId: attempt.id,
      exam: {
        id: exam.id,
        title: exam.title,
        examCode: exam.examCode,
        organization: exam.organization.name,
        organizationSlug: exam.organization.slug,
        batchYear: exam.batchYear,
        language: exam.language,
        timeLimitMinutes: exam.timeLimitMinutes,
        totalQuestions: exam.totalQuestions,
      },
      questions: exam.questions,
      studentInfo: {
        name: attempt.studentName,
        phone: attempt.studentPhone,
        email: attempt.studentEmail,
      },
      answers: {},
      startedAt: attempt.startedAt,
      isResume: false,
    })

  } catch (error) {
    console.error('Start exam error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      })
    }
    if (respondWithDatabaseUnavailable(res, error)) return

    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Submit Exam
 * Grade answers and save results
 */
export async function submitExam(req, res) {
  try {
    const { attemptId, answers } = submitExamSchema.parse(req.body)

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true,
            organization: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' })
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ 
        error: `This exam has already been ${attempt.status}` 
      })
    }

    // Calculate score
    let score = 0
    const totalQuestions = attempt.exam.totalQuestions
    const questions = attempt.exam.questions
    let correctCount = 0
    let incorrectCount = 0

    for (const question of questions) {
      const userAnswer = answers[question.id]
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        let isCorrect = false
        
        if (question.questionType === 'mcq' || question.questionType === 'truefalse') {
          isCorrect = String(userAnswer).toUpperCase() === String(question.correctAnswer).toUpperCase()
        } else if (question.questionType === 'fillblank') {
          isCorrect = String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()
        }
        
        if (isCorrect) {
          score += question.marks || 1
          correctCount++
        } else {
          incorrectCount++
        }
      } else {
        incorrectCount++ // Unanswered counts as incorrect
      }
    }

    // Calculate percentage
    const maxScore = questions.reduce((sum, q) => sum + (q.marks || 1), 0)
    const percentage = Math.round((score / maxScore) * 100 * 100) / 100

    // Update attempt
    const updatedAttempt = await prisma.studentAttempt.update({
      where: { id: attemptId },
      data: {
        score: score,
        percentage: percentage,
        answersJson: answers,
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            passingScore: true,
            totalQuestions: true,
          },
        },
      },
    })

    const passed = score >= updatedAttempt.exam.passingScore

    return res.json({
      success: true,
      message: 'Exam submitted successfully!',
      attemptId: updatedAttempt.id,
      studentName: updatedAttempt.studentName,
      studentPhone: updatedAttempt.studentPhone,
      examTitle: updatedAttempt.exam.title,
      examCode: updatedAttempt.exam.examCode,
      score: score,
      maxScore: maxScore,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      percentage: percentage,
      passingScore: updatedAttempt.exam.passingScore,
      passed: passed,
      status: updatedAttempt.status,
      submittedAt: updatedAttempt.submittedAt,
    })

  } catch (error) {
    console.error('Submit exam error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      })
    }
    if (respondWithDatabaseUnavailable(res, error)) return

    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Get Student Result
 * View result by attempt ID
 */
export async function getStudentResult(req, res) {
  try {
    const { attemptId } = req.params

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            passingScore: true,
            totalQuestions: true,
            organization: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' })
    }

    if (attempt.status !== 'submitted') {
      return res.status(409).json({
        error: 'Result is not available until the exam is submitted',
      })
    }

    const passed = attempt.score >= attempt.exam.passingScore

    return res.json({
      attempt: {
        id: attempt.id,
        studentName: attempt.studentName,
        studentPhone: attempt.studentPhone,
        studentEmail: attempt.studentEmail,
        examTitle: attempt.exam.title,
        examCode: attempt.exam.examCode,
        organization: attempt.exam.organization.name,
        organizationSlug: attempt.exam.organization.slug,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Number(attempt.percentage),
        passingScore: attempt.exam.passingScore,
        passed: passed,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        startedAt: attempt.startedAt,
      },
    })

  } catch (error) {
    console.error('Get result error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}