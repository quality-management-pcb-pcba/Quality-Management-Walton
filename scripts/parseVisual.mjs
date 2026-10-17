import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync('scripts/raw_p1_p4.txt', 'utf8');
const lines = raw.split('\n').filter(Boolean);

const monthMap = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  July: '07', June: '06', August: '08', September: '09'
};

function parseDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const mStr = parts[1];
    const m = monthMap[mStr] || '01';
    const year = parts[2];
    return `${year}-${m}-${day}`;
  }
  return dateStr;
}

const records = lines.map((line, idx) => {
  const tokens = line.trim().split(/\s+/);
  const failQty = parseInt(tokens[tokens.length - 1], 10);
  const totalCheck = parseInt(tokens[tokens.length - 2], 10);
  const month = tokens[0];
  const rawDate = tokens[1];
  const isoDate = parseDate(rawDate);
  const product = tokens[2];
  
  let lineIdx = -1;
  for (let i = 3; i < tokens.length - 2; i++) {
    if (tokens[i].startsWith('Line-')) {
      lineIdx = i;
      break;
    }
  }
  let model = '';
  let prodLine = '';
  let prodType = '';
  if (lineIdx !== -1) {
    model = tokens.slice(3, lineIdx).join(' ');
    prodLine = tokens[lineIdx];
    prodType = tokens.slice(lineIdx + 1, tokens.length - 2).join(' ');
  } else {
    model = tokens.slice(3, tokens.length - 2).join(' ');
  }
  
  const passQty = Math.max(0, totalCheck - failQty);
  const failRate = totalCheck > 0 ? parseFloat(((failQty / totalCheck) * 100).toFixed(2)) : 0;
  
  let layer = 'Single Side';
  if (
    product === 'TV' ||
    product === 'Fridge' ||
    model.toLowerCase().includes('double') ||
    model.toLowerCase().includes('pwr') ||
    model.toLowerCase().includes('power')
  ) {
    layer = 'Double Side';
  }

  return {
    id: `pcb-vis-${String(idx + 1).padStart(3, '0')}`,
    sheet: 'visual',
    date: isoDate,
    Date: isoDate,
    Month: month,
    month: month,
    model: model,
    Model: model,
    Product: product,
    product: product,
    Layer: layer,
    layer: layer,
    checkQty: totalCheck,
    faultQty: failQty,
    faultRate: failRate,
    'Total Check': String(totalCheck),
    'Pass QTY': String(passQty),
    'Fail QTY': String(failQty),
    'Fail percentage': `${failRate}%`,
    prodLine,
    prodType,
    rawDate,
    createdAt: new Date(`${isoDate}T08:00:00Z`).toISOString(),
  };
});

const fileContent = `import type { PcbQualityRecord } from '../services/pcbRecords';

export const PCB_VISUAL_RECORDS: PcbQualityRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/pcbVisualRecords.ts', fileContent, 'utf8');
console.log(`Successfully generated src/data/pcbVisualRecords.ts with ${records.length} records.`);
