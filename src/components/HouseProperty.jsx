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
      preConstructionInterest: 0
    }
    setProperties([...properties, newProp])
  }

  const removeProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id))
  }

  const handleChange = (id, field, value) => {
    const numValue = field === 'type' ? value : (value === '' ? '' : parseFloat(value) || 0)
    
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
    if (p.type === 'self-occupied') {
      // NAV is Nil, only interest deduction is allowed (Max 2 Lakhs, handled in tax Engine)
      return - ((parseFloat(p.interestOnLoan) || 0) + (parseFloat(p.preConstructionInterest) || 0))
    } else {
      const nav = Math.max(0, (parseFloat(p.grossAnnualValue) || 0) - (parseFloat(p.municipalTaxes) || 0))
      const stdDed = nav * 0.3 // 30% standard deduction
      const interest = (parseFloat(p.interestOnLoan) || 0) + (parseFloat(p.preConstructionInterest) || 0)
      return nav - stdDed - interest
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Income from House Property</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="bg-primary-light" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: totalNetIncome >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: totalNetIncome >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
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
                <label className="input-label">Pre-construction Interest</label>
                <input type="number" className="input-field" value={prop.preConstructionInterest || ''} onChange={(e) => handleChange(prop.id, 'preConstructionInterest', e.target.value)} placeholder="0" />
                <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Allowed in 5 equal installments</p>
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
          <h3 className="text-lg" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Income Chargeable under head 'House Property'</h3>
          <h2 className="text-2xl" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹ {totalNetIncome.toLocaleString('en-IN')}</h2>
        </div>
      </div>
    </div>
  )
}

export default HouseProperty
