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
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEADvVcP-CRrJU6N4929X1OqF8k_a4FIg",
  authDomain: "quality-management-walton.firebaseapp.com",
  projectId: "quality-management-walton",
  storageBucket: "quality-management-walton.firebasestorage.app",
  messagingSenderId: "681257859221",
  appId: "1:681257859221:web:fa9219f527ffacfaedc39c",
  measurementId: "G-H9DB2JP70D",
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication
export const auth = getAuth(app);

// Firestore Database with fallback
let firestoreDb: Firestore;
try {
  firestoreDb = getFirestore(app);
} catch (err) {
  console.warn("getFirestore direct initialization notice, trying initializeFirestore:", err);
  try {
    firestoreDb = initializeFirestore(app, {});
  } catch (fallbackErr) {
    console.error("Firestore initialization fallback failed:", fallbackErr);
    // Return standard getFirestore reference
    firestoreDb = getFirestore(app);
  }
}
export const db = firestoreDb;

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
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  type User,
  type Timestamp,
};
