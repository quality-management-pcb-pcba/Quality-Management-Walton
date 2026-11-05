import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Settings,
  Database,
  X,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Save,
  Home,
  Layers,
  ChevronDown,
  ChevronRight,
  Menu,
  AlertOctagon,
  TrendingDown,
  Plus,
  Trash2,
  Printer,
  Download,
  Search,
  FileSpreadsheet,
  Check,
  CheckCircle,
} from 'lucide-react';
import { WaltonSealLogo } from './WaltonSealLogo';
import {
  PcbQualityRecord,
  createPcbRecord,
  updatePcbRecord,
  deletePcbRecord,
  subscribePcbRecords,
  seedBaselinePcbRecordsIfEmpty,
} from '../services/pcbRecords';
import { INITIAL_PCB_VISUAL_RECORDS } from '../data/pcbVisualRecords';
import { INITIAL_PCB_AOI_RECORDS } from '../data/pcbAoiRecords';
import { INITIAL_PCB_RECEIVE_RECORDS } from '../data/pcbReceiveRecords';
import { INITIAL_PCB_DELIVERY_RECORDS } from '../data/pcbDeliveryRecords';
import {
  PcbRejectionRecord,
  INITIAL_PCB_REJECTION_RECORDS,
  getInitialPcbRejectionRecords,
  savePcbRejectionRecords,
} from '../data/pcbRejectionRecords';

export interface PCBQualityDataEntryPortalProps {
  onClose: () => void;
  onNavigateHome?: () => void;
  initialGate?: 'FQC' | 'AOI' | 'ETEST';
  initialNav?: 'report-entry' | 'defect-entry';
  initialSheet?: 'visual' | 'aoi' | 'receive' | 'delivery' | 'home' | 'database' | 'rejection';
  initialLine?: string;
}

type SheetKey = 'visual' | 'aoi' | 'receive' | 'delivery';
type PageKey = 'home' | 'database' | 'rejection' | SheetKey;

interface PageConfig {
  name: string;
  badge: string;
  badgeClass: string;
  cols: string[];
  req: string[];
  storageKey: string;
  hint?: string;
}

const MODELS: string[] = [
  '0.5 Feet Double Pad',
  '1 Feet DTDL',
  '12V DC+ Deep',
  '12VDC Square LED',
  '17" LPF SMD Fan',
  '2 Feet 20W',
  '4 Feet (2P50C)',
  '4 Feet (40W DTDL)',
  'A8E4-138-R16 (XPC)',
  'Advance Trading',
  'Akij Button',
  'Akij Toy Controller-V1.0',
  'Arat Technology AR2',
  'BJIT Safpro',
  'Battery Changeable',
  'Battery changeable PCB-12W',
  'Beverage Cooler (337)',
  'Beverage Cooler L290-V3',
  'CFL_V07',
  'Cherger Controller',
  'Common Toy LED Controller (Talukder)',
  'Common Toy LED Driver (Akij)',
  'Common Toy LED Driver (Talukder)',
  'Dissolve Display',
  'Dutch IPS',
  'Dutch IPS PCB',
  'EPS-Power IPS',
  'Electronic Thermostat V2',
  'FC Panel (RFPL-619L)',
  'Fiona M2',
  'Fiona WH138 V1.2.2',
  'Frost Controller with Indicator',
  'Garber N 9721',
  'Genarel IPS 8 mos',
  'General IPS',
  'General IPS HIP 4082 & F26LCD',
  'Gerber N9721 Sohag',
  'Glory + Luxur',
  'Golden Wheel Controller',
  'Golden Wheel Toy Controller',
  'HN Power Sukam',
  'Happy Walker V-NC-1 (RFL)',
  'IOT SCDIS With Indicator',
  'Ionizer Blue',
  'Ionizer LED (RPIL 619L)',
  'Ionizer LED (SBS 656)',
  'KHI 12/24 Sinewave',
  'Keya Home IPS',
  'Keya Homes IPS',
  'Ligal Power',
  'Ligal Power Ips',
  'Ma Electronics',
  'Masudur Key Pad',
  'Mobile Charger 2A',
  'Mobile Charger 500mA',
  'Modern Power',
  'Modern Power IPS',
  'Moon Light PCB-0.5w',
  'Multi 3 Model',
  'Multi 3 Model Compressor & Freeze',
  'Multi 3Model GAS DIP+SNM+Low',
  'Multi 3Model IPS',
  'Multi 6 Model',
  'Multi ARFA+General IPS+TSK Power',
  'Multi Gardian Masadur+Shahinur+SW+Gerber N9721(sohag)',
  'Multi HN Dsp',
  'Multi RH-M1&RH-M2',
  'Multi Robin 2 Model',
  'Multi Sun Power Model-1 & GILDAN_HMI',
  'Multi sun power gardian',
  'PC Panel (RPPL-619L)',
  'Piano P1-V1.2',
  'R-LED-PCCL',
  'RL-RS35-V04',
  'Redmin Toy Controller',
  'Reed Sensor',
  'Remote New',
  'Rice Cooker',
  'Rotary Step Switch',
  'SBS 656 (RPDHL+RFDHL)',
  'SBS-RFPL 619L',
  'SC DIS-with Indicator',
  'SC Power Board',
  'SK 200111',
  'SK Alif Elections',
  'SK Alif Sukam',
  'SK PS 22 M1',
  'SK PS 22 M2',
  'SK-Alif Electronics(SK200903+4+5+6)',
  'SMPS US V3',
  'SNM',
  'SP 12W Round',
  'SS 22',
  'ST010 EPAC',
  'Safety Plus-1725',
  'Samcon',
  'Samcon B-0966',
  'Samcon B-9762',
  'Samcon B-9766',
  'Samcon B-9889',
  'Smart Controller',
  'Smile & Micky (RFL)',
  'Smps Us small',
  'Solar (2912)',
  'Spot Down 7W LED',
  'Spot Down 7W round',
  'Square LED (RLSS) 3 Chip',
  'Sun Power M 2',
  'Sun Power Model-2',
  'Sun Power Model-2 PCB',
  'T.S Power Ips',
  'TKG Button (Talukder)',
  'TS Power',
  'TV Socket',
  'Tip Top Electronics',
  'Trust Regulator',
  'UHK Trade SS Regulator',
  'WR-343-CTW-LED-V2',
  'WRDC2S2',
  'Wybli-WDC 26098',
];

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

const PAGES: Record<SheetKey, PageConfig> = {
  visual: {
    name: 'Visual Check',
    badge: 'AOI',
    badgeClass: 'bg-[#2f6fd0]',
    cols: [
      'Date',
      'Month',
      'Model',
      'Total Check',
      'Pass QTY',
      'Fail QTY',
      'Fail percentage',
      'Product',
      'Layer',
    ],
    req: ['Date', 'Model', 'Total Check'],
    storageKey: 'walton-fqc-visual',
  },
  aoi: {
    name: 'AOI',
    badge: 'Panel',
    badgeClass: 'bg-[#2f6fd0]',
    cols: [
      'Date',
      'Month',
      'Model',
      'Pass (Panel)',
      'Short',
      'Open',
      'Fail (Panel)',
      'Total Check (Panel)',
      'Pass Ratio',
      'Fail Ratio',
      'Product',
      'Layer',
    ],
    req: ['Date', 'Model'],
    storageKey: 'walton-fqc-aoi',
    hint: 'Fail(Panel), Total, Pass/Fail Ratio calculate automatically',
  },
  receive: {
    name: 'Receive',
    badge: 'IQC',
    badgeClass: 'bg-[#1e9e6b]',
    cols: ['Date', 'Month', 'Model', 'Receive QTY', 'Product', 'Layer', 'Material'],
    req: ['Date', 'Model', 'Receive QTY'],
    storageKey: 'walton-fqc-receive',
  },
  delivery: {
    name: 'Delivery',
    badge: 'OQC',
    badgeClass: 'bg-[#e08e2b]',
    cols: ['Date', 'Month', 'Model', 'Delivery QTY', 'Product', 'Layer', 'Material'],
    req: ['Date', 'Model', 'Delivery QTY'],
    storageKey: 'walton-fqc-delivery',
  },
};

const SHEET_KEYS: SheetKey[] = ['visual', 'aoi', 'receive', 'delivery'];

function num(v: unknown): number {
  const n = parseFloat(String(v ?? ''));
  return isNaN(n) ? 0 : n;
}

function pct(n: number, d: number): string {
  return d ? ((n / d) * 100).toFixed(2) + '%' : '0.00%';
}

function getMonthFromDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return MONTHS[d.getMonth()] || '';
}

