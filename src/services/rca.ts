import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  buildCreateAudit,
  buildUpdateAudit,
  handleFirestoreError,
  OperationType,
} from './firebase';

export interface RcaRecordDoc {
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

const COLLECTION_NAME = 'rcas';

export async function saveRcaToFirestore(report: RcaRecordDoc): Promise<RcaRecordDoc> {
  const docId = report.id || `r_${Date.now().toString(36)}`;
  const audit = buildCreateAudit();
  const payload: RcaRecordDoc = {
    ...report,
    id: docId,
    updated: Date.now(),
    ...audit,
  };
  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
  }
}

export async function updateRcaInFirestore(
  id: string,
  updates: Partial<RcaRecordDoc>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(
      doc(db, COLLECTION_NAME, id),
      { ...updates, updated: Date.now(), ...audit },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteRcaFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getRcasFromFirestore(): Promise<RcaRecordDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: RcaRecordDoc[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as RcaRecordDoc), id: d.id });
    });
    list.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    return list;
  } catch (err) {
    console.warn('Could not load RCAs from Firestore:', err);
    return [];
  }
}

export function subscribeRcasFromFirestore(
  onData: (reports: RcaRecordDoc[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: RcaRecordDoc[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as RcaRecordDoc), id: d.id });
        });
        list.sort((a, b) => (b.updated || 0) - (a.updated || 0));
        onData(list);
      },
      (err) => {
        console.warn('RCA subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
