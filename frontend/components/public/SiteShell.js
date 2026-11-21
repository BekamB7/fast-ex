'use client'

import Link from 'next/link'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { MobileBottomNav } from '@/components/public/MobileBottomNav'

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const hidePublicShell =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.includes('/exam')

  if (hidePublicShell) {
    return children
  }

  return (
    <div className="site-shell">
      <header className="site-header container">
        <Link href="/" className="site-brand flex items-center gap-2 font-bold tracking-tight">
          <span className="site-brand-mark flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>

          <span>
            Fast<span className="text-primary">-Ex</span>
          </span>
        </Link>

        <div className="site-desktop-navigation hidden items-center gap-8">
          <nav aria-label="Main site navigation" className="flex items-center gap-1">
            <Link href="/" className="desktop-nav-link">Home</Link>
            <Link href="/about" className="desktop-nav-link">About</Link>
            <Link href="/contact" className="desktop-nav-link">Contact</Link>
          </nav>

          <Link href="/login" className="desktop-nav-signin">
            Sign in
          </Link>
          <Link href="/get-going" className="desktop-nav-cta">
            Launch your portal
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="site-main">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
