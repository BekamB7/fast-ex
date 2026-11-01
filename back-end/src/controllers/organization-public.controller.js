// src/controllers/organization-public.controller.js
import { prisma } from '../utils/db.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'
import { z } from 'zod'

const validateCodeSchema = z.object({
  examCode: z.string().min(3).max(20),
  batchYear: z.number().optional(),
  language: z.string().optional(),
})

export async function getOrganizationBySlug(req, res) {
  try {
    const { slug } = req.params

    const organization = await prisma.organization.findUnique({
      where: { slug: slug, isActive: true },
      include: {
        exams: {
          where: { isActive: true },
          select: {
            id: true,
            examCode: true,
            title: true,
            description: true,
            batchYear: true,
            language: true,
            totalQuestions: true,
            timeLimitMinutes: true,
            passingScore: true,
            isActive: true,
            _count: { select: { attempts: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!organization) {
      return res.status(404).json({ 
        error: 'Organization not found' 
      })
    }

    // Get unique batch years and languages for filtering
    const batchYears = [...new Set(organization.exams.map(e => e.batchYear))].sort((a, b) => b - a)
    const languages = [...new Set(organization.exams.map(e => e.language))]

    return res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        primaryColor: organization.primaryColor || '#059669',
        address: organization.address,
      },
      exams: organization.exams,
      filters: {
        batchYears: batchYears,
        languages: languages,
      },
    })

  } catch (error) {
    console.error('Get organization error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getOrganizationExamsPublic(req, res) {
  try {
    const { slug } = req.params
    const { batchYear, language, search } = req.query

    const organization = await prisma.organization.findUnique({
      where: { slug: slug, isActive: true },
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Build filter
    const whereClause = {
      organizationId: organization.id,
      isActive: true,
    }

    if (batchYear) {
      whereClause.batchYear = parseInt(batchYear)
    }

    if (language) {
      whereClause.language = language
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { examCode: { contains: search } },
      ]
    }

    const exams = await prisma.exam.findMany({
      where: whereClause,
      select: {
        id: true,
        examCode: true,
        title: true,
        description: true,
        batchYear: true,
        language: true,
        totalQuestions: true,
        timeLimitMinutes: true,
        passingScore: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({
      organization: {
        name: organization.name,
        slug: organization.slug,
      },
      exams: exams,
      filters: {
        batchYear: batchYear || 'all',
        language: language || 'all',
      },
      total: exams.length,
    })

  } catch (error) {
    console.error('Get public exams error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function validateExamCodePublic(req, res) {
  try {
    const { slug } = req.params
    const { examCode, batchYear, language } = validateCodeSchema.parse(req.body)

    const organization = await prisma.organization.findUnique({
      where: { slug: slug, isActive: true },
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Find the exam
    const exam = await prisma.exam.findFirst({
      where: {
        examCode: examCode,
        organizationId: organization.id,
        isActive: true,
      },
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    })

    if (!exam) {
      return res.status(404).json({ 
        error: 'Invalid exam code for this organization' 
      })
    }

    // Check batch year if provided
    if (batchYear && exam.batchYear !== parseInt(batchYear)) {
      return res.status(400).json({
        error: `Exam is for batch ${exam.batchYear}, not ${batchYear}`,
        expectedBatchYear: exam.batchYear,
      })
    }

    // Check language if provided
    if (language && exam.language !== language) {
      return res.status(400).json({
        error: `Exam is in ${exam.language}, not ${language}`,
        expectedLanguage: exam.language,
      })
    }

    return res.json({
      valid: true,
      exam: {
        id: exam.id,
        examCode: exam.examCode,
        title: exam.title,
        description: exam.description,
        organization: organization.name,
        batchYear: exam.batchYear,
        language: exam.language,
        totalQuestions: exam.totalQuestions,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        totalAttempts: exam._count.attempts,
      },
    })

  } catch (error) {
    console.error('Validate public code error:', error)
    
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