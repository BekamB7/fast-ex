// frontend/app/admin/organizations/page.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  Building2,
  Filter,
  ChevronRight,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  Eye,
} from 'lucide-react'
import api from '@/lib/api'

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const res = await api.get('/platform/organizations')
      setOrganizations(res.data.organizations || [])
    } catch (err) {
      console.error('Failed to load organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle organization status
  const toggleStatus = async (orgId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this organization?`)) {
      return
    }

    try {
      await api.patch(`/platform/organizations/${orgId}/status`, {
        isActive: !currentStatus,
      })

      setOrganizations(prev =>
        prev.map(o =>
          o.id === orgId ? { ...o, isActive: !currentStatus } : o
        )
      )
    } catch (err) {
      console.error('Failed to toggle status:', err)
      alert('Failed to update organization status')
    }
  }

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    if (statusFilter === 'active' && !org.isActive) return false
    if (statusFilter === 'inactive' && org.isActive) return false

    if (search) {
      const q = search.toLowerCase()
      return (
        org.name?.toLowerCase().includes(q) ||
        org.adminEmail?.toLowerCase().includes(q) ||
        org.slug?.toLowerCase().includes(q)
      )
    }
    return true
  })

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
        <p>Loading organizations...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Organizations
        </h1>
        <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
          {organizations.length} organization{organizations.length !== 1 ? 's' : ''} on the platform
        </p>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Total</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {organizations.length}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Active</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', marginTop: '0.25rem' }}>
            {organizations.filter(o => o.isActive).length}
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#DC2626' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Inactive</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626', marginTop: '0.25rem' }}>
            {organizations.filter(o => !o.isActive).length}
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
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              color: 'var(--color-muted-foreground)'
            }} />
            <select
              className="field-control with-icon"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations List */}
      {filteredOrgs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Building2 style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-foreground)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {organizations.length === 0 ? 'No Organizations Yet' : 'No Results'}
          </h3>
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            {organizations.length === 0
              ? 'No organizations have registered on Fast-Ex yet.'
              : 'No organizations match your filters.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1rem'
        }}>
          {filteredOrgs.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  background: org.isActive
                    ? 'linear-gradient(135deg, #087f5b, #075b43)'
                    : 'var(--color-muted)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}>
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {org.name}
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-muted-foreground)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {org.adminEmail}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  background: org.isActive ? '#ECFDF5' : '#FEE2E2',
                  color: org.isActive ? '#059669' : '#DC2626',
                  flexShrink: 0
                }}>
                  {org.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'var(--color-secondary)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)' }} />
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Exams</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{org._count?.exams || 0}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)' }} />
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Attempts</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{org.attemptCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)'
              }}>
                <Link
                  href={`/admin/organizations/${org.id}`}
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
                  View Details
                </Link>
                <button
                  onClick={() => toggleStatus(org.id, org.isActive)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: org.isActive ? '#DC2626' : '#059669',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  title={org.isActive ? 'Deactivate' : 'Activate'}
                >
                  {org.isActive ? (
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