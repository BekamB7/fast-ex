'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react'
import WorkspaceShell from '@/components/dashboard/WorkspaceShell'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Exams', icon: FileText, path: '/dashboard/exams' },
  { name: 'Create exam', mobileName: 'Create', icon: PlusCircle, path: '/dashboard/exams/create' },
  { name: 'Results', icon: BarChart3, path: '/dashboard/results' },
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

    Promise.resolve().then(() => {
      if (!isCurrent) return

      const token = localStorage.getItem('fastExToken')
      const userData = localStorage.getItem('fastExUser')

      if (!token || !userData) {
        router.replace('/dashboard/login')
        return
      }

      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Failed to parse dashboard user:', error)
        router.replace('/dashboard/login')
      } finally {
        setLoading(false)
      }
    })

    return () => {
      isCurrent = false
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
      navItems={navItems}
      onLogout={handleLogout}
    >
      {children}
    </WorkspaceShell>
  )
}
