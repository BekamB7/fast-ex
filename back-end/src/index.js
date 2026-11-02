// src/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { readFile } from 'node:fs/promises'
import { prisma } from './utils/db.js'

import authRoutes from './routes/auth.routes.js'
import examRoutes from './routes/exam.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import publicRoutes from './routes/public.routes.js'
import platformRoutes from './routes/platform.routes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api', (req, res) => {
  res.json({
    name: 'Fast-Ex API',
    version: '1.0.0',
    health: '/api/health',
    documentation: '/api/docs',
    routes: {
      auth: '/api/auth',
      organization: '/api/organization',
      exams: '/api/exam',
      public: '/api/public',
      platform: '/api/platform',
    },
  })
})

app.get('/api/docs', (req, res) => {
  readFile(new URL('../API.md', import.meta.url), 'utf8')
    .then((documentation) => res.type('text/markdown').send(documentation))
    .catch((error) => {
      console.error('Failed to load API documentation:', error)
      res.status(500).json({ error: 'API documentation is unavailable' })
    })
})

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      database: 'connected',
      message: 'Fast-Ex API and database are ready',
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      message:
        'The API is running, but MariaDB is unavailable. Check DATABASE_URL, server access, and the database user host grants.',
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/exam', examRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/platform', platformRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500
    ? err.status
    : 500
  res.status(status).json({
    error: status < 500 ? 'Invalid request' : 'Internal server error',
  })
})

export default app