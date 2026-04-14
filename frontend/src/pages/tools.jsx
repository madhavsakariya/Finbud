import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, PiggyBank, Home, BarChart2, ArrowRight } from 'lucide-react'
import './tools.css'

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

// Mini bar chart for results
function ResultChart({ data, colors }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="result-chart">
      {data.map((d, i) => (
        <div key={i} className="result-chart-row">
          <span className="result-chart-label">{d.label}</span>
          <div className="result-chart-bar-wrap">
            <div
              className="result-chart-bar"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: colors[i % colors.length],
                animationDelay: `${i * 0.1}s`
              }}
            />
          </div>
          <span className="result-chart-val">₹{Number(d.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

function Tools() {
  useScrollReveal()

  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(10)
  const [compoundResult, setCompoundResult] = useState(null)

  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(60)
  const [monthlyContribution, setMonthlyContribution] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(10)
  const [retirementResult, setRetirementResult] = useState(null)

  const [monthlyExpenses, setMonthlyExpenses] = useState(50000)
  const [months, setMonths] = useState(6)
  const [emergencyResult, setEmergencyResult] = useState(null)

  const [loanAmount, setLoanAmount] = useState(2500000)
  const [loanRate, setLoanRate] = useState(8.5)
  const [loanYears, setLoanYears] = useState(20)
  const [loanResult, setLoanResult] = useState(null)

  const calculateCompound = () => {
    const amount = principal * Math.pow((1 + rate / 100), years)
    const interest = amount - principal
    setCompoundResult({ total: amount.toFixed(2), interest: interest.toFixed(2) })
  }

  const calculateRetirement = () => {
    const yearsLeft = retirementAge - currentAge
    const mr = expectedReturn / 100 / 12
    const nm = yearsLeft * 12
    const fv = monthlyContribution * ((Math.pow(1 + mr, nm) - 1) / mr)
    const contrib = monthlyContribution * nm
    setRetirementResult({
      total: fv.toFixed(2),
      contributions: contrib.toFixed(2),
      growth: (fv - contrib).toFixed(2)
    })
  }

  const calculateEmergency = () => {
    setEmergencyResult({ total: (monthlyExpenses * months).toFixed(2), months })
  }

  const calculateLoan = () => {
    const mr = loanRate / 100 / 12
    const np = loanYears * 12
    const emi = loanAmount * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1)
    const total = emi * np
    setLoanResult({
      monthlyPayment: emi.toFixed(2),
      totalPaid: total.toFixed(2),
      totalInterest: (total - loanAmount).toFixed(2)
    })
  }

  const fmt = (n) => Number(n).toLocaleString('en-IN')

  return (
    <div className="tools">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="tools-hero">
        <div className="tools-hero-grain" />
        <div className="tools-hero-orb" />
        <div className="tools-hero-content">
          <div className="tools-eyebrow">Financial Calculators</div>
          <h1>Plan Your<br /><span className="tools-title-accent">Financial Future</span></h1>
          <p>Powerful, India-specific calculators to help you make smarter money decisions — SIP returns, loan EMIs, retirement corpus, and more.</p>
        </div>
        <div className="tools-hero-stats">
          {[
            { n: '4', l: 'Calculators' },
            { n: '₹', l: 'India Specific' },
            { n: '∞', l: 'Free to Use' },
          ].map((s, i) => (
            <div key={i} className="tools-hero-stat">
              <div className="ths-number">{s.n}</div>
              <div className="ths-label">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULATORS ──────────────────────────────────── */}
      <section className="tools-content">
        <div className="tools-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="tools-section-eyebrow">Tools</div>
            <h2 className="tools-section-title">Calculate &amp; Plan</h2>
          </div>

          <div className="calculators-grid">

            {/* Compound Interest */}
            <div className="calculator-card reveal">
              <div className="calculator-header" style={{ background: 'linear-gradient(135deg, #1a3a28, #3a8a55)' }}>
                <div className="calc-header-icon"><TrendingUp size={24} /></div>
                <div>
                  <h2>Compound Interest</h2>
                  <p>See how your investment grows over time</p>
                </div>
              </div>
              <div className="calculator-body">
                <InputField label="Initial Investment (₹)" value={principal} onChange={setPrincipal} />
                <InputField label="Annual Interest Rate (%)" value={rate} onChange={setRate} step="0.1" />
                <InputField label="Investment Period (years)" value={years} onChange={setYears} />
                <button className="calc-button" onClick={calculateCompound}>Calculate Growth</button>
                {compoundResult && (
                  <div className="result-box">
                    <ResultChart
                      data={[
                        { label: 'Principal', value: Number(principal) },
                        { label: 'Interest', value: Number(compoundResult.interest) },
                        { label: 'Total', value: Number(compoundResult.total) },
                      ]}
                      colors={['#3a8a55', '#c9a84c', '#1a3a28']}
                    />
                    <div className="result-items">
                      <ResultItem label="Future Value" value={`₹${fmt(compoundResult.total)}`} highlight />
                      <ResultItem label="Total Interest Earned" value={`₹${fmt(compoundResult.interest)}`} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Retirement */}
            <div className="calculator-card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="calculator-header" style={{ background: 'linear-gradient(135deg, #245235, #52a86e)' }}>
                <div className="calc-header-icon"><PiggyBank size={24} /></div>
                <div>
                  <h2>Retirement Savings</h2>
                  <p>Plan your retirement corpus with SIP</p>
                </div>
              </div>
              <div className="calculator-body">
                <InputField label="Current Age" value={currentAge} onChange={setCurrentAge} />
                <InputField label="Retirement Age" value={retirementAge} onChange={setRetirementAge} />
                <InputField label="Monthly SIP Amount (₹)" value={monthlyContribution} onChange={setMonthlyContribution} />
                <InputField label="Expected Annual Return (%)" value={expectedReturn} onChange={setExpectedReturn} step="0.1" />
                <button className="calc-button" onClick={calculateRetirement}>Calculate Corpus</button>
                {retirementResult && (
                  <div className="result-box">
                    <ResultChart
                      data={[
                        { label: 'You Invest', value: Number(retirementResult.contributions) },
                        { label: 'Market Growth', value: Number(retirementResult.growth) },
                      ]}
                      colors={['#3a8a55', '#c9a84c']}
                    />
                    <div className="result-items">
                      <ResultItem label="Retirement Corpus" value={`₹${fmt(retirementResult.total)}`} highlight />
                      <ResultItem label="Your Contributions" value={`₹${fmt(retirementResult.contributions)}`} />
                      <ResultItem label="Market Growth" value={`₹${fmt(retirementResult.growth)}`} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Fund */}
            <div className="calculator-card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="calculator-header" style={{ background: 'linear-gradient(135deg, #92742a, #c9a84c)' }}>
                <div className="calc-header-icon"><Calculator size={24} /></div>
                <div>
                  <h2>Emergency Fund</h2>
                  <p>How much safety net do you need?</p>
                </div>
              </div>
              <div className="calculator-body">
                <InputField label="Monthly Expenses (₹)" value={monthlyExpenses} onChange={setMonthlyExpenses} />
                <InputField label="Months of Coverage" value={months} onChange={setMonths} />
                <button className="calc-button gold" onClick={calculateEmergency}>Calculate Fund</button>
                {emergencyResult && (
                  <div className="result-box gold">
                    <div className="emergency-visual">
                      {Array.from({ length: Math.min(emergencyResult.months, 12) }).map((_, i) => (
                        <div key={i} className="em-month" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="em-month-bar" style={{ height: `${(i + 1) * 8}px` }} />
                          <span>M{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="result-items">
                      <ResultItem label="Emergency Fund Needed" value={`₹${fmt(emergencyResult.total)}`} highlight />
                      <ResultItem label="Coverage Period" value={`${emergencyResult.months} months`} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loan EMI */}
            <div className="calculator-card reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="calculator-header" style={{ background: 'linear-gradient(135deg, #0f2318, #245235)' }}>
                <div className="calc-header-icon"><Home size={24} /></div>
                <div>
                  <h2>Loan EMI Calculator</h2>
                  <p>Home loan, car loan, personal loan</p>
                </div>
              </div>
              <div className="calculator-body">
                <InputField label="Loan Amount (₹)" value={loanAmount} onChange={setLoanAmount} />
                <InputField label="Interest Rate (% per year)" value={loanRate} onChange={setLoanRate} step="0.1" />
                <InputField label="Loan Tenure (years)" value={loanYears} onChange={setLoanYears} />
                <button className="calc-button dark" onClick={calculateLoan}>Calculate EMI</button>
                {loanResult && (
                  <div className="result-box dark">
                    <ResultChart
                      data={[
                        { label: 'Principal', value: Number(loanAmount) },
                        { label: 'Interest', value: Number(loanResult.totalInterest) },
                      ]}
                      colors={['#3a8a55', '#f87171']}
                    />
                    <div className="result-items">
                      <ResultItem label="Monthly EMI" value={`₹${fmt(loanResult.monthlyPayment)}`} highlight />
                      <ResultItem label="Total Amount Paid" value={`₹${fmt(loanResult.totalPaid)}`} />
                      <ResultItem label="Total Interest" value={`₹${fmt(loanResult.totalInterest)}`} warn />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}

function InputField({ label, value, onChange, step }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type="number"
        step={step || '1'}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ResultItem({ label, value, highlight, warn }) {
  return (
    <div className={`result-item ${highlight ? 'highlight' : ''} ${warn ? 'warn' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default Tools