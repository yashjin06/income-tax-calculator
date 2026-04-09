import React, { useState, useEffect } from 'react'
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, PieChart, ShieldCheck } from 'lucide-react'
import { computeTax } from '../computation/taxEngine'

const SmartRecommendations = ({ data, textStyle = "professional" }) => {
  const [insights, setInsights] = useState([]);
  const [regimeComparison, setRegimeComparison] = useState({
    oldTax: 0,
    newTax: 0,
    best: "",
  });

  const isGenZ = textStyle === "genz";

  useEffect(() => {
    // 1. Regime Comparison
    const oldData = { ...data, personal: { ...data.personal, newRegime: "no" } };
    const newData = { ...data, personal: { ...data.personal, newRegime: "yes" } };

    const oldResult = computeTax(oldData);
    const newResult = computeTax(newData);

    setRegimeComparison({
      oldTax: oldResult.totalTaxLiability,
      newTax: newResult.totalTaxLiability,
      best:
        oldResult.totalTaxLiability < newResult.totalTaxLiability
          ? "Old Regime"
          : newResult.totalTaxLiability < oldResult.totalTaxLiability
          ? "New Regime"
          : "Both Same",
    });

    // 2. Generate Smart Insights
    const newInsights = [];

    // a. 80C Optimization (Only applicable if Old Regime is at least competitive or user explicitly wants it)
    const current80C =
      (parseFloat(data.deductions?.sec80c) || 0) +
      (parseFloat(data.deductions?.sec80ccc) || 0) +
      (parseFloat(data.deductions?.sec80ccd1) || 0);
    if (oldResult.totalTaxLiability <= newResult.totalTaxLiability + 50000) {
      // If old regime is somewhat close
      if (current80C < 150000) {
        const gap = 150000 - current80C;
        // calculate marginal tax rate under old regime
        const marginalRate =
          oldResult.totalTaxableIncome > 1000000
            ? 0.312
            : oldResult.totalTaxableIncome > 500000
            ? 0.208
            : 0.052;
        const potentialSavings = Math.round(gap * marginalRate);
        if (potentialSavings > 0) {
          newInsights.push({
            type: "opportunity",
            title: isGenZ ? "80C: The Taxman's Kryptonite 🦸‍♂️" : "Maximize Section 80C Limit",
            desc: isGenZ
              ? `You've only used ₹${current80C.toLocaleString(
                  "en-IN",
                )} of your ₹1.5L limit. Throw the other ₹${gap.toLocaleString(
                  "en-IN",
                )} into ELSS/PPF to keep ₹${potentialSavings.toLocaleString(
                  "en-IN",
                )} away from the government's grubby mitts!`
              : `You have utilized ₹${current80C.toLocaleString(
                  "en-IN",
                )} of the ₹1.5 Lakh limit under Section 80C. Investing the remaining ₹${gap.toLocaleString(
                  "en-IN",
                )} in ELSS or PPF can save you approximately ₹${potentialSavings.toLocaleString(
                  "en-IN",
                )} in tax.`,
            icon: <TrendingUp size={24} color="var(--success)" />,
          });
        }
      }
    }

    // b. NPS 80CCD(1B) Optimization
    const currentNPS = parseFloat(data.deductions?.sec80ccd1b) || 0;
    if (
      currentNPS < 50000 &&
      oldResult.totalTaxLiability <= newResult.totalTaxLiability + 20000
    ) {
      const marginalRate =
        oldResult.totalTaxableIncome > 1000000
          ? 0.312
          : oldResult.totalTaxableIncome > 500000
          ? 0.208
          : 0.052;
      const gap = 50000 - currentNPS;
      const potentialSavings = Math.round(gap * marginalRate);
      if (potentialSavings > 0) {
        newInsights.push({
          type: "opportunity",
          title: isGenZ ? "NPS: The Secret Unlock 🔓" : "Additional Section 80CCD(1B) Deduction",
          desc: isGenZ
            ? `Put ₹${gap.toLocaleString(
                "en-IN",
              )} in NPS Tier 1. It's an extra deduction the govt doesn't want you to notice. Save ₹${potentialSavings.toLocaleString(
                "en-IN",
              )} extra!`
            : `Investing an additional ₹${gap.toLocaleString(
                "en-IN",
              )} in NPS Tier 1 allows for an extra deduction under Section 80CCD(1B), saving up to ₹${potentialSavings.toLocaleString(
                "en-IN",
              )}.`,
          icon: <ShieldCheck size={24} color="var(--primary)" />,
        });
      }
    }

    // c. Health Insurance 80D
    const healthIns = parseFloat(data.deductions?.sec80d) || 0;
    if (healthIns === 0 && data.personal.newRegime === "no") {
      newInsights.push({
        type: "warning",
        title: isGenZ ? "Where's Your Armor? (80D) 🛡️" : "No Health Insurance Declared",
        desc: isGenZ
          ? "No health insurance? Brave, but expensive. Buy a policy for yourself/parents to slash up to ₹75,000 from your taxable income. Stay healthy, stay rich."
          : "You haven't claimed any deduction under Section 80D. Securing health insurance for yourself and your parents can provide up to ₹75,000 in additional deductions.",
        icon: <AlertTriangle size={24} color="var(--warning)" />,
      });
    }

    if (newInsights.length === 0) {
      newInsights.push({
        type: "success",
        title: isGenZ ? "Main Character Energy! ✨" : "Your taxes are highly optimized!",
        desc: isGenZ
          ? "Your tax planning is literally flawless. No notes. Go treat yourself with the money you saved."
          : "We couldn't find any obvious deductions you're missing out on. Great job planning your finances!",
        icon: <CheckCircle size={24} color="var(--success)" />,
      });
    }

    setInsights(newInsights);
  }, [data, isGenZ]);

  const labels = {
    title: isGenZ ? "TaxNova Pro's Genius Lab" : "Smart Tax Optimization Engine",
    plannerStatus: isGenZ ? "Brainiac AI On" : "AI Planner Active",
    regimeTitle: isGenZ ? "Old vs New: The Brawl" : "Old vs New Regime Analysis",
    oldRegimeTax: isGenZ ? "Old Regime Damage" : "Old Regime Tax Liability",
    newRegimeTax: isGenZ ? "New Regime Damage" : "New Regime Tax Liability",
    recommendationLabel: isGenZ ? "💡 Pro Tip:" : "💡 Recommendation:",
    savingsNote: isGenZ
      ? `Choosing this regime saves you ₹${Math.abs(
          regimeComparison.oldTax - regimeComparison.newTax,
        ).toLocaleString("en-IN")}—literally a free vacation! ✈️`
      : `Opting for this regime saves you ₹${Math.abs(
          regimeComparison.oldTax - regimeComparison.newTax,
        ).toLocaleString("en-IN")} in taxes.`,
    personalizedTitle: isGenZ ? "Personalized Side Quests" : "Personalized Investment Insights",
  };

  return (
    <div className="fade-in">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 className="text-xl font-bold">{labels.title}</h2>
        <div
          style={{
            padding: "0.5rem 1rem",
            background: "var(--primary-light)",
            color: "var(--primary)",
            borderRadius: "var(--radius-md)",
            fontWeight: "bold",
          }}
        >
          {labels.plannerStatus}
        </div>
      </div>

      <div
        className="card p-6 mb-6 slide-up"
        style={{
          background:
            "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
          border: "1px solid rgba(79,70,229,0.2)",
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <PieChart color="var(--primary)" /> {labels.regimeTitle}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              background: "var(--bg-color)",
              padding: "1.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--input-border)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              {labels.oldRegimeTax}
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color:
                  regimeComparison.best === "Old Regime"
                    ? "var(--success)"
                    : "var(--text-main)",
              }}
            >
              ₹ {regimeComparison.oldTax.toLocaleString("en-IN")}
            </div>
          </div>
          <div
            style={{
              background: "var(--bg-color)",
              padding: "1.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--input-border)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              {labels.newRegimeTax}
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color:
                  regimeComparison.best === "New Regime"
                    ? "var(--success)"
                    : "var(--text-main)",
              }}
            >
              ₹ {regimeComparison.newTax.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            background: "var(--glass-bg)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          {labels.recommendationLabel} You should opt for the{" "}
          <span style={{ color: "var(--primary)" }}>{regimeComparison.best}</span>.{" "}
          {regimeComparison.oldTax !== regimeComparison.newTax && (
            <span> {labels.savingsNote}</span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 mt-8">{labels.personalizedTitle}</h3>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="card slide-up"
            style={{
              padding: "1.5rem",
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
              borderLeft: `4px solid ${
                insight.type === "opportunity"
                  ? "var(--success)"
                  : insight.type === "warning"
                  ? "var(--warning)"
                  : "var(--primary)"
              }`,
            }}
          >
            <div
              style={{
                background: "var(--bg-color)",
                padding: "1rem",
                borderRadius: "50%",
              }}
            >
              {insight.icon}
            </div>
            <div>
              <h4
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "var(--text-main)",
                }}
              >
                {insight.title}
              </h4>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                {insight.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">Smart Tax Optimization Engine</h2>
        <div style={{ padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
          AI Planner Active
        </div>
      </div>

      <div className="card p-6 mb-6 slide-up" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart color="var(--primary)" /> Old vs New Regime Analysis
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Old Regime Tax Liability</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: regimeComparison.best === 'Old Regime' ? 'var(--success)' : 'var(--text-main)' }}>
              ₹ {regimeComparison.oldTax.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>New Regime Tax Liability</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: regimeComparison.best === 'New Regime' ? 'var(--success)' : 'var(--text-main)' }}>
              ₹ {regimeComparison.newTax.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '1.1rem' }}>
          💡 Recommendation: You should opt for the <span style={{ color: 'var(--primary)' }}>{regimeComparison.best}</span>. 
          {regimeComparison.oldTax !== regimeComparison.newTax && (
            <span> Opting for this regime saves you ₹ {Math.abs(regimeComparison.oldTax - regimeComparison.newTax).toLocaleString('en-IN')} in taxes!</span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 mt-8">Personalized Investment Insights</h3>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {insights.map((insight, idx) => (
          <div key={idx} className="card slide-up" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: `4px solid ${insight.type === 'opportunity' ? 'var(--success)' : insight.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}` }}>
             <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '50%' }}>
               {insight.icon}
             </div>
             <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{insight.title}</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{insight.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SmartRecommendations
