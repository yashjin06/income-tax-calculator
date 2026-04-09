import React from 'react'
import { FileWarning, AlertTriangle } from 'lucide-react'
import CurrencyInput from './CurrencyInput'

const BroughtForwardLosses = ({ data, updateData }) => {
  const bfl = data.broughtForwardLosses || { houseProperty: 0, business: 0, stcl: 0, ltcl: 0 }

  const updateBFL = (field, value) => {
    updateData({
      ...data,
      broughtForwardLosses: {
        ...bfl,
        [field]: parseFloat(value) || 0
      }
    })
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Brought Forward Losses</h2>
      </div>

      <div className="card p-6 slide-up">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          <AlertTriangle size={24} />
          <p style={{ fontSize: '0.9rem' }}>
            Declare losses carried forward from previous assessment years. Our computation engine will automatically set them off according to standard IT Act rules (e.g., LTCL only against LTCG, Business Loss only against PGBP).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="input-group">
            <label className="input-label">House Property Loss (Max 8 yrs)</label>
            <CurrencyInput className="input-field" value={bfl.houseProperty || ''} onChange={(e) => updateBFL('houseProperty', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Set off only against House Property Income</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">Normal Business Loss (Max 8 yrs)</label>
            <CurrencyInput className="input-field" value={bfl.business || ''} onChange={(e) => updateBFL('business', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Set off only against Business Income (PGBP)</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">Short Term Capital Loss (STCL)</label>
            <CurrencyInput className="input-field" value={bfl.stcl || ''} onChange={(e) => updateBFL('stcl', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Set off against STCG or LTCG</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">Long Term Capital Loss (LTCL)</label>
            <CurrencyInput className="input-field" value={bfl.ltcl || ''} onChange={(e) => updateBFL('ltcl', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Set off ONLY against LTCG (Long Term Capital Gains)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BroughtForwardLosses
