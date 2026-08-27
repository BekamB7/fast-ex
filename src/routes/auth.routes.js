// src/routes/auth.routes.js
import express from 'express'
import { register, login, logout, getProfile } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)

export default router