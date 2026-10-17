import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  buildCreateAudit,
  buildUpdateAudit,
  handleFirestoreError,
  OperationType,
} from './firebase';

export interface IqcReportRecord {
  id?: string;
  reportNo: string;
  inspDate: string;
  supplier: string;
  material: '' | 'PCB' | 'PCBA' | 'Component' | 'Solder Paste';
  partNo: string;
  model: string;
  poNo: string;
  grnNo: string;
  lotNo: string;
  recvQty: number;
  sampleQty: number;
  totalLots: number;
  acceptedLots: number;
  condLots: number;
  rejectedLots: number;
  checklist: Array<{ id: number; name: string; result: 'Pass' | 'Fail' | null; remarks: string }>;
  defectsA: Array<{ name: string; qty: number }>;
  defectsB: Array<{ name: string; qty: number }>;
  docs: Array<{
    name: string;
    type: 'PDF' | 'IMG';
    fileName: string;
    status: 'Pending' | 'Received' | 'Verified' | 'Not Required';
  }>;
  finalResult: 'Accept' | 'Conditional Accept' | 'Reject';
  remarks: string;
  signInspName: string;
  signInspDate: string;
  signIcName: string;
  signIcDate: string;
  signQmName: string;
  signQmDate: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

const COLLECTION_NAME = 'iqc_reports';

export async function getIqcReportById(id: string): Promise<IqcReportRecord | null> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (snap.exists()) {
      return { ...(snap.data() as IqcReportRecord), id: snap.id };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createIqcReport(
  report: Omit<IqcReportRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<string> {
  const audit = buildCreateAudit();
  const docId = report.reportNo
    ? report.reportNo.replace(/[^a-zA-Z0-9_-]/g, '_')
    : `iqc_${Date.now()}`;
  const path = `${COLLECTION_NAME}/${docId}`;

  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), {
      ...report,
      id: docId,
      ...audit,
    });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateIqcReport(
  id: string,
  updates: Partial<IqcReportRecord>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();

  try {
    await setDoc(
      doc(db, COLLECTION_NAME, id),
      {
        ...updates,
        id,
        ...audit,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveIqcReport(
  report: Omit<IqcReportRecord, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<string> {
  const audit = report.id ? buildUpdateAudit() : buildCreateAudit();
  const docId =
    report.id ||
    (report.reportNo
      ? report.reportNo.replace(/[^a-zA-Z0-9_-]/g, '_')
      : `iqc_${Date.now()}`);
  const path = `${COLLECTION_NAME}/${docId}`;

  try {
    await setDoc(
      doc(db, COLLECTION_NAME, docId),
      {
        ...report,
        id: docId,
        ...audit,
      },
      { merge: true }
    );
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIqcReport(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getIqcReports(): Promise<IqcReportRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: IqcReportRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as IqcReportRecord), id: d.id });
    });
    list.sort((a, b) => ((b.inspDate || b.updatedAt || '') > (a.inspDate || a.updatedAt || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load IQC reports from Firestore:', err);
    return [];
  }
}

export function subscribeIqcReports(
  onData: (reports: IqcReportRecord[]) => void,
  onError?: (err: unknown) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: IqcReportRecord[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as IqcReportRecord), id: d.id });
        });
        list.sort((a, b) => ((b.inspDate || b.updatedAt || '') > (a.inspDate || a.updatedAt || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('IQC subscription notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seeds initial baseline IQC inspection reports if collection is empty.
 */
export async function seedBaselineIqcReportsIfEmpty(): Promise<void> {
  try {
    const existing = await getIqcReports();
    if (existing.length > 0) return;

    const baselines: Array<Omit<IqcReportRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>> = [
      {
        reportNo: 'IQC-2026-0801',
        inspDate: '2026-08-10',
        supplier: 'Supplier-A',
        material: 'PCB',
        partNo: 'WLT-PCB-FR-8821',
        model: 'SC Power Board Fridge',
        poNo: 'PO-2026-8910',
        grnNo: 'GRN-9921',
        lotNo: 'LOT-2608-01',
        recvQty: 5000,
        sampleQty: 200,
        totalLots: 15,
        acceptedLots: 14,
        condLots: 1,
        rejectedLots: 0,
        checklist: [
          { id: 1, name: 'Visual Inspection', result: 'Pass', remarks: 'Clear solder mask' },
          { id: 2, name: 'Dimension Verification', result: 'Pass', remarks: 'Tolerance within +/-0.05mm' },
          { id: 3, name: 'Specification Verification', result: 'Pass', remarks: 'FR-4 TG150 verified' },
          { id: 4, name: 'Open / Short Check', result: 'Pass', remarks: '100% E-test pass on panel' },
          { id: 5, name: 'Component Verification (PCBA)', result: null, remarks: 'N/A for bare PCB' },
          { id: 6, name: 'Solder Quality Check (PCBA)', result: null, remarks: 'N/A for bare PCB' },
          { id: 7, name: 'Functional Test (If Applicable)', result: null, remarks: 'N/A' },
          { id: 8, name: 'Packaging Condition', result: 'Pass', remarks: 'Vacuum sealed with desiccant' },
        ],
        defectsA: [
          { name: 'Scratch', qty: 1 },
          { name: 'Open Circuit', qty: 0 },
          { name: 'Short Circuit', qty: 0 },
          { name: 'Missing Component', qty: 0 },
        ],
        defectsB: [
          { name: 'Wrong Component', qty: 0 },
          { name: 'Solder Defect', qty: 0 },
          { name: 'Cosmetic Defect', qty: 1 },
          { name: 'Other', qty: 0 },
        ],
        docs: [
          { name: 'Supplier COA', type: 'PDF', fileName: 'Apex_COA_Batch2608.pdf', status: 'Verified' },
          { name: 'Test Report', type: 'PDF', fileName: 'Microsection_Test.pdf', status: 'Verified' },
          { name: 'Inspection Photos', type: 'IMG', fileName: 'PCB_Panel_Sample.jpg', status: 'Received' },
          { name: 'X-Ray Report', type: 'PDF', fileName: '', status: 'Not Required' },
          { name: 'Push Test Report', type: 'PDF', fileName: '', status: 'Not Required' },
          { name: 'Reliability Test Report', type: 'PDF', fileName: 'Solderability_Report.pdf', status: 'Verified' },
          { name: 'NCR (If Any)', type: 'PDF', fileName: '', status: 'Not Required' },
        ],
        finalResult: 'Accept',
        remarks: 'Batch meets Walton incoming bare board standard IPC-A-600 Class 2.',
        signInspName: 'Engr. Atikur Rahman',
        signInspDate: '2026-08-10',
        signIcName: 'M. H. Rasel',
        signIcDate: '2026-08-10',
        signQmName: 'Dr. K. Alam',
        signQmDate: '2026-08-11',
      },
      {
        reportNo: 'IQC-2026-0802',
        inspDate: '2026-08-12',
        supplier: 'Supplier-B',
        material: 'PCBA',
        partNo: 'WLT-PCBA-TV-4K',
        model: 'TV Mainboard 4K (Garber N 9721)',
        poNo: 'PO-2026-9044',
        grnNo: 'GRN-9950',
        lotNo: 'LOT-2608-02',
        recvQty: 1200,
        sampleQty: 125,
        totalLots: 10,
        acceptedLots: 8,
        condLots: 1,
        rejectedLots: 1,
        checklist: [
          { id: 1, name: 'Visual Inspection', result: 'Pass', remarks: 'Good alignment' },
          { id: 2, name: 'Dimension Verification', result: 'Pass', remarks: 'Correct mounting holes' },
          { id: 3, name: 'Specification Verification', result: 'Pass', remarks: 'BOM match rev 3.2' },
          { id: 4, name: 'Open / Short Check', result: 'Pass', remarks: 'ICT scan passed' },
          { id: 5, name: 'Component Verification (PCBA)', result: 'Pass', remarks: 'All IC markings checked' },
          { id: 6, name: 'Solder Quality Check (PCBA)', result: 'Pass', remarks: 'Minor flux residue noticed' },
          { id: 7, name: 'Functional Test (If Applicable)', result: 'Pass', remarks: 'Power rail boot verified' },
          { id: 8, name: 'Packaging Condition', result: 'Pass', remarks: 'ESD bubble wrap bags' },
        ],
        defectsA: [
          { name: 'Scratch', qty: 0 },
          { name: 'Open Circuit', qty: 0 },
          { name: 'Short Circuit', qty: 0 },
          { name: 'Missing Component', qty: 0 },
        ],
        defectsB: [
          { name: 'Wrong Component', qty: 0 },
          { name: 'Solder Defect', qty: 2 },
          { name: 'Cosmetic Defect', qty: 1 },
          { name: 'Other', qty: 0 },
        ],
        docs: [
          { name: 'Supplier COA', type: 'PDF', fileName: 'Global_COA_TV_Aug.pdf', status: 'Verified' },
          { name: 'Test Report', type: 'PDF', fileName: 'ICT_Testing_Summary.pdf', status: 'Verified' },
          { name: 'Inspection Photos', type: 'IMG', fileName: 'TV_Mainboard_Top.jpg', status: 'Received' },
          { name: 'X-Ray Report', type: 'PDF', fileName: 'BGA_Xray_Scan.pdf', status: 'Verified' },
          { name: 'Push Test Report', type: 'PDF', fileName: '', status: 'Not Required' },
          { name: 'Reliability Test Report', type: 'PDF', fileName: '', status: 'Pending' },
          { name: 'NCR (If Any)', type: 'PDF', fileName: '', status: 'Not Required' },
        ],
        finalResult: 'Conditional Accept',
        remarks: 'Accepted under rework waiver: flux residue to be cleaned at pre-assembly touchup.',
        signInspName: 'Engr. Atikur Rahman',
        signInspDate: '2026-08-12',
        signIcName: 'M. H. Rasel',
        signIcDate: '2026-08-12',
        signQmName: 'Dr. K. Alam',
        signQmDate: '2026-08-13',
      },
      {
        reportNo: 'IQC-2026-0803',
        inspDate: '2026-08-14',
        supplier: 'Supplier-C',
        material: 'Component',
        partNo: 'WLT-CMP-LED-03',
        model: 'Square LED (RLSS) 3 Chip',
        poNo: 'PO-2026-9112',
        grnNo: 'GRN-9988',
        lotNo: 'LOT-2608-05',
        recvQty: 25000,
        sampleQty: 315,
        totalLots: 8,
        acceptedLots: 8,
        condLots: 0,
        rejectedLots: 0,
        checklist: [
          { id: 1, name: 'Visual Inspection', result: 'Pass', remarks: 'Reel packaging intact' },
          { id: 2, name: 'Dimension Verification', result: 'Pass', remarks: 'Tape pitch standard' },
          { id: 3, name: 'Specification Verification', result: 'Pass', remarks: 'Luminous flux 35lm/W' },
          { id: 4, name: 'Open / Short Check', result: 'Pass', remarks: 'Forward voltage checked' },
          { id: 5, name: 'Component Verification (PCBA)', result: 'Pass', remarks: 'SMD package 2835' },
          { id: 6, name: 'Solder Quality Check (PCBA)', result: null, remarks: 'N/A component' },
          { id: 7, name: 'Functional Test (If Applicable)', result: 'Pass', remarks: 'Light output test pass' },
          { id: 8, name: 'Packaging Condition', result: 'Pass', remarks: 'Moisture barrier bag' },
        ],
        defectsA: [
          { name: 'Scratch', qty: 0 },
          { name: 'Open Circuit', qty: 0 },
          { name: 'Short Circuit', qty: 0 },
          { name: 'Missing Component', qty: 0 },
        ],
        defectsB: [
          { name: 'Wrong Component', qty: 0 },
          { name: 'Solder Defect', qty: 0 },
          { name: 'Cosmetic Defect', qty: 0 },
          { name: 'Other', qty: 0 },
        ],
        docs: [
          { name: 'Supplier COA', type: 'PDF', fileName: 'Delta_COA_LED.pdf', status: 'Verified' },
          { name: 'Test Report', type: 'PDF', fileName: 'Spectrometer_Report.pdf', status: 'Verified' },
          { name: 'Inspection Photos', type: 'IMG', fileName: 'Reel_Labels.jpg', status: 'Received' },
          { name: 'X-Ray Report', type: 'PDF', fileName: '', status: 'Not Required' },
          { name: 'Push Test Report', type: 'PDF', fileName: '', status: 'Not Required' },
          { name: 'Reliability Test Report', type: 'PDF', fileName: '', status: 'Not Required' },
          { name: 'NCR (If Any)', type: 'PDF', fileName: '', status: 'Not Required' },
        ],
        finalResult: 'Accept',
        remarks: 'Zero defects detected across 315 sample pieces. Passed AQL 0.65 Level II.',
        signInspName: 'Engr. Atikur Rahman',
        signInspDate: '2026-08-14',
        signIcName: 'M. H. Rasel',
        signIcDate: '2026-08-14',
        signQmName: 'Dr. K. Alam',
        signQmDate: '2026-08-14',
      },
    ];

    for (const b of baselines) {
      await createIqcReport(b);
    }
  } catch (err) {
    console.warn('Baseline IQC reports seed notice:', err);
  }
}

