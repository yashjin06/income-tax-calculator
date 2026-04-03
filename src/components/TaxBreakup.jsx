import React, { useMemo } from 'react'
import { computeTax } from '../computation/taxEngine'

const TaxBreakup = ({ data }) => {
  const results = useMemo(() => computeTax(data), [data])

  return (
    <div className="fade-in">
      <div className="header-banner slide-up">
        <div>
          <h1>Tax Calculation Breakup</h1>
          <p>Detailed slab-wise breakdown of your computed Tax Liability.</p>
        </div>
      </div>

      <div className="card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold mb-6">Slab-wise Normal Tax Computation</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--glass-bg)', borderBottom: '2px solid var(--input-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Income Slab</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tax Rate</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Income in Slab (₹)</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Tax Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {results.taxBreakup && results.taxBreakup.length > 0 ? (
                results.taxBreakup.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--input-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{row.slab}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {row.rate}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.05rem' }}>{row.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.05rem', color: row.tax > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{row.tax.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No taxable normal income to compute.</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--glass-bg)', borderTop: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}>
                <td colSpan="2" style={{ padding: '1.25rem 1rem', textAlign: 'left', borderRadius: '0 0 0 var(--radius-md)' }}>TOTAL NORMAL TAX</td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.15rem' }}>{results.taxableNormalIncome > 0 ? results.taxableNormalIncome.toLocaleString('en-IN') : '0'}</td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.15rem', borderRadius: '0 0 var(--radius-md) 0' }}>{results.normalTax.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card p-6 mt-6 slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold mb-4">Special Taxes & Adjustments</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {results.specialTaxBreakup && results.specialTaxBreakup.length > 0 ? (
             <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--input-border)', fontWeight: 600, background: 'rgba(0,0,0,0.02)' }}>
                   Tax on Special Incomes Breakdown
                </div>
                {results.specialTaxBreakup.map((item, idx) => (
                   <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx < results.specialTaxBreakup.length - 1 ? '1px dashed var(--input-border)' : 'none', opacity: 0.9 }}>
                      <span>{item.label} <span style={{fontSize:'0.85em', opacity: 0.7}}>({item.amount.toLocaleString('en-IN')} ₹)</span></span>
                      <span style={{ fontFamily: 'monospace' }}>+ ₹ {item.tax.toLocaleString('en-IN')}</span>
                   </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(79, 70, 229, 0.05)', borderTop: '1px solid var(--input-border)' }}>
                   <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Total Special Tax</span>
                   <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}>+ ₹ {results.specialTax.toLocaleString('en-IN')}</span>
                </div>
             </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)' }}>
              <span style={{ fontWeight: 500 }}>Tax on Special Incomes (Capital Gains, Winnings)</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>+ ₹ 0</span>
            </div>
          )}

          <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ fontWeight: 500 }}>Less: Rebate u/s 87A</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--success)' }}>(₹ {Math.round(results.rebate).toLocaleString('en-IN')})</span>
            </div>
            {results.rebate > 0 && (
               <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', borderTop: '1px dashed var(--input-border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                 Calculated on applicable income below threshold (incl. Marginal Relief if any)
               </div>
            )}
          </div>

          <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ fontWeight: 500 }}>Add: Surcharge</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--danger)' }}>+ ₹ {Math.round(results.surcharge).toLocaleString('en-IN')}</span>
            </div>
            {results.surcharge > 0 && results.surchargeBreakup && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', borderTop: '1px dashed var(--input-border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {results.surchargeBreakup.amountNormal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>On Normal Tax @ {(results.surchargeBreakup.rateNormal * 100).toFixed(0)}%</span><span>₹ {Math.round(results.surchargeBreakup.amountNormal).toLocaleString('en-IN')}</span></div>}
                {results.surchargeBreakup.amountSpecial > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>On Special Tax @ {(results.surchargeBreakup.rateSpecial * 100).toFixed(0)}%</span><span>₹ {Math.round(results.surchargeBreakup.amountSpecial).toLocaleString('en-IN')}</span></div>}
                {results.surchargeBreakup.marginalRelief > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}><span>Less: Marginal Relief</span><span>(₹ {Math.round(results.surchargeBreakup.marginalRelief).toLocaleString('en-IN')})</span></div>}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ fontWeight: 500 }}>Add: Health & Education Cess (4%)</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--danger)' }}>+ ₹ {Math.round(results.cess).toLocaleString('en-IN')}</span>
            </div>
            {results.cess > 0 && (
               <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', borderTop: '1px dashed var(--input-border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Calculated on (Tax + Surcharge) value of ₹ {Math.round(results.taxPlusSurcharge).toLocaleString('en-IN')}</span>
                  </div>
               </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--glass-bg)', borderTop: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)', marginTop: '0.5rem', boxShadow: 'var(--shadow-sm)', fontWeight: 'bold' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>GROSS TAX LIABILITY</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>₹ {results.totalTaxLiability.toLocaleString('en-IN')}</span>
          </div>

          {(results.tdsPaid > 0 || results.advanceTaxPaid > 0 || results.selfAssessmentTaxPaid > 0) && (
             <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', overflow: 'hidden', marginTop: '1rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--input-border)', fontWeight: 600, background: 'rgba(0,0,0,0.02)' }}>
                   Less: Taxes Already Paid
                </div>
                {results.tdsPaid > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px dashed var(--input-border)' }}><span>TDS / TCS</span><span style={{ color: 'var(--success)', fontFamily: 'monospace' }}>- ₹ {results.tdsPaid.toLocaleString('en-IN')}</span></div>}
                {results.advanceTaxPaid > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px dashed var(--input-border)' }}><span>Advance Tax</span><span style={{ color: 'var(--success)', fontFamily: 'monospace' }}>- ₹ {results.advanceTaxPaid.toLocaleString('en-IN')}</span></div>}
                {results.selfAssessmentTaxPaid > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem' }}><span>Self Assessment Tax</span><span style={{ color: 'var(--success)', fontFamily: 'monospace' }}>- ₹ {results.selfAssessmentTaxPaid.toLocaleString('en-IN')}</span></div>}
             </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: results.netTaxPayable < 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--glass-bg)', color: results.netTaxPayable < 0 ? 'var(--success)' : 'var(--primary)', borderRadius: 'var(--radius-lg)', marginTop: '0.5rem', fontWeight: 'bold', borderTop: `2px solid ${results.netTaxPayable < 0 ? 'var(--success)' : 'var(--primary)'}` }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{results.netTaxPayable < 0 ? 'REFUND DUE' : 'FINAL NET TAX PAYABLE'}</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>₹ {Math.abs(results.netTaxPayable).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxBreakup
