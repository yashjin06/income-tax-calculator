import React, { useEffect, useState } from 'react'

const HouseProperty = ({ data, updateData }) => {
  const [properties, setProperties] = useState(data.houseProperty || [])
  const [totalNetIncome, setTotalNetIncome] = useState(0)

  // Initialize with one property if empty
  useEffect(() => {
    if (properties.length === 0) {
      addProperty()
    }
  }, [])

  useEffect(() => {
    // Update main state and calculate total net income
    updateData({ ...data, houseProperty: properties })
    
    let total = 0
    properties.forEach(p => {
       const income = calculatePropertyIncome(p)
       total += income
    })
    setTotalNetIncome(total)
  }, [properties])

  const addProperty = () => {
    const newProp = {
      id: Date.now(),
      type: 'self-occupied',
      grossAnnualValue: 0,
      municipalTaxes: 0,
      standardDeduction: 0,
      interestOnLoan: 0,
      totalPreConstructionInterest: 0,
      ownershipShare: 100
    }
    setProperties([...properties, newProp])
  }

  const removeProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id))
  }

  const handleChange = (id, field, value) => {
    let numValue = field === 'type' ? value : (value === '' ? '' : parseFloat(value) || 0)
    
    if (field === 'ownershipShare') {
      if (numValue !== '') {
        if (numValue > 100) numValue = 100
        if (numValue < 0) numValue = 0
      }
    }

    setProperties(properties.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: numValue }
        
        // Auto-calculate Standard Deduction (30% of Net Annual Value)
        if (updated.type === 'let-out' || updated.type === 'deemed-let-out') {
           const nav = Math.max(0, (parseFloat(updated.grossAnnualValue) || 0) - (parseFloat(updated.municipalTaxes) || 0))
           updated.standardDeduction = nav * 0.3
        } else {
           updated.grossAnnualValue = 0
           updated.municipalTaxes = 0
           updated.standardDeduction = 0
        }
        return updated
      }
      return p
    }))
  }

  const calculatePropertyIncome = (p) => {
    const share = (parseFloat(p.ownershipShare) || 100) / 100
    const regularInterest = (parseFloat(p.interestOnLoan) || 0) * share
    const preConInterest = ((parseFloat(p.totalPreConstructionInterest) || 0) / 5) * share

    if (p.type === 'self-occupied') {
      // NAV is Nil, only interest deduction is allowed (Max 2 Lakhs, handled in tax Engine)
      return - (regularInterest + preConInterest)
    } else {
      const gav = (parseFloat(p.grossAnnualValue) || 0) * share
      const taxes = (parseFloat(p.municipalTaxes) || 0) * share
      const nav = Math.max(0, gav - taxes)
      const stdDed = nav * 0.3 // 30% standard deduction
      return nav - stdDed - (regularInterest + preConInterest)
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Income from House Property</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            Net Income: ₹ {totalNetIncome.toLocaleString('en-IN')}
          </div>
          <button onClick={addProperty} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>+ Add Property</button>
        </div>
      </div>

      {properties.map((prop, index) => {
        const nav = prop.type === 'self-occupied' ? 0 : Math.max(0, (parseFloat(prop.grossAnnualValue) || 0) - (parseFloat(prop.municipalTaxes) || 0))
        const income = calculatePropertyIncome(prop)
        
        return (
          <div key={prop.id} className="card p-6 mb-6 slide-up" style={{ animationDelay: `${index * 0.1}s`, borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="text-lg font-bold">Property {index + 1}</h3>
              {properties.length > 1 && (
                <button onClick={() => removeProperty(prop.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Remove</button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Property Type</label>
                <select 
                  className="input-field" 
                  value={prop.type} 
                  onChange={(e) => handleChange(prop.id, 'type', e.target.value)}
                >
                  <option value="self-occupied">Self Occupied</option>
                  <option value="let-out">Let Out</option>
                  <option value="deemed-let-out">Deemed Let Out</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Your Ownership Share (%)</label>
                <input type="number" className="input-field" value={prop.ownershipShare !== undefined ? prop.ownershipShare : 100} onChange={(e) => handleChange(prop.id, 'ownershipShare', e.target.value)} placeholder="100" min="0" max="100" />
              </div>

              {prop.type !== 'self-occupied' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Gross Annual Value (GAV)</label>
                    <input type="number" className="input-field" value={prop.grossAnnualValue || ''} onChange={(e) => handleChange(prop.id, 'grossAnnualValue', e.target.value)} placeholder="0" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Municipal Taxes Paid</label>
                    <input type="number" className="input-field" value={prop.municipalTaxes || ''} onChange={(e) => handleChange(prop.id, 'municipalTaxes', e.target.value)} placeholder="0" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Net Annual Value (NAV)</label>
                    <input type="text" className="input-field" value={"₹ " + nav.toLocaleString('en-IN')} disabled />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Standard Deduction @ 30%</label>
                    <input type="text" className="input-field" value={"₹ " + (prop.standardDeduction || 0).toLocaleString('en-IN')} disabled />
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label">Interest on Borrowed Capital (u/s 24b)</label>
                <input type="number" className="input-field" value={prop.interestOnLoan || ''} onChange={(e) => handleChange(prop.id, 'interestOnLoan', e.target.value)} placeholder="0" />
                {prop.type === 'self-occupied' && <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Max ₹2,000,000 allowance</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Total Pre-construction Interest</label>
                <input type="number" className="input-field" value={prop.totalPreConstructionInterest || ''} onChange={(e) => handleChange(prop.id, 'totalPreConstructionInterest', e.target.value)} placeholder="0" />
                <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Auto-applies 1/5th deduction for this year</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--input-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: income >= 0 ? 'var(--dark)' : 'var(--danger)' }}>
                Income from Property {index + 1}: ₹ {income.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )
      })}

      <div className="card p-6" style={{ background: 'var(--glass-bg)', borderTop: '2px solid var(--primary)', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="text-lg" style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)', fontWeight: 'bold' }}>Income Chargeable under head 'House Property'</h3>
          <span style={{ fontSize: '1.5rem', color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)', fontWeight: 'bold' }}>₹ {totalNetIncome.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}

export default HouseProperty
