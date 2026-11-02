// frontend/lib/api.js
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL 

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Add token to requests (checks platform vs org token based on URL)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isPlatformRoute = 
      config.url?.includes('/platform/') || 
      window.location.pathname.startsWith('/admin')
    
    const token = isPlatformRoute 
      ? localStorage.getItem('fastExPlatformToken')
      : localStorage.getItem('fastExToken')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isPlatformPage = window.location.pathname.startsWith('/admin')
      const isLoginPage = window.location.pathname.includes('/login')
      
      if (!isLoginPage) {
        if (isPlatformPage) {
          localStorage.removeItem('fastExPlatformToken')
          localStorage.removeItem('fastExPlatformAdmin')
          window.location.href = '/admin/login'
        } else {
          localStorage.removeItem('fastExToken')
          localStorage.removeItem('fastExUser')
          window.location.href = '/dashboard/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api