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
  Trash2,
  Cpu,
  Zap,
  Filter,
  Settings,
  X,
} from 'lucide-react';
import { saveMultiplePcbaReports } from '../services/pcbaReportService';

export interface MIChargerDefectRecord {
  id: string;
  date: string;
  shift: string;
  product: string;
  model: string;
  fault: string;
  qty: number;
  operator: string;
  remarks: string;
  createdAt?: number;
}

export interface MILineChargerDefectEntryProps {
  lineName?: string;
  onNavigateToDatabase?: () => void;
}

// Reference data from the real MI_LINE (Charger).xlsx history
const DEFAULT_FORM_DATA = {
  shifts: ['Day', 'Night', 'General'],
  products: ['Charger', 'Adapter', 'TV', 'Toy', 'Ac', 'Fridge', 'LED'],
  productModels: {
    Charger: ['PCBA-OC05008RC', 'PCBA-OC05008RC(500mA)', 'WMC20000GI-BK(Charger 2A)'],
    Adapter: ['WFVADP12V2ASET200K_(CT-X017)', 'WFVADP12V2ASET200K_(CT-X018)'],
    TV: ['WD24RCS', 'WD-24R CS TV'],
    Toy: ['Akij Toy Controller V1.0', 'Common Toy Controller V1.0(Talukder)', 'Redmin Toy Controller'],
    Ac: ['FITE72WA-ER-22_ODU24k', 'Walton AC 12K INV IDU PCBA Model: MIVR35WA-W'],
    Fridge: ['MI Constant Fan Dimmer', 'MI-R-LED-RS-V04', 'MI-SC-PWR-Board V3.1'],
    LED: ['12W LED Driver', 'Elite Panel 30W CKD Driver'],
  } as Record<string, string[]>,
  operators: ['Rubel Hosen (37078)'],
  faults: [
    'Load Current (CC)-ATE',
    'Load Voltage (CV)-ATE',
    'Load Voltage (CV)-Aging',
    'Load Voltage (CV)-DC Load',
    'No Floating Voltage-ATE',
    'No Floating Voltage-Aging',
    'No Floating Voltage-DC Load',
    'Hi-Pot-ATE',
    'Sound Problem',
    'Gap Problem',
    'Housing Scratch & Spot',
    'Glue',
  ],
};

const STORAGE_KEY = 'mi_line_charger_defect_rows_v1';
const MASTER_LISTS_KEY = 'mi_line_charger_master_lists_v1';

