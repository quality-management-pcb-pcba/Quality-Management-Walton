import {
  db,
  collection,
  doc,
  addDoc,
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

export async function saveIqcReport(
  report: Omit<IqcReportRecord, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<string> {
  const audit = buildCreateAudit();
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
    list.sort((a, b) => ((b.updatedAt || '') > (a.updatedAt || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load IQC reports from Firestore:', err);
    return [];
  }
}

export function subscribeIqcReports(
  onData: (reports: IqcReportRecord[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: IqcReportRecord[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as IqcReportRecord), id: d.id });
        });
        list.sort((a, b) => ((b.updatedAt || '') > (a.updatedAt || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('IQC subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
