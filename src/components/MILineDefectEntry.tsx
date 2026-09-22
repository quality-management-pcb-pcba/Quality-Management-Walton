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
  Palette,
  Wrench,
  FileText,
  Filter,
} from 'lucide-react';

export interface MIDefectRecord {
  id: string;
  line: string;
  date: string;
  shift: string;
  product: string;
  model: string;
  aesthetic: string;
  func: string;
  qty: number;
  operator: string;
  remarks: string;
  createdAt: number;
}

export interface MILineDefectEntryProps {
  lineName?: string;
  onNavigateToDatabase?: () => void;
}

// Master data from MI_LINE-01 standard specifications
const DEFAULT_FORM_DATA = {
  shifts: ['Day', 'Night', 'Morning', 'Evening', 'General'],
  products: ['Adapter', 'TV', 'Toy', 'Ac', 'Fridge', 'LED', 'Rice cooker', 'Fan'],
  operators: [
    'Md. Rony Khan(14873)',
    'Akter Jahan Shelly(17577)',
    'Rashida khatun(17671)',
    'Md. Masud Rana(15065)',
    'C-14324  Habibur',
    'C-14555 Mazharul',
    'Chandana rani das(1354)',
    'Mukta Akter(21578)',
  ],
  aesthetics: [
    'Missing',
    'Wrong Component',
    'Polarity Change',
    'Dry Solder',
    'Over Lead',
    'Solder Short',
    'Leg Down',
    'Leg Open',
    'Leg Up',
    'Broken',
    'Cutting Problem',
    'PCBA Bend',
    'PCBA Scratch',
    'Pad Lift Off',
    'Hole Block',
    'LED no light',
  ],
  functionals: [
    'RF',
    'HDMI',
    'Colour',
    'No Power',
    'Speaker not work',
    'Speaker Low sound',
    'LED Not Work',
    'No Sound',
    'LAN',
    'USB',
    'AV Jack',
    'No audio output(TV)',
    'Wrong music',
  ],
  productModels: {
    Adapter: ['WFVADP12V2ASET200K_(CT-X017)', 'WFVADP12V2ASET200K_(CT-X018)'],
    TV: ['WD24RCS', 'WD32R TV'],
    Toy: [
      'Akij Toy Controller V1.0',
      'Common Toy Controller V1.0(Akij)',
      'Common Toy Controller V1.0(Talukder)',
      'Common Toy LED Driver_V1.0(Akij)',
      'Common Toy LED Driver_V1.0(Talukder)',
    ],
    Ac: ['AC 12K IDU', 'AC 18K IDU', 'AC 18K ODU', 'AC 24K ODU', 'Ac display common'],
    Fridge: [
      'Electronic Thermostat V02',
      'MI Constant Fan Dimmer',
      'MI-R-LED-RS-V04',
      'MI-SC-PWR-Board V3.1',
      'Smart Controler Display',
    ],
    LED: ['LED Driver-12W', 'LED Driver-20W', 'LED Driver-40W', 'LED Driver-50W'],
    'Rice cooker': ['Walton Rice Cooker LED PCBA Model: RCL01'],
    Fan: ['16" SMPS Local Fan', '16"Control Local FAN'],
  } as Record<string, string[]>,
};

