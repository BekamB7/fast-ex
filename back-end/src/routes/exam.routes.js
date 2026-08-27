// src/routes/exam.routes.js
import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// These will be implemented in the next phase
router.post('/create', authenticate, (req, res) => {
  res.json({ message: 'Create exam endpoint (coming soon)' })
})

router.post('/validate', (req, res) => {
  res.json({ message: 'Validate exam code endpoint (coming soon)' })
})

router.post('/start', (req, res) => {
  res.json({ message: 'Start exam endpoint (coming soon)' })
})

router.post('/submit', (req, res) => {
  res.json({ message: 'Submit exam endpoint (coming soon)' })
})

export default router