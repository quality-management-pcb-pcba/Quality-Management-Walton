import {
  db,
  storage,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  storageRef,
  uploadBytes,
  getDownloadURL,
  buildCreateAudit,
  buildUpdateAudit,
  getAuditIdentity,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { SopDocument } from '../types';

const COLLECTION_NAME = 'documents';

export async function uploadSopFileToStorage(
  file: File,
  docCode: string
): Promise<{ fileName: string; fileUrl: string; storagePath: string; fileSize: string }> {
  const safeCode = docCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const storagePath = `documents/${safeCode}/${Date.now()}_${file.name}`;
  const ref = storageRef(storage, storagePath);
  await uploadBytes(ref, file);
  const fileUrl = await getDownloadURL(ref);
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  return {
    fileName: file.name,
    fileUrl,
    storagePath,
    fileSize: sizeMb,
  };
}

export async function createDocumentRecord(
  item: SopDocument
): Promise<SopDocument> {
  const docId = item.id || item.code.replace(/[^a-zA-Z0-9_-]/g, '_') || `doc_${Date.now()}`;
  const audit = buildCreateAudit();
  const actor = getAuditIdentity();
  const payload: SopDocument = {
    ...item,
    id: docId,
    uploadedBy: item.owner || actor.email,
    uploadedByUid: actor.uid,
    ...audit,
  };
  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${docId}`);
  }
}

export async function updateDocumentRecord(
  id: string,
  updates: Partial<SopDocument>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDocumentRecord(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getDocumentRecords(): Promise<SopDocument[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: SopDocument[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as SopDocument), id: d.id });
    });
    list.sort((a, b) => ((b.effectiveDate || '') > (a.effectiveDate || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load documents from Firestore:', err);
    return [];
  }
}

export function subscribeDocumentRecords(
  onData: (docs: SopDocument[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: SopDocument[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as SopDocument), id: d.id });
        });
        list.sort((a, b) => ((b.effectiveDate || '') > (a.effectiveDate || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('Documents subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
