import { computeTax } from '../src/computation/taxEngine.js';

const individual_resident = {
    personal: { category: 'Individual', residentialStatus: 'resident', newRegime: 'yes', assessmentYear: '2025-26', ageCategory: 'below60' },
    salary: { basic: 700000 },
    houseProperty: [],
    business: {},
    capitalGains: {},
    otherSources: {},
    deductions: {}
};

const huf_resident = {
    personal: { category: 'HUF', residentialStatus: 'resident', newRegime: 'yes', assessmentYear: '2025-26', ageCategory: 'below60' },
    salary: { basic: 700000 },
    houseProperty: [],
    business: {},
    capitalGains: {},
    otherSources: {},
    deductions: {}
};

const individual_nri = {
    personal: { category: 'Individual', residentialStatus: 'nri', newRegime: 'yes', assessmentYear: '2025-26', ageCategory: 'below60' },
    salary: { basic: 700000 },
    houseProperty: [],
    business: {},
    capitalGains: {},
    otherSources: {},
    deductions: {}
};

console.log("--- TEST RESULTS ---");
const res1 = computeTax(individual_resident);
console.log(`Individual (Resident) @ 7L: Rebate = ${res1.rebate}, Total Tax = ${res1.totalTaxLiability}`);

const res2 = computeTax(huf_resident);
console.log(`HUF (Resident) @ 7L: Rebate = ${res2.rebate}, Total Tax = ${res2.totalTaxLiability}`);

const res3 = computeTax(individual_nri);
console.log(`Individual (NRI) @ 7L: Rebate = ${res3.rebate}, Total Tax = ${res3.totalTaxLiability}`);
