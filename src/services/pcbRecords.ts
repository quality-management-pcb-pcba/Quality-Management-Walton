import {
  db,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  buildCreateAudit,
  buildUpdateAudit,
  handleFirestoreError,
  OperationType,
} from './firebase';

export interface PcbQualityRecord {
  id?: string;
  sheet: 'visual' | 'aoi' | 'receive' | 'delivery';
  date: string;
  model: string;
  lotNo?: string;
  checkQty: number;
  faultQty: number;
  rejectQty?: number;
  faultRate: number;
  defectDetails?: Record<string, number>;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  [key: string]: any;
}

export interface PcbManpowerItem {
  id: string;
  process: string;
  department: 'QM' | 'FAB' | 'QC';
  required: number;
  available: number;
}

const COLLECTION_NAME = 'pcb_records';
const MANPOWER_DOC_PATH = 'master_data/pcb_manpower';

export async function createPcbRecord(
  record: Omit<PcbQualityRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<string> {
  const audit = buildCreateAudit();
  const payload = {
    ...record,
    ...audit,
  };
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updatePcbRecord(
  id: string,
  updates: Partial<PcbQualityRecord>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePcbRecord(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getPcbRecords(): Promise<PcbQualityRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: PcbQualityRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as PcbQualityRecord), id: d.id });
    });
    return list;
  } catch (err) {
    console.warn('Could not load PCB records from Firestore:', err);
    return [];
  }
}

export function subscribePcbRecords(
  onData: (records: PcbQualityRecord[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: PcbQualityRecord[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as PcbQualityRecord), id: d.id });
        });
        onData(list);
      },
      (err) => {
        console.warn('PCB records snapshot notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}

export async function savePcbManpowerToFirestore(items: PcbManpowerItem[]): Promise<void> {
  const audit = buildUpdateAudit();
  try {
    await setDoc(
      doc(db, 'master_data', 'pcb_manpower'),
      { items, ...audit },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save PCB manpower to Firestore:', error);
  }
}

export async function loadPcbManpowerFromFirestore(): Promise<PcbManpowerItem[] | null> {
  try {
    const snap = await getDoc(doc(db, 'master_data', 'pcb_manpower'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) return data.items as PcbManpowerItem[];
    }
  } catch (err) {
    console.warn('Could not load PCB manpower from Firestore:', err);
  }
  return null;
}

export async function savePcbSheetRowsToFirestore(
  sheetKey: string,
  rows: any[]
): Promise<void> {
  const audit = buildUpdateAudit();
  try {
    await setDoc(
      doc(db, COLLECTION_NAME, `sheet_${sheetKey}`),
      {
        sheet: sheetKey,
        rows,
        ...audit,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`Could not sync PCB sheet ${sheetKey} to Firestore:`, err);
  }
}

export async function loadPcbSheetRowsFromFirestore(
  sheetKey: string
): Promise<any[] | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, `sheet_${sheetKey}`));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.rows)) return data.rows;
    }
  } catch (err) {
    console.warn(`Could not load PCB sheet ${sheetKey} from Firestore:`, err);
  }
  return null;
}
