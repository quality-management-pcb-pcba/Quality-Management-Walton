import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Settings,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Box,
  Cpu,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  X,
  Layers,
  ChevronDown,
  ArrowRight,
  Database,
} from 'lucide-react';

export interface AOIDefectRecord {
  id: string;
  line: string;
  date: string;
  shift: string;
  product: string;
  model: string;
  fault: string;
  qty: number;
  operator: string;
  remarks: string;
  createdAt: number;
}

export interface AOILineDefectEntryProps {
  lineName?: string;
  onNavigateToDatabase?: () => void;
}

// Initial master data from real AOI_LINE-01 history
const DEFAULT_FORM_DATA = {
  shifts: ['Day', 'Night', 'Morning', 'Evening', 'General'],
  products: ['AC', 'Fan', 'Fridge', 'LED', 'Local Fan', 'Remote', 'TV'],
  operators: [
    'Anik Sutradhar(50280)',
    'Sazzad (39911)',
    'Shajahan(47276)',
    'Shuvo Kumar Das (50282)',
  ],
  faults: [
    'Broken',
    'Component Shorts',
    'Dry Solder',
    'Hole Blocked',
    'Lift Up',
    'Missing',
    'PCB Joining together',
    'Polarity Change',
    'Scratch',
    'Shifting',
    'Solder Bridge',
    'Swell Up',
    'Upside Down',
  ],
  productModels: {
    AC: ['IDU-Common-12K/18K/24K'],
    Fan: [
      '16 Inch Rechargeable Stand (Display Fan) -USB',
      '16 Inch Rechargeable Stand (Display Fan) Display Board',
      '16 Inch Rechargeable Stand Fan Display (SMPS)',
      '16 Inch Rechargeable Stand Fan Display -USB',
      '16 Inch Rechargeable Stand Fan Display Control (Bottom)',
      '16 Inch Rechargeable Stand Fan Display Control (TOP)',
      '16 inch Local Control Fan',
      '16 inch Local Fan Smps',
      '3 Inch Low Cost Rechargeable Fan - Top',
      '3 Inch Low Cost Rechargeable Fan - bottom',
      '52 Inch BLDC Celling Fan',
      '52 inch BLDC Celling Fan',
      '56 inch BLDC Celling Fan',
      '6 Inch Rechargeable Fan Bottom',
      '6 Inch Rechargeable Fan Top',
      '6 inch Rechargeable Fan - Bottom',
      '6 inch Rechargeable Fan-Top',
    ],
    Fridge: [
      '06 Watt Round LED Tospoo',
      '16 Inch Rechargeable Stand Fan Display Control (Top)',
      'Electronic Control V217',
      'Electronics Control-V217',
      'Frost Controller Seven Segment Display V2.0',
      'SMT 255L Freezer Display',
      'SMT-255L-Freezer Display',
      'SMT-255L-Freezer-Display',
      'SMT-Electronic Control - V217',
      'SMT-Electronics Thermostat -V2',
      'SMT-R-LED-PCCL-386-V0',
      'SMT-R-LED-RS-V04',
      'SMT-RFDHL-619L - V02',
      'SMT-RFPL-619L - V02',
      'SMT-RL-RS35-V05-Bottom',
      'SMT-RL-RS35-V05-Top',
      'SMT-RL-SS80-V05-Bottom',
      'SMT-RL-SS80-V05-Top',
      'SMT-RPDHL-619L-V02',
      'SMT-SBS-RFPL-619L-V02',
      'SMT-SBS-RPPL-619L-V02',
      'SMT-SBS-SL-12V-DC',
      'SMT-SC-DIS-PCBA-V1.4',
      'SMT-SC-PWR-PCBA-V3.1',
      'SMT-Splendor Light - V1.0',
      'SMT-TFT-LCD-Controller Display',
      'SMT-WR-343-CTW-V02',
      'SMT-WRL-US-V03',
    ],
    LED: [
      '06 Watt Round LED Tospo-Day',
      '06 Watt Round LED Tospoo-Warm',
      '12W-Square-LED-Day',
      '12W-Square-LED-Warm',
      '12Watt Square LED Tospoo -Warm',
      '18Watt Square LED-DOB',
      '6 Watt Square LED Tospoo - Day',
      '6 Watt Square LED Tospoo - Warm',
      '6W-Round-Topso-Day',
      '6W-Round-Topso-Warm',
      'PCBA-Surface-18w Square Day DOB Bright',
      'PCBA-Surface-24w Square Day DOB Bright',
      'SMT-R-LED-RS-V04',
      'YBL15 W-LED-DAY',
    ],
    'Local Fan': ['16 inch Local Control Fan'],
    Remote: ['Remote Uniwalmar 09'],
    TV: ['WD-24R CS TV'],
  } as Record<string, string[]>,
};

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Initial seed defect entries for SMT Line-01
function getSeedDefectRecords(line: string): AOIDefectRecord[] {
  const today = getTodayString();
  return [
    {
      id: 'aoi-seed-1',
      line,
      date: today,
      shift: 'Day',
      product: 'Fridge',
      model: 'SMT-255L-Freezer Display',
      fault: 'Solder Bridge',
      qty: 3,
      operator: 'Anik Sutradhar(50280)',
      remarks: 'Pin 12-13 bridged at U4 IC',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'aoi-seed-2',
      line,
      date: today,
      shift: 'Day',
      product: 'AC',
      model: 'IDU-Common-12K/18K/24K',
      fault: 'Missing',
      qty: 2,
      operator: 'Sazzad (39911)',
      remarks: 'R14 and C22 missing on top layer',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'aoi-seed-3',
      line,
      date: getTodayString(),
      shift: 'Morning',
      product: 'LED',
      model: '12W-Square-LED-Day',
      fault: 'Dry Solder',
      qty: 4,
      operator: 'Shajahan(47276)',
      remarks: 'Wave solder pre-heat profile adjusted',
      createdAt: Date.now() - 3600000 * 6,
    },
    {
      id: 'aoi-seed-4',
      line,
      date: '2026-09-15',
      shift: 'Night',
      product: 'Fan',
      model: '16 Inch Rechargeable Stand (Display Fan) -USB',
      fault: 'Shifting',
      qty: 2,
      operator: 'Shuvo Kumar Das (50282)',
      remarks: 'Feeder nozzle #3 cleaned and aligned',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'aoi-seed-5',
      line,
      date: '2026-09-15',
      shift: 'Day',
      product: 'Fridge',
      model: 'Electronic Control V217',
      fault: 'Lift Up',
      qty: 1,
      operator: 'Anik Sutradhar(50280)',
      remarks: 'Q1 Transistor lead lifted',
      createdAt: Date.now() - 86400000 * 1.5,
    },
    {
      id: 'aoi-seed-6',
      line,
      date: '2026-09-14',
      shift: 'General',
      product: 'TV',
      model: 'WD-24R CS TV',
      fault: 'Component Shorts',
      qty: 2,
      operator: 'Sazzad (39911)',
      remarks: 'Power capacitor C108 touched heatsink',
      createdAt: Date.now() - 86400000 * 2.2,
    },
  ];
}

