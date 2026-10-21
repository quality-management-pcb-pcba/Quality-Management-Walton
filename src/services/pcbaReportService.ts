import {
  db,
  auth,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  handleFirestoreError,
  OperationType,
} from './firebase';

export interface PcbaReportRecord {
  id?: string;
  date: string;
  line: string;
  model: string;
  type: string; // 'Aesthetic' | 'Function'
  desc: string;
  qty: number;
  status: 'Open' | 'In Progress' | 'Closed';
  shift?: string;
  product?: string;
  operator?: string;
  remarks?: string;
  source?: string;
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  [key: string]: any;
}

export type NewPcbaReport = {
  date: string;
  line: string;
  model: string;
  type: string;
  desc: string;
  qty: number;
  status?: 'Open' | 'In Progress' | 'Closed';
  shift?: string;
  product?: string;
  operator?: string;
  remarks?: string;
  source?: string;
  [key: string]: any;
};

const COLLECTION_NAME = 'pcba_reports';

/**
 * Returns active user email / identifier for audit trail
 */
export function getCurrentUserIdentifier(): string {
  if (auth.currentUser?.email) {
    return auth.currentUser.email;
  }
  try {
    const saved = localStorage.getItem('active_user_email');
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return 'qm.pcba26@gmail.com';
}

/**
 * Strips any undefined fields from an object so Firestore addDoc/setDoc/updateDoc does not throw
 */
function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean as Partial<T>;
}

/**
 * Saves a single PCBA Report to Firestore collection `pcba_reports`
 * Adds createdBy, createdAt, updatedBy, and updatedAt fields automatically.
 */
export async function savePcbaReport(
  record: NewPcbaReport
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('Authentication required: You must be logged in with a valid Walton account to save PCBA inspection reports.');
  }

  const path = COLLECTION_NAME;
  const now = new Date().toISOString();
  const user = getCurrentUserIdentifier();

  const payload = sanitizeFirestorePayload({
    date: record.date,
    line: record.line,
    model: record.model,
    type: record.type,
    desc: (record.desc || '').trim() || '—',
    qty: Math.max(1, Number(record.qty) || 1),
    status: record.status || 'Open',
    shift: record.shift || 'Day',
    product: record.product || 'General',
    operator: record.operator || '',
    remarks: record.remarks || '',
    source: record.source || 'PCBA Report Portal',
    createdBy: user,
    createdAt: now,
    updatedBy: user,
    updatedAt: now,
  });

  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Saves multiple defect records in batch to Firestore collection `pcba_reports`
 * Automatically attaches audit fields to each record.
 */
export async function saveMultiplePcbaReports(
  records: NewPcbaReport[]
): Promise<string[]> {
  const path = COLLECTION_NAME;
  const now = new Date().toISOString();
  const user = getCurrentUserIdentifier();
  const createdIds: string[] = [];

  try {
    const colRef = collection(db, path);
    for (const rec of records) {
      const payload = sanitizeFirestorePayload({
        date: rec.date,
        line: rec.line,
        model: rec.model,
        type: rec.type,
        desc: (rec.desc || '').trim() || '—',
        qty: Math.max(1, Number(rec.qty) || 1),
        status: rec.status || 'Open',
        shift: rec.shift || 'Day',
        product: rec.product || 'General',
        operator: rec.operator || '',
        remarks: rec.remarks || '',
        source: rec.source || 'PCBA Report Portal',
        createdBy: user,
        createdAt: now,
        updatedBy: user,
        updatedAt: now,
      });
      const docRef = await addDoc(colRef, payload);
      createdIds.push(docRef.id);
    }
    return createdIds;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates an existing PCBA Report in Firestore
 * Updates updatedBy and updatedAt fields automatically.
 */
export async function updatePcbaReport(
  id: string,
  updates: Partial<Omit<PcbaReportRecord, 'createdAt' | 'createdBy'>>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  const now = new Date().toISOString();
  const user = getCurrentUserIdentifier();

  const payload: Record<string, any> = sanitizeFirestorePayload({
    ...updates,
    updatedBy: user,
    updatedAt: now,
  });

  if (updates.qty !== undefined) {
    payload.qty = Math.max(1, Number(updates.qty) || 1);
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a PCBA Report from Firestore
 */
export async function deletePcbaReport(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Loads all PCBA Reports from Firestore collection `pcba_reports`
 */
export async function loadPcbaReports(): Promise<PcbaReportRecord[]> {
  const path = COLLECTION_NAME;
  try {
    // Try ordering by createdAt desc
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const records: PcbaReportRecord[] = [];
      snapshot.forEach((d) => {
        records.push({
          ...(d.data() as PcbaReportRecord),
          id: d.id,
        });
      });
      return records;
    } catch {
      // Fallback without orderBy in case index is pending
      const snapshot = await getDocs(collection(db, path));
      const records: PcbaReportRecord[] = [];
      snapshot.forEach((d) => {
        records.push({
          ...(d.data() as PcbaReportRecord),
          id: d.id,
        });
      });
      records.sort((a, b) => ((b.createdAt || '') > (a.createdAt || '') ? 1 : -1));
      return records;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Real-time subscription to PCBA reports in Firestore
 */
export function subscribeToPcbaReports(
  onData: (records: PcbaReportRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = COLLECTION_NAME;
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const records: PcbaReportRecord[] = [];
        snapshot.forEach((d) => {
          records.push({
            ...(d.data() as PcbaReportRecord),
            id: d.id,
          });
        });
        onData(records);
      },
      (error) => {
        console.warn('Real-time query with orderBy failed, falling back to basic collection listener:', error);
        // Fallback without orderBy
        const unsubFallback = onSnapshot(
          collection(db, path),
          (snapshot) => {
            const records: PcbaReportRecord[] = [];
            snapshot.forEach((d) => {
              records.push({
                ...(d.data() as PcbaReportRecord),
                id: d.id,
              });
            });
            records.sort((a, b) => ((b.createdAt || '') > (a.createdAt || '') ? 1 : -1));
            onData(records);
          },
          (fallbackErr) => {
            if (onError) onError(fallbackErr);
            handleFirestoreError(fallbackErr, OperationType.LIST, path);
          }
        );
        return unsubFallback;
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
