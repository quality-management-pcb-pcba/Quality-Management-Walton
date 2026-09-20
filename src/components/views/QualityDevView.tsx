import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Layers,
  Cpu,
  ShieldCheck,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  Check,
  ChevronRight,
  TrendingDown,
  Clock,
  Sparkles,
  Search,
  Plus,
  X,
  Building2,
  PieChart as PieIcon,
  Activity,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface QualityDevViewProps {
  onNavigate?: (page: PageId) => void;
}

export const QualityDevView: React.FC<QualityDevViewProps> = ({
  onNavigate = (_page: PageId) => {},
}) => {
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [activeDefectTab, setActiveDefectTab] = useState<'PCB' | 'PCBA'>('PCBA');
  const [ncrFilter, setNcrFilter] = useState<'ALL' | 'Open' | 'Closed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Overview Data
  const overviewData = {
    reportingMonth: 'September 2026',
    totalPcbProduced: 125000,
    totalPcbaProduced: 98500,
    overallQualityRating: '98.7%',
    customerComplaints: 2,
    openNcr: 5,
  };

  // 2. Quality KPI Performance Data
  const kpiPerformanceData = [
    { kpi: 'FPY (%)', target: '≥98', actual: 98.5, status: '🟢', benchmark: 'Goal Exceeded (+0.5%)', color: '#10b981' },
    { kpi: 'DPMO', target: '≤500', actual: 420, status: '🟢', benchmark: 'Within Limit (-80 DPMO)', color: '#10b981' },
    { kpi: 'Internal Rejection (%)', target: '≤1.0', actual: 0.75, status: '🟢', benchmark: 'Low Defectivity (-0.25%)', color: '#10b981' },
    { kpi: 'Customer Return (%)', target: '≤0.1', actual: 0.08, status: '🟢', benchmark: 'Excellent (-0.02%)', color: '#10b981' },
    { kpi: 'Process Audit Score', target: '≥95', actual: 96, status: '🟢', benchmark: 'Audited A+ Grade (+1.0)', color: '#10b981' },
  ];

  // 3. Defect Trend Analysis - PCB & PCBA Pareto Data
  const pcbDefectsPareto = [
    { name: 'Open Circuit', count: 184, cumPercent: 38 },
    { name: 'Short Circuit', count: 126, cumPercent: 64 },
    { name: 'Scratch', count: 72, cumPercent: 79 },
    { name: 'Pad Damage', count: 58, cumPercent: 91 },
    { name: 'Hole Miss', count: 44, cumPercent: 100 },
  ];

  const pcbaDefectsPareto = [
    { name: 'Solder Bridge', count: 280, cumPercent: 38 },
    { name: 'Missing Component', count: 177, cumPercent: 62 },
    { name: 'Wrong Component', count: 118, cumPercent: 78 },
    { name: 'Polarity Error', count: 96, cumPercent: 91 },
    { name: 'Functional Failure', count: 65, cumPercent: 100 },
  ];

  // Monthly Trend Data (Apr - Sep 2026)
  const monthlyTrendData = [
    { month: 'Apr 2026', pcbReject: 1.12, pcbaReject: 1.05, fpy: 97.4, dpmo: 520 },
    { month: 'May 2026', pcbReject: 1.04, pcbaReject: 0.98, fpy: 97.8, dpmo: 495 },
    { month: 'Jun 2026', pcbReject: 0.96, pcbaReject: 0.91, fpy: 98.1, dpmo: 468 },
    { month: 'Jul 2026', pcbReject: 0.89, pcbaReject: 0.84, fpy: 98.2, dpmo: 450 },
    { month: 'Aug 2026', pcbReject: 0.81, pcbaReject: 0.79, fpy: 98.4, dpmo: 435 },
    { month: 'Sep 2026', pcbReject: 0.72, pcbaReject: 0.75, fpy: 98.5, dpmo: 420 },
  ];

  // 4. Production Line Performance Data
  const linePerformanceData = [
    { line: 'SMT-1', output: 32500, rejectQty: 195, rejectPct: '0.60%', status: 'Optimal', cpk: 1.74 },
    { line: 'SMT-2', output: 30200, rejectQty: 211, rejectPct: '0.70%', status: 'Good', cpk: 1.68 },
    { line: 'MI-1', output: 18400, rejectQty: 156, rejectPct: '0.85%', status: 'Controlled', cpk: 1.55 },
    { line: 'MI-2', output: 17400, rejectQty: 174, rejectPct: '1.00%', status: 'Action Plan', cpk: 1.48 },
  ];

  const totalLineOutput = linePerformanceData.reduce((acc, curr) => acc + curr.output, 0);
  const totalLineRejects = linePerformanceData.reduce((acc, curr) => acc + curr.rejectQty, 0);
  const avgLineRejectPct = ((totalLineRejects / totalLineOutput) * 100).toFixed(2) + '%';

  // 5. NCR & CAPA Status Data
  const ncrCapaData = [
    {
      ncrNo: 'NCR-001',
      issue: 'BGA Solder Bridging on Inverter Board U102',
      rootCause: 'Excessive solder paste deposit caused by micro-wear on stencil aperture edges',
      action: 'Replaced nano-coated stencil, adjusted squeegee pressure from 5.5kg to 4.8kg, and tightened SPI height limits',
      status: 'Open',
      department: 'SMT Production',
      priority: 'High',
    },
    {
      ncrNo: 'NCR-002',
      issue: 'Micro-scratch on Layer 2 Copper Foil Substrate',
      rootCause: 'Manual friction against transport guide rails during manual de-paneling',
      action: 'Installed automated vacuum pick-and-place de-paneling handlers and anti-scratch PTFE guides',
      status: 'Closed',
      department: 'PCB Fabrication',
      priority: 'Medium',
    },
    {
      ncrNo: 'NCR-003',
      issue: 'Component Polarity Inversion on C104 Tantalum Capacitor',
      rootCause: 'Feeder tape orientation loaded backwards during mid-shift component replenishment',
      action: 'Implemented mandatory 2D barcode feeder locking verification in MES before feeder release',
      status: 'Closed',
      department: 'SMT Feeder Prep',
      priority: 'High',
    },
    {
      ncrNo: 'NCR-004',
      issue: 'Through-Hole Solder Voiding on High-Current Pin Header',
      rootCause: 'Inadequate wave preheating temperature on 2oz inner copper ground planes',
      action: 'Elevated top-side convection preheat to 118°C and lowered conveyor speed to 1.1 m/min',
      status: 'Open',
      department: 'MI / Wave Solder',
      priority: 'Medium',
    },
    {
      ncrNo: 'NCR-005',
      issue: 'Solder Mask Chipping along Outer PCB Breakaway Edge',
      rootCause: 'Diamond router spindle vibration exceeding 25 µm deflection threshold',
      action: 'Calibrated CNC routing spindle bearings and established router bit replacement at 800 linear meters',
      status: 'Open',
      department: 'PCB Mechanical Routing',
      priority: 'Low',
    },
  ];

  // 6. Supplier Quality Performance Data
  const supplierQualityData = [
    { supplier: 'Supplier A', material: 'PCB Substrate (FR-4 Rigid)', ppm: 145, status: 'Approved', targetPpm: '≤ 200 PPM', auditScore: 97 },
    { supplier: 'Supplier B', material: 'SAC305 Solder Paste & Bar', ppm: 68, status: 'Approved', targetPpm: '≤ 100 PPM', auditScore: 99 },
    { supplier: 'Supplier C', material: 'Active ICs & Passive Components', ppm: 210, status: 'Approved', targetPpm: '≤ 250 PPM', auditScore: 94 },
    { supplier: 'Supplier D', material: 'Terminal Blocks & Mechanical Connectors', ppm: 320, status: 'Monitoring', targetPpm: '≤ 300 PPM', auditScore: 89 },
  ];

  // 7. Improvement Projects Data
  const improvementProjectsData = [
    {
      project: 'AOI Optimization',
      objective: 'Reduce false call rate and eliminate operator review fatigue',
      result: '-20%',
      category: 'Vision & Inspection',
      impact: 'Saved 2.5 operator hours per line daily; lowered false alarm PPM from 60 to 48.',
      status: 'Completed',
    },
    {
      project: 'SPI Control',
      objective: 'Improve solder paste volume consistency and prevent print defects',
      result: '+15% FPY',
      category: 'Process Engineering',
      impact: 'Closed-loop feedback to stencil printer boosted First Pass Yield from 85.5% to 98.5%.',
      status: 'Active',
    },
    {
      project: 'Nitrogen Reflow Atmosphere',
      objective: 'Eliminate pad oxidation and reduce micro-voiding inside QFN thermal pads',
      result: '-35% Voiding',
      category: 'Soldering Quality',
      impact: 'Nitrogen purge (O2 < 500 ppm) cut thermal pad solder voids to under 12% per IPC Class 3.',
      status: 'Completed',
    },
    {
      project: 'Stencil Nano-Coating',
      objective: 'Enhance paste release efficiency on 0.4mm pitch BGA apertures',
      result: '+12% Cpk',
      category: 'SMT Tooling',
      impact: 'Volume Transfer Efficiency elevated to 91.4% with zero aperture bridging.',
      status: 'Active',
    },
    {
      project: 'Wave Solder Pallet Redesign',
      objective: 'Prevent thermal shadowing and solder bridging on heavy power connectors',
      result: '-45% Bridges',
      category: 'Through-Hole Soldering',
      impact: 'Titanium wave baffle insert eliminated pin bridging on 5.08mm terminal blocks.',
      status: 'Completed',
    },
  ];

  const filteredNcr = ncrCapaData.filter((item) => {
    const matchesFilter = ncrFilter === 'ALL' || item.status === ncrFilter;
    const matchesSearch =
      item.ncrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rootCause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeParetoData = activeDefectTab === 'PCB' ? pcbDefectsPareto : pcbaDefectsPareto;

  return (
    <div id="page-quality-dev" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#cbd5e1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-md border border-[#cbd5e1] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-xs text-[#94a3b8]">/</span>
            <span className="text-xs font-semibold text-[#5b6480]">Quality Development</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d1730] tracking-tight flex items-center gap-3">
            <span>PCB &amp; PCBA Quality Development Dashboard</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
              Active Audit
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Walton Hi-Tech Industries PLC · Comprehensive Quality Performance, Defect Analytics &amp; Continuous Improvement
          </p>
        </div>

        {/* Header Controls & Month Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#cbd5e1] shadow-2xs">
            <Calendar className="w-4 h-4 text-[#1c356b]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0d1730] focus:outline-hidden cursor-pointer"
            >
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: Overview Cards & Summary */}
      <section id="section-quality-dev-overview" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1c356b]" />
            <span>1. Overview</span>
            <span className="text-xs font-normal text-[#64748b]">({overviewData.reportingMonth})</span>
          </h2>
        </div>

        {/* 6 Key Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-[#64748b]">Reporting Month</div>
            <div className="text-base font-extrabold text-[#0d1730]">{overviewData.reportingMonth}</div>
            <div className="text-[10px] text-[#059669] font-bold">● Active Reporting Cycle</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-[#64748b]">Total PCB Produced</div>
            <div className="text-base font-extrabold font-mono text-[#0d1730]">
              {overviewData.totalPcbProduced.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#64748b]">Rigid &amp; Multilayer Units</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-[#64748b]">Total PCBA Produced</div>
            <div className="text-base font-extrabold font-mono text-[#0d1730]">
              {overviewData.totalPcbaProduced.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#64748b]">SMT &amp; THT Assembled</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-[#64748b]">Overall Quality Rating</div>
            <div className="text-base font-extrabold font-mono text-[#059669]">
              {overviewData.overallQualityRating}
            </div>
            <div className="text-[10px] text-[#059669] font-semibold">Exceeds 98.0% Benchmark</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-[#64748b]">Customer Complaints</div>
            <div className="text-base font-extrabold font-mono text-[#b45309]">
              {overviewData.customerComplaints}
            </div>
            <div className="text-[10px] text-[#b45309] font-medium">Under Root-Cause Review</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold text-[#64748b]">Open NCR</div>
            <div className="text-base font-extrabold font-mono text-[#d97706]">
              {overviewData.openNcr}
            </div>
            <div className="text-[10px] text-[#d97706] font-medium">In-Process Containment</div>
          </div>
        </div>

        {/* Structured Table Format matching prompt requirement */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Item</th>
                <th className="py-2.5 px-4 font-mono">Value</th>
                <th className="py-2.5 px-4">Engineering Scope &amp; Target Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
              <tr className="hover:bg-[#f8fafc]">
                <td className="py-2.5 px-4 font-semibold">Reporting Month</td>
                <td className="py-2.5 px-4 font-mono font-bold">{overviewData.reportingMonth}</td>
                <td className="py-2.5 px-4 text-[#64748b]">Monthly QMS Closed-Loop Period</td>
              </tr>
              <tr className="hover:bg-[#f8fafc]">
                <td className="py-2.5 px-4 font-semibold">Total PCB Produced</td>
                <td className="py-2.5 px-4 font-mono font-bold">{overviewData.totalPcbProduced.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-[#64748b]">Raw Bare Board Fabrication Output</td>
              </tr>
              <tr className="hover:bg-[#f8fafc]">
                <td className="py-2.5 px-4 font-semibold">Total PCBA Produced</td>
                <td className="py-2.5 px-4 font-mono font-bold">{overviewData.totalPcbaProduced.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-[#64748b]">Surface Mount &amp; Through-Hole Assembly Output</td>
              </tr>
              <tr className="hover:bg-[#f8fafc]">
                <td className="py-2.5 px-4 font-semibold">Overall Quality Rating</td>
                <td className="py-2.5 px-4 font-mono font-bold text-[#059669]">{overviewData.overallQualityRating}</td>
                <td className="py-2.5 px-4 text-[#059669] font-medium">World-Class Class 2 &amp; 3 Assembly Rating</td>
              </tr>
              <tr className="hover:bg-[#f8fafc]">
                <td className="py-2.5 px-4 font-semibold">Customer Complaints</td>
                <td className="py-2.5 px-4 font-mono font-bold text-[#b45309]">{overviewData.customerComplaints}</td>
                <td className="py-2.5 px-4 text-[#64748b]">Field RMA &amp; Customer Incident Reports</td>
              </tr>
              <tr className="hover:bg-[#f8fafc]">
                <td className="py-2.5 px-4 font-semibold">Open NCR</td>
                <td className="py-2.5 px-4 font-mono font-bold text-[#d97706]">{overviewData.openNcr}</td>
                <td className="py-2.5 px-4 text-[#64748b]">Non-Conformance Reports in Active CAPA Resolution</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: Quality KPI Performance */}
      <section id="section-quality-dev-kpi" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>2. Quality KPI Performance</span>
          </h2>
          <span className="text-xs text-[#059669] font-bold bg-[#ecfdf5] px-2.5 py-1 rounded-full border border-[#a7f3d0]">
            100% On-Target Quality Rating 🟢
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">KPI Metric</th>
                <th className="py-3 px-4 font-mono">Target</th>
                <th className="py-3 px-4 font-mono">Actual</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Performance Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
              {kpiPerformanceData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]">
                  <td className="py-3 px-4 font-bold text-[#1c356b] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                    <span>{row.kpi}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#64748b]">{row.target}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-[#059669] text-sm">
                    {row.actual}
                  </td>
                  <td className="py-3 px-4 text-center text-base select-none">{row.status}</td>
                  <td className="py-3 px-4 text-[#059669] font-medium">{row.benchmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: Defect Trend Analysis (Pareto Chart + Monthly Trend Graph) */}
      <section id="section-quality-dev-defect-trend" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e35b2a]" />
              <span>3. Defect Trend Analysis</span>
            </h2>
            <p className="text-xs text-[#64748b]">
              Defect Distribution Pareto Analysis &amp; 6-Month Production Trend Evolution
            </p>
          </div>

          {/* Toggle between PCB & PCBA Pareto View */}
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] self-start sm:self-auto">
            <button
              onClick={() => setActiveDefectTab('PCB')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeDefectTab === 'PCB'
                  ? 'bg-white text-[#1c356b] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0d1730]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>PCB Defects</span>
            </button>
            <button
              onClick={() => setActiveDefectTab('PCBA')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeDefectTab === 'PCBA'
                  ? 'bg-white text-[#1c356b] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0d1730]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>PCBA Defects</span>
            </button>
          </div>
        </div>

        {/* Defects Category Badges Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PCB Defects Card */}
          <div
            onClick={() => setActiveDefectTab('PCB')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeDefectTab === 'PCB'
                ? 'bg-[#f0f9ff] border-[#0284c7] ring-1 ring-[#0284c7]'
                : 'bg-white border-[#cbd5e1] hover:bg-[#f8fafc]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0369a1] flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>PCB Defects (Bare Board)</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#0284c7]">484 Total Defect Pcs</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Open Circuit', 'Short Circuit', 'Scratch', 'Pad Damage', 'Hole Miss'].map((def) => (
                <span
                  key={def}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#bae6fd] text-[#0369a1] shadow-2xs"
                >
                  {def}
                </span>
              ))}
            </div>
          </div>

          {/* PCBA Defects Card */}
          <div
            onClick={() => setActiveDefectTab('PCBA')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeDefectTab === 'PCBA'
                ? 'bg-[#fff7ed] border-[#ea580c] ring-1 ring-[#ea580c]'
                : 'bg-white border-[#cbd5e1] hover:bg-[#f8fafc]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c2410c] flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>PCBA Defects (SMT &amp; Assembly)</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#ea580c]">736 Total Defect Pcs</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Solder Bridge',
                'Missing Component',
                'Wrong Component',
                'Polarity Error',
                'Functional Failure',
              ].map((def) => (
                <span
                  key={def}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#fed7aa] text-[#c2410c] shadow-2xs"
                >
                  {def}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Grid: 1. Pareto Chart, 2. Monthly Trend Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Pareto Chart */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-sm font-bold text-[#0d1730]">
                  {activeDefectTab} Defect Pareto Chart (80/20 Rule)
                </h3>
                <p className="text-[11px] text-[#64748b]">Defect Count (Bars) &amp; Cumulative % (Line)</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#1c356b]">
                {activeDefectTab} Focus
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeParetoData} margin={{ top: 10, right: 20, bottom: 25, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#475569' }} label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#e35b2a' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Defect Occurrences"
                    fill={activeDefectTab === 'PCB' ? '#0284c7' : '#e35b2a'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumPercent"
                    name="Cumulative %"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Trend Graph */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-sm font-bold text-[#0d1730]">
                  Monthly Quality Trend Evolution (Apr - Sep 2026)
                </h3>
                <p className="text-[11px] text-[#64748b]">FPY (%) vs Rejection % across Consecutive Months</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#059669]">
                FPY: 98.5%
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, bottom: 25, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 2.0]} tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="pcbaReject"
                    name="PCBA Reject %"
                    stroke="#e35b2a"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pcbReject"
                    name="PCB Reject %"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Production Line Performance */}
      <section id="section-quality-dev-line-perf" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1c356b]" />
            <span>4. Production Line Performance</span>
          </h2>
          <span className="text-xs text-[#64748b]">Total SMT &amp; MI Lines Output</span>
        </div>

        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4 font-mono">Output</th>
                <th className="py-3 px-4 font-mono">Reject Qty</th>
                <th className="py-3 px-4 font-mono">Reject %</th>
                <th className="py-3 px-4">Cpk Capability</th>
                <th className="py-3 px-4 text-center">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
              {linePerformanceData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]">
                  <td className="py-3 px-4 font-bold text-[#1c356b] flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>{row.line}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">{row.output.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#d97706]">{row.rejectQty}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0d1730]">{row.rejectPct}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#059669]">{row.cpk}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        row.status === 'Optimal'
                          ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                          : row.status === 'Good'
                          ? 'bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]'
                          : row.status === 'Controlled'
                          ? 'bg-[#fef9c3] text-[#854d0e] border border-[#fef08a]'
                          : 'bg-[#fee2e2] text-[#dc2626] border border-[#fecaca]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Total Aggregate Row */}
              <tr className="bg-[#f8fafc] font-bold border-t-2 border-[#cbd5e1] text-[#0d1730]">
                <td className="py-3 px-4 text-[#1c356b]">Overall Total</td>
                <td className="py-3 px-4 font-mono">{totalLineOutput.toLocaleString()}</td>
                <td className="py-3 px-4 font-mono text-[#d97706]">{totalLineRejects}</td>
                <td className="py-3 px-4 font-mono text-[#059669]">{avgLineRejectPct}</td>
                <td className="py-3 px-4 font-mono text-[#059669]">1.61 Avg</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#059669]">
                    PASSED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: NCR & CAPA Status */}
      <section id="section-quality-dev-ncr" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d97706]" />
              <span>5. NCR &amp; CAPA Status</span>
            </h2>
            <p className="text-xs text-[#64748b]">
              Non-Conformance Reports, Root Cause Investigation &amp; Corrective Actions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] text-xs">
              {(['ALL', 'Open', 'Closed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setNcrFilter(st)}
                  className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                    ncrFilter === st
                      ? 'bg-white text-[#1c356b] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0d1730]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search NCR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] placeholder-[#94a3b8] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4 font-mono">NCR No</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Identified Root Cause</th>
                <th className="py-3 px-4">Corrective Action Taken</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
              {filteredNcr.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]">
                  <td className="py-3 px-4 font-mono font-bold text-[#1c356b] whitespace-nowrap">
                    {item.ncrNo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0d1730]">{item.issue}</td>
                  <td className="py-3 px-4 text-[#475569]">{item.rootCause}</td>
                  <td className="py-3 px-4 text-[#0369a1]">{item.action}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        item.status === 'Open'
                          ? 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]'
                          : 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6: Supplier Quality Performance */}
      <section id="section-quality-dev-supplier" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
            <span>6. Supplier Quality Performance</span>
          </h2>
          <span className="text-xs text-[#64748b]">Inbound Material Quality Rating</span>
        </div>

        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Supplied Material</th>
                <th className="py-3 px-4 font-mono">Defect PPM</th>
                <th className="py-3 px-4 font-mono">Acceptance Spec</th>
                <th className="py-3 px-4 font-mono">Audit Score</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
              {supplierQualityData.map((supp, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]">
                  <td className="py-3 px-4 font-bold text-[#1c356b] flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>{supp.supplier}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#475569]">{supp.material}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0d1730]">{supp.ppm} PPM</td>
                  <td className="py-3 px-4 font-mono text-[#64748b]">{supp.targetPpm}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#059669]">{supp.auditScore}/100</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        supp.status === 'Approved'
                          ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                          : 'bg-[#fef9c3] text-[#854d0e] border border-[#fef08a]'
                      }`}
                    >
                      {supp.status === 'Approved' ? '🟢 Approved' : '🟡 Monitoring'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 7: Improvement Projects */}
      <section id="section-quality-dev-improvements" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>7. Improvement Projects</span>
          </h2>
          <span className="text-xs text-[#059669] font-bold bg-[#ecfdf5] px-2.5 py-1 rounded-full border border-[#a7f3d0]">
            Kaizen &amp; Six Sigma Initiatives
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Objective</th>
                <th className="py-3 px-4 font-mono text-emerald-700">Validated Result</th>
                <th className="py-3 px-4">Technical Impact &amp; Deliverable</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
              {improvementProjectsData.map((proj, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]">
                  <td className="py-3 px-4 font-bold text-[#1c356b] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>{proj.project}</span>
                  </td>
                  <td className="py-3 px-4 text-[#475569]">{proj.objective}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-[#059669] text-sm">
                    {proj.result}
                  </td>
                  <td className="py-3 px-4 text-[#334155]">{proj.impact}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.status === 'Completed'
                          ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                          : 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
