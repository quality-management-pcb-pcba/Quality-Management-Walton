import React, { useState, useMemo, useEffect } from 'react';
import {
  Smartphone,
  Filter,
  Download,
  Printer,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
  BarChart3,
  Cpu,
  Trash2,
  FileSpreadsheet,
  FileText,
  ListOrdered,
  Settings,
} from 'lucide-react';
import {
  AESTHETIC_DEFECT_RECORDS,
  AestheticDefectRecord,
} from '../data/aestheticDefectRecords';
import { saveMultiplePcbaReports } from '../services/pcbaReportService';

interface MobileAestheticDefectPortalProps {
  onNavigateToDatabase?: () => void;
}

const STORAGE_KEY = 'walton_mobile_aesthetic_defect_records_v2';

export const MobileAestheticDefectPortal: React.FC<MobileAestheticDefectPortalProps> = ({
  onNavigateToDatabase,
}) => {
  // Load records from local storage if modified, or fallback to the master 566 records from the attached inspection file
  const [records, setRecords] = useState<AestheticDefectRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= AESTHETIC_DEFECT_RECORDS.length) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return AESTHETIC_DEFECT_RECORDS;
  });

  // Sync back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      // ignore
    }
  }, [records]);

  // Filter State
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedDefect, setSelectedDefect] = useState('ALL');

  // Pagination State - Standard 15 rows per page as requested
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Add Defect Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Default lists for Manage List functionality
  const DEFAULT_MANAGED_LISTS = {
    models: [
      'Axion_A1100',
      'NEXG N8',
      'NEXG N9',
      'NEXG N71',
      'ORBIT Y21',
      'PRIMO GH11',
      'PRIMO HM7',
      'PRIMO S8',
      'RHINO R1',
      'WALTON RX7',
    ],
    specs: ['4/128 GB', '6/128 GB', '8/128 GB', '4/64 GB', '3/32 GB', '2/32 GB'],
    defects: [
      'ComponentBroken',
      'ScratchMark',
      'DentOnPCB',
      'ColorMismatch',
      'SilkScreenBlur',
      'DustInside',
      'SolderBridge',
      'ComponentMissing',
      'ICBurn',
      'ConnectorDamage',
      'PadDamaged',
      'ForeignObject',
    ],
    stages: ['Mass Production', 'Rework', 'Trial Production', 'Pilot Run'],
  };

  // Manage Lists Modal State with LocalStorage persistence
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeManageTab, setActiveManageTab] = useState<'models' | 'specs' | 'defects' | 'stages'>('models');
  const [modalNewItem, setModalNewItem] = useState('');
  const [managedLists, setManagedLists] = useState<{
    models: string[];
    specs: string[];
    defects: string[];
    stages: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem('walton_aesthetic_managed_lists_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_MANAGED_LISTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('walton_aesthetic_managed_lists_v1', JSON.stringify(managedLists));
    } catch (e) {
      // ignore
    }
  }, [managedLists]);

  const handleAddManagedItem = () => {
    const val = modalNewItem.trim();
    if (!val) return;
    if (managedLists[activeManageTab].some((item) => item.toLowerCase() === val.toLowerCase())) {
      showToast(`"${val}" already exists in ${activeManageTab}!`, 'info');
      return;
    }
    setManagedLists((prev) => ({
      ...prev,
      [activeManageTab]: [...prev[activeManageTab], val],
    }));
    setModalNewItem('');
    showToast(`Added "${val}" to ${activeManageTab}.`, 'success');
  };

  const handleDeleteManagedItem = (tab: 'models' | 'specs' | 'defects' | 'stages', item: string) => {
    setManagedLists((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((i) => i !== item),
    }));
    showToast(`Removed "${item}" from ${tab}.`, 'info');
  };

  const handleResetManagedLists = () => {
    if (window.confirm('Reset lists back to standard defaults?')) {
      setManagedLists(DEFAULT_MANAGED_LISTS);
      localStorage.removeItem('walton_aesthetic_managed_lists_v1');
      showToast('Lists reset to standard defaults.', 'success');
    }
  };

  // Form State for new entry
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newModel, setNewModel] = useState('Axion_A1100');
  const [newSpec, setNewSpec] = useState('4/128 GB');
  const [newStage, setNewStage] = useState('Mass Production');
  const [newShift, setNewShift] = useState('Day');
  const [newDefect, setNewDefect] = useState('ComponentBroken');
  const [newQty, setNewQty] = useState(1);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct Filter & Options derived from current records + managed lists
  const distinctModels = useMemo(() => {
    const s = new Set<string>(managedLists.models);
    records.forEach((r) => r.model && s.add(r.model));
    return Array.from(s).sort();
  }, [records, managedLists.models]);

  const distinctSpecs = useMemo(() => {
    const s = new Set<string>(managedLists.specs);
    records.forEach((r) => r.spec && s.add(r.spec));
    return Array.from(s).sort();
  }, [records, managedLists.specs]);

  const distinctShifts = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.shift && s.add(r.shift));
    return Array.from(s).sort();
  }, [records]);

  const distinctStages = useMemo(() => {
    const s = new Set<string>(managedLists.stages);
    records.forEach((r) => r.stage && s.add(r.stage));
    return Array.from(s).sort();
  }, [records, managedLists.stages]);

  const distinctDefects = useMemo(() => {
    const s = new Set<string>(managedLists.defects);
    records.forEach((r) => r.defect && s.add(r.defect));
    return Array.from(s).sort();
  }, [records, managedLists.defects]);

  // Computed summary metrics
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const totalQty = records.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
    const uniqueDates = new Set(records.map((r) => r.date)).size;
    const uniqueModels = new Set(records.map((r) => r.model)).size;

    // Top Defect
    const defectMap: Record<string, number> = {};
    records.forEach((r) => {
      defectMap[r.desc] = (defectMap[r.desc] || 0) + (Number(r.qty) || 0);
    });
    const sortedDefects = Object.entries(defectMap).sort((a, b) => b[1] - a[1]);
    const topDefect = sortedDefects[0] ? `${sortedDefects[0][0]} (${sortedDefects[0][1]} pcs)` : 'None';

    // Top Stage
    const stageMap: Record<string, number> = {};
    records.forEach((r) => {
      stageMap[r.stage] = (stageMap[r.stage] || 0) + 1;
    });

    return {
      totalRecords,
      totalQty,
      uniqueDates,
      uniqueModels,
      topDefect,
      top5Defects: sortedDefects.slice(0, 5),
      stageMap,
    };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedModel !== 'ALL' && r.model !== selectedModel) return false;
      if (selectedShift !== 'ALL' && r.shift !== selectedShift) return false;
      if (selectedStage !== 'ALL' && r.stage !== selectedStage) return false;
      if (selectedDefect !== 'ALL' && r.defect !== selectedDefect) return false;
      return true;
    });
  }, [records, selectedModel, selectedShift, selectedStage, selectedDefect]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedModel, selectedShift, selectedStage, selectedDefect]);

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedModel('ALL');
    setSelectedShift('ALL');
    setSelectedStage('ALL');
    setSelectedDefect('ALL');
    setCurrentPage(1);
  };

  // Add new defect
  const handleAddDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim()) {
      showToast('Model is required', 'error');
      return;
    }
    if (newQty <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }

    const friendlyDesc = newDefect
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^P C B A/, 'PCBA')
      .replace(/^G N D/, 'GND')
      .replace(/^L E D/, 'LED')
      .replace(/^T Card/, 'T-Card');

    const newRecord: AestheticDefectRecord = {
      id: `aesthetic-user-${Date.now()}`,
      date: newDate,
      line: 'Mobile Line (Aesthetic)',
      product: 'Mobile',
      model: newModel.trim(),
      spec: newSpec.trim(),
      stage: newStage,
      shift: newShift,
      type: 'Aesthetic',
      defect: newDefect,
      desc: friendlyDesc,
      qty: Number(newQty),
      status: 'Closed',
      source: 'User Entered',
      createdAt: Date.now(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Successfully added 1 record for ${newModel}!`, 'success');
  };

  // Delete Record
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this aesthetic record?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('Record deleted.', 'info');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Product', 'Model', 'Spec', 'Stage', 'Shift', 'Defect Code', 'Defect Description', 'Quantity', 'Status', 'Source'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.date,
      r.product,
      `"${r.model.replace(/"/g, '""')}"`,
      `"${r.spec ? r.spec.replace(/"/g, '""') : ''}"`,
      r.stage,
      r.shift,
      r.defect,
      `"${r.desc.replace(/"/g, '""')}"`,
      r.qty,
      r.status,
      r.source || 'Aesthetic Inspection Sheet',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mobile_Aesthetic_Defects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredRecords.length} records to CSV!`, 'success');
  };

  // Sync to Firestore pcba_reports
  const handleSyncToFirestore = async () => {
    try {
      showToast('Syncing records to Firestore pcba_reports...', 'info');
      const batchPayload = records.slice(0, 100).map((r) => ({
        date: r.date,
        line: 'Mobile Line (Aesthetic)',
        model: r.spec ? `${r.model} (${r.spec})` : r.model,
        type: 'Aesthetic' as const,
        desc: r.desc,
        qty: r.qty,
        status: r.status,
        source: 'Aesthetic Inspection Sheet',
        shift: r.shift,
        product: 'Mobile',
        remarks: `${r.stage} - ${r.shift} Shift`,
      }));

      await saveMultiplePcbaReports(batchPayload);
      showToast('Successfully synchronized recent batch to Firestore!', 'success');
    } catch (err: any) {
      console.error('Firestore sync error:', err);
      showToast('Sync failed: ' + (err.message || 'Check connection'), 'error');
    }
  };

  // Reload attached original data
  const handleReloadOriginal = () => {
    if (window.confirm('Reset all aesthetic records to the attached inspection sheet master data (566 records)?')) {
      setRecords(AESTHETIC_DEFECT_RECORDS);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Master data reloaded: 566 records.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-[13px] font-semibold text-white animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-600'
              : toastMessage.type === 'info'
              ? 'bg-blue-600'
              : 'bg-emerald-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMB */}
      <div className="bg-[#0e2439] rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-[#1e3a5f]/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#132d4b] border border-[#204975] flex items-center justify-center text-[#38bdf8] shadow-inner shrink-0">
            <Smartphone className="w-6 h-6 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-none text-white m-0">
                MI Line - Aesthetic Defect Entry
              </h1>
            </div>
            <p className="text-xs text-[#94a3b8] font-medium mt-1">
              PCBA Functional &amp; Cosmetic Fault Inspection — Mobile Line
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToDatabase && (
            <button
              type="button"
              id="btn-go-to-database-aesthetic"
              onClick={onNavigateToDatabase}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#17385c] hover:bg-[#1f4a7a] text-white transition-all flex items-center gap-1.5 cursor-pointer border border-[#275a92] shadow-xs active:scale-95"
            >
              <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Go to Database</span>
            </button>
          )}
          <button
            type="button"
            id="btn-manage-list-aesthetic"
            onClick={() => setIsManageModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#17385c]/80 hover:bg-[#1f4a7a] text-white transition-all flex items-center gap-1.5 cursor-pointer border border-[#275a92] shadow-xs active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-[#c084fc]" />
            <span>⚙ Manage List</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CARD */}
      <div className="bg-white border border-[#e4e8f1] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-4.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/15 border border-indigo-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs border border-white/25">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <span className="text-[14.5px] font-extrabold text-white tracking-wide">
              Aesthetic Report Entry
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Model Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#f8fafc] focus:bg-white border border-[#cbd5e1] focus:border-[#7c3aed] rounded-xl px-3 py-2 text-[13px] text-[#0f172a] outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Models ({distinctModels.length})</option>
              {distinctModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-[#f8fafc] focus:bg-white border border-[#cbd5e1] focus:border-[#7c3aed] rounded-xl px-3 py-2 text-[13px] text-[#0f172a] outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Stages ({distinctStages.length})</option>
              {distinctStages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Shift</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full bg-[#f8fafc] focus:bg-white border border-[#cbd5e1] focus:border-[#7c3aed] rounded-xl px-3 py-2 text-[13px] text-[#0f172a] outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Shifts</option>
              {distinctShifts.map((sh) => (
                <option key={sh} value={sh}>
                  {sh}
                </option>
              ))}
            </select>
          </div>

          {/* Defect Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Defect Type</label>
            <select
              value={selectedDefect}
              onChange={(e) => setSelectedDefect(e.target.value)}
              className="w-full bg-[#f8fafc] focus:bg-white border border-[#cbd5e1] focus:border-[#7c3aed] rounded-xl px-3 py-2 text-[13px] text-[#0f172a] outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Defects ({distinctDefects.length})</option>
              {distinctDefects.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-[13px] flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md active:scale-95 transition-all border border-emerald-400/40"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+Add Entry</span>
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-[#f8fafc] hover:bg-gray-100 text-[#334155] hover:text-[#0f172a] font-bold rounded-xl text-[13px] flex items-center gap-2 cursor-pointer border border-[#cbd5e1] hover:border-[#94a3b8] active:scale-95 transition-all shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Clear Fields</span>
            </button>
          </div>

          {(selectedModel !== 'ALL' || selectedStage !== 'ALL' || selectedShift !== 'ALL' || selectedDefect !== 'ALL') && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
              <span>Filtering: Showing {filteredRecords.length} of {records.length} records</span>
            </div>
          )}
        </div>
      </div>

      {/* DATA TABLE CARD */}
      <div className="bg-white border border-[#e4e8f1] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:px-6 sm:py-4.5 border-b border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-400 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/30 border border-white/30">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-[16.5px] font-black text-white flex items-center gap-2.5 tracking-tight">
              <span>Aesthetic Defect Records</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/25 active:scale-95 transition-all border border-emerald-400/40"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[940px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] text-[11.5px] font-bold tracking-wider uppercase text-left">
                <th className="py-3 px-4 w-14">SL</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Model &amp; Spec</th>
                <th className="py-3 px-4">Production Stage</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Aesthetic Defect Description</th>
                <th className="py-3 px-4 text-center">Defect Code</th>
                <th className="py-3 px-4 text-center">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 font-medium">
                    No aesthetic defect records found matching current filters.
                  </td>
                </tr>
              ) : (
                currentRows.map((r, idx) => {
                  const sl = (currentPage - 1) * pageSize + idx + 1;

                  // Shift Badge Color
                  const shiftColor =
                    r.shift === 'Day'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : r.shift === 'Night'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : r.shift === 'Morning'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                  // Stage Badge Color
                  const stageColor =
                    r.stage === 'Mass Production'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : r.stage === 'Rework'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[#faf5ff]/40 transition-colors group text-[#1e293b]"
                    >
                      {/* SL */}
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-400 font-bold">
                        {sl}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-4 font-semibold text-[#0f172a] whitespace-nowrap">
                        {r.date}
                      </td>

                      {/* Model & Spec */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0f172a]">{r.model}</span>
                          {r.spec && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                              {r.spec}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Production Stage */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stageColor}`}
                        >
                          {r.stage}
                        </span>
                      </td>

                      {/* Shift */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${shiftColor}`}
                        >
                          {r.shift}
                        </span>
                      </td>

                      {/* Defect Description */}
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-[#7c3aed] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                          <span>{r.desc}</span>
                        </span>
                      </td>

                      {/* Defect Raw Code */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          {r.defect}
                        </span>
                      </td>

                      {/* Qty */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                          {r.qty}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-[#e4e8f1] flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#64748b]">
            <span>
              Showing{' '}
              <span className="font-bold text-[#0f172a]">
                {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-[#0f172a]">
                {Math.min(currentPage * pageSize, filteredRecords.length)}
              </span>{' '}
              of <span className="font-bold text-[#0f172a]">{filteredRecords.length}</span> records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 4) {
                    pages.push(1, 2, 3, 4, 5, '...', totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                }
                return pages.map((page, pIdx) => {
                  if (page === '...') {
                    return (
                      <span key={`dots-${pIdx}`} className="px-1.5 text-xs text-gray-400 font-bold">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = page === currentPage;
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-8 h-8 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            {/* Jump to page */}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 text-xs text-gray-600">
              <span className="font-semibold">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = parseInt(jumpPageInput, 10);
                    if (!isNaN(target) && target >= 1 && target <= totalPages) {
                      setCurrentPage(target);
                      setJumpPageInput('');
                    }
                  }
                }}
                placeholder={String(currentPage)}
                className="w-12 px-2 py-1 text-center bg-gray-50 border border-gray-300 rounded-md text-xs font-bold text-gray-800 outline-none focus:border-purple-600"
              />
              <button
                type="button"
                onClick={() => {
                  const target = parseInt(jumpPageInput, 10);
                  if (!isNaN(target) && target >= 1 && target <= totalPages) {
                    setCurrentPage(target);
                    setJumpPageInput('');
                  }
                }}
                className="px-2 py-1 bg-gray-100 hover:bg-purple-600 hover:text-white rounded-md text-[11px] font-bold text-gray-700 transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW AESTHETIC DEFECT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-[#0f172a]">New Aesthetic Defect Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDefect} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Inspection Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                  required
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Model</label>
                <input
                  type="text"
                  list="model-options"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Select or enter mobile model"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                  required
                />
                <datalist id="model-options">
                  {distinctModels.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {/* Spec */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Spec / RAM-ROM</label>
                <input
                  type="text"
                  list="spec-options"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  placeholder="Select or enter spec (e.g. 4/128 GB)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                />
                <datalist id="spec-options">
                  {distinctSpecs.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Stage & Shift */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                  >
                    {distinctStages.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Shift</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                  >
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              {/* Defect Code & Qty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Aesthetic Defect</label>
                  <select
                    value={newDefect}
                    onChange={(e) => setNewDefect(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                  >
                    {distinctDefects.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Defect Qty (pcs)</label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md shadow-purple-500/25 transition-all active:scale-95"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE LISTS MODAL */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0e2439] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Settings className="w-4 h-4" />
                </div>
                <span>Manage Lists — Aesthetic Defect Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#e2e8f0] bg-[#fafbfc]">
              {(
                [
                  { key: 'models', label: 'Models' },
                  { key: 'specs', label: 'Specs' },
                  { key: 'defects', label: 'Defects' },
                  { key: 'stages', label: 'Stages' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveManageTab(tab.key);
                    setModalNewItem('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                    activeManageTab === tab.key
                      ? 'text-[#2563eb] border-[#2563eb] bg-white'
                      : 'text-[#64748b] border-transparent hover:text-[#1e293b]'
                  }`}
                >
                  {tab.label} ({managedLists[tab.key].length})
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddManagedItem();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={modalNewItem}
                  onChange={(e) => setModalNewItem(e.target.value)}
                  placeholder={`New ${activeManageTab === 'models' ? 'model name' : activeManageTab === 'specs' ? 'RAM/ROM spec' : activeManageTab === 'defects' ? 'aesthetic defect type' : 'stage name'}`}
                  className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0e2439] hover:bg-[#163b5e] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  + Add
                </button>
              </form>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {managedLists[activeManageTab].length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">
                    No items in {activeManageTab}. Add one above!
                  </div>
                ) : (
                  managedLists[activeManageTab].map((item: string) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-2.5 border border-[#e2e8f0] rounded-lg bg-[#fafbfc] text-xs font-semibold text-[#1e293b] hover:border-[#cbd5e1] transition-all"
                    >
                      <span className="truncate pr-2">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteManagedItem(activeManageTab, item)}
                        className="text-[#dc2626] hover:bg-rose-50 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetManagedLists}
                className="text-[11.5px] font-semibold text-gray-500 hover:text-gray-800 underline transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-1.5 bg-[#0e2439] hover:bg-[#183959] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
