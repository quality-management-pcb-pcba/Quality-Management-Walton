// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Suppress transient WebChannelConnection RPC 'Listen' stream transport warnings
setLogLevel("silent");

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication
export const auth = getAuth(app);

// Firestore Database (passing firestoreDatabaseId for custom instance + long polling for iframe/proxy stability)
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      databaseId
    );
  } catch {
    return getFirestore(app, databaseId);
  }
})();

// Firebase Cloud Storage for SOPs, Work Instructions, and Quality Evidence
export const storage = getStorage(app);

// Operation Types for error tracing
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AuditMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  createdByEmail: string;
  updatedByEmail: string;
}

export function getAuditIdentity(): { uid: string; email: string } {
  if (auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email || 'qm.pcba26@gmail.com',
    };
  }
  try {
    const savedSession = localStorage.getItem('walton_auth_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      if (parsed && (parsed.uid || parsed.email)) {
        return {
          uid: parsed.uid || parsed.email,
          email: parsed.email || 'qm.pcba26@gmail.com',
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    uid: 'system-seed',
    email: 'qm.pcba26@gmail.com',
  };
}

export function buildCreateAudit(): AuditMetadata {
  const now = new Date().toISOString();
  const { uid, email } = getAuditIdentity();
  return {
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    updatedBy: uid,
    createdByEmail: email,
    updatedByEmail: email,
  };
}

export function buildUpdateAudit(): Pick<AuditMetadata, 'updatedAt' | 'updatedBy' | 'updatedByEmail'> {
  const now = new Date().toISOString();
  const { uid, email } = getAuditIdentity();
  return {
    updatedAt: now,
    updatedBy: uid,
    updatedByEmail: email,
  };
}

// Initialize analytics safely if supported in browser/iframe environment
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics failures in restricted sandbox/iframe environments
    });
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type User,
  type Timestamp,
};
