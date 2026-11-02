// src/controllers/organization.controller.js
import { prisma } from '../utils/db.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'

export async function getDashboardStats(req, res) {
  try {
    const organizationId = req.organization.id
    
    const [examCount, attemptCount, activeExams] = await Promise.all([
      prisma.exam.count({
        where: { organizationId: organizationId },
      }),
      prisma.studentAttempt.count({
        where: {
          exam: {
            organizationId: organizationId,
          },
        },
      }),
      prisma.exam.count({
        where: {
          organizationId: organizationId,
          isActive: true,
        },
      }),
    ])
    
    // Get recent attempts
    const recentAttempts = await prisma.studentAttempt.findMany({
      where: {
        exam: {
          organizationId: organizationId,
        },
      },
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            passingScore: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    })
    
    return res.json({
      stats: {
        totalExams: examCount,
        totalAttempts: attemptCount,
        activeExams: activeExams,
      },
      recentAttempts: recentAttempts,
    })
    
  } catch (error) {
    console.error('Dashboard stats error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getResults(req, res) {
  try {
    const organizationId = req.organization.id
    const { examId } = req.query
    
    const whereClause = {
      exam: {
        organizationId: organizationId,
      },
      submittedAt: { not: null },
    }
    
    if (examId) {
      whereClause.examId = examId
    }
    
    const [results, blockedAttempts] = await Promise.all([
      prisma.studentAttempt.findMany({
      where: whereClause,
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            totalQuestions: true,
            passingScore: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      }),
      prisma.blockedExamAttempt.findMany({
        where: {
          exam: { organizationId },
          ...(examId ? { examId } : {}),
        },
        include: {
          exam: {
            select: { title: true, examCode: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    
    return res.json({
      results: results.map(result => ({
        id: result.id,
        examId: result.examId,
        studentName: result.studentName,
        studentPhone: result.studentPhone,
        studentEmail: result.studentEmail,
        examTitle: result.exam.title,
        examCode: result.exam.examCode,
        passingScore: result.exam.passingScore,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: Number(result.percentage),
        status: result.status,
        submittedAt: result.submittedAt,
      })),
      blockedAttempts: blockedAttempts.map((attempt) => ({
        id: attempt.id,
        examId: attempt.examId,
        studentName: attempt.studentName,
        studentPhone: attempt.studentPhone,
        matchedStudentName: attempt.matchedStudentName,
        reason: attempt.reason,
        examTitle: attempt.exam.title,
        examCode: attempt.exam.examCode,
        createdAt: attempt.createdAt,
      })),
    })
    
  } catch (error) {
    console.error('Get results error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function normalizePhone(phone) {
  const hasPlus = phone.trim().startsWith('+')
  const digits = phone.replace(/\D/g, '')
  return `${hasPlus ? '+' : ''}${digits}`
}

export async function lookupStudentByPhone(req, res) {
  try {
    const phone = z.string()
      .trim()
      .regex(/^\+?[0-9\s().-]+$/)
      .transform(normalizePhone)
      .refine((value) => {
        const digits = value.replace(/\D/g, '')
        return digits.length >= 7 && digits.length <= 15
      })
      .parse(req.query.phone)
    const phoneDigits = phone.replace(/\D/g, '')
    const phoneVariants = [...new Set([phone, phoneDigits, `+${phoneDigits}`])]
    const organizationFilter = { exam: { organizationId: req.organization.id } }

    const [attempts, blockedAttempts] = await Promise.all([
      prisma.studentAttempt.findMany({
        where: {
          ...organizationFilter,
          studentPhone: { in: phoneVariants },
        },
        include: {
          exam: { select: { title: true, examCode: true, passingScore: true } },
        },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.blockedExamAttempt.findMany({
        where: {
          ...organizationFilter,
          studentPhone: { in: phoneVariants },
        },
        include: {
          exam: { select: { title: true, examCode: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return res.json({
      phone,
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        studentName: attempt.studentName,
        studentPhone: attempt.studentPhone,
        examTitle: attempt.exam.title,
        examCode: attempt.exam.examCode,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Number(attempt.percentage),
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      })),
      blockedAttempts: blockedAttempts.map((attempt) => ({
        id: attempt.id,
        studentName: attempt.studentName,
        matchedStudentName: attempt.matchedStudentName,
        reason: attempt.reason,
        examTitle: attempt.exam.title,
        examCode: attempt.exam.examCode,
        createdAt: attempt.createdAt,
      })),
    })
  } catch (error) {
    console.error('Student phone lookup error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Enter a valid phone number' })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}