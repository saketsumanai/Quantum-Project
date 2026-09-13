import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, signInWithGoogle as firebaseSignInWithGoogle, firebaseSignOut } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8000/api/v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Backend user profile from SQLite
  const [token, setToken] = useState(() => localStorage.getItem("ql_token") || null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Exchange Firebase ID token for our backend JWT
  const exchangeToken = useCallback(async (firebaseIdToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebase_id_token: firebaseIdToken }),
      });
      if (!res.ok) throw new Error(`Auth exchange failed: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("ql_token", data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return data;
      }
    } catch (err) {
      console.error("[AuthContext] Token exchange error:", err);
      setAuthError(err.message);
    }
    return null;
  }, []);

  // Fetch profile from backend if we have a token
  const fetchProfile = useCallback(async (jwtToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
      } else {
        // Token expired — clear
        localStorage.removeItem("ql_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("[AuthContext] Profile fetch error:", err);
    }
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Get fresh Firebase ID token
        const idToken = await fbUser.getIdToken(true);
        await exchangeToken(idToken);
      } else {
        // User signed out of Firebase
        setUser(null);
        setToken(null);
        localStorage.removeItem("ql_token");
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [exchangeToken]);

  // On mount: if we have a stored backend token but Firebase user isn't loaded yet
  useEffect(() => {
    if (token && !user && !isLoading) {
      fetchProfile(token);
    }
  }, [token, user, isLoading, fetchProfile]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const credential = await firebaseSignInWithGoogle();
      const idToken = await credential.user.getIdToken();
      await exchangeToken(idToken);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (_) {}
    setUser(null);
    setToken(null);
    setFirebaseUser(null);
    localStorage.removeItem("ql_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, firebaseUser, isLoading, authError, signInWithGoogle, signOut }}
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
