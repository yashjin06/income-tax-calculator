import { computeTax } from '../computation/taxEngine'
import { saveAs } from 'file-saver'

export const generateItrJson = (userData) => {
  // Compute final tax numbers to populate the JSON
  const taxComputation = computeTax(userData)
  
  // Determine Form Type based on income sources
  let formType = 'ITR-1'
  let hasBusiness = Object.keys(userData.business?.general?.businessName || '').length > 0 || (userData.business?.pnl?.revenueOperations > 0)
  let hasCapitalGains = taxComputation.taxBreakup?.stcgNormal > 0 || taxComputation.taxBreakup?.ltcgBase > 0 || (userData.crypto?.totalTaxableGain > 0)
  let hasPresumptive = userData.business?.presumptive?.isOpting === 'yes'
  let houseCount = (userData.houseProperty || []).length

  if (hasBusiness && !hasPresumptive) formType = 'ITR-3'
  else if (hasBusiness && hasPresumptive && !hasCapitalGains) formType = 'ITR-4'
  else if (hasCapitalGains || houseCount > 1 || (userData.personal?.residentialStatus === 'nri')) formType = 'ITR-2'

  // Construct Base ITR JSON Schema
  const itrJson = {
    "creationInfo": {
      "SWVersionNo": "1.0",
      "SWCreatedBy": "TaxNovaProOffline",
      "JSONCreatedBy": "TaxNovaProOffline",
      "JSONCreationDate": new Date().toISOString().split('T')[0]
    },
    // The dynamic key based on the determined form type
    [`ITR`] : {
      [Object.assign(formType.replace('-', ''))]: {
         "PersonalInfo": {
            "AssesseeName": {
               "FirstName": userData.personal?.name?.split(' ')[0] || "",
               "LastName": userData.personal?.name?.split(' ').slice(1).join(' ') || ""
            },
            "PAN": userData.personal?.pan || "",
            "AadhaarCardNo": userData.personal?.aadhaar || "",
            "DOB": userData.personal?.dob || "",
            "Status": userData.personal?.category === 'Individual' ? 'I' : (userData.personal?.category === 'HUF' ? 'H' : 'F'),
            "ResidentialStatus": userData.personal?.residentialStatus === 'resident' ? 'RES' : 'NRI',
            "ContactInfo": {
               "Address": {
                 "ResidenceNo": userData.personal?.address1 || "",
                 "RoadOrStreet": userData.personal?.street || "",
                 "CityOrTownOrDistrict": userData.personal?.city || "",
                 "StateCode": userData.personal?.state || "",
                 "PinCode": userData.personal?.pincode || ""
               },
               "MobileNo": userData.personal?.mobile || "",
               "EmailAddress": userData.personal?.email || ""
            },
            "OptingNewTaxRegime": userData.personal?.newRegime === 'yes' ? 'Y' : 'N'
         },
         "BankDetails": {
            "BankName": userData.personal?.bankName || "",
            "BankAccountNo": userData.personal?.accountNumber || "",
            "IFSCCode": userData.personal?.ifscCode || "",
            "UseForRefund": userData.personal?.isPrimaryAccount !== false ? 'Y' : 'N'
         },
         "IncomeDeductions": {
            "IncomeFromSalary": {
                 "EmployerName": userData.salary?.employerName || "",
                 "EmployerTAN": userData.salary?.employerTan || "",
                 "EmployerCategory": userData.salary?.employerType || "OTH",
                 "GrossSalary": (userData.salary?.basic || 0) + (userData.salary?.hra || 0) + (userData.salary?.lta || 0) + (userData.salary?.otherAllowances || 0),
                 "Perquisites": userData.salary?.perquisites || 0,
                 "ProfitsInLieuOfSalary": userData.salary?.profitInLieu || 0,
                 "DeductionUs16": {
                    "StandardDeduction16ia": (userData.personal?.newRegime === 'yes' && (userData.personal?.assessmentYear === '2025-26' || userData.personal?.assessmentYear === '2026-27')) ? 75000 : 50000,
                    "EntertainmentAllowance16ii": userData.salary?.entAllow || 0,
                    "ProfessionalTax16iii": userData.salary?.pt || 0
                 },
                 "NetSalary": Math.max(0, ((userData.salary?.basic || 0) + (userData.salary?.hra || 0) + (userData.salary?.lta || 0) + (userData.salary?.otherAllowances || 0)) - 50000)
            },
            "IncomeFromHouseProperty": (userData.houseProperty || []).map(hp => ({
                 "PropertyType": hp.type === 'self' ? 'S' : 'L',
                 "GrossRentReceived": hp.grossRent || 0,
                 "TaxPaidToLocalAuth": hp.municipalTaxes || 0,
                 "AnnualValue": (hp.grossRent || 0) - (hp.municipalTaxes || 0),
                 "StandardDeduction30a": Math.max(0, ((hp.grossRent || 0) - (hp.municipalTaxes || 0)) * 0.3),
                 "InterestPayable30b": hp.interest || 0,
                 "IncomeOfHP": Math.max(0, ((hp.grossRent || 0) - (hp.municipalTaxes || 0)) - (Math.max(0, ((hp.grossRent || 0) - (hp.municipalTaxes || 0)) * 0.3)) - (hp.interest || 0))
            })),
            "CapitalGains": {
                 "ShortTerm": {
                    "Sec111A": userData.capitalGains?.stcg_20 || 0,
                    "OtherSTCG": userData.capitalGains?.stcg_normal || 0
                 },
                 "LongTerm": {
                    "Sec112A": userData.capitalGains?.ltcg_125_equity || 0,
                    "OtherLTCG": userData.capitalGains?.ltcg_125_other || 0,
                    "Sec112_20": userData.capitalGains?.ltcg_20 || 0
                 }
            },
            "VirtualDigitalAssets": {
                 "TotalVDAGain": userData.crypto?.totalTaxableGain || 0
            },
            "IncomeFromOtherSources": {
                 "InterestSavings": userData.otherSources?.savings || 0,
                 "InterestFD": userData.otherSources?.fds || 0,
                 "Dividend": userData.otherSources?.dividend || 0,
                 "CasualIncome": userData.otherSources?.lottery || 0
            },
            "GrossTotalIncome": taxComputation.grossTotalIncome
         },
         "DeductionsUnderChapterVIA": {
            "Sec80C": userData.deductions?.sec80c || 0,
            "Sec80D": (userData.deductions?.sec80d_self || 0) + (userData.deductions?.sec80d_parents || 0),
            "Sec80TTA": userData.deductions?.sec80tta || 0,
            "TotalChapVIADeductions": taxComputation.totalDeductions
         },
         "TaxComputation": {
            "TotalIncome": taxComputation.netTaxableIncome,
            "TaxPayableOnTotalIncome": taxComputation.taxOnIncome,
            "Rebate87A": taxComputation.rebate87A,
            "Surcharge": taxComputation.surcharge,
            "HealthAndEducationCess": taxComputation.cess,
            "GrossTaxLiability": taxComputation.totalTaxLiability
         },
         "TaxesPaid": {
            "TDS": userData.taxesPaid?.tds_salary || 0,
            "AdvanceTax": userData.taxesPaid?.advanceTax || 0,
            "SelfAssessmentTax": userData.taxesPaid?.selfAssessmentTax || 0
         }
      }
    }
  }

  // Ensure PAN is present before generating
  if (!userData.personal?.pan) {
    alert("PAN is mandatory for generating ITR JSON.")
    return
  }

  const jsonString = JSON.stringify(itrJson, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  saveAs(blob, `ITR_${userData.personal?.pan}_AY${userData.personal?.assessmentYear.replace('-', '')}.json`)
}
