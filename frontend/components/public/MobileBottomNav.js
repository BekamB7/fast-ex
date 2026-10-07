// frontend/components/public/MobileBottomNav.js
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Info, Phone, Rocket } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'About', icon: Info, path: '/about' },
  { name: 'Contact', icon: Phone, path: '/contact' },
  { name: 'Get Going', icon: Rocket, path: '/get-going' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hide on dashboard and exam routes
  if (!isMounted) return null
  if (pathname?.startsWith('/dashboard')) return null
  if (pathname?.startsWith('/exam')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-3xl">
      <div className="flex items-center justify-around px-2 py-2 max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <Link key={item.path} href={item.path} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-0.5 py-1 rounded-2xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 w-8 h-1 bg-primary rounded-full"
                  />
                )}
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}