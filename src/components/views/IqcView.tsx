/**
 * =========================================================================================
 * @file src/components/views/IqcView.tsx
 * @component IqcView
 * @description Incoming Quality Control (IQC) Inspection Report Portal for PCB & PCBA
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Renders Walton Digi-Tech Industries Ltd. comprehensive IQC Inspection Report:
 * - Subsections: Integrated PCB & PCBA inspection reporting and switching.
 * - Basic Information (Report No., Inspection Date, Supplier, Material Type, Part No, PO, GRN, Lot, Quantities).
 * - 8-Item Inspection Checklist with Pass/Fail interactive toggles and remarks.
 * - Defect Details calculation (Scratch, Open, Short, Missing, Wrong, Solder, Cosmetic, Other).
 * - Real-time KPI summary (Total, Accepted, Conditional, Rejected Lots).
 * - Automated quality metric calculations: Acceptance Rate, Rejection Rate, Supplier PPM, Incoming Defect Rate (IDR).
 * - Interactive SVG Defect Pareto Chart.
 * - Supplier Performance Ranking (A, B, C grade badges) and Status Flow.
 * - Document Upload section with image/PDF detection and status selection.
 * - Final Disposition (Accept, Conditional Accept, Reject).
 * - Approval Sign-offs (Inspector, IQC In-Charge, Quality Manager).
 * - LocalStorage draft Save/Restore/Clear, and Print/Save as PDF.
 *
 * ACCESS CONTROL:
 * ---------------
 * Follows Walton QMS role-based permissions:
 * - When `isLoggedIn` is false (visitor view), fields and action buttons are read-only / view-only.
 * - When `isLoggedIn` is true (authorized lead/inspector), full data-entry, drafting, and updates are enabled.
 */

import React, { useState, useEffect, useId } from 'react';
import { PageId } from '../../types';
import {
  ClipboardCheck,
  Save,
  RotateCcw,
  Trash2,
  Printer,
  FileCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
  ShieldCheck,
  Check,
  Upload,
} from 'lucide-react';

interface IqcViewProps {
  onNavigate?: (page: PageId) => void;
  selectedSubsection?: 'all' | 'pcb' | 'pcba';
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

interface ChecklistItem {
  id: number;
  name: string;
  result: 'Pass' | 'Fail' | null;
  remarks: string;
}

interface DefectItem {
  name: string;
  qty: number;
}

interface DocUploadItem {
  name: string;
  type: 'PDF' | 'IMG';
  fileName: string;
  status: 'Pending' | 'Received' | 'Verified' | 'Not Required';
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 1, name: 'Visual Inspection', result: null, remarks: '' },
  { id: 2, name: 'Dimension Verification', result: null, remarks: '' },
  { id: 3, name: 'Specification Verification', result: null, remarks: '' },
  { id: 4, name: 'Open / Short Check', result: null, remarks: '' },
  { id: 5, name: 'Component Verification (PCBA)', result: null, remarks: '' },
  { id: 6, name: 'Solder Quality Check (PCBA)', result: null, remarks: '' },
  { id: 7, name: 'Functional Test (If Applicable)', result: null, remarks: '' },
  { id: 8, name: 'Packaging Condition', result: null, remarks: '' },
];

const INITIAL_DEFECTS_A: DefectItem[] = [
  { name: 'Scratch', qty: 0 },
  { name: 'Open Circuit', qty: 0 },
  { name: 'Short Circuit', qty: 0 },
  { name: 'Missing Component', qty: 0 },
];

const INITIAL_DEFECTS_B: DefectItem[] = [
  { name: 'Wrong Component', qty: 0 },
  { name: 'Solder Defect', qty: 0 },
  { name: 'Cosmetic Defect', qty: 0 },
  { name: 'Other', qty: 0 },
];

const INITIAL_DOCS: DocUploadItem[] = [
  { name: 'Supplier COA', type: 'PDF', fileName: '', status: 'Pending' },
  { name: 'Test Report', type: 'PDF', fileName: '', status: 'Pending' },
  { name: 'Inspection Photos', type: 'IMG', fileName: '', status: 'Pending' },
  { name: 'X-Ray Report', type: 'PDF', fileName: '', status: 'Pending' },
  { name: 'Push Test Report', type: 'PDF', fileName: '', status: 'Pending' },
  { name: 'Reliability Test Report', type: 'PDF', fileName: '', status: 'Pending' },
  { name: 'NCR (If Any)', type: 'PDF', fileName: '', status: 'Pending' },
];

