import React, { useState, useMemo, useEffect } from 'react';
import {
  Smartphone,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
  BarChart3,
  Cpu,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AESTHETIC_DEFECT_RECORDS,
  AestheticDefectRecord,
} from '../data/aestheticDefectRecords';
import { saveMultiplePcbaReports } from '../services/pcbaReportService';

interface MobileAestheticDefectPortalProps {
  onNavigateToDatabase?: () => void;
}

const STORAGE_KEY = 'mobile_aesthetic_defect_records_v1';

export const MobileAestheticDefectPortal: React.FC<MobileAestheticDefectPortalProps> = ({
  onNavigateToDatabase,
}) => {
  // Load records from local storage if modified, or fallback to the master 566 records
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedDefect, setSelectedDefect] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Add Defect Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

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

  // Distinct Filter Options derived from current records
  const distinctModels = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.model && s.add(r.model));
    return Array.from(s).sort();
  }, [records]);

  const distinctShifts = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.shift && s.add(r.shift));
    return Array.from(s).sort();
  }, [records]);

  const distinctStages = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.stage && s.add(r.stage));
    return Array.from(s).sort();
  }, [records]);

  const distinctDefects = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.defect && s.add(r.defect));
    return Array.from(s).sort();
  }, [records]);

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
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          r.model.toLowerCase().includes(query) ||
          r.defect.toLowerCase().includes(query) ||
          r.desc.toLowerCase().includes(query) ||
          r.stage.toLowerCase().includes(query) ||
          r.shift.toLowerCase().includes(query) ||
          r.date.includes(query) ||
          (r.spec && r.spec.toLowerCase().includes(query));
        if (!match) return false;
      }

      return true;
    });
  }, [records, selectedModel, selectedShift, selectedStage, selectedDefect, dateFrom, dateTo, searchTerm]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedModel, selectedShift, selectedStage, selectedDefect, dateFrom, dateTo, searchTerm]);

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedModel('ALL');
    setSelectedShift('ALL');
    setSelectedStage('ALL');
    setSelectedDefect('ALL');
    setDateFrom('');
    setDateTo('');
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
      <div className="bg-gradient-to-r from-[#17203a] via-[#1a2b58] to-[#121c3b] rounded-2xl p-6 text-white shadow-md border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-400/30">
                  Mobile Defect
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                  Attached Sheet: 566 Records
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/30">
                  Total Defects: 1,872 pcs
                </span>
              </div>
              <h1 className="text-2xl sm:text-[26px] font-black tracking-tight leading-none text-white">
                Aesthetic Defect Inspection Portal
              </h1>
              <p className="text-[13px] text-[#cbd5e1] mt-1.5 max-w-3xl leading-snug">
                Walton mobile phone PCBA visual inspection dataset covering Axion, NEXG, ZENX, XANON, Orbit, and Olvio series across Mass Production, Rework, and Trial stages.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-[13px] px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-500/25 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-[13px] px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-colors border border-white/15 cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToFirestore}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-[13px] px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-colors border border-white/15 cursor-pointer"
              title="Sync to Firestore pcba_reports"
            >
              <Database className="w-4 h-4 text-blue-300" />
              <span>Sync Cloud</span>
            </button>

            <button
              type="button"
              onClick={handleReloadOriginal}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-[13px] px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border border-white/15 cursor-pointer"
              title="Reload original attached sheet (566 records)"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              <span className="text-xs">Reset Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Records */}
        <div className="bg-white border border-[#e4e8f1] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center shrink-0 border border-purple-100">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">
              Total Records
            </div>
            <div className="text-2xl font-black text-[#0f172a] leading-none mt-1">
              {stats.totalRecords.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              100% complete from sheet
            </div>
          </div>
        </div>

        {/* Card 2: Total Defect Qty */}
        <div className="bg-white border border-[#e4e8f1] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">
              Defect Qty
            </div>
            <div className="text-2xl font-black text-[#0f172a] leading-none mt-1">
              {stats.totalQty.toLocaleString()} <span className="text-xs font-semibold text-gray-500">pcs</span>
            </div>
            <div className="text-[11px] text-rose-500 font-semibold mt-1">
              Across all production
            </div>
          </div>
        </div>

        {/* Card 3: Days Inspected */}
        <div className="bg-white border border-[#e4e8f1] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">
              Inspection Days
            </div>
            <div className="text-2xl font-black text-[#0f172a] leading-none mt-1">
              {stats.uniqueDates} <span className="text-xs font-semibold text-gray-500">Days</span>
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">
              Jun 2026 – Sep 2026
            </div>
          </div>
        </div>

        {/* Card 4: Mobile Models */}
        <div className="bg-white border border-[#e4e8f1] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">
              Mobile Models
            </div>
            <div className="text-2xl font-black text-[#0f172a] leading-none mt-1">
              {stats.uniqueModels} <span className="text-xs font-semibold text-gray-500">Models</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              Axion, NEXG, ZENX, Olvio
            </div>
          </div>
        </div>

        {/* Card 5: Top Defect Category */}
        <div className="bg-white border border-[#e4e8f1] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">
              Top Defect
            </div>
            <div className="text-[14px] font-black text-[#0f172a] leading-tight mt-1 line-clamp-1">
              {stats.topDefect}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">
              Component Broken
            </div>
          </div>
        </div>
      </div>

      {/* TOP DEFECTS SUMMARY BAR */}
      <div className="bg-white border border-[#e4e8f1] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#7c3aed]" />
            <h3 className="text-[14px] font-extrabold text-[#0f172a]">
              Top 5 Aesthetic Defects Distribution
            </h3>
          </div>
          <span className="text-[11.5px] font-semibold text-[#64748b]">
            Ranked by Defect Quantity (pcs)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {stats.top5Defects.map(([name, count], idx) => {
            const pct = Math.round((count / stats.totalQty) * 100);
            return (
              <div
                key={name}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-[#334155] line-clamp-1">{name}</span>
                  <span className="text-[11px] font-black text-[#7c3aed]">#{idx + 1}</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-black text-[#0f172a]">{count} pcs</span>
                  <span className="text-xs font-bold text-gray-500">{pct}%</span>
                </div>
                <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-[#8b5cf6] h-full rounded-full"
                    style={{ width: `${Math.min(100, pct * 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH CARD */}
      <div className="bg-white border border-[#e4e8f1] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#7c3aed]" />
            <span className="text-[14px] font-bold text-[#0f172a]">Filter & Search Records</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Showing {filteredRecords.length} of {records.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-[#64748b] hover:text-[#0f172a] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Search Box */}
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-[12px] font-bold text-[#475569]">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Model, defect, stage, shift..."
                className="w-full bg-[#f8fafc] focus:bg-white border border-[#cbd5e1] focus:border-[#7c3aed] rounded-xl pl-9 pr-3 py-2 text-[13px] text-[#0f172a] outline-none transition-colors"
              />
            </div>
          </div>

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

        {/* Date Range Sub-filter */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date Range:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs text-[#0f172a]"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs text-[#0f172a]"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-rose-500 hover:underline font-semibold"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE CARD */}
      <div className="bg-white border border-[#e4e8f1] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-[#e4e8f1] flex flex-wrap items-center justify-between gap-3 bg-[#fafbfd]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-extrabold text-[#0f172a] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7c3aed]" />
              <span>Aesthetic Defect Records</span>
            </h2>
            <span className="bg-[#ede9fe] text-[#6d28d9] text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border border-[#ddd6fe]">
              {filteredRecords.length} records matching
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Print</span>
            </button>
            {onNavigateToDatabase && (
              <button
                type="button"
                onClick={onNavigateToDatabase}
                className="px-3 py-1.5 bg-[#ede9fe] hover:bg-[#ddd6fe] text-[#6d28d9] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Go to Database</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[980px]">
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
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400 font-medium">
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
                      <td className="py-3 px-4 font-mono text-xs text-gray-400 font-bold">
                        {sl}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-semibold text-[#0f172a] whitespace-nowrap">
                        {r.date}
                      </td>

                      {/* Model & Spec */}
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stageColor}`}
                        >
                          {r.stage}
                        </span>
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${shiftColor}`}
                        >
                          {r.shift}
                        </span>
                      </td>

                      {/* Defect Description */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#7c3aed] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                          <span>{r.desc}</span>
                        </span>
                      </td>

                      {/* Defect Raw Code */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          {r.defect}
                        </span>
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                          {r.qty}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-[#e4e8f1] flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="text-xs font-semibold text-[#64748b]">
            Showing{' '}
            <span className="font-bold text-[#0f172a]">
              {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#0f172a]">
              {Math.min(currentPage * pageSize, filteredRecords.length)}
            </span>{' '}
            of <span className="font-bold text-[#0f172a]">{filteredRecords.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. NEXG_N77 or Axion_A1100"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                  required
                />
              </div>

              {/* Spec */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Spec / RAM-ROM</label>
                <input
                  type="text"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  placeholder="e.g. 4/128 GB, 8/128 GB or leave empty"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-600"
                />
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
                    <option value="Mass Production">Mass Production</option>
                    <option value="Rework">Rework</option>
                    <option value="Trial Production">Trial Production</option>
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
    </div>
  );
};
