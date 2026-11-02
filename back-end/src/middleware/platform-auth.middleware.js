// src/middleware/platform-auth.middleware.js
import { verifyToken } from '../utils/auth.js'
import { prisma } from '../utils/db.js'
import { respondWithDatabaseUnavailable } from '../utils/errors.js'

export async function authenticatePlatform(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.type !== 'platform') {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const session = await prisma.platformSession.findFirst({
      where: {
        token: token,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return res.status(401).json({ error: 'Session expired' })
    }

    const admin = await prisma.platformAdmin.findUnique({
      where: { id: decoded.platformAdminId }
    })

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Account not found or inactive' })
    }

    req.platformAdmin = admin
    req.session = session
    next()
  } catch (error) {
    console.error('Platform auth error:', error)
    if (respondWithDatabaseUnavailable(res, error)) return
    return res.status(500).json({ error: 'Internal server error' })
  }
}