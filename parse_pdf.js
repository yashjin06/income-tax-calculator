import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

async function extract() {
  try {
    const data = new Uint8Array(fs.readFileSync('f:/Antigravity/Income Tax Calculator/ATQPA9249L-2024.pdf'));
    const doc = await pdfjsLib.getDocument({data, verbosity: 0}).promise;
    let fullText = '';
    for(let i=1; i<=doc.numPages; i++){
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    fs.writeFileSync('f:/Antigravity/Income Tax Calculator/extracted_26as.txt', fullText);
    console.log('Done extraction');
  } catch (e) {
    console.error(e)
  }
}
extract();
