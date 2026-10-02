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

export interface QualityDevelopmentRecord {
  id: string;
  project: string;
  objective: string;
  result: string;
  category: string;
  impact: string;
  status: 'Active' | 'Completed' | 'Planned';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

const COLLECTION_NAME = 'quality_development';

export async function saveQualityDevProject(
  record: QualityDevelopmentRecord
): Promise<QualityDevelopmentRecord> {
  const docId = record.id || `qd_${Date.now()}`;
  const audit = buildCreateAudit();
  const payload: QualityDevelopmentRecord = {
    ...record,
    id: docId,
    ...audit,
  };
  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
  }
}

export async function updateQualityDevProject(
  id: string,
  updates: Partial<QualityDevelopmentRecord>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteQualityDevProject(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getQualityDevProjects(): Promise<QualityDevelopmentRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: QualityDevelopmentRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as QualityDevelopmentRecord), id: d.id });
    });
    return list;
  } catch {
    return [];
  }
}

export function subscribeQualityDevProjects(
  onData: (projects: QualityDevelopmentRecord[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: QualityDevelopmentRecord[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as QualityDevelopmentRecord), id: d.id });
        });
        onData(list);
      },
      (err) => {
        console.warn('Quality development subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
