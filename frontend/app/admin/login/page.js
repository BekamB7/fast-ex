// frontend/app/admin/login/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, AlertCircle, LogIn } from 'lucide-react'
import api from '@/lib/api'

export default function PlatformLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('fastExPlatformToken')
    if (token) {
      router.push('/admin')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/platform/login', formData)
      
      if (res.data.token) {
        localStorage.setItem('fastExPlatformToken', res.data.token)
        localStorage.setItem('fastExPlatformAdmin', JSON.stringify(res.data.admin))
        
        setTimeout(() => {
          router.push('/admin')
        }, 100)
      }
    } catch (err) {
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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      background: 'var(--color-background)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #087f5b, #075b43)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Shield style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Platform Admin
            </h1>
            <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
              Fast-Ex Super Admin Access
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
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-destructive)' }} />
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
                  placeholder="super@fast-ex.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <LogIn style={{ width: '1rem', height: '1rem' }} />
                </>
              )}
            </button>
          </form>

          <p style={{
            marginTop: '1.25rem',
            color: 'var(--color-muted-foreground)',
            fontSize: '0.78rem',
            textAlign: 'center',
          }}>
            Sign in with the platform administrator credentials configured by your system owner.
          </p>
        </div>
      </motion.div>
    </div>
  )
}