const XLSX = require('xlsx');
const path = require('path');

const targetPath = 'f:\\Antigravity\\Income Tax Calculator\\TaxNova Capital Gains Template.xlsx';

const wb = XLSX.utils.book_new();

// Define headers for both sheets
const headersShares = [
  'Type of Equity Shares',
  'Description of shares sold',
  'Date of Purchase',
  'Purchase Value',
  'Date of Sale',
  'Sale Value',
  'Transfer Expenses',
  'Net capital gain',
  'Holding Period',
  'Type of Capital Gain',
  'Rate of Tax',
  'Tax Value'
];

const headersMF = [
  'Type of Mutual Fund (MF)',
  'Description of Mutual Fund sold',
  'Date of Purchase',
  'Purchase Value',
  'Date of Sale',
  'Sale Value',
  'Transfer Expenses',
  'Net capital gain',
  'Holding Period',
  'Type of Capital Gain',
  'Rate of Tax',
  'Tax Value'
];

// Helper to create sample rows (we use empty rows for users to fill, but with some instruction)
const sampleDataShares = [
  headersShares,
  ['Listed Equity', 'Example Item 1', '2023-05-05', 100000, '2025-01-10', 150000, 500, '', '', '', '', ''],
  ['Unlisted Shares', 'Example Item 2', '2025-05-14', 50000, '2026-01-13', 45000, 200, '', '', '', '', '']
];

const sampleDataMF = [
  headersMF,
  ['MF (Equity)', 'Equity Fund A', '2025-05-05', 15000, '2026-01-08', 24000, 1000, '', '', '', '', ''],
  ['MF (Debt)', 'Debt Fund B', '2025-05-14', 150000, '2026-01-07', 148000, 2000, '', '', '', '', '']
];

const wsShares = XLSX.utils.aoa_to_sheet(sampleDataShares);
const wsMF = XLSX.utils.aoa_to_sheet(sampleDataMF);

// Column Widths
const wscols = [
  {wch: 25}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 15}
];
wsShares['!cols'] = wscols;
wsMF['!cols'] = wscols;

// We add formulas for first few rows (Row 2 and 3)
// Excel row numbers in formulas are 1-indexed. row 2 is index 1.
// A:0, B:1, C:2, D:3, E:4, F:5, G:6, H:7, I:8, J:9, K:10, L:11
const addFormulas = (ws, isMF) => {
  for (let i = 2; i <= 20; i++) {
    // H (Net Gain): =F - D - G
    ws[`H${i}`] = { f: `F${i}-D${i}-G${i}` };
    
    // I (Holding Period): =DATEDIF(C, E, "d") & " days"
    ws[`I${i}`] = { f: `IF(AND(C${i}<>"", E${i}<>""), (E${i}-C${i}) & " days", "")` };
    
    // J (Type of CG):
    // For Shares: If Listed (A) and (E-C) > 365 => LTCG, else STCG
    // If Unlisted (A) and (E-C) > 730 (2 years) => LTCG, else STCG
    if (!isMF) {
        ws[`J${i}`] = { f: `IF(OR(C${i}="", E${i}=""), "", IF(LEFT(A${i}, 6)="Listed", IF((E${i}-C${i})>365, "LTCG", "STCG"), IF((E${i}-C${i})>730, "LTCG", "STCG")))` };
    } else {
        // For MF: If MF (Equity) and (E-C) > 365 => LTCG, else STCG
        // If MF (Debt) and C >= 1-Apr-2023 => "STCG (Always)", others skip for simplicity
        ws[`J${i}`] = { f: `IF(OR(C${i}="", E${i}=""), "", IF(A${i}="MF (Equity)", IF((E${i}-C${i})>365, "LTCG", "STCG"), IF(C${i}>DATE(2023,4,1), "STCG (Fixed)", "STCG")))` };
    }
    
    // K (Rate of Tax):
    // LTCG (Both) -> 12.5%
    // STCG (Equity/Listed) -> 20.0%
    // STCG (Others) -> "Normal Slab"
    ws[`K${i}`] = { f: `IF(J${i}="LTCG", "12.5%", IF(OR(A${i}="Listed Equity", A${i}="MF (Equity)"), "20%", "Normal Slab"))` };
    
    // L (Tax Value):
    ws[`L${i}`] = { f: `IF(AND(H${i}<>"", ISNUMBER(VALUE(LEFT(K${i},LEN(K${i})-1)))), H${i} * VALUE(LEFT(K${i},LEN(K${i})-1))/100, "Slab Rate Applies")` };
  }
};

addFormulas(wsShares, false);
addFormulas(wsMF, true);

XLSX.utils.book_append_sheet(wb, wsShares, 'Sale of Shares');
XLSX.utils.book_append_sheet(wb, wsMF, 'Sale of Mutual Funds');

XLSX.writeFile(wb, targetPath);
console.log('Template created successfully at:', targetPath);
