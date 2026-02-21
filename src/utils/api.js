import axios from 'axios'

// Use localhost for local development, Render for production
// Check if we're in development mode (not on production domain)
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

// Default to localhost:5000 for local development
const LOCAL_BACKEND_URL = 'http://localhost:5000'
const RENDER_BACKEND_URL = 'https://wellnesshub-pro.onrender.com'

// Use localhost URL when running on localhost, otherwise use Render
const BASE_URL = isLocalhost ? LOCAL_BACKEND_URL : RENDER_BACKEND_URL

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Connection refused - Backend server is not running')
      
      const connectionError = new Error('Unable to connect to server. Please try again later.')
      connectionError.code = 'CONNECTION_ERROR'
      connectionError.isConnectionError = true
      
      return Promise.reject(connectionError)
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout')
      const timeoutError = new Error('Request timed out. Please try again.')
      timeoutError.code = 'TIMEOUT_ERROR'
      timeoutError.isTimeoutError = true
      
      return Promise.reject(timeoutError)
    }
    
    console.error('API Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      console.error('401 Unauthorized')
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
