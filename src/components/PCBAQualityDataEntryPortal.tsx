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
  CheckSquare,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

import { AOILineDefectEntry } from './AOILineDefectEntry';
import { MILineDefectEntry } from './MILineDefectEntry';
import { MILineChargerDefectEntry } from './MILineChargerDefectEntry';
import { DailyQMReportSMT } from './DailyQMReportSMT';
import { DailyQMReportMI } from './DailyQMReportMI';

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
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      onClose();
    }
  };
  // Stored state for reports
  const [data, setData] = useState<ReportRecord[]>(() => {
    const saved = localStorage.getItem('pcba_report_database_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return generateSeedData();
      }
    }
    return generateSeedData();
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pcba_report_database_records', JSON.stringify(data));
  }, [data]);

  // Sidebar collapsible state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    g1: false, // Line Wise Defect
    g2: false, // Mobile Defect
    g3: false, // Daily Check
  });

  // Mobile sidebar overlay state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Active navigation selection
  const [activeNav, setActiveNav] = useState<{ type: string; value: string }>(() => {
    if (initialNav) return initialNav;
    return {
      type: 'line',
      value: initialLine,
    };
  });

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
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
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

    if (type === 'database') {
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
    return data.filter((r) => {
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

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mModel.trim()) {
      setFormError('Model / Part No. is required');
      return;
    }

    if (editingRecord) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id
            ? {
                ...item,
                date: mDate,
                line: mLine,
                model: mModel.trim(),
                type: mType,
                qty: Math.max(1, mQty),
                status: mStatus,
                desc: mDesc.trim() || '—',
              }
            : item
        )
      );
      showToast('Report updated successfully');
    } else {
      const newRecord: ReportRecord = {
        id: `rep-${Date.now()}`,
        date: mDate || fmtDate(new Date()),
        line: mLine,
        model: mModel.trim(),
        type: mType,
        qty: Math.max(1, mQty),
        status: mStatus,
        desc: mDesc.trim() || '—',
      };
      setData((prev) => [newRecord, ...prev]);
      showToast('New report added successfully');
    }

    setModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    const item = data.find((r) => r.id === id);
    if (!item) return;
    if (window.confirm(`Delete the "${item.desc}" report for ${item.model}?`)) {
      setData((prev) => prev.filter((r) => r.id !== id));
      showToast('Report record deleted');
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
                  const isSMTLine01 = l === 'SMT Line-01';
                  return (
                    <button
                      key={l}
                      id={
                        isSMTLine01
                          ? 'btn-nav-smt-line-01'
                          : isMILine01
                          ? 'btn-nav-mi-line-01'
                          : isMICharger
                          ? 'btn-nav-mi-charger'
                          : undefined
                      }
                      onClick={() => handleSelectNav('line', l)}
                      className={`text-left pl-11 pr-4 py-2.5 text-[13px] transition-all cursor-pointer flex items-center justify-between border-l-2 ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-white/15 to-white/5 font-bold border-[#5b8bff] shadow-xs'
                          : isMICharger
                          ? 'text-[#e6fbf2] hover:text-white hover:bg-emerald-500/10 border-transparent'
                          : isMILine01
                          ? 'text-[#f0f4ff] hover:text-white hover:bg-white/10 border-transparent'
                          : 'text-[#a7aecb] hover:text-white hover:bg-white/5 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            isActive
                              ? 'bg-[#5b8bff]'
                              : isMICharger
                              ? 'bg-emerald-400'
                              : isMILine01
                              ? 'bg-amber-400'
                              : 'bg-[#7f88ac]/40'
                          }`}
                        />
                        <span
                          className={
                            (isMILine01 || isMICharger) && !isActive
                              ? 'font-medium text-white/90'
                              : undefined
                          }
                        >
                          {l}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all ${
                          isActive
                            ? 'bg-[#5b8bff] text-white shadow-xs'
                            : isMICharger
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : isMILine01
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : isSMTLine01
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-white/5 text-[#8b93b4]'
                        }`}
                      >
                        {isSMTLine01
                          ? 'AOI Entry'
                          : isMICharger
                          ? 'Charger Entry'
                          : isMILine01
                          ? 'MI Entry'
                          : 'Entry'}
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
                      onClick={() => handleSelectNav('defectType', t)}
                      className={`text-left pl-11 pr-5 py-2 text-[13px] transition-colors cursor-pointer flex items-center gap-2 border-l-2 ${
                        isActive
                          ? 'text-white bg-white/10 font-bold border-[#5b8bff]'
                          : 'text-[#a7aecb] hover:text-white hover:bg-white/5 border-transparent'
                      }`}
                    >
                      <span>{t}</span>
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
                      className={`text-left pl-11 pr-4 py-2.5 text-[13px] transition-all cursor-pointer flex items-center justify-between border-l-2 ${
                        isActive
                          ? 'text-white bg-white/10 font-bold border-[#5b8bff]'
                          : isMISummary
                          ? 'text-[#fef3c7] hover:text-white hover:bg-amber-500/10 border-transparent font-medium'
                          : isSMTSummary
                          ? 'text-[#eef2ff] hover:text-white hover:bg-blue-500/10 border-transparent font-medium'
                          : 'text-[#a7aecb] hover:text-white hover:bg-white/5 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            isActive
                              ? 'bg-[#5b8bff]'
                              : isMISummary
                              ? 'bg-amber-400'
                              : isSMTSummary
                              ? 'bg-blue-400'
                              : 'bg-[#7f88ac]/40'
                          }`}
                        />
                        <span>{chk}</span>
                      </div>
                      {isMISummary ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all ${
                            isActive
                              ? 'bg-[#5b8bff] text-white shadow-xs'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          QM Report
                        </span>
                      ) : isSMTSummary ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all ${
                            isActive
                              ? 'bg-[#5b8bff] text-white shadow-xs'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          QM Report
                        </span>
                      ) : null}
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

        {/* Sidebar Bottom: Home / Return to PCBA View */}
        <div className="p-3 border-t border-white/10 mt-auto">
          <button
            id="btn-sidebar-bottom-home"
            onClick={handleGoHome}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-semibold text-[#c7cee6] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Return to Home page"
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
          {activeNav.type === 'line' ? (
            activeNav.value.includes('Charger') || activeNav.value === 'MI Line-02' ? (
              <MILineChargerDefectEntry
                lineName={activeNav.value}
                onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
              />
            ) : activeNav.value.startsWith('MI') ? (
              <MILineDefectEntry
                lineName={activeNav.value}
                onNavigateToDatabase={() => handleSelectNav('database', 'Database')}
              />
            ) : (
              <AOILineDefectEntry
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
                <span className="bg-[#eef1f7] text-[#5b6478] text-[11.5px] font-bold px-2.5 py-1 rounded-full">
                  Total Records: {data.length}
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
              <table className="w-full border-collapse min-w-[920px]">
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
                    <th className="py-3 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f6] text-[13px]">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[#9399ab] font-medium text-[13.5px]">
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
                          <td className="py-3 px-4 text-[#17203a] max-w-[240px] truncate" title={r.desc}>
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
                                onClick={() => handleDeleteRecord(r.id)}
                                className="w-[30px] h-[30px] rounded-[7px] bg-[#f4363c] hover:bg-[#d9282e] text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete Report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eef1f7] hover:bg-[#e3e7f1] text-[#17203a] font-bold text-[13px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#2b62e8] hover:bg-[#1d4fcc] text-white font-bold text-[13px] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  {editingRecord ? 'Update Report' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST NOTIFICATION                                                        */}
      {/* ========================================================================= */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#182347] text-white px-4 py-3 rounded-[9px] text-[13px] font-semibold shadow-xl flex items-center gap-2.5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-[#5ede8c] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
