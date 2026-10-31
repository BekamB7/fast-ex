// src/index.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import examRoutes from './routes/exam.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import publicRoutes from './routes/public.routes.js'
import platformRoutes from './routes/platform.routes.js'  // ← MUST BE HERE

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/exam', examRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/platform', platformRoutes)  // ← MUST BE HERE

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fast-Ex API is running' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app