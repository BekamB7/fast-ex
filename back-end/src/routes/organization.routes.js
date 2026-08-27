// src/routes/organization.routes.js
import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  getDashboardStats,
  getResults,
} from '../controllers/organization.controller.js'

const router = express.Router()

router.get('/dashboard', authenticate, getDashboardStats)
router.get('/results', authenticate, getResults)

export default router