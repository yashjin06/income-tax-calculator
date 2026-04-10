import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { computeTax } from '../computation/taxEngine'

export const generateExcel = async (data) => {
  const customFont = 'Meiryo'
  
  const results = computeTax(data)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'TaxNova Pro'
  workbook.created = new Date()

  // ---------------------------------------------------------------------------
  // STYLES
  // ---------------------------------------------------------------------------
  const STYLES = {
    MAIN_TITLE: { font: { bold: true, size: 16, color: { argb: 'FFFFFFFF' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } } },
    SUB_TITLE: { font: { size: 11, color: { argb: 'FF93C5FD' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } } },
    SECTION_HEADER: { font: { bold: true, color: { argb: 'FF0369A1' }, size: 12, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } } },
    TABLE_HEADER: { font: { bold: true, color: { argb: 'FF0F172A' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } } },
    NORMAL: { font: { color: { argb: 'FF000000' }, name: customFont } },
    BOLD: { font: { bold: true, color: { argb: 'FF000000' }, name: customFont } },
    TOTAL_GREEN: { font: { bold: true, color: { argb: 'FF166534' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } } },
    TOTAL_ORANGE: { font: { bold: true, color: { argb: 'FF9A3412' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } } },
    NET_PAYABLE: { font: { bold: true, size: 12, color: { argb: 'FF991B1B' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } } },
    NET_REFUND: { font: { bold: true, size: 12, color: { argb: 'FF166534' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } } },
    HIGHLIGHT_ROW: { font: { bold: true, color: { argb: 'FF0F172A' }, name: customFont }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } } }
  }

  const applyStyle = (sheetObj, row, styleObj, mergeCols = true) => {
    if (mergeCols && row.getCell(2).value && !row.getCell(3).value && !row.getCell(4).value) {
        sheetObj.mergeCells(`B${row.number}:C${row.number}`)
    }
    row.eachCell((cell) => {
      if (styleObj.font) cell.font = styleObj.font
      if (styleObj.fill) cell.fill = styleObj.fill
      cell.border = { top: {style:'thin', color: {argb:'FFCBD5E1'}}, left: {style:'thin', color: {argb:'FFCBD5E1'}}, bottom: {style:'thin', color: {argb:'FFCBD5E1'}}, right: {style:'thin', color: {argb:'FFCBD5E1'}} }
      
      if (typeof cell.value === 'number' || (cell.value && cell.value.formula)) {
          cell.numFmt = '#,##0;[Red](#,##0)'
      }
    })
  }

  // ==============================================================================
  // TAB 1: STATEMENT OF TOTAL INCOME
  // ==============================================================================
  const sheet1 = workbook.addWorksheet('Statement of Total Income', { views: [{ showGridLines: false }] })

  sheet1.columns = [
    { key: 'col1', width: 5 },
    { key: 'particulars', width: 75 },
    { key: 'ref', width: 20 },
    { key: 'amount', width: 25 }
  ]

  const r1_1 = sheet1.addRow(['', 'STATEMENT OF TOTAL INCOME', '', ''])
  const r1_2 = sheet1.addRow(['', `Assessment Year: ${data.personal?.assessmentYear || 'AY'} | Regime: ${data.personal?.newRegime === 'yes' ? 'New (115BAC)' : 'Old'}`, '', ''])
  sheet1.mergeCells(`B${r1_1.number}:D${r1_1.number}`); r1_1.getCell(2).alignment = { horizontal: 'center' }
  sheet1.mergeCells(`B${r1_2.number}:D${r1_2.number}`); r1_2.getCell(2).alignment = { horizontal: 'center' }
  applyStyle(sheet1, r1_1, STYLES.MAIN_TITLE, false)
  applyStyle(sheet1, r1_2, STYLES.SUB_TITLE, false)
  sheet1.addRow([])

  const r1_P1 = sheet1.addRow(['', 'Name:', '', data.personal?.name || '__________'])
  const r1_P2 = sheet1.addRow(['', 'PAN Number:', '', (data.personal?.pan || '__________').toUpperCase()])
  const r1_P3 = sheet1.addRow(['', 'Status:', '', `${data.personal?.category || 'Individual'} - ${data.personal?.ageCategory === 'senior' ? 'Senior' : data.personal?.ageCategory === 'superSenior' ? 'Super Senior' : 'Regular'}`])
  applyStyle(sheet1, r1_P1, STYLES.BOLD, false); r1_P1.getCell(4).font = STYLES.NORMAL.font
  applyStyle(sheet1, r1_P2, STYLES.BOLD, false); r1_P2.getCell(4).font = STYLES.NORMAL.font
  applyStyle(sheet1, r1_P3, STYLES.BOLD, false); r1_P3.getCell(4).font = STYLES.NORMAL.font
  sheet1.addRow([])

  const r1_H = sheet1.addRow(['S.No', 'Particulars of Income', '', 'Amount (Rs.)'])
  applyStyle(sheet1, r1_H, STYLES.TABLE_HEADER)

  const isNewRegime = data.personal?.newRegime === 'yes'
  const isLatest = data.personal?.assessmentYear === '2025-26' || data.personal?.assessmentYear === '2026-27'
  
  // 1. Salaries
  applyStyle(sheet1, sheet1.addRow(['1', 'Income from Salaries', '', '']), STYLES.SECTION_HEADER)
  const basicAmt = parseFloat(data.salary?.basic)||0
  const daAmt = parseFloat(data.salary?.da)||0
  const hraAmt = parseFloat(data.salary?.hra)||0
  const ltaAmt = parseFloat(data.salary?.lta)||0
  const otherAllAmt = parseFloat(data.salary?.otherAllowances)||0
  const commPensionAmt = parseFloat(data.salary?.commutedPension)||0
  const perqAmt = parseFloat(data.salary?.perquisites)||0
  const profitLieuAmt = parseFloat(data.salary?.profitInLieu)||0

  const grossSal = basicAmt + daAmt + hraAmt + ltaAmt + otherAllAmt + commPensionAmt + perqAmt + profitLieuAmt
  
  const stdDedMax = (isNewRegime && isLatest) ? 75000 : 50000
  const stdDedAmt = Math.round(Math.min(stdDedMax, grossSal))
  const ptAmt = parseFloat(data.salary?.pt) || 0
  const entAllowAmt = parseFloat(data.salary?.entAllow) || 0
  
  let salRows = []
  if (basicAmt > 0) { const r = sheet1.addRow(['', '   Basic Salary', '', basicAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (daAmt > 0) { const r = sheet1.addRow(['', '   Dearness Allowance (DA)', '', daAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (hraAmt > 0) { const r = sheet1.addRow(['', '   House Rent Allowance (HRA)', '', hraAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (ltaAmt > 0) { const r = sheet1.addRow(['', '   Leave Travel Allowance (LTA)', '', ltaAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (otherAllAmt > 0) { const r = sheet1.addRow(['', '   Other Allowances', '', otherAllAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (commPensionAmt > 0) { const r = sheet1.addRow(['', '   Commuted Pension', '', commPensionAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (perqAmt > 0) { const r = sheet1.addRow(['', '   Perquisites', '', perqAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (profitLieuAmt > 0) { const r = sheet1.addRow(['', '   Profit in Lieu of Salary', '', profitLieuAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  
  if (salRows.length === 0) {
      const r = sheet1.addRow(['', '   Gross Salary', '', 0]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`)
  }

  const rSalStd = sheet1.addRow(['', '   Less: Standard Deduction u/s 16(ia)', '', -stdDedAmt])
  applyStyle(sheet1, rSalStd, STYLES.NORMAL)
  salRows.push(`D${rSalStd.number}`)

  if (ptAmt > 0) { const r = sheet1.addRow(['', '   Less: Professional Tax u/s 16(iii)', '', -ptAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  if (entAllowAmt > 0) { const r = sheet1.addRow(['', '   Less: Entertainment Allowance u/s 16(ii)', '', -entAllowAmt]); applyStyle(sheet1, r, STYLES.NORMAL); salRows.push(`D${r.number}`) }
  
  const rNetSal = sheet1.addRow(['', '   Net Taxable Salary', '', results.netSalary])
  applyStyle(sheet1, rNetSal, STYLES.HIGHLIGHT_ROW)

  // 2. House Property
  applyStyle(sheet1, sheet1.addRow(['2', 'Income from House Property', '', '']), STYLES.SECTION_HEADER)
  let hpRows = []
  if (data.houseProperty && data.houseProperty.length > 0) {
      data.houseProperty.forEach((hp, idx) => {
         let subTotal = 0
         if (hp.type === 'self-occupied') {
             subTotal = -((parseFloat(hp.interestOnLoan) || 0) + (parseFloat(hp.preConstructionInterest) || 0))
         } else {
             const nav = Math.max(0, (parseFloat(hp.grossAnnualValue) || 0) - (parseFloat(hp.municipalTaxes) || 0))
             const stdDed = nav * 0.3
             const intDed = (parseFloat(hp.interestOnLoan) || 0) + (parseFloat(hp.preConstructionInterest) || 0)
             subTotal = nav - stdDed - intDed
         }
         const rHp = sheet1.addRow(['', `   Property ${idx + 1} (${hp.type}) - Net Value`, '', subTotal])
         applyStyle(sheet1, rHp, STYLES.NORMAL)
         hpRows.push(`D${rHp.number}`)
      })
  }
  
  // Note: Cap restrictions logic is complex (2 Lakhs). We present the final constrained Engine result.
  const rNetHp = sheet1.addRow(['', '   Net Income from House Property (After Set-off & Caps)', '', results.netHouseProperty])
  applyStyle(sheet1, rNetHp, STYLES.HIGHLIGHT_ROW)

  // 3. PGBP
  applyStyle(sheet1, sheet1.addRow(['3', 'Profits and Gains of Business / Profession', '', '']), STYLES.SECTION_HEADER)
  const isPresumptiveOpted = data.business?.presumptive?.isOpting === 'yes'
  let pgbpRows = []
  if (isPresumptiveOpted) {
      const pAmt = parseFloat(results.presumptiveIncome) || 0
      if (pAmt > 0) {
          const rP = sheet1.addRow(['', `   Presumptive Income (${data.business?.presumptive?.nature || '44AD'})`, '', pAmt])
          applyStyle(sheet1, rP, STYLES.NORMAL); pgbpRows.push(`D${rP.number}`)
      }
  } else {
      const rev = (parseFloat(data.business?.pnl?.revenueOperations)||0) + (parseFloat(data.business?.pnl?.otherIncome)||0) + (parseFloat(data.business?.pnl?.closingStock)||0)
      const exp = (parseFloat(data.business?.pnl?.openingStock)||0) + (parseFloat(data.business?.pnl?.purchases)||0) + (parseFloat(data.business?.pnl?.directExpenses)||0) + (parseFloat(data.business?.pnl?.employeeBenefits)||0) + (parseFloat(data.business?.pnl?.financeCosts)||0) + (parseFloat(data.business?.pnl?.depreciation)||0) + (parseFloat(data.business?.pnl?.otherExpenses)||0)
      const np = rev - exp
      if (rev > 0 || exp > 0) {
          const rRev = sheet1.addRow(['', '   Total Revenue and Additions', '', rev]); applyStyle(sheet1, rRev, STYLES.NORMAL); pgbpRows.push(`D${rRev.number}`)
          const rExp = sheet1.addRow(['', '   Total Expenses and Deductions', '', -exp]); applyStyle(sheet1, rExp, STYLES.NORMAL); pgbpRows.push(`D${rExp.number}`)
      }
  }
  
  const rNetPgbp = sheet1.addRow(['', '   Net Income from Business/Profession', '', results.netPGBP])
  applyStyle(sheet1, rNetPgbp, STYLES.HIGHLIGHT_ROW)

  // 4. Capital Gains
  applyStyle(sheet1, sheet1.addRow(['4', 'Capital Gains', '', '']), STYLES.SECTION_HEADER)
  let cgRows = []
  
  const stcg20Amt = parseFloat(data.capitalGains?.stcg_20) || 0
  const stcgNormAmt = parseFloat(data.capitalGains?.stcg_normal) || 0
  const ltcgEqAmt = parseFloat(data.capitalGains?.ltcg_125_equity) || 0
  const ltcgOthAmt = parseFloat(data.capitalGains?.ltcg_125_other) || 0
  const ltcg20Amt = parseFloat(data.capitalGains?.ltcg_20) || 0
  
  if (stcg20Amt > 0) { const r = sheet1.addRow(['', '   STCG u/s 111A (@ 20%)', '', stcg20Amt]); applyStyle(sheet1, r, STYLES.NORMAL); cgRows.push(`D${r.number}`) }
  if (stcgNormAmt > 0) { const r = sheet1.addRow(['', '   STCG Normal Slab', '', stcgNormAmt]); applyStyle(sheet1, r, STYLES.NORMAL); cgRows.push(`D${r.number}`) }
  if (ltcgEqAmt > 0) { const r = sheet1.addRow(['', '   LTCG Equity u/s 112A', '', ltcgEqAmt]); applyStyle(sheet1, r, STYLES.NORMAL); cgRows.push(`D${r.number}`) }
  if (ltcgOthAmt > 0) { const r = sheet1.addRow(['', '   LTCG Others u/s 112 (@ 12.5%)', '', ltcgOthAmt]); applyStyle(sheet1, r, STYLES.NORMAL); cgRows.push(`D${r.number}`) }
  if (ltcg20Amt > 0) { const r = sheet1.addRow(['', '   LTCG u/s 112 (@ 20%)', '', ltcg20Amt]); applyStyle(sheet1, r, STYLES.NORMAL); cgRows.push(`D${r.number}`) }

  const rNetCg = sheet1.addRow(['', '   Total Capital Gains Computed', '', results.stcg + results.ltcg])
  applyStyle(sheet1, rNetCg, STYLES.HIGHLIGHT_ROW)

  // 5. Other Sources & VDA
  applyStyle(sheet1, sheet1.addRow(['5', 'Income from Other Sources and VDA', '', '']), STYLES.SECTION_HEADER)
  let osRows = []
  const sbAmt = parseFloat(data.otherSources?.savingsInterest) || 0
  const fdAmt = parseFloat(data.otherSources?.fdInterest) || 0
  const divAmt = parseFloat(data.otherSources?.dividend) || 0
  const winAmt = parseFloat(data.otherSources?.winnings) || 0
  const famPenAmt = parseFloat(data.otherSources?.familyPension) || 0
  const agriAmt = parseFloat(data.otherSources?.agriculturalIncome) || 0
  const giftAmt = parseFloat(data.otherSources?.gifts) || 0
  const othIncAmt = parseFloat(data.otherSources?.otherIncome) || 0
  const vdaAmt = parseFloat(data.crypto?.totalTaxableGain) || 0
  
  if (sbAmt > 0) { const r = sheet1.addRow(['', '   Savings Bank Interest', '', sbAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (fdAmt > 0) { const r = sheet1.addRow(['', '   Fixed Deposit / Post Office Interest', '', fdAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (divAmt > 0) { const r = sheet1.addRow(['', '   Dividend Income', '', divAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (winAmt > 0) { const r = sheet1.addRow(['', '   Winnings (Lotteries/Games)', '', winAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (agriAmt > 0) { const r = sheet1.addRow(['', '   Agricultural Income (For Rate Purposes)', '', agriAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (famPenAmt > 0) { const r = sheet1.addRow(['', '   Family Pension Received', '', famPenAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (giftAmt > 0) { const r = sheet1.addRow(['', '   Gifts Received', '', giftAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (othIncAmt > 0) { const r = sheet1.addRow(['', '   Any Other Income', '', othIncAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }
  if (vdaAmt > 0) { const r = sheet1.addRow(['', '   Virtual Digital Assets (Crypto)', '', vdaAmt]); applyStyle(sheet1, r, STYLES.NORMAL); osRows.push(`D${r.number}`) }

  // Overriding calculated sum to ensure Family Pension deduction isn't lost and perfectly syncing with engine
  const rNetOs = sheet1.addRow(['', '   Net Taxable Other Sources & VDA', '', results.netOtherSources + results.netVDA])
  applyStyle(sheet1, rNetOs, STYLES.HIGHLIGHT_ROW)

  // GTI
  const rGTI = sheet1.addRow(['A', 'GROSS TOTAL INCOME', '', results.grossTotalIncome])
  applyStyle(sheet1, rGTI, STYLES.TOTAL_GREEN)

  // Deductions
  applyStyle(sheet1, sheet1.addRow(['B', 'Less: Deductions under Chapter VI-A', '', '']), STYLES.SECTION_HEADER)
  let dedRows = []
  if (!isNewRegime) {
      const c = parseFloat(data.deductions?.sec80c)||0
      if (c > 0) { const r = sheet1.addRow(['', '   Sec 80C', '', -c]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const ccc = parseFloat(data.deductions?.sec80ccc)||0
      if (ccc > 0) { const r = sheet1.addRow(['', '   Sec 80CCC', '', -ccc]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const ccd1 = parseFloat(data.deductions?.sec80ccd1)||0
      if (ccd1 > 0) { const r = sheet1.addRow(['', '   Sec 80CCD(1)', '', -ccd1]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const ccd1b = parseFloat(data.deductions?.sec80ccd1b)||0
      if (ccd1b > 0) { const r = sheet1.addRow(['', '   Sec 80CCD(1B) Tier 1 NPS', '', -ccd1b]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      
      const d = parseFloat(data.deductions?.sec80d)||0
      if (d > 0) { const r = sheet1.addRow(['', '   Sec 80D (Health Insurance)', '', -d]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const e = parseFloat(data.deductions?.sec80e)||0
      if (e > 0) { const r = sheet1.addRow(['', '   Sec 80E (Education Loan)', '', -e]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const g = parseFloat(data.deductions?.sec80g)||0
      if (g > 0) { const r = sheet1.addRow(['', '   Sec 80G (Donations)', '', -g]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const tta = parseFloat(data.deductions?.sec80tta)||0
      if (tta > 0) { const r = sheet1.addRow(['', '   Sec 80TTA', '', -tta]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
      const ttb = parseFloat(data.deductions?.sec80ttb)||0
      if (ttb > 0) { const r = sheet1.addRow(['', '   Sec 80TTB', '', -ttb]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
  }
  const ccd2 = parseFloat(data.deductions?.sec80ccd2)||0
  if (ccd2 > 0) { const r = sheet1.addRow(['', '   Sec 80CCD(2) (Employer NPS)', '', -ccd2]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
  const cch = parseFloat(data.deductions?.sec80cch)||0
  if (cch > 0) { const r = sheet1.addRow(['', '   Sec 80CCH (Agniveer Corpus)', '', -cch]); applyStyle(sheet1, r, STYLES.NORMAL); dedRows.push(`D${r.number}`) }
  
  // Directly set the capped tax engine deduction sum
  const rNetDed = sheet1.addRow(['', '   Total Eligible Deductions', '', -results.totalDeductions])
  applyStyle(sheet1, rNetDed, STYLES.HIGHLIGHT_ROW)

  // Taxable Income
  const rTaxable = sheet1.addRow(['C', 'TOTAL TAXABLE INCOME (A - B)', '', results.totalTaxableIncome])
  rTaxable.getCell(2).value = 'TOTAL TAXABLE INCOME (A - B) Rounded off u/s 288A'
  applyStyle(sheet1, rTaxable, STYLES.TOTAL_GREEN)
  sheet1.addRow([])
  
  // Annexures inside Statement of Total Income
  const exemptList = Array.isArray(data.exemptIncome) ? data.exemptIncome : []
  if (exemptList.length > 0) {
      applyStyle(sheet1, sheet1.addRow(['D', 'Exempt Incomes Disclosed', '', '']), STYLES.SECTION_HEADER)
      let exRows = []
      exemptList.forEach(ex => {
          const r = sheet1.addRow(['', `   ${ex.section || 'Sec 10'} - ${ex.description || 'Exempt'}`, '', parseFloat(ex.amount)||0])
          applyStyle(sheet1, r, STYLES.NORMAL)
          exRows.push(`D${r.number}`)
      })
      applyStyle(sheet1, sheet1.addRow(['', '   TOTAL EXEMPT INCOME', '', exemptList.reduce((sum, ex) => sum + (parseFloat(ex.amount)||0), 0)]), STYLES.HIGHLIGHT_ROW)
      sheet1.addRow([])
  }

  const bfl = data.broughtForwardLosses || {}
  if (bfl.houseProperty > 0 || bfl.business > 0 || bfl.stcl > 0 || bfl.ltcl > 0) {
      applyStyle(sheet1, sheet1.addRow(['E', 'Brought Forward Losses Set-off / Carried', '', '']), STYLES.SECTION_HEADER)
      if (bfl.houseProperty > 0) applyStyle(sheet1, sheet1.addRow(['', '   House Property Loss', '', bfl.houseProperty]), STYLES.NORMAL)
      if (bfl.business > 0) applyStyle(sheet1, sheet1.addRow(['', '   Business Loss', '', bfl.business]), STYLES.NORMAL)
      if (bfl.stcl > 0) applyStyle(sheet1, sheet1.addRow(['', '   Short Term Capital Loss', '', bfl.stcl]), STYLES.NORMAL)
      if (bfl.ltcl > 0) applyStyle(sheet1, sheet1.addRow(['', '   Long Term Capital Loss', '', bfl.ltcl]), STYLES.NORMAL)
      sheet1.addRow([])
  }

  // ==============================================================================
  // TAB 1B: TAX COMPUTATION (Tax Liability Focus)
  // ==============================================================================
  const sheetTax = workbook.addWorksheet('Tax Computation', { views: [{ showGridLines: false }] })
  sheetTax.columns = [
    { key: 'col1', width: 5 },
    { key: 'particulars', width: 50 },
    { key: 'ref', width: 20 },
    { key: 'amount', width: 25 },
    { key: 'calculation', width: 35 }
  ]

  const rt_1 = sheetTax.addRow(['', 'TAX LIABILITY COMPUTATION', '', ''])
  sheetTax.mergeCells(`B${rt_1.number}:E${rt_1.number}`); rt_1.getCell(2).alignment = { horizontal: 'center' }
  applyStyle(sheetTax, rt_1, STYLES.MAIN_TITLE, false)
  sheetTax.addRow([])
  
  const rt_P1 = sheetTax.addRow(['', 'Name:', '', data.personal?.name || '__________'])
  const rt_P2 = sheetTax.addRow(['', 'PAN Number:', '', (data.personal?.pan || '__________').toUpperCase()])
  applyStyle(sheetTax, rt_P1, STYLES.BOLD, false); rt_P1.getCell(4).font = STYLES.NORMAL.font
  applyStyle(sheetTax, rt_P2, STYLES.BOLD, false); rt_P2.getCell(4).font = STYLES.NORMAL.font
  sheetTax.addRow([])

  const rt_H = sheetTax.addRow(['S.No', 'Particulars of Tax Calculation', '', 'Amount (Rs.)'])
  applyStyle(sheetTax, rt_H, STYLES.TABLE_HEADER)

  applyStyle(sheetTax, sheetTax.addRow(['', 'Total Taxable Income (From Statement of Income)', '', results.totalTaxableIncome]), STYLES.TOTAL_GREEN)
  sheetTax.addRow([])

  // Tax Computation details
  applyStyle(sheetTax, sheetTax.addRow(['1', 'Tax Liability Calculation', '', '']), STYLES.SECTION_HEADER)
  const rT1 = sheetTax.addRow(['', '   Tax on Normal Income', '', results.normalTax]); applyStyle(sheetTax, rT1, STYLES.NORMAL)
  const rT2 = sheetTax.addRow(['', '   Tax on Special Incomes (Cap Gains, Winnings)', '', results.specialTax]); applyStyle(sheetTax, rT2, STYLES.NORMAL)
  const rTaxTot = sheetTax.addRow(['', '   Total Tax Before Rebate', '', results.totalTaxBeforeRebate]); applyStyle(sheetTax, rTaxTot, STYLES.BOLD)
  
  if (results.rebate > 0) { const rRebate = sheetTax.addRow(['', '   Less: Rebate u/s 87A', '', -results.rebate]); applyStyle(sheetTax, rRebate, STYLES.NORMAL) }
  if (results.surcharge > 0) { const rSur = sheetTax.addRow(['', '   Add: Surcharge', '', results.surcharge]); applyStyle(sheetTax, rSur, STYLES.NORMAL) }
  
  const taxAfterMarginal = Math.max(0, results.totalTaxBeforeRebate - results.rebate + results.surcharge)
  const rTaxMarginal = sheetTax.addRow(['', '   Tax After Marginal Relief', '', taxAfterMarginal])
  applyStyle(sheetTax, rTaxMarginal, STYLES.BOLD)
  
  const rCess = sheetTax.addRow(['', '   Add: Health and Education Cess @ 4%', '', results.cess]); applyStyle(sheetTax, rCess, STYLES.NORMAL)
  
  const rLiab = sheetTax.addRow(['', '   Total Tax and Cess Payable', '', results.totalTaxLiability])
  applyStyle(sheetTax, rLiab, STYLES.TOTAL_ORANGE)

  if (!data.taxesPaid?.actualFilingDate) {
      const rNote = sheetTax.addRow(['', 'Note: Expected ITR filing date is not selected to calculate the actual taxes.', '', ''])
      sheetTax.mergeCells(`B${rNote.number}:E${rNote.number}`)
      applyStyle(sheetTax, rNote, { font: { italic: true, size: 10, color: { argb: 'FF64748B' }, name: customFont } }, false)
      const rNote2 = sheetTax.addRow(['', 'Interest u/s 234A/B/C and Fee 234F are not computed.', '', ''])
      sheetTax.mergeCells(`B${rNote2.number}:E${rNote2.number}`)
      applyStyle(sheetTax, rNote2, { font: { italic: true, size: 10, color: { argb: 'FF64748B' }, name: customFont } }, false)
  } else {
      applyStyle(sheetTax, sheetTax.addRow(['', '   Add: Interest u/s 234A (Late Filing)', '', results.interest234A || 0]), STYLES.NORMAL)
      applyStyle(sheetTax, sheetTax.addRow(['', '   Add: Interest u/s 234B (Adv. Tax Default)', '', results.interest234B || 0]), STYLES.NORMAL)
      applyStyle(sheetTax, sheetTax.addRow(['', '   Add: Interest u/s 234C (Adv. Tax Deferment)', '', results.interest234C || 0]), STYLES.NORMAL)
      applyStyle(sheetTax, sheetTax.addRow(['', '   Add: Late Filing Fee u/s 234F', '', results.fee234F || 0]), STYLES.NORMAL)
  }

  const rLiabTot = sheetTax.addRow(['', '   Total Tax Liability (Incl. Interest)', '', results.finalTaxPayableWithInterest])
  applyStyle(sheetTax, rLiabTot, STYLES.BOLD)

  if (results.tdsPaid > 0) { const r = sheetTax.addRow(['', '   Less: Taxes Deducted at Source (TDS/TCS)', '', -results.tdsPaid]); applyStyle(sheetTax, r, STYLES.NORMAL) }
  if (results.advanceTaxPaid > 0) { const r = sheetTax.addRow(['', '   Less: Advance Tax Paid', '', -results.advanceTaxPaid]); applyStyle(sheetTax, r, STYLES.NORMAL) }
  if (results.selfAssessmentTaxPaid > 0) { const r = sheetTax.addRow(['', '   Less: Self Assessment Tax Paid', '', -results.selfAssessmentTaxPaid]); applyStyle(sheetTax, r, STYLES.NORMAL) }

  const rNet = sheetTax.addRow(['', 'NET TAX PAYABLE / (REFUND DUE)', '', results.netTaxPayable || 0])
  applyStyle(sheetTax, rNet, (results.netTaxPayable < 0) ? STYLES.NET_REFUND : STYLES.NET_PAYABLE)
  sheetTax.addRow([])

  if (results.totalTaxLiability >= 10000 || results.interest234C > 0) {
      applyStyle(sheetTax, sheetTax.addRow(['2', 'Advance Tax Dues & Sec 234C Breakdown', '', '']), STYLES.SECTION_HEADER)
      const rH = sheetTax.addRow(['', 'Instalment', 'Period', 'Interest', 'Calculation'])
      applyStyle(sheetTax, rH, STYLES.TABLE_HEADER, false)

      results.interest234CBreakdown.forEach(row => {
          const r = sheetTax.addRow(['', row.label, row.period, row.interest, row.calculation])
          applyStyle(sheetTax, r, STYLES.NORMAL, false)
      })
  }

  // ==============================================================================
  // TAB 2: TAX BREAKUP (Slab-wise details)
  // ==============================================================================
  const sheet2 = workbook.addWorksheet('Tax Breakup', { views: [{ showGridLines: false }] })
  sheet2.columns = [
     { key: 'col1', width: 5 },
     { key: 'slab', width: 45 },
     { key: 'rate', width: 20 },
     { key: 'income', width: 25 },
     { key: 'tax', width: 25 }
  ]
  const r2_1 = sheet2.addRow(['', 'SLAB-WISE TAX BREAKDOWN', '', '', ''])
  sheet2.mergeCells(`B${r2_1.number}:E${r2_1.number}`); applyStyle(sheet2, r2_1, STYLES.MAIN_TITLE, false)
  sheet2.addRow([])
  
  const r2_h = sheet2.addRow(['', 'Income Slab', 'Tax Rate', 'Income in Slab', 'Tax Amount'])
  applyStyle(sheet2, r2_h, STYLES.TABLE_HEADER, false)
  
  if (results.taxBreakup && results.taxBreakup.length > 0) {
      results.taxBreakup.forEach(row => {
          const nr = sheet2.addRow(['', row.slab, row.rate, row.amount, row.tax])
          applyStyle(sheet2, nr, STYLES.NORMAL, false)
      })
  } else {
      const emptyRow = sheet2.addRow(['', 'No taxable normal income.', '', '', ''])
      applyStyle(sheet2, emptyRow, STYLES.NORMAL, false)
  }
  const r2_t = sheet2.addRow(['', 'TOTAL NORMAL TAX', '', results.taxableNormalIncome, results.normalTax])
  applyStyle(sheet2, r2_t, STYLES.HIGHLIGHT_ROW, false)
  sheet2.addRow([])

  const r2_sp_h = sheet2.addRow(['', 'Special Taxes & Adjustments', '', '', ''])
  sheet2.mergeCells(`B${r2_sp_h.number}:E${r2_sp_h.number}`); applyStyle(sheet2, r2_sp_h, STYLES.SECTION_HEADER, false)
  
  if (results.specialTaxBreakup && results.specialTaxBreakup.length > 0) {
      results.specialTaxBreakup.forEach(item => {
          const spRow = sheet2.addRow(['', item.label, '', item.amount, item.tax])
          applyStyle(sheet2, spRow, STYLES.NORMAL, false)
      })
  }
  const r2_s_tot = sheet2.addRow(['', 'Total Special Tax', '', '', results.specialTax])
  applyStyle(sheet2, r2_s_tot, STYLES.HIGHLIGHT_ROW, false)
  
  const rowRebate = sheet2.addRow(['', 'Less: Rebate u/s 87A', '', '', -Math.round(results.rebate)])
  applyStyle(sheet2, rowRebate, STYLES.NORMAL, false)
  const rowSur = sheet2.addRow(['', 'Add: Surcharge', '', '', Math.round(results.surcharge)])
  applyStyle(sheet2, rowSur, STYLES.NORMAL, false)
  const rowCess = sheet2.addRow(['', 'Add: Health & Education Cess (4%)', '', '', Math.round(results.cess)])
  applyStyle(sheet2, rowCess, STYLES.NORMAL, false)
  
  const r2_fin = sheet2.addRow(['', 'GROSS TAX LIABILITY', '', '', results.totalTaxLiability])
  applyStyle(sheet2, r2_fin, STYLES.TOTAL_ORANGE, false)


  // ==============================================================================
  // TAB 3: REGIME COMPARISON
  // ==============================================================================
  const sheet3 = workbook.addWorksheet('Regime Comparison', { views: [{ showGridLines: false }] })
  sheet3.columns = [
     { key: 'col1', width: 5 },
     { key: 'particulars', width: 55 },
     { key: 'regime1', width: 30 },
     { key: 'regime2', width: 30 }
  ]
  const dataAlt = JSON.parse(JSON.stringify(data))
  dataAlt.personal.newRegime = data.personal.newRegime === 'yes' ? 'no' : 'yes'
  const altResults = computeTax(dataAlt)
  
  const r3_1 = sheet3.addRow(['', 'REGIME COMPARISON', '', ''])
  sheet3.mergeCells(`B${r3_1.number}:D${r3_1.number}`); applyStyle(sheet3, r3_1, STYLES.MAIN_TITLE, false)
  sheet3.addRow([])

  const currentRegimeName = data.personal.newRegime === 'yes' ? 'New Regime (115BAC)' : 'Old Regime'
  const altRegimeName = data.personal.newRegime === 'yes' ? 'Old Regime' : 'New Regime (115BAC)'

  const r3_h = sheet3.addRow(['', 'Particulars', `Chosen: ${currentRegimeName}`, `Alternate: ${altRegimeName}`])
  applyStyle(sheet3, r3_h, STYLES.TABLE_HEADER, false)

  applyStyle(sheet3, sheet3.addRow(['', 'Gross Salary', grossSal, grossSal]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Net Salary', results.netSalary, altResults.netSalary]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Net House Property', results.netHouseProperty, altResults.netHouseProperty]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Total Business & Capital Gains', results.netPGBP + results.stcg + results.ltcg + results.netVDA, altResults.netPGBP + altResults.stcg + altResults.ltcg + altResults.netVDA]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Other Sources', results.netOtherSources, altResults.netOtherSources]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'GROSS TOTAL INCOME', results.grossTotalIncome, altResults.grossTotalIncome]), STYLES.HIGHLIGHT_ROW, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Total Deductions (Chap VI-A)', results.totalDeductions, altResults.totalDeductions]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'TOTAL TAXABLE INCOME', results.totalTaxableIncome, altResults.totalTaxableIncome]), STYLES.TOTAL_GREEN, false)
  
  sheet3.addRow([])
  
  applyStyle(sheet3, sheet3.addRow(['', 'Tax Computed (Normal + Special)', results.totalTaxBeforeRebate, altResults.totalTaxBeforeRebate]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Less: Rebate 87A', -results.rebate, -altResults.rebate]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Add: Surcharge', results.surcharge, altResults.surcharge]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'Add: Cess (4%)', results.cess, altResults.cess]), STYLES.NORMAL, false)
  applyStyle(sheet3, sheet3.addRow(['', 'FINAL TAX LIABILITY', results.totalTaxLiability, altResults.totalTaxLiability]), STYLES.TOTAL_ORANGE, false)

  sheet3.addRow([])
  const diff = results.totalTaxLiability - altResults.totalTaxLiability
  const winnerText = diff < 0 ? `Chosen regime is better by ₹${Math.abs(diff).toLocaleString('en-IN')}` : diff > 0 ? `Alternate regime is better by ₹${Math.abs(diff).toLocaleString('en-IN')}` : 'Both regimes yield identical liability'
  const winRow = sheet3.addRow(['', 'CONCLUSION', winnerText, ''])
  sheet3.mergeCells(`C${winRow.number}:D${winRow.number}`)
  applyStyle(sheet3, winRow, STYLES.BOLD, false)
  winRow.getCell(3).font = { name: customFont, bold: true, color: { argb: 'FF166534' } }


  // ==============================================================================
  // TAB 4: INPUT SUMMARY
  // ==============================================================================
  const sheet4 = workbook.addWorksheet('Input Summary', { views: [{ showGridLines: false }] })
  sheet4.columns = [
     { key: 'col1', width: 5 },
     { key: 'particulars', width: 55 },
     { key: 'value', width: 45 }
  ]
  const r4_1 = sheet4.addRow(['', 'RAW INPUT SUMMARY', ''])
  sheet4.mergeCells(`B${r4_1.number}:C${r4_1.number}`); applyStyle(sheet4, r4_1, STYLES.MAIN_TITLE, false)
  sheet4.addRow([])

  const addInputRow = (label, val, isHeader = false) => {
      const row = sheet4.addRow(['', label, val])
      applyStyle(sheet4, row, isHeader ? STYLES.SECTION_HEADER : STYLES.NORMAL, false)
  }

  addInputRow('Personal Info', '', true)
  addInputRow('Name', data.personal?.name)
  addInputRow('PAN', data.personal?.pan)
  addInputRow('Assessment Year', data.personal?.assessmentYear)
  addInputRow('Status Category', data.personal?.category)
  addInputRow('Age Group', data.personal?.ageCategory)
  addInputRow('Regime Selected', data.personal?.newRegime === 'yes' ? 'New Options (115BAC)' : 'Old Normal Regime')
  
  addInputRow('Income from Salaries', '', true)
  addInputRow('Basic Salary', parseFloat(data.salary?.basic)||0)
  addInputRow('Dearness Allowance (DA)', parseFloat(data.salary?.da)||0)
  addInputRow('House Rent Allowance (HRA)', parseFloat(data.salary?.hra)||0)
  addInputRow('Leave Travel Allowance (LTA)', parseFloat(data.salary?.lta)||0)
  addInputRow('Other Allowances', parseFloat(data.salary?.otherAllowances)||0)
  addInputRow('Commuted Pension', parseFloat(data.salary?.commutedPension)||0)
  addInputRow('Perquisites / Non-Monetary', parseFloat(data.salary?.perquisites)||0)
  addInputRow('Profit in Lieu of Salary', parseFloat(data.salary?.profitInLieu)||0)
  addInputRow('Professional Tax Deducted', parseFloat(data.salary?.pt)||0)
  addInputRow('Entertainment Allowance', parseFloat(data.salary?.entAllow)||0)

  if (data.houseProperty && data.houseProperty.length > 0) {
      addInputRow('Income from House Property', '', true)
      data.houseProperty.forEach((hp, idx) => {
          addInputRow(`Property ${idx + 1} - Type`, hp.type)
          if (hp.type !== 'self-occupied') {
             addInputRow(`Property ${idx + 1} - Gross Annual Value`, parseFloat(hp.grossAnnualValue)||0)
             addInputRow(`Property ${idx + 1} - Municipal Taxes`, parseFloat(hp.municipalTaxes)||0)
          }
          addInputRow(`Property ${idx + 1} - Interest on Loan`, parseFloat(hp.interestOnLoan)||0)
          addInputRow(`Property ${idx + 1} - Pre-Construction Interest`, parseFloat(hp.preConstructionInterest)||0)
      })
  }

  addInputRow('Profits and Gains of Business / Profession', '', true)
  if (data.business?.presumptive?.isOpting === 'yes') {
      addInputRow('Presumptive Taxation Opted', 'Yes')
      addInputRow('Section Opted', data.business?.presumptive?.nature)
      addInputRow('Turnover Digital (44AD)', parseFloat(data.business?.presumptive?.turnoverDigital)||0)
      addInputRow('Turnover Non-Digital (44AD)', parseFloat(data.business?.presumptive?.turnoverNonDigital)||0)
      addInputRow('Gross Receipts (44ADA)', parseFloat(data.business?.presumptive?.grossReceipts44ADA)||0)
  } else {
      addInputRow('Presumptive Taxation Opted', 'No')
      addInputRow('Revenue from Operations', parseFloat(data.business?.pnl?.revenueOperations)||0)
      addInputRow('Other Business Income', parseFloat(data.business?.pnl?.otherIncome)||0)
  }

  addInputRow('Capital Gains & VDA', '', true)
  addInputRow('STCG u/s 111A (@ 20%)', parseFloat(data.capitalGains?.stcg_20)||0)
  addInputRow('STCG Normal Slab', parseFloat(data.capitalGains?.stcg_normal)||0)
  addInputRow('LTCG Equity u/s 112A', parseFloat(data.capitalGains?.ltcg_125_equity)||0)
  addInputRow('LTCG Others u/s 112 (@ 12.5%)', parseFloat(data.capitalGains?.ltcg_125_other)||0)
  addInputRow('LTCG u/s 112 (@ 20%)', parseFloat(data.capitalGains?.ltcg_20)||0)
  addInputRow('Virtual Digital Assets (Crypto)', parseFloat(data.crypto?.totalTaxableGain)||0)

  addInputRow('Income from Other Sources', '', true)
  addInputRow('Savings Bank Interest', parseFloat(data.otherSources?.savingsInterest)||0)
  addInputRow('Fixed Deposit / Post Office Interest', parseFloat(data.otherSources?.fdInterest)||0)
  addInputRow('Dividend Income', parseFloat(data.otherSources?.dividend)||0)
  addInputRow('Winnings from Lotteries, Games, etc.', parseFloat(data.otherSources?.winnings)||0)
  addInputRow('Family Pension', parseFloat(data.otherSources?.familyPension)||0)
  addInputRow('Agricultural Income', parseFloat(data.otherSources?.agriculturalIncome)||0)
  addInputRow('Gifts Received', parseFloat(data.otherSources?.gifts)||0)
  addInputRow('Any Other Income', parseFloat(data.otherSources?.otherIncome)||0)

  addInputRow('Exempt Incomes (Sec 10)', '', true)
  if (data.exemptIncome && data.exemptIncome.length > 0) {
      data.exemptIncome.forEach(ex => {
          addInputRow(`${ex.section || 'Sec 10'} - ${ex.description || 'Exemption'}`, parseFloat(ex.amount)||0)
      })
  } else {
      addInputRow('No Exempt Incomes Disclosed', '')
  }

  addInputRow('Chapter VI-A Deductions', '', true)
  addInputRow('80C/80CCC/80CCD(1) - Investments/NPS', parseFloat(data.deductions?.sec80c)||0 + parseFloat(data.deductions?.sec80ccc)||0 + parseFloat(data.deductions?.sec80ccd1)||0)
  addInputRow('80CCD(1B) - NPS Tier 1', parseFloat(data.deductions?.sec80ccd1b)||0)
  addInputRow('80D - Health Insurance', parseFloat(data.deductions?.sec80d)||0)
  addInputRow('80E - Education Loan', parseFloat(data.deductions?.sec80e)||0)
  addInputRow('80G - Charitable Donations', parseFloat(data.deductions?.sec80g)||0)
  addInputRow('80TTA/80TTB - Bank Interest Deduction', parseFloat(data.deductions?.sec80tta)||0 + parseFloat(data.deductions?.sec80ttb)||0)
  addInputRow('80CCD(2) - NPS Employer Contribution', parseFloat(data.deductions?.sec80ccd2)||0)
  addInputRow('80CCH - Agniveer Corpus Fund', parseFloat(data.deductions?.sec80cch)||0)

  addInputRow('Brought Forward Losses Details', '', true)
  addInputRow('House Property Loss B/F', parseFloat(data.broughtForwardLosses?.houseProperty)||0)
  addInputRow('Business / Profession Loss B/F', parseFloat(data.broughtForwardLosses?.business)||0)
  addInputRow('Short Term Capital Loss B/F', parseFloat(data.broughtForwardLosses?.stcl)||0)
  addInputRow('Long Term Capital Loss B/F', parseFloat(data.broughtForwardLosses?.ltcl)||0)
  
  addInputRow('Taxes Already Paid', '', true)
  addInputRow('TDS / TCS Paid', parseFloat(data.taxesPaid?.tds)||0)
  addInputRow('Advance Tax Paid', parseFloat(data.taxesPaid?.advanceTax)||0)
  addInputRow('Self Assessment Tax Paid', parseFloat(data.taxesPaid?.selfAssessmentTax)||0)

  // Final adjustment for all sheets to ensure content fits (Autofit)
  const autoFit = (sheet) => {
    sheet.columns.forEach((column) => {
      let maxColumnLength = 0
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.isMerged && cell.address !== cell.master.address) return // Skip non-master merged cells
        
        let cellValue = ''
        if (cell.value && typeof cell.value === 'object' && cell.value.result !== undefined) {
           cellValue = cell.value.result.toString()
        } else if (cell.value) {
           cellValue = cell.value.toString()
        }
        
        const columnLength = cellValue.length
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength
        }
      })
      // More generous padding for Meiryo font and bold text
      column.width = Math.min(100, Math.max(column.width || 12, maxColumnLength + 6))
    })
  }

  [sheet1, sheetTax, sheet2, sheet3, sheet4].forEach(sheet => {
    if (sheet) autoFit(sheet)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Tax_Computation_${data.personal?.name ? data.personal.name.replace(/\s+/g, '_') : 'Report'}_${data.personal?.assessmentYear || 'AY'}.xlsx`)
}
