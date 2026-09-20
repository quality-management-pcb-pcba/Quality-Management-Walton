import React, { useState } from 'react';
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
import { PCB_BY_PRODUCT } from '../../data/initialData';
import {
  Users,
  UserCheck,
  UserMinus,
  FileText,
  X,
  CheckCircle,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Check,
} from 'lucide-react';
import { PageId } from '../../types';
import { PCBQualityDataEntryPortal } from '../PCBQualityDataEntryPortal';

interface PCBViewProps {
  onNavigate?: (page: PageId) => void;
  selectedProduct?: string;
  selectedMonth?: string;
}

interface PCBManpowerEntry {
  id: string;
  process: string;
  department: 'FAB' | 'QC';
  required: number;
  available: number;
}

const DEFAULT_PCB_MANPOWER: PCBManpowerEntry[] = [
  { id: '1', process: 'Photo Lithography / Dry Film', department: 'FAB', required: 10, available: 9 },
  { id: '2', process: 'CNC Mechanical Drilling', department: 'FAB', required: 14, available: 14 },
  { id: '3', process: 'PTH & Electroless Plating', department: 'FAB', required: 8, available: 8 },
  { id: '4', process: 'Outer Layer Acid Etching', department: 'FAB', required: 8, available: 7 },
  { id: '5', process: 'LPI Solder Mask Screen & Bake', department: 'FAB', required: 12, available: 12 },
  { id: '6', process: 'Silk Screen / Legend Printing', department: 'FAB', required: 6, available: 6 },
  { id: '7', process: 'HASL & ENIG Surface Finish', department: 'FAB', required: 8, available: 7 },
  { id: '8', process: 'V-Cut & CNC Routing Profiling', department: 'FAB', required: 10, available: 10 },
  { id: '9', process: 'Bare Board AOI Inspection', department: 'QC', required: 8, available: 8 },
  { id: '10', process: 'Flying Probe & E-Test', department: 'QC', required: 6, available: 5 },
  { id: '11', process: 'FQC Visual & Final Pack Audit', department: 'QC', required: 6, available: 5 },
];

