import {
  db,
  doc,
  getDoc,
  setDoc,
  buildUpdateAudit,
  getAuditIdentity,
} from './firebase';

export interface StationSettingsDoc {
  name: string;
  empId: string;
  department: string;
  email: string;
  overdueAlert: boolean;
  ncrAlert: boolean;
  weeklyKpi: boolean;
  autoSopReminder: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PcbaManpowerItem {
  id: string;
  process: string;
  department: 'SMT' | 'MI';
  required: number;
  available: number;
}

export async function saveStationSettings(settings: StationSettingsDoc): Promise<void> {
  const actor = getAuditIdentity();
  const audit = buildUpdateAudit();
  try {
    await setDoc(
      doc(db, 'settings', actor.uid || 'global_station'),
      {
        ...settings,
        ...audit,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save station settings to Firestore:', err);
  }
}

export async function loadStationSettings(): Promise<StationSettingsDoc | null> {
  const actor = getAuditIdentity();
  try {
    const snap = await getDoc(doc(db, 'settings', actor.uid || 'global_station'));
    if (snap.exists()) {
      return snap.data() as StationSettingsDoc;
    }
  } catch (err) {
    console.warn('Could not load station settings from Firestore:', err);
  }
  return null;
}

export async function savePcbaManpowerToFirestore(items: PcbaManpowerItem[]): Promise<void> {
  const audit = buildUpdateAudit();
  try {
    await setDoc(
      doc(db, 'master_data', 'pcba_manpower'),
      {
        items,
        ...audit,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save PCBA manpower to Firestore:', err);
  }
}

export async function loadPcbaManpowerFromFirestore(): Promise<PcbaManpowerItem[] | null> {
  try {
    const snap = await getDoc(doc(db, 'master_data', 'pcba_manpower'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) return data.items as PcbaManpowerItem[];
    }
  } catch (err) {
    console.warn('Could not load PCBA manpower from Firestore:', err);
  }
  return null;
}
