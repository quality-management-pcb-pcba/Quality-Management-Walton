import fs from 'fs';
import path from 'path';

function parseDate(rawDate, rawMonth) {
  // e.g. "17.05.2026" or "04.06.26" or "2-Jul-2026" or "23-Aug-2026" or "1-Sep-2026"
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

const p1 = fs.readFileSync('scripts/raw_smt03_p1.txt', 'utf-8').trim().split('\n');
const p2 = fs.readFileSync('scripts/raw_smt03_p2.txt', 'utf-8').trim().split('\n');
const allLines = [...p1, ...p2].map(l => l.trim()).filter(Boolean);

console.log('Total raw lines:', allLines.length);

const records = [];

allLines.forEach((line, index) => {
  const parts = line.split(/\s+/);
  const rawMonth = parts[0];
  const rawDate = parts[1];
  const shift = parts[2];
  const product = parts[3];

  // Operator is at the end e.g. "Sabbir Hossain(64395)", "Md. Ariful Islam(63725)", "Abu Saeed Ali (63929)", etc.
  const opMatch = line.match(/(Sabbir Hossain\s*\(64395\)|Md\.\s*Ariful Islam\s*\(63725\)|Ariful Islam\s*\(63725\)|Md\.\s*Nazmul Haque\s*\(64411\)|Abdullah Al Mamun\s*\(53129\)|Riazul Zannat\s*\(40558\)|Md\.\s*Hamidul Islam\s*\(63923\)|Md\.Belal Hossain\s*\(23978\)|Md\.\s*Mazidul Islam\s*\(64218\)|Nazmul Islam\s*\(64227\)|Md\.\s*Maynul Islam\s*\(64842\)|Abu Saeed Ali\s*\(63929\)|Abu Sayeed Ali\s*\(63929\))/i);
  
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

  // Middle text between product and qty
  const middleText = preOpTokens.slice(4, preOpTokens.length - 1).join(' ');

  const knownFaults = [
    'Shifting', 'Missing', 'Broken', 'Dry Solder', 'Swell Up', 'Lift Up',
    'Scratch', 'Upside Down', 'Wrong position', 'Solder Bridge', 'Excess Solder'
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
    id: `smt03-rec-${index + 1}`,
    line: 'SMT Line-03',
    date,
    shift: shift === 'Evning' ? 'Evening' : shift,
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

export const SMT_LINE_03_DEFECT_RECORDS: AOIDefectRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/smtLine03Records.ts', outContent, 'utf-8');
console.log('Written to src/data/smtLine03Records.ts');
