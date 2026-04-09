import React, { useEffect, useState } from 'react'
import CurrencyInput from './CurrencyInput'

const Salary = ({ data, updateData, textStyle = "professional" }) => {
  const isNewRegime = data?.personal?.newRegime === "yes";
  const salData = data.salary || {
    basic: 0,
    da: 0,
    hra: 0,
    lta: 0,
    otherAllowances: 0,
    perquisites: 0,
    profitInLieu: 0,
    commutedPension: 0,
    pt: 0, // Professional Tax
    entAllow: 0, // Entertainment Allowance (Govt only)
  };

  const isGenZ = textStyle === "genz";

  const labels = {
    title: isGenZ ? "The 'Day Job' Earnings 👔" : "Income from Salaries",
    netTaxableSalary: isGenZ ? "Net Taxable Salary" : "Net Taxable Salary", // Keep standard
    employerName: isGenZ
      ? "Who signs your paycheck? (Employer)"
      : "Employer Name",
    employerTan: isGenZ ? "The Taxman's Secret Code (TAN)" : "Employer TAN",
    employerType: isGenZ
      ? "What kind of overlord? (Employer Type)"
      : "Employer Category",
    basic: isGenZ ? "The 'Before-Taxes' Fantasy (Basic)" : "Basic Salary",
    da: isGenZ ? "Inflation Survival Fund (DA) 📈" : "Dearness Allowance (DA)",
    hra: isGenZ ? "Your Square Meter of Sanity (HRA) 🏠" : "House Rent Allowance (HRA)",
    lta: isGenZ ? "The 'I Need a Vacation' Fund (LTA) ✈️" : "Leave Travel Allowance (LTA)",
    otherAllowances: isGenZ
      ? "Misc. Coins the Boss Threw at Me 🪙"
      : "Other Salary Components",
    commutedPension: isGenZ
      ? "Lump Sum of Retirement Joy (CP)"
      : "Commuted Pension",
    perquisites: isGenZ ? "Free Coffee & Office Perks ☕" : "Value of Perquisites",
    profitInLieu: isGenZ
      ? "The 'Profit' that mostly went to Tax"
      : "Profits in lieu of Salary",
    deductionsTitle: isGenZ
      ? "The Part where the Money Disappears 💸"
      : "Deductions under Section 16",
    sec16ia: isGenZ
      ? "The Govt's 'Mercy' Deduction (Sec 16ia)"
      : "Standard Deduction (Sec 16ia)",
    sec16ii: isGenZ
      ? "Tea/Coffee & 'Business' Parties (Sec 16ii)"
      : "Entertainment Allowance (Sec 16ii)",
    sec16iii: isGenZ
      ? "Tax for being a 'Professional' (Sec 16iii)"
      : "Professional Tax (Sec 16iii)",
    finalNetLabel: isGenZ
      ? "What's left for your actual life"
      : "Net Salary Chargeable to Tax",
  };

  const [grossSalary, setGrossSalary] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [showHraCalc, setShowHraCalc] = useState(false);
  const [hraInputs, setHraInputs] = useState({
    actualHra: 0,
    rentPaid: 0,
    isMetro: false,
  });

  const [showCpCalc, setShowCpCalc] = useState(false);
  const [cpInputs, setCpInputs] = useState({
    receivedAmt: "",
    commutedPercentage: 100,
    receivesGratuity: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : parseFloat(value) || 0;
    updateData({ ...data, salary: { ...salData, [name]: numValue } });
  };

  const calculateHRA = () => {
    let actual = parseFloat(hraInputs.actualHra) || 0;

    if (isNewRegime) {
      updateData({ ...data, salary: { ...salData, hra: actual } });
      setShowHraCalc(false);
      return;
    }

    let rent = parseFloat(hraInputs.rentPaid) || 0;
    let basicDA = (parseFloat(salData.basic) || 0) + (parseFloat(salData.da) || 0);

    let limit1 = actual;
    let limit2 = Math.max(0, rent - 0.1 * basicDA);
    let limit3 = hraInputs.isMetro ? 0.5 * basicDA : 0.4 * basicDA;

    let exemptHra = Math.min(limit1, limit2, limit3);
    let taxableHra = Math.max(0, actual - exemptHra);

    updateData({ ...data, salary: { ...salData, hra: taxableHra } });
    setShowHraCalc(false);
  };

  const calculateCP = () => {
    let received = parseFloat(cpInputs.receivedAmt) || 0;
    let percent = parseFloat(cpInputs.commutedPercentage) || 100;
    if (percent <= 0) percent = 100;

    let taxable = received;
    let totalPension = received / (percent / 100);

    if (salData.employerType === "govt") {
      taxable = 0; // Fully exempt for Govt
    } else {
      if (cpInputs.receivesGratuity) {
        let exempt = totalPension * (1 / 3);
        taxable = Math.max(0, received - exempt);
      } else {
        let exempt = totalPension * (1 / 2);
        taxable = Math.max(0, received - exempt);
      }
    }

    updateData({ ...data, salary: { ...salData, commutedPension: taxable } });
    setShowCpCalc(false);
  };

  useEffect(() => {
    const ay = data?.personal?.assessmentYear || "2024-25";
    const isLatestBudget = ay === "2025-26" || ay === "2026-27";
    const maxStandardDeduction = isNewRegime && isLatestBudget ? 75000 : 50000;

    const gross =
      (parseFloat(salData.basic) || 0) +
      (parseFloat(salData.da) || 0) +
      (parseFloat(salData.hra) || 0) +
      (parseFloat(salData.lta) || 0) +
      (parseFloat(salData.otherAllowances) || 0) +
      (parseFloat(salData.commutedPension) || 0) +
      (parseFloat(salData.perquisites) || 0) +
      (parseFloat(salData.profitInLieu) || 0);

    setGrossSalary(gross);

    const standardDeduction = Math.min(maxStandardDeduction, gross);
    const pt = parseFloat(salData.pt) || 0;
    const entAllow = parseFloat(salData.entAllow) || 0;

    const net = Math.max(0, gross - standardDeduction - pt - entAllow);
    setNetSalary(net);
  }, [salData, data?.personal?.newRegime, data?.personal?.assessmentYear]);

  return (
    <div className="fade-in">
      <div className="card p-6 mb-6 slide-up">
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
            {labels.netTaxableSalary}: ₹ {netSalary.toLocaleString("en-IN")}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px solid var(--input-border)",
          }}
        >
          <div className="input-group">
            <label className="input-label">{labels.employerName}</label>
            <input
              type="text"
              name="employerName"
              className="input-field"
              value={salData.employerName || ""}
              onChange={handleChange}
              placeholder="Company Name"
            />
          </div>
          <div className="input-group">
            <label className="input-label">{labels.employerTan}</label>
            <input
              type="text"
              name="employerTan"
              className="input-field"
              value={salData.employerTan || ""}
              onChange={handleChange}
              placeholder="e.g. DELC12345F"
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <div className="input-group">
            <label className="input-label">{labels.employerType}</label>
            <select
              name="employerType"
              className="input-field"
              value={salData.employerType || "private"}
              onChange={handleChange}
            >
              <option value="private">Private Sector</option>
              <option value="govt">Central / State Government</option>
              <option value="psu">Public Sector Undertaking (PSU)</option>
              <option value="pensioners">Pensioners</option>
              <option value="other">Others</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="input-group">
            <label className="input-label">{labels.basic}</label>
            <CurrencyInput
              name="basic"
              className="input-field"
              value={salData.basic || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.da}</label>
            <CurrencyInput
              name="da"
              className="input-field"
              value={salData.da || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label
              className="input-label"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <span>{labels.hra}</span>
              {!isNewRegime && (
                <button
                  type="button"
                  style={{
                    background: "transparent",
                    color: "var(--primary)",
                    padding: "0 0.5rem",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  onClick={() => setShowHraCalc(!showHraCalc)}
                >
                  ⚡ Calculate
                </button>
              )}
            </label>
            <CurrencyInput
              name="hra"
              className="input-field"
              value={salData.hra || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />

            {showHraCalc && !isNewRegime && (
              <div
                className="fade-in"
                style={{
                  marginTop: "0.75rem",
                  background: "var(--glass-bg)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--primary)",
                  boxShadow: "0 4px 15px -3px rgba(79, 70, 229, 0.15)",
                }}
              >
                <h4
                  style={{
                    color: "var(--primary)",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    borderBottom: "1px solid var(--glass-border)",
                    paddingBottom: "0.75rem",
                  }}
                >
                  Smart HRA Exemption Calculator
                </h4>
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Actual HRA Received</label>
                    <CurrencyInput
                      className="input-field"
                      value={hraInputs.actualHra || ""}
                      onChange={(e) =>
                        setHraInputs({ ...hraInputs, actualHra: e.target.value })
                      }
                      placeholder="Per Year"
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Total Rent Paid</label>
                    <CurrencyInput
                      className="input-field"
                      value={hraInputs.rentPaid || ""}
                      onChange={(e) =>
                        setHraInputs({ ...hraInputs, rentPaid: e.target.value })
                      }
                      placeholder="Per Year"
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="metroCity"
                      checked={hraInputs.isMetro}
                      onChange={(e) =>
                        setHraInputs({ ...hraInputs, isMetro: e.target.checked })
                      }
                      style={{
                        width: "1.2rem",
                        height: "1.2rem",
                        marginTop: "0.15rem",
                        cursor: "pointer",
                        accentColor: "var(--primary)",
                      }}
                    />
                    <label
                      htmlFor="metroCity"
                      className="input-label"
                      style={{ marginBottom: 0, cursor: "pointer", lineHeight: "1.4" }}
                    >
                      Rented in Metro City?
                      <br />
                      <span
                        style={{
                          fontWeight: "normal",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        (Delhi, Mumbai, Chennai, Kolkata)
                      </span>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    onClick={calculateHRA}
                  >
                    Apply Taxable HRA
                  </button>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    {data?.personal?.newRegime === "yes" ? (
                      <span style={{ color: "var(--danger)" }}>
                        HRA Exemption is not available under the New Tax Regime.
                        The entire amount is taxable.
                      </span>
                    ) : (
                      "Uses Basic + DA salary specified above to compute Least of 3 rule."
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">{labels.lta}</label>
            <CurrencyInput
              name="lta"
              className="input-field"
              value={salData.lta || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.otherAllowances}</label>
            <CurrencyInput
              name="otherAllowances"
              className="input-field"
              value={salData.otherAllowances || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label
              className="input-label"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <span>{labels.commutedPension}</span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--primary)",
                  padding: "0 0.5rem",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
                onClick={() => setShowCpCalc(!showCpCalc)}
              >
                ⚡ Calculate
              </button>
            </label>
            <CurrencyInput
              name="commutedPension"
              className="input-field"
              value={salData.commutedPension || ""}
              onChange={handleChange}
              placeholder="0"
            />

            {showCpCalc && (
              <div
                className="fade-in"
                style={{
                  marginTop: "0.75rem",
                  background: "var(--glass-bg)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--primary)",
                  boxShadow: "0 4px 15px -3px rgba(79, 70, 229, 0.15)",
                }}
              >
                <h4
                  style={{
                    color: "var(--primary)",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    borderBottom: "1px solid var(--glass-border)",
                    paddingBottom: "0.75rem",
                  }}
                >
                  Smart Commuted Pension Calculator
                </h4>
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Actual CP Received</label>
                    <CurrencyInput
                      className="input-field"
                      value={cpInputs.receivedAmt || ""}
                      onChange={(e) =>
                        setCpInputs({ ...cpInputs, receivedAmt: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Commutation %</label>
                    <CurrencyInput
                      className="input-field"
                      value={cpInputs.commutedPercentage || ""}
                      onChange={(e) =>
                        setCpInputs({
                          ...cpInputs,
                          commutedPercentage: e.target.value,
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                  {salData.employerType !== "govt" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="receivesGratuity"
                        checked={cpInputs.receivesGratuity}
                        onChange={(e) =>
                          setCpInputs({
                            ...cpInputs,
                            receivesGratuity: e.target.checked,
                          })
                        }
                        style={{
                          width: "1.2rem",
                          height: "1.2rem",
                          marginTop: "0.15rem",
                          cursor: "pointer",
                          accentColor: "var(--primary)",
                        }}
                      />
                      <label
                        htmlFor="receivesGratuity"
                        className="input-label"
                        style={{ marginBottom: 0, cursor: "pointer", lineHeight: "1.4" }}
                      >
                        Are you also receiving Gratuity?
                      </label>
                    </div>
                  )}
                  {salData.employerType === "govt" && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--primary)",
                        margin: 0,
                        fontWeight: "bold",
                      }}
                    >
                      Fully exempt for Govt Employees!
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    onClick={calculateCP}
                  >
                    Apply Taxable Pension
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">{labels.perquisites}</label>
            <CurrencyInput
              name="perquisites"
              className="input-field"
              value={salData.perquisites || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.profitInLieu}</label>
            <CurrencyInput
              name="profitInLieu"
              className="input-field"
              value={salData.profitInLieu || ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="card p-6 slide-up" style={{ animationDelay: "0.1s" }}>
        <h2
          className="text-xl font-bold mb-4"
          style={{ marginBottom: "1.5rem" }}
        >
          {labels.deductionsTitle}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="input-group">
            <label className="input-label">{labels.sec16ia}</label>
            <input
              type="text"
              className="input-field"
              value={
                "₹ " +
                Math.min(
                  data?.personal?.newRegime === "yes" &&
                    (data?.personal?.assessmentYear === "2025-26" ||
                      data?.personal?.assessmentYear === "2026-27")
                    ? 75000
                    : 50000,
                  grossSalary,
                ).toLocaleString("en-IN")
              }
              disabled
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.sec16ii}</label>
            <CurrencyInput
              name="entAllow"
              className="input-field"
              value={salData.entAllow || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{labels.sec16iii}</label>
            <CurrencyInput
              name="pt"
              className="input-field"
              value={salData.pt || ""}
              onChange={handleChange}
              placeholder="0"
              disabled={isNewRegime}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "var(--glass-bg)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--input-border)",
            }}
          >
            <span>Gross Salary</span>
            <span style={{ fontWeight: 500 }}>
              ₹ {grossSalary.toLocaleString("en-IN")}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "0.5rem",
              color: "var(--danger)",
            }}
          >
            <span>Total Deductions</span>
            <span style={{ fontWeight: 500 }}>
              - ₹{" "}
              {(
                Math.min(
                  data?.personal?.newRegime === "yes" &&
                    (data?.personal?.assessmentYear === "2025-26" ||
                      data?.personal?.assessmentYear === "2026-27")
                    ? 75000
                    : 50000,
                  grossSalary,
                ) +
                (parseFloat(salData.pt) || 0) +
                (parseFloat(salData.entAllow) || 0)
              ).toLocaleString("en-IN")}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "space-between",
              paddingTop: "1rem",
              marginTop: "0.5rem",
              borderTop: "2px solid var(--input-border)",
              fontSize: "1.125rem",
              color: "var(--primary)",
            }}
          >
            <strong>{labels.finalNetLabel}</strong>
            <strong>₹ {netSalary.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salary
