import React, { useMemo } from 'react'
import { computeTax } from '../computation/taxEngine'

const TaxComputation = ({ data }) => {
  const isNewRegime = data.personal?.newRegime === 'yes'
  
  // Compute both regimes for comparison
  const oldRegimeData = useMemo(() => ({ ...data, personal: { ...data.personal, newRegime: 'no' } }), [data])
  const newRegimeData = useMemo(() => ({ ...data, personal: { ...data.personal, newRegime: 'yes' } }), [data])
  
  const oldResults = useMemo(() => computeTax(oldRegimeData), [oldRegimeData])
  const newResults = useMemo(() => computeTax(newRegimeData), [newRegimeData])

  // Current selected results for detailed output
  const results = isNewRegime ? newResults : oldResults

  const oldTax = oldResults.totalTaxLiability
  const newTax = newResults.totalTaxLiability
  const savings = Math.abs(oldTax - newTax)
  const isSame = oldTax === newTax
  const betterRegime = oldTax < newTax ? 'Old Regime' : (newTax < oldTax ? 'New Regime' : 'Both')

  return (
    <div className="fade-in">
      {/* Comparative Summary Widget */}
      <div className="card slide-up" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Tax Liability Summary</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>Old Regime</p>
            <p style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-main)' }}>₹ {oldTax.toLocaleString('en-IN')}</p>
          </div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>
            vs
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>New Regime</p>
            <p style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-main)' }}>₹ {newTax.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div style={{ 
          background: isSame ? 'var(--glass-bg)' : '#E8F5E9', 
          color: isSame ? 'var(--text-main)' : '#059669', 
          padding: '1.25rem 2rem', 
          borderRadius: 'var(--radius-lg)', 
          display: 'inline-block',
          minWidth: '280px',
          boxShadow: isSame ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            {isSame ? 'No Difference' : `You save overall`}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            ₹ {savings.toLocaleString('en-IN')}
          </div>
          {!isSame && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8, fontWeight: 500 }}>
               by choosing {betterRegime}
            </div>
          )}
        </div>
      </div>

      {/* Smart Insights (AI-Powered) */}
      <div className="card slide-up" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--glass-bg)', borderLeft: '4px solid var(--primary)', animationDelay: '0.1s' }}>
        <h3 className="text-xl font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-hover)' }}>
           💡 Smart Pro Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
             <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600 }}>Effective Tax Rate</p>
             <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {results.grossTotalIncome > 0 ? ((results.totalTaxLiability / results.grossTotalIncome) * 100).toFixed(2) : 0}%
             </p>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Percentage of gross income paid in tax.</p>
          </div>

          {!isNewRegime && (parseFloat(data.deductions?.sec80c) || 0) < 150000 && (
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <p style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Maximize Section 80C</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                   You have utilized ₹{(parseFloat(data.deductions?.sec80c) || 0).toLocaleString('en-IN')} of your ₹1.5L Sec 80C limit. Investing the remaining ₹{(150000 - (parseFloat(data.deductions?.sec80c) || 0)).toLocaleString('en-IN')} could map to direct tax savings!
                </p>
             </div>
          )}

          {isNewRegime && (parseFloat(data.deductions?.sec80ccd2) || 0) === 0 && (parseFloat(data.salary?.basic) > 0) && (
             <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <p style={{ color: '#d97706', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Pro Tip: NPS u/s 80CCD(2)</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                   Even in the New Regime, Employer contributions to NPS are fully deductible up to 10% (or 14%) of Basic Salary. Restructure your CTC to utilize this loophole!
                </p>
             </div>
          )}

          {betterRegime !== (isNewRegime ? 'New Regime' : 'Old Regime') && betterRegime !== 'Both' && (
             <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Regime Optimization Alert</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                   You have selected the {isNewRegime ? 'New' : 'Old'} Regime, but you can save ₹{savings.toLocaleString('en-IN')} simply by switching your regime preference to the {betterRegime}.
                </p>
             </div>
          )}

        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Detailed Computation ({isNewRegime ? 'New' : 'Old'} Regime)</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <span className="badge" style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: isNewRegime ? 'var(--primary)' : 'var(--warning)', color: 'white', fontSize: '0.875rem' }}>
             Selected: {isNewRegime ? 'New Regime (Sec 115BAC)' : 'Old Tax Regime'}
           </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem' }}>
        
        {/* Income Sources Summary */}
        <div className="card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-bold mb-4" style={{ borderBottom: '2px solid var(--input-border)', paddingBottom: '0.5rem' }}>Gross Total Income (Head-wise)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Income from Salary</span>
              <span style={{ fontWeight: 500 }}>₹ {results.netSalary.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Income from House Property</span>
              <span style={{ fontWeight: 500 }}>₹ {results.netHouseProperty.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>3. Profits and Gains of Business/Profession</span>
              <span style={{ fontWeight: 500 }}>₹ {results.netPGBP.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>4. Capital Gains (Short & Long Term)</span>
              <span style={{ fontWeight: 500 }}>₹ {(results.stcg + results.ltcg).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>5. Income from Other Sources</span>
              <span style={{ fontWeight: 500 }}>₹ {results.netOtherSources.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--input-border)', fontWeight: 'bold', fontSize: '1.125rem' }}>
              <span>Gross Total Income (GTI)</span>
              <span>₹ {results.grossTotalIncome.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', paddingTop: '0.5rem' }}>
              <span>Less: Chapter VI-A Deductions</span>
              <span>(₹ {results.totalDeductions.toLocaleString('en-IN')})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '2px solid var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
              <span>Total Taxable Income</span>
              <span>₹ {results.totalTaxableIncome.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>*Rounded off globally in computation engine</div>
          </div>
        </div>

        {/* Tax Liability Summary */}
        <div className="card p-6 slide-up" style={{ animationDelay: '0.2s', background: 'var(--bg-gradient-start)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ borderBottom: '2px solid rgba(79, 70, 229, 0.2)', paddingBottom: '0.5rem', color: 'var(--primary-hover)' }}>Tax Liability Computation</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Tax on Normal Income</span>
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>₹ {Math.round(results.normalTax).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Tax on Special Rates (Cap Gains, Winnings)</span>
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>₹ {Math.round(results.specialTax).toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(79, 70, 229, 0.3)', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Tax Before Rebate</span>
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>₹ {Math.round(results.totalTaxBeforeRebate).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Less: Rebate u/s 87A</span>
              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>(₹ {Math.round(results.rebate).toLocaleString('en-IN')})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Add: Surcharge</span>
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>₹ {Math.round(results.surcharge).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Add: Health & Education Cess @ 4%</span>
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>₹ {Math.round(results.cess).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', paddingBottom: '0.5rem', borderTop: '2px solid var(--primary)', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--dark)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-sm)', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '1rem' }}>Net Tax Payable</span>
              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>₹ {Math.round(results.totalTaxLiability).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* High Income Schedule AL Disclosure Warning */}
      {results.totalTaxableIncome > 5000000 && (
        <div className="card p-6 slide-up" style={{ marginTop: '2rem', borderLeft: '4px solid #d97706', animationDelay: '0.3s' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Mandatory AL Schedule Disclosure
          </h3>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Because your Total Taxable Income strictly exceeds <strong>₹50 Lakhs</strong>, you are legally mandated to furnish <strong>Schedule AL (Assets and Liabilities)</strong> during your ITR filing.
          </p>
          <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'disc', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Immovable Assets:</strong> You must disclose the original cost of land and buildings.</li>
            <li><strong>Movable Assets:</strong> Disclose all financial assets (shares, securities, mutual funds, bank balances, insurances), jewelry, bullion, vehicles, yachts, boats, and aircrafts.</li>
            <li><strong>Liabilities:</strong> Any loans or liabilities specifically incurred in relation to acquiring these assets must also be reported.</li>
          </ul>
        </div>
      )}

    </div>
  )
}

export default TaxComputation
