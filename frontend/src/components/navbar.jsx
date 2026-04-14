import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Menu, X, LogOut, User, ChevronDown } from 'lucide-react'
import './navbar.css'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenu(false) }, [location])

  const handleLogout = () => {
    sessionStorage.removeItem('chat_messages')
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(isAuthenticated() ? [{ to: '/chat', label: 'Chat' }] : []),
    { to: '/about', label: 'About' },
    { to: '/learn', label: 'Learn' },
    { to: '/tools', label: 'Tools' },
    { to: '/contact', label: 'Contact' },
    
  ]

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <TrendingUp size={18} />
          </div>
          <span className="navbar-logo-text">FinBud <span className="navbar-logo-ai">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`navbar-link ${isActive(to) ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {isAuthenticated() ? (
            <div className="user-menu-wrap">
              <button className="user-menu-btn" onClick={() => setUserMenu(!userMenu)}>
                <div className="user-avatar-small">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`chevron ${userMenu ? 'open' : ''}`} />
              </button>
              {userMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="user-dropdown-name">{user?.name}</div>
                      <div className="user-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-login">Sign In</Link>
              <Link to="/signup" className="navbar-signup">Get Started</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button className="navbar-mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} className={`mobile-link ${isActive(to) ? 'active' : ''}`}>
            {label}
          </Link>
        ))}
        <div className="mobile-divider" />
        {isAuthenticated() ? (
          <button className="mobile-logout" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        ) : (
          <div className="mobile-auth">
            <Link to="/login" className="mobile-login">Sign In</Link>
            <Link to="/signup" className="mobile-signup">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  )
}