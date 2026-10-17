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
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { saveMultiplePcbaReports } from '../services/pcbaReportService';
import { MI_LINE_01_DEFECT_RECORDS } from '../data/miLine01Records';

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

// Default aesthetic fault categories specifically for MI Line-01 section as requested by user
export const MI_LINE_01_AESTHETIC_FAULTS = [
  'Missing',
  'Wrong Component',
  'Polarity Change',
  'Dry Solder',
  'Over Lead',
  'Solder Short',
  'Leg Down',
  'Leg Open',
  'Hole Block',
  'Pad Lift Off',
  'PCBA Scratch',
  'Broken',
  'Cutting Problem',
  'Wrong Position',
];

export const MI_LINE_01_FUNCTIONAL_FAULTS = [
  'No Power',
  'Hang',
  'PCB overheating',
  'Button not work',
  'Output voltage unstable(Fan)',
  'Transformer noise(Fan)',
  'Fuse failure(Fan)',
  'Speed control failure(Fan)',
  'Remote control malfunction(Fan)',
  'Timer function abnormal(Fan)',
  'LED display failure(Fan)',
  'Abnormal motor operation(Fan)',
  'FCT fail(AC)',
  'Functional jig test(AC)',
  'LED Not Work',
  'Speaker not work',
  'Speaker Low sound',
  'Switch problem',
  'Switch keypad not work',
  'Wrong music',
];

