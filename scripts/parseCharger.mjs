import fs from 'fs';
import path from 'path';

function parseDate(rawDate) {
  if (rawDate.includes('-')) {
    const parts = rawDate.split('-');
    const day = parts[0].padStart(2, '0');
    const monthStr = parts[1].toLowerCase().substring(0, 3);
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    return `${year}-${months[monthStr] || '06'}-${day}`;
  }
  return rawDate;
}

const p1 = fs.readFileSync('scripts/raw_charger_p1.txt', 'utf-8').trim().split('\n');
const p2 = fs.readFileSync('scripts/raw_charger_p2.txt', 'utf-8').trim().split('\n');
const allLines = [...p1, ...p2].map(l => l.trim()).filter(Boolean);

const operators = [
  'Rubel Hosen (37078)',
  'Biojeth(C-14611)'
];

const models = [
  'PCBA-OC05008RC(500mA)',
  'WMC20000GI-BK(Charger 2A)',
  'PCBA-OC05008RC'
];

const faults = [
  'No Floating Voltage-DC Load',
  'No Floating Voltage-Aging',
  'Load Voltage (CV)-DC Load',
  'Load Voltage (CV)-Aging',
  'No Floating Voltage-ATE',
  'Load Voltage (CV)-ATE',
  'Load Current (CC)-ATE',
  'Housing Scratch & Spot',
  'Burn Out-Aging',
  'Sound Fault',
  'Plug Pin Up',
  'Gap Problem',
  'Hi-Pot-ATE',
  'Glue'
];
faults.sort((a, b) => b.length - a.length);

const records = [];

allLines.forEach((l, idx) => {
  let matchedOp = operators.find(op => l.toLowerCase().endsWith(op.toLowerCase()));
  const preOp = l.substring(0, l.length - matchedOp.length).trim();
  const tokens = preOp.split(/\s+/);
  const rawDate = tokens[1];
  const shift = tokens[2];
  const product = tokens[3];

  const qty = parseInt(tokens[tokens.length - 1], 10);
  const middle = tokens.slice(4, -1).join(' ');

  let matchedModel = models.find(m => middle.startsWith(m));
  const faultText = middle.substring(matchedModel.length).trim();
  let matchedFault = faults.find(f => faultText.toLowerCase() === f.toLowerCase());

  const date = parseDate(rawDate);

  records.push({
    id: `micharger-rec-${idx + 1}`,
    line: 'MI Line - Charger',
    date,
    shift,
    product,
    model: matchedModel,
    fault: matchedFault,
    qty,
    operator: matchedOp,
    remarks: '',
    createdAt: new Date(`${date}T12:00:00Z`).getTime() + idx * 60000
  });
});

console.log(`Generated ${records.length} records for MI Line - Charger.`);

const fileContent = `import type { AOIDefectRecord } from '../components/AOILineDefectEntry';

export const MI_LINE_CHARGER_DEFECT_RECORDS: AOIDefectRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/miLineChargerRecords.ts', fileContent, 'utf-8');
console.log('Saved to src/data/miLineChargerRecords.ts');
