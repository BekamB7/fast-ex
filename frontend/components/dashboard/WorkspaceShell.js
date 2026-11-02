'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { GraduationCap, LogOut } from 'lucide-react'

export default function WorkspaceShell({
  children,
  workspaceLabel,
  userName,
  userLogo,
  navItems,
  onLogout,
}) {
  const pathname = usePathname()
  const matchingItems = navItems.filter(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )
  const activePath = matchingItems.sort((a, b) => b.path.length - a.path.length)[0]?.path

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div className="workspace-header-inner">
          <Link className="workspace-brand" href="/">
            <span className="workspace-brand-mark">
              <GraduationCap aria-hidden="true" size={22} />
            </span>
            <span className="workspace-brand-copy">
              <strong>Fast-Ex</strong>
              <small>{workspaceLabel}</small>
            </span>
          </Link>
          <div className="workspace-header-actions">
            <div className="workspace-user-identity">
              <span className="workspace-user-avatar" aria-hidden="true">
                {userLogo ? (
                  <Image src={userLogo} alt="" width={36} height={36} unoptimized />
                ) : (
                  userName?.trim().charAt(0).toUpperCase() || 'O'
                )}
              </span>
              <span className="workspace-user-name">{userName}</span>
            </div>
            <button className="workspace-logout" type="button" onClick={onLogout}>
              <LogOut aria-hidden="true" size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="workspace-body">
        <aside className="workspace-sidebar">
          <p className="workspace-nav-label">WORKSPACE</p>
          <nav className="workspace-sidebar-nav" aria-label={`${workspaceLabel} navigation`}>
            {navItems.map(({ name, icon: Icon, path }) => {
              const isActive = activePath === path

              return (
                <Link
                  key={path}
                  href={path}
                  className={`workspace-nav-link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="workspace-sidebar-note">
            <span className="workspace-sidebar-note-icon">
              <GraduationCap aria-hidden="true" size={17} />
            </span>
            <span>
              <strong>Keep learning moving</strong>
              <small>Your exam workspace, all in one place.</small>
            </span>
          </div>
        </aside>

        <main className="workspace-main">{children}</main>
      </div>

      <nav className="workspace-mobile-nav" aria-label={`${workspaceLabel} navigation`}>
        {navItems.map(({ name, mobileName = name, icon: Icon, path }) => {
          const isActive = activePath === path

          return (
            <Link
              key={path}
              href={path}
              className={`workspace-mobile-nav-link${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon aria-hidden="true" size={19} />
              <span>{mobileName}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
