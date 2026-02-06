import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './auth.css'

const API_URL = 'http://localhost:5001/api'

function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      minLength,
      hasUpper,
      hasLower,
      hasNumber
    }
  }

  const passwordValidation = validatePassword(formData.password)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      // Call real API
      const response = await axios.post(`${API_URL}/signup`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      
      // Get user data and token from response
      const { user, token } = response.data
      
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
        setError(err.response.data.error || 'Signup failed. Please try again.')
      } else if (err.request) {
        // No response from server
        setError('Cannot connect to server. Please make sure the backend is running.')
      } else {
        // Other error
        setError('An error occurred. Please try again.')
      }
      console.error('Signup error:', err)
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
            <h2>Create Account</h2>
            <p>Start your financial journey today</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-form-group">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

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
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {formData.password && (
                <div className="password-requirements">
                  <div className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                    {passwordValidation.minLength ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={passwordValidation.hasUpper ? 'valid' : 'invalid'}>
                    {passwordValidation.hasUpper ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={passwordValidation.hasLower ? 'valid' : 'invalid'}>
                    {passwordValidation.hasLower ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={passwordValidation.hasNumber ? 'valid' : 'invalid'}>
                    {passwordValidation.hasNumber ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>One number</span>
                  </div>
                </div>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="terms-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the{' '}
                <Link to="/terms" className="auth-link">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="auth-link">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="auth-showcase">
          <h2>Join Thousands of Smart Investors</h2>
          <ul className="showcase-features">
            <li>
              <span className="feature-icon">🎯</span>
              <div>
                <h3>Personalized Goals</h3>
                <p>Set and track your financial objectives</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📈</span>
              <div>
                <h3>Investment Insights</h3>
                <p>AI-powered market analysis</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">💼</span>
              <div>
                <h3>Portfolio Management</h3>
                <p>Optimize your investments</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Signup