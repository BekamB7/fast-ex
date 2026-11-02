// src/controllers/exam.controller.js
import { randomBytes } from 'node:crypto'
import { prisma } from '../utils/db.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'
import { z } from 'zod'

const questionSchema = z.object({
  questionNumber: z.number().int().min(1).max(30),
  questionText: z.string().min(1),
  questionType: z.enum(['mcq', 'truefalse', 'fillblank']),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctAnswer: z.string().min(1),
  marks: z.number().int().min(1).default(1),
})

const examFieldsSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().nullable().optional(),
  batchYear: z.number().int().min(2000).max(2100),
  language: z.string().min(2).max(50),
  timeLimitMinutes: z.number().int().min(1).max(600).default(30),
  totalQuestions: z.number().int().min(1).max(30).default(30),
  passingScore: z.number().int().min(0).default(15),
})

const examCreateSchema = examFieldsSchema.extend({
  questions: z.array(questionSchema).min(1).max(30),
}).refine((exam) => exam.totalQuestions === exam.questions.length, {
  path: ['totalQuestions'],
  message: 'totalQuestions must match the number of questions provided',
})

const examUpdateSchema = examFieldsSchema.partial().extend({
  questions: z.array(questionSchema).min(1).max(30).optional(),
}).refine(
  (exam) => !exam.questions || exam.totalQuestions === exam.questions.length,
  {
    path: ['totalQuestions'],
    message: 'totalQuestions must match the number of questions provided',
  },
)

export async function createExam(req, res) {
  try {
    const organizationId = req.organization.id
    
    // Validate input
    const validated = examCreateSchema.parse(req.body)
    
    // Generate unique exam code
    const baseExamCode = generateExamCode(
      validated.batchYear,
      validated.language,
      organizationId
    )
    let examCode = baseExamCode
    
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await prisma.exam.findUnique({ where: { examCode } })
      if (!existing) break

      const suffix = randomBytes(2).toString('hex').toUpperCase()
      examCode = `${baseExamCode}-${suffix}`

      if (attempt === 4) {
        const finalCheck = await prisma.exam.findUnique({ where: { examCode } })
        if (finalCheck) {
          throw new Error('Unable to generate a unique exam code')
        }
      }
    }
    
    // Create exam with questions in a transaction
    const exam = await prisma.$transaction(async (tx) => {
      // Create the exam
      const newExam = await tx.exam.create({
        data: {
          organizationId: organizationId,
          examCode: examCode,
          title: validated.title,
          description: validated.description,
          batchYear: validated.batchYear,
          language: validated.language,
          timeLimitMinutes: validated.timeLimitMinutes,
          totalQuestions: validated.totalQuestions,
          passingScore: validated.passingScore,
          isActive: true,
        },
      })
      
      // Create all questions
      for (const question of validated.questions) {
        await tx.question.create({
          data: {
            examId: newExam.id,
            questionNumber: question.questionNumber,
            questionText: question.questionText,
            questionType: question.questionType,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer,
            marks: question.marks,
          },
        })
      }
      
      return newExam
    })
    
    // Fetch exam with questions
    const examWithQuestions = await prisma.exam.findUnique({
      where: { id: exam.id },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
        },
      },
    })
    
    return res.status(201).json({
      message: 'Exam created successfully',
      exam: examWithQuestions,
      examCode,
    })
    
  } catch (error) {
    console.error('Create exam error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors,
      })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function generateExamCode(batchYear, language, organizationId) {
  // Get first 4 chars of organization name or use ID
  const orgPrefix = organizationId.substring(0, 4).toUpperCase()
  const langPrefix = language.substring(0, 3).toUpperCase()
  return `EX${batchYear}-${langPrefix}-${orgPrefix}`
}

export async function getOrganizationExams(req, res) {
  try {
    const organizationId = req.organization.id
    
    const exams = await prisma.exam.findMany({
      where: { 
        organizationId: organizationId,
      },
      include: {
        questions: {
          select: {
            id: true,
            questionNumber: true,
            questionType: true,
          },
        },
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return res.json({
      exams: exams.map(exam => ({
        id: exam.id,
        examCode: exam.examCode,
        title: exam.title,
        batchYear: exam.batchYear,
        language: exam.language,
        totalQuestions: exam.totalQuestions,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        isActive: exam.isActive,
        createdAt: exam.createdAt,
        studentAttempts: exam._count.attempts,
        questionsCount: exam.questions.length,
      })),
    })
    
  } catch (error) {
    console.error('Get exams error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getExamById(req, res) {
  try {
    const { id } = req.params
    const organizationId = req.organization.id
    
    const exam = await prisma.exam.findFirst({
      where: {
        id: id,
        organizationId: organizationId,
      },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
        },
        attempts: {
          select: {
            id: true,
            studentName: true,
            studentPhone: true,
            score: true,
            percentage: true,
            status: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' })
    }
    
    return res.json({ exam })
    
  } catch (error) {
    console.error('Get exam error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateExamStatus(req, res) {
  try {
    const { id } = req.params
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body)
    const organizationId = req.organization.id
    
    const exam = await prisma.exam.findFirst({
      where: {
        id: id,
        organizationId: organizationId,
      },
    })
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' })
    }
    
    const updatedExam = await prisma.exam.update({
      where: { id: id },
      data: { isActive: isActive },
    })
    
    return res.json({
      message: `Exam ${isActive ? 'activated' : 'deactivated'} successfully`,
      exam: updatedExam,
    })
    
  } catch (error) {
    console.error('Update exam error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors,
      })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateExam(req, res) {
  try {
    const { id } = req.params
    const organizationId = req.organization.id
    const validated = examUpdateSchema.parse(req.body)
    const { questions, ...examFields } = validated

    const exam = await prisma.exam.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { attempts: true } } },
    })

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' })
    }

    if (questions && exam._count.attempts > 0) {
      return res.status(409).json({
        error: 'Questions cannot be edited after students have started this exam.',
      })
    }

    const updateData = {
      ...examFields,
      ...(questions ? { totalQuestions: examFields.totalQuestions ?? questions.length } : {}),
    }

    const updatedExam = await prisma.$transaction(async (tx) => {
      await tx.exam.update({
        where: { id },
        data: updateData,
      })

      if (questions) {
        await tx.question.deleteMany({ where: { examId: id } })
        await tx.question.createMany({
          data: questions.map((question) => ({
            ...question,
            examId: id,
          })),
        })
      }

      return tx.exam.findUnique({
        where: { id },
        include: { questions: { orderBy: { questionNumber: 'asc' } } },
      })
    })

    return res.json({ message: 'Exam updated successfully', exam: updatedExam })
  } catch (error) {
    console.error('Update exam error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}