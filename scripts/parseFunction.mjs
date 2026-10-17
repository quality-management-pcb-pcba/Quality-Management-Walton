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

const FRIENDLY_NAMES = {
  Headset: 'Headset Audio / Jack',
  LED: 'LED Indicator',
  Speaker: 'Loudspeaker Audio',
  Charge: 'Charging / USB-C Port',
  SimCard: 'SIM Card Detection',
  RFCalibration: 'RF Calibration',
  Dead: 'Dead / No Power',
  TCard: 'T-Card (SD Card)',
  Receiver: 'Receiver / Earpiece',
  Keypad: 'Keypad / Buttons',
  FM: 'FM Radio Signal',
  GPS: 'GPS Navigation',
  LCM: 'LCM Display Panel',
  MainCamera: 'Main Rear Camera',
  SWVersion: 'Software Version Check',
  SubCamera: 'Sub / Front Camera',
  Touch: 'Touch Panel / Digitizer',
  Mic: 'Microphone Audio',
  Sensor: 'Proximity / Light Sensor',
  Bluetooth: 'Bluetooth Signal',
  LCDBacklight: 'LCD Backlight',
  SWDownload: 'Software Download / Flashing',
  WiFi: 'Wi-Fi Network Connection',
  Vibrator: 'Vibration Motor',
  BarcodeFail: 'Barcode Reading Fail',
};

let rawLines = [];
for (let i = 1; i <= 9; i++) {
  const file = `scripts/raw_function_p${i}.txt`;
  if (fs.existsSync(file)) {
    const f = fs.readFileSync(file, 'utf-8').trim().split('\n');
    rawLines.push(...f);
  }
}
rawLines = rawLines.map(l => l.trim()).filter(Boolean);

console.log(`Found ${rawLines.length} raw lines across function pages.`);

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
  const friendlyDesc = FRIENDLY_NAMES[rawDefect] || rawDefect;

  records.push({
    id: `function-rec-${i + 1}`,
    date,
    line: 'Mobile Line (Function)',
    product: 'Mobile',
    model,
    spec,
    stage,
    shift,
    type: 'Function',
    defect: rawDefect,
    desc: friendlyDesc,
    qty,
    status: 'Closed',
    source: 'Functional Inspection Sheet',
    createdAt: new Date(`${date}T12:00:00Z`).getTime() + i * 1000
  });
}

console.log(`Successfully parsed ${records.length} function records.`);

const tsContent = `export interface FunctionDefectRecord {
  id: string;
  date: string;
  line: string;
  product: string;
  model: string;
  spec: string;
  stage: string;
  shift: string;
  type: 'Function';
  defect: string;
  desc: string;
  qty: number;
  status: 'Open' | 'Closed' | 'In Progress';
  source?: string;
  createdAt?: number;
}

export const FUNCTION_DEFECT_RECORDS: FunctionDefectRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync('src/data/functionDefectRecords.ts', tsContent, 'utf-8');
console.log('Written src/data/functionDefectRecords.ts');
