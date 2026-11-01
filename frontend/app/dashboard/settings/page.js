'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Copy, KeyRound, Save, Settings, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'

const initialProfile = {
  name: '',
  adminEmail: '',
  phone: '',
  address: '',
  logo: '',
  primaryColor: '#087f5b',
}

const initialPassword = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState(null)
  const [profile, setProfile] = useState(initialProfile)
  const [password, setPassword] = useState(initialPassword)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [portalMessage, setPortalMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile')
        const current = response.data.organization
        setOrganization(current)
        setProfile({
          name: current.name || '',
          adminEmail: current.adminEmail || '',
          phone: current.phone || '',
          address: current.address || '',
          logo: current.logo || '',
          primaryColor: /^#[0-9a-f]{6}$/i.test(current.primaryColor || '')
            ? current.primaryColor
            : '#087f5b',
        })
      } catch (error) {
        console.error('Failed to load organization settings:', error)
        setProfileMessage({
          type: 'error',
          text: error.response?.data?.error || 'Could not load organization settings.',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    setProfileMessage({ type: '', text: '' })

    try {
      const response = await api.put('/auth/profile', {
        name: profile.name.trim(),
        adminEmail: profile.adminEmail.trim(),
        phone: profile.phone.trim() || null,
        address: profile.address.trim() || null,
        logo: profile.logo.trim() || null,
        primaryColor: profile.primaryColor,
      })
      const updated = { ...organization, ...response.data.organization }
      setOrganization(updated)
      localStorage.setItem('fastExUser', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('fast-ex-organization-updated', { detail: updated }))
      setProfileMessage({ type: 'success', text: 'Organization settings saved.' })
    } catch (error) {
      setProfileMessage({
        type: 'error',
        text: error.response?.data?.error || 'Could not save organization settings.',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setSavingPassword(true)
    setPasswordMessage({ type: '', text: '' })

    if (password.newPassword !== password.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'The new passwords do not match.' })
      setSavingPassword(false)
      return
    }

    try {
      const response = await api.put('/auth/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      })
      setPassword(initialPassword)
      setPasswordMessage({
        type: 'success',
        text: response.data.message || 'Password changed successfully.',
      })
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.error || 'Could not change password.',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const portalUrl = organization?.slug && typeof window !== 'undefined'
    ? `${window.location.origin}/${organization.slug}`
    : ''

  const copyPortalUrl = async () => {
    if (!portalUrl) return
    try {
      await navigator.clipboard.writeText(portalUrl)
      setPortalMessage('Public portal URL copied.')
    } catch (error) {
      console.error('Could not copy public portal URL:', error)
      setPortalMessage('Copy was blocked by the browser. Select and copy the URL instead.')
    }
  }

  if (loading) {
    return (
      <div className="workspace-loading" role="status">
        <span className="workspace-spinner" />
        <p>Loading organization settings…</p>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <span className="settings-page-icon"><Settings aria-hidden="true" size={22} /></span>
        <div>
          <h1>Organization settings</h1>
          <p>Manage your organization profile, public portal, and account security.</p>
        </div>
      </header>

      {profileMessage.text && (
        <div className={`settings-message is-${profileMessage.type}`} role="status" aria-live="polite">
          {profileMessage.type === 'success' && <CheckCircle2 aria-hidden="true" size={18} />}
          {profileMessage.text}
        </div>
      )}

      <section className="card settings-card" aria-labelledby="public-portal-heading">
        <div className="settings-section-heading">
          <div>
            <h2 id="public-portal-heading">Public exam portal</h2>
            <p>Share this link with students so they can find your organization’s exams.</p>
          </div>
          <ShieldCheck aria-hidden="true" size={21} />
        </div>
        {portalUrl ? (
          <>
            <div className="settings-portal-url">
              <a href={portalUrl} target="_blank" rel="noreferrer">{portalUrl}</a>
              <button type="button" className="btn-secondary" onClick={copyPortalUrl}>
                <Copy aria-hidden="true" size={16} />
                Copy link
              </button>
            </div>
            {portalMessage && <p className="settings-inline-message" role="status">{portalMessage}</p>}
          </>
        ) : (
          <p className="settings-inline-message">A public portal URL is not available for this organization.</p>
        )}
      </section>

      <section className="card settings-card" aria-labelledby="organization-profile-heading">
        <div className="settings-section-heading">
          <div>
            <h2 id="organization-profile-heading">Organization profile</h2>
            <p>These details identify your organization in the workspace and public portal.</p>
          </div>
        </div>
        <form className="settings-form" onSubmit={handleProfileSave}>
          <div className="settings-form-grid">
            <div className="field">
              <label htmlFor="organization-name">Organization name</label>
              <input
                id="organization-name"
                className="field-control"
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="organization-email">Administrator email</label>
              <input
                id="organization-email"
                className="field-control"
                type="email"
                value={profile.adminEmail}
                onChange={(event) => setProfile({ ...profile, adminEmail: event.target.value })}
                maxLength={100}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="organization-phone">Phone</label>
              <input
                id="organization-phone"
                className="field-control"
                type="tel"
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                maxLength={20}
              />
            </div>
            <div className="field">
              <label htmlFor="organization-address">Address</label>
              <input
                id="organization-address"
                className="field-control"
                value={profile.address}
                onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                maxLength={5000}
              />
            </div>
            <div className="field">
              <label htmlFor="organization-logo">Logo URL</label>
              <input
                id="organization-logo"
                className="field-control"
                type="url"
                placeholder="https://example.com/logo.png"
                value={profile.logo}
                onChange={(event) => setProfile({ ...profile, logo: event.target.value })}
                maxLength={2048}
              />
            </div>
            <div className="field">
              <label htmlFor="organization-color">Portal brand color</label>
              <div className="settings-color-control">
                <input
                  id="organization-color"
                  type="color"
                  value={profile.primaryColor}
                  onChange={(event) => setProfile({ ...profile, primaryColor: event.target.value })}
                  aria-label="Choose portal brand color"
                />
                <span>{profile.primaryColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <p className="settings-help-text">
            Changing your organization name does not change your public URL.
          </p>
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            <Save aria-hidden="true" size={16} />
            {savingProfile ? 'Saving…' : 'Save organization settings'}
          </button>
        </form>
      </section>

      <section className="card settings-card" aria-labelledby="change-password-heading">
        <div className="settings-section-heading">
          <div>
            <h2 id="change-password-heading">Change password</h2>
            <p>Confirm your current password before choosing a new one.</p>
          </div>
          <KeyRound aria-hidden="true" size={21} />
        </div>
        {passwordMessage.text && (
          <div className={`settings-message is-${passwordMessage.type}`} role="status" aria-live="polite">
            {passwordMessage.type === 'success' && <CheckCircle2 aria-hidden="true" size={18} />}
            {passwordMessage.text}
          </div>
        )}
        <form className="settings-form" onSubmit={handlePasswordChange}>
          <div className="settings-form-grid">
            <div className="field">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                className="field-control"
                type="password"
                autoComplete="current-password"
                value={password.currentPassword}
                onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                className="field-control"
                type="password"
                autoComplete="new-password"
                value={password.newPassword}
                onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                className="field-control"
                type="password"
                autoComplete="new-password"
                value={password.confirmPassword}
                onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })}
                minLength={6}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={savingPassword}>
            <KeyRound aria-hidden="true" size={16} />
            {savingPassword ? 'Changing password…' : 'Change password'}
          </button>
        </form>
      </section>
    </div>
  )
}
