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
import { WorkerKpi } from '../types';

const COLLECTION_NAME = 'kpi_records';

export async function createKpiRecord(
  worker: Omit<WorkerKpi, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> & { id?: string }
): Promise<WorkerKpi> {
  const audit = buildCreateAudit();
  const payload = {
    ...worker,
    ...audit,
  };
  try {
    if (worker.id && !worker.id.startsWith('k-')) {
      await setDoc(doc(db, COLLECTION_NAME, worker.id), payload, { merge: true });
      return { ...payload, id: worker.id };
    }
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { ...payload, id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateKpiRecord(
  id: string,
  updates: Partial<WorkerKpi>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteKpiRecord(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getKpiRecords(): Promise<WorkerKpi[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: WorkerKpi[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as WorkerKpi), id: d.id });
    });
    list.sort((a, b) => (b.score || 0) - (a.score || 0));
    return list.map((w, idx) => ({ ...w, rank: idx + 1 }));
  } catch (err) {
    console.warn('Could not load KPI records from Firestore:', err);
    return [];
  }
}

export function subscribeKpiRecords(
  onData: (workers: WorkerKpi[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: WorkerKpi[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as WorkerKpi), id: d.id });
        });
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
        onData(list.map((w, idx) => ({ ...w, rank: idx + 1 })));
      },
      (err) => {
        console.warn('KPI subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
