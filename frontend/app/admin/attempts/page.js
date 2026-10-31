// frontend/app/admin/attempts/page.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  Filter,
  Download,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
} from 'lucide-react'
import api from '@/lib/api'

export default function GlobalAttemptsPage() {
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const attemptsRes = await api.get('/platform/attempts?limit=200')
        setAttempts(attemptsRes.data.attempts || [])

        const orgsRes = await api.get('/platform/organizations')
        setOrganizations(orgsRes.data.organizations || [])
      } catch (err) {
        console.error('Failed to load:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter attempts
  const filteredAttempts = attempts.filter(a => {
    if (orgFilter !== 'all' && a.exam?.organization?.slug !== orgFilter) {
      return false
    }

    if (search) {
      const q = search.toLowerCase()
      return (
        a.studentName?.toLowerCase().includes(q) ||
        a.studentPhone?.toLowerCase().includes(q) ||
        a.exam?.title?.toLowerCase().includes(q) ||
        a.exam?.organization?.name?.toLowerCase().includes(q)
      )
    }

    return true
  })

  // Stats
  const stats = {
    total: filteredAttempts.length,
    passed: filteredAttempts.filter(a => a.score >= (a.exam?.passingScore || 0)).length,
    avgPercent: filteredAttempts.length > 0
      ? Math.round(filteredAttempts.reduce((s, a) => s + a.percentage, 0) / filteredAttempts.length)
      : 0,
  }

  // Export PDF
  const exportPDF = async () => {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()

      doc.setFontSize(20)
      doc.setTextColor(8, 127, 91)
      doc.text('Fast-Ex - Platform Attempts Report', 14, 22)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
      doc.text(`Total Attempts: ${filteredAttempts.length}`, 14, 36)
      doc.text(
        `Pass Rate: ${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%`,
        14,
        42
      )

      const tableData = filteredAttempts.map((a, i) => [
        i + 1,
        a.studentName,
        a.studentPhone,
        a.exam?.organization?.name || '-',
        a.exam?.title || '-',
        `${a.score}/${a.totalQuestions}`,
        `${a.percentage}%`,
        a.score >= (a.exam?.passingScore || 0) ? 'PASSED' : 'FAILED',
        new Date(a.submittedAt).toLocaleDateString(),
      ])

      autoTable(doc, {
        startY: 50,
        head: [['#', 'Student', 'Phone', 'Organization', 'Exam', 'Score', '%', 'Status', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [8, 127, 91],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 8 } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 7) {
            data.cell.styles.textColor =
              data.cell.raw === 'PASSED' ? [5, 150, 105] : [220, 38, 38]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      doc.save(`fast-ex-attempts-${Date.now()}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Failed to export')
    } finally {
      setExporting(false)
    }
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
        <p>Loading attempts...</p>
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
            All Attempts
          </h1>
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
            Student exam attempts across all organizations
          </p>
        </div>
        <button
          onClick={exportPDF}
          disabled={exporting || filteredAttempts.length === 0}
          className="btn-primary"
          style={{
            opacity: exporting || filteredAttempts.length === 0 ? 0.5 : 1
          }}
        >
          <Download style={{ width: '1rem', height: '1rem' }} />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
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
            <Users style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Total</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.total}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Passed</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#059669' }}>
            {stats.passed}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Avg %</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.avgPercent}%
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
              placeholder="Search by student or exam..."
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
                <option key={org.id} value={org.slug}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      {filteredAttempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Users style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Attempts Found
          </h3>
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            {attempts.length === 0
              ? 'No students have taken exams yet.'
              : 'No attempts match your filters.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-secondary)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Organization</th>
                  <th style={thStyle}>Exam</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>%</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt, index) => {
                  const passed = attempt.score >= (attempt.exam?.passingScore || 0)
                  return (
                    <tr
                      key={attempt.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>
                        <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{attempt.studentName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                          {attempt.studentPhone}
                        </p>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building2 style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary)' }} />
                          <span style={{ fontSize: '0.875rem' }}>
                            {attempt.exam?.organization?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <p style={{ fontSize: '0.875rem' }}>{attempt.exam?.title}</p>
                        <code style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>
                          {attempt.exam?.examCode}
                        </code>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '600' }}>{attempt.percentage}%</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          background: passed ? '#ECFDF5' : '#FEE2E2',
                          color: passed ? '#059669' : '#DC2626',
                          whiteSpace: 'nowrap'
                        }}>
                          {passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/attempts/${attempt.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.375rem',
                            background: 'rgba(8, 127, 91, 0.1)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-primary)',
                          }}
                          title="View Details"
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
        </div>
      )}
    </div>
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