export const MILineDefectEntry: React.FC<MILineDefectEntryProps> = ({
  lineName = 'MI Line-01',
  onNavigateToDatabase,
}) => {
  const lineStorageKey = `mi_defect_records_${lineName.replace(/\s+/g, '_').toLowerCase()}`;
  const masterDataKey = `mi_master_data_${lineName.replace(/\s+/g, '_').toLowerCase()}`;

  // Master Data state with local persistence
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(masterDataKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_FORM_DATA;
  });

  // Save master data
  useEffect(() => {
    localStorage.setItem(masterDataKey, JSON.stringify(formData));
  }, [formData, masterDataKey]);

  // Form selections
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedShift, setSelectedShift] = useState('Day');
  const [selectedProduct, setSelectedProduct] = useState('Adapter');
  const [selectedModel, setSelectedModel] = useState(
    formData.productModels['Adapter']?.[0] || ''
  );
  const [remarks, setRemarks] = useState('');

  // Operator fields
  const [aestheticOperator, setAestheticOperator] = useState<string>(() => {
    return formData.operators[0] || '';
  });
  const [functionalOperator, setFunctionalOperator] = useState<string>(() => {
    return formData.operators[0] || '';
  });

  // Quantities maps: defectName -> qty
  const [aestheticQuantities, setAestheticQuantities] = useState<Record<string, number>>({});
  const [functionalQuantities, setFunctionalQuantities] = useState<Record<string, number>>({});

  // Other defect inputs
  const [aestheticOtherName, setAestheticOtherName] = useState('');
  const [aestheticOtherQty, setAestheticOtherQty] = useState('');
  const [functionalOtherName, setFunctionalOtherName] = useState('');
  const [functionalOtherQty, setFunctionalOtherQty] = useState('');

  // Custom dynamically added defects for current session
  const [extraAesthetics, setExtraAesthetics] = useState<string[]>([]);
  const [extraFunctionals, setExtraFunctionals] = useState<string[]>([]);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Manage Lists Modal
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'products' | 'models' | 'operators'>('products');
  const [modalNewProduct, setModalNewProduct] = useState('');
  const [modalSelectedProductForModel, setModalSelectedProductForModel] = useState(selectedProduct || 'Adapter');
  const [modalNewModel, setModalNewModel] = useState('');
  const [modalNewOperator, setModalNewOperator] = useState('');

  // Defect Records State
  const [records, setRecords] = useState<MIDefectRecord[]>(() => {
    try {
      const saved = localStorage.getItem(lineStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Seed sample records if empty
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'seed-mi-1',
        line: lineName,
        date: today,
        shift: 'Day',
        product: 'Adapter',
        model: 'WFVADP12V2ASET200K_(CT-X017)',
        aesthetic: 'Missing',
        func: '',
        qty: 2,
        operator: 'Md. Rony Khan(14873)',
        remarks: 'Inspected station 2',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'seed-mi-2',
        line: lineName,
        date: today,
        shift: 'Day',
        product: 'Adapter',
        model: 'WFVADP12V2ASET200K_(CT-X017)',
        aesthetic: 'Dry Solder',
        func: '',
        qty: 4,
        operator: 'Md. Rony Khan(14873)',
        remarks: 'Near secondary coil',
        createdAt: Date.now() - 3200000,
      },
      {
        id: 'seed-mi-3',
        line: lineName,
        date: today,
        shift: 'Day',
        product: 'Adapter',
        model: 'WFVADP12V2ASET200K_(CT-X017)',
        aesthetic: '',
        func: 'No Power',
        qty: 1,
        operator: 'Md. Masud Rana(15065)',
        remarks: 'Fuse verified blown',
        createdAt: Date.now() - 2800000,
      },
    ];
  });

  // Persist records
  useEffect(() => {
    localStorage.setItem(lineStorageKey, JSON.stringify(records));
  }, [records, lineStorageKey]);

  // Report Date Filters
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const handleApplyFilter = () => {
    setAppliedFrom(filterFrom);
    setAppliedTo(filterTo);
  };

  const handleClearFilter = () => {
    setFilterFrom('');
    setFilterTo('');
    setAppliedFrom('');
    setAppliedTo('');
  };

  // Filtered records for table
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (appliedFrom && r.date < appliedFrom) return false;
      if (appliedTo && r.date > appliedTo) return false;
      return true;
    });
  }, [records, appliedFrom, appliedTo]);

  // Sync model selection when product changes
  const handleProductChange = (prod: string) => {
    setSelectedProduct(prod);
    const availableModels = formData.productModels[prod] || [];
    setSelectedModel(availableModels[0] || '');
  };

  // Sync selected operators when master operators list is updated
  useEffect(() => {
    if (formData.operators.length > 0) {
      if (!aestheticOperator || !formData.operators.includes(aestheticOperator)) {
        setAestheticOperator(formData.operators[0]);
      }
      if (!functionalOperator || !formData.operators.includes(functionalOperator)) {
        setFunctionalOperator(formData.operators[0]);
      }
    } else {
      setAestheticOperator('');
      setFunctionalOperator('');
    }
  }, [formData.operators, aestheticOperator, functionalOperator]);

  // Sync selected product/model if removed from master list
  useEffect(() => {
    if (formData.products.length > 0) {
      if (!selectedProduct || !formData.products.includes(selectedProduct)) {
        const nextProd = formData.products[0];
        setSelectedProduct(nextProd);
        const models = formData.productModels[nextProd] || [];
        setSelectedModel(models[0] || '');
      }
    } else {
      setSelectedProduct('');
      setSelectedModel('');
    }
  }, [formData.products, selectedProduct, formData.productModels]);

  // Aesthetics list
  const allAesthetics = useMemo(() => {
    return [...formData.aesthetics, ...extraAesthetics];
  }, [formData.aesthetics, extraAesthetics]);

  // Functionals list
  const allFunctionals = useMemo(() => {
    return [...formData.functionals, ...extraFunctionals];
  }, [formData.functionals, extraFunctionals]);

  // Handle quantity changes
  const handleAestheticQtyChange = (name: string, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const num = parseInt(cleanVal, 10);
    setAestheticQuantities((prev) => {
      const copy = { ...prev };
      if (!cleanVal || isNaN(num) || num <= 0) {
        delete copy[name];
      } else {
        copy[name] = num;
      }
      return copy;
    });
  };

  const handleFunctionalQtyChange = (name: string, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const num = parseInt(cleanVal, 10);
    setFunctionalQuantities((prev) => {
      const copy = { ...prev };
      if (!cleanVal || isNaN(num) || num <= 0) {
        delete copy[name];
      } else {
        copy[name] = num;
      }
      return copy;
    });
  };

  // Add custom aesthetic defect
  const handleAddAestheticOther = () => {
    const name = aestheticOtherName.trim();
    const qty = parseInt(aestheticOtherQty, 10);
    if (!name) {
      showToast('Enter a defect name first.', 'error');
      return;
    }
    if (!qty || isNaN(qty) || qty <= 0) {
      showToast('Enter a valid quantity.', 'error');
      return;
    }
    if (!allAesthetics.includes(name)) {
      setExtraAesthetics((prev) => [...prev, name]);
    }
    setAestheticQuantities((prev) => ({ ...prev, [name]: qty }));
    setAestheticOtherName('');
    setAestheticOtherQty('');
    showToast(`Added defect "${name}" with qty ${qty}`, 'success');
  };

  // Add custom functional defect
  const handleAddFunctionalOther = () => {
    const name = functionalOtherName.trim();
    const qty = parseInt(functionalOtherQty, 10);
    if (!name) {
      showToast('Enter a defect name first.', 'error');
      return;
    }
    if (!qty || isNaN(qty) || qty <= 0) {
      showToast('Enter a valid quantity.', 'error');
      return;
    }
    if (!allFunctionals.includes(name)) {
      setExtraFunctionals((prev) => [...prev, name]);
    }
    setFunctionalQuantities((prev) => ({ ...prev, [name]: qty }));
    setFunctionalOtherName('');
    setFunctionalOtherQty('');
    showToast(`Added defect "${name}" with qty ${qty}`, 'success');
  };

  // Calculations for summary
  const aestheticCount = Object.keys(aestheticQuantities).length;
  const functionalCount = Object.keys(functionalQuantities).length;
  const totalDefectTypes = aestheticCount + functionalCount;
  const totalDefectQty =
    (Object.values(aestheticQuantities) as number[]).reduce((a, b) => a + b, 0) +
    (Object.values(functionalQuantities) as number[]).reduce((a, b) => a + b, 0);

  // Save Defect Data
  const handleSaveDefectData = () => {
    if (isSubmitting) return;

    if (!selectedDate) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (!selectedShift) {
      showToast('Please select a shift.', 'error');
      return;
    }
    if (!selectedProduct) {
      showToast('Please select a product.', 'error');
      return;
    }
    if (!selectedModel) {
      showToast('Please select or enter a model.', 'error');
      return;
    }
    if (totalDefectTypes === 0) {
      showToast('Enter at least one defect quantity before saving.', 'error');
      return;
    }
    if (aestheticCount > 0 && !aestheticOperator.trim()) {
      showToast('Enter the Checking Operator for Aesthetic Defects.', 'error');
      return;
    }
    if (functionalCount > 0 && !functionalOperator.trim()) {
      showToast('Enter the Checking Operator for Functional Defects.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newEntries: MIDefectRecord[] = [];
      const timestamp = Date.now();

      // Aesthetic rows
      (Object.entries(aestheticQuantities) as [string, number][]).forEach(([name, qty], index) => {
        newEntries.push({
          id: `mi-${timestamp}-aes-${index}`,
          line: lineName,
          date: selectedDate,
          shift: selectedShift,
          product: selectedProduct,
          model: selectedModel,
          aesthetic: name,
          func: '',
          qty,
          operator: aestheticOperator.trim(),
          remarks: remarks.trim(),
          createdAt: timestamp + index,
        });
      });

      // Functional rows
      (Object.entries(functionalQuantities) as [string, number][]).forEach(([name, qty], index) => {
        newEntries.push({
          id: `mi-${timestamp}-func-${index}`,
          line: lineName,
          date: selectedDate,
          shift: selectedShift,
          product: selectedProduct,
          model: selectedModel,
          aesthetic: '',
          func: name,
          qty,
          operator: functionalOperator.trim(),
          remarks: remarks.trim(),
          createdAt: timestamp + 100 + index,
        });
      });

      setRecords((prev) => [...newEntries, ...prev]);

      // Reset defect inputs while keeping common info
      setAestheticQuantities({});
      setFunctionalQuantities({});
      setRemarks('');
      setIsSubmitting(false);

      showToast(
        `Saved ${newEntries.length} defect row${newEntries.length > 1 ? 's' : ''} successfully.`,
        'success'
      );
    }, 450);
  };

  // CSV Download
  const handleDownloadCsv = () => {
    if (filteredRecords.length === 0) {
      showToast('No rows to download for this date range.', 'error');
      return;
    }

    const headers = ['Date', 'Shift', 'Product', 'Model', 'Aesthetic', 'Function', 'Qty', 'Operator', 'Remarks'];
    const csvRows = [headers.join(',')];

    filteredRecords.forEach((r) => {
      const values = [
        r.date,
        r.shift,
        r.product,
        r.model,
        r.aesthetic,
        r.func,
        r.qty,
        r.operator,
        r.remarks,
      ].map((val) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lineName.replace(/\s+/g, '_').toLowerCase()}_defects_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('CSV report exported.', 'success');
  };

  // Print/PDF View
  const handlePrintPdf = () => {
    if (filteredRecords.length === 0) {
      showToast('No rows to print for this date range.', 'error');
      return;
    }
    window.print();
  };

  // Manage Lists functions
  const handleAddProduct = () => {
    const val = modalNewProduct.trim();
    if (!val) return;
    if (formData.products.includes(val)) {
      showToast('That product already exists.', 'error');
      return;
    }
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      products: [...prev.products, val].sort(),
      productModels: { ...prev.productModels, [val]: [] },
    }));
    setModalNewProduct('');
    showToast(`Product "${val}" added.`, 'success');
  };

  const handleDeleteProduct = (prod: string) => {
    if (!window.confirm(`Remove "${prod}" from products?`)) return;
    setFormData((prev: typeof DEFAULT_FORM_DATA) => {
      const nextProds = prev.products.filter((p) => p !== prod);
      const nextModels = { ...prev.productModels };
      delete nextModels[prod];
      return {
        ...prev,
        products: nextProds,
        productModels: nextModels,
      };
    });
    if (selectedProduct === prod) {
      const remaining = formData.products.filter((p: string) => p !== prod);
      setSelectedProduct(remaining[0] || '');
    }
    showToast(`Product "${prod}" removed.`, 'success');
  };

  const handleAddModel = () => {
    const prod = modalSelectedProductForModel;
    const model = modalNewModel.trim();
    if (!prod || !model) return;
    const existing = formData.productModels[prod] || [];
    if (existing.includes(model)) {
      showToast('That model already exists for this product.', 'error');
      return;
    }
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      productModels: {
        ...prev.productModels,
        [prod]: [...existing, model].sort(),
      },
    }));
    setModalNewModel('');
    showToast(`Model "${model}" added to ${prod}.`, 'success');
  };

  const handleDeleteModel = (prod: string, model: string) => {
    if (!window.confirm(`Remove "${model}" from ${prod}?`)) return;
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      productModels: {
        ...prev.productModels,
        [prod]: (prev.productModels[prod] || []).filter((m) => m !== model),
      },
    }));
    showToast(`Model "${model}" removed.`, 'success');
  };

  const handleAddOperator = () => {
    const op = modalNewOperator.trim();
    if (!op) return;
    if (formData.operators.includes(op)) {
      showToast('That operator already exists.', 'error');
      return;
    }
    const updated = [...formData.operators, op].sort();
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      operators: updated,
    }));
    setAestheticOperator(op);
    setFunctionalOperator(op);
    setModalNewOperator('');
    showToast(`Operator "${op}" added and selected.`, 'success');
  };

  const handleDeleteOperator = (op: string) => {
    if (!window.confirm(`Remove "${op}" from operators?`)) return;
    const remaining = formData.operators.filter((o) => o !== op);
    setFormData((prev: typeof DEFAULT_FORM_DATA) => ({
      ...prev,
      operators: remaining,
    }));
    if (aestheticOperator === op) {
      setAestheticOperator(remaining[0] || '');
    }
    if (functionalOperator === op) {
      setFunctionalOperator(remaining[0] || '');
    }
    showToast(`Operator "${op}" removed.`, 'success');
  };

  return (
    <div className="space-y-5 print:p-0">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-6 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all animate-bounce ${
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

      {/* Top Banner & Header Bar */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-xl p-4 sm:p-5 shadow-sm border border-[#224b73] print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight">{lineName} Defect Entry</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#bbf7d0] border border-[#16a34a]/40">
                  Ready (Active)
                </span>
              </div>
              <p className="text-xs text-[#b9c9dc] mt-0.5">
                PCB / PCBA Aesthetic &amp; Functional Inspection Data Entry
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
            <button
              type="button"
              id="btn-manage-lists-mi"
              onClick={() => setIsManageModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>⚙ Manage Lists</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARD 1: Common Information */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-[#1e293b] text-sm">
          <FileText className="w-4 h-4 text-[#2563eb]" />
          <span>Common Information</span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white"
            >
              {formData.shifts.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white cursor-pointer"
            >
              {formData.products.map((p: string) => (
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
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedProduct}
              className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all bg-white cursor-pointer"
            >
              {(formData.productModels[selectedProduct] || []).length === 0 ? (
                <option value="">No models yet — add via ⚙ Manage Lists</option>
              ) : (
                (formData.productModels[selectedProduct] || []).map((m: string) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </section>

      {/* CARD 2: Aesthetic Defects */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#1e293b] text-sm">
            <Palette className="w-4 h-4 text-[#2563eb]" />
            <span>Aesthetic Defects</span>
          </div>
          {aestheticCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb]">
              {aestheticCount} selected
            </span>
          )}
        </div>

        {/* Operator sub-bar */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="aestheticOperator"
            className="text-xs font-bold text-[#475569] uppercase tracking-wider"
          >
            Checking Operator
          </label>
          <div className="w-full sm:w-72">
            <select
              id="aestheticOperator"
              value={aestheticOperator}
              onChange={(e) => setAestheticOperator(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
            >
              {formData.operators.length === 0 ? (
                <option value="">No operators yet — add via ⚙ Manage Lists</option>
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

        {/* Grid of Aesthetic Defects */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {allAesthetics.map((defect) => {
              const qty = aestheticQuantities[defect] || '';
              const hasVal = Boolean(qty);
              return (
                <div
                  key={defect}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    hasVal
                      ? 'border-[#2563eb] bg-[#f5f8ff] shadow-xs'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#1e293b] truncate pr-2">
                    {defect}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => handleAestheticQtyChange(defect, e.target.value)}
                    placeholder="0"
                    className="w-16 py-1 px-2 text-center text-sm font-bold border border-[#cbd5e1] rounded bg-white text-[#1e293b] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Add custom aesthetic defect */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-dashed border-[#e2e8f0]">
            <input
              type="text"
              value={aestheticOtherName}
              onChange={(e) => setAestheticOtherName(e.target.value)}
              placeholder="+ Add a defect not listed above"
              className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <input
              type="number"
              min="1"
              value={aestheticOtherQty}
              onChange={(e) => setAestheticOtherQty(e.target.value)}
              placeholder="Qty"
              className="w-20 px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-center font-bold text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <button
              type="button"
              onClick={handleAddAestheticOther}
              className="px-4 py-1.5 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* CARD 3: Functional Defects */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#1e293b] text-sm">
            <Wrench className="w-4 h-4 text-[#2563eb]" />
            <span>Functional Defects</span>
          </div>
          {functionalCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb]">
              {functionalCount} selected
            </span>
          )}
        </div>

        {/* Operator sub-bar */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="functionalOperator"
            className="text-xs font-bold text-[#475569] uppercase tracking-wider"
          >
            Checking Operator
          </label>
          <div className="w-full sm:w-72">
            <select
              id="functionalOperator"
              value={functionalOperator}
              onChange={(e) => setFunctionalOperator(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
            >
              {formData.operators.length === 0 ? (
                <option value="">No operators yet — add via ⚙ Manage Lists</option>
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

        {/* Grid of Functional Defects */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {allFunctionals.map((defect) => {
              const qty = functionalQuantities[defect] || '';
              const hasVal = Boolean(qty);
              return (
                <div
                  key={defect}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    hasVal
                      ? 'border-[#2563eb] bg-[#f5f8ff] shadow-xs'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#1e293b] truncate pr-2">
                    {defect}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => handleFunctionalQtyChange(defect, e.target.value)}
                    placeholder="0"
                    className="w-16 py-1 px-2 text-center text-sm font-bold border border-[#cbd5e1] rounded bg-white text-[#1e293b] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Add custom functional defect */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-dashed border-[#e2e8f0]">
            <input
              type="text"
              value={functionalOtherName}
              onChange={(e) => setFunctionalOtherName(e.target.value)}
              placeholder="+ Add a defect not listed above"
              className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <input
              type="number"
              min="1"
              value={functionalOtherQty}
              onChange={(e) => setFunctionalOtherQty(e.target.value)}
              placeholder="Qty"
              className="w-20 px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-center font-bold text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <button
              type="button"
              onClick={handleAddFunctionalOther}
              className="px-4 py-1.5 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* CARD 4: Remarks */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-[#1e293b] text-sm">
          <FileSpreadsheet className="w-4 h-4 text-[#2563eb]" />
          <span>Remarks (optional)</span>
        </div>
        <div className="p-5">
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional notes for this inspection entry…"
            className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none resize-y"
          />
        </div>
      </section>

      {/* CARD 5: Details Report Table */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:m-0 print:border-none">
        <div className="p-4 sm:p-5 bg-[#0f2942] text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📄</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold">Details Report — {lineName}</h2>
              <span className="text-xs text-[#9fb0d6]">
                {filteredRecords.length} row{filteredRecords.length === 1 ? '' : 's'} recorded
              </span>
            </div>
          </div>

          {/* Date Filter & Export Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
              <span className="text-[#cbd5e1] font-semibold">From</span>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
              <span className="text-[#cbd5e1] font-semibold">To</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none"
              />
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
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Print Metadata */}
        <div className="hidden print:block p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold">{lineName} Defect Entry — Details Report</h1>
          <p className="text-xs text-gray-600">
            Exported {new Date().toLocaleDateString()} • Filter:{' '}
            {appliedFrom || appliedTo ? `${appliedFrom || 'any'} to ${appliedTo || 'any'}` : 'All dates'} •{' '}
            {filteredRecords.length} records
          </p>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f1f5f9] text-[#475569] font-bold sticky top-0 z-10 border-b border-[#e2e8f0]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Shift</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Product</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Aesthetic</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Function</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Operator</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#1e293b]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-[#94a3b8]">
                    No rows yet — fill in the form above and click Save to see defect records appear here.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap font-medium">{rec.date}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{rec.shift}</td>
                    <td className="py-2 px-3 whitespace-nowrap font-semibold">{rec.product}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{rec.model}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {rec.aesthetic ? (
                        <span className="font-semibold text-[#dc2626]">{rec.aesthetic}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {rec.func ? (
                        <span className="font-semibold text-[#2563eb]">{rec.func}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-sm text-[#0f2942]">
                      {rec.qty}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{rec.operator}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-[#64748b]">{rec.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating / Sticky Save Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] py-3.5 px-5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 z-20 print:hidden">
        <div className="text-sm font-medium text-[#64748b]">
          {totalDefectTypes === 0 ? (
            <span>No defects entered yet</span>
          ) : (
            <span>
              <strong className="text-[#0f2942]">{totalDefectTypes}</strong> defect type
              {totalDefectTypes > 1 ? 's' : ''} (<strong className="text-[#2563eb]">{totalDefectQty} pcs</strong>) will be saved as{' '}
              <strong className="text-[#0f2942]">{totalDefectTypes}</strong> row
              {totalDefectTypes > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-save-mi-defect"
          disabled={totalDefectTypes === 0 || isSubmitting}
          onClick={handleSaveDefectData}
          className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#cbd5e1] text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>SAVING…</span>
            </>
          ) : (
            <>
              <span>SAVE DEFECT DATA</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* MANAGE LISTS MODAL */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>⚙</span>
                <span>Manage Lists — {lineName}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#e2e8f0] bg-[#fafbfc]">
              <button
                type="button"
                onClick={() => setActiveModalTab('products')}
                className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  activeModalTab === 'products'
                    ? 'text-[#2563eb] border-[#2563eb] bg-white'
                    : 'text-[#64748b] border-transparent hover:text-[#1e293b]'
                }`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('models')}
                className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  activeModalTab === 'models'
                    ? 'text-[#2563eb] border-[#2563eb] bg-white'
                    : 'text-[#64748b] border-transparent hover:text-[#1e293b]'
                }`}
              >
                Models
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('operators')}
                className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  activeModalTab === 'operators'
                    ? 'text-[#2563eb] border-[#2563eb] bg-white'
                    : 'text-[#64748b] border-transparent hover:text-[#1e293b]'
                }`}
              >
                Operators
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: Products */}
              {activeModalTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modalNewProduct}
                      onChange={(e) => setModalNewProduct(e.target.value)}
                      placeholder="New product name"
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {formData.products.map((p: string) => (
                      <div
                        key={p}
                        className="flex items-center justify-between p-2.5 border border-[#e2e8f0] rounded-lg bg-[#fafbfc] text-xs font-medium text-[#1e293b]"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p)}
                          className="text-[#dc2626] hover:bg-red-50 p-1 rounded font-bold transition-colors cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Models */}
              {activeModalTab === 'models' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#64748b]">Select Product</label>
                    <select
                      value={modalSelectedProductForModel}
                      onChange={(e) => setModalSelectedProductForModel(e.target.value)}
                      className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium bg-white outline-none"
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
                      value={modalNewModel}
                      onChange={(e) => setModalNewModel(e.target.value)}
                      placeholder={`New model for ${modalSelectedProductForModel}`}
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddModel}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                    {(formData.productModels[modalSelectedProductForModel] || []).length === 0 ? (
                      <div className="text-xs text-[#94a3b8] py-4 text-center">
                        No models added for this product yet.
                      </div>
                    ) : (
                      (formData.productModels[modalSelectedProductForModel] || []).map((m: string) => (
                        <div
                          key={m}
                          className="flex items-center justify-between p-2.5 border border-[#e2e8f0] rounded-lg bg-[#fafbfc] text-xs font-medium text-[#1e293b]"
                        >
                          <span className="truncate pr-2">{m}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(modalSelectedProductForModel, m)}
                            className="text-[#dc2626] hover:bg-red-50 p-1 rounded font-bold transition-colors cursor-pointer shrink-0"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Operators */}
              {activeModalTab === 'operators' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modalNewOperator}
                      onChange={(e) => setModalNewOperator(e.target.value)}
                      placeholder="New operator name / ID"
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOperator}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {formData.operators.map((op: string) => (
                      <div
                        key={op}
                        className="flex items-center justify-between p-2.5 border border-[#e2e8f0] rounded-lg bg-[#fafbfc] text-xs font-medium text-[#1e293b]"
                      >
                        <span>{op}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOperator(op)}
                          className="text-[#dc2626] hover:bg-red-50 p-1 rounded font-bold transition-colors cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
