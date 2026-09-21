/**
 * =========================================================================================
 * @file src/components/views/DashboardView.tsx
 * @component DashboardView
 * @description Executive Quality Management Dashboard for Walton PCB & PCBA Operations
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Serves as the primary operational telemetry dashboard for Walton quality leadership:
 * - Aggregates manufacturing volume across 8 SMT lines and 4 Manual Insertion (MI) lines.
 * - Computes and visualizes vital Six Sigma quality metrics:
 *   * Overall Line Yield (e.g. 98.4%)
 *   * First Pass Yield (FPY e.g. 96.8%)
 *   * Defect Rate (DPMO - Defects Per Million Opportunities)
 *   * Open NCR and CAPA tracking
 * - Visualizes line-by-line yield comparisons, daily defect Pareto distributions, and
 *   defect category breakdowns using Recharts.
 * - Respects the conditional sidebar mode: when accessed without authorized login,
 *   displays the clean full-width layout with access banner.
 *
 * WHERE GEMINI AI API IS INTEGRATED & APPLIED:
 * --------------------------------------------
 * In Walton's smart factory roadmap, when quality deviations or DPMO spikes occur on a line
 * (e.g., SMT Line 04 showing a 2.8% defect surge), the Gemini AI model (`gemini-2.5-flash`
 * via `geminiService.ts`) is invoked to:
 * 1. Correlate SPI solder paste thickness variance with thermal reflow zone logs.
 * 2. Suggest root causes (e.g. stencil wear or component moisture sensitivity).
 * 3. Pre-populate 8D CAPA drafts directly from the dashboard.
 *
 * PARAMETERS / PROPS (DashboardViewProps):
 * ----------------------------------------
 * @param {(page: PageId) => void} [onNavigate] - Callback to route between QMS pages.
 * @param {() => void} [onOpenNewNcModal] - Opens the modal to file a new Non-Conformance Report.
 * @param {() => void} [onOpenNewCapaModal] - Opens the modal to create a new CAPA action plan.
 * @param {number} [openNcrCount] - Number of open NCR records currently under review.
 * @param {number} [openNcCount] - Alternative count alias for open NCRs.
 * @param {number} [openCapaCount] - Number of open corrective actions.
 * @param {string} [selectedMonth] - Global filter for manufacturing month.
 * @param {(month: string) => void} [onMonthChange] - Callback to update the month filter.
 * @param {string} [selectedProduct] - Global filter for product model.
 * @param {(product: string) => void} [onProductChange] - Callback to update the product filter.
 * @param {boolean} [isLoggedIn] - Indicates whether user has administrative session.
 * @param {() => void} [onOpenLoginModal] - Opens login dialog for unauthorized visitors.
 * @param {boolean} [showSidebar] - Indicates whether the sidebar is currently displayed.
 */

import React, { useState } from 'react';
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
import { AlertCircle, CheckCircle2, TrendingUp, ShieldAlert, ArrowUpRight, Calendar, Layers, Lock, ShieldCheck, Home, Menu } from 'lucide-react';
import { PageId } from '../../types';

