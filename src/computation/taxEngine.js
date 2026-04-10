export const computeTax = (data) => {
  const { personal, salary, houseProperty, business, capitalGains, otherSources, deductions } = data
  const isNewRegime = personal.newRegime === 'yes'
  const assessmentYear = personal.assessmentYear

  const isLatestBudget = assessmentYear === '2025-26' || assessmentYear === '2026-27'
  const maxStandardDeduction = (isNewRegime && isLatestBudget) ? 75000 : 50000

  // 1. Income from Salary
  const grossSalary = (parseFloat(salary.basic) || 0) + (parseFloat(salary.da) || 0) + (parseFloat(salary.hra) || 0) + (parseFloat(salary.lta) || 0) + (parseFloat(salary.otherAllowances) || 0) + (parseFloat(salary.commutedPension) || 0) + (parseFloat(salary.perquisites) || 0) + (parseFloat(salary.profitInLieu) || 0)
  const stdDeduction = Math.min(maxStandardDeduction, grossSalary)
  const pt = parseFloat(salary.pt) || 0
  const entAllow = parseFloat(salary.entAllow) || 0
  let netSalary = Math.max(0, grossSalary - stdDeduction - pt - entAllow)
  
  // 2. Income from House Property
  let netHouseProperty = 0
  let selfOccupiedInterest = 0
  if (Array.isArray(houseProperty)) {
    houseProperty.forEach(p => {
      if (p.type === 'self-occupied') {
        const intAmt = (parseFloat(p.interestOnLoan) || 0) + (parseFloat(p.preConstructionInterest) || 0)
        selfOccupiedInterest += intAmt
      } else {
        const nav = Math.max(0, (parseFloat(p.grossAnnualValue) || 0) - (parseFloat(p.municipalTaxes) || 0))
        const d24a = nav * 0.3
        const d24b = (parseFloat(p.interestOnLoan) || 0) + (parseFloat(p.preConstructionInterest) || 0)
        netHouseProperty += (nav - d24a - d24b)
      }
    })
  }

  // Max 2 lakhs loss from HP can be set off. For Self-occupied, max interest deduction is 2 lakhs.
  // Wait, under New Regime, interest on self-occupied property is not allowed to be set off.
  if (isNewRegime) {
     selfOccupiedInterest = 0
  } else {
     selfOccupiedInterest = Math.min(200000, selfOccupiedInterest)
  }
  netHouseProperty -= selfOccupiedInterest

  // Set-off of HP loss against other heads is restricted to 2 lakhs.
  let housePropertyLossToSetOff = 0
  let housePropertyCarryForward = 0
  if (netHouseProperty < 0) {
    let absLoss = Math.abs(netHouseProperty)
    housePropertyLossToSetOff = Math.min(200000, absLoss)
    housePropertyCarryForward = absLoss - housePropertyLossToSetOff
    // We will apply this globally
    netHouseProperty = 0
  }

  const bfl = data.broughtForwardLosses || { houseProperty: 0, business: 0, stcl: 0, ltcl: 0 }

  if (netHouseProperty > 0 && bfl.houseProperty > 0) {
      const setoff = Math.min(netHouseProperty, bfl.houseProperty)
      netHouseProperty -= setoff
      housePropertyCarryForward += (bfl.houseProperty - setoff)
  } else if (bfl.houseProperty > 0) {
      housePropertyCarryForward += bfl.houseProperty
  }

  // 3. Profits and Gains of Business or Profession (PGBP)
  const pgbp = business || { pnl: {}, adjustments: {}, presumptive: {} }
  const totalRevenue = (parseFloat(pgbp.pnl?.revenueOperations) || 0) + (parseFloat(pgbp.pnl?.otherIncome) || 0) + (parseFloat(pgbp.pnl?.closingStock) || 0)
  const totalExpenses = (parseFloat(pgbp.pnl?.openingStock) || 0) + (parseFloat(pgbp.pnl?.purchases) || 0) + (parseFloat(pgbp.pnl?.directExpenses) || 0) + (parseFloat(pgbp.pnl?.employeeBenefits) || 0) + (parseFloat(pgbp.pnl?.financeCosts) || 0) + (parseFloat(pgbp.pnl?.depreciation) || 0) + (parseFloat(pgbp.pnl?.otherExpenses) || 0)
  const np = totalRevenue - totalExpenses
  
  const additions = (parseFloat(pgbp.adjustments?.depreciationCompanies) || 0) + (parseFloat(pgbp.adjustments?.disallowances) || 0) + (parseFloat(pgbp.adjustments?.personalExpenses) || 0) + (parseFloat(pgbp.adjustments?.otherAdditions) || 0)
  const deds = (parseFloat(pgbp.adjustments?.depreciationIT) || 0) + (parseFloat(pgbp.adjustments?.otherDeductions) || 0)
  
  let presumptiveIncome = 0
  if (pgbp.presumptive?.isOpting === 'yes') {
     const p = pgbp.presumptive
     if (p.nature === '44AD') {
         const minProfit = (parseFloat(p.turnoverDigital) || 0) * 0.06 + (parseFloat(p.turnoverNonDigital) || 0) * 0.08
         presumptiveIncome = Math.max(minProfit, parseFloat(p.declaredProfit44AD) || 0)
     } else if (p.nature === '44ADA') {
         const minProfit = (parseFloat(p.grossReceipts44ADA) || 0) * 0.50
         presumptiveIncome = Math.max(minProfit, parseFloat(p.declaredProfit44ADA) || 0)
     } else if (p.nature === '44AE') {
         const heavy = (parseFloat(p.heavyVehicles) || 0)
         const heavyM = (parseFloat(p.heavyVehiclesMonths) || 0)
         const heavyT = (parseFloat(p.heavyVehiclesTonnage) || 0)
         const light = (parseFloat(p.lightVehicles) || 0)
         const lightM = (parseFloat(p.lightVehiclesMonths) || 0)
         const minProfit = (heavy * heavyM * heavyT * 1000) + (light * lightM * 7500)
         presumptiveIncome = Math.max(minProfit, parseFloat(p.declaredProfit44AE) || 0)
     }
  }
  
  let netPGBP = np + additions - deds + presumptiveIncome
  let businessCarryForward = 0
  if (netPGBP < 0) {
      businessCarryForward = Math.abs(netPGBP)
      netPGBP = 0
  }
  
  if (netPGBP > 0 && bfl.business > 0) {
      const setoff = Math.min(netPGBP, bfl.business)
      netPGBP -= setoff
      businessCarryForward += (bfl.business - setoff)
  } else if (bfl.business > 0) {
      businessCarryForward += bfl.business
  }

  // 4. Capital Gains
  let stcg20 = parseFloat(capitalGains?.stcg_20) || 0
  let stcgNormal = parseFloat(capitalGains?.stcg_normal) || 0
  let ltcg125Equity = parseFloat(capitalGains?.ltcg_125_equity) || 0
  let ltcg20 = parseFloat(capitalGains?.ltcg_20) || 0
  let ltcg125Other = parseFloat(capitalGains?.ltcg_125_other) || 0
  
  // Tracking for UI/Exports
  let grossSTCG = parseFloat(capitalGains?.gross_stcg) || (stcg20 + stcgNormal)
  let exemptionsSTCG = parseFloat(capitalGains?.exemptions_stcg) || 0
  let netSTCG = stcg20 + stcgNormal
  
  let grossLTCG = parseFloat(capitalGains?.gross_ltcg) || (ltcg125Equity + ltcg20 + ltcg125Other)
  let exemptionsLTCG = parseFloat(capitalGains?.exemptions_ltcg) || 0
  let netLTCG = ltcg125Equity + ltcg20 + ltcg125Other

  // Handle negative capital gains (Current Year Losses)
  let currentSTCL = 0;
  if (stcg20 < 0) { currentSTCL += Math.abs(stcg20); stcg20 = 0; }
  if (stcgNormal < 0) { currentSTCL += Math.abs(stcgNormal); stcgNormal = 0; }

  let currentLTCL = 0;
  if (ltcg125Equity < 0) { currentLTCL += Math.abs(ltcg125Equity); ltcg125Equity = 0; }
  if (ltcg20 < 0) { currentLTCL += Math.abs(ltcg20); ltcg20 = 0; }
  if (ltcg125Other < 0) { currentLTCL += Math.abs(ltcg125Other); ltcg125Other = 0; }

  // Set-off of Brought Forward Capital Losses combined with Current Year Capital Losses
  let remainingLTCL = (parseFloat(bfl.ltcl) || 0) + currentLTCL
  let remainingSTCL = (parseFloat(bfl.stcl) || 0) + currentSTCL

  // LTCL only against LTCG
  if (remainingLTCL > 0 && ltcg20 > 0) { const off = Math.min(remainingLTCL, ltcg20); ltcg20 -= off; remainingLTCL -= off; }
  if (remainingLTCL > 0 && ltcg125Other > 0) { const off = Math.min(remainingLTCL, ltcg125Other); ltcg125Other -= off; remainingLTCL -= off; }
  if (remainingLTCL > 0 && ltcg125Equity > 0) { const off = Math.min(remainingLTCL, ltcg125Equity); ltcg125Equity -= off; remainingLTCL -= off; }

  // STCL against STCG or LTCG
  if (remainingSTCL > 0 && stcg20 > 0) { const off = Math.min(remainingSTCL, stcg20); stcg20 -= off; remainingSTCL -= off; }
  if (remainingSTCL > 0 && stcgNormal > 0) { const off = Math.min(remainingSTCL, stcgNormal); stcgNormal -= off; remainingSTCL -= off; }
  if (remainingSTCL > 0 && ltcg20 > 0) { const off = Math.min(remainingSTCL, ltcg20); ltcg20 -= off; remainingSTCL -= off; }
  if (remainingSTCL > 0 && ltcg125Other > 0) { const off = Math.min(remainingSTCL, ltcg125Other); ltcg125Other -= off; remainingSTCL -= off; }
  if (remainingSTCL > 0 && ltcg125Equity > 0) { const off = Math.min(remainingSTCL, ltcg125Equity); ltcg125Equity -= off; remainingSTCL -= off; }

  let taxableLtcg125Equity = Math.max(0, ltcg125Equity - 125000) // Exemption up to 1.25L as per new budget
  
  // 5. Income from Other Sources
  const os = otherSources || {}
  const winnings = parseFloat(os.winnings) || 0
  const dividend = parseFloat(os.dividend) || 0
  const agriIncome = parseFloat(os.agriculturalIncome) || 0
  
  const familyPension = parseFloat(os.familyPension) || 0
  
  let maxFamilyPensionDed = 15000
  if (assessmentYear === '2025-26' || assessmentYear === '2026-27') {
      maxFamilyPensionDed = 25000
  }
  const familyPensionDed = Math.min(familyPension / 3, maxFamilyPensionDed)
  const netFamilyPension = familyPension - familyPensionDed

  let normalOS = (parseFloat(os.savingsInterest) || 0) + (parseFloat(os.fdInterest) || 0) + dividend + (parseFloat(os.gifts) || 0) + netFamilyPension + (parseFloat(os.otherIncome) || 0) - (parseFloat(os.expenses) || 0)
  normalOS = Math.max(0, normalOS)
  let netOtherSources = normalOS + winnings

  // 6. Virtual Digital Assets (Crypto)
  const crypto = data.crypto || {}
  const vdaIncome = parseFloat(crypto.totalTaxableGain) || 0

  // Gross Total Income
  let totalNormalIncome = netSalary + netHouseProperty + netPGBP + stcgNormal + normalOS
  
  // Apply HP Loss
  if (housePropertyLossToSetOff > 0) {
    totalNormalIncome = Math.max(0, totalNormalIncome - housePropertyLossToSetOff)
  }

  const grossTotalIncome = totalNormalIncome + stcg20 + taxableLtcg125Equity + ltcg125Other + ltcg20 + winnings + vdaIncome

  // Deductions Chapter VI-A
  let totalDeductions = 0
  const sec80ccd2 = parseFloat(deductions?.sec80ccd2) || 0
  const sec80cch = parseFloat(deductions?.sec80cch) || 0

  if (!isNewRegime) {
      const c_ccc_ccd1 = (parseFloat(deductions?.sec80c) || 0) + (parseFloat(deductions?.sec80ccc) || 0) + (parseFloat(deductions?.sec80ccd1) || 0)
      const limited80C = Math.min(150000, c_ccc_ccd1)
      const limited80CCD1B = Math.min(50000, (parseFloat(deductions?.sec80ccd1b) || 0))
      
      const others = (parseFloat(deductions?.sec80d) || 0) + (parseFloat(deductions?.sec80e) || 0) + (parseFloat(deductions?.sec80g) || 0) + (parseFloat(deductions?.sec80dd) || 0) + (parseFloat(deductions?.sec80ddb) || 0) + (parseFloat(deductions?.otherDeductions) || 0)
      
      // 80TTA / 80TTB
      let sec80tta = 0
      let sec80ttb = 0
      if (personal.ageCategory !== 'below60') {
         sec80ttb = Math.min(50000, parseFloat(deductions?.sec80ttb) || 0)
      } else {
         sec80tta = Math.min(10000, parseFloat(deductions?.sec80tta) || 0)
      }

      totalDeductions = limited80C + limited80CCD1B + others + sec80tta + sec80ttb + sec80ccd2 + sec80cch
  } else {
      if (assessmentYear !== '2023-24') {
          totalDeductions = sec80ccd2 + sec80cch // Only Employer NPS and Agniveer allowed under New Scheme
      }
  }
  
  // Deductions can't be more than normal income
  totalDeductions = Math.min(totalDeductions, totalNormalIncome)
  let taxableNormalIncome = Math.max(0, totalNormalIncome - totalDeductions)

  const totalTaxableIncome = taxableNormalIncome + stcg20 + taxableLtcg125Equity + ltcg125Other + ltcg20 + winnings + vdaIncome

  // --- HELPER FOR TAX ON SPECIFIED INCOME (For Marginal Relief) ---
  const getNormalTaxOn = (inc) => {
     let tax = 0
     if (isNewRegime) {
        let remaining = inc
        if (assessmentYear === '2026-27') {
           if (remaining > 2400000) { tax += (remaining - 2400000) * 0.3; remaining = 2400000 }
           if (remaining > 2000000) { tax += (remaining - 2000000) * 0.25; remaining = 2000000 }
           if (remaining > 1600000) { tax += (remaining - 1600000) * 0.2; remaining = 1600000 }
           if (remaining > 1200000) { tax += (remaining - 1200000) * 0.15; remaining = 1200000 }
           if (remaining > 800000) { tax += (remaining - 800000) * 0.1; remaining = 800000 }
           if (remaining > 400000) { tax += (remaining - 400000) * 0.05 }
        } else if (assessmentYear === '2025-26') {
           if (remaining > 1500000) { tax += (remaining - 1500000) * 0.3; remaining = 1500000 }
           if (remaining > 1200000) { tax += (remaining - 1200000) * 0.2; remaining = 1200000 }
           if (remaining > 1000000) { tax += (remaining - 1000000) * 0.15; remaining = 1000000 }
           if (remaining > 700000) { tax += (remaining - 700000) * 0.1; remaining = 700000 }
           if (remaining > 300000) { tax += (remaining - 300000) * 0.05 }
        } else {
           if (remaining > 1500000) { tax += (remaining - 1500000) * 0.3; remaining = 1500000 }
           if (remaining > 1200000) { tax += (remaining - 1200000) * 0.2; remaining = 1200000 }
           if (remaining > 900000) { tax += (remaining - 900000) * 0.15; remaining = 900000 }
           if (remaining > 600000) { tax += (remaining - 600000) * 0.1; remaining = 600000 }
           if (remaining > 300000) { tax += (remaining - 300000) * 0.05 }
        }
     } else {
        let exemptionLimit = 250000
        if (personal.ageCategory === 'senior') exemptionLimit = 300000
        if (personal.ageCategory === 'superSenior') exemptionLimit = 500000
        let remaining = inc
        if (remaining > 1000000) { tax += (remaining - 1000000) * 0.3; remaining = 1000000 }
        if (remaining > 500000) { tax += (remaining - 500000) * 0.2; remaining = 500000 }
        if (remaining > exemptionLimit) { tax += (remaining - exemptionLimit) * 0.05 }
     }
     return tax
  }

  // --- COMPUTE TAX WITH AGRICULTURAL PARTIAL INTEGRATION ---
  let normalTax = 0
  let exemptionLimitForAgri = 250000
  if (isNewRegime) {
     if (assessmentYear === '2026-27') exemptionLimitForAgri = 400000
     else if (assessmentYear === '2025-26') exemptionLimitForAgri = 300000
     else exemptionLimitForAgri = 300000
  } else {
     if (personal.ageCategory === 'superSenior') exemptionLimitForAgri = 500000
     else if (personal.ageCategory === 'senior') exemptionLimitForAgri = 300000
  }

  if (agriIncome > 5000 && taxableNormalIncome > exemptionLimitForAgri) {
      let taxOnBoth = getNormalTaxOn(taxableNormalIncome + agriIncome)
      let taxOnAgriWithBasic = getNormalTaxOn(exemptionLimitForAgri + agriIncome)
      normalTax = Math.max(0, taxOnBoth - taxOnAgriWithBasic)
  } else {
      normalTax = getNormalTaxOn(taxableNormalIncome)
  }

  let taxBreakup = []
  
  if (isNewRegime) {
     let remaining = taxableNormalIncome
     if (assessmentYear === '2026-27') {
        if (remaining > 2400000) { const amt = remaining - 2400000; taxBreakup.unshift({ slab: 'Above 24,00,000', rate: '30%', amount: amt, tax: amt * 0.3 }); remaining = 2400000; }
        if (remaining > 2000000) { const amt = remaining - 2000000; taxBreakup.unshift({ slab: '20,00,001 - 24,00,000', rate: '25%', amount: amt, tax: amt * 0.25 }); remaining = 2000000; }
        if (remaining > 1600000) { const amt = remaining - 1600000; taxBreakup.unshift({ slab: '16,00,001 - 20,00,000', rate: '20%', amount: amt, tax: amt * 0.2 }); remaining = 1600000; }
        if (remaining > 1200000) { const amt = remaining - 1200000; taxBreakup.unshift({ slab: '12,00,001 - 16,00,000', rate: '15%', amount: amt, tax: amt * 0.15 }); remaining = 1200000; }
        if (remaining > 800000) { const amt = remaining - 800000; taxBreakup.unshift({ slab: '8,00,001 - 12,00,000', rate: '10%', amount: amt, tax: amt * 0.1 }); remaining = 800000; }
        if (remaining > 400000) { const amt = remaining - 400000; taxBreakup.unshift({ slab: '4,00,001 - 8,00,000', rate: '5%', amount: amt, tax: amt * 0.05 }); remaining = 400000; }
        if (remaining > 0) { taxBreakup.unshift({ slab: 'Upto 4,00,000', rate: '0%', amount: remaining, tax: 0 }); }
     } else if (assessmentYear === '2025-26') {
        if (remaining > 1500000) { const amt = remaining - 1500000; taxBreakup.unshift({ slab: 'Above 15,00,000', rate: '30%', amount: amt, tax: amt * 0.3 }); remaining = 1500000; }
        if (remaining > 1200000) { const amt = remaining - 1200000; taxBreakup.unshift({ slab: '12,00,001 - 15,00,000', rate: '20%', amount: amt, tax: amt * 0.2 }); remaining = 1200000; }
        if (remaining > 1000000) { const amt = remaining - 1000000; taxBreakup.unshift({ slab: '10,00,001 - 12,00,000', rate: '15%', amount: amt, tax: amt * 0.15 }); remaining = 1000000; }
        if (remaining > 700000) { const amt = remaining - 700000; taxBreakup.unshift({ slab: '7,00,001 - 10,00,000', rate: '10%', amount: amt, tax: amt * 0.1 }); remaining = 700000; }
        if (remaining > 300000) { const amt = remaining - 300000; taxBreakup.unshift({ slab: '3,00,001 - 7,00,000', rate: '5%', amount: amt, tax: amt * 0.05 }); remaining = 300000; }
        if (remaining > 0) { taxBreakup.unshift({ slab: 'Upto 3,00,000', rate: '0%', amount: remaining, tax: 0 }); }
     } else {
        if (remaining > 1500000) { const amt = remaining - 1500000; taxBreakup.unshift({ slab: 'Above 15,00,000', rate: '30%', amount: amt, tax: amt * 0.3 }); remaining = 1500000; }
        if (remaining > 1200000) { const amt = remaining - 1200000; taxBreakup.unshift({ slab: '12,00,001 - 15,00,000', rate: '20%', amount: amt, tax: amt * 0.2 }); remaining = 1200000; }
        if (remaining > 900000) { const amt = remaining - 900000; taxBreakup.unshift({ slab: '9,00,001 - 12,00,000', rate: '15%', amount: amt, tax: amt * 0.15 }); remaining = 900000; }
        if (remaining > 600000) { const amt = remaining - 600000; taxBreakup.unshift({ slab: '6,00,001 - 9,00,000', rate: '10%', amount: amt, tax: amt * 0.1 }); remaining = 600000; }
        if (remaining > 300000) { const amt = remaining - 300000; taxBreakup.unshift({ slab: '3,00,001 - 6,00,000', rate: '5%', amount: amt, tax: amt * 0.05 }); remaining = 300000; }
        if (remaining > 0) { taxBreakup.unshift({ slab: 'Upto 3,00,000', rate: '0%', amount: remaining, tax: 0 }); }
     }
  } else {
     let remaining = taxableNormalIncome
     if (remaining > 1000000) {
        const amt = remaining - 1000000; taxBreakup.unshift({ slab: 'Above 10,00,000', rate: '30%', amount: amt, tax: amt * 0.3 }); remaining = 1000000;
     }
     if (remaining > 500000) {
        const amt = remaining - 500000; taxBreakup.unshift({ slab: '5,00,001 - 10,00,000', rate: '20%', amount: amt, tax: amt * 0.2 }); remaining = 500000;
     }
     let exemptionLimit = 250000
     if (personal.ageCategory === 'senior') exemptionLimit = 300000
     if (personal.ageCategory === 'superSenior') exemptionLimit = 500000
     if (remaining > exemptionLimit) {
        const amt = remaining - exemptionLimit; taxBreakup.unshift({ slab: `Exemption Limit to 5,00,000`, rate: '5%', amount: amt, tax: amt * 0.05 }); remaining = exemptionLimit;
     }
     if (remaining > 0) {
        taxBreakup.unshift({ slab: `Upto Exemption Limit`, rate: '0%', amount: remaining, tax: 0 })
     }
  }

  // Add Special taxes
  let specialTaxBreakup = []
  if (stcg20 > 0) specialTaxBreakup.push({ label: 'STCG u/s 111A @ 20%', amount: stcg20, tax: stcg20 * 0.20 })
  if (taxableLtcg125Equity > 0) specialTaxBreakup.push({ label: 'LTCG Equity u/s 112A @ 12.5%', amount: taxableLtcg125Equity, tax: taxableLtcg125Equity * 0.125 })
  if (ltcg125Other > 0) specialTaxBreakup.push({ label: 'LTCG Other u/s 112 @ 12.5%', amount: ltcg125Other, tax: ltcg125Other * 0.125 })
  if (ltcg20 > 0) specialTaxBreakup.push({ label: 'LTCG u/s 112 @ 20%', amount: ltcg20, tax: ltcg20 * 0.20 })
  const winAmt = parseFloat(os.winnings) || 0;
  if (winAmt > 0) specialTaxBreakup.push({ label: 'Winnings @ 30%', amount: winAmt, tax: winAmt * 0.3 })
  if (vdaIncome > 0) specialTaxBreakup.push({ label: 'VDA (Crypto) @ 30%', amount: vdaIncome, tax: vdaIncome * 0.3 })

  const specialTax = (stcg20 * 0.20) + (taxableLtcg125Equity * 0.125) + (ltcg125Other * 0.125) + (ltcg20 * 0.2) + (winAmt * 0.3) + (vdaIncome * 0.3)

  let totalTaxBeforeRebate = normalTax + specialTax

  // Rebate u/s 87A
  let rebate = 0
  
  const isEligibleFor87A = (personal.category === 'Individual' || !personal.category) && (personal.residentialStatus === 'resident' || !personal.residentialStatus)

  if (isEligibleFor87A) {
    let eligibleTaxFor87A = totalTaxBeforeRebate
    if (isNewRegime) {
       // Under New Regime: STCG 111A, LTCG 112A, LTCG 112, VDA are not eligible.
       eligibleTaxFor87A = Math.max(0, normalTax + ((parseFloat(os.winnings) || 0) * 0.3))
    } else {
       // Under Old Regime: LTCG 112A, LTCG 112, VDA are not eligible. STCG 111A IS eligible.
       eligibleTaxFor87A = Math.max(0, normalTax + (stcg20 * 0.20) + ((parseFloat(os.winnings) || 0) * 0.3))
    }

    if (isNewRegime) {
        if (assessmentYear === '2026-27') {
           if (totalTaxableIncome <= 1200000) {
              rebate = Math.min(60000, eligibleTaxFor87A)
           } else if (totalTaxableIncome <= 1270588) {
              // Marginal Relief for AY 2026-27
              const incomeAbove12L = totalTaxableIncome - 1200000
              if (eligibleTaxFor87A > incomeAbove12L) rebate = eligibleTaxFor87A - incomeAbove12L
           }
        } else {
           if (totalTaxableIncome <= 700000) {
              rebate = Math.min(25000, eligibleTaxFor87A)
           } else if (totalTaxableIncome <= 727777) {
              // Marginal relief for previous New Regime (7L)
              const incomeAbove7L = totalTaxableIncome - 700000
              if (eligibleTaxFor87A > incomeAbove7L) rebate = eligibleTaxFor87A - incomeAbove7L
           }
        }
    } else {
        if (totalTaxableIncome <= 500000) {
           rebate = Math.min(12500, eligibleTaxFor87A) // Max rebate 12.5k
        }
    }
  }

  let taxAfterRebate = Math.max(0, totalTaxBeforeRebate - rebate)
  
  // --- SURCHARGE WITH MARGINAL RELIEF ---
  let surcharge = 0
  let surchargeBreakup = { rateNormal: 0, rateSpecial: 0, amountNormal: 0, amountSpecial: 0, marginalRelief: 0 }

  if (totalTaxableIncome > 5000000) {
      // Find proportion of Normal Tax attributable to Dividend Income (capped at 15%)
      let normalTaxRateAverage = taxableNormalIncome > 0 ? (normalTax / taxableNormalIncome) : 0
      let dividendIncomeEffective = Math.min(dividend, Math.max(0, taxableNormalIncome - totalDeductions))
      let normalTaxOnDividend = dividendIncomeEffective * normalTaxRateAverage
      let normalTaxOnOther = normalTax - normalTaxOnDividend

      let specialTaxBase = specialTax + normalTaxOnDividend
      let normalTaxBase = normalTaxOnOther
      let baseTaxObj = taxAfterRebate

      const computeSurcharge = (inc, baseT, normalT_base, specialT_base) => {
         let rateNormal = 0
         let rateSpecial = 0

         if (inc > 50000000) { rateNormal = isNewRegime ? 0.25 : 0.37; rateSpecial = 0.15; }
         else if (inc > 20000000) { rateNormal = 0.25; rateSpecial = 0.15; }
         else if (inc > 10000000) { rateNormal = 0.15; rateSpecial = 0.15; }
         else if (inc > 5000000) { rateNormal = 0.10; rateSpecial = 0.10; }

         return {
             total: (normalT_base * rateNormal) + (specialT_base * rateSpecial),
             rateNormal, rateSpecial,
             amountNormal: normalT_base * rateNormal,
             amountSpecial: specialT_base * rateSpecial
         }
      }

      let surgRes = computeSurcharge(totalTaxableIncome, baseTaxObj, normalTaxBase, specialTaxBase)
      surcharge = surgRes.total
      surchargeBreakup.rateNormal = surgRes.rateNormal
      surchargeBreakup.rateSpecial = surgRes.rateSpecial
      surchargeBreakup.amountNormal = surgRes.amountNormal
      surchargeBreakup.amountSpecial = surgRes.amountSpecial

      // Marginal Relief computation checks
      const applyRelief = (threshold) => {
          if (totalTaxableIncome > threshold) {
              // Calculate exactly the tax if income was exactly the Threshold
              // Here, we assume any amount above threshold falls in normal income (which is typical)
              let taxAtT_normal = getNormalTaxOn(threshold - (totalTaxableIncome - taxableNormalIncome))
              let taxAtT_special = specialTax // special tax remains constant
              let taxAtT = taxAtT_normal + taxAtT_special

              // Calculated tax on exact threshold bounds 
              let thresholdSurchargeRes = computeSurcharge(threshold, baseTaxObj, normalTaxBase, specialTaxBase)
              let surchargeAtT = thresholdSurchargeRes.total
              let totalLiabilityAtT = taxAtT + surchargeAtT

              let currentTotalLiability = baseTaxObj + surchargeBreakup.amountNormal + surchargeBreakup.amountSpecial
              let extraIncome = totalTaxableIncome - threshold

              if (currentTotalLiability > (totalLiabilityAtT + extraIncome)) {
                 let newSurcharge = (totalLiabilityAtT + extraIncome) - baseTaxObj
                 if (newSurcharge < 0) newSurcharge = 0
                 surchargeBreakup.marginalRelief = surcharge - newSurcharge
                 surcharge = newSurcharge
              }
          }
      }

      if (totalTaxableIncome > 50000000) applyRelief(50000000)
      else if (totalTaxableIncome > 20000000) applyRelief(20000000)
      else if (totalTaxableIncome > 10000000) applyRelief(10000000)
      else if (totalTaxableIncome > 5000000) applyRelief(5000000)
  }

  const taxPlusSurcharge = taxAfterRebate + surcharge

  // Health & Education Cess @ 4%
  const cess = taxPlusSurcharge * 0.04

  const totalTaxLiability = Math.round(taxPlusSurcharge + cess)
  
  const taxesPaidObj = data.taxesPaid || {}
  const tdsPaid = (parseFloat(taxesPaidObj.tds) || 0) + (parseFloat(taxesPaidObj.tcs) || 0)
  const advanceTaxQ1 = parseFloat(taxesPaidObj.advanceTaxQ1) || 0
  const advanceTaxQ2 = parseFloat(taxesPaidObj.advanceTaxQ2) || 0
  const advanceTaxQ3 = parseFloat(taxesPaidObj.advanceTaxQ3) || 0
  const advanceTaxQ4 = parseFloat(taxesPaidObj.advanceTaxQ4) || 0
  const advanceTaxTotal = advanceTaxQ1 + advanceTaxQ2 + advanceTaxQ3 + advanceTaxQ4
  const selfAssessmentTaxPaid = parseFloat(taxesPaidObj.selfAssessmentTax) || 0

  // --- INTEREST AND PENALTIES (Rule 119A Compliance) ---
  let interest234A = 0
  let interest234B = 0
  let interest234C = 0
  let fee234F = 0
  const interest234CBreakdown = []

  const filingDateStr = taxesPaidObj.actualFilingDate
  let filingDate = null
  if (filingDateStr) {
      filingDate = new Date(filingDateStr)
  }

  // Only calculate if filing date is selected as per user requirement
  if (filingDate) {
      const assessedTaxForPenalty = Math.max(0, totalTaxLiability - tdsPaid)
      const AY = assessmentYear || "2024-25"
      const ayYearMatch = AY.match(/^(\d{4})/)
      const baseYear = ayYearMatch ? parseInt(ayYearMatch[1]) : 2024
      const dueFilingDate = new Date(`${baseYear}-07-31`)
      
      // 1. Fee u/s 234F for late filing
      if (filingDate > dueFilingDate) {
          if (totalTaxableIncome > 500000) {
              fee234F = 5000
          } else if (totalTaxableIncome > 250000 || (isNewRegime && totalTaxableIncome > 0)) { 
              fee234F = 1000
          }
      }

      // 2. Interest u/s 234A (Delay in filing ITR)
      if (filingDate > dueFilingDate) {
          const netTaxFor234A = totalTaxLiability - (tdsPaid + advanceTaxTotal + selfAssessmentTaxPaid)
          const baseFor234A = netTaxFor234A
          
          if (baseFor234A > 0) {
              let monthsFor234A = (filingDate.getFullYear() - dueFilingDate.getFullYear()) * 12 + (filingDate.getMonth() - dueFilingDate.getMonth())
              if (filingDate.getDate() > dueFilingDate.getDate()) monthsFor234A += 1
              if (monthsFor234A < 1) monthsFor234A = 1
              
              interest234A = Math.floor(baseFor234A * 0.01 * monthsFor234A)
          }
      }

      // 3. Interest u/s 234B (Default in payment of advance tax)
      if (assessedTaxForPenalty >= 10000) {
          if (advanceTaxTotal < assessedTaxForPenalty * 0.90) {
              const unpaidTaxFor234B = Math.max(0, assessedTaxForPenalty - advanceTaxTotal)
              const baseFor234B = unpaidTaxFor234B
              
              if (baseFor234B > 0) {
                  const april1stOfAY = new Date(`${baseYear}-04-01`)
                  let endDateFor234B = filingDate || new Date()
                  if (endDateFor234B < april1stOfAY) endDateFor234B = april1stOfAY
                  
                  let monthsFor234B = (endDateFor234B.getFullYear() - april1stOfAY.getFullYear()) * 12 + (endDateFor234B.getMonth() - april1stOfAY.getMonth())
                  monthsFor234B += 1 
                  
                  interest234B = Math.floor(baseFor234B * 0.01 * monthsFor234B)
              }
          }
      }

      // 4. Interest u/s 234C (Deferment of advance tax)
      const isPresumptive = (pgbp.presumptive?.isOpting === 'yes') && (pgbp.presumptive?.nature === '44AD' || pgbp.presumptive?.nature === '44ADA')

      if (assessedTaxForPenalty >= 10000) {
          if (isPresumptive) {
              const q4Shortfall = Math.max(0, (assessedTaxForPenalty * 1.00) - advanceTaxTotal)
              const q4Interest = Math.floor(q4Shortfall * 0.01 * 1)
              if (q4Shortfall > 0) interest234C += q4Interest
              
              interest234CBreakdown.push({
                id: 'Q4',
                label: 'March 15',
                required: Math.round(assessedTaxForPenalty * 1.00),
                period: '1 Month',
                interest: q4Interest,
                calculation: `${Math.round(assessedTaxForPenalty * 1.00).toLocaleString('en-IN')} x 1% x 1`
              })
          } else {
              // Q1: 15%
              const q1Req = Math.round(assessedTaxForPenalty * 0.15)
              const q1Int = (advanceTaxQ1 < (assessedTaxForPenalty * 0.12)) ? Math.floor(Math.max(0, q1Req - advanceTaxQ1) * 0.01 * 3) : 0
              interest234C += q1Int
              interest234CBreakdown.push({ id: 'Q1', label: 'June 15', required: q1Req, period: '3 Months', interest: q1Int, calculation: `${q1Req.toLocaleString('en-IN')} x 1% x 3` })

              // Q2: 45%
              const q2Req = Math.round(assessedTaxForPenalty * 0.45)
              const q2Int = ((advanceTaxQ1 + advanceTaxQ2) < (assessedTaxForPenalty * 0.36)) ? Math.floor(Math.max(0, q2Req - (advanceTaxQ1 + advanceTaxQ2)) * 0.01 * 3) : 0
              interest234C += q2Int
              interest234CBreakdown.push({ id: 'Q2', label: 'Sept 15', required: q2Req, period: '3 Months', interest: q2Int, calculation: `${q2Req.toLocaleString('en-IN')} x 1% x 3` })

              // Q3: 75%
              const q3Req = Math.round(assessedTaxForPenalty * 0.75)
              const q3Int = Math.floor(Math.max(0, q3Req - (advanceTaxQ1 + advanceTaxQ2 + advanceTaxQ3)) * 0.01 * 3)
              interest234C += q3Int
              interest234CBreakdown.push({ id: 'Q3', label: 'Dec 15', required: q3Req, period: '3 Months', interest: q3Int, calculation: `${q3Req.toLocaleString('en-IN')} x 1% x 3` })

              // Q4: 100%
              const q4Req = Math.round(assessedTaxForPenalty * 1.00)
              const q4Int = Math.floor(Math.max(0, q4Req - (advanceTaxQ1 + advanceTaxQ2 + advanceTaxQ3 + advanceTaxQ4)) * 0.01 * 1)
              interest234C += q4Int
              interest234CBreakdown.push({ id: 'Q4', label: 'March 15', required: q4Req, period: '1 Month', interest: q4Int, calculation: `${q4Req.toLocaleString('en-IN')} x 1% x 1` })
          }
      }
  }

  interest234A = Math.round(interest234A)
  interest234B = Math.round(interest234B)
  interest234C = Math.round(interest234C)
  fee234F = Math.round(fee234F)
  
  const penalInterest = interest234A + interest234B + interest234C + fee234F
  const finalTaxPayableWithInterest = totalTaxLiability + penalInterest

  const netTaxPayable = finalTaxPayableWithInterest - (tdsPaid + advanceTaxTotal + selfAssessmentTaxPaid)

  const results = {
    netSalary,
    netHouseProperty: netHouseProperty - housePropertyLossToSetOff,
    netPGBP,
    stcg: stcg20 + stcgNormal,
    ltcg: ltcg125Equity + ltcg125Other + ltcg20,
    grossSTCG,
    exemptionsSTCG,
    netSTCG,
    grossLTCG,
    exemptionsLTCG,
    netLTCG,
    netOtherSources,
    netVDA: vdaIncome,
    grossTotalIncome,
    totalDeductions,
    taxableNormalIncome,
    totalTaxableIncome,
    normalTax,
    specialTax,
    totalTaxBeforeRebate,
    rebate,
    surcharge,
    surchargeBreakup,
    taxPlusSurcharge,
    cess,
    totalTaxLiability,
    tdsPaid,
    advanceTaxPaid: advanceTaxTotal,
    selfAssessmentTaxPaid,
    interest234A,
    interest234B,
    interest234C,
    interest234CBreakdown,
    fee234F,
    penalInterest,
    finalTaxPayableWithInterest,
    netTaxPayable,
    taxBreakup,
    specialTaxBreakup,
    presumptiveIncome,
    carryForwardLosses: {
      houseProperty: housePropertyCarryForward,
      business: businessCarryForward,
      stcl: remainingSTCL,
      ltcl: remainingLTCL
    }
  }

  // Ensure fully rounded integer figures across all generated reports
  for (let key in results) {
     if (typeof results[key] === 'number') {
        results[key] = Math.round(results[key])
     }
  }

  return results
}
