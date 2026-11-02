// src/routes/auth.routes.js
import express from 'express'
import {
  register,
  login,
  logout,
  getProfile,
  updateOrganizationProfile,
  changeOrganizationPassword,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateOrganizationProfile)
router.put('/password', authenticate, changeOrganizationPassword)

export default router