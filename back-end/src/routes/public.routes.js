// src/routes/public.routes.js
import express from 'express'
import {
  getOrganizationBySlug,
  getOrganizationExamsPublic,
  validateExamCodePublic,
} from '../controllers/organization-public.controller.js'
import {
  startExam,
  submitExam,
  getStudentResult,
} from '../controllers/student.controller.js'

const router = express.Router()

// ============================================
// ORGANIZATION PUBLIC PAGES
// ============================================

// Get organization info and available exams
router.get('/:slug', getOrganizationBySlug)

// Get filtered exams for organization
router.get('/:slug/exams', getOrganizationExamsPublic)

// Validate exam code for organization
router.post('/:slug/validate', validateExamCodePublic)

// ============================================
// STUDENT EXAM FLOW (public)
// ============================================

// Start exam (public - no auth needed)
router.post('/:slug/exam/start', startExam)

// Submit exam
router.post('/:slug/exam/submit', submitExam)

// Get result
router.get('/:slug/exam/result/:attemptId', getStudentResult)

export default router