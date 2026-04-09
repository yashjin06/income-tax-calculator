import React, { useMemo } from 'react'
import { computeTax } from '../computation/taxEngine'

const IncomeSummary = ({ data, textStyle = "professional" }) => {
  const isNewRegime = data.personal?.newRegime === "yes";
  const targetData = {
    ...data,
    personal: { ...data.personal, newRegime: isNewRegime ? "yes" : "no" },
  };
  const results = useMemo(() => computeTax(targetData), [targetData]);

  const isGenZ = textStyle === "genz";

  const labels = {
    title: isGenZ ? "Your Official 'Ouch' Sheet" : "Statement of Total Income",
    profileTitle: isGenZ ? "Target for the Taxman (Profile)" : "Assessee Profile",
    incomeHeadsTitle: isGenZ
      ? "I. Where Your Wealth Evaporated From"
      : "I. Gross Total Income (Head-wise)",
    salaryHead: isGenZ ? "1. The 'Day Job' Earnings 👔" : "1. Income from Salaries",
    grossSalary: isGenZ ? "The 'Before-Taxes' Fantasy" : "Gross Salary",
    hpHead: isGenZ
      ? "2. Landlord Gains (or Pains) 🏠"
      : "2. Income from House Property",
    pgbpHead: isGenZ
      ? "3. Your Entrepreneurial Hustle 🚀"
      : "3. Profits & Gains of Business/Profession",
    cgHead: isGenZ
      ? "4. Stock Market Gambles (aka Gains) 📈"
      : "4. Capital Gains",
    osHead: isGenZ
      ? "5. Random Loose Change & Dividends 🕵️‍♂️"
      : "5. Income from Other Sources",
    gtiTotal: isGenZ ? "What you actually 'earned'" : "Gross Total Income",
    deductionsTitle: isGenZ
      ? "II. Your Legal Bribes (Deductions)"
      : "II. Less: Deductions under Chapter VI-A",
    ttiTotal: isGenZ
      ? "The Final Damage (Total Taxable Income)"
      : "Total Taxable Income (Rounded off u/s 288A)",
    lossTitle: isGenZ
      ? "III. Future Regrets (Carry Forward)"
      : "III. Losses to be Carried Forward",
    exemptTitle: isGenZ ? "Tax-Free Heavens (Exempt Incomes)" : "Exempt Incomes",
  };

  const fmt = (val) =>
    `₹ ${(parseFloat(val) || 0).toLocaleString("en-IN")}`;

  const grossSalary =
    (parseFloat(data.salary?.basic) || 0) +
    (parseFloat(data.salary?.da) || 0) +
    (parseFloat(data.salary?.hra) || 0) +
    (parseFloat(data.salary?.lta) || 0) +
    (parseFloat(data.salary?.otherAllowances) || 0) +
    (parseFloat(data.salary?.perquisites) || 0) +
    (parseFloat(data.salary?.profitInLieu) || 0);
  const isLatestBudget =
    data.personal?.assessmentYear === "2025-26" ||
    data.personal?.assessmentYear === "2026-27";
  const stdDeduction = Math.min(
    grossSalary,
    isNewRegime && isLatestBudget ? 75000 : 50000,
  );
  const pt = parseFloat(data.salary?.pt) || 0;

  const thStyle = { padding: "0.75rem 1rem", textAlign: "left" };
  const tdStyle = { padding: "0.75rem 1rem" };
  const tdRight = { padding: "0.75rem 1rem", textAlign: "right" };

  return (
    <div
      className="fade-in"
      style={{
        background: "var(--card-bg)",
        padding: "2.5rem",
        borderRadius: "var(--radius-lg)",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        border: "1px solid var(--input-border)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          borderBottom: "3px solid var(--primary)",
          paddingBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "var(--text-main)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {labels.title}
        </h2>
        <p
          style={{ color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}
        >
          Assessment Year {data.personal?.assessmentYear || "2024-25"} |{" "}
          {isNewRegime ? "New Regime (115BAC)" : "Old Tax Regime"}
        </p>
      </div>

      {/* 1. Profile */}
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: "bold",
          marginBottom: "0.75rem",
          color: "var(--text-main)",
        }}
      >
        {labels.profileTitle}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          background: "var(--glass-bg)",
          padding: "1.5rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "2.5rem",
          border: "1px dashed var(--primary)",
        }}
      >
        <div style={{ fontSize: "1.05rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Name:</span>{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {data.personal?.name || (
              <span
                style={{ opacity: 0.5, fontStyle: "italic", fontWeight: "normal" }}
              >
                Not Specified
              </span>
            )}
          </strong>
        </div>
        <div style={{ fontSize: "1.05rem" }}>
          <span style={{ color: "var(--text-muted)" }}>PAN:</span>{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {data.personal?.pan ? (
              data.personal.pan.toUpperCase()
            ) : (
              <span
                style={{ opacity: 0.5, fontStyle: "italic", fontWeight: "normal" }}
              >
                Not Specified
              </span>
            )}
          </strong>
        </div>
        <div style={{ fontSize: "1.05rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Status:</span>{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {data.personal?.category || "Individual"}
          </strong>
        </div>
        <div style={{ fontSize: "1.05rem" }}>
          <span style={{ color: "var(--text-muted)" }}>D.O.B:</span>{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {data.personal?.dob || (
              <span
                style={{ opacity: 0.5, fontStyle: "italic", fontWeight: "normal" }}
              >
                Not Specified
              </span>
            )}
          </strong>
        </div>
      </div>

      {/* 2. Computation of Income */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          color: "var(--primary)",
          borderBottom: "1px solid var(--input-border)",
          paddingBottom: "0.5rem",
        }}
      >
        {labels.incomeHeadsTitle}
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "2.5rem",
          color: "var(--text-main)",
        }}
      >
        <tbody>
          {/* Salary */}
          <tr>
            <td
              style={{
                ...tdStyle,
                fontWeight: "bold",
                fontSize: "1.125rem",
                paddingBottom: "0.25rem",
              }}
              colSpan={2}
            >
              {labels.salaryHead}
            </td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, paddingLeft: "1.5rem", opacity: 0.85 }}>
              {labels.grossSalary}
            </td>
            <td style={{ ...tdRight }}>{fmt(grossSalary)}</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, paddingLeft: "1.5rem", opacity: 0.85 }}>
              Less: Standard Deduction u/s 16(ia)
            </td>
            <td style={{ ...tdRight, color: "var(--danger)" }}>
              ({fmt(stdDeduction)})
            </td>
          </tr>
          {pt > 0 && (
            <tr>
              <td style={{ ...tdStyle, paddingLeft: "1.5rem", opacity: 0.85 }}>
                Less: Professional Tax u/s 16(iii)
              </td>
              <td style={{ ...tdRight, color: "var(--danger)" }}>
                ({fmt(pt)})
              </td>
            </tr>
          )}
          <tr
            style={{
              background: "var(--row-alt-bg)",
              borderTop: "1px dashed var(--input-border)",
              borderBottom: "1px solid var(--input-border)",
            }}
          >
            <td style={{ ...tdStyle, paddingLeft: "1.5rem", fontWeight: 600 }}>
              Net Income from Salaries
            </td>
            <td
              style={{ ...tdRight, fontWeight: "bold", fontSize: "1.125rem" }}
            >
              {fmt(results.netSalary)}
            </td>
          </tr>

          {/* House Property */}
          <tr>
            <td
              style={{
                ...tdStyle,
                fontWeight: "bold",
                fontSize: "1.125rem",
                paddingTop: "1rem",
                paddingBottom: "0.25rem",
              }}
              colSpan={2}
            >
              {labels.hpHead}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
            <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
              Income chargeable under the head 'House Property'
            </td>
            <td
              style={{ ...tdRight, fontWeight: "bold", fontSize: "1.125rem" }}
            >
              {fmt(results.netHouseProperty)}
            </td>
          </tr>

          {/* PGBP */}
          <tr>
            <td
              style={{
                ...tdStyle,
                fontWeight: "bold",
                fontSize: "1.125rem",
                paddingTop: "1rem",
                paddingBottom: "0.25rem",
              }}
              colSpan={2}
            >
              {labels.pgbpHead}
            </td>
          </tr>
          {data.crypto?.treatAsPGBP ? (
            <>
              <tr>
                <td style={{ ...tdStyle, paddingLeft: "1.5rem", opacity: 0.85 }}>
                  Normal Business Income
                </td>
                <td style={{ ...tdRight }}>{fmt(results.netPGBP)}</td>
              </tr>
              {results.netVDA > 0 && (
                <tr>
                  <td style={{ ...tdStyle, paddingLeft: "1.5rem", opacity: 0.85 }}>
                    Add: Virtual Digital Assets (Sec 115BBH)
                  </td>
                  <td style={{ ...tdRight }}>{fmt(results.netVDA)}</td>
                </tr>
              )}
            </>
          ) : null}
          <tr
            style={{
              background: "var(--row-alt-bg)",
              borderBottom: "1px solid var(--input-border)",
            }}
          >
            <td style={{ ...tdStyle, paddingLeft: "1.5rem", fontWeight: 600 }}>
              Net Income from Business/Profession
            </td>
            <td
              style={{ ...tdRight, fontWeight: "bold", fontSize: "1.125rem" }}
            >
              {fmt(
                results.netPGBP +
                  (data.crypto?.treatAsPGBP ? results.netVDA || 0 : 0),
              )}
            </td>
          </tr>

          {/* CG */}
          <tr>
            <td
              style={{
                ...tdStyle,
                fontWeight: "bold",
                fontSize: "1.125rem",
                paddingTop: "1rem",
                paddingBottom: "0.25rem",
              }}
              colSpan={2}
            >
              {labels.cgHead}
            </td>
          </tr>
          {!data.crypto?.treatAsPGBP && results.netVDA > 0 && (
            <tr>
              <td style={{ ...tdStyle, paddingLeft: "1.5rem", opacity: 0.85 }}>
                Add: Virtual Digital Assets (Sec 115BBH)
              </td>
              <td style={{ ...tdRight }}>{fmt(results.netVDA)}</td>
            </tr>
          )}
          <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
            <td style={{ ...tdStyle, paddingLeft: "1.5rem", fontWeight: 600 }}>
              Income chargeable under the head 'Capital Gains'
            </td>
            <td
              style={{ ...tdRight, fontWeight: "bold", fontSize: "1.125rem" }}
            >
              {fmt(
                results.stcg +
                  results.ltcg +
                  (!data.crypto?.treatAsPGBP ? results.netVDA || 0 : 0),
              )}
            </td>
          </tr>

          {/* OS */}
          <tr>
            <td
              style={{
                ...tdStyle,
                fontWeight: "bold",
                fontSize: "1.125rem",
                paddingTop: "1rem",
                paddingBottom: "0.25rem",
              }}
              colSpan={2}
            >
              {labels.osHead}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
            <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
              Income chargeable under the head 'Other Sources'
            </td>
            <td
              style={{ ...tdRight, fontWeight: "bold", fontSize: "1.125rem" }}
            >
              {fmt(results.netOtherSources)}
            </td>
          </tr>

          {/* GTI */}
          <tr style={{ background: "var(--row-highlight-bg)" }}>
            <td
              style={{
                padding: "1rem",
                fontWeight: "bold",
                fontSize: "1.25rem",
                textTransform: "uppercase",
                color: "var(--primary)",
                WebkitTextFillColor: "var(--primary)",
              }}
            >
              {labels.gtiTotal}
            </td>
            <td
              style={{
                padding: "1rem",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.5rem",
                color: "var(--primary)",
                WebkitTextFillColor: "var(--primary)",
              }}
            >
              {fmt(results.grossTotalIncome)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. Deductions */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          color: "var(--danger)",
          borderBottom: "1px solid var(--input-border)",
          paddingBottom: "0.5rem",
        }}
      >
        {labels.deductionsTitle}
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "2.5rem",
          color: "var(--text-main)",
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
              Total Section 80 Deductions (80C, 80D, 80G, etc.)
            </td>
            <td
              style={{
                ...tdRight,
                fontWeight: "bold",
                fontSize: "1.125rem",
                color: "var(--danger)",
              }}
            >
              ({fmt(results.totalDeductions)})
            </td>
          </tr>
          <tr
            style={{
              background: "var(--row-highlight-bg)",
              borderTop: "2px solid var(--primary)",
            }}
          >
            <td
              style={{
                padding: "1rem",
                fontWeight: "bold",
                fontSize: "1.25rem",
                textTransform: "uppercase",
                borderRadius: "0.375rem 0 0 0.375rem",
                color: "var(--primary)",
              }}
            >
              {labels.ttiTotal}
            </td>
            <td
              style={{
                padding: "1rem",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.5rem",
                borderRadius: "0 0.375rem 0.375rem 0",
                color: "var(--primary)",
              }}
            >
              {fmt(results.totalTaxableIncome)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Loss Carry Forward Matrix */}
      {results.carryForwardLosses &&
        (results.carryForwardLosses.houseProperty > 0 ||
          results.carryForwardLosses.business > 0 ||
          results.carryForwardLosses.stcl > 0 ||
          results.carryForwardLosses.ltcl > 0) && (
          <>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#d97706",
                borderBottom: "1px solid var(--input-border)",
                paddingBottom: "0.5rem",
                marginTop: "2rem",
              }}
            >
              {labels.lossTitle}
            </h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "2.5rem",
                color: "var(--text-main)",
              }}
            >
              <tbody>
                {results.carryForwardLosses.houseProperty > 0 && (
                  <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
                    <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
                      House Property Loss
                    </td>
                    <td
                      style={{
                        ...tdRight,
                        fontWeight: "bold",
                        fontSize: "1.125rem",
                        color: "#d97706",
                      }}
                    >
                      {fmt(results.carryForwardLosses.houseProperty)}
                    </td>
                  </tr>
                )}
                {results.carryForwardLosses.business > 0 && (
                  <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
                    <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
                      Business Loss (PGBP)
                    </td>
                    <td
                      style={{
                        ...tdRight,
                        fontWeight: "bold",
                        fontSize: "1.125rem",
                        color: "#d97706",
                      }}
                    >
                      {fmt(results.carryForwardLosses.business)}
                    </td>
                  </tr>
                )}
                {results.carryForwardLosses.stcl > 0 && (
                  <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
                    <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
                      Short-Term Capital Loss (STCL)
                    </td>
                    <td
                      style={{
                        ...tdRight,
                        fontWeight: "bold",
                        fontSize: "1.125rem",
                        color: "#d97706",
                      }}
                    >
                      {fmt(results.carryForwardLosses.stcl)}
                    </td>
                  </tr>
                )}
                {results.carryForwardLosses.ltcl > 0 && (
                  <tr style={{ borderBottom: "1px solid var(--input-border)" }}>
                    <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
                      Long-Term Capital Loss (LTCL)
                    </td>
                    <td
                      style={{
                        ...tdRight,
                        fontWeight: "bold",
                        fontSize: "1.125rem",
                        color: "#d97706",
                      }}
                    >
                      {fmt(results.carryForwardLosses.ltcl)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

      {/* Exempt Incomes */}
      {data.exemptIncome && data.exemptIncome.length > 0 && (
        <>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "var(--success)",
              borderBottom: "1px solid var(--input-border)",
              paddingBottom: "0.5rem",
            }}
          >
            {labels.exemptTitle}
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "2.5rem",
              color: "var(--text-main)",
            }}
          >
            <tbody>
              {data.exemptIncome.map((ex, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid var(--input-border)" }}
                >
                  <td style={{ ...tdStyle, paddingLeft: "1.5rem" }}>
                    {ex.section || "Sec 10"} - {ex.description || "Exempt Income"}
                  </td>
                  <td
                    style={{
                      ...tdRight,
                      fontWeight: "bold",
                      fontSize: "1.125rem",
                    }}
                  >
                    {fmt(ex.amount)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  style={{
                    ...tdStyle,
                    paddingLeft: "1.5rem",
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    color: "var(--success)",
                  }}
                >
                  Total Exempt Income
                </td>
                <td
                  style={{
                    ...tdRight,
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    color: "var(--success)",
                  }}
                >
                  {fmt(
                    data.exemptIncome.reduce(
                      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
                      0,
                    ),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default IncomeSummary
