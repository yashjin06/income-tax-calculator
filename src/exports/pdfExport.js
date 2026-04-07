import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { computeTax } from '../computation/taxEngine'

export const generatePDF = (data) => {
  const doc = new jsPDF('p', 'pt', 'a4')
  const results = computeTax(data)
  
  // Set default font to Helvetica (closest standard sans-serif to Meiryo without external TTF loading)
  // FontSize 11 per strict requirement
  const baseFontSize = 11
  
  // Custom styling functions for CompuTax strict boxed look
  const tableStyles = {
    theme: 'grid',
    styles: { 
      fontSize: baseFontSize, 
      font: 'helvetica', 
      textColor: [0, 0, 0], 
      lineColor: [0, 0, 0], 
      lineWidth: 0.5, 
      cellPadding: 4,
      valign: 'middle'
    },
    headStyles: { 
      fillColor: [241, 245, 249], // Slate 50
      textColor: [15, 23, 42],    // Slate 900
      fontStyle: 'bold', 
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    columnStyles: { 
      0: { cellWidth: 380, halign: 'left' }, 
      1: { cellWidth: 135, halign: 'right' } 
    },
    margin: { left: 40, right: 40 }
  }
  
  // --- HEADER ---
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59) // Slate 800
  doc.text("INCOME TAX COMPUTATION REPORT", doc.internal.pageSize.width / 2, 40, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text(`Assessment Year: ${data.personal?.assessmentYear || '2024-25'}  |  Regime: ${data.personal?.newRegime === 'yes' ? 'New (115BAC)' : 'Old'}`, doc.internal.pageSize.width / 2, 55, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
  
  // --- 1. ASSESSEE DETAILS (BOXED - COMPRESSION FORMAT) ---
  autoTable(doc, {
    startY: 75,
    body: [
      ['Name', ':', data.personal?.name || '________________', 'PAN Number', ':', (data.personal?.pan || '__________').toUpperCase()],
      ['Address', ':', data.personal?.address1 || '________________', 'Assessment Year', ':', data.personal?.assessmentYear || '2024-25'],
      ['City', ':', data.personal?.city || '________________', 'Date of Birth', ':', data.personal?.dob || 'DD/MM/YYYY'],
      ['Status', ':', `${data.personal?.category || 'Individual'} - ${data.personal?.ageCategory === 'senior' ? 'Senior' : data.personal?.ageCategory === 'superSenior' ? 'Super Senior' : 'Regular'}`, 'Tax Regime', ':', data.personal?.newRegime === 'yes' ? 'New (115BAC)' : 'Old']
    ],
    theme: 'plain',
    styles: { fontSize: baseFontSize, font: 'helvetica', textColor: [0, 0, 0], cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 80 }, 
      1: { cellWidth: 10 }, 
      2: { cellWidth: 170 }, 
      3: { fontStyle: 'bold', cellWidth: 90 }, 
      4: { cellWidth: 10 }, 
      5: { cellWidth: 155 }
    },
    margin: { left: 40, right: 40 },
    didDrawPage: function(dataSettings) {
      // Draw outer boundary box for the profile section
      doc.setDrawColor(0)
      doc.setLineWidth(0.5)
      doc.rect(dataSettings.settings.margin.left, 70, 515, dataSettings.cursor.y - 65)
    }
  })

  // --- 2. DETAILED COMPUTATION OF INCOME ---
  const incomeBody = []
  
  // Salary
  incomeBody.push([{ content: '1. Income from Salaries', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }])
  const grossSal = (parseFloat(data.salary?.basic)||0) + (parseFloat(data.salary?.da)||0) + (parseFloat(data.salary?.hra)||0) + (parseFloat(data.salary?.otherAllowances)||0) + (parseFloat(data.salary?.perquisites)||0)
  incomeBody.push(['   Gross Salary', grossSal.toLocaleString('en-IN')])
  const isNewRegime = data.personal?.newRegime === 'yes'
  const isLatest = data.personal?.assessmentYear === '2025-26' || data.personal?.assessmentYear === '2026-27'
  const stdDedMax = (isNewRegime && isLatest) ? 75000 : 50000
  const stdDedAmt = Math.round(Math.min(stdDedMax, grossSal));
  incomeBody.push([`   Less: Standard Deduction u/s 16(ia)`, stdDedAmt > 0 ? `(${stdDedAmt.toLocaleString('en-IN')})` : '0'])
  let ptAmt = parseFloat(data.salary?.pt) || 0;
  if (ptAmt > 0) incomeBody.push(['   Less: Professional Tax', `(${Math.round(ptAmt).toLocaleString('en-IN')})`])
  incomeBody.push([{ content: '   Net Taxable Salary', styles: { fontStyle: 'bold' } }, { content: results.netSalary.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])
  
  // House Property
  incomeBody.push([{ content: '2. Income from House Property', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }])
  if (data.houseProperty && data.houseProperty.length > 0) {
      data.houseProperty.forEach((hp, idx) => {
         incomeBody.push([`   Property ${idx + 1} (${hp.type}) - Net Value`, (hp.type === 'self-occupied' ? -(parseFloat(hp.interestOnLoan) || 0) : ((parseFloat(hp.grossAnnualValue)||0)*0.7 - (parseFloat(hp.interestOnLoan)||0))).toLocaleString('en-IN') ])
      })
  }
  incomeBody.push([{ content: '   Net Income from House Property', styles: { fontStyle: 'bold' } }, { content: results.netHouseProperty < 0 ? `(${Math.abs(results.netHouseProperty).toLocaleString('en-IN')})` : results.netHouseProperty.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])

  // PGBP
  incomeBody.push([{ content: '3. Profits and Gains of Business / Profession', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }])
  const vda = parseFloat(data.crypto?.totalTaxableGain) || 0;
  if (data.crypto?.treatAsPGBP && vda > 0) {
      incomeBody.push(['   Normal Business Income', results.netPGBP.toLocaleString('en-IN')])
      incomeBody.push(['   Add: Virtual Digital Assets (Crypto)', vda.toLocaleString('en-IN')])
      incomeBody.push([{ content: '   Net Income from Business/Profession', styles: { fontStyle: 'bold' } }, { content: (results.netPGBP + vda).toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])
  } else {
      incomeBody.push([{ content: '   Net Income from Business/Profession', styles: { fontStyle: 'bold' } }, { content: results.netPGBP.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])
  }
  // Capital Gains
  if (results.grossSTCG > 0 || results.grossLTCG > 0 || results.stcg > 0 || results.ltcg > 0 || (!data.crypto?.treatAsPGBP && vda > 0)) {
      incomeBody.push([{ content: '4. Capital Gains', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }])
      if (results.stcg > 0 || results.grossSTCG > 0) {
          incomeBody.push(['   Gross Short Term Capital Gains', results.grossSTCG.toLocaleString('en-IN')])
          if (results.exemptionsSTCG > 0) {
              incomeBody.push(['   Less: Exemptions from STCG', results.exemptionsSTCG > 0 ? `(${results.exemptionsSTCG.toLocaleString('en-IN')})` : '0'])
              incomeBody.push(['   Net Taxable Short Term Capital Gains', results.stcg.toLocaleString('en-IN')])
          } else if (results.grossSTCG !== results.stcg) {
              incomeBody.push(['   Net Taxable Short Term Capital Gains', results.stcg.toLocaleString('en-IN')])
          }
      }
      if (results.ltcg > 0 || results.grossLTCG > 0) {
          incomeBody.push(['   Gross Long Term Capital Gains', results.grossLTCG.toLocaleString('en-IN')])
          if (results.exemptionsLTCG > 0) {
              incomeBody.push(['   Less: Exemptions from LTCG (e.g. Sec 54/54EC/54F)', results.exemptionsLTCG > 0 ? `(${results.exemptionsLTCG.toLocaleString('en-IN')})` : '0'])
              incomeBody.push(['   Net Taxable Long Term Capital Gains', results.ltcg.toLocaleString('en-IN')])
          } else if (results.grossLTCG !== results.ltcg) {
              incomeBody.push(['   Net Taxable Long Term Capital Gains', results.ltcg.toLocaleString('en-IN')])
          }
      }
      if (!data.crypto?.treatAsPGBP && vda > 0) {
          incomeBody.push(['   Add: Virtual Digital Assets (Crypto)', vda.toLocaleString('en-IN')])
      }
      incomeBody.push([{ content: '   Total Taxable Capital Gains', styles: { fontStyle: 'bold' } }, { content: (results.stcg + results.ltcg + (!data.crypto?.treatAsPGBP ? vda : 0)).toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])
  } else {
      incomeBody.push([{ content: '4. Capital Gains', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }])
      incomeBody.push([{ content: '   Total Capital Gains', styles: { fontStyle: 'bold' } }, { content: '0', styles: { fontStyle: 'bold' } }])
  }

  // Other Sources
  incomeBody.push([{ content: '5. Income from Other Sources', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }])
  incomeBody.push([{ content: '   Net Income from Other Sources', styles: { fontStyle: 'bold' } }, { content: results.netOtherSources.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])

  // GTI
  incomeBody.push([{ content: 'GROSS TOTAL INCOME (A)', styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } }, { content: results.grossTotalIncome.toLocaleString('en-IN'), styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } }])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Particulars of Income', 'Amount (Rs.)']],
    body: incomeBody,
    ...tableStyles
  })

  // --- 3. DEDUCTIONS ---
  const dedBody = []
  dedBody.push(['Less: Deductions under Chapter VI-A', ''])
  if (!isNewRegime) {
      const ccc = ((parseFloat(data.deductions?.sec80c)||0) + (parseFloat(data.deductions?.sec80ccc)||0) + (parseFloat(data.deductions?.sec80ccd1)||0))
      if (ccc > 0) dedBody.push([`   Sec 80C, 80CCC, 80CCD(1)`, ccc.toLocaleString('en-IN')])
      const d = parseFloat(data.deductions?.sec80d)||0
      if (d > 0) dedBody.push([`   Sec 80D (Health Insurance)`, d.toLocaleString('en-IN')])
      const g = parseFloat(data.deductions?.sec80g)||0
      if (g > 0) dedBody.push([`   Sec 80G (Donations)`, g.toLocaleString('en-IN')])
      const t = (parseFloat(data.deductions?.sec80tta)||0) + (parseFloat(data.deductions?.sec80ttb)||0)
      if (t > 0) dedBody.push([`   Sec 80TTA/80TTB`, t.toLocaleString('en-IN')])
  }
  const ccd2 = parseFloat(data.deductions?.sec80ccd2)||0
  if (ccd2 > 0) dedBody.push([`   Sec 80CCD(2) (Employer NPS)`, ccd2.toLocaleString('en-IN')])
  
  dedBody.push([{ content: 'TOTAL DEDUCTIONS (B)', styles: { fontStyle: 'bold' } }, { content: results.totalDeductions.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])
  
  dedBody.push([{ content: 'TOTAL TAXABLE INCOME (A - B) Rounded off u/s 288A', styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } }, { content: results.totalTaxableIncome.toLocaleString('en-IN'), styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } }])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    body: dedBody,
    ...tableStyles
  })

  // --- 4. EXEMPT INCOMES ---
  const exemptList = Array.isArray(data.exemptIncome) ? data.exemptIncome : []
  if (exemptList.length > 0) {
    const exBody = []
    exemptList.forEach(ex => {
       exBody.push([`${ex.section || 'Sec 10'} - ${ex.description || 'Exempt Income'}`, (parseFloat(ex.amount)||0).toLocaleString('en-IN') ])
    })
    const totalEx = exemptList.reduce((acc, curr) => acc + (parseFloat(curr.amount)||0), 0)
    exBody.push([{ content: 'TOTAL EXEMPT INCOME', styles: { fontStyle: 'bold' } }, { content: totalEx.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }])
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Exempt Incomes u/s 10', 'Amount (Rs.)']],
      body: exBody,
      ...tableStyles
    })
  }

  // --- 5. TAX COMPUTATION & PAYMENT ---
  const taxBody = [
    ['Tax on Total Income', results.normalTax.toLocaleString('en-IN')],
    ['Tax on Special Incomes (STCG/LTCG/Winnings)', results.specialTax.toLocaleString('en-IN')],
    [{ content: 'Total Tax', styles: { fontStyle: 'bold' } }, { content: results.totalTaxBeforeRebate.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }],
    ['Less: Rebate u/s 87A', results.rebate > 0 ? `(${results.rebate.toLocaleString('en-IN')})` : '0'],
    ['Add: Surcharge', results.surcharge.toLocaleString('en-IN')],
    ['Tax & Surcharge After Marginal Relief', (results.totalTaxBeforeRebate - results.rebate + results.surcharge).toLocaleString('en-IN')],
    ['Add: Health and Education Cess @ 4%', results.cess.toLocaleString('en-IN')],
    [{ content: 'Total Tax and Cess Payable', styles: { fontStyle: 'bold' } }, { content: results.totalTaxLiability.toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }],
    ['Less: Relief u/s 89 (Arrears of Salary)', '0'],
    ['Less: Taxes Deducted at Source (TDS/TCS)', results.tdsPaid > 0 ? `(${(results.tdsPaid || 0).toLocaleString('en-IN')})` : '0'],
    ['Less: Advance Tax Paid', results.advanceTaxPaid > 0 ? `(${(results.advanceTaxPaid || 0).toLocaleString('en-IN')})` : '0'],
    ['Less: Self Assessment Tax Paid', results.selfAssessmentTaxPaid > 0 ? `(${(results.selfAssessmentTaxPaid || 0).toLocaleString('en-IN')})` : '0'],
    [{ content: 'NET TAX PAYABLE / (REFUND DUE)', styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } }, { content: results.netTaxPayable < 0 ? `(${Math.abs(results.netTaxPayable).toLocaleString('en-IN')})` : results.netTaxPayable.toLocaleString('en-IN'), styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } }]
  ]

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Tax Computation & Payments', 'Amount (Rs.)']],
    body: taxBody,
    ...tableStyles
  })

  // --- 6. ANNEXURE: BROUGHT FORWARD LOSSES ---
  const bfl = data.broughtForwardLosses || {}
  if (bfl.houseProperty > 0 || bfl.business > 0 || bfl.stcl > 0 || bfl.ltcl > 0) {
     const bflBody = []
     if (bfl.houseProperty > 0) bflBody.push(['House Property Loss', bfl.houseProperty.toLocaleString('en-IN'), 'Set-off against House Property Income'])
     if (bfl.business > 0) bflBody.push(['Business Loss', bfl.business.toLocaleString('en-IN'), 'Set-off against PGBP'])
     if (bfl.stcl > 0) bflBody.push(['Short Term Capital Loss', bfl.stcl.toLocaleString('en-IN'), 'Set-off against STCG/LTCG'])
     if (bfl.ltcl > 0) bflBody.push(['Long Term Capital Loss', bfl.ltcl.toLocaleString('en-IN'), 'Set-off against LTCG only'])

     autoTable(doc, {
       startY: doc.lastAutoTable.finalY + 15,
       head: [['Annexure 1: Brought Forward Losses Declared', 'Amount (Rs.)', 'Treatment Rule Applied']],
       body: bflBody,
       ...tableStyles,
       columnStyles: { 
         0: { cellWidth: 150, halign: 'left' }, 
         1: { cellWidth: 100, halign: 'right' },
         2: { cellWidth: 265, halign: 'left' } 
       }
     })
  }

  // --- 7. ANNEXURE: ADVANCE TAX DUES ---
  if (results.totalTaxLiability >= 10000) {
     const isPresumptiveOpted = data.business?.presumptive?.isOpting === 'yes'
     const presumptiveNature = data.business?.presumptive?.nature
     const isEligiblePresumptive = isPresumptiveOpted && (presumptiveNature === '44AD' || presumptiveNature === '44ADA')

     let presumptiveTax = 0;
     let otherTax = results.totalTaxLiability;
     
     if (isEligiblePresumptive && results.grossTotalIncome > 0) {
         const ratio = Math.max(0, Math.min(1, (results.presumptiveIncome || 0) / results.grossTotalIncome));
         presumptiveTax = Math.round(results.totalTaxLiability * ratio);
         otherTax = Math.max(0, results.totalTaxLiability - presumptiveTax);
     }

     let advanceTaxBody = [];
     if (isEligiblePresumptive && presumptiveTax > 0) {
         if (otherTax > 0) {
             advanceTaxBody = [
                ['15% of Non-Presumptive', '15th June', Math.round(otherTax * 0.15).toLocaleString('en-IN')],
                ['45% of Non-Presumptive', '15th September', Math.round(otherTax * 0.45).toLocaleString('en-IN')],
                ['75% of Non-Presumptive', '15th December', Math.round(otherTax * 0.75).toLocaleString('en-IN')],
                ['100% of Total Tax', '15th March', (Math.round(otherTax * 1.0) + presumptiveTax).toLocaleString('en-IN')],
             ];
         } else {
             advanceTaxBody = [
                ['100% of Total Tax', '15th March', presumptiveTax.toLocaleString('en-IN')]
             ];
         }
     } else {
         advanceTaxBody = [
            ['15% of Tax Liability', '15th June', Math.round(results.totalTaxLiability * 0.15).toLocaleString('en-IN')],
            ['45% of Tax Liability', '15th September', Math.round(results.totalTaxLiability * 0.45).toLocaleString('en-IN')],
            ['75% of Tax Liability', '15th December', Math.round(results.totalTaxLiability * 0.75).toLocaleString('en-IN')],
            ['100% of Tax Liability', '15th March', Math.round(results.totalTaxLiability * 1.00).toLocaleString('en-IN')]
         ];
     }

     autoTable(doc, {
       startY: doc.lastAutoTable.finalY + 15,
       head: [['Annexure 2: Advance Tax Installment Schedule (Sec 234C)', 'Due Date', 'Amount (Rs.)']],
       body: advanceTaxBody,
       ...tableStyles,
       columnStyles: { 
         0: { cellWidth: 200, halign: 'left' }, 
         1: { cellWidth: 150, halign: 'center' },
         2: { cellWidth: 165, halign: 'right' } 
       }
     })
  }

  // Authorized Signatory Block
  const finalY = doc.lastAutoTable.finalY + 40;
  if (finalY > 750) {
      doc.addPage();
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("For Authorized Signatory", doc.internal.pageSize.width - 40, 60, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text("__________________________", doc.internal.pageSize.width - 40, 100, { align: 'right' });
  } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("For Authorized Signatory", doc.internal.pageSize.width - 40, finalY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text("__________________________", doc.internal.pageSize.width - 40, finalY + 40, { align: 'right' });
  }

  // Save the PDF
  doc.save(`Tax_Computation_${data.personal?.name ? data.personal.name.replace(/\s+/g, '_') : 'Report'}_${data.personal?.assessmentYear || 'AY'}.pdf`)
}
