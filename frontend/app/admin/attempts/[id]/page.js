// frontend/app/admin/attempts/[id]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import api from '@/lib/api'

export default function AttemptDetailPage() {
  const params = useParams()
  const attemptId = params.id

  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get(`/platform/attempts/${attemptId}`)
        setAttempt(res.data.attempt)
      } catch (err) {
        setError(err.response?.data?.error || 'Attempt not found')
      } finally {
        setLoading(false)
      }
    }

    if (attemptId) fetchAttempt()
  }, [attemptId])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '3rem', height: '3rem',
          border: '3px solid var(--color-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading attempt...</p>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <XCircle style={{ width: '3rem', height: '3rem', color: 'var(--color-destructive)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {error || 'Attempt not found'}
        </h2>
        <Link href="/admin/attempts" className="btn-primary" style={{ marginTop: '1rem' }}>
          <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Attempts
        </Link>
      </div>
    )
  }

  const passed = attempt.score >= attempt.exam.passingScore
  const answers = attempt.answersJson || {}
  const questions = attempt.exam.questions

  // Count correct answers
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0

  questions.forEach(q => {
    const userAnswer = answers[q.id]
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      unansweredCount++
      return
    }

    let isCorrect = false
    if (q.questionType === 'mcq' || q.questionType === 'truefalse') {
      isCorrect = String(userAnswer).toUpperCase() === String(q.correctAnswer).toUpperCase()
    } else if (q.questionType === 'fillblank') {
      isCorrect = String(userAnswer).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()
    }

    if (isCorrect) correctCount++
    else incorrectCount++
  })

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back */}
      <Link
        href="/admin/attempts"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--color-muted-foreground)',
          fontSize: '0.875rem',
          marginBottom: '1rem',
        }}
      >
        <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
        Back to Attempts
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #087f5b, #075b43)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              {attempt.studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {attempt.studentName}
              </h1>
              <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
                {attempt.studentPhone}
              </p>
            </div>
          </div>

          <span style={{
            fontSize: '0.875rem',
            fontWeight: '700',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            background: passed ? '#ECFDF5' : '#FEE2E2',
            color: passed ? '#059669' : '#DC2626',
          }}>
            {passed ? '✓ PASSED' : '✗ FAILED'}
          </span>
        </div>

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}>
          <InfoRow icon={Phone} label="Phone" value={attempt.studentPhone} />
          {attempt.studentEmail && (
            <InfoRow icon={Mail} label="Email" value={attempt.studentEmail} />
          )}
          <InfoRow
            icon={Building2}
            label="Organization"
            value={attempt.exam.organization.name}
            link={`/admin/organizations/${attempt.exam.organization.id}`}
          />
          <InfoRow
            icon={FileText}
            label="Exam"
            value={attempt.exam.title}
            link={`/admin/exams/${attempt.exam.id}`}
          />
          <InfoRow
            icon={Calendar}
            label="Submitted"
            value={new Date(attempt.submittedAt).toLocaleString()}
          />
          <InfoRow
            icon={Clock}
            label="Started"
            value={new Date(attempt.startedAt).toLocaleString()}
          />
        </div>
      </motion.div>

      {/* Score Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <ScoreCard
          icon={Award}
          label="Score"
          value={`${attempt.score}/${attempt.totalQuestions}`}
          color="var(--color-primary)"
        />
        <ScoreCard
          icon={TrendingUp}
          label="Percentage"
          value={`${attempt.percentage}%`}
          color={passed ? '#059669' : '#DC2626'}
        />
        <ScoreCard
          icon={CheckCircle2}
          label="Correct"
          value={correctCount}
          color="#059669"
        />
        <ScoreCard
          icon={XCircle}
          label="Incorrect"
          value={incorrectCount}
          color="#DC2626"
        />
        <ScoreCard
          icon={AlertCircle}
          label="Unanswered"
          value={unansweredCount}
          color="var(--color-muted-foreground)"
        />
      </motion.div>

      {/* Questions Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
          Questions Review ({questions.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q) => {
            const userAnswer = answers[q.id]
            const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== ''

            let isCorrect = false
            if (hasAnswer) {
              if (q.questionType === 'mcq' || q.questionType === 'truefalse') {
                isCorrect = String(userAnswer).toUpperCase() === String(q.correctAnswer).toUpperCase()
              } else if (q.questionType === 'fillblank') {
                isCorrect = String(userAnswer).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()
              }
            }

            return (
              <div
                key={q.id}
                className="card"
                style={{
                  padding: '1rem',
                  borderLeft: `4px solid ${!hasAnswer ? 'var(--color-muted-foreground)' : isCorrect ? '#059669' : '#DC2626'}`,
                }}
              >
                {/* Question header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    background: 'rgba(8, 127, 91, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                  }}>
                    Q{q.questionNumber}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-muted-foreground)',
                      background: 'var(--color-secondary)',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                    }}>
                      {q.questionType}
                    </span>

                    {!hasAnswer ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--color-muted-foreground)',
                      }}>
                        <AlertCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                        Not Answered
                      </span>
                    ) : isCorrect ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#059669',
                      }}>
                        <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} />
                        Correct
                      </span>
                    ) : (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#DC2626',
                      }}>
                        <XCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontWeight: '600', marginBottom: '1rem' }}>
                  {q.questionText}
                </p>

                {/* MCQ */}
                {q.questionType === 'mcq' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const option = q[`option${letter}`]
                      if (!option) return null

                      const isCorrectAnswer = q.correctAnswer === letter
                      const isUserAnswer = userAnswer === letter

                      let bg = 'var(--color-secondary)'
                      let color = 'var(--color-foreground)'
                      let border = '1px solid transparent'

                      if (isCorrectAnswer) {
                        bg = '#ECFDF5'
                        color = '#059669'
                        border = '1px solid #059669'
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        bg = '#FEE2E2'
                        color = '#DC2626'
                        border = '1px solid #DC2626'
                      }

                      return (
                        <div
                          key={letter}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: bg,
                            color,
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border,
                          }}
                        >
                          <span style={{ fontWeight: '700' }}>{letter}.</span>
                          <span style={{ flex: 1 }}>{option}</span>
                          {isCorrectAnswer && (
                            <span style={{ fontSize: '0.7rem', color: '#059669' }}>✓ Correct Answer</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span style={{ fontSize: '0.7rem', color: '#DC2626' }}>Your Answer</span>
                          )}
                          {isUserAnswer && isCorrectAnswer && (
                            <span style={{ fontSize: '0.7rem' }}>Your Answer</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* True/False */}
                {q.questionType === 'truefalse' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['True', 'False'].map((label, i) => {
                      const letter = i === 0 ? 'A' : 'B'
                      const isCorrectAnswer = q.correctAnswer === letter
                      const isUserAnswer = userAnswer === letter

                      let bg = 'var(--color-secondary)'
                      let color = 'var(--color-foreground)'
                      let border = '1px solid transparent'

                      if (isCorrectAnswer) {
                        bg = '#ECFDF5'
                        color = '#059669'
                        border = '1px solid #059669'
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        bg = '#FEE2E2'
                        color = '#DC2626'
                        border = '1px solid #DC2626'
                      }

                      return (
                        <div
                          key={label}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            textAlign: 'center',
                            background: bg,
                            color,
                            borderRadius: '0.375rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            border,
                          }}
                        >
                          {label}
                          {isCorrectAnswer && <span style={{ display: 'block', fontSize: '0.65rem' }}>✓ Correct</span>}
                          {isUserAnswer && !isCorrectAnswer && <span style={{ display: 'block', fontSize: '0.65rem' }}>Your Answer</span>}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Fill in blank */}
                {q.questionType === 'fillblank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: isCorrect ? '#ECFDF5' : hasAnswer ? '#FEE2E2' : 'var(--color-secondary)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>Your answer:</span>
                      <p style={{
                        fontWeight: '600',
                        color: isCorrect ? '#059669' : hasAnswer ? '#DC2626' : 'var(--color-muted-foreground)',
                        marginTop: '0.125rem',
                      }}>
                        {hasAnswer ? userAnswer : 'Not answered'}
                      </p>
                    </div>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: '#ECFDF5',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>Correct answer:</span>
                      <p style={{ fontWeight: '600', color: '#059669', marginTop: '0.125rem' }}>
                        {q.correctAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, link }) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Icon style={{
        width: '1rem', height: '1rem',
        color: 'var(--color-primary)', flexShrink: 0,
      }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>{label}</p>
        <p style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </p>
      </div>
    </div>
  )

  if (link) {
    return (
      <Link to={link} href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    )
  }

  return content
}

function ScoreCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Icon style={{ width: '1.25rem', height: '1.25rem', color }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>
        {value}
      </p>
    </div>
  )
}