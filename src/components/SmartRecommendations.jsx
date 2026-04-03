import React, { useState, useEffect } from 'react'
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, PieChart, ShieldCheck } from 'lucide-react'
import { computeTax } from '../computation/taxEngine'

const SmartRecommendations = ({ data }) => {
  const [insights, setInsights] = useState([])
  const [regimeComparison, setRegimeComparison] = useState({ oldTax: 0, newTax: 0, best: '' })

  useEffect(() => {
    // 1. Regime Comparison
    const oldData = { ...data, personal: { ...data.personal, newRegime: 'no' } }
    const newData = { ...data, personal: { ...data.personal, newRegime: 'yes' } }

    const oldResult = computeTax(oldData)
    const newResult = computeTax(newData)

    setRegimeComparison({
      oldTax: oldResult.totalTaxLiability,
      newTax: newResult.totalTaxLiability,
      best: oldResult.totalTaxLiability < newResult.totalTaxLiability ? 'Old Regime' : newResult.totalTaxLiability < oldResult.totalTaxLiability ? 'New Regime' : 'Both Same'
    })

    // 2. Generate Smart Insights
    const newInsights = []
    
    // a. 80C Optimization (Only applicable if Old Regime is at least competitive or user explicitly wants it)
    const current80C = (parseFloat(data.deductions?.sec80c) || 0) + (parseFloat(data.deductions?.sec80ccc) || 0) + (parseFloat(data.deductions?.sec80ccd1) || 0)
    if (oldResult.totalTaxLiability <= newResult.totalTaxLiability + 50000) { // If old regime is somewhat close
      if (current80C < 150000) {
        const gap = 150000 - current80C
        // calculate marginal tax rate under old regime
        const marginalRate = oldResult.totalTaxableIncome > 1000000 ? 0.312 : oldResult.totalTaxableIncome > 500000 ? 0.208 : 0.052
        const potentialSavings = Math.round(gap * marginalRate)
        if (potentialSavings > 0) {
           newInsights.push({
             type: 'opportunity',
             title: 'Maximize Section 80C Limit',
             desc: `You have only utilized ₹${current80C.toLocaleString('en-IN')} out of your ₹1.5L limit under Section 80C. Invest the remaining ₹${gap.toLocaleString('en-IN')} in ELSS or PPF to save an estimated ₹${potentialSavings.toLocaleString('en-IN')} in taxes under the Old Regime.`,
             icon: <TrendingUp size={24} color="var(--success)" />
           })
        }
      }
    }

    // b. NPS 80CCD(1B) Optimization
    const currentNPS = parseFloat(data.deductions?.sec80ccd1b) || 0
    if (currentNPS < 50000 && oldResult.totalTaxLiability <= newResult.totalTaxLiability + 20000) {
        const marginalRate = oldResult.totalTaxableIncome > 1000000 ? 0.312 : oldResult.totalTaxableIncome > 500000 ? 0.208 : 0.052
        const gap = 50000 - currentNPS
        const potentialSavings = Math.round(gap * marginalRate)
        if (potentialSavings > 0) {
          newInsights.push({
            type: 'opportunity',
            title: 'Additional ₹50,000 NPS Deduction',
            desc: `Invest ₹${gap.toLocaleString('en-IN')} more in NPS Tier 1 to claim extra deduction under 80CCD(1B) and save up to ₹${potentialSavings.toLocaleString('en-IN')}.`,
            icon: <ShieldCheck size={24} color="var(--primary)" />
          })
        }
    }

    // c. Health Insurance 80D
    const healthIns = (parseFloat(data.deductions?.sec80d) || 0)
    if (healthIns === 0 && data.personal.newRegime === 'no') {
       newInsights.push({
         type: 'warning',
         title: 'No Health Insurance Declared',
         desc: `You haven't claimed any deduction under Section 80D. Buying a health insurance policy for yourself and your parents can save you up to ₹75,000 in deductions.`,
         icon: <AlertTriangle size={24} color="var(--warning)" />
       })
    }

    if (newInsights.length === 0) {
       newInsights.push({
         type: 'success',
         title: 'Your taxes are highly optimized!',
         desc: `We couldn't find any obvious deductions you're missing out on. Great job planning your finances!`,
         icon: <CheckCircle size={24} color="var(--success)" />
       })
    }
    
    setInsights(newInsights)

  }, [data])

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Smart Tax Optimization Engine</h2>
        <div style={{ padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
          AI Planner Active
        </div>
      </div>

      <div className="card p-6 mb-6 slide-up" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart color="var(--primary)" /> Old vs New Regime Analysis
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Old Regime Tax Liability</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: regimeComparison.best === 'Old Regime' ? 'var(--success)' : 'var(--text-main)' }}>
              ₹ {regimeComparison.oldTax.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>New Regime Tax Liability</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: regimeComparison.best === 'New Regime' ? 'var(--success)' : 'var(--text-main)' }}>
              ₹ {regimeComparison.newTax.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '1.1rem' }}>
          💡 Recommendation: You should opt for the <span style={{ color: 'var(--primary)' }}>{regimeComparison.best}</span>. 
          {regimeComparison.oldTax !== regimeComparison.newTax && (
            <span> Opting for this regime saves you ₹ {Math.abs(regimeComparison.oldTax - regimeComparison.newTax).toLocaleString('en-IN')} in taxes!</span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 mt-8">Personalized Investment Insights</h3>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {insights.map((insight, idx) => (
          <div key={idx} className="card slide-up" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: `4px solid ${insight.type === 'opportunity' ? 'var(--success)' : insight.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}` }}>
             <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '50%' }}>
               {insight.icon}
             </div>
             <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{insight.title}</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{insight.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SmartRecommendations
