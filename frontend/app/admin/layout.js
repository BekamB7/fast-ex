'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import api from '@/lib/api'
import WorkspaceShell from '@/components/dashboard/WorkspaceShell'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Organizations', mobileName: 'Orgs', icon: Building2, path: '/admin/organizations' },
  { name: 'Exams', icon: FileText, path: '/admin/exams' },
  { name: 'Attempts', icon: Users, path: '/admin/attempts' },
  { name: 'Profile', icon: Settings, path: '/admin/profile' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      return
    }

    let isCurrent = true

    Promise.resolve().then(() => {
      if (!isCurrent) return

      const token = localStorage.getItem('fastExPlatformToken')
      const adminData = localStorage.getItem('fastExPlatformAdmin')

      if (!token || !adminData) {
        router.replace('/admin/login')
        return
      }

      try {
        setAdmin(JSON.parse(adminData))
      } catch (error) {
        console.error('Failed to parse platform admin:', error)
        router.replace('/admin/login')
      } finally {
        setLoading(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [isLoginPage, pathname, router])

  const handleLogout = async () => {
    try {
      await api.post('/platform/logout')
    } catch (error) {
      console.error('Platform logout request failed:', error)
    }
    localStorage.removeItem('fastExPlatformToken')
    localStorage.removeItem('fastExPlatformAdmin')
    router.replace('/admin/login')
  }

  if (isLoginPage) return children

  if (loading) {
    return (
      <div className="workspace-loading" role="status">
        <span className="workspace-spinner" />
        <p>Loading platform workspace…</p>
      </div>
    )
  }

  if (!admin) return null

  return (
    <WorkspaceShell
      workspaceLabel="Platform administration"
      userName={admin.name || 'Platform admin'}
      navItems={navItems}
      onLogout={handleLogout}
    >
      {children}
    </WorkspaceShell>
  )
}
