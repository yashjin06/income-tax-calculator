import React, { useEffect, useState } from 'react'
import { PieChart, TrendingDown, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { computeTax } from '../computation/taxEngine'

const RegimeComparison = ({ data, textStyle = "professional" }) => {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    // We compute taxes for both regimes by overriding the newRegime flag temporarily
    const oldRegimeData = {
      ...data,
      personal: { ...data.personal, newRegime: "no" },
    };
    const newRegimeData = {
      ...data,
      personal: { ...data.personal, newRegime: "yes" },
    };

    const oldTax = computeTax(oldRegimeData);
    const newTax = computeTax(newRegimeData);

    setComparison({
      old: oldTax,
      new: newTax,
      diff: oldTax.totalTaxLiability - newTax.totalTaxLiability,
      betterRegime:
        oldTax.totalTaxLiability > newTax.totalTaxLiability
          ? "New"
          : oldTax.totalTaxLiability < newTax.totalTaxLiability
          ? "Old"
          : "Neutral",
    });
  }, [data]);

  const isGenZ = textStyle === "genz";

  if (!comparison) return null;

  const labels = {
    title: isGenZ ? "The Great Regime Battle" : "Tax Regime Comparison",
    subtitle: isGenZ
      ? "Let's see which regime treats your wallet better."
      : "A visual breakdown of your tax liability under the Old vs New Tax Regime.",
    oldRegime: isGenZ ? "Old Regime" : "Old Tax Regime",
    newRegime: isGenZ ? "New Regime" : "New Tax Regime (115BAC)",
    savingsTitle: isGenZ
      ? `You save ₹${Math.abs(comparison.diff).toLocaleString(
          "en-IN",
        )} by choosing the ${comparison.betterRegime} Regime!`
      : `Tax saving of ₹${Math.abs(comparison.diff).toLocaleString(
          "en-IN",
        )} available under ${comparison.betterRegime} Regime.`,
    savingsDetails: isGenZ
      ? `Based on your vibe and numbers, the ${comparison.betterRegime} Regime is clearly the MVP here.`
      : `Analysis indicates that the ${comparison.betterRegime} Regime provides optimal tax efficiency for your profile.`,
    drawTitle: isGenZ
      ? "It's a Tie! 🤝"
      : "Tax liability is identical under both regimes.",
    drawDetails: isGenZ
      ? `Doesn't matter which one you pick, the damage is ₹${comparison.new.totalTaxLiability.toLocaleString(
          "en-IN",
        )} either way.`
      : `Your tax liability is ₹${comparison.new.totalTaxLiability.toLocaleString(
          "en-IN",
        )} regardless of the selected regime.`,
    breakdownTitle: isGenZ ? "The Receipt" : "Detailed Breakdown",
    particulars: isGenZ ? "Line Items" : "Particulars",
    gti: isGenZ ? "Total Money In" : "Gross Total Income",
    deductions: isGenZ ? "Legal Loopholes / Deductions" : "Deductions (Ch VI-A & Std)",
    tti: isGenZ ? "Final Taxable Amount" : "Net Taxable Income",
    taxOnIncome: isGenZ ? "Raw Tax" : "Tax on Income",
    rebate: isGenZ ? "Government's Forgiveness (Rebate)" : "Rebate u/s 87A",
    netTaxLiability: isGenZ
      ? "The 'Ouch' Total (+Cess/Surcharge)"
      : "Net Tax Liability (+Cess/Surcharge)",
  };

  const maxTax = Math.max(
    comparison.old.totalTaxLiability,
    comparison.new.totalTaxLiability,
    1,
  ); // Prevent div by 0

  // Calculate bar heights as percentage (capped at 100%)
  const oldHeight = Math.max(
    5,
    (comparison.old.totalTaxLiability / maxTax) * 100,
  );
  const newHeight = Math.max(
    5,
    (comparison.new.totalTaxLiability / maxTax) * 100,
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 className="text-xl font-bold">{labels.title}</h2>
        <p className="text-sm text-gray-500">{labels.subtitle}</p>
      </div>

      {comparison.betterRegime !== "Neutral" && (
        <div
          className="mb-6 p-4 rounded-md slide-up"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            color: "var(--success)",
            borderLeft: "4px solid var(--success)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <CheckCircle size={28} />
          <div>
            <div className="font-bold text-lg">{labels.savingsTitle}</div>
            <div className="text-sm opacity-90">{labels.savingsDetails}</div>
          </div>
        </div>
      )}

      {comparison.betterRegime === "Neutral" && (
        <div
          className="mb-6 p-4 rounded-md slide-up"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            color: "var(--primary)",
            borderLeft: "4px solid var(--primary)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <AlertCircle size={28} />
          <div>
            <div className="font-bold text-lg">{labels.drawTitle}</div>
            <div className="text-sm opacity-90">{labels.drawDetails}</div>
          </div>
        </div>
      )}

      <div
        className="card p-6 slide-up"
        style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}
      >
        {/* Visual Bar Chart */}
        <div
          style={{
            flex: "1 1 300px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            height: "300px",
            paddingBottom: "2rem",
            borderBottom: "1px solid var(--border-color)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-end",
              height: "100%",
            }}
          >
            {/* Old Regime Bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "30%",
              }}
            >
              <div className="font-bold mb-2 text-lg">
                ₹ {comparison.old.totalTaxLiability.toLocaleString("en-IN")}
              </div>
              <div
                style={{
                  height: `${oldHeight}%`,
                  width: "100%",
                  background:
                    comparison.betterRegime === "Old"
                      ? "var(--success)"
                      : comparison.betterRegime === "Neutral"
                      ? "var(--primary)"
                      : "var(--danger)",
                  borderRadius: "8px 8px 0 0",
                  transition: "height 1s ease-out",
                }}
              ></div>
              <div className="mt-4 font-bold">{labels.oldRegime}</div>
            </div>

            {/* New Regime Bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "30%",
              }}
            >
              <div className="font-bold mb-2 text-lg">
                ₹ {comparison.new.totalTaxLiability.toLocaleString("en-IN")}
              </div>
              <div
                style={{
                  height: `${newHeight}%`,
                  width: "100%",
                  background:
                    comparison.betterRegime === "New"
                      ? "var(--success)"
                      : comparison.betterRegime === "Neutral"
                      ? "var(--primary)"
                      : "var(--danger)",
                  borderRadius: "8px 8px 0 0",
                  transition: "height 1s ease-out",
                }}
              ></div>
              <div className="mt-4 font-bold">{labels.newRegime}</div>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div style={{ flex: "2 1 400px" }}>
          <h3 className="font-bold mb-4">{labels.breakdownTitle}</h3>
          <div
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              background: "var(--bg-color)",
              borderRadius: "var(--radius-md)",
              overflowX: "auto",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "1rem",
                background: "var(--glass-bg)",
                fontWeight: "bold",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <div>{labels.particulars}</div>
              <div style={{ textAlign: "right" }}>{labels.oldRegime}</div>
              <div style={{ textAlign: "right" }}>{labels.newRegime}</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <div>{labels.gti}</div>
              <div style={{ textAlign: "right" }}>
                ₹ {comparison.old.grossTotalIncome.toLocaleString("en-IN")}
              </div>
              <div style={{ textAlign: "right" }}>
                ₹ {comparison.new.grossTotalIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border-color)",
                color: "var(--danger)",
              }}
            >
              <div>{labels.deductions}</div>
              <div style={{ textAlign: "right" }}>
                - ₹ {comparison.old.totalDeductions.toLocaleString("en-IN")}
              </div>
              <div style={{ textAlign: "right" }}>
                - ₹ {comparison.new.totalDeductions.toLocaleString("en-IN")}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border-color)",
                fontWeight: "bold",
              }}
            >
              <div>{labels.tti}</div>
              <div style={{ textAlign: "right" }}>
                ₹ {comparison.old.netTaxableIncome.toLocaleString("en-IN")}
              </div>
              <div style={{ textAlign: "right" }}>
                ₹ {comparison.new.netTaxableIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <div>{labels.taxOnIncome}</div>
              <div style={{ textAlign: "right" }}>
                ₹ {comparison.old.taxOnIncome.toLocaleString("en-IN")}
              </div>
              <div style={{ textAlign: "right" }}>
                ₹ {comparison.new.taxOnIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border-color)",
                color: "var(--success)",
              }}
            >
              <div>{labels.rebate}</div>
              <div style={{ textAlign: "right" }}>
                - ₹ {comparison.old.rebate87A.toLocaleString("en-IN")}
              </div>
              <div style={{ textAlign: "right" }}>
                - ₹ {comparison.new.rebate87A.toLocaleString("en-IN")}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr)",
                padding: "1rem",
                background: "var(--row-highlight-bg)",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              <div style={{ color: "var(--primary)" }}>
                {labels.netTaxLiability}
              </div>
              <div
                style={{
                  textAlign: "right",
                  color:
                    comparison.betterRegime === "Old"
                      ? "var(--success)"
                      : "var(--text-main)",
                }}
              >
                ₹ {comparison.old.totalTaxLiability.toLocaleString("en-IN")}
              </div>
              <div
                style={{
                  textAlign: "right",
                  color:
                    comparison.betterRegime === "New"
                      ? "var(--success)"
                      : "var(--text-main)",
                }}
              >
                ₹ {comparison.new.totalTaxLiability.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegimeComparison
