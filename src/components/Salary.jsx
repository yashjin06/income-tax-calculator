import React, { useEffect, useState } from 'react'

const Salary = ({ data, updateData }) => {
  const salData = data.salary || {
    basic: 0,
    da: 0,
    hra: 0,
    lta: 0,
    otherAllowances: 0,
    perquisites: 0,
    profitInLieu: 0,
    pt: 0, // Professional Tax
    entAllow: 0 // Entertainment Allowance (Govt only)
  }

  const [grossSalary, setGrossSalary] = useState(0)
  const [netSalary, setNetSalary] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    const numValue = value === '' ? '' : parseFloat(value) || 0
    updateData({ ...data, salary: { ...salData, [name]: numValue } })
  }

  useEffect(() => {
    const isNewRegime = data?.personal?.newRegime === 'yes'
    const ay = data?.personal?.assessmentYear || '2024-25'
    const isLatestBudget = ay === '2025-26' || ay === '2026-27'
    const maxStandardDeduction = (isNewRegime && isLatestBudget) ? 75000 : 50000

    const gross = (parseFloat(salData.basic) || 0) + 
                  (parseFloat(salData.da) || 0) + 
                  (parseFloat(salData.hra) || 0) + 
                  (parseFloat(salData.lta) || 0) + 
                  (parseFloat(salData.otherAllowances) || 0) + 
                  (parseFloat(salData.perquisites) || 0) + 
                  (parseFloat(salData.profitInLieu) || 0)
    
    setGrossSalary(gross)
    
    const standardDeduction = Math.min(maxStandardDeduction, gross)
    const pt = parseFloat(salData.pt) || 0
    const entAllow = parseFloat(salData.entAllow) || 0
    
    const net = Math.max(0, gross - standardDeduction - pt - entAllow)
    setNetSalary(net)
  }, [salData, data?.personal?.newRegime, data?.personal?.assessmentYear])

  return (
    <div className="fade-in">
      <div className="card p-6 mb-6 slide-up">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-xl font-bold">Income from Salary</h2>
          <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            Net Taxable Salary: ₹ {netSalary.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--input-border)' }}>
          <div className="input-group">
            <label className="input-label">Employer Name</label>
            <input type="text" name="employerName" className="input-field" value={salData.employerName || ''} onChange={handleChange} placeholder="Company Name" />
          </div>
          <div className="input-group">
            <label className="input-label">Employer TAN</label>
            <input type="text" name="employerTan" className="input-field" value={salData.employerTan || ''} onChange={handleChange} placeholder="e.g. DELC12345F" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="input-group">
            <label className="input-label">Employer Type</label>
            <select name="employerType" className="input-field" value={salData.employerType || 'private'} onChange={handleChange}>
              <option value="private">Private Sector</option>
              <option value="govt">Central / State Government</option>
              <option value="psu">Public Sector Undertaking (PSU)</option>
              <option value="pensioners">Pensioners</option>
              <option value="other">Others</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Basic Salary</label>
            <input type="number" name="basic" className="input-field" value={salData.basic || ''} onChange={handleChange} placeholder="0" />
          </div>
          
          <div className="input-group">
            <label className="input-label">Dearness Allowance (DA)</label>
            <input type="number" name="da" className="input-field" value={salData.da || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">House Rent Allowance (HRA) (Taxable Portion)</label>
            <input type="number" name="hra" className="input-field" value={salData.hra || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Leave Travel Allowance (LTA) (Taxable)</label>
            <input type="number" name="lta" className="input-field" value={salData.lta || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Other Taxable Allowances</label>
            <input type="number" name="otherAllowances" className="input-field" value={salData.otherAllowances || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Perquisites (Value as per rule 3)</label>
            <input type="number" name="perquisites" className="input-field" value={salData.perquisites || ''} onChange={handleChange} placeholder="0" />
          </div>

          <div className="input-group">
            <label className="input-label">Profit in lieu of Salary</label>
            <input type="number" name="profitInLieu" className="input-field" value={salData.profitInLieu || ''} onChange={handleChange} placeholder="0" />
          </div>
        </div>
      </div>

      <div className="card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1.5rem' }}>Deductions u/s 16</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Standard Deduction u/s 16(ia)</label>
            <input type="text" className="input-field" value={"₹ " + (Math.min((data?.personal?.newRegime === 'yes' && (data?.personal?.assessmentYear === '2025-26' || data?.personal?.assessmentYear === '2026-27')) ? 75000 : 50000, grossSalary)).toLocaleString('en-IN')} disabled />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Auto-calculated (Max ₹{((data?.personal?.newRegime === 'yes' && (data?.personal?.assessmentYear === '2025-26' || data?.personal?.assessmentYear === '2026-27')) ? 75000 : 50000).toLocaleString('en-IN')})</p>
          </div>

          <div className="input-group">
            <label className="input-label">Entertainment Allowance u/s 16(ii)</label>
            <input type="number" name="entAllow" className="input-field" value={salData.entAllow || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Only for Govt Employees</p>
          </div>

          <div className="input-group">
            <label className="input-label">Professional Tax u/s 16(iii)</label>
            <input type="number" name="pt" className="input-field" value={salData.pt || ''} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--input-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--input-border)' }}>
            <span>Gross Salary</span>
            <span style={{ fontWeight: 500 }}>₹ {grossSalary.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', color: 'var(--danger)' }}>
            <span>Total Deductions</span>
            <span style={{ fontWeight: 500 }}>- ₹ {(Math.min((data?.personal?.newRegime === 'yes' && (data?.personal?.assessmentYear === '2025-26' || data?.personal?.assessmentYear === '2026-27')) ? 75000 : 50000, grossSalary) + (parseFloat(salData.pt) || 0) + (parseFloat(salData.entAllow) || 0)).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '0.5rem', borderTop: '2px solid var(--input-border)', fontSize: '1.125rem', color: 'var(--primary)' }}>
            <strong>Income Chargeable under head 'Salaries'</strong>
            <strong>₹ {netSalary.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Salary
