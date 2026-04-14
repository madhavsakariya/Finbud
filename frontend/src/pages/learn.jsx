import { useEffect } from 'react'
import { BookOpen, TrendingUp, PiggyBank, Target, Shield, Award, ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import './learn.css'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Learn() {
  useScrollReveal()

  const categories = [
    {
      icon: <TrendingUp />,
      title: 'Investing Basics',
      description: 'Learn the fundamentals of investing in India — from stocks and mutual funds to ETFs and SIPs.',
      topics: [
        'What is the Indian stock market?',
        'Difference between stocks and mutual funds',
        'How to start a SIP with ₹500/month',
        'Understanding Nifty 50 and Sensex',
        'Long-term vs short-term investing',
      ],
      color: '#1a3a28',
      accent: '#3a8a55',
    },
    {
      icon: <PiggyBank />,
      title: 'Saving Strategies',
      description: 'Master the art of saving money and building an emergency fund for true financial security.',
      topics: [
        '50-30-20 budgeting rule for India',
        'How to build a 6-month emergency fund',
        'Best high-yield savings options in India',
        'Automated savings with recurring deposits',
        'Cutting expenses without sacrificing lifestyle',
      ],
      color: '#245235',
      accent: '#52a86e',
    },
    {
      icon: <Target />,
      title: 'Retirement Planning',
      description: 'Plan a comfortable retirement with NPS, PPF, EPF, and smart investment strategies.',
      topics: [
        'NPS vs EPF vs PPF — which is better?',
        'How much corpus do you need to retire?',
        'Retirement withdrawal strategy',
        'Senior Citizen Savings Scheme',
        'Healthcare costs in retirement India',
      ],
      color: '#2d6a42',
      accent: '#7dc492',
    },
    {
      icon: <Shield />,
      title: 'Tax Planning',
      description: 'Legally minimise your tax burden and maximise savings under Indian tax laws.',
      topics: [
        'Old vs New tax regime — which to choose?',
        'Section 80C investment options',
        'HRA exemption calculation',
        'Capital gains tax on mutual funds',
        'TDS on FD interest and Form 15G',
      ],
      color: '#c9a84c',
      accent: '#d4b86a',
    },
    {
      icon: <Award />,
      title: 'Wealth Building',
      description: 'Advanced strategies to grow your wealth and achieve financial independence in India.',
      topics: [
        'Power of compounding with examples',
        'ELSS vs PPF for tax saving',
        'Direct vs regular mutual funds',
        'Real estate vs equity investing',
        'FIRE movement — retire early in India',
      ],
      color: '#3a8a55',
      accent: '#b4dfc0',
    },
    {
      icon: <BookOpen />,
      title: 'Personal Finance',
      description: 'Master daily money management, credit scores, debt repayment, and financial habits.',
      topics: [
        'Understanding CIBIL score',
        'Debt snowball vs avalanche method',
        'Managing home loan and EMI',
        'Credit card dos and donts',
        'Building good money habits',
      ],
      color: '#0f2318',
      accent: '#52a86e',
    },
  ]

  return (
    <div className="learn">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="learn-hero">
        <div className="learn-hero-grain" />
        <div className="learn-hero-orb" />
        <div className="learn-hero-content">
          <div className="learn-eyebrow">Knowledge Hub</div>
          <h1>Financial Education<br /><span className="learn-title-accent">Made Simple</span></h1>
          <p>Master your finances with comprehensive guides built specifically for India's financial system — taxes, investments, retirement, and more.</p>
        </div>

        {/* Topic count pills */}
        <div className="learn-pills">
          {['Tax Planning', 'Mutual Funds', 'SIP & ELSS', 'Retirement', 'Credit & Loans', 'Insurance'].map((t, i) => (
            <div key={i} className="learn-pill">{t}</div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="learn-content">
        <div className="learn-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="learn-section-eyebrow">Browse Topics</div>
            <h2 className="learn-section-title">Choose Your Learning Path</h2>
          </div>

          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div key={i} className="category-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="category-card-top" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.accent})` }}>
                  <div className="category-icon">{cat.icon}</div>
                  <h2>{cat.title}</h2>
                  <p className="cat-desc">{cat.description}</p>
                </div>
                <div className="category-card-body">
                  <ul className="topics-list">
                    {cat.topics.map((topic, ti) => (
                      <li key={ti}>
                        <span className="topic-arrow">→</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <Link to="/chat" className="learn-btn" style={{ borderColor: cat.accent, color: cat.accent }}>
                    Ask FinBud AI <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK FACTS ──────────────────────────────────── */}
      <section className="learn-facts">
        <div className="learn-facts-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="learn-section-eyebrow center">Did You Know?</div>
            <h2 className="learn-section-title">Key Indian Finance Facts</h2>
          </div>
          <div className="facts-grid">
            {[
              { stat: '₹1.5L', label: 'Max 80C deduction per year under old regime' },
              { stat: '7.1%', label: 'Current PPF interest rate (tax free returns)' },
              { stat: '3 yrs', label: 'Shortest lock-in for tax saving — ELSS funds' },
              { stat: '₹5L', label: 'DICGC insurance per bank deposit' },
              { stat: '10%', label: 'LTCG tax on equity gains above ₹1 lakh/year' },
              { stat: '30%', label: 'Top income tax slab rate in India' },
            ].map((f, i) => (
              <div key={i} className="fact-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="fact-stat">{f.stat}</div>
                <div className="fact-label">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="learn-cta">
        <div className="learn-cta-grain" />
        <div className="learn-cta-inner reveal">
          <div className="learn-cta-icon"><MessageCircle size={30} /></div>
          <h2>Have Questions?</h2>
          <p>Ask our AI assistant anything about these topics and get instant, accurate answers.</p>
          <Link to="/chat" className="learn-cta-btn">
            Ask FinBud AI <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  )
}

export default Learn