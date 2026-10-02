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
import { CustomerComplaint } from '../types';

const COLLECTION_NAME = 'customer_complaints';

export async function saveCustomerComplaint(
  complaint: CustomerComplaint
): Promise<CustomerComplaint> {
  const docId = complaint.id || complaint.ticketNo || `cmp_${Date.now()}`;
  const audit = buildCreateAudit();
  const payload: CustomerComplaint = {
    ...complaint,
    id: docId,
    createdAt: complaint.createdAt || audit.createdAt,
    updatedAt: audit.updatedAt,
    createdBy: complaint.createdBy || audit.createdBy,
    updatedBy: audit.updatedBy,
  };
  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
  }
}

export async function updateCustomerComplaint(
  id: string,
  updates: Partial<CustomerComplaint>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const audit = buildUpdateAudit();
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), { ...updates, ...audit }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCustomerComplaint(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getCustomerComplaints(): Promise<CustomerComplaint[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: CustomerComplaint[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as CustomerComplaint), id: d.id });
    });
    list.sort((a, b) => ((b.receivedDate || '') > (a.receivedDate || '') ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('Could not load Customer Complaints from Firestore:', err);
    return [];
  }
}

export function subscribeCustomerComplaints(
  onData: (items: CustomerComplaint[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const list: CustomerComplaint[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as CustomerComplaint), id: d.id });
        });
        list.sort((a, b) => ((b.receivedDate || '') > (a.receivedDate || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('Customer complaints subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
