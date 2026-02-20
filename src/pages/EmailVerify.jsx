import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Mail, Lock, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function EmailVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get email from state or localStorage (passed during registration)
  const initialEmail = location.state?.email || localStorage.getItem('pendingVerificationEmail') || ''
  
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [success, setSuccess] = useState(false)
  
  const { verifyEmail, resendOTP } = useAuth()

  // Store email in localStorage for persistence
  useEffect(() => {
    if (email) {
      localStorage.setItem('pendingVerificationEmail', email)
    }
  }, [email])

  // Countdown timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verifyEmail(email, otp)
      setSuccess(true)
      // Clear the pending email
      localStorage.removeItem('pendingVerificationEmail')
      // Redirect to onboarding after a short delay
      setTimeout(() => {
        navigate('/onboarding')
      }, 1500)
    } catch (err) {
      console.error('Verify email error:', err)
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    setError('')
    setLoading(true)

    try {
      await resendOTP(email)
      setResendTimer(60) // Restart 60 second countdown
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed inset-0 hero-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Email Verified!</h2>
          <p className="text-slate-400">Redirecting to onboarding...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 hero-gradient"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl">WellnessHub</span>
          </Link>
        </div>

        {/* Email Verification Form */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-heading font-bold text-center mb-2">Verify Your Email</h2>
          <p className="text-slate-400 text-center mb-6">
            Enter the OTP sent to your email to complete registration
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OTP Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field pl-11 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Verifying...'
              ) : (
                <>
                  Verify Email <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Already verified?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
