/**
 * =========================================================================================
 * @file src/components/views/ComplaintsView.tsx
 * @component ComplaintsView
 * @description Customer Complaints & Voice of Customer (VOC) Management with Full Data Entry
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * 1. Comprehensive Customer Complaint & Voice of Customer (VOC) tracking for Walton PCB & PCBA.
 * 2. Real-time Data Entry: Log, edit, update status, and inspect customer complaints.
 * 3. Net Promoter Score (NPS) analysis dynamically synchronized with complaint feedback.
 * 4. Multi-criteria filtering (Status, Severity, Account Tier, NPS category) & instant text search.
 * 5. Full data export (CSV spreadsheet & JSON) and browser localStorage persistence.
 * 6. Quick traceability linking to Root Cause Analysis (RCA) and CAPA.
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  MessageSquareWarning,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
  Workflow,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  Cpu,
  Package,
} from 'lucide-react';
import { CustomerComplaint, PageId } from '../../types';
import { INITIAL_COMPLAINTS_DATA } from '../../data/initialComplaints';
import { NewComplaintModal } from '../modals/NewComplaintModal';
import { ComplaintDetailModal } from '../modals/ComplaintDetailModal';

const STORAGE_KEY = 'walton_qms_customer_complaints_v1';

interface ComplaintsViewProps {
  onNavigate?: (page: PageId) => void;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  onNavigate,
  isLoggedIn = true,
  onOpenLoginModal,
}) => {
  // Active Tab: 'register' (Complaints Table & Data Entry) or 'analytics' (NPS & Statistical Charts)
  const [activeTab, setActiveTab] = useState<'register' | 'analytics'>('register');

  // Complaints state with localStorage persistence
  const [complaints, setComplaints] = useState<CustomerComplaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load complaints from localStorage', err);
    }
    return INITIAL_COMPLAINTS_DATA;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (err) {
      console.error('Failed to persist complaints', err);
    }
  }, [complaints]);

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<CustomerComplaint | null>(null);
  const [inspectingComplaint, setInspectingComplaint] = useState<CustomerComplaint | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterTier, setFilterTier] = useState<string>('All');
  const [filterNps, setFilterNps] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'nps' | 'rate'>('date');
  const [sortDesc, setSortDesc] = useState(true);

  // Success alert message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Create / Update Handler
  const handleSaveComplaint = (item: CustomerComplaint) => {
    if (editingComplaint) {
      setComplaints((prev) => prev.map((c) => (c.id === item.id ? item : c)));
      showToast(`Updated complaint ${item.ticketNo}`);
      setEditingComplaint(null);
    } else {
      setComplaints((prev) => [item, ...prev]);
      showToast(`Logged new complaint ${item.ticketNo}`);
    }
  };

  // Inline Status Change
  const handleUpdateStatus = (id: string, newStatus: CustomerComplaint['status']) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );
    showToast(`Status updated to "${newStatus}"`);
  };

  // Delete Handler
  const handleDeleteComplaint = (id: string, ticketNo: string) => {
    if (window.confirm(`Are you sure you want to delete complaint ${ticketNo}?`)) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      showToast(`Deleted complaint ${ticketNo}`);
    }
  };

  // Reset to default
  const handleResetData = () => {
    if (window.confirm('Reset all customer complaint records to Walton factory defaults?')) {
      setComplaints(INITIAL_COMPLAINTS_DATA);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Reset complaints database to factory defaults');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Ticket No',
      'Customer Name',
      'Account Tier',
      'Model No',
      'Category',
      'Lot Batch No',
      'Defect Category',
      'Severity',
      'NPS Score',
      'NPS Category',
      'Delivery Qty',
      'Defect Qty',
      'Defect Rate (%)',
      'Status',
      'Received Date',
      'Target Date',
      'Assigned Engineer',
      'Customer Feedback',
      'Containment Action',
      'CAPA Ref',
      'RCA Ref',
    ];

    const rows = complaints.map((c) => [
      `"${c.ticketNo}"`,
      `"${c.customerName.replace(/"/g, '""')}"`,
      `"${c.accountTier}"`,
      `"${c.modelNo}"`,
      `"${c.productCategory}"`,
      `"${c.lotBatchNo}"`,
      `"${c.defectCategory}"`,
      `"${c.severity}"`,
      c.npsScore,
      `"${c.npsCategory}"`,
      c.deliveryQty,
      c.defectQty,
      c.defectRate,
      `"${c.status}"`,
      `"${c.receivedDate}"`,
      `"${c.targetDate}"`,
      `"${c.assignedEngineer.replace(/"/g, '""')}"`,
      `"${c.customerFeedback.replace(/"/g, '""')}"`,
      `"${c.containmentAction.replace(/"/g, '""')}"`,
      `"${c.capaRef || ''}"`,
      `"${c.rcaRef || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Walton_Customer_Complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported complaints register to CSV');
  };

  // Navigate to RCA
  const handleNavigateToRca = (_complaint: CustomerComplaint) => {
    if (onNavigate) {
      onNavigate('rca');
    }
  };

  // Filtered and Sorted Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.ticketNo.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.modelNo.toLowerCase().includes(q) ||
        c.defectCategory.toLowerCase().includes(q) ||
        c.lotBatchNo.toLowerCase().includes(q) ||
        c.assignedEngineer.toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
      const matchesSeverity = filterSeverity === 'All' || c.severity === filterSeverity;
      const matchesTier = filterTier === 'All' || c.accountTier === filterTier;
      const matchesNps = filterNps === 'All' || c.npsCategory === filterNps;
      const matchesCategory = filterCategory === 'All' || c.productCategory === filterCategory;

      return matchesSearch && matchesStatus && matchesSeverity && matchesTier && matchesNps && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const da = new Date(a.receivedDate).getTime();
        const db = new Date(b.receivedDate).getTime();
        return sortDesc ? db - da : da - db;
      }
      if (sortBy === 'severity') {
        const weight = { Critical: 3, Major: 2, Minor: 1 };
        const wa = weight[a.severity] || 0;
        const wb = weight[b.severity] || 0;
        return sortDesc ? wb - wa : wa - wb;
      }
      if (sortBy === 'nps') {
        return sortDesc ? a.npsScore - b.npsScore : b.npsScore - a.npsScore;
      }
      if (sortBy === 'rate') {
        return sortDesc ? b.defectRate - a.defectRate : a.defectRate - b.defectRate;
      }
      return 0;
    });
  }, [complaints, search, filterStatus, filterSeverity, filterTier, filterNps, filterCategory, sortBy, sortDesc]);

  // Dynamic Statistics
  const totalComplaints = complaints.length;
  const criticalCount = complaints.filter((c) => c.severity === 'Critical').length;
  const openCount = complaints.filter(
    (c) => c.status === 'Open' || c.status === 'Under Investigation' || c.status === 'Containment Active'
  ).length;
  const closedCount = complaints.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length;

  const detractorsCount = complaints.filter((c) => c.npsCategory === 'Detractor').length;
  const passivesCount = complaints.filter((c) => c.npsCategory === 'Passive').length;
  const promotersCount = complaints.filter((c) => c.npsCategory === 'Promoter').length;

  const computedNps =
    totalComplaints > 0
      ? Number((((promotersCount - detractorsCount) / totalComplaints) * 100).toFixed(1))
      : 0;

  // Chart Data: Accounts by NPS Category
  const npsCategoryData = [
    { category: 'Detractors (0-6)', count: detractorsCount, color: '#e35b2a' },
    { category: 'Passives (7-8)', count: passivesCount, color: '#2f9bea' },
    { category: 'Promoters (9-10)', count: promotersCount, color: '#28ad6b' },
  ];

  // Chart Data: Complaints by Defect Category
  const defectBreakdownData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      const def = c.defectCategory.split('/')[0].trim();
      counts[def] = (counts[def] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [complaints]);

  // Chart Data: NPS Trend (Historical benchmark + current dynamic quarter)
  const npsTrendData = [
    { quarter: "Q1'20", nps: -18 },
    { quarter: "Q2'20", nps: -41 },
    { quarter: "Q3'20", nps: -13 },
    { quarter: "Q4'20", nps: 69.5 },
    { quarter: "Q1'21", nps: 60.6 },
    { quarter: "Q2'21", nps: -20 },
    { quarter: "Q3'21", nps: -10 },
    { quarter: "Q4'21", nps: -20 },
    { quarter: "Q2'26", nps: -24.8 },
    { quarter: "Q3'26 (Live)", nps: computedNps },
  ];

  // Chart Data: NPS by Account Tier
  const npsByTierData = useMemo(() => {
    const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
    return tiers.map((t) => {
      const tierItems = complaints.filter((c) => c.accountTier === t);
      const detr = tierItems.filter((c) => c.npsCategory === 'Detractor').length;
      const prom = tierItems.filter((c) => c.npsCategory === 'Promoter').length;
      const total = tierItems.length;
      const tierNps = total > 0 ? Number((((prom - detr) / total) * 100).toFixed(1)) : 0;
      return {
        tier: t,
        nps: tierNps,
        count: total,
      };
    });
  }, [complaints]);

  const npsTierStackedData = useMemo(() => {
    const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
    return tiers.map((t) => {
      const tierItems = complaints.filter((c) => c.accountTier === t);
      return {
        tier: t,
        detractors: tierItems.filter((c) => c.npsCategory === 'Detractor').length,
        passives: tierItems.filter((c) => c.npsCategory === 'Passive').length,
        promoters: tierItems.filter((c) => c.npsCategory === 'Promoter').length,
      };
    });
  }, [complaints]);

  return (
    <div id="page-complaints" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#122040] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#22376b] text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e2e7f2] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#fdece5] text-[#e35b2a]">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0d1730]">Customer Complaints &amp; VOC</h2>
              <div className="text-xs text-[#5b6480] mt-0.5">
                Voice of the Customer · Real-Time Defect Data Entry, Field Failure Containment &amp; Satisfaction Analytics
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Tab Switcher */}
          <div className="flex items-center bg-[#f1f4f9] p-1 rounded-xl border border-[#e2e7f2]">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#122040] shadow-xs'
                  : 'text-[#5b6480] hover:text-[#0d1730]'
              }`}
            >
              Complaints Register &amp; Log ({filteredComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#122040] shadow-xs'
                  : 'text-[#5b6480] hover:text-[#0d1730]'
              }`}
            >
              NPS &amp; VOC Analytics
            </button>
          </div>

          {/* Primary Data Entry Button */}
          <button
            id="btn-new-complaint-entry"
            onClick={() => {
              setEditingComplaint(null);
              setIsNewModalOpen(true);
            }}
            className="px-4 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold rounded-xl shadow-md shadow-[#e35b2a]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Data Entry (Log Complaint)</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">Total Complaints</span>
            <span className="text-[11px] font-mono text-[#2f9bea] bg-[#eef1f8] px-2 py-0.5 rounded-full font-bold">
              Active DB
            </span>
          </div>
          <div className="font-mono text-3xl font-bold text-[#0d1730] mt-1">{totalComplaints}</div>
          <div className="text-[11px] text-[#5b6480] mt-1 flex items-center gap-1">
            <span>{closedCount} resolved / closed</span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">Open / In Containment</span>
            <span className="text-[11px] font-mono text-[#d64545] bg-[#fdece5] px-2 py-0.5 rounded-full font-bold">
              Urgent
            </span>
          </div>
          <div className="font-mono text-3xl font-bold text-[#d64545] mt-1">{openCount}</div>
          <div className="text-[11px] text-[#5b6480] mt-1">
            {criticalCount} Critical Severity cases
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">Live Net Promoter (NPS)</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#1c8a53] bg-[#e5f7ee] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Dynamic
            </span>
          </div>
          <div className={`font-mono text-3xl font-bold mt-1 ${computedNps >= 0 ? 'text-[#1c8a53]' : 'text-[#d64545]'}`}>
            {computedNps > 0 ? `+${computedNps}%` : `${computedNps}%`}
          </div>
          <div className="text-[11px] text-[#5b6480] mt-1">
            Based on {totalComplaints} customer evaluations
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6480] uppercase tracking-wider">Sentiment Breakdown</span>
            <span className="text-[11px] text-[#5b6480] font-mono">D / P / P</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 p-1.5 bg-[#fdece5] rounded-lg text-center">
              <div className="font-mono font-bold text-sm text-[#d64545]">{detractorsCount}</div>
              <div className="text-[9px] font-bold text-[#d64545] uppercase">Detr</div>
            </div>
            <div className="flex-1 p-1.5 bg-[#eef1f8] rounded-lg text-center">
              <div className="font-mono font-bold text-sm text-[#2f9bea]">{passivesCount}</div>
              <div className="text-[9px] font-bold text-[#2f9bea] uppercase">Pass</div>
            </div>
            <div className="flex-1 p-1.5 bg-[#e5f7ee] rounded-lg text-center">
              <div className="font-mono font-bold text-sm text-[#1c8a53]">{promotersCount}</div>
              <div className="text-[9px] font-bold text-[#1c8a53] uppercase">Prom</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Tabs */}
      {activeTab === 'register' ? (
        <div className="space-y-4">
          {/* Search, Filter Bar & Quick Export */}
          <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#8891a8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ticket ID, customer, model, defect, batch, or engineer..."
                  className="w-full pl-9 pr-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-[#f8fafc] text-[#0d1730] focus:bg-white focus:border-[#e35b2a] transition-all"
                />
              </div>

              {/* Action Buttons: Export & Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 border border-[#d2d9eb] hover:bg-[#f1f4f9] text-[#39425d] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export all complaints to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  onClick={handleResetData}
                  className="px-3 py-2 border border-[#d2d9eb] hover:bg-[#f1f4f9] text-[#39425d] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reset complaints to factory default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#5b6480]" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f1f4f9] text-xs">
              <div className="flex items-center gap-1 text-[#5b6480] font-semibold text-[11px] mr-1">
                <Filter className="w-3 h-3" /> Filters:
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-[#d2d9eb] rounded-lg bg-white text-[#39425d] text-xs font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Containment Active">Containment Active</option>
                <option value="CAPA Initiated">CAPA Initiated</option>
                <option value="RCA In Progress">RCA In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              {/* Severity Filter */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-2.5 py-1.5 border border-[#d2d9eb] rounded-lg bg-white text-[#39425d] text-xs font-medium"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>

              {/* Account Tier Filter */}
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-2.5 py-1.5 border border-[#d2d9eb] rounded-lg bg-white text-[#39425d] text-xs font-medium"
              >
                <option value="All">All Account Tiers</option>
                <option value="Tier 1">Tier 1 (Enterprise)</option>
                <option value="Tier 2">Tier 2 (Consumer)</option>
                <option value="Tier 3">Tier 3 (Export)</option>
                <option value="Tier 4">Tier 4 (Internal)</option>
              </select>

              {/* NPS Sentiment Filter */}
              <select
                value={filterNps}
                onChange={(e) => setFilterNps(e.target.value)}
                className="px-2.5 py-1.5 border border-[#d2d9eb] rounded-lg bg-white text-[#39425d] text-xs font-medium"
              >
                <option value="All">All NPS Sentiments</option>
                <option value="Detractor">Detractors (0-6)</option>
                <option value="Passive">Passives (7-8)</option>
                <option value="Promoter">Promoters (9-10)</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 border border-[#d2d9eb] rounded-lg bg-white text-[#39425d] text-xs font-medium"
              >
                <option value="All">All Product Categories</option>
                <option value="PCBA">PCBA Assembly</option>
                <option value="PCB">Bare PCB Board</option>
                <option value="Component">Raw Component</option>
                <option value="Finished Module">Finished Module</option>
              </select>

              {/* Sort By Selector */}
              <div className="ml-auto flex items-center gap-1">
                <span className="text-[11px] text-[#5b6480]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1.5 border border-[#d2d9eb] rounded-lg bg-white text-[#39425d] text-xs font-medium"
                >
                  <option value="date">Date Received</option>
                  <option value="severity">Severity</option>
                  <option value="nps">NPS Rating</option>
                  <option value="rate">Defect Rate</option>
                </select>
                <button
                  onClick={() => setSortDesc(!sortDesc)}
                  className="p-1.5 border border-[#d2d9eb] rounded-lg hover:bg-[#eef1f8] text-[#5b6480] transition-colors cursor-pointer"
                  title="Toggle sort direction"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Complaints Data Table */}
          <div className="bg-white border border-[#e2e7f2] rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e7f2] text-[#5b6480] font-bold uppercase tracking-wider text-[10.5px]">
                    <th className="py-3 px-3.5">Ticket / Date</th>
                    <th className="py-3 px-3.5">Customer &amp; Tier</th>
                    <th className="py-3 px-3.5">Product &amp; Defect</th>
                    <th className="py-3 px-3.5">NPS &amp; Fail Rate</th>
                    <th className="py-3 px-3.5">Containment / Feedback</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f8]">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#5b6480]">
                        <div className="max-w-sm mx-auto">
                          <MessageSquareWarning className="w-8 h-8 text-[#a8b3cf] mx-auto mb-2" />
                          <div className="font-bold text-sm text-[#0d1730]">No complaints found</div>
                          <div className="text-xs text-[#8891a8] mt-1">
                            No records match your active search or filter criteria.
                          </div>
                          <button
                            onClick={() => {
                              setSearch('');
                              setFilterStatus('All');
                              setFilterSeverity('All');
                              setFilterTier('All');
                              setFilterNps('All');
                              setFilterCategory('All');
                            }}
                            className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#eef1f8] hover:bg-[#e2e7f2] text-[#0d1730] text-xs font-semibold cursor-pointer"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => {
                      const severityBadge =
                        c.severity === 'Critical'
                          ? 'bg-[#d64545] text-white'
                          : c.severity === 'Major'
                          ? 'bg-[#e35b2a] text-white'
                          : 'bg-[#e8a13a] text-white';

                      const statusBadge =
                        c.status === 'Closed' || c.status === 'Resolved'
                          ? 'bg-[#e5f7ee] text-[#1c8a53] border-[#a1e5c0]'
                          : c.status === 'Open'
                          ? 'bg-[#fdece5] text-[#d64545] border-[#f8c1b0]'
                          : 'bg-[#fef6e7] text-[#b45309] border-[#fcd38d]';

                      const npsBadge =
                        c.npsCategory === 'Promoter'
                          ? 'bg-[#e5f7ee] text-[#1c8a53]'
                          : c.npsCategory === 'Passive'
                          ? 'bg-[#eef1f8] text-[#2f9bea]'
                          : 'bg-[#fdece5] text-[#d64545]';

                      return (
                        <tr key={c.id} className="hover:bg-[#fbfcfe] transition-colors group">
                          {/* Ticket & Date */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="font-mono font-bold text-xs text-[#0d1730]">{c.ticketNo}</div>
                            <div className="text-[10.5px] text-[#5b6480] mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8891a8]" />
                              <span>{c.receivedDate}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${severityBadge}`}>
                                {c.severity}
                              </span>
                            </div>
                          </td>

                          {/* Customer & Tier */}
                          <td className="py-3 px-3.5 align-top max-w-[200px]">
                            <div className="font-semibold text-xs text-[#0d1730] line-clamp-1" title={c.customerName}>
                              {c.customerName}
                            </div>
                            <div className="text-[10.5px] font-mono text-[#5b6480] mt-0.5">{c.accountTier}</div>
                            <div className="text-[10.5px] text-[#8891a8] mt-0.5 truncate">
                              QC: {c.assignedEngineer.split(' ')[1] || c.assignedEngineer}
                            </div>
                          </td>

                          {/* Product & Defect */}
                          <td className="py-3 px-3.5 align-top max-w-[220px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-[#0d1730]">{c.modelNo}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f1f4f9] text-[#424e6b] font-medium">
                                {c.productCategory}
                              </span>
                            </div>
                            <div className="font-semibold text-xs text-[#e35b2a] mt-0.5 line-clamp-1" title={c.defectCategory}>
                              {c.defectCategory}
                            </div>
                            <div className="text-[10px] font-mono text-[#8891a8] mt-0.5">Lot: {c.lotBatchNo}</div>
                          </td>

                          {/* NPS & Fail Rate */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs">{c.npsScore}/10</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${npsBadge}`}>
                                {c.npsCategory}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#d64545] font-bold mt-1">
                              {c.defectRate}% Fail Rate
                            </div>
                            <div className="text-[10px] font-mono text-[#8891a8]">
                              ({c.defectQty} / {c.deliveryQty.toLocaleString()} pcs)
                            </div>
                          </td>

                          {/* Containment / Customer Feedback */}
                          <td className="py-3 px-3.5 align-top max-w-[240px]">
                            <p className="text-[11px] text-[#39425d] line-clamp-2 italic" title={c.customerFeedback}>
                              "{c.customerFeedback}"
                            </p>
                            <div className="mt-1 text-[10px] text-[#7f1d1d] bg-[#fef2f2] px-1.5 py-0.5 rounded border border-[#fecaca] line-clamp-1" title={c.containmentAction}>
                              <span className="font-bold">Containment:</span> {c.containmentAction}
                            </div>
                          </td>

                          {/* Status with Quick Inline Selector */}
                          <td className="py-3 px-3.5 align-top whitespace-nowrap">
                            <select
                              value={c.status}
                              onChange={(e) => handleUpdateStatus(c.id, e.target.value as any)}
                              className={`text-[11px] font-semibold px-2 py-1 rounded-lg border cursor-pointer ${statusBadge}`}
                            >
                              <option value="Open">Open</option>
                              <option value="Under Investigation">Under Investigation</option>
                              <option value="Containment Active">Containment Active</option>
                              <option value="CAPA Initiated">CAPA Initiated</option>
                              <option value="RCA In Progress">RCA In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                            {c.capaRef && (
                              <div className="text-[9.5px] font-mono text-[#2f9bea] font-bold mt-1">
                                Ref: {c.capaRef}
                              </div>
                            )}
                            {c.rcaRef && (
                              <div className="text-[9.5px] font-mono text-[#e35b2a] font-bold mt-0.5">
                                RCA: {c.rcaRef}
                              </div>
                            )}
                          </td>

                          {/* Row Actions */}
                          <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setInspectingComplaint(c)}
                                className="p-1.5 rounded-lg text-[#5b6480] hover:text-[#0d1730] hover:bg-[#eef1f8] transition-colors cursor-pointer"
                                title="View Complete VOC Dossier"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingComplaint(c);
                                  setIsNewModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-[#5b6480] hover:text-[#e35b2a] hover:bg-[#fdece5] transition-colors cursor-pointer"
                                title="Edit Entry"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteComplaint(c.id, c.ticketNo)}
                                className="p-1.5 rounded-lg text-[#5b6480] hover:text-[#d64545] hover:bg-[#fdece5] transition-colors cursor-pointer"
                                title="Delete Complaint"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Table Footer */}
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e7f2] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5b6480]">
              <div>
                Showing <span className="font-bold text-[#0d1730]">{filteredComplaints.length}</span> of{' '}
                <span className="font-bold text-[#0d1730]">{complaints.length}</span> customer complaint records
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d64545]" /> Critical ({criticalCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e8a13a]" /> Open ({openCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#28ad6b]" /> Closed ({closedCount})
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics Tab (Charts) */
        <div className="space-y-6">
          {/* NPS Highlight Card & Accounts Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0d1730]">Net Promoter Score (NPS)</h3>
                    <p className="text-xs text-[#5b6480]">Dynamic calculation from active Voice of Customer data</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#eef1f8] text-[#2f9bea] font-bold font-mono rounded-lg">
                    ISO 9001:2015 §9.1.2
                  </span>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div>
                    <div className={`font-mono text-4xl font-bold ${computedNps >= 0 ? 'text-[#1c8a53]' : 'text-[#d64545]'}`}>
                      {computedNps > 0 ? `+${computedNps}%` : `${computedNps}%`}
                    </div>
                    <div className="text-xs text-[#5b6480] mt-1">Current Quarter NPS Index</div>
                  </div>
                  <div className="border-l border-[#e2e7f2] pl-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#28ad6b] font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>{promotersCount} Promoters (9-10)</span>
                    </div>
                    <div className="text-xs text-[#5b6480]">
                      Detractor Ratio:{' '}
                      <span className="font-mono text-[#d64545] font-bold">
                        {totalComplaints > 0 ? ((detractorsCount / totalComplaints) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8891a8]">Sample Base: {totalComplaints} Active Feedback Logs</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-[#e2e7f2] mt-4">
                <div className="p-2.5 bg-[#fdece5] rounded-xl border border-[#fae4dc]">
                  <div className="font-mono font-bold text-base text-[#c74a1f]">{detractorsCount}</div>
                  <div className="text-[10px] font-bold text-[#c74a1f] uppercase tracking-wider">Detractors</div>
                  <div className="text-[10px] text-[#8891a8] mt-0.5">Rating 0-6</div>
                </div>
                <div className="p-2.5 bg-[#eef1f8] rounded-xl border border-[#d2d9eb]">
                  <div className="font-mono font-bold text-base text-[#2f9bea]">{passivesCount}</div>
                  <div className="text-[10px] font-bold text-[#2f9bea] uppercase tracking-wider">Passives</div>
                  <div className="text-[10px] text-[#8891a8] mt-0.5">Rating 7-8</div>
                </div>
                <div className="p-2.5 bg-[#e5f7ee] rounded-xl border border-[#a1e5c0]">
                  <div className="font-mono font-bold text-base text-[#1c8a53]">{promotersCount}</div>
                  <div className="text-[10px] font-bold text-[#1c8a53] uppercase tracking-wider">Promoters</div>
                  <div className="text-[10px] text-[#8891a8] mt-0.5">Rating 9-10</div>
                </div>
              </div>
            </div>

            {/* Bar: Accounts by NPS Category */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0d1730]">Accounts by NPS Category</h3>
                <p className="text-xs text-[#5b6480] mb-2">Customer sentiment grouping breakdown</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={npsCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                    <XAxis dataKey="category" stroke="#5b6480" fontSize={11} />
                    <YAxis stroke="#5b6480" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {npsCategoryData.map((entry, index) => (
                        <Bar key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-[#5b6480] text-center pt-2 border-t border-[#e2e7f2]">
                Passives &amp; Detractors are monitored under mandatory CAPA / RCA resolution protocols.
              </div>
            </div>
          </div>

          {/* 3 Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* NPS Trend */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0d1730]">Historical &amp; Current NPS Trend</h3>
                <p className="text-[11px] text-[#5b6480] mb-2">Traversing quarterly trajectory</p>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={npsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                    <XAxis dataKey="quarter" stroke="#5b6480" fontSize={9} />
                    <YAxis stroke="#5b6480" fontSize={10} />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, 'NPS']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="nps" stroke="#28ad6b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
                Current dynamic Q3 index: <span className="font-bold font-mono text-[#0d1730]">{computedNps}%</span>
              </div>
            </div>

            {/* NPS by Account Tier */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0d1730]">NPS by Client Account Tier</h3>
                <p className="text-[11px] text-[#5b6480] mb-2">Performance across enterprise tiers</p>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={npsByTierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                    <XAxis dataKey="tier" stroke="#5b6480" fontSize={10} />
                    <YAxis stroke="#5b6480" fontSize={10} />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, 'NPS']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                    />
                    <Bar dataKey="nps" fill="#2f9bea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
                Tier 1 enterprise appliance is highest priority for line containment.
              </div>
            </div>

            {/* Stacked NPS Categories by Tier */}
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0d1730]">NPS Sentiment Distribution by Tier</h3>
                <p className="text-[11px] text-[#5b6480] mb-2">Stacked count across Tiers 1-4</p>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={npsTierStackedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                    <XAxis dataKey="tier" stroke="#5b6480" fontSize={10} />
                    <YAxis stroke="#5b6480" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                    />
                    <Bar dataKey="detractors" stackId="a" fill="#e35b2a" />
                    <Bar dataKey="passives" stackId="a" fill="#2f9bea" />
                    <Bar dataKey="promoters" stackId="a" fill="#28ad6b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#e35b2a]" /> Detr.</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2f9bea]" /> Pass.</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#28ad6b]" /> Prom.</span>
              </div>
            </div>
          </div>

          {/* Top Defect Breakdown Table */}
          <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-[#0d1730] mb-1">Top Customer-Reported Defect Categories</h3>
            <p className="text-xs text-[#5b6480] mb-3">Defects driving customer dissatisfaction across PCB &amp; PCBA shipments</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {defectBreakdownData.map((d) => (
                <div key={d.name} className="p-3 bg-[#f8fafc] rounded-xl border border-[#eef1f8] text-center">
                  <div className="font-mono font-bold text-xl text-[#e35b2a]">{d.value}</div>
                  <div className="font-semibold text-xs text-[#0d1730] mt-0.5 line-clamp-1" title={d.name}>
                    {d.name}
                  </div>
                  <div className="text-[10px] text-[#8891a8] mt-0.5">Customer incidents</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Entry Modal (New & Edit) */}
      <NewComplaintModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingComplaint(null);
        }}
        onSubmit={handleSaveComplaint}
        initialData={editingComplaint}
      />

      {/* Detailed Inspection Dossier Modal */}
      <ComplaintDetailModal
        complaint={inspectingComplaint}
        onClose={() => setInspectingComplaint(null)}
        onEdit={(item) => {
          setEditingComplaint(item);
          setIsNewModalOpen(true);
        }}
        onNavigateToRca={handleNavigateToRca}
      />
    </div>
  );
};
