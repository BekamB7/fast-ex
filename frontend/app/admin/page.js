// frontend/app/admin/page.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building2,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
} from 'lucide-react'
import api from '@/lib/api'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: {},
    recentOrganizations: [],
    recentAttempts: [],
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/platform/stats')
        setData(res.data)
      } catch (err) {
        console.error('Failed to load stats:', err)
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
          width: '3rem', height: '3rem',
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

  const { stats, recentOrganizations, recentAttempts } = data

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Platform Dashboard
        </h1>
        <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
          Overview of all activity on Fast-Ex
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={Building2}
          label="Organizations"
          value={stats.totalOrganizations}
          subtext={`${stats.activeOrganizations} active`}
          delay={0.1}
        />
        <StatCard
          icon={FileText}
          label="Total Exams"
          value={stats.totalExams}
          subtext={`${stats.activeExams} active`}
          delay={0.2}
        />
        <StatCard
          icon={Users}
          label="Total Attempts"
          value={stats.totalAttempts}
          subtext={`${stats.submittedAttempts} submitted`}
          delay={0.3}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Activity"
          value={
            stats.totalOrganizations > 0
              ? Math.round(stats.totalExams / stats.totalOrganizations)
              : 0
          }
          subtext="exams per org"
          delay={0.4}
        />
      </div>

      {/* Recent Organizations */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            Recent Organizations
          </h2>
          <Link
            href="/admin/organizations"
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-primary)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            View All <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>

        {recentOrganizations.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
            No organizations yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentOrganizations.map((org) => (
              <Link
                key={org.id}
                href={`/admin/organizations/${org.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--color-secondary)',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{org.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {org.adminEmail}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    background: org.isActive ? '#ECFDF5' : '#FEE2E2',
                    color: org.isActive ? '#059669' : '#DC2626'
                  }}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem' }}>
                    {org._count.exams} exams
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attempts */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            Recent Activity
          </h2>
          <Link
            href="/admin/attempts"
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-primary)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            View All <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-muted-foreground)' }}>
            <Clock style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No exam attempts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentAttempts.slice(0, 8).map((attempt) => {
              const passed = attempt.score >= (attempt.exam.passingScore || 0)
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
                      {attempt.exam.organization.name} • {attempt.exam.title}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.875rem' }}>
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

function StatCard({ icon: Icon, label, value, subtext, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}>
            {label}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {value}
          </p>
          {subtext && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem' }}>
              {subtext}
            </p>
          )}
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
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }} />
        </div>
      </div>
    </motion.div>
  )
}