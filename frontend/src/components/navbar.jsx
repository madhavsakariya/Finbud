import { Link, useNavigate } from 'react-router-dom'
import { DollarSign, Home, MessageCircle, BookOpen, Calculator, Info, Mail, LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './navbar.css'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <DollarSign className="navbar-logo-icon" />
          <span>FinBud AI</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            <Home size={18} />
            <span>Home</span>
          </Link>
          
          {isAuthenticated() && (
            <>
              <Link to="/chat" className="navbar-link">
                <MessageCircle size={18} />
                <span>AI Chat</span>
              </Link>
              <Link to="/learn" className="navbar-link">
                <BookOpen size={18} />
                <span>Learn</span>
              </Link>
              <Link to="/tools" className="navbar-link">
                <Calculator size={18} />
                <span>Tools</span>
              </Link>
            </>
          )}
          
          <Link to="/about" className="navbar-link">
            <Info size={18} />
            <span>About</span>
          </Link>
          
          
            <Link to="/contact" className="navbar-link">
              <Mail size={18} />
              <span>Contact</span>
            </Link>
          

          {/* Auth Buttons */}
          {isAuthenticated() ? (
            <div className="navbar-user">
              <div className="navbar-user-info">
                <User size={18} />
                <span>{user?.name || user?.email}</span>
              </div>
              <button onClick={handleLogout} className="navbar-logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar