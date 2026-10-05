import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Settings,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Box,
  Cpu,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  X,
  Layers,
  ChevronDown,
  ArrowRight,
  Database,
  CloudCheck,
} from 'lucide-react';
import { saveMultiplePcbaReports } from '../services/pcbaReportService';
import { SMT_LINE_01_DEFECT_RECORDS } from '../data/smtLine01Records';
import { SMT_LINE_02_DEFECT_RECORDS } from '../data/smtLine02Records';
import { SMT_LINE_03_DEFECT_RECORDS } from '../data/smtLine03Records';
import { SMT_LINE_04_DEFECT_RECORDS } from '../data/smtLine04Records';
import { SMT_LINE_05_DEFECT_RECORDS } from '../data/smtLine05Records';
import { MI_LINE_01_DEFECT_RECORDS } from '../data/miLine01Records';
import { MI_LINE_CHARGER_DEFECT_RECORDS } from '../data/miLineChargerRecords';

export interface AOIDefectRecord {
  id: string;
  line: string;
  date: string;
  shift: string;
  product: string;
  model: string;
  fault: string;
  qty: number;
  operator: string;
  remarks: string;
  createdAt: number;
}

export interface AOILineDefectEntryProps {
  lineName?: string;
  onNavigateToDatabase?: () => void;
}

