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
  getBytes,
  getBlob,
  deleteObject,
} from "firebase/storage";
// Dedicated Firebase Configuration for Walton Quality Management
export const WALTON_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDEADvVcP-CRrJU6N4929X1OqF8k_a4FIg",
  authDomain: "quality-management-walton.firebaseapp.com",
  projectId: "quality-management-walton",
  storageBucket: "quality-management-walton.firebasestorage.app",
  messagingSenderId: "681257859221",
  appId: "1:681257859221:web:fa9219f527ffacfaedc39c",
  measurementId: "G-H9DB2JP70D",
};

// Suppress transient WebChannelConnection RPC 'Listen' stream transport warnings
setLogLevel("silent");

// Initialize Firebase App strictly for quality-management-walton
export const app = getApps().length === 0 ? initializeApp(WALTON_FIREBASE_CONFIG) : getApp();

// Initialize Firebase Analytics (when supported in browser environment)
export const analytics = typeof window !== "undefined"
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null)).catch(() => null)
  : null;

// Firebase Authentication (strictly bound to quality-management-walton)
export const auth = getAuth(app);

// Firestore Database: strictly connected to the '(default)' database in quality-management-walton
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
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



/**
 * Temporary test function to verify Firestore connection and document write.
 * Writes a document to 'connection_test' and confirms it via getDocFromServer.
 */
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  message: string;
  docId?: string;
  projectId: string;
  databaseId?: string;
  confirmedData?: any;
}> {
  console.log(
    `[Firestore Connection Test] Testing write with Project ID: ${WALTON_FIREBASE_CONFIG.projectId}, Database ID: (default)...`
  );
  try {
    const docRef = await addDoc(collection(db, "connection_test"), {
      message: "Walton Quality Management Firestore Connection Test",
      testStatus: "success",
      createdAt: serverTimestamp(),
    });

    // Confirm that Firestore completed the write operation by retrieving the document from server
    const confirmedSnap = await getDocFromServer(docRef);
    if (!confirmedSnap.exists()) {
      throw new Error(`Write was dispatched to Firestore, but the document ${docRef.id} could not be confirmed.`);
    }

    const result = {
      success: true,
      message: `Firestore connection verified successfully. Document confirmed with ID: ${docRef.id}`,
      docId: docRef.id,
      projectId: WALTON_FIREBASE_CONFIG.projectId,
      databaseId: '(default)',
      confirmedData: confirmedSnap.data(),
    };
    console.log("[Firestore Connection Test] Result:", result);
    return result;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Firestore Connection Test] Failed:", errorMsg);
    return {
      success: false,
      message: `Firestore connection test failed: ${errorMsg}`,
      projectId: WALTON_FIREBASE_CONFIG.projectId,
      databaseId: '(default)',
    };
  }
}

if (typeof window !== "undefined") {
  (window as any).__runFirestoreConnectionTest = testFirestoreConnection;
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
  getBytes,
  getBlob,
  deleteObject,
  type User,
  type Timestamp,
};
