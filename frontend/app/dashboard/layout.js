'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from 'lucide-react'
import api from '@/lib/api'
import WorkspaceShell from '@/components/dashboard/WorkspaceShell'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Exams', icon: FileText, path: '/dashboard/exams' },
  { name: 'Create exam', mobileName: 'Create', icon: PlusCircle, path: '/dashboard/exams/create' },
  { name: 'Results', icon: BarChart3, path: '/dashboard/results' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLoginPage = pathname === '/dashboard/login'

  useEffect(() => {
    if (isLoginPage) {
      return
    }

    let isCurrent = true
    const loadOrganization = async () => {
      const token = localStorage.getItem('fastExToken')
      const userData = localStorage.getItem('fastExUser')

      if (!token || !userData) {
        router.replace('/dashboard/login')
        return
      }

      let cachedOrganization
      try {
        cachedOrganization = JSON.parse(userData)
      } catch (error) {
        console.error('Failed to parse dashboard user:', error)
        router.replace('/dashboard/login')
        setLoading(false)
        return
      }

      if (!isCurrent) return
      setUser(cachedOrganization)

      try {
        const response = await api.get('/auth/profile')
        if (!isCurrent) return
        setUser(response.data.organization)
        localStorage.setItem('fastExUser', JSON.stringify(response.data.organization))
      } catch (error) {
        console.error('Failed to load organization profile:', error)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    const handleOrganizationUpdate = (event) => {
      if (!event.detail) return
      setUser(event.detail)
      localStorage.setItem('fastExUser', JSON.stringify(event.detail))
    }

    window.addEventListener('fast-ex-organization-updated', handleOrganizationUpdate)
    loadOrganization()

    return () => {
      isCurrent = false
      window.removeEventListener('fast-ex-organization-updated', handleOrganizationUpdate)
    }
  }, [isLoginPage, pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('fastExToken')
    localStorage.removeItem('fastExUser')
    router.replace('/dashboard/login')
  }

  if (isLoginPage) return children

  if (loading) {
    return (
      <div className="workspace-loading" role="status">
        <span className="workspace-spinner" />
        <p>Loading your workspace…</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <WorkspaceShell
      workspaceLabel="Organization workspace"
      userName={user.name || 'Organization admin'}
      userLogo={user.logo}
      navItems={navItems}
      onLogout={handleLogout}
    >
      {children}
    </WorkspaceShell>
  )
}
