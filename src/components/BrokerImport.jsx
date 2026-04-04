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

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true })
        processExcelData(workbook)
      } catch (error) {
        setFileState('error')
        setErrorMessage(error.message || 'Failed to process Excel file. Please ensure it matches the template.')
      }
    }
    reader.onerror = () => {
       setFileState('error')
       setErrorMessage('Error occurred while reading the file.')
    }
    reader.readAsBinaryString(file)
  }

  const parseDate = (d) => {
     if (!d) return new Date()
     if (d instanceof Date) return d
     if (typeof d === 'number') {
        // Excel serial date fallback (though cellDates: true handles most)
        return new Date((d - 25569) * 86400 * 1000)
     }
     const dStr = String(d)
     const parts = dStr.includes('/') ? dStr.split('/') : dStr.split('-')
     if (parts.length === 3) {
         if (dStr.includes('/') || parts[0].length === 2) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
         }
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
      if (!sheet) return // Skip if template is missing one of the sheets
      
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      
      // Starting from row index 1 (skipping header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        
        // Expected columns as per template:
        // 0: Description, 1: BuyDate, 2: BuyValue, 3: SellDate, 4: SellValue, 5: Expenses, 6: Gain
        const desc = row[0]
        const buyDate = parseDate(row[1])
        const buyVal = parseFloat(row[2]) || 0
        const sellDate = parseDate(row[3])
        const sellVal = parseFloat(row[4]) || 0
        const expenses = parseFloat(row[5]) || 0
        
        if (!desc && row[2] === undefined && row[4] === undefined) continue // Empty row
        
        const timeDiff = sellDate.getTime() - buyDate.getTime()
        const daysHeld = Math.ceil(timeDiff / (1000 * 3600 * 24))
        const gain = sellVal - buyVal - expenses

        // In this template, we assume Shares and Mutual Funds act as Equity for tax purposes (12 months = LTCG)
        const isEquity = true
        let isLTCG = (daysHeld > 365)

        if (isLTCG) {
          totals.ltcgTrades++
          if (isEquity) totals.ltcg_125_equity += gain
          else totals.ltcg_125_other += gain
        } else {
          totals.stcgTrades++
          if (isEquity) totals.stcg_20 += gain
          else totals.stcg_normal += gain
        }
      }
    })

    if (totals.stcgTrades === 0 && totals.ltcgTrades === 0) {
       setFileState('error')
       setErrorMessage('No valid transactions found. Please ensure data is strictly inside "Sale of Shares" or "Sale of Mutual Funds" sheets.')
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
     // Link directly to the template hosted in the public directory
     link.setAttribute("href", "/template for shares and mutual funds.xlsx")
     link.setAttribute("download", "template for shares and mutual funds.xlsx")
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
          <p className="text-sm text-muted mb-6 text-center max-w-md">Your data is parsed locally in your browser. No data is sent to any server. Must use the standard template structure.</p>
          
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
            <span style={{ marginLeft: '0.75rem' }}>Parsing workbook locally...</span>
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

