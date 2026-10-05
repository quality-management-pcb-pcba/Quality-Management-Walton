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

const files = [
  'mi01_p1_8.txt',
  'mi01_p9_16.txt',
  'mi01_p17_24.txt',
  'mi01_p21_24.txt',
  'mi01_p25_28.txt',
  'mi01_p29_32.txt'
];

const knownOperators = [
  'Abdullah al mamun',
  'Abdullah Al Mamun(53129)',
  'Md. Rony Khan(14873)',
  'Md. Masud Rana(15065)',
  'MD.Rabiul islam(14600)',
  'Chandana rani das(1354)',
  'Mukta Akter(21578)',
  'Rashida khatun(17671)',
  'Akter Jahan Shelly(17577)',
  'Nazmul Islam(64227)',
  'Sabbir Hossain(64395)',
  'C-14555 Mazharul',
  'C-14324 Habibur',
  'Rubel Hossen(37078)',
  'C-14340 Salman Rahman',
  'Majedul Islam(64218)',
  'C-14709 Salman Rahman',
  'Abdul Wahab(64410)',
  'Md. Biojeth Hossain(C-14611)',
  'C-14395'
];

let baseFaults = [
  'Wi-Fi/Bluetooth failure(TV)', 'HDMI signal abnormal(TV)', 'Lan line not connect(TV)',
  'Usb not connect(TV)', 'Display no output(TV)', 'No audio output(TV)',
  'Colour fault(TV)', 'No backlight(TV)', 'R.F fail(TV)', 'Switch keypad not work',
  'Functional jig test(AC)', 'FCT fail(AC)', 'Aging fail(TV)', 'Speaker Low sound',
  'Button not work', 'Wrong Component', 'Pad Lift Off', 'Cutting Problem',
  'Wrong Position', 'Polarity Change', 'Switch problem', 'Speaker not work',
  'LED Not Work', 'LED no light', 'Solder Short', 'Solder Ball', 'Dry Solder',
  'Wrong music', 'Wrong LED', 'Over Lead', 'Hole Block', 'Light Not Work',
  'Sound Noise', 'Key Not Work', 'Pattern Cut', 'Track Cut', 'High Light',
  'Low Light', 'No Display', 'AV Jack', 'Leg Open', 'Leg Down', 'No Power',
  'No Sound', 'PCBA Bend', 'Colour', 'Short', 'Bridge', 'Damage',
  'Broken', 'Scratch', 'Burned', 'Missing', 'Lift Up', 'Leg Up', 'Shifting',
  'Panel', 'LVDS', 'HDMI', 'Dust', 'Open', 'LAN', 'USB', 'RF', 'IR'
];
baseFaults.sort((a, b) => b.length - a.length);

const knownProducts = ['Rice cooker', 'Rice Cooker', 'Adapter', 'Fridge', 'Fan', 'LED', 'Toy', 'TV', 'Ac', 'AC'];

const records = [];
let idCounter = 1;

for (const f of files) {
  const filePath = path.join('scripts', f);
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  lines.forEach((l, idx) => {
    let matchedOp = null;
    let opStrLen = 0;
    for (const op of knownOperators) {
      if (l.toLowerCase().endsWith(op.toLowerCase())) {
        matchedOp = op;
        opStrLen = op.length;
        break;
      }
    }

    if (matchedOp === 'Abdullah al mamun') {
      matchedOp = 'Abdullah Al Mamun(53129)';
    }

    const preOp = l.substring(0, l.length - opStrLen).trim();
    const tokens = preOp.split(/\s+/);
    const rawMonth = tokens[0];
    const rawDate = tokens[1];
    let shift = tokens[2];
    if (shift.toLowerCase() === 'evning') shift = 'Evening';
    
    const afterShift = tokens.slice(3).join(' ');
    let matchedProd = null;
    let prodLenInTokens = 1;
    for (const p of knownProducts) {
      if (afterShift.toLowerCase().startsWith(p.toLowerCase() + ' ')) {
        matchedProd = p.toLowerCase() === 'ac' ? 'AC' : (p.toLowerCase() === 'rice cooker' ? 'Rice Cooker' : p);
        prodLenInTokens = p.split(/\s+/).length;
        break;
      }
    }

    const qtyStr = tokens[tokens.length - 1];
    const qty = parseInt(qtyStr, 10);

    const middleTokens = tokens.slice(3 + prodLenInTokens, -1);
    const middle = middleTokens.join(' ');

    let matchedFault = null;
    let model = middle;
    for (const flt of baseFaults) {
      if (middle.toLowerCase().endsWith(flt.toLowerCase())) {
        matchedFault = flt;
        model = middle.substring(0, middle.length - flt.length).trim();
        break;
      }
    }

    const date = parseDate(rawDate);

    records.push({
      id: `mi01-rec-${idCounter++}`,
      line: 'MI Line-01',
      date,
      shift,
      product: matchedProd,
      model,
      fault: matchedFault,
      qty,
      operator: matchedOp,
      remarks: '',
      createdAt: new Date(`${date}T12:00:00Z`).getTime() + idCounter * 1000
    });
  });
}

console.log(`Generated ${records.length} records for MI Line-01.`);

const fileContent = `import type { AOIDefectRecord } from '../components/AOILineDefectEntry';

export const MI_LINE_01_DEFECT_RECORDS: AOIDefectRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/miLine01Records.ts', fileContent, 'utf-8');
console.log('Saved to src/data/miLine01Records.ts');
