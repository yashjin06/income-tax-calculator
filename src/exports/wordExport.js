import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel, ShadingType } from 'docx'
import { saveAs } from 'file-saver'
import { computeTax } from '../computation/taxEngine'

export const generateWord = async (data) => {
  const results = computeTax(data)
  
  const createTitle = (text, level, color = "333333", align = AlignmentType.LEFT) => {
    return new Paragraph({
      alignment: align,
      spacing: { after: 120 },
      children: [new TextRun({ text, color, bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : 24 })]
    })
  }

  const createCell = (text, isBold = false, align = AlignmentType.LEFT, fill = "FFFFFF", textColor = "000000", isHeader = false) => {
    return new TableCell({
      shading: { type: ShadingType.CLEAR, fill: fill },
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      children: [new Paragraph({ 
        alignment: align, 
        children: [new TextRun({ font: "Meiryo", text: text ? text.toString() : "", bold: isBold || isHeader, color: isHeader ? "FFFFFF" : textColor, size: 22 })] 
      })]
    })
  }

  const createRow = (label, value, isSubtitle = false, valuePrefix = "") => {
    const isBold = isSubtitle || label.includes('TOTAL') || label.includes('NET')
    const bgColor = isSubtitle ? "F1F5F9" : "FFFFFF"
    
    let textVal = ''
    if (value !== undefined && value !== null) {
      if (typeof value === 'number' || !isNaN(value)) {
        let num = Number(value)
        let formatted = Math.abs(num).toLocaleString('en-IN')
        if (valuePrefix === '- ' || num < 0) {
          textVal = `(${formatted})`
        } else {
          textVal = `${valuePrefix}${formatted}`
        }
      } else {
        textVal = `${valuePrefix}${value}`
      }
    }
    
    return new TableRow({
      children: [
        createCell(label, isBold, AlignmentType.LEFT, bgColor),
        createCell(textVal, isBold, AlignmentType.RIGHT, bgColor)
      ]
    })
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Meiryo",
            size: 22,
          },
        },
      },
    },
    sections: [{
      properties: {},
      children: [
        new Paragraph({
           alignment: AlignmentType.CENTER,
           spacing: { after: 200 },
           children: [new TextRun({ text: "INCOME TAX COMPUTATION REPORT", bold: true, size: 36, color: "1E293B" })]
        }),
        new Paragraph({
           alignment: AlignmentType.CENTER,
           spacing: { after: 400 },
           children: [
             new TextRun({ text: `Assessment Year: ${data.personal?.assessmentYear || '2024-25'} | `, size: 22, color: "475569" }),
             new TextRun({ text: `Regime: ${data.personal?.newRegime === 'yes' ? 'New Tax Regime (Sec 115BAC)' : 'Old Tax Regime'}`, size: 22, color: "475569" })
           ]
        }),
        
        createTitle("1. Assessee Profile", HeadingLevel.HEADING_2, "0F172A"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
          },
          rows: [
            new TableRow({ children: [ createCell("Name", true), createCell(": " + (data.personal?.name || '________________')), createCell("PAN", true), createCell(": " + (data.personal?.pan || '__________').toUpperCase()) ] }),
            new TableRow({ children: [ createCell("Address", true), createCell(": " + (data.personal?.address1 || '________________')), createCell("Assessment Year", true), createCell(": " + (data.personal?.assessmentYear || '2024-25')) ] }),
            new TableRow({ children: [ createCell("City", true), createCell(": " + (data.personal?.city || '________________')), createCell("Date of Birth", true), createCell(": " + (data.personal?.dob || 'DD/MM/YYYY')) ] }),
            new TableRow({ children: [ createCell("Status", true), createCell(": " + (`${data.personal?.category || 'Individual'} - ${data.personal?.ageCategory === 'senior' ? 'Senior' : data.personal?.ageCategory === 'superSenior' ? 'Super Senior' : 'Regular'}`)), createCell("Tax Regime", true), createCell(": " + (data.personal?.newRegime === 'yes' ? 'New (115BAC)' : 'Old')) ] })
          ]
        }),

        new Paragraph({ text: "", spacing: { before: 400 } }),
        createTitle("2. Detailed Computation of Income", HeadingLevel.HEADING_2, "0F172A"),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
             top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
             bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
             insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
             left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
             right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
             insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" }
          },
          rows: [
            new TableRow({ children: [createCell("Particulars of Income", true, AlignmentType.LEFT, "F1F5F9", "0F172A", false), createCell("Amount (₹)", true, AlignmentType.RIGHT, "F1F5F9", "0F172A", false)] }),
            
            createRow("1. Income from Salary", "", true),
            createRow("   Gross Salary", (parseFloat(data.salary?.basic)||0) + (parseFloat(data.salary?.da)||0) + (parseFloat(data.salary?.hra)||0)),
            createRow("   Less: Standard Deduction & PT", ""),
            createRow("   Net Taxable Salary", results.netSalary),
            
            createRow("2. Income from House Property", "", true),
            createRow("   Net HP Income (after Set-off)", results.netHouseProperty),

            createRow("3. Profits and Gains of Business/Profession", "", true),
            ...(data.crypto?.treatAsPGBP && (parseFloat(data.crypto?.totalTaxableGain) || 0) > 0 ? [
               createRow("   Normal Business Income", results.netPGBP),
               createRow("   Add: Virtual Digital Assets (Sec 115BBH)", parseFloat(data.crypto.totalTaxableGain)),
               createRow("   Net Income from Business/Profession", results.netPGBP + parseFloat(data.crypto.totalTaxableGain)),
            ] : [
               createRow("   Net Income from Business/Profession", results.netPGBP),
            ]),

            createRow("4. Capital Gains", "", true),
            ...(results.grossSTCG > 0 || results.stcg > 0 ? [
              createRow("   Gross Short Term Capital Gains", results.grossSTCG),
              ...(results.exemptionsSTCG > 0 ? [
                createRow("   Less: Exemptions from STCG", results.exemptionsSTCG),
                createRow("   Net Taxable STCG", results.stcg)
              ] : [])
            ] : []),
            ...(results.grossLTCG > 0 || results.ltcg > 0 ? [
              createRow("   Gross Long Term Capital Gains", results.grossLTCG),
              ...(results.exemptionsLTCG > 0 ? [
                 createRow("   Less: Exemptions from LTCG", results.exemptionsLTCG),
                 createRow("   Net Taxable LTCG", results.ltcg)
              ] : [])
            ] : []),
            ...(!data.crypto?.treatAsPGBP && (parseFloat(data.crypto?.totalTaxableGain) || 0) > 0 ? [
               createRow("   Add: Virtual Digital Assets (Sec 115BBH)", parseFloat(data.crypto.totalTaxableGain))
            ] : []),
            createRow("   Total Taxable Capital Gains", results.stcg + results.ltcg + (!data.crypto?.treatAsPGBP ? (parseFloat(data.crypto?.totalTaxableGain) || 0) : 0)),

            createRow("5. Income from Other Sources", "", true),
            createRow("   Net Taxable Other Sources", results.netOtherSources),
            
            createRow("GROSS TOTAL INCOME (A)", results.grossTotalIncome, true, "₹ ")
          ]
        }),

        new Paragraph({ text: "", spacing: { before: 400 } }),
        createTitle("3. Deductions & Taxable Income", HeadingLevel.HEADING_2, "0F172A"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" }
          },
          rows: [
            createRow("Total Chapter VI-A Deductions", results.totalDeductions, false, "- "),
            createRow("TOTAL TAXABLE INCOME", results.totalTaxableIncome, true, "₹ ")
          ]
        }),

        new Paragraph({ text: "", spacing: { before: 400 } }),
        ...(data.exemptIncome && data.exemptIncome.length > 0 ? [
           createTitle("4. Exempt Incomes", HeadingLevel.HEADING_2, "0F172A"),
           new Table({
             width: { size: 100, type: WidthType.PERCENTAGE },
             borders: {
               top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
               bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
               insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
               left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
               right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
               insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" }
             },
             rows: [
               new TableRow({ children: [createCell("Exempt Income Details u/s 10", true, AlignmentType.LEFT, "F1F5F9", "0F172A", false), createCell("Amount (₹)", true, AlignmentType.RIGHT, "F1F5F9", "0F172A", false)] }),
               ...data.exemptIncome.map(ex => createRow(`${ex.section || 'Sec 10'} - ${ex.description || 'Exempt'}`, parseFloat(ex.amount)||0)),
               createRow("TOTAL EXEMPT INCOME", data.exemptIncome.reduce((acc, curr) => acc + (parseFloat(curr.amount)||0), 0), true)
             ]
           }),
           new Paragraph({ text: "", spacing: { before: 400 } })
        ] : []),

        createTitle("5. Tax Liability Computation & Payment", HeadingLevel.HEADING_2, "0F172A"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" }
          },
          rows: [
            createRow("Tax on Normal Income", results.normalTax),
            createRow("Tax on Special Incomes (STCG/LTCG)", results.specialTax),
            createRow("Total Tax Before Rebate", results.totalTaxBeforeRebate, true),
            createRow("Less: Rebate u/s 87A", results.rebate, false, "- "),
            createRow("Add: Surcharge", results.surcharge, false, "+ "),
            createRow("Tax & Surcharge After Marginal Relief", results.totalTaxBeforeRebate - results.rebate + results.surcharge),
            createRow("Add: Health & Education Cess @ 4%", results.cess, false, "+ "),
            createRow("Total Tax and Cess Payable", results.totalTaxLiability, true, "₹ "),
            ...(!data.taxesPaid?.actualFilingDate ? [
               new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 2,
                      margins: { top: 100, bottom: 100, left: 150, right: 150 },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.LEFT,
                          children: [new TextRun({ font: "Meiryo", text: "Note: Expected ITR filing date is not selected to calculate the actual taxes. Interest u/s 234A/B/C and Fee 234F are not computed.", italics: true, color: "64748B", size: 20 })]
                        })
                      ]
                    })
                  ]
               })
            ] : [
               createRow("Add: Interest u/s 234A (Late Filing)", results.interest234A || 0, false, "+ "),
               createRow("Add: Interest u/s 234B (Adv. Tax Default)", results.interest234B || 0, false, "+ "),
               createRow("Add: Interest u/s 234C (Adv. Tax Deferment)", results.interest234C || 0, false, "+ "),
               createRow("Add: Late Filing Fee u/s 234F", results.fee234F || 0, false, "+ ")
            ]),
            createRow("TOTAL TAX LIABILITY (INCL. INTEREST)", results.finalTaxPayableWithInterest, true, "₹ "),
            createRow("Less: Relief u/s 89 (Arrears of Salary)", 0, false, "- "),
            createRow("Less: Taxes Deducted at Source (TDS/TCS)", results.tdsPaid || 0, false, "- "),
            createRow("Less: Advance Tax Paid", results.advanceTaxPaid || 0, false, "- "),
            createRow("Less: Self Assessment Tax Paid", results.selfAssessmentTaxPaid || 0, false, "- "),
            createRow("NET TAX PAYABLE / (REFUND DUE)", results.netTaxPayable || 0, true, "₹ ")
          ]
        }),

        // --- 6. ANNEXURE: BROUGHT FORWARD LOSSES ---
        ...(() => {
           const bfl = data.broughtForwardLosses || {}
           let bflRows = []
           if (bfl.houseProperty > 0) bflRows.push(createRow("House Property Loss", bfl.houseProperty))
           if (bfl.business > 0) bflRows.push(createRow("Business Loss", bfl.business))
           if (bfl.stcl > 0) bflRows.push(createRow("Short Term Capital Loss", bfl.stcl))
           if (bfl.ltcl > 0) bflRows.push(createRow("Long Term Capital Loss", bfl.ltcl))

           if (bflRows.length > 0) {
              return [
                new Paragraph({ text: "", spacing: { before: 400 } }),
                createTitle("6. Annexure: Brought Forward Losses Declared", HeadingLevel.HEADING_2, "0F172A"),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" } },
                  rows: bflRows
                })
              ]
           }
           return []
        })(),

        // --- 7. ANNEXURE: ADVANCE TAX & INTEREST ---
        ...(() => {
           if (results.totalTaxLiability >= 10000 || results.interest234C > 0) {
              const headerRow = new TableRow({
                 children: [
                    createCell("Instalment", true, AlignmentType.LEFT, "F1F5F9"),
                    createCell("Required", true, AlignmentType.RIGHT, "F1F5F9"),
                    createCell("Period", true, AlignmentType.CENTER, "F1F5F9"),
                    createCell("Interest", true, AlignmentType.RIGHT, "F1F5F9"),
                    createCell("Calculation", true, AlignmentType.RIGHT, "F1F5F9")
                 ]
              });

              const bodyRows = results.interest234CBreakdown.map(row => (
                 new TableRow({
                    children: [
                       createCell(row.label),
                       createCell(row.required.toLocaleString('en-IN'), false, AlignmentType.RIGHT),
                       createCell(row.period, false, AlignmentType.CENTER),
                       createCell(row.interest.toLocaleString('en-IN'), true, AlignmentType.RIGHT),
                       createCell(row.calculation, false, AlignmentType.RIGHT)
                    ]
                 })
              ));

              return [
                new Paragraph({ text: "", spacing: { before: 400 } }),
                createTitle("7. Annexure: Adv. Tax & Sec 234C Interest Breakdown", HeadingLevel.HEADING_2, "0F172A"),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" } },
                  rows: [headerRow, ...bodyRows]
                })
              ]
           }
           return []
        })(),
        
        new Paragraph({
           alignment: AlignmentType.RIGHT,
           spacing: { before: 800 },
           children: [new TextRun({ font: "Meiryo", text: "For Authorized Signatory", size: 24, bold: true, color: "0F172A" })]
        }),
        new Paragraph({
           alignment: AlignmentType.RIGHT,
           spacing: { before: 800 },
           children: [new TextRun({ font: "Meiryo", text: "__________________________", size: 24, color: "0F172A" })]
        })
      ]
    }]
  })

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `Tax_Computation_${data.personal?.name ? data.personal.name.replace(/\s+/g, '_') : 'Report'}_${data.personal?.assessmentYear || 'AY'}.docx`)
  })
}
