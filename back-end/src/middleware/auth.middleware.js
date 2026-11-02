// src/middleware/auth.middleware.js
import { verifyToken } from '../utils/auth.js'
import { prisma } from '../utils/db.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!session) {
      return res.status(401).json({ error: 'Session expired' })
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId }
    })

    if (!organization) {
      return res.status(401).json({ error: 'Organization not found' })
    }

    if (!organization.isActive) {
      return res.status(403).json({ error: 'Organization is inactive' })
    }

    req.organization = organization
    req.session = session
    next()
  } catch (error) {
    console.error('Auth error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}