// Initial master data from real AOI_LINE-01, SMT Line-02, Line-03, Line-04, Line-05, MI Line-01 & MI Line-Charger history
const DEFAULT_FORM_DATA = {
  shifts: ['Day', 'Night', 'Morning', 'Evening', 'General'],
  products: ['AC', 'Adapter', 'Charger', 'Fan', 'Fridge', 'LED', 'Local', 'Remote', 'Rice Cooker', 'Toy', 'TV'],
  operators: [
    'Abdul Wahab(64410)',
    'Abdullah Al Mamun(53129)',
    'Abu Saeed Ali (63929)',
    'Abu Sayeed Ali(63929)',
    'Akter Jahan Shelly(17577)',
    'Anik Sutradhar(50280)',
    'Ariful Islam(63725)',
    'Biojeth(C-14611)',
    'C-14324 Habibur',
    'C-14340 Salman Rahman',
    'C-14395',
    'C-14555 Mazharul',
    'C-14709 Salman Rahman',
    'Chandana rani das(1354)',
    'Majedul Islam(64218)',
    'Masum Miah (64193)',
    'Masum Miah(64193)',
    'Mazidul Islam(64218)',
    'Md. Ariful Islam(63725)',
    'Md.Belal Hossain(23978)',
    'Md. Biojeth Hossain(C-14611)',
    'Md. Gibon Mia(64848)',
    'Md. Hamidul Islam(63923)',
    'Md. Mamun Rana(64006)',
    'Md. Masud Rana(15065)',
    'Md. Maynul Islam(64842)',
    'Md. Mazidul Islam(64218)',
    'Md. Nazmul Haque(64411)',
    'MD.Rabiul islam(14600)',
    'Md. Rony Khan(14873)',
    'Md. Rubel Hossen(37078)',
    'Md. Shajahan(47276)',
    'Mukta Akter(21578)',
    'Nazmul islam(64227)',
    'Nazmul Islam(64227)',
    'Rashida khatun(17671)',
    'Riazul Zannat(40558)',
    'Rubel Hosen (37078)',
    'Rubel Hossen(37078)',
    'Sabbir Hossain(64395)',
    'Sazzad (39911)',
    'Shajahan(47276)',
    'Shariful Islam(C-15206)',
    'Shuvo Kumar Das (50282)',
  ],
  faults: [
    'Aging fail(TV)',
    'AV Jack',
    'Broken',
    'Burn Out-Aging',
    'Burned',
    'Button not work',
    'Colour',
    'Colour fault(TV)',
    'Component Short',
    'Component Shorts',
    'Cutting Problem',
    'Display no output(TV)',
    'Dry Solder',
    'Dust',
    'Excess Solder',
    'FCT fail(AC)',
    'Functional jig test(AC)',
    'Gap Problem',
    'Glue',
    'HDMI',
    'HDMI signal abnormal(TV)',
    'Hi-Pot-ATE',
    'Hole Block',
    'Hole Blocked',
    'Housing Scratch & Spot',
    'LAN',
    'Lan line not connect(TV)',
    'Layer cut',
    'LED High Light',
    'LED Low Light',
    'LED no light',
    'LED Not Work',
    'Leg Down',
    'Leg Open',
    'Leg Up',
    'Lift Up',
    'Load Current (CC)-ATE',
    'Load Voltage (CV)-Aging',
    'Load Voltage (CV)-ATE',
    'Load Voltage (CV)-DC Load',
    'LVDS',
    'Missing',
    'No audio output(TV)',
    'No backlight(TV)',
    'No Floating Voltage-Aging',
    'No Floating Voltage-ATE',
    'No Floating Voltage-DC Load',
    'No Power',
    'No Sound',
    'Over Lead',
    'Pad Lift Off',
    'PCB Joining together',
    'PCBA Bend',
    'Plug Pin Up',
    'Polarity Change',
    'R.F fail(TV)',
    'RF',
    'Scratch',
    'Shifting',
    'Solder Bridge',
    'Solder Short',
    'Sound Fault',
    'Speaker Low sound',
    'Speaker not work',
    'Swell Up',
    'Switch keypad not work',
    'Switch problem',
    'Upside Down',
    'Usb not connect(TV)',
    'Wi-Fi/Bluetooth failure(TV)',
    'Wrong Component',
    'Wrong LED',
    'Wrong music',
    'Wrong Part',
    'Wrong Polarity',
    'Wrong Position',
    'Wrong position',
  ],
  productModels: {
    AC: [
      'Ac display common',
      'AC 12K IDU',
      'AC 18K IDU',
      'AC 24K ODU',
      'Ac 12K IDU',
      'Ac 24K ODU',
      'F50WA-HS-L_ODU18k',
      'IDU-Common-12K/18K/24K',
      'Walton AC 12K INV IDU PCBA Model: MIVR35WA-W',
      'Walton AC 18K INV IDU PCBA Model: MIVR50WA-W',
      'Walton AC Display PCBA Model: MD50WA-E',
      'Walton AC ODU 12K/18K INV',
    ],
    Adapter: [
      'WFVADP12V2ASET200K_(CT-X017)',
      'WFVADP12V2ASET200K_(CT-X018)',
      'WFVADP12V2ASET200K_(CT-X017) PCBA',
    ],
    Charger: [
      'PCBA-OC05008RC',
      'PCBA-OC05008RC(500mA)',
      'WMC20000GI-BK(Charger 2A)',
    ],
    Toy: [
      'Akij Toy Controller V1.0',
      'Common Toy Controller V1.0(Akij)',
      'Common Toy Controller V1.0(Talukder)',
      'Common Toy LED Driver_V1.0(Akij)',
      'Common Toy LED Driver_V1.0(Akij) PCBA',
      'Common Toy LED Driver_V1.0(Talukder)',
      'Golden Wheel GW1',
      'Redmin Toy Controller',
    ],
    Fan: [
      '16" SMPS Local Fan',
      '16"Control Local FAN',
      '16 Inch Rechargeable Stand (Display Fan) -USB',
      '16 Inch Rechargeable Stand (Display Fan) Display Board',
      '16 Inch Rechargeable Stand Fan Display (SMPS)',
      '16 Inch Rechargeable Stand Fan Display -USB',
      '16 Inch Rechargeable Stand Fan Display Control (Bottom)',
      '16 Inch Rechargeable Stand Fan Display Control (TOP)',
      '16 inch Local Control Fan',
      '16 inch Local Fan Smps',
      '3 Inch Low Cost Rechargeable Fan - bottom',
      '3 Inch Low Cost Rechargeable Fan - Top',
      '3 Inch Low Cost Rechargeable Hand Fan(Bottom)',
      '3 Inch Low Cost Rechargeable Hand Fan(Top)',
      '52 Inch BLDC Celling Fan',
      '52 inch BLDC Celling Fan',
      '56 Inch BLDC Celling Fan',
      '56 inch BLDC Celling Fan',
      '56 Inch Rechargeable-Fan Life -PO4',
      '6 Inch Rechargeable Fan Bottom',
      '6 Inch Rechargeable Fan Top',
      '6 inch Rechargeable Fan - Bottom',
      '6 inch Rechargeable Fan-Top',
      '6 inch Rechargeable Fan - Top',
      'MI Constant Fan Dimmer',
      'PCBA-Surface-18w-Square-LED-Warm-DOB Bright',
    ],
    Fridge: [
      '06 Watt Round LED Tospoo',
      '16 Inch Rechargeable Stand Fan Display Control (Top)',
      'Beverage Cololer LED PCB-L290-V03',
      'Beverage Cooler LED PCB-L290-V03',
      'Beverage Cooler LED PCB-L290-V04',
      'Beverage cooler LED PCB- L290-V03',
      'Beverage cooler LED PCB- L337-V01',
      'Beverage cooler LED PCB- L337-V05',
      'CFL-SR110-V07',
      'Electronic Control V217',
      'Electronic Control-V217',
      'Electronic Thermostat V02',
      'Electronics Control-V217',
      'FID-Power-Board-V1.0',
      'Frost Controller Seven Segment Display V2.0',
      'Frost Inside Display-V1.0',
      'MI-R-LED-RS-V04',
      'MI-R-LED-RS-V04 EXPORT',
      'MI-R-LED-RSI-V04_Export',
      'MI-SC-Dis-PCBA-V001',
      'MI-SC-PWR-Board V3.1',
      'Poweer Supply-V3',
      'R-LED-RS-V04',
      'RL-RS35-V05',
      'RL-SS80-V05',
      'Smart container-7 segment display',
      'Smart Controler Display',
      'Smart Controller 1.4',
      'SMT 255L Freezer Display',
      'SMT-255L-Freezer Display',
      'SMT-255L-Freezer-Display',
      'SMT-Electronic Control - V217',
      'SMT-Electronics Thermostat - V2',
      'SMT-R-LED-PCCL-386-V0',
      'SMT-R-LED-RS-V04',
      'SMT-RFDHL-619L - V02',
      'SMT-RFPL-619L - V02',
      'SMT-RL-RS35-V05-Bottom',
      'SMT-RL-RS35-V05-Top',
      'SMT-RL-SS80-V05-Bottom',
      'SMT-RL-SS80-V05-Top',
      'SMT-RPDHL-619L-V02',
      'SMT-SBS-656L-ionizer-3in1(IFC)',
      'SMT-SBS-656L-ionizer-3in1(WDL)',
      'SMT-SBS-RFPL-619L-V02',
      'SMT-SBS-RPDHL-656L-V00',
      'SMT-SBS-RPIL-619L-V02',
      'SMT-SBS-RPPL-619L-V02',
      'SMT-SBS-SL-12V-DC',
      'SMT-SC-DIS-PCBA-V1.4',
      'SMT-SC-PWR-PCBA-V3.1',
      'SMT-SF-RGB-PIC-1572-V01-Bottom',
      'SMT-Splendor Light - V1.0',
      'SMT-TFT-LCD-Controller Display',
      'SMT-WFR_IPP (IPS)_12V_V01',
      'SMT-WR-343-CTW-V02',
      'SMT-WRL-US-V03',
      'SMT-WRL-USI-V02',
      'WRF IBL V00',
    ],
    LED: [
      '10W DC Bulb LED',
      '10W Tospo Motion LED',
      '12W DC Bulb LED',
      '12W LED Driver',
      '12W LED Driver PCBA',
      '12W LED Driver(EMB)_New',
      '12W LED Driver(EMB)_New PCBA',
      'LED Driver-12W',
      'LED Driver-12W AC/DC',
      'LED Driver-20W',
      'LED Driver-40W',
      'LED Driver-50W',
      'Loaded Driver Circuit On Board LED Tube Light 240mA-20W (SFG)',
      'YBL 9W LED',
      'YBL-12W-LED',
      'SpotLight-5W-Day',
      'SpotLight-5W-Warm',
      '12W-AC/DC-YJ-LED',
      'Ac/Dc 12W LED (Cozum)',
      '12W-LED-Driver',
      '10W-LED-Driver',
      '10W-AC/DC-Cozum',
      'PCBA Origin A55 3W LED',
      'PCBA Origin A55 5W LED',
      'PCBA Origin A55 7W LED',
      'PCBA Origin A65 12W LED',
      'PCBA Origin A70 12W LED',
      'PCBA Origin A80 18W LED',
      '0.5 FEET DOUBLE PAD 10W',
      '06 Watt Round LED Tospo-Day',
      '06 Watt Round LED Tospoo-Warm',
      '20W Tube light Driver',
      '6W Round LED(Red)',
      'Driver Surface Light 120mA-(6-9)W',
      'K-NZ-12W-K03(LED Driver 12W ZY)',
      'LED Driver 12W',
      'LED Driver 9W',
      'LED PCBA PSA A60 7W',
      'PCBA-Surface-24w Square Day DOB Bright',
      'PCBA-Surface-24w Square Warm DOB Bright',
      'Redmin Toy Controller',
      'YJ12W-3BBC-24DIC-70H9-V02(AC-DC-YJ12W)',
      'ZS24-CKD-9W-15P-45.8-V10',
      '1 FEET DTDL 9W',
      '1FEET DTDL 9W',
      '10 FEET DOUBLE',
      '12W LED_Panel',
      '12W Round',
      '12W Round(Day)',
      '12W Round(Warm)',
      '12W Round_Day',
      '12W Round_Warm',
      '12W-Square-LED-Day',
      '12W-Square-LED-Warm',
      '12Watt Square LED Tospoo -Warm',
      '18W Round_Day',
      '18W Round_Warm',
      '18W-AC-DC-LED',
      '18Watt Square LED-DOB',
      '6 Watt Square LED Tospoo - Day',
      '6 Watt Square LED Tospoo - Warm',
      '6W Round LED(Day)',
      '6W Round LED(Green)',
      '6W-Round-Topso-Day',
      '6W-Round-Topso-Warm',
      '6Watt Round LED Tospoo -Day',
      'AC-DC-12W',
      'Capsol LED 12W_Day',
      'DC-Bulb-5W',
      'DC-Bulb-5W(Day)',
      'DPLP0279-V1(18W Round)',
      'EBT-100-18W LED',
      'FE-IN-DR-14S1P(Spotdown 5W LED Green)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Blue)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Day)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Green)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Red)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Warm)',
      'PCBA-Surface-18w Square Day DOB Bright',
      'PCBA-Surface-18w-Square-LED-Warm-DOB Bright',
      'PCBA-Surface-24w Square Day DOB Bright',
      'PSA A95 20w',
      'Robust-Spotdown-7W',
      'RSL-291*6mm 2835G3V 1B18*2- 6W',
      'RSL291*6MM 2835G3V 1B18X2-6W',
      'SMT-R-LED-RS-V04',
      'Solar DC Bulb 5W 12-36V PCBA',
      'Splender Light-V1.0',
      'Spot Down 5W LED(Blue)',
      'Spot Down 5W LED(Day)',
      'Spot Down 5W LED(Green)',
      'Spot Down 5W LED(Red)',
      'Spot Down 5W LED(Warm)',
      'Spot Down 7W LED(Blue)',
      'Spot Down 7W LED(Day)',
      'Spot Down 7W LED(Red)',
      'Spot Down 7W LED(Warm)',
      'WLCL-EBF12-A-V1.1',
      'YBL-12W LED_Day',
      'YBL-18W LED',
      'YBL-18W LED(Day)',
      'YBL-30W LED',
      'YBL-5W LED',
      'YBL-5W LED(Day)',
      'YBL-5W LED-Day',
      'YBL-7W LED(Day)',
      'YBL15 W-LED-DAY',
      'ZS23-T1109-D54.65DC9-26V-V04',
      'ZS23-T1109-D54.65DC9-36V-5W-V04(5W DC Light)',
      'ZS24-CKD-15W-10C2B-51.4MM-V2.1',
      'ZS24-CKD-3,7,5,W-9P45.8-V1.0(YBL 5W Day)',
      'ZS24-CKD-9W-15P-45.8-V1.0',
      'ZS24-CKD-9W-15P-45.8-V1.1',
      'ZS24-T1212-D5815-18W-HV-V3(YBL 18W)',
      'ZS25-T0729-D514-DC9-36V-10W-V03(10W DC Light)',
    ],
    Local: ['Fan 16 inch Local Control Fan'],
    Remote: ['Remote Uniwalmar 09'],
    'Rice Cooker': ['Walton Rice Cooker LED PCBA Model: RCL01'],
    TV: ['WD-24R CS TV', 'WD24RCS'],
  } as Record<string, string[]>,
};

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Initial seed defect entries for lines
function getSeedDefectRecords(line: string): AOIDefectRecord[] {
  // SMT Line-01 has all 578 real defect records from Walton PCBA QA inspection sheets
  if (line === 'SMT Line-01') {
    return SMT_LINE_01_DEFECT_RECORDS;
  }
  // SMT Line-02 has all 248 real defect records from Walton PCBA QA inspection sheets
  if (line === 'SMT Line-02') {
    return SMT_LINE_02_DEFECT_RECORDS;
  }
  // SMT Line-03 has all 138 real defect records from Walton PCBA QA inspection sheets
  if (line === 'SMT Line-03') {
    return SMT_LINE_03_DEFECT_RECORDS;
  }
  // SMT Line-04 has all 424 real defect records from Walton PCBA QA inspection sheets
  if (line === 'SMT Line-04') {
    return SMT_LINE_04_DEFECT_RECORDS;
  }
  // SMT Line-05 has all 237 real defect records from Walton PCBA QA inspection sheets
  if (line === 'SMT Line-05') {
    return SMT_LINE_05_DEFECT_RECORDS;
  }
  // MI Line-01 has all 2,610 real defect records from Walton PCBA QA inspection sheets
  if (line === 'MI Line-01') {
    return MI_LINE_01_DEFECT_RECORDS;
  }
  // MI Line - Charger has all 128 real defect records from Walton PCBA QA inspection sheets
  if (line === 'MI Line - Charger' || line === 'MI Line-Charger') {
    return MI_LINE_CHARGER_DEFECT_RECORDS;
  }
  return [];
}