export const AOILineDefectEntry: React.FC<AOILineDefectEntryProps> = ({
  lineName = 'SMT Line-01',
  onNavigateToDatabase,
}) => {
  // Master lists persisted in localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('aoi_defect_master_lists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_FORM_DATA;
      }
    }
    return DEFAULT_FORM_DATA;
  });

  useEffect(() => {
    localStorage.setItem('aoi_defect_master_lists', JSON.stringify(formData));
  }, [formData]);

  // Defect records persisted in localStorage
  const [records, setRecords] = useState<AOIDefectRecord[]>(() => {
    const saved = localStorage.getItem(`aoi_defect_records_${lineName}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return getSeedDefectRecords(lineName);
      }
    }
    return getSeedDefectRecords(lineName);
  });

  useEffect(() => {
    localStorage.setItem(`aoi_defect_records_${lineName}`, JSON.stringify(records));
  }, [records, lineName]);

  // Form Fields
  const [date, setDate] = useState<string>(getTodayString());
  const [shift, setShift] = useState<string>('Day');
  const [product, setProduct] = useState<string>('Fridge');
  const [model, setModel] = useState<string>('SMT-255L-Freezer Display');
  const [operator, setOperator] = useState<string>(() => {
    return formData.operators[0] || 'Anik Sutradhar(50280)';
  });
  const [remarks, setRemarks] = useState<string>('');

  // Fault quantities mapping
  const [faultQuantities, setFaultQuantities] = useState<Record<string, number>>({});
  
  // Custom faults added in this session
  const [customFaults, setCustomFaults] = useState<string[]>([]);
  const [newFaultName, setNewFaultName] = useState<string>('');
  const [newFaultQty, setNewFaultQty] = useState<string>('');

  // Submission & Toast state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter state for report table
  const [reportFrom, setReportFrom] = useState<string>('');
  const [reportTo, setReportTo] = useState<string>('');
  const [appliedReportFrom, setAppliedReportFrom] = useState<string>('');
  const [appliedReportTo, setAppliedReportTo] = useState<string>('');

  // Manage Lists Modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'products' | 'models' | 'operators'>('products');
  const [newProductInput, setNewProductInput] = useState('');
  const [newOperatorInput, setNewOperatorInput] = useState('');
  const [modelsProductSelect, setModelsProductSelect] = useState<string>('Fridge');
  const [newModelInput, setNewModelInput] = useState('');

  // Printable ref
  const printSectionRef = useRef<HTMLDivElement>(null);

  // Available models based on selected product
  const availableModels = useMemo(() => {
    if (!product) return [];
    return formData.productModels[product] || [];
  }, [product, formData.productModels]);

  // When product changes, adjust model
  const handleProductChange = (newProd: string) => {
    setProduct(newProd);
    const models = formData.productModels[newProd] || [];
    if (models.length > 0) {
      setModel(models[0]);
    } else {
      setModel('');
    }
  };

  // Sync selected operator when master operators list is updated
  useEffect(() => {
    if (formData.operators.length > 0) {
      if (!operator || !formData.operators.includes(operator)) {
        setOperator(formData.operators[0]);
      }
    } else {
      setOperator('');
    }
  }, [formData.operators, operator]);

  // Sync selected product/model if removed from master list
  useEffect(() => {
    if (formData.products.length > 0) {
      if (!product || !formData.products.includes(product)) {
        const nextProd = formData.products[0];
        setProduct(nextProd);
        const models = formData.productModels[nextProd] || [];
        setModel(models[0] || '');
      }
    } else {
      setProduct('');
      setModel('');
    }
  }, [formData.products, product, formData.productModels]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Update fault qty
  const handleFaultQtyChange = (fault: string, valStr: string) => {
    const cleanStr = valStr.replace(/[^0-9]/g, '');
    const num = cleanStr === '' ? 0 : parseInt(cleanStr, 10);
    setFaultQuantities((prev) => {
      const updated = { ...prev };
      if (num > 0) {
        updated[fault] = num;
      } else {
        delete updated[fault];
      }
      return updated;
    });
  };

  // Add custom fault
  const handleAddCustomFault = () => {
    const name = newFaultName.trim();
    const qty = parseInt(newFaultQty.trim(), 10);
    if (!name) {
      showToast('Enter a fault name first.', 'error');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showToast('Enter a valid quantity (at least 1).', 'error');
      return;
    }

    if (!customFaults.includes(name) && !formData.faults.includes(name)) {
      setCustomFaults((prev) => [...prev, name]);
    }
    setFaultQuantities((prev) => ({ ...prev, [name]: qty }));
    setNewFaultName('');
    setNewFaultQty('');
    showToast(`Added fault "${name}" with qty ${qty}`, 'success');
  };

  // Calculate selected faults summary
  const selectedFaultCount = Object.keys(faultQuantities).length;
  const totalDefectQty = (Object.values(faultQuantities) as number[]).reduce(
    (acc: number, q: number) => acc + Number(q || 0),
    0
  );

  // Save Defect Data
  const handleSaveDefectData = () => {
    if (isSubmitting) return;

    if (!date) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (!shift) {
      showToast('Please select a shift.', 'error');
      return;
    }
    if (!product) {
      showToast('Please select a product.', 'error');
      return;
    }
    if (!model) {
      showToast('Please select or enter a model.', 'error');
      return;
    }
    if (selectedFaultCount === 0) {
      showToast('Enter at least one fault quantity before saving.', 'error');
      return;
    }
    if (!operator.trim()) {
      showToast('Enter the Checking Operator.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newEntries: AOIDefectRecord[] = [];
      const timestamp = Date.now();

      (Object.entries(faultQuantities) as [string, number][]).forEach(([fault, qty], index) => {
        newEntries.push({
          id: `aoi-${timestamp}-${index}`,
          line: lineName,
          date,
          shift,
          product,
          model,
          fault,
          qty,
          operator: operator.trim(),
          remarks: remarks.trim() || '—',
          createdAt: timestamp + index,
        });
      });

      // Also persist to general PCBA report database if present
      try {
        const globalSaved = localStorage.getItem('pcba_report_database_records');
        const globalRecords = globalSaved ? JSON.parse(globalSaved) : [];
        newEntries.forEach((entry) => {
          globalRecords.unshift({
            id: entry.id,
            date: entry.date,
            line: entry.line,
            model: entry.model,
            type: 'Aesthetic',
            desc: entry.fault,
            qty: entry.qty,
            status: 'Open',
          });
        });
        localStorage.setItem('pcba_report_database_records', JSON.stringify(globalRecords));
      } catch (e) {
        // Continue
      }

      setRecords((prev) => [...newEntries, ...prev]);
      setIsSubmitting(false);

      // Reset faults and remarks, keeping common info intact for fast data entry
      setFaultQuantities({});
      setRemarks('');
      showToast(
        `Saved ${newEntries.length} defect row${newEntries.length > 1 ? 's' : ''} successfully.`,
        'success'
      );
    }, 450);
  };

  // Filtered rows for Details Report
  const filteredRows = useMemo(() => {
    return records.filter((r) => {
      if (appliedReportFrom && r.date < appliedReportFrom) return false;
      if (appliedReportTo && r.date > appliedReportTo) return false;
      return true;
    });
  }, [records, appliedReportFrom, appliedReportTo]);

  // Apply Filter
  const handleApplyFilter = () => {
    setAppliedReportFrom(reportFrom);
    setAppliedReportTo(reportTo);
  };

  // Clear Filter
  const handleClearFilter = () => {
    setReportFrom('');
    setReportTo('');
    setAppliedReportFrom('');
    setAppliedReportTo('');
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to download for this date range.', 'error');
      return;
    }

    const headers = ['Date', 'Shift', 'Product', 'Model', 'Faults', 'Qty', 'Operator', 'Remarks'];
    const csvRows = [headers.join(',')];

    filteredRows.forEach((r) => {
      const vals = [
        r.date,
        r.shift,
        r.product,
        r.model,
        r.fault,
        r.qty,
        r.operator,
        r.remarks,
      ].map((val) => {
        const s = String(val ?? '');
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      });
      csvRows.push(vals.join(','));
    });

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lineName.toLowerCase().replace(/\s+/g, '_')}_defects_${getTodayString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV export downloaded', 'success');
  };

  // Print PDF
  const handlePrintPdf = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to print for this date range.', 'error');
      return;
    }
    window.print();
  };

  // Manage Lists Handlers
  const handleAddProduct = () => {
    const val = newProductInput.trim();
    if (!val) {
      showToast('Enter product name first.', 'error');
      return;
    }
    if (formData.products.includes(val)) {
      showToast('That product already exists.', 'error');
      return;
    }
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      products: [...prev.products, val].sort(),
      productModels: { ...prev.productModels, [val]: [] },
    }));
    setNewProductInput('');
    showToast(`Product "${val}" added`, 'success');
  };

  const handleDeleteProduct = (pName: string) => {
    if (!window.confirm(`Remove product "${pName}" and its models?`)) return;
    setFormData((prev: typeof DEFAULT_FORM_DATA) => {
      const copyProducts = prev.products.filter((p) => p !== pName);
      const copyModels = { ...prev.productModels };
      delete copyModels[pName];
      return {
        ...prev,
        products: copyProducts,
        productModels: copyModels,
      };
    });
    if (product === pName) {
      setProduct(formData.products[0] || '');
    }
    showToast(`Product "${pName}" removed`, 'success');
  };

  const handleAddModel = () => {
    const p = modelsProductSelect;
    const val = newModelInput.trim();
    if (!p) {
      showToast('Pick a product first.', 'error');
      return;
    }
    if (!val) {
      showToast('Enter model name first.', 'error');
      return;
    }
    const currentModels = formData.productModels[p] || [];
    if (currentModels.includes(val)) {
      showToast('That model already exists under this product.', 'error');
      return;
    }
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      productModels: {
        ...prev.productModels,
        [p]: [...currentModels, val].sort(),
      },
    }));
    setNewModelInput('');
    showToast(`Model "${val}" added under ${p}`, 'success');
  };

  const handleDeleteModel = (p: string, m: string) => {
    if (!window.confirm(`Remove model "${m}"?`)) return;
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      productModels: {
        ...prev.productModels,
        [p]: (prev.productModels[p] || []).filter((item) => item !== m),
      },
    }));
    showToast(`Model "${m}" removed`, 'success');
  };

  const handleAddOperator = () => {
    const val = newOperatorInput.trim();
    if (!val) {
      showToast('Enter operator name first.', 'error');
      return;
    }
    if (formData.operators.includes(val)) {
      showToast('That operator already exists.', 'error');
      return;
    }
    const updatedOps = [...formData.operators, val].sort();
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      operators: updatedOps,
    }));
    setOperator(val);
    setNewOperatorInput('');
    showToast(`Operator "${val}" added and selected`, 'success');
  };

  const handleDeleteOperator = (op: string) => {
    if (!window.confirm(`Remove operator "${op}"?`)) return;
    const remaining = formData.operators.filter((o: string) => o !== op);
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      operators: remaining,
    }));
    if (operator === op) {
      setOperator(remaining[0] || '');
    }
    showToast(`Operator "${op}" removed`, 'success');
  };

  // Combine standard faults + any added custom faults
  const allFaults = useMemo(() => {
    const set = new Set([...formData.faults, ...customFaults]);
    return Array.from(set);
  }, [formData.faults, customFaults]);

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-6 z-50 px-5 py-3.5 rounded-xl font-bold text-sm text-white shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
            toast.type === 'success' ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Header matching user demo */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-2xl shadow-md border border-[#234b73] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/15">
            🔍
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                {lineName} Defect Entry
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/25 text-[#86efac] border border-[#16a34a]/40">
                Live Production Entry
              </span>
            </div>
            <p id="aoi-header-subtitle" className="text-xs sm:text-sm text-[#b9c9dc] mt-0.5">
              PCBA AOI (Automatic Optical Inspection)
            </p>
          </div>
        </div>

        {/* Topbar Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowManageModal(true)}
            className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Manage Lists</span>
          </button>

          {onNavigateToDatabase && (
            <button
              type="button"
              onClick={onNavigateToDatabase}
              className="px-3.5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>All Database</span>
            </button>
          )}
        </div>
      </div>

      {/* CARD 1: Common Information */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-sm text-[#1e293b]">
          <span className="text-base">📋</span>
          <span>Common Information</span>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-date"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
              Date
            </label>
            <input
              id="aoi-input-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all"
            />
          </div>

          {/* Shift */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-shift"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
              Shift
            </label>
            <select
              id="aoi-input-shift"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all cursor-pointer"
            >
              <option value="">Select Shift…</option>
              {formData.shifts.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-product"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 text-[#2563eb]" />
              Product
            </label>
            <select
              id="aoi-input-product"
              value={product}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all cursor-pointer"
            >
              <option value="">Select Product…</option>
              {formData.products.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="aoi-input-model"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-[#2563eb]" />
              Model / Part No.
            </label>
            <select
              id="aoi-input-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!product}
              className={`w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] outline-none font-medium transition-all ${
                !product
                  ? 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
                  : 'bg-white text-[#1e293b] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 cursor-pointer'
              }`}
            >
              {!product ? (
                <option value="">Select Product first…</option>
              ) : availableModels.length === 0 ? (
                <option value="">No models yet — add via ⚙ Manage Lists</option>
              ) : (
                <>
                  <option value="">Select Model…</option>
                  {availableModels.map((m: string) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </section>

      {/* CARD 2: AOI Faults */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header with count pill */}
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1e293b]">
            <span className="text-base">🔍</span>
            <span>AOI Faults</span>
          </div>
          {selectedFaultCount > 0 && (
            <span className="text-xs font-bold text-[#2563eb] bg-[#eff6ff] px-3 py-1 rounded-full border border-[#bfdbfe]">
              {selectedFaultCount} fault{selectedFaultCount > 1 ? 's' : ''} selected ({totalDefectQty} pcs)
            </span>
          )}
        </div>

        {/* Checking Operator Bar */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="aoi-input-operator"
            className="text-xs font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5 shrink-0"
          >
            <User className="w-3.5 h-3.5 text-[#2563eb]" />
            Checking Operator
          </label>
          <div className="w-full sm:w-80 relative">
            <select
              id="aoi-input-operator"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none bg-white font-medium text-[#1e293b] transition-all cursor-pointer shadow-xs"
            >
              {formData.operators.length === 0 ? (
                <option value="">No operators found — add via ⚙ Manage Lists</option>
              ) : (
                <>
                  <option value="">Select Checking Operator…</option>
                  {formData.operators.map((op: string) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Faults Grid */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allFaults.map((faultName) => {
              const qty = faultQuantities[faultName] || 0;
              const hasValue = qty > 0;
              const isCustom = customFaults.includes(faultName);

              return (
                <div
                  key={faultName}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border-[1.5px] transition-all duration-150 ${
                    hasValue
                      ? 'border-[#2563eb] bg-[#f5f8ff] shadow-xs'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-semibold truncate ${
                        hasValue ? 'text-[#1d4ed8] font-bold' : 'text-[#334155]'
                      }`}
                      title={faultName}
                    >
                      {faultName}
                      {isCustom && (
                        <span className="ml-1 text-[10px] text-[#94a3b8] font-normal">
                          (new)
                        </span>
                      )}
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={qty > 0 ? qty : ''}
                    placeholder="0"
                    onChange={(e) => handleFaultQtyChange(faultName, e.target.value)}
                    className={`w-16 py-1.5 px-2 text-center text-sm font-bold rounded-lg border outline-none transition-all ${
                      hasValue
                        ? 'border-[#2563eb] bg-white text-[#1d4ed8] shadow-xs'
                        : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] focus:border-[#2563eb] focus:bg-white'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Add Other Fault */}
          <div className="pt-4 border-t border-dashed border-[#e2e8f0] flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <input
              type="text"
              value={newFaultName}
              onChange={(e) => setNewFaultName(e.target.value)}
              placeholder="+ Add a fault not listed above"
              className="flex-1 min-w-[200px] text-sm px-3.5 py-2 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] outline-none font-medium text-[#1e293b]"
            />
            <input
              type="number"
              min="1"
              step="1"
              value={newFaultQty}
              onChange={(e) => setNewFaultQty(e.target.value)}
              placeholder="Qty"
              className="w-24 text-sm px-3.5 py-2 rounded-lg border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] outline-none text-center font-bold text-[#1e293b]"
            />
            <button
              type="button"
              onClick={handleAddCustomFault}
              className="px-4 py-2 rounded-lg bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* CARD 3: Remarks (optional) */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-sm text-[#1e293b]">
          <span className="text-base">📝</span>
          <span>Remarks (optional)</span>
        </div>
        <div className="p-5">
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional inspection notes, rework actions, or component reference designators (e.g., R12, C45)..."
            className="w-full text-sm p-3 rounded-xl border-[1.5px] border-[#e2e8f0] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none font-medium text-[#1e293b] resize-y"
          />
        </div>
      </section>

      {/* DETAILS REPORT: Table matching user template */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        {/* Report Header */}
        <div className="p-5 bg-[#0f2942] text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📄</span>
              <h2 className="font-bold text-base text-white">
                Details Report — {lineName}
              </h2>
            </div>
            <span className="text-xs text-[#cbd5e1] font-mono font-medium">
              {filteredRows.length} row{filteredRows.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Date Filter & Export Controls */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-[#cbd5e1]">
              <span>From</span>
              <input
                type="date"
                value={reportFrom}
                onChange={(e) => setReportFrom(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-white text-[#1e293b] font-medium outline-none border-none shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#cbd5e1]">
              <span>To</span>
              <input
                type="date"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-white text-[#1e293b] font-medium outline-none border-none shadow-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyFilter}
              className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-xs"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-md cursor-pointer transition-colors border border-white/20"
            >
              Clear
            </button>

            <div className="sm:ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-md cursor-pointer transition-colors border border-white/20 flex items-center gap-1.5"
                title="Download filtered report as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-md cursor-pointer transition-colors border border-white/20 flex items-center gap-1.5"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="max-h-[380px] overflow-auto">
          {filteredRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#64748b]">
              No rows found — fill in the form above and click{' '}
              <strong className="text-[#2563eb]">SAVE DEFECT DATA</strong> to add records.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f1f5f9] sticky top-0 z-10 text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Shift</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Product</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Model</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Faults</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Qty</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Operator</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-[#1e293b] whitespace-nowrap font-medium">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-[#334155]">
                      {r.shift}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-[#0f2942]">
                      {r.product}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-[#475569]">
                      {r.model}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#fee2e2] text-[#b91c1c] font-bold text-[11px]">
                        {r.fault}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-center text-[#2563eb]">
                      {r.qty}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-[#475569]">
                      {r.operator}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#64748b] max-w-[220px] truncate" title={r.remarks}>
                      {r.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* STICKY SAVE BAR matching user template */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-2xl py-3.5 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-medium text-[#64748b]">
            {selectedFaultCount === 0 ? (
              <span>No faults entered yet</span>
            ) : (
              <span className="text-[#1e293b]">
                <strong className="text-[#2563eb]">{selectedFaultCount}</strong> fault type
                {selectedFaultCount > 1 ? 's' : ''} ({totalDefectQty} pcs) will be saved as{' '}
                <strong className="text-[#2563eb]">{selectedFaultCount}</strong> row
                {selectedFaultCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveDefectData}
            disabled={selectedFaultCount === 0 || isSubmitting}
            className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-md transition-all ${
              selectedFaultCount === 0 || isSubmitting
                ? 'bg-[#cbd5e1] text-[#94a3b8] cursor-not-allowed shadow-none'
                : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white active:scale-95 cursor-pointer shadow-[#2563eb]/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span>SAVING…</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>SAVE DEFECT DATA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MANAGE LISTS MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Settings className="w-4 h-4 text-[#60a5fa]" />
                <span>Manage Master Lists</span>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#e2e8f0] bg-[#fafbfc]">
              <button
                type="button"
                onClick={() => setActiveModalTab('products')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'products'
                    ? 'border-[#2563eb] text-[#2563eb] bg-white'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Products ({formData.products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('models')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'models'
                    ? 'border-[#2563eb] text-[#2563eb] bg-white'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Models
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('operators')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'operators'
                    ? 'border-[#2563eb] text-[#2563eb] bg-white'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Operators ({formData.operators.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Products Tab */}
              {activeModalTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProductInput}
                      onChange={(e) => setNewProductInput(e.target.value)}
                      placeholder="New product category name (e.g. Microwave)"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {formData.products.map((pName: string) => (
                      <div
                        key={pName}
                        className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                      >
                        <span>{pName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(pName)}
                          className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Models Tab */}
              {activeModalTab === 'models' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase">
                      Select Product Category
                    </label>
                    <select
                      value={modelsProductSelect}
                      onChange={(e) => setModelsProductSelect(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none bg-white font-medium"
                    >
                      {formData.products.map((p: string) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newModelInput}
                      onChange={(e) => setNewModelInput(e.target.value)}
                      placeholder="New model name for this product"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddModel}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                    {(formData.productModels[modelsProductSelect] || []).length === 0 ? (
                      <div className="text-xs text-[#94a3b8] p-3 text-center">
                        No models added for {modelsProductSelect} yet.
                      </div>
                    ) : (
                      (formData.productModels[modelsProductSelect] || []).map((mName: string) => (
                        <div
                          key={mName}
                          className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                        >
                          <span className="truncate pr-2">{mName}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(modelsProductSelect, mName)}
                            className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold shrink-0 cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Operators Tab */}
              {activeModalTab === 'operators' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOperatorInput}
                      onChange={(e) => setNewOperatorInput(e.target.value)}
                      placeholder="New operator name (e.g. John Doe(12345))"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOperator}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {formData.operators.map((opName: string) => (
                      <div
                        key={opName}
                        className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                      >
                        <span>{opName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOperator(opName)}
                          className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-5 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Section for @media print */}
      <div id="printArea" ref={printSectionRef} className="hidden print:block p-6">
        <h2 className="text-xl font-bold mb-1">
          {lineName} Defect Entry — Details Report
        </h2>
        <div className="text-xs text-[#64748b] mb-4">
          Date range:{' '}
          {appliedReportFrom || '(all)'} to {appliedReportTo || '(all)'} •{' '}
          {filteredRows.length} row(s) • Generated {new Date().toLocaleString()}
        </div>
        <table className="w-full text-left text-xs border border-[#94a3b8]">
          <thead>
            <tr className="bg-[#f1f5f9]">
              <th className="border border-[#94a3b8] p-2">Date</th>
              <th className="border border-[#94a3b8] p-2">Shift</th>
              <th className="border border-[#94a3b8] p-2">Product</th>
              <th className="border border-[#94a3b8] p-2">Model</th>
              <th className="border border-[#94a3b8] p-2">Faults</th>
              <th className="border border-[#94a3b8] p-2 text-center">Qty</th>
              <th className="border border-[#94a3b8] p-2">Operator</th>
              <th className="border border-[#94a3b8] p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td className="border border-[#94a3b8] p-2">{r.date}</td>
                <td className="border border-[#94a3b8] p-2">{r.shift}</td>
                <td className="border border-[#94a3b8] p-2">{r.product}</td>
                <td className="border border-[#94a3b8] p-2">{r.model}</td>
                <td className="border border-[#94a3b8] p-2">{r.fault}</td>
                <td className="border border-[#94a3b8] p-2 text-center">{r.qty}</td>
                <td className="border border-[#94a3b8] p-2">{r.operator}</td>
                <td className="border border-[#94a3b8] p-2">{r.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
