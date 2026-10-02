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
import { TrainingRecord } from '../types';

const RECORDS_COLLECTION = 'training_records';
const DATABASE_COLLECTION = 'training_database';

export async function saveTrainingRecord(
  record: TrainingRecord
): Promise<TrainingRecord> {
  const docId = record.id || `tr_${Date.now()}`;
  const audit = buildCreateAudit();
  const payload: TrainingRecord = {
    ...record,
    id: docId,
    createdAt: record.createdAt || audit.createdAt,
    updatedAt: audit.updatedAt,
    createdBy: record.createdBy || audit.createdBy,
    updatedBy: audit.updatedBy,
  };
  try {
    await setDoc(doc(db, RECORDS_COLLECTION, docId), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${RECORDS_COLLECTION}/${docId}`);
  }
}

export async function updateTrainingRecordInFirestore(
  id: string,
  updates: Partial<TrainingRecord>
): Promise<void> {
  const path = `${RECORDS_COLLECTION}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, RECORDS_COLLECTION, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTrainingRecordFromFirestore(id: string): Promise<void> {
  const path = `${RECORDS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, RECORDS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getTrainingRecordsFromFirestore(): Promise<TrainingRecord[]> {
  try {
    const snap = await getDocs(collection(db, RECORDS_COLLECTION));
    const list: TrainingRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as TrainingRecord), id: d.id });
    });
    list.sort((a, b) => ((a.date || '') > (b.date || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load training records from Firestore:', err);
    return [];
  }
}

export function subscribeTrainingRecords(
  onData: (records: TrainingRecord[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, RECORDS_COLLECTION),
      (snap) => {
        const list: TrainingRecord[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as TrainingRecord), id: d.id });
        });
        list.sort((a, b) => ((a.date || '') > (b.date || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('Training records subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}

export async function syncTrainingDatabaseSummary(summary: {
  totalTraining: number;
  manpowerCertified: number;
  totalTrainingNumber: number;
  totalInstructionMinutes: number;
}): Promise<void> {
  const audit = buildUpdateAudit();
  try {
    await setDoc(
      doc(db, DATABASE_COLLECTION, 'summary'),
      {
        ...summary,
        ...audit,
      },
      { merge: true }
    );
  } catch {
    // non-fatal background sync
  }
}
