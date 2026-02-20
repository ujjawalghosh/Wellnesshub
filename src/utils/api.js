import axios from 'axios'

// Get API URL from environment variable or use proxy fallback
// In development, requests to /api are proxied to the backend
// In production, use the full API URL
const getApiBaseURL = () => {
  // Vite environment variable - use if explicitly set
  const envApiUrl = import.meta.env.VITE_API_URL
  
  if (envApiUrl) {
    return envApiUrl
  }
  
  // Default: use Vite's proxy (requests to /api are proxied to localhost:5000)
  return '/api'
}

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000 // 10 second timeout default
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
    // Handle connection errors (ECONNREFUSED) - backend not running
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Connection refused - Backend server is not running')
      
      // Create a more user-friendly error
      const connectionError = new Error('Unable to connect to server. Please check your internet connection and try again.')
      connectionError.code = 'CONNECTION_ERROR'
      connectionError.isConnectionError = true
      
      return Promise.reject(connectionError)
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout - Server took too long to respond')
      const timeoutError = new Error('Request timed out. Please try again.')
      timeoutError.code = 'TIMEOUT_ERROR'
      timeoutError.isTimeoutError = true
      
      return Promise.reject(timeoutError)
    }
    
    console.error('API Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - removing token')
      localStorage.removeItem('token')
      // Dispatch a custom event so AuthContext can handle the logout
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
