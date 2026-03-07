import axios from 'axios'

// Determine the base URL based on environment
const getBaseURL = () => {
  // Use environment variable if set
  const envApiUrl = import.meta.env.VITE_API_URL
  if (envApiUrl) {
    return `${envApiUrl}/api`
  }
  
  // In production (Vercel), use relative path
  if (import.meta.env.PROD || window.location.hostname.includes('vercel')) {
    return '/api'
  }
  
  // Default to localhost
  return 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
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
      return Promise.reject(connectionError)
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout')
      const timeoutError = new Error('Request timed out. Please try again.')
      timeoutError.code = 'TIMEOUT_ERROR'
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
