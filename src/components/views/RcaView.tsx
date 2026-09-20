/**
 * =========================================================================================
 * @file src/components/views/RcaView.tsx
 * @component RcaView
 * @description Root Cause Analysis (RCA) Report Maker for Walton PCB & PCBA Quality Management
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Renders the comprehensive RCA Report Maker:
 * - Bilingual support (Bengali & English) matching standard manufacturing QC reporting.
 * - Form Entry with Company Header, Problem Details, 4M Root Cause classification,
 *   Defect Summaries, Multi-photo attachment (Summary, Root Cause, Action Plan) with reordering/removal.
 * - Auto calculation of Customer Fail (%) from Fail Qty and Delivery Qty.
 * - Real-time scaled 1280px live preview styled exactly as Walton RCA engineering reports.
 * - Saved Reports Drawer with search, open, duplicate, delete, and full JSON backup.
 * - High-resolution PNG and PDF document exports using html2canvas and jsPDF.
 * - Single JSON and All Reports CSV export.
 * - Responsive split-view for desktop and tabbed switcher for mobile.
 *
 * ACCESS CONTROL:
 * ---------------
 * - Follows Walton QMS role-based permissions:
 * - Visitors (!isLoggedIn): View-only mode with active report inspection and export capabilities.
 * - Authorized Logged-In Users (isLoggedIn): Full entry, image upload, drafting, and management.
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { PageId } from '../../types';
import {
  Workflow,
  Plus,
  Save,
  FolderOpen,
  Download,
  FileText,
  FileSpreadsheet,
  Upload,
  RotateCcw,
  Trash2,
  Copy,
  Search,
  X,
  Lock,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Image as ImageIcon,
} from 'lucide-react';

interface RcaViewProps {
  onNavigate?: (page: PageId) => void;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export interface RcaReport {
  id: string;
  updated?: number;
  company: string;
  address: string;
  logo: string | null;
  title: string;
  category: string;
  model: string;
  product: string;
  dept: string;
  date: string;
  lot: string;
  prod: string;
  deliv: string;
  failQty: string;
  failPct: string;
  defects: string;
  areaProcess: boolean;
  areaProduction: boolean;
  m4Man: boolean;
  m4Machine: boolean;
  m4Method: boolean;
  m4Material: boolean;
  initial: string;
  findings: string;
  immediate: string;
  permanent: string;
  occ: string;
  imp: string;
  imgSummary: string[];
  imgRoot: string[];
  imgAction: string[];
}

const STORAGE_KEY = 'rca_reports_v1';
const DRAFT_KEY = 'rca_draft_v1';

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const createBlankReport = (): RcaReport => ({
  id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  company: 'Walton Digi Tech Industries Ltd.',
  address: 'Chandra, Kaliakair, Gazipur',
  logo: null,
  title: '',
  category: 'PCBA',
  model: '',
  product: 'PCB',
  dept: 'Quality Management',
  date: getTodayString(),
  lot: '',
  prod: '',
  deliv: '',
  failQty: '',
  failPct: '',
  defects: '',
  areaProcess: false,
  areaProduction: false,
  m4Man: false,
  m4Machine: false,
  m4Method: false,
  m4Material: false,
  initial: '',
  findings: '',
  immediate: '',
  permanent: '',
  occ: '',
  imp: '',
  imgSummary: [],
  imgRoot: [],
  imgAction: [],
});

const createSampleReport = (): RcaReport => ({
  ...createBlankReport(),
  title: 'AC Display Defect',
  model: 'Common Display',
  date: '2026-09-16',
  lot: '20000',
  prod: '18592',
  deliv: '13497',
  failPct: '0.82',
  defects: 'Display Digit\nIR sensor not work\nAuto low light',
  areaProcess: true,
  areaProduction: true,
  m4Man: true,
  m4Machine: true,
  m4Material: true,
  initial:
    'Display Digit Not Displaying Properly During Functional Test\nRemote Control Function Not Working- IR sensor issue\nSuspected soldering and assembly issue.',
  findings: '7-segment display module\nSoldering problem',
  immediate:
    'Collected defective samples & Performed Functional ,X-ray and EVO camera inspection.\nChecking process upgrade',
  permanent:
    'Implement 100% visual inspection after wave soldering.\nUpdate the work instruction\nIncrease hourly sampling for solder quality and DIP insertion.\nMaintain Every Point Checklist.\nContinue sampling-based PCBA inspection.',
  occ: 'Production\nQuality',
  imp: 'Quality Management- PCB&PCBA',
});

const parseLines = (text: string): string[] => {
  return String(text || '')
    .split(/\r?\n/)
    .map((x) => x.replace(/^\s*(?:\d+[.)]|[-•*])\s+/, '').trim())
    .filter(Boolean);
};

const formatDate = (isoStr: string) => {
  const p = String(isoStr || '').split('-');
  return p.length === 3 ? `${p[1]}/${p[2]}/${p[0]}` : '';
};

const slugify = (str: string) => {
  return String(str || 'report')
    .trim()
    .replace(/[^A-Za-z0-9\u0980-\u09FF]+/g, '_')
    .replace(/^_|_$/g, '') || 'report';
};

export const RcaView: React.FC<RcaViewProps> = ({
  onNavigate,
  isLoggedIn = false,
  onOpenLoginModal,
}) => {
  const [report, setReport] = useState<RcaReport>(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object') {
          return { ...createBlankReport(), ...parsed };
        }
      }
    } catch {}
    return createSampleReport();
  });

  const [savedReports, setSavedReports] = useState<RcaReport[]>(() => {
    try {
      const val = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(val)) return val;
    } catch {}
    return [];
  });

  const [mobileTab, setMobileTab] = useState<'form' | 'prev'>('form');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    msg: string;
    onConfirm: () => void;
  } | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  const scalerRef = useRef<HTMLDivElement>(null);
  const scalerInRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? '' : prev));
    }, 3200);
  };

  // Scaling math for the 1280px preview
  const handleFit = () => {
    if (!scalerRef.current || !scalerInRef.current) return;
    const w = scalerRef.current.clientWidth;
    if (!w) return;
    const k = Math.min(1, w / 1280);
    scalerInRef.current.style.transform = `scale(${k})`;
    scalerRef.current.style.height = `${Math.ceil(scalerInRef.current.offsetHeight * k)}px`;
  };

  useEffect(() => {
    handleFit();
    window.addEventListener('resize', handleFit);
    return () => window.removeEventListener('resize', handleFit);
  }, [report, mobileTab]);

  // Autosave draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(report));
    } catch {}
    handleFit();
  }, [report]);

  const saveReportsToStorage = (list: RcaReport[]) => {
    setSavedReports(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  };

  // Form field changes
  const updateField = <K extends keyof RcaReport>(key: K, value: RcaReport[K]) => {
    if (!isLoggedIn) return;
    setReport((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'failQty' || key === 'deliv') {
        const f = parseFloat(String(key === 'failQty' ? value : next.failQty).replace(/,/g, ''));
        const d = parseFloat(String(key === 'deliv' ? value : next.deliv).replace(/,/g, ''));
        if (!isNaN(f) && !isNaN(d) && d > 0) {
          next.failPct = ((f / d) * 100).toFixed(2);
        }
      }
      return next;
    });
  };

  // Read image helper
  const readImageFile = (file: File, max = 1400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const k = Math.min(1, max / img.width);
          const w = Math.round(img.width * k);
          const h = Math.round(img.height * k);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.86));
        };
        img.src = fr.result as string;
      };
      fr.readAsDataURL(file);
    });
  };

  const addImages = async (category: 'imgSummary' | 'imgRoot' | 'imgAction', files: File[]) => {
    if (!isLoggedIn) return;
    const newImgs: string[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      try {
        const base64 = await readImageFile(f);
        newImgs.push(base64);
      } catch {}
    }
    if (newImgs.length > 0) {
      setReport((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), ...newImgs],
      }));
      showToast(`${newImgs.length}টি ছবি যোগ হয়েছে`);
    }
  };

  const removeImage = (category: 'imgSummary' | 'imgRoot' | 'imgAction', index: number) => {
    if (!isLoggedIn) return;
    setReport((prev) => {
      const arr = [...(prev[category] || [])];
      arr.splice(index, 1);
      return { ...prev, [category]: arr };
    });
  };

  const reorderImage = (
    category: 'imgSummary' | 'imgRoot' | 'imgAction',
    index: number,
    dir: 'left' | 'right'
  ) => {
    if (!isLoggedIn) return;
    setReport((prev) => {
      const arr = [...(prev[category] || [])];
      const target = dir === 'left' ? index - 1 : index + 1;
      if (target >= 0 && target < arr.length) {
        [arr[index], arr[target]] = [arr[target], arr[index]];
      }
      return { ...prev, [category]: arr };
    });
  };

  // Save current report
  const handleSaveReport = () => {
    if (!isLoggedIn) return;
    const rec = { ...report, updated: Date.now() };
    const all = [...savedReports];
    const idx = all.findIndex((r) => r.id === rec.id);
    if (idx >= 0) {
      all[idx] = rec;
    } else {
      all.unshift(rec);
    }
    const success = saveReportsToStorage(all);
    showToast(success ? 'রিপোর্ট সফলভাবে সেভ হয়েছে' : 'ব্রাউজারে সেভ হয়নি (জায়গা শেষ বা ব্লকড)');
  };

  // Create new report
  const handleNewReport = () => {
    if (!isLoggedIn) return;
    setConfirmModal({
      msg: 'বর্তমান এন্ট্রি বাদ দিয়ে নতুন ফাঁকা রিপোর্ট খুলবেন? সেভ না করা তথ্য হারিয়ে যাবে।',
      onConfirm: () => {
        setReport(createBlankReport());
        setMobileTab('form');
        showToast('নতুন রিপোর্ট শুরু করা হয়েছে');
      },
    });
  };

  // Open saved report
  const handleOpenSaved = (rec: RcaReport) => {
    setReport({ ...createBlankReport(), ...rec });
    setDrawerOpen(false);
    setMobileTab('form');
    showToast('রিপোর্ট লোড হয়েছে');
  };

  // Duplicate saved report
  const handleDuplicateSaved = (rec: RcaReport) => {
    if (!isLoggedIn) return;
    const copy: RcaReport = {
      ...rec,
      id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: `${rec.title || ''} (copy)`.trim(),
      updated: Date.now(),
    };
    const all = [copy, ...savedReports];
    saveReportsToStorage(all);
    showToast('কপি তৈরি হয়েছে');
  };

  // Delete saved report
  const handleDeleteSaved = (rec: RcaReport) => {
    if (!isLoggedIn) return;
    setConfirmModal({
      msg: `“${rec.title || 'শিরোনাম নেই'}” রিপোর্টটি মুছে ফেলবেন?`,
      onConfirm: () => {
        const all = savedReports.filter((r) => r.id !== rec.id);
        saveReportsToStorage(all);
        showToast('রিপোর্ট মুছে ফেলা হয়েছে');
      },
    });
  };

  // Download snapshot (PNG / PDF)
  const captureSnapshotCanvas = async (): Promise<HTMLCanvasElement> => {
    const html2canvas = (window as any).html2canvas;
    if (!html2canvas) {
      throw new Error('html2canvas লাইব্রেরি লোড হয়নি');
    }
    if (!reportRef.current) {
      throw new Error('Report container element not found');
    }

    const host = document.createElement('div');
    host.style.cssText =
      'position:fixed;left:-20000px;top:0;width:1280px;background:#fff;pointer-events:none;z-index:-9999;';
    const clone = reportRef.current.cloneNode(true) as HTMLElement;
    host.appendChild(clone);
    document.body.appendChild(host);

    try {
      await new Promise((r) => setTimeout(r, 100));
      return await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
    } finally {
      document.body.removeChild(host);
    }
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const cv = await captureSnapshotCanvas();
      cv.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `RCA_${slugify(report.title)}_${report.date || getTodayString()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('PNG ডাউনলোড সম্পন্ন হয়েছে');
      }, 'image/png');
    } catch (e: any) {
      showToast(e.message || 'ডাউনলোড করা যায়নি');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const jspdfModule = (window as any).jspdf;
    if (!jspdfModule || !jspdfModule.jsPDF) {
      showToast('jsPDF লাইব্রেরি লোড হয়নি');
      return;
    }

    setIsExporting(true);
    try {
      const cv = await captureSnapshotCanvas();
      const w = cv.width / 2;
      const h = cv.height / 2;
      const pdf = new jspdfModule.jsPDF({
        orientation: w > h ? 'l' : 'p',
        unit: 'px',
        format: [w, h],
        hotfixes: ['px_scaling'],
      });
      pdf.addImage(cv.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, h);
      pdf.save(`RCA_${slugify(report.title)}_${report.date || getTodayString()}.pdf`);
      showToast('PDF ডাউনলোড সম্পন্ন হয়েছে');
    } catch (e: any) {
      showToast(e.message || 'ডাউনলোড করা যায়নি');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `RCA_${slugify(report.title)}_${report.date || getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('JSON ডাউনলোড সম্পন্ন হয়েছে');
  };

  const handleExportCsv = () => {
    const all = [...savedReports];
    if (!all.some((r) => r.id === report.id)) {
      all.unshift(report);
    }

    const cols: Array<[string, keyof RcaReport, ('L' | 'B' | 'S')?]> = [
      ['ID', 'id', 'S'],
      ['Title', 'title', 'S'],
      ['Category', 'category', 'S'],
      ['Model', 'model', 'S'],
      ['Product', 'product', 'S'],
      ['Department', 'dept', 'S'],
      ['Reporting Date', 'date', 'S'],
      ['Lot Qty', 'lot', 'S'],
      ['Production Qty', 'prod', 'S'],
      ['Delivery Qty', 'deliv', 'S'],
      ['Customer Fail Qty', 'failQty', 'S'],
      ['Customer Fail %', 'failPct', 'S'],
      ['Defect', 'defects', 'L'],
      ['Process', 'areaProcess', 'B'],
      ['Production', 'areaProduction', 'B'],
      ['Man', 'm4Man', 'B'],
      ['Machine', 'm4Machine', 'B'],
      ['Method', 'm4Method', 'B'],
      ['Material', 'm4Material', 'B'],
      ['Initial observation', 'initial', 'L'],
      ['Actual Findings', 'findings', 'L'],
      ['Immediate Action', 'immediate', 'L'],
      ['Permanent Action', 'permanent', 'L'],
      ['Occurrence responsible', 'occ', 'L'],
      ['Improvement responsible', 'imp', 'L'],
    ];

    const escapeCell = (v: any) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;

    const row = (r: RcaReport) =>
      cols
        .map((c) => {
          const val = r[c[1]];
          if (c[2] === 'L') {
            return escapeCell(parseLines(String(val)).map((x, i) => `${i + 1}. ${x}`).join(' | '));
          }
          if (c[2] === 'B') {
            return escapeCell(val ? 'Yes' : '');
          }
          return escapeCell(val);
        })
        .join(',');

    const csv =
      '\uFEFF' +
      cols.map((c) => escapeCell(c[0])).join(',') +
      '\r\n' +
      all.map(row).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `RCA_reports_${getTodayString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('CSV ফাইল ডাউনলোড হয়েছে');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const all = [...savedReports];
        data.forEach((item) => {
          if (!item || typeof item !== 'object') return;
          const rec = { ...createBlankReport(), ...item };
          const idx = all.findIndex((x) => x.id === rec.id);
          if (idx >= 0) all[idx] = rec;
          else all.push(rec);
        });
        saveReportsToStorage(all);
        showToast(`${data.length}টি রিপোর্ট Import হয়েছে`);
      } else if (data && typeof data === 'object') {
        setReport({ ...createBlankReport(), ...data });
        showToast('রিপোর্ট Import সম্পন্ন হয়েছে');
      }
    } catch {
      showToast('ফাইলটি পড়া যায়নি — সঠিক JSON দিন');
    }
  };

  // Filtered saved reports
  const filteredReports = savedReports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [r.title, r.model, r.product, r.date, r.category].join(' ').toLowerCase().includes(q);
  });

  const parsedDefects = parseLines(report.defects);
  const parsedInitial = parseLines(report.initial);
  const parsedFindings = parseLines(report.findings);
  const parsedImmediate = parseLines(report.immediate);
  const parsedPermanent = parseLines(report.permanent);
  const parsedOcc = parseLines(report.occ);
  const parsedImp = parseLines(report.imp);

  return (
    <div className="space-y-6 pb-16 font-['Hind_Siliguri',sans-serif] text-[#18213a] animate-in fade-in duration-200">
      {/* Top Banner with Title and Action Bar */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#4472c4] text-white flex items-center justify-center shadow-xs shrink-0">
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0d1730] tracking-tight">
                RCA Report Maker
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#eaf2fb] text-[#2f559f] border border-[#cbd5e1]">
                Root Cause Analysis
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Walton Digi-Tech Industries Ltd. &bull; 4M Analysis &bull; Immediate &amp; Permanent CAPA
            </p>
          </div>
        </div>

        {/* Small Screen Mobile Tab Buttons */}
        <div className="flex lg:hidden items-center bg-[#f1f3f8] p-1 rounded-lg border border-[#dfe4ee] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'form' ? 'bg-[#18213a] text-white shadow-xs' : 'text-[#647089]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>এন্ট্রি (Entry)</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('prev')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'prev' ? 'bg-[#18213a] text-white shadow-xs' : 'text-[#647089]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>প্রিভিউ (Preview)</span>
          </button>
        </div>
      </div>

      {/* Visitor View-Only Notice Banner */}
      {!isLoggedIn && (
        <div className="bg-[#eff6ff] border-l-4 border-[#4472c4] p-3.5 rounded-r-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#1e3a8a]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#4472c4] shrink-0" />
            <span>
              <strong>Visitor View Only:</strong> Root Cause Analysis reports are shown in view &amp; export mode.
              Only authorized quality engineers can create new entries, edit problem observations, or save reports.
            </span>
          </div>
          {onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3 py-1 bg-[#4472c4] hover:bg-[#2f559f] text-white font-bold rounded-lg shadow-2xs text-[11px] whitespace-nowrap cursor-pointer transition-colors"
            >
              Inspector Login
            </button>
          )}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-3 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={handleNewReport}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>নতুন রিপোর্ট</span>
            </button>
            <button
              type="button"
              onClick={handleSaveReport}
              className="px-3 py-1.5 bg-[#4472c4] hover:bg-[#2f559f] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেভ করুন</span>
            </button>
          </>
        ) : (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            View Only
          </span>
        )}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>
            সেভ করা রিপোর্ট {savedReports.length > 0 && `(${savedReports.length})`}
          </span>
        </button>

        <span className="w-[1px] h-6 bg-slate-200 hidden sm:block mx-1" />

        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPng}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>PNG ডাউনলোড</span>
        </button>

        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPdf}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5 text-rose-600" />
          <span>PDF ডাউনলোড</span>
        </button>

        <span className="w-[1px] h-6 bg-slate-200 hidden sm:block mx-1" />

        <button
          type="button"
          onClick={handleExportJson}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Export current report as JSON"
        >
          <span>JSON</span>
        </button>

        {isLoggedIn && (
          <button
            type="button"
            onClick={() => fileImportRef.current?.click()}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Import JSON reports"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#cbd5e1] font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Export all saved reports to CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>সব রিপোর্ট CSV</span>
        </button>

        <input
          type="file"
          ref={fileImportRef}
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />

        <div className="flex-1 text-right">
          {toastMessage && (
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded text-xs animate-pulse">
              {toastMessage}
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Layout (Entry Form on Left, Scaled Preview on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,460px)_1fr] gap-6 items-start">
        {/* ================= ENTRY FORM ================= */}
        <div className={`space-y-4 ${mobileTab === 'prev' ? 'hidden lg:block' : 'block'}`}>
          {/* Card 1: Header */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#18213a] pl-2 border-l-4 border-[#4472c4]">
              হেডার (Header)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">কোম্পানির নাম</label>
              <input
                type="text"
                value={report.company}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('company', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">ঠিকানা</label>
              <input
                type="text"
                value={report.address}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#647089]">
              <span className="font-semibold">লোগো:</span>
              <input
                type="file"
                accept="image/*"
                disabled={!isLoggedIn}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const b64 = await readImageFile(f, 500);
                    updateField('logo', b64);
                  } catch {
                    showToast('লোগো লোড করা যায়নি');
                  }
                  e.target.value = '';
                }}
                className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-slate-300 file:text-xs file:bg-white file:font-semibold disabled:opacity-50"
              />
              <button
                type="button"
                disabled={!isLoggedIn || !report.logo}
                onClick={() => updateField('logo', null)}
                className="px-2 py-1 border border-slate-300 bg-white hover:bg-slate-50 rounded text-[11px] font-semibold text-slate-700 disabled:opacity-40"
              >
                ডিফল্ট
              </button>
            </div>
          </div>

          {/* Card 2: Report Information */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#18213a] pl-2 border-l-4 border-[#e01b1b]">
              রিপোর্ট তথ্য (Report Info)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                সমস্যার শিরোনাম <span className="font-normal text-slate-400">(RCA Report: ... এর পরে বসবে)</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: AC Display Defect"
                value={report.title}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-bold text-[#0d1730] disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Category</label>
                <input
                  type="text"
                  placeholder="PCBA"
                  value={report.category}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Reporting Date</label>
                <input
                  type="date"
                  value={report.date}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">Model Name</label>
              <input
                type="text"
                placeholder="যেমন: Common Display"
                value={report.model}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('model', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Product</label>
                <input
                  type="text"
                  placeholder="PCB"
                  value={report.product}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('product', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Quality Management"
                  value={report.dept}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('dept', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Summary */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#18213a] pl-2 border-l-4 border-[#4472c4]">
              Summary &amp; Quantities
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Lot Qty (pcs)</label>
                <input
                  type="text"
                  value={report.lot}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('lot', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-mono font-medium disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Production Qty (pcs)</label>
                <input
                  type="text"
                  value={report.prod}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('prod', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-mono font-medium disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">Delivery Qty (pcs)</label>
                <input
                  type="text"
                  value={report.deliv}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('deliv', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-mono font-medium disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#647089] mb-1">
                  Customer fail Qty <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={report.failQty}
                  disabled={!isLoggedIn}
                  onChange={(e) => updateField('failQty', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-mono font-medium disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Customer fail (%) <span className="text-slate-400 font-normal">&mdash; স্বয়ংক্রিয় হিসাব</span>
              </label>
              <input
                type="text"
                value={report.failPct}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('failPct', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs font-mono font-bold text-rose-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Defect তালিকা <span className="text-slate-400 font-normal">(প্রতি লাইনে একটি)</span>
              </label>
              <textarea
                rows={3}
                value={report.defects}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('defects', e.target.value)}
                placeholder="Display Digit&#10;IR sensor not work&#10;Auto low light"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>

            {/* Defect Images */}
            <div>
              <div className="text-xs font-semibold text-[#647089] mb-1.5">Defect-এর ছবি (Summary Photos)</div>
              {report.imgSummary.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {report.imgSummary.map((src, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img src={src} alt={`Defect ${i + 1}`} className="w-full h-16 object-cover" />
                      {isLoggedIn && (
                        <div className="flex items-center justify-between p-1 bg-white border-t border-slate-200 text-[10px]">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => reorderImage('imgSummary', i, 'left')}
                              disabled={i === 0}
                              className="px-1 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => reorderImage('imgSummary', i, 'right')}
                              disabled={i === report.imgSummary.length - 1}
                              className="px-1 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                            >
                              ›
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage('imgSummary', i)}
                            className="text-rose-600 hover:text-rose-800 font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isLoggedIn && (
                <label className="block border-2 border-dashed border-[#cbd5e1] hover:border-[#4472c4] rounded-lg p-2.5 text-center text-xs text-[#647089] hover:text-[#4472c4] cursor-pointer transition-colors">
                  <span>+ ছবি যোগ করুন (ক্লিক বা ড্রপ)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) addImages('imgSummary', Array.from(e.target.files));
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Card 4: Root Cause (4M & Observations) */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#18213a] pl-2 border-l-4 border-[#e01b1b]">
              Root Cause (মূল কারণ)
            </h3>

            <div>
              <div className="text-xs font-semibold text-[#647089] mb-1.5">Process / Production:</div>
              <div className="flex flex-wrap gap-2">
                <label
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    report.areaProcess
                      ? 'bg-rose-50 border-rose-500 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={report.areaProcess}
                    disabled={!isLoggedIn}
                    onChange={(e) => updateField('areaProcess', e.target.checked)}
                    className="sr-only"
                  />
                  Process
                </label>
                <label
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    report.areaProduction
                      ? 'bg-rose-50 border-rose-500 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={report.areaProduction}
                    disabled={!isLoggedIn}
                    onChange={(e) => updateField('areaProduction', e.target.checked)}
                    className="sr-only"
                  />
                  Production
                </label>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#647089] mb-1.5">4M Classification:</div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['Man', 'm4Man'],
                    ['Machine', 'm4Machine'],
                    ['Method', 'm4Method'],
                    ['Material', 'm4Material'],
                  ] as const
                ).map(([label, key]) => (
                  <label
                    key={key}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                      report[key]
                        ? 'bg-rose-50 border-rose-500 text-rose-600'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={report[key]}
                      disabled={!isLoggedIn}
                      onChange={(e) => updateField(key, e.target.checked)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Initial observation <span className="text-slate-400 font-normal">(প্রতি লাইনে একটি)</span>
              </label>
              <textarea
                rows={3}
                value={report.initial}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('initial', e.target.value)}
                placeholder="Display Digit Not Displaying Properly During Functional Test..."
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Actual Findings <span className="text-slate-400 font-normal">(প্রতি লাইনে একটি)</span>
              </label>
              <textarea
                rows={3}
                value={report.findings}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('findings', e.target.value)}
                placeholder="7-segment display module&#10;Soldering problem"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>

            {/* Root Cause Images */}
            <div>
              <div className="text-xs font-semibold text-[#647089] mb-1.5">Root Cause-এর ছবি (X-Ray, EVO, PCB)</div>
              {report.imgRoot.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {report.imgRoot.map((src, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img src={src} alt={`Root ${i + 1}`} className="w-full h-16 object-cover" />
                      {isLoggedIn && (
                        <div className="flex items-center justify-between p-1 bg-white border-t border-slate-200 text-[10px]">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => reorderImage('imgRoot', i, 'left')}
                              disabled={i === 0}
                              className="px-1 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => reorderImage('imgRoot', i, 'right')}
                              disabled={i === report.imgRoot.length - 1}
                              className="px-1 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                            >
                              ›
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage('imgRoot', i)}
                            className="text-rose-600 hover:text-rose-800 font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isLoggedIn && (
                <label className="block border-2 border-dashed border-[#cbd5e1] hover:border-[#4472c4] rounded-lg p-2.5 text-center text-xs text-[#647089] hover:text-[#4472c4] cursor-pointer transition-colors">
                  <span>+ ছবি যোগ করুন (X-ray / EVO camera)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) addImages('imgRoot', Array.from(e.target.files));
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Card 5: Action Plan */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#18213a] pl-2 border-l-4 border-[#12994a]">
              Action Plan (কার্যক্রম পরিকল্পনা)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Immediate Action <span className="text-slate-400 font-normal">(তাৎক্ষণিক পদক্ষেপ)</span>
              </label>
              <textarea
                rows={3}
                value={report.immediate}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('immediate', e.target.value)}
                placeholder="Collected defective samples & Performed Functional ,X-ray and EVO camera inspection..."
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Permanent Action <span className="text-slate-400 font-normal">(স্থায়ী প্রতিকার)</span>
              </label>
              <textarea
                rows={4}
                value={report.permanent}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('permanent', e.target.value)}
                placeholder="Implement 100% visual inspection after wave soldering.&#10;Update the work instruction..."
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>

            {/* Action Plan Images */}
            <div>
              <div className="text-xs font-semibold text-[#647089] mb-1.5">Action Plan-এর ছবি (Process Flow ইত্যাদি)</div>
              {report.imgAction.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {report.imgAction.map((src, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img src={src} alt={`Action ${i + 1}`} className="w-full h-16 object-cover" />
                      {isLoggedIn && (
                        <div className="flex items-center justify-between p-1 bg-white border-t border-slate-200 text-[10px]">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => reorderImage('imgAction', i, 'left')}
                              disabled={i === 0}
                              className="px-1 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => reorderImage('imgAction', i, 'right')}
                              disabled={i === report.imgAction.length - 1}
                              className="px-1 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                            >
                              ›
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage('imgAction', i)}
                            className="text-rose-600 hover:text-rose-800 font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isLoggedIn && (
                <label className="block border-2 border-dashed border-[#cbd5e1] hover:border-[#4472c4] rounded-lg p-2.5 text-center text-xs text-[#647089] hover:text-[#4472c4] cursor-pointer transition-colors">
                  <span>+ ছবি যোগ করুন (Process Flow chart)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) addImages('imgAction', Array.from(e.target.files));
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Card 6: Responsible */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#18213a] pl-2 border-l-4 border-[#4472c4]">
              Responsible (দায়িত্বশীল বিভাগ)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Occurrence responsible <span className="text-slate-400 font-normal">(ঘটনার দায়িত্ব)</span>
              </label>
              <textarea
                rows={2}
                value={report.occ}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('occ', e.target.value)}
                placeholder="Production&#10;Quality"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#647089] mb-1">
                Improvement responsible <span className="text-slate-400 font-normal">(উন্নয়নের দায়িত্ব)</span>
              </label>
              <textarea
                rows={2}
                value={report.imp}
                disabled={!isLoggedIn}
                onChange={(e) => updateField('imp', e.target.value)}
                placeholder="Quality Management- PCB&amp;PCBA"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-medium disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* ================= LIVE SCALED PREVIEW ================= */}
        <div className={`overflow-x-auto ${mobileTab === 'form' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs mb-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Scaled Report Sheet (1280px Standard)
            </span>
            <span className="hidden sm:inline">স্বয়ংক্রিয়ভাবে স্কেল ও আপডেট হচ্ছে</span>
          </div>

          {/* Scaler Wrapper */}
          <div ref={scalerRef} className="w-full relative transition-all">
            <div
              ref={scalerInRef}
              className="w-[1280px] origin-top-left shadow-lg border border-slate-200 bg-white"
            >
              {/* Actual Report DOM */}
              <div
                ref={reportRef}
                className="w-[1280px] bg-white text-black font-['Times_New_Roman',Times,serif] text-[22px] leading-[1.3] select-text"
              >
                {/* Top Header */}
                <div className="relative text-center py-3.5 px-5 min-h-[92px] text-[25px] leading-[1.28]">
                  <div>{report.company}</div>
                  <div>{report.address}</div>
                  <div className="absolute right-4 top-2.5 text-right font-sans">
                    {report.logo ? (
                      <img src={report.logo} alt="Company Logo" className="max-h-[66px] max-w-[260px] block" />
                    ) : (
                      <>
                        <div className="text-[13px] font-extrabold text-[#1f5fa8] tracking-[1.5px]">
                          WALTON
                        </div>
                        <div className="text-[36px] font-bold text-[#2a74c9] tracking-[1px] leading-[1.05]">
                          DIGITECH
                        </div>
                        <div className="text-[8px] tracking-[3px] text-[#666]">
                          INDUSTRIES LIMITED
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Title Bar (Red) */}
                <div className="flex bg-[#f00] text-white h-[64px] items-stretch">
                  <div className="flex-[0_0_64%] px-4 text-[33px] font-bold border-r-2 border-white flex items-center">
                    ❖ RCA Report: {report.title || '(Title)'}
                  </div>
                  <div className="flex-1 px-6 text-[33px] flex items-center">
                    {report.category || 'PCBA'}
                  </div>
                </div>

                {/* Info Table */}
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr>
                      <th className="bg-[#4472c4] text-white text-[22px] py-2.5 px-1.5 border border-white text-center font-bold">
                        Model Name
                      </th>
                      <th className="bg-[#4472c4] text-white text-[22px] py-2.5 px-1.5 border border-white text-center font-bold">
                        Product
                      </th>
                      <th className="bg-[#4472c4] text-white text-[22px] py-2.5 px-1.5 border border-white text-center font-bold">
                        Department
                      </th>
                      <th className="bg-[#4472c4] text-white text-[22px] py-2.5 px-1.5 border border-white text-center font-bold">
                        Reporting Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="bg-[#cfd5ea] text-[21px] py-2.5 px-2.5 border border-white text-left h-[46px] break-words">
                        {report.model || '—'}
                      </td>
                      <td className="bg-[#cfd5ea] text-[21px] py-2.5 px-2.5 border border-white text-center h-[46px] break-words">
                        {report.product || '—'}
                      </td>
                      <td className="bg-[#cfd5ea] text-[21px] py-2.5 px-2.5 border border-white text-center h-[46px] break-words">
                        {report.dept || '—'}
                      </td>
                      <td className="bg-[#cfd5ea] text-[21px] py-2.5 px-2.5 border border-white text-center h-[46px] break-words">
                        {formatDate(report.date)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Main 4-Column Table */}
                <table className="w-full border-collapse table-fixed mt-[34px]">
                  <colgroup>
                    <col className="w-[20.7%]" />
                    <col className="w-[30%]" />
                    <col className="w-[33%]" />
                    <col className="w-[16.3%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="text-[24px] font-bold py-3.5 px-1.5 border border-black text-center">
                        Summary
                      </th>
                      <th className="text-[24px] font-bold py-3.5 px-1.5 border border-black text-center">
                        Root Cause
                      </th>
                      <th className="text-[24px] font-bold py-3.5 px-1.5 border border-black text-center">
                        Action Plan
                      </th>
                      <th className="text-[24px] font-bold py-3.5 px-1.5 border border-black text-center">
                        Responsible
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* Column 1: Summary */}
                      <td className="border border-black align-top p-0">
                        <div className="p-3.5 space-y-3.5">
                          {report.lot && <div>Lot Qty: {report.lot} pcs</div>}
                          {report.prod && <div>Production Qty: {report.prod} pcs</div>}
                          {report.deliv && <div>Delivery Qty: {report.deliv} pcs</div>}
                          {report.failPct && (
                            <div>
                              Customer fail(%): <b className="text-[#f00]">{report.failPct}%</b>
                            </div>
                          )}
                        </div>
                        <div className="p-3.5 border-t border-black">
                          <div className="text-[#f00] font-bold">Defect:</div>
                          {parsedDefects.length > 0 && (
                            <ol className="my-2 pl-9 list-decimal">
                              {parsedDefects.map((d, i) => (
                                <li key={i} className="my-1 pl-1 break-words">
                                  {d}
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                        {report.imgSummary.length > 0 && (
                          <div className="border-t border-black p-0 space-y-1">
                            {report.imgSummary.map((src, i) => (
                              <img key={i} src={src} alt="Defect" className="w-full block" />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Column 2: Root Cause */}
                      <td className="border border-black align-top p-0">
                        <div className="p-3.5 space-y-3">
                          <div className="font-bold">
                            <span className={report.areaProcess ? 'text-[#f00]' : ''}>Process</span> /{' '}
                            <span className={report.areaProduction ? 'text-[#f00]' : ''}>Production</span>
                          </div>
                          <div className="mb-4">
                            <span className={report.m4Man ? 'text-[#f00]' : ''}>Man</span> /{' '}
                            <span className={report.m4Machine ? 'text-[#f00]' : ''}>Machine</span> /{' '}
                            <span className={report.m4Method ? 'text-[#f00]' : ''}>Method</span> /{' '}
                            <span className={report.m4Material ? 'text-[#f00]' : ''}>Material</span>
                          </div>

                          <div>
                            <div className="text-[#0e6bbf] underline font-bold">Initial observation:</div>
                            {parsedInitial.length > 0 && (
                              <ol className="my-2 pl-9 list-decimal">
                                {parsedInitial.map((item, i) => (
                                  <li key={i} className="my-1 pl-1 break-words">
                                    {item}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>

                          <div>
                            <div className="text-[#1c9a3c] underline font-bold mt-3">Actual Findings:</div>
                            {parsedFindings.length > 0 && (
                              <ol className="my-2 pl-9 list-decimal">
                                {parsedFindings.map((item, i) => (
                                  <li key={i} className="my-1 pl-1 break-words">
                                    {item}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>

                          {report.imgRoot.length > 0 && (
                            <div className="pt-2 space-y-2">
                              {report.imgRoot.map((src, i) => (
                                <img key={i} src={src} alt="Root Cause Analysis" className="w-full block" />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Action Plan */}
                      <td className="border border-black align-top p-0">
                        <div className="p-3.5 space-y-3">
                          <div className="font-bold">
                            <span className="text-[#f00]">Immediate</span>/
                            <span className="text-[#1c9a3c]">Permanent</span>
                          </div>

                          <div>
                            <div className="text-[#f00] underline font-bold">Immediate Action:</div>
                            {parsedImmediate.length > 0 && (
                              <ol className="my-2 pl-9 list-decimal">
                                {parsedImmediate.map((item, i) => (
                                  <li key={i} className="my-1 pl-1 break-words">
                                    {item}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>

                          <div>
                            <div className="text-[#1c9a3c] underline font-bold mt-3">Permanent Action:</div>
                            {parsedPermanent.length > 0 && (
                              <ol className="my-2 pl-9 list-decimal">
                                {parsedPermanent.map((item, i) => (
                                  <li key={i} className="my-1 pl-1 break-words">
                                    {item}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>

                          {report.imgAction.length > 0 && (
                            <div className="pt-2 space-y-2">
                              {report.imgAction.map((src, i) => (
                                <img key={i} src={src} alt="Action Plan" className="w-full block" />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Responsible */}
                      <td className="border border-black align-top p-0">
                        <div className="p-3.5">
                          <div className="text-[#f00] text-[26px] font-bold">Occurrence responsible</div>
                        </div>
                        <div className="p-3.5 text-[19px] border-t border-black">
                          {parsedOcc.length > 0 && (
                            <ol className="my-0 pl-9 list-decimal">
                              {parsedOcc.map((item, i) => (
                                <li key={i} className="my-1 pl-1 break-words">
                                  {item}
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                        <div className="p-3.5 border-t border-black">
                          <div className="text-[#1c9a3c] text-[26px] font-bold">Improvement responsible</div>
                        </div>
                        <div className="p-3.5 text-[19px] border-t border-black">
                          {parsedImp.length > 0 && (
                            <ol className="my-0 pl-9 list-decimal">
                              {parsedImp.map((item, i) => (
                                <li key={i} className="my-1 pl-1 break-words">
                                  {item}
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Spacing at bottom of sheet */}
                <div className="h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Reports Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#18213a]">সেভ করা রিপোর্টসমূহ</h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="search"
                  placeholder="খুঁজুন: শিরোনাম, মডেল, তারিখ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {searchQuery ? 'কোনো রিপোর্ট মেলেনি।' : 'এখনো কোনো রিপোর্ট সেভ করা হয়নি।'}
                </div>
              ) : (
                filteredReports.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                      rec.id === report.id
                        ? 'border-[#4472c4] bg-[#f3f7ff]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenSaved(rec)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-800 line-clamp-1">
                        {rec.title || '(শিরোনাম নেই)'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{rec.model || '—'}</span>
                        <span>&bull;</span>
                        <span>{formatDate(rec.date)}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-blue-600">{rec.category}</span>
                      </div>
                    </button>

                    {isLoggedIn && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDuplicateSaved(rec)}
                          title="কপি করুন"
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSaved(rec)}
                          title="মুছে ফেলুন"
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(savedReports, null, 2)], {
                    type: 'application/json',
                  });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `RCA_all_backup_${getTodayString()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  showToast('Backup JSON ডাউনলোড সম্পন্ন হয়েছে');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
              >
                সব রিপোর্টের Backup (JSON)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <p className="text-xs text-slate-700 leading-relaxed mb-4">{confirmModal.msg}</p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
              >
                না
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-3 py-1.5 bg-[#4472c4] hover:bg-[#2f559f] text-white rounded-lg font-bold shadow-xs"
              >
                হ্যাঁ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
