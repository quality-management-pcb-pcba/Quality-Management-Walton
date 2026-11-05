/**
 * =========================================================================================
 * @file src/components/views/MdSirReportView.tsx
 * @component MdSirReportView
 * @description Executive Monthly Quality Report for MD Sir (PCB & PCBA: SMT, MI, Trends & Actions)
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Implements the executive Monthly Quality Report specifically tailored for Walton MD Sir:
 * - Summary: Executive KPI scorecards, Fault % by Product matrix, Top 3 Quality Problems.
 * - PCB: Bare board fabrication defect tracking, yields, monthly audit trend.
 * - PCBA: Integrated SMT & MI assembly line quality benchmarks.
 * - SMT: Surface mount technology inspected vs fault rates, yields and monthly trends.
 * - MI: Manual insertion soldering workmanship, component assembly failure monitoring.
 * - Trend: 6-Month historical quality trend lines with ANSI/IPC target benchmarks and Top 5 Pareto.
 * - Action: RCA Corrective Action Plan tracker with functional owners, due dates, and closure status.
 * - Data: Interactive data entry table supporting live checked/fault inputs, month creation, and demo restore.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileSpreadsheet,
  Award,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  Cpu,
  Activity,
  Plus,
  Trash2,
  RotateCcw,
  Printer,
  Download,
  Filter,
  Check,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Save,
  Search,
} from 'lucide-react';
import { PageId } from '../../types';

export type MdReportTabKey =
  | 'summary'
  | 'pcb'
  | 'pcba'
  | 'smt'
  | 'mi'
  | 'trend'
  | 'action'
  | 'data';

interface MdSirReportViewProps {
  initialTab?: MdReportTabKey;
  onNavigate?: (page: PageId) => void;
}

// -----------------------------------------------------------------------------------------
// Core Specifications & Factory Targets
// -----------------------------------------------------------------------------------------
export const TARGETS = {
  PCB: 2.5,
  SMT: 1.0,
  MI: 0.2,
  PCBA: 1.2,
};

export const DEFAULT_PRODUCT_LIST = [
  'Mobile',
  'Fridge',
  'LED light',
  'Fan',
  'TV',
  'AC',
  'Switch socket',
  'External',
  'Local Fan',
  'Charger',
  'Remote',
  'Adapter',
  'Rice Cooker',
  "Toy's",
  'LED light(Computer)',
];

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type SectionKey = 'PCB' | 'SMT' | 'MI';

export interface ActionPlanItem {
  problem: string;
  action: string;
  owner: string;
  due: string;
  status: 'Open' | 'Closed';
}

export type MonthSectionData = Record<string, Record<string, [number | string, number | string]>>;

export interface MdReportState {
  pl: string[];
  m: Record<string, MonthSectionData>;
  a: ActionPlanItem[];
}

const STORAGE_KEY = 'qm_report_v2';

function formatMonthLabel(key: string): string {
  if (!key || key.length < 7) return key;
  const mIndex = parseInt(key.slice(5), 10) - 1;
  const year = key.slice(0, 4);
  return `${MONTH_NAMES[mIndex] || key.slice(5)} ${year}`;
}

const DEMO_DATA: MdReportState = {
  pl: [
    'Mobile',
    'Fridge',
    'LED light',
    'Fan',
    'TV',
    'AC',
    'Switch socket',
    'External',
    'Local Fan',
    'Charger',
    'Remote',
    'Adapter',
    'Rice Cooker',
    "Toy's",
    'LED light(Computer)',
  ],
  m: {
    '2026-05': {
      SMT: {
        Fridge: [88734, 447],
        'LED light': [133864, 1162],
        Fan: [2280, 95],
        TV: [496, 36],
        'Local Fan': [816, 46],
      },
      MI: {
        Charger: [4700, 282],
      },
    },
    '2026-06': {
      SMT: {
        Mobile: [90046, 1525],
        Fridge: [318117, 1258],
        'LED light': [475408, 1825],
        Fan: [9828, 602],
        TV: [1212, 561],
        Charger: [41572, 54],
        AC: [1446, 697],
        Remote: [736, 32],
      },
      MI: {
        Fridge: [166091, 1669],
        'LED light': [82643, 909],
        Fan: [6106, 18],
        TV: [1496, 126],
        AC: [5393, 242],
        Adapter: [31313, 1395],
        Charger: [47374, 3012],
        'Rice Cooker': [13403, 32],
      },
    },
    '2026-07': {
      PCB: {
        Fridge: [314260, 13064],
        'LED light': [61582, 3726],
        Fan: [757, 3],
        Mobile: [56202, 2053],
        TV: [8956, 310],
        'Switch socket': [233562, 4291],
        External: [161705, 772],
      },
      SMT: {
        Mobile: [43120, 1171],
        Fridge: [187862, 954],
        'LED light': [492692, 4370],
        Fan: [28845, 387],
        TV: [510, 468],
        Charger: [6912, 20],
        Remote: [444, 68],
        AC: [4194, 415],
        "Toy's": [56397, 226],
      },
      MI: {
        Fridge: [98492, 54],
        'LED light': [108829, ''],
        TV: [118, ''],
        AC: [2509, ''],
        Adapter: [39143, ''],
        Charger: [7800, 330],
        'Rice Cooker': [23603, ''],
        "Toy's": [44534, 6229],
      },
    },
    '2026-08': {
      PCB: {
        Fridge: [409258, 23090],
        'LED light': [30516, 3495],
        Fan: [792, 19],
        'Switch socket': [267104, 7398],
        External: [110029, 3186],
      },
      SMT: {
        Mobile: [39829, 766],
        Fridge: [283672, 4715],
        'LED light': [579643, 3967],
        Fan: [28936, 1056],
        TV: [397, 0],
        AC: [1191, 196],
        Charger: [35786, 139],
        Remote: [143, 0],
        External: [64413, 236],
      },
      MI: {
        Fridge: [87331, 3300],
        'LED light': [79770, 4508],
        TV: [785, 188],
        AC: [8544, 1494],
        Adapter: [16668, 1390],
        Charger: [15101, 2398],
        'Rice Cooker': [30873, 233],
        "Toy's": [49010, 4727],
      },
    },
    '2026-09': {
      PCB: {
        Mobile: [44361, 1896],
        Fridge: [214407, 9221],
        'LED light': [171818, 8932],
        TV: [15300, 8],
        'Switch socket': [473561, 21471],
        External: [253093, 3085],
      },
      SMT: {
        Mobile: [19838, 291],
        Fridge: [316262, 1673],
        'LED light': [572116, 6818],
        Fan: [46464, 1093],
        TV: [56, 0],
        AC: [14244, 476],
        "Toy's": [56885, 21],
      },
      MI: {
        Fridge: [91693, 1335],
        'LED light': [149275, 3805],
        AC: [11215, 1272],
        Adapter: [56060, 3667],
        Charger: [20562, 2105],
        'Rice Cooker': [11718, 159],
        "Toy's": [86092, 5535],
      },
    },
    '2026-10': {
      PCB: {
        Fridge: [90580, 6168],
        'LED light': [39811, 2469],
        Fan: [2074, 149],
        'Switch socket': [256078, 6007],
        External: [55774, 1643],
      },
      SMT: {
        Mobile: [7205, 288],
        Fridge: [180875, 994],
        'LED light': [493886, 4291],
        'LED light(Computer)': [108, 0],
        Fan: [73173, 935],
        AC: [2742, 1436],
        Charger: [40252, 153],
        "Toy's": [72609, 88],
      },
      MI: {
        Charger: [15026, 746],
        "Toy's": [82164, 4974],
      },
    },
  },
  a: [
    {
      problem: 'Fridge Missing component',
      action: 'Feeder nozzle cleaning',
      owner: 'SMT',
      due: '12 Nov',
      status: 'Open',
    },
    {
      problem: 'TV Tombstone',
      action: 'Reflow profile change',
      owner: 'Process',
      due: '08 Nov',
      status: 'Open',
    },
    {
      problem: 'AC Solder bridge',
      action: 'Stencil aperture review',
      owner: 'SMT',
      due: '15 Nov',
      status: 'Open',
    },
    {
      problem: 'Cold joint (MI)',
      action: 'Solder pot temp monitoring',
      owner: 'MI',
      due: '05 Nov',
      status: 'Closed',
    },
  ],
};

function generateDemoData(): MdReportState {
  return JSON.parse(JSON.stringify(DEMO_DATA));
}

export const MdSirReportView: React.FC<MdSirReportViewProps> = ({
  initialTab = 'summary',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<MdReportTabKey>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load state from localStorage or demo generator
  const [state, setState] = useState<MdReportState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.m && parsed.a) {
          // Normalize action items if from older array format
          const normA: ActionPlanItem[] = parsed.a.map((item: any) => {
            if (Array.isArray(item)) {
              return {
                problem: item[0] || '',
                action: item[1] || '',
                owner: item[2] || '',
                due: item[3] || '',
                status: item[4] === 'Closed' ? 'Closed' : 'Open',
              };
            }
            return item;
          });
          return { m: parsed.m, a: normA };
        }
      }
    } catch (e) {
      console.warn('Could not load MD report from storage:', e);
    }
    return generateDemoData();
  });

  const monthKeys = useMemo(() => {
    return Object.keys(state.m).sort();
  }, [state.m]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const keys = Object.keys(state.m).sort();
    return keys[keys.length - 1] || '2026-10';
  });

  // Keep selectedMonth valid when monthKeys change
  useEffect(() => {
    if (!monthKeys.includes(selectedMonth) && monthKeys.length > 0) {
      setSelectedMonth(monthKeys[monthKeys.length - 1]);
    }
  }, [monthKeys, selectedMonth]);

  // Product list (using user-stored list or default 15 products)
  const productList = useMemo(() => {
    return state.pl && state.pl.length > 0 ? state.pl : DEFAULT_PRODUCT_LIST;
  }, [state.pl]);

  // Product addition input in Data tab
  const [newProductInput, setNewProductInput] = useState<string>('');
  // New month input in Data tab
  const [newMonthInput, setNewMonthInput] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Filter for Action items tab
  const [actionFilter, setActionFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [actionSearch, setActionSearch] = useState<string>('');

  // Save to localStorage
  const saveState = (next: MdReportState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleAddProduct = () => {
    const v = newProductInput.trim();
    if (!v) return;
    if (productList.includes(v)) {
      showToast('Product already exists.');
      return;
    }
    const nextPl = [...productList, v];
    const nextState: MdReportState = {
      ...state,
      pl: nextPl,
    };
    saveState(nextState);
    setNewProductInput('');
    showToast(`Added product "${v}" successfully!`);
  };

  // ---------------------------------------------------------------------------------------
  // Computations & Analytics
  // ---------------------------------------------------------------------------------------
  const currentMonthData = state.m[selectedMonth] || { PCB: {}, SMT: {}, MI: {} };

  // Previous month key for delta calculations
  const prevMonthKey = useMemo(() => {
    const idx = monthKeys.indexOf(selectedMonth);
    return idx > 0 ? monthKeys[idx - 1] : null;
  }, [monthKeys, selectedMonth]);

  // Section totals for a given month
  const getSectionTotal = (sec: SectionKey, mKey: string) => {
    const d = state.m[mKey]?.[sec] || {};
    let checked = 0;
    let fault = 0;
    productList.forEach((p) => {
      const v = d[p];
      if (v) {
        checked += Number(v[0]) || 0;
        fault += Number(v[1]) || 0;
      }
    });
    const faultRate = checked > 0 ? (fault / checked) * 100 : null;
    return { checked, fault, faultRate };
  };

  // KPI Scorecards
  const kpis = useMemo(() => {
    const pcbCur = getSectionTotal('PCB', selectedMonth);
    const pcbPrev = prevMonthKey ? getSectionTotal('PCB', prevMonthKey) : null;

    const smtCur = getSectionTotal('SMT', selectedMonth);
    const smtPrev = prevMonthKey ? getSectionTotal('SMT', prevMonthKey) : null;

    const miCur = getSectionTotal('MI', selectedMonth);
    const miPrev = prevMonthKey ? getSectionTotal('MI', prevMonthKey) : null;

    // Combined PCBA (SMT + MI)
    const pcbaChecked = smtCur.checked + miCur.checked;
    const pcbaFault = smtCur.fault + miCur.fault;
    const pcbaRate = pcbaChecked > 0 ? (pcbaFault / pcbaChecked) * 100 : null;

    const openActions = state.a.filter((item) => item.status === 'Open').length;
    const closedActions = state.a.filter((item) => item.status === 'Closed').length;

    return {
      pcb: {
        cur: pcbCur.faultRate,
        prev: pcbPrev?.faultRate ?? null,
        target: TARGETS.PCB,
        checked: pcbCur.checked,
        fault: pcbCur.fault,
      },
      smt: {
        cur: smtCur.faultRate,
        prev: smtPrev?.faultRate ?? null,
        target: TARGETS.SMT,
        checked: smtCur.checked,
        fault: smtCur.fault,
      },
      mi: {
        cur: miCur.faultRate,
        prev: miPrev?.faultRate ?? null,
        target: TARGETS.MI,
        checked: miCur.checked,
        fault: miCur.fault,
      },
      pcba: {
        cur: pcbaRate,
        checked: pcbaChecked,
        fault: pcbaFault,
      },
      actions: {
        open: openActions,
        closed: closedActions,
        total: state.a.length,
      },
    };
  }, [state, selectedMonth, prevMonthKey, productList]);

  // Product Matrix Data (Fault % across products, active in selected month)
  const productMatrix = useMemo(() => {
    return productList
      .filter((prod) => {
        return (['PCB', 'SMT', 'MI'] as SectionKey[]).some((sec) => {
          const v = currentMonthData[sec]?.[prod];
          return v && v[0] !== '' && v[0] !== undefined && Number(v[0]) > 0;
        });
      })
      .map((prod) => {
        const pcb = currentMonthData.PCB?.[prod];
        const smt = currentMonthData.SMT?.[prod];
        const mi = currentMonthData.MI?.[prod];

        const pcbRate =
          pcb && pcb[0] !== '' && Number(pcb[0]) > 0
            ? (Number(pcb[1]) / Number(pcb[0])) * 100
            : null;
        const smtRate =
          smt && smt[0] !== '' && Number(smt[0]) > 0
            ? (Number(smt[1]) / Number(smt[0])) * 100
            : null;
        const miRate =
          mi && mi[0] !== '' && Number(mi[0]) > 0
            ? (Number(mi[1]) / Number(mi[0])) * 100
            : null;

        // Combined PCBA fault rate = (smtRate || 0) + (miRate || 0) matching HTML formula cb(p, k)
        const combinedRate =
          smtRate === null && miRate === null ? null : (smtRate || 0) + (miRate || 0);

        const pcbaChecked = (smt ? Number(smt[0]) || 0 : 0) + (mi ? Number(mi[0]) || 0 : 0);
        const pcbaFault = (smt ? Number(smt[1]) || 0 : 0) + (mi ? Number(mi[1]) || 0 : 0);
        const totalChecked = (pcb ? Number(pcb[0]) || 0 : 0) + pcbaChecked;
        const totalFault = (pcb ? Number(pcb[1]) || 0 : 0) + pcbaFault;

        return {
          product: prod,
          pcb: { checked: pcb ? Number(pcb[0]) || 0 : 0, fault: pcb ? Number(pcb[1]) || 0 : 0, rate: pcbRate },
          smt: { checked: smt ? Number(smt[0]) || 0 : 0, fault: smt ? Number(smt[1]) || 0 : 0, rate: smtRate },
          mi: { checked: mi ? Number(mi[0]) || 0 : 0, fault: mi ? Number(mi[1]) || 0 : 0, rate: miRate },
          pcba: { checked: pcbaChecked, fault: pcbaFault, rate: combinedRate },
          overall: { checked: totalChecked, fault: totalFault },
        };
      });
  }, [productList, currentMonthData]);

  // Top 3 Problems This Month (ranked by deviation from target)
  const topProblems = useMemo(() => {
    const list: Array<{
      product: string;
      section: SectionKey;
      sectionLabel: string;
      rate: number;
      target: number;
      ratio: number;
    }> = [];

    const secLabels: Record<SectionKey, string> = {
      PCB: 'PCB',
      SMT: 'PCBA – SMT',
      MI: 'PCBA – MI',
    };

    (['PCB', 'SMT', 'MI'] as SectionKey[]).forEach((sec) => {
      productList.forEach((prod) => {
        const item = currentMonthData[sec]?.[prod];
        if (item && item[0] !== '' && Number(item[0]) > 0) {
          const rate = (Number(item[1]) / Number(item[0])) * 100;
          const target = TARGETS[sec];
          list.push({
            product: prod,
            section: sec,
            sectionLabel: secLabels[sec],
            rate,
            target,
            ratio: rate / target,
          });
        }
      });
    });

    list.sort((a, b) => b.ratio - a.ratio);
    return list.slice(0, 3);
  }, [currentMonthData, productList]);

  // 6-Month Trend Data
  const trendHistory = useMemo(() => {
    const last6 = monthKeys.slice(-6);
    return last6.map((mKey) => {
      const pcb = getSectionTotal('PCB', mKey);
      const smt = getSectionTotal('SMT', mKey);
      const mi = getSectionTotal('MI', mKey);

      return {
        month: formatMonthLabel(mKey),
        rawMonth: mKey,
        pcb: pcb.faultRate !== null ? Number(pcb.faultRate.toFixed(2)) : null,
        pcbTarget: TARGETS.PCB,
        smt: smt.faultRate !== null ? Number(smt.faultRate.toFixed(2)) : null,
        smtTarget: TARGETS.SMT,
        mi: mi.faultRate !== null ? Number(mi.faultRate.toFixed(2)) : null,
        miTarget: TARGETS.MI,
      };
    });
  }, [monthKeys, state.m, productList]);

  // Pareto Top 5 Products (by total fault qty)
  const paretoData = useMemo(() => {
    const counts = productList.map((prod) => {
      let fault = 0;
      (['PCB', 'SMT', 'MI'] as SectionKey[]).forEach((sec) => {
        const item = currentMonthData[sec]?.[prod];
        if (item) fault += Number(item[1]) || 0;
      });
      return { product: prod, fault };
    });

    counts.sort((a, b) => b.fault - a.fault);
    const totalFaults = counts.reduce((acc, c) => acc + c.fault, 0);

    let cumulative = 0;
    return counts.slice(0, 5).map((c) => {
      cumulative += c.fault;
      const pct = totalFaults > 0 ? (cumulative / totalFaults) * 100 : 0;
      return {
        product: c.product,
        fault: c.fault,
        cumPct: Math.round(pct),
      };
    });
  }, [currentMonthData, productList]);

  // Status helper (matching original color logic)
  const getStatusBadge = (rate: number | null, target: number) => {
    if (rate === null) return <span className="text-slate-400 font-mono">—</span>;
    if (rate <= target) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
          {rate.toFixed(2)}%
        </span>
      );
    }
    if (rate <= target * 1.25) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
          {rate.toFixed(2)}%
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
        {rate.toFixed(2)}%
      </span>
    );
  };

  // ---------------------------------------------------------------------------------------
  // Data Mutation Handlers (Data Tab)
  // ---------------------------------------------------------------------------------------
  const handleDataCellChange = (
    sec: SectionKey,
    prod: string,
    idx: 0 | 1,
    val: string
  ) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setState((prev) => {
      const nextM = { ...prev.m };
      const nextMonthSec = { ...(nextM[selectedMonth] || { PCB: {}, SMT: {}, MI: {} }) };
      const nextSecData = { ...(nextMonthSec[sec] || {}) };
      const currentCell = nextSecData[prod] ? [...nextSecData[prod]] : ['', ''];
      currentCell[idx] = num;
      nextSecData[prod] = [currentCell[0], currentCell[1]];
      nextMonthSec[sec] = nextSecData;
      nextM[selectedMonth] = nextMonthSec;

      const nextState = { ...prev, m: nextM };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {}
      return nextState;
    });
  };

  const handleAddMonth = () => {
    if (!newMonthInput) return;
    if (state.m[newMonthInput]) {
      showToast('Month already exists in database.');
      return;
    }
    // Duplicate structure with 0s or base estimates
    const newMonthData: MonthSectionData = { PCB: {}, SMT: {}, MI: {} };
    (['PCB', 'SMT', 'MI'] as SectionKey[]).forEach((s) => {
      productList.forEach((p) => {
        newMonthData[s][p] = [0, 0];
      });
    });

    const nextState: MdReportState = {
      ...state,
      m: {
        ...state.m,
        [newMonthInput]: newMonthData,
      },
    };
    saveState(nextState);
    setSelectedMonth(newMonthInput);
    setNewMonthInput('');
    showToast(`Added ${formatMonthLabel(newMonthInput)} successfully!`);
  };

  const handleDeleteMonth = () => {
    if (monthKeys.length <= 1) {
      alert('Cannot delete the only remaining month in database.');
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete ${formatMonthLabel(selectedMonth)} report data?`
      )
    ) {
      const nextM = { ...state.m };
      delete nextM[selectedMonth];
      const remainingKeys = Object.keys(nextM).sort();
      const nextMonth = remainingKeys[remainingKeys.length - 1];
      const nextState: MdReportState = { ...state, m: nextM };
      saveState(nextState);
      setSelectedMonth(nextMonth);
      showToast(`Deleted ${formatMonthLabel(selectedMonth)} report.`);
    }
  };

  const handleRestoreDemo = () => {
    if (window.confirm('Restore factory demo datasets and action plans for MD Sir Report?')) {
      const demo = generateDemoData();
      saveState(demo);
      setSelectedMonth('2026-10');
      showToast('Factory demo datasets restored successfully!');
    }
  };

  const handleActionChange = (
    index: number,
    field: keyof ActionPlanItem,
    value: string
  ) => {
    const updated = [...state.a];
    updated[index] = { ...updated[index], [field]: value };
    saveState({ ...state, a: updated });
  };

  const handleAddAction = () => {
    const newItem: ActionPlanItem = {
      problem: '',
      action: '',
      owner: 'SMT',
      due: '15 Dec 2026',
      status: 'Open',
    };
    saveState({ ...state, a: [...state.a, newItem] });
    showToast('New action item added to plan.');
  };

  const handleDeleteAction = (index: number) => {
    const updated = state.a.filter((_, i) => i !== index);
    saveState({ ...state, a: updated });
  };

  const handleExportCSV = () => {
    const rows: string[][] = [
      ['Walton Digi-Tech Industries Ltd — Executive Monthly Quality Report'],
      [`Month: ${formatMonthLabel(selectedMonth)}`],
      [''],
      ['Section', 'Product', 'Checked Qty', 'Fault Qty', 'Fault %', 'Yield %', 'Target %'],
    ];

    (['PCB', 'SMT', 'MI'] as SectionKey[]).forEach((sec) => {
      productList.forEach((prod) => {
        const item = currentMonthData[sec]?.[prod];
        const c = item && item[0] !== '' ? Number(item[0]) || 0 : 0;
        const q = item && item[1] !== '' ? Number(item[1]) || 0 : 0;
        const rate = c > 0 ? ((q / c) * 100).toFixed(2) : '0.00';
        const y = c > 0 ? (100 - (q / c) * 100).toFixed(2) : '100.00';
        rows.push([sec, prod, String(c), String(q), `${rate}%`, `${y}%`, `${TARGETS[sec]}%`]);
      });
    });

    const csvContent = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Walton_MD_Sir_Report_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Filtered action items for Action tab
  const filteredActions = useMemo(() => {
    return state.a.filter((item) => {
      if (actionFilter !== 'All' && item.status !== actionFilter) return false;
      if (actionSearch.trim()) {
        const q = actionSearch.toLowerCase();
        const m =
          item.problem.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.due.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [state.a, actionFilter, actionSearch]);

  const TABS: Array<{ key: MdReportTabKey; label: string; icon: string }> = [
    { key: 'summary', label: 'Summary', icon: '📋' },
    { key: 'pcb', label: 'PCB', icon: '⚡' },
    { key: 'pcba', label: 'PCBA', icon: '📦' },
    { key: 'smt', label: 'SMT', icon: '⚙️' },
    { key: 'mi', label: 'MI', icon: '🔌' },
    { key: 'trend', label: 'Trend', icon: '📈' },
    { key: 'action', label: 'Action', icon: '🎯' },
    { key: 'data', label: 'Data', icon: '📝' },
  ];

  return (
    <div id="page-md-report" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#0d1730] border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Executive Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#e2e7f2] overflow-hidden print:border-none print:shadow-none">
        <div className="bg-gradient-to-r from-[#0d1730] via-[#182a52] to-[#0f1d3a] text-white px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0f6b62] text-white flex items-center justify-center shadow-md ring-2 ring-white/20 shrink-0">
              <Award className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Monthly Quality Report
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  MD Sir Report
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Walton Hi Tech Industries PLC · Quality Management – PCB &amp; PCBA
              </p>
            </div>
          </div>

          {/* Month Selector + Export Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <select
                id="select-md-report-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white font-bold text-xs sm:text-sm outline-hidden cursor-pointer"
              >
                {monthKeys.map((k) => (
                  <option key={k} value={k} className="bg-[#0d1730] text-white">
                    {formatMonthLabel(k)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
              title="Export Report CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f6b62] hover:bg-[#0c5750] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================================= */}
      {/* 4 Headline Executive KPI Scorecards                                              */}
      {/* ================================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: PCB Fault % */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              PCB
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PCB Fault %
            </span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#182a52] mt-2 text-center">
            {kpis.pcb.cur !== null ? `${kpis.pcb.cur.toFixed(2)}%` : '—'}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold mt-1 text-center">
            {kpis.pcb.cur !== null && kpis.pcb.prev !== null ? (
              kpis.pcb.cur <= kpis.pcb.prev ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {Math.abs(kpis.pcb.cur - kpis.pcb.prev).toFixed(2)}% vs prev
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{Math.abs(kpis.pcb.cur - kpis.pcb.prev).toFixed(2)}% vs prev
                </span>
              )
            ) : (
              <span className="text-slate-400">Baseline month</span>
            )}
            <span className="text-slate-400">· Target {kpis.pcb.target.toFixed(2)}%</span>
          </div>
        </div>

        {/* KPI 2: PCBA SMT Fault % */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              SMT
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PCBA – SMT Fault %
            </span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#0f6b62] mt-2 text-center">
            {kpis.smt.cur !== null ? `${kpis.smt.cur.toFixed(2)}%` : '—'}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold mt-1 text-center">
            {kpis.smt.cur !== null && kpis.smt.prev !== null ? (
              kpis.smt.cur <= kpis.smt.prev ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {Math.abs(kpis.smt.cur - kpis.smt.prev).toFixed(2)}% vs prev
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{Math.abs(kpis.smt.cur - kpis.smt.prev).toFixed(2)}% vs prev
                </span>
              )
            ) : (
              <span className="text-slate-400">Baseline month</span>
            )}
            <span className="text-slate-400">· Target {kpis.smt.target.toFixed(2)}%</span>
          </div>
        </div>

        {/* KPI 3: PCBA MI Fault % */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              MI
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PCBA – MI Fault %
            </span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#e35b2a] mt-2 text-center">
            {kpis.mi.cur !== null ? `${kpis.mi.cur.toFixed(2)}%` : '—'}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold mt-1 text-center">
            {kpis.mi.cur !== null && kpis.mi.prev !== null ? (
              kpis.mi.cur <= kpis.mi.prev ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {Math.abs(kpis.mi.cur - kpis.mi.prev).toFixed(2)}% vs prev
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{Math.abs(kpis.mi.cur - kpis.mi.prev).toFixed(2)}% vs prev
                </span>
              )
            ) : (
              <span className="text-slate-400">Baseline month</span>
            )}
            <span className="text-slate-400">· Target {kpis.mi.target.toFixed(2)}%</span>
          </div>
        </div>

        {/* KPI 4: Open Action Items */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              RCA
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Open Actions
            </span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#6366f1] mt-2 text-center">
            {kpis.actions.open}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1 text-center">
            {kpis.actions.closed} Closed · {kpis.actions.total} Total recorded
          </div>
        </div>
      </div>

      {/* ================================================================================= */}
      {/* TAB 1: SUMMARY TAB                                                                */}
      {/* ================================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Fault % by Product Matrix */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#0d1730]">
                  Fault % by Product · {formatMonthLabel(selectedMonth)}
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive cross-process fault rates comparing PCB, SMT, and MI operations
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  ≤ Target (Pass)
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  ≤ 1.25× Target
                </span>
                <span className="flex items-center gap-1 font-semibold text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  &gt; Target (Action)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold text-center">PCB Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">PCBA – SMT Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">PCBA – MI Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">Combined PCBA Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">Total Inspected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {productMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-medium">
                        No product data recorded for this month
                      </td>
                    </tr>
                  ) : (
                    productMatrix.map((r) => (
                      <tr key={r.product} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                          {r.product}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(r.pcb.rate, TARGETS.PCB)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(r.smt.rate, TARGETS.SMT)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(r.mi.rate, TARGETS.MI)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(r.pcba.rate, TARGETS.PCBA)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                          {r.overall.checked.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 3 Critical Problems This Month */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-[#0d1730]">
                  Top 3 Quality Problems This Month
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Ranked by deviation from departmental target
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topProblems.map((prob, idx) => (
                <div
                  key={`${prob.product}-${prob.section}`}
                  className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-rose-700 border border-rose-200">
                        {prob.sectionLabel}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-[#0d1730]">
                      {prob.product}
                    </div>
                    <div className="text-xs text-rose-700 font-semibold mt-1">
                      Reported Defect Rate: {prob.rate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-rose-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Target: {prob.target.toFixed(2)}%</span>
                    <span className="font-bold text-rose-800">
                      +{Math.max(0, prob.rate - prob.target).toFixed(2)}% over
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 2: PCB TAB                                                                    */}
      {/* ================================================================================= */}
      {activeTab === 'pcb' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0d1730]">
                  PCB by Product · {formatMonthLabel(selectedMonth)}
                </h2>
                <p className="text-xs text-slate-500">
                  Target Specification: ≤ {TARGETS.PCB.toFixed(2)}% Defect Rate
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold text-right">Checked Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Fault Qty</th>
                    <th className="py-3 px-4 font-bold text-center">Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">Yield %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(() => {
                    const activePcbProducts = productList.filter((prod) => {
                      const item = currentMonthData.PCB?.[prod];
                      return item && item[0] !== '' && item[0] !== undefined && Number(item[0]) > 0;
                    });
                    if (activePcbProducts.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-medium">
                            No data for this month
                          </td>
                        </tr>
                      );
                    }
                    return activePcbProducts.map((prod) => {
                      const item = currentMonthData.PCB?.[prod];
                      const c = item && item[0] !== '' ? Number(item[0]) || 0 : 0;
                      const q = item && item[1] !== '' ? Number(item[1]) || 0 : 0;
                      const rate = c > 0 ? (q / c) * 100 : null;
                      const y = rate !== null ? (100 - rate).toFixed(2) : '—';
                      return (
                        <tr key={prod} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{prod}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 text-right">
                            {c.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">
                            {q.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(rate, TARGETS.PCB)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-center">
                            {y !== '—' ? `${y}%` : '—'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trend Table for PCB */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2]">
              <h3 className="text-base font-bold text-[#0d1730]">PCB Historical Months Trend</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Month</th>
                    <th className="py-3 px-4 font-bold text-right">Checked Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Reject Qty</th>
                    <th className="py-3 px-4 font-bold text-center">Reject %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthKeys.map((k) => {
                    const t = getSectionTotal('PCB', k);
                    const isSelected = k === selectedMonth;
                    return (
                      <tr
                        key={k}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/60 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {formatMonthLabel(k)} {isSelected && '(Active)'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 text-right">
                          {t.checked.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">
                          {t.fault.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(t.faultRate, TARGETS.PCB)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 3: PCBA (COMBINED SMT + MI OVERVIEW)                                          */}
      {/* ================================================================================= */}
      {activeTab === 'pcba' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#0d1730]">
                  PCBA Assembly Overall Quality (SMT + MI) · {formatMonthLabel(selectedMonth)}
                </h2>
                <p className="text-xs text-slate-500">
                  Combined PCBA throughput, total defects, and composite assembly yield
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
                  Total Checked: {kpis.pcba.checked.toLocaleString()}
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs">
                  Composite Fault: {kpis.pcba.cur !== null ? `${kpis.pcba.cur.toFixed(2)}%` : '—'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold text-center">SMT Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">MI Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">Total PCBA Checked</th>
                    <th className="py-3 px-4 font-bold text-center">Total PCBA Faults</th>
                    <th className="py-3 px-4 font-bold text-center">Overall Assembly Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {productMatrix.map((r) => {
                    const y =
                      r.pcba.rate !== null ? (100 - r.pcba.rate).toFixed(2) : '100.00';
                    return (
                      <tr key={r.product} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                          {r.product}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(r.smt.rate, TARGETS.SMT)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(r.mi.rate, TARGETS.MI)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                          {r.pcba.checked.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-600">
                          {r.pcba.fault.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                          {y}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 4: SMT TAB                                                                    */}
      {/* ================================================================================= */}
      {activeTab === 'smt' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2]">
              <h2 className="text-base font-bold text-[#0d1730]">
                PCBA – SMT by Product · {formatMonthLabel(selectedMonth)}
              </h2>
              <p className="text-xs text-slate-500">
                Target Specification: ≤ {TARGETS.SMT.toFixed(2)}% Defect Rate
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold text-right">Checked Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Fault Qty</th>
                    <th className="py-3 px-4 font-bold text-center">Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">Yield %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(() => {
                    const activeSmtProducts = productList.filter((prod) => {
                      const item = currentMonthData.SMT?.[prod];
                      return item && item[0] !== '' && item[0] !== undefined && Number(item[0]) > 0;
                    });
                    if (activeSmtProducts.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-medium">
                            No data for this month
                          </td>
                        </tr>
                      );
                    }
                    return activeSmtProducts.map((prod) => {
                      const item = currentMonthData.SMT?.[prod];
                      const c = item && item[0] !== '' ? Number(item[0]) || 0 : 0;
                      const q = item && item[1] !== '' ? Number(item[1]) || 0 : 0;
                      const rate = c > 0 ? (q / c) * 100 : null;
                      const y = rate !== null ? (100 - rate).toFixed(2) : '—';
                      return (
                        <tr key={prod} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{prod}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 text-right">
                            {c.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">
                            {q.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(rate, TARGETS.SMT)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-center">
                            {y !== '—' ? `${y}%` : '—'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* SMT Monthly History */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2]">
              <h3 className="text-base font-bold text-[#0d1730]">
                PCBA – SMT Historical Months Trend
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Month</th>
                    <th className="py-3 px-4 font-bold text-right">Checked Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Reject Qty</th>
                    <th className="py-3 px-4 font-bold text-center">Reject %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthKeys.map((k) => {
                    const t = getSectionTotal('SMT', k);
                    const isSelected = k === selectedMonth;
                    return (
                      <tr
                        key={k}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/60 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {formatMonthLabel(k)} {isSelected && '(Active)'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 text-right">
                          {t.checked.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">
                          {t.fault.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(t.faultRate, TARGETS.SMT)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 5: MI TAB                                                                     */}
      {/* ================================================================================= */}
      {activeTab === 'mi' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2]">
              <h2 className="text-base font-bold text-[#0d1730]">
                PCBA – MI (Manual Insertion) by Product · {formatMonthLabel(selectedMonth)}
              </h2>
              <p className="text-xs text-slate-500">
                Target Specification: ≤ {TARGETS.MI.toFixed(2)}% Defect Rate
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold text-right">Checked Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Fault Qty</th>
                    <th className="py-3 px-4 font-bold text-center">Fault %</th>
                    <th className="py-3 px-4 font-bold text-center">Yield %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(() => {
                    const activeMiProducts = productList.filter((prod) => {
                      const item = currentMonthData.MI?.[prod];
                      return item && item[0] !== '' && item[0] !== undefined && Number(item[0]) > 0;
                    });
                    if (activeMiProducts.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-medium">
                            No data for this month
                          </td>
                        </tr>
                      );
                    }
                    return activeMiProducts.map((prod) => {
                      const item = currentMonthData.MI?.[prod];
                      const c = item && item[0] !== '' ? Number(item[0]) || 0 : 0;
                      const q = item && item[1] !== '' ? Number(item[1]) || 0 : 0;
                      const rate = c > 0 ? (q / c) * 100 : null;
                      const y = rate !== null ? (100 - rate).toFixed(2) : '—';
                      return (
                        <tr key={prod} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{prod}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 text-right">
                            {c.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">
                            {q.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(rate, TARGETS.MI)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-center">
                            {y !== '—' ? `${y}%` : '—'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* MI Monthly History */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2]">
              <h3 className="text-base font-bold text-[#0d1730]">
                PCBA – MI Historical Months Trend
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">Month</th>
                    <th className="py-3 px-4 font-bold text-right">Checked Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Reject Qty</th>
                    <th className="py-3 px-4 font-bold text-center">Reject %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthKeys.map((k) => {
                    const t = getSectionTotal('MI', k);
                    const isSelected = k === selectedMonth;
                    return (
                      <tr
                        key={k}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/60 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {formatMonthLabel(k)} {isSelected && '(Active)'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 text-right">
                          {t.checked.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600 text-right">
                          {t.fault.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(t.faultRate, TARGETS.MI)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 6: TREND TAB                                                                  */}
      {/* ================================================================================= */}
      {activeTab === 'trend' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* PCB Trend Card */}
            <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0d1730]">PCB Fault % Trend</h3>
                <p className="text-xs text-slate-500 mb-3">Target line: {TARGETS.PCB.toFixed(2)}%</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pcb"
                      name="PCB Fault %"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#2563eb' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pcbTarget"
                      name="Target"
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SMT Trend Card */}
            <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0d1730]">PCBA – SMT Fault % Trend</h3>
                <p className="text-xs text-slate-500 mb-3">Target line: {TARGETS.SMT.toFixed(2)}%</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="smt"
                      name="SMT Fault %"
                      stroke="#0f6b62"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0f6b62' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="smtTarget"
                      name="Target"
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MI Trend Card */}
            <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0d1730]">PCBA – MI Fault % Trend</h3>
                <p className="text-xs text-slate-500 mb-3">Target line: {TARGETS.MI.toFixed(2)}%</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="mi"
                      name="MI Fault %"
                      stroke="#e35b2a"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#e35b2a' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="miTarget"
                      name="Target"
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pareto Top 5 Products Bars */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#0d1730]">
                  Top 5 Products (Total Fault Qty Pareto)
                </h3>
                <p className="text-xs text-slate-500">
                  Cumulative distribution across all PCB &amp; PCBA manufacturing lines
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {paretoData.map((item, idx) => {
                const maxVal = paretoData[0]?.fault || 1;
                const widthPct = (item.fault / maxVal) * 100;
                return (
                  <div key={item.product} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>
                        #{idx + 1}. {item.product}
                      </span>
                      <span className="font-mono text-slate-600">
                        {item.fault.toLocaleString()} defects · {item.cumPct}% cumulative
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0f6b62] to-[#2563eb] h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 7: ACTION TAB (RCA & ACTION PLAN)                                             */}
      {/* ================================================================================= */}
      {activeTab === 'action' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0d1730]">RCA and Corrective Action Plan</h2>
                <p className="text-xs text-slate-500">
                  Root Cause Analysis &amp; 8D containment actions tracking for MD Sir review
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search problem, owner, action..."
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-hidden"
                  />
                </div>

                <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-300">
                  {(['All', 'Open', 'Closed'] as const).forEach((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActionFilter(f)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        actionFilter === f
                          ? 'bg-[#0f6b62] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddAction}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f6b62] hover:bg-[#0c5750] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Action</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#182a52] text-white">
                    <th className="py-3 px-4 font-bold">SL</th>
                    <th className="py-3 px-4 font-bold">Problem Statement</th>
                    <th className="py-3 px-4 font-bold">Corrective Action Plan</th>
                    <th className="py-3 px-4 font-bold">Owner / Dept</th>
                    <th className="py-3 px-4 font-bold">Target Due</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredActions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {item.problem || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.action || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 inline-block">
                          {item.owner}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.due}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus = item.status === 'Open' ? 'Closed' : 'Open';
                            handleActionChange(idx, 'status', newStatus);
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            item.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {item.status === 'Closed' ? (
                            <Check className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-700" />
                          )}
                          <span>{item.status}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredActions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No action plan records match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* TAB 8: DATA TAB (DATA ENTRY PORTAL)                                              */}
      {/* ================================================================================= */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Data Controls Card */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0d1730]">
                Monthly Quality Data Entry Portal
              </h3>
              <p className="text-xs text-slate-500">
                Updating {formatMonthLabel(selectedMonth)} inspected and defect counts in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="month"
                value={newMonthInput}
                onChange={(e) => setNewMonthInput(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddMonth}
                disabled={!newMonthInput}
                className="px-3.5 py-2 bg-[#0f6b62] hover:bg-[#0c5750] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Month</span>
              </button>

              <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                <input
                  type="text"
                  placeholder="New product name"
                  value={newProductInput}
                  onChange={(e) => setNewProductInput(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!newProductInput.trim()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDeleteMonth}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Month</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreDemo}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Demo</span>
              </button>
            </div>
          </div>

          {/* 3 Section Entry Tables: PCB, SMT, MI */}
          {(['PCB', 'SMT', 'MI'] as SectionKey[]).map((sec) => {
            const secTitle =
              sec === 'PCB' ? 'PCB Fabrication' : sec === 'SMT' ? 'PCBA – SMT' : 'PCBA – MI';
            return (
              <div
                key={sec}
                className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden"
              >
                <div className="px-5 py-3.5 bg-slate-50 border-b border-[#e2e7f2] flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0d1730]">
                    {secTitle} · {formatMonthLabel(selectedMonth)}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Standard Target: ≤ {TARGETS[sec].toFixed(2)}%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#182a52] text-white">
                        <th className="py-2.5 px-4 font-bold">Product</th>
                        <th className="py-2.5 px-4 font-bold text-right">Checked Qty</th>
                        <th className="py-2.5 px-4 font-bold text-right">Fault Qty</th>
                        <th className="py-2.5 px-4 font-bold text-center">Computed Fault %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {productList.map((prod) => {
                        const cell = currentMonthData[sec]?.[prod] || ['', ''];
                        const cVal = cell[0] !== undefined && cell[0] !== null ? cell[0] : '';
                        const qVal = cell[1] !== undefined && cell[1] !== null ? cell[1] : '';
                        const cNum = Number(cVal) || 0;
                        const qNum = Number(qVal) || 0;
                        const rate = cNum > 0 ? (qNum / cNum) * 100 : null;
                        return (
                          <tr key={prod} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-800">{prod}</td>
                            <td className="py-2.5 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                value={cVal}
                                onChange={(e) =>
                                  handleDataCellChange(sec, prod, 0, e.target.value)
                                }
                                className="w-32 px-2.5 py-1 text-right font-mono text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:border-[#0f6b62]"
                              />
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                value={qVal}
                                onChange={(e) =>
                                  handleDataCellChange(sec, prod, 1, e.target.value)
                                }
                                className="w-28 px-2.5 py-1 text-right font-mono text-xs font-bold text-rose-600 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:border-[#0f6b62]"
                              />
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              {getStatusBadge(rate, TARGETS[sec])}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Action Items Full Editor */}
          <div className="bg-white border border-[#e2e7f2] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-[#e2e7f2] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#0d1730]">Edit Action Plan Items</h4>
                <p className="text-xs text-slate-500">
                  Update root cause analysis records and execution statuses
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAction}
                className="px-3.5 py-1.5 bg-[#0f6b62] hover:bg-[#0c5750] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>

            <div className="p-4 overflow-x-auto space-y-3">
              {state.a.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center"
                >
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Problem Statement
                    </label>
                    <input
                      type="text"
                      value={item.problem}
                      onChange={(e) => handleActionChange(idx, 'problem', e.target.value)}
                      placeholder="e.g. Fridge Missing component"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Corrective Action
                    </label>
                    <input
                      type="text"
                      value={item.action}
                      onChange={(e) => handleActionChange(idx, 'action', e.target.value)}
                      placeholder="e.g. Feeder nozzle cleaning"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Owner
                    </label>
                    <input
                      type="text"
                      value={item.owner}
                      onChange={(e) => handleActionChange(idx, 'owner', e.target.value)}
                      placeholder="e.g. SMT"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Due
                    </label>
                    <input
                      type="text"
                      value={item.due}
                      onChange={(e) => handleActionChange(idx, 'due', e.target.value)}
                      placeholder="12 Nov"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Status
                    </label>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleActionChange(idx, 'status', e.target.value as 'Open' | 'Closed')
                      }
                      className="w-full px-1.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1 text-center pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteAction(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete action item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
