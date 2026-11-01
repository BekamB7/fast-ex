// src/controllers/platform.controller.js
import { prisma } from '../utils/db.js'
import { 
  comparePassword, 
  generatePlatformToken,
  hashPassword,
} from '../utils/auth.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// ============================================
// PLATFORM AUTH
// ============================================

export async function platformLogin(req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const admin = await prisma.platformAdmin.findUnique({
      where: { email },
    })

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account is inactive' })
    }

    const isValid = await comparePassword(password, admin.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generatePlatformToken(admin.id)

    await prisma.platformSession.create({
      data: {
        platformAdminId: admin.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    })
  } catch (error) {
    console.error('Platform login error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function platformLogout(req, res) {
  try {
    await prisma.platformSession.delete({
      where: { id: req.session.id }
    })
    return res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function platformProfile(req, res) {
  try {
    return res.json({
      admin: {
        id: req.platformAdmin.id,
        name: req.platformAdmin.name,
        email: req.platformAdmin.email,
        createdAt: req.platformAdmin.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ============================================
// PLATFORM DASHBOARD
// ============================================

export async function getPlatformStats(req, res) {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      totalExams,
      activeExams,
      totalAttempts,
      submittedAttempts,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.exam.count(),
      prisma.exam.count({ where: { isActive: true } }),
      prisma.studentAttempt.count(),
      prisma.studentAttempt.count({ where: { status: 'submitted' } }),
    ])

    const recentOrganizations = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        adminEmail: true,
        isActive: true,
        createdAt: true,
        _count: { select: { exams: true } },
      },
    })

    const recentAttempts = await prisma.studentAttempt.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      where: { submittedAt: { not: null } },
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            passingScore: true,
            organization: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    })

    return res.json({
      stats: {
        totalOrganizations,
        activeOrganizations,
        inactiveOrganizations: totalOrganizations - activeOrganizations,
        totalExams,
        activeExams,
        totalAttempts,
        submittedAttempts,
      },
      recentOrganizations,
      recentAttempts: recentAttempts.map((attempt) => ({
        ...attempt,
        percentage: Number(attempt.percentage),
      })),
    })
  } catch (error) {
    console.error('Platform stats error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ============================================
// ORGANIZATIONS MANAGEMENT
// ============================================

export async function getAllOrganizations(req, res) {
  try {
    const { search, status } = req.query
    const whereClause = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { adminEmail: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    if (status === 'active') whereClause.isActive = true
    else if (status === 'inactive') whereClause.isActive = false

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        adminEmail: true,
        phone: true,
        address: true,
        logo: true,
        primaryColor: true,
        isActive: true,
        createdAt: true,
        _count: { select: { exams: true } },
      },
    })

    const orgsWithAttempts = await Promise.all(
      organizations.map(async (org) => {
        const attemptCount = await prisma.studentAttempt.count({
          where: { exam: { organizationId: org.id } },
        })
        return { ...org, attemptCount }
      })
    )

    return res.json({ organizations: orgsWithAttempts })
  } catch (error) {
    console.error('Get organizations error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getOrganizationById(req, res) {
  try {
    const { id } = req.params

    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        adminEmail: true,
        phone: true,
        address: true,
        logo: true,
        primaryColor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        exams: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            examCode: true,
            batchYear: true,
            language: true,
            totalQuestions: true,
            passingScore: true,
            timeLimitMinutes: true,
            isActive: true,
            createdAt: true,
            _count: { select: { attempts: true, questions: true } },
          },
        },
      },
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    const attempts = await prisma.studentAttempt.findMany({
      where: {
        exam: { organizationId: id },
        submittedAt: { not: null },
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
      take: 20,
    })

    const totalAttempts = await prisma.studentAttempt.count({
      where: { exam: { organizationId: id } },
    })

    return res.json({
      organization,
      attempts: attempts.map((attempt) => ({
        ...attempt,
        percentage: Number(attempt.percentage),
      })),
      stats: {
        totalExams: organization.exams.length,
        totalAttempts,
        passedAttempts: attempts.filter(a => 
          a.score >= (a.exam?.passingScore || 0)
        ).length,
      },
    })
  } catch (error) {
    console.error('Get organization error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function toggleOrganizationStatus(req, res) {
  try {
    const { id } = req.params
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body)

    const organization = await prisma.organization.findUnique({ where: { id } })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { isActive },
    })

    return res.json({
      message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
      organization: {
        id: updated.id,
        name: updated.name,
        isActive: updated.isActive,
      },
    })
  } catch (error) {
    console.error('Toggle org error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ============================================
// GLOBAL EXAMS VIEW
// ============================================

export async function getAllExams(req, res) {
  try {
    const { search, organizationId } = req.query
    const whereClause = {}

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { examCode: { contains: search } },
      ]
    }

    if (organizationId) whereClause.organizationId = organizationId

    const exams = await prisma.exam.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { attempts: true, questions: true },
        },
      },
    })

    return res.json({ exams })
  } catch (error) {
    console.error('Get all exams error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ============================================
// GLOBAL ATTEMPTS VIEW
// ============================================

export async function getAllAttempts(req, res) {
  try {
    const { search, limit = 50 } = req.query
    const parsedLimit = Number.parseInt(String(limit), 10)
    const take = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 200)
      : 50

    const whereClause = {
      submittedAt: { not: null },
    }

    if (search) {
      whereClause.OR = [
        { studentName: { contains: search } },
        { studentPhone: { contains: search } },
      ]
    }

    const attempts = await prisma.studentAttempt.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      take,
      include: {
        exam: {
          select: {
            title: true,
            examCode: true,
            passingScore: true,
            organization: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    })

    return res.json({
      attempts: attempts.map((attempt) => ({
        ...attempt,
        percentage: Number(attempt.percentage),
      })),
    })
  } catch (error) {
    console.error('Get all attempts error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

export async function updatePlatformProfile(req, res) {
  try {
    const validated = updateProfileSchema.parse(req.body)
    const adminId = req.platformAdmin.id

    // If email is being changed, check if it's already taken
    if (validated.email && validated.email !== req.platformAdmin.email) {
      const existing = await prisma.platformAdmin.findUnique({
        where: { email: validated.email },
      })
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' })
      }
    }

    const updated = await prisma.platformAdmin.update({
      where: { id: adminId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.email && { email: validated.email }),
      },
    })

    return res.json({
      message: 'Profile updated successfully',
      admin: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function changePlatformPassword(req, res) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
    const adminId = req.platformAdmin.id

    const admin = await prisma.platformAdmin.findUnique({
      where: { id: adminId },
    })

    const isValid = await comparePassword(currentPassword, admin.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.platformAdmin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    })

    // Invalidate all other sessions for security
    await prisma.platformSession.deleteMany({
      where: {
        platformAdminId: adminId,
        id: { not: req.session.id },
      },
    })

    return res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getExamById(req, res) {
  try {
    const { id } = req.params

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        organization: {
          select: { name: true, slug: true, id: true },
        },
        questions: {
          orderBy: { questionNumber: 'asc' },
        },
        attempts: {
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 50,
          select: {
            id: true,
            studentName: true,
            studentPhone: true,
            score: true,
            totalQuestions: true,
            percentage: true,
            submittedAt: true,
          },
        },
        _count: {
          select: { attempts: true, questions: true },
        },
      },
    })

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' })
    }

    return res.json({
      exam: {
        ...exam,
        attempts: exam.attempts.map((attempt) => ({
          ...attempt,
          percentage: Number(attempt.percentage),
        })),
      },
    })
  } catch (error) {
    console.error('Get exam error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}


export async function getAttemptById(req, res) {
  try {
    const { id } = req.params

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { questionNumber: 'asc' },
            },
            organization: {
              select: { name: true, slug: true, id: true },
            },
          },
        },
      },
    })

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' })
    }

    return res.json({
      attempt: {
        ...attempt,
        percentage: Number(attempt.percentage),
      },
    })
  } catch (error) {
    console.error('Get attempt error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}