const xlsx = require('xlsx');
const path = require('path');

const filePath = path.resolve('TAX CALCULATOR FY 2025-26 upto 50LPA.xlsx');
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Dump the sheet with cell formulas if possible
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });
  console.log(JSON.stringify(data.slice(0, 50), null, 2));
} catch (e) {
  console.error(e.message);
}
