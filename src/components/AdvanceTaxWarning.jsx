import React from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import { computeTax } from '../computation/taxEngine'

const AdvanceTaxWarning = ({ data, textStyle = "professional" }) => {
  const isGenZ = textStyle === "genz";
  const result = computeTax(data)
  
  const labels = {
    title: isGenZ ? "Advance Tax & Penalty Vibe Check ⏰" : "Advance Tax & Penalties Simulator",
    summaryTitle: isGenZ ? "What the Govt expects from you" : "Total Expected Tax Liability",
    summarySubtitle: isGenZ ? "The Big Bill (Pre-TDS)" : "Before TDS & Prepaid Taxes",
    alertHeader: isGenZ ? "You're in the Advance Tax Zone!" : "Advance Tax is Applicable.",
    alertText: isGenZ 
      ? "Since your tax bill is > ₹10k, the govt wants its money in installments. If you don't pay on time, they'll charge you 1% interest every month. Don't let them fine you for being late!"
      : "Since your tax liability exceeds ₹10,000, you are required to pay tax in installments during the financial year to avoid 1% per month interest under Section 234B and 234C.",
    scheduleTitle: isGenZ ? "When to Pay the Govt (Installments)" : "Advance Tax Installment Schedule",
    penaltyTitle: isGenZ ? "Penalty Simulator (The 'Oh No' Math)" : "Section 234C Penalty Simulator",
    penaltyText: isGenZ 
      ? "If you ghost the govt on these dates, they'll hit you with interest. Assuming you've paid ₹0 so far, here's the damage:"
      : "If you fail to pay the above installments on time, interest @ 1% per month is levied on the shortfall. Assuming you have paid ₹0 advance tax so far:",
    penaltyResult: isGenZ ? "Total Fine for missing deadlines:" : "Estimated 234C Interest:",
    safeHeader: isGenZ ? "You're Gucci!" : "Safe!",
    safeText: isGenZ 
      ? "Your tax bill is under ₹10k, so no Advance Tax stress. Just pay whenever you file your ITR. Cool vibes only."
      : "Your total tax liability is below ₹10,000. Advance Tax provisions are not applicable to you. You can pay your taxes at the time of filing the ITR."
  };

  // Advance tax is applicable if total tax liability > 10000 
  // (Assuming no massive TDS has been deducted, as we don't capture TDS yet. Usually Liability - TDS > 10,000)
  const isApplicable = result.totalTaxLiability >= 10000

  // Check if opted for eligible 44AD/44ADA
  const isPresumptiveOpted = data.business?.presumptive?.isOpting === 'yes'
  const presumptiveNature = data.business?.presumptive?.nature
  const isEligiblePresumptive = isPresumptiveOpted && (presumptiveNature === '44AD' || presumptiveNature === '44ADA')

  let presumptiveTax = 0;
  let otherTax = result.totalTaxLiability;
  
  if (isEligiblePresumptive && result.grossTotalIncome > 0) {
      const ratio = (result.presumptiveIncome || 0) / result.grossTotalIncome;
      // Cap ratio closely between 0 and 1
      const safeRatio = Math.max(0, Math.min(1, ratio));
      presumptiveTax = Math.round(result.totalTaxLiability * safeRatio);
      otherTax = Math.max(0, result.totalTaxLiability - presumptiveTax);
  }

  // Generate dynamic due schedule
  let dues = [];
  if (isEligiblePresumptive && presumptiveTax > 0) {
      if (otherTax > 0) {
          dues = [
             { date: '15th June', amount: Math.round(otherTax * 0.15), label: isGenZ ? '15% of Non-Presumptive' : '15% of Non-Presumptive Tax' },
             { date: '15th September', amount: Math.round(otherTax * 0.45), label: isGenZ ? '45% of Non-Presumptive' : '45% of Non-Presumptive Tax' },
             { date: '15th December', amount: Math.round(otherTax * 0.75), label: isGenZ ? '75% of Non-Presumptive' : '75% of Non-Presumptive Tax' },
             { date: '15th March', amount: Math.round(otherTax * 1.0) + presumptiveTax, label: isGenZ ? '100% Total Tax' : '100% of Total Tax' },
          ];
      } else {
          dues = [
             { date: '15th March', amount: presumptiveTax, label: isGenZ ? '100% Total Tax' : '100% of Total Tax' },
          ];
      }
  } else {
      dues = [
          { date: '15th June', amount: Math.round(result.totalTaxLiability * 0.15), label: isGenZ ? '15% installment' : '15% of Liability' },
          { date: '15th September', amount: Math.round(result.totalTaxLiability * 0.45), label: isGenZ ? '45% installment' : '45% of Liability' },
          { date: '15th December', amount: Math.round(result.totalTaxLiability * 0.75), label: isGenZ ? '75% installment' : '75% of Liability' },
          { date: '15th March', amount: Math.round(result.totalTaxLiability * 1.00), label: isGenZ ? '100% Payoff' : '100% of Liability' },
      ];
  }

  // Approx 234C interest logic (1% per month for 3 months on shortfall) - simplified
  const calculateApprox234C = (duesArray) => {
     let penalty = 0
     // Assuming the user pays 0 right now, the shortfall is the entire amount at each period
     if (duesArray.length === 1) {
        penalty += (duesArray[0].amount * 0.01 * 1) // 1% for 1 month for missing 15th March
     } else {
        penalty += (duesArray[0].amount * 0.01 * 3) // Q1
        penalty += ((duesArray[1].amount - duesArray[0].amount) * 0.01 * 3) // Q2
        penalty += ((duesArray[2].amount - duesArray[1].amount) * 0.01 * 3) // Q3
        penalty += ((duesArray[3].amount - duesArray[2].amount) * 0.01 * 1) // Q4
     }
     return Math.round(penalty)
  }

  const penalty234C = isApplicable ? calculateApprox234C(dues) : 0

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">{labels.title}</h2>
      </div>

      <div className="card p-6 slide-up mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="font-bold">{labels.summaryTitle}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{labels.summarySubtitle}</p>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ₹ {result.totalTaxLiability.toLocaleString('en-IN')}
          </div>
        </div>

        {isApplicable ? (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--text-main)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
               <AlertCircle size={24} color="var(--primary)" style={{ minWidth: '24px' }} />
               <p style={{ margin: 0 }}><strong>{labels.alertHeader}</strong> {labels.alertText}{isEligiblePresumptive ? (isGenZ ? " Since you're using Presumptive taxation, you pay the whole bag by 15th March." : " As a presumptive taxpayer (44AD/44ADA), the tax on your presumptive income is due completely by 15th March, while normal installments apply to other incomes.") : ""}</p>
            </div>

            <h4 className="font-bold mb-4">{labels.scheduleTitle}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dues.map((due, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-color)', border: '1px solid var(--input-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                     <Calendar size={18} color="var(--primary)" />
                     <span style={{ fontWeight: 600 }}>By {due.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                     <span style={{ color: 'var(--text-muted)' }}>{due.label}</span>
                     <span style={{ fontWeight: 'bold', width: '100px', textAlign: 'right' }}>₹ {due.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: 'var(--radius-sm)' }}>
               <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--danger)' }}>{labels.penaltyTitle}</h4>
               <p style={{ color: 'var(--text-main)', marginBottom: '1rem', opacity: 0.9 }}>{labels.penaltyText}</p>
               <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{labels.penaltyResult} ₹ {penalty234C.toLocaleString('en-IN')}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
             <AlertCircle size={24} />
             <p><strong>{labels.safeHeader}</strong> {labels.safeText}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvanceTaxWarning
