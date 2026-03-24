import * as fs from 'fs';
import { parsePdfDocument } from './src/services/pdfParser';

const pdfPath = process.argv[2] || '/Users/marcelo/Downloads/laudo_108530289_laboratorial (1).pdf';

if (!fs.existsSync(pdfPath)) {
  console.error('File not found:', pdfPath);
  process.exit(1);
}

const base64 = fs.readFileSync(pdfPath).toString('base64');
console.log(`PDF size: ${fs.statSync(pdfPath).size} bytes`);

parsePdfDocument(base64)
  .then(r => {
    console.log('SUCCESS');
    console.log('Lab date:', r.lab_date);
    console.log('Lab name:', r.lab_name);
    console.log('Biomarkers found:', r.biomarkers.length);
    console.log('First 3:', JSON.stringify(r.biomarkers.slice(0, 3), null, 2));
  })
  .catch(e => console.error('FAILED:', e.message));
