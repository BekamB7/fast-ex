// frontend/app/dashboard/page.js
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  TrendingUp, 
  PlusCircle,
  Clock,
  ChevronRight
} from 'lucide-react'
import api from '@/lib/api'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalExams: 0,
    totalAttempts: 0,
    activeExams: 0,
  })
  const [recentAttempts, setRecentAttempts] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/organization/dashboard')
        setStats(res.data.stats)
        setRecentAttempts(res.data.recentAttempts || [])
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid var(--color-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
            Overview of your exam activity
          </p>
        </div>
        <Link href="/dashboard/exams/create" className="btn-primary">
          <PlusCircle style={{ width: '1rem', height: '1rem' }} />
          Create Exam
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}>
                Total Exams
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats.totalExams}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(8, 127, 91, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}>
                Total Attempts
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats.totalAttempts}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(8, 127, 91, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}>
                Active Exams
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats.activeExams}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(8, 127, 91, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Attempts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Attempts</h2>
          <Link 
            href="/dashboard/results" 
            style={{ 
              fontSize: '0.875rem', 
              color: 'var(--color-primary)', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            View All
            <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-muted-foreground)' }}>
            <Clock style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No exam attempts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAttempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--color-secondary)',
                  borderRadius: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{attempt.studentName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    {attempt.exam?.title}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    {attempt.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}