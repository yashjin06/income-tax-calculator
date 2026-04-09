import React from 'react'
import { FileWarning, AlertTriangle } from 'lucide-react'
import CurrencyInput from './CurrencyInput'

const BroughtForwardLosses = ({ data, updateData, textStyle = "professional" }) => {
  const isGenZ = textStyle === "genz";

  const labels = {
    title: isGenZ ? "Loss Ledger (The L's from the Past) 📉" : "Brought Forward Losses",
    warning: isGenZ
      ? "Enter the losses you took in previous years. We'll automatically use them to cancel out your current gains so you pay less tax. It's like a 'Get Out of Jail Free' card for your profits."
      : "Declare losses carried forward from previous assessment years. Our computation engine will automatically set them off according to standard IT Act rules (e.g., LTCL only against LTCG, Business Loss only against PGBP).",
    hp: isGenZ ? "House Property L (Last 8 Years)" : "House Property Loss (Max 8 yrs)",
    biz: isGenZ ? "Business L (Last 8 Years)" : "Normal Business Loss (Max 8 yrs)",
    stcl: isGenZ ? "Short Term Capital L (STCL)" : "Short Term Capital Loss (STCL)",
    ltcl: isGenZ ? "Long Term Capital L (LTCL)" : "Long Term Capital Loss (LTCL)",
    hpHint: isGenZ ? "Only cancels out Rent moniez" : "Set off only against House Property Income",
    bizHint: isGenZ ? "Only cancels out Side Hustle gains" : "Set off only against Business Income (PGBP)",
    stclHint: isGenZ ? "Cancels any Capital Gainz" : "Set off against STCG or LTCG",
    ltclHint: isGenZ ? "ONLY cancels Long Term Gainz (Strict Vibes)" : "Set off ONLY against LTCG (Long Term Capital Gains)"
  };

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
        <h2 className="text-xl font-bold">{labels.title}</h2>
      </div>

      <div className="card p-6 slide-up">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          <AlertTriangle size={24} />
          <p style={{ fontSize: '0.9rem' }}>
            {labels.warning}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="input-group">
            <label className="input-label">{labels.hp}</label>
            <CurrencyInput className="input-field" value={bfl.houseProperty || ''} onChange={(e) => updateBFL('houseProperty', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.hpHint}</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">{labels.biz}</label>
            <CurrencyInput className="input-field" value={bfl.business || ''} onChange={(e) => updateBFL('business', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.bizHint}</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">{labels.stcl}</label>
            <CurrencyInput className="input-field" value={bfl.stcl || ''} onChange={(e) => updateBFL('stcl', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.stclHint}</span>
          </div>
          
          <div className="input-group">
            <label className="input-label">{labels.ltcl}</label>
            <CurrencyInput className="input-field" value={bfl.ltcl || ''} onChange={(e) => updateBFL('ltcl', e.target.value)} placeholder="0" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{labels.ltclHint}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BroughtForwardLosses
