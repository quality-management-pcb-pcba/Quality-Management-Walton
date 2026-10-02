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
} from 'lucide-react';
import { db, doc, getDoc, setDoc } from '../../services/firebase';
import { getEsdRecordByDate, saveEsdRecordByDate } from '../../services/esdRecords';

interface EsdViewProps {
  onNavigate?: (page: PageId) => void;
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

export const EsdView: React.FC<EsdViewProps> = ({
  onNavigate,
  isLoggedIn = true,
  onOpenLoginModal,
}) => {
  const [reportDate, setReportDate] = useState<string>(todayStr());
  const [activeTab, setActiveTab] = useState<TabKey>('worksurface');
  const [state, setState] = useState<EsdState>(defaultState);
  const [savedChip, setSavedChip] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

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

    // 3. Fallback to default state for new date
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
      // 1. Save to local storage
      localStorage.setItem(storageKey(reportDate), JSON.stringify(state));

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

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-4">
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
                  ESD QC Report Entry
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Walton Hi Tech — PCBA ESD Monthly QC Inspection Log &amp; Calibration Record
              </p>
            </div>
          </div>

          {/* Date Picker Bar */}
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
        </div>

        {/* Action Toolbar & Metric Cards */}
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
      </div>

      {/* Main Tabbed Container */}
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
    </div>
  );
};
