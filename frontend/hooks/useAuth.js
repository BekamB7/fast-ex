// frontend/hooks/useAuth.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/api'

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('fastExToken')
        const userData = localStorage.getItem('fastExUser')

        if (token && userData) {
          setUser(JSON.parse(userData))
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth load error:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('fastExToken', token)
    localStorage.setItem('fastExUser', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('fastExToken')
    localStorage.removeItem('fastExUser')
    setUser(null)
    router.push('/dashboard/login')
  }, [router])

  return { user, loading, login, logout }
}