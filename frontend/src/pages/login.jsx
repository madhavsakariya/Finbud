import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './auth.css'

const API_URL = 'http://localhost:5001/api'

// Simple encryption for saved credentials (basic obfuscation)
const encode = (str) => btoa(encodeURIComponent(str))
const decode = (str) => {
  try {
    return decodeURIComponent(atob(str))
  } catch {
    return ''
  }
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [actualPassword, setActualPassword] = useState('') // Store real password separately
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isPasswordAutoFilled, setIsPasswordAutoFilled] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('finbud_rem_email')
    const savedPassword = localStorage.getItem('finbud_rem_pass')
    
    if (savedEmail && savedPassword) {
      const decodedPassword = decode(savedPassword)
      
      setFormData({
        email: decode(savedEmail),
        password: '•'.repeat(decodedPassword.length) // Show dots instead of password
      })
      setActualPassword(decodedPassword) // Store actual password separately
      setRememberMe(true)
      setIsPasswordAutoFilled(true)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'password') {
      // User is typing in password field
      if (isPasswordAutoFilled) {
        // Clear auto-filled dots and start fresh
        setFormData(prev => ({
          ...prev,
          password: value
        }))
        setActualPassword(value)
        setIsPasswordAutoFilled(false)
      } else {
        // Normal typing
        setFormData(prev => ({
          ...prev,
          password: value
        }))
        setActualPassword(value)
      }
    } else {
      // Other fields (email)
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    setError('')
  }

  const handlePasswordFocus = () => {
    // When user clicks on auto-filled password, clear it so they can type
    if (isPasswordAutoFilled) {
      setFormData(prev => ({
        ...prev,
        password: ''
      }))
      setActualPassword('')
      setIsPasswordAutoFilled(false)
    }
  }

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked
    setRememberMe(checked)
    
    // If unchecked, clear saved credentials immediately
    if (!checked) {
      localStorage.removeItem('finbud_rem_email')
      localStorage.removeItem('finbud_rem_pass')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Use actual password for validation and API call
    const passwordToUse = isPasswordAutoFilled ? actualPassword : formData.password

    if (!formData.email || !passwordToUse) {
      setError('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Call real API with actual password
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: passwordToUse
      })
      
      // Get user data and token from response
      const { user, token } = response.data
      
      // Handle Remember Me
      if (rememberMe) {
        // Save encoded credentials to localStorage
        localStorage.setItem('finbud_rem_email', encode(formData.email))
        localStorage.setItem('finbud_rem_pass', encode(passwordToUse))
      } else {
        // Clear saved credentials
        localStorage.removeItem('finbud_rem_email')
        localStorage.removeItem('finbud_rem_pass')
      }
      
      // Save to AuthContext (which saves to localStorage)
      login({
        ...user,
        token
      })
      
      // Navigate to chat page
      navigate('/chat')
      
    } catch (err) {
      // Handle errors
      if (err.response) {
        // Server responded with error
        setError(err.response.data.error || 'Login failed. Please try again.')
      } else if (err.request) {
        // No response from server
        setError('Cannot connect to server. Please make sure the backend is running.')
      } else {
        // Other error
        setError('An error occurred. Please try again.')
      }
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">💰</div>
              <h1>FinBud AI</h1>
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Show info when credentials are auto-filled */}
            {isPasswordAutoFilled && (
              <div className="auto-filled-notice">
                <Lock size={16} />
                <span>Credentials loaded from "Remember Me"</span>
              </div>
            )}

            <div className="auth-form-group">
              <label htmlFor="email">Email</label>
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
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handlePasswordFocus}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  style={{
                    fontFamily: isPasswordAutoFilled && !showPassword ? 'inherit' : 'inherit'
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isPasswordAutoFilled && (
                <small className="password-hint">
                  Click to change password or just login
                </small>
              )}
            </div>

            <div className="auth-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
          </div>
        </div>

        <div className="auth-showcase">
          <h2>Your Smart Finance Companion</h2>
          <ul className="showcase-features">
            <li>
              <span className="feature-icon">💡</span>
              <div>
                <h3>AI-Powered Advice</h3>
                <p>Get personalized financial guidance</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📊</span>
              <div>
                <h3>Smart Analytics</h3>
                <p>Track your financial goals</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔒</span>
              <div>
                <h3>Secure & Private</h3>
                <p>Your data is protected</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login