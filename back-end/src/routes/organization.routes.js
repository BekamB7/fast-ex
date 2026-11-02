// src/routes/organization.routes.js
import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  getDashboardStats,
  getResults,
  lookupStudentByPhone,
} from '../controllers/organization.controller.js'

const router = express.Router()

router.get('/dashboard', authenticate, getDashboardStats)
router.get('/results', authenticate, getResults)
router.get('/students/lookup', authenticate, lookupStudentByPhone)

export default router