// frontend/app/admin/exams/[id]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  FileText,
  Clock,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  ExternalLink,
  Eye,
} from 'lucide-react'
import api from '@/lib/api'

export default function ExamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id

  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/platform/exams/${examId}`)
        setExam(res.data.exam)
      } catch (err) {
        setError(err.response?.data?.error || 'Exam not found')
      } finally {
        setLoading(false)
      }
    }

    if (examId) fetchExam()
  }, [examId])

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
        <p>Loading exam...</p>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <XCircle style={{ width: '3rem', height: '3rem', color: 'var(--color-destructive)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {error || 'Exam not found'}
        </h2>
        <Link href="/admin/exams" className="btn-primary" style={{ marginTop: '1rem' }}>
          <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Exams
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back */}
      <Link
        href="/admin/exams"
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
        Back to Exams
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #087f5b, #075b43)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}>
            <FileText style={{ width: '2rem', height: '2rem' }} />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '0.5rem',
            }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{exam.title}</h1>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: exam.isActive ? '#ECFDF5' : '#FEE2E2',
                color: exam.isActive ? '#059669' : '#DC2626',
              }}>
                {exam.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <code style={{
              display: 'inline-block',
              fontSize: '0.875rem',
              color: 'var(--color-primary)',
              fontWeight: '600',
              background: 'rgba(8, 127, 91, 0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '0.75rem',
            }}>
              {exam.examCode}
            </code>

            <p style={{
              color: 'var(--color-muted-foreground)',
              fontSize: '0.875rem',
              marginBottom: '0.75rem',
            }}>
              {exam.description || 'No description'}
            </p>

            <Link
              href={`/admin/organizations/${exam.organization.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                color: 'var(--color-primary)',
                fontWeight: '600',
              }}
            >
              <Building2 style={{ width: '1rem', height: '1rem' }} />
              {exam.organization.name}
              <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}>
          <StatBox icon={FileText} label="Questions" value={exam._count.questions} />
          <StatBox icon={Clock} label="Duration" value={`${exam.timeLimitMinutes}m`} />
          <StatBox icon={GraduationCap} label="Pass Score" value={`${exam.passingScore}/${exam.totalQuestions}`} />
          <StatBox icon={Users} label="Attempts" value={exam._count.attempts} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Questions ({exam.questions.length})
        </TabButton>
        <TabButton
          active={activeTab === 'attempts'}
          onClick={() => setActiveTab('attempts')}
        >
          Attempts ({exam._count.attempts})
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {exam.questions.map((q) => (
            <div key={q.id} className="card" style={{ padding: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
                gap: '0.5rem',
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
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-muted-foreground)',
                  background: 'var(--color-secondary)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                }}>
                  {q.questionType}
                </span>
              </div>

              <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                {q.questionText}
              </p>

              {q.questionType === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const option = q[`option${letter}`]
                    if (!option) return null
                    const isCorrect = q.correctAnswer === letter
                    return (
                      <div
                        key={letter}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: isCorrect ? '#ECFDF5' : 'var(--color-secondary)',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          color: isCorrect ? '#059669' : 'var(--color-foreground)',
                          fontWeight: isCorrect ? '600' : '400',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ fontWeight: '700' }}>{letter}.</span>
                        {option}
                        {isCorrect && <CheckCircle2 style={{ width: '1rem', height: '1rem', marginLeft: 'auto' }} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {q.questionType === 'truefalse' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['True', 'False'].map((label, i) => {
                    const letter = i === 0 ? 'A' : 'B'
                    const isCorrect = q.correctAnswer === letter
                    return (
                      <div
                        key={label}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          textAlign: 'center',
                          background: isCorrect ? '#ECFDF5' : 'var(--color-secondary)',
                          borderRadius: '0.375rem',
                          fontWeight: '600',
                          color: isCorrect ? '#059669' : 'var(--color-foreground)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {label}
                      </div>
                    )
                  })}
                </div>
              )}

              {q.questionType === 'fillblank' && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: '#ECFDF5',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#059669',
                  fontWeight: '600',
                }}>
                  Answer: {q.correctAnswer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'attempts' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {exam.attempts.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted-foreground)' }}>
              No attempts yet
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-secondary)' }}>
                    <th style={thStyle}>Student</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Score</th>
                    <th style={thStyle}>%</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {exam.attempts.map((a) => {
                    const passed = a.score >= exam.passingScore
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{a.studentName}</span>
                        </td>
                        <td style={tdStyle}>{a.studentPhone}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {a.score}/{a.totalQuestions}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            background: passed ? '#ECFDF5' : '#FEE2E2',
                            color: passed ? '#059669' : '#DC2626',
                          }}>
                            {a.percentage}%
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                            {new Date(a.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <Link
                            href={`/admin/attempts/${a.id}`}
                            style={{
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Eye style={{ width: '1rem', height: '1rem' }} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Icon style={{
        width: '1.25rem', height: '1.25rem',
        color: 'var(--color-primary)', margin: '0 auto 0.375rem',
      }} />
      <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>{label}</p>
      <p style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{value}</p>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1rem',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
        fontWeight: active ? '700' : '500',
        fontSize: '0.875rem',
        cursor: 'pointer',
        marginBottom: '-1px',
      }}
    >
      {children}
    </button>
  )
}

const thStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--color-muted-foreground)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '0.75rem',
  fontSize: '0.875rem',
  verticalAlign: 'middle',
}