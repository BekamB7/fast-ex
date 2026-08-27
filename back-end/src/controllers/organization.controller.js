// src/controllers/organization.controller.js
import { prisma } from '../utils/db.js'

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
    }
    
    if (examId) {
      whereClause.examId = examId
    }
    
    const results = await prisma.studentAttempt.findMany({
      where: whereClause,
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            totalQuestions: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })
    
    return res.json({
      results: results.map(result => ({
        id: result.id,
        studentName: result.studentName,
        studentPhone: result.studentPhone,
        studentEmail: result.studentEmail,
        examTitle: result.exam.title,
        examCode: result.exam.examCode,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        status: result.status,
        submittedAt: result.submittedAt,
      })),
    })
    
  } catch (error) {
    console.error('Get results error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}