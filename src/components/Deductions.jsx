import React, { useEffect, useState } from 'react'
import CurrencyInput from './CurrencyInput'

const Deductions = ({ data, updateData, textStyle = "professional" }) => {
  const ded = data.deductions || {
    sec80c: 0, // Max 1.5L
    sec80ccc: 0,
    sec80ccd1: 0,
    sec80ccd1b: 0, // NPS max 50k
    sec80ccd2: 0, // Employer NPS - Allowed in New Regime
    sec80cch: 0, // Agniveer Corpus Fund - Allowed in New Regime
    sec80d: 0, // Health insurance
    sec80dd: 0,
    sec80ddb: 0,
    sec80e: 0,
    sec80g: 0, // Donations
    sec80tta: 0, // Savings interest max 10k
    sec80ttb: 0, // Sen citizen max 50k
    otherDeductions: 0,
  };

  const [totalDeductions, setTotalDeductions] = useState(0);
  const isNewRegime = data.personal?.newRegime === "yes";
  const isGenZ = textStyle === "genz";

  const labels = {
    title: isGenZ ? "Your Legal Bribes & Shield" : "Chapter VI-A Deductions",
    totalLabel: isGenZ ? "Total Saved from Taxman:" : "Total Estimated Deductions:",
    newRegimeWarning: isGenZ
      ? "POV: You picked the New Regime. Most of these 'cheat codes' are locked 🔒 except for Employer NPS & Agniveer."
      : "Note: Under the New Tax Regime (Sec 115BAC), most Chapter VI-A deductions are not allowed except specific ones.",
    investmentsTitle: isGenZ ? "The 'Safe Play' Investments" : "Investments (80C / 80CCC / 80CCD)",
    investmentsSubtitle: isGenZ
      ? "You can only stack ₹1.5L here before the game reaches its cap."
      : "Combined maximum limit for 80C, 80CCC, and 80CCD(1) is ₹ 1,50,000.",
    allowedNewRegime: isGenZ ? "New Regime Approved! ✅" : "Allowed under New Tax Regime!",
    otherTitle: isGenZ ? "Random Acts of Deductions" : "Other Deductions",
    sec80cLabel: isGenZ
      ? "80C (LIC, EPF, ELSS - The OG Savings)"
      : "Sec 80C (LIC, PPF, EPF, ELSS, etc.)",
    sec80ccd1bLabel: isGenZ
      ? "80CCD(1B) (NPS - The 'Extra' 50k Flex)"
      : "Sec 80CCD(1B) (NPS Contribution - Additional)",
    sec80ccd2Label: isGenZ
      ? "80CCD(2) (Employer NPS - Free Money 🤑)"
      : "Sec 80CCD(2) (NPS Contribution - Employer)",
    sec80dLabel: isGenZ ? "80D (Health Insurance - Stayin' Alive)" : "Sec 80D (Health Insurance Premium)",
    sec80eLabel: isGenZ ? "80E (Education Loan - Brain Tax)" : "Sec 80E (Interest on Education Loan)",
    sec80gLabel: isGenZ ? "80G (Charity - Karma Points)" : "Sec 80G (Donations to Charitable Funds)",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : parseFloat(value) || 0;
    updateData({ ...data, deductions: { ...ded, [name]: numValue } });
  };

  useEffect(() => {
    if (isNewRegime && data.personal.assessmentYear !== "2023-24") {
      // Under new regime, 80CCD(2) and 80CCH are allowed
      setTotalDeductions(
        (parseFloat(ded.sec80ccd2) || 0) + (parseFloat(ded.sec80cch) || 0),
      );
      return;
    }

    // Limiting 80C, 80CCC, 80CCD(1) to 1.5 Lakhs
    const c_ccc_ccd1 =
      (parseFloat(ded.sec80c) || 0) +
      (parseFloat(ded.sec80ccc) || 0) +
      (parseFloat(ded.sec80ccd1) || 0);
    const limited80C = Math.min(150000, c_ccc_ccd1);

    // NPS 80CCD(1B) max 50k
    const limited80CCD1B = Math.min(50000, parseFloat(ded.sec80ccd1b) || 0);

    // Just sum the rest for this basic view (real engine limits will strictly apply them against GTI)
    const others =
      (parseFloat(ded.sec80d) || 0) +
      (parseFloat(ded.sec80dd) || 0) +
      (parseFloat(ded.sec80ddb) || 0) +
      (parseFloat(ded.sec80e) || 0) +
      (parseFloat(ded.sec80g) || 0) +
      (parseFloat(ded.sec80tta) || 0) +
      (parseFloat(ded.sec80ttb) || 0) +
      (parseFloat(ded.otherDeductions) || 0);

    const total =
      limited80C +
      limited80CCD1B +
      others +
      (parseFloat(ded.sec80ccd2) || 0) +
      (parseFloat(ded.sec80cch) || 0);
    setTotalDeductions(total);
  }, [ded, isNewRegime, data.personal.assessmentYear]);

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
          className="bg-primary-light"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(79, 70, 229, 0.1)",
            color: "var(--primary)",
            fontWeight: "bold",
          }}
        >
          {labels.totalLabel} ₹ {totalDeductions.toLocaleString("en-IN")}
        </div>
      </div>

      {isNewRegime && (
        <div
          className="mb-6 p-4 rounded-md"
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            color: "var(--warning)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <strong>Note:</strong> {labels.newRegimeWarning}
        </div>
      )}

      <div className="card p-6 slide-up mb-6">
        <h3 className="text-lg font-bold mb-4">{labels.investmentsTitle}</h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            marginBottom: "1rem",
          }}
        >
          {labels.investmentsSubtitle}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="input-group">
            <label className="input-label">{labels.sec80cLabel}</label>
            <CurrencyInput
              name="sec80c"
              className="input-field"
              value={ded.sec80c || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
              max={150000}
            />
          </div>
          <div className="input-group">
            <label className="input-label">
              Sec 80CCC (Annuity Plan of LIC or other insurer)
            </label>
            <CurrencyInput
              name="sec80ccc"
              className="input-field"
              value={ded.sec80ccc || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
              max={150000}
            />
          </div>
          <div className="input-group">
            <label className="input-label">
              Sec 80CCD(1) (NPS Contribution - Employee)
            </label>
            <CurrencyInput
              name="sec80ccd1"
              className="input-field"
              value={ded.sec80ccd1 || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
              max={150000}
            />
          </div>
          <div className="input-group">
            <label className="input-label">{labels.sec80ccd1bLabel}</label>
            <CurrencyInput
              name="sec80ccd1b"
              className="input-field"
              value={ded.sec80ccd1b || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
              max={50000}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--text-muted)",
              }}
            >
              Max separate allowance ₹50,000
            </p>
          </div>
          <div className="input-group">
            <label
              className="input-label"
              style={{
                color: isNewRegime ? "var(--dark)" : "var(--text-main)",
                fontWeight: isNewRegime ? "bold" : "normal",
              }}
            >
              {labels.sec80ccd2Label}
            </label>
            <CurrencyInput
              name="sec80ccd2"
              className="input-field"
              value={ded.sec80ccd2 || ""}
              onChange={handleChange}
              placeholder="0"
              style={{
                borderColor: isNewRegime ? "var(--primary)" : "var(--input-border)",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: isNewRegime ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              {labels.allowedNewRegime}
            </p>
          </div>
          <div className="input-group">
            <label
              className="input-label"
              style={{
                color: isNewRegime ? "var(--dark)" : "var(--text-main)",
                fontWeight: isNewRegime ? "bold" : "normal",
              }}
            >
              Sec 80CCH (Agniveer Corpus Fund)
            </label>
            <CurrencyInput
              name="sec80cch"
              className="input-field"
              value={ded.sec80cch || ""}
              onChange={handleChange}
              placeholder="0"
              style={{
                borderColor: isNewRegime ? "var(--primary)" : "var(--input-border)",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: isNewRegime ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              {labels.allowedNewRegime}
            </p>
          </div>
        </div>
      </div>

      <div
        className="card p-6 slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        <h3 className="text-lg font-bold mb-4">{labels.otherTitle}</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="input-group">
            <label className="input-label">{labels.sec80dLabel}</label>
            <CurrencyInput
              name="sec80d"
              className="input-field"
              value={ded.sec80d || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.sec80eLabel}</label>
            <CurrencyInput
              name="sec80e"
              className="input-field"
              value={ded.sec80e || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.sec80gLabel}</label>
            <CurrencyInput
              name="sec80g"
              className="input-field"
              value={ded.sec80g || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Sec 80TTA (Interest on Savings Account)
            </label>
            <CurrencyInput
              name="sec80tta"
              className="input-field"
              value={ded.sec80tta || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
              max={10000}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--text-muted)",
              }}
            >
              Max ₹10,000, Not for Sen. Citizens
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">
              Sec 80TTB (Interest on Deposits - Sen. Citizens)
            </label>
            <CurrencyInput
              name="sec80ttb"
              className="input-field"
              value={ded.sec80ttb || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
              max={50000}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--text-muted)",
              }}
            >
              Max ₹50,000
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">
              Other Specific Deductions (80DD, 80DDB, 80U etc.)
            </label>
            <CurrencyInput
              name="otherDeductions"
              className="input-field"
              value={ded.otherDeductions || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deductions
