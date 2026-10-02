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
import { CapaItem } from '../types';

const COLLECTION_NAME = 'capas';

export async function createCapa(
  item: Omit<CapaItem, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<CapaItem> {
  const audit = buildCreateAudit();
  const docId = item.id || item.code || `capa_${Date.now()}`;
  const payload: CapaItem = {
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

export async function updateCapa(
  id: string,
  updates: Partial<CapaItem>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCapa(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getCapas(): Promise<CapaItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: CapaItem[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as CapaItem), id: d.id });
    });
    list.sort((a, b) => ((b.createdDate || '') > (a.createdDate || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load CAPAs from Firestore:', err);
    return [];
  }
}

export function subscribeCapas(
  onData: (items: CapaItem[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: CapaItem[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as CapaItem), id: d.id });
        });
        list.sort((a, b) => ((b.createdDate || '') > (a.createdDate || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('CAPA subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
