// src/utils/auth.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the backend environment.')
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(organizationId) {
  return jwt.sign({ organizationId }, JWT_SECRET, { expiresIn: '7d' })
}

export function generatePlatformToken(platformAdminId) {
  return jwt.sign(
    { platformAdminId, type: 'platform' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}