export const PCBView: React.FC<PCBViewProps> = ({
  onNavigate = (_page: PageId) => {},
  selectedProduct: _selectedProduct = 'All Products',
  selectedMonth: _selectedMonth = 'August 2026',
}) => {
  const [activeModal, setActiveModal] = useState<'attendance' | 'report' | 'sop' | null>(null);

  // PCB Manpower State
  const [manpowerList, setManpowerList] = useState<PCBManpowerEntry[]>(() => {
    const saved = localStorage.getItem('pcb_manpower_attendance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PCB_MANPOWER;
      }
    }
    return DEFAULT_PCB_MANPOWER;
  });

  const [deptFilter, setDeptFilter] = useState<'ALL' | 'FAB' | 'QC'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProcess, setNewProcess] = useState('');
  const [newDepartment, setNewDepartment] = useState<'FAB' | 'QC'>('FAB');
  const [newRequired, setNewRequired] = useState(4);
  const [newAvailable, setNewAvailable] = useState(4);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Update quantity handler
  const handleUpdateQty = (id: string, field: 'required' | 'available', delta: number) => {
    setManpowerList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedVal = Math.max(0, item[field] + delta);
          return { ...item, [field]: updatedVal };
        }
        return item;
      })
    );
  };

  // Direct edit quantity handler
  const handleSetQty = (id: string, field: 'required' | 'available', val: number) => {
    setManpowerList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: Math.max(0, val) };
        }
        return item;
      })
    );
  };

  // Add new process entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcess.trim()) return;

    const newEntry: PCBManpowerEntry = {
      id: Date.now().toString(),
      process: newProcess.trim(),
      department: newDepartment,
      required: Number(newRequired) || 0,
      available: Number(newAvailable) || 0,
    };

    const updated = [...manpowerList, newEntry];
    setManpowerList(updated);
    localStorage.setItem('pcb_manpower_attendance', JSON.stringify(updated));

    setNewProcess('');
    setShowAddForm(false);
    showNotification('New PCB process attendance entry added successfully!');
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    const updated = manpowerList.filter((m) => m.id !== id);
    setManpowerList(updated);
    localStorage.setItem('pcb_manpower_attendance', JSON.stringify(updated));
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Reset PCB manpower attendance table to factory defaults?')) {
      setManpowerList(DEFAULT_PCB_MANPOWER);
      localStorage.setItem('pcb_manpower_attendance', JSON.stringify(DEFAULT_PCB_MANPOWER));
      showNotification('Manpower attendance table reset to defaults.');
    }
  };

  // Save changes
  const handleSaveAttendance = () => {
    localStorage.setItem('pcb_manpower_attendance', JSON.stringify(manpowerList));
    showNotification('PCB manpower attendance saved and updated successfully!');
  };

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  // Filtered list
  const filteredManpower = manpowerList.filter((m) => {
    if (deptFilter === 'ALL') return true;
    return m.department === deptFilter;
  });

  // Calculate totals
  const totalRequired = filteredManpower.reduce((acc, curr) => acc + curr.required, 0);
  const totalAvailable = filteredManpower.reduce((acc, curr) => acc + curr.available, 0);
  const totalShortage = totalAvailable - totalRequired;

  const aoiMonthlyData = [
    { month: 'May', checkQty: 326, faultQty: 114, rate: 34.97 },
    { month: 'June', checkQty: 4277, faultQty: 2258, rate: 52.79 },
    { month: 'July', checkQty: 1209, faultQty: 641, rate: 53.02 },
  ];

  const fqcMonthlyData = [
    { month: 'June', checked: 1057761, fail: 23674, reject: 3306, rate: 2.24 },
    { month: 'July', checked: 201294, fail: 4852, reject: 0, rate: 2.41 },
  ];

  return (
    <div id="page-pcb" className="space-y-6 animate-in fade-in duration-200">
      {/* Head: Title on left, 3 buttons (Attendance, Reports, SOP) on upper right matching PCBA section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1730]">PCB Quality</h2>
          <div className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Production Quality · PCB
          </div>
        </div>

        {/* 3 Upper Right Buttons: Attendance, Reports, SOP matching PCBA */}
        <div id="pcb-action-buttons" className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="btn-pcb-attendance"
            onClick={() => setActiveModal('attendance')}
            className="px-4 sm:px-6 py-2.5 bg-[#182a52] hover:bg-[#22376b] text-white text-xs sm:text-sm font-bold rounded-xl border border-[#2d4c8e] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Attendance</span>
          </button>

          <button
            id="btn-pcb-reports"
            onClick={() => setActiveModal('report')}
            className="px-4 sm:px-6 py-2.5 bg-[#182a52] hover:bg-[#22376b] text-white text-xs sm:text-sm font-bold rounded-xl border border-[#2d4c8e] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Reports</span>
          </button>

          <button
            id="btn-pcb-sop"
            onClick={() => setActiveModal('sop')}
            className="px-4 sm:px-6 py-2.5 bg-[#182a52] hover:bg-[#22376b] text-white text-xs sm:text-sm font-bold rounded-xl border border-[#2d4c8e] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>SOP</span>
          </button>
        </div>
      </div>

      {/* Workforce 3-Card Row matching PCBA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL MP */}
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#2563eb] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">TOTAL MP</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-1">96</div>
        </div>

        {/* PRESENT */}
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#db2777] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">PRESENT</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-1">91</div>
        </div>

        {/* LEAVE */}
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#16a34a] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
            <UserMinus className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">LEAVE</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-1">5</div>
        </div>
      </div>

      {/* Inspection Gate Summary Table matching PCBA */}
      <div className="bg-white border border-[#e2e7f2] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0f172a] text-white">
              <th className="py-3.5 px-6 font-semibold uppercase tracking-wider text-xs w-1/4">INSPECTION GATE</th>
              <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-center sm:text-left">CHECKED QTY</th>
              <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-center sm:text-left">FAIL QTY</th>
              <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-center sm:text-left">FAIL (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e7f2]">
            <tr className="hover:bg-[#fbfcfe] transition-colors">
              <td className="py-4 px-6 font-bold text-sm text-[#0d1730]">
                Final Quality Control (FQC)
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                1,259,055
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                28,526
              </td>
              <td className="py-4 px-6">
                <span className="inline-block px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#e5f7ee] text-[#10b981]">
                  2.27%
                </span>
              </td>
            </tr>
            <tr className="hover:bg-[#fbfcfe] transition-colors">
              <td className="py-4 px-6 font-bold text-sm text-[#0d1730]">
                Automated Optical Inspection (AOI)
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                5,812
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                3,013
              </td>
              <td className="py-4 px-6">
                <span className="inline-block px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#fbe6e6] text-[#d64545]">
                  51.84%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grid 2: AOI Fault by Product Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0d1730]">AOI Fault — by Product</h3>
              <p className="text-xs text-[#5b6480]">Defect incidence categorized by board application</p>
            </div>
            <span className="text-xs text-[#8891a8] font-mono">5 Categories</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#182a52] text-white">
                  <th className="py-2 px-3 rounded-l-md font-semibold text-[11px]">Product</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Check Qty</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Fault Qty</th>
                  <th className="py-2 px-3 rounded-r-md font-semibold text-[11px]">Fault (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7f2]">
                {PCB_BY_PRODUCT.map((p) => (
                  <tr key={p.product} className="hover:bg-[#fbfcfe]">
                    <td className="py-2 px-3 font-medium text-[#0d1730]">{p.product}</td>
                    <td className="py-2 px-3 font-mono">{p.checkQty.toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-[#d64545]">{p.faultQty.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                          p.faultRate > 40
                            ? 'bg-[#fbe6e6] text-[#d64545]'
                            : p.faultRate > 20
                            ? 'bg-[#fdf1de] text-[#c74a1f]'
                            : 'bg-[#e5f7ee] text-[#1c8a53]'
                        }`}
                      >
                        {p.faultRate.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#f6f8fd] font-bold">
                  <td className="py-2 px-3 text-[#0d1730]">Grand Total</td>
                  <td className="py-2 px-3 font-mono">5,812</td>
                  <td className="py-2 px-3 font-mono text-[#d64545]">3,013</td>
                  <td className="py-2 px-3 font-mono text-[#d64545]">51.84%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Comparison Chart */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Check vs Fault Qty by Product</h3>
            <p className="text-xs text-[#5b6480] mb-2">AOI scan volume (Blue) vs Flagged defect count (Orange)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PCB_BY_PRODUCT} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="product" stroke="#5b6480" fontSize={10} />
                <YAxis scale="sqrt" stroke="#5b6480" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="checkQty" name="Checked Qty" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faultQty" name="Fault Qty" fill="#e35b2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#5b6480] pt-2 border-t border-[#e2e7f2]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2563eb]" /> Checked Qty</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e35b2a]" /> Fault Qty</span>
          </div>
        </div>
      </div>

      {/* Grid 3: AOI by Month Table & Check vs Fault Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0d1730]">AOI Fault — by Month</h3>
              <p className="text-xs text-[#5b6480]">Summary of automated scan failures</p>
            </div>
            <span className="text-xs text-[#8891a8] font-mono">Q2 - Q3 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#182a52] text-white">
                  <th className="py-2 px-3 rounded-l-md font-semibold text-[11px]">Month</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Check Qty</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Fault Qty</th>
                  <th className="py-2 px-3 rounded-r-md font-semibold text-[11px]">Fault (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7f2]">
                <tr className="hover:bg-[#fbfcfe]">
                  <td className="py-2.5 px-3 font-medium text-[#0d1730]">July</td>
                  <td className="py-2.5 px-3 font-mono">1,209</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">641</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-[#fbe6e6] text-[#d64545]">
                      53.02%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#fbfcfe]">
                  <td className="py-2.5 px-3 font-medium text-[#0d1730]">June</td>
                  <td className="py-2.5 px-3 font-mono">4,277</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">2,258</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-[#fbe6e6] text-[#d64545]">
                      52.79%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#fbfcfe]">
                  <td className="py-2.5 px-3 font-medium text-[#0d1730]">May</td>
                  <td className="py-2.5 px-3 font-mono">326</td>
                  <td className="py-2.5 px-3 font-mono text-[#e8a13a]">114</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-[#fdf1de] text-[#c74a1f]">
                      34.97%
                    </span>
                  </td>
                </tr>
                <tr className="bg-[#f6f8fd] font-bold">
                  <td className="py-2.5 px-3 text-[#0d1730]">Grand Total</td>
                  <td className="py-2.5 px-3 font-mono">5,812</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">3,013</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">51.84%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FQC Fail Trend Chart */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">FQC Fail Volume Trend</h3>
            <p className="text-xs text-[#5b6480] mb-2">High volume June run vs July batch release</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fqcMonthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="month" stroke="#5b6480" fontSize={11} />
                <YAxis stroke="#5b6480" fontSize={11} />
                <Tooltip
                  formatter={(val: number) => [val.toLocaleString(), 'Fail Qty']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="fail"
                  name="Fail Qty"
                  stroke="#e8478f"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#e8478f' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-2 border-t border-[#e2e7f2]">
            Consistent 2.24% - 2.41% failure rate indicates high PCB fabrication process stability.
          </div>
        </div>
      </div>

      {/* --- MODAL 1: PCB ATTENDANCE MODAL --- */}
      {activeModal === 'attendance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e7f2] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0d1730] text-white flex items-center justify-between border-b-[3px] border-[#2563eb]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2563eb] rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">PCB Workforce Attendance</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2563eb]/30 text-[#93c5fd] border border-[#2563eb]/50">
                      Live Shift Entry
                    </span>
                  </div>
                  <p className="text-xs text-[#9fb0d6]">Fabrication, Wet Process, AOI &amp; Testing Headcount &amp; Attendance</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9fb0d6] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Toast */}
            {saveSuccessMsg && (
              <div className="bg-[#e5f7ee] border-b border-[#a3e6c0] px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#16a34a] animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#0d1730]">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#2563eb]/10 border border-[#2563eb]/30 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider">Total MP</div>
                  <div className="text-2xl font-bold font-mono text-[#2563eb] mt-1">96</div>
                  <div className="text-[10px] text-[#5b6480] mt-0.5">Bare Board Operations</div>
                </div>
                <div className="p-3.5 bg-[#db2777]/10 border border-[#db2777]/30 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-[#db2777] uppercase tracking-wider">Present Today</div>
                  <div className="text-2xl font-bold font-mono text-[#db2777] mt-1">91 (94.8%)</div>
                  <div className="text-[10px] text-[#5b6480] mt-0.5">Checked In on Floor</div>
                </div>
                <div className="p-3.5 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">Leave / Off</div>
                  <div className="text-2xl font-bold font-mono text-[#16a34a] mt-1">5 Approved</div>
                  <div className="text-[10px] text-[#5b6480] mt-0.5">Scheduled Absence</div>
                </div>
              </div>

              {/* --- ENTRY MANPOWER ATTENDANCE SECTION --- */}
              <div className="bg-[#f8fafc] border border-[#e2e7f2] rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-base text-[#0d1730] flex items-center gap-2">
                      <span>Entry Manpower Attendance</span>
                      <span className="text-xs font-normal text-[#5b6480]">
                        ({filteredManpower.length} Process Stations)
                      </span>
                    </h4>
                    <p className="text-xs text-[#5b6480] mt-0.5">
                      Process station headcount requirements and actual available staff
                    </p>
                  </div>

                  {/* Filter & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Dept Filters */}
                    <div className="inline-flex rounded-lg border border-[#e2e7f2] bg-white p-0.5 shadow-2xs">
                      {(['ALL', 'FAB', 'QC'] as const).map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setDeptFilter(dept)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            deptFilter === dept
                              ? 'bg-[#182a52] text-white font-bold'
                              : 'text-[#5b6480] hover:text-[#0d1730]'
                          }`}
                        >
                          {dept === 'ALL' ? 'All' : dept === 'FAB' ? 'Fabrication' : 'QC & Testing'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Process Entry
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="p-1.5 border border-[#e2e7f2] bg-white hover:bg-[#f1f5f9] text-[#5b6480] rounded-lg text-xs transition-colors cursor-pointer"
                      title="Reset Table to Factory Default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add New Entry Form Drawer */}
                {showAddForm && (
                  <form
                    onSubmit={handleAddEntry}
                    className="p-3.5 bg-white border border-[#2563eb]/30 rounded-xl space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#e2e7f2]">
                      <span className="font-bold text-xs text-[#2563eb] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        New Process Attendance Entry
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-[#8891a8] hover:text-[#0d1730] text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5b6480] mb-1">
                          Process Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Copper Strip, Solder Mask, AOI"
                          value={newProcess}
                          onChange={(e) => setNewProcess(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5b6480] mb-1">
                          Department
                        </label>
                        <select
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value as 'FAB' | 'QC')}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        >
                          <option value="FAB">Fabrication</option>
                          <option value="QC">QC &amp; Testing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5b6480] mb-1">
                          Required MP
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={newRequired}
                          onChange={(e) => setNewRequired(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5b6480] mb-1">
                          Available MP
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={newAvailable}
                          onChange={(e) => setNewAvailable(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Save Process Entry
                      </button>
                    </div>
                  </form>
                )}

                {/* Manpower Data Spreadsheet Table */}
                <div className="overflow-x-auto border border-[#e2e7f2] rounded-xl bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#182a52] text-white">
                        <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px]">No.</th>
                        <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px]">Process</th>
                        <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px]">Dept</th>
                        <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-center">
                          Required
                        </th>
                        <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-center">
                          Available
                        </th>
                        <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-center">
                          Shortage / Surplus
                        </th>
                        <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-[11px] text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e7f2]">
                      {filteredManpower.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#8891a8]">
                            No processes found for the selected department filter.
                          </td>
                        </tr>
                      ) : (
                        filteredManpower.map((m, index) => {
                          const shortage = m.available - m.required;
                          return (
                            <tr key={m.id} className="hover:bg-[#fbfcfe] transition-colors">
                              <td className="py-2.5 px-3.5 font-mono text-[#5b6480] text-[11px]">
                                {index + 1}
                              </td>
                              <td className="py-2.5 px-3.5 font-semibold text-[#0d1730]">
                                {m.process}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    m.department === 'FAB'
                                      ? 'bg-[#e0f2fe] text-[#0369a1]'
                                      : 'bg-[#fce7f3] text-[#be185d]'
                                  }`}
                                >
                                  {m.department}
                                </span>
                              </td>

                              {/* Required MP with Stepper */}
                              <td className="py-2.5 px-3.5">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(m.id, 'required', -1)}
                                    className="w-5 h-5 flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d1730] font-bold rounded cursor-pointer text-xs"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={m.required}
                                    onChange={(e) => handleSetQty(m.id, 'required', Number(e.target.value))}
                                    className="w-12 text-center font-mono font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded px-1 py-0.5 text-xs text-[#0d1730] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(m.id, 'required', 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d1730] font-bold rounded cursor-pointer text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Available MP with Stepper */}
                              <td className="py-2.5 px-3.5">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(m.id, 'available', -1)}
                                    className="w-5 h-5 flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d1730] font-bold rounded cursor-pointer text-xs"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={m.available}
                                    onChange={(e) => handleSetQty(m.id, 'available', Number(e.target.value))}
                                    className="w-12 text-center font-mono font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded px-1 py-0.5 text-xs text-[#0d1730] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(m.id, 'available', 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d1730] font-bold rounded cursor-pointer text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Shortage / Surplus Indicator */}
                              <td className="py-2.5 px-3.5 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] inline-block ${
                                    shortage < 0
                                      ? 'bg-[#fee2e2] text-[#dc2626]'
                                      : shortage > 0
                                      ? 'bg-[#e0f2fe] text-[#0284c7]'
                                      : 'bg-[#dcfce7] text-[#16a34a]'
                                  }`}
                                >
                                  {shortage > 0 ? `+${shortage}` : shortage}
                                </span>
                              </td>

                              {/* Delete button */}
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntry(m.id)}
                                  className="text-[#94a3b8] hover:text-[#ef4444] transition-colors p-1 cursor-pointer"
                                  title="Delete process"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}

                      {/* Summary Total Row */}
                      <tr className="bg-[#f1f5f9] font-bold border-t-2 border-[#cbd5e1]">
                        <td colSpan={3} className="py-3 px-3.5 text-[#0d1730] uppercase tracking-wider text-[11px]">
                          Grand Total ({deptFilter} Filter)
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono text-sm text-[#0d1730]">
                          {totalRequired}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono text-sm text-[#0d1730]">
                          {totalAvailable}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono text-sm">
                          <span
                            className={
                              totalShortage < 0
                                ? 'text-[#dc2626]'
                                : totalShortage > 0
                                ? 'text-[#0284c7]'
                                : 'text-[#16a34a]'
                            }
                          >
                            {totalShortage > 0 ? `+${totalShortage}` : totalShortage}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-[#5b6480]">
                    * Changes are automatically cached and can be committed permanently with Save.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Save &amp; Update Live Attendance
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-[#e2e7f2] flex items-center justify-between">
              <span className="text-[11px] text-[#5b6480]">
                Walton Digi-Tech Industries Ltd · PCB Bare Board Quality Management
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-[#0d1730] hover:bg-[#182a52] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PCB REPORTS & QM DATA ENTRY PORTAL (User specified: "just Report area will be different") --- */}
      {activeModal === 'report' && (
        <PCBQualityDataEntryPortal onClose={() => setActiveModal(null)} />
      )}

      {/* --- MODAL 3: PCB SOP MODAL --- */}
      {activeModal === 'sop' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e7f2] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#0d1730] text-white flex items-center justify-between border-b-[3px] border-[#16a34a]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#16a34a] rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">PCB Standard Operating Procedures (SOP)</h3>
                  <p className="text-xs text-[#9fb0d6]">Controlled Work Instructions for Bare Board Fabrication, AOI, &amp; E-Test</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9fb0d6] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#0d1730]">
              <div className="space-y-2.5">
                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCB-001
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">Bare Board Automated Optical Inspection (AOI)</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Golden panel programming, scan sensitivity &amp; false alarm containment</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCB-002
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">Flying Probe &amp; Universal Grid Electrical Testing (E-Test)</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Netlist import, continuity threshold (50Ω), isolation test (100MΩ @ 250V)</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCB-003
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">Copper Clad Laminate (CCL) Storage &amp; Baking</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Moisture desorption cycle (120°C 4h), FR-1 vs FR-4 warp prevention</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCB-004
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">Liquid Photoimageable (LPI) Solder Mask Screen &amp; UV Cure</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Viscosity control, exposure energy (400-500 mJ/cm²), final thermal cure</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCB-005
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">Through-Hole Copper Plating &amp; Etch Factor Cross-Section</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Micro-section coupon preparation, minimum 20µm hole wall copper IPC-6012</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#e2e7f2]">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate('docs');
                  }}
                  className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View All Factory Controlled SOPs
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-[#0d1730] hover:bg-[#182a52] text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