// Strictly retrieve records that belong ONLY to targetLine, preventing cross-line contamination
function getLineRecordsFromStorage(targetLine: string): AOIDefectRecord[] {
  if (targetLine === 'SMT Line-01') {
    try {
      const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove old minimal 6 demo seed entries if present
          const lineSpecific = parsed.filter(
            (r) => r && r.line === targetLine && !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingSmtRecords = SMT_LINE_01_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 578 inspection records, merge all
          if (missingSmtRecords.length > 0 || lineSpecific.length < SMT_LINE_01_DEFECT_RECORDS.length) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('smt01-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...SMT_LINE_01_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    return SMT_LINE_01_DEFECT_RECORDS;
  }

  if (targetLine === 'SMT Line-02') {
    try {
      const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lineSpecific = parsed.filter(
            (r) => r && r.line === targetLine && !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingSmtRecords = SMT_LINE_02_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 248 inspection records, merge all
          if (missingSmtRecords.length > 0 || lineSpecific.length < SMT_LINE_02_DEFECT_RECORDS.length) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('smt02-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...SMT_LINE_02_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    return SMT_LINE_02_DEFECT_RECORDS;
  }

  if (targetLine === 'SMT Line-03') {
    try {
      const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lineSpecific = parsed.filter(
            (r) => r && r.line === targetLine && !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingSmtRecords = SMT_LINE_03_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 138 inspection records, merge all
          if (missingSmtRecords.length > 0 || lineSpecific.length < SMT_LINE_03_DEFECT_RECORDS.length) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('smt03-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...SMT_LINE_03_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    try {
      localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(SMT_LINE_03_DEFECT_RECORDS));
    } catch (e) {}
    return SMT_LINE_03_DEFECT_RECORDS;
  }

  if (targetLine === 'SMT Line-04') {
    try {
      const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lineSpecific = parsed.filter(
            (r) => r && r.line === targetLine && !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingSmtRecords = SMT_LINE_04_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 424 inspection records, merge all
          if (missingSmtRecords.length > 0 || lineSpecific.length < SMT_LINE_04_DEFECT_RECORDS.length) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('smt04-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...SMT_LINE_04_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    return SMT_LINE_04_DEFECT_RECORDS;
  }

  if (targetLine === 'SMT Line-05') {
    try {
      const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lineSpecific = parsed.filter(
            (r) => r && r.line === targetLine && !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingSmtRecords = SMT_LINE_05_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 237 inspection records, merge all
          if (missingSmtRecords.length > 0 || lineSpecific.length < SMT_LINE_05_DEFECT_RECORDS.length) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('smt05-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...SMT_LINE_05_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    try {
      localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(SMT_LINE_05_DEFECT_RECORDS));
    } catch (e) {}
    return SMT_LINE_05_DEFECT_RECORDS;
  }

  if (targetLine === 'MI Line-01') {
    try {
      const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lineSpecific = parsed.filter(
            (r) => r && r.line === targetLine && !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingMiRecords = MI_LINE_01_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 2,610 inspection records, merge all
          if (missingMiRecords.length > 0 || lineSpecific.length < MI_LINE_01_DEFECT_RECORDS.length) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('mi01-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...MI_LINE_01_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    try {
      localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(MI_LINE_01_DEFECT_RECORDS));
    } catch (e) {}
    return MI_LINE_01_DEFECT_RECORDS;
  }

  if (targetLine === 'MI Line - Charger' || targetLine === 'MI Line-Charger') {
    try {
      const saved =
        localStorage.getItem(`aoi_defect_records_${targetLine}`) ||
        localStorage.getItem('aoi_defect_records_MI Line - Charger') ||
        localStorage.getItem('aoi_defect_records_MI Line-Charger');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lineSpecific = parsed.filter(
            (r) =>
              r &&
              (r.line === 'MI Line - Charger' || r.line === 'MI Line-Charger') &&
              !r.id?.startsWith('aoi-seed-')
          );
          const existingIds = new Set(lineSpecific.map((r) => r.id));
          const missingChargerRecords = MI_LINE_CHARGER_DEFECT_RECORDS.filter(
            (r) => !existingIds.has(r.id)
          );
          // If the cached list has fewer than the full 128 inspection records, merge all
          if (
            missingChargerRecords.length > 0 ||
            lineSpecific.length < MI_LINE_CHARGER_DEFECT_RECORDS.length
          ) {
            const userAdded = lineSpecific.filter(
              (r) => !r.id?.startsWith('micharger-rec-') && !r.id?.startsWith('aoi-seed-')
            );
            const combined = [...userAdded, ...MI_LINE_CHARGER_DEFECT_RECORDS];
            try {
              localStorage.setItem(`aoi_defect_records_${targetLine}`, JSON.stringify(combined));
            } catch (e) {
              // ignore quota
            }
            return combined;
          }
          return lineSpecific;
        }
      }
    } catch (e) {
      // ignore
    }
    try {
      localStorage.setItem(
        `aoi_defect_records_${targetLine}`,
        JSON.stringify(MI_LINE_CHARGER_DEFECT_RECORDS)
      );
    } catch (e) {}
    return MI_LINE_CHARGER_DEFECT_RECORDS;
  }

  try {
    const saved = localStorage.getItem(`aoi_defect_records_${targetLine}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const lineSpecific = parsed.filter((r) => r && r.line === targetLine);
        return lineSpecific.filter((r) => !r.id?.startsWith('aoi-seed-'));
      }
    }
  } catch (e) {
    // ignore
  }
  return getSeedDefectRecords(targetLine);
}

export const AOILineDefectEntry: React.FC<AOILineDefectEntryProps> = ({
  lineName = 'SMT Line-01',
  onNavigateToDatabase,
}) => {
  // Master lists persisted in localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('aoi_defect_master_lists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          shifts: Array.from(new Set([...DEFAULT_FORM_DATA.shifts, ...(parsed.shifts || [])])),
          products: Array.from(new Set([...DEFAULT_FORM_DATA.products, ...(parsed.products || [])])),
          operators: Array.from(new Set([...DEFAULT_FORM_DATA.operators, ...(parsed.operators || [])])),
          faults: Array.from(new Set([...DEFAULT_FORM_DATA.faults, ...(parsed.faults || [])])),
          productModels: {
            ...DEFAULT_FORM_DATA.productModels,
            ...(parsed.productModels || {}),
            ...Object.fromEntries(
              Object.entries(DEFAULT_FORM_DATA.productModels).map(([k, v]) => [
                k,
                Array.from(new Set([...v, ...(parsed.productModels?.[k] || [])])),
              ])
            ),
          },
        };
      } catch (e) {
        return DEFAULT_FORM_DATA;
      }
    }
    return DEFAULT_FORM_DATA;
  });

  useEffect(() => {
    localStorage.setItem('aoi_defect_master_lists', JSON.stringify(formData));
  }, [formData]);

  // Defect records strictly persisted in localStorage per line
  const [records, setRecords] = useState<AOIDefectRecord[]>(() => {
    return getLineRecordsFromStorage(lineName);
  });

  // Keep records isolated and in sync with the selected line
  useEffect(() => {
    setRecords(getLineRecordsFromStorage(lineName));
    setFaultQuantities({});
    setRemarks('');
  }, [lineName]);

  // Persist records ONLY if they match current lineName
  useEffect(() => {
    if (records.every((r) => r.line === lineName)) {
      localStorage.setItem(`aoi_defect_records_${lineName}`, JSON.stringify(records));
    }
  }, [records, lineName]);

  // Form Fields
  const [date, setDate] = useState<string>(getTodayString());
  const [shift, setShift] = useState<string>('Day');
  const [product, setProduct] = useState<string>('Fridge');
  const [model, setModel] = useState<string>('SMT-255L-Freezer Display');
  const [operator, setOperator] = useState<string>(() => {
    return formData.operators[0] || 'Anik Sutradhar(50280)';
  });
  const [remarks, setRemarks] = useState<string>('');

  // Fault quantities mapping
  const [faultQuantities, setFaultQuantities] = useState<Record<string, number>>({});
  
  // Custom faults added in this session
  const [customFaults, setCustomFaults] = useState<string[]>([]);
  const [newFaultName, setNewFaultName] = useState<string>('');
  const [newFaultQty, setNewFaultQty] = useState<string>('');

  // Submission & Toast state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter state for report table
  const [reportFrom, setReportFrom] = useState<string>('');
  const [reportTo, setReportTo] = useState<string>('');
  const [appliedReportFrom, setAppliedReportFrom] = useState<string>('');
  const [appliedReportTo, setAppliedReportTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('');
  const [filterProduct, setFilterProduct] = useState<string>('');
  const [filterFault, setFilterFault] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);

  // Manage Lists Modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'products' | 'models' | 'operators'>('products');
  const [newProductInput, setNewProductInput] = useState('');
  const [newOperatorInput, setNewOperatorInput] = useState('');
  const [modelsProductSelect, setModelsProductSelect] = useState<string>('Fridge');
  const [newModelInput, setNewModelInput] = useState('');

  // Printable ref
  const printSectionRef = useRef<HTMLDivElement>(null);

  // Available models based on selected product
  const availableModels = useMemo(() => {
    if (!product) return [];
    return formData.productModels[product] || [];
  }, [product, formData.productModels]);

  // When product changes, adjust model
  const handleProductChange = (newProd: string) => {
    setProduct(newProd);
    const models = formData.productModels[newProd] || [];
    if (models.length > 0) {
      setModel(models[0]);
    } else {
      setModel('');
    }
  };

  // Sync selected operator when master operators list is updated
  useEffect(() => {
    if (formData.operators.length > 0) {
      if (!operator || !formData.operators.includes(operator)) {
        setOperator(formData.operators[0]);
      }
    } else {
      setOperator('');
    }
  }, [formData.operators, operator]);

  // Sync selected product/model if removed from master list
  useEffect(() => {
    if (formData.products.length > 0) {
      if (!product || !formData.products.includes(product)) {
        const nextProd = formData.products[0];
        setProduct(nextProd);
        const models = formData.productModels[nextProd] || [];
        setModel(models[0] || '');
      }
    } else {
      setProduct('');
      setModel('');
    }
  }, [formData.products, product, formData.productModels]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Update fault qty
  const handleFaultQtyChange = (fault: string, valStr: string) => {
    const cleanStr = valStr.replace(/[^0-9]/g, '');
    const num = cleanStr === '' ? 0 : parseInt(cleanStr, 10);
    setFaultQuantities((prev) => {
      const updated = { ...prev };
      if (num > 0) {
        updated[fault] = num;
      } else {
        delete updated[fault];
      }
      return updated;
    });
  };

  // Add custom fault
  const handleAddCustomFault = () => {
    const name = newFaultName.trim();
    const qty = parseInt(newFaultQty.trim(), 10);
    if (!name) {
      showToast('Enter a fault name first.', 'error');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showToast('Enter a valid quantity (at least 1).', 'error');
      return;
    }

    if (!customFaults.includes(name) && !formData.faults.includes(name)) {
      setCustomFaults((prev) => [...prev, name]);
    }
    setFaultQuantities((prev) => ({ ...prev, [name]: qty }));
    setNewFaultName('');
    setNewFaultQty('');
    showToast(`Added fault "${name}" with qty ${qty}`, 'success');
  };

  // Calculate selected faults summary
  const selectedFaultCount = Object.keys(faultQuantities).length;
  const totalDefectQty = (Object.values(faultQuantities) as number[]).reduce(
    (acc: number, q: number) => acc + Number(q || 0),
    0
  );

  // Save Defect Data
  const handleSaveDefectData = async () => {
    if (isSubmitting) return;

    if (!date) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (!shift) {
      showToast('Please select a shift.', 'error');
      return;
    }
    if (!product) {
      showToast('Please select a product.', 'error');
      return;
    }
    if (!model) {
      showToast('Please select or enter a model.', 'error');
      return;
    }
    if (selectedFaultCount === 0) {
      showToast('Enter at least one fault quantity before saving.', 'error');
      return;
    }
    if (!operator.trim()) {
      showToast('Enter the Checking Operator.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const pcbaPayload = (Object.entries(faultQuantities) as [string, number][]).map(([fault, qty]) => ({
        date,
        shift,
        product,
        model,
        line: lineName,
        type: 'Aesthetic' as const,
        desc: fault,
        qty,
        status: 'Open' as const,
        operator: operator.trim(),
        remarks: remarks.trim() || '—',
        source: 'AOI Line Defect Entry',
      }));

      // Store defect records in Firestore collection "pcba_reports"
      const savedIds = await saveMultiplePcbaReports(pcbaPayload);

      const newEntries: AOIDefectRecord[] = pcbaPayload.map((doc, index) => ({
        id: (savedIds && savedIds[index]) || `aoi-${Date.now()}-${index}`,
        line: lineName,
        date: doc.date,
        shift: doc.shift || shift,
        product: doc.product || product,
        model: doc.model,
        fault: doc.desc,
        qty: doc.qty,
        operator: doc.operator || operator.trim(),
        remarks: doc.remarks || remarks.trim() || '—',
        createdAt: Date.now() + index,
      }));

      setRecords((prev) => {
        const lineFiltered = prev.filter((r) => r.line === lineName);
        const updated = [...newEntries, ...lineFiltered];
        try {
          localStorage.setItem(`aoi_defect_records_${lineName}`, JSON.stringify(updated));
        } catch (e) {
          // ignore storage quota error
        }
        return updated;
      });

      // Reset faults and remarks, keeping common info intact for fast data entry
      setFaultQuantities({});
      setRemarks('');
      showToast('PCBA Report Saved Successfully', 'success');
    } catch (err: any) {
      console.error('Failed to save to Firestore pcba_reports:', err);
      showToast('Failed to save PCBA report: ' + (err?.message || 'Database error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Applied filters state
  const [appliedFilterShift, setAppliedFilterShift] = useState<string>('');
  const [appliedFilterProduct, setAppliedFilterProduct] = useState<string>('');
  const [appliedFilterFault, setAppliedFilterFault] = useState<string>('');

  // Filtered rows for Details Report
  const filteredRows = useMemo(() => {
    return records.filter((r) => {
      if (appliedReportFrom && r.date < appliedReportFrom) return false;
      if (appliedReportTo && r.date > appliedReportTo) return false;
      if (appliedFilterShift && r.shift !== appliedFilterShift) return false;
      if (appliedFilterProduct && r.product !== appliedFilterProduct) return false;
      if (appliedFilterFault && r.fault !== appliedFilterFault) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.date?.toLowerCase().includes(q) ||
          r.product?.toLowerCase().includes(q) ||
          r.model?.toLowerCase().includes(q) ||
          r.fault?.toLowerCase().includes(q) ||
          r.operator?.toLowerCase().includes(q) ||
          r.shift?.toLowerCase().includes(q) ||
          r.remarks?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [
    records,
    appliedReportFrom,
    appliedReportTo,
    appliedFilterShift,
    appliedFilterProduct,
    appliedFilterFault,
    searchQuery,
  ]);

  // Total defect qty for filtered rows
  const totalFilteredDefectQty = useMemo(() => {
    return filteredRows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0);
  }, [filteredRows]);

  // Pagination calculations
  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.max(1, Math.ceil(filteredRows.length / pageSize));
  }, [filteredRows.length, pageSize]);

  // Clamp current page when total pages shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    if (pageSize === 0) return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Apply Filter
  const handleApplyFilter = () => {
    setAppliedReportFrom(reportFrom);
    setAppliedReportTo(reportTo);
    setAppliedFilterShift(filterShift);
    setAppliedFilterProduct(filterProduct);
    setAppliedFilterFault(filterFault);
    setCurrentPage(1);
  };

  // Clear Filter
  const handleClearFilter = () => {
    setReportFrom('');
    setReportTo('');
    setAppliedReportFrom('');
    setAppliedReportTo('');
    setSearchQuery('');
    setFilterShift('');
    setFilterProduct('');
    setFilterFault('');
    setAppliedFilterShift('');
    setAppliedFilterProduct('');
    setAppliedFilterFault('');
    setCurrentPage(1);
  };

  // Quick Date Presets
  const handleQuickPreset = (preset: 'all' | 'may' | 'jun' | 'jul' | 'aug' | 'sep') => {
    if (preset === 'all') {
      handleClearFilter();
      return;
    }
    const yearMonth = {
      may: { from: '2026-05-01', to: '2026-05-31' },
      jun: { from: '2026-06-01', to: '2026-06-30' },
      jul: { from: '2026-07-01', to: '2026-07-31' },
      aug: { from: '2026-08-01', to: '2026-08-31' },
      sep: { from: '2026-09-01', to: '2026-09-30' },
    }[preset];

    setReportFrom(yearMonth.from);
    setReportTo(yearMonth.to);
    setAppliedReportFrom(yearMonth.from);
    setAppliedReportTo(yearMonth.to);
    setCurrentPage(1);
  };

  // Sync all records to Firestore
  const handleSyncToFirestore = async () => {
    if (isSyncingToCloud) return;
    setIsSyncingToCloud(true);
    setSyncProgress({ current: 0, total: records.length });
    try {
      const CHUNK_SIZE = 40;
      let count = 0;
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const payload = chunk.map((r) => ({
          date: r.date,
          shift: r.shift,
          product: r.product,
          model: r.model,
          line: r.line,
          type: 'Aesthetic' as const,
          desc: r.fault,
          qty: r.qty,
          status: 'Open' as const,
          operator: r.operator,
          remarks: r.remarks,
          source: `Walton ${lineName} QA Sheet`,
        }));
        await saveMultiplePcbaReports(payload);
        count += chunk.length;
        setSyncProgress({ current: count, total: records.length });
      }
      showToast(`Successfully synced ${records.length} records to Firestore!`, 'success');
    } catch (err: any) {
      console.error('Error syncing SMT records to Firestore:', err);
      showToast('Sync error: ' + (err?.message || 'Database error'), 'error');
    } finally {
      setIsSyncingToCloud(false);
      setSyncProgress(null);
    }
  };

  // Reload / reset to original attached inspection sheet records
  const handleReloadAttachedSheet = () => {
    let freshRecords: AOIDefectRecord[] = [];
    if (lineName === 'SMT Line-02') {
      freshRecords = SMT_LINE_02_DEFECT_RECORDS;
    } else if (lineName === 'SMT Line-03') {
      freshRecords = SMT_LINE_03_DEFECT_RECORDS;
    } else if (lineName === 'SMT Line-04') {
      freshRecords = SMT_LINE_04_DEFECT_RECORDS;
    } else if (lineName === 'SMT Line-05') {
      freshRecords = SMT_LINE_05_DEFECT_RECORDS;
    } else if (lineName === 'MI Line-01') {
      freshRecords = MI_LINE_01_DEFECT_RECORDS;
    } else if (lineName === 'MI Line - Charger' || lineName === 'MI Line-Charger') {
      freshRecords = MI_LINE_CHARGER_DEFECT_RECORDS;
    } else {
      freshRecords = SMT_LINE_01_DEFECT_RECORDS;
    }

    setRecords(freshRecords);
    try {
      localStorage.setItem(`aoi_defect_records_${lineName}`, JSON.stringify(freshRecords));
    } catch (e) {
      // ignore
    }
    showToast(`Loaded all ${freshRecords.length} records from attached ${lineName} inspection sheet!`, 'success');
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to download for this date range.', 'error');
      return;
    }

    const headers = ['Date', 'Shift', 'Product', 'Model', 'Faults', 'Qty', 'Operator', 'Remarks'];
    const csvRows = [headers.join(',')];

    filteredRows.forEach((r) => {
      const vals = [
        r.date,
        r.shift,
        r.product,
        r.model,
        r.fault,
        r.qty,
        r.operator,
        r.remarks,
      ].map((val) => {
        const s = String(val ?? '');
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      });
      csvRows.push(vals.join(','));
    });

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lineName.toLowerCase().replace(/\s+/g, '_')}_defects_${getTodayString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV export downloaded', 'success');
  };

  // Print PDF
  const handlePrintPdf = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to print for this date range.', 'error');
      return;
    }
    window.print();
  };

  // Manage Lists Handlers
  const handleAddProduct = () => {
    const val = newProductInput.trim();
    if (!val) {
      showToast('Enter product name first.', 'error');
      return;
    }
    if (formData.products.includes(val)) {
      showToast('That product already exists.', 'error');
      return;
    }
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      products: [...prev.products, val].sort(),
      productModels: { ...prev.productModels, [val]: [] },
    }));
    setNewProductInput('');
    showToast(`Product "${val}" added`, 'success');
  };

  const handleDeleteProduct = (pName: string) => {
    if (!window.confirm(`Remove product "${pName}" and its models?`)) return;
    setFormData((prev: typeof DEFAULT_FORM_DATA) => {
      const copyProducts = prev.products.filter((p) => p !== pName);
      const copyModels = { ...prev.productModels };
      delete copyModels[pName];
      return {
        ...prev,
        products: copyProducts,
        productModels: copyModels,
      };
    });
    if (product === pName) {
      setProduct(formData.products[0] || '');
    }
    showToast(`Product "${pName}" removed`, 'success');
  };

  const handleAddModel = () => {
    const p = modelsProductSelect;
    const val = newModelInput.trim();
    if (!p) {
      showToast('Pick a product first.', 'error');
      return;
    }
    if (!val) {
      showToast('Enter model name first.', 'error');
      return;
    }
    const currentModels = formData.productModels[p] || [];
    if (currentModels.includes(val)) {
      showToast('That model already exists under this product.', 'error');
      return;
    }
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      productModels: {
        ...prev.productModels,
        [p]: [...currentModels, val].sort(),
      },
    }));
    setNewModelInput('');
    showToast(`Model "${val}" added under ${p}`, 'success');
  };

  const handleDeleteModel = (p: string, m: string) => {
    if (!window.confirm(`Remove model "${m}"?`)) return;
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      productModels: {
        ...prev.productModels,
        [p]: (prev.productModels[p] || []).filter((item) => item !== m),
      },
    }));
    showToast(`Model "${m}" removed`, 'success');
  };

  const handleAddOperator = () => {
    const val = newOperatorInput.trim();
    if (!val) {
      showToast('Enter operator name first.', 'error');
      return;
    }
    if (formData.operators.includes(val)) {
      showToast('That operator already exists.', 'error');
      return;
    }
    const updatedOps = [...formData.operators, val].sort();
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      operators: updatedOps,
    }));
    setOperator(val);
    setNewOperatorInput('');
    showToast(`Operator "${val}" added and selected`, 'success');
  };

  const handleDeleteOperator = (op: string) => {
    if (!window.confirm(`Remove operator "${op}"?`)) return;
    const remaining = formData.operators.filter((o: string) => o !== op);
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      operators: remaining,
    }));
    if (operator === op) {
      setOperator(remaining[0] || '');
    }
    showToast(`Operator "${op}" removed`, 'success');
  };

  // Combine standard faults + any added custom faults
  const allFaults = useMemo(() => {
    const set = new Set([...formData.faults, ...customFaults]);
    return Array.from(set);
  }, [formData.faults, customFaults]);

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-6 z-50 px-5 py-3.5 rounded-xl font-bold text-sm text-white shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
            toast.type === 'success' ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Header matching user demo */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-2xl shadow-md border border-[#234b73] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/15">
            🔍
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                {lineName} Defect Entry
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/25 text-[#86efac] border border-[#16a34a]/40">
                Live Production Entry
              </span>
              {lineName === 'SMT Line-02' && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/25 text-cyan-200 border border-cyan-400/40">
                  248 Records from AOI LINE-02.pdf
                </span>
              )}
              {lineName === 'SMT Line-03' && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/25 text-violet-200 border border-violet-400/40">
                  138 Records from AOI LINE-03.pdf
                </span>
              )}
              {lineName === 'SMT Line-05' && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-400/40">
                  237 Records from AOI LINE-05.pdf
                </span>
              )}
              {lineName === 'MI Line-01' && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/40">
                  2,610 Records from MI LINE-01.pdf
                </span>
              )}
              {(lineName === 'MI Line - Charger' || lineName === 'MI Line-Charger') && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/40">
                  128 Records from MI LINE-Charger.pdf
                </span>
              )}
            </div>
            <p id="aoi-header-subtitle" className="text-xs sm:text-sm text-[#b9c9dc] mt-0.5">
              {lineName.startsWith('MI') ? 'PCBA MI (Manual Insertion) Defect Entry' : 'PCBA AOI (Automatic Optical Inspection)'}
            </p>
          </div>
        </div>

        {/* Topbar Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowManageModal(true)}
            className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Manage Lists</span>
          </button>

          {onNavigateToDatabase && (
            <button
              type="button"
              onClick={onNavigateToDatabase}
              className="px-3.5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>All Database</span>
            </button>
          )}
        </div>
      </div>

      {/* CARD 1: Common Information */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-sm text-[#1e293b]">
          <span className="text-base">📋</span>
          <span>Common Information</span>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-date"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
              Date
            </label>
            <input
              id="aoi-input-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all"
            />
          </div>

          {/* Shift */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-shift"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
              Shift
            </label>
            <select
              id="aoi-input-shift"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all cursor-pointer"
            >
              <option value="">Select Shift…</option>
              {formData.shifts.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-product"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 text-[#2563eb]" />
              Product
            </label>
            <select
              id="aoi-input-product"
              value={product}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all cursor-pointer"
            >
              <option value="">Select Product…</option>
              {formData.products.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-model"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-[#2563eb]" />
              Model / Part No.
            </label>
            <select
              id="aoi-input-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!product}
              className={`w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] outline-none font-medium transition-all ${
                !product
                  ? 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
                  : 'bg-white text-[#1e293b] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 cursor-pointer'
              }`}
            >
              {!product ? (
                <option value="">Select Product first…</option>
              ) : availableModels.length === 0 ? (
                <option value="">No models yet — add via ⚙ Manage Lists</option>
              ) : (
                <>
                  <option value="">Select Model…</option>
                  {availableModels.map((m: string) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </section>

      {/* CARD 2: AOI Faults */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header with count pill */}
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1e293b]">
            <span className="text-base">🔍</span>
            <span>AOI Faults</span>
          </div>
          {selectedFaultCount > 0 && (
            <span className="text-xs font-bold text-[#2563eb] bg-[#eff6ff] px-3 py-1 rounded-full border border-[#bfdbfe]">
              {selectedFaultCount} fault{selectedFaultCount > 1 ? 's' : ''} selected ({totalDefectQty} pcs)
            </span>
          )}
        </div>

        {/* Checking Operator Bar */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="aoi-input-operator"
            className="text-xs font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5 shrink-0"
          >
            <User className="w-3.5 h-3.5 text-[#2563eb]" />
            Checking Operator
          </label>
          <div className="w-full sm:w-80 relative">
            <select
              id="aoi-input-operator"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all cursor-pointer shadow-xs"
            >
              {formData.operators.length === 0 ? (
                <option value="">No operators found — add via ⚙ Manage Lists</option>
              ) : (
                <>
                  <option value="">Select Checking Operator…</option>
                  {formData.operators.map((op: string) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Faults Grid */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allFaults.map((faultName) => {
              const qty = faultQuantities[faultName] || 0;
              const hasValue = qty > 0;
              const isCustom = customFaults.includes(faultName);

              return (
                <div
                  key={faultName}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border-[1.5px] transition-all duration-150 ${
                    hasValue
                      ? 'border-[#2563eb] bg-[#f5f8ff] shadow-xs'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-semibold truncate ${
                        hasValue ? 'text-[#1d4ed8] font-bold' : 'text-[#334155]'
                      }`}
                      title={faultName}
                    >
                      {faultName}
                      {isCustom && (
                        <span className="ml-1 text-[10px] text-[#94a3b8] font-normal">
                          (new)
                        </span>
                      )}
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={qty > 0 ? qty : ''}
                    placeholder="0"
                    onChange={(e) => handleFaultQtyChange(faultName, e.target.value)}
                    className={`w-16 py-1.5 px-2 text-center text-sm font-bold rounded-lg border outline-none transition-all ${
                      hasValue
                        ? 'border-[#2563eb] bg-white text-[#1d4ed8] shadow-xs'
                        : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] focus:border-[#2563eb] focus:bg-white'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Add Other Fault */}
          <div className="pt-4 border-t border-dashed border-[#e2e8f0] flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <input
              type="text"
              value={newFaultName}
              onChange={(e) => setNewFaultName(e.target.value)}
              placeholder="+ Add a fault not listed above"
              className="flex-1 min-w-[200px] text-sm px-3.5 py-2 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] outline-none font-medium text-[#1e293b]"
            />
            <input
              type="number"
              min="1"
              step="1"
              value={newFaultQty}
              onChange={(e) => setNewFaultQty(e.target.value)}
              placeholder="Qty"
              className="w-24 text-sm px-3.5 py-2 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] outline-none text-center font-bold text-[#1e293b]"
            />
            <button
              type="button"
              onClick={handleAddCustomFault}
              className="px-4 py-2 rounded-lg bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* CARD 3: Remarks (optional) */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-sm text-[#1e293b]">
          <span className="text-base">📝</span>
          <span>Remarks (optional)</span>
        </div>
        <div className="p-5">
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional inspection notes, rework actions, or component reference designators (e.g., R12, C45)..."
            className="w-full text-sm p-3 rounded-xl border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none font-medium text-[#1e293b] resize-y"
          />
        </div>
      </section>

      {/* DETAILS REPORT: Table matching user template */}
      {/* DETAILS REPORT: Table matching user template */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        {/* Report Header */}
        <div className="p-5 bg-[#0f2942] text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📄</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-base text-white m-0">
                    Details Report — {lineName}
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40">
                    {filteredRows.length} record{filteredRows.length === 1 ? '' : 's'}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                    {totalFilteredDefectQty} defect pcs
                  </span>
                  {lineName === 'SMT Line-02' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                      248 records from AOI LINE-02.pdf
                    </span>
                  )}
                  {lineName === 'SMT Line-03' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-200 border border-violet-400/40">
                      138 records from AOI LINE-03.pdf
                    </span>
                  )}
                  {lineName === 'SMT Line-05' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40">
                      237 records from AOI LINE-05.pdf
                    </span>
                  )}
                  {lineName === 'MI Line-01' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      2,610 records from MI LINE-01.pdf
                    </span>
                  )}
                  {(lineName === 'MI Line - Charger' || lineName === 'MI Line-Charger') && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      128 records from MI LINE-Charger.pdf
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#94a3b8] mt-0.5">
                  Complete QA Inspection Records from Walton PCBA {lineName}
                  {lineName === 'SMT Line-02' && ' · 248 Total Records from AOI LINE-02 Inspection Sheet (May – Sep 2026)'}
                  {lineName === 'SMT Line-03' && ' · 138 Total Records from AOI LINE-03 Inspection Sheet (May – Sep 2026)'}
                  {lineName === 'SMT Line-05' && ' · 237 Total Records from AOI LINE-05 Inspection Sheet (May – Sep 2026)'}
                  {lineName === 'MI Line-01' && ' · 2,610 Total Records from MI LINE-01 Inspection Sheet (Jun – Sep 2026)'}
                  {(lineName === 'MI Line - Charger' || lineName === 'MI Line-Charger') && ' · 128 Total Records from MI LINE-Charger Inspection Sheet (May – Sep 2026)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Reload / Reset to Original Attached Sheet */}
              <button
                type="button"
                onClick={handleReloadAttachedSheet}
                className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-bold rounded-md cursor-pointer transition-colors border border-cyan-400/30 flex items-center gap-1.5 shadow-xs"
                title={`Reset to all original ${lineName} inspection records from attached sheet`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Attached Sheet ({lineName === 'SMT Line-02' ? '248' : lineName === 'SMT Line-03' ? '138' : lineName === 'SMT Line-04' ? '424' : lineName === 'SMT Line-05' ? '237' : lineName === 'MI Line-01' ? '2,610' : (lineName === 'MI Line - Charger' || lineName === 'MI Line-Charger') ? '128' : '578'})</span>
              </button>

              {/* Cloud Sync to Firestore */}
              <button
                type="button"
                onClick={handleSyncToFirestore}
                disabled={isSyncingToCloud}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isSyncingToCloud
                    ? 'bg-blue-600/50 text-white/80 cursor-wait'
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                }`}
                title="Save all records to Firestore pcba_reports collection"
              >
                {isSyncingToCloud ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>
                      Syncing… {syncProgress ? `(${syncProgress.current}/${syncProgress.total})` : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>Sync to Cloud Database</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-md cursor-pointer transition-colors border border-white/20 flex items-center gap-1.5"
                title="Download filtered report as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-md cursor-pointer transition-colors border border-white/20 flex items-center gap-1.5"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Month Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[#94a3b8] font-medium mr-1">Quick Range:</span>
            {[
              { id: 'all', label: `All (${records.length})` },
              { id: 'may', label: 'May 2026' },
              { id: 'jun', label: 'Jun 2026' },
              { id: 'jul', label: 'Jul 2026' },
              { id: 'aug', label: 'Aug 2026' },
              { id: 'sep', label: 'Sep 2026' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickPreset(p.id as any)}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[#cbd5e1] hover:text-white transition-colors cursor-pointer text-[11px] font-semibold"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search, Filter & Date Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search model, fault, operator, remarks…"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white text-[#1e293b] font-medium outline-none border-none shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Product Filter */}
            <div>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-md bg-white text-[#1e293b] font-medium outline-none border-none shadow-xs cursor-pointer"
              >
                <option value="">All Products</option>
                {formData.products.map((p: string) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-md bg-white text-[#1e293b] font-medium outline-none border-none shadow-xs cursor-pointer"
              >
                <option value="">All Shifts</option>
                {formData.shifts.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Fault Filter */}
            <div>
              <select
                value={filterFault}
                onChange={(e) => setFilterFault(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-md bg-white text-[#1e293b] font-medium outline-none border-none shadow-xs cursor-pointer"
              >
                <option value="">All Faults</option>
                {formData.faults.map((f: string) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="flex-1 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-xs"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-md cursor-pointer transition-colors border border-white/20"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-5 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-[#cbd5e1] rounded text-[#1e293b] font-bold text-xs cursor-pointer outline-none"
            >
              <option value="15">15 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="0">All ({filteredRows.length})</option>
            </select>
            <span>
              Showing {pageSize === 0 ? 1 : Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)} to{' '}
              {pageSize === 0 ? filteredRows.length : Math.min(currentPage * pageSize, filteredRows.length)} of{' '}
              <strong className="text-[#1e293b]">{filteredRows.length}</strong> entries
            </span>
          </div>

          {pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentPage === 1
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                « First
              </button>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  currentPage === 1
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                ‹ Prev
              </button>
              <span className="px-2 py-1 font-bold text-[#1e293b]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  currentPage === totalPages
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                Next ›
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentPage === totalPages
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                Last »
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Table */}
        <div className="max-h-[460px] overflow-auto">
          {filteredRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#64748b]">
              No rows matching current filters — try clearing filters or resetting the search.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f1f5f9] sticky top-0 z-10 text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center text-[#94a3b8] w-12">#</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Shift</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Product</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Model</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Faults</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Qty</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Operator</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {paginatedRows.map((r, idx) => {
                  const globalIndex = pageSize === 0 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#94a3b8] text-center text-[11px]">
                        {globalIndex}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[#1e293b] whitespace-nowrap font-medium">
                        {r.date}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-[#334155]">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          r.shift === 'Night' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {r.shift}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-[#0f2942]">
                        {r.product}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-[#475569] font-medium">
                        {r.model}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#fee2e2] text-[#b91c1c] font-bold text-[11px]">
                          {r.fault}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-center text-[#2563eb]">
                        {r.qty}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-[#475569]">
                        {r.operator}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#64748b] max-w-[220px] truncate" title={r.remarks}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Pagination Bar */}
        {pageSize > 0 && totalPages > 1 && (
          <div className="px-5 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748b]">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)} to{' '}
              {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} records
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentPage === 1
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                « First
              </button>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  currentPage === 1
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                ‹ Prev
              </button>
              <span className="px-2 py-1 font-bold text-[#1e293b]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  currentPage === totalPages
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                Next ›
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentPage === totalPages
                    ? 'text-[#94a3b8] cursor-not-allowed bg-transparent'
                    : 'text-[#1e293b] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer'
                }`}
              >
                Last »
              </button>
            </div>
          </div>
        )}
      </section>

      {/* STICKY SAVE BAR matching user template */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-2xl py-3.5 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-medium text-[#64748b]">
            {selectedFaultCount === 0 ? (
              <span>No faults entered yet</span>
            ) : (
              <span className="text-[#1e293b]">
                <strong className="text-[#2563eb]">{selectedFaultCount}</strong> fault type
                {selectedFaultCount > 1 ? 's' : ''} ({totalDefectQty} pcs) will be saved as{' '}
                <strong className="text-[#2563eb]">{selectedFaultCount}</strong> row
                {selectedFaultCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveDefectData}
            disabled={selectedFaultCount === 0 || isSubmitting}
            className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-md transition-all ${
              selectedFaultCount === 0 || isSubmitting
                ? 'bg-[#cbd5e1] text-[#94a3b8] cursor-not-allowed shadow-none'
                : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white active:scale-95 cursor-pointer shadow-[#2563eb]/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span>SAVING…</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>SAVE DEFECT DATA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MANAGE LISTS MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Settings className="w-4 h-4 text-[#60a5fa]" />
                <span>Manage Master Lists</span>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#e2e8f0] bg-[#fafbfc]">
              <button
                type="button"
                onClick={() => setActiveModalTab('products')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'products'
                    ? 'border-[#2563eb] text-[#2563eb] bg-white'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Products ({formData.products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('models')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'models'
                    ? 'border-[#2563eb] text-[#2563eb] bg-white'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Models
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('operators')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'operators'
                    ? 'border-[#2563eb] text-[#2563eb] bg-white'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Operators ({formData.operators.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Products Tab */}
              {activeModalTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProductInput}
                      onChange={(e) => setNewProductInput(e.target.value)}
                      placeholder="New product category name (e.g. Microwave)"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {formData.products.map((pName: string) => (
                      <div
                        key={pName}
                        className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                      >
                        <span>{pName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(pName)}
                          className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Models Tab */}
              {activeModalTab === 'models' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase">
                      Select Product Category
                    </label>
                    <select
                      value={modelsProductSelect}
                      onChange={(e) => setModelsProductSelect(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none bg-white font-medium"
                    >
                      {formData.products.map((p: string) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newModelInput}
                      onChange={(e) => setNewModelInput(e.target.value)}
                      placeholder="New model name for this product"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddModel}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                    {(formData.productModels[modelsProductSelect] || []).length === 0 ? (
                      <div className="text-xs text-[#94a3b8] p-3 text-center">
                        No models added for {modelsProductSelect} yet.
                      </div>
                    ) : (
                      (formData.productModels[modelsProductSelect] || []).map((mName: string) => (
                        <div
                          key={mName}
                          className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                        >
                          <span className="truncate pr-2">{mName}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(modelsProductSelect, mName)}
                            className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold shrink-0 cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Operators Tab */}
              {activeModalTab === 'operators' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOperatorInput}
                      onChange={(e) => setNewOperatorInput(e.target.value)}
                      placeholder="New operator name (e.g. John Doe(12345))"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOperator}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {formData.operators.map((opName: string) => (
                      <div
                        key={opName}
                        className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                      >
                        <span>{opName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOperator(opName)}
                          className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-5 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Section for @media print */}
      <div id="printArea" ref={printSectionRef} className="hidden print:block p-6">
        <h2 className="text-xl font-bold mb-1">
          {lineName} Defect Entry — Details Report
        </h2>
        <div className="text-xs text-[#64748b] mb-4">
          Date range:{' '}
          {appliedReportFrom || '(all)'} to {appliedReportTo || '(all)'} •{' '}
          {filteredRows.length} row(s) • Generated {new Date().toLocaleString()}
        </div>
        <table className="w-full text-left text-xs border border-[#94a3b8]">
          <thead>
            <tr className="bg-[#f1f5f9]">
              <th className="border border-[#94a3b8] p-2">Date</th>
              <th className="border border-[#94a3b8] p-2">Shift</th>
              <th className="border border-[#94a3b8] p-2">Product</th>
              <th className="border border-[#94a3b8] p-2">Model</th>
              <th className="border border-[#94a3b8] p-2">Faults</th>
              <th className="border border-[#94a3b8] p-2 text-center">Qty</th>
              <th className="border border-[#94a3b8] p-2">Operator</th>
              <th className="border border-[#94a3b8] p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td className="border border-[#94a3b8] p-2">{r.date}</td>
                <td className="border border-[#94a3b8] p-2">{r.shift}</td>
                <td className="border border-[#94a3b8] p-2">{r.product}</td>
                <td className="border border-[#94a3b8] p-2">{r.model}</td>
                <td className="border border-[#94a3b8] p-2">{r.fault}</td>
                <td className="border border-[#94a3b8] p-2 text-center">{r.qty}</td>
                <td className="border border-[#94a3b8] p-2">{r.operator}</td>
                <td className="border border-[#94a3b8] p-2">{r.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
