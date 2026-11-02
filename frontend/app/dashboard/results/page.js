// frontend/app/dashboard/results/page.js
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  Download, 
  Filter, 
  Users, 
  TrendingUp, 
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react'
import api from '@/lib/api'
import { notifyToast } from '@/components/ui/feedback'

function ResultsContent() {
  const searchParams = useSearchParams()
  const initialExamId = searchParams.get('examId') || 'all'

  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [blockedAttempts, setBlockedAttempts] = useState([])
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(initialExamId)
  const [search, setSearch] = useState('')
  const [viewType, setViewType] = useState('results')
  const [studentLookup, setStudentLookup] = useState(null)
  const [lookingUpStudent, setLookingUpStudent] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Fetch results and exams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch exams
        const examsRes = await api.get('/exam/organization')
        setExams(examsRes.data.exams || [])

        // Fetch results
        const resultsRes = await api.get('/organization/results')
        setResults(resultsRes.data.results || [])
        setBlockedAttempts(resultsRes.data.blockedAttempts || [])
      } catch (err) {
        console.error('Failed to load results:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredBlockedAttempts = blockedAttempts.filter((attempt) => {
    if (selectedExam !== 'all' && attempt.examId !== selectedExam) {
      return false
    }
    if (!search) return true
    const query = search.toLowerCase()
    return (
      attempt.studentName?.toLowerCase().includes(query) ||
      attempt.studentPhone?.toLowerCase().includes(query) ||
      attempt.matchedStudentName?.toLowerCase().includes(query) ||
      attempt.examTitle?.toLowerCase().includes(query)
    )
  })

  // Filter results
  const filteredResults = results.filter(result => {
    // Filter by exam
    if (selectedExam !== 'all' && result.examId !== selectedExam) {
      return false
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase()
      return (
        result.studentName?.toLowerCase().includes(q) ||
        result.studentPhone?.toLowerCase().includes(q) ||
        result.studentEmail?.toLowerCase().includes(q) ||
        result.examTitle?.toLowerCase().includes(q)
      )
    }

    return true
  })

  const lookupStudent = async () => {
    if (!search.trim()) {
      notifyToast('Enter the student phone number to search.', 'warning')
      return
    }
    setLookingUpStudent(true)
    try {
      const response = await api.get('/organization/students/lookup', {
        params: { phone: search.trim() },
      })
      setStudentLookup(response.data)
    } catch (error) {
      notifyToast(error.response?.data?.error || 'Could not look up that phone number.', 'error')
      setStudentLookup(null)
    } finally {
      setLookingUpStudent(false)
    }
  }

  // Calculate stats
  const stats = {
    total: filteredResults.length,
    avgScore: filteredResults.length > 0
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length)
      : 0,
    passRate: filteredResults.length > 0
      ? Math.round((filteredResults.filter(r => r.score >= r.passingScore).length / filteredResults.length) * 100)
      : 0,
    passed: filteredResults.filter(r => r.score >= r.passingScore).length,
    failed: filteredResults.filter(r => r.score < r.passingScore).length,
  }

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.setTextColor(8, 127, 91) // Emerald
      doc.text('Fast-Ex - Exam Results', 14, 22)

      // Subtitle
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const examName = selectedExam === 'all' 
        ? 'All Exams' 
        : exams.find(e => e.id === selectedExam)?.title || selectedExam
      doc.text(`Exam: ${examName}`, 14, 30)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36)
      doc.text(`Total Results: ${filteredResults.length}`, 14, 42)

      // Summary stats
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Summary', 14, 54)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Average Score: ${stats.avgScore}%`, 14, 62)
      doc.text(`Pass Rate: ${stats.passRate}% (${stats.passed} passed / ${stats.failed} failed)`, 14, 68)

      // Table
      const tableData = filteredResults.map((r, i) => [
        i + 1,
        r.studentName,
        r.studentPhone,
        r.examCode,
        `${r.score}/${r.totalQuestions}`,
        `${r.percentage}%`,
        r.score >= r.passingScore ? 'PASSED' : 'FAILED',
        new Date(r.submittedAt).toLocaleDateString(),
      ])

      autoTable(doc, {
        startY: 78,
        head: [['#', 'Name', 'Phone', 'Exam Code', 'Score', 'Percentage', 'Status', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [8, 127, 91],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [246, 247, 242],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center', fontStyle: 'bold' },
          7: { halign: 'center' },
        },
        didParseCell: function (data) {
          // Color the status column
          if (data.section === 'body' && data.column.index === 6) {
            if (data.cell.raw === 'PASSED') {
              data.cell.styles.textColor = [5, 150, 105]
            } else {
              data.cell.styles.textColor = [220, 38, 38]
            }
          }
        },
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Fast-Ex © ${new Date().getFullYear()} • Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }

      // Save
      const fileName = selectedExam === 'all' 
        ? `fast-ex-results-${Date.now()}.pdf`
        : `fast-ex-${exams.find((exam) => exam.id === selectedExam)?.examCode || selectedExam}-results.pdf`
      
      doc.save(fileName)
    } catch (err) {
      console.error('PDF export failed:', err)
      notifyToast('Failed to export PDF.', 'error')
    } finally {
      setExporting(false)
    }
  }

  // Export single result PDF
  const exportSingleResult = async (result) => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Header
      doc.setFontSize(24)
      doc.setTextColor(8, 127, 91)
      doc.text('Fast-Ex', 14, 25)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('Exam Result Certificate', 14, 33)

      // Student info
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Student Information', 14, 50)

      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text(`Name: ${result.studentName}`, 14, 58)
      doc.text(`Phone: ${result.studentPhone}`, 14, 64)
      if (result.studentEmail) {
        doc.text(`Email: ${result.studentEmail}`, 14, 70)
      }

      // Exam info
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Exam Information', 14, 85)

      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text(`Exam: ${result.examTitle}`, 14, 93)
      doc.text(`Code: ${result.examCode}`, 14, 99)
      doc.text(`Submitted: ${new Date(result.submittedAt).toLocaleString()}`, 14, 105)

      // Result box
      const passed = result.score >= result.passingScore
      
      doc.setDrawColor(passed ? 5 : 220, passed ? 150 : 38, passed ? 105 : 38)
      doc.setFillColor(passed ? 236 : 254, passed ? 253 : 226, passed ? 245 : 226)
      doc.roundedRect(14, 115, 180, 50, 3, 3, 'FD')

      doc.setFontSize(16)
      doc.setTextColor(passed ? 5 : 220, passed ? 150 : 38, passed ? 105 : 38)
      doc.text(passed ? 'PASSED' : 'FAILED', 105, 130, { align: 'center' })

      doc.setFontSize(32)
      doc.setTextColor(8, 127, 91)
      doc.text(`${result.score}/${result.totalQuestions}`, 105, 148, { align: 'center' })

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`${result.percentage}% • Passing: ${result.passingScore}/${result.totalQuestions}`, 105, 158, { align: 'center' })

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Generated by Fast-Ex on ${new Date().toLocaleString()}`,
        105,
        280,
        { align: 'center' }
      )

      doc.save(`result-${result.studentName.replace(/\s+/g, '-')}-${result.examCode}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      notifyToast('Failed to export PDF.', 'error')
    }
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
        <p>Loading results...</p>
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
            Results
          </h1>
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
            View and export student exam results
          </p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={exporting || filteredResults.length === 0 || viewType === 'blocked'}
          className="btn-primary"
          style={{ 
            opacity: (exporting || filteredResults.length === 0 || viewType === 'blocked') ? 0.5 : 1,
            cursor: (exporting || filteredResults.length === 0 || viewType === 'blocked') ? 'not-allowed' : 'pointer'
          }}
        >
          <Download style={{ width: '1rem', height: '1rem' }} />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Stats Cards */}
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
            <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Average</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.avgScore}%
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Award style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Pass Rate</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#059669' }}>
            {stats.passRate}%
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
            <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#DC2626' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Failed</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#DC2626' }}>
            {stats.failed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.75rem' 
        }}>
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
              placeholder="Search by name, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setStudentLookup(null)
              }}
            />
          </div>

          <button
            type="button"
            className="btn-secondary"
            disabled={lookingUpStudent}
            onClick={lookupStudent}
          >
            <PhoneCall aria-hidden="true" size={16} />
            {lookingUpStudent ? 'Searching…' : 'Lookup phone'}
          </button>

          <div style={{ position: 'relative' }}>
            <Filter style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '1.25rem', 
              height: '1.25rem', 
              color: 'var(--color-muted-foreground)',
              pointerEvents: 'none'
            }} />
            <select
              className="field-control with-icon"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{ appearance: 'none', paddingRight: '2rem' }}
            >
              <option value="all">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.examCode})
                </option>
              ))}
            </select>
            <ChevronDown style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1rem',
              height: '1rem',
              color: 'var(--color-muted-foreground)',
              pointerEvents: 'none'
            }} />
          </div>
          <label className="field results-view-filter">
            Show
            <select className="field-control" value={viewType} onChange={(event) => setViewType(event.target.value)}>
              <option value="results">Completed results</option>
              <option value="blocked">Blocked duplicate attempts ({blockedAttempts.length})</option>
            </select>
          </label>
        </div>
      </div>

      {studentLookup && (
        <section className="card student-lookup-card">
          <h2>Phone lookup: {studentLookup.phone}</h2>
          <p>All recorded attempts and blocked starts for this phone number, across your exams.</p>
          {studentLookup.attempts.length === 0 && studentLookup.blockedAttempts.length === 0 ? (
            <p>No attempts or blocked starts found for this phone number.</p>
          ) : (
            <div className="student-lookup-list">
              {studentLookup.attempts.map((attempt) => (
                <article className="student-lookup-row" key={`attempt-${attempt.id}`}>
                  <div>
                    <strong>{attempt.studentName}</strong>
                    <span>{attempt.examTitle} · {attempt.examCode}</span>
                  </div>
                  <span>{attempt.status === 'in_progress' ? 'In progress' : attempt.status === 'timeout' ? 'Timed out' : `${attempt.score}/${attempt.totalQuestions} · ${attempt.percentage}%`}</span>
                  <time>{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</time>
                </article>
              ))}
              {studentLookup.blockedAttempts.map((attempt) => (
                <article className="student-lookup-row is-blocked" key={`blocked-${attempt.id}`}>
                  <div>
                    <strong>{attempt.studentName} · blocked</strong>
                    <span>{attempt.examTitle} · {attempt.examCode}</span>
                  </div>
                  <span>{attempt.reason === 'phone_name_conflict' ? `Phone matches ${attempt.matchedStudentName}` : 'Duplicate attempt'}</span>
                  <time>{new Date(attempt.createdAt).toLocaleDateString()}</time>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Results Table */}
      {viewType === 'blocked' ? (
        filteredBlockedAttempts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <ShieldAlert style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No blocked attempts found</h3>
            <p style={{ color: 'var(--color-muted-foreground)' }}>Duplicate starts and phone/name conflicts will appear here.</p>
          </div>
        ) : (
          <div className="card blocked-attempts-list">
            <h2>Blocked duplicate attempts ({filteredBlockedAttempts.length})</h2>
            {filteredBlockedAttempts.map((attempt) => (
              <article className="student-lookup-row is-blocked" key={attempt.id}>
                <div>
                  <strong>{attempt.studentName} · {attempt.studentPhone}</strong>
                  <span>{attempt.examTitle} · {attempt.examCode}</span>
                </div>
                <span>{attempt.reason === 'phone_name_conflict' ? `Phone belongs to ${attempt.matchedStudentName}` : 'Student already completed this exam'}</span>
                <time>{new Date(attempt.createdAt).toLocaleString()}</time>
              </article>
            ))}
          </div>
        )
      ) : filteredResults.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FileText style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Results Found
          </h3>
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            {results.length === 0 
              ? 'No students have taken any exams yet.'
              : 'No results match your filters.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Desktop Table */}
          <div style={{ overflowX: 'auto' }} className="results-table-desktop">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-secondary)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Exam</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>%</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>PDF</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => {
                  const passed = result.score >= result.passingScore
                  
                  return (
                    <tr 
                      key={result.id} 
                      style={{ 
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{result.studentName}</p>
                          {result.studentEmail && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                              {result.studentEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>{result.studentPhone}</td>
                      <td style={tdStyle}>
                        <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>{result.examTitle}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                          {result.examCode}
                        </p>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                          {result.score}/{result.totalQuestions}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '600' }}>{result.percentage}%</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          background: passed ? '#ECFDF5' : '#FEE2E2',
                          color: passed ? '#059669' : '#DC2626'
                        }}>
                          {passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => exportSingleResult(result)}
                          style={{
                            background: 'rgba(8, 127, 91, 0.1)',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.375rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--color-primary)'
                          }}
                          title="Download PDF"
                        >
                          <Download style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div style={{ display: 'none' }} className="results-cards-mobile">
            {filteredResults.map((result) => {
              const passed = result.score >= result.passingScore
              
              return (
                <div 
                  key={result.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{result.studentName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{result.studentPhone}</p>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      background: passed ? '#ECFDF5' : '#FEE2E2',
                      color: passed ? '#059669' : '#DC2626'
                    }}>
                      {passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginBottom: '0.5rem' }}>
                    {result.examTitle}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.125rem' }}>
                        {result.score}/{result.totalQuestions}
                      </span>
                      <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                        {result.percentage}%
                      </span>
                    </div>
                    <button
                      onClick={() => exportSingleResult(result)}
                      style={{
                        background: 'rgba(8, 127, 91, 0.1)',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <Download style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 1023px) {
          .results-table-desktop { display: none !important; }
          .results-cards-mobile { display: block !important; }
        }
      `}</style>
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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}