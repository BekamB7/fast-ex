// src/controllers/auth.controller.js
import { randomBytes } from 'node:crypto'
import { prisma } from '../utils/db.js'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  adminEmail: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const loginSchema = z.object({
  adminEmail: z.string().email(),
  password: z.string().min(6),
})

const updateOrganizationProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  adminEmail: z.string().email().max(100).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  address: z.string().trim().max(5000).nullable().optional(),
  logo: z.string().url().max(2048).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
})

const changeOrganizationPasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

// ============================================
// REGISTER - Create new organization
// ============================================

export async function register(req, res) {
  try {
    const validated = registerSchema.parse(req.body)

    // Check if organization already exists
    const existing = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { adminEmail: validated.adminEmail },
        ],
      },
    })

    if (existing) {
      return res.status(400).json({ 
        error: 'Organization name or email already exists' 
      })
    }

    // Generate slug from name (for URL: /abc-university)
    const baseSlug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
      .replace(/-+$/g, '') || 'organization'
    let slug = baseSlug

    for (let attempt = 0; attempt < 5; attempt++) {
      const existingSlug = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!existingSlug) break

      const suffix = randomBytes(2).toString('hex')
      slug = `${baseSlug.slice(0, 44)}-${suffix}`
    }

    const finalSlugCheck = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (finalSlugCheck) {
      return res.status(409).json({
        error: 'Could not create a unique organization URL. Please try again.',
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password)

    // Create organization with slug
    const organization = await prisma.organization.create({
      data: {
        name: validated.name,
        slug: slug,
        adminEmail: validated.adminEmail,
        adminPassword: hashedPassword,
        phone: validated.phone,
        address: validated.address,
      },
    })

    return res.status(201).json({
      message: 'Organization registered successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        adminEmail: organization.adminEmail,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    
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

// ============================================
// LOGIN - Authenticate organization
// ============================================

export async function login(req, res) {
  try {
    const validated = loginSchema.parse(req.body)

    // Find organization
    const organization = await prisma.organization.findUnique({
      where: { adminEmail: validated.adminEmail },
    })

    if (!organization) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!organization.isActive) {
      return res.status(403).json({ error: 'Organization is inactive' })
    }

    // Verify password
    const isValid = await comparePassword(
      validated.password,
      organization.adminPassword
    )

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(organization.id)

    // Store session
    await prisma.session.create({
      data: {
        organizationId: organization.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return res.json({
      message: 'Login successful',
      token,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        adminEmail: organization.adminEmail,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

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

// ============================================
// LOGOUT - End session
// ============================================

export async function logout(req, res) {
  try {
    // Delete session
    await prisma.session.delete({
      where: { id: req.session.id }
    })

    return res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ============================================
// GET PROFILE - Get organization details
// ============================================

export async function getProfile(req, res) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.organization.id },
      include: {
        exams: {
          include: {
            _count: {
              select: { attempts: true }
            }
          }
        }
      }
    })

    return res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        adminEmail: organization.adminEmail,
        phone: organization.phone,
        address: organization.address,
        logo: organization.logo,
        primaryColor: organization.primaryColor,
        isActive: organization.isActive,
        createdAt: organization.createdAt,
        totalExams: organization.exams.length,
        totalAttempts: organization.exams.reduce((sum, exam) => sum + exam._count.attempts, 0),
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateOrganizationProfile(req, res) {
  try {
    const validated = updateOrganizationProfileSchema.parse(req.body)
    const organization = await prisma.organization.update({
      where: { id: req.organization.id },
      data: validated,
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
      },
    })

    return res.json({
      message: 'Organization profile updated successfully',
      organization,
    })
  } catch (error) {
    console.error('Update organization profile error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Organization name or email is already in use' })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function changeOrganizationPassword(req, res) {
  try {
    const { currentPassword, newPassword } = changeOrganizationPasswordSchema.parse(req.body)
    const organization = await prisma.organization.findUnique({
      where: { id: req.organization.id },
      select: { adminPassword: true },
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    const isValid = await comparePassword(currentPassword, organization.adminPassword)
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.$transaction([
      prisma.organization.update({
        where: { id: req.organization.id },
        data: { adminPassword: hashedPassword },
      }),
      prisma.session.deleteMany({
        where: {
          organizationId: req.organization.id,
          id: { not: req.session.id },
        },
      }),
    ])

    return res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change organization password error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}