export const MILineChargerDefectEntry: React.FC<MILineChargerDefectEntryProps> = ({
  lineName = 'MI Line - Charger',
  onNavigateToDatabase,
}) => {
  // Master lists state with localStorage persistence
  const [formData, setFormData] = useState<typeof DEFAULT_FORM_DATA>(() => {
    try {
      const saved = localStorage.getItem(MASTER_LISTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_FORM_DATA,
          ...parsed,
          productModels: {
            ...DEFAULT_FORM_DATA.productModels,
            ...(parsed.productModels || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_FORM_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(MASTER_LISTS_KEY, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  // Form state
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedShift, setSelectedShift] = useState(formData.shifts[0] || 'Day');
  const [selectedProduct, setSelectedProduct] = useState(formData.products[0] || 'Charger');
  const [selectedModel, setSelectedModel] = useState(
    formData.productModels['Charger']?.[1] || formData.productModels['Charger']?.[0] || ''
  );
  const [operator, setOperator] = useState(formData.operators[0] || '');
  const [remarks, setRemarks] = useState('');

  // Manage Lists Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'products' | 'models' | 'operators'>('products');
  const [modalNewProduct, setModalNewProduct] = useState('');
  const [modalSelectedProductForModel, setModalSelectedProductForModel] = useState(
    formData.products[0] || 'Charger'
  );
  const [modalNewModel, setModalNewModel] = useState('');
  const [modalNewOperator, setModalNewOperator] = useState('');

  // Fault quantities: faultName -> qty
  const [faultQuantities, setFaultQuantities] = useState<Record<string, number>>({});

  // Additional dynamic faults added in this session
  const [extraFaults, setExtraFaults] = useState<string[]>([]);
  const [otherFaultName, setOtherFaultName] = useState('');
  const [otherFaultQty, setOtherFaultQty] = useState('');

  // Submitting & Toast state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Rows state with local storage persistence
  const [rows, setRows] = useState<MIChargerDefectRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    // Seed with real rows from the uploaded sheet's recent history
    return [
      {
        id: 'seed-chg-1',
        date: '2026-08-18',
        shift: 'Day',
        product: 'Charger',
        model: 'PCBA-OC05008RC(500mA)',
        fault: 'Load Current (CC)-ATE',
        qty: 200,
        operator: 'Rubel Hosen (37078)',
        remarks: '',
      },
      {
        id: 'seed-chg-2',
        date: '2026-08-18',
        shift: 'Day',
        product: 'Charger',
        model: 'PCBA-OC05008RC(500mA)',
        fault: 'Sound Problem',
        qty: 25,
        operator: 'Rubel Hosen (37078)',
        remarks: '',
      },
      {
        id: 'seed-chg-3',
        date: '2026-08-18',
        shift: 'Day',
        product: 'Charger',
        model: 'PCBA-OC05008RC(500mA)',
        fault: 'Housing Scratch & Spot',
        qty: 38,
        operator: 'Rubel Hosen (37078)',
        remarks: '',
      },
      {
        id: 'seed-chg-4',
        date: '2026-07-22',
        shift: 'Day',
        product: 'Charger',
        model: 'PCBA-OC05008RC(500mA)',
        fault: 'Housing Scratch & Spot',
        qty: 248,
        operator: 'Rubel Hosen (37078)',
        remarks: '',
      },
      {
        id: 'seed-chg-5',
        date: '2026-06-17',
        shift: 'Day',
        product: 'Charger',
        model: 'PCBA-OC05008RC(500mA)',
        fault: 'Hi-Pot-ATE',
        qty: 106,
        operator: 'Rubel Hosen (37078)',
        remarks: '',
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      // storage full
    }
  }, [rows]);

  // Filters for Details Report
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedModel, setAppliedModel] = useState('');

  const handleApplyFilter = () => {
    setAppliedFrom(filterFrom);
    setAppliedTo(filterTo);
    setAppliedModel(filterModel);
  };

  const handleClearFilter = () => {
    setFilterFrom('');
    setFilterTo('');
    setFilterModel('');
    setAppliedFrom('');
    setAppliedTo('');
    setAppliedModel('');
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (appliedFrom && r.date < appliedFrom) return false;
      if (appliedTo && r.date > appliedTo) return false;
      if (appliedModel && r.model !== appliedModel) return false;
      return true;
    });
  }, [rows, appliedFrom, appliedTo, appliedModel]);

  // Combined faults list
  const allFaults = useMemo(() => {
    return [...formData.faults, ...extraFaults];
  }, [formData.faults, extraFaults]);

  // Sync model selection when product changes
  const handleProductChange = (prod: string) => {
    setSelectedProduct(prod);
    const availableModels = formData.productModels[prod] || [];
    setSelectedModel(availableModels[0] || '');
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

  // Manage Lists Handlers
  const handleAddProduct = () => {
    const prod = modalNewProduct.trim();
    if (!prod) return;
    if (formData.products.includes(prod)) {
      showToast('That product already exists.', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, prod],
      productModels: { ...prev.productModels, [prod]: [] },
    }));
    setModalNewProduct('');
    showToast(`Product "${prod}" added.`, 'success');
  };

  const handleDeleteProduct = (prod: string) => {
    setFormData((prev) => {
      const nextProducts = prev.products.filter((p) => p !== prod);
      const nextModels = { ...prev.productModels };
      delete nextModels[prod];
      return {
        ...prev,
        products: nextProducts,
        productModels: nextModels,
      };
    });
    if (selectedProduct === prod) {
      const remaining = formData.products.filter((p) => p !== prod);
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
    setFormData((prev) => ({
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
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      operators: updated,
    }));
    setOperator(op);
    setModalNewOperator('');
    showToast(`Operator "${op}" added and selected.`, 'success');
  };

  const handleDeleteOperator = (op: string) => {
    const remaining = formData.operators.filter((o) => o !== op);
    setFormData((prev) => ({
      ...prev,
      operators: remaining,
    }));
    if (operator === op) {
      setOperator(remaining[0] || '');
    }
    showToast(`Operator "${op}" removed.`, 'success');
  };

  // Handle quantity changes
  const handleFaultQtyChange = (faultName: string, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const num = parseInt(clean, 10);
    setFaultQuantities((prev) => {
      const copy = { ...prev };
      if (!clean || isNaN(num) || num <= 0) {
        delete copy[faultName];
      } else {
        copy[faultName] = num;
      }
      return copy;
    });
  };

  // Add custom fault
  const handleAddOtherFault = () => {
    const name = otherFaultName.trim();
    const qty = parseInt(otherFaultQty, 10);
    if (!name) {
      showToast('Enter a fault name first.', 'error');
      return;
    }
    if (!qty || isNaN(qty) || qty <= 0) {
      showToast('Enter a valid quantity.', 'error');
      return;
    }
    if (!allFaults.includes(name)) {
      setExtraFaults((prev) => [...prev, name]);
    }
    setFaultQuantities((prev) => ({ ...prev, [name]: qty }));
    setOtherFaultName('');
    setOtherFaultQty('');
    showToast(`Added fault "${name}" with quantity ${qty}.`, 'success');
  };

  // Summary counts
  const faultCount = Object.keys(faultQuantities).length;
  const totalQty = (Object.values(faultQuantities) as number[]).reduce((a, b) => a + b, 0);

  // Save Defect Data
  const handleSaveDefectData = async () => {
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
    if (faultCount === 0) {
      showToast('Enter at least one fault quantity before saving.', 'error');
      return;
    }
    if (!operator.trim()) {
      showToast('Enter the Operator name.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const pcbaPayload = (Object.entries(faultQuantities) as [string, number][]).map(([fName, q]) => ({
        date: selectedDate,
        shift: selectedShift,
        product: selectedProduct,
        model: selectedModel,
        line: lineName,
        type: 'Function' as const,
        desc: fName,
        qty: q,
        status: 'Open' as const,
        operator: operator.trim(),
        remarks: remarks.trim() || '—',
        source: 'MI Line Charger Entry',
      }));

      // Store in Firestore collection "pcba_reports"
      const savedIds = await saveMultiplePcbaReports(pcbaPayload);

      const newEntries: MIChargerDefectRecord[] = pcbaPayload.map((doc, idx) => ({
        id: (savedIds && savedIds[idx]) || `chg-${Date.now()}-${idx}`,
        date: doc.date,
        shift: doc.shift || selectedShift,
        product: doc.product || selectedProduct,
        model: doc.model,
        fault: doc.desc,
        qty: doc.qty,
        operator: doc.operator || operator.trim(),
        remarks: doc.remarks || remarks.trim(),
        createdAt: Date.now() + idx,
      }));

      setRows((prev) => [...newEntries, ...prev]);

      // Reset form while keeping common selections
      setFaultQuantities({});
      setRemarks('');

      showToast('PCBA Report Saved Successfully', 'success');
    } catch (err: any) {
      console.error('Failed to save to Firestore pcba_reports:', err);
      showToast('Failed to save PCBA report: ' + (err?.message || 'Database error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    showToast('Row deleted.', 'success');
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to download for this filter.', 'error');
      return;
    }

    const headers = ['Date', 'Shift', 'Product', 'Model', 'Faults', 'Qty', 'Operator', 'Remarks'];
    const csvRows = [headers.join(',')];

    filteredRows.forEach((r) => {
      const values = [r.date, r.shift, r.product, r.model, r.fault, r.qty, r.operator, r.remarks].map(
        (val) => {
          const str = String(val ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }
      );
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-line-charger-defects_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('CSV exported successfully.', 'success');
  };

  // Download/Print PDF
  const handleDownloadPdf = () => {
    if (filteredRows.length === 0) {
      showToast('No rows to download for this filter.', 'error');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-5 print:p-0">
      {/* Toast Notification */}
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

      {/* Top Banner & Header Bar */}
      <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-xl p-4 sm:p-5 shadow-sm border border-[#224b73] print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner">
              🔌
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight">{lineName} Defect Entry</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#bbf7d0] border border-[#16a34a]/40">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#b9c9dc] mt-0.5">
                PCBA Functional &amp; Cosmetic Fault Inspection — Charger Line
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
              id="btn-manage-lists-charger"
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
          <span className="text-[#2563eb]">📋</span>
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
              {formData.shifts.map((s) => (
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
              {formData.products.map((p) => (
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
                (formData.productModels[selectedProduct] || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </section>

      {/* CARD 2: Faults (2-Column Grid matching HTML) */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#1e293b] text-sm">
            <span className="text-amber-500">⚠️</span>
            <span>Faults</span>
          </div>
          {faultCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb]">
              {faultCount} selected
            </span>
          )}
        </div>

        {/* Operator sub-bar */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="operatorInput"
            className="text-xs font-bold text-[#475569] uppercase tracking-wider"
          >
            Operator
          </label>
          <div className="w-full sm:w-72">
            <select
              id="operatorInput"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none bg-white cursor-pointer"
            >
              {formData.operators.length === 0 ? (
                <option value="">No operators yet — add via ⚙ Manage Lists</option>
              ) : (
                <>
                  <option value="">Select Operator…</option>
                  {formData.operators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Grid of Faults (2-column layout) */}
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {allFaults.map((fName) => {
              const qty = faultQuantities[fName] || '';
              const hasVal = Boolean(qty);
              return (
                <div
                  key={fName}
                  className={`flex items-center justify-between p-2.5 px-3 rounded-lg border transition-all ${
                    hasVal
                      ? 'border-[#2563eb] bg-[#f5f8ff] shadow-xs'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <span className="text-sm font-medium text-[#1e293b] truncate pr-2">
                    {fName}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => handleFaultQtyChange(fName, e.target.value)}
                    placeholder="0"
                    className="w-20 py-1 px-2 text-center text-sm font-semibold border border-[#cbd5e1] rounded-lg bg-white text-[#1e293b] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Add custom fault */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-dashed border-[#e2e8f0]">
            <input
              type="text"
              value={otherFaultName}
              onChange={(e) => setOtherFaultName(e.target.value)}
              placeholder="+ Add a fault not listed above"
              className="flex-1 min-w-[220px] px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <input
              type="number"
              min="1"
              value={otherFaultQty}
              onChange={(e) => setOtherFaultQty(e.target.value)}
              placeholder="Qty"
              className="w-24 px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-center font-bold text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <button
              type="button"
              onClick={handleAddOtherFault}
              className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* CARD 3: Remarks */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2 font-bold text-[#1e293b] text-sm">
          <span>📝</span>
          <span>Remarks (optional)</span>
        </div>
        <div className="p-5">
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional notes for this entry…"
            className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none resize-y"
          />
        </div>
      </section>

      {/* CARD 4: Details Report Preview */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:m-0 print:border-none">
        <div className="p-4 sm:p-5 bg-[#0f2942] text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📄</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold">Details Report — MI Line (Charger)</h2>
              <span className="text-xs text-[#9fb0d6]">
                {filteredRows.length} row{filteredRows.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Date & Model Filter Controls */}
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
              <span className="text-[#cbd5e1] font-semibold">Model</span>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="bg-white text-[#1e293b] rounded px-2 py-0.5 text-xs font-semibold outline-none"
              >
                <option value="">All</option>
                {(Object.values(formData.productModels) as string[][]).flat().map((m, i) => (
                  <option key={`${m}-${i}`} value={m}>
                    {m}
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
          <h1 className="text-xl font-bold">MI Line (Charger) — Details Report</h1>
          <p className="text-xs text-gray-600">
            Date range: {appliedFrom || '(all)'} to {appliedTo || '(all)'} • Model:{' '}
            {appliedModel || '(all)'} • {filteredRows.length} row(s) • Generated{' '}
            {new Date().toLocaleString()}
          </p>
        </div>

        {/* Scrollable Table Preview with Delete option */}
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f1f5f9] text-[#475569] font-bold sticky top-0 z-10 border-b border-[#e2e8f0]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Shift</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Product</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Faults</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Operator</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Remarks</th>
                <th className="py-2.5 px-3 whitespace-nowrap print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#1e293b]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-[#94a3b8]">
                    No rows yet — fill in the form above and click Save to see rows appear here.
                  </td>
                </tr>
              ) : (
                filteredRows.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap font-medium">{rec.date}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{rec.shift}</td>
                    <td className="py-2 px-3 whitespace-nowrap font-semibold">{rec.product}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{rec.model}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-semibold text-[#dc2626]">{rec.fault}</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-sm text-[#0f2942]">
                      {rec.qty}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{rec.operator}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Save Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] py-3.5 px-5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 z-20 print:hidden">
        <div className="text-sm font-medium text-[#64748b]">
          {faultCount === 0 ? (
            <span>No faults entered yet</span>
          ) : (
            <span>
              <strong className="text-[#0f2942]">{faultCount}</strong> fault type
              {faultCount > 1 ? 's' : ''} (<strong className="text-[#2563eb]">{totalQty} pcs</strong>) will be saved as{' '}
              <strong className="text-[#0f2942]">{faultCount}</strong> row{faultCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-save-charger-defect"
          disabled={faultCount === 0 || isSubmitting}
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

      {/* Hidden print area for window.print() */}
      <div id="printArea" className="hidden print:block">
        <h2 className="text-xl font-bold mb-1">MI Line (Charger) — Details Report</h2>
        <div className="text-xs text-gray-600 mb-4">
          Date range: {appliedFrom || '(all)'} to {appliedTo || '(all)'} • {filteredRows.length} row(s) • Generated {new Date().toLocaleString()}
        </div>
        <table className="w-full text-xs border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 p-1 text-left">Date</th>
              <th className="border border-gray-400 p-1 text-left">Shift</th>
              <th className="border border-gray-400 p-1 text-left">Product</th>
              <th className="border border-gray-400 p-1 text-left">Model</th>
              <th className="border border-gray-400 p-1 text-left">Faults</th>
              <th className="border border-gray-400 p-1 text-left">Qty</th>
              <th className="border border-gray-400 p-1 text-left">Operator</th>
              <th className="border border-gray-400 p-1 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td className="border border-gray-400 p-1">{r.date}</td>
                <td className="border border-gray-400 p-1">{r.shift}</td>
                <td className="border border-gray-400 p-1">{r.product}</td>
                <td className="border border-gray-400 p-1">{r.model}</td>
                <td className="border border-gray-400 p-1 font-semibold">{r.fault}</td>
                <td className="border border-gray-400 p-1 font-bold">{r.qty}</td>
                <td className="border border-gray-400 p-1">{r.operator}</td>
                <td className="border border-gray-400 p-1">{r.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
