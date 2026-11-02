// frontend/app/[slug]/exam/[code]/result/[attemptId]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  XCircle, 
  Home, 
  Award,
  TrendingUp,
  FileText
} from 'lucide-react'
import api from '@/lib/api'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const { slug, code, attemptId } = params

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/public/${slug}/exam/result/${attemptId}`)
        setResult(res.data.attempt)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load result')
      } finally {
        setLoading(false)
      }
    }

    if (slug && attemptId) {
      fetchResult()
    }
  }, [slug, attemptId])

  if (loading) {
    return (
      <div className="site-main">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid var(--color-primary)', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading result...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="site-main">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <XCircle style={{ width: '4rem', height: '4rem', color: 'var(--color-destructive)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Result Not Found</h2>
          <p style={{ color: 'var(--color-muted-foreground)' }}>{error}</p>
        </div>
      </div>
    )
  }

  const passed = result.passed

  return (
    <div className="site-main">
      <div className="container" style={{ maxWidth: '600px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card"
          style={{ textAlign: 'center' }}
        >
          {/* Icon */}
          <div style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '9999px',
            background: passed ? '#ECFDF5' : '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            {passed ? (
              <CheckCircle2 style={{ width: '3rem', height: '3rem', color: '#059669' }} />
            ) : (
              <XCircle style={{ width: '3rem', height: '3rem', color: '#DC2626' }} />
            )}
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: passed ? '#059669' : '#DC2626'
          }}>
            {passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h1>
          <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '2rem' }}>
            {passed ? 'You have passed the exam' : 'You did not pass the exam'}
          </p>

          {/* Score */}
          <div style={{
            background: 'var(--color-secondary)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '0.5rem' }}>
              Your Score
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {result.score}
              </span>
              <span style={{ fontSize: '1.5rem', color: 'var(--color-muted-foreground)' }}>
                / {result.totalQuestions}
              </span>
            </div>
            <div style={{ 
              marginTop: '1rem',
              height: '0.5rem',
              background: 'var(--color-border)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${result.percentage}%`,
                background: passed ? '#059669' : '#DC2626',
                borderRadius: '9999px',
                transition: 'width 1s ease'
              }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginTop: '0.5rem' }}>
              {result.percentage}% • Passing: {result.passingScore}/{result.totalQuestions}
            </p>
          </div>

          {/* Info */}
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted-foreground)' }}>Name</span>
                <span style={{ fontWeight: '600' }}>{result.studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted-foreground)' }}>Exam</span>
                <span style={{ fontWeight: '600' }}>{result.examTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted-foreground)' }}>Submitted</span>
                <span style={{ fontWeight: '600' }}>
                  {new Date(result.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <button
            className="btn-primary"
            onClick={() => router.push(`/${slug}`)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Home style={{ width: '1rem', height: '1rem' }} />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}