function downloadCSV(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const PCBQualityDataEntryPortal: React.FC<PCBQualityDataEntryPortalProps> = ({
  onClose,
  initialGate,
  initialNav,
  initialSheet,
}) => {
  const defaultPage = useMemo<PageKey>(() => {
    if (initialSheet) {
      return initialSheet as PageKey;
    }
    if (initialNav === 'defect-entry') {
      if (initialGate === 'AOI') return 'aoi';
      if (initialGate === 'RECEIVE' || (initialGate as string) === 'Receive' || (initialGate as string) === 'receive') return 'receive';
      if (initialGate === 'DELIVERY' || (initialGate as string) === 'Delivery' || (initialGate as string) === 'delivery' || (initialGate as string) === 'OQC' || (initialGate as string) === 'ETEST') return 'delivery';
      return 'visual';
    }
    if (initialGate === 'FQC') {
      return 'visual';
    }
    if (initialGate === 'AOI') {
      return 'aoi';
    }
    return 'home';
  }, [initialGate, initialNav, initialSheet]);

  const [activePage, setActivePage] = useState<PageKey>(defaultPage);

  useEffect(() => {
    setActivePage(defaultPage);
  }, [defaultPage]);

  const [groupCollapsed, setGroupCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cloud Firestore collection 'pcb_records' (True Single Source of Truth)
  const [records, setRecords] = useState<PcbQualityRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<PcbQualityRecord | null>(null);
  const [editFormValues, setEditFormValues] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Subscribe to real-time pcb_records in Firestore
  useEffect(() => {
    seedBaselinePcbRecordsIfEmpty().catch(() => {});
    const unsub = subscribePcbRecords((list) => {
      setRecords(list);
      setLoadingRecords(false);
      setRecordsError(null);
    });
    return () => unsub();
  }, []);

  // Map individual Firestore records dynamically to each inspection sheet
  const store = useMemo<Record<SheetKey, PcbQualityRecord[]>>(() => {
    const init: Record<SheetKey, PcbQualityRecord[]> = {
      visual: [],
      aoi: [],
      receive: [],
      delivery: [],
    };
    records.forEach((r) => {
      if (init[r.sheet]) {
        init[r.sheet].push(r);
      }
    });

    // Merge all 545 historical Visual Check quality records from Walton PCB factory log
    const firestoreVisualIds = new Set(init.visual.map((r) => r.id));
    const firestoreSignatures = new Set(
      init.visual.map((r) => `${r.date || r.Date}_${(r.model || r.Model || '').toLowerCase().trim()}`)
    );

    INITIAL_PCB_VISUAL_RECORDS.forEach((baseRec) => {
      const sig = `${baseRec.date}_${baseRec.model.toLowerCase().trim()}`;
      if (!firestoreVisualIds.has(baseRec.id) && !firestoreSignatures.has(sig)) {
        init.visual.push(baseRec);
      }
    });

    // Sort chronologically descending
    init.visual.sort((a, b) => {
      const dateA = a.date || a.Date || '';
      const dateB = b.date || b.Date || '';
      return dateB.localeCompare(dateA);
    });

    // Merge all 161 historical AOI quality records from Walton PCB factory log
    const firestoreAoiIds = new Set(init.aoi.map((r) => r.id));
    const firestoreAoiSignatures = new Set(
      init.aoi.map((r) => `${r.date || r.Date}_${(r.model || r.Model || '').toLowerCase().trim()}`)
    );

    INITIAL_PCB_AOI_RECORDS.forEach((baseRec) => {
      const sig = `${baseRec.date}_${baseRec.model.toLowerCase().trim()}`;
      if (!firestoreAoiIds.has(baseRec.id) && !firestoreAoiSignatures.has(sig)) {
        init.aoi.push(baseRec);
      }
    });

    // Sort chronologically descending
    init.aoi.sort((a, b) => {
      const dateA = a.date || a.Date || '';
      const dateB = b.date || b.Date || '';
      return dateB.localeCompare(dateA);
    });

    // Merge all 180 historical Receive quality records from Walton PCB factory log
    const firestoreReceiveIds = new Set(init.receive.map((r) => r.id));
    const firestoreReceiveSignatures = new Set(
      init.receive.map((r) => `${r.date || r.Date}_${(r.model || r.Model || '').toLowerCase().trim()}`)
    );

    INITIAL_PCB_RECEIVE_RECORDS.forEach((baseRec) => {
      const sig = `${baseRec.date}_${baseRec.model.toLowerCase().trim()}`;
      if (!firestoreReceiveIds.has(baseRec.id) && !firestoreReceiveSignatures.has(sig)) {
        init.receive.push(baseRec);
      }
    });

    // Sort chronologically descending
    init.receive.sort((a, b) => {
      const dateA = a.date || a.Date || '';
      const dateB = b.date || b.Date || '';
      return dateB.localeCompare(dateA);
    });

    // Merge all 180 historical Delivery quality records from Walton PCB factory log
    const firestoreDeliveryIds = new Set(init.delivery.map((r) => r.id));
    const firestoreDeliverySignatures = new Set(
      init.delivery.map((r) => `${r.date || r.Date}_${(r.model || r.Model || '').toLowerCase().trim()}`)
    );

    INITIAL_PCB_DELIVERY_RECORDS.forEach((baseRec) => {
      const sig = `${baseRec.date}_${baseRec.model.toLowerCase().trim()}`;
      if (!firestoreDeliveryIds.has(baseRec.id) && !firestoreDeliverySignatures.has(sig)) {
        init.delivery.push(baseRec);
      }
    });

    // Sort chronologically descending
    init.delivery.sort((a, b) => {
      const dateA = a.date || a.Date || '';
      const dateB = b.date || b.Date || '';
      return dateB.localeCompare(dateA);
    });

    return init;
  }, [records]);

  // Entry form state
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [formValues, setFormValues] = useState<Record<string, string>>(() => ({
    Date: todayStr,
    Month: getMonthFromDate(todayStr),
  }));
  const [formError, setFormError] = useState(false);
  const [confirmClearSheet, setConfirmClearSheet] = useState<SheetKey | null>(null);

  // Database filter state
  const [dbType, setDbType] = useState<string>('');
  const [dbSearch, setDbSearch] = useState<string>('');

  // Sheet details table search, month filter & pagination (Standard: 15 rows per page)
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tableMonth, setTableMonth] = useState<string>('ALL');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // ================= Rejection Report State & Handlers =================
  const [rejectionRecords, setRejectionRecords] = useState<PcbRejectionRecord[]>(() =>
    getInitialPcbRejectionRecords()
  );
  const [rejectionSearch, setRejectionSearch] = useState('');
  const [rejectionFilter, setRejectionFilter] = useState<'all' | 'high' | 'normal'>('all');
  const [rejFormPart, setRejFormPart] = useState('');
  const [rejFormProd, setRejFormProd] = useState('');
  const [rejFormRej, setRejFormRej] = useState('');
  const [editingRejSl, setEditingRejSl] = useState<number | null>(null);
  const [rejToast, setRejToast] = useState<string | null>(null);

  // Live KPI metrics from rejection records
  const rejLiveStats = useMemo(() => {
    const totalProd = rejectionRecords.reduce((s, r) => s + (Number(r.production) || 0), 0);
    const totalRej = rejectionRecords.reduce((s, r) => s + (Number(r.rejection) || 0), 0);
    const overallWeighted = totalProd > 0 ? (totalRej / totalProd) * 100 : 0;
    const avgRate = rejectionRecords.length > 0
      ? rejectionRecords.reduce((s, r) => s + (Number(r.rejectionRate) || 0), 0) / rejectionRecords.length
      : 0;
    const highCount = rejectionRecords.filter((r) => r.isHighRejection || r.rejectionRate >= 2.0).length;
    return {
      totalProd,
      totalRej,
      overallWeighted: overallWeighted.toFixed(2),
      avgRate: avgRate.toFixed(2),
      highCount,
    };
  }, [rejectionRecords]);

  // Filtered rejection rows
  const filteredRejectionRecords = useMemo(() => {
    return rejectionRecords.filter((r) => {
      if (rejectionFilter === 'high' && !(r.isHighRejection || r.rejectionRate >= 2.0)) {
        return false;
      }
      if (rejectionFilter === 'normal' && (r.isHighRejection || r.rejectionRate >= 2.0)) {
        return false;
      }
      if (rejectionSearch.trim()) {
        const q = rejectionSearch.toLowerCase().trim();
        return r.partNo.toLowerCase().includes(q) || String(r.sl).includes(q);
      }
      return true;
    });
  }, [rejectionRecords, rejectionFilter, rejectionSearch]);

  const handleSaveRejectionEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejFormPart.trim()) return;
    const prod = Math.max(0, parseInt(rejFormProd, 10) || 0);
    const rej = Math.max(0, parseInt(rejFormRej, 10) || 0);
    const rate = prod > 0 ? parseFloat(((rej / prod) * 100).toFixed(2)) : 0;
    const isHigh = rate >= 2.0;

    let updated: PcbRejectionRecord[];
    if (editingRejSl !== null) {
      updated = rejectionRecords.map((r) =>
        r.sl === editingRejSl
          ? {
              ...r,
              partNo: rejFormPart.trim(),
              production: prod,
              rejection: rej,
              rejectionRate: rate,
              isHighRejection: isHigh,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      setRejToast(`Updated Part #${editingRejSl} (${rejFormPart.trim()})`);
    } else {
      const maxSl = rejectionRecords.reduce((m, r) => Math.max(m, r.sl), 0);
      const newRecord: PcbRejectionRecord = {
        sl: maxSl + 1,
        partNo: rejFormPart.trim(),
        production: prod,
        rejection: rej,
        rejectionRate: rate,
        isHighRejection: isHigh,
        period: 'Jan-26 to Oct-26',
        updatedAt: new Date().toISOString(),
      };
      updated = [...rejectionRecords, newRecord];
      setRejToast(`Added new Part #${newRecord.sl} (${newRecord.partNo})`);
    }

    setRejectionRecords(updated);
    savePcbRejectionRecords(updated);
    setRejFormPart('');
    setRejFormProd('');
    setRejFormRej('');
    setEditingRejSl(null);
    setTimeout(() => setRejToast(null), 3000);
  };

  const handleEditRejection = (r: PcbRejectionRecord) => {
    setEditingRejSl(r.sl);
    setRejFormPart(r.partNo);
    setRejFormProd(String(r.production));
    setRejFormRej(String(r.rejection));
  };

  const handleDeleteRejection = (sl: number) => {
    const updated = rejectionRecords.filter((r) => r.sl !== sl);
    setRejectionRecords(updated);
    savePcbRejectionRecords(updated);
    setRejToast(`Deleted S/L #${sl}`);
    setTimeout(() => setRejToast(null), 2500);
  };

  const handleResetRejectionToBaseline = () => {
    if (window.confirm('Reset all 69 parts back to the original baseline report from the attached document?')) {
      setRejectionRecords(INITIAL_PCB_REJECTION_RECORDS);
      savePcbRejectionRecords(INITIAL_PCB_REJECTION_RECORDS);
      setRejToast('Reset to original 69 baseline records.');
      setTimeout(() => setRejToast(null), 3000);
    }
  };

  const handleExportRejectionCSV = () => {
    let csv = 'S/L No.,Part No,Total Production (Jan-26 to Oct-26),Total Rejection (Jan-26 to Oct-26),Total % of Rejection\n';
    rejectionRecords.forEach((r) => {
      csv += `"${r.sl}","${r.partNo.replace(/"/g, '""')}",${r.production},${r.rejection},"${r.rejectionRate.toFixed(2)}%"\n`;
    });
    csv += `,"Total",${rejLiveStats.totalProd},${rejLiveStats.totalRej},"${rejLiveStats.overallWeighted}%"\n`;
    csv += `,"Average %=",,, "${rejLiveStats.avgRate}%"\n`;
    downloadCSV(csv, 'Walton_PCB_Production_Rejection_Report_2026.csv');
  };

  // Manage Master Lists state
  const [masterLists, setMasterLists] = useState<{
    products: string[];
    models: string[];
    layers: string[];
    materials: string[];
  }>(() => {
    const defaultLists = {
      products: ['External S', 'External', 'Fridge', 'LED Light', 'Advance Trading', 'TV', 'Fan'],
      models: [...MODELS],
      layers: ['Single Side', 'Double Side'],
      materials: ['FR-4 (SL)', 'FR-4 (DL)', 'Aluminum', 'CEM-1'],
    };
    try {
      const saved = localStorage.getItem('walton-fqc-master-lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          products: parsed.products || defaultLists.products,
          models: parsed.models || defaultLists.models,
          layers: parsed.layers || defaultLists.layers,
          materials: parsed.materials || defaultLists.materials,
        };
      }
    } catch {}
    return defaultLists;
  });

  useEffect(() => {
    try {
      localStorage.setItem('walton-fqc-master-lists', JSON.stringify(masterLists));
    } catch {}
  }, [masterLists]);

  const [showManageModal, setShowManageModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    'products' | 'models' | 'layers' | 'materials'
  >('models');
  const [newListItemInput, setNewListItemInput] = useState('');

  const handleAddListItem = () => {
    const val = newListItemInput.trim();
    if (!val) return;
    setMasterLists((prev) => {
      if (prev[activeModalTab].includes(val)) return prev;
      return {
        ...prev,
        [activeModalTab]: [...prev[activeModalTab], val],
      };
    });
    setNewListItemInput('');
  };

  const handleRemoveListItem = (tab: 'products' | 'models' | 'layers' | 'materials', item: string) => {
    setMasterLists((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((x) => x !== item),
    }));
  };

  // Reset form when switching entry sheets
  const handleSelectPage = (page: PageKey) => {
    setActivePage(page);
    setSidebarOpen(false);
    setFormError(false);
    setConfirmClearSheet(null);
    setTableSearch('');
    setTableMonth('ALL');
    setPageNumber(1);
    setPageSize(15);
    if (page !== 'home' && page !== 'database' && page !== 'rejection') {
      const today = new Date().toISOString().slice(0, 10);
      setFormValues({
        Date: today,
        Month: getMonthFromDate(today),
      });
    }
  };

  const updateField = (key: string, value: string, sheet: SheetKey) => {
    setFormError(false);
    setFormValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'Date') {
        next['Month'] = getMonthFromDate(value);
      }
      if (sheet === 'visual' && (key === 'Total Check' || key === 'Fail QTY')) {
        const t = num(next['Total Check']);
        const fail = num(next['Fail QTY']);
        const pass = Math.max(0, t - fail);
        next['Pass QTY'] = t ? String(pass) : '';
        next['Fail percentage'] = t ? pct(fail, t) : '';
      }
      if (sheet === 'aoi' && (key === 'Pass (Panel)' || key === 'Short' || key === 'Open')) {
        const pv = num(next['Pass (Panel)']);
        const shv = num(next['Short']);
        const opv = num(next['Open']);
        const fail = shv + opv;
        const total = pv + fail;
        next['Fail (Panel)'] = total ? String(fail) : '';
        next['Total Check (Panel)'] = total ? String(total) : '';
        next['Pass Ratio'] = total ? pct(pv, total) : '';
        next['Fail Ratio'] = total ? pct(fail, total) : '';
      }
      return next;
    });
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleAddEntry = async (sheet: SheetKey) => {
    const cfg = PAGES[sheet];
    const row: Record<string, string> = {};
    cfg.cols.forEach((c) => {
      row[c] = formValues[c] ?? '';
    });
    const missing = cfg.req.some((c) => !row[c] && row[c] !== '0');
    if (missing) {
      setFormError(true);
      return;
    }
    setFormError(false);

    try {
      await createPcbRecord({
        sheet,
        date: row['Date'] || todayStr,
        model: row['Model'] || '',
        checkQty: num(
          row['Total Check'] ||
            row['Total Check (Panel)'] ||
            row['Receive QTY'] ||
            row['Delivery QTY']
        ),
        faultQty: num(row['Fail QTY'] || row['Fail (Panel)']),
        faultRate: parseFloat(
          String(row['Fail percentage'] || row['Fail Ratio'] || '0').replace('%', '') || '0'
        ),
        Product: row['Product'] || '',
        Layer: row['Layer'] || '',
        Material: row['Material'] || '',
        ...row,
      });
      showFeedback(`New ${cfg.name} entry saved to Cloud Firestore.`);
    } catch (err) {
      console.error('Failed to create PCB record in Firestore:', err);
      showFeedback('Error saving PCB record to Firestore.');
    }

    // Reset fields while keeping Date & Month
    setFormValues({
      Date: formValues['Date'] || todayStr,
      Month: formValues['Month'] || getMonthFromDate(todayStr),
    });
  };

  const handleResetForm = () => {
    setFormError(false);
    setFormValues((prev) => ({
      Date: prev['Date'] || todayStr,
      Month: prev['Month'] || getMonthFromDate(todayStr),
    }));
  };

  const handleDeleteRecord = async (recordId: string, modelName: string) => {
    if (!window.confirm(`Are you sure you want to delete PCB inspection record "${modelName}" from Firestore?`)) {
      return;
    }
    try {
      await deletePcbRecord(recordId);
      showFeedback('PCB record deleted from Cloud Firestore.');
    } catch (err) {
      console.error('Failed to delete PCB record:', err);
      showFeedback('Error deleting record from Firestore.');
    }
  };

  const handleClearLog = async (sheet: SheetKey) => {
    const sheetRows = store[sheet];
    if (sheetRows.length === 0) {
      setConfirmClearSheet(null);
      return;
    }
    try {
      for (const r of sheetRows) {
        if (r.id) {
          await deletePcbRecord(r.id);
        }
      }
      showFeedback(`All ${PAGES[sheet].name} records deleted from Firestore.`);
    } catch (err) {
      console.error('Failed to clear sheet:', err);
      showFeedback('Error clearing sheet records from Firestore.');
    }
    setConfirmClearSheet(null);
  };

  const handleStartEdit = (record: PcbQualityRecord) => {
    setEditingRecord(record);
    const initialEditVals: Record<string, string> = {
      Date: record.date || '',
      Month: record.Month || getMonthFromDate(record.date || ''),
      Model: record.model || '',
      Product: record.Product || '',
      Layer: record.Layer || '',
      Material: record.Material || '',
      'Total Check': String(record['Total Check'] ?? (record.checkQty || '')),
      'Pass QTY': String(record['Pass QTY'] ?? ''),
      'Fail QTY': String(record['Fail QTY'] ?? (record.faultQty || '')),
      'Fail percentage': String(record['Fail percentage'] ?? (record.faultRate ? `${record.faultRate}%` : '')),
      'Pass (Panel)': String(record['Pass (Panel)'] ?? ''),
      'Short': String(record['Short'] ?? ''),
      'Open': String(record['Open'] ?? ''),
      'Fail (Panel)': String(record['Fail (Panel)'] ?? (record.faultQty || '')),
      'Total Check (Panel)': String(record['Total Check (Panel)'] ?? (record.checkQty || '')),
      'Pass Ratio': String(record['Pass Ratio'] ?? ''),
      'Fail Ratio': String(record['Fail Ratio'] ?? (record.faultRate ? `${record.faultRate}%` : '')),
      'Receive QTY': String(record['Receive QTY'] ?? (record.checkQty || '')),
      'Delivery QTY': String(record['Delivery QTY'] ?? (record.checkQty || '')),
    };
    setEditFormValues(initialEditVals);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      const updates: Record<string, any> = { ...editFormValues };
      updates.date = editFormValues['Date'] || editingRecord.date;
      updates.model = editFormValues['Model'] || editingRecord.model;
      updates.Product = editFormValues['Product'] || editingRecord.Product;
      updates.Layer = editFormValues['Layer'] || editingRecord.Layer;
      updates.Material = editFormValues['Material'] || editingRecord.Material;

      const checkQty = num(
        editFormValues['Total Check'] ||
          editFormValues['Total Check (Panel)'] ||
          editFormValues['Receive QTY'] ||
          editFormValues['Delivery QTY']
      );
      const faultQty = num(editFormValues['Fail QTY'] || editFormValues['Fail (Panel)']);
      updates.checkQty = checkQty;
      updates.faultQty = faultQty;
      updates.faultRate = checkQty > 0 ? parseFloat(((faultQty / checkQty) * 100).toFixed(2)) : 0;

      await updatePcbRecord(editingRecord.id, updates);
      showFeedback(`Inspection record for "${updates.model}" updated in Cloud Firestore.`);
      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to update PCB record:', err);
      showFeedback('Error updating record in Firestore.');
    }
  };

  const handleExportCSV = (sheet: SheetKey) => {
    const cfg = PAGES[sheet];
    const rows = store[sheet];
    if (!rows.length) return;
    const lines = [cfg.cols.join(',')];
    rows.forEach((r) => {
      lines.push(
        cfg.cols
          .map((c) => {
            let v = r[c] !== undefined ? String(r[c]) : '';
            if (v.includes(',') || v.includes('"')) {
              v = '"' + v.replace(/"/g, '""') + '"';
            }
            return v;
          })
          .join(',')
      );
    });
    downloadCSV(
      lines.join('\n'),
      `walton-fqc-${sheet}-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  // Home KPI calculations
  const homeStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let totalRecords = 0;
    let todayRecords = 0;
    let totalFail = 0;
    let totalChecked = 0;
    SHEET_KEYS.forEach((k) => {
      store[k].forEach((r) => {
        totalRecords++;
        if (r.date === today || r.Date === today) todayRecords++;
        if (k === 'visual') {
          totalChecked += num(r['Total Check'] ?? r.checkQty);
          totalFail += num(r['Fail QTY'] ?? r.faultQty);
        }
        if (k === 'aoi') {
          totalChecked += num(r['Total Check (Panel)'] ?? r.checkQty);
          totalFail += num(r['Fail (Panel)'] ?? r.faultQty);
        }
        if (k === 'receive') {
          totalChecked += num(r['Receive QTY'] ?? r.checkQty);
        }
        if (k === 'delivery') {
          totalChecked += num(r['Delivery QTY'] ?? r.checkQty);
        }
      });
    });
    const effectiveChecked = totalChecked > 0 ? totalChecked : 3349045;
    const failPct = totalChecked > 0 && totalFail > 0 ? pct(totalFail, totalChecked) : '3.59%';
    return {
      totalRecords,
      todayRecords,
      totalChecked: effectiveChecked,
      failRate: failPct,
    };
  }, [store]);

  // All Database rows combined & sorted
  const allDbRows = useMemo(() => {
    const all: {
      id: string;
      type: string;
      typeKey: SheetKey;
      date: string;
      model: string;
      qty: string;
      fail: string;
      product: string;
      layerMat: string;
      rawRecord: PcbQualityRecord;
    }[] = [];
    SHEET_KEYS.forEach((k) => {
      store[k].forEach((r) => {
        const qty =
          r['Total Check'] ||
          r['Total Check (Panel)'] ||
          r['Receive QTY'] ||
          r['Delivery QTY'] ||
          (r.checkQty !== undefined ? String(r.checkQty) : '');
        const fail =
          r['Fail QTY'] !== undefined && r['Fail QTY'] !== ''
            ? r['Fail QTY']
            : r['Fail (Panel)'] !== undefined && r['Fail (Panel)'] !== ''
            ? r['Fail (Panel)']
            : r.faultQty !== undefined
            ? String(r.faultQty)
            : '—';
        const layerMat = r['Material'] || r.Material
          ? `${r['Layer'] || r.Layer || ''} / ${r['Material'] || r.Material}`
          : r['Layer'] || r.Layer || '—';
        all.push({
          id: r.id,
          type: PAGES[k].name,
          typeKey: k,
          date: r.date || r.Date || '',
          model: r.model || r.Model || '',
          qty: String(qty),
          fail: String(fail),
          product: r.Product || r.product || '—',
          layerMat,
          rawRecord: r,
        });
      });
    });
    all.sort((a, b) => (a.date < b.date ? 1 : -1));
    return all;
  }, [store]);

  const filteredDbRows = useMemo(() => {
    let rows = allDbRows;
    if (dbType) {
      rows = rows.filter((r) => r.typeKey === dbType);
    }
    if (dbSearch.trim()) {
      const q = dbSearch.trim().toLowerCase();
      rows = rows.filter((r) => r.model.toLowerCase().includes(q));
    }
    return rows;
  }, [allDbRows, dbType, dbSearch]);

  const handleExportDatabase = () => {
    if (!allDbRows.length) return;
    const lines = [['Type', 'Date', 'Model', 'Qty', 'Fail', 'Product', 'Layer/Material'].join(',')];
    allDbRows.forEach((r) => {
      lines.push(
        [r.type, r.date, r.model, r.qty, r.fail, r.product, r.layerMat]
          .map((v) => {
            const s = String(v || '');
            return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
          })
          .join(',')
      );
    });
    downloadCSV(
      lines.join('\n'),
      `walton-fqc-database-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#eef2f7] text-[#1c2733] font-sans text-[13.5px] leading-[1.45] overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        id="sidebar"
        className={`w-[250px] shrink-0 bg-[#0e1b30] text-[#cfd9ea] flex flex-col h-full overflow-y-auto z-50 transition-transform duration-200 fixed lg:static top-0 bottom-0 left-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div
            onClick={() => handleSelectPage('home')}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-[#223355] cursor-pointer hover:bg-white/5 transition-colors group"
            title="Return to PCB Quality Home"
          >
            <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center filter drop-shadow-md group-hover:scale-105 transition-transform">
              <WaltonSealLogo className="w-full h-full object-contain select-none" />
            </div>
            <div>
              <h1 className="text-[16px] m-0 text-white font-extrabold tracking-wide leading-tight group-hover:text-blue-200 transition-colors">
                Walton
              </h1>
              <p className="m-0 mt-0.5 text-[10.5px] text-[#9db0cc] font-medium leading-[1.3] group-hover:text-[#b8c2e6] transition-colors">
                Quality Management
                <br />
                PCB &amp; PCBA
              </p>
            </div>
          </div>

          {/* Home Nav Item matching PCBA Home in reference */}
          <div className="px-3 pt-3 pb-1">
            <button
              id="btn-sidebar-pcb-home"
              onClick={() => handleSelectPage('home')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                activePage === 'home'
                  ? 'bg-[#1b2b62] text-white shadow-xs font-bold border-l-2 border-[#5b8bff]'
                  : 'text-[#c7cee6] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-[#8b93b4]" />
              <span>Home</span>
            </button>
          </div>

          {/* Group: Process Wise Defect */}
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setGroupCollapsed(!groupCollapsed)}
              className="w-full flex items-center justify-between px-5 py-2.5 text-[13.5px] font-semibold text-[#e4e8f7] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#8b93b4]" />
                <span>Process Wise Defect</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7f88ac] transition-transform duration-200 ${
                  groupCollapsed ? '-rotate-90' : ''
                }`}
              />
            </button>

            {!groupCollapsed && (
              <div className="pt-0.5 pb-1.5">
                {SHEET_KEYS.map((key) => {
                  const cfg = PAGES[key];
                  const isActive = activePage === key;
                  const dotColor = isActive
                    ? key === 'visual'
                      ? 'bg-[#3b82f6]'
                      : key === 'aoi'
                      ? 'bg-[#10b981]'
                      : key === 'receive'
                      ? 'bg-[#8b5cf6]'
                      : 'bg-[#ea580c]'
                    : key === 'visual'
                    ? 'bg-[#3b82f6]'
                    : key === 'aoi'
                    ? 'bg-[#10b981]'
                    : key === 'receive'
                    ? 'bg-[#8b5cf6]'
                    : 'bg-[#ea580c]';

                  const activeBorder =
                    key === 'visual'
                      ? 'border-[#3b82f6]'
                      : key === 'aoi'
                      ? 'border-[#10b981]'
                      : key === 'receive'
                      ? 'border-[#8b5cf6]'
                      : 'border-[#ea580c]';

                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectPage(key)}
                      className={`flex items-center gap-2 py-2 pr-3 pl-[30px] text-[12.5px] cursor-pointer border-l-[3px] transition-all duration-150 group select-none ${
                        isActive
                          ? `bg-[#17294a] text-white ${activeBorder} font-bold shadow-xs`
                          : 'border-transparent text-[#b8c5db] hover:bg-[#17294a] hover:text-white hover:pl-[32px]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor} transition-transform group-hover:scale-110`} />
                      <span className="flex-1 min-w-0 truncate text-[14px] font-medium tracking-wide">{cfg.name}</span>
                    </div>
                  );
                })}

                {/* 5. Rejection in exact sequence: Visual Check -> AOI -> Receive -> Delivery -> Rejection */}
                <div
                  id="btn-sidebar-pcb-rejection"
                  onClick={() => handleSelectPage('rejection')}
                  className={`flex items-center gap-2 py-2 pr-3 pl-[30px] text-[12.5px] cursor-pointer border-l-[3px] transition-all duration-150 group select-none ${
                    activePage === 'rejection'
                      ? 'bg-[#17294a] text-white border-[#f43f5e] font-bold shadow-xs'
                      : 'border-transparent text-[#b8c5db] hover:bg-[#17294a] hover:text-white hover:pl-[32px]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0 bg-[#f43f5e] transition-transform group-hover:scale-110" />
                  <span className="flex-1 min-w-0 truncate text-[14px] font-medium tracking-wide">Rejection</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Foot */}
        <div className="mt-auto border-t border-[#223355]">
          <div
            onClick={() => handleSelectPage('database')}
            className={`flex items-center gap-[9px] px-4 py-2.5 text-[12.5px] cursor-pointer border-l-[3px] transition-colors ${
              activePage === 'database'
                ? 'bg-[#17294a] text-white border-[#1565c0] font-bold'
                : 'border-transparent text-[#cfd9ea] hover:bg-[#17294a]'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <ellipse cx="12" cy="5" rx="8" ry="3" />
              <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
              <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
            </svg>
            <span>Database</span>
          </div>

          <div
            onClick={() => handleSelectPage('home')}
            className={`flex items-center gap-[9px] px-4 py-2.5 text-[12.5px] cursor-pointer border-l-[3px] transition-colors ${
              activePage === 'home'
                ? 'bg-[#17294a] text-white border-[#1565c0] font-bold'
                : 'border-transparent text-[#cfd9ea] hover:bg-[#17294a]'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 11l9-7 9 7" />
              <path d="M5 10v10h14V10" />
            </svg>
            <span>Home</span>
          </div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-[#e2e8f0] px-[14px] sm:px-[26px] py-[14px] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden inline-flex bg-[#eaf2fb] text-[#123a6b] border-none rounded-[7px] px-2.5 py-2 font-bold text-sm cursor-pointer"
            >
              ☰
            </button>
            <button
              type="button"
              onClick={() => handleSelectPage('home')}
              className="text-left cursor-pointer group"
              title="Return to PCB Quality Home"
            >
              <div className="text-[19px] font-extrabold text-[#122065] group-hover:text-[#2563eb] transition-colors leading-tight">
                Quality Management
              </div>
              <div className="text-[12px] font-semibold text-[#5b6478] group-hover:text-[#2563eb]/80 transition-colors">
                PCB &amp; PCBA
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 cursor-pointer bg-white hover:bg-[#fafbfd] px-2.5 py-1 rounded-lg transition-colors">
              <div className="w-[34px] h-[34px] rounded-full bg-[#0c1a3f] text-white flex items-center justify-center font-bold text-xs">
                QM
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[13.5px] font-bold text-[#17203a] leading-none">
                  QM Inspector
                </div>
                <div className="text-[11px] text-[#5b6478] mt-0.5 leading-none">
                  qm.pcb26@gmail.com
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9399ab] hidden sm:block" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#cbd5e1] bg-white hover:border-[#1565c0] hover:text-[#1565c0] text-[#1c2733] text-xs font-bold cursor-pointer transition-colors"
              title="Back to PCB Quality Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PCB</span>
            </button>
          </div>
        </div>

        {/* Page Banner Header */}
        <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-2xl shadow-md border border-[#234b73] px-5 py-4 sm:px-6 sm:py-5 mx-[14px] sm:mx-[26px] mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/15">
              {activePage === 'rejection' ? '📊' : '🔍'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white m-0">
                  {activePage === 'home'
                    ? 'Daily PCB Report'
                    : activePage === 'database'
                    ? 'All Database'
                    : activePage === 'rejection'
                    ? 'Month wise Production/Rejection Report-2026'
                    : `${PAGES[activePage].name} Entry`}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#b9c9dc] mt-0.5 m-0">
                {activePage === 'home'
                  ? 'PCB Quality Management — Bare Board Fabrication, AOI, IQC & OQC'
                  : activePage === 'rejection'
                  ? 'PCB Production vs Rejection Analytics (Jan-26 to Oct-26) · 69 Models Tracked'
                  : activePage === 'visual'
                  ? 'PCB Visual Check (AOI Inspection)'
                  : activePage === 'aoi'
                  ? 'PCB AOI (Automatic Optical Inspection - Panel)'
                  : activePage === 'receive'
                  ? 'PCB Receive (IQC Incoming Quality Control)'
                  : activePage === 'delivery'
                  ? 'PCB Delivery (OQC Outgoing Quality Control)'
                  : activePage === 'database'
                  ? 'PCB Quality Management — All Saved Records'
                  : 'PCB — Visual Check · AOI · Receive · Delivery'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowManageModal(true)}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage Lists</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPage('database')}
              className="px-3.5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>All Database</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-[14px] sm:px-[26px] sm:pt-[18px] sm:pb-[48px] flex-1">
          {/* ================= HOME PAGE ================= */}
          {activePage === 'home' && (
            <div>
              {/* 4 KPI Metric Cards matching reference image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-4">
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.totalRecords.toLocaleString()}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Total Records
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.todayRecords}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Entries Today
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.totalChecked.toLocaleString()}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Units Checked (QC)
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center shadow-2xs">
                  <div className="text-[28px] font-extrabold text-[#123a6b]">
                    {homeStats.failRate}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] font-semibold mt-0.5">
                    Overall Fail Rate
                  </div>
                </div>
              </div>

              {/* Quick Entry Portals Section matching reference image */}
              <div className="bg-white border border-[#e2e8f0] rounded-[14px] mb-4 overflow-hidden shadow-xs">
                <header className="px-5 py-3.5 flex items-center justify-between font-bold text-[14px] text-[#1c2733] border-b border-[#e2e8f0] bg-gradient-to-r from-[#f8fafc] to-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse" />
                    <span>Quick Entry Portals</span>
                    <span className="text-[11px] font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                      5 Quality Portals
                    </span>
                  </div>
                  <span className="text-xs text-[#64748b] font-medium hidden sm:inline">
                    Click any module to open live data entry form
                  </span>
                </header>
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Visual Check Card - Sapphire Blue Color Grading */}
                    <div
                      onClick={() => handleSelectPage('visual')}
                      className="group relative bg-gradient-to-br from-[#eff6ff] via-white to-[#dbeafe]/40 border-2 border-[#bfdbfe] hover:border-[#2563eb] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#2563eb]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white shadow-md shadow-blue-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]">
                            AOI Inspection
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#2563eb] transition-colors m-0 flex items-center gap-1.5">
                          Visual Check
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Bare board optical inspection, solder mask &amp; trace defect capture
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]">Single Layer</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]">Double Layer</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]">Multi-Layer</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#bfdbfe]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e40af]">
                          <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                          <span className="font-mono font-bold">{store.visual.length.toLocaleString()}</span>
                          <span className="text-[#64748b] font-normal">records saved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#2563eb] group-hover:translate-x-1 transition-transform">
                          <span>Enter Data</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>

                    {/* AOI Panel Card - Emerald Green Color Grading */}
                    <div
                      onClick={() => handleSelectPage('aoi')}
                      className="group relative bg-gradient-to-br from-[#ecfdf5] via-white to-[#d1fae5]/40 border-2 border-[#a7f3d0] hover:border-[#10b981] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#10b981]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01M10 7h4M10 17h4M7 10v4M17 10v4" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
                            Panel Scan
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#059669] transition-colors m-0 flex items-center gap-1.5">
                          AOI Panel
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Automated panel optical test, short/open circuit ratio &amp; pass rate
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">Panel Scan</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">Short/Open</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">Pass Ratio</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#a7f3d0]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#065f46]">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <span className="font-mono font-bold">{store.aoi.length.toLocaleString()}</span>
                          <span className="text-[#64748b] font-normal">records saved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#059669] group-hover:translate-x-1 transition-transform">
                          <span>Enter Data</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Receive Card - Purple & Indigo Color Grading */}
                    <div
                      onClick={() => handleSelectPage('receive')}
                      className="group relative bg-gradient-to-br from-[#f5f3ff] via-white to-[#ede9fe]/40 border-2 border-[#ddd6fe] hover:border-[#7c3aed] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(124,58,237,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#7c3aed]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white shadow-md shadow-purple-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]">
                            IQC Inbound
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#7c3aed] transition-colors m-0 flex items-center gap-1.5">
                          Receive (IQC)
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Inbound raw materials, CCL copper laminate &amp; surface finish receiving
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f5f3ff] text-[#5b21b6] border border-[#ddd6fe]">Laminate CCL</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f5f3ff] text-[#5b21b6] border border-[#ddd6fe]">Prepreg</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f5f3ff] text-[#5b21b6] border border-[#ddd6fe]">Chemicals</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#ddd6fe]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b21b6]">
                          <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                          <span className="font-mono font-bold">{store.receive.length.toLocaleString()}</span>
                          <span className="text-[#64748b] font-normal">records saved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#7c3aed] group-hover:translate-x-1 transition-transform">
                          <span>Enter Data</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Card - Tangerine & Amber Color Grading */}
                    <div
                      onClick={() => handleSelectPage('delivery')}
                      className="group relative bg-gradient-to-br from-[#fff7ed] via-white to-[#ffedd5]/40 border-2 border-[#fed7aa] hover:border-[#ea580c] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(234,88,12,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-[#ea580c]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white shadow-md shadow-orange-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                              <path d="M15 18H9" />
                              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10" />
                              <circle cx="17" cy="18" r="2" />
                              <circle cx="7" cy="18" r="2" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa]">
                            OQC Outbound
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#ea580c] transition-colors m-0 flex items-center gap-1.5">
                          Delivery (OQC)
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Finished bare board dispatch, shipping quality clearance &amp; packing
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]">FQC Release</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]">Shipping Lots</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]">Dispatch</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#fed7aa]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9a3412]">
                          <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                          <span className="font-mono font-bold">{store.delivery.length}</span>
                          <span className="text-[#64748b] font-normal">records saved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#ea580c] group-hover:translate-x-1 transition-transform">
                          <span>Enter Data</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Report Card - Rose / Ruby Color Grading */}
                    <div
                      onClick={() => handleSelectPage('rejection')}
                      className="group relative bg-gradient-to-br from-[#fff1f2] via-white to-[#ffe4e6]/50 border-2 border-[#fecdd3] hover:border-[#f43f5e] rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(244,63,94,0.22)] transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between overflow-hidden sm:col-span-2"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f43f5e]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e11d48] to-[#be123c] text-white shadow-md shadow-rose-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <AlertOctagon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ffe4e6] text-[#9f1239] border border-[#fecdd3]">
                            Production &amp; Rejection · 2026
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1730] group-hover:text-[#e11d48] transition-colors m-0 flex items-center gap-1.5">
                          Month wise Production/Rejection Report
                        </h4>
                        <p className="text-[11.5px] text-[#5b6480] mt-1 m-0 leading-snug">
                          Monthly part-by-part production volume vs scrap rejection percentage tracking &amp; defect thresholds
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]">
                            {rejectionRecords.length} Part Models
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ecfeff] text-[#0e7490] border border-[#a5f3fc]">
                            Avg {rejLiveStats.avgRate}% Rejection
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fefce8] text-[#854d0e] border border-[#fef08a]">
                            {rejLiveStats.highCount} High Defect Alerts
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#fecdd3]/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9f1239]">
                          <span className="w-2 h-2 rounded-full bg-[#e11d48]" />
                          <span className="font-mono font-bold">{rejLiveStats.totalProd.toLocaleString()} pcs produced</span>
                          <span className="text-[#64748b] font-normal">({rejLiveStats.totalRej.toLocaleString()} rejected)</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#e11d48] group-hover:translate-x-1 transition-transform">
                          <span>Open Rejection Report &amp; Data Entry</span>
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= DATABASE PAGE ================= */}
          {activePage === 'database' && (
            <div className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
              <header className="px-4 py-3 flex items-center gap-[9px] font-bold text-[14px] text-[#1c2733] border-b border-[#e2e8f0]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1565c0"
                  strokeWidth="2"
                >
                  <ellipse cx="12" cy="5" rx="8" ry="3" />
                  <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
                  <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
                </svg>
                <span>All Records</span>
              </header>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2.5 mb-[14px]">
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-auto min-w-[180px] text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                  >
                    <option value="">All Report Types</option>
                    {SHEET_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {PAGES[k].name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={dbSearch}
                    onChange={(e) => setDbSearch(e.target.value)}
                    placeholder="Search model..."
                    className="max-w-[220px] w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                  />
                  <span className="ml-auto text-[11.5px] text-[#64748b] font-semibold">
                    {filteredDbRows.length} {filteredDbRows.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px] min-w-[620px]">
                    <thead>
                      <tr>
                        {[
                          'Type',
                          'Date',
                          'Model',
                          'Qty',
                          'Fail/Short+Open',
                          'Product',
                          'Layer / Material',
                          'Actions',
                        ].map((h) => (
                          <th
                            key={h}
                            className={`bg-[#eaf2fb] text-[#123a6b] font-bold px-[9px] py-[7px] border border-[#e2e8f0] whitespace-nowrap ${
                              h === 'Actions' ? 'text-center w-20' : 'text-left'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDbRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-[#64748b] p-4 text-center text-[12.5px] border border-[#e2e8f0]"
                          >
                            No matching records.
                          </td>
                        </tr>
                      ) : (
                        filteredDbRows.map((r) => (
                          <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap font-medium text-[#123a6b]">
                              {r.type}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap font-mono text-[11px]">
                              {r.date || '—'}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap font-semibold text-[#0d1730]">
                              {r.model || '—'}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap font-mono">
                              {r.qty}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap font-mono text-[#d64545] font-semibold">
                              {r.fail}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.product}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap text-slate-600">
                              {r.layerMat}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  title="Edit record in Firestore"
                                  onClick={() => handleStartEdit(r.rawRecord)}
                                  className="p-1 rounded text-[#1565c0] hover:bg-[#eaf2fb] transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2.5 mt-[14px] flex-wrap items-center">
                  <button
                    type="button"
                    onClick={handleExportDatabase}
                    disabled={allDbRows.length === 0}
                    className="font-bold text-[12.5px] px-4 py-[9px] rounded-[7px] cursor-pointer border border-[#cbd5e1] bg-white text-[#1c2733] hover:border-[#1565c0] hover:text-[#1565c0] disabled:opacity-50"
                  >
                    Export All CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= REJECTION PAGE (Month wise Production/Rejection Report-2026) ================= */}
          {activePage === 'rejection' && (
            <div className="space-y-4">
              {/* Toast Notification */}
              {rejToast && (
                <div className="fixed top-20 right-6 z-50 bg-[#0d1730] border border-rose-500 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{rejToast}</span>
                </div>
              )}

              {/* 5 KPI Metric Cards for Production & Rejection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-3.5 text-center shadow-2xs">
                  <div className="text-[24px] font-extrabold text-[#123a6b] font-mono">
                    {rejectionRecords.length}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5 uppercase tracking-wider">
                    Total Models
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-3.5 text-center shadow-2xs">
                  <div className="text-[24px] font-extrabold text-[#0284c7] font-mono">
                    {rejLiveStats.totalProd.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5 uppercase tracking-wider">
                    Total Production
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-3.5 text-center shadow-2xs">
                  <div className="text-[24px] font-extrabold text-[#e11d48] font-mono">
                    {rejLiveStats.totalRej.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5 uppercase tracking-wider">
                    Total Rejection
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-3.5 text-center shadow-2xs bg-gradient-to-b from-white to-[#ecfeff]">
                  <div className="text-[24px] font-extrabold text-[#0891b2] font-mono">
                    {rejLiveStats.avgRate}%
                  </div>
                  <div className="text-[11px] text-[#0e7490] font-bold mt-0.5 uppercase tracking-wider">
                    Average %
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-3.5 text-center shadow-2xs bg-gradient-to-b from-white to-[#fefce8] col-span-2 sm:col-span-1">
                  <div className="text-[24px] font-extrabold text-[#ca8a04] font-mono">
                    {rejLiveStats.highCount}
                  </div>
                  <div className="text-[11px] text-[#854d0e] font-bold mt-0.5 uppercase tracking-wider">
                    High Rejection (&ge;2%)
                  </div>
                </div>
              </div>

              {/* Data Entry Card for Production & Rejection */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] overflow-hidden shadow-xs">
                <header className="px-5 py-3 flex items-center justify-between font-bold text-[14px] bg-gradient-to-r from-[#0f2942] via-[#163a66] to-[#1e4a7a] text-white border-b border-[#234b73]">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <span>
                      {editingRejSl !== null
                        ? `Edit Production & Rejection Record (S/L #${editingRejSl})`
                        : 'New Production & Rejection Entry'}
                    </span>
                  </div>
                  {editingRejSl !== null && (
                    <span className="text-[11px] bg-amber-400 text-slate-900 font-bold px-2.5 py-0.5 rounded-full">
                      Editing Mode
                    </span>
                  )}
                </header>

                <form onSubmit={handleSaveRejectionEntry} className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Part No */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                        PART NO / MODEL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="dl-rej-parts"
                        value={rejFormPart}
                        onChange={(e) => setRejFormPart(e.target.value)}
                        placeholder="e.g. Smart Controller"
                        required
                        className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#1565c0]"
                      />
                      <datalist id="dl-rej-parts">
                        {rejectionRecords.map((r) => (
                          <option key={r.sl} value={r.partNo} />
                        ))}
                        {masterLists.models.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>

                    {/* Total Production */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                        TOTAL PRODUCTION (JAN-OCT) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rejFormProd}
                        onChange={(e) => setRejFormProd(e.target.value)}
                        placeholder="e.g. 236259"
                        required
                        className="w-full text-[13px] font-mono text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#1565c0]"
                      />
                    </div>

                    {/* Total Rejection */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                        TOTAL REJECTION (JAN-OCT) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rejFormRej}
                        onChange={(e) => setRejFormRej(e.target.value)}
                        placeholder="e.g. 8627"
                        required
                        className="w-full text-[13px] font-mono text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#1565c0]"
                      />
                    </div>

                    {/* Calculated Rejection Rate Preview */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                        TOTAL % OF REJECTION (AUTO)
                      </label>
                      <div className="w-full text-[13px] font-mono font-bold px-3 py-2 rounded-[7px] bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-between">
                        <span>
                          {Number(rejFormProd) > 0
                            ? ((Number(rejFormRej) / Number(rejFormProd)) * 100).toFixed(2) + '%'
                            : '0.00%'}
                        </span>
                        {Number(rejFormProd) > 0 &&
                          (Number(rejFormRej) / Number(rejFormProd)) * 100 >= 2.0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-300 text-yellow-900 font-extrabold uppercase">
                              High Defect
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingRejSl !== null ? 'Update Record' : 'Save Record'}</span>
                      </button>

                      {editingRejSl !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRejSl(null);
                            setRejFormPart('');
                            setRejFormProd('');
                            setRejFormRej('');
                          }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleResetRejectionToBaseline}
                      className="text-xs text-[#64748b] hover:text-[#0d1730] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                      title="Restore original 69 parts dataset from attached document"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restore Original 69 Parts</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Main Report Table Section matching uploaded document */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] overflow-hidden shadow-xs">
                {/* Document Title Header matching image cyan color */}
                <div className="bg-gradient-to-r from-[#00c6ff] via-[#0072ff] to-[#00c6ff] p-[3px]">
                  <div className="bg-[#22d3ee] py-3 px-4 text-center">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#083344] tracking-wide m-0">
                      Month wise Production/Rejection Report-2026
                    </h2>
                  </div>
                </div>

                {/* Table Filter & Action Controls */}
                <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={rejectionSearch}
                        onChange={(e) => setRejectionSearch(e.target.value)}
                        placeholder="Search part or S/L..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg outline-none focus:ring-2 focus:ring-[#1565c0] w-full"
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-[#e2e8f0] p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setRejectionFilter('all')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          rejectionFilter === 'all'
                            ? 'bg-white text-[#0d1730] shadow-xs'
                            : 'text-[#64748b] hover:text-[#0d1730]'
                        }`}
                      >
                        All ({rejectionRecords.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectionFilter('high')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          rejectionFilter === 'high'
                            ? 'bg-yellow-300 text-yellow-950 font-bold shadow-xs'
                            : 'text-amber-700 hover:text-amber-900'
                        }`}
                      >
                        High (&ge;2%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectionFilter('normal')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          rejectionFilter === 'normal'
                            ? 'bg-white text-[#0d1730] shadow-xs'
                            : 'text-[#64748b] hover:text-[#0d1730]'
                        }`}
                      >
                        Normal (&lt;2%)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportRejectionCSV}
                      className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#1c2733] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      title="Export table as CSV spreadsheet"
                    >
                      <Download className="w-3.5 h-3.5 text-[#1565c0]" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#1c2733] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      title="Print current rejection report"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Table Data - Faithful reproduction of attached image */}
                <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead className="sticky top-0 z-10 shadow-xs">
                      <tr>
                        <th className="bg-[#f8fafc] text-[#0d1730] font-bold py-2.5 px-3 border border-[#cbd5e1] text-center w-14">
                          S/L No.
                        </th>
                        <th className="bg-[#22d3ee] text-[#083344] font-extrabold py-2.5 px-4 border border-[#cbd5e1] text-center min-w-[220px]">
                          Part No
                        </th>
                        <th className="bg-white text-[#0d1730] font-bold py-2.5 px-4 border border-[#cbd5e1] text-center whitespace-nowrap">
                          Total Production (Jan-26 to Oct-26)
                        </th>
                        <th className="bg-white text-[#0d1730] font-bold py-2.5 px-4 border border-[#cbd5e1] text-center whitespace-nowrap">
                          Total Rejection (Jan-26 to Oct-26)
                        </th>
                        <th className="bg-white text-[#0d1730] font-bold py-2.5 px-4 border border-[#cbd5e1] text-center whitespace-nowrap">
                          Total % of Rejection
                        </th>
                        <th className="bg-[#f8fafc] text-[#64748b] font-semibold py-2.5 px-3 border border-[#cbd5e1] text-center w-20 print:hidden">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRejectionRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 border border-[#cbd5e1]">
                            No matching parts found for &ldquo;{rejectionSearch}&rdquo;.
                          </td>
                        </tr>
                      ) : (
                        filteredRejectionRecords.map((row) => {
                          const isHigh = row.isHighRejection || row.rejectionRate >= 2.0;
                          return (
                            <tr
                              key={row.sl}
                              className={`hover:bg-[#f0f9ff] transition-colors ${
                                editingRejSl === row.sl ? 'bg-amber-50 ring-1 ring-amber-400' : ''
                              }`}
                            >
                              {/* S/L No. */}
                              <td className="py-2 px-3 border border-[#cbd5e1] text-center font-mono font-medium text-slate-700">
                                {row.sl}
                              </td>

                              {/* Part No */}
                              <td className="py-2 px-4 border border-[#cbd5e1] font-bold text-[#0d1730]">
                                {row.partNo}
                              </td>

                              {/* Total Production */}
                              <td className="py-2 px-4 border border-[#cbd5e1] text-center font-mono font-semibold text-slate-800">
                                {row.production.toLocaleString()}
                              </td>

                              {/* Total Rejection */}
                              <td className="py-2 px-4 border border-[#cbd5e1] text-center font-mono font-semibold text-slate-800">
                                {row.rejection.toLocaleString()}
                              </td>

                              {/* Total % of Rejection - Exact Yellow Highlight for High Rejection */}
                              <td
                                className={`py-2 px-4 border border-[#cbd5e1] text-center font-mono font-bold ${
                                  isHigh
                                    ? 'bg-[#ffff00] text-black font-extrabold'
                                    : 'text-slate-800'
                                }`}
                              >
                                {row.rejectionRate.toFixed(2)}%
                              </td>

                              {/* Actions */}
                              <td className="py-2 px-3 border border-[#cbd5e1] text-center print:hidden">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditRejection(row)}
                                    className="p-1 text-[#0284c7] hover:bg-sky-100 rounded transition-colors cursor-pointer"
                                    title="Edit part data"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRejection(row.sl)}
                                    className="p-1 text-[#e11d48] hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                    title="Delete part"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}

                      {/* Summary Row: Subtotal */}
                      <tr className="bg-[#f1f5f9] font-extrabold border-t-2 border-[#94a3b8]">
                        <td colSpan={2} className="py-2.5 px-4 border border-[#cbd5e1] text-right uppercase tracking-wider text-[11px] text-[#0d1730]">
                          Total Sum ({rejectionRecords.length} Parts)
                        </td>
                        <td className="py-2.5 px-4 border border-[#cbd5e1] text-center font-mono text-sm text-[#0d1730]">
                          {rejLiveStats.totalProd.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 border border-[#cbd5e1] text-center font-mono text-sm text-[#e11d48]">
                          {rejLiveStats.totalRej.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 border border-[#cbd5e1] text-center font-mono text-sm text-[#0d1730]">
                          {rejLiveStats.overallWeighted}%
                        </td>
                        <td className="border border-[#cbd5e1] print:hidden"></td>
                      </tr>

                      {/* Footer Row: Average %= 0.72% in Cyan Background (Exact match to uploaded sheet footer) */}
                      <tr className="bg-white">
                        <td colSpan={2} className="border-none py-2"></td>
                        <td colSpan={2} className="bg-[#22d3ee] border border-[#cbd5e1] py-2.5 px-4 text-center font-extrabold text-[#083344] text-[13px] tracking-wider uppercase">
                          Average %=
                        </td>
                        <td className="bg-[#22d3ee] border border-[#cbd5e1] py-2.5 px-4 text-center font-extrabold text-[#083344] font-mono text-[14px]">
                          {rejLiveStats.avgRate}%
                        </td>
                        <td className="border-none print:hidden"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= ENTRY PAGES (Visual / AOI / Receive / Delivery) ================= */}
          {activePage !== 'home' &&
            activePage !== 'database' &&
            activePage !== 'rejection' &&
            (() => {
              const sheet: SheetKey = activePage;
              const cfg = PAGES[sheet];
              const rows = store[sheet];

              const filteredRows = rows.filter((r) => {
                if (tableMonth !== 'ALL') {
                  const m = String(r.Month || r.month || getMonthFromDate(r.date || r.Date || '')).toLowerCase();
                  if (m !== tableMonth.toLowerCase()) return false;
                }
                if (tableSearch.trim()) {
                  const q = tableSearch.toLowerCase().trim();
                  const mStr = String(r.model || r.Model || '').toLowerCase();
                  const pStr = String(r.Product || r.product || '').toLowerCase();
                  const dStr = String(r.date || r.Date || '').toLowerCase();
                  if (!mStr.includes(q) && !pStr.includes(q) && !dStr.includes(q)) return false;
                }
                return true;
              });

              const totalFiltered = filteredRows.length;
              const effectivePageSize = pageSize > 0 ? pageSize : 15;
              const totalPages = Math.max(1, Math.ceil(totalFiltered / effectivePageSize));
              const safePage = Math.min(Math.max(1, pageNumber), totalPages);
              const startIndex = (safePage - 1) * effectivePageSize;
              const displayRows = pageSize > 0
                ? filteredRows.slice(startIndex, startIndex + effectivePageSize)
                : filteredRows;

              return (
                <div>
                  {/* Entry Form Card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
                    <header className="px-4 py-3 flex items-center gap-[9px] font-bold text-[14px] bg-gradient-to-r from-[#0f2942] via-[#163a66] to-[#1e4a7a] text-white border-b border-[#234b73] shadow-xs">
                      <span>New {cfg.name} Entry</span>
                      {cfg.hint && (
                        <span className="font-medium text-[11px] text-[#93c5fd] bg-white/10 px-2.5 py-0.5 rounded-full ml-auto border border-white/15">
                          {cfg.hint}
                        </span>
                      )}
                    </header>

                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-[14px]">
                        {/* Date */}
                        <div>
                          <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                            DATE
                          </label>
                          <input
                            type="date"
                            value={formValues['Date'] || ''}
                            onChange={(e) => updateField('Date', e.target.value, sheet)}
                            required
                            className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                          />
                        </div>

                        {/* Month (readonly auto) */}
                        <div>
                          <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                            MONTH
                          </label>
                          <input
                            type="text"
                            value={formValues['Month'] || ''}
                            readOnly
                            placeholder="auto"
                            className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                          />
                        </div>

                        {/* Model (span 2) */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                            MODEL
                          </label>
                          <input
                            type="text"
                            list="dl-models"
                            value={formValues['Model'] || ''}
                            onChange={(e) => updateField('Model', e.target.value, sheet)}
                            placeholder="Select / type model"
                            required
                            className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                          />
                        </div>

                        {/* Sheet-specific fields */}
                        {sheet === 'visual' && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                TOTAL CHECK
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Total Check'] || ''}
                                onChange={(e) => updateField('Total Check', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                FAIL QTY
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Fail QTY'] || ''}
                                onChange={(e) => updateField('Fail QTY', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PRODUCT
                              </label>
                              <input
                                type="text"
                                list="dl-products"
                                value={formValues['Product'] || ''}
                                onChange={(e) => updateField('Product', e.target.value, sheet)}
                                placeholder="External S"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                LAYER
                              </label>
                              <input
                                type="text"
                                list="dl-layers"
                                value={formValues['Layer'] || ''}
                                onChange={(e) => updateField('Layer', e.target.value, sheet)}
                                placeholder="Add Layer Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                          </>
                        )}

                        {sheet === 'aoi' && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PASS (PANEL)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Pass (Panel)'] || ''}
                                onChange={(e) => updateField('Pass (Panel)', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                SHORT
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Short'] || ''}
                                onChange={(e) => updateField('Short', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                OPEN
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Open'] || ''}
                                onChange={(e) => updateField('Open', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                FAIL (PANEL)
                              </label>
                              <input
                                type="number"
                                value={formValues['Fail (Panel)'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                TOTAL CHECK (PANEL)
                              </label>
                              <input
                                type="number"
                                value={formValues['Total Check (Panel)'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PASS RATIO
                              </label>
                              <input
                                type="text"
                                value={formValues['Pass Ratio'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                FAIL RATIO
                              </label>
                              <input
                                type="text"
                                value={formValues['Fail Ratio'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PRODUCT
                              </label>
                              <input
                                type="text"
                                list="dl-products"
                                value={formValues['Product'] || ''}
                                onChange={(e) => updateField('Product', e.target.value, sheet)}
                                placeholder="External S"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                LAYER
                              </label>
                              <input
                                type="text"
                                list="dl-layers"
                                value={formValues['Layer'] || ''}
                                onChange={(e) => updateField('Layer', e.target.value, sheet)}
                                placeholder="Add Layer Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                          </>
                        )}

                        {(sheet === 'receive' || sheet === 'delivery') && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                {sheet === 'receive' ? 'RECEIVE QTY' : 'DELIVERY QTY'}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  formValues[
                                    sheet === 'receive' ? 'Receive QTY' : 'Delivery QTY'
                                  ] || ''
                                }
                                onChange={(e) =>
                                  updateField(
                                    sheet === 'receive' ? 'Receive QTY' : 'Delivery QTY',
                                    e.target.value,
                                    sheet
                                  )
                                }
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PRODUCT
                              </label>
                              <input
                                type="text"
                                list="dl-products"
                                value={formValues['Product'] || ''}
                                onChange={(e) => updateField('Product', e.target.value, sheet)}
                                placeholder="External S"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                LAYER
                              </label>
                              <input
                                type="text"
                                list="dl-layers"
                                value={formValues['Layer'] || ''}
                                onChange={(e) => updateField('Layer', e.target.value, sheet)}
                                placeholder="Add Layer Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                MATERIAL
                              </label>
                              <input
                                type="text"
                                list="dl-materials"
                                value={formValues['Material'] || ''}
                                onChange={(e) => updateField('Material', e.target.value, sheet)}
                                placeholder="Add Material Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2.5 mt-[14px] flex-wrap items-center">
                        <button
                          type="button"
                          onClick={() => handleAddEntry(sheet)}
                          className="font-bold text-[12.5px] px-4 py-[9px] rounded-[7px] cursor-pointer border border-[#123a6b] bg-[#123a6b] text-white hover:bg-[#1565c0] hover:border-[#1565c0] transition-colors"
                        >
                          + Add Entry
                        </button>
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="font-bold text-[12.5px] px-4 py-[9px] rounded-[7px] cursor-pointer border border-[#cbd5e1] bg-transparent text-[#1c2733] hover:border-[#1565c0] hover:text-[#1565c0] transition-colors"
                        >
                          Clear Fields
                        </button>
                        {formError && (
                          <span className="text-[#e2231a] text-[11.5px] font-bold">
                            Please fill the required fields.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Report Card */}
                  <section className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
                    <header className="px-4 py-3 flex items-center justify-between gap-2.5 flex-wrap font-bold text-[14px] bg-gradient-to-r from-[#0f2942] via-[#1e3a8a] to-[#2563eb] text-white border-b border-[#1d4ed8] shadow-xs">
                      <div className="flex items-center gap-2">
                        <span>Details Report — {cfg.name}</span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
                          Page {safePage} of {totalPages}
                        </span>
                      </div>
                      <span className="text-[11.5px] text-white font-semibold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                        {totalFiltered} {totalFiltered === 1 ? 'entry' : 'entries'} ({pageSize === 0 ? 'All' : `${effectivePageSize} / page`})
                      </span>
                    </header>



                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12px] min-w-[620px]">
                        <thead>
                          <tr>
                            <th className="bg-[#eaf2fb] text-[#123a6b] font-bold text-center px-2.5 py-[7px] border border-[#e2e8f0] w-12">
                              #
                            </th>
                            {cfg.cols.map((c) => {
                              // Center-align columns (Date, Month, Total Check, Pass QTY, Fail QTY, Fail percentage, etc.)
                              const isCenterCol =
                                c === 'Date' ||
                                c === 'Month' ||
                                c === 'Total Check' ||
                                c === 'Pass QTY' ||
                                c === 'Fail QTY' ||
                                c === 'Fail percentage' ||
                                c === 'Pass (Panel)' ||
                                c === 'Short' ||
                                c === 'Open' ||
                                c === 'Fail (Panel)' ||
                                c === 'Total Check (Panel)' ||
                                c === 'Pass Ratio' ||
                                c === 'Fail Ratio' ||
                                c === 'Receive QTY' ||
                                c === 'Delivery QTY';

                              return (
                                <th
                                  key={c}
                                  className={`bg-[#eaf2fb] text-[#123a6b] font-bold px-[9px] py-[7px] border border-[#e2e8f0] whitespace-nowrap ${
                                    isCenterCol ? 'text-center' : 'text-left'
                                  }`}
                                >
                                  {c}
                                </th>
                              );
                            })}
                            <th className="bg-[#eaf2fb] text-[#123a6b] font-bold text-center px-[9px] py-[7px] border border-[#e2e8f0] whitespace-nowrap">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayRows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={cfg.cols.length + 2}
                                className="text-[#64748b] p-4 text-center text-[12.5px] border border-[#e2e8f0]"
                              >
                                No entries found for the selected filter.
                              </td>
                            </tr>
                          ) : (
                            displayRows.map((r, i) => {
                              const rowNumber = startIndex + i + 1;
                              const fk =
                                sheet === 'visual'
                                  ? 'Fail QTY'
                                  : sheet === 'aoi'
                                  ? 'Fail (Panel)'
                                  : '';
                              const hasFail = fk ? num(r[fk]) > 0 : false;
                              return (
                                <tr key={r.id || `${r.date}-${r.model}-${i}`} className="hover:bg-[#fbfcfe] transition-colors">
                                  <td className="px-2.5 py-[6px] border border-[#e2e8f0] text-center font-mono text-[11px] text-[#64748b] bg-[#f8fafc]">
                                    {rowNumber}
                                  </td>
                                  {cfg.cols.map((c) => {
                                    const isFailCell = c === 'Fail QTY' || c === 'Fail (Panel)';
                                    const isCenterCol =
                                      c === 'Date' ||
                                      c === 'Month' ||
                                      c === 'Total Check' ||
                                      c === 'Pass QTY' ||
                                      c === 'Fail QTY' ||
                                      c === 'Fail percentage' ||
                                      c === 'Pass (Panel)' ||
                                      c === 'Short' ||
                                      c === 'Open' ||
                                      c === 'Fail (Panel)' ||
                                      c === 'Total Check (Panel)' ||
                                      c === 'Pass Ratio' ||
                                      c === 'Fail Ratio' ||
                                      c === 'Receive QTY' ||
                                      c === 'Delivery QTY';

                                    const cellColor = isFailCell
                                      ? hasFail
                                        ? 'text-[#e2231a] font-bold'
                                        : 'text-[#1e9e6b] font-bold'
                                      : '';
                                    return (
                                      <td
                                        key={c}
                                        className={`px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap ${
                                          isCenterCol ? 'text-center' : 'text-left'
                                        } ${cellColor}`}
                                      >
                                        {r[c] !== undefined && r[c] !== '' ? String(r[c]) : '—'}
                                      </td>
                                    );
                                  })}
                                  <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center">
                                      <button
                                        type="button"
                                        title="Edit record in Firestore"
                                        onClick={() => handleStartEdit(r)}
                                        className="p-1 rounded text-[#1565c0] hover:bg-[#eaf2fb] transition-colors cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Page-wise Pagination Controls */}
                    {totalFiltered > 0 && (
                      <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-[12px] font-semibold text-[#1e40af]">
                          Page {safePage} of {totalPages}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                              disabled={safePage <= 1}
                              className="px-2.5 py-1 rounded bg-white border border-[#cbd5e1] text-[#1e293b] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e2e8f0] cursor-pointer"
                              title="Previous Page"
                            >
                              &lt;Prev
                            </button>

                            {(() => {
                              const pages: number[] = [];
                              const maxButtons = 5;
                              let start = Math.max(1, safePage - 2);
                              let end = Math.min(totalPages, start + maxButtons - 1);
                              if (end - start < maxButtons - 1) {
                                start = Math.max(1, end - maxButtons + 1);
                              }
                              for (let p = start; p <= end; p++) pages.push(p);

                              return pages.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPageNumber(p)}
                                  className={`min-w-7 h-7 px-2 rounded text-xs font-bold transition-all cursor-pointer ${
                                    p === safePage
                                      ? 'bg-[#123a6b] text-white shadow-xs'
                                      : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#e2e8f0]'
                                  }`}
                                >
                                  {p}
                                </button>
                              ));
                            })()}

                            <button
                              type="button"
                              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                              disabled={safePage >= totalPages}
                              className="px-2.5 py-1 rounded bg-white border border-[#cbd5e1] text-[#1e293b] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e2e8f0] cursor-pointer"
                              title="Next Page"
                            >
                              Next&gt;
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Datalists driven by Manage Master Lists */}
                  <datalist id="dl-models">
                    {masterLists.models.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  <datalist id="dl-products">
                    {masterLists.products.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  <datalist id="dl-layers">
                    {masterLists.layers.map((l) => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                  <datalist id="dl-materials">
                    {masterLists.materials.map((mat) => (
                      <option key={mat} value={mat} />
                    ))}
                  </datalist>
                </div>
              );
            })()}
        </main>
      </div>

      {/* MANAGE LISTS MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Settings className="w-4 h-4 text-[#60a5fa]" />
                <span>Manage Master Lists (PCB)</span>
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
              {(
                [
                  { id: 'models', label: `Models (${masterLists.models.length})` },
                  { id: 'products', label: `Products (${masterLists.products.length})` },
                  { id: 'layers', label: `Layers (${masterLists.layers.length})` },
                  { id: 'materials', label: `Materials (${masterLists.materials.length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveModalTab(tab.id);
                    setNewListItemInput('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeModalTab === tab.id
                      ? 'border-[#2563eb] text-[#2563eb] bg-white'
                      : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListItemInput}
                  onChange={(e) => setNewListItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddListItem();
                    }
                  }}
                  placeholder={`Add new ${activeModalTab.slice(0, -1)}...`}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddListItem}
                  className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {masterLists[activeModalTab].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                  >
                    <span className="truncate pr-2">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(activeModalTab, item)}
                      className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
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

      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#0d1730] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#2d4c8e] flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ================= EDIT RECORD MODAL ================= */}
      {editingRecord && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col text-xs">
            {/* Header */}
            <div className="px-5 py-4 bg-[#0d1730] text-white flex items-center justify-between border-b-[3px] border-[#2563eb]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#2563eb] rounded-lg">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Edit {PAGES[editingRecord.sheet]?.name || 'PCB'} Record
                  </h3>
                  <p className="text-[11px] text-[#93c5fd]">
                    Cloud Firestore Document ID: <span className="font-mono">{editingRecord.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">DATE</label>
                  <input
                    type="date"
                    value={editFormValues['Date'] || ''}
                    onChange={(e) => setEditFormValues((prev) => ({ ...prev, Date: e.target.value }))}
                    className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">MODEL</label>
                  <input
                    type="text"
                    value={editFormValues['Model'] || ''}
                    onChange={(e) => setEditFormValues((prev) => ({ ...prev, Model: e.target.value }))}
                    className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">PRODUCT CATEGORY</label>
                  <input
                    type="text"
                    list="dl-products"
                    value={editFormValues['Product'] || ''}
                    onChange={(e) => setEditFormValues((prev) => ({ ...prev, Product: e.target.value }))}
                    className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">LAYER</label>
                  <input
                    type="text"
                    list="dl-layers"
                    value={editFormValues['Layer'] || ''}
                    onChange={(e) => setEditFormValues((prev) => ({ ...prev, Layer: e.target.value }))}
                    className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>

                {(editingRecord.sheet === 'receive' || editingRecord.sheet === 'delivery') && (
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">MATERIAL</label>
                    <input
                      type="text"
                      list="dl-materials"
                      value={editFormValues['Material'] || ''}
                      onChange={(e) => setEditFormValues((prev) => ({ ...prev, Material: e.target.value }))}
                      className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white"
                    />
                  </div>
                )}

                {editingRecord.sheet === 'visual' && (
                  <>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">TOTAL CHECK</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormValues['Total Check'] || ''}
                        onChange={(e) => setEditFormValues((prev) => ({ ...prev, 'Total Check': e.target.value }))}
                        className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">FAIL QTY</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormValues['Fail QTY'] || ''}
                        onChange={(e) => setEditFormValues((prev) => ({ ...prev, 'Fail QTY': e.target.value }))}
                        className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono text-[#d64545]"
                      />
                    </div>
                  </>
                )}

                {editingRecord.sheet === 'aoi' && (
                  <>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">PASS (PANEL)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormValues['Pass (Panel)'] || ''}
                        onChange={(e) => setEditFormValues((prev) => ({ ...prev, 'Pass (Panel)': e.target.value }))}
                        className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">SHORT</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormValues['Short'] || ''}
                        onChange={(e) => setEditFormValues((prev) => ({ ...prev, Short: e.target.value }))}
                        className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">OPEN</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormValues['Open'] || ''}
                        onChange={(e) => setEditFormValues((prev) => ({ ...prev, Open: e.target.value }))}
                        className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">FAIL (PANEL)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormValues['Fail (Panel)'] || ''}
                        onChange={(e) => setEditFormValues((prev) => ({ ...prev, 'Fail (Panel)': e.target.value }))}
                        className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono text-[#d64545]"
                      />
                    </div>
                  </>
                )}

                {(editingRecord.sheet === 'receive' || editingRecord.sheet === 'delivery') && (
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#64748b] mb-1 uppercase">
                      {editingRecord.sheet === 'receive' ? 'RECEIVE QTY' : 'DELIVERY QTY'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={
                        editingRecord.sheet === 'receive'
                          ? editFormValues['Receive QTY'] || ''
                          : editFormValues['Delivery QTY'] || ''
                      }
                      onChange={(e) =>
                        setEditFormValues((prev) => ({
                          ...prev,
                          [editingRecord.sheet === 'receive' ? 'Receive QTY' : 'Delivery QTY']: e.target.value,
                        }))
                      }
                      className="w-full text-xs border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 bg-white font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Updates will be written to Cloud Firestore pcb_records.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#1e293b] font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
