import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    
    // Listen for unauthorized events from the API interceptor
    const handleUnauthorized = () => {
      console.log('Received unauthorized event, logging out...')
      setUser(null)
      setLoading(false)
    }
    
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    console.log('Attempting login with email:', email)
    const response = await api.post('/auth/login', { email, password })
    console.log('Login response received:', response.data)
    
    const { token, user } = response.data
    
    if (!token || !user) {
      console.error('Invalid response from server:', response.data)
      const err = new Error('Invalid response from server')
      err.response = response.data
      throw err
    }
    
    localStorage.setItem('token', token)
    setUser(user)
    console.log('Login successful, user set:', user)
    console.log('Token stored in localStorage:', token.substring(0, 20) + '...')
    return user
  }

  const register = async (name, email, password) => {
    try {
      console.log('Sending registration request to backend:', { name, email })
      const response = await api.post('/auth/register', { name, email, password })
      console.log('Registration response:', response.data)
      
      const { token, user } = response.data
      
      if (!token || !user) {
        console.error('Invalid response from server:', response.data)
        const err = new Error('Invalid response from server')
        err.response = response.data
        throw err
      }
      
      localStorage.setItem('token', token)
      setUser(user)
      setLoading(false) // Reset loading state after successful registration
      console.log('Registration successful, user set:', user)
      return user
    } catch (error) {
      console.error('Registration error in AuthContext:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      setLoading(false) // Reset loading state on error
      // Ensure we preserve the error response for the UI
      if (!error.response) {
        const err = new Error(error.message || 'Registration failed')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // OTP Login - Send OTP to email
  const sendOTP = async (email) => {
    try {
      const response = await api.post('/auth/send-otp', { email })
      console.log('OTP sent successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Send OTP error:', error)
      if (!error.response) {
        const err = new Error(error.message || 'Failed to send OTP')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // OTP Login - Verify OTP and login
  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp })
      const { token, user } = response.data
      
      if (!token || !user) {
        console.error('Invalid response from server:', response.data)
        const err = new Error('Invalid response from server')
        err.response = response.data
        throw err
      }
      
      localStorage.setItem('token', token)
      setUser(user)
      setLoading(false) // Reset loading state after successful OTP login
      console.log('OTP login successful, user set:', user)
      return user
    } catch (error) {
      console.error('Verify OTP error:', error)
      setLoading(false) // Reset loading state on error
      if (!error.response) {
        const err = new Error(error.message || 'Failed to verify OTP')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // Register with Email Verification
  const registerWithVerification = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register-with-verification', { name, email, password })
      console.log('Registration with verification:', response.data)
      // Don't set user yet - they need to verify email first
      return response.data
    } catch (error) {
      console.error('Register with verification error:', error)
      if (!error.response) {
        const err = new Error(error.message || 'Registration failed')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // Verify Email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-email', { email, otp })
      const { token, user } = response.data
      
      if (!token || !user) {
        console.error('Invalid response from server:', response.data)
        const err = new Error('Invalid response from server')
        err.response = response.data
        throw err
      }
      
      localStorage.setItem('token', token)
      setUser(user)
      setLoading(false) // Reset loading state after successful email verification
      console.log('Email verified successfully, user set:', user)
      return user
    } catch (error) {
      console.error('Verify email error:', error)
      setLoading(false) // Reset loading state on error
      if (!error.response) {
        const err = new Error(error.message || 'Failed to verify email')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // Resend OTP
  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email })
      console.log('OTP resent successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Resend OTP error:', error)
      if (!error.response) {
        const err = new Error(error.message || 'Failed to resend OTP')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // Enable 2FA
  const enable2FA = async () => {
    try {
      const response = await api.post('/auth/enable-2fa')
      console.log('2FA enabled:', response.data)
      return response.data
    } catch (error) {
      console.error('Enable 2FA error:', error)
      if (!error.response) {
        const err = new Error(error.message || 'Failed to enable 2FA')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // Verify 2FA
  const verify2FA = async (otp) => {
    try {
      const response = await api.post('/auth/verify-2fa', { otp })
      console.log('2FA verified:', response.data)
      // Update user state with 2FA enabled
      setUser(prev => ({ ...prev, twoFactorEnabled: true }))
      return response.data
    } catch (error) {
      console.error('Verify 2FA error:', error)
      if (!error.response) {
        const err = new Error(error.message || 'Failed to verify 2FA')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  // Disable 2FA
  const disable2FA = async () => {
    try {
      const response = await api.post('/auth/disable-2fa')
      console.log('2FA disabled:', response.data)
      // Update user state with 2FA disabled
      setUser(prev => ({ ...prev, twoFactorEnabled: false }))
      return response.data
    } catch (error) {
      console.error('Disable 2FA error:', error)
      if (!error.response) {
        const err = new Error(error.message || 'Failed to disable 2FA')
        if (error.request) {
          err.message = 'Unable to connect to server. Please check your internet connection.'
        }
        err.response = error.response
        throw err
      }
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    // OTP functions
    sendOTP,
    verifyOTP,
    registerWithVerification,
    verifyEmail,
    resendOTP,
    enable2FA,
    verify2FA,
    disable2FA
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
