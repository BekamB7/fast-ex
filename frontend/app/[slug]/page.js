// frontend/app/[slug]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Search, 
  FileText, 
  Clock, 
  Users,
  GraduationCap,
  ChevronRight,
  Building2
} from 'lucide-react'
import api from '@/lib/api'

export default function OrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState(null)
  const [exams, setExams] = useState([])
  const [filters, setFilters] = useState({ batchYears: [], languages: [] })
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [examCode, setExamCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setLoading(true)
        const orgRes = await api.get(`/public/${slug}`)
        setOrganization(orgRes.data.organization)
        setExams(orgRes.data.exams || [])
        setFilters({
          batchYears: orgRes.data.filters?.batchYears || [],
          languages: orgRes.data.filters?.languages || [],
        })
      } catch (err) {
        console.error('Error fetching organization:', err)
        setError('Organization not found')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchOrgData()
    }
  }, [slug])

  const filteredExams = exams.filter(exam => {
    if (selectedBatch !== 'all' && exam.batchYear !== parseInt(selectedBatch)) {
      return false
    }
    if (selectedLanguage !== 'all' && exam.language !== selectedLanguage) {
      return false
    }
    return true
  })

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!examCode.trim()) return

    try {
      const res = await api.post(`/public/${slug}/validate`, {
        examCode: examCode.trim(),
      })

      if (res.data.valid) {
        router.push(`/${slug}/exam/${examCode.trim()}`)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid exam code')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleExamClick = (exam) => {
    router.push(`/${slug}/exam/${exam.examCode}`)
  }

  if (loading) {
    return (
      <div className="site-main">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              border: '3px solid var(--color-primary)', 
              borderTopColor: 'transparent', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !organization) {
    return (
      <div className="site-main">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Building2 style={{ width: '4rem', height: '4rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Organization Not Found</h2>
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              The organization you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="site-main">
      <div className="container">

        {/* Organization Header */}
        <div className="card" style={{ marginBottom: '2rem', borderTop: `4px solid ${organization?.primaryColor || 'var(--color-primary)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              borderRadius: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              backgroundColor: organization?.primaryColor || 'var(--color-primary)'
            }}>
              {organization?.name?.charAt(0) || 'O'}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {organization?.name || 'Organization'}
              </h1>
              <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
                {organization?.address || 'Online Exam Portal'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FileText style={{ width: '1rem', height: '1rem' }} />
                {exams.length} Exams
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users style={{ width: '1rem', height: '1rem' }} />
                {exams.reduce((sum, e) => sum + (e._count?.attempts || 0), 0)} Attempts
              </span>
            </div>
          </div>
        </div>

        {/* Exam Code Entry */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Enter Exam Code</h2>
          <form onSubmit={handleCodeSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'var(--color-muted-foreground)' }} />
              <input
                type="text"
                placeholder="e.g., EX2026-ENG-ABCU"
                className="field-control with-icon"
                style={{ paddingLeft: '2.8rem' }}
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              Find Exam
            </button>
          </form>
          {error && (
            <p style={{ color: 'var(--color-destructive)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
          )}
        </div>

        {/* Filters */}
        {(filters.batchYears.length > 0 || filters.languages.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>Filter:</span>
            
            {filters.batchYears.length > 0 && (
              <select
                className="field-control"
                style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="all">All Batches</option>
                {filters.batchYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}

            {filters.languages.length > 0 && (
              <select
                className="field-control"
                style={{ padding: '0.375rem 0.75rem', width: 'auto' }}
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="all">All Languages</option>
                {filters.languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            )}

            <span style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} available
            </span>
          </div>
        )}

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <FileText style={{ width: '4rem', height: '4rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Exams Available</h3>
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              {exams.length === 0 
                ? 'This organization has no exams yet.'
                : 'No exams match your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => handleExamClick(exam)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: 'var(--color-primary)', 
                        background: 'rgba(8, 127, 91, 0.1)', 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '9999px' 
                      }}>
                        {exam.language}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
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
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          color: '#059669', 
                          background: '#ECFDF5', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '9999px' 
                        }}>
                          Active
                        </span>
                      ) : (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          color: '#DC2626', 
                          background: '#FEE2E2', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '9999px' 
                        }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      {exam.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '0.75rem' }}>
                      {exam.description || 'No description available'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FileText style={{ width: '1rem', height: '1rem' }} />
                        {exam.totalQuestions} Questions
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock style={{ width: '1rem', height: '1rem' }} />
                        {exam.timeLimitMinutes} min
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <GraduationCap style={{ width: '1rem', height: '1rem' }} />
                        Pass: {exam.passingScore}/{exam.totalQuestions}
                      </span>
                    </div>
                  </div>
                  <div style={{ 
                    marginLeft: '1rem', 
                    padding: '0.5rem', 
                    borderRadius: '9999px', 
                    background: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}