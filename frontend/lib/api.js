// frontend/lib/api.js
// frontend/lib/api.js
import axios from 'axios'

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  || 'http://localhost:5000/api'
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '')
const API_URL = /\/api$/i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1', // <--- ADD THIS LINE
  },
})

// ... rest of your file stays exactly the same

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