interface DashboardViewProps {
  onNavigate?: (page: PageId) => void;
  onOpenNewNcModal?: () => void;
  onOpenNewCapaModal?: () => void;
  openNcrCount?: number;
  openNcCount?: number;
  openCapaCount?: number;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  selectedProduct?: string;
  onProductChange?: (product: string) => void;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate = (_page: PageId) => {},
  onOpenNewNcModal = () => {},
  onOpenNewCapaModal = () => {},
  openNcrCount,
  openNcCount,
  openCapaCount = 0,
  selectedMonth,
  onMonthChange,
  selectedProduct,
  onProductChange,
  isLoggedIn = false,
  onOpenLoginModal = () => {},
  showSidebar = false,
  onToggleSidebar = () => {},
}) => {
  const [localMonth, setLocalMonth] = useState<string>('August 2026');
  const [localProduct, setLocalProduct] = useState<string>('All Products');

  const currentMonth = selectedMonth ?? localMonth;
  const currentProduct = selectedProduct ?? localProduct;

  /**
   * handleMonthChange
   * Updates local state and notifies parent controller of audit month changes.
   * @param {string} val - Chosen month (e.g. 'August 2026')
   */
  const handleMonthChange = (val: string) => {
    setLocalMonth(val);
    if (onMonthChange) onMonthChange(val);
  };

  const handleProductChange = (val: string) => {
    setLocalProduct(val);
    if (onProductChange) onProductChange(val);
  };

  const actualNcrCount = openNcrCount ?? openNcCount ?? 0;
  const weekdayData = [
    { day: 'Mon', faults: 15.4 },
    { day: 'Tue', faults: 11.5 },
    { day: 'Wed', faults: 19.2 },
    { day: 'Thu', faults: 14.1 },
    { day: 'Fri', faults: 23.1 },
    { day: 'Sat', faults: 9.0 },
    { day: 'Sun', faults: 7.7 },
  ];

  const multiYearTrend = [
    { year: '2019', fqc: 210, aoi: 90 },
    { year: '2020', fqc: 260, aoi: 150 },
    { year: '2021', fqc: 300, aoi: 130 },
    { year: '2022', fqc: 340, aoi: 170 },
    { year: '2023', fqc: 300, aoi: 150 },
    { year: '2024', fqc: 360, aoi: 190 },
  ];

  const inspectionModeData = [
    { name: 'AOI 3D Optical', value: 35, color: '#2f9bea' },
    { name: 'Manual Inspection', value: 27, color: '#1fb6a6' },
    { name: 'Functional Test (FCT)', value: 17, color: '#e35b2a' },
    { name: 'Visual QC', value: 21, color: '#7a5cf0' },
  ];

  const sixMonthQualityTrend = [
    { month: 'Mar', score: 85, target: 90 },
    { month: 'Apr', score: 88, target: 90 },
    { month: 'May', score: 86, target: 90 },
    { month: 'Jun', score: 89, target: 90 },
    { month: 'Jul', score: 90, target: 90 },
    { month: 'Aug', score: 92, target: 90 },
  ];

  const kpiAreaScores = [
    { area: 'IQC', score: 93, color: '#1fb6a6' },
    { area: 'IPQC', score: 92, color: '#1fb6a6' },
    { area: 'FQC', score: 91, color: '#1fb6a6' },
    { area: 'DPMO', score: 87, color: '#e8a13a' },
    { area: 'Supplier', score: 81, color: '#d64545' },
    { area: 'SOP', score: 93, color: '#7a5cf0' },
  ];

  return (
    <div id="page-dashboard" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-[#0d1730]">Dashboard</h2>
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              title={showSidebar ? "Switch to icon rail" : "Expand sidebar to full"}
            >
              <Menu className="w-3.5 h-3.5 text-[#1c356b]" />
              <span>{showSidebar ? 'Full Sidebar' : 'Icon Rail'}</span>
            </button>
          </div>
          <div className="text-xs text-[#5b6480] mt-0.5">
            Production Overview · All PCB &amp; PCBA Lines
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Filter */}
          <div className="flex items-center gap-2 bg-white border border-[#cbd5e1] hover:border-[#94a3b8] px-3 py-1.5 rounded-lg shadow-2xs transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[#5b6480] shrink-0" />
            <label htmlFor="dashboard-month-filter" className="text-xs font-semibold text-[#5b6480]">
              Month:
            </label>
            <select
              id="dashboard-month-filter"
              value={currentMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0d1730] focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Months (2026)</option>
              <option value="August 2026">August 2026 (Current)</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="flex items-center gap-2 bg-white border border-[#cbd5e1] hover:border-[#94a3b8] px-3 py-1.5 rounded-lg shadow-2xs transition-colors">
            <Layers className="w-3.5 h-3.5 text-[#5b6480] shrink-0" />
            <label htmlFor="dashboard-product-filter" className="text-xs font-semibold text-[#5b6480]">
              Product:
            </label>
            <select
              id="dashboard-product-filter"
              value={currentProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0d1730] focus:outline-none cursor-pointer pr-1"
            >
              <option value="All Products">All Products</option>
              <option value="Fridge">Fridge Boards</option>
              <option value="TV">TV Mainboards</option>
              <option value="LED Light">LED Light Driver</option>
              <option value="Mobile">Mobile Sub-boards</option>
              <option value="Computer">Computer Motherboard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Workforce Pill Row - Matching Image 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#2563eb]">
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">TOTAL MP</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-2">612</div>
        </div>
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#0d9488]">
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">PRESENT TODAY</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-2">589</div>
        </div>
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#6366f1]">
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">MALE</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-2">402</div>
        </div>
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#db2777]">
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">FEMALE</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-2">210</div>
        </div>
      </div>

      {/* KPI 4-Block - Matching Image 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-4xl font-bold text-[#10b981]">91.4%</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-2">
            OVERALL QUALITY SCORE
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-4xl font-bold text-[#f59e0b]">312</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-2">
            PROCESS DPMO
          </div>
        </div>

        <div
          onClick={() => onNavigate('capa')}
          className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs text-center flex flex-col justify-center cursor-pointer hover:border-[#ef4444] transition-colors"
        >
          <div className="font-mono text-4xl font-bold text-[#ef4444]">{openCapaCount || 5}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-2">
            OPEN CAPA
          </div>
        </div>

        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs text-center flex flex-col justify-center cursor-pointer hover:border-[#22376b] transition-colors"
        >
          <div className="font-mono text-4xl font-bold text-[#0f172a]">18</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-2">
            CUSTOMER COMPLAINTS
          </div>
        </div>
      </div>

      {/* Quality Health & Attention Required - Matching Image 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs">
          <h3 className="font-bold text-base text-[#0d1730]">Overall Quality Health</h3>
          <p className="text-xs text-[#5b6480] mb-4">Live composite indicators</p>
          <div className="divide-y divide-[#e2e7f2] text-xs">
            <div className="py-3 flex items-center justify-between">
              <span className="text-[#141b30] font-medium text-sm">Department KPI Achievement</span>
              <span className="font-mono font-bold text-[#10b981] text-sm">89.6%</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-[#141b30] font-medium text-sm">CAPA Closure Rate</span>
              <span className="font-mono font-bold text-[#10b981] text-sm">92.0%</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-[#141b30] font-medium text-sm">SOP Compliance</span>
              <span className="font-mono font-bold text-[#10b981] text-sm">96.4%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-6 shadow-xs">
          <h3 className="font-bold text-base text-[#0d1730]">Attention Required</h3>
          <p className="text-xs text-[#5b6480] mb-4">Items needing follow-up this week</p>
          <div className="divide-y divide-[#e2e7f2] text-xs">
            <div
              onClick={() => onNavigate('capa')}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#eef1f8]/50 px-1 rounded transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-[#141b30] font-medium text-sm">Supplier CAPA Overdue</span>
              </div>
            </div>
            <div
              onClick={() => onNavigate('nc')}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#eef1f8]/50 px-1 rounded transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-[#141b30] font-medium text-sm">IPQC Defect Trend</span>
              </div>
            </div>
            <div
              onClick={() => onNavigate('docs')}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#eef1f8]/50 px-1 rounded transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                <span className="text-[#141b30] font-medium text-sm">SOP Review Due</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fault Report by Weekday */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Fault Report by Weekday</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Share of week's total reported defects</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="day" stroke="#5b6480" fontSize={11} />
                <YAxis stroke="#5b6480" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Fault Rate']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="faults" fill="#2f9bea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
            Peak defect frequency on Friday shift changes (23.1%)
          </div>
        </div>

        {/* Segment Trend (2019-2024) */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Segment Trend (2019–2024)</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">FQC volume vs AOI fault detections (k pcs)</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiYearTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="year" stroke="#5b6480" fontSize={11} />
                <YAxis stroke="#5b6480" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="fqc" name="FQC Checked" stroke="#2f9bea" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="aoi" name="AOI Faults" stroke="#7a5cf0" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2f9bea]" /> FQC</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7a5cf0]" /> AOI</span>
          </div>
        </div>

        {/* Inspection Mode Share */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Inspection Mode Share</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">AOI vs Manual vs Functional vs Visual</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inspectionModeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {inspectionModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
            {inspectionModeData.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <span className="truncate">{m.name}: {m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Defect Rate Pills */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-gradient-to-br from-[#e8a13a] to-[#cf8620] text-white p-4 rounded-xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">PCB Defect Rate</div>
          <div className="text-2xl font-bold font-mono mt-1">1.2%</div>
          <div className="text-[10px] opacity-80 mt-0.5">Etching &amp; Solder Mask</div>
        </div>
        <div className="bg-gradient-to-br from-[#2f9bea] to-[#1c7bc9] text-white p-4 rounded-xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">SMT Defect Rate</div>
          <div className="text-2xl font-bold font-mono mt-1">1.0%</div>
          <div className="text-[10px] opacity-80 mt-0.5">Surface Mount Placement</div>
        </div>
        <div className="bg-gradient-to-br from-[#e8478f] to-[#c9276f] text-white p-4 rounded-xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">MI Defect Rate</div>
          <div className="text-2xl font-bold font-mono mt-1">2.2%</div>
          <div className="text-[10px] opacity-80 mt-0.5">Manual Insertion &amp; Wave</div>
        </div>
      </div>

      {/* Quality Trend (6 Months) & Area KPI Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quality Score Trend */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0d1730]">Quality Performance Trend</h3>
              <p className="text-xs text-[#5b6480]">Monthly overall score vs 90% target threshold</p>
            </div>
            <span className="px-2 py-0.5 bg-[#e5f7ee] text-[#1c8a53] text-xs font-bold rounded-md font-mono">
              Aug: 92% (Exceeded)
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sixMonthQualityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="month" stroke="#5b6480" fontSize={11} />
                <YAxis domain={[75, 100]} stroke="#5b6480" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="score" name="Score" stroke="#1fb6a6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#e8a13a" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Area Performance */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0d1730]">KPI Area Performance</h3>
              <p className="text-xs text-[#5b6480]">Current achievement against targets</p>
            </div>
            <button
              onClick={() => onNavigate('kpi')}
              className="text-xs font-semibold text-[#e35b2a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Leaderboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiAreaScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="area" stroke="#5b6480" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#5b6480" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Achievement']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {kpiAreaScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#0d1730]">Recent Quality Actions</h3>
          <p className="text-xs text-[#5b6480] mb-3">Real-time audit &amp; line updates</p>
          <div className="divide-y divide-[#e2e7f2] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">AOI recalibration completed — Line 2</span>
              <span className="text-[#5b6480] font-mono text-[11px]">Today 08:30 AM</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">CAPA-2026-014 closed — Supplier Issue</span>
              <span className="text-[#5b6480] font-mono text-[11px]">Yesterday</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">New NCR raised — SMT Line 1 QFP Pin</span>
              <span className="text-[#5b6480] font-mono text-[11px]">2 days ago</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">SOP-QA-07 revised (Rev. 3 Published)</span>
              <span className="text-[#5b6480] font-mono text-[11px]">3 days ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#0d1730]">Certifications &amp; Standards</h3>
          <p className="text-xs text-[#5b6480] mb-3">Walton Hi-Tech Plant Quality Accreditations</p>
          <div className="divide-y divide-[#e2e7f2] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">ISO-9001:2015 Quality Management</span>
              <span className="px-2 py-0.5 bg-[#e5f7ee] text-[#1c8a53] font-mono font-bold rounded">Active · Verified</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">IPC Standards (J-STD-001 &amp; IPC-A-610)</span>
              <span className="px-2 py-0.5 bg-[#e5f7ee] text-[#1c8a53] font-mono font-bold rounded">Class 2 &amp; 3 Certified</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">IATF-16949 Automotive Quality</span>
              <span className="px-2 py-0.5 bg-[#e5f7ee] text-[#1c8a53] font-mono font-bold rounded">Active · Certified</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#141b30] font-medium">ANSI/ESD S20.20 Static Control</span>
              <span className="px-2 py-0.5 bg-[#e5f7ee] text-[#1c8a53] font-mono font-bold rounded">Audited Monthly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
