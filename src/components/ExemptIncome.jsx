import React from 'react'
import { Plus, Trash2, Shield } from 'lucide-react'

const exemptSections = [
  { code: '10(1)', label: 'Sec 10(1) - Agricultural Income' },
  { code: '10(2A)', label: 'Sec 10(2A) - Share of Profit from Partnership Firm/LLP' },
  { code: '10(10BC)', label: 'Sec 10(10BC) - Compensation received on account of disaster' },
  { code: '10(10D)', label: 'Sec 10(10D) - Life Insurance Policy Maturity Proceeds' },
  { code: '10(11)', label: 'Sec 10(11) - Statutory Provident Fund (PPF/SPF) Interest/Receipt' },
  { code: '10(12)', label: 'Sec 10(12) - Recognized Provident Fund Balance Receipt' },
  { code: '10(15)', label: 'Sec 10(15) - Interest on Tax Free Bonds / Notified Securities' },
  { code: '10(16)', label: 'Sec 10(16) - Scholarships to meet cost of education' },
  { code: '10(17)', label: 'Sec 10(17) - Daily Allowance to MPs/MLAs' },
  { code: '10(17A)', label: 'Sec 10(17A) - Awards instituted by Government' },
  { code: '10(26)', label: 'Sec 10(26) - Income of Member of Scheduled Tribe' },
  { code: '10(32)', label: 'Sec 10(32) - Exemption for Minor Child Income (Up to ₹1,500)' },
  { code: 'OTHER', label: 'Any Other Exempt Income under Section 10' }
]

const ExemptIncome = ({ data, updateData }) => {
  const exemptList = Array.isArray(data.exemptIncome) ? data.exemptIncome : []

  const updateEntry = (index, field, value) => {
    const updated = [...exemptList]
    updated[index] = { ...updated[index], [field]: field === 'amount' ? (parseFloat(value) || 0) : value }
    updateData({ ...data, exemptIncome: updated })
  }

  const addEntry = () => {
    updateData({ ...data, exemptIncome: [...exemptList, { section: '10(1)', amount: 0, description: '' }] })
  }

  const removeEntry = (index) => {
    const updated = exemptList.filter((_, i) => i !== index)
    updateData({ ...data, exemptIncome: updated })
  }

  const totalExempt = exemptList.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Exempt Incomes (For Reporting Purposes Only)</h2>
        <div className="bg-primary-light" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 'bold' }}>
          Total Exempt Income: ₹ {totalExempt.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="card p-6 slide-up">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(79, 70, 229, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
           <Shield size={24} color="var(--primary)" />
           <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
             <strong>Note:</strong> Exempt incomes do not form part of your Gross Total Income and have no tax liability. However, they must be strictly disclosed in the Income Tax Return for transparency and to avoid arbitrary additions by the tax department. Agriculture income influences your tax slab rate theoretically, but we keep it simple here as purely exempt reporting.
           </p>
        </div>

        {exemptList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed var(--input-border)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No exempt income disclosed yet.</p>
            <button className="btn btn-primary" onClick={addEntry}>
              <Plus size={16} /> Add Exempt Income
            </button>
          </div>
        ) : (
          <div>
            <div style={{ border: '1px solid var(--input-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', background: 'var(--glass-bg)', color: 'var(--primary)', padding: '1rem', fontWeight: 'bold', borderBottom: '2px solid var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                <div style={{ flex: '1 1 40%' }}>Section Code</div>
                <div style={{ flex: '1 1 30%' }}>Description / Remark</div>
                <div style={{ flex: '0 0 150px' }}>Amount (₹)</div>
                <div style={{ flex: '0 0 50px', textAlign: 'center' }}>Action</div>
              </div>
              
              {exemptList.map((entry, index) => (
                <div key={index} style={{ display: 'flex', padding: '1rem', gap: '1rem', borderBottom: index < exemptList.length - 1 ? '1px solid var(--input-border)' : 'none', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 40%' }}>
                    <select className="input-field" style={{ marginBottom: 0 }} value={entry.section || '10(1)'} onChange={(e) => updateEntry(index, 'section', e.target.value)}>
                      {exemptSections.map(sec => (
                         <option key={sec.code} value={sec.code}>{sec.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 30%' }}>
                     <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Optional Remark" value={entry.description || ''} onChange={(e) => updateEntry(index, 'description', e.target.value)} />
                  </div>
                  <div style={{ flex: '0 0 150px' }}>
                     <input type="number" className="input-field" style={{ marginBottom: 0 }} placeholder="0" value={entry.amount || ''} onChange={(e) => updateEntry(index, 'amount', e.target.value)} />
                  </div>
                  <div style={{ flex: '0 0 50px', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => removeEntry(index)} title="Remove Entry">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={addEntry}>
                <Plus size={16} /> Add Another Entry
              </button>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                Total: ₹ {totalExempt.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExemptIncome
