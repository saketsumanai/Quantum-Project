// ============================================================
// Quantum Leap — Firebase & Cloud Firestore App Initialization
// Project: quantumleap-4a8d6
// Provides: Auth (Google + Email/Password), Firestore User Database,
// Topic Progress Tracking, Diagnostic Assessment Storage, and AI Chat History
// ============================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDv6Lak1Ourt6-peOUyx39e3mPFAXMRvL8",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quantumleap-4a8d6.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "quantumleap-4a8d6",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quantumleap-4a8d6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "250509811415",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:250509811415:web:75d31baf413f202e139a92",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Q0L5TJZM6X",
};

// Prevent "duplicate app" error during Vite HMR hot reloads
let appInstance = null;
let authInstance = null;
let googleProviderInstance = null;
let dbInstance = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: "select_account" });
  dbInstance = getFirestore(appInstance);
} catch (err) {
  console.warn("[Firebase] Initialization warning (falling back to offline/local fallback mode):", err);
}

export const app = appInstance;
export const auth = authInstance;
export const googleProvider = googleProviderInstance;
export const db = dbInstance;

// Analytics — only initialize in supported browser environments
export let analytics = null;
if (app) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// ─── Authentication Functions ─────────────────────────────────────────────────

export async function signInWithGoogle(preferRedirect = false) {
  if (!auth) {
    throw new Error("Firebase Auth is unavailable. Please check network connection or use Guest Mode.");
  }
  // Direct redirect mode (bypasses popup blockers completely)
  if (preferRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    if (credential?.user) {
      // Auto sync user base info to Firestore (non-blocking)
      saveUserProfileToFirestore(credential.user.uid, {
        uid: credential.user.uid,
        displayName: credential.user.displayName || credential.user.email?.split("@")[0] || "Quantum Explorer",
        email: credential.user.email,
        photoUrl: credential.user.photoURL || null,
        provider: "google",
        lastLogin: new Date().toISOString(),
      }).catch((e) => console.warn("[Firebase] Firestore profile sync notice:", e));
    }
    return credential;
  } catch (err) {
    if (err.code === "auth/popup-blocked") {
      console.warn("[Firebase Auth] Popup blocked by browser. Automatically falling back to redirect flow...");
      // Seamlessly fall back to full page redirect so the user is never stranded
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    if (err.code === "auth/unauthorized-domain") {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "your Vercel domain";
      const domainErr = new Error(
        `Firebase domain not authorized: '${currentHost}'. To use Google Sign-In on Vercel, please add '${currentHost}' in Firebase Console > Authentication > Settings > Authorized Domains. In the meantime, you can log in with Email or Demo Accounts!`
      );
      domainErr.code = "auth/unauthorized-domain";
      throw domainErr;
    }
    if (err.code === "auth/popup-closed-by-user") {
      throw err;
    }
    throw err;
  }
}

/**
 * Checks for incoming redirect auth credential upon page return.
 */
export async function checkRedirectAuthResult() {
  if (!auth) return null;
  try {
    const credential = await getRedirectResult(auth);
    if (credential?.user) {
      saveUserProfileToFirestore(credential.user.uid, {
        uid: credential.user.uid,
        displayName: credential.user.displayName || credential.user.email?.split("@")[0] || "Quantum Explorer",
        email: credential.user.email,
        photoUrl: credential.user.photoURL || null,
        provider: "google",
        lastLogin: new Date().toISOString(),
      }).catch((e) => console.warn("[Firebase] Firestore profile sync notice:", e));
      return credential;
    }
  } catch (err) {
    console.warn("[Firebase] checkRedirectAuthResult notice:", err);
  }
  return null;
}

/**
 * Registers a new account with Email and Password in Firebase Auth,
 * sets the display name, and creates the complete user document in Firestore with age.
 */
export async function signUpWithFirebaseEmail(email, password, displayName = "", age = null) {
  if (!auth) {
    throw new Error("Firebase Auth is unavailable. Using local account registration.");
  }
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const name = displayName.trim() || email.split("@")[0];

  if (name && cred.user) {
    try {
      await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      console.warn("[Firebase] Could not update profile display name:", e);
    }
  }

  // Create initial user document in Firestore with age, email, name, topics, tests
  saveUserProfileToFirestore(cred.user.uid, {
    uid: cred.user.uid,
    displayName: name,
    email: email.trim(),
    age: age ? parseInt(age, 10) : null,
    provider: "email",
    role: "student",
    totalXp: 50, // Welcome bonus
    topicsCovered: [],
    topicsProgress: {},
    testsCount: 0,
    testsHistory: [],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }).catch((e) => console.warn("[Firebase] Firestore doc save notice:", e));

  return cred;
}

/**
 * Signs in with Email and Password via Firebase Auth.
 */
export async function logInWithFirebaseEmail(email, password) {
  if (!auth) {
    throw new Error("Firebase Auth is unavailable. Using local credential verification.");
  }
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  if (cred?.user) {
    saveUserProfileToFirestore(cred.user.uid, {
      uid: cred.user.uid,
      email: cred.user.email,
      lastLogin: new Date().toISOString(),
    }).catch((e) => console.warn("[Firebase] Firestore login timestamp notice:", e));
  }
  return cred;
}

/**
 * Signs out the current Firebase user.
 */
export async function firebaseSignOut() {
  if (!auth) return;
  return signOut(auth);
}

// ─── Firestore User Data Persistence ──────────────────────────────────────────

/**
 * Saves or merges user profile data in Cloud Firestore.
 */
export async function saveUserProfileToFirestore(uid, profileData) {
  if (!uid) return;
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] User profile save note (offline or permission):", err);
    // Fallback to local storage
    try {
      const existing = JSON.parse(localStorage.getItem(`ql_user_${uid}`) || "{}");
      localStorage.setItem(`ql_user_${uid}`, JSON.stringify({ ...existing, ...profileData }));
    } catch (_) {}
  }
}

/**
 * Retrieves full user profile from Cloud Firestore or cached local storage.
 */
export async function getUserProfileFromFirestore(uid) {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("[Firestore] Get user profile note:", err);
  }
  // Fallback to local cache
  try {
    const local = localStorage.getItem(`ql_user_${uid}`);
    if (local) return JSON.parse(local);
  } catch (_) {}
  return null;
}

/**
 * Records that a user has covered / progressed through a quantum topic in Firestore.
 */
export async function saveUserTopicProgressToFirestore(uid, topicName, progressPercent = 100) {
  if (!uid || !topicName) return;
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      topicsCovered: arrayUnion(topicName),
      [`topicsProgress.${topicName}`]: {
        progress: progressPercent,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] Topic progress save note:", err);
  }

  // Always keep cached in local storage for instant access
  try {
    const key = `ql_topics_covered_${uid}`;
    const covered = JSON.parse(localStorage.getItem(key) || "[]");
    if (!covered.includes(topicName)) {
      covered.push(topicName);
      localStorage.setItem(key, JSON.stringify(covered));
    }
  } catch (_) {}
}

/**
 * Records a diagnostic test score and increments the user's test count in Firestore.
 */
export async function recordUserTestToFirestore(uid, testReport) {
  if (!uid || !testReport) return;
  const summary = {
    testId: testReport.quiz_id || testReport.id || `test_${Date.now()}`,
    title: testReport.title || "Quantum Assessment",
    topic: testReport.topic || "Quantum Foundations",
    scorePercentage: testReport.score_percentage || 0,
    correctCount: testReport.correct_count || 0,
    totalQuestions: testReport.total_questions || 5,
    timestamp: new Date().toISOString(),
  };

  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    const currentCount = (snap.exists() ? snap.data().testsCount : 0) || 0;

    await setDoc(userDocRef, {
      testsCount: currentCount + 1,
      testsHistory: arrayUnion(summary),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] Test report record note:", err);
  }

  // Local storage backup
  try {
    const key = `ql_tests_history_${uid}`;
    const history = JSON.parse(localStorage.getItem(key) || "[]");
    history.unshift(summary);
    localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
  } catch (_) {}
}

/**
 * Deletes or clears stored AI chat history for a user.
 */
export async function clearUserAiChatHistoryInFirestore(uid) {
  if (!uid) return;
  try {
    const chatDocRef = doc(db, "user_chats", uid);
    await setDoc(chatDocRef, {
      sessions: [],
      clearedAt: serverTimestamp(),
    }, { merge: false });
  } catch (err) {
    console.warn("[Firestore] Chat clear note:", err);
  }
  // Clear local chat storage
  try {
    localStorage.removeItem(`ql_ai_chats_${uid}`);
    localStorage.removeItem(`ql_copilot_chats_${uid}`);
  } catch (_) {}
}

export default app;
