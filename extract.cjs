const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve('TAX CALCULATOR FY 2025-26 upto 50LPA.xlsx');
try {
  const workbook = xlsx.readFile(filePath, { cellFormula: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });
  fs.writeFileSync('parsed_excel.json', JSON.stringify(data, null, 2));
} catch (e) {
  console.error(e.message);
}
