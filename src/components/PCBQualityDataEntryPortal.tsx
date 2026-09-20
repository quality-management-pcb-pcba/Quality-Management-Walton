import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  X,
  Plus,
  Trash2,
  BarChart3,
  Layers,
  Cpu,
  CheckSquare,
  Database,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Search,
  Check,
  Filter,
  Microscope,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface PCBQualityDataEntryPortalProps {
  onClose: () => void;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// PCB FABRICATION STATION CONFIGURATIONS
export const PCB_STATION_CONFIGS: Record<
  string,
  {
    group: 'aoi' | 'etest' | 'fqc' | 'lab';
    label: string;
    shifts: string[];
    boardTypes: string[];
    faults: string[];
    operators: string[];
  }
> = {
  'PCB-AOI-01': {
    group: 'aoi',
    label: 'Bare Board AOI-01',
    shifts: ['Day', 'Evening', 'Morning', 'Night'],
    boardTypes: ['Single Sided FR-1', 'Double Sided FR-4', 'Multi-Layer 4L FR-4', 'Metal Core MCPCB'],
    faults: [
      'Open Circuit / Track Break',
      'Short Circuit / Copper Bridge',
      'Thin Track / Over-etch',
      'Copper Residue / Under-etch',
      'Hole Breakout / Misregistration',
      'Pad Missing / Damaged',
      'Pinhole in Track',
      'Spur / Protrusion',
      'Mouse Bite / Nick',
    ],
    operators: ['Md. Jahangir Alam (52109)', 'Tanvir Hossain (58210)', 'Kamrul Islam (54190)', 'Rashedul Hasan (49821)'],
  },
  'PCB-AOI-02': {
    group: 'aoi',
    label: 'Bare Board AOI-02',
    shifts: ['Day', 'Evening', 'Morning', 'Night'],
    boardTypes: ['Double Sided FR-4', 'Multi-Layer 4L FR-4', 'Multi-Layer 6L FR-4'],
    faults: [
      'Short Circuit / Copper Bridge',
      'Open Circuit / Track Break',
      'Thin Track / Over-etch',
      'Via Hole Breakout',
      'Copper Residue',
      'Annular Ring Violation',
      'Etch Void',
    ],
    operators: ['Aminul Islam (55401)', 'Saidur Rahman (53982)', 'Rakib Mia (61209)', 'Faruk Hossain (59218)'],
  },
  'PCB-ETEST-01': {
    group: 'etest',
    label: 'Flying Probe E-Test',
    shifts: ['Day', 'Morning', 'Evening', 'Night'],
    boardTypes: ['Multi-Layer 4L FR-4', 'Multi-Layer 6L FR-4', 'Double Sided FR-4'],
    faults: [
      'Net Open Fail',
      'Net Short Fail',
      'High Resistance Track',
      'Spark Discharge / Insulation Fail',
      '4-Wire Kelvin Milliohm Fail',
      'Buried Via Open',
    ],
    operators: ['Engr. Mehedi Hasan (47102)', 'Shofiqul Islam (49281)', 'Al-Amin (51829)'],
  },
  'PCB-ETEST-02': {
    group: 'etest',
    label: 'Universal Grid E-Test',
    shifts: ['Day', 'Evening', 'Morning', 'Night'],
    boardTypes: ['Single Sided FR-1', 'Double Sided FR-4', 'MCPCB LED'],
    faults: [
      'Universal Pin Open',
      'Universal Pin Short',
      'High Leakage Current',
      'Pin Contact Error',
      'Fixture Alignment Fail',
    ],
    operators: ['Mustafizur Rahman (44192)', 'Kawsar Ahmed (53102)', 'Sujon Kumar (48912)'],
  },
  'PCB-FQC-01': {
    group: 'fqc',
    label: 'FQC Visual & Dimensional',
    shifts: ['Day', 'Evening', 'Morning', 'Night'],
    boardTypes: ['Single Sided FR-1', 'Double Sided FR-4', 'Multi-Layer 4L FR-4', 'MCPCB LED'],
    faults: [
      'Solder Mask on Pad',
      'Solder Mask Blister / Peel',
      'Legend Misprint / Smudge',
      'Warpage / Board Bow & Twist',
      'Hole Blocked / Solder Mask in Hole',
      'V-Cut Depth Defect',
      'Routing Dimension Out of Spec',
      'Oxidation / Surface Tarnish',
      'Scratch on Surface / Track',
      'Delamination / Blister',
      'Burr on Edge',
    ],
    operators: ['Mst. Fatema Begum (38192)', 'Nasrin Akter (41029)', 'Sumon Chandra (45910)', 'Ripon Ali (52891)'],
  },
  'PCB-LAB-01': {
    group: 'lab',
    label: 'Wet Process Chemical Lab',
    shifts: ['Day', 'Night'],
    boardTypes: ['Double Sided FR-4', 'Multi-Layer 4L FR-4', 'Multi-Layer 6L FR-4'],
    faults: [
      'Copper Plating Hole Void (Cross-Section)',
      'Through-Hole Copper Thickness < 20um',
      'Surface Copper Thickness Out of Spec',
      'Etch Factor Under-spec',
      'Micro-Etch Rate Deviation',
      'Thermal Stress Delamination (288°C 10s)',
      'Ionic Contamination Test Fail',
    ],
    operators: ['QC Chemist - Mahmudul Hasan (39108)', 'Lab Specialist - Shariful Islam (42109)'],
  },
};

export interface PCBItemEntry {
  id: string;
  date: string;
  shift: string;
  station: string;
  boardType: string;
  model: string;
  layerCount: string;
  prodType: string;
  fault: string;
  qty: number;
  operator: string;
  remarks?: string;
  addedAt: string;
}

const SEED_PCB_ENTRIES: PCBItemEntry[] = [
  {
    id: 'pcb-seed-1',
    date: '2026-09-11',
    shift: 'Morning',
    station: 'PCB-AOI-01',
    boardType: 'Double Sided FR-4',
    model: 'WFB-FRIDGE-MAIN-V3.2',
    layerCount: '2-Layer',
    prodType: 'Mass Production',
    fault: 'Short Circuit / Copper Bridge',
    qty: 18,
    operator: 'Md. Jahangir Alam (52109)',
    remarks: 'Micro-short detected on connector fanout pitch 0.5mm',
    addedAt: '2026-09-11T08:15:00Z',
  },
  {
    id: 'pcb-seed-2',
    date: '2026-09-11',
    shift: 'Day',
    station: 'PCB-AOI-01',
    boardType: 'Double Sided FR-4',
    model: 'WAC-INVERTER-CONTROLLER',
    layerCount: '2-Layer',
    prodType: 'Mass Production',
    fault: 'Thin Track / Over-etch',
    qty: 12,
    operator: 'Tanvir Hossain (58210)',
    remarks: 'Acid etcher conveyor speed recalibrated (-5%)',
    addedAt: '2026-09-11T10:30:00Z',
  },
  {
    id: 'pcb-seed-3',
    date: '2026-09-10',
    shift: 'Day',
    station: 'PCB-FQC-01',
    boardType: 'Single Sided FR-1',
    model: 'WLED-9W-DRIVER-BOARD',
    layerCount: '1-Layer',
    prodType: 'Mass Production',
    fault: 'Solder Mask on Pad',
    qty: 25,
    operator: 'Mst. Fatema Begum (38192)',
    remarks: 'LPI screen alignment pins adjusted',
    addedAt: '2026-09-10T14:20:00Z',
  },
  {
    id: 'pcb-seed-4',
    date: '2026-09-10',
    shift: 'Evening',
    station: 'PCB-ETEST-01',
    boardType: 'Multi-Layer 4L FR-4',
    model: 'WTV-43-SMART-ANDROID-PCB',
    layerCount: '4-Layer',
    prodType: 'Mass Production',
    fault: 'Net Short Fail',
    qty: 9,
    operator: 'Engr. Mehedi Hasan (47102)',
    remarks: 'Inner layer 2 ground plane clearance checked',
    addedAt: '2026-09-10T19:00:00Z',
  },
  {
    id: 'pcb-seed-5',
    date: '2026-09-09',
    shift: 'Day',
    station: 'PCB-FQC-01',
    boardType: 'Double Sided FR-4',
    model: 'WCH-FAST-33W-POWER-PCB',
    layerCount: '2-Layer',
    prodType: 'Trial Production',
    fault: 'Warpage / Board Bow & Twist',
    qty: 14,
    operator: 'Nasrin Akter (41029)',
    remarks: 'Post-cure baking rack spacing standardized',
    addedAt: '2026-09-09T11:45:00Z',
  },
];

const COLORS = ['#20b6a4', '#8e5fc9', '#e0a83f', '#4f9ddb', '#e0483f', '#7c8798', '#4fae5f', '#e08a3f'];

export const PCBQualityDataEntryPortal: React.FC<PCBQualityDataEntryPortalProps> = ({ onClose }) => {
  // Main Navigation Category: 'aoi' | 'etest' | 'fqc' | 'lab' | 'db' | 'sop'
  const [activeCategory, setActiveCategory] = useState<'aoi' | 'etest' | 'fqc' | 'lab' | 'db'>('aoi');
  const [activeStationKey, setActiveStationKey] = useState<string>('PCB-AOI-01');

  // Sub Tab: 'entry' or 'dash'
  const [subTab, setSubTab] = useState<'entry' | 'dash'>('entry');

  // Period
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Search in table
  const [tableSearch, setTableSearch] = useState<string>('');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Stored state for PCB entries
  const [pcbEntries, setPcbEntries] = useState<Record<string, PCBItemEntry[]>>(() => {
    const saved = localStorage.getItem('pcb_fabrication_entries_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { 'PCB-AOI-01': SEED_PCB_ENTRIES };
      }
    }
    return { 'PCB-AOI-01': SEED_PCB_ENTRIES };
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pcb_fabrication_entries_db', JSON.stringify(pcbEntries));
  }, [pcbEntries]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const currentStationConfig = PCB_STATION_CONFIGS[activeStationKey] || PCB_STATION_CONFIGS['PCB-AOI-01'];

  // Form states
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formShift, setFormShift] = useState<string>('Day');
  const [formBoardType, setFormBoardType] = useState<string>('Double Sided FR-4');
  const [formModel, setFormModel] = useState<string>('');
  const [formLayerCount, setFormLayerCount] = useState<string>('2-Layer');
  const [formProdType, setFormProdType] = useState<string>('Mass Production');
  const [formFault, setFormFault] = useState<string>('');
  const [formQty, setFormQty] = useState<number>(1);
  const [formOperator, setFormOperator] = useState<string>('');
  const [formRemarks, setFormRemarks] = useState<string>('');

  // Update defaults when station changes
  useEffect(() => {
    if (currentStationConfig) {
      if (currentStationConfig.shifts?.length) setFormShift(currentStationConfig.shifts[0]);
      if (currentStationConfig.boardTypes?.length) setFormBoardType(currentStationConfig.boardTypes[0]);
      if (currentStationConfig.faults?.length) setFormFault(currentStationConfig.faults[0]);
      if (currentStationConfig.operators?.length) setFormOperator(currentStationConfig.operators[0]);
    }
  }, [activeStationKey]);

  // Handle Add Entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PCBItemEntry = {
      id: `pcb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: formDate,
      shift: formShift,
      station: activeStationKey,
      boardType: formBoardType,
      model: formModel.trim() || 'General PCB Panel',
      layerCount: formLayerCount,
      prodType: formProdType,
      fault: formFault || 'General Defect',
      qty: Number(formQty) || 1,
      operator: formOperator || 'PCB QC Specialist',
      remarks: formRemarks.trim(),
      addedAt: new Date().toISOString(),
    };

    const currentList = pcbEntries[activeStationKey] || [];
    setPcbEntries({
      ...pcbEntries,
      [activeStationKey]: [newEntry, ...currentList],
    });

    setFormQty(1);
    setFormRemarks('');
    showToast(`Logged ${newEntry.qty} pcs "${newEntry.fault}" on ${currentStationConfig.label}!`);
  };

  // Delete Entry
  const handleDeleteEntry = (id: string) => {
    const currentList = pcbEntries[activeStationKey] || [];
    setPcbEntries({
      ...pcbEntries,
      [activeStationKey]: currentList.filter((item) => item.id !== id),
    });
    showToast('PCB defect record removed.');
  };

  // CSV Export
  const exportCSV = () => {
    const list = pcbEntries[activeStationKey] || [];
    if (!list.length) {
      showToast('No entries to export for this station.');
      return;
    }
    const headers = [
      'Date',
      'Shift',
      'Station',
      'Board Type',
      'Model/Panel ID',
      'Layer Count',
      'Production Type',
      'Fault Type',
      'Quantity',
      'QC Inspector',
      'Remarks',
    ];
    const rows = list.map((e) => [
      e.date,
      e.shift,
      currentStationConfig.label,
      e.boardType,
      e.model,
      e.layerCount,
      e.prodType,
      e.fault,
      e.qty,
      e.operator,
      e.remarks || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeStationKey}_DefectLog_${MONTHS[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('PCB Quality CSV Exported successfully!');
  };

  // Current List & Filtered List
  const currentList = pcbEntries[activeStationKey] || [];
  const filteredList = useMemo(() => {
    if (!tableSearch.trim()) return currentList;
    const q = tableSearch.toLowerCase();
    return currentList.filter(
      (e) =>
        e.fault.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.boardType.toLowerCase().includes(q) ||
        e.operator.toLowerCase().includes(q) ||
        e.shift.toLowerCase().includes(q) ||
        (e.remarks && e.remarks.toLowerCase().includes(q))
    );
  }, [currentList, tableSearch]);

  const totalQty = currentList.reduce((acc, curr) => acc + curr.qty, 0);

  // Quick fault chips
  const quickFaultChips = useMemo(() => {
    return (currentStationConfig.faults || []).slice(0, 4);
  }, [currentStationConfig]);

  // Analytics
  const faultStats = useMemo(() => {
    const map: Record<string, number> = {};
    currentList.forEach((e) => {
      map[e.fault] = (map[e.fault] || 0) + e.qty;
    });
    return Object.entries(map)
      .map(([fault, qty]) => ({ fault, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [currentList]);

  const dailyStats = useMemo(() => {
    const map: Record<string, number> = {};
    currentList.forEach((e) => {
      map[e.date] = (map[e.date] || 0) + e.qty;
    });
    return Object.entries(map)
      .map(([date, qty]) => ({ date, qty }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [currentList]);

  const boardTypeStats = useMemo(() => {
    const map: Record<string, number> = {};
    currentList.forEach((e) => {
      map[e.boardType] = (map[e.boardType] || 0) + e.qty;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [currentList]);

  const operatorStats = useMemo(() => {
    const map: Record<string, number> = {};
    currentList.forEach((e) => {
      const op = e.operator ? e.operator.split('(')[0].trim() : 'Unknown';
      map[op] = (map[op] || 0) + e.qty;
    });
    return Object.entries(map)
      .map(([operator, qty]) => ({ operator, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [currentList]);

  // Total saved entries across all PCB stations
  const totalAllPcbEntries = useMemo(() => {
    return Object.values(pcbEntries).reduce((acc: number, list: PCBItemEntry[]) => acc + (list?.length || 0), 0);
  }, [pcbEntries]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#eef1f7] text-[#1c2536] rounded-2xl shadow-2xl border border-[#cbd5e1] w-full max-w-7xl max-h-[94vh] overflow-hidden flex flex-col font-sans">
        
        {/* ========================================================================= */}
        {/* HEADER: PCB QUALITY PORTAL (FABRICATION & BARE BOARD)                      */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0e2a4d] to-[#153a68] text-white px-5 py-3.5 flex items-center justify-between border-b-[3px] border-[#2563eb] flex-wrap gap-3 shadow-sm">
          {/* Branding & Station Indicator */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white font-extrabold flex items-center justify-center text-sm shadow-md tracking-wider">
              PCB
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base leading-snug tracking-tight">PCB Fabrication Quality Portal</h3>
                <span className="text-[11px] bg-white/10 border border-white/20 text-[#c9d3e6] px-2.5 py-0.5 rounded-full font-mono font-medium">
                  {currentStationConfig.label}
                </span>
                <span className="text-[10px] bg-[#2563eb]/25 border border-[#2563eb]/50 text-[#93c5fd] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
                  BARE BOARD QC
                </span>
              </div>
              <p className="text-[11px] text-[#a9b6cf] leading-tight mt-0.5">
                Walton Digi-Tech Industries Ltd · Bare Board AOI, E-Test, FQC &amp; Chemical Audit
              </p>
            </div>
          </div>

          {/* Right Toolbar: Period Quick Picker, Export & Close Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Period selector */}
            <div className="flex items-center gap-1.5 bg-[#0b203b] border border-white/15 px-3 py-1.5 rounded-xl text-xs text-white shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-medium text-xs focus:outline-none cursor-pointer text-white"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx} className="bg-[#0e2a4d] text-white">
                    {m}
                  </option>
                ))}
              </select>
              <span className="text-white/30">/</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-mono text-xs focus:outline-none cursor-pointer text-white"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-[#0e2a4d] text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Export CSV Action in Header */}
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Download Excel CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#c9d3e6] hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
              title="Close Portal"
              aria-label="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRIMARY MODULE NAVIGATION TABS */}
        <div className="bg-[#123157] px-4 flex gap-1 overflow-x-auto border-b border-[#1e4475] shrink-0">
          <button
            onClick={() => {
              setActiveCategory('aoi');
              setActiveStationKey('PCB-AOI-01');
            }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-[3px] transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'aoi'
                ? 'text-white border-[#2563eb] bg-white/10'
                : 'text-[#c9d3e6] border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#60a5fa]" />
            <span>Bare Board AOI</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/15 text-white">
              2 M/C
            </span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('etest');
              setActiveStationKey('PCB-ETEST-01');
            }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-[3px] transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'etest'
                ? 'text-white border-[#2563eb] bg-white/10'
                : 'text-[#c9d3e6] border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-[#e0a83f]" />
            <span>Electrical Test (E-Test)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/15 text-white">
              Probe &amp; Grid
            </span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('fqc');
              setActiveStationKey('PCB-FQC-01');
            }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-[3px] transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'fqc'
                ? 'text-white border-[#2563eb] bg-white/10'
                : 'text-[#c9d3e6] border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#20b6a4]" />
            <span>FQC Visual &amp; Dimension</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/15 text-white">
              Final Gate
            </span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('lab');
              setActiveStationKey('PCB-LAB-01');
            }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-[3px] transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'lab'
                ? 'text-white border-[#2563eb] bg-white/10'
                : 'text-[#c9d3e6] border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Microscope className="w-4 h-4 text-[#8e5fc9]" />
            <span>Wet Process Lab</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/15 text-white">
              Cross-Section
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('db')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-[3px] transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'db'
                ? 'text-white border-[#2563eb] bg-white/10'
                : 'text-[#c9d3e6] border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4 text-[#4f9ddb]" />
            <span>Database ({totalAllPcbEntries})</span>
          </button>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Toast Notification Banner */}
          {notification && (
            <div className="bg-[#e5f7ee] border border-[#a3e6c0] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold text-[#16a34a] shadow-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>{notification}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-[#16a34a] hover:text-[#14532d] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ACTIVE STATION SELECTION & WORKSPACE */}
          {activeCategory !== 'db' && (
            <div className="space-y-4">
              {/* Station Carousel & SubTab Switcher */}
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#e2e6ee] shadow-2xs flex flex-wrap items-center justify-between gap-3">
                
                {/* Station Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                  <span className="text-[11px] font-bold text-[#7c8798] uppercase tracking-wider mr-1 hidden sm:inline">
                    Stations:
                  </span>
                  {Object.keys(PCB_STATION_CONFIGS)
                    .filter((k) => PCB_STATION_CONFIGS[k].group === activeCategory)
                    .map((k) => {
                      const count = (pcbEntries[k] || []).length;
                      const isSelected = activeStationKey === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setActiveStationKey(k)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#0e2a4d] text-white shadow-sm ring-2 ring-[#2563eb]/30'
                              : 'bg-[#f1f5f9] text-[#5b6480] hover:bg-[#e2e8f0] hover:text-[#0d1730]'
                          }`}
                        >
                          <span>{PCB_STATION_CONFIGS[k].label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                              isSelected
                                ? 'bg-[#2563eb] text-white'
                                : 'bg-[#cbd5e1] text-[#475569]'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* SubTab Switcher */}
                <div className="inline-flex rounded-xl border border-[#cbd5e1] p-1 bg-[#f1f5f9] shrink-0">
                  <button
                    onClick={() => setSubTab('entry')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      subTab === 'entry'
                        ? 'bg-white text-[#0e2a4d] shadow-xs'
                        : 'text-[#7c8798] hover:text-[#0e2a4d]'
                    }`}
                  >
                    <span>📝 Defect Entry</span>
                  </button>
                  <button
                    onClick={() => setSubTab('dash')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      subTab === 'dash'
                        ? 'bg-white text-[#0e2a4d] shadow-xs'
                        : 'text-[#7c8798] hover:text-[#0e2a4d]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>📊 Analytics</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: DATA ENTRY SPLIT PANE */}
              {subTab === 'entry' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* LEFT: ENTRY FORM */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e2e6ee] p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e2e6ee]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#2563eb]/10 text-[#2563eb]">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#0e2a4d] uppercase tracking-wider">
                            Log PCB Defect Record
                          </h4>
                          <p className="text-[11px] text-[#7c8798]">
                            Station: <strong className="text-[#0e2a4d]">{currentStationConfig.label}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-[#f5f6fa] border border-[#e2e6ee] px-2 py-0.5 rounded-md text-[#7c8798]">
                        Quick-Log
                      </span>
                    </div>

                    <form onSubmit={handleAddEntry} className="space-y-3.5">
                      {/* Date & Shift */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-[#5b6480]">Inspection Date</label>
                        <input
                          type="date"
                          required
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-1.5 font-mono text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]"
                        />
                      </div>

                      {/* Shift Pills */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-[#5b6480]">Shop Floor Shift</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {currentStationConfig.shifts.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFormShift(s)}
                              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                                formShift === s
                                  ? 'bg-[#153a68] border-[#153a68] text-white shadow-2xs'
                                  : 'bg-[#f8fafc] border-[#e2e6ee] text-[#5b6480] hover:bg-[#eef1f8]'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Board Type & Layer Count */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#5b6480]">Board Substrate</label>
                          <select
                            value={formBoardType}
                            onChange={(e) => setFormBoardType(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                          >
                            {currentStationConfig.boardTypes.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#5b6480]">Layer Count</label>
                          <select
                            value={formLayerCount}
                            onChange={(e) => setFormLayerCount(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                          >
                            <option value="1-Layer">1-Layer (Single)</option>
                            <option value="2-Layer">2-Layer (Double)</option>
                            <option value="4-Layer">4-Layer (Multi)</option>
                            <option value="6-Layer">6-Layer (Multi)</option>
                            <option value="MCPCB">MCPCB (Aluminum)</option>
                          </select>
                        </div>
                      </div>

                      {/* Model / Part Number & Production Type */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#5b6480]">Model / Part No.</label>
                          <input
                            type="text"
                            placeholder="e.g. WFB-FRIDGE-MAIN"
                            value={formModel}
                            onChange={(e) => setFormModel(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-1.5 font-mono text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#5b6480]">Production Run</label>
                          <select
                            value={formProdType}
                            onChange={(e) => setFormProdType(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                          >
                            <option value="Mass Production">Mass Production</option>
                            <option value="Trial Production">Trial Production</option>
                            <option value="Prototype Run">Prototype Run</option>
                            <option value="Rework / Strip">Rework / Strip</option>
                          </select>
                        </div>
                      </div>

                      {/* Defect Fault Type Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-[#5b6480]">
                          Defect / Failure Mode ({currentStationConfig.faults.length} Types)
                        </label>
                        <select
                          required
                          value={formFault}
                          onChange={(e) => setFormFault(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 font-mono text-xs text-[#1c2536] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                        >
                          {currentStationConfig.faults.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>

                        {/* Quick Chips for Top Defects */}
                        {quickFaultChips.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-[#7c8798] font-bold">Quick:</span>
                            {quickFaultChips.map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setFormFault(chip)}
                                className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                  formFault === chip
                                    ? 'bg-[#2563eb] text-white border-[#2563eb] font-bold'
                                    : 'bg-[#f1f5f9] text-[#5b6480] border-[#cbd5e1] hover:bg-[#e2e8f0]'
                                }`}
                              >
                                {chip.split('/')[0].trim()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Operator */}
                      <div className="grid grid-cols-2 gap-2.5 items-end">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#5b6480]">Defect Qty (Pcs)</label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setFormQty(Math.max(1, formQty - 1))}
                              className="px-2.5 py-1.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1c2536] rounded-l-xl font-bold text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              required
                              value={formQty}
                              onChange={(e) => setFormQty(Math.max(1, Number(e.target.value)))}
                              className="w-full bg-[#f8fafc] border-y border-[#cbd5e1] py-1.5 font-mono text-xs text-center font-bold text-[#1c2536] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setFormQty(formQty + 1)}
                              className="px-2.5 py-1.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1c2536] rounded-r-xl font-bold text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#5b6480]">QC Inspector</label>
                          <select
                            value={formOperator}
                            onChange={(e) => setFormOperator(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                          >
                            {currentStationConfig.operators.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#5b6480]">Analysis &amp; Remarks (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Panel location X3-Y2, etch bath specific gravity normal"
                          value={formRemarks}
                          onChange={(e) => setFormRemarks(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-1.5 text-xs text-[#1c2536] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Log PCB Defect Record</span>
                      </button>
                    </form>
                  </div>

                  {/* RIGHT: LIVE DEFECT REGISTRY TABLE */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e2e6ee] p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2e6ee]">
                        <div>
                          <h4 className="font-bold text-xs text-[#0e2a4d] uppercase tracking-wider flex items-center gap-2">
                            <span>Inspection Log</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2563eb]/10 text-[#2563eb]">
                              {filteredList.length} Entries
                            </span>
                          </h4>
                          <p className="text-[11px] text-[#7c8798]">
                            Total Defects Logged: <strong className="text-[#d64545] font-mono">{totalQty} pcs</strong>
                          </p>
                        </div>

                        {/* Search & CSV */}
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-[#7c8798] absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search defect, model..."
                              value={tableSearch}
                              onChange={(e) => setTableSearch(e.target.value)}
                              className="pl-8 pr-3 py-1 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-mono text-[#1c2536] w-44 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={exportCSV}
                            className="p-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0e2a4d] rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Export Station CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Spreadsheet Table */}
                      <div className="overflow-x-auto max-h-[440px] mt-2 border border-[#e2e6ee] rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0e2a4d] text-white sticky top-0 z-10 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2.5 px-3">Date / Shift</th>
                              <th className="py-2.5 px-3">Model / Substrate</th>
                              <th className="py-2.5 px-3">Defect Fault Mode</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3">Inspector</th>
                              <th className="py-2.5 px-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e6ee]">
                            {filteredList.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-[#7c8798]">
                                  No defect records found for this station.
                                </td>
                              </tr>
                            ) : (
                              filteredList.map((row) => (
                                <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="font-mono text-[#0e2a4d] font-semibold text-[11px]">{row.date}</div>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#f1f5f9] text-[#5b6480]">
                                      {row.shift}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-[#0e2a4d] text-[11px]">{row.model}</div>
                                    <div className="text-[10px] text-[#7c8798]">{row.boardType} · {row.layerCount}</div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold text-[#c74a1f] text-[11px]">{row.fault}</div>
                                    {row.remarks && (
                                      <div className="text-[10px] text-[#7c8798] truncate max-w-[160px] italic">
                                        {row.remarks}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-xs bg-[#fbe6e6] text-[#d64545]">
                                      {row.qty}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px] text-[#5b6480]">
                                    {row.operator.split('(')[0].trim()}
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEntry(row.id)}
                                      className="p-1 rounded text-[#7c8798] hover:text-[#d64545] hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Delete Entry"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom Summary Footer */}
                    <div className="pt-2 border-t border-[#e2e6ee] flex items-center justify-between text-xs text-[#5b6480]">
                      <span>Showing {filteredList.length} of {currentList.length} items</span>
                      <span className="font-mono font-bold text-[#0e2a4d]">
                        Total Logged Faults: <strong className="text-[#d64545]">{totalQty} pcs</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: ANALYTICS DASHBOARD */}
              {subTab === 'dash' && (
                <div className="space-y-4">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-[#e2e6ee] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#7c8798] uppercase tracking-wider">Total Defect Pcs</span>
                      <div className="text-2xl font-bold font-mono text-[#d64545] mt-1">{totalQty}</div>
                      <span className="text-[10px] text-[#7c8798]">Across all records</span>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-[#e2e6ee] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#7c8798] uppercase tracking-wider">Records Logged</span>
                      <div className="text-2xl font-bold font-mono text-[#2563eb] mt-1">{currentList.length}</div>
                      <span className="text-[10px] text-[#7c8798]">Inspection sessions</span>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-[#e2e6ee] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#7c8798] uppercase tracking-wider">Distinct Defect Modes</span>
                      <div className="text-2xl font-bold font-mono text-[#8e5fc9] mt-1">{faultStats.length}</div>
                      <span className="text-[10px] text-[#7c8798]">Failure modes flagged</span>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-[#e2e6ee] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#7c8798] uppercase tracking-wider">Top Failure Mode</span>
                      <div className="text-sm font-bold text-[#0e2a4d] mt-1 truncate">
                        {faultStats[0]?.fault || 'None'}
                      </div>
                      <span className="text-[10px] text-[#d64545] font-mono font-bold">
                        {faultStats[0]?.qty ? `${faultStats[0].qty} pcs (${((faultStats[0].qty / (totalQty || 1)) * 100).toFixed(1)}%)` : '0 pcs'}
                      </span>
                    </div>
                  </div>

                  {/* Charts Row: Pareto Chart & Daily Trend */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Pareto Bar Chart */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e6ee] shadow-2xs">
                      <h4 className="font-bold text-xs text-[#0e2a4d] uppercase tracking-wider mb-1">
                        Defect Pareto Analysis — Top Failure Modes
                      </h4>
                      <p className="text-[11px] text-[#7c8798] mb-3">Dominant PCB failure mechanisms</p>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={faultStats.slice(0, 6)} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" stroke="#7c8798" fontSize={10} />
                            <YAxis dataKey="fault" type="category" stroke="#7c8798" fontSize={10} width={130} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e6ee', fontSize: '11px' }} />
                            <Bar dataKey="qty" fill="#2563eb" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Daily Defect Progression */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e6ee] shadow-2xs">
                      <h4 className="font-bold text-xs text-[#0e2a4d] uppercase tracking-wider mb-1">
                        Daily Defect Progression
                      </h4>
                      <p className="text-[11px] text-[#7c8798] mb-3">Defect volume timeline</p>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyStats} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#7c8798" fontSize={10} />
                            <YAxis stroke="#7c8798" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e6ee', fontSize: '11px' }} />
                            <Line type="monotone" dataKey="qty" stroke="#e0483f" strokeWidth={2.5} dot={{ r: 4, fill: '#e0483f' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: DATABASE REGISTRY */}
          {activeCategory === 'db' && (
            <div className="bg-white rounded-2xl border border-[#e2e6ee] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e6ee]">
                <div>
                  <h4 className="font-bold text-sm text-[#0e2a4d] uppercase tracking-wider">
                    All PCB Stations Database Registry
                  </h4>
                  <p className="text-xs text-[#7c8798]">Summary of saved defect entries across all bare board process gates</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allData = Object.entries(pcbEntries).flatMap(([stn, list]) =>
                      (list as PCBItemEntry[]).map((item) => ({ ...item, stationName: PCB_STATION_CONFIGS[stn]?.label || stn }))
                    );
                    const headers = ['Station', 'Date', 'Shift', 'Model', 'Board Type', 'Layer', 'Fault', 'Qty', 'Inspector'];
                    const rows = allData.map((e) => [
                      e.stationName,
                      e.date,
                      e.shift,
                      e.model,
                      e.boardType,
                      e.layerCount,
                      e.fault,
                      e.qty,
                      e.operator,
                    ]);
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
                    const link = document.createElement('a');
                    link.setAttribute('href', encodeURI(csvContent));
                    link.setAttribute('download', `PCB_Complete_Database_${selectedYear}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Entire Database (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(PCB_STATION_CONFIGS).map((k) => {
                  const cfg = PCB_STATION_CONFIGS[k];
                  const list = pcbEntries[k] || [];
                  const sumQty = list.reduce((a, c) => a + c.qty, 0);
                  return (
                    <div key={k} className="p-4 rounded-xl border border-[#e2e6ee] hover:border-[#2563eb] transition-all bg-[#f8fafc] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0e2a4d]">{cfg.label}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2563eb]/10 text-[#2563eb] font-bold">
                          {list.length} Logs
                        </span>
                      </div>
                      <div className="text-xl font-bold font-mono text-[#d64545]">{sumQty} Defect Pcs</div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategory(cfg.group);
                          setActiveStationKey(k);
                          setSubTab('entry');
                        }}
                        className="w-full py-1.5 bg-white hover:bg-[#2563eb] hover:text-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0e2a4d] transition-all cursor-pointer"
                      >
                        Open Station &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
