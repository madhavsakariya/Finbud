import { useState } from 'react'
import { Calculator, TrendingUp, PiggyBank, Home, CreditCard } from 'lucide-react'
import './tools.css'

function Tools() {
  // Compound Interest Calculator State
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(10)
  const [compoundResult, setCompoundResult] = useState(null)

  // Retirement Calculator State
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(60)
  const [monthlyContribution, setMonthlyContribution] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(10)
  const [retirementResult, setRetirementResult] = useState(null)

  // Emergency Fund Calculator State
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000)
  const [months, setMonths] = useState(6)
  const [emergencyResult, setEmergencyResult] = useState(null)

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(2500000)
  const [loanRate, setLoanRate] = useState(8.5)
  const [loanYears, setLoanYears] = useState(20)
  const [loanResult, setLoanResult] = useState(null)

  // Calculate Compound Interest
  const calculateCompound = () => {
    const amount = principal * Math.pow((1 + rate / 100), years)
    const interest = amount - principal
    setCompoundResult({
      total: amount.toFixed(2),
      interest: interest.toFixed(2)
    })
  }

  // Calculate Retirement Savings
  const calculateRetirement = () => {
    const yearsToRetirement = retirementAge - currentAge
    const monthlyRate = expectedReturn / 100 / 12
    const totalMonths = yearsToRetirement * 12
    
    const futureValue = monthlyContribution * (
      (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
    )
    
    setRetirementResult({
      total: futureValue.toFixed(2),
      contributions: (monthlyContribution * totalMonths).toFixed(2),
      growth: (futureValue - monthlyContribution * totalMonths).toFixed(2)
    })
  }

  // Calculate Emergency Fund
  const calculateEmergency = () => {
    const total = monthlyExpenses * months
    setEmergencyResult({
      total: total.toFixed(2),
      months: months
    })
  }

  // Calculate Loan Payment
  const calculateLoan = () => {
    const monthlyRate = loanRate / 100 / 12
    const numPayments = loanYears * 12
    
    const monthlyPayment = loanAmount * (
      monthlyRate * Math.pow(1 + monthlyRate, numPayments)
    ) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    const totalPaid = monthlyPayment * numPayments
    const totalInterest = totalPaid - loanAmount
    
    setLoanResult({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    })
  }

  return (
    <div className="tools">
      {/* Header */}
      <section className="tools-header">
        <div className="tools-header-content">
          <h1>Financial Calculators</h1>
          <p>Plan your financial future with our powerful calculation tools</p>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="tools-content">
        <div className="calculators-grid">
          
          {/* Compound Interest Calculator */}
          <div className="calculator-card">
            <div className="calculator-header">
              <div className="calculator-icon" style={{background: '#667eea'}}>
                <TrendingUp />
              </div>
              <h2>Compound Interest Calculator</h2>
            </div>
            <div className="calculator-body">
              <div className="input-group">
                <label>Initial Investment (₹)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Investment Period (years)</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                />
              </div>
              <button className="calc-button" onClick={calculateCompound}>
                Calculate
              </button>
              {compoundResult && (
                <div className="result-box">
                  <div className="result-item">
                    <span>Future Value:</span>
                    <strong>₹{Number(compoundResult.total).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="result-item">
                    <span>Total Interest:</span>
                    <strong>₹{Number(compoundResult.interest).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Retirement Calculator */}
          <div className="calculator-card">
            <div className="calculator-header">
              <div className="calculator-icon" style={{background: '#f093fb'}}>
                <PiggyBank />
              </div>
              <h2>Retirement Savings Calculator</h2>
            </div>
            <div className="calculator-body">
              <div className="input-group">
                <label>Current Age</label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Retirement Age</label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Monthly Contribution (₹)</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Expected Annual Return (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                />
              </div>
              <button className="calc-button" onClick={calculateRetirement}>
                Calculate
              </button>
              {retirementResult && (
                <div className="result-box">
                  <div className="result-item">
                    <span>Total at Retirement:</span>
                    <strong>₹{Number(retirementResult.total).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="result-item">
                    <span>Your Contributions:</span>
                    <strong>₹{Number(retirementResult.contributions).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="result-item">
                    <span>Investment Growth:</span>
                    <strong>₹{Number(retirementResult.growth).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Fund Calculator */}
          <div className="calculator-card">
            <div className="calculator-header">
              <div className="calculator-icon" style={{background: '#43e97b'}}>
                <Calculator />
              </div>
              <h2>Emergency Fund Calculator</h2>
            </div>
            <div className="calculator-body">
              <div className="input-group">
                <label>Monthly Expenses (₹)</label>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Months of Coverage</label>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                />
              </div>
              <button className="calc-button" onClick={calculateEmergency}>
                Calculate
              </button>
              {emergencyResult && (
                <div className="result-box">
                  <div className="result-item">
                    <span>Emergency Fund Needed:</span>
                    <strong>₹{Number(emergencyResult.total).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="result-item">
                    <span>Coverage Period:</span>
                    <strong>{emergencyResult.months} months</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loan Payment Calculator */}
          <div className="calculator-card">
            <div className="calculator-header">
              <div className="calculator-icon" style={{background: '#4facfe'}}>
                <Home />
              </div>
              <h2>Loan Payment Calculator</h2>
            </div>
            <div className="calculator-body">
              <div className="input-group">
                <label>Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Loan Term (years)</label>
                <input
                  type="number"
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                />
              </div>
              <button className="calc-button" onClick={calculateLoan}>
                Calculate
              </button>
              {loanResult && (
                <div className="result-box">
                  <div className="result-item">
                    <span>Monthly Payment:</span>
                    <strong>₹{Number(loanResult.monthlyPayment).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="result-item">
                    <span>Total Amount Paid:</span>
                    <strong>₹{Number(loanResult.totalPaid).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="result-item">
                    <span>Total Interest:</span>
                    <strong>₹{Number(loanResult.totalInterest).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default Tools