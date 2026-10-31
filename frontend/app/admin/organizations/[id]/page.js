// frontend/app/admin/organizations/[id]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  ExternalLink,
} from 'lucide-react'
import api from '@/lib/api'

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/platform/organizations/${orgId}`)
        setData(res.data)
      } catch (err) {
        console.error('Failed to load organization:', err)
        setError(err.response?.data?.error || 'Organization not found')
      } finally {
        setLoading(false)
      }
    }

    if (orgId) fetchOrg()
  }, [orgId])

  const toggleStatus = async () => {
    const org = data.organization
    if (!confirm(`Are you sure you want to ${org.isActive ? 'deactivate' : 'activate'} this organization?`)) {
      return
    }

    try {
      await api.patch(`/platform/organizations/${org.id}/status`, {
        isActive: !org.isActive,
      })

      setData({
        ...data,
        organization: { ...org, isActive: !org.isActive },
      })
    } catch (err) {
      console.error('Failed to toggle status:', err)
      alert('Failed to update organization status')
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
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <XCircle style={{ width: '3rem', height: '3rem', color: 'var(--color-destructive)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {error || 'Organization not found'}
        </h2>
        <Link href="/admin/organizations" className="btn-primary" style={{ marginTop: '1rem' }}>
          <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Organizations
        </Link>
      </div>
    )
  }

  const { organization, attempts, stats } = data

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back button */}
      <Link
        href="/admin/organizations"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--color-muted-foreground)',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          padding: '0.25rem 0'
        }}
      >
        <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
        Back to Organizations
      </Link>

      {/* Organization Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Avatar */}
          <div style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '1rem',
            background: organization.isActive
              ? 'linear-gradient(135deg, #087f5b, #075b43)'
              : 'var(--color-muted)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '2rem',
            flexShrink: 0
          }}>
            {organization.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '0.5rem'
            }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                {organization.name}
              </h1>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: organization.isActive ? '#ECFDF5' : '#FEE2E2',
                color: organization.isActive ? '#059669' : '#DC2626'
              }}>
                {organization.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-muted-foreground)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mail style={{ width: '0.875rem', height: '0.875rem' }} />
                {organization.adminEmail}
              </div>
              {organization.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Phone style={{ width: '0.875rem', height: '0.875rem' }} />
                  {organization.phone}
                </div>
              )}
              {organization.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                  {organization.address}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                Joined {new Date(organization.createdAt).toLocaleDateString()}
              </div>
            </div>

            {organization.slug && (
              <Link
                href={`/${organization.slug}`}
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-primary)',
                  marginTop: '0.75rem',
                  fontWeight: '600'
                }}
              >
                Visit public page: /{organization.slug}
                <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
              </Link>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={toggleStatus}
            className={organization.isActive ? 'btn-outline' : 'btn-primary'}
            style={{
              color: organization.isActive ? '#DC2626' : undefined,
              borderColor: organization.isActive ? '#DC2626' : undefined
            }}
          >
            {organization.isActive ? (
              <>
                <PowerOff style={{ width: '1rem', height: '1rem' }} />
                Deactivate
              </>
            ) : (
              <>
                <Power style={{ width: '1rem', height: '1rem' }} />
                Activate
              </>
            )}
          </button>
        </div>
      </motion.div>

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
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Total Exams</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.totalExams}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Users style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Total Attempts</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {stats.totalAttempts}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Avg. Attempts/Exam</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#059669' }}>
            {stats.totalExams > 0
              ? Math.round(stats.totalAttempts / stats.totalExams)
              : 0}
          </p>
        </div>
      </div>

      {/* Exams List */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Exams ({organization.exams.length})
        </h2>

        {organization.exams.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
            No exams created yet
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.75rem'
          }}>
            {organization.exams.map((exam) => (
              <div
                key={exam.id}
                style={{
                  padding: '0.875rem',
                  background: 'var(--color-secondary)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem',
                  gap: '0.5rem'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {exam.title}
                    </p>
                    <code style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-primary)',
                      fontWeight: '600'
                    }}>
                      {exam.examCode}
                    </code>
                  </div>
                  {exam.isActive ? (
                    <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#059669', flexShrink: 0 }} />
                  ) : (
                    <XCircle style={{ width: '1rem', height: '1rem', color: '#DC2626', flexShrink: 0 }} />
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  fontSize: '0.7rem',
                  color: 'var(--color-muted-foreground)'
                }}>
                  <span>{exam.batchYear}</span>
                  <span>•</span>
                  <span>{exam.language}</span>
                  <span>•</span>
                  <span>{exam._count?.attempts || 0} attempts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attempts */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Recent Attempts ({attempts.length})
        </h2>

        {attempts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
            No exam attempts yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {attempts.map((attempt) => {
              const passed = attempt.score >= (attempt.exam?.passingScore || 0)
              return (
                <div
                  key={attempt.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--color-secondary)',
                    borderRadius: '0.5rem',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {attempt.studentName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {attempt.studentPhone} • {attempt.exam?.title}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontWeight: 'bold',
                        color: 'var(--color-primary)',
                        fontSize: '0.875rem'
                      }}>
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>
                        {attempt.percentage}%
                      </p>
                    </div>
                    {passed ? (
                      <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
                    ) : (
                      <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#DC2626' }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}