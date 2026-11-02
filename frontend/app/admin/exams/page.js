// frontend/app/admin/exams/page.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  FileText,
  Filter,
  Building2,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react'
import api from '@/lib/api'

export default function GlobalExamsPage() {
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const examsRes = await api.get('/platform/exams')
        setExams(examsRes.data.exams || [])

        const orgsRes = await api.get('/platform/organizations')
        setOrganizations(orgsRes.data.organizations || [])
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter exams
  const filteredExams = exams.filter(exam => {
    if (orgFilter !== 'all' && exam.organizationId !== orgFilter) {
      return false
    }

    if (search) {
      const q = search.toLowerCase()
      return (
        exam.title?.toLowerCase().includes(q) ||
        exam.examCode?.toLowerCase().includes(q) ||
        exam.organization?.name?.toLowerCase().includes(q)
      )
    }

    return true
  })

  // Stats
  const stats = {
    total: exams.length,
    active: exams.filter(e => e.isActive).length,
    totalAttempts: exams.reduce((sum, e) => sum + (e._count?.attempts || 0), 0),
  }

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
        <p>Loading exams...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          All Exams
        </h1>
        <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
          {stats.total} exam{stats.total !== 1 ? 's' : ''} across all organizations
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Total</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.total}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Active</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#059669' }}>
            {stats.active}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Users style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Attempts</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.totalAttempts}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
              color: 'var(--color-muted-foreground)'
            }} />
            <input
              type="text"
              className="field-control with-icon"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
              color: 'var(--color-muted-foreground)'
            }} />
            <select
              className="field-control with-icon"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FileText style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {exams.length === 0 ? 'No Exams Yet' : 'No Results'}
          </h3>
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            {exams.length === 0
              ? 'No exams have been created on the platform.'
              : 'No exams match your filters.'}
          </p>
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
              {/* Org + Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  <Building2 style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-muted-foreground)',
                    fontWeight: '600',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {exam.organization?.name || 'Unknown'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  background: exam.isActive ? '#ECFDF5' : '#FEE2E2',
                  color: exam.isActive ? '#059669' : '#DC2626',
                  flexShrink: 0
                }}>
                  {exam.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontWeight: '600',
                fontSize: '1rem',
                marginBottom: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {exam.title}
              </h3>

              <code style={{
                fontSize: '0.75rem',
                color: 'var(--color-primary)',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.75rem'
              }}>
                {exam.examCode}
              </code>

              {/* Tags */}
              <div style={{
                display: 'flex',
                gap: '0.375rem',
                flexWrap: 'wrap',
                marginBottom: '0.75rem'
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.125rem 0.5rem',
                  background: 'var(--color-secondary)',
                  borderRadius: '9999px',
                  color: 'var(--color-muted-foreground)'
                }}>
                  {exam.language}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.125rem 0.5rem',
                  background: 'var(--color-secondary)',
                  borderRadius: '9999px',
                  color: 'var(--color-muted-foreground)'
                }}>
                  {exam.batchYear}
                </span>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'var(--color-secondary)',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                textAlign: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: '600' }}>{exam._count?.questions || exam.totalQuestions}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Qs</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600' }}>{exam.timeLimitMinutes}m</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Time</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600' }}>{exam._count?.attempts || 0}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Attempts</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)'
              }}>
                <Link
                  href={`/admin/exams/${exam.id}`}
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
                  View Exam
                </Link>
                <Link
                  href={`/admin/organizations/${exam.organizationId}`}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--color-muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    textDecoration: 'none'
                  }}
                  title="View Organization"
                >
                  <Building2 style={{ width: '0.875rem', height: '0.875rem' }} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}