import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { ManpowerEmployee, MANPOWER_LIST_RECORDS } from '../data/manpowerRecords';

const STORAGE_KEY = 'walton_qms_manpower_records_v1';
const FIRESTORE_COLLECTION = 'qm_manpower';

/**
 * Retrieve manpower list from local storage or fallback to official defaults
 */
export function getStoredManpower(): ManpowerEmployee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If cached list has fewer than official defaults, merge missing
        const existingIds = new Set(parsed.map((e) => String(e.employeeId)));
        const missing = MANPOWER_LIST_RECORDS.filter((e) => !existingIds.has(String(e.employeeId)));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing].sort((a, b) => a.sl - b.sl);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return parsed.sort((a, b) => a.sl - b.sl);
      }
    }
  } catch (err) {
    console.error('Error reading stored manpower:', err);
  }
  return MANPOWER_LIST_RECORDS;
}

/**
 * Seed official default employees to Firestore if the collection is empty
 */
export async function seedManpowerIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, FIRESTORE_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const emp of MANPOWER_LIST_RECORDS) {
        const docRef = doc(db, FIRESTORE_COLLECTION, String(emp.employeeId));
        await setDoc(docRef, { ...emp, updatedAt: Date.now() }, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Firestore manpower check/seed failed (running in offline/local mode):', err);
  }
}

/**
 * Real-time subscription to Manpower collection with localStorage fallback
 */
export function subscribeManpower(
  onUpdate: (records: ManpowerEmployee[]) => void
): () => void {
  // Emit stored records immediately
  onUpdate(getStoredManpower());

  try {
    const colRef = collection(db, FIRESTORE_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRecords: ManpowerEmployee[] = [];
          snapshot.forEach((d) => {
            remoteRecords.push(d.data() as ManpowerEmployee);
          });
          remoteRecords.sort((a, b) => (a.sl || 0) - (b.sl || 0));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteRecords));
          } catch {}
          onUpdate(remoteRecords);
        } else {
          // If empty, trigger seed in background
          void seedManpowerIfEmpty();
        }
      },
      (error) => {
        console.warn('Firestore manpower subscription error (using local cache):', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to setup Firestore manpower listener:', err);
    return () => {};
  }
}

/**
 * Save or update an employee record
 */
export async function saveManpowerEmployee(emp: ManpowerEmployee): Promise<void> {
  const current = getStoredManpower();
  const index = current.findIndex(
    (e) => String(e.employeeId) === String(emp.employeeId)
  );

  let updatedList: ManpowerEmployee[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = { ...emp, updatedAt: Date.now() };
  } else {
    const nextSl = current.length > 0 ? Math.max(...current.map((e) => e.sl || 0)) + 1 : 1;
    updatedList = [...current, { ...emp, sl: emp.sl || nextSl, updatedAt: Date.now() }];
  }

  updatedList.sort((a, b) => (a.sl || 0) - (b.sl || 0));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch {}

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, String(emp.employeeId));
    await setDoc(docRef, { ...emp, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Firestore write for manpower failed (saved locally):', err);
  }
}

/**
 * Delete an employee record
 */
export async function deleteManpowerEmployee(employeeId: string): Promise<void> {
  const current = getStoredManpower();
  const updatedList = current.filter((e) => String(e.employeeId) !== String(employeeId));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch {}

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, String(employeeId));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete for manpower failed (deleted locally):', err);
  }
}

/**
 * Reset manpower list to official 31 defaults
 */
export async function resetManpowerToDefaults(): Promise<ManpowerEmployee[]> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MANPOWER_LIST_RECORDS));
  } catch {}

  try {
    for (const emp of MANPOWER_LIST_RECORDS) {
      const docRef = doc(db, FIRESTORE_COLLECTION, String(emp.employeeId));
      await setDoc(docRef, { ...emp, updatedAt: Date.now() }, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore reset for manpower failed:', err);
  }

  return MANPOWER_LIST_RECORDS;
}
