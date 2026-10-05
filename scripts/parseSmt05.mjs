import fs from 'fs';

function parseDate(rawDate, rawMonth) {
  if (rawDate.includes('.')) {
    const parts = rawDate.split('.');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  if (rawDate.includes('-')) {
    const parts = rawDate.split('-');
    const day = parts[0].padStart(2, '0');
    const monthStr = parts[1].toLowerCase();
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = months[monthStr.substring(0, 3)] || '07';
    return `${year}-${month}-${day}`;
  }
  return '2026-07-01';
}

const p1 = fs.readFileSync('scripts/raw_smt05_p1.txt', 'utf-8').trim().split('\n');
const p2 = fs.readFileSync('scripts/raw_smt05_p2.txt', 'utf-8').trim().split('\n');
const p3 = fs.readFileSync('scripts/raw_smt05_p3.txt', 'utf-8').trim().split('\n');
const allLines = [...p1, ...p2, ...p3].map(l => l.trim()).filter(Boolean);

console.log('Total raw lines:', allLines.length);

const records = [];

allLines.forEach((line, index) => {
  const parts = line.split(/\s+/);
  const rawMonth = parts[0];
  const rawDate = parts[1];
  let shift = parts[2];
  if (shift.toLowerCase() === 'evning') shift = 'Evening';
  const product = parts[3];

  const opMatch = line.match(/(Md\.\s*Gibon Mia\s*\(64848\)|Md\.\s*Mamun Rana\s*\(64006\)|Masum Miah\s*\(64193\)|Ariful Islam\s*\(63725\)|Shuvo Kumar Das\s*\(50282\)|Anik Sutradhar\s*\(50280\)|Sabbir Hossain\s*\(64395\))/i);
  
  if (!opMatch) {
    console.error(`Line ${index + 1} did not match operator: ${line}`);
    return;
  }

  const operator = opMatch[0].trim();
  const preOp = line.substring(0, line.indexOf(opMatch[0])).trim();
  const preOpTokens = preOp.split(/\s+/);
  
  // Qty is the token right before operator
  const qty = parseInt(preOpTokens[preOpTokens.length - 1], 10);
  if (isNaN(qty)) {
    console.error(`Line ${index + 1} invalid qty: ${line}`);
  }

  // Middle text between product (index 3) and qty (last index)
  const middleText = preOpTokens.slice(4, preOpTokens.length - 1).join(' ');

  const knownFaults = [
    'LED Not Work', 'LED Low Light', 'LED High Light', 'Upside Down',
    'Dry Solder', 'Swell Up', 'Lift Up', 'Shifting', 'Missing',
    'Broken', 'Scratch', 'Burned'
  ];

  let matchedFault = '';
  let modelText = middleText;

  for (const f of knownFaults) {
    if (middleText.endsWith(f)) {
      matchedFault = f;
      modelText = middleText.substring(0, middleText.length - f.length).trim();
      break;
    }
  }

  if (!matchedFault) {
    console.error(`Line ${index + 1} could not match fault: "${middleText}" in line: ${line}`);
  }

  const date = parseDate(rawDate, rawMonth);

  records.push({
    id: `smt05-rec-${index + 1}`,
    line: 'SMT Line-05',
    date,
    shift,
    product,
    model: modelText,
    fault: matchedFault,
    qty,
    operator,
    remarks: '',
    createdAt: new Date(`${date}T12:00:00Z`).getTime() + index * 60000,
  });
});

console.log('Successfully parsed records:', records.length);

const outContent = `import type { AOIDefectRecord } from '../components/AOILineDefectEntry';

export const SMT_LINE_05_DEFECT_RECORDS: AOIDefectRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/smtLine05Records.ts', outContent, 'utf-8');
console.log('Written to src/data/smtLine05Records.ts');
