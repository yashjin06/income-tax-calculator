const XLSX = require('xlsx');
const path = require('path');

const filePath = 'f:\\Antigravity\\Income Tax Calculator\\File for Capital Gain.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 0) {
            console.log('Headers:', data[0]);
            console.log('Sample Row 1:', data[1]);
            console.log('Sample Row 2:', data[2]);
        } else {
            console.log('Sheet is empty');
        }
    });
} catch (err) {
    console.error('Error reading Excel file:', err);
}
