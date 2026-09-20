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
import { PCBA_BY_PRODUCT } from '../../data/initialData';
import {
  Users,
  UserCheck,
  UserMinus,
  FileText,
  Download,
  X,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Layers,
  Cpu,
} from 'lucide-react';
import { PageId } from '../../types';
import { PCBAQualityDataEntryPortal } from '../PCBAQualityDataEntryPortal';

interface PCBAViewProps {
  onNavigate?: (page: PageId) => void;
  selectedProduct?: string;
  selectedMonth?: string;
}

interface ManpowerEntry {
  id: string;
  process: string;
  department: 'SMT' | 'MI';
  required: number;
  available: number;
}

const DEFAULT_MANPOWER_DATA: ManpowerEntry[] = [
  { id: '1', process: 'IQC', department: 'SMT', required: 2, available: 1 },
  { id: '2', process: 'AOI', department: 'SMT', required: 7, available: 7 },
  { id: '3', process: 'Aesthetic', department: 'SMT', required: 2, available: 2 },
  { id: '4', process: 'Function Test', department: 'SMT', required: 5, available: 2 },
  { id: '5', process: 'QC-Common', department: 'SMT', required: 2, available: 1 },
  { id: '6', process: 'QC-Common', department: 'MI', required: 2, available: 2 },
  { id: '7', process: 'Aesthetic', department: 'MI', required: 2, available: 2 },
  { id: '8', process: 'Function Test', department: 'MI', required: 2, available: 2 },
  { id: '9', process: 'ATE', department: 'MI', required: 2, available: 2 },
  { id: '10', process: 'DC Load + Aging', department: 'MI', required: 1, available: 1 },
  { id: '11', process: 'Sound Test', department: 'MI', required: 1, available: 1 },
];

export const PCBAView: React.FC<PCBAViewProps> = ({
  onNavigate = (_page: PageId) => {},
  selectedProduct: _selectedProduct = 'All Products',
  selectedMonth: _selectedMonth = 'August 2026',
}) => {
  const [activeModal, setActiveModal] = useState<'attendance' | 'report' | 'sop' | null>(null);
  const [portalInitialLine, setPortalInitialLine] = useState<string>('MI Line-01');
  const [portalInitialNav, setPortalInitialNav] = useState<{ type: string; value: string } | undefined>(undefined);

  // Manpower Attendance State
  const [manpowerList, setManpowerList] = useState<ManpowerEntry[]>(() => {
    const saved = localStorage.getItem('pcba_manpower_attendance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_MANPOWER_DATA;
      }
    }
    return DEFAULT_MANPOWER_DATA;
  });

  const [deptFilter, setDeptFilter] = useState<'ALL' | 'SMT' | 'MI'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProcess, setNewProcess] = useState('');
  const [newDepartment, setNewDepartment] = useState<'SMT' | 'MI'>('SMT');
  const [newRequired, setNewRequired] = useState(2);
  const [newAvailable, setNewAvailable] = useState(2);
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

    const newEntry: ManpowerEntry = {
      id: Date.now().toString(),
      process: newProcess.trim(),
      department: newDepartment,
      required: Number(newRequired) || 0,
      available: Number(newAvailable) || 0,
    };

    const updated = [...manpowerList, newEntry];
    setManpowerList(updated);
    localStorage.setItem('pcba_manpower_attendance', JSON.stringify(updated));

    setNewProcess('');
    setShowAddForm(false);
    showNotification('New process attendance entry added successfully!');
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    const updated = manpowerList.filter((m) => m.id !== id);
    setManpowerList(updated);
    localStorage.setItem('pcba_manpower_attendance', JSON.stringify(updated));
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Reset manpower attendance table to factory defaults?')) {
      setManpowerList(DEFAULT_MANPOWER_DATA);
      localStorage.setItem('pcba_manpower_attendance', JSON.stringify(DEFAULT_MANPOWER_DATA));
      showNotification('Manpower attendance reset to default.');
    }
  };

  // Save changes
  const handleSaveAttendance = () => {
    localStorage.setItem('pcba_manpower_attendance', JSON.stringify(manpowerList));
    showNotification('Manpower attendance saved and updated successfully!');
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

  const pcbaMonthlyData = [
    { month: 'June', checked: 1057761, fail: 23674, reject: 3306, rate: 2.24 },
    { month: 'July', checked: 201294, fail: 4852, reject: 0, rate: 2.41 },
  ];

  return (
    <div id="page-pcba" className="space-y-6 animate-in fade-in duration-200">
      {/* Head: Title on left, 3 buttons (Attendance, Reports, SOP) on upper right matching image */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1730]">PCBA Quality</h2>
          <div className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Production Quality · PCBA
          </div>
        </div>

        {/* 3 Upper Right Buttons: Attendance, Reports, SOP matching user mockup */}
        <div id="pcba-action-buttons" className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="btn-pcba-attendance"
            onClick={() => setActiveModal('attendance')}
            className="px-4 sm:px-6 py-2.5 bg-[#182a52] hover:bg-[#22376b] text-white text-xs sm:text-sm font-bold rounded-xl border border-[#2d4c8e] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Attendance</span>
          </button>

          <button
            id="btn-pcba-reports"
            onClick={() => setActiveModal('report')}
            className="px-4 sm:px-6 py-2.5 bg-[#182a52] hover:bg-[#22376b] text-white text-xs sm:text-sm font-bold rounded-xl border border-[#2d4c8e] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Reports</span>
          </button>

          <button
            id="btn-pcba-sop"
            onClick={() => setActiveModal('sop')}
            className="px-4 sm:px-6 py-2.5 bg-[#182a52] hover:bg-[#22376b] text-white text-xs sm:text-sm font-bold rounded-xl border border-[#2d4c8e] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>SOP</span>
          </button>
        </div>
      </div>

      {/* Workforce 3-Card Row matching image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL MP */}
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#2563eb] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">TOTAL MP</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-1">148</div>
        </div>

        {/* PRESENT */}
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#db2777] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">PRESENT</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-1">142</div>
        </div>

        {/* LEAVE */}
        <div className="p-5 rounded-2xl text-white shadow-xs bg-[#16a34a] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
            <UserMinus className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/90">LEAVE</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-1">6</div>
        </div>
      </div>

      {/* SMT vs MI Summary Table matching image */}
      <div className="bg-white border border-[#e2e7f2] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0f172a] text-white">
              <th className="py-3.5 px-6 font-semibold uppercase tracking-wider text-xs w-1/4"></th>
              <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-center sm:text-left">CHECKED QTY</th>
              <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-center sm:text-left">FAIL QTY</th>
              <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-center sm:text-left">FAIL (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e7f2]">
            <tr
              onClick={() => {
                setPortalInitialLine('SMT Line-01');
                setActiveModal('report');
              }}
              className="hover:bg-[#f0f4ff] transition-colors cursor-pointer group"
              title="Click to open SMT Line-01 AOI Defect Data Entry"
            >
              <td className="py-4 px-6 font-bold text-sm text-[#0d1730]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span>SMT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPortalInitialNav({ type: 'check', value: 'SMT Summary' });
                        setActiveModal('report');
                      }}
                      className="text-[10px] font-bold text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded-full border border-blue-300 transition-colors cursor-pointer"
                      title="Open Daily QM Report-SMT"
                    >
                      📊 QM SMT →
                    </button>
                    <span className="text-[10px] font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#2563eb]/20 opacity-80 group-hover:opacity-100 transition-opacity">
                      AOI Entry →
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                2,673,375
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                23,640
              </td>
              <td className="py-4 px-6">
                <span className="inline-block px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#e5f7ee] text-[#10b981]">
                  0.88%
                </span>
              </td>
            </tr>
            <tr
              onClick={() => {
                setPortalInitialLine('MI Line-01');
                setActiveModal('report');
              }}
              className="hover:bg-[#fffbeb] transition-colors cursor-pointer group"
              title="Click to open MI Line-01 Defect Data Entry"
            >
              <td className="py-4 px-6 font-bold text-sm text-[#0d1730]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>MI</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPortalInitialNav({ type: 'check', value: 'MI Summary' });
                        setActiveModal('report');
                      }}
                      className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300 transition-colors cursor-pointer"
                      title="Open Daily QM Report-MI"
                    >
                      📊 QM MI →
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPortalInitialLine('MI Line - Charger');
                        setActiveModal('report');
                      }}
                      className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300 transition-colors cursor-pointer"
                      title="Open MI Line Charger Defect Entry"
                    >
                      🔌 Charger Entry →
                    </button>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 opacity-80 group-hover:opacity-100 transition-opacity">
                      MI-01 Entry →
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                726,964
              </td>
              <td className="py-4 px-6 font-mono text-sm font-bold text-[#0d1730]">
                18,690
              </td>
              <td className="py-4 px-6">
                <span className="inline-block px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#fef3c7] text-[#d97706]">
                  2.57%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grid 2: Reject by Product Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0d1730]">Reject — by Product Line</h3>
              <p className="text-xs text-[#5b6480]">Volume throughput and assembly defect rates</p>
            </div>
            <span className="text-xs text-[#8891a8] font-mono">3.4M+ Total Checked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#182a52] text-white">
                  <th className="py-2 px-3 rounded-l-md font-semibold text-[11px]">Product</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Checked Qty</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Fail Qty</th>
                  <th className="py-2 px-3 rounded-r-md font-semibold text-[11px]">Fail (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7f2]">
                {PCBA_BY_PRODUCT.map((p) => (
                  <tr key={p.product} className="hover:bg-[#fbfcfe]">
                    <td className="py-2 px-3 font-medium text-[#0d1730]">{p.product}</td>
                    <td className="py-2 px-3 font-mono">{p.checkedQty.toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-[#d64545]">{p.failQty.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                          p.failRate > 5
                            ? 'bg-[#fdf1de] text-[#c74a1f]'
                            : p.failRate > 1
                            ? 'bg-[#eef1f8] text-[#22376b]'
                            : 'bg-[#e5f7ee] text-[#1c8a53]'
                        }`}
                      >
                        {p.failRate.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#f6f8fd] font-bold">
                  <td className="py-2 px-3 text-[#0d1730]">Grand Total</td>
                  <td className="py-2 px-3 font-mono">3,400,339</td>
                  <td className="py-2 px-3 font-mono text-[#d64545]">42,330</td>
                  <td className="py-2 px-3 font-mono text-[#1c8a53]">1.24%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Comparison Chart */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Checked vs Fail Qty by Product</h3>
            <p className="text-xs text-[#5b6480] mb-2">Checked volume (Purple) vs Defect quantity (Orange)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PCBA_BY_PRODUCT} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="product" stroke="#5b6480" fontSize={10} />
                <YAxis scale="sqrt" stroke="#5b6480" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="checkedQty" name="Checked Qty" fill="#7a5cf0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failQty" name="Fail Qty" fill="#e35b2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#5b6480] pt-2 border-t border-[#e2e7f2]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7a5cf0]" /> Checked Qty</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e35b2a]" /> Fail Qty</span>
          </div>
        </div>
      </div>

      {/* Grid 3: Reject by Month Table & Fail Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#0d1730] mb-1">Reject — by Month</h3>
          <p className="text-xs text-[#5b6480] mb-3">Overall PCBA test rejects across factory</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#182a52] text-white">
                  <th className="py-2 px-3 rounded-l-md font-semibold text-[11px]">Month</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Checked</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Fail</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Reject</th>
                  <th className="py-2 px-3 rounded-r-md font-semibold text-[11px]">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7f2]">
                <tr className="hover:bg-[#fbfcfe]">
                  <td className="py-2.5 px-3 font-medium text-[#0d1730]">July</td>
                  <td className="py-2.5 px-3 font-mono">201,294</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">4,852</td>
                  <td className="py-2.5 px-3 font-mono">0</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-[#e5f7ee] text-[#1c8a53]">
                      2.41%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#fbfcfe]">
                  <td className="py-2.5 px-3 font-medium text-[#0d1730]">June</td>
                  <td className="py-2.5 px-3 font-mono">1,057,761</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">23,674</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">3,306</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-[#e5f7ee] text-[#1c8a53]">
                      2.24%
                    </span>
                  </td>
                </tr>
                <tr className="bg-[#f6f8fd] font-bold">
                  <td className="py-2.5 px-3 text-[#0d1730]">Grand Total</td>
                  <td className="py-2.5 px-3 font-mono">1,259,055</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">28,526</td>
                  <td className="py-2.5 px-3 font-mono text-[#d64545]">3,306</td>
                  <td className="py-2.5 px-3 font-mono text-[#1c8a53]">2.27%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white border border-[#e2e7f2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Fail Qty Monthly Trend</h3>
            <p className="text-xs text-[#5b6480] mb-2">PCBA defect containment curve</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pcbaMonthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
            Computer Motherboard and Mobile boards achieved lowest defect rates (&lt;0.62%).
          </div>
        </div>
      </div>

      {/* --- MODAL 1: ATTENDANCE MODAL --- */}
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
                    <h3 className="font-bold text-lg">PCBA Workforce Attendance</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2563eb]/30 text-[#93c5fd] border border-[#2563eb]/50">
                      Live Shift Entry
                    </span>
                  </div>
                  <p className="text-xs text-[#9fb0d6]">SMT &amp; Manual Insertion Process Station Headcount &amp; Attendance</p>
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
                  <div className="text-2xl font-bold font-mono text-[#2563eb] mt-1">148</div>
                  <div className="text-[10px] text-[#5b6480] mt-0.5">SMT + MI Workforce</div>
                </div>
                <div className="p-3.5 bg-[#db2777]/10 border border-[#db2777]/30 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-[#db2777] uppercase tracking-wider">Present Today</div>
                  <div className="text-2xl font-bold font-mono text-[#db2777] mt-1">142 (95.9%)</div>
                  <div className="text-[10px] text-[#5b6480] mt-0.5">Checked In on Floor</div>
                </div>
                <div className="p-3.5 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">Leave / Off</div>
                  <div className="text-2xl font-bold font-mono text-[#16a34a] mt-1">6 Approved</div>
                  <div className="text-[10px] text-[#5b6480] mt-0.5">Scheduled Absence</div>
                </div>
              </div>

              {/* --- ENTRY MANPOWER ATTENDANCE SECTION (Matching User Spreadsheet) --- */}
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
                      {(['ALL', 'SMT', 'MI'] as const).map((dept) => (
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
                          {dept === 'ALL' ? 'All' : dept}
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
                          placeholder="e.g. Wave Solder, FCT, IQC"
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
                          onChange={(e) => setNewDepartment(e.target.value as 'SMT' | 'MI')}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        >
                          <option value="SMT">SMT (Surface Mount)</option>
                          <option value="MI">MI (Manual Insertion)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5b6480] mb-1">
                          Required Headcount
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={newRequired}
                          onChange={(e) => setNewRequired(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-mono text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5b6480] mb-1">
                          Available Headcount
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            required
                            value={newAvailable}
                            onChange={(e) => setNewAvailable(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-mono text-[#0d1730] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-[#2563eb] text-white font-bold rounded-lg hover:bg-[#1d4ed8] text-xs shrink-0 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Manpower Spreadsheet Table (Exact Header & Structure from Image) */}
                <div className="bg-white border border-[#e2e7f2] rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#182a52] text-white divide-x divide-[#22376b]">
                          <th className="py-2.5 px-4 font-bold text-xs tracking-wide">Process</th>
                          <th className="py-2.5 px-3 font-bold text-xs tracking-wide text-center">Department</th>
                          <th className="py-2.5 px-3 font-bold text-xs tracking-wide text-center">Required</th>
                          <th className="py-2.5 px-3 font-bold text-xs tracking-wide text-center">Available</th>
                          <th className="py-2.5 px-3 font-bold text-xs tracking-wide text-center">Status / Variance</th>
                          <th className="py-2.5 px-3 font-bold text-xs tracking-wide text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e7f2]">
                        {filteredManpower.map((row) => {
                          const diff = row.available - row.required;
                          return (
                            <tr
                              key={row.id}
                              className={`hover:bg-[#f8fafc] transition-colors ${
                                diff < 0 ? 'bg-[#fef2f2]/30' : ''
                              }`}
                            >
                              {/* Process Name */}
                              <td className="py-2.5 px-4 font-medium text-[#0d1730]">
                                <div className="flex items-center gap-1.5">
                                  {row.department === 'SMT' ? (
                                    <Cpu className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                                  ) : (
                                    <Layers className="w-3.5 h-3.5 text-[#e35b2a] shrink-0" />
                                  )}
                                  <span>{row.process}</span>
                                </div>
                              </td>

                              {/* Department */}
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider ${
                                    row.department === 'SMT'
                                      ? 'bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20'
                                      : 'bg-[#e35b2a]/10 text-[#e35b2a] border border-[#e35b2a]/20'
                                  }`}
                                >
                                  {row.department}
                                </span>
                              </td>

                              {/* Required Headcount */}
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center justify-center gap-1 bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(row.id, 'required', -1)}
                                    className="w-4 h-4 rounded text-[#5b6480] hover:text-[#0d1730] hover:bg-white font-bold flex items-center justify-center text-[10px] cursor-pointer"
                                    title="Decrease Required"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.required}
                                    onChange={(e) =>
                                      handleSetQty(row.id, 'required', parseInt(e.target.value) || 0)
                                    }
                                    className="w-8 text-center font-mono font-bold bg-transparent text-[#0d1730] focus:outline-none text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(row.id, 'required', 1)}
                                    className="w-4 h-4 rounded text-[#5b6480] hover:text-[#0d1730] hover:bg-white font-bold flex items-center justify-center text-[10px] cursor-pointer"
                                    title="Increase Required"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Available Headcount */}
                              <td className="py-2.5 px-3 text-center">
                                <div
                                  className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-md ${
                                    diff < 0
                                      ? 'bg-[#fee2e2] text-[#dc2626]'
                                      : diff > 0
                                      ? 'bg-[#dbeafe] text-[#2563eb]'
                                      : 'bg-[#e0f2fe] text-[#0369a1]'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(row.id, 'available', -1)}
                                    className="w-4 h-4 rounded hover:bg-white/80 font-bold flex items-center justify-center text-[10px] cursor-pointer"
                                    title="Decrease Available"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.available}
                                    onChange={(e) =>
                                      handleSetQty(row.id, 'available', parseInt(e.target.value) || 0)
                                    }
                                    className="w-8 text-center font-mono font-bold bg-transparent focus:outline-none text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(row.id, 'available', 1)}
                                    className="w-4 h-4 rounded hover:bg-white/80 font-bold flex items-center justify-center text-[10px] cursor-pointer"
                                    title="Increase Available"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Status / Variance */}
                              <td className="py-2.5 px-3 text-center">
                                {diff < 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] font-mono bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]">
                                    <AlertCircle className="w-3 h-3 text-[#dc2626]" />
                                    {diff} Shortage
                                  </span>
                                ) : diff === 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] font-mono bg-[#dcfce7] text-[#15803d] border border-[#86efac]">
                                    <CheckCircle className="w-3 h-3 text-[#16a34a]" />
                                    Balanced
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] font-mono bg-[#dbeafe] text-[#1d4ed8] border border-[#93c5fd]">
                                    +{diff} Surplus
                                  </span>
                                )}
                              </td>

                              {/* Delete Action */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntry(row.id)}
                                  className="p-1 rounded text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fee2e2]/50 transition-colors cursor-pointer"
                                  title="Delete process entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Grand Total Row */}
                        <tr className="bg-[#f1f5f9] font-bold border-t-2 border-[#cbd5e1]">
                          <td className="py-3 px-4 text-[#0d1730]">
                            Total ({filteredManpower.length} Stations)
                          </td>
                          <td className="py-3 px-3 text-center text-[#5b6480]">
                            {deptFilter}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-sm text-[#0d1730]">
                            {totalRequired}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-sm text-[#0d1730]">
                            {totalAvailable}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-mono font-bold text-[11px] ${
                                totalShortage < 0
                                  ? 'bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]'
                                  : totalShortage === 0
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : 'bg-[#dbeafe] text-[#1d4ed8]'
                              }`}
                            >
                              {totalShortage < 0
                                ? `${totalShortage} Net Deficit`
                                : totalShortage === 0
                                ? 'Full Capacity'
                                : `+${totalShortage} Surplus`}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Save Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#5b6480]">
                    Tip: Use <kbd className="px-1 py-0.5 bg-white border border-[#cbd5e1] rounded text-[10px] font-mono">+</kbd> / <kbd className="px-1 py-0.5 bg-white border border-[#cbd5e1] rounded text-[10px] font-mono">-</kbd> or type numbers directly to adjust daily floor attendance.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    className="px-4 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Manpower Entry
                  </button>
                </div>
              </div>

              {/* Line Station Allocation Overview */}
              <div>
                <h4 className="font-bold text-sm text-[#0d1730] mb-2.5">
                  Production Line Station Allocation
                </h4>
                <div className="divide-y divide-[#e2e7f2] border border-[#e2e7f2] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#f8fafc] flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#2563eb]" />
                      SMT High-Speed Lines (Lines 1 - 6)
                    </span>
                    <span className="font-mono text-[#2563eb]">84 / 86 Present</span>
                  </div>
                  <div className="px-4 py-3 bg-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#e35b2a]" />
                      Manual Insertion (MI 1 &amp; MI 2)
                    </span>
                    <span className="font-mono text-[#16a34a]">48 / 50 Present</span>
                  </div>
                  <div className="px-4 py-3 bg-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0d1730]" />
                      3D AOI &amp; X-Ray Inspection QC
                    </span>
                    <span className="font-mono text-[#0d1730]">10 / 12 Present</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#e2e7f2]">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate('team');
                  }}
                  className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View All Plant Leaders &amp; Attendance Logs
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save &amp; Update
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
        </div>
      )}

      {/* --- MODAL 2: REPORTS & QM DATA ENTRY PORTAL --- */}
      {activeModal === 'report' && (
        <PCBAQualityDataEntryPortal
          initialLine={portalInitialLine}
          initialNav={portalInitialNav}
          onNavigateHome={() => {
            setActiveModal(null);
            setPortalInitialNav(undefined);
            onNavigate('home');
          }}
          onClose={() => {
            setActiveModal(null);
            setPortalInitialNav(undefined);
          }}
        />
      )}

      {/* --- MODAL 3: SOP MODAL --- */}
      {activeModal === 'sop' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e7f2] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#0d1730] text-white flex items-center justify-between border-b-[3px] border-[#16a34a]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#16a34a] rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">PCBA Standard Operating Procedures (SOP)</h3>
                  <p className="text-xs text-[#9fb0d6]">Controlled Work Instructions for SMT, MI, and AOI Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9fb0d6] hover:text-white hover:bg-white/10 transition-colors"
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
                        SOP-PCBA-001
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">SMT High-Speed Solder Paste Stencil Setup</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Solder paste thickness inspection (SPI) standard tolerance</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCBA-002
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">10-Zone Reflow Oven Temperature Profiling</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">Lead-free SAC305 profile parameters &amp; ramp-up limits</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="p-3.5 border border-[#e2e7f2] rounded-xl hover:border-[#16a34a] transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 bg-[#e5f7ee] text-[#16a34a] rounded">
                        SOP-PCBA-003
                      </span>
                      <h4 className="font-bold text-sm text-[#0d1730]">3D AOI &amp; Soldering Workmanship Standard</h4>
                    </div>
                    <p className="text-[#5b6480] text-[11px] mt-0.5">IPC-A-610 Class 3 acceptance criteria for electronics</p>
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
                  View All 58 Factory Controlled SOPs
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

