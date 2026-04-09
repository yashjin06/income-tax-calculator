import React, { useEffect, useState } from 'react'
import CurrencyInput from './CurrencyInput'

const OtherSources = ({ data, updateData }) => {
  const isNewRegime = data?.personal?.newRegime === 'yes'
  const os = data.otherSources || {
    savingsInterest: 0,
    fdInterest: 0,
    dividend: 0,
    winnings: 0, // Taxed at flat 30%
    gifts: 0,
    agriculturalIncome: 0,
    familyPension: 0,
    otherIncome: 0,
    expenses: 0
  }

  const [totalOs, setTotalOs] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    const numValue = value === '' ? '' : parseFloat(value) || 0
    updateData({ ...data, otherSources: { ...os, [name]: numValue } })
  }

  useEffect(() => {
    const ay = data?.personal?.assessmentYear || '2024-25'
    let limit = 15000
    if (ay === '2025-26' || ay === '2026-27') {
      limit = 25000
    }

    const famPen = parseFloat(os.familyPension) || 0
    const famPenDed = Math.min(famPen / 3, limit)
    const netFamPen = famPen - famPenDed

    const total = (parseFloat(os.savingsInterest) || 0) + 
                  (parseFloat(os.fdInterest) || 0) + 
                  (parseFloat(os.dividend) || 0) + 
                  (parseFloat(os.winnings) || 0) + 
                  (parseFloat(os.gifts) || 0) + 
                  netFamPen +
                  (parseFloat(os.otherIncome) || 0) -
                  (parseFloat(os.expenses) || 0)
    
    setTotalOs(Math.round(Math.max(0, total))) // Generally can't be negative unless specific expenses allowed
  }, [os])

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Income from Other Sources</h2>
        <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          Net Income: ₹ {totalOs.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="card p-6 slide-up">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div className="input-group">
            <label className="input-label">Interest from Savings Bank</label>
            <CurrencyInput name="savingsInterest" className="input-field" value={os.savingsInterest || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>{isNewRegime ? "Not eligible for 80TTA/80TTB under New Regime" : "Eligible for 80TTA/80TTB"}</p>
          </div>

          <div className="input-group">
            <label className="input-label">Interest from Deposits (FD/RD/Post Office/PPF)</label>
            <CurrencyInput name="fdInterest" className="input-field" value={os.fdInterest || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Dividend Income</label>
            <CurrencyInput name="dividend" className="input-field" value={os.dividend || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Winnings from Lotteries, Puzzles, Games (Taxable @ 30%)</label>
            <CurrencyInput name="winnings" className="input-field" value={os.winnings || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Gifts Received (&gt; ₹50,000, Not from Relatives)</label>
            <CurrencyInput name="gifts" className="input-field" value={os.gifts || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Net Agricultural Income</label>
            <CurrencyInput name="agriculturalIncome" className="input-field" value={os.agriculturalIncome || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Used for Partial Integration rule</p>
          </div>

          <div className="input-group">
            <label className="input-label">Gross Family Pension Received</label>
            <CurrencyInput name="familyPension" className="input-field" value={os.familyPension || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--primary)'}}>
              Auto-deducting standard deduction of 1/3rd or ₹{(data?.personal?.assessmentYear === '2025-26' || data?.personal?.assessmentYear === '2026-27') ? '25,000' : '15,000'}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">Any Other Taxable Income</label>
            <CurrencyInput name="otherIncome" className="input-field" value={os.otherIncome || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: isNewRegime ? 'var(--text-muted)' : 'var(--danger)' }}>Less: Allowed Expenses (u/s 57)</label>
            <CurrencyInput name="expenses" className="input-field" value={os.expenses || ''} onChange={handleChange} placeholder="0" disabled={isNewRegime} />
            {isNewRegime && <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--danger)'}}>Not allowed under New Regime (Except Family Pension)</p>}
          </div>

        </div>
      </div>
    </div>
  )
}

export default OtherSources
