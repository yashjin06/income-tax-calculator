import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'
import CurrencyInput from './CurrencyInput'

const TaxesPaid = ({ data, updateData, textStyle = "professional" }) => {
  const isGenZ = textStyle === "genz";

  const labels = {
    title: isGenZ ? "Money You Already Sent the Govt 💸" : "Taxes Already Paid",
    totalLabel: isGenZ ? "Total Cash Sent:" : "Total Taxes Paid:",
    infoText: isGenZ
      ? "Enter any taxes that were already 'snatched' from you (TDS) or paid as installments. The govt counts this as a 'deposit' towards your final bill. Don't let them double charge you!"
      : "Enter the details of any tax that has already been paid on your behalf during the financial year. This includes TDS on salary, FD interest, or advance taxes paid in installments. These amounts will be deducted from your final tax liability.",
    tdsLabel: isGenZ ? "TDS (Tax Snatched by Boss/Bank)" : "Tax Deducted at Source (TDS)",
    tdsHint: isGenZ
      ? "Like on your Salary or Interest (Check Form 26AS/AIS)"
      : "E.g. TDS on Salary (Form 16), Interest, Rent, etc.",
    tcsLabel: isGenZ ? "TCS (The 'Expensive Purchase' Tax)" : "Tax Collected at Source (TCS)",
    tcsHint: isGenZ
      ? "Tax collected when you bought a Car or sent money abroad"
      : "E.g. TCS on Car Purchase, Foreign Remittance (LRS)",
    advanceTaxHeader: isGenZ
      ? "Advance Tax (Installment Vibes)"
      : "Advance Tax Installments (Required for Sec 234B/C)",
    advanceTaxTotalLabel: isGenZ ? "Total Installments Paid:" : "Total Advance Tax:",
    selfAssessmentLabel: isGenZ ? "Self-Assessment (Solving it Yourself)" : "Self-Assessment Tax Paid",
    selfAssessmentHint: isGenZ ? "Paid right before filing your return" : "Paid before filing ITR",
    filingHeader: isGenZ ? "ITR Filing Deets (Avoid Penalties)" : "Filing Configuration (Required for Sec 234A)",
    filingDateLabel: isGenZ ? "When did you actually File?" : "Actual Date of ITR Filing",
    filingDateHint: isGenZ
      ? "Late filing makes the govt cranky (and charges 1% interest)."
      : "Used to calculate late filing interest. Due date is typically 31st July of the Assessment Year."
  };

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
        <h2 className="text-xl font-bold">{labels.title}</h2>
        <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          {labels.totalLabel} ₹ {totalPaid.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="card p-6 slide-up mb-6">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <Info size={24} />
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            {labels.infoText}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">{labels.tdsLabel}</label>
            <CurrencyInput name="tds" className="input-field" value={taxes.tds || ''} onChange={handleChange} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.tdsHint}</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">{labels.tcsLabel}</label>
            <CurrencyInput name="tcs" className="input-field" value={taxes.tcs || ''} onChange={handleChange} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.tcsHint}</span>
          </div>
          
          <div className="input-group" style={{ gridColumn: '1 / -1', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--primary)', borderBottom: '1px dashed var(--primary)', paddingBottom: '0.5rem' }}>{labels.advanceTaxHeader}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
               <div style={{ flex: '1 1 180px' }}>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On/Before 15th June (15%)</label>
                  <CurrencyInput name="advanceTaxQ1" className="input-field" value={taxes.advanceTaxQ1 || ''} onChange={handleChange} placeholder="0" style={{ textAlign: 'right' }} />
               </div>
               <div style={{ flex: '1 1 180px' }}>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On/Before 15th Sep (45%)</label>
                  <CurrencyInput name="advanceTaxQ2" className="input-field" value={taxes.advanceTaxQ2 || ''} onChange={handleChange} placeholder="0" style={{ textAlign: 'right' }} />
               </div>
               <div style={{ flex: '1 1 180px' }}>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On/Before 15th Dec (75%)</label>
                  <CurrencyInput name="advanceTaxQ3" className="input-field" value={taxes.advanceTaxQ3 || ''} onChange={handleChange} placeholder="0" style={{ textAlign: 'right' }} />
               </div>
               <div style={{ flex: '1 1 180px' }}>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>On/Before 15th Mar (100%)</label>
                  <CurrencyInput name="advanceTaxQ4" className="input-field" value={taxes.advanceTaxQ4 || ''} onChange={handleChange} placeholder="0" style={{ textAlign: 'right' }} />
               </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
               <div style={{ background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {labels.advanceTaxTotalLabel} ₹ {advanceTaxTotal.toLocaleString('en-IN')}
               </div>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">{labels.selfAssessmentLabel}</label>
            <CurrencyInput name="selfAssessmentTax" className="input-field" value={taxes.selfAssessmentTax || ''} onChange={handleChange} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.selfAssessmentHint}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--primary)' }}>
          <h3 className="font-bold mb-3" style={{ color: 'var(--danger)' }}>{labels.filingHeader}</h3>
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <label className="input-label">{labels.filingDateLabel}</label>
            <input type="date" name="actualFilingDate" className="input-field" value={taxes.actualFilingDate || ''} onChange={handleChange} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.filingDateHint}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxesPaid
