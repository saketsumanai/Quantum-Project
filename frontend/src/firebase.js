// ============================================================
// Quantum Leap — Firebase App Initialization
// Replace the placeholder values below with your Firebase
// project credentials from the Firebase Console.
//
// HOW TO GET THESE VALUES:
// 1. Go to https://console.firebase.google.com/
// 2. Project Settings (gear icon) → Your Apps → Web App
// 3. Copy the firebaseConfig object
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// ⚠️ REPLACE WITH YOUR FIREBASE CONFIG:
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "YOUR_PROJECT.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "YOUR_APP_ID",
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Auth instance and providers
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Opens a Google Sign-In popup and returns the Firebase user credential.
 * Throws on cancellation or error.
 */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Signs out the current Firebase user.
 */
export async function firebaseSignOut() {
  return signOut(auth);
}

export default firebaseApp;
