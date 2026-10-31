'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Info, Phone, Rocket } from 'lucide-react'

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'About', icon: Info, path: '/about' },
  { name: 'Contact', icon: Phone, path: '/contact' },
  { name: 'Get started', icon: Rocket, path: '/get-going' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.includes('/exam')) {
    return null
  }

  return (
    <nav className="public-mobile-nav" aria-label="Primary navigation">
      {navItems.map(({ name, icon: Icon, path }) => {
        const isActive = pathname === path

        return (
          <Link
            key={path}
            href={path}
            className={`public-mobile-nav-link${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon aria-hidden="true" size={19} />
            <span>{name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
