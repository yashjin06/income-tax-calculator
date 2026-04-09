import React, { useEffect, useState } from 'react'
import { Activity, ArrowRight, Info } from 'lucide-react'
import DatePicker from 'react-datepicker'
import CurrencyInput from './CurrencyInput'
import 'react-datepicker/dist/react-datepicker.css'

const CryptoVDA = ({ data, updateData }) => {
  const vda = data.crypto || {
    trades: [],
    totalNetGain: 0,
    totalTaxableGain: 0,
  }

  const [tradeForm, setTradeForm] = useState({
    assetName: '',
    saleDate: '',
    saleValue: '',
    costOfAcq: '',
  })

  const handleChange = (e) => {
    setTradeForm({ ...tradeForm, [e.target.name]: e.target.value })
  }

  const handleManualOverride = (e) => {
    const val = e.target.value === '' ? '' : parseFloat(e.target.value) || 0
    updateData({
      ...data,
      crypto: { ...vda, totalTaxableGain: val }
    })
  }

  const handleCheckboxChange = (e) => {
    updateData({ ...data, crypto: { ...vda, treatAsPGBP: e.target.checked } })
  }

  const addTrade = () => {
    if (!tradeForm.assetName || !tradeForm.saleValue) return

    const sale = parseFloat(tradeForm.saleValue) || 0
    const cost = parseFloat(tradeForm.costOfAcq) || 0
    const gain = sale - cost
    
    // As per Sec 115BBH, losses from one VDA cannot be set-off against gains from another VDA
    const taxableGain = Math.max(0, gain)

    const newTrade = {
      id: Date.now(),
      assetName: tradeForm.assetName,
      saleDate: tradeForm.saleDate,
      sale,
      cost,
      gain,
      taxableGain
    }

    const updatedTrades = [...(vda.trades || []), newTrade]
    updateTotals(updatedTrades)
    
    setTradeForm({ assetName: '', saleDate: '', saleValue: '', costOfAcq: '' })
  }

  const removeTrade = (id) => {
    const updatedTrades = vda.trades.filter(t => t.id !== id)
    updateTotals(updatedTrades)
  }

  const updateTotals = (trades) => {
    let totalNetGain = 0
    let totalTaxableGain = 0

    trades.forEach(t => {
      totalNetGain += t.gain
      totalTaxableGain += t.taxableGain // Only positive gains are taxed
    })

    updateData({ 
      ...data, 
      crypto: { 
        ...vda, 
        trades, 
        totalNetGain, 
        totalTaxableGain 
      } 
    })
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
           <h2 className="text-xl font-bold">Virtual Digital Assets (Crypto & NFTs)</h2>
           <p className="text-sm text-gray-500">Sec 115BBH taxation at flat 30%</p>
        </div>
        <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 'bold' }}>
          Taxable VDA Income: ₹ {vda.totalTaxableGain?.toLocaleString('en-IN') || '0'}
        </div>
      </div>

      <div className="mb-6 p-4 rounded-md slide-up" style={{ background: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', borderLeft: '4px solid var(--warning)', display: 'flex', gap: '0.75rem' }}>
         <Info size={24} style={{ flexShrink: 0 }} />
         <div>
           <strong>Important VDA Tax Rules:</strong> Flat 30% tax applies on all gains. No deduction is allowed except cost of acquisition (no indexation). Losses from one VDA cannot be set-off against gains from another VDA or any other income. 1% TDS applies on transfer.
         </div>
      </div>

      <div className="card p-6 mb-6 slide-up">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary)' }}>Configuration & Manual Entry</h3>
        
        <div className="input-group mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="treatAsPGBP" checked={vda.treatAsPGBP || false} onChange={handleCheckboxChange} style={{ width: '20px', height: '20px' }} />
          <label htmlFor="treatAsPGBP" className="font-bold cursor-pointer" style={{ userSelect: 'none' }}>Frequent Trader: Treat VDA income as Business Income (PGBP)</label>
        </div>

        <div className="input-group">
          <label className="input-label">Total Taxable VDA/Crypto Income (₹)</label>
          <CurrencyInput className="input-field" value={vda.totalTaxableGain || ''} onChange={handleManualOverride} placeholder="0" />
          <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Enter a consolidated profit if you don't want to list individual transactions.</p>
        </div>
      </div>

      <div className="card p-6 mb-6 slide-up">
        <h3 className="font-bold mb-4">Add VDA Transaction</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Asset Name (e.g. BTC, ETH)</label>
            <input type="text" className="input-field" name="assetName" value={tradeForm.assetName} onChange={handleChange} placeholder="Asset" />
          </div>
          <div className="input-group">
            <label className="input-label">Date of Sale</label>
            <DatePicker
              selected={tradeForm.saleDate ? new Date(tradeForm.saleDate) : null}
              onChange={(date) => {
                if(date) {
                   const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                   setTradeForm({ ...tradeForm, saleDate: offsetDate.toISOString().split('T')[0] })
                } else {
                   setTradeForm({ ...tradeForm, saleDate: '' })
                }
              }}
              dateFormat="dd/MM/yyyy"
              className="input-field w-full"
              placeholderText="Select date"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={10}
              portalId="root-portal"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Sale Consideration (₹)</label>
            <CurrencyInput className="input-field" name="saleValue" value={tradeForm.saleValue} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label className="input-label">Cost of Acquisition (₹)</label>
            <CurrencyInput className="input-field" name="costOfAcq" value={tradeForm.costOfAcq} onChange={handleChange} placeholder="0" />
          </div>
        </div>
        <button className="btn btn-primary" onClick={addTrade} disabled={!tradeForm.assetName || !tradeForm.saleValue}>+ Add Transaction</button>
      </div>

      {vda.trades && vda.trades.length > 0 && (
        <div className="card p-6 slide-up">
          <h3 className="font-bold mb-4">VDA Transactions Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {vda.trades.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', gap: '1rem' }}>
                 <div>
                     <div className="font-bold mb-1">{t.assetName} <span className="text-sm font-normal text-gray-500">({t.saleDate || 'Date N/A'})</span></div>
                     <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                         Sale: ₹{t.sale.toLocaleString('en-IN')} - Cost: ₹{t.cost.toLocaleString('en-IN')} =
                         Actual Gain/Loss: <strong style={{ color: t.gain >= 0 ? 'var(--success)' : 'var(--danger)' }}>₹{t.gain.toLocaleString('en-IN')}</strong>
                     </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                       <div className="text-sm text-gray-500">Taxable Gain</div>
                       <div className="font-bold" style={{ color: 'var(--primary)' }}>₹{t.taxableGain.toLocaleString('en-IN')}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }} onClick={() => removeTrade(t.id)}>✖</button>
                 </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', fontSize: '1.1rem' }}>
             <span className="font-bold">Total VDA Taxable Income to be taxed at 30%:</span>
             <span className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>₹ {vda.totalTaxableGain.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CryptoVDA
