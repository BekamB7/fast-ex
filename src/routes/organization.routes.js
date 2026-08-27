// src/routes/organization.routes.js
import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// These will be implemented in the next phase
router.get('/exams', authenticate, (req, res) => {
  res.json({ message: 'Get all exams endpoint (coming soon)' })
})

router.get('/results', authenticate, (req, res) => {
  res.json({ message: 'Get results endpoint (coming soon)' })
})

export default router