import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getAuditIdentity,
} from './firebase';
import { UserProfile, UserRole, UserStatus } from '../types';

/**
 * Authorized Walton Quality Management Administrator User IDs and Emails
 * Users matching these IDs or emails receive full administrator clearance.
 */
export const DESIGNATED_ADMIN_UIDS: string[] = [
  'EqqAbCPpNnSuyvXyjzYc63UaI173',
];

export const DESIGNATED_ADMIN_EMAILS: string[] = [
  'qm.pcba26@gmail.com',
  'atiqur40736@waltonbd.com',
  'atiqur.rahman@waltonbd.com',
];

/**
 * Validates if an email is an authorized Walton System Administrator
 */
export function isDesignatedAdminEmail(email?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return DESIGNATED_ADMIN_EMAILS.includes(normalized);
}

/**
 * Validates if a user ID is an authorized Walton System Administrator
 */
export function isDesignatedAdminUid(uid?: string): boolean {
  if (!uid) return false;
  return DESIGNATED_ADMIN_UIDS.includes(uid);
}

/**
 * Checks if a user profile or ID has administrative privileges
 */
export function isAdminProfile(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (isDesignatedAdminUid(profile.uid)) return true;
  return (
    (profile.role === 'admin' || profile.role === 'QM_ADMIN') &&
    isDesignatedAdminEmail(profile.email)
  );
}

/**
 * Default seed profiles for the 4 designated Walton QM accounts:
 * Exactly 1 Admin + 3 Regular Users with explicit section-based access control.
 */
export const INITIAL_STAFF_SEEDS: Record<string, Omit<UserProfile, 'uid'>> = {
  // ACCOUNT 01: ADMIN
  'qm.pcba26@gmail.com': {
    employeeId: '40736',
    name: 'Md. Atiqur Rahman',
    email: 'qm.pcba26@gmail.com',
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: 'Head of Quality Management',
    role: 'admin',
    status: 'active',
    permissions: ['ALL'],
    allowedSections: ['ALL'],
    excludedSections: [],
  },

  // ACCOUNT 02: USER 01 (PCBA Scope; Excluded from PCB & MD Sir Report)
  'tajedul36924@waltonbd.com': {
    employeeId: '36924',
    name: 'Tajedul Islam',
    email: 'tajedul36924@waltonbd.com',
    department: 'Quality Management',
    section: 'PCBA',
    designation: 'Co-Ordinator QM - PCBA',
    role: 'qa_staff',
    status: 'active',
    permissions: ['READ', 'WRITE_QM'],
    allowedSections: [
      'PCBA',
      'PCBA_PROCESS',
      'IQC_PCBA',
      'SMT',
      'MI',
      'ESD',
      'TASKS',
      'KPI',
      'NCR',
      'CAPA',
      'RCA',
      'COMPLAINTS',
      'DOCS',
      'MANPOWER',
      'DASHBOARD',
    ],
    excludedSections: ['MD_REPORT', 'PCB', 'PCB_PROCESS', 'IQC_PCB'],
  },

  // ACCOUNT 03: USER 02 (PCB Scope; Excluded from PCBA & MD Sir Report)
  'alamgir.pcb@waltonbd.com': {
    employeeId: '25673',
    name: 'Md. Alamgir Hossain',
    email: 'alamgir.pcb@waltonbd.com',
    department: 'Quality Management',
    section: 'PCB',
    designation: 'Supervisor QM - PCB',
    role: 'qa_staff',
    status: 'active',
    permissions: ['READ', 'WRITE_QM'],
    allowedSections: [
      'PCB',
      'PCB_PROCESS',
      'IQC_PCB',
      'ESD',
      'TASKS',
      'KPI',
      'NCR',
      'CAPA',
      'RCA',
      'COMPLAINTS',
      'DOCS',
      'MANPOWER',
      'DASHBOARD',
    ],
    excludedSections: ['MD_REPORT', 'PCBA', 'PCBA_PROCESS', 'IQC_PCBA', 'SMT', 'MI'],
  },

  // ACCOUNT 04: USER 03 (PCBA Scope; Excluded from PCB & MD Sir Report)
  'mamun.pcba@waltonbd.com': {
    employeeId: '42179',
    name: 'Md. Mamun Hossen',
    email: 'mamun.pcba@waltonbd.com',
    department: 'Quality Management',
    section: 'PCBA',
    designation: 'Supervisor QM - PCBA',
    role: 'qa_staff',
    status: 'active',
    permissions: ['READ', 'WRITE_QM'],
    allowedSections: [
      'PCBA',
      'PCBA_PROCESS',
      'IQC_PCBA',
      'SMT',
      'MI',
      'ESD',
      'TASKS',
      'KPI',
      'NCR',
      'CAPA',
      'RCA',
      'COMPLAINTS',
      'DOCS',
      'MANPOWER',
      'DASHBOARD',
    ],
    excludedSections: ['MD_REPORT', 'PCB', 'PCB_PROCESS', 'IQC_PCB'],
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
          permissions: Array.isArray(data.permissions) ? data.permissions : ['READ'],
          photoURL: data.photoURL || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
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
  const isAdmin = isDesignatedAdminEmail(normalizedEmail) || isDesignatedAdminUid(uid);
  const seed = INITIAL_STAFF_SEEDS[normalizedEmail] || {
    employeeId: normalizedEmail.split('@')[0].replace(/\D/g, '') || '00000',
    name: normalizedEmail.split('@')[0],
    email: normalizedEmail,
    department: 'Quality Management',
    section: 'PCB & PCBA',
    designation: isAdmin ? 'Head of Quality Management' : 'QA Staff',
    role: (isAdmin ? 'admin' : 'qa_staff') as UserRole,
    status: 'active' as UserStatus,
    permissions: isAdmin ? ['ALL'] : ['READ', 'WRITE_QM'],
  };

  // Extra safety safeguard: If not designated admin, NEVER allow admin role
  if (!isAdmin && (seed.role as string) === 'admin') {
    seed.role = 'qa_staff';
    seed.designation = 'QA Staff';
  }

  const newProfile: UserProfile = {
    uid,
    ...seed,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
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
 * Updates an employee's Firestore profile (Admin only for role/status/permissions)
 */
export async function updateEmployeeProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'employeeId'>> & {
    department?: string;
    section?: string;
    designation?: string;
    role?: UserRole;
    status?: UserStatus;
    permissions?: string[];
  }
): Promise<void> {
  if (db) {
    const actor = getAuditIdentity();
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: actor.uid,
    });
  }
}

/**
 * Creates an employee profile record in Firestore (Admin only)
 */
export async function createEmployeeRecord(profile: UserProfile): Promise<void> {
  if (db) {
    const actor = getAuditIdentity();
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: actor.uid,
      updatedBy: actor.uid,
    });
  }
}

/**
 * Deletes an employee profile record in Firestore (Admin only)
 */
