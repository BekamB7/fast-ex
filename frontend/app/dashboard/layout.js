// frontend/app/dashboard/layout.js
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  LogOut,
  GraduationCap
} from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Exams', icon: FileText, path: '/dashboard/exams' },
  { name: 'Create', icon: PlusCircle, path: '/dashboard/exams/create' },
  { name: 'Results', icon: BarChart3, path: '/dashboard/results' },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isLoginPage = pathname === '/dashboard/login'

  // Check auth on mount and when pathname changes
  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }

    const checkAuth = () => {
      const token = localStorage.getItem('fastExToken')
      const userData = localStorage.getItem('fastExUser')

      console.log('🔐 Dashboard auth check:', { 
        hasToken: !!token, 
        hasUser: !!userData,
        pathname 
      })

      if (!token || !userData) {
        console.log('❌ No auth, redirecting to login')
        router.replace('/dashboard/login')
        return
      }

      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Failed to parse user:', err)
        router.replace('/dashboard/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, isLoginPage, router])

  const handleLogout = async () => {
    localStorage.removeItem('fastExToken')
    localStorage.removeItem('fastExUser')
    router.replace('/dashboard/login')
  }

  // If on login page, just render children
  if (isLoginPage) {
    return children
  }

  // Loading state
  if (loading) {
    return (
      <div className="site-main">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid var(--color-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, don't render anything (redirect is in progress)
  if (!user) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: '1.2' }}>Fast-Ex</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', lineHeight: '1.2' }}>
                {user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--color-muted-foreground)'
            }}
          >
            <LogOut style={{ width: '1rem', height: '1rem' }} />
            Logout
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Sidebar (desktop) */}
        <aside style={{
          width: '250px',
          background: 'white',
          borderRight: '1px solid var(--color-border)',
          padding: '1.5rem 1rem',
          display: 'none'
        }} className="dashboard-sidebar">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path
              const Icon = item.icon
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: isActive ? 'rgba(8, 127, 91, 0.1)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-foreground)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, background: 'var(--color-background)' }}>
          {children}
        </main>
      </div>

      {/* Bottom Nav (mobile) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid var(--color-border)',
        padding: '0.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 50
      }} className="dashboard-mobile-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                fontSize: '0.75rem',
                fontWeight: isActive ? '600' : '500'
              }}
            >
              <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .dashboard-sidebar {
            display: block !important;
          }
          .dashboard-mobile-nav {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          main {
            padding-bottom: 5rem;
          }
        }
      `}</style>
    </div>
  )
}