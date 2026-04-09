import { generateExcel } from './src/exports/excelExport.js';

const dummyData = {
  personal: { assessmentYear: '2025-26', newRegime: 'yes' },
  salary: { basic: 500000, da: 100000 },
  houseProperty: [{ type: 'self-occupied', interestOnLoan: 150000 }],
  business: { presumptive: { isOpting: 'no' }, pnl: { revenueOperations: 1000000, directExpenses: 500000 } },
  capitalGains: { stcg_20: 10000 },
  otherSources: { savingsInterest: 5000 },
  deductions: { sec80c: 150000 },
  crypto: { totalTaxableGain: 0 },
  broughtForwardLosses: {},
  taxesPaid: { tds: 5000 }
};

// Mock Blob and saveAs
global.Blob = class Blob { constructor(b) { this.b = b } };
global.window = {};

async function test() {
  try {
    await generateExcel(dummyData);
    console.log("SUCCESS");
  } catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
}
test();
