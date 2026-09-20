import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Database,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
} from 'lucide-react';

export interface DailyQMReportMIRecord {
  id: string;
  month: string;
  date: string;
  line: string;
  prodType: string;
  product: string;
  model: string;
  checkQty: number;
  faultQty: number;
  faultPct: number;
  remarks: string;
  createdAt?: number;
}

export interface DailyQMReportMIProps {
  onNavigateToDatabase?: () => void;
}

// Reference data from real Daily_QM_Report-MI.xlsx
const FORM_DATA = {
  lines: ['MI Line-01', 'Line-Charger'],
  productionTypes: ['Mass Production', 'Trial Production'],
  products: [
    'AC',
    'Adapter',
    'Charger',
    'Fan',
    'Fan & Fridge',
    'Fridge',
    'LED',
    'Rice cooker',
    'TV',
    'Toy',
  ],
  productModels: {
    AC: [
      'FITE72WA-ER-22_ODU24k',
      'Walton AC 12K INV IDU PCBA Model: MIVR35WA-W',
      'Walton AC Display PCBA Model: MD50WA-E',
    ],
    Adapter: ['WFVADP12V2ASET200K_(CT-X017)', 'WFVADP12V2ASET200K_(CT-X018)'],
    Charger: ['PCBA-OC05008RC(500mA)'],
    Fan: ['16 Inch Local Fan Controller', '16 Inch Local Fan SMPS'],
    'Fan & Fridge': ['MI Constant Fan Dimmer'],
    Fridge: [
      'MI Constant Fan Dimmer',
      'MI-R-LED-RS-V04',
      'MI-R-LED-RSI-V04_Export',
      'MI-SC-Dis-PCBA-V001',
      'MI-SC-PWR-Board V3.1',
      'SMT-Electronic-Thermostat-V2',
      'WFVADP12V2ASET200K_(CT-X017)',
    ],
    LED: ['12W LED Driver', 'Elite Panel 30W CKD Driver', 'Elite Panel 40W CKD Driver'],
    'Rice cooker': [
      'Rice Cooker LED Square PCBA Model: RCLSQR',
      'Walton Rice Cooker LED PCBA Model: RCL01',
    ],
    TV: ['WD24RCS'],
    Toy: [
      'Akij Toy Controller V1.0',
      'Common Toy Controller V1.0(Talukder)',
      'Common Toy LED Driver_V1.0(Akij)',
      'Common Toy LED Driver_V1.0(Talukder)',
      'Redmin Toy Controller',
    ],
  } as Record<string, string[]>,
};

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

const STORAGE_KEY = 'daily_qm_report_mi_rows_v1';

export const DailyQMReportMI: React.FC<DailyQMReportMIProps> = ({ onNavigateToDatabase }) => {
  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [line, setLine] = useState(FORM_DATA.lines[0]);
  const [prodType, setProdType] = useState(FORM_DATA.productionTypes[0]);
  const [product, setProduct] = useState(FORM_DATA.products[2]); // default Charger
  const [model, setModel] = useState('');
  const [checkQty, setCheckQty] = useState('');
  const [faultQty, setFaultQty] = useState('');
  const [remarks, setRemarks] = useState('');

  // Submitting & Toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Derive month name from date
  const monthName = useMemo(() => {
    if (!date) return '—';
    const d = new Date(date + 'T00:00:00');
    if (isNaN(d.getTime())) return '—';
    return MONTHS[d.getMonth()];
  }, [date]);

  // Update available models when product changes
  useEffect(() => {
    const models = FORM_DATA.productModels[product] || [];
    if (models.length > 0) {
      setModel(models[0]);
    } else {
      setModel('');
    }
  }, [product]);

  // Persistent rows state from local storage
  const [rows, setRows] = useState<DailyQMReportMIRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    // Seed with realistic rows from sheet
    return [
      {
        id: 'mi-seed-1',
        month: 'June',
        date: '2026-06-25',
        product: 'TV',
        model: 'WD24RCS',
        line: 'MI Line-01',
        prodType: 'Mass Production',
        checkQty: 100,
        faultQty: 6,
        faultPct: (6 / 100) * 100,
        remarks: '',
      },
      {
        id: 'mi-seed-2',
        month: 'July',
        date: '2026-07-16',
        product: 'Toy',
        model: 'Common Toy Controller V1.0(Talukder)',
        line: 'Line-Charger',
        prodType: 'Mass Production',
        checkQty: 1200,
        faultQty: 1087,
        faultPct: (1087 / 1200) * 100,
        remarks: '',
      },
      {
        id: 'mi-seed-3',
        month: 'July',
        date: '2026-07-22',
        product: 'Charger',
        model: 'PCBA-OC05008RC(500mA)',
        line: 'Line-Charger',
        prodType: 'Mass Production',
        checkQty: 7800,
        faultQty: 347,
        faultPct: (347 / 7800) * 100,
        remarks: '',
      },
      {
        id: 'mi-seed-4',
        month: 'July',
        date: '2026-07-28',
        product: 'Toy',
        model: 'Akij Toy Controller V1.0',
        line: 'Line-Charger',
        prodType: 'Mass Production',
        checkQty: 913,
        faultQty: 144,
        faultPct: (144 / 913) * 100,
        remarks: '',
      },
      {
        id: 'mi-seed-5',
        month: 'July',
        date: '2026-07-28',
        product: 'Toy',
        model: 'Common Toy LED Driver_V1.0(Akij)',
        line: 'Line-Charger',
        prodType: 'Mass Production',
        checkQty: 1163,
        faultQty: 38,
        faultPct: (38 / 1163) * 100,
        remarks: '',
      },
    ];
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      // storage full
    }
  }, [rows]);

  // Filter state
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterLine, setFilterLine] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedLine, setAppliedLine] = useState('');
  const [appliedProduct, setAppliedProduct] = useState('');

  const handleApplyFilter = () => {
    setAppliedFrom(filterFrom);
    setAppliedTo(filterTo);
    setAppliedLine(filterLine);
    setAppliedProduct(filterProduct);
  };

  const handleClearFilter = () => {
    setFilterFrom('');
    setFilterTo('');
    setFilterLine('');
    setFilterProduct('');
    setAppliedFrom('');
    setAppliedTo('');
    setAppliedLine('');
    setAppliedProduct('');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (appliedFrom && r.date < appliedFrom) return false;
      if (appliedTo && r.date > appliedTo) return false;
      if (appliedLine && r.line !== appliedLine) return false;
      if (appliedProduct && r.product !== appliedProduct) return false;
      return true;
    });
  }, [rows, appliedFrom, appliedTo, appliedLine, appliedProduct]);

  // Overall Statistics from filtered rows
  const stats = useMemo(() => {
    const totalCheck = filteredRows.reduce((acc, r) => acc + (r.checkQty || 0), 0);
    const totalFault = filteredRows.reduce((acc, r) => acc + (r.faultQty || 0), 0);
    const overallRate = totalCheck > 0 ? (totalFault / totalCheck) * 100 : 0;
    return { totalCheck, totalFault, overallRate };
  }, [filteredRows]);

  // Validation
  const cQty = parseInt(checkQty, 10);
  const fQty = parseInt(faultQty, 10);
  const isFormValid =
    Boolean(date) &&
    Boolean(line) &&
    Boolean(prodType) &&
    Boolean(product) &&
    Boolean(model) &&
    !isNaN(cQty) &&
    cQty >= 0 &&
    !isNaN(fQty) &&
    fQty >= 0 &&
    fQty <= cQty;

  const handleSave = () => {
    if (isSubmitting) return;

    if (!date) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (!line) {
      showToast('Please select a line.', 'error');
      return;
    }
    if (!prodType) {
      showToast('Please select a production type.', 'error');
      return;
    }
    if (!product) {
      showToast('Please select a product.', 'error');
      return;
    }
    if (!model) {
      showToast('Please select a model.', 'error');
      return;
    }
    if (isNaN(cQty) || cQty < 0) {
      showToast('Enter a valid Check Qty (whole number, 0 or more).', 'error');
      return;
    }
    if (isNaN(fQty) || fQty < 0) {
      showToast('Enter a valid Fault Qty (whole number, 0 or more).', 'error');
      return;
    }
    if (fQty > cQty) {
      showToast("Fault Qty can't be greater than Check Qty.", 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const pct = cQty > 0 ? (fQty / cQty) * 100 : 0;
      const newRec: DailyQMReportMIRecord = {
        id: `mi-${Date.now()}`,
        month: monthName,
        date,
        line,
        prodType,
        product,
        model,
        checkQty: cQty,
        faultQty: fQty,
        faultPct: pct,
        remarks: remarks.trim(),
        createdAt: Date.now(),
      };

      setRows((prev) => [newRec, ...prev]);

      // Reset quantities & remarks
      setCheckQty('');
      setFaultQty('');
      setRemarks('');
      setIsSubmitting(false);

      showToast(`Saved 1 MI QM row for ${product} (${model}).`, 'success');
    }, 400);
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    showToast('Row deleted.', 'success');
  };

  // CSV Export
  const handleDownloadCsv = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to download for this filter.', 'error');
      return;
    }
    const headers = [
      'Month',
      'Date',
      'Product',
      'Model',
      'Line',
      'Production Type',
      'Check Qty',
      'Fault Qty',
      'Fault %',
      'Remarks',
    ];
    const csvRows = [headers.join(',')];

    filteredRows.forEach((r) => {
      const pctStr = r.faultPct !== undefined ? r.faultPct.toFixed(2) + '%' : '0.00%';
      const vals = [
        r.month,
        r.date,
        r.product,
        r.model,
        r.line,
        r.prodType,
        r.checkQty,
        r.faultQty,
        pctStr,
        r.remarks,
      ].map((v) => {
        const str = String(v ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(vals.join(','));
    });

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-qm-report-mi_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully.', 'success');
  };

  // PDF / Print
  const handleDownloadPdf = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to download for this filter.', 'error');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-5 print:p-0">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-5 right-6 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all ${
            toast.type === 'success' ? 'bg-[#16a34a] text-white' : 'bg-[#dc2626] text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-xl p-4 sm:p-5 shadow-sm border border-[#224b73] print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight">Daily QM Report-MI</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#bbf7d0] border border-[#16a34a]/40">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#b9c9dc] mt-0.5">
                Check Qty vs Fault Qty — MI Line-01 &amp; Line-Charger Defect Rate Tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateToDatabase && (
              <button
                type="button"
                onClick={onNavigateToDatabase}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Auto Database</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#64748b]">
              Total Inspected
            </p>
            <p className="text-xl font-mono font-extrabold text-[#0f2942] mt-0.5">
              {stats.totalCheck.toLocaleString()} pcs
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#64748b]">
              Total Fault Qty
            </p>
            <p className="text-xl font-mono font-extrabold text-[#dc2626] mt-0.5">
              {stats.totalFault.toLocaleString()} pcs
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            ⚠
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#64748b]">
              Overall Defect Rate
            </p>
            <p className="text-xl font-mono font-extrabold text-[#0f2942] mt-0.5">
              {stats.overallRate.toFixed(2)}%
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
              stats.overallRate >= 5
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            %
          </div>
        </div>
      </div>

      {/* CARD 1: New QM Entry */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-[#1e293b] text-sm">
          <span className="text-[#2563eb]">📋</span>
          <span>New QM Entry</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1: Date, Month readout, Line, Production Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Month
              </label>
              <div className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#64748b] bg-[#f8fafc] font-semibold flex items-center justify-between">
                <span>{monthName}</span>
                <span className="text-[10px] text-[#94a3b8] uppercase font-mono">auto</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Line
              </label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white"
              >
                {FORM_DATA.lines.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Production Type
              </label>
              <select
                value={prodType}
                onChange={(e) => setProdType(e.target.value)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white"
              >
                {FORM_DATA.productionTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Product, Model, Check Qty, Fault Qty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Product
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white"
              >
                {FORM_DATA.products.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white"
              >
                {(FORM_DATA.productModels[product] || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Check Qty
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={checkQty}
                onChange={(e) => setCheckQty(e.target.value)}
                placeholder="0"
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-semibold focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Fault Qty
                </label>
                {cQty > 0 && !isNaN(fQty) && fQty >= 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      (fQty / cQty) * 100 >= 5
                        ? 'text-red-700 bg-red-100'
                        : 'text-emerald-700 bg-emerald-100'
                    }`}
                  >
                    {((fQty / cQty) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={faultQty}
                onChange={(e) => setFaultQty(e.target.value)}
                placeholder="0"
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-semibold focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 3: Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Remarks (optional)
            </label>
            <textarea
              rows={1}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any additional notes for this entry…"
              className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none resize-y"
            />
          </div>
        </div>
      </section>

      {/* CARD 2: Details Report */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:m-0 print:border-none">
        <div className="p-4 sm:p-5 bg-[#0f2942] text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📄</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                Details Report — Daily QM Report-MI
              </h2>
              <span className="text-xs text-[#9fb0d6]">
                {filteredRows.length} row{filteredRows.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
              <span className="text-[#cbd5e1] font-semibold">From</span>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none w-[130px]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
              <span className="text-[#cbd5e1] font-semibold">To</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none w-[130px]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
              <span className="text-[#cbd5e1] font-semibold">Line</span>
              <select
                value={filterLine}
                onChange={(e) => setFilterLine(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none"
              >
                <option value="">All</option>
                {FORM_DATA.lines.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
              <span className="text-[#cbd5e1] font-semibold">Product</span>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none"
              >
                <option value="">All</option>
                {FORM_DATA.products.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleApplyFilter}
              className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>⬇ CSV</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>⬇ PDF</span>
            </button>
          </div>
        </div>

        {/* Print Metadata */}
        <div className="hidden print:block p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold">Daily QM Report-MI — Details Report</h1>
          <p className="text-xs text-gray-600">
            Date range: {appliedFrom || '(all)'} to {appliedTo || '(all)'} • Line:{' '}
            {appliedLine || '(all)'} • Product: {appliedProduct || '(all)'} • {filteredRows.length}{' '}
            row(s) • Generated {new Date().toLocaleString()}
          </p>
        </div>

        {/* Scrollable Table Preview */}
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f1f5f9] text-[#475569] font-bold sticky top-0 z-10 border-b border-[#e2e8f0]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Month</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Product</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Line</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Check Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Fault Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Fault %</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Remarks</th>
                <th className="py-2.5 px-3 whitespace-nowrap print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#1e293b]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-sm text-[#94a3b8]">
                    No rows yet — fill in the form above and click Save to see rows appear here.
                  </td>
                </tr>
              ) : (
                filteredRows.map((rec) => {
                  const isHighFault = rec.faultPct >= 5;
                  return (
                    <tr key={rec.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-[#64748b]">
                        {rec.month}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium">{rec.date}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-bold text-[#0f2942]">
                        {rec.product}
                      </td>
                      <td
                        className="py-2 px-3 whitespace-nowrap text-[#334155] max-w-[200px] truncate"
                        title={rec.model}
                      >
                        {rec.model}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-semibold text-[#d97706]">
                        {rec.line}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#eef2f6] text-[#475569]">
                          {rec.prodType}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-[#0f2942]">
                        {rec.checkQty.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold">
                        <span className={isHighFault ? 'text-[#dc2626]' : 'text-[#1e293b]'}>
                          {rec.faultQty.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            isHighFault
                              ? 'bg-red-50 text-[#dc2626] font-extrabold'
                              : 'text-[#64748b]'
                          }`}
                        >
                          {rec.faultPct !== undefined ? rec.faultPct.toFixed(1) + '%' : '0.0%'}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-[#64748b]">
                        {rec.remarks || '-'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap print:hidden">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rec.id)}
                          className="px-2 py-1 border border-[#e2e8f0] bg-white hover:bg-red-50 hover:text-red-600 rounded text-[11.5px] text-[#64748b] transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Save Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] py-3.5 px-5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 z-20 print:hidden">
        <div className="text-sm font-medium text-[#64748b]">
          {isFormValid ? (
            <span>
              Ready to save <strong className="text-[#0f2942]">1 row</strong> for{' '}
              <strong className="text-[#2563eb]">{product}</strong> ({model}) on{' '}
              <strong className="text-[#0f2942]">{line}</strong>
            </span>
          ) : (
            <span>Fill in date, line, type, product, model, check qty and fault qty</span>
          )}
        </div>

        <button
          type="button"
          id="btn-save-mi-qm-entry"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#cbd5e1] text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>SAVING…</span>
            </>
          ) : (
            <>
              <span>SAVE QM ENTRY</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Hidden print area for window.print() */}
      <div id="printArea" className="hidden print:block">
        <h2 className="text-xl font-bold mb-1">Daily QM Report-MI — Details Report</h2>
        <div className="text-xs text-gray-600 mb-4">
          Date range: {appliedFrom || '(all)'} to {appliedTo || '(all)'} • {filteredRows.length}{' '}
          row(s) • Generated {new Date().toLocaleString()}
        </div>
        <table className="w-full text-xs border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 p-1 text-left">Month</th>
              <th className="border border-gray-400 p-1 text-left">Date</th>
              <th className="border border-gray-400 p-1 text-left">Product</th>
              <th className="border border-gray-400 p-1 text-left">Model</th>
              <th className="border border-gray-400 p-1 text-left">Line</th>
              <th className="border border-gray-400 p-1 text-left">Type</th>
              <th className="border border-gray-400 p-1 text-right">Check Qty</th>
              <th className="border border-gray-400 p-1 text-right">Fault Qty</th>
              <th className="border border-gray-400 p-1 text-right">Fault %</th>
              <th className="border border-gray-400 p-1 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td className="border border-gray-400 p-1">{r.month}</td>
                <td className="border border-gray-400 p-1">{r.date}</td>
                <td className="border border-gray-400 p-1">{r.product}</td>
                <td className="border border-gray-400 p-1">{r.model}</td>
                <td className="border border-gray-400 p-1">{r.line}</td>
                <td className="border border-gray-400 p-1">{r.prodType}</td>
                <td className="border border-gray-400 p-1 text-right">
                  {r.checkQty.toLocaleString()}
                </td>
                <td className="border border-gray-400 p-1 text-right font-semibold">
                  {r.faultQty.toLocaleString()}
                </td>
                <td className="border border-gray-400 p-1 text-right font-bold">
                  {r.faultPct !== undefined ? r.faultPct.toFixed(1) + '%' : '0.0%'}
                </td>
                <td className="border border-gray-400 p-1">{r.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
