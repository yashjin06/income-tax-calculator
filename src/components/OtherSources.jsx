import React, { useEffect, useState } from 'react'
import CurrencyInput from './CurrencyInput'

const OtherSources = ({ data, updateData, textStyle = "professional" }) => {
  const isGenZ = textStyle === "genz";
  const isNewRegime = data?.personal?.newRegime === "yes";

  const labels = {
    title: isGenZ ? "The Random Income Bag 💰" : "Income from Other Sources",
    netIncome: isGenZ ? "Total Random Money:" : "Net Income:",
    savingsInterest: isGenZ
      ? "Savings Bank Interest (Pocket Change)"
      : "Interest from Savings Bank",
    fdInterest: isGenZ
      ? "FD/RD Interest (Boomer Gains)"
      : "Interest from Deposits (FD/RD/Post Office/PPF)",
    dividend: isGenZ ? "Stock Dividends (Passive Vibe)" : "Dividend Income",
    winnings: isGenZ
      ? "Gaming/Lottery Wins (Govt takes 30% 💀)"
      : "Winnings from Lotteries, Puzzles, Games (Taxable @ 30%)",
    gifts: isGenZ ? "Gift Money (>₹50k, Non-Fam)" : "Gifts Received (> ₹50,000, Not from Relatives)",
    agri: isGenZ ? "Farm Income (The Rural Flex)" : "Net Agricultural Income",
    pension: isGenZ ? "Family Pension (Legacy Bag)" : "Gross Family Pension Received",
    other: isGenZ ? "Misc Random Cash" : "Any Other Taxable Income",
    expenses: isGenZ ? "Less: Hustle Expenses" : "Less: Allowed Expenses (u/s 57)",
    agriHint: isGenZ ? "Used for the 'Partial Integration' logic" : "Used for Partial Integration rule",
    regimeHint: isGenZ ? "New Regime = No benefits here" : "Not allowed under New Regime (Except Family Pension)"
  };

  const os = data.otherSources || {
    savingsInterest: 0,
    fdInterest: 0,
    dividend: 0,
    winnings: 0, // Taxed at flat 30%
    gifts: 0,
    agriculturalIncome: 0,
    familyPension: 0,
    otherIncome: 0,
    expenses: 0,
  };

  const [totalOs, setTotalOs] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : parseFloat(value) || 0;
    updateData({ ...data, otherSources: { ...os, [name]: numValue } });
  };

  useEffect(() => {
    const ay = data?.personal?.assessmentYear || "2024-25";
    let limit = 15000;
    if (ay === "2025-26" || ay === "2026-27") {
      limit = 25000;
    }

    const famPen = parseFloat(os.familyPension) || 0;
    const famPenDed = Math.min(famPen / 3, limit);
    const netFamPen = famPen - famPenDed;

    const total =
      (parseFloat(os.savingsInterest) || 0) +
      (parseFloat(os.fdInterest) || 0) +
      (parseFloat(os.dividend) || 0) +
      (parseFloat(os.winnings) || 0) +
      (parseFloat(os.gifts) || 0) +
      netFamPen +
      (parseFloat(os.otherIncome) || 0) -
      (parseFloat(os.expenses) || 0);

    setTotalOs(Math.round(Math.max(0, total))); // Generally can't be negative unless specific expenses allowed
  }, [os]);

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
            borderRadius: "var(--radius-md)",
            background: "rgba(79, 70, 229, 0.1)",
            color: "var(--primary)",
            fontWeight: "bold",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}
        >
          {labels.netIncome} ₹ {totalOs.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="card p-6 slide-up">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="input-group">
            <label className="input-label">{labels.savingsInterest}</label>
            <CurrencyInput
              name="savingsInterest"
              className="input-field"
              value={os.savingsInterest || ""}
              onChange={handleChange}
              placeholder="0"
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--text-muted)",
              }}
            >
              {isNewRegime
                ? isGenZ ? "L Regime = No deductions" : "Not eligible for 80TTA/80TTB under New Regime"
                : "Eligible for 80TTA/80TTB"}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">{labels.fdInterest}</label>
            <CurrencyInput
              name="fdInterest"
              className="input-field"
              value={os.fdInterest || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.dividend}</label>
            <CurrencyInput
              name="dividend"
              className="input-field"
              value={os.dividend || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.winnings}</label>
            <CurrencyInput
              name="winnings"
              className="input-field"
              value={os.winnings || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.gifts}</label>
            <CurrencyInput
              name="gifts"
              className="input-field"
              value={os.gifts || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.agri}</label>
            <CurrencyInput
              name="agriculturalIncome"
              className="input-field"
              value={os.agriculturalIncome || ""}
              onChange={handleChange}
              placeholder="0"
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--text-muted)",
              }}
            >
              {labels.agriHint}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">{labels.pension}</label>
            <CurrencyInput
              name="familyPension"
              className="input-field"
              value={os.familyPension || ""}
              onChange={handleChange}
              placeholder="0"
            />
            <p style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "var(--primary)" }}>
              {isGenZ ? "Standard deduction applied automatically ❤️" : "Auto-deducting standard deduction of 1/3rd or ₹" + ((data?.personal?.assessmentYear === "2025-26" || data?.personal?.assessmentYear === "2026-27") ? "25,000" : "15,000")}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">{labels.other}</label>
            <CurrencyInput
              name="otherIncome"
              className="input-field"
              value={os.otherIncome || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label
              className="input-label"
              style={{ color: isNewRegime ? "var(--text-muted)" : "var(--danger)" }}
            >
              {labels.expenses}
            </label>
            <CurrencyInput
              name="expenses"
              className="input-field"
              value={os.expenses || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
            {isNewRegime && (
              <p
                style={{
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  color: "var(--danger)",
                }}
              >
                {labels.regimeHint}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherSources
