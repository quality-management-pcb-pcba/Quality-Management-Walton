import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from './firebase';
import { UserProfile, UserRole, UserStatus } from '../types';

/**
 * Default seed profiles for known Walton QM staff when initializing system
 */
export const INITIAL_STAFF_SEEDS: Record<string, Omit<UserProfile, 'uid'>> = {
  'qm.pcba26@gmail.com': {
    employeeId: 'ADM-26',
    name: 'Atiqur Rahman',
    email: 'qm.pcba26@gmail.com',
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: 'Head of Quality Management',
    role: 'admin',
    status: 'active',
  },
  'atiqur.rahman@waltonbd.com': {
    employeeId: '40736',
    name: 'Atiqur Rahman',
    email: 'atiqur.rahman@waltonbd.com',
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: 'Head of Quality Management',
    role: 'admin',
    status: 'active',
  },
  'atiqur40736@waltonbd.com': {
    employeeId: '40736',
    name: 'Atiqur Rahman',
    email: 'atiqur40736@waltonbd.com',
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: 'Head of Quality Management',
    role: 'admin',
    status: 'active',
  },
  'tajedul36924@waltonbd.com': {
    employeeId: '36924',
    name: 'Tajedul Islam',
    email: 'tajedul36924@waltonbd.com',
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: 'QA Staff',
    role: 'qa_staff',
    status: 'active',
  },
  'khalid52190@waltonbd.com': {
    employeeId: '52190',
    name: 'Khalid Hasan',
    email: 'khalid52190@waltonbd.com',
    department: 'Quality Management',
    section: 'SMT Line 1-4',
    designation: 'QA Engineer',
    role: 'qa_staff',
    status: 'active',
  },
  'auditor.ext@waltonbd.com': {
    employeeId: 'AUD-01',
    name: 'Quality Lead Auditor',
    email: 'auditor.ext@waltonbd.com',
    department: 'Quality Management',
    section: 'Audit & Compliance',
    designation: 'Lead Auditor',
    role: 'qa_staff',
    status: 'active',
  },
  'qa.admin@waltonbd.com': {
    employeeId: 'QA-001',
    name: 'System Administrator',
    email: 'qa.admin@waltonbd.com',
    department: 'Quality Management',
    section: 'Executive Operations',
    designation: 'Quality Systems Manager',
    role: 'admin',
    status: 'active',
  },
};

/**
 * Retrieves the employee profile from Firestore users/{uid}
 * @param uid - Firebase Authentication User ID
 */
export async function getUserProfile(uid: string, fallbackEmail?: string): Promise<UserProfile | null> {
  try {
    if (db) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid,
          employeeId: data.employeeId || '',
          name: data.name || '',
          email: data.email || '',
          department: data.department || 'Quality Management',
          section: data.section || 'PCB & PCBA',
          designation: data.designation || 'Staff',
          role: (data.role as UserRole) || 'qa_staff',
          status: (data.status as UserStatus) || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
    }
  } catch (error) {
    console.warn('Notice fetching user profile from Firestore:', error);
  }

  // Fallback to known seed profile if email is provided
  if (fallbackEmail) {
    const seed = INITIAL_STAFF_SEEDS[fallbackEmail.toLowerCase()];
    if (seed) {
      return {
        uid,
        ...seed,
      };
    }
  }

  return null;
}

/**
 * Initializes or bootstraps a default profile if the user document is missing
 * but matches Walton staff roster (e.g. atiqur40736@waltonbd.com).
 */
export async function bootstrapUserProfile(uid: string, email: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const seed = INITIAL_STAFF_SEEDS[normalizedEmail] || {
    employeeId: normalizedEmail.split('@')[0].replace(/\D/g, '') || '00000',
    name: normalizedEmail.split('@')[0],
    email: normalizedEmail,
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: 'Staff',
    role: (normalizedEmail.includes('atiqur') || normalizedEmail.includes('admin') ? 'admin' : 'qa_staff') as UserRole,
    status: 'active' as UserStatus,
  };

  const newProfile: UserProfile = {
    uid,
    ...seed,
    createdAt: serverTimestamp(),
  };

  try {
    if (db) {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, newProfile);
    }
  } catch (err) {
    console.warn('Could not persist bootstrapped profile to Firestore:', err);
  }
  return newProfile;
}

/**
 * Updates an employee's Firestore profile (Admin only)
 */
export async function updateEmployeeProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'employeeId'>> & {
    department?: string;
    section?: string;
    designation?: string;
    role?: UserRole;
    status?: UserStatus;
  }
): Promise<void> {
  if (db) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Creates an employee profile record in Firestore (Admin only)
 */
export async function createEmployeeRecord(profile: UserProfile): Promise<void> {
  if (db) {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * Fetches all registered Walton employees from Firestore users collection
 */
export async function getAllEmployees(): Promise<UserProfile[]> {
  try {
    if (db) {
      const colRef = collection(db, 'users');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const users: UserProfile[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          users.push({
            uid: docSnap.id,
            employeeId: data.employeeId || '',
            name: data.name || '',
            email: data.email || '',
            department: data.department || 'Quality Management',
            section: data.section || 'PCB & PCBA',
            designation: data.designation || 'Staff',
            role: (data.role as UserRole) || 'qa_staff',
            status: (data.status as UserStatus) || 'active',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        if (users.length > 0) return users;
      }
    }
  } catch (error) {
    console.warn('Could not fetch employees directly from Firestore (using seeds):', error);
  }

  // Fallback to known seeds
  return Object.entries(INITIAL_STAFF_SEEDS).map(([email, seed], index) => ({
    uid: `seed-uid-${index + 1}`,
    ...seed,
  }));
}

/**
 * Real-time listener for employee collection
 */
export function subscribeEmployees(callback: (users: UserProfile[]) => void): () => void {
  try {
    if (db) {
      const colRef = collection(db, 'users');
      return onSnapshot(
        colRef,
        (snap) => {
          const users: UserProfile[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            users.push({
              uid: docSnap.id,
              employeeId: data.employeeId || '',
              name: data.name || '',
              email: data.email || '',
              department: data.department || 'Quality Management',
              section: data.section || 'PCB & PCBA',
              designation: data.designation || 'Staff',
              role: (data.role as UserRole) || 'qa_staff',
              status: (data.status as UserStatus) || 'active',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
          if (users.length > 0) {
            callback(users);
          }
        },
        (err) => {
          console.warn('Employee subscription snapshot notice:', err);
        }
      );
    }
  } catch (err) {
    console.warn('Notice establishing employee subscription:', err);
  }
  return () => {};
}
