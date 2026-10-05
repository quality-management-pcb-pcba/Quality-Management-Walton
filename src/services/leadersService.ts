import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderProfile {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  tier: 'executive' | 'operations';
  department: string;
  responsibilities: string[];
  experience: string;
  location: string;
  email: string;
  phone: string;
  photoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_LEADERS: LeaderProfile[] = [
  {
    id: 'nasir-uddin',
    name: 'Md. Nasir Uddin',
    employeeId: '18139',
    designation: 'CBO of PCB & PCBA',
    tier: 'executive',
    department: 'PCB & PCBA Business Operations',
    responsibilities: [
      'Strategic executive direction across PCB fabrication and SMT PCBA manufacturing divisions',
      'Capital allocation for high-precision automated inspection machinery (3D AOI, X-Ray, Flying Probe)',
      'Total Quality Management (TQM) governance and global electronic manufacturing compliance',
    ],
    experience: '18+ Years in High-Volume Electronics Manufacturing & Corporate Leadership',
    location: 'Walton Hi-Tech Industries PLC, Chandra, Gazipur',
    email: 'nasir.cbo@waltonbd.com',
    phone: '+880 1713-262601',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'atiqur-rahman',
    name: 'Md. Atiqur Rahman',
    employeeId: '40736',
    designation: 'Head of QM- PCB&PCBA',
    tier: 'executive',
    department: 'Quality Management Division',
    responsibilities: [
      'Division-wide quality assurance, IPC-A-610 Class 3 and ISO 9001:2015 adherence',
      'Lead cross-functional CAPA 8D investigations, root cause analyses, and supplier quality audits',
      'Daily quality yield tracking across all TV, Refrigerator, and Mobile PCBA production lines',
    ],
    experience: '12+ Years in Electronic Circuit Quality Assurance & Manufacturing Excellence',
    location: 'Quality Management Headquarters, Walton Gazipur Plant',
    email: 'qm.pcba26@gmail.com',
    phone: '+880 1678-860873',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'tazedul-hoque',
    name: 'Md. Tazedul Hoque',
    employeeId: '36924',
    designation: 'Co-Ordinator of QM- PCBA',
    tier: 'operations',
    department: 'PCBA Quality Coordination',
    responsibilities: [
      'Surface Mount Technology (SMT) and Through-Hole (THT) quality process coordination',
      'Solder paste inspection (SPI) parameters and reflow soldering thermal profile auditing',
      'First-article inspection (FAI) approval and continuous training for in-line QC personnel',
    ],
    experience: '9+ Years in PCBA Process Engineering & Quality Coordination',
    location: 'PCBA SMT Quality Hub, Plant 02, Gazipur',
    email: 'tazedul.qm@waltonbd.com',
    phone: '+880 1713-262635',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'alamgir-hossain',
    name: 'Md. Alamgir Hossain',
    employeeId: '25673',
    designation: 'Supervisor of QM- PCB',
    tier: 'operations',
    department: 'PCB Quality Control',
    responsibilities: [
      'Raw PCB fabrication quality oversight (Dry Film, CNC Drilling, PTH Copper Plating)',
      'Solder mask alignment, HASL/ENIG surface finish verification, and bare-board electrical testing (ET)',
      'Frontline inspection team shift scheduling and zero-defect scrap reduction initiatives',
    ],
    experience: '8+ Years in PCB Manufacturing & Defect Prevention',
    location: 'PCB Fabrication Quality Control Section, Gazipur',
    email: 'alamgir.pcb@waltonbd.com',
    phone: '+880 1713-262642',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'mamun-hossen',
    name: 'Md. Mamun Hossen',
    employeeId: '42179',
    designation: 'Supervisor of QM- PCBA',
    tier: 'operations',
    department: 'PCBA Quality Control',
    responsibilities: [
      'Direct supervision of 3D AOI inspection stations and in-circuit testing (ICT) bays',
      'Non-conformance containment on active lines and immediate defect feedback to line engineers',
      'Worker KPI evaluation, workmanship grading according to IPC standards, and 5S compliance',
    ],
    experience: '7+ Years in SMT In-Line Quality Supervision',
    location: 'PCBA Assembly Line 01-08 QA Bay, Gazipur',
    email: 'mamun.pcba@waltonbd.com',
    phone: '+880 1713-262650',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
  },
];

const LOCAL_STORAGE_KEY = 'walton_qm_leaders_data';

// Helper to sort leaders consistently (Nasir, Atiqur, Tazedul, Alamgir, Mamun, then others)
export const sortLeadersList = (list: LeaderProfile[]): LeaderProfile[] => {
  const priorityOrder: Record<string, number> = {
    'nasir-uddin': 1,
    'atiqur-rahman': 2,
    'tazedul-hoque': 3,
    'alamgir-hossain': 4,
    'mamun-hossen': 5,
  };
  return [...list].sort((a, b) => {
    const prioA = priorityOrder[a.id] ?? (a.tier === 'executive' ? 10 : 20);
    const prioB = priorityOrder[b.id] ?? (b.tier === 'executive' ? 10 : 20);
    if (prioA !== prioB) return prioA - prioB;
    return a.name.localeCompare(b.name);
  });
};

export const getStoredLeaders = (): LeaderProfile[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee all 5 standard leaders exist, keeping whatever edits the user made
        const merged = [...parsed];
        for (const def of DEFAULT_LEADERS) {
          const exists = merged.some((l) => l.id === def.id);
          if (!exists) {
            merged.push(def);
          }
        }
        return sortLeadersList(merged);
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored leaders from localStorage:', err);
  }
  return DEFAULT_LEADERS;
};

