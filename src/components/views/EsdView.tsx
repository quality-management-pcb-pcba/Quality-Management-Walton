/**
 * =========================================================================================
 * @file src/components/views/EsdView.tsx
 * @component EsdView
 * @description ESD QC Report Entry & SMT ESD Monthly Log for Walton Digi-Tech
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Renders the full Walton Digitech SMT ESD Monthly QC Inspection and Audit Portal:
 * 1. ESD Work Surface / Table Matts (Standard R_TG: 10^6 <= R < 10^9 Ω)
 * 2. Continuous Wriststrap Monitor (Standard calibration across all manufacturing zones)
 * 3. Soldering Iron (Leakage voltage < 2V, Tip to ground resistance < 10 Ω)
 * 4. Ionized Air Blower (Voltage decay time Td < 5 seconds)
 * 5. ESD Wristband (Ring tester pass/fail screening across zones)
 * 6. ESD Shoe / Slipper (Footwear tester pass/fail screening across zones)
 * 7. ESD Apron (Surface resistance Rss < 10^11 Ω across fabric color samples)
 *
 * FEATURES:
 * - Real-time scientific exponent parsing ("4.3*10^9", "2.4e7", etc.)
 * - Automatic real-time Pass/Fail evaluation against factory QC standards
 * - Date-based localStorage persistence ("esd-log:<date>") and Firestore cloud sync
 * - Full CSV export matching Walton QC archival format
 * - Printable audit view and summary KPI metrics
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageId } from '../../types';
import {
  Zap,
  Calendar,
  Save,
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  RotateCcw,
  Check,
  AlertCircle,
  Lock,
  ChevronRight,
  Info,
  Clock,
  Layers,
  Activity,
  Database,
  ClipboardList,
  Search,
  BarChart3,
  Edit3,
  Filter,
} from 'lucide-react';
import { db, doc, getDoc, setDoc } from '../../services/firebase';
import {
  getEsdRecordByDate,
  saveEsdRecordByDate,
  listEsdRecords,
  deleteEsdRecordByDate,
} from '../../services/esdRecords';

interface EsdViewProps {
  onNavigate?: (page: PageId) => void;
  selectedSubsection?: 'database' | 'entry';
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

// ---------------------------------------------------------------------------------------
// Data Structures matching user's exact specification
// ---------------------------------------------------------------------------------------

export interface ApronRow {
  name: string;
  color: string;
  id: string;
  value: string;
}

export interface IronRow {
  n: number;
  zone: string;
  voltage: string;
  resistance: string;
  tg: string;
}

export interface WorksurfaceRow {
  loc: string;
  value: string;
}

export interface IonizerRow {
  n: number;
  testline: string;
  repairzone: string;
}

export interface ZoneCountItem {
  check: string;
  fail: string;
}

export type ZoneCountMap = Record<string, ZoneCountItem>;

export interface EpaFloorRow {
  pointId: string;
  loc: string;
  value: string;
}

export interface EsdChairRow {
  chairId: string;
  zone: string;
  value: string;
}

export interface TrolleyRow {
  trolleyId: string;
  zone: string;
  value: string;
}

export interface TrayBoxRow {
  itemType: string;
  sampleId: string;
  zone: string;
  value: string;
}

export interface EsdState {
  apron: ApronRow[];
  iron: IronRow[];
  worksurface: WorksurfaceRow[];
  ionizer: IonizerRow[];
  contmonitor: ZoneCountMap;
  wristband: ZoneCountMap;
  shoe: ZoneCountMap;
  epafloor: EpaFloorRow[];
  chair: EsdChairRow[];
  trolley: TrolleyRow[];
  traybox: TrayBoxRow[];
  remarks: {
    wristband: string;
    shoe: string;
    general?: string;
  };
}

export type TabKey =
  | 'worksurface'
  | 'contmonitor'
  | 'iron'
  | 'ionizer'
  | 'wristband'
  | 'shoe'
  | 'apron'
  | 'epafloor'
  | 'chair'
  | 'trolley'
  | 'traybox';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'worksurface', label: '1. ESD Work Surface', icon: '⚡' },
  { key: 'contmonitor', label: '2. Control Monitor', icon: '📡' },
  { key: 'iron', label: '3. Soldering Iron', icon: '🔥' },
  { key: 'ionizer', label: '4. Ionizer', icon: '💨' },
  { key: 'wristband', label: '5. ESD Wristband', icon: '⌚' },
  { key: 'shoe', label: '6. ESD Shoe', icon: '👟' },
  { key: 'apron', label: '7. ESD Apron', icon: '🥼' },
  { key: 'epafloor', label: '8. EPA Floor', icon: '🏢' },
  { key: 'chair', label: '9. ESD chair', icon: '🪑' },
  { key: 'trolley', label: '10. Transport trolley', icon: '🛒' },
  { key: 'traybox', label: '11. ESD tray and box', icon: '📦' },
];

const DEFAULT_LOCS = [
  'SMT Line 1',
  'SMT Line 2',
  'SMT Line 3',
  'Routing',
  'Testing Line 1',
  'Testing Line 2',
  'Packing Line',
  'Repair Zone',
];

const CONTINUOUS_MONITOR_ZONES = [
  'SMT Line 1',
  'SMT Line 2',
  'SMT Line 3',
  'Routing Zone',
  'Testing Line 1',
  'Testing Line 2',
  'Repair Zone',
  'Packing Line',
];

const PERSONNEL_ZONES = [
  'SMT lines',
  'Routing Zone',
  'Testing line',
  'Repair Zone',
  'Packing Line',
];

const APRON_COLORS = [
  'Sky Blue',
  'Navy Blue',
  'Pink',
  'White',
  'Blue',
  'Other',
];

// Helper Functions
function parseR(v: string | number | undefined | null): number | null {
  if (v === undefined || v === null) return null;
  const str = String(v).trim();
  if (str === '' || str.toUpperCase() === 'NA' || str === '-') return null;
  const m = str.match(/^([\d.]+)\s*[\*xX]?\s*10\^?(-?\d+)/);
  if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
  const mExp = str.match(/^([\d.]+)\s*[eE]\s*(-?\d+)/);
  if (mExp) return parseFloat(mExp[1]) * Math.pow(10, parseInt(mExp[2], 10));
  const n = parseFloat(str);
  return isNaN(n) ? null : n;
}

function fmtR(n: number | null): string {
  if (n === null || isNaN(n) || n <= 0) return '';
  const exp = Math.floor(Math.log10(n));
  const mant = (n / Math.pow(10, exp)).toFixed(1);
  return `${mant}×10^${exp} Ω`;
}

function todayStr(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function storageKey(date: string): string {
  return `esd-log:${date}`;
}

function mkZoneCount(zones: string[]): ZoneCountMap {
  const o: ZoneCountMap = {};
  zones.forEach((z) => {
    o[z] = { check: '', fail: '' };
  });
  return o;
}

function defaultState(): EsdState {
  return {
    apron: [
      { name: 'Sample 1', color: 'Sky Blue', id: 'NA', value: '4.2*10^9' },
      { name: 'Sample 2', color: 'Sky Blue', id: 'NA', value: '3.8*10^9' },
      { name: 'Sample 3', color: 'Sky Blue', id: 'NA', value: '5.1*10^9' },
    ],
    iron: [
      { n: 1, zone: 'Testing Line', voltage: '0.45', resistance: '2.4', tg: 'NA' },
      { n: 2, zone: 'Testing Line', voltage: '0.62', resistance: '3.1', tg: 'NA' },
      { n: 3, zone: 'Repair Zone', voltage: '0.38', resistance: '1.9', tg: 'NA' },
    ],
    worksurface: [
      { loc: 'SMT Line 1', value: '2.4*10^7' },
      { loc: 'SMT Line 2', value: '3.1*10^7' },
      { loc: 'SMT Line 3', value: '1.8*10^7' },
      { loc: 'Routing', value: '4.5*10^7' },
      { loc: 'Testing Line 1', value: '2.9*10^7' },
    ],
    ionizer: [
      { n: 1, testline: '2.1', repairzone: '2.4' },
      { n: 2, testline: '1.8', repairzone: '2.2' },
    ],
    contmonitor: {
      'SMT Line 1': { check: '12', fail: '0' },
      'SMT Line 2': { check: '12', fail: '0' },
      'SMT Line 3': { check: '12', fail: '0' },
      'Routing Zone': { check: '6', fail: '0' },
      'Testing Line 1': { check: '8', fail: '0' },
      'Testing Line 2': { check: '8', fail: '0' },
      'Repair Zone': { check: '4', fail: '0' },
      'Packing Line': { check: '6', fail: '0' },
    },
    wristband: {
      'SMT lines': { check: '36', fail: '0' },
      'Routing Zone': { check: '6', fail: '0' },
      'Testing line': { check: '16', fail: '0' },
      'Repair Zone': { check: '4', fail: '0' },
      'Packing Line': { check: '8', fail: '0' },
    },
    shoe: {
      'SMT lines': { check: '36', fail: '0' },
      'Routing Zone': { check: '6', fail: '0' },
      'Testing line': { check: '16', fail: '0' },
      'Repair Zone': { check: '4', fail: '0' },
      'Packing Line': { check: '8', fail: '0' },
    },
    epafloor: [
      { pointId: 'FP-01', loc: 'SMT Line 1', value: '3.5*10^6' },
      { pointId: 'FP-02', loc: 'SMT Line 2', value: '4.1*10^6' },
      { pointId: 'FP-03', loc: 'Testing Line 1', value: '2.8*10^6' },
    ],
    chair: [
      { chairId: 'CH-01', zone: 'SMT Line 1', value: '1.9*10^7' },
      { chairId: 'CH-02', zone: 'Testing Line 1', value: '2.5*10^7' },
      { chairId: 'CH-03', zone: 'Repair Zone', value: '3.2*10^7' },
    ],
    trolley: [
      { trolleyId: 'TR-01', zone: 'SMT Line 1', value: '4.6*10^6' },
      { trolleyId: 'TR-02', zone: 'Routing', value: '5.2*10^6' },
    ],
    traybox: [
      { itemType: 'ESD Tray', sampleId: 'TB-01', zone: 'SMT Line 1', value: '6.4*10^7' },
      { itemType: 'ESD Box', sampleId: 'TB-02', zone: 'Packing Line', value: '8.1*10^7' },
    ],
    remarks: {
      wristband: 'All wristband ground cords verified. Ring tester passed on green LED.',
      shoe: 'Heel straps and ESD conductive shoes passed calibration inspection.',
      general: 'Daily SMT shift audit completed in accordance with ANSI/ESD S20.20-2021 standards.',
    },
  };
}

function buildSeedDatabase(): Record<string, EsdState> {
  const base = defaultState();
  const today = todayStr();
  return {
    [today]: base,
    '2026-08-25': {
      ...base,
      worksurface: [
        { loc: 'SMT Line 1', value: '2.1*10^7' },
        { loc: 'SMT Line 2', value: '3.4*10^7' },
        { loc: 'SMT Line 3', value: '1.9*10^7' },
        { loc: 'Routing', value: '4.2*10^7' },
        { loc: 'Testing Line 1', value: '2.7*10^7' },
        { loc: 'Repair Zone', value: '3.6*10^7' },
      ],
      iron: [
        { n: 1, zone: 'Testing Line', voltage: '0.42', resistance: '2.2', tg: 'Pass' },
        { n: 2, zone: 'Testing Line', voltage: '0.58', resistance: '2.9', tg: 'Pass' },
        { n: 3, zone: 'Repair Zone', voltage: '0.35', resistance: '1.8', tg: 'Pass' },
      ],
      contmonitor: {
        'SMT Line 1': { check: '12', fail: '0' },
        'SMT Line 2': { check: '12', fail: '0' },
        'SMT Line 3': { check: '12', fail: '0' },
        'Routing Zone': { check: '6', fail: '0' },
        'Testing Line 1': { check: '8', fail: '0' },
        'Testing Line 2': { check: '8', fail: '0' },
        'Repair Zone': { check: '4', fail: '0' },
        'Packing Line': { check: '6', fail: '0' },
      },
      wristband: {
        'SMT lines': { check: '36', fail: '1' },
        'Routing Zone': { check: '6', fail: '0' },
        'Testing line': { check: '16', fail: '0' },
        'Repair Zone': { check: '4', fail: '0' },
        'Packing Line': { check: '8', fail: '0' },
      },
      shoe: {
        'SMT lines': { check: '36', fail: '0' },
        'Routing Zone': { check: '6', fail: '0' },
        'Testing line': { check: '16', fail: '0' },
        'Repair Zone': { check: '4', fail: '0' },
        'Packing Line': { check: '8', fail: '0' },
      },
      remarks: {
        wristband: '1 operator cord replaced on SMT Line 2 during morning shift check.',
        shoe: 'All footwear testers passed within specification.',
        general: 'Weekly SMT & Testing Line ESD audit verified.',
      },
    },
    '2026-08-18': {
      ...base,
      worksurface: [
        { loc: 'SMT Line 1', value: '2.8*10^7' },
        { loc: 'SMT Line 2', value: '3.0*10^7' },
        { loc: 'SMT Line 3', value: '2.2*10^7' },
        { loc: 'Routing', value: '5.1*10^7' },
        { loc: 'Testing Line 1', value: '3.3*10^7' },
      ],
      ionizer: [
        { n: 1, testline: '1.9', repairzone: '2.1' },
        { n: 2, testline: '2.0', repairzone: '2.3' },
      ],
      epafloor: [
        { pointId: 'FP-01', loc: 'SMT Line 1', value: '3.1*10^6' },
        { pointId: 'FP-02', loc: 'SMT Line 2', value: '3.9*10^6' },
        { pointId: 'FP-03', loc: 'Testing Line 1', value: '2.6*10^6' },
        { pointId: 'FP-04', loc: 'Packing Line', value: '4.4*10^6' },
      ],
      remarks: {
        wristband: '100% ring tester compliance across all zones.',
        shoe: 'All ESD shoes and heel grounders verified.',
        general: 'Mid-month EPA floor and ionizer decay audit completed.',
      },
    },
    '2026-08-10': {
      ...base,
      apron: [
        { name: 'Sample 1', color: 'Sky Blue', id: 'AP-01', value: '3.9*10^9' },
        { name: 'Sample 2', color: 'Navy Blue', id: 'AP-02', value: '4.4*10^9' },
        { name: 'Sample 3', color: 'White', id: 'AP-03', value: '5.0*10^9' },
        { name: 'Sample 4', color: 'Pink', id: 'AP-04', value: '4.1*10^9' },
      ],
      iron: [
        { n: 1, zone: 'Testing Line', voltage: '0.51', resistance: '2.6', tg: 'Pass' },
        { n: 2, zone: 'Testing Line', voltage: '0.49', resistance: '2.8', tg: 'Pass' },
        { n: 3, zone: 'Repair Zone', voltage: '2.30', resistance: '11.2', tg: 'Fail' },
      ],
      shoe: {
        'SMT lines': { check: '36', fail: '1' },
        'Routing Zone': { check: '6', fail: '0' },
        'Testing line': { check: '16', fail: '0' },
        'Repair Zone': { check: '4', fail: '0' },
        'Packing Line': { check: '8', fail: '0' },
      },
      remarks: {
        wristband: 'All wristband stations passed.',
        shoe: '1 ESD slipper replaced on SMT Line 1.',
        general: 'Soldering Iron #3 in Repair Zone recalibrated after tip-to-ground check.',
      },
    },
    '2026-08-02': {
      ...base,
      chair: [
        { chairId: 'CH-01', zone: 'SMT Line 1', value: '1.7*10^7' },
        { chairId: 'CH-02', zone: 'Testing Line 1', value: '2.2*10^7' },
        { chairId: 'CH-03', zone: 'Repair Zone', value: '2.9*10^7' },
        { chairId: 'CH-04', zone: 'Routing', value: '3.4*10^7' },
      ],
      trolley: [
        { trolleyId: 'TR-01', zone: 'SMT Line 1', value: '4.2*10^6' },
        { trolleyId: 'TR-02', zone: 'Routing', value: '4.9*10^6' },
        { trolleyId: 'TR-03', zone: 'Packing Line', value: '5.5*10^6' },
      ],
      traybox: [
        { itemType: 'ESD Tray', sampleId: 'TB-01', zone: 'SMT Line 1', value: '5.8*10^7' },
        { itemType: 'ESD Box', sampleId: 'TB-02', zone: 'Packing Line', value: '7.2*10^7' },
        { itemType: 'Magazine Rack', sampleId: 'MR-01', zone: 'SMT Line 2', value: '3.1*10^6' },
      ],
      remarks: {
        wristband: 'All operators grounded properly.',
        shoe: 'Footwear check 100% pass.',
        general: 'Monthly beginning full 11-section ESD qualification audit.',
      },
    },
  };
}

export interface EsdDatabaseFlatRow {
  id: string;
  date: string;
  sectionKey: TabKey;
  sectionLabel: string;
  location: string;
  itemIdentifier: string;
  measuredValue: string;
  standardSpec: string;
  checksCount: number;
  passCount: number;
  failCount: number;
  status: 'PASS' | 'FAIL';
  remarks: string;
}

function flattenEsdStateToRows(date: string, s: EsdState): EsdDatabaseFlatRow[] {
  const rows: EsdDatabaseFlatRow[] = [];
  const genRem = s.remarks?.general || '';

  // 1. Work surface
  (s.worksurface || []).forEach((r, idx) => {
    if (r.value.trim() !== '') {
      const v = parseR(r.value);
      const isPass = v !== null && v >= 1e6 && v < 1e9;
      rows.push({
        id: `${date}-ws-${idx}`,
        date,
        sectionKey: 'worksurface',
        sectionLabel: '1. ESD Work Surface',
        location: r.loc,
        itemIdentifier: `Mat #${idx + 1}`,
        measuredValue: `${r.value} Ω (${fmtR(v)})`,
        standardSpec: '10^6 ≤ R < 10^9 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 2. Continuous Monitor
  Object.keys(s.contmonitor || {}).forEach((zone, idx) => {
    const d = s.contmonitor[zone];
    if (d && d.check !== '') {
      const chk = parseInt(d.check, 10) || 0;
      const fail = parseInt(d.fail, 10) || 0;
      const pass = Math.max(chk - fail, 0);
      const isPass = fail === 0;
      rows.push({
        id: `${date}-cm-${idx}`,
        date,
        sectionKey: 'contmonitor',
        sectionLabel: '2. Control Monitor',
        location: zone,
        itemIdentifier: `${chk} Monitors`,
        measuredValue: `Check: ${chk} | Pass: ${pass} | Fail: ${fail}`,
        standardSpec: '0 Fail (Continuous Ground)',
        checksCount: chk,
        passCount: pass,
        failCount: fail,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 3. Soldering Iron
  (s.iron || []).forEach((r, idx) => {
    if (r.voltage !== '' && r.resistance !== '') {
      const v = parseFloat(r.voltage);
      const res = parseFloat(r.resistance);
      const isPass = v < 2 && res < 10;
      rows.push({
        id: `${date}-iron-${idx}`,
        date,
        sectionKey: 'iron',
        sectionLabel: '3. Soldering Iron',
        location: r.zone,
        itemIdentifier: `Iron #${r.n}`,
        measuredValue: `${r.voltage} V / ${r.resistance} Ω`,
        standardSpec: '< 2V & < 10 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 4. Ionizer
  (s.ionizer || []).forEach((r, idx) => {
    if (r.testline !== '' || r.repairzone !== '') {
      const t1 = parseFloat(r.testline);
      const t2 = parseFloat(r.repairzone);
      let ok = true;
      if (r.testline !== '') ok = ok && t1 < 5;
      if (r.repairzone !== '') ok = ok && t2 < 5;
      rows.push({
        id: `${date}-ion-${idx}`,
        date,
        sectionKey: 'ionizer',
        sectionLabel: '4. Ionizer',
        location: 'Testing Line & Repair Zone',
        itemIdentifier: `Blower #${r.n}`,
        measuredValue: `Test: ${r.testline || '—'}s | Repair: ${r.repairzone || '—'}s`,
        standardSpec: 'Decay Td < 5 sec',
        checksCount: 1,
        passCount: ok ? 1 : 0,
        failCount: ok ? 0 : 1,
        status: ok ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 5. Wristband
  Object.keys(s.wristband || {}).forEach((zone, idx) => {
    const d = s.wristband[zone];
    if (d && d.check !== '') {
      const chk = parseInt(d.check, 10) || 0;
      const fail = parseInt(d.fail, 10) || 0;
      const pass = Math.max(chk - fail, 0);
      const isPass = fail === 0;
      rows.push({
        id: `${date}-wb-${idx}`,
        date,
        sectionKey: 'wristband',
        sectionLabel: '5. ESD Wristband',
        location: zone,
        itemIdentifier: `Personnel (${chk})`,
        measuredValue: `Check: ${chk} | Pass: ${pass} | Fail: ${fail}`,
        standardSpec: 'Green LED (Ring Tester)',
        checksCount: chk,
        passCount: pass,
        failCount: fail,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: s.remarks?.wristband || genRem,
      });
    }
  });

  // 6. ESD Shoe
  Object.keys(s.shoe || {}).forEach((zone, idx) => {
    const d = s.shoe[zone];
    if (d && d.check !== '') {
      const chk = parseInt(d.check, 10) || 0;
      const fail = parseInt(d.fail, 10) || 0;
      const pass = Math.max(chk - fail, 0);
      const isPass = fail === 0;
      rows.push({
        id: `${date}-shoe-${idx}`,
        date,
        sectionKey: 'shoe',
        sectionLabel: '6. ESD Shoe',
        location: zone,
        itemIdentifier: `Footwear (${chk})`,
        measuredValue: `Check: ${chk} | Pass: ${pass} | Fail: ${fail}`,
        standardSpec: 'Green LED (Shoe Tester)',
        checksCount: chk,
        passCount: pass,
        failCount: fail,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: s.remarks?.shoe || genRem,
      });
    }
  });

  // 7. ESD Apron
  (s.apron || []).forEach((r, idx) => {
    if (r.value.trim() !== '') {
      const v = parseR(r.value);
      const isPass = v !== null && v < 1e11;
      rows.push({
        id: `${date}-apron-${idx}`,
        date,
        sectionKey: 'apron',
        sectionLabel: '7. ESD Apron',
        location: `${r.color} Fabric`,
        itemIdentifier: `${r.name} (${r.id})`,
        measuredValue: `${r.value} Ω (${fmtR(v)})`,
        standardSpec: 'Rss < 10^11 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 8. EPA Floor
  (s.epafloor || []).forEach((r, idx) => {
    if (r.value.trim() !== '') {
      const v = parseR(r.value);
      const isPass = v !== null && v >= 1e5 && v < 1e9;
      rows.push({
        id: `${date}-floor-${idx}`,
        date,
        sectionKey: 'epafloor',
        sectionLabel: '8. EPA Floor',
        location: r.loc,
        itemIdentifier: r.pointId,
        measuredValue: `${r.value} Ω (${fmtR(v)})`,
        standardSpec: '10^5 ≤ R < 10^9 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 9. ESD chair
  (s.chair || []).forEach((r, idx) => {
    if (r.value.trim() !== '') {
      const v = parseR(r.value);
      const isPass = v !== null && v < 1e9;
      rows.push({
        id: `${date}-chair-${idx}`,
        date,
        sectionKey: 'chair',
        sectionLabel: '9. ESD chair',
        location: r.zone,
        itemIdentifier: r.chairId,
        measuredValue: `${r.value} Ω (${fmtR(v)})`,
        standardSpec: 'R < 10^9 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 10. Transport trolley
  (s.trolley || []).forEach((r, idx) => {
    if (r.value.trim() !== '') {
      const v = parseR(r.value);
      const isPass = v !== null && v < 1e9;
      rows.push({
        id: `${date}-trolley-${idx}`,
        date,
        sectionKey: 'trolley',
        sectionLabel: '10. Transport trolley',
        location: r.zone,
        itemIdentifier: r.trolleyId,
        measuredValue: `${r.value} Ω (${fmtR(v)})`,
        standardSpec: 'R < 10^9 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  // 11. ESD tray and box
  (s.traybox || []).forEach((r, idx) => {
    if (r.value.trim() !== '') {
      const v = parseR(r.value);
      const isPass = v !== null && v >= 1e4 && v < 1e11;
      rows.push({
        id: `${date}-traybox-${idx}`,
        date,
        sectionKey: 'traybox',
        sectionLabel: '11. ESD tray and box',
        location: r.zone,
        itemIdentifier: `${r.itemType} (${r.sampleId})`,
        measuredValue: `${r.value} Ω (${fmtR(v)})`,
        standardSpec: '10^4 ≤ R < 10^11 Ω',
        checksCount: 1,
        passCount: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        status: isPass ? 'PASS' : 'FAIL',
        remarks: genRem,
      });
    }
  });

  return rows;
}

export const EsdView: React.FC<EsdViewProps> = ({
  onNavigate,
  selectedSubsection = 'database',
  isLoggedIn = true,
  onOpenLoginModal,
}) => {
  const [viewMode, setViewMode] = useState<'database' | 'entry'>(selectedSubsection);
  const [reportDate, setReportDate] = useState<string>(todayStr());
  const [activeTab, setActiveTab] = useState<TabKey>('worksurface');
  const [state, setState] = useState<EsdState>(defaultState);
  const [savedChip, setSavedChip] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ESD Data Database state
  const [esdDatabaseMap, setEsdDatabaseMap] = useState<Record<string, EsdState>>(buildSeedDatabase);
  const [dbTableMode, setDbTableMode] = useState<'measurements' | 'daily'>('measurements');
  const [dbSearch, setDbSearch] = useState<string>('');
  const [dbDateFilter, setDbDateFilter] = useState<string>('ALL');
  const [dbSectionFilter, setDbSectionFilter] = useState<string>('ALL');
  const [dbStatusFilter, setDbStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');

  useEffect(() => {
    setViewMode(selectedSubsection);
  }, [selectedSubsection]);

  const handleSwitchMode = (mode: 'database' | 'entry') => {
    setViewMode(mode);
    if (onNavigate) {
      onNavigate(mode === 'entry' ? 'esd-entry' : 'esd-database');
    }
  };

  // Load all ESD records from localStorage and Firestore for the ESD Data Database
  const refreshEsdDatabase = useCallback(async () => {
    const base = defaultState();
    const mergedMap: Record<string, EsdState> = { ...buildSeedDatabase() };

    // 1. Scan localStorage for esd-log:<date>
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('esd-log:')) {
          const dt = key.replace('esd-log:', '').trim();
          const raw = localStorage.getItem(key);
          if (dt && raw) {
            const parsed = JSON.parse(raw);
            mergedMap[dt] = {
              ...base,
              ...parsed,
              remarks: { ...base.remarks, ...(parsed.remarks || {}) },
            };
          }
        }
      }
    } catch (e) {
      console.warn('Local ESD scan notice:', e);
    }

    // 2. Scan Firestore esd_records
    if (db) {
      try {
        const cloudDocs = await listEsdRecords();
        cloudDocs.forEach((docItem) => {
          const dt = docItem.date || docItem.id;
          const payload = docItem.data || docItem;
          if (dt && payload) {
            mergedMap[dt] = {
              ...base,
              ...payload,
              remarks: { ...base.remarks, ...(payload.remarks || {}) },
            };
          }
        });
      } catch (e) {
        console.warn('Firestore ESD database load notice:', e);
      }
    }

    setEsdDatabaseMap(mergedMap);
  }, []);

  useEffect(() => {
    refreshEsdDatabase();
  }, [refreshEsdDatabase]);

  // -------------------------------------------------------------------------------------
  // Load data whenever reportDate changes
  // -------------------------------------------------------------------------------------
  const loadDateData = useCallback(async (date: string) => {
    const base = defaultState();
    // 1. Check local storage
    const raw = localStorage.getItem(storageKey(date));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setState({
          ...base,
          ...parsed,
          remarks: { ...base.remarks, ...(parsed.remarks || {}) },
        });
        setSavedChip('✓ সংরক্ষিত ডেটা লোড হয়েছে (Local)');
        setHasUnsavedChanges(false);
        return;
      } catch (err) {
        console.warn('Failed to parse local storage ESD data:', err);
      }
    }

    // 2. Try Firestore esd_records / esd_reports if available
    if (db) {
      try {
        const esdRec = await getEsdRecordByDate(date);
        if (esdRec) {
          const merged = {
            ...base,
            ...esdRec,
            remarks: { ...base.remarks, ...(esdRec.remarks || {}) },
          };
          setState(merged);
          localStorage.setItem(storageKey(date), JSON.stringify(merged));
          setSavedChip('✓ সংরক্ষিত ডেটা লোড হয়েছে (Cloud)');
          setHasUnsavedChanges(false);
          return;
        }

        const docRef = doc(db, 'esd_reports', date);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as EsdState;
          const merged = {
            ...base,
            ...cloudData,
            remarks: { ...base.remarks, ...(cloudData.remarks || {}) },
          };
          setState(merged);
          localStorage.setItem(storageKey(date), JSON.stringify(merged));
          setSavedChip('✓ সংরক্ষিত ডেটা লোড হয়েছে (Cloud)');
          setHasUnsavedChanges(false);
          return;
        }
      } catch (cloudErr) {
        console.warn('Cloud fetch warning for ESD log:', cloudErr);
      }
    }

    // 3. Check seeded database map for that date
    const seeds = buildSeedDatabase();
    if (seeds[date]) {
      setState(seeds[date]);
      setSavedChip('✓ সংরক্ষিত ডেটা লোড হয়েছে');
      setHasUnsavedChanges(false);
      return;
    }

    // 4. Fallback to default state for new date
    setState(defaultState());
    setSavedChip('');
    setHasUnsavedChanges(false);
  }, []);

  useEffect(() => {
    loadDateData(reportDate);
  }, [reportDate, loadDateData]);

  // -------------------------------------------------------------------------------------
  // Save Data handler
  // -------------------------------------------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save to local storage & live ESD database map
      localStorage.setItem(storageKey(reportDate), JSON.stringify(state));
      setEsdDatabaseMap((prev) => ({
        ...prev,
        [reportDate]: state,
      }));

      // 2. Save to Firestore esd_records & esd_reports if available
      if (db) {
        try {
          await saveEsdRecordByDate(reportDate, state);
          const docRef = doc(db, 'esd_reports', reportDate);
          await setDoc(docRef, {
            ...state,
            reportDate,
            updatedAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Firestore cloud sync notice:', dbErr);
        }
      }

      setSavedChip('✓ সেভ হয়েছে');
      setHasUnsavedChanges(false);
      setTimeout(() => {
        setSavedChip('✓ সংরক্ষিত ডেটা');
      }, 3500);
    } catch (err) {
      console.error('Error saving ESD data:', err);
      setSavedChip('⚠️ সেভ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDatabaseDate = async (dateToDelete: string) => {
    setEsdDatabaseMap((prev) => {
      const next = { ...prev };
      delete next[dateToDelete];
      return next;
    });
    try {
      localStorage.removeItem(storageKey(dateToDelete));
    } catch {}
    if (db) {
      try {
        await deleteEsdRecordByDate(dateToDelete);
      } catch (e) {
        console.warn('Firestore delete ESD record notice:', e);
      }
    }
  };

  const handleOpenDateInEntry = (targetDate: string, section?: TabKey) => {
    setReportDate(targetDate);
    if (section) {
      setActiveTab(section);
    }
    handleSwitchMode('entry');
  };

  // -------------------------------------------------------------------------------------
  // Export CSV
  // -------------------------------------------------------------------------------------
  const handleExportCSV = () => {
    const rows: string[][] = [
      ['Section', 'Field1', 'Field2', 'Field3', 'Field4', 'Field5', 'Field6'],
      ['Date', reportDate],
      ['ESD Work Surface', 'Location', 'Value(Ω)', 'Status'],
    ];

    state.worksurface.forEach((r) => {
      const v = parseR(r.value);
      const res = r.value.trim() !== '' ? (v !== null && v >= 1e6 && v < 1e9 ? 'Pass' : 'Fail') : '';
      rows.push(['', r.loc, r.value, res]);
    });

    rows.push(['Soldering Iron', '#', 'Zone', 'Voltage(V)', 'Resistance(Ω)', 'TableTG', 'Status']);
    state.iron.forEach((r) => {
      const v = parseFloat(r.voltage);
      const res = parseFloat(r.resistance);
      const status = r.voltage !== '' && r.resistance !== '' ? (v < 2 && res < 10 ? 'Pass' : 'Fail') : '';
      rows.push(['', String(r.n), r.zone, r.voltage, r.resistance, r.tg, status]);
    });

    rows.push(['ESD Apron', 'Sample', 'Color', 'ID', 'Value(Ω)', 'Status']);
    state.apron.forEach((r) => {
      const v = parseR(r.value);
      const status = r.value.trim() !== '' ? (v !== null && v < 1e11 ? 'Pass' : 'Fail') : '';
      rows.push(['', r.name, r.color, r.id, r.value, status]);
    });

    rows.push(['Ionizer', '#', 'TestingLine(s)', 'RepairZone(s)', 'Status']);
    state.ionizer.forEach((r) => {
      const t1 = parseFloat(r.testline);
      const t2 = parseFloat(r.repairzone);
      let ok = true;
      if (r.testline !== '') ok = ok && t1 < 5;
      if (r.repairzone !== '') ok = ok && t2 < 5;
      const status = r.testline !== '' || r.repairzone !== '' ? (ok ? 'Pass' : 'Fail') : '';
      rows.push(['', String(r.n), r.testline, r.repairzone, status]);
    });

    rows.push(['EPA Floor', 'Point ID', 'Location', 'Value(Ω)', 'Status']);
    (state.epafloor || []).forEach((r) => {
      const v = parseR(r.value);
      const status = r.value.trim() !== '' ? (v !== null && v >= 1e5 && v < 1e9 ? 'Pass' : 'Fail') : '';
      rows.push(['', r.pointId, r.loc, r.value, status]);
    });

    rows.push(['ESD chair', 'Chair ID', 'Zone', 'Value(Ω)', 'Status']);
    (state.chair || []).forEach((r) => {
      const v = parseR(r.value);
      const status = r.value.trim() !== '' ? (v !== null && v < 1e9 ? 'Pass' : 'Fail') : '';
      rows.push(['', r.chairId, r.zone, r.value, status]);
    });

    rows.push(['Transport trolley', 'Trolley ID', 'Zone', 'Value(Ω)', 'Status']);
    (state.trolley || []).forEach((r) => {
      const v = parseR(r.value);
      const status = r.value.trim() !== '' ? (v !== null && v < 1e9 ? 'Pass' : 'Fail') : '';
      rows.push(['', r.trolleyId, r.zone, r.value, status]);
    });

    rows.push(['ESD tray and box', 'Item Type', 'Sample ID', 'Zone', 'Value(Ω)', 'Status']);
    (state.traybox || []).forEach((r) => {
      const v = parseR(r.value);
      const status = r.value.trim() !== '' ? (v !== null && v >= 1e4 && v < 1e11 ? 'Pass' : 'Fail') : '';
      rows.push(['', r.itemType, r.sampleId, r.zone, r.value, status]);
    });

    const zoneGroups: Array<{ key: 'contmonitor' | 'wristband' | 'shoe'; title: string }> = [
      { key: 'contmonitor', title: 'Continuous Wriststrap Monitor' },
      { key: 'wristband', title: 'ESD Wristband' },
      { key: 'shoe', title: 'ESD Shoe / Slipper' },
    ];

    zoneGroups.forEach(({ key, title }) => {
      rows.push([title, 'Zone', 'Check', 'Fail', 'Pass']);
      Object.keys(state[key]).forEach((z) => {
        const d = state[key][z];
        const chk = parseInt(d.check, 10) || 0;
        const fail = parseInt(d.fail, 10) || 0;
        const pass = d.check !== '' ? Math.max(chk - fail, 0) : '';
        rows.push(['', z, d.check, d.fail, String(pass)]);
      });
      if (state.remarks[key as 'wristband' | 'shoe']) {
        rows.push(['', `${title} Remarks`, state.remarks[key as 'wristband' | 'shoe']]);
      }
    });

    const csvContent = rows
      .map((r) =>
        r
          .map((c) => `"${String(c === undefined ? '' : c).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ESD_Report_${reportDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------------------------------
  // Summary Stats Calculation
  // -------------------------------------------------------------------------------------
  const stats = useMemo(() => {
    let totalChecks = 0;
    let totalFails = 0;
    let totalPasses = 0;

    // Work surface
    state.worksurface.forEach((r) => {
      if (r.value.trim() !== '') {
        totalChecks++;
        const v = parseR(r.value);
        if (v !== null && v >= 1e6 && v < 1e9) totalPasses++;
        else totalFails++;
      }
    });

    // Iron
    state.iron.forEach((r) => {
      if (r.voltage !== '' && r.resistance !== '') {
        totalChecks++;
        const v = parseFloat(r.voltage);
        const res = parseFloat(r.resistance);
        if (v < 2 && res < 10) totalPasses++;
        else totalFails++;
      }
    });

    // Apron
    state.apron.forEach((r) => {
      if (r.value.trim() !== '') {
        totalChecks++;
        const v = parseR(r.value);
        if (v !== null && v < 1e11) totalPasses++;
        else totalFails++;
      }
    });

    // Ionizer
    state.ionizer.forEach((r) => {
      if (r.testline !== '' || r.repairzone !== '') {
        totalChecks++;
        const t1 = parseFloat(r.testline);
        const t2 = parseFloat(r.repairzone);
        let ok = true;
        if (r.testline !== '') ok = ok && t1 < 5;
        if (r.repairzone !== '') ok = ok && t2 < 5;
        if (ok) totalPasses++;
        else totalFails++;
      }
    });

    // Zone counts
    (['contmonitor', 'wristband', 'shoe'] as const).forEach((key) => {
      Object.keys(state[key]).forEach((z) => {
        const d = state[key][z];
        const chk = parseInt(d.check, 10) || 0;
        const fail = parseInt(d.fail, 10) || 0;
        if (d.check !== '') {
          totalChecks += chk;
          totalFails += fail;
          totalPasses += Math.max(chk - fail, 0);
        }
      });
    });

    // EPA Floor
    (state.epafloor || []).forEach((r) => {
      if (r.value.trim() !== '') {
        totalChecks++;
        const v = parseR(r.value);
        if (v !== null && v >= 1e5 && v < 1e9) totalPasses++;
        else totalFails++;
      }
    });

    // ESD chair
    (state.chair || []).forEach((r) => {
      if (r.value.trim() !== '') {
        totalChecks++;
        const v = parseR(r.value);
        if (v !== null && v < 1e9) totalPasses++;
        else totalFails++;
      }
    });

    // Transport trolley
    (state.trolley || []).forEach((r) => {
      if (r.value.trim() !== '') {
        totalChecks++;
        const v = parseR(r.value);
        if (v !== null && v < 1e9) totalPasses++;
        else totalFails++;
      }
    });

    // ESD tray and box
    (state.traybox || []).forEach((r) => {
      if (r.value.trim() !== '') {
        totalChecks++;
        const v = parseR(r.value);
        if (v !== null && v >= 1e4 && v < 1e11) totalPasses++;
        else totalFails++;
      }
    });

    const passRate = totalChecks > 0 ? ((totalPasses / totalChecks) * 100).toFixed(1) : '100.0';

    return {
      totalChecks,
      totalPasses,
      totalFails,
      passRate,
    };
  }, [state]);

  // -------------------------------------------------------------------------------------
  // Mutation Helpers
  // -------------------------------------------------------------------------------------
  const updateWorksurface = (index: number, field: keyof WorksurfaceRow, val: string) => {
    setState((prev) => {
      const next = [...prev.worksurface];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, worksurface: next };
    });
    setHasUnsavedChanges(true);
  };

  const addWorksurfaceRow = () => {
    setState((prev) => ({
      ...prev,
      worksurface: [...prev.worksurface, { loc: 'SMT Line 1', value: '' }],
    }));
    setHasUnsavedChanges(true);
  };

  const removeWorksurfaceRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      worksurface: prev.worksurface.filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateIron = (index: number, field: keyof IronRow, val: any) => {
    setState((prev) => {
      const next = [...prev.iron];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, iron: next };
    });
    setHasUnsavedChanges(true);
  };

  const addIronRow = () => {
    setState((prev) => ({
      ...prev,
      iron: [
        ...prev.iron,
        {
          n: prev.iron.length + 1,
          zone: 'Testing Line',
          voltage: '',
          resistance: '',
          tg: 'NA',
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeIronRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      iron: prev.iron.filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateIonizer = (index: number, field: keyof IonizerRow, val: string) => {
    setState((prev) => {
      const next = [...prev.ionizer];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, ionizer: next };
    });
    setHasUnsavedChanges(true);
  };

  const addIonizerRow = () => {
    setState((prev) => ({
      ...prev,
      ionizer: [
        ...prev.ionizer,
        { n: prev.ionizer.length + 1, testline: '', repairzone: '' },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeIonizerRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      ionizer: prev.ionizer.filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateApron = (index: number, field: keyof ApronRow, val: string) => {
    setState((prev) => {
      const next = [...prev.apron];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, apron: next };
    });
    setHasUnsavedChanges(true);
  };

  const addApronRow = () => {
    setState((prev) => ({
      ...prev,
      apron: [
        ...prev.apron,
        {
          name: `Sample ${prev.apron.length + 1}`,
          color: 'Sky Blue',
          id: 'NA',
          value: '',
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeApronRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      apron: prev.apron.filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateEpaFloor = (index: number, field: keyof EpaFloorRow, val: string) => {
    setState((prev) => {
      const next = [...(prev.epafloor || [])];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, epafloor: next };
    });
    setHasUnsavedChanges(true);
  };

  const addEpaFloorRow = () => {
    setState((prev) => {
      const list = prev.epafloor || [];
      return {
        ...prev,
        epafloor: [
          ...list,
          {
            pointId: `FP-0${list.length + 1}`,
            loc: 'SMT Line 1',
            value: '',
          },
        ],
      };
    });
    setHasUnsavedChanges(true);
  };

  const removeEpaFloorRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      epafloor: (prev.epafloor || []).filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateChair = (index: number, field: keyof EsdChairRow, val: string) => {
    setState((prev) => {
      const next = [...(prev.chair || [])];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, chair: next };
    });
    setHasUnsavedChanges(true);
  };

  const addChairRow = () => {
    setState((prev) => {
      const list = prev.chair || [];
      return {
        ...prev,
        chair: [
          ...list,
          {
            chairId: `CH-0${list.length + 1}`,
            zone: 'SMT Line 1',
            value: '',
          },
        ],
      };
    });
    setHasUnsavedChanges(true);
  };

  const removeChairRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      chair: (prev.chair || []).filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateTrolley = (index: number, field: keyof TrolleyRow, val: string) => {
    setState((prev) => {
      const next = [...(prev.trolley || [])];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, trolley: next };
    });
    setHasUnsavedChanges(true);
  };

  const addTrolleyRow = () => {
    setState((prev) => {
      const list = prev.trolley || [];
      return {
        ...prev,
        trolley: [
          ...list,
          {
            trolleyId: `TR-0${list.length + 1}`,
            zone: 'SMT Line 1',
            value: '',
          },
        ],
      };
    });
    setHasUnsavedChanges(true);
  };

  const removeTrolleyRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      trolley: (prev.trolley || []).filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateTrayBox = (index: number, field: keyof TrayBoxRow, val: string) => {
    setState((prev) => {
      const next = [...(prev.traybox || [])];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, traybox: next };
    });
    setHasUnsavedChanges(true);
  };

  const addTrayBoxRow = () => {
    setState((prev) => {
      const list = prev.traybox || [];
      return {
        ...prev,
        traybox: [
          ...list,
          {
            itemType: 'ESD Tray',
            sampleId: `TB-0${list.length + 1}`,
            zone: 'SMT Line 1',
            value: '',
          },
        ],
      };
    });
    setHasUnsavedChanges(true);
  };

  const removeTrayBoxRow = (idx: number) => {
    setState((prev) => ({
      ...prev,
      traybox: (prev.traybox || []).filter((_, i) => i !== idx),
    }));
    setHasUnsavedChanges(true);
  };

  const updateZoneCount = (
    key: 'contmonitor' | 'wristband' | 'shoe',
    zone: string,
    field: 'check' | 'fail',
    val: string
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [zone]: {
          ...prev[key][zone],
          [field]: val,
        },
      },
    }));
    setHasUnsavedChanges(true);
  };

  const updateRemarks = (key: 'wristband' | 'shoe' | 'general', val: string) => {
    setState((prev) => ({
      ...prev,
      remarks: {
        ...prev.remarks,
        [key]: val,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // -------------------------------------------------------------------------------------
  // ESD Data Database Computed Analytics & Flattened Records
  // -------------------------------------------------------------------------------------
  const sortedDates = useMemo(() => {
    return Object.keys(esdDatabaseMap).sort((a, b) => b.localeCompare(a));
  }, [esdDatabaseMap]);

  const allFlatRows = useMemo(() => {
    const list: EsdDatabaseFlatRow[] = [];
    sortedDates.forEach((dt) => {
      const st = esdDatabaseMap[dt];
      if (st) {
        list.push(...flattenEsdStateToRows(dt, st));
      }
    });
    return list;
  }, [sortedDates, esdDatabaseMap]);

  const filteredFlatRows = useMemo(() => {
    return allFlatRows.filter((r) => {
      if (dbDateFilter !== 'ALL' && r.date !== dbDateFilter) return false;
      if (dbSectionFilter !== 'ALL' && r.sectionKey !== dbSectionFilter) return false;
      if (dbStatusFilter !== 'ALL' && r.status !== dbStatusFilter) return false;
      if (dbSearch.trim()) {
        const q = dbSearch.toLowerCase();
        const match =
          r.date.toLowerCase().includes(q) ||
          r.sectionLabel.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.itemIdentifier.toLowerCase().includes(q) ||
          r.measuredValue.toLowerCase().includes(q) ||
          r.remarks.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allFlatRows, dbDateFilter, dbSectionFilter, dbStatusFilter, dbSearch]);

  const dateSummaries = useMemo(() => {
    return sortedDates.map((dt) => {
      const rows = flattenEsdStateToRows(dt, esdDatabaseMap[dt]);
      const totalChecks = rows.reduce((acc, r) => acc + r.checksCount, 0);
      const totalPasses = rows.reduce((acc, r) => acc + r.passCount, 0);
      const totalFails = rows.reduce((acc, r) => acc + r.failCount, 0);
      const passRate = totalChecks > 0 ? Number(((totalPasses / totalChecks) * 100).toFixed(1)) : 100;

      const bySection: Record<TabKey, { checks: number; pass: number; fail: number }> = {
        worksurface: { checks: 0, pass: 0, fail: 0 },
        contmonitor: { checks: 0, pass: 0, fail: 0 },
        iron: { checks: 0, pass: 0, fail: 0 },
        ionizer: { checks: 0, pass: 0, fail: 0 },
        wristband: { checks: 0, pass: 0, fail: 0 },
        shoe: { checks: 0, pass: 0, fail: 0 },
        apron: { checks: 0, pass: 0, fail: 0 },
        epafloor: { checks: 0, pass: 0, fail: 0 },
        chair: { checks: 0, pass: 0, fail: 0 },
        trolley: { checks: 0, pass: 0, fail: 0 },
        traybox: { checks: 0, pass: 0, fail: 0 },
      };

      rows.forEach((r) => {
        bySection[r.sectionKey].checks += r.checksCount;
        bySection[r.sectionKey].pass += r.passCount;
        bySection[r.sectionKey].fail += r.failCount;
      });

      return {
        date: dt,
        totalChecks,
        totalPasses,
        totalFails,
        passRate,
        bySection,
        remarks: esdDatabaseMap[dt]?.remarks?.general || 'Standard ESD audit completed.',
      };
    });
  }, [sortedDates, esdDatabaseMap]);

  const dbKpis = useMemo(() => {
    const totalReports = dateSummaries.length;
    const totalChecks = dateSummaries.reduce((s, d) => s + d.totalChecks, 0);
    const totalPasses = dateSummaries.reduce((s, d) => s + d.totalPasses, 0);
    const totalFails = dateSummaries.reduce((s, d) => s + d.totalFails, 0);
    const overallPassRate =
      totalChecks > 0 ? ((totalPasses / totalChecks) * 100).toFixed(1) : '100.0';
    return {
      totalReports,
      totalChecks,
      totalPasses,
      totalFails,
      overallPassRate,
    };
  }, [dateSummaries]);

  const sectionChartData = useMemo(() => {
    const shortLabels: Record<TabKey, string> = {
      worksurface: 'Work Surface',
      contmonitor: 'Ctrl Monitor',
      iron: 'Solder Iron',
      ionizer: 'Ionizer',
      wristband: 'Wristband',
      shoe: 'ESD Shoe',
      apron: 'ESD Apron',
      epafloor: 'EPA Floor',
      chair: 'ESD Chair',
      trolley: 'Trolley',
      traybox: 'Tray & Box',
    };
    return TABS.map((t) => {
      const secRows = allFlatRows.filter((r) => r.sectionKey === t.key);
      const pass = secRows.reduce((s, r) => s + r.passCount, 0);
      const fail = secRows.reduce((s, r) => s + r.failCount, 0);
      const total = pass + fail;
      return {
        name: shortLabels[t.key],
        fullName: t.label,
        pass,
        fail,
        total,
        rate: total > 0 ? Number(((pass / total) * 100).toFixed(1)) : 100,
      };
    });
  }, [allFlatRows]);

  const zonePieData = useMemo(() => {
    const counts: Record<string, number> = {};
    allFlatRows.forEach((r) => {
      const z = r.location || 'General';
      counts[z] = (counts[z] || 0) + r.checksCount;
    });
    const colors = ['#1e3a8a', '#28ad6b', '#e35b2a', '#2f9bea', '#1fb6a6', '#e8a13a', '#6366f1', '#ec4899'];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length],
      }));
  }, [allFlatRows]);

  const handleExportFullDatabaseCSV = () => {
    const rows: string[][] = [
      [
        'SL',
        'Inspection Date',
        'ESD Control Section',
        'Location / Zone',
        'Item / Sample ID',
        'Measured Value / Check Count',
        'Standard Specification',
        'Total Checked',
        'Passed',
        'Failed',
        'Result Status',
        'Remarks',
      ],
    ];
    filteredFlatRows.forEach((r, idx) => {
      rows.push([
        String(idx + 1),
        r.date,
        r.sectionLabel,
        r.location,
        r.itemIdentifier,
        r.measuredValue,
        r.standardSpec,
        String(r.checksCount),
        String(r.passCount),
        String(r.failCount),
        r.status,
        r.remarks,
      ]);
    });
    const csvContent = rows
      .map((r) =>
        r.map((c) => `"${String(c === undefined ? '' : c).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Walton_ESD_Data_Database_${todayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="page-esd" className="space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        <div className="bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0f172a] text-white px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/90 flex items-center justify-center text-white shadow-sm ring-2 ring-white/20">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {viewMode === 'database' ? 'ESD Data Database' : 'ESD QC Report Entry'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ANSI/ESD S20.20
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Walton Hi Tech — PCBA ESD Monthly QC Inspection Database, Analytics &amp; Calibration Record
              </p>
            </div>
          </div>

          {/* Mode Switcher + Date Picker Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-900/70 p-1 rounded-lg border border-slate-700/70 print:hidden">
              <button
                type="button"
                onClick={() => handleSwitchMode('database')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'database'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>ESD Data Database ({dbKpis.totalReports})</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('entry')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'entry'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>ESD Data Entry</span>
              </button>
            </div>

            {viewMode === 'entry' && (
              <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/60 backdrop-blur-xs">
                <Calendar className="w-4 h-4 text-slate-400 ml-1.5" />
                <input
                  type="date"
                  id="reportDate"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="bg-transparent text-white font-mono text-sm px-2 py-1 outline-hidden cursor-pointer"
                />
                {savedChip && (
                  <span
                    id="savedChip"
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      savedChip.includes('⚠️')
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {savedChip}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-[11px] text-amber-300 animate-pulse px-1.5">
                    ● Unsaved
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar & Metric Cards for Entry Mode */}
        {viewMode === 'entry' && (
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-medium block">Total Inspected</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{stats.totalChecks}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs text-emerald-600 font-medium block">Passed Points</span>
                <span className="text-lg font-bold text-emerald-700 font-mono">{stats.totalPasses}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs text-red-600 font-medium block">Failures</span>
                <span className="text-lg font-bold text-red-700 font-mono">{stats.totalFails}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs text-blue-600 font-medium block">Pass Rate</span>
                <span className="text-lg font-bold text-blue-700 font-mono">{stats.passRate}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'এই তারিখের ডেটা সেভ করুন'}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-sm transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>CSV এক্সপোর্ট করুন</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-sm transition-colors shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>প্রিন্ট</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================================= */}
      {/* VIEW MODE 1: ESD DATA DATABASE (KPI SCORECARDS, ANALYTICS CHARTS & MASTER TABLES) */}
      {/* ================================================================================= */}
      {viewMode === 'database' && (
        <div className="space-y-6">
          {/* 4 Headline ESD Database KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">
                  Total ESD Audit Logs
                </span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-3xl font-bold text-[#182a52] mt-2">
                {dbKpis.totalReports}
              </div>
              <div className="text-[11px] text-[#5b6480] mt-1">
                Registered inspection dates in database
              </div>
            </div>

            <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">
                  Total Inspected Points
                </span>
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-3xl font-bold text-[#2f9bea] mt-2">
                {dbKpis.totalChecks}
              </div>
              <div className="text-[11px] text-[#5b6480] mt-1">
                Across all 11 ESD control sections
              </div>
            </div>

            <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">
                  Overall ESD Pass Rate
                </span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-3xl font-bold text-[#28ad6b] mt-2">
                {dbKpis.overallPassRate}%
              </div>
              <div className="text-[11px] text-[#128f83] font-semibold mt-1">
                {dbKpis.totalPasses} Passed · Target ≥ 98.0%
              </div>
            </div>

            <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">
                  Total ESD Failures
                </span>
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-3xl font-bold text-[#d64545] mt-2">
                {dbKpis.totalFails}
              </div>
              <div className="text-[11px] text-[#5b6480] mt-1">
                Non-conforming grounding / resistance points
              </div>
            </div>
          </div>

          {/* 3 Interactive ESD Database Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart 1: Date-wise ESD Inspection Volume & Pass/Fail */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0d1730]">
                  Date-wise ESD Inspection Trend
                </h3>
                <p className="text-[11px] text-[#5b6480] mb-2">
                  Passed vs Failed points across recorded audit dates
                </p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...dateSummaries].reverse()}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                    <XAxis dataKey="date" stroke="#5b6480" fontSize={10} />
                    <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #e2e7f2',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="totalPasses" name="Passed" fill="#28ad6b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalFails" name="Failed" fill="#e35b2a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
                Live historical compliance trend synced from ESD QC Report Entry.
              </div>
            </div>

            {/* Chart 2: 11 ESD Control Sections Compliance */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0d1730]">
                  11 ESD Control Sections Breakdown
                </h3>
                <p className="text-[11px] text-[#5b6480] mb-2">
                  Cumulative checks across Work Surface, Wristband, Shoe, Floor &amp; Iron
                </p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={sectionChartData.slice(0, 7)}
                    margin={{ top: 5, right: 15, left: 25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                    <XAxis type="number" stroke="#5b6480" fontSize={10} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="#5b6480" fontSize={10} width={75} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #e2e7f2',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="pass" name="Pass" fill="#2f9bea" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
                All 11 ANSI/ESD S20.20 control categories monitored.
              </div>
            </div>

            {/* Chart 3: Manufacturing Zone Distribution */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0d1730]">
                  EPA Zone Inspection Distribution
                </h3>
                <p className="text-[11px] text-[#5b6480] mb-2">
                  SMT Lines, Routing, Testing, Repair &amp; Packing zones
                </p>
              </div>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={zonePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {zonePieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #e2e7f2',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
                {zonePieData.slice(0, 4).map((z) => (
                  <span key={z.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
                    {z.name} ({z.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Master ESD Data Database Card */}
          <div className="bg-white border border-[#e2e7f2] rounded-xl shadow-xs overflow-hidden">
            {/* Database Table Header & Mode Toggle */}
            <div className="bg-gradient-to-r from-[#182a52] via-[#1e3a8a] to-[#0d1730] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    ESD DATA DATABASE REGISTRY
                  </h3>
                  <p className="text-xs text-slate-300">
                    Complete historical &amp; live cloud-synced ESD measurements across all 11 control items
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-900/60 p-1 rounded-lg border border-white/15">
                  <button
                    type="button"
                    onClick={() => setDbTableMode('measurements')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      dbTableMode === 'measurements'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    1. All ESD Measurements ({filteredFlatRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbTableMode('daily')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      dbTableMode === 'daily'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    2. Daily Report Summary ({dateSummaries.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportFullDatabaseCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Database CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('entry')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New ESD Entry</span>
                </button>
              </div>
            </div>

            {/* Filter Bar for Measurements Table */}
            {dbTableMode === 'measurements' && (
              <div className="p-4 bg-slate-50 border-b border-[#e2e7f2] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by zone, sample ID, resistance value, section..."
                    value={dbSearch}
                    onChange={(e) => setDbSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <select
                    value={dbDateFilter}
                    onChange={(e) => setDbDateFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 outline-hidden"
                  >
                    <option value="ALL">All Audit Dates ({sortedDates.length})</option>
                    {sortedDates.map((d) => (
                      <option key={d} value={d}>
                        Date: {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={dbSectionFilter}
                    onChange={(e) => setDbSectionFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 outline-hidden"
                  >
                    <option value="ALL">All 11 ESD Control Sections</option>
                    {TABS.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={dbStatusFilter}
                    onChange={(e) => setDbStatusFilter(e.target.value as 'ALL' | 'PASS' | 'FAIL')}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 outline-hidden"
                  >
                    <option value="ALL">All Status (PASS &amp; FAIL)</option>
                    <option value="PASS">PASS Only</option>
                    <option value="FAIL">FAIL Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* TABLE 1: ALL ESD MEASUREMENT RECORDS */}
            {dbTableMode === 'measurements' && (
              <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#f1f5f9] text-[#0d1730] uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-3 border-r border-slate-200 text-center w-12">SL</th>
                      <th className="px-3 py-3 border-r border-slate-200">Date</th>
                      <th className="px-3 py-3 border-r border-slate-200">ESD Control Section</th>
                      <th className="px-3 py-3 border-r border-slate-200">Zone / Location</th>
                      <th className="px-3 py-3 border-r border-slate-200">Sample / Point ID</th>
                      <th className="px-3 py-3 border-r border-slate-200">Measured Value / Check</th>
                      <th className="px-3 py-3 border-r border-slate-200">Standard Specification</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Status</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {filteredFlatRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-3 py-2.5 border-r border-slate-100 text-center text-slate-500 font-bold">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 font-bold text-[#182a52]">
                          {row.date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 font-sans font-semibold text-slate-800">
                          {row.sectionLabel}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 font-sans text-slate-700">
                          {row.location}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 font-sans text-slate-700">
                          {row.itemIdentifier}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 text-slate-800 font-semibold">
                          {row.measuredValue}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 font-sans text-slate-500">
                          {row.standardSpec}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                          {row.status === 'PASS' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              PASS
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              FAIL
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => handleOpenDateInEntry(row.date, row.sectionKey)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredFlatRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-sans">
                          No ESD database records match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLE 2: DAILY ESD REPORT SUMMARY DATABASE */}
            {dbTableMode === 'daily' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f1f5f9] text-[#0d1730] uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">SL</th>
                      <th className="px-3 py-3 border-r border-slate-200">Audit Date</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Work Surface</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Ctrl Monitor</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Solder Iron</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Wristband</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">ESD Shoe</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Floor / Chair / Packaging</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Total Checked</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Pass / Fail</th>
                      <th className="px-3 py-3 border-r border-slate-200 text-center">Pass Rate</th>
                      <th className="px-3 py-3 border-r border-slate-200">Audit Remarks</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {dateSummaries.map((d, idx) => {
                      const epaMiscChecks =
                        d.bySection.epafloor.checks +
                        d.bySection.chair.checks +
                        d.bySection.trolley.checks +
                        d.bySection.traybox.checks +
                        d.bySection.apron.checks +
                        d.bySection.ionizer.checks;
                      const epaMiscPass =
                        d.bySection.epafloor.pass +
                        d.bySection.chair.pass +
                        d.bySection.trolley.pass +
                        d.bySection.traybox.pass +
                        d.bySection.apron.pass +
                        d.bySection.ionizer.pass;

                      return (
                        <tr key={d.date} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-3 py-3 border-r border-slate-100 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 font-bold text-[#182a52]">
                            {d.date}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            {d.bySection.worksurface.pass}/{d.bySection.worksurface.checks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            {d.bySection.contmonitor.pass}/{d.bySection.contmonitor.checks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            {d.bySection.iron.pass}/{d.bySection.iron.checks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            {d.bySection.wristband.pass}/{d.bySection.wristband.checks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            {d.bySection.shoe.pass}/{d.bySection.shoe.checks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            {epaMiscPass}/{epaMiscChecks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center font-bold text-slate-800">
                            {d.totalChecks}
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            <span className="text-emerald-700 font-bold">{d.totalPasses}P</span>
                            {' / '}
                            <span className={d.totalFails > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                              {d.totalFails}F
                            </span>
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                d.passRate >= 98
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {d.passRate}%
                            </span>
                          </td>
                          <td className="px-3 py-3 border-r border-slate-100 font-sans text-slate-600 max-w-xs truncate">
                            {d.remarks}
                          </td>
                          <td className="px-3 py-3 text-center font-sans">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenDateInEntry(d.date)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Open / Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDatabaseDate(d.date)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                                title="Delete Date Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* VIEW MODE 2: ESD QC REPORT ENTRY (11 CONTROL SECTIONS)                            */}
      {/* ================================================================================= */}
      {viewMode === 'entry' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sub-Navigation Tabs */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-xs border border-slate-200 p-2.5 space-y-1 print:hidden">
          <div className="group px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#eff6ff] via-[#e0f2fe] to-[#f0f9ff] hover:from-[#172554] hover:via-[#1e3a8a] hover:to-[#1d4ed8] border border-blue-200/90 hover:border-blue-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 mb-2 transition-all duration-300 cursor-pointer">
            <Zap className="w-4 h-4 text-red-500 group-hover:text-amber-300 group-hover:scale-110 transition-all duration-300 shrink-0" />
            <span className="text-[#1e3a8a] group-hover:text-white font-extrabold tracking-wider transition-colors duration-300">
              ESD Control Sections
            </span>
          </div>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="lg:col-span-9 space-y-6">
          {/* ========================================================================= */}
          {/* 1. ESD Work Surface                                                       */}
          {/* ========================================================================= */}
          {activeTab === 'worksurface' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>⚡ Control Item: ESD Work Surface / Table Matts</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড (R<sub>TG</sub>): 10⁶ ≤ R &lt; 10⁹ Ω &nbsp;|&nbsp; Standard Point-to-Ground Resistance
                  </p>
                </div>
                <button
                  onClick={addWorksurfaceRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ পয়েন্ট যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Value (Ω)</th>
                      <th className="px-4 py-3">Parsed Resistance</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {state.worksurface.map((row, idx) => {
                      const val = parseR(row.value);
                      const hasVal = row.value.trim() !== '';
                      const isPass = hasVal && val !== null && val >= 1e6 && val < 1e9;
                      const isFail = hasVal && !isPass;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5">
                            <select
                              value={row.loc}
                              onChange={(e) => updateWorksurface(idx, 'loc', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 outline-hidden font-sans"
                            >
                              {DEFAULT_LOCS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              placeholder="যেমন 2.4*10^7"
                              value={row.value}
                              onChange={(e) => updateWorksurface(idx, 'value', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {val !== null ? fmtR(val) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasVal ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeWorksurfaceRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. Control Monitor                                                        */}
          {/* ========================================================================= */}
          {activeTab === 'contmonitor' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>📡 Control Item: Continuous Wriststrap Monitor</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  স্ট্যান্ডার্ড: Standard calibration process — সব জোনে নিয়মিত সেন্সর মনিটর টেস্ট
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Total Check</th>
                      <th className="px-4 py-3">Total Fail</th>
                      <th className="px-4 py-3 text-center">Total Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {CONTINUOUS_MONITOR_ZONES.map((zone) => {
                      const d = state.contmonitor[zone] || { check: '', fail: '' };
                      const chk = parseInt(d.check, 10) || 0;
                      const fail = parseInt(d.fail, 10) || 0;
                      const pass = d.check !== '' ? Math.max(chk - fail, 0) : '';

                      return (
                        <tr key={zone} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans font-medium text-slate-800">{zone}</td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={d.check}
                              onChange={(e) => updateZoneCount('contmonitor', zone, 'check', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={d.fail}
                              onChange={(e) => updateZoneCount('contmonitor', zone, 'fail', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center font-bold text-emerald-700">
                            {pass !== '' ? pass : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. Soldering Iron                                                         */}
          {/* ========================================================================= */}
          {activeTab === 'iron' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🔥 Control Item: Soldering Iron</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড: Leakage voltage &lt; 2V &nbsp;|&nbsp; Tip to ground resistance &lt; 10 Ω
                  </p>
                </div>
                <button
                  onClick={addIronRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ স্যাম্পল যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Voltage (V)</th>
                      <th className="px-4 py-3">Resistance (Ω)</th>
                      <th className="px-4 py-3">Table TG</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {state.iron.map((row, idx) => {
                      const v = parseFloat(row.voltage);
                      const res = parseFloat(row.resistance);
                      const hasData = row.voltage !== '' && row.resistance !== '';
                      const isPass = hasData && v < 2 && res < 10;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 text-slate-500 font-bold">{row.n}</td>
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.zone}
                              onChange={(e) => updateIron(idx, 'zone', e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                            >
                              <option value="Testing Line">Testing Line</option>
                              <option value="Repair Zone">Repair Zone</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="< 2V"
                              value={row.voltage}
                              onChange={(e) => updateIron(idx, 'voltage', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="< 10Ω"
                              value={row.resistance}
                              onChange={(e) => updateIron(idx, 'resistance', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={row.tg}
                              onChange={(e) => updateIron(idx, 'tg', e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasData ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeIronRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. Ionizer                                                                */}
          {/* ========================================================================= */}
          {activeTab === 'ionizer' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>💨 Control Item: Ionized Air Blower</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড: Voltage decay time Td (±1000V to ±100V) &lt; 5 sec
                  </p>
                </div>
                <button
                  onClick={addIonizerRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ স্যাম্পল যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Testing Line (s)</th>
                      <th className="px-4 py-3">Repair Zone (s)</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {state.ionizer.map((row, idx) => {
                      const t1 = parseFloat(row.testline);
                      const t2 = parseFloat(row.repairzone);
                      const hasData = row.testline !== '' || row.repairzone !== '';
                      let ok = true;
                      if (row.testline !== '') ok = ok && t1 < 5;
                      if (row.repairzone !== '') ok = ok && t2 < 5;
                      const isPass = hasData && ok;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 text-slate-500 font-bold">{row.n}</td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="< 5s"
                              value={row.testline}
                              onChange={(e) => updateIonizer(idx, 'testline', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="< 5s"
                              value={row.repairzone}
                              onChange={(e) => updateIonizer(idx, 'repairzone', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasData ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeIonizerRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. ESD Wristband                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'wristband' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>⌚ Control Item: ESD Wristband</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Green LED: Pass, Red LED: Fail — Ring tester দিয়ে টেস্ট
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Total Check</th>
                      <th className="px-4 py-3">Total Fail</th>
                      <th className="px-4 py-3 text-center">Total Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {PERSONNEL_ZONES.map((zone) => {
                      const d = state.wristband[zone] || { check: '', fail: '' };
                      const chk = parseInt(d.check, 10) || 0;
                      const fail = parseInt(d.fail, 10) || 0;
                      const pass = d.check !== '' ? Math.max(chk - fail, 0) : '';

                      return (
                        <tr key={zone} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans font-medium text-slate-800">{zone}</td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={d.check}
                              onChange={(e) => updateZoneCount('wristband', zone, 'check', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={d.fail}
                              onChange={(e) => updateZoneCount('wristband', zone, 'fail', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center font-bold text-emerald-700">
                            {pass !== '' ? pass : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  মন্তব্য (Remarks):
                </label>
                <textarea
                  rows={2}
                  value={state.remarks.wristband}
                  onChange={(e) => updateRemarks('wristband', e.target.value)}
                  placeholder="যেমন: সব রিং টেস্ট পাস হয়েছে..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. ESD Shoe / Slipper                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'shoe' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>👟 Control Item: ESD Shoe / Slipper</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Green LED: Pass, Red LED: Fail — Shoe tester দিয়ে টেস্ট
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Total Check</th>
                      <th className="px-4 py-3">Total Fail</th>
                      <th className="px-4 py-3 text-center">Total Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {PERSONNEL_ZONES.map((zone) => {
                      const d = state.shoe[zone] || { check: '', fail: '' };
                      const chk = parseInt(d.check, 10) || 0;
                      const fail = parseInt(d.fail, 10) || 0;
                      const pass = d.check !== '' ? Math.max(chk - fail, 0) : '';

                      return (
                        <tr key={zone} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans font-medium text-slate-800">{zone}</td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={d.check}
                              onChange={(e) => updateZoneCount('shoe', zone, 'check', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={d.fail}
                              onChange={(e) => updateZoneCount('shoe', zone, 'fail', e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center font-bold text-emerald-700">
                            {pass !== '' ? pass : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  মন্তব্য (Remarks):
                </label>
                <textarea
                  rows={2}
                  value={state.remarks.shoe}
                  onChange={(e) => updateRemarks('shoe', e.target.value)}
                  placeholder="যেমন: সব কর্মী পরিচ্ছন্ন জুতো ও স্ট্র্যাপ ব্যবহার করছেন..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. ESD Apron                                                              */}
          {/* ========================================================================= */}
          {activeTab === 'apron' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🥼 Control Item: ESD Apron</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড: R<sub>ss</sub> &lt; 10¹¹ Ω &nbsp;|&nbsp; স্যাম্পলিং: প্রতি কালারের জন্য ৫টি স্যাম্পল
                  </p>
                </div>
                <button
                  onClick={addApronRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ স্যাম্পল যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Sample</th>
                      <th className="px-4 py-3">Color</th>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Value (Ω)</th>
                      <th className="px-4 py-3">Parsed Resistance</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {state.apron.map((row, idx) => {
                      const val = parseR(row.value);
                      const hasVal = row.value.trim() !== '';
                      const isPass = hasVal && val !== null && val < 1e11;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => updateApron(idx, 'name', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.color}
                              onChange={(e) => updateApron(idx, 'color', e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                            >
                              {APRON_COLORS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <input
                              type="text"
                              value={row.id}
                              onChange={(e) => updateApron(idx, 'id', e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              placeholder="যেমন 4.3*10^9"
                              value={row.value}
                              onChange={(e) => updateApron(idx, 'value', e.target.value)}
                              className="w-32 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {val !== null ? fmtR(val) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasVal ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeApronRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. EPA Floor                                                              */}
          {/* ========================================================================= */}
          {activeTab === 'epafloor' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🏢 Control Item: EPA Floor</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড (R<sub>TG</sub>): 10⁵ ≤ R &lt; 10⁹ Ω &nbsp;|&nbsp; EPA Conductive / Dissipative Flooring Resistance to Ground
                  </p>
                </div>
                <button
                  onClick={addEpaFloorRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ পয়েন্ট যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Point ID</th>
                      <th className="px-4 py-3">Location / Zone</th>
                      <th className="px-4 py-3">Value (Ω)</th>
                      <th className="px-4 py-3">Parsed Resistance</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {(state.epafloor || []).map((row, idx) => {
                      const val = parseR(row.value);
                      const hasVal = row.value.trim() !== '';
                      const isPass = hasVal && val !== null && val >= 1e5 && vCheckFloor(val);

                      function vCheckFloor(n: number) {
                        return n < 1e9;
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans">
                            <input
                              type="text"
                              value={row.pointId}
                              onChange={(e) => updateEpaFloor(idx, 'pointId', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.loc}
                              onChange={(e) => updateEpaFloor(idx, 'loc', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 outline-hidden"
                            >
                              {DEFAULT_LOCS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              placeholder="যেমন 3.5*10^6"
                              value={row.value}
                              onChange={(e) => updateEpaFloor(idx, 'value', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {val !== null ? fmtR(val) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasVal ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeEpaFloorRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. ESD chair                                                              */}
          {/* ========================================================================= */}
          {activeTab === 'chair' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🪑 Control Item: ESD chair</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড (R<sub>TG</sub>): R &lt; 10⁹ Ω &nbsp;|&nbsp; Seating Resistance to Ground (ANSI/ESD STM12.1)
                  </p>
                </div>
                <button
                  onClick={addChairRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ চেয়ার যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Chair ID</th>
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Value (Ω)</th>
                      <th className="px-4 py-3">Parsed Resistance</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {(state.chair || []).map((row, idx) => {
                      const val = parseR(row.value);
                      const hasVal = row.value.trim() !== '';
                      const isPass = hasVal && val !== null && val < 1e9;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans">
                            <input
                              type="text"
                              value={row.chairId}
                              onChange={(e) => updateChair(idx, 'chairId', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.zone}
                              onChange={(e) => updateChair(idx, 'zone', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 outline-hidden"
                            >
                              {DEFAULT_LOCS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              placeholder="যেমন 1.9*10^7"
                              value={row.value}
                              onChange={(e) => updateChair(idx, 'value', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {val !== null ? fmtR(val) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasVal ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeChairRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. Transport trolley                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'trolley' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🛒 Control Item: Transport trolley</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড (R<sub>TG</sub>): R &lt; 10⁹ Ω &nbsp;|&nbsp; Mobile Equipment Shelf-to-Wheel Grounding Resistance
                  </p>
                </div>
                <button
                  onClick={addTrolleyRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ট্রলি যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Trolley ID</th>
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Value (Ω)</th>
                      <th className="px-4 py-3">Parsed Resistance</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {(state.trolley || []).map((row, idx) => {
                      const val = parseR(row.value);
                      const hasVal = row.value.trim() !== '';
                      const isPass = hasVal && val !== null && val < 1e9;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans">
                            <input
                              type="text"
                              value={row.trolleyId}
                              onChange={(e) => updateTrolley(idx, 'trolleyId', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.zone}
                              onChange={(e) => updateTrolley(idx, 'zone', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 outline-hidden"
                            >
                              {DEFAULT_LOCS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              placeholder="যেমন 4.6*10^6"
                              value={row.value}
                              onChange={(e) => updateTrolley(idx, 'value', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {val !== null ? fmtR(val) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasVal ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeTrolleyRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 11. ESD tray and box                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'traybox' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>📦 Control Item: ESD tray and box</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    স্ট্যান্ডার্ড (R<sub>ss</sub>): 10⁴ ≤ R &lt; 10¹¹ Ω &nbsp;|&nbsp; ESD Protective Packaging, Trays &amp; Component Boxes
                  </p>
                </div>
                <button
                  onClick={addTrayBoxRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ স্যাম্পল যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                      <th className="px-4 py-3">Item Type</th>
                      <th className="px-4 py-3">Sample ID</th>
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">Value (Ω)</th>
                      <th className="px-4 py-3">Parsed Resistance</th>
                      <th className="px-4 py-3 text-center">Result</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {(state.traybox || []).map((row, idx) => {
                      const val = parseR(row.value);
                      const hasVal = row.value.trim() !== '';
                      const isPass = hasVal && val !== null && val >= 1e4 && val < 1e11;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.itemType}
                              onChange={(e) => updateTrayBox(idx, 'itemType', e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                            >
                              <option value="ESD Tray">ESD Tray</option>
                              <option value="ESD Box">ESD Box</option>
                              <option value="Magazine Rack">Magazine Rack</option>
                              <option value="Component Bin">Component Bin</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <input
                              type="text"
                              value={row.sampleId}
                              onChange={(e) => updateTrayBox(idx, 'sampleId', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-sans">
                            <select
                              value={row.zone}
                              onChange={(e) => updateTrayBox(idx, 'zone', e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                            >
                              {DEFAULT_LOCS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              placeholder="যেমন 6.4*10^7"
                              value={row.value}
                              onChange={(e) => updateTrayBox(idx, 'value', e.target.value)}
                              className="w-32 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {val !== null ? fmtR(val) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {hasVal ? (
                              isPass ? (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  FAIL
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => removeTrayBoxRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
