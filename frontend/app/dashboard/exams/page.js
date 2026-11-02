// frontend/app/dashboard/exams/page.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Clock, 
  Users,
  Eye,
  Trash2,
  Power,
  PowerOff,
  Copy,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import api from '@/lib/api'
import { notifyToast } from '@/components/ui/feedback'

export default function ExamsPage() {
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState([])
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exam/organization')
        setExams(res.data.exams || [])
      } catch (err) {
        console.error('Failed to load exams:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  // Filter exams by search
  const filteredExams = exams.filter(exam => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      exam.title?.toLowerCase().includes(q) ||
      exam.examCode?.toLowerCase().includes(q) ||
      exam.language?.toLowerCase().includes(q) ||
      exam.batchYear?.toString().includes(q)
    )
  })

  // Toggle exam status
  const toggleExamStatus = async (examId, currentStatus) => {
    try {
      await api.patch(`/exam/${examId}/status`, {
        isActive: !currentStatus,
      })
      
      // Update local state
      setExams(prev => prev.map(e => 
        e.id === examId ? { ...e, isActive: !currentStatus } : e
      ))
    } catch (err) {
      console.error('Failed to toggle exam:', err)
      notifyToast(err.response?.data?.error || 'Failed to update exam status.', 'error')
    }
  }

  // Copy exam code
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

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
        <p>Loading exams...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            Exams
          </h1>
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
            {exams.length} exam{exams.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/dashboard/exams/create" className="btn-primary">
          <PlusCircle style={{ width: '1rem', height: '1rem' }} />
          Create Exam
        </Link>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            width: '1.25rem', 
            height: '1.25rem', 
            color: 'var(--color-muted-foreground)' 
          }} />
          <input
            type="text"
            className="field-control with-icon"
            placeholder="Search exams by title, code, language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FileText style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {exams.length === 0 ? 'No Exams Yet' : 'No Results'}
          </h3>
          <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '1.5rem' }}>
            {exams.length === 0 
              ? 'Create your first exam to get started.'
              : 'No exams match your search.'}
          </p>
          {exams.length === 0 && (
            <Link href="/dashboard/exams/create" className="btn-primary">
              <PlusCircle style={{ width: '1rem', height: '1rem' }} />
              Create First Exam
            </Link>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1rem' 
        }}>
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              {/* Header with status */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1rem',
                gap: '0.5rem'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '600', 
                      color: 'var(--color-primary)', 
                      background: 'rgba(8, 127, 91, 0.1)', 
                      padding: '0.125rem 0.5rem', 
                      borderRadius: '9999px' 
                    }}>
                      {exam.language}
                    </span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '600', 
                      color: 'var(--color-muted-foreground)', 
                      background: 'var(--color-secondary)', 
                      padding: '0.125rem 0.5rem', 
                      borderRadius: '9999px' 
                    }}>
                      {exam.batchYear}
                    </span>
                    {exam.isActive ? (
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        color: '#059669', 
                        background: '#ECFDF5', 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '9999px' 
                      }}>
                        ● Active
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        color: '#DC2626', 
                        background: '#FEE2E2', 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '9999px' 
                      }}>
                        ● Inactive
                      </span>
                    )}
                  </div>
                  <h3 style={{ 
                    fontWeight: '600', 
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {exam.title}
                  </h3>
                </div>
              </div>

              {/* Exam Code */}
              <div style={{
                background: 'var(--color-secondary)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <code style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  color: 'var(--color-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {exam.examCode}
                </code>
                <button
                  onClick={() => copyCode(exam.examCode)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: copiedCode === exam.examCode ? '#059669' : 'var(--color-muted-foreground)'
                  }}
                  title="Copy exam code"
                >
                  {copiedCode === exam.examCode ? (
                    <CheckCircle2 style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Copy style={{ width: '1rem', height: '1rem' }} />
                  )}
                </button>
              </div>

              {/* Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <FileText style={{ width: '1rem', height: '1rem', color: 'var(--color-muted-foreground)', margin: '0 auto 0.25rem' }} />
                  <p style={{ fontWeight: '600' }}>{exam.questionsCount || exam.totalQuestions}</p>
                  <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.7rem' }}>Questions</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Clock style={{ width: '1rem', height: '1rem', color: 'var(--color-muted-foreground)', margin: '0 auto 0.25rem' }} />
                  <p style={{ fontWeight: '600' }}>{exam.timeLimitMinutes}m</p>
                  <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.7rem' }}>Duration</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Users style={{ width: '1rem', height: '1rem', color: 'var(--color-muted-foreground)', margin: '0 auto 0.25rem' }} />
                  <p style={{ fontWeight: '600' }}>{exam.studentAttempts || 0}</p>
                  <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.7rem' }}>Attempts</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)'
              }}>
                <Link
                  href={`/dashboard/exams/${exam.id}/edit`}
                  className="btn-secondary"
                  aria-label={`Edit ${exam.title}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Pencil style={{ width: '0.875rem', height: '0.875rem' }} />
                  Edit
                </Link>
                <Link
                  href={`/dashboard/results?examId=${exam.id}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: 'rgba(8, 127, 91, 0.1)',
                    color: 'var(--color-primary)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
                  Results
                </Link>
                <button
                  onClick={() => toggleExamStatus(exam.id, exam.isActive)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: exam.isActive ? '#DC2626' : '#059669',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  title={exam.isActive ? 'Deactivate' : 'Activate'}
                >
                  {exam.isActive ? (
                    <PowerOff style={{ width: '0.875rem', height: '0.875rem' }} />
                  ) : (
                    <Power style={{ width: '0.875rem', height: '0.875rem' }} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}