export const persistLeadersLocally = (leaders: LeaderProfile[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sortLeadersList(leaders)));
  } catch (err) {
    console.warn('Failed to persist leaders to localStorage:', err);
  }
};

/**
 * Seed default leaders to Firestore ONLY if the collection is empty,
 * or when force is explicitly requested (Reset Defaults).
 * NEVER overwrites user updates during normal operations!
 */
export const seedDefaultLeadersToFirestore = async (force: boolean = false): Promise<void> => {
  if (!db) return;
  try {
    if (!force) {
      const existingSnap = await getDocs(collection(db, 'qm_leaders'));
      if (!existingSnap.empty) {
        // Firestore already contains documents; DO NOT OVERWRITE USER EDITS!
        return;
      }
    }

    for (const leader of DEFAULT_LEADERS) {
      const leaderRef = doc(db, 'qm_leaders', leader.id);
      await setDoc(leaderRef, {
        ...leader,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Could not seed default leaders to Firestore:', err);
  }
};

/**
 * Ensures all 5 standard Walton leaders are available locally.
 * Does NOT overwrite existing user edits in Firestore.
 */
export const ensureAllDefaultLeaders = async (): Promise<LeaderProfile[]> => {
  const current = getStoredLeaders();
  const merged = [...current];
  let changed = false;

  for (const def of DEFAULT_LEADERS) {
    const exists = merged.some((l) => l.id === def.id);
    if (!exists) {
      merged.push(def);
      changed = true;
    }
  }

  const sorted = sortLeadersList(merged);
  if (changed) {
    persistLeadersLocally(sorted);
  }

  // Only seed to Firestore if collection is totally empty
  if (db) {
    void seedDefaultLeadersToFirestore(false);
  }

  return sorted;
};

/**
 * Real-time subscription to Firestore 'qm_leaders' collection with local storage fallback
 */
export const subscribeLeaders = (
  onUpdate: (leaders: LeaderProfile[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  // Provide initial guaranteed leaders immediately from local storage
  const localList = getStoredLeaders();
  onUpdate(localList);

  if (!db) {
    return () => {};
  }

  try {
    const leadersCol = collection(db, 'qm_leaders');
    const unsubscribe = onSnapshot(
      leadersCol,
      (snapshot) => {
        if (snapshot.empty) {
          // First time initialization: seed defaults once
          void seedDefaultLeadersToFirestore(true);
          return;
        }

        let list: LeaderProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LeaderProfile;
          list.push({ ...data, id: docSnap.id });
        });

        // Ensure any standard Walton leader that hasn't been added yet is populated
        for (const def of DEFAULT_LEADERS) {
          const exists = list.some((l) => l.id === def.id);
          if (!exists) {
            list.push(def);
            const missingRef = doc(db, 'qm_leaders', def.id);
            void setDoc(missingRef, {
              ...def,
              updatedAt: new Date().toISOString(),
            });
          }
        }

        const sorted = sortLeadersList(list);
        persistLeadersLocally(sorted);
        onUpdate(sorted);
      },
      (err) => {
        console.warn('Firestore subscription error for qm_leaders (using local fallback):', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Could not setup Firestore snapshot listener for qm_leaders:', err);
    return () => {};
  }
};

/**
 * Save or update a leader profile
 */
export const saveLeaderProfile = async (leader: LeaderProfile): Promise<LeaderProfile> => {
  const currentList = getStoredLeaders();
  const leaderId =
    leader.id ||
    leader.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
    `leader-${Date.now()}`;

  const completeLeader: LeaderProfile = {
    ...leader,
    id: leaderId,
    updatedAt: new Date().toISOString(),
  };

  // Check if updating by ID, employee ID, or exact name
  const existingIndex = currentList.findIndex(
    (l) => l.id === leaderId || (leader.employeeId && l.employeeId === leader.employeeId)
  );

  let updatedList: LeaderProfile[];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = completeLeader;
  } else {
    updatedList = [...currentList, completeLeader];
  }

  const sorted = sortLeadersList(updatedList);
  persistLeadersLocally(sorted);

  // Sync to Firestore if available
  if (db) {
    try {
      const leaderRef = doc(db, 'qm_leaders', leaderId);
      await setDoc(leaderRef, completeLeader, { merge: true });
    } catch (err) {
      console.warn('Failed to save leader to Firestore, persisted locally:', err);
    }
  }

  return completeLeader;
};

/**
 * Delete a leader profile
 */
export const deleteLeaderProfile = async (leaderId: string): Promise<void> => {
  const currentList = getStoredLeaders();
  const updatedList = currentList.filter((l) => l.id !== leaderId);
  persistLeadersLocally(updatedList);

  if (db) {
    try {
      const leaderRef = doc(db, 'qm_leaders', leaderId);
      await deleteDoc(leaderRef);
    } catch (err) {
      console.warn('Failed to delete leader from Firestore:', err);
    }
  }
};

/**
 * Reset leaders to factory default Walton leaders
 */
export const resetLeadersToDefaults = async (): Promise<LeaderProfile[]> => {
  persistLeadersLocally(DEFAULT_LEADERS);

  if (db) {
    try {
      const snapshot = await getDocs(collection(db, 'qm_leaders'));
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
      await seedDefaultLeadersToFirestore(true);
    } catch (err) {
      console.warn('Could not reset Firestore leaders, reset locally:', err);
    }
  }

  return DEFAULT_LEADERS;
};
