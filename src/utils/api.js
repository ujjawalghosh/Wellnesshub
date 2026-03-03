import axios from 'axios'

// Check if we're in development mode (localhost)
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

// Backend URL - use localhost for development, use relative URL for production (monorepo)
const BACKEND_URL = isLocalhost 
  ? 'http://localhost:5000' 
  : ''  // Empty string = same domain in production

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
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
    // Handle connection errors with more informative messages
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

// Export health check function
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Server health check failed:', error.message)
    return null
  }
}

export default api