const DEFAULT_AESTHETIC_FAULTS = MI_LINE_01_AESTHETIC_FAULTS;
const DEFAULT_FUNCTIONAL_FAULTS = MI_LINE_01_FUNCTIONAL_FAULTS;

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
  aesthetics: MI_LINE_01_AESTHETIC_FAULTS,
  functionals: MI_LINE_01_FUNCTIONAL_FAULTS,
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
  const isMILine01 = lineName === 'MI Line-01';

  // Master Data state with local persistence
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(masterDataKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          aesthetics: isMILine01 ? MI_LINE_01_AESTHETIC_FAULTS : (parsed.aesthetics || DEFAULT_AESTHETIC_FAULTS),
          functionals: isMILine01 ? MI_LINE_01_FUNCTIONAL_FAULTS : (parsed.functionals || DEFAULT_FUNCTIONAL_FAULTS),
        };
      }
    } catch {
      // ignore
    }
    return {
      ...DEFAULT_FORM_DATA,
      aesthetics: isMILine01 ? MI_LINE_01_AESTHETIC_FAULTS : DEFAULT_AESTHETIC_FAULTS,
      functionals: isMILine01 ? MI_LINE_01_FUNCTIONAL_FAULTS : DEFAULT_FUNCTIONAL_FAULTS,
    };
  });

  // Ensure MI Line-01 always stays synchronized with user-specified Aesthetic & Functional categories
  useEffect(() => {
    if (isMILine01) {
      setFormData((prev) => {
        const isAesSame =
          prev.aesthetics.length === MI_LINE_01_AESTHETIC_FAULTS.length &&
          prev.aesthetics.every((val, idx) => val === MI_LINE_01_AESTHETIC_FAULTS[idx]);
        const isFuncSame =
          prev.functionals.length === MI_LINE_01_FUNCTIONAL_FAULTS.length &&
          prev.functionals.every((val, idx) => val === MI_LINE_01_FUNCTIONAL_FAULTS[idx]);
        if (isAesSame && isFuncSame) return prev;
        return {
          ...prev,
          aesthetics: MI_LINE_01_AESTHETIC_FAULTS,
          functionals: MI_LINE_01_FUNCTIONAL_FAULTS,
        };
      });
    }
  }, [isMILine01]);

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch {
      // ignore
    }
    // If MI Line-01, seed with official 2,610 sheet records
    if (lineName === 'MI Line-01' && Array.isArray(MI_LINE_01_DEFECT_RECORDS) && MI_LINE_01_DEFECT_RECORDS.length > 0) {
      return MI_LINE_01_DEFECT_RECORDS.map((r, i) => {
        const isFunc = [
          'No Power', 'Display Fail', 'Audio Fail', 'Low Voltage',
          'Frequency Fail', 'LED Off', 'Sensor Fail', 'Charge Fail', 'Signal Fail'
        ].includes(r.fault);
        return {
          id: r.id || `mi01-rec-${i + 1}`,
          line: r.line || lineName,
          date: r.date,
          shift: r.shift,
          product: r.product,
          model: r.model,
          aesthetic: isFunc ? '' : r.fault,
          func: isFunc ? r.fault : '',
          qty: Number(r.qty) || 1,
          operator: r.operator || 'Md. Rony Khan(14873)',
          remarks: r.remarks || '',
          createdAt: r.createdAt || (Date.now() - (2610 - i) * 60000),
        };
      });
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

  // Report Date Filters & Multi-dimensional Search
  const [reportSearch, setReportSearch] = useState('');
  const [reportShiftFilter, setReportShiftFilter] = useState('ALL');
  const [reportProductFilter, setReportProductFilter] = useState('ALL');
  const [reportModelFilter, setReportModelFilter] = useState('ALL');
  const [reportTypeFilter, setReportTypeFilter] = useState<'ALL' | 'Aesthetic' | 'Function'>('ALL');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  // Pagination for Details Report
  const [reportPage, setReportPage] = useState(1);
  const [reportPageSize, setReportPageSize] = useState(25);

  const handleApplyFilter = () => {
    setAppliedFrom(filterFrom);
    setAppliedTo(filterTo);
  };

  const handleClearAllReportFilters = () => {
    setFilterFrom('');
    setFilterTo('');
    setAppliedFrom('');
    setAppliedTo('');
    setReportSearch('');
    setReportShiftFilter('ALL');
    setReportProductFilter('ALL');
    setReportModelFilter('ALL');
    setReportTypeFilter('ALL');
    setReportPage(1);
    showToast('Filters cleared.', 'success');
  };
  const handleClearFilter = handleClearAllReportFilters;

  const distinctReportProducts = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.product && s.add(r.product));
    return Array.from(s).sort();
  }, [records]);

  const distinctReportModels = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (reportProductFilter === 'ALL' || r.product === reportProductFilter) {
        if (r.model) s.add(r.model);
      }
    });
    return Array.from(s).sort();
  }, [records, reportProductFilter]);

  const distinctReportShifts = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => r.shift && s.add(r.shift));
    return Array.from(s).sort();
  }, [records]);

  // Filtered records for table
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (appliedFrom && r.date < appliedFrom) return false;
      if (appliedTo && r.date > appliedTo) return false;
      if (reportShiftFilter !== 'ALL' && r.shift !== reportShiftFilter) return false;
      if (reportProductFilter !== 'ALL' && r.product !== reportProductFilter) return false;
      if (reportModelFilter !== 'ALL' && r.model !== reportModelFilter) return false;
      if (reportTypeFilter === 'Aesthetic' && !r.aesthetic) return false;
      if (reportTypeFilter === 'Function' && !r.func) return false;

      if (reportSearch.trim()) {
        const q = reportSearch.toLowerCase();
        const match =
          r.model.toLowerCase().includes(q) ||
          r.product.toLowerCase().includes(q) ||
          (r.aesthetic && r.aesthetic.toLowerCase().includes(q)) ||
          (r.func && r.func.toLowerCase().includes(q)) ||
          (r.operator && r.operator.toLowerCase().includes(q)) ||
          (r.remarks && r.remarks.toLowerCase().includes(q)) ||
          r.date.includes(q) ||
          r.shift.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    records,
    appliedFrom,
    appliedTo,
    reportShiftFilter,
    reportProductFilter,
    reportModelFilter,
    reportTypeFilter,
    reportSearch,
  ]);

  // Stats computed from filtered records
  const reportStats = useMemo(() => {
    const totalQty = filteredRecords.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
    const aestheticQty = filteredRecords.reduce(
      (sum, r) => (r.aesthetic ? sum + (Number(r.qty) || 0) : sum),
      0
    );
    const functionalQty = filteredRecords.reduce(
      (sum, r) => (r.func ? sum + (Number(r.qty) || 0) : sum),
      0
    );
    const uniqueDates = new Set(filteredRecords.map((r) => r.date)).size;
    const uniqueModels = new Set(filteredRecords.map((r) => r.model)).size;
    return {
      totalQty,
      aestheticQty,
      functionalQty,
      uniqueDates,
      uniqueModels,
    };
  }, [filteredRecords]);

  // Reset pagination on filter change
  useEffect(() => {
    setReportPage(1);
  }, [
    appliedFrom,
    appliedTo,
    reportShiftFilter,
    reportProductFilter,
    reportModelFilter,
    reportTypeFilter,
    reportSearch,
    reportPageSize,
  ]);

  const totalReportPages = Math.max(1, Math.ceil(filteredRecords.length / reportPageSize));
  const paginatedReportRows = useMemo(() => {
    const start = (reportPage - 1) * reportPageSize;
    return filteredRecords.slice(start, start + reportPageSize);
  }, [filteredRecords, reportPage, reportPageSize]);

  const handleResetLineMasterData = () => {
    if (lineName === 'MI Line-01' && Array.isArray(MI_LINE_01_DEFECT_RECORDS)) {
      if (window.confirm('Reset all records to the official MI Line-01 inspection dataset (2,610 records)?')) {
        const fresh = MI_LINE_01_DEFECT_RECORDS.map((r, i) => {
          const isFunc = [
            'No Power', 'Display Fail', 'Audio Fail', 'Low Voltage',
            'Frequency Fail', 'LED Off', 'Sensor Fail', 'Charge Fail', 'Signal Fail'
          ].includes(r.fault);
          return {
            id: r.id || `mi01-rec-${i + 1}`,
            line: r.line || lineName,
            date: r.date,
            shift: r.shift,
            product: r.product,
            model: r.model,
            aesthetic: isFunc ? '' : r.fault,
            func: isFunc ? r.fault : '',
            qty: Number(r.qty) || 1,
            operator: r.operator || 'Md. Rony Khan(14873)',
            remarks: r.remarks || '',
            createdAt: r.createdAt || (Date.now() - (2610 - i) * 60000),
          };
        });
        setRecords(fresh);
        localStorage.removeItem(lineStorageKey);
        showToast('Reset to official 2,610 MI Line-01 records.', 'success');
      }
    } else {
      showToast('Master dataset reset available for MI Line-01.', 'error');
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to remove this defect record?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('Record deleted.', 'success');
    }
  };

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

  // Aesthetics list - strictly enforce user-specified categories for MI Line-01
  const allAesthetics = useMemo(() => {
    if (isMILine01) {
      return [
        ...MI_LINE_01_AESTHETIC_FAULTS,
        ...extraAesthetics.filter((e) => !MI_LINE_01_AESTHETIC_FAULTS.includes(e)),
      ];
    }
    return [...formData.aesthetics, ...extraAesthetics];
  }, [isMILine01, formData.aesthetics, extraAesthetics]);

  // Functionals list - strictly enforce user-specified categories for MI Line-01
  const allFunctionals = useMemo(() => {
    if (isMILine01) {
      return [
        ...MI_LINE_01_FUNCTIONAL_FAULTS,
        ...extraFunctionals.filter((e) => !MI_LINE_01_FUNCTIONAL_FAULTS.includes(e)),
      ];
    }
    return [...formData.functionals, ...extraFunctionals];
  }, [isMILine01, formData.functionals, extraFunctionals]);

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

    try {
      const pcbaPayload: any[] = [];

      // Aesthetic rows
      (Object.entries(aestheticQuantities) as [string, number][]).forEach(([name, qty]) => {
        pcbaPayload.push({
          line: lineName,
          date: selectedDate,
          shift: selectedShift,
          product: selectedProduct,
          model: selectedModel,
          type: 'Aesthetic' as const,
          desc: name,
          qty,
          status: 'Open' as const,
          operator: aestheticOperator.trim(),
          remarks: remarks.trim() || '—',
          source: 'MI Line Defect Entry',
        });
      });

      // Functional rows
      (Object.entries(functionalQuantities) as [string, number][]).forEach(([name, qty]) => {
        pcbaPayload.push({
          line: lineName,
          date: selectedDate,
          shift: selectedShift,
          product: selectedProduct,
          model: selectedModel,
          type: 'Function' as const,
          desc: name,
          qty,
          status: 'Open' as const,
          operator: functionalOperator.trim(),
          remarks: remarks.trim() || '—',
          source: 'MI Line Defect Entry',
        });
      });

      // Store defect records in Firestore collection "pcba_reports"
      const savedIds = await saveMultiplePcbaReports(pcbaPayload);

      const newEntries: MIDefectRecord[] = pcbaPayload.map((doc, index) => ({
        id: (savedIds && savedIds[index]) || `mi-${Date.now()}-${index}`,
        line: doc.line,
        date: doc.date,
        shift: doc.shift || selectedShift,
        product: doc.product || selectedProduct,
        model: doc.model,
        aesthetic: doc.type === 'Aesthetic' ? doc.desc : '',
        func: doc.type === 'Function' ? doc.desc : '',
        qty: doc.qty,
        operator: doc.operator || (doc.type === 'Aesthetic' ? aestheticOperator : functionalOperator),
        remarks: doc.remarks || remarks.trim(),
        createdAt: Date.now() + index,
      }));

      setRecords((prev) => [...newEntries, ...prev]);

      // Reset defect inputs while keeping common info
      setAestheticQuantities({});
      setFunctionalQuantities({});
      setRemarks('');

      showToast('PCBA Report Saved Successfully', 'success');
    } catch (err: any) {
      console.error('Failed to save to Firestore pcba_reports:', err);
      showToast('Failed to save PCBA report: ' + (err?.message || 'Database error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Download
  const handleDownloadCsv = () => {
    if (filteredRecords.length === 0) {
      showToast('No rows to download for current filters.', 'error');
      return;
    }

    const headers = [
      'SL',
      'Date',
      'Line',
      'Shift',
      'Product',
      'Model',
      'Aesthetic Defect',
      'Functional Defect',
      'Quantity (pcs)',
      'Operator',
      'Remarks',
    ];
    const csvRows = [headers.join(',')];

    filteredRecords.forEach((r, idx) => {
      const values = [
        idx + 1,
        r.date,
        r.line,
        r.shift,
        r.product,
        r.model,
        r.aesthetic || '',
        r.func || '',
        r.qty,
        r.operator,
        r.remarks || '',
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
    a.download = `${lineName.replace(/\s+/g, '_').toLowerCase()}_details_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredRecords.length.toLocaleString()} records to CSV.`, 'success');
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
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0f2942] via-[#1e3a8a] to-[#2563eb] border-b border-[#1e3a8a] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-sm text-white">
            <div className="w-7 h-7 rounded-lg bg-white/15 text-white flex items-center justify-center backdrop-blur-xs shadow-xs border border-white/20">
              <FileText className="w-4 h-4 text-blue-100" />
            </div>
            <span className="text-white font-extrabold text-[15px] tracking-wide">
              Common Information
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
            Production Setup
          </span>
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
        {/* Card Header with vibrant Purple gradient */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#6b21a8] via-[#7e22ce] to-[#9333ea] border-b border-[#581c87] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center backdrop-blur-xs shadow-xs border border-white/20">
              <Palette className="w-4 h-4 text-purple-100" />
            </div>
            <span className="text-white font-extrabold text-[15px] tracking-wide">
              Aesthetic Defects
            </span>
          </div>
          {aestheticCount > 0 ? (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-white text-[#7e22ce] shadow-xs">
              {aestheticCount} selected
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-purple-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              Visual Inspection
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
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allAesthetics.map((defect) => {
              const qty = aestheticQuantities[defect] || '';
              const hasVal = Boolean(qty);
              return (
                <div
                  key={defect}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                    hasVal
                      ? 'border-[#2563eb] bg-gradient-to-r from-[#eff6ff] to-white shadow-xs ring-1 ring-[#2563eb]/20'
                      : 'border-[#e2e8f0] bg-white hover:border-[#93c5fd] hover:bg-[#fafbfc]'
                  }`}
                >
                  <div className="flex items-center truncate pr-2">
                    <span
                      className={`text-xs font-bold truncate transition-colors ${
                        hasVal ? 'text-[#1e40af]' : 'text-[#1e293b] group-hover:text-[#2563eb]'
                      }`}
                      title={defect}
                    >
                      {defect}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasVal && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(String(qty), 10) || 0;
                          handleAestheticQtyChange(defect, current > 1 ? String(current - 1) : '');
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 cursor-pointer transition-colors"
                        title="Decrease"
                      >
                        -
                      </button>
                    )}
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={qty}
                      onChange={(e) => handleAestheticQtyChange(defect, e.target.value)}
                      placeholder="0"
                      className={`w-14 py-1 px-1.5 text-center text-sm font-black border rounded-lg outline-none transition-all ${
                        hasVal
                          ? 'border-[#2563eb] bg-white text-[#1e40af] ring-1 ring-[#2563eb]'
                          : 'border-[#cbd5e1] bg-white text-[#1e293b] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(String(qty), 10) || 0;
                        handleAestheticQtyChange(defect, String(current + 1));
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-gray-500 hover:text-[#2563eb] hover:bg-blue-50 border border-gray-200 cursor-pointer transition-colors"
                      title="Increase (+1)"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CARD 3: Functional Defects */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden print:hidden">
        {/* Card Header with vibrant Teal/Cyan gradient */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-[#06b6d4] border-b border-[#115e59] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center backdrop-blur-xs shadow-xs border border-white/20">
              <Wrench className="w-4 h-4 text-teal-100" />
            </div>
            <span className="text-white font-extrabold text-[15px] tracking-wide">
              Functional Defects
            </span>
          </div>
          {functionalCount > 0 ? (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-white text-[#0f766e] shadow-xs">
              {functionalCount} selected
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              Functional Test
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
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allFunctionals.map((defect) => {
              const qty = functionalQuantities[defect] || '';
              const hasVal = Boolean(qty);
              return (
                <div
                  key={defect}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                    hasVal
                      ? 'border-[#2563eb] bg-gradient-to-r from-[#eff6ff] to-white shadow-xs ring-1 ring-[#2563eb]/20'
                      : 'border-[#e2e8f0] bg-white hover:border-[#93c5fd] hover:bg-[#fafbfc]'
                  }`}
                >
                  <div className="flex items-center truncate pr-2">
                    <span
                      className={`text-xs font-bold truncate transition-colors ${
                        hasVal ? 'text-[#1e40af]' : 'text-[#1e293b] group-hover:text-[#2563eb]'
                      }`}
                      title={defect}
                    >
                      {defect}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasVal && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(String(qty), 10) || 0;
                          handleFunctionalQtyChange(defect, current > 1 ? String(current - 1) : '');
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 cursor-pointer transition-colors"
                        title="Decrease"
                      >
                        -
                      </button>
                    )}
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={qty}
                      onChange={(e) => handleFunctionalQtyChange(defect, e.target.value)}
                      placeholder="0"
                      className={`w-14 py-1 px-1.5 text-center text-sm font-black border rounded-lg outline-none transition-all ${
                        hasVal
                          ? 'border-[#2563eb] bg-white text-[#1e40af] ring-1 ring-[#2563eb]'
                          : 'border-[#cbd5e1] bg-white text-[#1e293b] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(String(qty), 10) || 0;
                        handleFunctionalQtyChange(defect, String(current + 1));
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-gray-500 hover:text-[#2563eb] hover:bg-blue-50 border border-gray-200 cursor-pointer transition-colors"
                      title="Increase (+1)"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom functional defect */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-dashed border-[#e2e8f0]">
            <input
              type="text"
              value={functionalOtherName}
              onChange={(e) => setFunctionalOtherName(e.target.value)}
              placeholder="+ Add a custom functional defect..."
              className="flex-1 min-w-[200px] px-3.5 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#1e293b] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
            />
            <input
              type="number"
              min="1"
              value={functionalOtherQty}
              onChange={(e) => setFunctionalOtherQty(e.target.value)}
              placeholder="Qty"
              className="w-20 px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-center font-bold text-[#1e293b] focus:border-[#2563eb] outline-none"
            />
            <button
              type="button"
              onClick={handleAddFunctionalOther}
              className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              Add Defect
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
      <section className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden print:m-0 print:border-none">
        {/* Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0f2942] via-[#14375a] to-[#0f2942] text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-xs shrink-0">
                📄
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white m-0">
                Details Report — {lineName}
              </h2>
            </div>

            {/* Quick Actions (Export, Print, Reset) */}
            <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Download Filtered CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-300" />
                <span>Print</span>
              </button>

              {lineName === 'MI Line-01' && (
                <button
                  type="button"
                  onClick={handleResetLineMasterData}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Reset to 2,610 records from MI Line-01 Sheet"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Reset Sheet</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-[280px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Search model, defect, operator..."
                className="w-full bg-white border border-[#cbd5e1] focus:border-[#2563eb] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#1e293b] outline-none"
              />
            </div>

            {/* Shift Filter */}
            <select
              value={reportShiftFilter}
              onChange={(e) => setReportShiftFilter(e.target.value)}
              className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs text-[#1e293b] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Shifts</option>
              {distinctReportShifts.map((s) => (
                <option key={s} value={s}>{s} Shift</option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={reportProductFilter}
              onChange={(e) => {
                setReportProductFilter(e.target.value);
                setReportModelFilter('ALL');
              }}
              className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs text-[#1e293b] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Products</option>
              {distinctReportProducts.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Model Filter */}
            <select
              value={reportModelFilter}
              onChange={(e) => setReportModelFilter(e.target.value)}
              className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs text-[#1e293b] font-medium outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL">All Models</option>
              {distinctReportModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Defect Type Filter */}
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value as any)}
              className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs text-[#1e293b] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Defect Types</option>
              <option value="Aesthetic">Aesthetic Only</option>
              <option value="Function">Function Only</option>
            </select>
          </div>

          {/* Date Filter & Clear */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] px-2 py-1 rounded-lg">
              <span className="text-gray-400 text-[11px]">From</span>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="text-xs text-[#1e293b] outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] px-2 py-1 rounded-lg">
              <span className="text-gray-400 text-[11px]">To</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="text-xs text-[#1e293b] outline-none"
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
              onClick={handleClearAllReportFilters}
              className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f1f5f9] text-[#475569] font-bold border-b border-[#e2e8f0]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap w-12 text-center">SL</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Shift</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Product</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Aesthetic Defect</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Functional Defect</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Operator</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Remarks</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center w-14 print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#1e293b]">
              {paginatedReportRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sm text-[#94a3b8]">
                    No defect records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedReportRows.map((rec, idx) => {
                  const sl = (reportPage - 1) * reportPageSize + idx + 1;
                  return (
                    <tr key={rec.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-gray-400 font-bold">
                        {sl}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-[#0f172a]">
                        {rec.date}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                            rec.shift === 'Day'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {rec.shift}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-700 px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[11px]">
                          {rec.product}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#0f2942]">
                        {rec.model}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {rec.aesthetic ? (
                          <span className="font-bold text-[#dc2626] bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11.5px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {rec.aesthetic}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {rec.func ? (
                          <span className="font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11.5px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {rec.func}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-center font-mono font-bold text-sm">
                        <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {rec.qty}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                        {rec.operator}
                      </td>
                      <td className="py-2 px-3 text-[#64748b] max-w-[180px] truncate" title={rec.remarks}>
                        {rec.remarks || '-'}
                      </td>
                      <td className="py-2 px-3 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-white border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3 text-gray-500">
            <span>
              Showing{' '}
              <strong className="text-gray-800">
                {filteredRecords.length === 0 ? 0 : (reportPage - 1) * reportPageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-gray-800">
                {Math.min(reportPage * reportPageSize, filteredRecords.length)}
              </strong>{' '}
              of <strong className="text-gray-800">{filteredRecords.length.toLocaleString()}</strong> rows
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={reportPageSize}
                onChange={(e) => setReportPageSize(Number(e.target.value))}
                className="bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-700 outline-none cursor-pointer"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={reportPage === 1}
              onClick={() => setReportPage(1)}
              className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
            >
              First
            </button>
            <button
              type="button"
              disabled={reportPage === 1}
              onClick={() => setReportPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-bold text-gray-700">
              Page {reportPage} of {totalReportPages}
            </span>
            <button
              type="button"
              disabled={reportPage === totalReportPages}
              onClick={() => setReportPage((p) => Math.min(totalReportPages, p + 1))}
              className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={reportPage === totalReportPages}
              onClick={() => setReportPage(totalReportPages)}
              className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
            >
              Last
            </button>
          </div>
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
