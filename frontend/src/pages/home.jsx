import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, TrendingUp, Shield, Zap, ArrowRight, Sparkles, BarChart2, Target, BookOpen } from 'lucide-react'
import './home.css'

// Hook for scroll reveal
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// Animated counter
function Counter({ target, suffix = '', duration = 2000 }) {
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const isFloat = String(target).includes('.')
        const num = parseFloat(target)
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          const current = isFloat ? (ease * num).toFixed(1) : Math.floor(ease * num)
          if (ref.current) ref.current.textContent = current + suffix
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, suffix, duration])

  return <span ref={ref}>0{suffix}</span>
}

// Mini sparkline SVG chart
function Sparkline({ data, color }) {
  const w = 120, h = 40
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h * 0.85 - 3
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Home() {
  useScrollReveal()

  const niftyData  = [17200,17800,17500,18200,18000,18900,18600,19200,19800,19500,20100,19900,21200]
  const sensexData = [57000,58500,58000,60000,59500,62000,61500,63000,64500,63800,66000,65500,72000]
  const goldData   = [52000,53000,52500,54000,53800,55000,55500,57000,58500,58000,60000,59500,62000]

  return (
    <div className="home">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grain" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>India's AI Finance Advisor</span>
          </div>

          <h1 className="hero-title">
            Smarter Money<br />
            <span className="hero-title-accent">Decisions, Every Day</span>
          </h1>

          <p className="hero-description">
            Get instant, accurate answers on taxes, investments, mutual funds, and retirement planning — 
            powered by AI trained specifically for Indian finance.
          </p>

          <div className="hero-actions">
            <Link to="/chat" className="btn-primary">
              <MessageCircle size={18} />
              Start Chatting
              <ArrowRight size={16} />
            </Link>
            <Link to="/learn" className="btn-ghost">
              Explore Topics
            </Link>
          </div>

          {/* Live Market Cards */}
          <div className="market-cards">
            <div className="market-card">
              <div className="market-card-top">
                <span className="market-name">NIFTY 50</span>
                <span className="market-change positive">+1.2%</span>
              </div>
              <div className="market-value">21,200</div>
              <Sparkline data={niftyData} color="#52a86e" />
            </div>
            <div className="market-card">
              <div className="market-card-top">
                <span className="market-name">SENSEX</span>
                <span className="market-change positive">+0.9%</span>
              </div>
              <div className="market-value">71,900</div>
              <Sparkline data={sensexData} color="#52a86e" />
            </div>
            <div className="market-card">
              <div className="market-card-top">
                <span className="market-name">GOLD / 10g</span>
                <span className="market-change positive">+0.4%</span>
              </div>
              <div className="market-value">₹62,000</div>
              <Sparkline data={goldData} color="#c9a84c" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item reveal">
            <div className="stat-number"><Counter target={1000} suffix="+" /></div>
            <div className="stat-label">Questions Answered</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item reveal" style={{transitionDelay:'0.1s'}}>
            <div className="stat-number"><Counter target={50} suffix="+" /></div>
            <div className="stat-label">Finance Topics</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item reveal" style={{transitionDelay:'0.2s'}}>
            <div className="stat-number"><Counter target={98} suffix="%" /></div>
            <div className="stat-label">Accuracy Rate</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item reveal" style={{transitionDelay:'0.3s'}}>
            <div className="stat-number">24/7</div>
            <div className="stat-label">Always Available</div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO DASHBOARD PREVIEW ──────────────────── */}
      <section className="dashboard-section">
        <div className="dashboard-inner">
          <div className="dashboard-text reveal-left">
            <div className="section-eyebrow">Smart Tools</div>
            <h2 className="section-title-left">Track &amp; Plan<br />Your Wealth</h2>
            <p className="section-body">
              Use our interactive calculators to plan SIPs, calculate compound growth, 
              estimate retirement corpus, and understand loan EMIs — all tailored to Indian financial instruments.
            </p>
            <Link to="/tools" className="btn-outline">
              Open Calculators <ArrowRight size={16} />
            </Link>
          </div>

          <div className="dashboard-preview reveal-right">
            <div className="dashboard-card">
              <div className="dc-header">
                <span className="dc-title">Portfolio Growth Simulator</span>
                <span className="dc-badge">Live</span>
              </div>
              <div className="dc-chart-area">
                <PortfolioChart />
              </div>
              <div className="dc-stats">
                <div className="dc-stat">
                  <span className="dc-stat-label">Invested</span>
                  <span className="dc-stat-val">₹6,00,000</span>
                </div>
                <div className="dc-stat">
                  <span className="dc-stat-label">Current Value</span>
                  <span className="dc-stat-val green">₹11,60,000</span>
                </div>
                <div className="dc-stat">
                  <span className="dc-stat-label">Returns</span>
                  <span className="dc-stat-val green">+93.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="features">
        <div className="features-inner">
          <div className="reveal" style={{textAlign:'center', marginBottom:'3rem'}}>
            <div className="section-eyebrow center">Why FinBud</div>
            <h2 className="section-title-center">Built for Indians,<br />by Indians</h2>
          </div>

          <div className="features-grid">
            {[
              { icon: <TrendingUp size={28} />, title: 'Indian Context', body: 'Deep knowledge of PPF, EPF, NPS, ELSS, Section 80C, and all Indian tax laws — not generic global advice.', delay: '0s' },
              { icon: <Zap size={28} />, title: 'Instant Answers', body: 'No appointments, no waiting. Ask about SIP returns, tax saving, or home loans and get answers in seconds.', delay: '0.1s' },
              { icon: <Shield size={28} />, title: 'Unbiased Guidance', body: 'No commissions, no product pushing. Pure, honest financial guidance with your interest first.', delay: '0.2s' },
              { icon: <BarChart2 size={28} />, title: 'Smart Calculators', body: 'Compound interest, retirement planning, EMI, emergency fund — all calculators built for ₹ and Indian rates.', delay: '0.3s' },
              { icon: <BookOpen size={28} />, title: 'Financial Education', body: 'Learn everything from budgeting basics to advanced tax planning through our curated finance library.', delay: '0.4s' },
              { icon: <Target size={28} />, title: 'Goal Planning', body: 'Whether saving for a home, child\'s education, or retirement — get a personalised roadmap to your goal.', delay: '0.5s' },
            ].map((f, i) => (
              <div key={i} className="feature-card reveal" style={{transitionDelay: f.delay}}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="how-section">
        <div className="how-inner">
          <div className="reveal" style={{textAlign:'center', marginBottom:'3rem'}}>
            <div className="section-eyebrow center">Simple Process</div>
            <h2 className="section-title-center">Start in 30 Seconds</h2>
          </div>
          <div className="how-steps">
            {[
              { n: '01', title: 'Create Account', body: 'Sign up free in under a minute with just your email.' },
              { n: '02', title: 'Ask Anything', body: 'Type any finance question in plain Hindi or English.' },
              { n: '03', title: 'Get Clarity', body: 'Receive detailed, accurate answers with specific numbers and rules.' },
              { n: '04', title: 'Take Action', body: 'Use our tools to plan and execute your financial decisions.' },
            ].map((s, i) => (
              <div key={i} className="how-step reveal" style={{transitionDelay:`${i*0.1}s`}}>
                <div className="how-step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {i < 3 && <div className="how-step-arrow"><ArrowRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-grain" />
        <div className="cta-inner reveal">
          <div className="cta-icon"><Sparkles size={32} /></div>
          <h2>Ready to Take Control?</h2>
          <p>Join thousands of Indians making smarter money decisions every day.</p>
          <Link to="/chat" className="btn-cta">
            <MessageCircle size={20} />
            Start Free Chat Now
          </Link>
        </div>
      </section>

    </div>
  )
}

// SVG Bar Chart for dashboard preview
function PortfolioChart() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const values = [100000,140000,130000,170000,160000,210000,200000,250000,280000,260000,310000,360000]
  const max = Math.max(...values)
  return (
    <svg viewBox="0 0 340 120" width="100%" height="120">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a8a55" />
          <stop offset="100%" stopColor="#1a3a28" />
        </linearGradient>
      </defs>
      {values.map((v, i) => {
        const barH = (v / max) * 90
        const x = i * 28 + 4
        return (
          <g key={i}>
            <rect x={x} y={110 - barH} width="18" height={barH}
              fill="url(#barGrad)" rx="3" opacity="0.85" />
            <text x={x + 9} y={117} textAnchor="middle"
              fontSize="7" fill="#8aab96">{months[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}