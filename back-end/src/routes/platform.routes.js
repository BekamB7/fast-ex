// src/routes/platform.routes.js
import express from 'express'
import { authenticatePlatform } from '../middleware/platform-auth.middleware.js'
import {
  platformLogin,
  platformLogout,
  platformProfile,
  getPlatformStats,
  getAllOrganizations,
  getOrganizationById,
  toggleOrganizationStatus,
  getAllExams,
  getAllAttempts,
   updatePlatformProfile,
  changePlatformPassword,
  getExamById,
  getAttemptById,
} from '../controllers/platform.controller.js'

const router = express.Router()

// Auth (public)
router.post('/login', platformLogin)

// Protected
router.post('/logout', authenticatePlatform, platformLogout)
router.get('/profile', authenticatePlatform, platformProfile)
router.get('/stats', authenticatePlatform, getPlatformStats)
router.get('/organizations', authenticatePlatform, getAllOrganizations)
router.get('/organizations/:id', authenticatePlatform, getOrganizationById)
router.patch('/organizations/:id/status', authenticatePlatform, toggleOrganizationStatus)
router.get('/exams', authenticatePlatform, getAllExams)
router.get('/attempts', authenticatePlatform, getAllAttempts)
router.put('/profile', authenticatePlatform, updatePlatformProfile)
router.put('/password', authenticatePlatform, changePlatformPassword)
router.get('/exams/:id', authenticatePlatform, getExamById)
router.get('/attempts/:id', authenticatePlatform, getAttemptById)
export default router