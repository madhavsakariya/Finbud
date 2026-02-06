import { Link } from 'react-router-dom'
import { MessageCircle, TrendingUp, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react'
import './home.css'

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>AI-Powered Finance Assistant</span>
          </div>
          <h1 className="hero-title">
            Your Personal Finance
            <span className="gradient-text"> AI Assistant</span>
          </h1>
          <p className="hero-description">
            Get instant, intelligent answers to all your financial questions. 
            From investing strategies to retirement planning, FinBud AI is here to help 
            you make smarter money decisions.
          </p>
          <div className="hero-buttons">
            <Link to="/chat" className="btn-primary">
              <MessageCircle size={20} />
              Start Chatting
              <ArrowRight size={20} />
            </Link>
            <Link to="/learn" className="btn-secondary">
              Learn More
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat">
              <div className="stat-number">50+</div>
              <div className="stat-label">Finance Topics</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose FinBud AI?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp />
            </div>
            <h3>Smart Insights</h3>
            <p>Get personalized financial advice powered by advanced AI trained on finance expertise.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Zap />
            </div>
            <h3>Instant Answers</h3>
            <p>No waiting. Ask questions and get detailed responses in seconds, anytime you need.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield />
            </div>
            <h3>100% Free</h3>
            <p>Access professional-level financial guidance without paying for expensive advisors.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Take Control of Your Finances?</h2>
          <p>Start your journey to financial freedom today with FinBud AI</p>
          <Link to="/chat" className="btn-primary">
            <MessageCircle size={20} />
            Start Free Chat
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home