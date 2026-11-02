// src/routes/exam.routes.js
import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  createExam,
  getOrganizationExams,
  getExamById,
  updateExamStatus,
  updateExam,
} from '../controllers/exam.controller.js'

const router = express.Router()

// Protected routes (require authentication)
router.post('/create', authenticate, createExam)
router.get('/organization', authenticate, getOrganizationExams)
router.put('/:id', authenticate, updateExam)
router.get('/:id', authenticate, getExamById)
router.patch('/:id/status', authenticate, updateExamStatus)

// Student routes (no authentication needed)
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