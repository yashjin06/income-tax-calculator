import React, { useMemo } from 'react'
import { computeTax } from '../computation/taxEngine'

const TaxComputation = ({ data, textStyle = "professional" }) => {
  const isNewRegime = data.personal?.newRegime === "yes";

  // Compute both regimes for comparison
  const oldRegimeData = useMemo(
    () => ({ ...data, personal: { ...data.personal, newRegime: "no" } }),
    [data],
  );
  const newRegimeData = useMemo(
    () => ({ ...data, personal: { ...data.personal, newRegime: "yes" } }),
    [data],
  );

  const oldResults = useMemo(() => computeTax(oldRegimeData), [oldRegimeData]);
  const newResults = useMemo(() => computeTax(newRegimeData), [newRegimeData]);

  // Current selected results for detailed output
  const results = isNewRegime ? newResults : oldResults;

  const oldTax = oldResults.totalTaxLiability;
  const newTax = newResults.totalTaxLiability;
  const savings = Math.abs(oldTax - newTax);
  const isSame = oldTax === newTax;
  const betterRegime =
    oldTax < newTax ? "Old Regime" : newTax < oldTax ? "New Regime" : "Both";

  const isGenZ = textStyle === "genz";

  const labels = {
    summaryTitle: isGenZ ? "Tax Liability Summary" : "Tax Summary Comparison",
    oldRegimeLabel: isGenZ ? "Old Regime" : "Old Tax Regime",
    newRegimeLabel: isGenZ ? "New Regime" : "New Regime (115BAC)",
    drawTitle: isGenZ ? "The Math is a Draw" : "Liability is Identical",
    savingsTitle: isGenZ ? "Money stays in YOUR pocket" : "Potential Tax Savings",
    rescuedLabel: isGenZ
      ? `rescued by choosing the ${betterRegime} 🦸‍♂️`
      : `saved by opting for ${betterRegime}`,
    insightsTitle: isGenZ ? "💡 Smart Pro Insights" : "Professional Tax Insights",
    sliceLabel: isGenZ ? "The Taxman's Slice 🍕" : "Effective Tax Rate",
    sliceNote: isGenZ
      ? 'Your mandatory subscription to "India: The Country".'
      : "Average tax rate on your gross total income.",
    slaveLabel: isGenZ
      ? "You slave for the Govt for"
      : "Equivalent work-days for Tax:",
    detailedTitle: isGenZ
      ? `Detailed Computation (${isNewRegime ? "New" : "Old"} Regime)`
      : `Computation for ${isNewRegime ? "New" : "Old"} Tax Regime`,
    incomeHeadsTitle: isGenZ
      ? "Where Your Money Came From (Head-wise)"
      : "I. Income from Various Heads",
    salaryLabel: isGenZ ? "1. Your Hard-Earned Salary 💼" : "1. Income from Salaries",
    hpLabel: isGenZ ? "2. Landlord Gains (or Pains) 🏠" : "2. Income from House Property",
    pgbpLabel: isGenZ
      ? "3. Your Entrepreneurial Hustle 🚀"
      : "3. Business or Professional Income",
    cgLabel: isGenZ ? "4. Stock Market Gambles (aka Gains) 📈" : "4. Capital Gains",
    osLabel: isGenZ
      ? "5. Random Loose Change & Dividends 🕵️‍♂️"
      : "5. Income from Other Sources",
    gtiLabel: isGenZ ? "Gross Total Income (GTI)" : "Gross Total Income (GTI)",
    deductionsLabel: isGenZ
      ? "Minus: The Stuff You Actually Deducted"
      : "Less: Chapter VI-A Deductions",
    ttiLabel: isGenZ ? "Total Taxable Income" : "Total Taxable Income",
    taxLiabilityTitle: isGenZ ? "Tax Liability Computation" : "II. Computation of Tax Liability",
    normalTax: isGenZ ? "Slab Tax (The Regular Taxman) 🏛️" : "Income Tax at Normal Rates",
    specialTax: isGenZ ? "Special Tax (The 'Premium' Collection) ✨" : "Income Tax at Special Rates",
    taxBeforeRebate: isGenZ ? "Tax Before Rebate" : "Gross Tax Before Rebate",
    rebateLabel: isGenZ ? "The 'Forgiveness' Discount (Rebate 87A) 🙏" : "Less: Rebate u/s 87A",
    surchargeLabel: isGenZ ? "Add: Surcharge" : "Add: Surcharge",
    cessLabel: isGenZ
      ? 'Mandatory "Nation Building" Fee (Cess 4%) 🏫'
      : "Add: Health & Education Cess (4%)",
    totalTaxLiability: isGenZ ? "Total Tax Liability" : "Total Net Tax Liability",
    penalInterest: isGenZ ? "Add: Penal Interest (Sec 234A/B/C)" : "Add: Penal Interest",
    totalPayable: isGenZ ? "Total Payable (Incl. Interest)" : "Total Tax Payable",
    prepaidLabel: isGenZ
      ? "Less: Prepaid Taxes (TDS / Advance / Self)"
      : "Less: Prepaid Taxes (TDS/Adv Tax)",
    balancePayable: isGenZ ? "Balance Tax Payable" : "Net Tax Payable",
    refundDue: isGenZ ? "Tax Refund Due" : "Net Tax Refundable",
  };

  return (
    <div className="fade-in">
      {/* Comparative Summary Widget */}
      <div
        className="card slide-up"
        style={{
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          marginBottom: "2.5rem",
          maxWidth: "600px",
          margin: "0 auto 2.5rem auto",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{
            color: "var(--dark)",
            WebkitTextFillColor: "var(--dark)",
            background: "none",
            WebkitBackgroundClip: "unset",
            backgroundClip: "unset",
          }}
        >
          {labels.summaryTitle}
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "3rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              {labels.oldRegimeLabel}
            </p>
            <p
              style={{
                fontWeight: 800,
                fontSize: "1.75rem",
                color: "var(--text-main)",
              }}
            >
              ₹ {oldTax.toLocaleString("en-IN")}
            </p>
          </div>
          <div
            style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "1.1rem" }}
          >
            vs
          </div>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              {labels.newRegimeLabel}
            </p>
            <p
              style={{
                fontWeight: 800,
                fontSize: "1.75rem",
                color: "var(--text-main)",
              }}
            >
              ₹ {newTax.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div
          style={{
            background: isSame ? "var(--glass-bg)" : "rgba(16, 185, 129, 0.1)",
            color: isSame ? "var(--text-main)" : "var(--success)",
            padding: "1.25rem 2rem",
            borderRadius: "var(--radius-lg)",
            display: "inline-block",
            minWidth: "280px",
            boxShadow: isSame
              ? "none"
              : "0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)",
          }}
        >
          <div
            style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.25rem" }}
          >
            {isSame ? labels.drawTitle : labels.savingsTitle}
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
            ₹ {savings.toLocaleString("en-IN")}
          </div>
          {!isSame && (
            <div
              style={{
                fontSize: "0.85rem",
                marginTop: "0.5rem",
                opacity: 0.8,
                fontWeight: 500,
              }}
            >
              {labels.rescuedLabel}
            </div>
          )}
        </div>
      </div>

      {/* Smart Insights (AI-Powered) */}
      <div
        className="card slide-up"
        style={{
          padding: "2rem",
          marginBottom: "2.5rem",
          background: "var(--glass-bg)",
          borderLeft: "4px solid var(--primary)",
          animationDelay: "0.1s",
        }}
      >
        <h3
          className="text-xl font-bold mb-4"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--primary-hover)",
          }}
        >
          {labels.insightsTitle}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              background: "var(--row-alt-bg)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--glass-border)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                color: "var(--primary)",
                fontSize: "0.9rem",
                marginBottom: "0.25rem",
                fontWeight: 600,
                WebkitTextFillColor: "var(--primary)",
              }}
            >
              {labels.sliceLabel}
            </p>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--dark)",
              }}
            >
              {results.grossTotalIncome > 0
                ? ((results.totalTaxLiability / results.grossTotalIncome) * 100).toFixed(
                    2,
                  )
                : 0}
              %
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
              }}
            >
              {labels.sliceNote}
            </p>

            {(() => {
              const rate =
                results.grossTotalIncome > 0
                  ? (results.totalTaxLiability / results.grossTotalIncome) * 100
                  : 0;
              const months = (rate / 100) * 12;

              let hilariuosMsg = "";
              if (isGenZ) {
                if (months === 0)
                  hilariuosMsg = "Zero tax? Teach me your ways, Oh Wise One. 🧙‍♂️✨";
                else if (months < 1)
                  hilariuosMsg =
                    "The government barely gets a coffee break on your dime. Winning! ☕️🏆";
                else if (months < 2)
                  hilariuosMsg =
                    "January belongs to the State. From February, you're officially a free man! 🔓";
                else if (months < 3)
                  hilariuosMsg =
                    "You're essentially a 'Silver Tier' donor to the nation's highways. 🛣️💎";
                else if (months < 4)
                  hilariuosMsg =
                    "A whole quarter gone. You're basically the government's favorite intern. 💼📉";
                else if (months < 5)
                  hilariuosMsg =
                    "The FM should probably send you a Thank You card. Or a hug. 💌🫂";
                else
                  hilariuosMsg =
                    "Congratulations! You're basically part of the cabinet at this point. 🏛️🫡";
              } else {
                hilariuosMsg =
                  "This represents the portion of the year dedicated to income tax liability.";
              }

              return (
                <div
                  style={{
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px dashed var(--glass-border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-main)",
                      fontWeight: 500,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {labels.slaveLabel} <strong>{months.toFixed(1)}</strong> months a
                    year!
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    {hilariuosMsg}
                  </p>
                </div>
              );
            })()}
          </div>

          {!isNewRegime &&
            (parseFloat(data.deductions?.sec80c) || 0) < 150000 && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <p
                  style={{
                    color: "var(--success)",
                    fontSize: "0.9rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {isGenZ ? "80C: The Taxman's Kryptonite 🦸‍♂️" : "Maximize Sec 80C"}
                </p>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--text-main)",
                    lineHeight: "1.4",
                  }}
                >
                  {isGenZ
                    ? `You've only used ₹${(
                        parseFloat(data.deductions?.sec80c) || 0
                      ).toLocaleString(
                        "en-IN",
                      )} of your ₹1.5L allowance. Don't leave ₹${(
                        150000 - (parseFloat(data.deductions?.sec80c) || 0)
                      ).toLocaleString(
                        "en-IN",
                      )} on the table for the government to buy more staplers!`
                    : `You have utilized only ₹${(
                        parseFloat(data.deductions?.sec80c) || 0
                      ).toLocaleString(
                        "en-IN",
                      )} of the ₹1.5 Lakh limit. Investing an additional ₹${(
                        150000 - (parseFloat(data.deductions?.sec80c) || 0)
                      ).toLocaleString(
                        "en-IN",
                      )} can significantly reduce your tax liability.`}
                </p>
              </div>
            )}

          {isNewRegime &&
            (parseFloat(data.deductions?.sec80ccd2) || 0) === 0 &&
            parseFloat(data.salary?.basic) > 0 && (
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                }}
              >
                <p
                  style={{
                    color: "var(--warning)",
                    fontSize: "0.9rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {isGenZ ? "NPS: The Legal Loophole™ 🧠" : "Corporate NPS Benefit"}
                </p>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--text-main)",
                    lineHeight: "1.4",
                  }}
                >
                  {isGenZ
                    ? 'Even in the New Regime, Employer NPS is a "get out of tax free" card. Restructure your CTC and tell your boss it\'s for \'long-term synergy\' (while you wink at the taxman). 😉'
                    : "Employer contributions to NPS under Sec 80CCD(2) are deductible even in the New Tax Regime. Consider restructuring your compensation plan to include this benefit."}
                </p>
              </div>
            )}

          {betterRegime !== (isNewRegime ? "New Regime" : "Old Regime") &&
            betterRegime !== "Both" && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <p
                  style={{
                    color: "var(--danger)",
                    fontSize: "0.9rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {isGenZ ? "Financial Self-Sabotage Alert 🚩" : "Critically Lower Tax Available"}
                </p>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--text-main)",
                    lineHeight: "1.4",
                  }}
                >
                  {isGenZ
                    ? `You've picked the ${
                        isNewRegime ? "New" : "Old"
                      } Regime, but you're literally ghosting ₹${savings.toLocaleString(
                        "en-IN",
                      )}! Switch to the ${betterRegime} before you hurt your bank account's feelings.`
                    : `Your current selection of the ${
                        isNewRegime ? "New" : "Old"
                      } Regime results in ₹${savings.toLocaleString(
                        "en-IN",
                      )} extra tax. We recommend switching to the ${betterRegime} to optimize your tax payout.`}
                </p>
              </div>
            )}
        </div>
      </div>

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
        <h2 className="text-xl font-bold">{labels.detailedTitle}</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span
            className="badge"
            style={{
              background: isNewRegime ? "var(--primary)" : "var(--warning)",
              color: "#ffffff",
            }}
          >
            Selected: {isNewRegime ? "New Regime (Sec 115BAC)" : "Old Tax Regime"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Income Sources Summary */}
        <div className="card p-6 slide-up" style={{ animationDelay: "0.1s" }}>
          <h3
            className="text-lg font-bold mb-4"
            style={{ borderBottom: "2px solid var(--input-border)", paddingBottom: "0.5rem" }}
          >
            {labels.incomeHeadsTitle}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{labels.salaryLabel}</span>
              <span style={{ fontWeight: 500 }}>
                ₹ {results.netSalary.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{labels.hpLabel}</span>
              <span style={{ fontWeight: 500 }}>
                ₹ {results.netHouseProperty.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{labels.pgbpLabel}</span>
              <span style={{ fontWeight: 500 }}>
                ₹{" "}
                {(
                  results.netPGBP + (data.crypto?.treatAsPGBP ? results.netVDA || 0 : 0)
                ).toLocaleString("en-IN")}
              </span>
            </div>
            {data.crypto?.treatAsPGBP && results.netVDA > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ paddingLeft: "1rem" }}>∟ incl. VDA (Crypto) Income</span>
                <span>₹ {results.netVDA.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{labels.cgLabel}</span>
              <span style={{ fontWeight: 500 }}>
                ₹{" "}
                {(
                  results.stcg +
                  results.ltcg +
                  (!data.crypto?.treatAsPGBP ? results.netVDA || 0 : 0)
                ).toLocaleString("en-IN")}
              </span>
            </div>
            {!data.crypto?.treatAsPGBP && results.netVDA > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ paddingLeft: "1rem" }}>∟ incl. VDA (Crypto) Income</span>
                <span>₹ {results.netVDA.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{labels.osLabel}</span>
              <span style={{ fontWeight: 500 }}>
                ₹ {results.netOtherSources.toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
                paddingTop: "1rem",
                borderTop: "1px dashed var(--input-border)",
                fontWeight: "bold",
                fontSize: "1.125rem",
              }}
            >
              <span>{labels.gtiLabel}</span>
              <span>₹ {results.grossTotalIncome.toLocaleString("en-IN")}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--danger)",
                paddingTop: "0.5rem",
              }}
            >
              <span>{labels.deductionsLabel}</span>
              <span>(₹ {results.totalDeductions.toLocaleString("en-IN")})</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
                paddingTop: "1rem",
                borderTop: "2px solid var(--primary)",
                fontWeight: "bold",
                fontSize: "1.25rem",
                color: "var(--primary)",
              }}
            >
              <span>{labels.ttiLabel}</span>
              <span>₹ {results.totalTaxableIncome.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              *Rounded off globally in computation engine
            </div>
          </div>
        </div>

        {/* Tax Liability Summary */}
        <div
          className="card p-6 slide-up"
          style={{ animationDelay: "0.2s", background: "var(--card-bg)" }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{
              borderBottom: "2px solid rgba(79, 70, 229, 0.2)",
              paddingBottom: "0.5rem",
              color: "var(--primary-hover)",
            }}
          >
            {labels.taxLiabilityTitle}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.normalTax}</span>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.round(results.normalTax).toLocaleString("en-IN")}
              </span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.specialTax}</span>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.round(results.specialTax).toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: "1px dashed rgba(79, 70, 229, 0.3)",
                alignItems: "flex-start",
              }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.taxBeforeRebate}</span>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.round(results.totalTaxBeforeRebate).toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--success)",
                alignItems: "flex-start",
              }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.rebateLabel}</span>
              <span style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                (₹ {Math.round(results.rebate).toLocaleString("en-IN")})
              </span>
            </div>

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.surchargeLabel}</span>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.round(results.surcharge).toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.cessLabel}</span>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.round(results.cess).toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: "1px dashed rgba(79, 70, 229, 0.3)",
                alignItems: "flex-start",
                fontWeight: 600,
              }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.totalTaxLiability}</span>
              <span style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.round(results.totalTaxLiability).toLocaleString("en-IN")}
              </span>
            </div>

            {results.penalInterest > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    color: "var(--danger)",
                    marginTop: "0.5rem",
                  }}
                >
                  <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.penalInterest}</span>
                  <span style={{ fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                    ₹ {Math.round(results.penalInterest).toLocaleString("en-IN")}
                  </span>
                </div>
                {results.interest234A > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "1rem" }}>
                    ∟ Sec 234A (Late Filing): ₹ {Math.round(results.interest234A).toLocaleString("en-IN")}
                  </div>
                )}
                {results.interest234B > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "1rem" }}>
                    ∟ Sec 234B (Advance Tax Default): ₹{" "}
                    {Math.round(results.interest234B).toLocaleString("en-IN")}
                  </div>
                )}
                {results.interest234C > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "1rem" }}>
                    ∟ Sec 234C (Installment Deferment): ₹{" "}
                    {Math.round(results.interest234C).toLocaleString("en-IN")}
                  </div>
                )}
              </>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                borderTop: "2px solid var(--primary)",
                fontWeight: "bold",
                fontSize: "1.25rem",
                color: "var(--dark)",
                background: "var(--row-highlight-bg)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                boxShadow: "var(--shadow-sm)",
                alignItems: "flex-start",
              }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>{labels.totalPayable}</span>
              <span style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹{" "}
                {Math.round(
                  results.finalTaxPayableWithInterest || results.totalTaxLiability,
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "1rem" }}
            >
              <span style={{ flex: 1, paddingRight: "1rem", color: "var(--success)" }}>
                {labels.prepaidLabel}
              </span>
              <span
                style={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  color: "var(--success)",
                }}
              >
                (₹{" "}
                {Math.round(
                  (results.tdsPaid || 0) +
                    (results.advanceTaxPaid || 0) +
                    (results.selfAssessmentTaxPaid || 0),
                ).toLocaleString("en-IN")}
                )
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                borderTop: "2px dashed var(--danger)",
                fontWeight: "bold",
                fontSize: "1.5rem",
                color: results.netTaxPayable > 0 ? "var(--danger)" : "var(--success)",
                alignItems: "flex-start",
                paddingTop: "1rem",
              }}
            >
              <span style={{ flex: 1, paddingRight: "1rem" }}>
                {results.netTaxPayable < 0 ? labels.refundDue : labels.balancePayable}
              </span>
              <span style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                ₹ {Math.abs(Math.round(results.netTaxPayable)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* High Income Schedule AL Disclosure Warning */}
      {results.totalTaxableIncome > 5000000 && (
        <div
          className="card p-6 slide-up"
          style={{ marginTop: "2rem", borderLeft: "4px solid var(--warning)", animationDelay: "0.3s" }}
        >
          <h3
            className="text-lg font-bold mb-3"
            style={{ color: "var(--warning)", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {isGenZ ? "⚠️ Look at you, Moneybags! (Schedule AL) 💸" : "⚠️ High Net Worth Reporting (Schedule AL)"}
          </h3>
          <p style={{ color: "var(--text-main)", fontSize: "0.95rem", lineHeight: "1.5" }}>
            {isGenZ
              ? `Since you're officially "Rich" (over <strong>₹50 Lakhs</strong>), the govt wants a guided tour of your empire. You MUST file <strong>Schedule AL</strong> or they'll think you're hiding a yacht in your backyard.`
              : `As your total taxable income exceeds <strong>₹50 Lakhs</strong>, you are mandated to file <strong>Schedule AL</strong> (Assets and Liabilities). Failure to disclose these assets can lead to severe penalties.`}
          </p>
          <ul
            style={{
              marginTop: "1rem",
              marginLeft: "1.5rem",
              listStyleType: "disc",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>
              <strong>Immovable Assets:</strong> You must disclose the original cost of land and
              buildings.
            </li>
            <li>
              <strong>Movable Assets:</strong> Disclose all financial assets (shares, securities,
              mutual funds, bank balances, insurances), jewelry, bullion, vehicles, yachts, boats,
              and aircrafts.
            </li>
            <li>
              <strong>Liabilities:</strong> Any loans or liabilities specifically incurred in
              relation to acquiring these assets must also be reported.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaxComputation;
