import { Target, Users, Zap, Shield, Heart, Award } from 'lucide-react'
import './about.css'

function About() {
  return (
    <div className="about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About FinBud AI</h1>
          <p>Empowering Indians to make smarter financial decisions through AI-powered guidance</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              FinBud AI was created with a simple mission: to democratize financial knowledge 
              and make professional-level financial advice accessible to every Indian, regardless 
              of their background or income level.
            </p>
            <p>
              We believe that financial literacy is the key to economic empowerment. With rising 
              costs, complex investment options, and an ever-changing financial landscape, 
              Indians need a trusted companion to help navigate their financial journey.
            </p>
          </div>
          <div className="mission-icon">
            <Target size={200} />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2 className="section-title">Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon" style={{background: '#667eea'}}>
              <Shield />
            </div>
            <h3>Trust & Transparency</h3>
            <p>We provide honest, unbiased financial guidance with no hidden agendas or product pushing.</p>
          </div>
          <div className="value-card">
            <div className="value-icon" style={{background: '#f093fb'}}>
              <Users />
            </div>
            <h3>Accessible to All</h3>
            <p>Financial advice shouldn't be a luxury. Our AI is free and available 24/7 for everyone.</p>
          </div>
          <div className="value-card">
            <div className="value-icon" style={{background: '#43e97b'}}>
              <Zap />
            </div>
            <h3>Instant Answers</h3>
            <p>No appointments, no waiting. Get expert-level answers to your questions in seconds.</p>
          </div>
          <div className="value-card">
            <div className="value-icon" style={{background: '#4facfe'}}>
              <Heart />
            </div>
            <h3>Indian Context</h3>
            <p>Built specifically for Indian users with context on PPF, EPF, NPS, and Indian tax laws.</p>
          </div>
          <div className="value-card">
            <div className="value-icon" style={{background: '#fa709a'}}>
              <Award />
            </div>
            <h3>Quality First</h3>
            <p>Trained on verified financial knowledge to provide accurate, reliable information.</p>
          </div>
          <div className="value-card">
            <div className="value-icon" style={{background: '#764ba2'}}>
              <Zap />
            </div>
            <h3>Continuous Learning</h3>
            <p>Our AI constantly improves to serve you better and stay updated with financial trends.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How FinBud AI Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Ask Your Question</h3>
            <p>Type any financial question in natural language - from basic budgeting to complex investments.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Processes</h3>
            <p>Our AI model, trained on extensive financial knowledge, analyzes your question instantly.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Clear Answers</h3>
            <p>Receive detailed, easy-to-understand explanations tailored to the Indian financial context.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Take Action</h3>
            <p>Use our calculators and tools to plan your financial future with confidence.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Questions Answered</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">50+</div>
            <div className="stat-label">Finance Topics Covered</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Always Available</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">100%</div>
            <div className="stat-label">Free Forever</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to Start Your Financial Journey?</h2>
        <p>Join thousands of Indians making smarter money decisions with FinBud AI</p>
        <a href="/chat" className="cta-button">Start Chatting Now</a>
      </section>
    </div>
  )
}

export default About