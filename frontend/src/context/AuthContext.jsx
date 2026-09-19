import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  auth,
  signInWithGoogle as firebaseSignInWithGoogle,
  signUpWithFirebaseEmail,
  logInWithFirebaseEmail,
  firebaseSignOut,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  saveUserTopicProgressToFirestore,
  recordUserTestToFirestore,
  clearUserAiChatHistoryInFirestore,
} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8000/api/v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // 1. Check local cached user profile
    const cachedUser = localStorage.getItem("ql_cached_profile");
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (_) {}
    }
    // 2. Check guest session
    const isG = sessionStorage.getItem("ql_guest") === "true";
    if (isG) {
      return {
        id: "guest-researcher",
        uid: "guest-researcher",
        display_name: "Guest Researcher",
        full_name: "Guest Researcher",
        user_name: "Guest Researcher",
        email: "guest@quantumleap.edu",
        mail_id: "guest@quantumleap.edu",
        age: 22,
        total_xp: 150,
        rank: "Quantum Explorer",
        topics_covered: ["Superposition", "Entanglement Basics"],
        tests_count: 1,
        tests_history: [],
      };
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("ql_token") || null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => sessionStorage.getItem("ql_guest") === "true");
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync state to local cached profile
  const setPersistedUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      try {
        localStorage.setItem("ql_cached_profile", JSON.stringify(userData));
      } catch (_) {}
    } else {
      localStorage.removeItem("ql_cached_profile");
    }
  }, []);

  // Exchange Firebase ID token for our backend JWT and merge Firestore data
  const exchangeToken = useCallback(async (firebaseIdToken, fbUser) => {
    try {
      // 1. Try Firestore profile first for age and topics
      let firestoreProfile = null;
      if (fbUser?.uid) {
        firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
      }

      // 2. Backend JWT exchange
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebase_id_token: firebaseIdToken }),
      });

      let backendUser = null;
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("ql_token", data.access_token);
          setToken(data.access_token);
          backendUser = data.user;
        }
      }

      // 3. Construct unified user object
      const uid = fbUser?.uid || backendUser?.uid || "usr_" + Date.now();
      const email = fbUser?.email || backendUser?.email || "";
      const displayName = fbUser?.displayName || backendUser?.display_name || email.split("@")[0] || "User";
      const age = firestoreProfile?.age || backendUser?.age || null;
      
      let topicsCovered = firestoreProfile?.topicsCovered || [];
      if (!topicsCovered.length && backendUser?.topics_covered) {
        try {
          topicsCovered = JSON.parse(backendUser.topics_covered);
        } catch (_) {}
      }

      const testsCount = firestoreProfile?.testsCount || backendUser?.tests_count || 0;
      const testsHistory = firestoreProfile?.testsHistory || [];

      const fullUser = {
        id: uid,
        uid: uid,
        display_name: displayName,
        user_name: displayName,
        full_name: displayName,
        email: email,
        mail_id: email,
        age: age,
        photo_url: fbUser?.photoURL || backendUser?.photo_url || null,
        total_xp: backendUser?.total_xp || firestoreProfile?.totalXp || 100,
        role: backendUser?.role || firestoreProfile?.role || "student",
        topics_covered: topicsCovered,
        tests_count: testsCount,
        tests_history: testsHistory,
      };

      sessionStorage.removeItem("ql_guest");
      setIsGuest(false);
      setPersistedUser(fullUser);

      // Also ensure Firestore is updated
      saveUserProfileToFirestore(uid, {
        uid,
        displayName,
        email,
        age,
        lastLogin: new Date().toISOString(),
      });

      return fullUser;
    } catch (err) {
      console.warn("[AuthContext] Token exchange notice:", err);
      // If backend is offline, still set up Firebase user
      if (fbUser) {
        const fallbackUser = {
          id: fbUser.uid,
          uid: fbUser.uid,
          display_name: fbUser.displayName || fbUser.email?.split("@")[0] || "Quantum Student",
          user_name: fbUser.displayName || fbUser.email?.split("@")[0] || "Quantum Student",
          email: fbUser.email,
          mail_id: fbUser.email,
          age: null,
          total_xp: 100,
          role: "student",
          topics_covered: [],
          tests_count: 0,
          tests_history: [],
        };
        sessionStorage.removeItem("ql_guest");
        setIsGuest(false);
        setPersistedUser(fallbackUser);
        return fallbackUser;
      }
    }
    return null;
  }, [setPersistedUser]);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        sessionStorage.removeItem("ql_guest");
        setIsGuest(false);
        try {
          const idToken = await fbUser.getIdToken(true);
          await exchangeToken(idToken, fbUser);
        } catch (e) {
          console.warn("[Firebase] Could not get ID token:", e);
        }
      } else if (!isGuest) {
        // If not logged into Firebase and not guest, check if we have a valid token
        const savedToken = localStorage.getItem("ql_token");
        if (!savedToken) {
          setPersistedUser(null);
        }
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [exchangeToken, isGuest, setPersistedUser]);

  // Google Sign-In
  const signInWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const credential = await firebaseSignInWithGoogle();
      const idToken = await credential.user.getIdToken();
      await exchangeToken(idToken, credential.user);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError(err.message);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Email, Password, Name, and Age
  const registerWithCredentials = async (email, password, displayName = "", age = null) => {
    setAuthError(null);
    setIsLoading(true);
    const parsedAge = age ? parseInt(age, 10) : null;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split("@")[0];

    try {
      // 1. Firebase Auth native cloud registration
      let fbCred = null;
      try {
        fbCred = await signUpWithFirebaseEmail(cleanEmail, password, cleanName, parsedAge);
      } catch (fbErr) {
        console.warn("[Firebase Auth] Cloud register note:", fbErr.message);
        if (fbErr.code === "auth/email-already-in-use") {
          throw new Error("This email address is already registered in Firebase. Please log in.");
        }
      }

      // 2. Local Backend registration
      let backendUser = null;
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            display_name: cleanName,
            age: parsedAge,
          }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("ql_token", data.access_token);
          setToken(data.access_token);
          backendUser = data.user;
        }
      } catch (backendErr) {
        console.warn("[Backend Auth] Register note:", backendErr);
      }

      // 3. Assemble complete user
      const uid = fbCred?.user?.uid || backendUser?.uid || `usr_${Date.now()}`;
      const newUser = {
        id: uid,
        uid: uid,
        display_name: cleanName,
        user_name: cleanName,
        full_name: cleanName,
        email: cleanEmail,
        mail_id: cleanEmail,
        age: parsedAge,
        total_xp: backendUser?.total_xp || 50,
        role: "student",
        topics_covered: [],
        tests_count: 0,
        tests_history: [],
      };

      sessionStorage.removeItem("ql_guest");
      setIsGuest(false);
      setPersistedUser(newUser);

      // 4. Save to Firestore
      saveUserProfileToFirestore(uid, {
        uid,
        displayName: cleanName,
        email: cleanEmail,
        age: parsedAge,
        topicsCovered: [],
        testsCount: 0,
        totalXp: 50,
      });

      return newUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Email and Password
  const loginWithCredentials = async (email, password) => {
    setAuthError(null);
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Try Firebase Auth native sign-in
      let fbCred = null;
      try {
        fbCred = await logInWithFirebaseEmail(cleanEmail, password);
      } catch (fbErr) {
        console.warn("[Firebase Auth] Cloud login note:", fbErr.message);
      }

      // 2. Try Backend login
      let backendUser = null;
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("ql_token", data.access_token);
          setToken(data.access_token);
          backendUser = data.user;
        }
      } catch (backendErr) {
        console.warn("[Backend Auth] Login note:", backendErr);
      }

      // If both failed, throw error
      if (!fbCred && !backendUser) {
        throw new Error("Invalid email or password. Please verify your credentials.");
      }

      // 3. Load Firestore document if available
      const uid = fbCred?.user?.uid || backendUser?.uid;
      const firestoreProfile = uid ? await getUserProfileFromFirestore(uid) : null;

      const displayName = firestoreProfile?.displayName || backendUser?.display_name || cleanEmail.split("@")[0];
      const age = firestoreProfile?.age || backendUser?.age || null;
      let topicsCovered = firestoreProfile?.topicsCovered || [];
      if (!topicsCovered.length && backendUser?.topics_covered) {
        try {
          topicsCovered = JSON.parse(backendUser.topics_covered);
        } catch (_) {}
      }

      const fullUser = {
        id: uid,
        uid: uid,
        display_name: displayName,
        user_name: displayName,
        full_name: displayName,
        email: cleanEmail,
        mail_id: cleanEmail,
        age: age,
        total_xp: backendUser?.total_xp || firestoreProfile?.totalXp || 100,
        role: backendUser?.role || "student",
        topics_covered: topicsCovered,
        tests_count: firestoreProfile?.testsCount || backendUser?.tests_count || 0,
        tests_history: firestoreProfile?.testsHistory || [],
      };

      sessionStorage.removeItem("ql_guest");
      setIsGuest(false);
      setPersistedUser(fullUser);
      return fullUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Continue as Guest
  const continueAsGuest = () => {
    sessionStorage.setItem("ql_guest", "true");
    setIsGuest(true);
    const guestUser = {
      id: "guest-researcher",
      uid: "guest-researcher",
      display_name: "Guest Researcher",
      user_name: "Guest Researcher",
      full_name: "Guest Researcher",
      email: "guest@quantumleap.edu",
      mail_id: "guest@quantumleap.edu",
      age: 22,
      total_xp: 150,
      rank: "Quantum Explorer",
      topics_covered: ["Superposition", "Entanglement Basics"],
      tests_count: 1,
      tests_history: [],
    };
    setPersistedUser(guestUser);
    setIsLoading(false);
  };

  // Sign out cleanly
  const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (_) {}
    sessionStorage.removeItem("ql_guest");
    setIsGuest(false);
    setPersistedUser(null);
    setToken(null);
    setFirebaseUser(null);
    localStorage.removeItem("ql_token");
  };

  // ─── Progress Tracking Functions ─────────────────────────────────────────────

  /**
   * Records that a user has covered a topic in Learning Hub or Curriculum.
   */
  const updateUserTopics = useCallback(async (topicName, progressPercent = 100) => {
    if (!topicName) return;
    setUser((prev) => {
      if (!prev) return prev;
      const currentList = prev.topics_covered || [];
      if (!currentList.includes(topicName)) {
        const updatedList = [...currentList, topicName];
        const updated = {
          ...prev,
          topics_covered: updatedList,
          total_xp: (prev.total_xp || 0) + 30,
        };
        try {
          localStorage.setItem("ql_cached_profile", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      }
      return prev;
    });

    // Sync to Firestore & Backend
    const currentUid = user?.id || user?.uid;
    if (currentUid && !isGuest) {
      saveUserTopicProgressToFirestore(currentUid, topicName, progressPercent);

      const savedToken = localStorage.getItem("ql_token");
      if (savedToken) {
        try {
          await fetch(`${API_BASE}/auth/progress/topic`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${savedToken}`,
            },
            body: JSON.stringify({ topic: topicName, progress_percent: progressPercent }),
          });
        } catch (_) {}
      }
    }
  }, [user, isGuest]);

  /**
   * Records a test taken in Assessment Center.
   */
  const recordTest = useCallback(async (testSummary) => {
    if (!testSummary) return;
    setUser((prev) => {
      if (!prev) return prev;
      const newCount = (prev.tests_count || 0) + 1;
      const newHistory = [testSummary, ...(prev.tests_history || [])];
      const updated = {
        ...prev,
        tests_count: newCount,
        tests_history: newHistory,
        total_xp: (prev.total_xp || 0) + 60,
      };
      try {
        localStorage.setItem("ql_cached_profile", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    const currentUid = user?.id || user?.uid;
    if (currentUid && !isGuest) {
      recordUserTestToFirestore(currentUid, testSummary);

      const savedToken = localStorage.getItem("ql_token");
      if (savedToken) {
        try {
          await fetch(`${API_BASE}/auth/progress/test`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${savedToken}`,
            },
            body: JSON.stringify({
              test_id: testSummary.quiz_id || testSummary.id,
              score_percentage: testSummary.score_percentage,
              topic: testSummary.topic,
            }),
          });
        } catch (_) {}
      }
    }
  }, [user, isGuest]);

  /**
   * Updates user profile fields such as display_name and age.
   */
  const updateUserProfile = useCallback(async ({ displayName, age }) => {
    const parsedAge = age ? parseInt(age, 10) : null;
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        display_name: displayName || prev.display_name,
        user_name: displayName || prev.user_name,
        full_name: displayName || prev.full_name,
        age: parsedAge !== null ? parsedAge : prev.age,
      };
      try {
        localStorage.setItem("ql_cached_profile", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    const currentUid = user?.id || user?.uid;
    if (currentUid && !isGuest) {
      saveUserProfileToFirestore(currentUid, {
        displayName: displayName || undefined,
        age: parsedAge,
      });

      const savedToken = localStorage.getItem("ql_token");
      if (savedToken) {
        try {
          await fetch(`${API_BASE}/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${savedToken}`,
            },
            body: JSON.stringify({
              display_name: displayName,
              age: parsedAge,
            }),
          });
        } catch (_) {}
      }
    }
  }, [user, isGuest]);

  /**
   * Deletes all AI chat history for the user from Firestore and localStorage.
   */
  const deleteUserChatHistory = useCallback(() => {
    const currentUid = user?.id || user?.uid || "guest";
    clearUserAiChatHistoryInFirestore(currentUid);
    try {
      localStorage.removeItem(`ql_ai_chats_${currentUid}`);
      localStorage.removeItem(`ql_ai_chats_guest`);
      localStorage.removeItem(`ql_copilot_chats_${currentUid}`);
      localStorage.removeItem(`ql_copilot_chats_guest`);
      window.dispatchEvent(new CustomEvent("ql_chat_history_cleared"));
    } catch (_) {}
  }, [user]);

  const authFetch = useCallback(async (endpointOrUrl, options = {}) => {
    const url = endpointOrUrl.startsWith("http")
      ? endpointOrUrl
      : `${API_BASE}${endpointOrUrl.startsWith("/") ? "" : "/"}${endpointOrUrl}`;
    const headers = { ...(options.headers || {}) };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        firebaseUser,
        isGuest,
        isLoading,
        authError,
        signInWithGoogle,
        loginWithCredentials,
        registerWithCredentials,
        continueAsGuest,
        signOut,
        authFetch,
        refetchProfile: () => token && fetchProfile(token),
        updateUserTopics,
        recordTest,
        updateUserProfile,
        deleteUserChatHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