export async function deleteEmployeeRecord(uid: string): Promise<void> {
  if (db) {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
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
              allowedSections: data.allowedSections,
              excludedSections: data.excludedSections,
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

/**
 * =========================================================================================
 * SECTION & MODULE PERMISSION AUTHORIZATION ENGINE (PHASE 1)
 * =========================================================================================
 * Implements least-privilege, fail-closed authorization helpers for Walton QMS.
 */

/**
 * Stable Section Identifiers in Walton QMS
 */
export const QM_SECTIONS = {
  PCB: 'PCB',
  PCB_PROCESS: 'PCB_PROCESS',
  PCBA: 'PCBA',
  PCBA_PROCESS: 'PCBA_PROCESS',
  IQC: 'IQC',
  IQC_PCB: 'IQC_PCB',
  IQC_PCBA: 'IQC_PCBA',
  ESD: 'ESD',
  TASKS: 'TASKS',
  KPI: 'KPI',
  NCR: 'NCR',
  CAPA: 'CAPA',
  RCA: 'RCA',
  COMPLAINTS: 'COMPLAINTS',
  DOCS: 'DOCS',
  MANPOWER: 'MANPOWER',
  LEADERS: 'LEADERS',
  RESEARCH: 'RESEARCH',
  SETTINGS: 'SETTINGS',
  USERS: 'USERS',
  DASHBOARD: 'DASHBOARD',
  MD_REPORT: 'MD_REPORT',
} as const;

export type QmSectionId = (typeof QM_SECTIONS)[keyof typeof QM_SECTIONS];

/**
 * Maps PageId to its corresponding QM Section Identifier
 */
export function mapPageToSection(pageId: string): QmSectionId {
  switch (pageId) {
    case 'pcb':
      return QM_SECTIONS.PCB;
    case 'pcb-process':
      return QM_SECTIONS.PCB_PROCESS;
    case 'pcba':
      return QM_SECTIONS.PCBA;
    case 'pcba-process':
      return QM_SECTIONS.PCBA_PROCESS;
    case 'iqc':
      return QM_SECTIONS.IQC;
    case 'iqc-pcb':
      return QM_SECTIONS.IQC_PCB;
    case 'iqc-pcba':
      return QM_SECTIONS.IQC_PCBA;
    case 'esd':
    case 'esd-database':
    case 'esd-entry':
      return QM_SECTIONS.ESD;
    case 'tasks':
      return QM_SECTIONS.TASKS;
    case 'kpi':
      return QM_SECTIONS.KPI;
    case 'nc':
      return QM_SECTIONS.NCR;
    case 'capa':
      return QM_SECTIONS.CAPA;
    case 'rca':
      return QM_SECTIONS.RCA;
    case 'complaints':
      return QM_SECTIONS.COMPLAINTS;
    case 'docs':
      return QM_SECTIONS.DOCS;
    case 'manpower':
    case 'team':
    case 'team-database':
    case 'team-entry':
      return QM_SECTIONS.MANPOWER;
    case 'leaders':
      return QM_SECTIONS.LEADERS;
    case 'research':
      return QM_SECTIONS.RESEARCH;
    case 'settings':
      return QM_SECTIONS.SETTINGS;
    case 'users':
      return QM_SECTIONS.USERS;
    case 'md-report':
    case 'md-report-summary':
    case 'md-report-pcb':
    case 'md-report-pcba':
    case 'md-report-smt':
    case 'md-report-mi':
    case 'md-report-trend':
    case 'md-report-action':
    case 'md-report-data':
      return QM_SECTIONS.MD_REPORT;
    case 'dashboard':
    case 'admin-dashboard':
    default:
      return QM_SECTIONS.DASHBOARD;
  }
}

/**
 * Checks whether a given QM Section is related to PCB fabrication
 */
export function isPcbRelatedSection(section: QmSectionId | string): boolean {
  const norm = section.trim().toUpperCase();
  return (
    norm === QM_SECTIONS.PCB ||
    norm === QM_SECTIONS.PCB_PROCESS ||
    norm === QM_SECTIONS.IQC_PCB ||
    norm === 'PCB'
  );
}

/**
 * Checks whether a given QM Section is related to PCBA assembly
 */
export function isPcbaRelatedSection(section: QmSectionId | string): boolean {
  const norm = section.trim().toUpperCase();
  return (
    norm === QM_SECTIONS.PCBA ||
    norm === QM_SECTIONS.PCBA_PROCESS ||
    norm === QM_SECTIONS.IQC_PCBA ||
    norm === 'PCBA' ||
    norm === 'SMT' ||
    norm === 'MI'
  );
}

/**
 * Pure authorization check for access to a specific QM Module / Section.
 * Follows least-privilege default-deny policy:
 * - Missing, null, or inactive profiles FAIL CLOSED (return false).
 * - Designated Admins receive FULL ACCESS across all modules.
 * - MD Sir Report is strictly restricted to designated Admin only.
 * - PCB-related sections are denied if 'PCB' is in excludedSections or not in allowedSections.
 * - PCBA-related sections are denied if 'PCBA' is in excludedSections or not in allowedSections.
 * - Regular Users cannot access Admin-only modules (USERS, SETTINGS).
 * - No loose fallback: all regular Users must be actively authorized.
 */
export function canAccessModule(
  profile: UserProfile | null | undefined,
  targetSection: QmSectionId | string
): boolean {
  // 1. Fail Closed: Deny if profile is missing or inactive
  if (!profile) return false;
  if (profile.status !== 'active') return false;

  // 2. Full Admin Authorization: Designated Admins bypass section boundaries
  if (isAdminProfile(profile)) {
    return true;
  }

  const targetUpper = targetSection.trim().toUpperCase();
  const isPcbTarget = isPcbRelatedSection(targetUpper);
  const isPcbaTarget = isPcbaRelatedSection(targetUpper);

  // 3. MD Sir Report Guard: Strictly restricted to Admin only (Regular users BLOCKED)
  if (targetUpper === QM_SECTIONS.MD_REPORT || targetUpper.startsWith('MD-REPORT')) {
    return false;
  }

  // 4. Admin Modules Guard: User Management & System Settings are Admin-only
  if (targetUpper === QM_SECTIONS.USERS || targetUpper === QM_SECTIONS.SETTINGS) {
    return false;
  }

  // 5. Excluded Sections Guard:
  // If the target section or plant category is in excludedSections, deny access immediately
  const excluded = (profile.excludedSections || []).map((s) => s.trim().toUpperCase());
  if (excluded.includes(targetUpper)) {
    return false;
  }
  if (isPcbTarget && (excluded.includes('PCB') || excluded.includes(QM_SECTIONS.PCB))) {
    return false;
  }
  if (isPcbaTarget && (excluded.includes('PCBA') || excluded.includes(QM_SECTIONS.PCBA))) {
    return false;
  }

  // 6. Dashboard is accessible to all active verified employees
  if (targetUpper === QM_SECTIONS.DASHBOARD) {
    return true;
  }

  // 7. Strict Evaluation of allowedSections
  if (Array.isArray(profile.allowedSections) && profile.allowedSections.length > 0) {
    const allowed = profile.allowedSections.map((s) => s.trim().toUpperCase());
    if (allowed.includes('ALL') || allowed.includes(targetUpper)) {
      return true;
    }
    // Check PCBA module grouping
    if (
      allowed.includes('PCBA') &&
      (targetUpper === QM_SECTIONS.PCBA ||
        targetUpper === QM_SECTIONS.PCBA_PROCESS ||
        targetUpper === QM_SECTIONS.IQC_PCBA ||
        targetUpper === 'SMT' ||
        targetUpper === 'MI')
    ) {
      return true;
    }
    // Check PCB module grouping
    if (
      allowed.includes('PCB') &&
      (targetUpper === QM_SECTIONS.PCB ||
        targetUpper === QM_SECTIONS.PCB_PROCESS ||
        targetUpper === QM_SECTIONS.IQC_PCB)
    ) {
      return true;
    }
    // Check IQC grouping
    if (allowed.includes('IQC')) {
      if (targetUpper === QM_SECTIONS.IQC) return true;
      if (allowed.includes('PCBA') && targetUpper === QM_SECTIONS.IQC_PCBA) return true;
      if (allowed.includes('PCB') && targetUpper === QM_SECTIONS.IQC_PCB) return true;
    }
    return false;
  }

  // Default Deny for any unverified combination
  return false;
}

/**
 * Pure authorization check for access to a specific PageId.
 * Maps pageId to its QM section and delegates to canAccessModule().
 */
export function canAccessPage(
  profile: UserProfile | null | undefined,
  pageId: string
): boolean {
  // Public home showcase page is universally accessible
  if (pageId === 'home') return true;

  const section = mapPageToSection(pageId);
  return canAccessModule(profile, section);
}

