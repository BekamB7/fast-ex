// src/controllers/auth.controller.js
import { prisma } from '../utils/db.js'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js'
import { z } from 'zod'

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

    // Hash password
    const hashedPassword = await hashPassword(validated.password)

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: validated.name,
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

    return res.status(500).json({ error: 'Internal server error' })
  }
}

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

    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function logout(req, res) {
  try {
    // Delete session
    await prisma.session.delete({
      where: { id: req.session.id }
    })

    return res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

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
        adminEmail: organization.adminEmail,
        phone: organization.phone,
        address: organization.address,
        isActive: organization.isActive,
        createdAt: organization.createdAt,
        totalExams: organization.exams.length,
        totalAttempts: organization.exams.reduce((sum, exam) => sum + exam._count.attempts, 0),
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}