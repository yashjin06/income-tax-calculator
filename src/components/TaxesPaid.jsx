import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'

const TaxesPaid = ({ data, updateData }) => {
  const taxes = data.taxesPaid || { 
    tds: 0, 
    tcs: 0, 
    advanceTaxQ1: 0, 
    advanceTaxQ2: 0, 
    advanceTaxQ3: 0, 
    advanceTaxQ4: 0, 
    selfAssessmentTax: 0, 
    actualFilingDate: '' 
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const numValue = value === '' ? '' : parseFloat(value) || 0
    updateData({ ...data, taxesPaid: { ...taxes, [name]: numValue } })
  }

  const advanceTaxTotal = (parseFloat(taxes.advanceTaxQ1) || 0) + (parseFloat(taxes.advanceTaxQ2) || 0) + (parseFloat(taxes.advanceTaxQ3) || 0) + (parseFloat(taxes.advanceTaxQ4) || 0)
  const totalPaid = (parseFloat(taxes.tds) || 0) + (parseFloat(taxes.tcs) || 0) + advanceTaxTotal + (parseFloat(taxes.selfAssessmentTax) || 0)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Taxes Already Paid</h2>
        <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          Total Taxes Paid: ₹ {totalPaid.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="card p-6 slide-up mb-6">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <Info size={24} />
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            Enter the details of any tax that has already been paid on your behalf during the financial year. This includes TDS on salary, FD interest, or advance taxes paid in installments. These amounts will be deducted from your final tax liability.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Tax Deducted at Source (TDS)</label>
            <input type="number" name="tds" className="input-field" value={taxes.tds || ''} onChange={handleChange} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>E.g. TDS on Salary (Form 16), Interest, Rent, etc.</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">Tax Collected at Source (TCS)</label>
            <input type="number" name="tcs" className="input-field" value={taxes.tcs || ''} onChange={handleChange} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>E.g. TCS on Car Purchase, Foreign Remittance (LRS)</span>
          </div>
          
          <div className="input-group" style={{ gridColumn: '1 / -1', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)' }}>
            <h3 className="font-bold mb-3" style={{ color: 'var(--primary)', borderBottom: '1px dashed var(--primary)', paddingBottom: '0.5rem' }}>Advance Tax Installments (Required for Sec 234B/C)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
               <div>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On or before 15th June (15%)</label>
                  <input type="number" name="advanceTaxQ1" className="input-field" value={taxes.advanceTaxQ1 || ''} onChange={handleChange} placeholder="0" />
               </div>
               <div>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On or before 15th Sep (45%)</label>
                  <input type="number" name="advanceTaxQ2" className="input-field" value={taxes.advanceTaxQ2 || ''} onChange={handleChange} placeholder="0" />
               </div>
               <div>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On or before 15th Dec (75%)</label>
                  <input type="number" name="advanceTaxQ3" className="input-field" value={taxes.advanceTaxQ3 || ''} onChange={handleChange} placeholder="0" />
               </div>
               <div>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On or before 15th Mar (100%)</label>
                  <input type="number" name="advanceTaxQ4" className="input-field" value={taxes.advanceTaxQ4 || ''} onChange={handleChange} placeholder="0" />
               </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold' }}>Total Advance Tax: ₹ {advanceTaxTotal.toLocaleString('en-IN')}</div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Self-Assessment Tax Paid</label>
            <input type="number" name="selfAssessmentTax" className="input-field" value={taxes.selfAssessmentTax || ''} onChange={handleChange} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Paid before filing ITR</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--primary)' }}>
          <h3 className="font-bold mb-3" style={{ color: 'var(--danger)' }}>Filing Configuration (Required for Sec 234A)</h3>
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <label className="input-label">Actual Date of ITR Filing</label>
            <input type="date" name="actualFilingDate" className="input-field" value={taxes.actualFilingDate || ''} onChange={handleChange} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Used to calculate late filing interest. Due date is typically 31st July of the Assessment Year.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxesPaid
