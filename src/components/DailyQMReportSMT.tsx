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

export interface DailyQMReportSMTRecord {
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

export interface DailyQMReportSMTProps {
  onNavigateToDatabase?: () => void;
}

// Reference data from real Daily_QM_Report-SMT.xlsx
const FORM_DATA = {
  lines: ['Line-01', 'Line-02', 'Line-03', 'Line-04', 'Line-05'],
  productionTypes: ['Mass Production', 'Rework', 'Trial Production'],
  products: ['AC', 'Charger', 'Fan', 'Fridge', 'LED', 'Local Fan', 'Remote', 'TV', 'Toy'],
  productModels: {
    AC: ['IDU-Common-12K/18K/24K', 'Walton AC 18K INV IDU'],
    Charger: ['PCBA-OC05008RC(500mA)', 'WMC20000GI-BK(Charger 2A)'],
    Fan: [
      '16 Inch Local Fan Control',
      '16 Inch Rechargeable Stand (Display Fan) -USB',
      '16 Inch Rechargeable Stand (Display Fan) Display Board',
      '16 Inch Rechargeable Stand Fan Display (SMPS)',
      '16 Inch Rechargeable Stand Fan Display Control (Bottom)',
      '16 Inch Rechargeable Stand Fan Display Control (TOP)',
      '16 Inch Rechargeable Stand Fan Display Control (Top)',
      '16 inch Local Fan Smps',
      '3 Inch Low Cost Rechargeable Fan - Top',
      '3 Inch Low Cost Rechargeable Fan - bottom',
      '52 Inch BLDC Celling Fan',
      '56 Inch Celling Fan Life PO4',
      '56 inch BLDC Celling Fan',
      '6 Inch Rechargeable Fan - Bottom',
      '6 Inch Rechargeable Fan - Top',
      '6 Inch Rechargeable Fan Bottom',
      '6 Inch Rechargeable Fan Top',
      '6 inch Rechargeable Fan - Bottom',
      '6 inch Rechargeable Fan - Top',
    ],
    Fridge: [
      'Beverage Cololer LED PCB-L290-V03',
      'Beverage Cololer LED PCB-L337-V01',
      'Beverage Cololer LED PCB-L337-V05',
      'Beverage cooler LED PCB- L337-V01',
      'CFL-SR110-V07',
      'Electronic Control V217',
      'Electronics Control-V217',
      'FID-Power Board-V1.0',
      'Frost Controller Seven Segment Display V2.0',
      'Frost Inside Display-V1.0',
      'RL-RS35-V05',
      'RL-SS80-V05',
      'SMT-255L-Freezer Display',
      'SMT-255L-Freezer-Display',
      'SMT-CFL-SR110-V04',
      'SMT-Electronic Control - V217',
      'SMT-Electronics Thermostat -V2',
      'SMT-R-LED-PCCL-386-V0',
      'SMT-R-LED-RS-V04',
      'SMT-RFDHL-619L - V02',
      'SMT-RFPL-619L - V02',
      'SMT-RFPL-619L-V02',
      'SMT-RL-RS35-V05-Bottom',
      'SMT-RL-RS35-V05-Top',
      'SMT-RL-SS80-V05-Bottom',
      'SMT-RL-SS80-V05-Top',
      'SMT-RPDHL-619L-V02',
      'SMT-RPIL-619L-V02',
      'SMT-RPPL-619L-V02',
      'SMT-RPPL-619l - V02',
      'SMT-SBS-RFPL-619L-V02',
      'SMT-SBS-RIL12V DC',
      'SMT-SBS-RPPL-619L-V02',
      'SMT-SBS-SL-12V-DC',
      'SMT-SC-DIS-PCBA-V1.4',
      'SMT-SC-DIS-PCBA-V2.0',
      'SMT-SC-PWR-PCBA-V3.1',
      'SMT-Splendor Light - V1.0',
      'SMT-TFT-LCD-Controller Display',
      'SMT-WFR-IBL-V00',
      'SMT-WFR_IPP (IPS)_12V_V01',
      'SMT-WR-343-CTW-V02',
      'SMT-WRL-US-V03',
      'SMT-WRL-USI-V02',
      'Smart Controller 1.4',
      'WR-343-CTW-LED-V02',
      'WRF IBL V00',
    ],
    LED: [
      '0.5 FEET DOUBLE PAD 10W',
      '06 Watt Round LED Tospo-Day',
      '06 Watt Round LED Tospoo-Warm',
      '1 FEET DTDL 9W',
      '10 FEET DOUBLE',
      '10W DC Bulb LED',
      '10W Tospo Motion LED',
      '12W DC Bulb LED',
      '12W LED_Panel',
      '12W Round_Day',
      '12W Round_Green',
      '12W Round_Red',
      '12W Round_Warm',
      '12W-AC/DC-YJ-LED',
      '12W-Square-LED-Day',
      '12W-Square-LED-Warm',
      '12Watt Square LED Tospoo -Warm',
      '18W Round_Day',
      '18W Round_Warm',
      '18Watt Square LED-DOB',
      '1FEET DTDL 9W',
      '20W Tube light Driver',
      '3 Inch Low Cost Rechargeable Fan - bottom',
      '6 Watt Square LED Tospoo - Day',
      '6W Colour Change (GreenBlue)',
      '6W Colour Change (RedGreen)',
      '6W Round LED(Blue)',
      '6W Round LED(Day)',
      '6W Round LED(Green)',
      '6W Round LED(Red)',
      '6W-Round-Topso-Day',
      '6W-Round-Topso-Warm',
      '6Watt Square LED Tospoo -Warm',
      'AC-DC-12W LED',
      'AC-DC-18W LED',
      'Capsol LED 12W_Day',
      'DC-Bulb-5W',
      'DPLP0279-V1(18W Round)',
      'DTDL 0.5 FEET',
      'EBT-100-18W LED',
      'FE-IN-DR-14S1P(Spotdown 5W LED Blue)',
      'FE-IN-DR-14S1P(Spotdown 5W LED Green)',
      'FE-IN-DR-14S1P(Spotdown 5W LED Red)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Day)',
      'FE-IN-DR-14SIP(Spotdown 5W LED Warm)',
      'K-NZ-12W-K03(LED Driver 12W ZY)',
      'LED Driver 12W',
      'LED PCBA PSA A60 7W',
      'PCBA Origin A55  3W LED',
      'PCBA Origin A55 5W LED',
      'PCBA Origin A55 7W LED',
      'PCBA Origin A65 12W LED',
      'PCBA Origin A70 15W LED',
      'PCBA Origin A80  18W LED',
      'PCBA-Surface-18w Square Day DOB Bright',
      'PCBA-Surface-18w-Square-Day-DOB Bright',
      'PCBA-Surface-24w Square Day DOB Bright',
      'RSL-291*6mm 2835G3V 1B18*2- 6W',
      'RSL291*6MM 2835G3V 1B18X2-6W',
      'Robust-Spotdown-7W',
      'SMT-Splendor Light - V1.0',
      'Solar DC Bulb 5W 12-36V PCBA',
      'Spot Down 5W LED(Blue)',
      'Spot Down 5W LED(Day)',
      'Spot Down 5W LED(Green)',
      'Spot Down 5W LED(Red)',
      'Spot Down 5W LED(Warm)',
      'Spot Down 7W LED(Blue)',
      'Spot Down 7W LED(Day)',
      'Spot Down 7W LED(Green)',
      'Spot Down 7W LED(Red)',
      'Spot Down 7W LED(Warm)',
      'Spotdown 5W -Red',
      'WLCL-EBF12-A-V1.1',
      'YBL 15 W-DAY',
      'YBL 15 Watt-DAY',
      'YBL-12W LED_Day',
      'YBL-12W-LED',
      'YBL-18W LED',
      'YBL-18W LED_Day',
      'YBL-30W LED',
      'YBL-5W LED',
      'YBL-5W LED-Day',
      'YBL-7W LED-Day',
      'YBL-7W-LED',
      'YBL-9W LED',
      'YBL15 W-DAY',
      'YJ12W-3BBC-24DIC-70H9-V02(AC-DC-YJ12W)',
      'ZS23-T1109-D54.65DC9-26V-V04',
      'ZS23-T1109-D54.65DC9-36V-5W-V04(5W DC Light)',
      'ZS24-CKD-15W-10C2B-51.4MM-V2.1',
      'ZS24-CKD-3,7,5,W-9P45.8-V1.0(YBL 5W Day)',
      'ZS24-CKD-9W-15P-45.8-V1.0',
      'ZS24-CKD-9W-15P-45.8-V10',
      'ZS24-T1212-D5815-18W-HV-V3(YBL 18W)',
      'ZS25-T0729-D514-DC9-36V-10W-V03(10W DC Light)',
    ],
    'Local Fan': ['16 inch Local Control Fan'],
    Remote: ['Remote Uniwalmar 09'],
    TV: ['WD-24R CS TV'],
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

const STORAGE_KEY = 'daily_qm_report_smt_rows_v1';

export const DailyQMReportSMT: React.FC<DailyQMReportSMTProps> = ({ onNavigateToDatabase }) => {
  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [line, setLine] = useState(FORM_DATA.lines[0]);
  const [prodType, setProdType] = useState(FORM_DATA.productionTypes[0]);
  const [product, setProduct] = useState(FORM_DATA.products[3]); // default Fridge
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

  // Persistent rows state
  const [rows, setRows] = useState<DailyQMReportSMTRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    // Seed with realistic rows from sheet
    return [
      {
        id: 'qm-seed-1',
        month: 'May',
        date: '2026-05-17',
        product: 'Fridge',
        model: 'RL-SS80-V05',
        line: 'Line-04',
        prodType: 'Mass Production',
        checkQty: 11000,
        faultQty: 10,
        faultPct: (10 / 11000) * 100,
        remarks: '',
      },
      {
        id: 'qm-seed-2',
        month: 'May',
        date: '2026-05-18',
        product: 'LED',
        model: '12W Round_Day',
        line: 'Line-04',
        prodType: 'Mass Production',
        checkQty: 1330,
        faultQty: 220,
        faultPct: (220 / 1330) * 100,
        remarks: '',
      },
      {
        id: 'qm-seed-3',
        month: 'May',
        date: '2026-05-19',
        product: 'LED',
        model: 'FE-IN-DR-14S1P(Spotdown 5W LED Green)',
        line: 'Line-04',
        prodType: 'Mass Production',
        checkQty: 11640,
        faultQty: 101,
        faultPct: (101 / 11640) * 100,
        remarks: '',
      },
      {
        id: 'qm-seed-4',
        month: 'May',
        date: '2026-05-18',
        product: 'Fan',
        model: '52 Inch BLDC Celling Fan',
        line: 'Line-01',
        prodType: 'Mass Production',
        checkQty: 654,
        faultQty: 46,
        faultPct: (46 / 654) * 100,
        remarks: '',
      },
      {
        id: 'qm-seed-5',
        month: 'May',
        date: '2026-05-19',
        product: 'Fridge',
        model: 'SMT-WRL-US-V03',
        line: 'Line-01',
        prodType: 'Mass Production',
        checkQty: 6288,
        faultQty: 14,
        faultPct: (14 / 6288) * 100,
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
      const newRec: DailyQMReportSMTRecord = {
        id: `qm-${Date.now()}`,
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

      showToast(`Saved 1 QM row for ${product} (${model}).`, 'success');
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
    a.download = `daily-qm-report-smt_${new Date().toISOString().slice(0, 10)}.csv`;
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-xl shadow-inner">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight">Daily QM Report-SMT</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#bbf7d0] border border-[#16a34a]/40">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#b9c9dc] mt-0.5">
                Check Qty vs Fault Qty — SMT Line-01 to Line-05 Monitoring & Defect Analysis
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
                Details Report — Daily QM Report-SMT
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
          <h1 className="text-xl font-bold">Daily QM Report-SMT — Details Report</h1>
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
                      <td className="py-2 px-3 whitespace-nowrap text-[#334155] max-w-[200px] truncate" title={rec.model}>
                        {rec.model}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-semibold text-[#2563eb]">
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
          id="btn-save-qm-entry"
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
        <h2 className="text-xl font-bold mb-1">Daily QM Report-SMT — Details Report</h2>
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
