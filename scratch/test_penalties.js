import { computeTax } from '../src/computation/taxEngine.js';

const testCases = [
    {
        name: "Standard 234C & 234B (Missed Adv Tax)",
        data: {
            personal: { assessmentYear: '2025-26', newRegime: 'yes', category: 'Individual', residentialStatus: 'resident', ageCategory: 'below60' },
            salary: { basic: 2000000 }, // High income to ensure tax > 10k
            taxesPaid: {
                tds: 0,
                advanceTaxQ1: 0,
                advanceTaxQ2: 0,
                advanceTaxQ3: 0,
                advanceTaxQ4: 0,
                actualFilingDate: '2025-07-31' // On time
            }
        }
    },
    {
        name: "Presumptive 234C (Missed Q4)",
        data: {
            personal: { assessmentYear: '2025-26', newRegime: 'yes', category: 'Individual', residentialStatus: 'resident' },
            business: { 
                presumptive: { isOpting: 'yes', nature: '44AD', turnoverDigital: 10000000 } // income ~6L
            },
            salary: { basic: 500000 },
            taxesPaid: {
                tds: 0,
                advanceTaxQ1: 0,
                advanceTaxQ2: 0,
                advanceTaxQ3: 0,
                advanceTaxQ4: 0,
                actualFilingDate: '2025-07-31'
            }
        }
    },
    {
        name: "Late Filing 234A & 234F",
        data: {
            personal: { assessmentYear: '2025-26', newRegime: 'yes' },
            salary: { basic: 1000000 },
            taxesPaid: {
                tds: 0,
                advanceTaxQ1: 0,
                advanceTaxQ2: 0,
                advanceTaxQ3: 0,
                advanceTaxQ4: 0,
                actualFilingDate: '2025-10-15' // Late (31 July is due)
            }
        }
    }
];

testCases.forEach(tc => {
    console.log(`\n--- Testing: ${tc.name} ---`);
    const results = computeTax(tc.data);
    console.log(`Total Tax Liability: ₹${results.totalTaxLiability}`);
    console.log(`Interest 234A: ₹${results.interest234A}`);
    console.log(`Interest 234B: ₹${results.interest234B}`);
    console.log(`Interest 234C: ₹${results.interest234C}`);
    console.log(`Fee 234F:      ₹${results.fee234F}`);
    console.log(`Total Penal:   ₹${results.penalInterest}`);
});

console.log("\n--- Testing: Late Filing 234A & 234F ---");
const case3 = computeTax({
    personal: { assessmentYear: '2025-26', taxpayerCategory: 'Individual', residentStatus: 'Resident', newRegime: 'yes' },
    salary: { basic: 1200000 }, 
    taxesPaid: { tds: 0, advanceTaxQ1: 10000, advanceTaxQ2: 20000, advanceTaxQ3: 30000, advanceTaxQ4: 44200, actualFilingDate: "2025-10-31" } // 3 months late
});
console.log("Total Tax Liability:", case3.totalTaxLiability);
console.log("Interest 234A:", case3.interest234A);
console.log("Interest 234B:", case3.interest234B);
console.log("Interest 234C:", case3.interest234C);
console.log("Fee 234F:     ", case3.fee234F);
console.log("Total Penal:  ", case3.penalInterest);

console.log("\n--- Testing: User Provided Example (1,09,200 tax) ---");
// Salary calibrated to produce exactly 1,09,200 total tax liability
const userCase = computeTax({
    personal: { assessmentYear: '2025-26', residentStatus: 'Resident', newRegime: 'yes' },
    salary: { basic: 1350000 }, 
    taxesPaid: { tds: 0, advanceTaxQ1: 0, advanceTaxQ2: 0, advanceTaxQ3: 0, advanceTaxQ4: 0, 
                    actualFilingDate: "2025-07-31" }
});

console.log("Total Tax Liability:", userCase.totalTaxLiability);
console.log("Interest 234C:", userCase.interest234C);
if (userCase.interest234CBreakdown) {
    userCase.interest234CBreakdown.forEach(b => console.log(`  ${b.label}: ${b.interest} (${b.calculation})`));
}
