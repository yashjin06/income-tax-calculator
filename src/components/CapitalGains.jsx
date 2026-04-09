import React, { useEffect, useState } from 'react'
import { Calculator, ArrowRight, CornerDownRight } from 'lucide-react'
import CurrencyInput from './CurrencyInput'

const defaultCiiTable = {
  '2001-02': 100, '2002-03': 105, '2003-04': 109, '2004-05': 113, '2005-06': 117,
  '2006-07': 122, '2007-08': 129, '2008-09': 137, '2009-10': 148, '2010-11': 167,
  '2011-12': 184, '2012-13': 200, '2013-14': 220, '2014-15': 240, '2015-16': 254,
  '2016-17': 264, '2017-18': 272, '2018-19': 280, '2019-20': 289, '2020-21': 301,
  '2021-22': 317, '2022-23': 331, '2023-24': 348, '2024-25': 363, '2025-26': 376
}

const CapitalGains = ({ data, updateData }) => {
  const [ciiData, setCiiData] = useState(defaultCiiTable)
  const cg = data.capitalGains || {
    stcg_20: 0, stcg_normal: 0, ltcg_125_equity: 0, ltcg_20: 0, ltcg_125_other: 0,
    gross_stcg: 0, exemptions_stcg: 0, gross_ltcg: 0, exemptions_ltcg: 0
  }

  const [totalCg, setTotalCg] = useState(0)
  const [showCII, setShowCII] = useState(false)

  // Advanced Calculator States
  const [advMode, setAdvMode] = useState('none') // 'property', 'grandfather'
  const [propCalc, setPropCalc] = useState({ purchaseYear: '2015-16', saleYear: '2025-26', improvementYear: '2015-16', improvementCost: '', isBeforeJuly23: false, cost: '', sale: '', expenses: '', ext_54: '', ext_54EC: '', ext_54F: '', result: null })
  const [gfCalc, setGfCalc] = useState({ cost: '', fmv: '', sale: '', result: null })

  const handleChange = (e) => {
    const { name, value } = e.target
    const numValue = value === '' ? '' : parseFloat(value) || 0
    updateData({ ...data, capitalGains: { ...cg, [name]: numValue } })
  }

  const handlePropChange = (e) => setPropCalc({ ...propCalc, [e.target.name]: e.target.value })
  const handlePropCheck = (e) => setPropCalc({ ...propCalc, isBeforeJuly23: e.target.checked })
  const handleGfChange = (e) => setGfCalc({...gfCalc, [e.target.name]: e.target.value})

  useEffect(() => {
    const netSTCG = (parseFloat(cg.stcg_20) || 0) + (parseFloat(cg.stcg_normal) || 0)
    const netLTCG = (parseFloat(cg.ltcg_125_equity) || 0) + (parseFloat(cg.ltcg_125_other) || 0) + (parseFloat(cg.ltcg_20) || 0)
    setTotalCg(netSTCG + netLTCG)
  }, [cg])

  const calculateProperty = () => {
    let cost = parseFloat(propCalc.cost) || 0
    let improvementCost = parseFloat(propCalc.improvementCost) || 0
    let sale = parseFloat(propCalc.sale) || 0
    let expenses = parseFloat(propCalc.expenses) || 0
    let pYear = parseInt(propCalc.purchaseYear.split('-')[0])
    let sYear = parseInt(propCalc.saleYear.split('-')[0])
    let isShortTerm = (sYear - pYear) < 2 // 24 months approx

    let netConsideration = sale - expenses
    let exemptions = (parseFloat(propCalc.ext_54) || 0) + (parseFloat(propCalc.ext_54EC) || 0) + (parseFloat(propCalc.ext_54F) || 0)

    if (isShortTerm) {
       let gross = netConsideration - (cost + improvementCost)
       let gain = gross - exemptions
       setPropCalc({ ...propCalc, result: { type: 'STCG', gross, exemptions, gain, option: 'normal', message: 'Short-Term Gain (Held < 24 months)' } })
    } else {
       let pCii = ciiData[propCalc.purchaseYear] || 100
       let sCii = ciiData[propCalc.saleYear] || 376
       let iCii = ciiData[propCalc.improvementYear] || 100

       let indexedCost = cost * (sCii / pCii)
       let indexedImprovement = improvementCost > 0 ? improvementCost * (sCii / iCii) : 0
       
       let grossIndexed = netConsideration - (indexedCost + indexedImprovement)
       let gainIndexed = grossIndexed - exemptions
       let taxIndexed = Math.max(0, gainIndexed * 0.20)
       
       let grossFlat = netConsideration - (cost + improvementCost)
       let gainFlat = grossFlat - exemptions
       let taxFlat = Math.max(0, gainFlat * 0.125)

       let breakup = { cost, pCii, sCii, indexedCost, improvementCost, iCii, indexedImprovement, netConsideration, exemptions }
       
       let flatOption = { type: 'LTCG', gross: grossFlat, exemptions, gain: gainFlat, tax: taxFlat, option: 'flat' }
       let indexedOption = { type: 'LTCG', gross: grossIndexed, exemptions, gain: gainIndexed, tax: taxIndexed, option: 'indexed' }

       if (propCalc.isBeforeJuly23 || pYear < 2024) {
           let isFlatBetter = taxFlat <= taxIndexed;
           setPropCalc({ ...propCalc, result: { 
               isChoiceApplicable: true, 
               flatOption, 
               indexedOption, 
               beneficialOption: isFlatBetter ? flatOption : indexedOption,
               breakup,
               message: 'Since property was acquired before 23 July 2024, you can choose the more beneficial regime.' 
           } })
       } else {
           setPropCalc({ ...propCalc, result: { 
               isChoiceApplicable: false, 
               beneficialOption: flatOption,
               breakup,
               message: 'Only 12.5% Flat rate without indexation is available for purchases on/after 23 July 2024.' 
           } })
       }
    }
  }

  const calculateGrandfathering = () => {
    let cost = parseFloat(gfCalc.cost) || 0
    let fmv = parseFloat(gfCalc.fmv) || 0
    let sale = parseFloat(gfCalc.sale) || 0
    let acqCost = Math.max(cost, Math.min(fmv, sale))
    setGfCalc({ ...gfCalc, result: { acqCost, gain: sale - acqCost } })
  }

  const applyPropGain = (forcedOption = null) => {
    if(!propCalc.result) return;
    
    // Use the forced option if provided (e.g. user manually selects flat or indexed), otherwise use the beneficial one
    let targetData = forcedOption || propCalc.result.beneficialOption || propCalc.result;

    const { type, gross, exemptions, gain, option } = targetData;
    
    let updates = { ...cg }
    if (type === 'STCG') {
       updates.gross_stcg = (updates.gross_stcg || 0) + Math.round(gross);
       updates.exemptions_stcg = (updates.exemptions_stcg || 0) + Math.round(exemptions);
       updates.stcg_normal = (updates.stcg_normal || 0) + Math.round(Math.max(0, gain));
    } else {
       updates.gross_ltcg = (updates.gross_ltcg || 0) + Math.round(gross);
       updates.exemptions_ltcg = (updates.exemptions_ltcg || 0) + Math.round(exemptions);
       if (option === 'flat') updates.ltcg_125_other = (updates.ltcg_125_other || 0) + Math.round(Math.max(0, gain));
       if (option === 'indexed') updates.ltcg_20 = (updates.ltcg_20 || 0) + Math.round(Math.max(0, gain));
    }
    
    // Maintain list of properties sold
    let newPropertiesList = [...(updates.propertiesSold || [])]
    newPropertiesList.push({
       id: Date.now(),
       purchaseYear: propCalc.purchaseYear,
       saleYear: propCalc.saleYear,
       sale: parseInt(propCalc.sale) || 0,
       type,
       option,
       gross: Math.round(gross),
       exemptions: Math.round(exemptions),
       gain: Math.round(Math.max(0, gain))
    })
    updates.propertiesSold = newPropertiesList;

    updateData({ ...data, capitalGains: updates })
    setPropCalc({ ...propCalc, result: null, sale: '', cost: '', expenses: '', improvementCost: '', ext_54: '', ext_54EC: '', ext_54F: '' })
    setAdvMode('none')
  }

  const removeProperty = (id) => {
     let updates = { ...cg }
     let newList = updates.propertiesSold || []
     let prop = newList.find(p => p.id === id)
     if(!prop) return
     
     if (prop.type === 'STCG') {
       updates.gross_stcg = Math.max(0, (updates.gross_stcg || 0) - Math.round(prop.gross));
       updates.exemptions_stcg = Math.max(0, (updates.exemptions_stcg || 0) - Math.round(prop.exemptions));
       updates.stcg_normal = Math.max(0, (updates.stcg_normal || 0) - Math.round(Math.max(0, prop.gain)));
     } else {
       updates.gross_ltcg = Math.max(0, (updates.gross_ltcg || 0) - Math.round(prop.gross));
       updates.exemptions_ltcg = Math.max(0, (updates.exemptions_ltcg || 0) - Math.round(prop.exemptions));
       if (prop.option === 'flat') updates.ltcg_125_other = Math.max(0, (updates.ltcg_125_other || 0) - Math.round(Math.max(0, prop.gain)));
       if (prop.option === 'indexed') updates.ltcg_20 = Math.max(0, (updates.ltcg_20 || 0) - Math.round(Math.max(0, prop.gain)));
     }
     updates.propertiesSold = newList.filter(p => p.id !== id)
     updateData({ ...data, capitalGains: updates })
  }

  const applyCalculatedValue = (field, val) => {
    if(val > 0) {
      updateData({ ...data, capitalGains: { ...cg, gross_ltcg: (cg.gross_ltcg || 0) + val, [field]: (cg[field] || 0) + val } })
      setAdvMode('none')
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Capital Gains</h2>
        <div className="bg-primary-light" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: totalCg >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: totalCg >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
          Total Capital Gains: ₹ {totalCg.toLocaleString('en-IN')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
         <button className={`btn ${advMode === 'property' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAdvMode(advMode === 'property' ? 'none' : 'property')}><Calculator size={16} /> Property Sale Calculator</button>
         <button className={`btn ${advMode === 'grandfather' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAdvMode(advMode === 'grandfather' ? 'none' : 'grandfather')}><Calculator size={16} /> Grandfathering (Shares)</button>
         <button className="btn btn-secondary" onClick={() => setShowCII(!showCII)}>Cost Inflation Index Table</button>
      </div>

      {showCII && (
         <div className="card p-6 mb-6 slide-up" style={{ background: 'var(--bg-color)' }}>
            <h3 className="font-bold mb-4">Cost Inflation Index (CII) Values</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {Object.entries(ciiData).map(([year, val]) => (
                 <div key={year} style={{ padding: '0.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>{year}</span>
                    <span className="font-bold" style={{ color: 'var(--text-color)' }}>{val}</span>
                 </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
               <input type="text" className="input-field" placeholder="Year (e.g. 2026-27)" id="newCiiYear" style={{ maxWidth: '150px' }} />
               <CurrencyInput className="input-field" placeholder="CII Value" id="newCiiValue" style={{ maxWidth: '150px' }} />
               <button className="btn btn-primary btn-sm" onClick={() => {
                  let y = document.getElementById('newCiiYear').value
                  let v = document.getElementById('newCiiValue').value
                  if(y && v) {
                     setCiiData({...ciiData, [y]: parseInt(v)})
                     document.getElementById('newCiiYear').value = ''
                     document.getElementById('newCiiValue').value = ''
                  }
               }}>+ Add custom CII</button>
            </div>
         </div>
      )}

      {advMode === 'property' && (
         <div className="card p-6 mb-6 slide-up" style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
            <h3 className="font-bold mb-2">Smart Property Sale Calculator</h3>
            <p className="text-sm text-gray-600 mb-4">Calculates Gross Gain, applies Exemptions, and checks the 12.5% Flat vs 20% Indexation choice automatically.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Purchase Year</label>
                <select className="input-field" name="purchaseYear" value={propCalc.purchaseYear} onChange={handlePropChange}>
                  {Object.keys(ciiData).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Improvement Year</label>
                <select className="input-field" name="improvementYear" value={propCalc.improvementYear} onChange={handlePropChange}>
                  {Object.keys(ciiData).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Sale Year</label>
                <select className="input-field" name="saleYear" value={propCalc.saleYear} onChange={handlePropChange}>
                  {Object.keys(ciiData).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {parseInt(propCalc.purchaseYear.split('-')[0]) >= 2024 && (
                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                  <input type="checkbox" id="july23" checked={propCalc.isBeforeJuly23} onChange={handlePropCheck} style={{ width: '20px', height: '20px' }} />
                  <label htmlFor="july23" className="font-bold cursor-pointer" style={{ userSelect: 'none' }}>Purchased Before 23 July 2024? (Enables 20% Indexation option)</label>
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Sale Consideration (₹)</label>
                <CurrencyInput className="input-field" name="sale" value={propCalc.sale} onChange={handlePropChange} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Expenses on Transfer (₹)</label>
                <CurrencyInput className="input-field" name="expenses" value={propCalc.expenses} onChange={handlePropChange} placeholder="Brokerage, etc" />
              </div>
              <div className="input-group">
                <label className="input-label">Cost of Acquisition (₹)</label>
                <CurrencyInput className="input-field" name="cost" value={propCalc.cost} onChange={handlePropChange} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Cost of Improvement (₹)</label>
                <CurrencyInput className="input-field" name="improvementCost" value={propCalc.improvementCost} onChange={handlePropChange} placeholder="0" />
              </div>
            </div>
            
            <h4 className="font-bold mb-2">Exemptions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="input-group">
                  <label className="input-label">Sec 54 (New House) (₹)</label>
                  <CurrencyInput className="input-field" name="ext_54" value={propCalc.ext_54} onChange={handlePropChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label className="input-label">Sec 54EC (Bonds) (₹)</label>
                  <CurrencyInput className="input-field" name="ext_54EC" value={propCalc.ext_54EC} onChange={handlePropChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label className="input-label">Sec 54F (₹)</label>
                  <CurrencyInput className="input-field" name="ext_54F" value={propCalc.ext_54F} onChange={handlePropChange} placeholder="0" />
                </div>
            </div>

            <button className="btn btn-primary mb-4" onClick={calculateProperty}>Calculate Net Gain</button>
            {propCalc.result && !propCalc.result.isChoiceApplicable && !propCalc.result.flatOption && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                 <p>{propCalc.result.message}</p>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>Type: <strong>{propCalc.result.type || propCalc.result.beneficialOption?.type}</strong></div>
                    <div>Gross Gain: <strong>₹ {Math.round(propCalc.result.gross || propCalc.result.beneficialOption?.gross).toLocaleString('en-IN')}</strong></div>
                    <div>Exemptions: <strong style={{ color: 'var(--danger)'}}>- ₹ {Math.round(propCalc.result.exemptions || propCalc.result.beneficialOption?.exemptions).toLocaleString('en-IN')}</strong></div>
                 </div>
                 
                 <div>Calculated Net Taxable Gain: <strong style={{ color: (propCalc.result.gain || propCalc.result.beneficialOption?.gain) > 0 ? 'var(--success)' : 'var(--text-color)', fontSize: '1.25rem'}}>₹ {Math.round(Math.max(0, propCalc.result.gain || propCalc.result.beneficialOption?.gain)).toLocaleString('en-IN')}</strong></div>
                 {(propCalc.result.gain || propCalc.result.beneficialOption?.gain) > 0 && <button className="btn btn-secondary btn-sm mt-2" style={{ alignSelf: 'flex-start' }} onClick={() => applyPropGain()}><ArrowRight size={14} /> Add to Capital Gains</button>}
              </div>
            )}

            {propCalc.result && propCalc.result.isChoiceApplicable && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                 <p className="font-bold text-primary">{propCalc.result.message}</p>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {/* Flat Option Card */}
                    <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: propCalc.result.beneficialOption.option === 'flat' ? '2px solid var(--success)' : '1px solid var(--border-color)', background: propCalc.result.beneficialOption.option === 'flat' ? 'rgba(16, 185, 129, 0.05)' : 'transparent', display: 'flex', flexDirection: 'column' }}>
                       <h4 className="font-bold mb-3">Option 1: 12.5% Flat Rate</h4>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }} className="text-sm"><span>Gross Gain:</span> <strong>₹ {Math.round(propCalc.result.flatOption.gross).toLocaleString('en-IN')}</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }} className="text-sm"><span>Exemptions:</span> <strong style={{ color: 'var(--danger)' }}>{propCalc.result.flatOption.exemptions > 0 ? `(₹ ${Math.round(propCalc.result.flatOption.exemptions).toLocaleString('en-IN')})` : '₹ 0'}</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }} className="text-sm"><span>Net Gain:</span> <strong>₹ {Math.round(Math.max(0, propCalc.result.flatOption.gain)).toLocaleString('en-IN')}</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }} className="font-bold"><span>Est. Tax:</span> <span style={{ color: 'var(--danger)' }}>₹ {Math.round(Math.max(0, propCalc.result.flatOption.tax)).toLocaleString('en-IN')}</span></div>
                       <button className="btn btn-sm w-full mt-auto" style={{ background: propCalc.result.beneficialOption.option === 'flat' ? 'var(--success)' : 'var(--secondary)', color: '#fff' }} onClick={() => applyPropGain(propCalc.result.flatOption)}>
                         {propCalc.result.beneficialOption.option === 'flat' ? '⭐ Opt for Flat Rate' : 'Opt for Flat Rate'}
                       </button>
                    </div>

                    {/* Indexed Option Card */}
                    <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: propCalc.result.beneficialOption.option === 'indexed' ? '2px solid var(--success)' : '1px solid var(--border-color)', background: propCalc.result.beneficialOption.option === 'indexed' ? 'rgba(16, 185, 129, 0.05)' : 'transparent', display: 'flex', flexDirection: 'column' }}>
                       <h4 className="font-bold mb-3">Option 2: 20% with Indexation</h4>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }} className="text-sm"><span>Gross Gain:</span> <strong>₹ {Math.round(propCalc.result.indexedOption.gross).toLocaleString('en-IN')}</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }} className="text-sm"><span>Exemptions:</span> <strong style={{ color: 'var(--danger)' }}>{propCalc.result.indexedOption.exemptions > 0 ? `(₹ ${Math.round(propCalc.result.indexedOption.exemptions).toLocaleString('en-IN')})` : '₹ 0'}</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }} className="text-sm"><span>Net Gain:</span> <strong>₹ {Math.round(Math.max(0, propCalc.result.indexedOption.gain)).toLocaleString('en-IN')}</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }} className="font-bold"><span>Est. Tax:</span> <span style={{ color: 'var(--danger)' }}>₹ {Math.round(Math.max(0, propCalc.result.indexedOption.tax)).toLocaleString('en-IN')}</span></div>
                       <button className="btn btn-sm w-full mt-auto" style={{ background: propCalc.result.beneficialOption.option === 'indexed' ? 'var(--success)' : 'var(--secondary)', color: '#fff' }} onClick={() => applyPropGain(propCalc.result.indexedOption)}>
                         {propCalc.result.beneficialOption.option === 'indexed' ? '⭐ Opt for Indexed Rate' : 'Opt for Indexed Rate'}
                       </button>
                    </div>
                 </div>
                 
                 {propCalc.result.breakup && (
                    <div style={{ background: 'var(--bg-light, rgba(255, 255, 255, 0.03))', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <div className="font-bold text-sm mb-2" style={{ color: 'var(--primary)' }}>Indexation Calculation Breakdown (For Option 2)</div>
                       <div className="text-sm">Cost of Acquisition: <strong>₹ {Math.round(propCalc.result.breakup.cost).toLocaleString('en-IN')}</strong></div>
                       <div className="text-sm">CII for Purchase Year ({propCalc.purchaseYear}): <strong>{propCalc.result.breakup.pCii}</strong></div>
                       <div className="text-sm">CII for Sale Year ({propCalc.saleYear}): <strong>{propCalc.result.breakup.sCii}</strong></div>
                       <div className="text-sm mt-1 mb-1 border-b pb-1">
                          <i>Indexed Cost = Cost × (Sale CII / Purchase CII)</i> <br/>
                          = {Math.round(propCalc.result.breakup.cost).toLocaleString('en-IN')} × ({propCalc.result.breakup.sCii} / {propCalc.result.breakup.pCii}) <br/>
                          = <strong>₹ {Math.round(propCalc.result.breakup.indexedCost).toLocaleString('en-IN')}</strong>
                       </div>
                       
                       {propCalc.result.breakup.improvementCost > 0 && (
                          <>
                             <div className="text-sm mt-2">Cost of Improvement: <strong>₹ {Math.round(propCalc.result.breakup.improvementCost).toLocaleString('en-IN')}</strong></div>
                             <div className="text-sm">CII for Improvement Year ({propCalc.improvementYear}): <strong>{propCalc.result.breakup.iCii}</strong></div>
                             <div className="text-sm mt-1 mb-1 border-b pb-1">
                                <i>Indexed Imprv = Imprv Cost × (Sale CII / Imprv CII)</i> <br/>
                                = {Math.round(propCalc.result.breakup.improvementCost).toLocaleString('en-IN')} × ({propCalc.result.breakup.sCii} / {propCalc.result.breakup.iCii}) <br/>
                                = <strong>₹ {Math.round(propCalc.result.breakup.indexedImprovement).toLocaleString('en-IN')}</strong>
                             </div>
                          </>
                       )}

                       <div className="text-sm mt-2">Gross Gain (Indexed) = Net Consideration (₹{Math.round(propCalc.result.breakup.netConsideration).toLocaleString('en-IN')}) - Total Indexed Deductions (₹{Math.round(propCalc.result.breakup.indexedCost + propCalc.result.breakup.indexedImprovement).toLocaleString('en-IN')}) = <strong>₹ {Math.round(propCalc.result.indexedOption.gross).toLocaleString('en-IN')}</strong></div>
                    </div>
                 )}

              </div>
            )}
         </div>
      )}

      {advMode === 'grandfather' && (
         <div className="card p-6 mb-6 slide-up" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h3 className="font-bold mb-4">Sec 112A Grandfathering Calculator (Equities bought before 31 Jan 2018)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Actual Purchase Cost (₹)</label>
                <CurrencyInput className="input-field" name="cost" value={gfCalc.cost} onChange={handleGfChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Highest Price on 31 Jan 2018 (FMV) (₹)</label>
                <CurrencyInput className="input-field" name="fmv" value={gfCalc.fmv} onChange={handleGfChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Actual Sale Value (₹)</label>
                <CurrencyInput className="input-field" name="sale" value={gfCalc.sale} onChange={handleGfChange} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={calculateGrandfathering}>Calculate Grandfathered Gain</button>
            {gfCalc.result && (
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem' }}>
                 <div>Acquisition Cost to consider: <strong>₹ {Math.round(gfCalc.result.acqCost).toLocaleString('en-IN')}</strong></div>
                 <div>Calculated LTCG: <strong style={{ color: gfCalc.result.gain > 0 ? 'var(--success)' : 'var(--danger)'}}>₹ {Math.round(gfCalc.result.gain).toLocaleString('en-IN')}</strong></div>
                 {gfCalc.result.gain > 0 && <button className="btn btn-secondary btn-sm" onClick={() => applyCalculatedValue('ltcg_125_equity', Math.round(gfCalc.result.gain))}><ArrowRight size={14} /> Add to LTCG Equity</button>}
              </div>
            )}
         </div>
      )}

      {cg.propertiesSold && cg.propertiesSold.length > 0 && (
         <div className="card p-6 mb-6 slide-up" style={{ border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--success)' }}>Properties Successfully Added ({cg.propertiesSold.length})</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-color)' }}>These properties have been cumulatively added into your Capital Gains statement. You can continue calculating and adding more properties.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cg.propertiesSold.map((p, i) => (
                 <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div>
                        <div className="font-bold mb-1">Property {i + 1} ({p.purchaseYear} to {p.saleYear})</div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Sale Consideration: <strong>₹{p.sale.toLocaleString('en-IN')}</strong> • Net Taxable Gain: <strong style={{ color: 'var(--success)' }}>₹{p.gain.toLocaleString('en-IN')}</strong> • Applied Track: <strong>{p.option === 'flat' ? '12.5% Flat Rate' : (p.option === 'indexed' ? '20% with Indexation' : 'Normal STCG')}</strong></div>
                    </div>
                    <button className="btn btn-sm btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => removeProperty(p.id)}>Remove</button>
                 </div>
              ))}
            </div>
         </div>
      )}

      {/* Manual Input Overrides */}
      <div className="card p-6 slide-up mb-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary)' }}>Short-Term Capital Gains (STCG)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">STCG covered u/s 111A (Shares/Equity, Taxed @ 20%)</label>
            <CurrencyInput name="stcg_20" className="input-field" value={cg.stcg_20 || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>STT Paid Equities/Units</p>
          </div>
          <div className="input-group">
            <label className="input-label">STCG Not covered u/s 111A (Normal Rates)</label>
            <CurrencyInput name="stcg_normal" className="input-field" value={cg.stcg_normal || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Other assets (Real Estate, Gold, etc.)</p>
          </div>
        </div>
      </div>

      <div className="card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--secondary)' }}>Long-Term Capital Gains (LTCG)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">LTCG Equity u/s 112A (Taxed @ 12.5%)</label>
            <CurrencyInput name="ltcg_125_equity" className="input-field" value={cg.ltcg_125_equity || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>STT Paid Equities/Units (Eligible for 1.25L Exemption)</p>
          </div>
          <div className="input-group">
            <label className="input-label">LTCG Other Assets (Flat 12.5% without indexation)</label>
            <CurrencyInput name="ltcg_125_other" className="input-field" value={cg.ltcg_125_other || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Real Estate bought on/after 23 Jul 2024, Unlisted Shares, etc.</p>
          </div>
          <div className="input-group">
            <label className="input-label">LTCG Property (Option @ 20% with Indexation)</label>
            <CurrencyInput name="ltcg_20" className="input-field" value={cg.ltcg_20 || ''} onChange={handleChange} placeholder="0" />
            <p style={{fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)'}}>Only for Property bought before 23 Jul 2024 if chosen</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CapitalGains
