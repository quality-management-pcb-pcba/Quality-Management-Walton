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
import { NonConformanceItem } from '../types';

const COLLECTION_NAME = 'non_conformances';

export async function createNonConformance(
  item: Omit<NonConformanceItem, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<NonConformanceItem> {
  const audit = buildCreateAudit();
  const docId = item.id || item.code || `nc_${Date.now()}`;
  const payload: NonConformanceItem = {
    ...item,
    id: docId,
    ...audit,
  };
  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${docId}`);
  }
}

export async function updateNonConformance(
  id: string,
  updates: Partial<NonConformanceItem>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNonConformance(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getNonConformances(): Promise<NonConformanceItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: NonConformanceItem[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as NonConformanceItem), id: d.id });
    });
    list.sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load Non-Conformances from Firestore:', err);
    return [];
  }
}

export function subscribeNonConformances(
  onData: (items: NonConformanceItem[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: NonConformanceItem[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as NonConformanceItem), id: d.id });
        });
        list.sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('Non-Conformances subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