const SUPPLIER_RANKINGS = [
  { supplier: 'Supplier-A', lots: 15, reject: 1, rating: 'A', class: 'bg-[#22a45d]' },
  { supplier: 'Supplier-B', lots: 10, reject: 2, rating: 'B', class: 'bg-[#f2b134]' },
  { supplier: 'Supplier-C', lots: 8, reject: 3, rating: 'C', class: 'bg-[#e2231a]' },
];

const STATUS_FLOW = [
  { step: 'Received', status: 'done' },
  { step: 'IQC Inspection', status: 'done' },
  { step: 'Document Review', status: 'done' },
  { step: 'Decision', status: 'current' },
  { step: 'Approval', status: 'final' },
  { step: 'Store Release', status: 'final' },
];

const STORAGE_KEY = 'walton-iqc-draft-v1';

export const IqcView: React.FC<IqcViewProps> = ({
  onNavigate,
  selectedSubsection = 'all',
  isLoggedIn = false,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pcb' | 'pcba'>(selectedSubsection);

  // Form State
  const [reportNo, setReportNo] = useState('IQC-2025-0001');
  const [inspDate, setInspDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('Supplier-A');
  const [material, setMaterial] = useState<'PCB' | 'PCBA' | 'Component' | 'Solder Paste'>('PCB');
  const [partNo, setPartNo] = useState('WLT-PCB-8842-V3');
  const [model, setModel] = useState('WALTON-PRIME-2026');
  const [poNo, setPoNo] = useState('PO-2026-8941');
  const [grnNo, setGrnNo] = useState('GRN-44912');
  const [lotNo, setLotNo] = useState('LOT-2026-08-01');
  const [recvQty, setRecvQty] = useState<number | ''>(5000);
  const [sampleQty, setSampleQty] = useState<number | ''>(125);

  // Summary Tiles
  const [totalLots, setTotalLots] = useState<number | ''>(25);
  const [acceptedLots, setAcceptedLots] = useState<number | ''>(20);
  const [condLots, setCondLots] = useState<number | ''>(1);
  const [rejectedLots, setRejectedLots] = useState<number | ''>(4);

  // Checklist & Defects
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [defectsA, setDefectsA] = useState<DefectItem[]>(INITIAL_DEFECTS_A);
  const [defectsB, setDefectsB] = useState<DefectItem[]>(INITIAL_DEFECTS_B);
  const [docs, setDocs] = useState<DocUploadItem[]>(INITIAL_DOCS);
  const [finalResult, setFinalResult] = useState<'Accept' | 'Conditional Accept' | 'Reject'>('Accept');
  const [remarks, setRemarks] = useState('');

  // Signatures
  const [signInspName, setSignInspName] = useState('Engr. Atikur Rahman');
  const [signInspDate, setSignInspDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [signIcName, setSignIcName] = useState('M. H. Rasel');
  const [signIcDate, setSignIcDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [signQmName, setSignQmName] = useState('Dr. K. Alam');
  const [signQmDate, setSignQmDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Toast / Feedback message
  const [notice, setNotice] = useState<string>('');

  // Sync tab with props if parent changes
  useEffect(() => {
    if (selectedSubsection) {
      setActiveTab(selectedSubsection);
      if (selectedSubsection === 'pcb') {
        setMaterial('PCB');
      } else if (selectedSubsection === 'pcba') {
        setMaterial('PCBA');
      }
    }
  }, [selectedSubsection]);

  const showFlash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice('');
    }, 3200);
  };

  // Calculations
  const tLots = Number(totalLots) || 0;
  const aLots = Number(acceptedLots) || 0;
  const cLots = Number(condLots) || 0;
  const rLots = Number(rejectedLots) || 0;
  const sQty = Number(sampleQty) || 0;

  const acceptRate = tLots ? (((aLots + cLots) / tLots) * 100).toFixed(1) : '0.0';
  const rejectRate = tLots ? ((rLots / tLots) * 100).toFixed(1) : '0.0';

  const totalDefectsCount =
    defectsA.reduce((s, d) => s + (Number(d.qty) || 0), 0) +
    defectsB.reduce((s, d) => s + (Number(d.qty) || 0), 0);

  const ppm = sQty ? Math.round((totalDefectsCount / sQty) * 1000000) : 0;
  const idr = sQty ? ((totalDefectsCount / sQty) * 100).toFixed(2) : '0.00';

  // Toggle Checklist
  const handleToggleChecklist = (id: number, val: 'Pass' | 'Fail') => {
    if (!isLoggedIn) return;
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, result: item.result === val ? null : val };
        }
        return item;
      })
    );
  };

  const handleChecklistRemarkChange = (id: number, val: string) => {
    if (!isLoggedIn) return;
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remarks: val } : item))
    );
  };

  // Defect updates
  const handleDefectChange = (group: 'A' | 'B', name: string, qty: number) => {
    if (!isLoggedIn) return;
    if (group === 'A') {
      setDefectsA((prev) => prev.map((d) => (d.name === name ? { ...d, qty } : d)));
    } else {
      setDefectsB((prev) => prev.map((d) => (d.name === name ? { ...d, qty } : d)));
    }
  };

  // Doc updates
  const handleDocStatusChange = (name: string, status: DocUploadItem['status']) => {
    if (!isLoggedIn) return;
    setDocs((prev) => prev.map((d) => (d.name === name ? { ...d, status } : d)));
  };

  const handleFileUpload = (name: string, file: File | null) => {
    if (!isLoggedIn || !file) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.name === name
          ? { ...d, fileName: file.name, status: d.status === 'Pending' ? 'Received' : d.status }
          : d
      )
    );
    showFlash(`Uploaded ${file.name}`);
  };

  // Save draft
  const handleSaveDraft = () => {
    if (!isLoggedIn) return;
    try {
      const draft = {
        savedAt: new Date().toISOString(),
        reportNo,
        inspDate,
        supplier,
        material,
        partNo,
        model,
        poNo,
        grnNo,
        lotNo,
        recvQty,
        sampleQty,
        totalLots,
        acceptedLots,
        condLots,
        rejectedLots,
        checklist,
        defectsA,
        defectsB,
        docs,
        finalResult,
        remarks,
        signInspName,
        signInspDate,
        signIcName,
        signIcDate,
        signQmName,
        signQmDate,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      showFlash('Draft successfully saved in this browser.');
    } catch {
      showFlash('Browser storage unavailable.');
    }
  };

  // Restore draft
  const handleRestoreDraft = () => {
    if (!isLoggedIn) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showFlash('No saved draft found.');
        return;
      }
      const d = JSON.parse(raw);
      if (d.reportNo) setReportNo(d.reportNo);
      if (d.inspDate) setInspDate(d.inspDate);
      if (d.supplier) setSupplier(d.supplier);
      if (d.material) setMaterial(d.material);
      if (d.partNo) setPartNo(d.partNo);
      if (d.model) setModel(d.model);
      if (d.poNo) setPoNo(d.poNo);
      if (d.grnNo) setGrnNo(d.grnNo);
      if (d.lotNo) setLotNo(d.lotNo);
      if (d.recvQty !== undefined) setRecvQty(d.recvQty);
      if (d.sampleQty !== undefined) setSampleQty(d.sampleQty);
      if (d.totalLots !== undefined) setTotalLots(d.totalLots);
      if (d.acceptedLots !== undefined) setAcceptedLots(d.acceptedLots);
      if (d.condLots !== undefined) setCondLots(d.condLots);
      if (d.rejectedLots !== undefined) setRejectedLots(d.rejectedLots);
      if (d.checklist) setChecklist(d.checklist);
      if (d.defectsA) setDefectsA(d.defectsA);
      if (d.defectsB) setDefectsB(d.defectsB);
      if (d.docs) setDocs(d.docs);
      if (d.finalResult) setFinalResult(d.finalResult);
      if (d.remarks !== undefined) setRemarks(d.remarks);
      if (d.signInspName) setSignInspName(d.signInspName);
      if (d.signInspDate) setSignInspDate(d.signInspDate);
      if (d.signIcName) setSignIcName(d.signIcName);
      if (d.signIcDate) setSignIcDate(d.signIcDate);
      if (d.signQmName) setSignQmName(d.signQmName);
      if (d.signQmDate) setSignQmDate(d.signQmDate);
      showFlash(`Draft restored from ${new Date(d.savedAt).toLocaleTimeString()}.`);
    } catch {
      showFlash('Could not restore draft.');
    }
  };

  // Clear form
  const handleClearForm = () => {
    if (!isLoggedIn) return;
    setReportNo('IQC-2025-0001');
    setSupplier('Supplier-A');
    setPartNo('');
    setModel('');
    setPoNo('');
    setGrnNo('');
    setLotNo('');
    setRecvQty('');
    setSampleQty('');
    setChecklist(INITIAL_CHECKLIST);
    setDefectsA(INITIAL_DEFECTS_A);
    setDefectsB(INITIAL_DEFECTS_B);
    setDocs(INITIAL_DOCS);
    setRemarks('');
    setFinalResult('Accept');
    showFlash('Form cleared.');
  };

  // Build Pareto SVG items
  const allDefects = [...defectsA, ...defectsB].filter((d) => d.qty > 0);
  allDefects.sort((a, b) => b.qty - a.qty);
  const topDefects = allDefects.slice(0, 5);
  const paretoSum = topDefects.reduce((s, d) => s + d.qty, 0);

  const PALETTE = ['#1565c0', '#22a45d', '#f2b134', '#7e57c2', '#26a69a'];
  const svgW = 260;
  const svgH = 150;
  const padL = 28;
  const padR = 8;
  const padT = 12;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* Top Banner & Sub-Section Navigation */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#123a6b] text-white flex items-center justify-center shadow-xs shrink-0">
            <ClipboardCheck className="w-6 h-6 text-[#93c5fd]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0d1730] tracking-tight">
                IQC Inspection Hub
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#eaf2fb] text-[#123a6b] border border-[#cbd5e1]">
                Incoming Quality Control
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Material Quality Verification &bull; IPC-A-610 Class 2/3 &bull; Walton Digi-Tech Industries
            </p>
          </div>
        </div>

        {/* Subsection Switcher: All / PCB / PCBA */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              if (onNavigate) onNavigate('iqc');
            }}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#123a6b] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0d1730] hover:bg-white/60'
            }`}
          >
            All IQC
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('pcb');
              setMaterial('PCB');
              if (onNavigate) onNavigate('iqc-pcb');
            }}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pcb'
                ? 'bg-[#e35b2a] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0d1730] hover:bg-white/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>1. PCB</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('pcba');
              setMaterial('PCBA');
              if (onNavigate) onNavigate('iqc-pcba');
            }}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pcba'
                ? 'bg-[#1565c0] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0d1730] hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. PCBA</span>
          </button>
        </div>
      </div>

      {/* Access Notice Banner for Visitors */}
      {!isLoggedIn && (
        <div className="bg-[#eff6ff] border-l-4 border-[#1565c0] p-3.5 rounded-r-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#1e3a8a]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1565c0] shrink-0" />
            <span>
              <strong>Visitor View Only:</strong> IQC inspection records and analytics are shown in read-only mode.
              Only authorized logged-in quality inspectors can edit data, upload test reports, or record lot acceptances.
            </span>
          </div>
          {onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3 py-1 bg-[#1565c0] hover:bg-[#0d47a1] text-white font-bold rounded-lg shadow-2xs text-[11px] whitespace-nowrap cursor-pointer transition-colors"
            >
              Inspector Login
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-[#cbd5e1] shadow-2xs">
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 bg-[#123a6b] hover:bg-[#1565c0] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#123a6b] border border-[#cbd5e1] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#1565c0]" />
              <span>Restore Draft</span>
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
          </>
        ) : (
          <span className="text-xs font-semibold text-[#64748b] flex items-center gap-1.5 px-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Inspection Form (Read Only Mode)
          </span>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#334155] border border-[#cbd5e1] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Print / PDF</span>
        </button>

        <div className="flex-1 text-right">
          {notice && (
            <span className="text-xs font-semibold text-emerald-600 animate-pulse bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {notice}
            </span>
          )}
        </div>
      </div>

      {/* Main Integrated IQC Report Document Sheet */}
      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-md overflow-hidden text-[#1c2733]">
        {/* Masthead Header */}
        <div className="flex flex-col md:flex-row items-stretch border-b border-[#cbd5e1]">
          {/* Brand Left */}
          <div className="flex-1 p-5 sm:p-6 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#cbd5e1]">
            <svg className="shrink-0" width="96" height="38" viewBox="0 0 118 46" role="img" aria-label="Walton">
              <path
                d="M6 4 L22 4 L30 22 L38 4 L50 4 L58 22 L66 4 L82 4 L64 40 L52 40 L44 22 L36 40 L24 40 Z"
                fill="#1565c0"
              />
              <path d="M50 4 L66 4 L58 22 Z" fill="#e2231a" />
              <text
                x="6"
                y="45"
                fontFamily="'Barlow Condensed', Inter, sans-serif"
                fontSize="13"
                fontWeight="700"
                letterSpacing="3.6"
                fill="#1565c0"
              >
                WALTON
              </text>
            </svg>
            <div className="w-[1px] h-12 bg-[#cbd5e1] hidden sm:block" />
            <div>
              <h1 className="font-['Barlow_Condensed'] font-bold text-2xl sm:text-3xl text-[#123a6b] tracking-wide leading-tight">
                WALTON DIGI-TECH INDUSTRIES LTD.
              </h1>
              <p className="text-xs font-semibold text-[#1565c0] mt-0.5 tracking-wide">
                Quality Management &mdash; PCB &amp; PCBA
              </p>
            </div>
          </div>

          {/* Title Block Right */}
          <div className="bg-[#0d2c53] text-white p-5 sm:p-6 flex items-center gap-4 min-w-[38%] relative">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-bold tracking-wide">
                IQC INSPECTION REPORT
              </h2>
              <p className="text-[11px] text-[#93c5fd] italic mt-0.5">
                Better Quality &nbsp;|&nbsp; Safer Product &nbsp;|&nbsp; Brighter Future
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Grid Content */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#f8fafc]">
          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-[#123a6b] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                <Info className="w-4 h-4 text-[#93c5fd]" />
                <span>Basic Information</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-white/15 font-mono text-white/90">
                  {material} Material
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Left Pane */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Report No.</label>
                    <input
                      type="text"
                      value={reportNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setReportNo(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white font-mono text-xs disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Insp. Date</label>
                    <input
                      type="date"
                      value={inspDate}
                      disabled={!isLoggedIn}
                      onChange={(e) => setInspDate(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Supplier</label>
                    <select
                      value={supplier}
                      disabled={!isLoggedIn}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="Supplier-A">Supplier-A (Apex PCB Tech)</option>
                      <option value="Supplier-B">Supplier-B (Global Electronics)</option>
                      <option value="Supplier-C">Supplier-C (Delta Component)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Material Type</label>
                    <select
                      value={material}
                      disabled={!isLoggedIn}
                      onChange={(e) => setMaterial(e.target.value as any)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs font-bold text-[#123a6b] disabled:bg-slate-50"
                    >
                      <option value="PCB">PCB (Printed Circuit Board)</option>
                      <option value="PCBA">PCBA (Assembly Sub-Module)</option>
                      <option value="Component">Component (SMD/DIP)</option>
                      <option value="Solder Paste">Solder Paste / Flux</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Part No.</label>
                    <input
                      type="text"
                      value={partNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setPartNo(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="Enter part no..."
                    />
                  </div>
                </div>

                {/* Right Pane */}
                <div className="space-y-2.5 sm:border-l sm:border-[#e2e8f0] sm:pl-4">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Model Name</label>
                    <input
                      type="text"
                      value={model}
                      disabled={!isLoggedIn}
                      onChange={(e) => setModel(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">PO No.</label>
                    <input
                      type="text"
                      value={poNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setPoNo(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">GRN No.</label>
                    <input
                      type="text"
                      value={grnNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setGrnNo(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Lot No.</label>
                    <input
                      type="text"
                      value={lotNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setLotNo(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Recv. Qty</label>
                    <input
                      type="number"
                      value={recvQty}
                      disabled={!isLoggedIn}
                      onChange={(e) => setRecvQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs font-bold disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Sample Qty</label>
                    <input
                      type="number"
                      value={sampleQty}
                      disabled={!isLoggedIn}
                      onChange={(e) => setSampleQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-2.5 py-1.5 border border-[#cbd5e1] rounded bg-white text-xs font-bold text-[#1565c0] disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Checklist Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-[#123a6b] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                <ClipboardCheck className="w-4 h-4 text-[#93c5fd]" />
                <span>Inspection Checklist (IPC-A-610)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#eaf2fb] text-[#123a6b] font-bold border-b border-[#cbd5e1]">
                      <th className="p-2.5 text-center w-10">No.</th>
                      <th className="p-2.5">Inspection Item</th>
                      <th className="p-2.5 text-center w-40">Result</th>
                      <th className="p-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {checklist.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 text-center font-mono text-slate-500 font-semibold">{item.id}</td>
                        <td className="p-2.5 font-medium text-[#1565c0]">{item.name}</td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex gap-1.5">
                            <button
                              type="button"
                              disabled={!isLoggedIn}
                              onClick={() => handleToggleChecklist(item.id, 'Pass')}
                              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                                item.result === 'Pass'
                                  ? 'bg-[#22a45d] text-white border-[#22a45d]'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-[#22a45d] hover:text-[#22a45d]'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              Pass
                            </button>
                            <button
                              type="button"
                              disabled={!isLoggedIn}
                              onClick={() => handleToggleChecklist(item.id, 'Fail')}
                              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                                item.result === 'Fail'
                                  ? 'bg-[#e2231a] text-white border-[#e2231a]'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-[#e2231a] hover:text-[#e2231a]'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              Fail
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.remarks}
                            disabled={!isLoggedIn}
                            onChange={(e) => handleChecklistRemarkChange(item.id, e.target.value)}
                            placeholder="Enter remarks..."
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Defect Details Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-[#123a6b] text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs uppercase tracking-wide">
                <span>Defect Details &amp; Quantity</span>
                <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded text-white">
                  Total Defects: {totalDefectsCount}
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Group A */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#eaf2fb] text-[#123a6b] font-bold">
                      <th className="p-2 text-left">Defect Type</th>
                      <th className="p-2 text-right w-24">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {defectsA.map((d) => (
                      <tr key={d.name}>
                        <td className="p-2 text-slate-700 font-medium">{d.name}</td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={d.qty}
                            disabled={!isLoggedIn}
                            onChange={(e) => handleDefectChange('A', d.name, Number(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-right font-mono text-xs font-bold disabled:bg-slate-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Group B */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#eaf2fb] text-[#123a6b] font-bold">
                      <th className="p-2 text-left">Defect Type</th>
                      <th className="p-2 text-right w-24">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {defectsB.map((d) => (
                      <tr key={d.name}>
                        <td className="p-2 text-slate-700 font-medium">{d.name}</td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={d.qty}
                            disabled={!isLoggedIn}
                            onChange={(e) => handleDefectChange('B', d.name, Number(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-right font-mono text-xs font-bold disabled:bg-slate-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Result Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-[#123a6b] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-[#93c5fd]" />
                <span>Final Quality Disposition</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer font-bold text-xs transition-colors ${
                    finalResult === 'Accept'
                      ? 'border-[#22a45d] bg-[#22a45d]/10 text-[#22a45d]'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="finalResult"
                    value="Accept"
                    disabled={!isLoggedIn}
                    checked={finalResult === 'Accept'}
                    onChange={() => setFinalResult('Accept')}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      finalResult === 'Accept' ? 'border-[#22a45d] bg-[#22a45d]' : 'border-slate-400'
                    }`}
                  >
                    {finalResult === 'Accept' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Accept</span>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer font-bold text-xs transition-colors ${
                    finalResult === 'Conditional Accept'
                      ? 'border-[#f2b134] bg-[#f2b134]/15 text-[#b45309]'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="finalResult"
                    value="Conditional Accept"
                    disabled={!isLoggedIn}
                    checked={finalResult === 'Conditional Accept'}
                    onChange={() => setFinalResult('Conditional Accept')}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      finalResult === 'Conditional Accept' ? 'border-[#f2b134] bg-[#f2b134]' : 'border-slate-400'
                    }`}
                  >
                    {finalResult === 'Conditional Accept' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Conditional Accept</span>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer font-bold text-xs transition-colors ${
                    finalResult === 'Reject'
                      ? 'border-[#e2231a] bg-[#e2231a]/10 text-[#e2231a]'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="finalResult"
                    value="Reject"
                    disabled={!isLoggedIn}
                    checked={finalResult === 'Reject'}
                    onChange={() => setFinalResult('Reject')}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      finalResult === 'Reject' ? 'border-[#e2231a] bg-[#e2231a]' : 'border-slate-400'
                    }`}
                  >
                    {finalResult === 'Reject' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Reject</span>
                </label>
              </div>

              {/* Remarks Field */}
              <div className="px-4 pb-4">
                <label className="block font-semibold text-xs text-[#475569] mb-1">
                  General Remarks / Segregation Instructions
                </label>
                <textarea
                  value={remarks}
                  disabled={!isLoggedIn}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  placeholder="Enter remarks, containment, quarantine instructions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Approval Signatures */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs p-4">
              <div className="text-xs font-bold text-[#123a6b] uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">
                Authorized Signatures &amp; Verification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-slate-200 rounded-lg p-3 bg-[#f8fafc]">
                  <h4 className="font-bold text-[#123a6b] text-center mb-2">Inspector</h4>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[11px] text-slate-500">Name:</span>
                      <input
                        type="text"
                        value={signInspName}
                        disabled={!isLoggedIn}
                        onChange={(e) => setSignInspName(e.target.value)}
                        className="w-full px-1.5 py-0.5 border-b border-slate-300 bg-transparent text-xs font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Date:</span>
                      <input
                        type="date"
                        value={signInspDate}
                        disabled={!isLoggedIn}
                        onChange={(e) => setSignInspDate(e.target.value)}
                        className="w-full px-1.5 py-0.5 border-b border-slate-300 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-[#f8fafc]">
                  <h4 className="font-bold text-[#123a6b] text-center mb-2">IQC In-Charge</h4>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[11px] text-slate-500">Name:</span>
                      <input
                        type="text"
                        value={signIcName}
                        disabled={!isLoggedIn}
                        onChange={(e) => setSignIcName(e.target.value)}
                        className="w-full px-1.5 py-0.5 border-b border-slate-300 bg-transparent text-xs font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Date:</span>
                      <input
                        type="date"
                        value={signIcDate}
                        disabled={!isLoggedIn}
                        onChange={(e) => setSignIcDate(e.target.value)}
                        className="w-full px-1.5 py-0.5 border-b border-slate-300 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-[#f8fafc]">
                  <h4 className="font-bold text-[#123a6b] text-center mb-2">Quality Manager</h4>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[11px] text-slate-500">Name:</span>
                      <input
                        type="text"
                        value={signQmName}
                        disabled={!isLoggedIn}
                        onChange={(e) => setSignQmName(e.target.value)}
                        className="w-full px-1.5 py-0.5 border-b border-slate-300 bg-transparent text-xs font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Date:</span>
                      <input
                        type="date"
                        value={signQmDate}
                        disabled={!isLoggedIn}
                        onChange={(e) => setSignQmDate(e.target.value)}
                        className="w-full px-1.5 py-0.5 border-b border-slate-300 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-6">
            {/* Document Upload Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-[#123a6b] text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#93c5fd]" />
                  <span>Document &amp; Certificate Upload</span>
                </div>
                <span className="text-[10px] text-white/80">COA &bull; X-Ray &bull; Push Test</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#eaf2fb] text-[#123a6b] font-bold border-b border-[#cbd5e1]">
                      <th className="p-2.5">Document Type</th>
                      <th className="p-2.5">File Upload</th>
                      <th className="p-2.5 w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {docs.map((doc, idx) => (
                      <tr key={doc.name} className="hover:bg-slate-50/70">
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-5 rounded text-[8.5px] font-bold text-white flex items-center justify-center shrink-0 ${
                                doc.type === 'IMG' ? 'bg-[#1565c0]' : 'bg-[#e2231a]'
                              }`}
                            >
                              {doc.type}
                            </span>
                            <span className="font-semibold text-slate-800">{doc.name}</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`file-upload-${idx}`}
                              className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors ${
                                isLoggedIn
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 cursor-pointer'
                                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Choose File
                            </label>
                            <input
                              id={`file-upload-${idx}`}
                              type="file"
                              disabled={!isLoggedIn}
                              accept={doc.type === 'IMG' ? 'image/*' : 'application/pdf'}
                              onChange={(e) => handleFileUpload(doc.name, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                              {doc.fileName || 'No file chosen'}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <select
                            value={doc.status}
                            disabled={!isLoggedIn}
                            onChange={(e) => handleDocStatusChange(doc.name, e.target.value as any)}
                            className="w-full px-2 py-1 rounded border border-slate-300 text-[11px] font-medium bg-white disabled:bg-slate-50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                            <option value="Verified">Verified</option>
                            <option value="Not Required">Not Required</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Summary Tiles */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#123a6b] via-[#123a6b] to-[#1a4c8a] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                Monthly Lot Inspection Summary
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1565c0] text-white p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-xs">
                  <span className="text-[11px] font-bold text-center leading-tight">Total Lots<br />Received</span>
                  <input
                    type="number"
                    min="0"
                    value={totalLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setTotalLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 bg-white/20 border border-white/40 text-white font-['Barlow_Condensed'] font-bold text-2xl text-center rounded py-0.5 focus:outline-none"
                  />
                </div>

                <div className="bg-[#22a45d] text-white p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-xs">
                  <span className="text-[11px] font-bold text-center leading-tight">Accepted<br />Lots</span>
                  <input
                    type="number"
                    min="0"
                    value={acceptedLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setAcceptedLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 bg-white/20 border border-white/40 text-white font-['Barlow_Condensed'] font-bold text-2xl text-center rounded py-0.5 focus:outline-none"
                  />
                </div>

                <div className="bg-[#f2b134] text-white p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-xs">
                  <span className="text-[11px] font-bold text-center leading-tight">Conditional<br />Accept</span>
                  <input
                    type="number"
                    min="0"
                    value={condLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setCondLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 bg-white/20 border border-white/40 text-white font-['Barlow_Condensed'] font-bold text-2xl text-center rounded py-0.5 focus:outline-none"
                  />
                </div>

                <div className="bg-[#e2231a] text-white p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-xs">
                  <span className="text-[11px] font-bold text-center leading-tight">Rejected<br />Lots</span>
                  <input
                    type="number"
                    min="0"
                    value={rejectedLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setRejectedLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 bg-white/20 border border-white/40 text-white font-['Barlow_Condensed'] font-bold text-2xl text-center rounded py-0.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Performance KPIs & Pareto Chart Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quality Performance */}
              <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
                <div className="bg-[#123a6b] text-white px-3 py-2 font-bold text-xs uppercase tracking-wide">
                  Quality Performance
                </div>
                <div className="p-3">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 text-slate-600 font-medium">Acceptance Rate</td>
                        <td className="py-2 text-right font-extrabold text-[#22a45d]">{acceptRate}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-600 font-medium">Rejection Rate</td>
                        <td className="py-2 text-right font-extrabold text-[#e2231a]">{rejectRate}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-600 font-medium">Supplier PPM</td>
                        <td className="py-2 text-right font-extrabold text-[#123a6b]">
                          {ppm > 0 ? ppm.toLocaleString() : '&mdash;'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-600 font-medium">Incoming Defect Rate</td>
                        <td className="py-2 text-right font-extrabold text-[#1565c0]">
                          {sQty > 0 ? `${idr}%` : '&mdash;'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Defect Pareto Chart */}
              <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
                <div className="bg-[#123a6b] text-white px-3 py-2 font-bold text-xs uppercase tracking-wide">
                  Defect Pareto Distribution
                </div>
                <div className="p-3 flex items-center justify-center">
                  <svg className="w-full h-auto" viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Defect Pareto chart">
                    {/* Gridlines */}
                    {[0, 10, 20, 30, 40].map((p) => {
                      const y = padT + plotH - (p / 40) * plotH;
                      return (
                        <g key={p}>
                          <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                          <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="7.5" fill="#64748b">
                            {p}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {paretoSum > 0 ? (
                      topDefects.map((d, i) => {
                        const pct = (d.qty / paretoSum) * 100;
                        const slot = plotW / topDefects.length;
                        const bw = Math.min(26, slot * 0.6);
                        const h = Math.max(3, (Math.min(pct, 40) / 40) * plotH);
                        const x = padL + slot * i + (slot - bw) / 2;
                        const y = padT + plotH - h;
                        const words = d.name.split(' ');

                        return (
                          <g key={d.name}>
                            <rect
                              x={x}
                              y={y}
                              width={bw}
                              height={h}
                              fill={PALETTE[i % PALETTE.length]}
                              rx="2"
                            />
                            <text
                              x={x + bw / 2}
                              y={y - 3}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="700"
                              fill="#0d1730"
                            >
                              {Math.round(pct)}%
                            </text>
                            {words.slice(0, 2).map((w, k) => (
                              <text
                                key={k}
                                x={x + bw / 2}
                                y={padT + plotH + 11 + k * 8}
                                textAnchor="middle"
                                fontSize="7.2"
                                fill="#64748b"
                              >
                                {w}
                              </text>
                            ))}
                          </g>
                        );
                      })
                    ) : (
                      <text
                        x={padL + plotW / 2}
                        y={padT + plotH / 2}
                        textAnchor="middle"
                        fontSize="8.5"
                        fill="#94a3b8"
                      >
                        Enter defect quantities to plot Pareto
                      </text>
                    )}

                    {/* Bottom Axis */}
                    <line
                      x1={padL}
                      y1={padT + plotH}
                      x2={svgW - padR}
                      y2={padT + plotH}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Supplier Ranking & Status Flow Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Supplier Ranking */}
              <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
                <div className="bg-[#123a6b] text-white px-3 py-2 font-bold text-xs uppercase tracking-wide">
                  Supplier Ranking
                </div>
                <div className="p-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-1.5 text-left">Supplier</th>
                        <th className="p-1.5 text-center">Lots</th>
                        <th className="p-1.5 text-center">Rej</th>
                        <th className="p-1.5 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {SUPPLIER_RANKINGS.map((s) => (
                        <tr key={s.supplier}>
                          <td className="p-1.5 font-medium text-slate-800">{s.supplier}</td>
                          <td className="p-1.5 text-center font-mono">{s.lots}</td>
                          <td className="p-1.5 text-center font-mono font-bold text-[#e2231a]">{s.reject}</td>
                          <td className="p-1.5 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-[10px] ${s.class}`}>
                              {s.rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Flow */}
              <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
                <div className="bg-[#123a6b] text-white px-3 py-2 font-bold text-xs uppercase tracking-wide">
                  Inspection Stage Flow
                </div>
                <ul className="p-3 space-y-2 text-xs">
                  {STATUS_FLOW.map((f, idx) => (
                    <li key={f.step} className="flex items-center gap-2.5">
                      <span
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          f.status === 'done'
                            ? 'bg-[#1565c0]'
                            : f.status === 'current'
                            ? 'bg-[#f2b134] ring-2 ring-[#f2b134]/30 animate-pulse'
                            : 'bg-[#22a45d]'
                        }`}
                      />
                      <span className={`font-semibold ${f.status === 'current' ? 'text-[#b45309]' : 'text-slate-700'}`}>
                        {idx + 1}. {f.step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footnote Card */}
            <div className="bg-[#eaf2fb] border border-[#cbd5e1] rounded-xl p-3 flex items-center justify-between text-xs text-[#123a6b] font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1565c0]" />
                This report is generated for PCB &amp; PCBA IQC inspection.
              </span>
              <span className="font-mono text-[11px] text-[#1565c0]">Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
