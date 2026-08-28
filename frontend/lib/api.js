// frontend/lib/api.js
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fastExToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fastExToken')
      localStorage.removeItem('fastExUser')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/dashboard/login')) {
        window.location.href = '/dashboard/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api