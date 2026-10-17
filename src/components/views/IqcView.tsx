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

import React, { useState, useEffect, useId, useMemo } from 'react';
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
  RefreshCw,
  Eye,
  Edit2,
  Loader2,
  BookmarkCheck,
  FileText,
  X,
  Search,
  Plus,
} from 'lucide-react';
import { WaltonSealLogo } from '../WaltonSealLogo';
import {
  saveIqcReport,
  createIqcReport,
  getIqcReports,
  deleteIqcReport,
  subscribeIqcReports,
  updateIqcReport,
  seedBaselineIqcReportsIfEmpty,
  IqcReportRecord,
} from '../../services/iqcReports';

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
  type IqcTab = 'all' | 'history' | 'pcb' | 'pcba';
  const [activeTab, setActiveTab] = useState<IqcTab>(
    selectedSubsection === 'pcb' || selectedSubsection === 'pcba' ? selectedSubsection : 'all'
  );

  // Firestore Historical Reports state (collection: iqc_reports)
  const [historicalReports, setHistoricalReports] = useState<IqcReportRecord[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Search & Filter for Historical Table
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyMaterialFilter, setHistoryMaterialFilter] = useState<string>('all');
  const [historyResultFilter, setHistoryResultFilter] = useState<string>('all');

  // Form State
  const [reportNo, setReportNo] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [material, setMaterial] = useState<'' | 'PCB' | 'PCBA' | 'Component' | 'Solder Paste'>('');
  const [partNo, setPartNo] = useState('');
  const [model, setModel] = useState('');
  const [poNo, setPoNo] = useState('');
  const [grnNo, setGrnNo] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [recvQty, setRecvQty] = useState<number | ''>('');
  const [sampleQty, setSampleQty] = useState<number | ''>('');

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
    }
  }, [selectedSubsection]);

  // Real-time Cloud Firestore subscription for iqc_reports (Source of Truth)
  useEffect(() => {
    seedBaselineIqcReportsIfEmpty().catch(() => {});
    const unsub = subscribeIqcReports(
      (list) => {
        setHistoricalReports(list);
        setLoadingReports(false);
        setReportsError(null);
      },
      (err) => {
        console.error('Failed to subscribe to IQC reports:', err);
        setReportsError('Failed to load historical IQC reports from Cloud Firestore.');
        setLoadingReports(false);
      }
    );
    return () => unsub();
  }, []);

  const showFlash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice('');
    }, 3200);
  };

  // Filtered Historical Reports
  const filteredHistoricalReports = useMemo(() => {
    return historicalReports.filter((r) => {
      if (historyMaterialFilter !== 'all' && r.material !== historyMaterialFilter) {
        return false;
      }
      if (historyResultFilter !== 'all' && r.finalResult !== historyResultFilter) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.trim().toLowerCase();
        const match =
          (r.reportNo && r.reportNo.toLowerCase().includes(q)) ||
          (r.supplier && r.supplier.toLowerCase().includes(q)) ||
          (r.model && r.model.toLowerCase().includes(q)) ||
          (r.partNo && r.partNo.toLowerCase().includes(q)) ||
          (r.lotNo && r.lotNo.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [historicalReports, historyMaterialFilter, historyResultFilter, historySearch]);

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

  // Save finalized report to Firestore collection iqc_reports
  const handleSaveFinalizedReport = async () => {
    if (!isLoggedIn) {
      showFlash('Please log in with inspector credentials to save finalized reports.');
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }

    const assignedReportNo =
      reportNo.trim() ||
      `IQC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        Math.random() * 900 + 100
      )}`;
    const assignedDate = inspDate || new Date().toISOString().split('T')[0];

    setIsSaving(true);
    try {
      const payload: Omit<IqcReportRecord, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        id: currentReportId || undefined,
        reportNo: assignedReportNo,
        inspDate: assignedDate,
        supplier: supplier || 'Supplier-A',
        material: material || (activeTab === 'pcba' ? 'PCBA' : 'PCB'),
        partNo: partNo || '',
        model: model || '',
        poNo: poNo || '',
        grnNo: grnNo || '',
        lotNo: lotNo || '',
        recvQty: Number(recvQty) || 0,
        sampleQty: Number(sampleQty) || 0,
        totalLots: Number(totalLots) || 0,
        acceptedLots: Number(acceptedLots) || 0,
        condLots: Number(condLots) || 0,
        rejectedLots: Number(rejectedLots) || 0,
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

      if (currentReportId) {
        await updateIqcReport(currentReportId, payload);
        showFlash(`IQC Report "${assignedReportNo}" updated in Cloud Firestore!`);
      } else {
        const newId = await createIqcReport(payload);
        setCurrentReportId(newId);
        showFlash(`IQC Report "${assignedReportNo}" finalized and saved to Cloud Firestore!`);
      }

      // Also persist to localStorage as offline/local draft backup
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...payload, savedAt: new Date().toISOString() })
      );
    } catch (err) {
      console.error('Failed to save finalized IQC report:', err);
      showFlash('Error saving finalized report to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open existing historical report for viewing / editing
  const handleOpenReport = (report: IqcReportRecord, editMode: boolean = false) => {
    setCurrentReportId(report.id || null);
    setReportNo(report.reportNo || '');
    setInspDate(report.inspDate || '');
    setSupplier(report.supplier || '');
    setMaterial(report.material || '');
    setPartNo(report.partNo || '');
    setModel(report.model || '');
    setPoNo(report.poNo || '');
    setGrnNo(report.grnNo || '');
    setLotNo(report.lotNo || '');
    setRecvQty(report.recvQty !== undefined ? report.recvQty : '');
    setSampleQty(report.sampleQty !== undefined ? report.sampleQty : '');
    setTotalLots(report.totalLots !== undefined ? report.totalLots : '');
    setAcceptedLots(report.acceptedLots !== undefined ? report.acceptedLots : '');
    setCondLots(report.condLots !== undefined ? report.condLots : '');
    setRejectedLots(report.rejectedLots !== undefined ? report.rejectedLots : '');
    setChecklist(report.checklist && report.checklist.length > 0 ? report.checklist : INITIAL_CHECKLIST);
    setDefectsA(report.defectsA && report.defectsA.length > 0 ? report.defectsA : INITIAL_DEFECTS_A);
    setDefectsB(report.defectsB && report.defectsB.length > 0 ? report.defectsB : INITIAL_DEFECTS_B);
    setDocs(report.docs && report.docs.length > 0 ? report.docs : INITIAL_DOCS);
    setFinalResult(report.finalResult || 'Accept');
    setRemarks(report.remarks || '');
    setSignInspName(report.signInspName || 'Engr. Atikur Rahman');
    setSignInspDate(report.signInspDate || new Date().toISOString().split('T')[0]);
    setSignIcName(report.signIcName || 'M. H. Rasel');
    setSignIcDate(report.signIcDate || new Date().toISOString().split('T')[0]);
    setSignQmName(report.signQmName || 'Dr. K. Alam');
    setSignQmDate(report.signQmDate || new Date().toISOString().split('T')[0]);

    if (report.material === 'PCBA') {
      setActiveTab('pcba');
    } else {
      setActiveTab('pcb');
    }
    showFlash(editMode ? `Editing IQC report "${report.reportNo}".` : `Opened IQC report "${report.reportNo}".`);
  };

  // Delete historical report from Firestore
  const handleDeleteReport = async (id: string, repNo: string) => {
    if (!isLoggedIn) {
      showFlash('Authorized login required to delete IQC reports.');
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete IQC report "${repNo}" from Cloud Firestore?`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      await deleteIqcReport(id);
      if (currentReportId === id) {
        handleClearForm();
      }
      showFlash(`IQC report "${repNo}" permanently deleted from Cloud Firestore.`);
    } catch (err) {
      console.error('Failed to delete report:', err);
      showFlash('Error deleting report from Cloud Firestore.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Save local draft
  const handleSaveDraft = async () => {
    if (!isLoggedIn) {
      showFlash('Please log in with inspector credentials to save drafts.');
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }
    try {
      const draft = {
        savedAt: new Date().toISOString(),
        id: currentReportId,
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
      showFlash('IQC report draft saved to local browser storage.');
    } catch {
      showFlash('Error saving draft locally.');
    }
  };

  // Restore draft from localStorage or Firestore
  const handleRestoreDraft = async () => {
    try {
      let d: any = null;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        d = JSON.parse(raw);
      } else {
        const cloudReports = await getIqcReports();
        if (cloudReports.length > 0) d = cloudReports[0];
      }
      if (!d) {
        showFlash('No saved draft found in local storage or database.');
        return;
      }
      if (d.id) setCurrentReportId(d.id);
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
      showFlash('Draft restored successfully into active form.');
    } catch {
      showFlash('Could not restore draft.');
    }
  };

  // Clear form / Create new report
  const handleClearForm = () => {
    setCurrentReportId(null);
    setReportNo('');
    setInspDate(new Date().toISOString().split('T')[0]);
    setSupplier('');
    setMaterial(activeTab === 'pcba' ? 'PCBA' : activeTab === 'pcb' ? 'PCB' : '');
    setPartNo('');
    setModel('');
    setPoNo('');
    setGrnNo('');
    setLotNo('');
    setRecvQty('');
    setSampleQty('');
    setTotalLots(25);
    setAcceptedLots(20);
    setCondLots(1);
    setRejectedLots(4);
    setChecklist(INITIAL_CHECKLIST);
    setDefectsA(INITIAL_DEFECTS_A);
    setDefectsB(INITIAL_DEFECTS_B);
    setDocs(INITIAL_DOCS);
    setRemarks('');
    setFinalResult('Accept');
    showFlash('Form cleared for a new inspection report.');
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
      {/* Top Banner & Sub-Section Navigation & Action Toolbar */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#123a6b] text-white flex items-center justify-center shadow-xs shrink-0">
              <ClipboardCheck className="w-6 h-6 text-[#93c5fd]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#0d1730] tracking-tight">
                  IQC Inspection
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#eaf2fb] text-[#123a6b] border border-[#cbd5e1]">
                  Cloud Firestore Active
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Material Quality Verification &bull; IPC-A-610 Class 2/3 &bull; Walton Hi-Tech Industries PLC
              </p>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {(activeTab === 'pcb' || activeTab === 'pcba') && (
              <>
                <button
                  type="button"
                  onClick={handleSaveFinalizedReport}
                  disabled={isSaving}
                  title={isLoggedIn ? 'Save and finalize report in Cloud Firestore' : 'Login required to save report'}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{currentReportId ? 'Update in Firestore' : 'Save Finalized Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  title="Save current work to local browser storage"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  title="Restore saved draft or latest record"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearForm}
                  title="Clear form fields to start a new blank report"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>New Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print inspection document or export to PDF"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print / PDF</span>
                </button>
              </>
            )}

            {(activeTab === 'all' || activeTab === 'history') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    handleClearForm();
                    setActiveTab('pcb');
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1565c0] hover:bg-[#0d47a1] text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create IQC Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoadingReports(true);
                    getIqcReports().then((r) => {
                      setHistoricalReports(r);
                      setLoadingReports(false);
                      showFlash('Refreshed IQC reports from Cloud Firestore.');
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Refresh Cloud</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation Segment */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#123a6b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Overview Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#123a6b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Historical Reports Table</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'history'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {historicalReports.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (material !== 'PCB') setMaterial('PCB');
              setActiveTab('pcb');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pcb'
                ? 'bg-[#123a6b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            PCB Inspection Form
          </button>
          <button
            type="button"
            onClick={() => {
              if (material !== 'PCBA') setMaterial('PCBA');
              setActiveTab('pcba');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pcba'
                ? 'bg-[#123a6b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            PCBA Inspection Form
          </button>
        </div>

        {/* Notice Flash Banner */}
        {notice && (
          <div className="bg-[#123a6b] text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{notice}</span>
          </div>
        )}

        {/* Active Edit Document Notification Bar */}
        {(activeTab === 'pcb' || activeTab === 'pcba') && currentReportId && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                <strong>Editing Firestore Document:</strong>{' '}
                <span className="font-mono font-bold">{currentReportId}</span> &bull; Report No:{' '}
                <span className="font-mono font-bold">{reportNo || 'Unnamed'}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearForm}
              className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer text-[11px]"
            >
              + Discard Edit &amp; Create New Report
            </button>
          </div>
        )}
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

      {/* Main Integrated IQC Report Document Sheet */}
      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-md overflow-hidden text-[#1c2733]">
        {/* Masthead Header */}
        <div className="flex flex-col md:flex-row items-stretch border-b border-[#cbd5e1]">
          {/* Brand Left */}
          <div className="flex-1 p-5 sm:p-6 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#cbd5e1]">
            <div className="w-[60px] h-[60px] shrink-0 flex items-center justify-center filter drop-shadow-sm">
              <WaltonSealLogo className="w-full h-full object-contain select-none" animated={false} />
            </div>
            <div className="w-[1px] h-12 bg-[#cbd5e1] hidden sm:block" />
            <div>
              <h1 className="font-['Barlow_Condensed'] font-bold text-2xl sm:text-3xl text-[#123a6b] tracking-wide leading-tight">
                WALTON HI TECH INDUSTRIES PLC
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
                {activeTab === 'all'
                  ? 'IQC SUMMARY DASHBOARD'
                  : activeTab === 'history'
                  ? 'IQC HISTORICAL REPORTS'
                  : 'IQC INSPECTION REPORT'}
              </h2>
              <p className="text-[11px] text-[#93c5fd] italic mt-0.5">
                Better Quality &nbsp;|&nbsp; Safer Product &nbsp;|&nbsp; Brighter Future
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'all' ? (
          /* ================= IQC DASHBOARD (SUMMARY VIEW) ================= */
          <div className="p-4 sm:p-6 space-y-6 bg-[#f8fafc]">
            {/* Monthly Lot Inspection Summary Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#123a6b] via-[#123a6b] to-[#1a4c8a] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                Monthly Lot Inspection Summary
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1565c0] text-white p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 shadow-xs">
                  <span className="block w-full text-center text-xs font-bold leading-tight uppercase tracking-wider text-white/90">
                    Total Lots Received
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={totalLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setTotalLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-transparent border-0 border-none outline-none ring-0 focus:outline-none focus:ring-0 text-white font-['Barlow_Condensed'] font-extrabold text-3xl sm:text-4xl text-center leading-tight p-0 mx-auto select-all cursor-text disabled:cursor-default disabled:opacity-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="bg-[#22a45d] text-white p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 shadow-xs">
                  <span className="block w-full text-center text-xs font-bold leading-tight uppercase tracking-wider text-white/90">
                    Accepted Lots
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={acceptedLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setAcceptedLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-transparent border-0 border-none outline-none ring-0 focus:outline-none focus:ring-0 text-white font-['Barlow_Condensed'] font-extrabold text-3xl sm:text-4xl text-center leading-tight p-0 mx-auto select-all cursor-text disabled:cursor-default disabled:opacity-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="bg-[#f2b134] text-white p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 shadow-xs">
                  <span className="block w-full text-center text-xs font-bold leading-tight uppercase tracking-wider text-white/90">
                    Conditional Accept
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={condLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setCondLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-transparent border-0 border-none outline-none ring-0 focus:outline-none focus:ring-0 text-white font-['Barlow_Condensed'] font-extrabold text-3xl sm:text-4xl text-center leading-tight p-0 mx-auto select-all cursor-text disabled:cursor-default disabled:opacity-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="bg-[#e2231a] text-white p-3.5 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 shadow-xs">
                  <span className="block w-full text-center text-xs font-bold leading-tight uppercase tracking-wider text-white/90">
                    Rejected Lots
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={rejectedLots}
                    disabled={!isLoggedIn}
                    onChange={(e) => setRejectedLots(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-transparent border-0 border-none outline-none ring-0 focus:outline-none focus:ring-0 text-white font-['Barlow_Condensed'] font-extrabold text-3xl sm:text-4xl text-center leading-tight p-0 mx-auto select-all cursor-text disabled:cursor-default disabled:opacity-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          {ppm > 0 ? ppm.toLocaleString() : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-600 font-medium">Incoming Defect Rate</td>
                        <td className="py-2 text-right font-extrabold text-[#1565c0]">
                          {sQty > 0 ? `${idr}%` : '—'}
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
                  <svg
                    className="w-full h-auto"
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    role="img"
                    aria-label="Defect Pareto chart"
                  >
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
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-[10px] ${s.class}`}
                            >
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

            {/* Recent Historical IQC Reports Preview Card (Live Firestore) */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-[#0d1730] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#1565c0]" />
                    <span>Recent IQC Inspection Reports</span>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#eaf2fb] text-[#123a6b] border border-[#cbd5e1]">
                      Cloud Firestore &bull; {historicalReports.length} records
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Real-time inspection log synchronized with collection <code className="font-mono text-[#1565c0]">iqc_reports</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#1565c0] hover:bg-[#eaf2fb] border border-[#cbd5e1] cursor-pointer transition-colors"
                  >
                    View All Archives &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleClearForm();
                      setActiveTab('pcb');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1565c0] hover:bg-[#0d47a1] text-white cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Report</span>
                  </button>
                </div>
              </div>

              {loadingReports ? (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#1565c0] animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Loading reports from Cloud Firestore...</p>
                </div>
              ) : historicalReports.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500 font-medium">No IQC inspection records found in Cloud Firestore.</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClearForm();
                      setActiveTab('pcb');
                    }}
                    className="mt-2 px-3 py-1 bg-[#1565c0] text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Create First Inspection Report
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[680px]">
                    <thead>
                      <tr className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-2">Report No.</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Supplier</th>
                        <th className="p-2">Material</th>
                        <th className="p-2">Model / Part</th>
                        <th className="p-2 text-right">Recv / Sample</th>
                        <th className="p-2 text-center">Result</th>
                        <th className="p-2 text-center w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historicalReports.slice(0, 5).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2 font-mono font-bold text-[#123a6b]">{r.reportNo}</td>
                          <td className="p-2 font-mono text-slate-500">{r.inspDate || '—'}</td>
                          <td className="p-2 font-medium text-slate-700">{r.supplier || '—'}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.material === 'PCB'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.material === 'PCBA'
                                  ? 'bg-purple-100 text-purple-800'
                                  : r.material === 'Component'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {r.material || 'General'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-800 font-medium">{r.model || r.partNo || '—'}</td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            {Number(r.recvQty || 0).toLocaleString()} / {Number(r.sampleQty || 0).toLocaleString()}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold inline-block ${
                                r.finalResult === 'Accept'
                                  ? 'bg-[#e5f7ee] text-[#1c8a53]'
                                  : r.finalResult === 'Conditional Accept'
                                  ? 'bg-[#fdf1de] text-[#c74a1f]'
                                  : 'bg-[#fbe6e6] text-[#d64545]'
                              }`}
                            >
                              {r.finalResult}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenReport(r, false)}
                                title="Open Report"
                                className="p-1 rounded text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReport(r, true)}
                                title="Edit Report in form"
                                className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={!isLoggedIn || isDeletingId === r.id}
                                onClick={() => handleDeleteReport(r.id!, r.reportNo)}
                                title={isLoggedIn ? 'Delete report from Firestore' : 'Login required'}
                                className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors cursor-pointer"
                              >
                                {isDeletingId === r.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'history' ? (
          /* ================= HISTORICAL IQC REPORTS TABLE ================= */
          <div className="p-4 sm:p-6 space-y-4 bg-[#f8fafc]">
            <div className="bg-white rounded-xl border border-[#cbd5e1] p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-[#0d1730] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#1565c0]" />
                    <span>Historical Incoming Quality Control (IQC) Archives</span>
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Cloud Firestore collection <code className="font-mono text-[#1565c0]">iqc_reports</code> &bull; Persistent across browser sessions &amp; reloads
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-[#0d1730] font-mono">{filteredHistoricalReports.length}</strong> of{' '}
                    <strong className="text-[#0d1730] font-mono">{historicalReports.length}</strong> reports
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleClearForm();
                      setActiveTab('pcb');
                    }}
                    className="px-3.5 py-1.5 bg-[#1565c0] hover:bg-[#0d47a1] text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Report</span>
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 pb-3 border-b border-slate-200">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search report no, supplier, model, lot..."
                    className="w-full pl-8 pr-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1565c0]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Material:</span>
                  <select
                    value={historyMaterialFilter}
                    onChange={(e) => setHistoryMaterialFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-[#cbd5e1] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1565c0]"
                  >
                    <option value="all">All Materials</option>
                    <option value="PCB">PCB</option>
                    <option value="PCBA">PCBA</option>
                    <option value="Component">Component</option>
                    <option value="Solder Paste">Solder Paste</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Result:</span>
                  <select
                    value={historyResultFilter}
                    onChange={(e) => setHistoryResultFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-[#cbd5e1] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1565c0]"
                  >
                    <option value="all">All Results</option>
                    <option value="Accept">Accept</option>
                    <option value="Conditional Accept">Conditional Accept</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>

                {(historySearch || historyMaterialFilter !== 'all' || historyResultFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryMaterialFilter('all');
                      setHistoryResultFilter('all');
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* State handling: Loading, Error, Empty, and Data Table */}
              {loadingReports ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-[#1565c0] animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    Loading historical IQC reports from Cloud Firestore...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Subscribed to real-time database updates
                  </p>
                </div>
              ) : reportsError ? (
                <div className="py-10 px-4 text-center bg-red-50 border border-red-200 rounded-xl space-y-2 mt-4">
                  <AlertTriangle className="w-7 h-7 text-red-500 mx-auto" />
                  <h4 className="text-xs font-bold text-red-800">Connection Error</h4>
                  <p className="text-xs text-red-600 max-w-md mx-auto">{reportsError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadingReports(true);
                      getIqcReports().then((r) => {
                        setHistoricalReports(r);
                        setLoadingReports(false);
                      });
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredHistoricalReports.length === 0 ? (
                <div className="py-14 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl mt-4 space-y-2">
                  <FileText className="w-9 h-9 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No Matching IQC Reports</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {historicalReports.length === 0
                      ? 'No inspection reports have been recorded in Cloud Firestore yet.'
                      : 'No records match the current filter query. Try clearing the search or changing filters.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClearForm();
                      setActiveTab('pcb');
                    }}
                    className="mt-2 px-4 py-2 bg-[#1565c0] hover:bg-[#0d47a1] text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Inspection Report</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-xs text-left border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-[#eaf2fb] text-[#123a6b] font-bold border-b border-[#cbd5e1]">
                        <th className="p-2.5">Report No.</th>
                        <th className="p-2.5">Insp. Date</th>
                        <th className="p-2.5">Supplier</th>
                        <th className="p-2.5">Material</th>
                        <th className="p-2.5">Part / Model</th>
                        <th className="p-2.5 text-right">Recv / Sample</th>
                        <th className="p-2.5 text-center">Lots (Tot/Acc/Rej)</th>
                        <th className="p-2.5 text-center">Final Result</th>
                        <th className="p-2.5 text-center w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredHistoricalReports.map((r) => {
                        const isCurrent = currentReportId === r.id;
                        return (
                          <tr
                            key={r.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isCurrent ? 'bg-amber-50/70' : ''
                            }`}
                          >
                            <td className="p-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[#123a6b]">
                                  {r.reportNo}
                                </span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                                    Editing
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 font-mono text-slate-600">
                              {r.inspDate || '—'}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-800">
                              {r.supplier || '—'}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                  r.material === 'PCB'
                                    ? 'bg-blue-100 text-blue-800'
                                    : r.material === 'PCBA'
                                    ? 'bg-purple-100 text-purple-800'
                                    : r.material === 'Component'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {r.material || 'General'}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <div className="font-medium text-slate-800">{r.model || '—'}</div>
                              {r.partNo && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {r.partNo}
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              <div>{Number(r.recvQty || 0).toLocaleString()}</div>
                              <div className="text-[10.5px] text-slate-400">
                                S: {Number(r.sampleQty || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-mono text-[11px]">
                              <span className="font-bold text-slate-700">{r.totalLots ?? '—'}</span> /{' '}
                              <span className="text-[#16a34a] font-bold">{r.acceptedLots ?? '—'}</span> /{' '}
                              <span className="text-[#dc2626] font-bold">{r.rejectedLots ?? '—'}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                                  r.finalResult === 'Accept'
                                    ? 'bg-[#e5f7ee] text-[#1c8a53] border border-[#bbf0d2]'
                                    : r.finalResult === 'Conditional Accept'
                                    ? 'bg-[#fdf1de] text-[#c74a1f] border border-[#fbd8a8]'
                                    : 'bg-[#fbe6e6] text-[#d64545] border border-[#f7c2c2]'
                                }`}
                              >
                                {r.finalResult}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenReport(r, false)}
                                  title="Open / View Report details"
                                  className="p-1 rounded text-[#1565c0] hover:bg-[#eaf2fb] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReport(r, true)}
                                  title="Edit report in inspection form"
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={!isLoggedIn || isDeletingId === r.id}
                                  onClick={() => handleDeleteReport(r.id!, r.reportNo)}
                                  title={
                                    isLoggedIn
                                      ? 'Permanently delete report from Cloud Firestore'
                                      : 'Login required to delete reports'
                                  }
                                  className="p-1 rounded text-[#e2231a] hover:bg-[#fee2e2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                  {isDeletingId === r.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= Two-Column Grid Content (PCB / PCBA Inspection Form) ================= */
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#f8fafc]">
            {/* ================= LEFT COLUMN ================= */}
            <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="bg-[#123a6b] text-white px-4 py-2.5 flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                <Info className="w-4 h-4 text-[#93c5fd]" />
                <span>Basic Information</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-white/15 font-mono text-white/90">
                  {material ? `${material} Material` : 'Material'}
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Left Pane */}
                <div className="space-y-2.5 min-w-0">
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Report No.</label>
                    <input
                      type="text"
                      value={reportNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setReportNo(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white font-mono text-xs disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Insp. Date</label>
                    <input
                      type="date"
                      value={inspDate}
                      disabled={!isLoggedIn}
                      onChange={(e) => setInspDate(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Supplier</label>
                    <select
                      value={supplier}
                      disabled={!isLoggedIn}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full min-w-0 h-8 px-2 py-1 border border-[#cbd5e1] rounded bg-white text-xs truncate disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value=""></option>
                      <option value="Supplier-A">Supplier-A (Apex PCB Tech)</option>
                      <option value="Supplier-B">Supplier-B (Global Electronics)</option>
                      <option value="Supplier-C">Supplier-C (Delta Component)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Material Type</label>
                    <select
                      value={material}
                      disabled={!isLoggedIn}
                      onChange={(e) => setMaterial(e.target.value as any)}
                      className="w-full min-w-0 h-8 px-2 py-1 border border-[#cbd5e1] rounded bg-white text-xs font-bold text-[#123a6b] truncate disabled:bg-slate-50"
                    >
                      <option value=""></option>
                      <option value="PCB">PCB (Printed Circuit Board)</option>
                      <option value="PCBA">PCBA (Assembly Sub-Module)</option>
                      <option value="Component">Component (SMD/DIP)</option>
                      <option value="Solder Paste">Solder Paste / Flux</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Part No.</label>
                    <input
                      type="text"
                      value={partNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setPartNo(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>

                {/* Right Pane */}
                <div className="space-y-2.5 min-w-0 sm:border-l sm:border-[#e2e8f0] sm:pl-4">
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Model Name</label>
                    <input
                      type="text"
                      value={model}
                      disabled={!isLoggedIn}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">PO No.</label>
                    <input
                      type="text"
                      value={poNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setPoNo(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">GRN No.</label>
                    <input
                      type="text"
                      value={grnNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setGrnNo(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Lot No.</label>
                    <input
                      type="text"
                      value={lotNo}
                      disabled={!isLoggedIn}
                      onChange={(e) => setLotNo(e.target.value)}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Recv. Qty</label>
                    <input
                      type="number"
                      value={recvQty}
                      disabled={!isLoggedIn}
                      onChange={(e) => setRecvQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs font-bold disabled:bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
                    <label className="font-semibold text-[#475569]">Sample Qty</label>
                    <input
                      type="number"
                      value={sampleQty}
                      disabled={!isLoggedIn}
                      onChange={(e) => setSampleQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full min-w-0 h-8 px-2.5 py-1 border border-[#cbd5e1] rounded bg-white text-xs font-bold text-[#1565c0] disabled:bg-slate-50"
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
        )}
      </div>
    </div>
  );
};
