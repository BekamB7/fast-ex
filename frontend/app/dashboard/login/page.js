// frontend/app/dashboard/login/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    adminEmail: '',
    password: '',
  })

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('fastExToken')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', formData)

      if (res.data.token) {
        localStorage.setItem('fastExToken', res.data.token)
        localStorage.setItem('fastExUser', JSON.stringify(res.data.organization))
        router.push('/dashboard')
      } else {
        setError('Invalid login response')
      }
    } catch (err) {
      console.error('Organization login failed:', err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site-main">
      <div className="container" style={{ maxWidth: '450px', paddingTop: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '9999px',
                background: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Lock style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)' }} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                Admin Login
              </h1>
              <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
                Sign in to your organization dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="form-stack">
              {error && (
                <div style={{
                  background: 'rgba(201, 76, 69, 0.1)',
                  border: '1px solid rgba(201, 76, 69, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-destructive)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-destructive)' }}>{error}</span>
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1.25rem',
                    height: '1.25rem',
                    color: 'var(--color-muted-foreground)'
                  }} />
                  <input
                    type="email"
                    className="field-control with-icon"
                    placeholder="admin@yourorg.com"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1.25rem',
                    height: '1.25rem',
                    color: 'var(--color-muted-foreground)'
                  }} />
                  <input
                    type="password"
                    className="field-control with-icon"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <LogIn style={{ width: '1rem', height: '1rem' }} />
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/get-going" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                Register Organization
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}