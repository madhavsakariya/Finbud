import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Lock, Key, Clock, UserPlus } from 'lucide-react'
import axios from 'axios'
import './auth.css'

const API_URL = 'http://localhost:5001/api'
const OTP_EXPIRY_MINUTES = 10

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [userNotFound, setUserNotFound] = useState(false)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // Countdown timer effect
  useEffect(() => {
    let interval = null
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setTimerActive(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setTimerActive(false)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Check if timer is in warning zone (< 2 minutes)
  const isWarningTime = timeLeft > 0 && timeLeft < 120

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setStatus({ type: '', message: '' })
    setUserNotFound(false)
  }

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()

    if (!formData.email) {
      setStatus({ type: 'error', message: 'Please enter your email address' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' })
      return
    }

    setIsLoading(true)
    setUserNotFound(false)

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email: formData.email
      })

      setStatus({
        type: 'success',
        message: 'OTP sent to your email! Check your inbox.'
      })

      // Start countdown timer (10 minutes)
      setTimeLeft(OTP_EXPIRY_MINUTES * 60)
      setTimerActive(true)

      // Move to OTP step
      setTimeout(() => {
        setStep(2)
        setStatus({ type: '', message: '' })
      }, 2000)

    } catch (err) {
      if (err.response) {
        // Check if user not found (404 status)
        if (err.response.status === 404) {
          setUserNotFound(true)
          setStatus({
            type: 'error',
            message: err.response.data.error || 'User not found'
          })
        } else {
          setStatus({
            type: 'error',
            message: err.response.data.error || 'Failed to send OTP'
          })
        }
      } else {
        setStatus({
          type: 'error',
          message: 'Cannot connect to server. Please check if backend is running.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    if (!formData.otp) {
      setStatus({ type: 'error', message: 'Please enter the OTP' })
      return
    }

    if (formData.otp.length !== 6) {
      setStatus({ type: 'error', message: 'OTP must be 6 digits' })
      return
    }

    if (timeLeft === 0) {
      setStatus({ type: 'error', message: 'OTP has expired. Please request a new one.' })
      return
    }

    setIsLoading(true)

    try {
      await axios.post(`${API_URL}/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      })

      setStatus({
        type: 'success',
        message: 'OTP verified! Set your new password.'
      })

      // Stop timer
      setTimerActive(false)

      // Move to password reset step
      setTimeout(() => {
        setStep(3)
        setStatus({ type: '', message: '' })
      }, 1500)

    } catch (err) {
      if (err.response) {
        setStatus({
          type: 'error',
          message: err.response.data.error || 'Invalid OTP'
        })
      } else {
        setStatus({
          type: 'error',
          message: 'Cannot connect to server'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!formData.newPassword || !formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    if (formData.newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }

    setIsLoading(true)

    try {
      await axios.post(`${API_URL}/reset-password`, {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.newPassword
      })

      setStatus({
        type: 'success',
        message: 'Password reset successfully! Redirecting to login...'
      })

      // Redirect to login
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      if (err.response) {
        setStatus({
          type: 'error',
          message: err.response.data.error || 'Failed to reset password'
        })
      } else {
        setStatus({
          type: 'error',
          message: 'Cannot connect to server'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = () => {
    setFormData(prev => ({ ...prev, otp: '' }))
    handleRequestOTP({ preventDefault: () => {} })
  }

  return (
    <div className="auth-page">
      <div className="auth-container forgot-password-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">🔒</div>
              <h1>Reset Password</h1>
            </div>
            <p>
              {step === 1 && 'Enter your email to receive OTP'}
              {step === 2 && 'Enter the OTP sent to your email'}
              {step === 3 && 'Set your new password'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Email</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>OTP</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Password</span>
            </div>
          </div>

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form className="auth-form" onSubmit={handleRequestOTP}>
              {status.message && (
                <div className={`auth-${status.type}`}>
                  {status.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              {/* User Not Found - Signup Prompt */}
              {userNotFound && (
                <div className="signup-prompt">
                  <UserPlus size={24} />
                  <div className="signup-prompt-content">
                    <h3>Don't have an account yet?</h3>
                    <p>This email is not registered in our system.</p>
                    <Link to="/signup" className="signup-prompt-btn">
                      <UserPlus size={18} />
                      Create Account
                    </Link>
                  </div>
                </div>
              )}

              <div className="auth-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading || !formData.email}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Checking...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send OTP
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form className="auth-form" onSubmit={handleVerifyOTP}>
              {status.message && (
                <div className={`auth-${status.type}`}>
                  {status.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              {/* Timer Display */}
              {timeLeft > 0 && (
                <div className={`timer-display ${isWarningTime ? 'warning' : ''}`}>
                  <Clock size={20} />
                  <span className="timer-text">
                    {isWarningTime ? '⚠️ ' : ''}
                    Time remaining: <strong>{formatTime(timeLeft)}</strong>
                  </span>
                </div>
              )}

              {timeLeft === 0 && timerActive === false && step === 2 && (
                <div className="timer-display expired">
                  <AlertCircle size={20} />
                  <span className="timer-text">
                    ❌ OTP has expired. Please request a new one.
                  </span>
                </div>
              )}

              <div className="otp-info">
                <p>📧 OTP sent to: <strong>{formData.email}</strong></p>
                <button
                  type="button"
                  className="resend-link"
                  onClick={() => setStep(1)}
                >
                  Change email?
                </button>
              </div>

              <div className="auth-form-group">
                <label htmlFor="otp">Enter 6-Digit OTP</label>
                <div className="auth-input-wrapper">
                  <Key className="auth-input-icon" size={18} />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="123456"
                    disabled={isLoading || timeLeft === 0}
                    maxLength="6"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading || formData.otp.length !== 6 || timeLeft === 0}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verify OTP
                  </>
                )}
              </button>

              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOTP}
                disabled={isLoading || (timerActive && timeLeft > 540)}
              >
                {timerActive && timeLeft > 540 
                  ? `📨 Resend available in ${formatTime(timeLeft - 540)}`
                  : '📨 Resend OTP'
                }
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              {status.message && (
                <div className={`auth-${status.type}`}>
                  {status.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-back-link">
            <Link to="/login" className="back-to-login">
              <ArrowLeft size={18} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        <div className="auth-showcase">
          <h2>Password Recovery</h2>
          <div className="recovery-info">
            <div className="info-item">
              <span className="info-icon">✅</span>
              <div>
                <h3>Registered Users Only</h3>
                <p>We verify your account before sending OTP</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <div>
                <h3>10-Minute Timer</h3>
                <p>OTP expires after 10 minutes for security</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🔒</span>
              <div>
                <h3>Secure Process</h3>
                <p>Your password is safely encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword