import React, { useEffect, useState } from 'react'
import { FileText, PieChart, Layers, Settings, Calculator, AlertTriangle } from 'lucide-react'
import CurrencyInput from './CurrencyInput'

const businessCodes = [
  { code: '', label: 'Select a standard code...' },
  { code: '01001', label: '01001 - Agriculture, Animal Husbandry & Forestry' },
  { code: '02001', label: '02001 - Mining and Quarrying' },
  { code: '03001', label: '03001 - Manufacturing' },
  { code: '04001', label: '04001 - Electricity, Gas and Water Supply' },
  { code: '05001', label: '05001 - Construction' },
  { code: '06001', label: '06001 - Real Estate' },
  { code: '07001', label: '07001 - Renting of Machinery' },
  { code: '08001', label: '08001 - Wholesale Trade' },
  { code: '09001', label: '09001 - Retail Trade' },
  { code: '10001', label: '10001 - Restaurants and Accommodation' },
  { code: '11001', label: '11001 - Transport and Logistics' },
  { code: '12001', label: '12001 - Telecommunications & Post' },
  { code: '13001', label: '13001 - Financial Intermediation' },
  { code: '14001', label: '14001 - Computer & IT Services' },
  { code: '16001', label: '16001 - Legal Profession' },
  { code: '16002', label: '16002 - Accounting, Bookkeeping & Auditing' },
  { code: '16003', label: '16003 - Tax Consultancy' },
  { code: '16004', label: '16004 - Architecture & Engineering' },
  { code: '16008', label: '16008 - Medical Profession (Doctors/Clinics)' },
  { code: '16013', label: '16013 - Fashion Designing / Interior Decorator' },
  { code: '16019', label: '16019 - Other Professionals' },
  { code: '17001', label: '17001 - Education Services' },
  { code: '18001', label: '18001 - Healthcare & Social Work' },
  { code: '19001', label: '19001 - Other Services' },
  { code: '20001', label: '20001 - Extra territorial organizations' },
]

const PGBP = ({ data, updateData, textStyle = "professional" }) => {
  const [activeSubTab, setActiveSubTab] = useState("general");
  const isGenZ = textStyle === "genz";

  const labels = {
    title: isGenZ
      ? "Side Hustles & Business Income 💼"
      : "Profits and Gains of Business or Profession",
    taxableLabel: isGenZ ? "Total Hustle Profit:" : "Taxable PGBP:",
    general: isGenZ ? "Startup Info" : "General Info",
    presumptive: isGenZ ? "No-Book Hack" : "Presumptive Tax",
    pnl: isGenZ ? "Profit & Loss" : "Trading & P&L",
    balanceSheet: isGenZ ? "The Stack" : "Balance Sheet",
    adjustments: isGenZ ? "Tax Tuning" : "Adjustments",
    complianceWarning: isGenZ
      ? "Bruh, Legal Warning (Tax Audit):"
      : "Statutory Compliance Warning (Tax Audit):",
    businessName: isGenZ ? "Brand / Hustle Name" : "Name of Business / Profession",
    nature: isGenZ ? "What do you actually do?" : "Nature of Business",
    code: isGenZ ? "Official Hustle Code" : "Primary Business Code",
    accounting: isGenZ ? "How do you track money?" : "Method of Accounting",
    presumptiveTitle: isGenZ
      ? "Presumptive Tax: The 'Simple Mode' (Sec 44AD/ADA/AE)"
      : "Presumptive Taxation Scheme (Sec 44AD / 44ADA / 44AE)",
    isOpting: isGenZ ? "Do you want 'Simple Mode'?" : "Opting for Presumptive Taxation?",
    selectSection: isGenZ ? "Which Loophole applies?" : "Select Presumptive Section",
    pnlTitle: isGenZ ? "Money In vs Money Out Statement" : "Statement of Profit and Loss (Schedule III Format)",
    revenue: isGenZ ? "I. MONEY IN (THE BAG)" : "I. REVENUE",
    expenses: isGenZ ? "II. MONEY OUT (BURNT)" : "II. EXPENSES",
    pbt: isGenZ ? "III. Raw Profit (Before Tax Tuning):" : "III. Profit Before Tax (I - II):",
    bsTitle: isGenZ ? "The Financial Snapshot (Sheet)" : "Balance Sheet (Schedule III Format)",
    adjustmentsTitle: isGenZ ? "Tuning Profit for the Tax Man" : "Adjustments to Net Profit (As per IT Act)",
    turnoverDigital: isGenZ ? "Digital Cash Trapped (Min 6%)" : "Digital Turnover (Gross Receipts via Banking - Min 6% Profit)",
    turnoverNonDigital: isGenZ ? "Cash flow IRL (Min 8%)" : "Non-Digital Turnover (Cash/Other Receipts - Min 8% Profit)",
    grossReceipts: isGenZ ? "Total Freelance Bag (Min 50%)" : "Gross Professional Receipts (Min 50% Profit)",
    declaredProfit: isGenZ ? "Profit you want to tell Govt" : "Declared Profit",
    auditAlert: isGenZ ? "⚠️ Audit Alert! Too Much Cash" : "⚠️ Statutory Audit Alert (Sec 44AB):"
  };

  const defaultPgbp = {
    general: {
      businessName: "",
      nature: "",
      code: "",
      methodOfAccounting: "mercantile",
    },
    presumptive: {
      isOpting: "no",
      nature: "44AD",
      turnoverDigital: 0,
      turnoverNonDigital: 0,
      declaredProfit44AD: 0,
      grossReceipts44ADA: 0,
      declaredProfit44ADA: 0,
      heavyVehicles: 0,
      heavyVehiclesTonnage: 0,
      heavyVehiclesMonths: 0,
      lightVehicles: 0,
      lightVehiclesMonths: 0,
      declaredProfit44AE: 0,
    },
    pnl: {
      revenueOperations: 0,
      otherIncome: 0,
      openingStock: 0,
      purchases: 0,
      directExpenses: 0,
      closingStock: 0,
      employeeBenefits: 0,
      financeCosts: 0,
      depreciation: 0,
      otherExpenses: 0,
    },
    balanceSheet: {
      partnerCapital: 0,
      reservesSurplus: 0,
      longTermBorrowings: 0,
      otherLongTermLiab: 0,
      shortTermBorrowings: 0,
      tradePayables: 0,
      otherCurrentLiab: 0,
      shortTermProvisions: 0,
      fixedAssets: 0,
      intangibleAssets: 0,
      nonCurrentInvestments: 0,
      longTermLoans: 0,
      currentInvestments: 0,
      inventories: 0,
      tradeReceivables: 0,
      cashEquivalents: 0,
      shortTermLoans: 0,
      otherCurrentAssets: 0,
    },
    adjustments: {
      depreciationIT: 0,
      depreciationCompanies: 0,
      disallowances: 0,
      personalExpenses: 0,
      otherAdditions: 0,
      otherDeductions: 0,
    },
  };

  const pgbp = data.business?.general ? data.business : defaultPgbp;

  const [netProfitAsPerPL, setNetProfitAsPerPL] = useState(0);
  const [taxablePgbp, setTaxablePgbp] = useState(0);
  const [presumptiveIncome, setPresumptiveIncome] = useState(0);
  const [auditWarning, setAuditWarning] = useState("");

  useEffect(() => {
    // Calculate P&L Net Profit (Schedule III Approach)
    const {
      revenueOperations,
      otherIncome,
      openingStock,
      purchases,
      directExpenses,
      closingStock,
      employeeBenefits,
      financeCosts,
      depreciation,
      otherExpenses,
    } = pgbp.pnl;
    const totalRevenue =
      (parseFloat(revenueOperations) || 0) +
      (parseFloat(otherIncome) || 0) +
      (parseFloat(closingStock) || 0);
    const totalExpenses =
      (parseFloat(openingStock) || 0) +
      (parseFloat(purchases) || 0) +
      (parseFloat(directExpenses) || 0) +
      (parseFloat(employeeBenefits) || 0) +
      (parseFloat(financeCosts) || 0) +
      (parseFloat(depreciation) || 0) +
      (parseFloat(otherExpenses) || 0);

    const np = totalRevenue - totalExpenses;
    setNetProfitAsPerPL(np);

    // Calculate Taxable PGBP (Net Profit + Additions - Deductions)
    const {
      depreciationIT,
      depreciationCompanies,
      disallowances,
      personalExpenses,
      otherAdditions,
      otherDeductions,
    } = pgbp.adjustments;

    const additions =
      (parseFloat(depreciationCompanies) || 0) +
      (parseFloat(disallowances) || 0) +
      (parseFloat(personalExpenses) || 0) +
      (parseFloat(otherAdditions) || 0);
    const deductions =
      (parseFloat(depreciationIT) || 0) + (parseFloat(otherDeductions) || 0);

    let computedPresumptive = 0;
    if (pgbp.presumptive?.isOpting === "yes") {
      const p = pgbp.presumptive;
      if (p.nature === "44AD") {
        const minProfit =
          (parseFloat(p.turnoverDigital) || 0) * 0.06 +
          (parseFloat(p.turnoverNonDigital) || 0) * 0.08;
        computedPresumptive = Math.max(
          minProfit,
          parseFloat(p.declaredProfit44AD) || 0,
        );
      } else if (p.nature === "44ADA") {
        const minProfit = (parseFloat(p.grossReceipts44ADA) || 0) * 0.5;
        computedPresumptive = Math.max(
          minProfit,
          parseFloat(p.declaredProfit44ADA) || 0,
        );
      } else if (p.nature === "44AE") {
        const heavy = parseFloat(p.heavyVehicles) || 0;
        const heavyM = parseFloat(p.heavyVehiclesMonths) || 0;
        const heavyT = parseFloat(p.heavyVehiclesTonnage) || 0;
        const light = parseFloat(p.lightVehicles) || 0;
        const lightM = parseFloat(p.lightVehiclesMonths) || 0;
        const minProfit =
          heavy * heavyM * heavyT * 1000 + light * lightM * 7500;
        computedPresumptive = Math.max(
          minProfit,
          parseFloat(p.declaredProfit44AE) || 0,
        );
      }
    }
    setPresumptiveIncome(computedPresumptive);

    setTaxablePgbp(np + additions - deductions + computedPresumptive);

    // Audit Warnings Check u/s 44AB
    let warning = "";
    if (parseFloat(pgbp.pnl.revenueOperations) > 10000000) {
      warning = isGenZ
        ? "Turnover exceeded ₹1 Crore. Govt wants an audit. Chill if cash is < 5% though (₹10 Cr limit)."
        : "Gross Turnover from regular business exceeds ₹1 Crore. A Tax Audit u/s 44AB may be mandatory (Limit is ₹10 Crore if cash receipts/payments conform strictly to <= 5%).";
    } else if (pgbp.presumptive?.isOpting === "yes") {
      const p = pgbp.presumptive;
      if (p.nature === "44ADA" && parseFloat(p.grossReceipts44ADA) > 5000000) {
        warning = isGenZ
          ? "Freelance receipts over ₹50L. Normal audit is mandatory now."
          : "Professional Gross Receipts exceed ₹50 Lakhs limit for 44ADA. Normal books of accounts and Tax Audit u/s 44AB is mandatory. (Limit is ₹75 Lakhs if cash receipts <= 5%).";
      } else if (p.nature === "44AD") {
        const totalTO =
          (parseFloat(p.turnoverDigital) || 0) +
          (parseFloat(p.turnoverNonDigital) || 0);
        if (totalTO > 20000000) {
          warning = isGenZ
            ? "Business Turnover over ₹2 Crores. Tax Audit u/s 44AB is mandatory."
            : "Business Turnover exceeds ₹2 Crores limit for 44AD. Tax Audit u/s 44AB is mandatory. (Limit is ₹3 Crores if cash receipts <= 5%).";
        }
      }
    }
    setAuditWarning(warning);
  }, [pgbp.pnl, pgbp.adjustments, pgbp.presumptive]);

  const deepUpdate = (section, field, value) => {
    const isStringField =
      section === "general" ||
      field === "isOpting" ||
      field === "nature" ||
      field === "methodOfAccounting";
    const numValue = isStringField
      ? value
      : value === ""
      ? ""
      : parseFloat(value) || 0;
    const updated = {
      ...pgbp,
      [section]: {
        ...pgbp[section],
        [field]: numValue,
      },
    };
    updateData({ ...data, business: updated });
  };

  return (
    <div className="fade-in">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
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
          {labels.taxableLabel} ₹ {taxablePgbp.toLocaleString("en-IN")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--input-border)",
          paddingBottom: "0.5rem",
        }}
      >
        <button
          onClick={() => setActiveSubTab("general")}
          className={`btn ${activeSubTab === "general" ? "btn-primary" : "btn-secondary"}`}
          style={{ boxShadow: "none", whiteSpace: "nowrap" }}
        >
          <FileText size={16} /> {labels.general}
        </button>
        <button
          onClick={() => setActiveSubTab("presumptive")}
          className={`btn ${
            activeSubTab === "presumptive" ? "btn-primary" : "btn-secondary"
          }`}
          style={{ boxShadow: "none", whiteSpace: "nowrap" }}
        >
          <Calculator size={16} /> {labels.presumptive}
        </button>
        <button
          onClick={() => setActiveSubTab("pnl")}
          className={`btn ${activeSubTab === "pnl" ? "btn-primary" : "btn-secondary"}`}
          style={{ boxShadow: "none", whiteSpace: "nowrap" }}
        >
          <PieChart size={16} /> {labels.pnl}
        </button>
        <button
          onClick={() => setActiveSubTab("balanceSheet")}
          className={`btn ${
            activeSubTab === "balanceSheet" ? "btn-primary" : "btn-secondary"
          }`}
          style={{ boxShadow: "none", whiteSpace: "nowrap" }}
        >
          <Layers size={16} /> {labels.balanceSheet}
        </button>
        <button
          onClick={() => setActiveSubTab("adjustments")}
          className={`btn ${
            activeSubTab === "adjustments" ? "btn-primary" : "btn-secondary"
          }`}
          style={{ boxShadow: "none", whiteSpace: "nowrap" }}
        >
          <Settings size={16} /> {labels.adjustments}
        </button>
      </div>

      {auditWarning && (
        <div
          className="mb-6 p-4 rounded-md slide-up"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "var(--danger)",
            borderLeft: "4px solid var(--danger)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <AlertTriangle size={24} />
          <div>
            <strong>{labels.complianceWarning}</strong> {auditWarning}
          </div>
        </div>
      )}

      {activeSubTab === "general" && (
        <div className="card p-6 slide-up">
          <h3 className="text-lg font-bold mb-4">{labels.general}</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div className="input-group">
              <label className="input-label">{labels.businessName}</label>
              <input
                type="text"
                className="input-field"
                value={pgbp.general.businessName || ""}
                onChange={(e) => deepUpdate("general", "businessName", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">{labels.nature}</label>
              <input
                type="text"
                className="input-field"
                value={pgbp.general.nature || ""}
                onChange={(e) => deepUpdate("general", "nature", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">{labels.code}</label>
              <select
                className="input-field"
                value={pgbp.general.code || ""}
                onChange={(e) => deepUpdate("general", "code", e.target.value)}
              >
                {businessCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">{labels.accounting}</label>
              <select
                className="input-field"
                value={pgbp.general.methodOfAccounting || "mercantile"}
                onChange={(e) =>
                  deepUpdate("general", "methodOfAccounting", e.target.value)
                }
              >
                <option value="mercantile">Mercantile (Accrual)</option>
                <option value="cash">Cash Basis</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "presumptive" && (
        <div className="card p-6 slide-up">
          <h3 className="text-lg font-bold mb-4">{labels.presumptiveTitle}</h3>

          <div className="input-group mb-6">
            <label className="input-label">{labels.isOpting}</label>
            <select
              className="input-field"
              style={{ maxWidth: "300px" }}
              value={pgbp.presumptive.isOpting || "no"}
              onChange={(e) => deepUpdate("presumptive", "isOpting", e.target.value)}
            >
              <option value="no">{isGenZ ? "Nope" : "No"}</option>
              <option value="yes">{isGenZ ? "Yep, Hack enabled" : "Yes"}</option>
            </select>
          </div>

          {pgbp.presumptive.isOpting === "yes" && (
            <div
              className="p-4 rounded-md"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--input-border)",
              }}
            >
              <div className="input-group mb-4">
                <label className="input-label">{labels.selectSection}</label>
                <select
                  className="input-field"
                  style={{ maxWidth: "400px" }}
                  value={pgbp.presumptive.nature || "44AD"}
                  onChange={(e) => deepUpdate("presumptive", "nature", e.target.value)}
                >
                  <option value="44AD">Sec 44AD (Eligible Business - 6%/8%)</option>
                  <option value="44ADA">Sec 44ADA (Professionals - Min 50%)</option>
                  <option value="44AE">Sec 44AE (Goods Carriages)</option>
                </select>
              </div>

              {pgbp.presumptive.nature === "44AD" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div className="input-group">
                    <label className="input-label">{labels.turnoverDigital}</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.turnoverDigital || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "turnoverDigital", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{labels.turnoverNonDigital}</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.turnoverNonDigital || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "turnoverNonDigital", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{labels.declaredProfit}</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.declaredProfit44AD || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "declaredProfit44AD", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {pgbp.presumptive.nature === "44ADA" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div className="input-group">
                    <label className="input-label">{labels.grossReceipts}</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.grossReceipts44ADA || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "grossReceipts44ADA", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{labels.declaredProfit}</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.declaredProfit44ADA || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "declaredProfit44ADA", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {pgbp.presumptive.nature === "44AE" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div className="input-group">
                    <label className="input-label">
                      No. of Heavy Goods Vehicles (Over 12MT)
                    </label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.heavyVehicles || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "heavyVehicles", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Total Tonnage of Heavy Vehicles</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.heavyVehiclesTonnage || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "heavyVehiclesTonnage", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Months Owned (Heavy)</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.heavyVehiclesMonths || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "heavyVehiclesMonths", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      No. of Light Vehicles (Up to 12MT)
                    </label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.lightVehicles || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "lightVehicles", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Months Owned (Light)</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.lightVehiclesMonths || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "lightVehiclesMonths", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{labels.declaredProfit}</label>
                    <CurrencyInput
                      className="input-field"
                      value={pgbp.presumptive.declaredProfit44AE || ""}
                      onChange={(e) =>
                        deepUpdate("presumptive", "declaredProfit44AE", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "pnl" && (
        <div className="card p-6 slide-up">
          <h3 className="text-lg font-bold mb-4">{labels.pnlTitle}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Revenue Section */}
            <div>
              <h4
                style={{
                  marginBottom: "1rem",
                  color: "var(--primary)",
                  borderBottom: "2px solid rgba(79, 70, 229, 0.2)",
                  paddingBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                {labels.revenue}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">
                    {isGenZ ? "Total Hustle Income (Sales)" : "Revenue from Operations (Sales/Gross Receipts)"}
                  </label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.revenueOperations || ""}
                    onChange={(e) =>
                      deepUpdate("pnl", "revenueOperations", e.target.value)
                    }
                  />
                </div>
                {(parseFloat(pgbp.pnl.revenueOperations) || 0) > 10000000 && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(245, 158, 11, 0.1)",
                      color: "var(--warning)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      marginTop: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>{labels.auditAlert}</strong>{" "}
                    {isGenZ 
                      ? "High turnover alert. Audit might be mandatory. Cash threshold is ₹10 Cr." 
                      : "Your gross receipts exceed ₹1 Crore. You may be liable for a Tax Audit by a Chartered Accountant unless your cash receipts are less than 5% of total receipts (in which case threshold is ₹10 Cr)."}
                  </div>
                )}
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "Side Cash" : "Other Income"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.otherIncome || ""}
                    onChange={(e) => deepUpdate("pnl", "otherIncome", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "Inventory Left" : "Closing Stock"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.closingStock || ""}
                    onChange={(e) => deepUpdate("pnl", "closingStock", e.target.value)}
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  fontWeight: "bold",
                }}
              >
                {isGenZ ? "Total In:" : "Total Revenue:"} ₹{" "}
                {(
                  (parseFloat(pgbp.pnl.revenueOperations) || 0) +
                  (parseFloat(pgbp.pnl.otherIncome) || 0) +
                  (parseFloat(pgbp.pnl.closingStock) || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h4
                style={{
                  marginBottom: "1rem",
                  color: "var(--danger)",
                  borderBottom: "2px solid rgba(239, 68, 68, 0.2)",
                  paddingBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                {labels.expenses}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "Stuff already in Stock" : "Opening Stock"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.openingStock || ""}
                    onChange={(e) => deepUpdate("pnl", "openingStock", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "New Gear / Inventory" : "Purchases of Stock-in-Trade"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.purchases || ""}
                    onChange={(e) => deepUpdate("pnl", "purchases", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Direct Expenses</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.directExpenses || ""}
                    onChange={(e) => deepUpdate("pnl", "directExpenses", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "Team Salaries" : "Employee Benefits Expense"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.employeeBenefits || ""}
                    onChange={(e) => deepUpdate("pnl", "employeeBenefits", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "EMI & Loan Interest" : "Finance Costs"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.financeCosts || ""}
                    onChange={(e) => deepUpdate("pnl", "financeCosts", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Depreciation</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.depreciation || ""}
                    onChange={(e) => deepUpdate("pnl", "depreciation", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{isGenZ ? "Misc Costs" : "Other Expenses"}</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.pnl.otherExpenses || ""}
                    onChange={(e) => deepUpdate("pnl", "otherExpenses", e.target.value)}
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  fontWeight: "bold",
                }}
              >
                {isGenZ ? "Total Out:" : "Total Expenses:"} ₹{" "}
                {(
                  (parseFloat(pgbp.pnl.openingStock) || 0) +
                  (parseFloat(pgbp.pnl.purchases) || 0) +
                  (parseFloat(pgbp.pnl.directExpenses) || 0) +
                  (parseFloat(pgbp.pnl.employeeBenefits) || 0) +
                  (parseFloat(pgbp.pnl.financeCosts) || 0) +
                  (parseFloat(pgbp.pnl.depreciation) || 0) +
                  (parseFloat(pgbp.pnl.otherExpenses) || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              background: "var(--glass-bg)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid var(--input-border)",
            }}
          >
            <span style={{ fontWeight: 600 }}>{labels.pbt}</span>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: netProfitAsPerPL >= 0 ? "var(--dark)" : "var(--danger)",
              }}
            >
              ₹ {netProfitAsPerPL.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {activeSubTab === "balanceSheet" && (
        <div className="card p-6 slide-up">
          <h3 className="text-lg font-bold mb-4">{labels.bsTitle}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Equity and Liabilities */}
            <div>
              <h4
                style={{
                  marginBottom: "1rem",
                  color: "var(--text-main)",
                  borderBottom: "2px solid rgba(148, 163, 184, 0.4)",
                  paddingBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                I. EQUITY AND LIABILITIES
              </h4>

              <h5
                style={{
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                1. {isGenZ ? "Own Money / Partner's Capital" : "Shareholders' Funds"}
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">Capital Account</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.partnerCapital || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "partnerCapital", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Reserves and Surplus</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.reservesSurplus || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "reservesSurplus", e.target.value)
                    }
                  />
                </div>
              </div>

              <h5
                style={{
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                2. Non-Current Liabilities
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">Long-Term Borrowings</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.longTermBorrowings || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "longTermBorrowings", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Other Long-Term Liabilities</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.otherLongTermLiab || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "otherLongTermLiab", e.target.value)
                    }
                  />
                </div>
              </div>

              <h5
                style={{
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                3. Current Liabilities (Must Pay Soon)
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">Short-Term Borrowings (Bank OD)</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.shortTermBorrowings || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "shortTermBorrowings", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Trade Payables (Creditors)</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.tradePayables || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "tradePayables", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Other Current Liabilities</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.otherCurrentLiab || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "otherCurrentLiab", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Short-Term Provisions</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.shortTermProvisions || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "shortTermProvisions", e.target.value)
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: "var(--row-highlight-bg)",
                  padding: "1rem",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                TOTAL EQUITY & LIABILITIES = ₹{" "}
                {(
                  (parseFloat(pgbp.balanceSheet.partnerCapital) || 0) +
                  (parseFloat(pgbp.balanceSheet.reservesSurplus) || 0) +
                  (parseFloat(pgbp.balanceSheet.longTermBorrowings) || 0) +
                  (parseFloat(pgbp.balanceSheet.otherLongTermLiab) || 0) +
                  (parseFloat(pgbp.balanceSheet.shortTermBorrowings) || 0) +
                  (parseFloat(pgbp.balanceSheet.tradePayables) || 0) +
                  (parseFloat(pgbp.balanceSheet.otherCurrentLiab) || 0) +
                  (parseFloat(pgbp.balanceSheet.shortTermProvisions) || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Assets */}
            <div style={{ marginTop: "2rem" }}>
              <h4
                style={{
                  marginBottom: "1rem",
                  color: "var(--text-main)",
                  borderBottom: "2px solid rgba(148, 163, 184, 0.4)",
                  paddingBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                II. ASSETS
              </h4>

              <h5
                style={{
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                1. Non-Current Assets (Hard Assets)
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">Property, Plant and Equipment</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.fixedAssets || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "fixedAssets", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Intangible Assets</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.intangibleAssets || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "intangibleAssets", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Non-Current Investments</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.nonCurrentInvestments || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "nonCurrentInvestments", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Long-Term Loans / Advances</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.longTermLoans || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "longTermLoans", e.target.value)
                    }
                  />
                </div>
              </div>

              <h5
                style={{
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                2. Current Assets (Liquidity)
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label className="input-label">Current Investments</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.currentInvestments || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "currentInvestments", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Inventories</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.inventories || ""}
                    onChange={(e) => deepUpdate("balanceSheet", "inventories", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Trade Receivables (Debtors)</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.tradeReceivables || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "tradeReceivables", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Cash and Equivalents</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.cashEquivalents || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "cashEquivalents", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Short-Term Loans / Advances</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.shortTermLoans || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "shortTermLoans", e.target.value)
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Other Current Assets</label>
                  <CurrencyInput
                    className="input-field"
                    value={pgbp.balanceSheet.otherCurrentAssets || ""}
                    onChange={(e) =>
                      deepUpdate("balanceSheet", "otherCurrentAssets", e.target.value)
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: "var(--row-highlight-bg)",
                  padding: "1rem",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                TOTAL ASSETS = ₹{" "}
                {(
                  (parseFloat(pgbp.balanceSheet.fixedAssets) || 0) +
                  (parseFloat(pgbp.balanceSheet.intangibleAssets) || 0) +
                  (parseFloat(pgbp.balanceSheet.nonCurrentInvestments) || 0) +
                  (parseFloat(pgbp.balanceSheet.longTermLoans) || 0) +
                  (parseFloat(pgbp.balanceSheet.currentInvestments) || 0) +
                  (parseFloat(pgbp.balanceSheet.inventories) || 0) +
                  (parseFloat(pgbp.balanceSheet.tradeReceivables) || 0) +
                  (parseFloat(pgbp.balanceSheet.cashEquivalents) || 0) +
                  (parseFloat(pgbp.balanceSheet.shortTermLoans) || 0) +
                  (parseFloat(pgbp.balanceSheet.otherCurrentAssets) || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "adjustments" && (
        <div className="card p-6 slide-up">
          <h3 className="text-lg font-bold mb-4">{labels.adjustmentsTitle}</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Additions */}
            <div>
              <h4
                style={{
                  marginBottom: "1rem",
                  color: "var(--danger)",
                  borderBottom: "1px solid var(--input-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {isGenZ ? "Add Back (Rejected Expenses)" : "Additions (Inadmissible Expenses)"}
              </h4>
              <div className="input-group">
                <label className="input-label">Depreciation (Companies Act)</label>
                <CurrencyInput
                  className="input-field"
                  value={pgbp.adjustments.depreciationCompanies || ""}
                  onChange={(e) =>
                    deepUpdate("adjustments", "depreciationCompanies", e.target.value)
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">Disallowances u/s 40(a), 43B, etc.</label>
                <CurrencyInput
                  className="input-field"
                  value={pgbp.adjustments.disallowances || ""}
                  onChange={(e) =>
                    deepUpdate("adjustments", "disallowances", e.target.value)
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">Personal / Other Inadmissible</label>
                <CurrencyInput
                  className="input-field"
                  value={pgbp.adjustments.personalExpenses || ""}
                  onChange={(e) =>
                    deepUpdate("adjustments", "personalExpenses", e.target.value)
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">Any Other Additions</label>
                <CurrencyInput
                  className="input-field"
                  value={pgbp.adjustments.otherAdditions || ""}
                  onChange={(e) =>
                    deepUpdate("adjustments", "otherAdditions", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h4
                style={{
                  marginBottom: "1rem",
                  color: "var(--success)",
                  borderBottom: "1px solid var(--input-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {isGenZ ? "New Deductions (Tax Benefits)" : "Deductions (Allowed under IT Act)"}
              </h4>
              <div className="input-group">
                <label className="input-label">Depreciation allowable u/s 32</label>
                <CurrencyInput
                  className="input-field"
                  value={pgbp.adjustments.depreciationIT || ""}
                  onChange={(e) =>
                    deepUpdate("adjustments", "depreciationIT", e.target.value)
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">Any Other Deductions</label>
                <CurrencyInput
                  className="input-field"
                  value={pgbp.adjustments.otherDeductions || ""}
                  onChange={(e) =>
                    deepUpdate("adjustments", "otherDeductions", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "space-between",
              paddingTop: "1rem",
              marginTop: "1.5rem",
              borderTop: "2px solid var(--input-border)",
              fontSize: "1.125rem",
              color: "var(--primary)",
            }}
          >
            <strong>{isGenZ ? "Final Adjusted Hustle Profit:" : "Adjusted Taxable PGBP:"}</strong>
            <strong style={{ fontSize: "1.25rem" }}>
              ₹ {taxablePgbp.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default PGBP
