import React, { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react'
import * as XLSX from 'xlsx'

const BrokerImport = ({ data, updateData }) => {
  const [fileState, setFileState] = useState('idle') // idle, parsing, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [parsedData, setParsedData] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileState('parsing')
    setErrorMessage('')

    // Yield to main thread so React can render the 'parsing' spinner state
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (evt) => {
        // Adding a micro-delay gives the UX a smooth animated transition
        setTimeout(() => {
          try {
            const bstr = evt.target.result
            const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true })
            processExcelData(workbook)
          } catch (error) {
            setFileState('error')
            setErrorMessage(error.message || 'Failed to process Excel file. Please ensure it matches the template.')
          }
        }, 150)
      }
      reader.onerror = () => {
         setFileState('error')
         setErrorMessage('Error occurred while reading the file.')
      }
      reader.readAsBinaryString(file)
    }, 50)
  }


  const parseDate = (d) => {
    if (!d) return new Date()
    if (d instanceof Date) return d
    if (typeof d === 'number') {
      // Excel serial date fallback
      return new Date((d - 25569) * 86400 * 1000)
    }
    const dStr = String(d).trim()
    
    // Handle "5 May 2023" format
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const parts = dStr.toLowerCase().split(/[\s\-\/]+/)
    if (parts.length === 3) {
       let day = parseInt(parts[0])
       let month = months.indexOf(parts[1].substring(0, 3))
       let year = parseInt(parts[2])
       
       if (month !== -1) {
          return new Date(year, month, day)
       }
       
       // Handle DD-MM-YYYY or DD/MM/YYYY
       day = parseInt(parts[0])
       month = parseInt(parts[1]) - 1
       year = parseInt(parts[2])
       return new Date(year, month, day)
    }
    
    return new Date(dStr)
  }

  const processExcelData = (workbook) => {
    let totals = {
      stcg_20: 0,
      stcg_normal: 0,
      ltcg_125_equity: 0,
      ltcg_125_other: 0,
      stcgTrades: 0,
      ltcgTrades: 0
    }

    const sheetsToRead = ['Sale of Shares', 'Sale of Mutual Funds']

    sheetsToRead.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) return
      
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.length < 5) continue
        
        // New Indices based on "TaxNova Capital Gains Template.xlsx"
        // 0: Type, 1: Desc, 2: BuyDate, 3: BuyValue, 4: SellDate, 5: SellValue, 6: Expenses
        const type = String(row[0] || '').trim()
        const buyDate = parseDate(row[2])
        const buyVal = parseFloat(row[3]) || 0
        const sellDate = parseDate(row[4])
        const sellVal = parseFloat(row[5]) || 0
        const expenses = parseFloat(row[6]) || 0
        
        if (buyVal === 0 && sellVal === 0) continue // Empty row
        
        const timeDiff = sellDate.getTime() - buyDate.getTime()
        const daysHeld = Math.ceil(timeDiff / (1000 * 3600 * 24))
        const gain = sellVal - buyVal - expenses

        let isLTCG = false
        let taxCategory = 'normal' // 'equity_stcg', 'equity_ltcg', 'other_ltcg', 'normal'

        if (type.includes('Listed') || type === 'MF (Equity)') {
          // 12 months threshold
          isLTCG = daysHeld > 365
          taxCategory = isLTCG ? 'equity_ltcg' : 'equity_stcg'
        } else if (type.includes('Unlisted')) {
          // 24 months threshold
          isLTCG = daysHeld > 730
          taxCategory = isLTCG ? 'other_ltcg' : 'normal'
        } else if (type === 'MF (Debt)') {
          // Post April 1, 2023 rule: Always Normal Slab
          const cutOffDate = new Date(2023, 3, 1) // Apr 1, 2023
          if (buyDate >= cutOffDate) {
            isLTCG = false
            taxCategory = 'normal'
          } else {
            isLTCG = daysHeld > 1095 // 3 years
            taxCategory = isLTCG ? 'other_ltcg' : 'normal'
          }
        } else {
          // Default fallback
          isLTCG = daysHeld > 1095
          taxCategory = isLTCG ? 'other_ltcg' : 'normal'
        }

        if (isLTCG) {
          totals.ltcgTrades++
          if (taxCategory === 'equity_ltcg') totals.ltcg_125_equity += gain
          else totals.ltcg_125_other += gain
        } else {
          totals.stcgTrades++
          if (taxCategory === 'equity_stcg') totals.stcg_20 += gain
          else totals.stcg_normal += gain
        }
      }
    })

    if (totals.stcgTrades === 0 && totals.ltcgTrades === 0) {
       setFileState('error')
       setErrorMessage('No valid transactions found. Please ensure data matches the latest TaxNova template.')
       return
    }

    setParsedData(totals)
    setFileState('success')
  }

  const applyToCapitalGains = () => {
    if(!parsedData) return

    const cg = data.capitalGains || {}
    const updatedCg = { ...cg }
    
    updatedCg.stcg_20 = (parseFloat(cg.stcg_20) || 0) + parsedData.stcg_20
    updatedCg.stcg_normal = (parseFloat(cg.stcg_normal) || 0) + parsedData.stcg_normal
    updatedCg.ltcg_125_equity = (parseFloat(cg.ltcg_125_equity) || 0) + parsedData.ltcg_125_equity
    updatedCg.ltcg_125_other = (parseFloat(cg.ltcg_125_other) || 0) + parsedData.ltcg_125_other

    updateData({ ...data, capitalGains: updatedCg })
    setParsedData(null)
    setFileState('idle')
  }

  const downloadTemplate = () => {
     const link = document.createElement("a")
     link.setAttribute("href", "/TaxNova Capital Gains Template.xlsx")
     link.setAttribute("download", "TaxNova Capital Gains Template.xlsx")
     document.body.appendChild(link)
     link.click()
     link.remove()
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
         <h2 className="text-xl font-bold">Capital Gains Excel Importer</h2>
         <p className="text-sm text-gray-500">Automatically calculate Short Term and Long Term Capital Gains using the standard multi-sheet Excel format offline.</p>
      </div>

      <div className="card p-6 mb-6 slide-up">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', border: '2px dashed var(--input-border)', borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg)' }}>
          <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3 className="font-bold mb-2">Upload Excel Tradebook</h3>
          <p className="text-sm text-muted mb-6 text-center max-w-md">Your data is parsed securely and locally. <b>Instructions:</b> Please only fill the cells that are highlighted in grey in the downloaded template.</p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={downloadTemplate}><FileText size={16} /> Download Template</button>
            <label className="btn btn-primary cursor-pointer">
              <UploadCloud size={16} /> Select Excel File (.xlsx)
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {fileState === 'error' && (
          <div className="mt-4 p-4 rounded-md fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {fileState === 'parsing' && (
          <div className="mt-4 p-4 text-center fade-in">
            <span className="loading-spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            <span style={{ marginLeft: '0.75rem' }}>Parsing workbook...</span>
          </div>
        )}

        {fileState === 'success' && parsedData && (
          <div className="mt-6 slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
               <CheckCircle size={24} />
               <h4 className="font-bold text-lg">Successfully Parsed Trades</h4>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
               <div className="p-4 rounded-md" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                 <div className="text-sm text-muted mb-1">STCG (Sec 111A - Equity 20%)</div>
                 <div className="font-bold text-lg" style={{ color: parsedData.stcg_20 >= 0 ? 'var(--text-main)' : 'var(--danger)' }}>₹ {parsedData.stcg_20.toLocaleString('en-IN')}</div>
               </div>
               <div className="p-4 rounded-md" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                 <div className="text-sm text-muted mb-1">LTCG (Sec 112A - Equity 12.5%)</div>
                 <div className="font-bold text-lg" style={{ color: parsedData.ltcg_125_equity >= 0 ? 'var(--text-main)' : 'var(--danger)' }}>₹ {parsedData.ltcg_125_equity.toLocaleString('en-IN')}</div>
               </div>
               <div className="p-4 rounded-md" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                 <div className="text-sm text-muted mb-1">Transactions Found</div>
                 <div className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{parsedData.stcgTrades + parsedData.ltcgTrades} trades</div>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
               <button className="btn btn-secondary" onClick={() => { setFileState('idle'); setParsedData(null) }}>Cancel</button>
               <button className="btn btn-primary" onClick={applyToCapitalGains}>
                 Merge into Capital Gains <ArrowRight size={16} />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrokerImport

