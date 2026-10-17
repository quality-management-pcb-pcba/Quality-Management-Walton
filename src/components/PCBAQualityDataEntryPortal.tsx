import React, { useState, useEffect, useMemo } from 'react';
import { WaltonSealLogo } from './WaltonSealLogo';
import {
  Database,
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Home,
  Menu,
  FileText,
  Layers,
  Smartphone,
  Radio,
  CheckSquare,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  CloudCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import { AOILineDefectEntry } from './AOILineDefectEntry';
import { MILineDefectEntry } from './MILineDefectEntry';
import { MILineChargerDefectEntry } from './MILineChargerDefectEntry';
import { DailyQMReportSMT } from './DailyQMReportSMT';
import { DailyQMReportMI } from './DailyQMReportMI';
import { MobileAestheticDefectPortal } from './MobileAestheticDefectPortal';
import { MobileFunctionDefectPortal } from './MobileFunctionDefectPortal';
import {
  savePcbaReport,
  updatePcbaReport,
  deletePcbaReport,
  subscribeToPcbaReports,
  saveMultiplePcbaReports,
} from '../services/pcbaReportService';
import { SMT_LINE_01_DEFECT_RECORDS } from '../data/smtLine01Records';
import { SMT_LINE_02_DEFECT_RECORDS } from '../data/smtLine02Records';
import { SMT_LINE_03_DEFECT_RECORDS } from '../data/smtLine03Records';
import { SMT_LINE_04_DEFECT_RECORDS } from '../data/smtLine04Records';
import { SMT_LINE_05_DEFECT_RECORDS } from '../data/smtLine05Records';
import { MI_LINE_01_DEFECT_RECORDS } from '../data/miLine01Records';
import { MI_LINE_CHARGER_DEFECT_RECORDS } from '../data/miLineChargerRecords';
import { SMT_SUMMARY_RECORDS } from '../data/smtSummaryRecords';
import { AESTHETIC_DEFECT_RECORDS } from '../data/aestheticDefectRecords';
import { FUNCTION_DEFECT_RECORDS } from '../data/functionDefectRecords';

export interface PCBAQualityDataEntryPortalProps {
  onClose: () => void;
  onNavigateHome?: () => void;
  initialLine?: string;
  initialNav?: { type: string; value: string };
}

export interface ReportRecord {
  id: string;
  date: string;
  line: string;
  model: string;
  type: 'Aesthetic' | 'Function';
  desc: string;
  qty: number;
  status: 'Open' | 'In Progress' | 'Closed';
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  shift?: string;
  product?: string;
  operator?: string;
  remarks?: string;
}

const LINES = [
  'SMT Line-01',
  'SMT Line-02',
  'SMT Line-03',
  'SMT Line-04',
  'SMT Line-05',
  'MI Line-01',
  'MI Line - Charger',
];

const MODELS = [
  'NEXG N77',
  'LED TV Board',
  'AC Main Board',
  'Mobile Charger PCBA',
  'MI Board-01',
  'Power Supply',
  'LED Driver',
  'Main PCBA',
  'Sensor Module',
  'Inverter PCB',
];

const AESTHETIC_DESC = [
  'Shield Shifting',
  'Scratch',
  'Solder Mask Defect',
  'Label Missing',
  'Component Misalignment',
  'Paint Peel Off',
  'Silkscreen Smudge',
  'Bent Pin',
];

const FUNCTION_DESC = [
  'SIM Card',
  'No Power',
  'Display Issue',
  'Sensor',
  'Short Circuit',
  'No Sound',
  'Charging Fail',
  'Touch Not Working',
];

const STATUSES: Array<'Open' | 'In Progress' | 'Closed'> = ['Open', 'In Progress', 'Closed'];

const PAGE_SIZE = 10;

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 566 Official Aesthetic Defect Records from attached inspection sheet
const AESTHETIC_REPORT_RECORDS: ReportRecord[] = AESTHETIC_DEFECT_RECORDS.map((r) => ({
  id: r.id,
  date: r.date,
  line: r.line,
  model: r.spec ? `${r.model} (${r.spec})` : r.model,
  type: 'Aesthetic' as const,
  desc: r.desc,
  qty: r.qty,
  status: r.status,
  shift: r.shift,
  product: r.product,
  remarks: `${r.stage} - ${r.shift} Shift`,
  createdBy: 'QC Aesthetic Inspector',
}));

// 548 Official Functional Defect Records from attached inspection sheet
const FUNCTION_REPORT_RECORDS: ReportRecord[] = FUNCTION_DEFECT_RECORDS.map((r) => ({
  id: r.id,
  date: r.date,
  line: r.line,
  model: r.spec ? `${r.model} (${r.spec})` : r.model,
  type: 'Function' as const,
  desc: r.desc,
  qty: r.qty,
  status: r.status,
  shift: r.shift,
  product: r.product,
  remarks: `${r.stage} - ${r.shift} Shift`,
  createdBy: 'QC Functional Tester',
}));

// Generate realistic seed records matching user template
function generateSeedData(): ReportRecord[] {
  const out: ReportRecord[] = [];
  const today = new Date();
  
  // Specific initial records to guarantee high realism
  const presets: Array<Partial<ReportRecord>> = [
    { date: fmtDate(today), line: 'SMT Line-01', model: 'NEXG N77', type: 'Aesthetic', desc: 'Shield Shifting', qty: 3, status: 'Open' },
    { date: fmtDate(today), line: 'SMT Line-02', model: 'LED TV Board', type: 'Function', desc: 'No Power', qty: 2, status: 'In Progress' },
    { date: fmtDate(today), line: 'SMT Line-03', model: 'AC Main Board', type: 'Function', desc: 'Short Circuit', qty: 1, status: 'Closed' },
    { date: fmtDate(new Date(Date.now() - 86400000)), line: 'MI Line-01', model: 'Mobile Charger PCBA', type: 'Aesthetic', desc: 'Bent Pin', qty: 5, status: 'Closed' },
    { date: fmtDate(new Date(Date.now() - 86400000)), line: 'SMT Line-04', model: 'MI Board-01', type: 'Function', desc: 'Display Issue', qty: 2, status: 'Open' },
    { date: fmtDate(new Date(Date.now() - 86400000 * 2)), line: 'SMT Line-05', model: 'Power Supply', type: 'Aesthetic', desc: 'Scratch', qty: 4, status: 'In Progress' },
    { date: fmtDate(new Date(Date.now() - 86400000 * 2)), line: 'MI Line-02', model: 'LED Driver', type: 'Function', desc: 'No Sound', qty: 1, status: 'Closed' },
    { date: fmtDate(new Date(Date.now() - 86400000 * 3)), line: 'SMT Line-01', model: 'NEXG N77', type: 'Aesthetic', desc: 'Component Misalignment', qty: 6, status: 'Closed' },
    { date: fmtDate(new Date(Date.now() - 86400000 * 3)), line: 'SMT Line-02', model: 'Main PCBA', type: 'Function', desc: 'Sensor', qty: 2, status: 'Open' },
    { date: fmtDate(new Date(Date.now() - 86400000 * 4)), line: 'SMT Line-03', model: 'Sensor Module', type: 'Aesthetic', desc: 'Solder Mask Defect', qty: 3, status: 'In Progress' },
  ];

  presets.forEach((p, idx) => {
    out.push({
      id: `seed-${idx + 1}`,
      date: p.date!,
      line: p.line!,
      model: p.model!,
      type: p.type!,
      desc: p.desc!,
      qty: p.qty!,
      status: p.status!,
    });
  });

  // Additional 54 entries to form 64 records total
  for (let i = 11; i <= 64; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (i % 21));
    const isAesthetic = i % 2 === 0;
    const type = isAesthetic ? 'Aesthetic' : 'Function';
    const descList = isAesthetic ? AESTHETIC_DESC : FUNCTION_DESC;
    out.push({
      id: `seed-${i}`,
      date: fmtDate(d),
      line: LINES[i % LINES.length],
      model: MODELS[i % MODELS.length],
      type,
      desc: descList[i % descList.length],
      qty: (i % 12) + 1,
      status: STATUSES[i % STATUSES.length],
    });
  }

  // Include all 566 real records from the Walton Mobile PCBA Aesthetic Inspection Sheet
  out.push(...AESTHETIC_REPORT_RECORDS);

  // Include all 548 real records from the Walton Mobile PCBA Functional Inspection Sheet
  out.push(...FUNCTION_REPORT_RECORDS);

  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}

export const PCBAQualityDataEntryPortal: React.FC<PCBAQualityDataEntryPortalProps> = ({
  onClose,
  onNavigateHome,
  initialLine = 'SMT Line-01',
  initialNav,
}) => {
  const handleGoHome = () => {
    setActiveNav({ type: 'home', value: 'Home' });
  };
  // Firestore Data State
  const [data, setData] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Real-time Firestore sync & Auto-collection creation
  useEffect(() => {
    setIsLoading(true);
    let isSubscribed = true;

    const unsubscribe = subscribeToPcbaReports(
      async (records) => {
        if (!isSubscribed) return;
        if (records.length === 0) {
          // Collection is empty or just created: Auto-seed initial realistic data to Firestore
          try {
            const seed = generateSeedData();
            await saveMultiplePcbaReports(
              seed.map((s) => ({
                date: s.date,
                line: s.line,
                model: s.model,
                type: s.type,
                desc: s.desc,
                qty: s.qty,
                status: s.status,
                source: 'Initial Database Seed',
              }))
            );
          } catch (seedErr) {
            console.warn('Initial seeding skipped:', seedErr);
            setData([]);
            setIsLoading(false);
          }
        } else {
          setData(
            records.map((r) => ({
              id: r.id || `rep-${Math.random()}`,
              date: r.date || fmtDate(new Date()),
              line: r.line || 'SMT Line-01',
              model: r.model || 'Standard PCBA',
              type: (r.type as any) === 'Function' ? 'Function' : 'Aesthetic',
              desc: r.desc || '—',
              qty: Number(r.qty) || 1,
              status: (r.status as any) || 'Open',
              createdBy: r.createdBy,
              createdAt: r.createdAt,
              updatedBy: r.updatedBy,
              updatedAt: r.updatedAt,
              shift: r.shift,
              product: r.product,
              operator: r.operator,
              remarks: r.remarks,
            }))
          );
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setIsLoading(false);
        showToast('Firestore connection error: ' + (error.message || 'Check database permissions'), 'error');
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Sidebar collapsible state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    g1: false, // Line Wise Defect
    g2: false, // Mobile Defect
    g3: false, // Daily Check
  });

  // Mobile sidebar overlay state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Active navigation selection - defaults to 'home' to match PCB Reports portal layout
  const [activeNav, setActiveNav] = useState<{ type: string; value: string }>(() => {
    if (initialNav) return initialNav;
    if (initialLine) {
      return {
        type: 'line',
        value: initialLine,
      };
    }
    return {
      type: 'home',
      value: 'Home',
    };
  });

  useEffect(() => {
    if (initialNav) {
      setActiveNav(initialNav);
    } else if (initialLine) {
      setActiveNav({ type: 'line', value: initialLine });
    } else {
      setActiveNav({ type: 'home', value: 'Home' });
    }
  }, [initialNav, initialLine]);

  // Home KPI calculations matching PCB Portal format
  const homeStats = useMemo(() => {
    const today = fmtDate(new Date());
    const smtInFirestore = data.filter((r) => r.line && r.line.startsWith('SMT')).length;
    const smtCount = Math.max(
      smtInFirestore,
      SMT_LINE_01_DEFECT_RECORDS.length +
        SMT_LINE_02_DEFECT_RECORDS.length +
        SMT_LINE_03_DEFECT_RECORDS.length +
        SMT_LINE_04_DEFECT_RECORDS.length +
        SMT_LINE_05_DEFECT_RECORDS.length
    );
    const miInFirestore = data.filter((r) => r.line && r.line.startsWith('MI')).length;
    const miCount = Math.max(
      miInFirestore,
      MI_LINE_01_DEFECT_RECORDS.length + MI_LINE_CHARGER_DEFECT_RECORDS.length
    );
    const aestheticCount = AESTHETIC_DEFECT_RECORDS.length;
    const functionCount = FUNCTION_DEFECT_RECORDS.length;
    const totalRecords = Math.max(data.length, smtCount + miCount + aestheticCount + functionCount);
    const todayRecords = data.filter((r) => r.date === today).length;
    return {
      totalRecords,
      todayRecords,
      totalChecked: 3400339,
      failRate: '1.24%',
      smtCount,
      miCount,
      aestheticCount,
      functionCount,
    };
  }, [data]);

  // Filter Form State
  const [fDateFrom, setFDateFrom] = useState<string>('');
  const [fDateTo, setFDateTo] = useState<string>('');
  const [fLine, setFLine] = useState<string>('');
  const [fType, setFType] = useState<string>('');
  const [fModel, setFModel] = useState<string>('');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<{
    dateFrom: string;
    dateTo: string;
    line: string;
    type: string;
    model: string;
  }>({
    dateFrom: '',
    dateTo: '',
    line: '',
    type: '',
    model: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ReportRecord | null>(null);

  // Modal Form State
  const [mDate, setMDate] = useState<string>(fmtDate(new Date()));
  const [mLine, setMLine] = useState<string>(LINES[0]);
  const [mModel, setMModel] = useState<string>('');
  const [mType, setMType] = useState<'Aesthetic' | 'Function'>('Aesthetic');
  const [mQty, setMQty] = useState<number>(1);
  const [mStatus, setMStatus] = useState<'Open' | 'In Progress' | 'Closed'>('Open');
  const [mDesc, setMDesc] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Handle filter submission
  const handleSearch = () => {
    setAppliedFilters({
      dateFrom: fDateFrom,
      dateTo: fDateTo,
      line: fLine,
      type: fType,
      model: fModel.trim().toLowerCase(),
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFDateFrom('');
    setFDateTo('');
    setFLine('');
    setFType('');
    setFModel('');
    setAppliedFilters({
      dateFrom: '',
      dateTo: '',
      line: '',
      type: '',
      model: '',
    });
    setActiveNav({ type: 'database', value: 'Database' });
    setCurrentPage(1);
  };

  // Nav Item Clicks from Sidebar
  const handleSelectNav = (type: string, value: string) => {
    setActiveNav({ type, value });
    setSidebarOpen(false);

    if (type === 'home') {
      return;
    } else if (type === 'database') {
      handleReset();
    } else if (type === 'line') {
      setFLine(value);
      setAppliedFilters((prev) => ({ ...prev, line: value }));
      setCurrentPage(1);
    } else if (type === 'defectType') {
      setFType(value);
      setAppliedFilters((prev) => ({ ...prev, type: value }));
      setCurrentPage(1);
    } else if (type === 'check') {
      if (value === 'SMT Summary') {
        setFLine('SMT Line-01');
        setAppliedFilters((prev) => ({ ...prev, line: 'SMT Line-01' }));
      } else if (value === 'MI Summary') {
        setFLine('MI Line-01');
        setAppliedFilters((prev) => ({ ...prev, line: 'MI Line-01' }));
      } else {
        setFModel('NEXG');
        setAppliedFilters((prev) => ({ ...prev, model: 'nexg' }));
      }
      setCurrentPage(1);
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    let sourceData = data;
    const hasAestheticInDb = data.some((r) => r.id && r.id.startsWith('aesthetic-rec-'));
    if (!hasAestheticInDb) {
      sourceData = [...sourceData, ...AESTHETIC_REPORT_RECORDS];
    }
    const hasFunctionInDb = data.some((r) => r.id && r.id.startsWith('function-rec-'));
    if (!hasFunctionInDb) {
      sourceData = [...sourceData, ...FUNCTION_REPORT_RECORDS];
    }
    return sourceData.filter((r) => {
      if (appliedFilters.dateFrom && r.date < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && r.date > appliedFilters.dateTo) return false;
      if (appliedFilters.line && r.line !== appliedFilters.line) return false;
      if (appliedFilters.type && r.type !== appliedFilters.type) return false;
      if (appliedFilters.model && !r.model.toLowerCase().includes(appliedFilters.model)) return false;
      return true;
    });
  }, [data, appliedFilters]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * PAGE_SIZE;
  const pageRows = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  // Modal Open for Add or Edit
  const openAddModal = () => {
    setEditingRecord(null);
    setMDate(fmtDate(new Date()));
    setMLine(fLine || LINES[0]);
    setMModel('');
    setMType('Aesthetic');
    setMQty(1);
    setMStatus('Open');
    setMDesc('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (r: ReportRecord) => {
    setEditingRecord(r);
    setMDate(r.date);
    setMLine(r.line);
    setMModel(r.model);
    setMType(r.type);
    setMQty(r.qty);
    setMStatus(r.status);
    setMDesc(r.desc);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mModel.trim()) {
      setFormError('Model / Part No. is required');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingRecord) {
        // Update existing record in Firestore collection pcba_reports
        await updatePcbaReport(editingRecord.id, {
          date: mDate,
          line: mLine,
          model: mModel.trim(),
          type: mType,
          qty: Math.max(1, mQty),
          status: mStatus,
          desc: mDesc.trim() || '—',
        });
        showToast('PCBA Report Saved Successfully', 'success');
      } else {
        // Create new record in Firestore collection pcba_reports
        await savePcbaReport({
          date: mDate || fmtDate(new Date()),
          line: mLine,
          model: mModel.trim(),
          type: mType,
          qty: Math.max(1, mQty),
          status: mStatus,
          desc: mDesc.trim() || '—',
          source: 'portal',
        });
        showToast('PCBA Report Saved Successfully', 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save PCBA report to Firestore:', err);
      const errMsg = err?.message || 'Failed to save PCBA report to Firestore';
      setFormError(errMsg);
      showToast('Error: ' + errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    const item = data.find((r) => r.id === id);
    if (!item) return;
    const confirmed = window.confirm(
      `Confirm Deletion: Are you sure you want to delete this PCBA report?\n\n• Line: ${item.line}\n• Model: ${item.model}\n• Defect: ${item.desc}\n\nThis will remove the record permanently from Firestore collection "pcba_reports".`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deletePcbaReport(id);
      showToast('PCBA report deleted successfully', 'success');
    } catch (err: any) {
      console.error('Failed to delete PCBA report from Firestore:', err);
      showToast('Failed to delete report: ' + (err?.message || 'Firestore error'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Formatted date string for top pill
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#f2f4f9] text-[#17203a] flex overflow-hidden font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0c122d]/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR                                                                   */}
      {/* ========================================================================= */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[250px] bg-[#0c1a3f] text-[#c7cee6] flex flex-col transition-transform duration-200 ease-in-out select-none shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <button
          type="button"
          id="btn-sidebar-brand-logo"
          onClick={handleGoHome}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
          title="Return to Home page"
        >
          <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center filter drop-shadow-md group-hover:scale-105 transition-transform">
            <WaltonSealLogo className="w-full h-full object-contain select-none" />
          </div>
          <div>
            <div className="text-[16px] font-extrabold tracking-wide text-white leading-tight group-hover:text-blue-200 transition-colors">
              Walton
            </div>
            <div className="text-[10px] text-[#8b93b4] mt-0.5 font-medium leading-tight group-hover:text-[#b8c2e6] transition-colors">
              Quality Management<br />PCB &amp; PCBA
            </div>
          </div>
        </button>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1.5 px-0">
          {/* Home Nav Item */}
          <div className="px-3 pb-1">
            <button
              onClick={() => handleSelectNav('home', 'Home')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                activeNav.type === 'home'
                  ? 'bg-[#1b2b62] text-white shadow-xs font-bold border-l-2 border-[#5b8bff]'
                  : 'text-[#c7cee6] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-[#8b93b4]" />
              <span>Home</span>
            </button>
          </div>

          {/* Group 1: Line Wise Defect */}
          <div className="mt-1">
            <button
              onClick={() => toggleGroup('g1')}
              className="w-full flex items-center justify-between px-5 py-2.5 text-[13.5px] font-semibold text-[#e4e8f7] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#8b93b4]" />
                <span>Line Wise Defect</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7f88ac] transition-transform duration-200 ${
                  collapsedGroups.g1 ? '-rotate-90' : ''
                }`}
              />
            </button>

            {!collapsedGroups.g1 && (
              <div className="flex flex-col">
                {LINES.map((l) => {
                  const isActive = activeNav.type === 'line' && activeNav.value === l;
                  const isMILine01 = l === 'MI Line-01';
                  const isMICharger = l === 'MI Line - Charger' || l === 'MI Line-02';
                  const isSMT = l.startsWith('SMT');
                  const isSMTLine01 = l === 'SMT Line-01';
                  const isSMTLine02 = l === 'SMT Line-02';
                  const isSMTLine03 = l === 'SMT Line-03';
                  const isSMTLine04 = l === 'SMT Line-04';
                  const isSMTLine05 = l === 'SMT Line-05';
                  return (
                    <button
                      key={l}
                      id={
                        isSMTLine01
                          ? 'btn-nav-smt-line-01'
                          : isSMTLine02
                          ? 'btn-nav-smt-line-02'
                          : isSMTLine03
                          ? 'btn-nav-smt-line-03'
                          : isSMTLine04
                          ? 'btn-nav-smt-line-04'
                          : isSMTLine05
                          ? 'btn-nav-smt-line-05'
                          : isMILine01
                          ? 'btn-nav-mi-line-01'
                          : isMICharger
                          ? 'btn-nav-mi-charger'
                          : undefined
                      }
                      onClick={() => handleSelectNav('line', l)}
                      className={`text-left pl-11 pr-4 py-2.5 text-[13px] transition-all cursor-pointer flex items-center justify-between border-l-2 ${
                        isActive && isMILine01
                          ? 'text-white bg-gradient-to-r from-emerald-500/30 via-emerald-500/15 to-transparent font-bold border-emerald-400 shadow-xs'
                          : isActive
                          ? 'text-white bg-gradient-to-r from-white/15 to-white/5 font-bold border-[#5b8bff] shadow-xs'
                          : isMICharger
                          ? 'text-[#e6fbf2] hover:text-white hover:bg-emerald-500/10 border-transparent'
                          : isMILine01
                          ? 'text-[#ecfdf5] hover:text-white hover:bg-emerald-500/15 border-transparent'
                          : isSMTLine01
                          ? 'text-[#dbeafe] hover:text-white hover:bg-blue-500/15 border-transparent font-bold'
                          : isSMTLine04
                          ? 'text-[#e0e7ff] hover:text-white hover:bg-indigo-500/15 border-transparent font-bold'
                          : isSMTLine02
                          ? 'text-[#e0f2fe] hover:text-white hover:bg-white/10 border-transparent font-bold'
                          : isSMTLine03
                          ? 'text-[#ede9fe] hover:text-white hover:bg-white/10 border-transparent font-bold'
                          : isSMTLine05
                          ? 'text-[#ffe4e6] hover:text-white hover:bg-white/10 border-transparent font-bold'
                          : 'text-[#c7cee6] hover:text-white hover:bg-white/5 border-transparent font-bold'
                      }`}
                    >
                      <span className="font-bold tracking-wide text-white/95">
                        {l}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 2: Mobile Defect */}
          <div className="mt-1">
            <button
              onClick={() => toggleGroup('g2')}
              className="w-full flex items-center justify-between px-5 py-2.5 text-[13.5px] font-semibold text-[#e4e8f7] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#8b93b4]" />
                <span>Mobile Defect</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7f88ac] transition-transform duration-200 ${
                  collapsedGroups.g2 ? '-rotate-90' : ''
                }`}
              />
            </button>

            {!collapsedGroups.g2 && (
              <div className="flex flex-col">
                {['Aesthetic', 'Function'].map((t) => {
                  const isActive = activeNav.type === 'defectType' && activeNav.value === t;
                  return (
                    <button
                      key={t}
                      id={t === 'Aesthetic' ? 'btn-nav-mobile-aesthetic' : 'btn-nav-mobile-function'}
                      onClick={() => handleSelectNav('defectType', t)}
                      className={`text-left pl-11 pr-5 py-2.5 text-[13px] font-bold transition-colors cursor-pointer flex items-center justify-between border-l-2 ${
                        isActive
                          ? 'text-white bg-white/10 font-bold border-[#5b8bff]'
                          : t === 'Aesthetic'
                          ? 'text-[#f3e8ff] hover:text-white hover:bg-purple-500/15 border-transparent font-bold'
                          : 'text-[#ccfbf1] hover:text-white hover:bg-teal-500/15 border-transparent font-bold'
                      }`}
                    >
                      <span className="font-bold tracking-wide text-white/95">{t}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 3: Daily Check */}
          <div className="mt-1">
            <button
              onClick={() => toggleGroup('g3')}
              className="w-full flex items-center justify-between px-5 py-2.5 text-[13.5px] font-semibold text-[#e4e8f7] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#8b93b4]" />
                <span>Daily Check</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7f88ac] transition-transform duration-200 ${
                  collapsedGroups.g3 ? '-rotate-90' : ''
                }`}
              />
            </button>

            {!collapsedGroups.g3 && (
              <div className="flex flex-col">
                {['SMT Summary', 'MI Summary', 'Mobile Summary'].map((chk) => {
                  const isActive = activeNav.type === 'check' && activeNav.value === chk;
                  const isSMTSummary = chk === 'SMT Summary';
                  const isMISummary = chk === 'MI Summary';
                  return (
                    <button
                      key={chk}
                      id={
                        isMISummary
                          ? 'btn-nav-mi-summary'
                          : isSMTSummary
                          ? 'btn-nav-smt-summary'
                          : undefined
                      }
                      onClick={() => handleSelectNav('check', chk)}
                      className={`text-left pl-11 pr-4 py-2.5 text-[13px] font-bold transition-all cursor-pointer flex items-center justify-between border-l-2 ${
                        isActive
                          ? 'text-white bg-white/10 font-bold border-[#5b8bff]'
                          : isMISummary
                          ? 'text-[#fef3c7] hover:text-white hover:bg-amber-500/15 border-transparent font-bold'
                          : isSMTSummary
                          ? 'text-[#eef2ff] hover:text-white hover:bg-blue-500/15 border-transparent font-bold'
                          : 'text-[#e0e7ff] hover:text-white hover:bg-indigo-500/15 border-transparent font-bold'
                      }`}
                    >
                      <span className="font-bold tracking-wide text-white/95">{chk}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Single Item: Database */}
          <div className="pt-2">
            <button
              onClick={() => handleSelectNav('database', 'Database')}
              className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] font-semibold transition-colors cursor-pointer border-l-2 ${
                activeNav.type === 'database'
                  ? 'bg-[#16296b] text-white border-[#5b8bff]'
                  : 'text-[#c7cee6] hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Database className="w-4 h-4 text-[#7f88ac]" />
              <span>Database</span>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom: Home */}
        <div className="p-3 border-t border-white/10 mt-auto">
          <button
            id="btn-sidebar-bottom-home"
            onClick={() => handleSelectNav('home', 'Home')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
              activeNav.type === 'home'
                ? 'bg-[#16296b] text-white border-l-2 border-[#5b8bff]'
                : 'text-[#c7cee6] hover:text-white hover:bg-white/10'
            }`}
            title="Return to PCBA Quality Portal Home"
          >
            <Home className="w-4 h-4 text-[#8b93b4]" />
            <span>Home</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER                                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f2f4f9] h-full overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e4e8f1] px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-[#eef1f7] text-[#17203a] hover:bg-[#e3e7f1] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="text-left cursor-pointer group"
              title="Return to Home page"
            >
              <div className="text-[19px] font-extrabold text-[#122065] group-hover:text-[#2563eb] transition-colors leading-tight">
                Quality Management
              </div>
              <div className="text-[12px] font-semibold text-[#5b6478] group-hover:text-[#2563eb]/80 transition-colors">
                PCB &amp; PCBA
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* User Chip */}
            <div className="flex items-center gap-2.5 cursor-pointer bg-white hover:bg-[#fafbfd] px-2.5 py-1 rounded-lg transition-colors">
              <div className="w-[34px] h-[34px] rounded-full bg-[#0c1a3f] text-white flex items-center justify-center font-bold text-xs">
                QM
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[13.5px] font-bold text-[#17203a] leading-none">
                  QM Inspector
                </div>
                <div className="text-[11px] text-[#5b6478] mt-0.5 leading-none">
                  qm.pcba26@gmail.com
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9399ab] hidden sm:block" />
            </div>

            {/* Back to PCBA Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef1f7] hover:bg-[#e3e7f1] text-[#122065] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              title="Return to PCBA Quality"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to PCBA</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-7 max-w-[1400px] w-full mx-auto space-y-5">
          {activeNav.type === 'home' ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top Banner Header */}
              <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-2xl shadow-md border border-[#234b73] px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/15">
                    🔍
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white m-0">
                        Daily PCBA Report
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectNav('database', 'Database')}
                    className="px-3.5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>All Database</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Metric Cards matching reference image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.totalRecords}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Total Records
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.todayRecords}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Entries Today
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.totalChecked.toLocaleString()}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Units Checked (QC)
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.failRate}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Overall Fail Rate
                  </div>
                </div>
              </div>

              {/* Quick Entry Portals Section matching reference image */}
              <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-xs">
                <header className="px-5 py-3.5 flex items-center justify-between font-bold text-[14px] text-[#1c2733] border-b border-[#e2e8f0] bg-gradient-to-r from-[#f8fafc] to-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse" />
                    <span>Quick Entry Portals</span>
                    <span className="text-[11px] font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                      6 Quality Portals
                    </span>
                  </div>
                  <span className="text-xs text-[#64748b] font-medium hidden sm:inline">
                    Click any module to open live data entry form
                  </span>
                </header>
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SMT Line Inspection - Sapphire Blue */}
                    <div
                      onClick={() => handleSelectNav('line', 'SMT Line-01')}
                      className="group relative bg-gradient-to-br from-[#eff6ff] via-white to-[#dbeafe]/40 border-2 border-[#bfdbfe] hover:border-[#2563eb] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#2563eb]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white shadow-md shadow-blue-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]">
                            SMT AOI
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#2563eb] transition-colors m-0 flex items-center gap-1.5">
                          SMT Line Inspection
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          High-speed surface mount, pick-and-place AOI defect data entry
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#bfdbfe]/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e40af]">
                            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                            <span className="font-mono font-bold">{homeStats.smtCount}</span>
                            <span className="text-[#64748b] font-normal">records saved</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#2563eb] group-hover:translate-x-1 transition-transform">
                            <span>Enter Data</span>
                            <span className="text-sm">→</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#bfdbfe]/40 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'SMT Line-01');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100/90 hover:bg-blue-200 text-[#1d4ed8] transition-colors"
                          >
                            Line-01 (578)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'SMT Line-02');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 hover:bg-cyan-200 text-[#0e7490] transition-colors border border-cyan-300/60 font-mono shadow-2xs"
                          >
                            Line-02 (248)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'SMT Line-03');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 hover:bg-violet-200 text-[#6d28d9] transition-colors border border-violet-300/60 font-mono shadow-2xs"
                          >
                            Line-03 (138)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'SMT Line-04');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100/90 hover:bg-indigo-200 text-[#4338ca] transition-colors"
                          >
                            Line-04 (424)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'SMT Line-05');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-[#be123c] transition-colors border border-rose-300/60 font-mono shadow-2xs"
                          >
                            Line-05 (237)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* MI Line Inspection - Emerald Green */}
                    <div
                      onClick={() => handleSelectNav('line', 'MI Line-01')}
                      className="group relative bg-gradient-to-br from-[#ecfdf5] via-white to-[#d1fae5]/40 border-2 border-[#a7f3d0] hover:border-[#10b981] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#10b981]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01M10 7h4M10 17h4M7 10v4M17 10v4" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
                            MI Manual
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#059669] transition-colors m-0 flex items-center gap-1.5">
                          MI Line Inspection
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Manual insertion, through-hole solder &amp; component defect entry
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#a7f3d0]/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#065f46]">
                            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                            <span className="font-mono font-bold">{homeStats.miCount}</span>
                            <span className="text-[#64748b] font-normal">records saved</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#059669] group-hover:translate-x-1 transition-transform">
                            <span>Enter Data</span>
                            <span className="text-sm">→</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#a7f3d0]/60 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'MI Line-01');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-[#047857] transition-colors border border-emerald-300/60 font-mono shadow-2xs"
                          >
                            Line-01 (2,610)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectNav('line', 'MI Line - Charger');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-[#047857] transition-colors border border-emerald-300/60 font-mono shadow-2xs"
                          >
                            Charger (128)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Daily SMT QM Report - Purple & Indigo */}
                    <div
                      onClick={() => handleSelectNav('check', 'SMT Summary')}
                      className="group relative bg-gradient-to-br from-[#f5f3ff] via-white to-[#ede9fe]/40 border-2 border-[#ddd6fe] hover:border-[#7c3aed] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(124,58,237,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#7c3aed]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white shadow-md shadow-purple-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]">
                            SMT Summary
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#7c3aed] transition-colors m-0 flex items-center gap-1.5">
                          Daily SMT QM Report
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Daily quality management inspection summary &amp; FPY for SMT lines
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#ddd6fe]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b21b6]">
                          <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                          <span className="font-mono font-bold">{homeStats.smtCount}</span>
                          <span className="text-[#64748b] font-normal">records saved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#7c3aed] group-hover:translate-x-1 transition-transform">
                          <span>Enter Data</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Daily MI QM Report - Tangerine & Amber */}
                    <div
                      onClick={() => handleSelectNav('check', 'MI Summary')}
                      className="group relative bg-gradient-to-br from-[#fff7ed] via-white to-[#ffedd5]/40 border-2 border-[#fed7aa] hover:border-[#ea580c] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(234,88,12,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#ea580c]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white shadow-md shadow-orange-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                              <path d="M15 18H9" />
                              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10" />
                              <circle cx="17" cy="18" r="2" />
                              <circle cx="7" cy="18" r="2" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa]">
                            MI Summary
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#ea580c] transition-colors m-0 flex items-center gap-1.5">
                          Daily MI QM Report
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Daily quality management inspection summary &amp; wave solder for MI lines
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#fed7aa]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9a3412]">
                          <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                          <span className="font-mono font-bold">{homeStats.miCount}</span>
                          <span className="text-[#64748b] font-normal">records saved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#ea580c] group-hover:translate-x-1 transition-transform">
                          <span>Enter Data</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Defect: Aesthetic Inspection - Purple & Violet */}
                    <div
                      onClick={() => handleSelectNav('defectType', 'Aesthetic')}
                      className="group relative bg-gradient-to-br from-[#faf5ff] via-white to-[#f3e8ff]/50 border-2 border-[#e9d5ff] hover:border-[#8b5cf6] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(139,92,246,0.25)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#8b5cf6]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white shadow-md shadow-purple-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]">
                            Mobile Defect
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#8b5cf6] transition-colors m-0 flex items-center gap-1.5">
                          Aesthetic Inspection
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Visual &amp; cosmetic inspection for Walton mobile PCBAs (Axion, NEXG, ZENX, Olvio)
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#e9d5ff]/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6b21a8]">
                            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                            <span className="font-mono font-bold">{homeStats.aestheticCount || 566}</span>
                            <span className="text-[#64748b] font-normal">records saved</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#8b5cf6] group-hover:translate-x-1 transition-transform">
                            <span>Open Portal</span>
                            <span className="text-sm">→</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#e9d5ff]/60 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#6b21a8] border border-purple-200 font-mono">
                            566 Records
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#7c3aed] border border-purple-200 font-mono">
                            1,872 Defects
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#7c3aed] border border-purple-200 font-mono">
                            38 Types
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Defect: Functional Inspection - Teal & Cyan */}
                    <div
                      onClick={() => handleSelectNav('defectType', 'Function')}
                      className="group relative bg-gradient-to-br from-[#f0fdfa] via-white to-[#ccfbf1]/50 border-2 border-[#99f6e4] hover:border-[#0d9488] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(13,148,136,0.25)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#0d9488]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-white shadow-md shadow-teal-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Radio className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4]">
                            Mobile Defect
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#0d9488] transition-colors m-0 flex items-center gap-1.5">
                          Functional Inspection
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Electrical, RF calibration, audio, camera &amp; sensor testing for Walton mobile PCBAs
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#99f6e4]/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f766e]">
                            <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
                            <span className="font-mono font-bold">{homeStats.functionCount || 548}</span>
                            <span className="text-[#64748b] font-normal">records saved</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#0d9488] group-hover:translate-x-1 transition-transform">
                            <span>Open Portal</span>
                            <span className="text-sm">→</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#99f6e4]/60 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-[#0f766e] border border-teal-200 font-mono">
                            548 Records
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0d9488] border border-teal-200 font-mono">
                            1,873 Defects
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0d9488] border border-teal-200 font-mono">
                            25 Types
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeNav.type === 'line' ? (
            activeNav.value.includes('Charger') || activeNav.value === 'MI Line-02' ? (
              <MILineChargerDefectEntry
                key={activeNav.value}
                lineName={activeNav.value}
                onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
              />
            ) : activeNav.value.startsWith('MI') ? (
              <MILineDefectEntry
                key={activeNav.value}
                lineName={activeNav.value}
                onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
              />
            ) : (
              <AOILineDefectEntry
                key={activeNav.value}
                lineName={activeNav.value}
                onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
              />
            )
          ) : activeNav.type === 'check' && activeNav.value === 'SMT Summary' ? (
            <DailyQMReportSMT
              onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
            />
          ) : activeNav.type === 'check' && activeNav.value === 'MI Summary' ? (
            <DailyQMReportMI
              onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
            />
          ) : activeNav.type === 'defectType' && activeNav.value === 'Aesthetic' ? (
            <MobileAestheticDefectPortal
              onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
            />
          ) : activeNav.type === 'defectType' && activeNav.value === 'Function' ? (
            <MobileFunctionDefectPortal
              onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
            />
          ) : (
            <>
              {/* Page Heading & Breadcrumb */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-[10px] bg-[#e9eefc] text-[#2b62e8] flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-[22px] font-extrabold text-[#122065] leading-tight">
                      Report Entry
                    </h1>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-[#9399ab] font-medium mt-0.5">
                      <Home className="w-3.5 h-3.5" />
                      <span>Database</span>
                      <span>/</span>
                      <span className="text-[#5b6478] font-semibold">
                        {activeNav.type === 'line'
                          ? `Line Wise Defect / ${activeNav.value}`
                          : activeNav.type === 'defectType'
                          ? `Mobile Defect / ${activeNav.value}`
                          : activeNav.type === 'check'
                          ? `Daily Check / ${activeNav.value}`
                          : 'Report Entry'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Today Date Pill */}
                <div className="flex items-center gap-2 bg-white border border-[#e4e8f1] px-3.5 py-2 rounded-[9px] text-[13px] font-semibold text-[#17203a] shadow-xs">
                  <Calendar className="w-4 h-4 text-[#2b62e8]" />
                  <span>Date: {todayFormatted}</span>
                </div>
              </div>

          {/* ========================================================================= */}
          {/* FILTER CARD                                                               */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#e4e8f1] rounded-[10px] p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3.5 items-end">
              {/* Date From */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#5b6478]">Date From</label>
                <input
                  type="date"
                  value={fDateFrom}
                  onChange={(e) => setFDateFrom(e.target.value)}
                  className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-2.5 py-2 text-[13px] text-[#17203a] outline-none transition-colors"
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#5b6478]">Date To</label>
                <input
                  type="date"
                  value={fDateTo}
                  onChange={(e) => setFDateTo(e.target.value)}
                  className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-2.5 py-2 text-[13px] text-[#17203a] outline-none transition-colors"
                />
              </div>

              {/* Line */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#5b6478]">Line</label>
                <select
                  value={fLine}
                  onChange={(e) => setFLine(e.target.value)}
                  className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-2.5 py-2 text-[13px] text-[#17203a] outline-none transition-colors cursor-pointer"
                >
                  <option value="">All Line</option>
                  {LINES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Defect Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#5b6478]">Defect Type</label>
                <select
                  value={fType}
                  onChange={(e) => setFType(e.target.value)}
                  className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-2.5 py-2 text-[13px] text-[#17203a] outline-none transition-colors cursor-pointer"
                >
                  <option value="">All Defect</option>
                  <option value="Aesthetic">Aesthetic</option>
                  <option value="Function">Function</option>
                </select>
              </div>

              {/* Model / Part No. */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#5b6478]">Model / Part No.</label>
                <input
                  type="text"
                  value={fModel}
                  onChange={(e) => setFModel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter model or part no."
                  className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-2.5 py-2 text-[13px] text-[#17203a] outline-none transition-colors placeholder:text-[#9399ab]"
                />
              </div>

              {/* Search Button */}
              <div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full bg-[#2b62e8] hover:bg-[#1d4fcc] text-white font-bold text-[13px] px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>

              {/* Reset Button */}
              <div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-[#eef1f7] hover:bg-[#e3e7f1] text-[#17203a] font-bold text-[13px] px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#5b6478]" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AUTO DATABASE TABLE CARD                                                  */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#e4e8f1] rounded-[10px] shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-[#e4e8f1] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-[16.5px] font-extrabold text-[#122065] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#2b62e8]" />
                  <span>Auto Database</span>
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Firestore: pcba_reports</span>
                </div>
                <span className="bg-[#eef1f7] text-[#5b6478] text-[11.5px] font-bold px-2.5 py-1 rounded-full">
                  Total: {data.length}
                </span>
                {filteredData.length !== data.length && (
                  <span className="bg-[#e9eefc] text-[#2b62e8] text-[11.5px] font-bold px-2 py-0.5 rounded-full">
                    Filtered: {filteredData.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="bg-[#2b62e8] hover:bg-[#1d4fcc] text-white font-bold text-[13px] px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Report</span>
              </button>
            </div>

            {/* Scrollable Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-[#f7f8fc] border-b border-[#e4e8f1] text-[#5b6478] text-[11.5px] font-bold tracking-wider uppercase text-left">
                    <th className="py-3 px-4 w-14">SL</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Line / Section</th>
                    <th className="py-3 px-4">Model / Part No.</th>
                    <th className="py-3 px-4">Defect Type</th>
                    <th className="py-3 px-4">Defect Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Created By</th>
                    <th className="py-3 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f6] text-[13px]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <Loader2 className="w-8 h-8 text-[#2b62e8] animate-spin" />
                          <span className="text-sm font-semibold text-[#122065]">
                            Loading records from Firestore (<code className="font-mono text-[#2b62e8]">pcba_reports</code>)...
                          </span>
                          <span className="text-xs text-[#64748b]">Real-time cloud database synchronization</span>
                        </div>
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-[#9399ab] font-medium text-[13.5px]">
                        No matching reports found in database.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r, idx) => {
                      const sl = startIndex + idx + 1;
                      return (
                        <tr key={r.id} className="hover:bg-[#fafbfe] transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-[#5b6478]">{sl}</td>
                          <td className="py-3 px-4 font-mono text-[#17203a]">{r.date}</td>
                          <td className="py-3 px-4 font-semibold text-[#122065]">{r.line}</td>
                          <td className="py-3 px-4 font-bold text-[#17203a]">{r.model}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[12px] font-semibold ${
                                r.type === 'Aesthetic' ? 'text-[#8e5fc9]' : 'text-[#20b6a4]'
                              }`}
                            >
                              {r.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#17203a] max-w-[220px] truncate" title={r.desc}>
                            {r.desc}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#17203a]">
                            {r.qty}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-[11.5px] font-bold ${
                                r.status === 'Open'
                                  ? 'bg-[#fde7e8] text-[#d5323f]'
                                  : r.status === 'In Progress'
                                  ? 'bg-[#fdf1da] text-[#c9821a]'
                                  : 'bg-[#e1f6e8] text-[#1f9d51]'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11.5px] text-[#64748b] font-mono truncate max-w-[130px]" title={r.createdBy || 'System'}>
                            {r.createdBy ? r.createdBy.split('@')[0] : 'qa-team'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(r)}
                                className="w-[30px] h-[30px] rounded-[7px] bg-[#2b62e8] hover:bg-[#1d4fcc] text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit Report"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === r.id}
                                onClick={() => handleDeleteRecord(r.id)}
                                className="w-[30px] h-[30px] rounded-[7px] bg-[#f4363c] hover:bg-[#d9282e] disabled:bg-[#fca5a5] text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete Report"
                              >
                                {deletingId === r.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Showing & Pagination */}
            <div className="p-4 sm:px-6 border-t border-[#e4e8f1] flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12.5px] text-[#5b6478] font-medium">
                {filteredData.length === 0
                  ? 'Showing 0 of 0 entries'
                  : `Showing ${startIndex + 1} to ${Math.min(
                      startIndex + PAGE_SIZE,
                      filteredData.length
                    )} of ${filteredData.length} entries`}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={effectivePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="min-w-[32px] h-[32px] px-2 rounded-[7px] border border-[#e4e8f1] bg-white text-[12.5px] font-bold text-[#5b6478] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2b62e8] hover:text-[#2b62e8] transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - effectivePage) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="px-1 text-xs text-[#9399ab]">…</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[32px] h-[32px] px-2 rounded-[7px] border text-[12.5px] font-bold transition-colors cursor-pointer flex items-center justify-center ${
                            p === effectivePage
                              ? 'bg-[#2b62e8] border-[#2b62e8] text-white'
                              : 'bg-white border-[#e4e8f1] text-[#5b6478] hover:border-[#2b62e8] hover:text-[#2b62e8]'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={effectivePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="min-w-[32px] h-[32px] px-2 rounded-[7px] border border-[#e4e8f1] bg-white text-[12.5px] font-bold text-[#5b6478] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2b62e8] hover:text-[#2b62e8] transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT MODAL                                                          */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c122d]/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[14px] w-full max-w-[560px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[#e4e8f1]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e8f1]">
              <h3 className="text-[16.5px] font-extrabold text-[#122065] m-0">
                {editingRecord ? 'Edit Report' : 'Add New Report'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#f2f4f9] text-[#5b6478] hover:bg-[#e4e8f1] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveReport} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">Date</label>
                  <input
                    type="date"
                    required
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none"
                  />
                </div>

                {/* Line / Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">Line / Section</label>
                  <select
                    value={mLine}
                    onChange={(e) => setMLine(e.target.value)}
                    className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none cursor-pointer"
                  >
                    {LINES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model / Part No. */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">
                    Model / Part No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEXG N77"
                    value={mModel}
                    onChange={(e) => {
                      setMModel(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className={`w-full bg-[#fafbfd] focus:bg-white border rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none ${
                      formError ? 'border-red-500' : 'border-[#e4e8f1] focus:border-[#2b62e8]'
                    }`}
                  />
                  {formError && <span className="text-[11px] text-red-500">{formError}</span>}
                </div>

                {/* Defect Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">Defect Type</label>
                  <select
                    value={mType}
                    onChange={(e) => setMType(e.target.value as 'Aesthetic' | 'Function')}
                    className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none cursor-pointer"
                  >
                    <option value="Aesthetic">Aesthetic</option>
                    <option value="Function">Function</option>
                  </select>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={mQty}
                    onChange={(e) => setMQty(Number(e.target.value))}
                    className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">Status</label>
                  <select
                    value={mStatus}
                    onChange={(e) =>
                      setMStatus(e.target.value as 'Open' | 'In Progress' | 'Closed')
                    }
                    className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Defect Description (full-width) */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#5b6478]">
                    Defect Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the defect..."
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    className="w-full bg-[#fafbfd] focus:bg-white border border-[#e4e8f1] focus:border-[#2b62e8] rounded-lg px-3 py-2 text-[13px] text-[#17203a] outline-none resize-y"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#e4e8f1]">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eef1f7] hover:bg-[#e3e7f1] disabled:opacity-50 text-[#17203a] font-bold text-[13px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-[#2b62e8] hover:bg-[#1d4fcc] disabled:bg-[#93c5fd] text-white font-bold text-[13px] transition-colors cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Firestore…</span>
                    </>
                  ) : (
                    <span>{editingRecord ? 'Update Report' : 'Save Report'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST NOTIFICATION                                                        */}
      {/* ========================================================================= */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-[9px] text-[13px] font-semibold shadow-2xl flex items-center gap-2.5 z-50 animate-in slide-in-from-bottom-3 duration-200 text-white ${
            toast.type === 'success' ? 'bg-[#0f6b38] border border-[#34a853]' : 'bg-[#c5221f] border border-[#ea4335]'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-[#a8f5c4] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#fcdad7] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
