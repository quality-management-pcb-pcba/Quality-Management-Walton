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

// Convert camelCase / PascalCase defect names to friendly spaced words
function formatDefectName(d) {
  return d
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^P C B A/, 'PCBA')
    .replace(/^G N D/, 'GND')
    .replace(/^L E D/, 'LED')
    .replace(/^T Card/, 'T-Card')
    .replace(/P C B A/g, 'PCBA')
    .replace(/G N D/g, 'GND')
    .replace(/L E D/g, 'LED')
    .replace(/T Card/g, 'T-Card');
}

let rawLines = [];
for (let i = 1; i <= 8; i++) {
  const file = `scripts/raw_aesthetic_p${i}.txt`;
  if (fs.existsSync(file)) {
    const f = fs.readFileSync(file, 'utf-8').trim().split('\n');
    rawLines.push(...f);
  }
}
rawLines = rawLines.map(l => l.trim()).filter(Boolean);

console.log(`Found ${rawLines.length} raw lines across aesthetic pages.`);

const records = [];

for (let i = 0; i < rawLines.length; i++) {
  const line = rawLines[i];
  const m = line.match(/^(\S+)\s+(.*?)\s+(Day|Night|Morning|Evening)\s+(\S+)\s+(\d+)$/);
  if (!m) {
    console.error(`Line ${i + 1} did not match regex: "${line}"`);
    process.exit(1);
  }

  const [_, rawDate, middle, shift, rawDefect, qtyStr] = m;
  const stageMatch = middle.match(/^(.*?)\s+(Mass Production|Rework|Trial Production)$/i);
  if (!stageMatch) {
    console.error(`Line ${i + 1} did not match stage: "${middle}"`);
    process.exit(1);
  }

  const modelWithSpec = stageMatch[1];
  const stage = stageMatch[2];
  const specMatch = modelWithSpec.match(/^(.*?)\s+(Null|\d+\/\d+\s*GB)$/i);
  if (!specMatch) {
    console.error(`Line ${i + 1} did not match spec: "${modelWithSpec}"`);
    process.exit(1);
  }

  const model = specMatch[1];
  const rawSpec = specMatch[2];
  const spec = rawSpec.toLowerCase() === 'null' ? '' : rawSpec;
  const qty = parseInt(qtyStr, 10);
  const date = parseDate(rawDate);
  const friendlyDesc = formatDefectName(rawDefect);

  records.push({
    id: `aesthetic-rec-${i + 1}`,
    date,
    line: 'Mobile Line (Aesthetic)',
    product: 'Mobile',
    model,
    spec,
    stage,
    shift,
    type: 'Aesthetic',
    defect: rawDefect,
    desc: friendlyDesc,
    qty,
    status: 'Closed',
    source: 'Aesthetic Inspection Sheet',
    createdAt: new Date(`${date}T12:00:00Z`).getTime() + i * 1000
  });
}

console.log(`Successfully parsed ${records.length} records.`);

const tsContent = `export interface AestheticDefectRecord {
  id: string;
  date: string;
  line: string;
  product: string;
  model: string;
  spec: string;
  stage: string;
  shift: string;
  type: 'Aesthetic';
  defect: string;
  desc: string;
  qty: number;
  status: 'Open' | 'Closed' | 'In Progress';
  source?: string;
  createdAt?: number;
}

export const AESTHETIC_DEFECT_RECORDS: AestheticDefectRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/aestheticDefectRecords.ts', tsContent, 'utf-8');
console.log('Written src/data/aestheticDefectRecords.ts');
