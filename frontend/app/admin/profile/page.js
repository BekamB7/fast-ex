// frontend/app/admin/profile/page.js
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Shield,
  Key
} from 'lucide-react'
import api from '@/lib/api'

export default function ProfilePage() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/platform/profile')
        setAdmin(res.data.admin)
        setProfileForm({
          name: res.data.admin.name,
          email: res.data.admin.email,
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg({ type: '', text: '' })

    try {
      const res = await api.put('/platform/profile', profileForm)
      setAdmin(res.data.admin)
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
      
      // Update localStorage
      localStorage.setItem('fastExPlatformAdmin', JSON.stringify(res.data.admin))
    } catch (err) {
      setProfileMsg({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to update profile' 
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordMsg({ type: '', text: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' })
      setSavingPassword(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' })
      setSavingPassword(false)
      return
    }

    try {
      await api.put('/platform/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMsg({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to change password' 
      })
    } finally {
      setSavingPassword(false)
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
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #087f5b, #075b43)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Shield style={{ width: '2rem', height: '2rem' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{admin?.name}</h1>
            <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
              Platform Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ marginBottom: '1.5rem' }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Profile Information
        </h2>

        {profileMsg.text && (
          <div style={{
            background: profileMsg.type === 'success' ? '#ECFDF5' : 'rgba(201, 76, 69, 0.1)',
            border: `1px solid ${profileMsg.type === 'success' ? '#059669' : 'rgba(201, 76, 69, 0.3)'}`,
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {profileMsg.type === 'success' ? (
              <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            ) : (
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-destructive)' }} />
            )}
            <span style={{
              fontSize: '0.875rem',
              color: profileMsg.type === 'success' ? '#059669' : 'var(--color-destructive)'
            }}>
              {profileMsg.text}
            </span>
          </div>
        )}

        <form onSubmit={handleProfileUpdate}>
          <div className="field" style={{ marginBottom: '1rem' }}>
            <label>Name</label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
                color: 'var(--color-muted-foreground)'
              }} />
              <input
                type="text"
                className="field-control with-icon"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
                color: 'var(--color-muted-foreground)'
              }} />
              <input
                type="email"
                className="field-control with-icon"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={savingProfile}
          >
            <Save style={{ width: '1rem', height: '1rem' }} />
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Password Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Change Password
        </h2>

        {passwordMsg.text && (
          <div style={{
            background: passwordMsg.type === 'success' ? '#ECFDF5' : 'rgba(201, 76, 69, 0.1)',
            border: `1px solid ${passwordMsg.type === 'success' ? '#059669' : 'rgba(201, 76, 69, 0.3)'}`,
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {passwordMsg.type === 'success' ? (
              <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
            ) : (
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-destructive)' }} />
            )}
            <span style={{
              fontSize: '0.875rem',
              color: passwordMsg.type === 'success' ? '#059669' : 'var(--color-destructive)'
            }}>
              {passwordMsg.text}
            </span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="field" style={{ marginBottom: '1rem' }}>
            <label>Current Password</label>
            <div style={{ position: 'relative' }}>
              <Key style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
                color: 'var(--color-muted-foreground)'
              }} />
              <input
                type="password"
                className="field-control with-icon"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
                color: 'var(--color-muted-foreground)'
              }} />
              <input
                type="password"
                className="field-control with-icon"
                placeholder="Min 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem',
                color: 'var(--color-muted-foreground)'
              }} />
              <input
                type="password"
                className="field-control with-icon"
                placeholder="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={savingPassword}
          >
            <Lock style={{ width: '1rem', height: '1rem' }} />
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}