import { BookOpen, TrendingUp, PiggyBank, Target, Shield, Award } from 'lucide-react'
import './learn.css'

function Learn() {
  const categories = [
    {
      icon: <TrendingUp />,
      title: "Investing Basics",
      description: "Learn the fundamentals of investing, from stocks and bonds to mutual funds and ETFs.",
      topics: [
        "What is the stock market?",
        "Difference between stocks and bonds",
        "How to start investing with $1000",
        "Understanding market volatility",
        "Long-term vs short-term investing"
      ],
      color: "#667eea"
    },
    {
      icon: <PiggyBank />,
      title: "Saving Strategies",
      description: "Master the art of saving money and building an emergency fund for financial security.",
      topics: [
        "50/30/20 budgeting rule",
        "How to build an emergency fund",
        "High-yield savings accounts",
        "Automated savings strategies",
        "Cutting unnecessary expenses"
      ],
      color: "#f093fb"
    },
    {
      icon: <Target />,
      title: "Retirement Planning",
      description: "Plan for a comfortable retirement with 401(k)s, IRAs, and smart investment strategies.",
      topics: [
        "401(k) vs Roth IRA explained",
        "How much to save for retirement",
        "Social Security benefits",
        "Retirement withdrawal strategies",
        "Healthcare costs in retirement"
      ],
      color: "#4facfe"
    },
    {
      icon: <Shield />,
      title: "Risk Management",
      description: "Protect your wealth through insurance, diversification, and smart financial planning.",
      topics: [
        "Types of insurance you need",
        "Portfolio diversification strategies",
        "Asset allocation by age",
        "Managing investment risk",
        "Estate planning basics"
      ],
      color: "#43e97b"
    },
    {
      icon: <Award />,
      title: "Wealth Building",
      description: "Advanced strategies to grow your wealth and achieve financial independence.",
      topics: [
        "Compound interest explained",
        "Tax-advantaged investing",
        "Real estate investing",
        "Passive income streams",
        "Financial independence (FIRE)"
      ],
      color: "#fa709a"
    },
    {
      icon: <BookOpen />,
      title: "Personal Finance",
      description: "Master daily money management, credit, debt, and building good financial habits.",
      topics: [
        "Understanding credit scores",
        "Debt payoff strategies",
        "Managing student loans",
        "Creating a monthly budget",
        "Building good money habits"
      ],
      color: "#764ba2"
    }
  ]

  return (
    <div className="learn">
      {/* Header */}
      <section className="learn-header">
        <div className="learn-header-content">
          <h1>Financial Education Hub</h1>
          <p>Master your finances with comprehensive guides and expert knowledge</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="learn-content">
        <div className="categories-grid">
          {categories.map((category, idx) => (
            <div key={idx} className="category-card">
              <div className="category-icon" style={{ background: category.color }}>
                {category.icon}
              </div>
              <h2>{category.title}</h2>
              <p className="category-description">{category.description}</p>
              <ul className="topics-list">
                {category.topics.map((topic, topicIdx) => (
                  <li key={topicIdx}>{topic}</li>
                ))}
              </ul>
              <button className="learn-btn" style={{ borderColor: category.color, color: category.color }}>
                Explore Topic
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="learn-cta">
        <h2>Have Questions?</h2>
        <p>Ask our AI assistant anything about these topics!</p>
        <a href="/chat" className="cta-button">
          Ask FinBud AI
        </a>
      </section>
    </div>
  )
}

export default Learn