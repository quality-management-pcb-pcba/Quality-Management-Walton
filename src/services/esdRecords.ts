import {
  db,
  collection,
  doc,
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

export interface EsdRecordDoc {
  id: string; // date YYYY-MM-DD
  date: string;
  data: any;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

const COLLECTION_NAME = 'esd_records';

export async function getEsdRecordByDate(date: string): Promise<any | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, date));
    if (snap.exists()) {
      const docData = snap.data();
      return docData.data || docData;
    }
    // Also check legacy esd_logs/{date} if present
    const legacySnap = await getDoc(doc(db, 'esd_logs', date));
    if (legacySnap.exists()) {
      const legacyData = legacySnap.data();
      return legacyData.data || legacyData;
    }
  } catch (err) {
    console.warn('Notice loading ESD record from Firestore:', err);
  }
  return null;
}

export async function saveEsdRecordByDate(date: string, stateData: any): Promise<void> {
  const path = `${COLLECTION_NAME}/${date}`;
  const audit = buildCreateAudit();
  try {
    await setDoc(
      doc(db, COLLECTION_NAME, date),
      {
        id: date,
        date,
        data: stateData,
        ...audit,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEsdRecordByDate(date: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${date}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, date));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function listEsdRecords(): Promise<EsdRecordDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: EsdRecordDoc[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as EsdRecordDoc), id: d.id });
    });
    return list;
  } catch {
    return [];
  }
}

export function subscribeEsdRecordByDate(
  date: string,
  onData: (stateData: any) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, COLLECTION_NAME, date),
      (snap) => {
        if (snap.exists()) {
          const docData = snap.data();
          if (docData?.data) onData(docData.data);
        }
      },
      (err) => {
        console.warn('ESD snapshot notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
