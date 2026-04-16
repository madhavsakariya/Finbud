import { useEffect } from 'react'
import { Target, Users, Zap, Shield, Heart, Award, ArrowRight,BrainCircuit} from 'lucide-react'
import { Link } from 'react-router-dom'
import './about.css'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function About() {
  useScrollReveal()

  const values = [
    { icon: <Shield />, title: 'Trust & Transparency', body: 'Honest, unbiased financial guidance with no hidden agendas or product pushing. Your interest always comes first.', color: '#1a3a28' },
    { icon: <Users />, title: 'Accessible to All', body: 'Financial advice should not be a luxury. Our AI is free and available 24/7 for every Indian regardless of income.', color: '#245235' },
    { icon: <Zap />, title: 'Instant Answers', body: 'No appointments, no waiting. Get expert-level answers to your financial questions in seconds, any time.', color: '#2d6a42' },
    { icon: <Heart />, title: 'Indian Context', body: 'Built specifically for Indian users with deep knowledge of PPF, EPF, NPS, ELSS, and Indian income tax laws.', color: '#3a8a55' },
    { icon: <Award />, title: 'Quality First', body: 'Trained on verified Indian financial knowledge to provide accurate, reliable, and up-to-date information.', color: '#52a86e' },
    { icon: <BrainCircuit />, title: 'Continuous Learning', body: 'Our AI improves with every interaction, staying current with the latest financial regulations and market trends.', color: '#29aa36' },
  ]

  const steps = [
    { n: '01', title: 'Ask Your Question', body: 'Type any financial question in plain language — from basic budgeting to complex tax planning.' },
    { n: '02', title: 'AI Processes', body: 'Our model, trained on extensive Indian finance data, analyses your question and retrieves relevant context instantly.' },
    { n: '03', title: 'Get Clear Answers', body: 'Receive detailed, easy-to-understand explanations with specific numbers tailored to India.' },
    { n: '04', title: 'Take Action', body: 'Use our calculators and tools to plan your financial future with full confidence.' },
  ]

  const stats = [
    { number: '1000+', label: 'Questions Answered' },
    { number: '50+', label: 'Finance Topics' },
    { number: '24/7', label: 'Always Available' },
    { number: '100%', label: 'Free Forever' },
  ]

  return (
    <div className="about">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-grain" />
        <div className="about-hero-orb" />
        <div className="about-hero-content">
          <div className="about-eyebrow">Our Story</div>
          <h1>About FinBud AI</h1>
          <p>Empowering Indians to make smarter financial decisions through AI-powered guidance — free, honest, and always available.</p>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────── */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text reveal-left">
            <div className="about-section-eyebrow">Our Purpose</div>
            <h2>Why We Built FinBud</h2>
            <p>FinBud AI was created with a simple mission — to democratize financial knowledge and make professional-level financial advice accessible to every Indian, regardless of their background or income level.</p>
            <p>We believe financial literacy is the key to economic empowerment. With rising costs, complex investment options, and an ever-changing financial landscape, Indians need a trusted companion to help navigate their financial journey.</p>
            <Link to="/chat" className="about-cta-inline">
              Start Chatting <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mission-visual reveal-right">
            <div className="mission-card">
              <div className="mission-card-icon"><Target size={40} /></div>
              <h3>Our Mission</h3>
              <p>Make expert Indian financial guidance free, instant, and accessible to every person in India.</p>
            </div>
            <div className="mission-card mission-card-accent">
              <div className="mission-card-icon gold"><Heart size={40} /></div>
              <h3>Our Promise</h3>
              <p>No commissions, no product pushing, no sponsored advice. Just honest, accurate financial information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section className="values-section">
        <div className="values-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="about-section-eyebrow center">What We Stand For</div>
            <h2 className="about-section-title">Our Core Values</h2>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="value-icon" style={{ background: v.color }}>
                  {v.icon}
                </div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="how-it-works">
        <div className="how-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="about-section-eyebrow center">Simple Process</div>
            <h2 className="about-section-title">How FinBud AI Works</h2>
          </div>
          <div className="steps-container">
            {steps.map((s, i) => (
              <div key={i} className="step-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="about-stats">
        <div className="about-stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="about-stat reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="about-stat-number">{s.number}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="about-cta-section">
        <div className="about-cta-grain" />
        <div className="about-cta-inner reveal">
          <h2>Ready to Start Your Financial Journey?</h2>
          <p>Join thousands of Indians making smarter money decisions with FinBud AI</p>
          <Link to="/chat" className="about-cta-btn">
            Start Chatting Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  )
}

export default About