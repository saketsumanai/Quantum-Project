import React, { useState } from "react";
import { Atom, X, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle, isLoading, authError } = useAuth();
  const [signing, setSigning] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setSigning(true);
    await signInWithGoogle();
    setSigning(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(7, 9, 14, 0.88)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
    }}>
      <div className="glass-panel-glow" style={{
        width: "420px",
        maxWidth: "92vw",
        padding: "40px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        position: "relative",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
        }}>
          <X size={20} />
        </button>

        {/* Animated Logo */}
        <div style={{
          width: "64px", height: "64px", borderRadius: "6px",
          background: "rgba(15, 98, 254, 0.18)",
          border: "1px solid rgba(15, 98, 254, 0.4)",
          boxShadow: "0 0 20px rgba(15, 98, 254, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Atom className="animate-spin-slow" size={36} color="#38bdf8" />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{
            fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-display)",
            color: "#f4f4f4",
          }}>
            Quantum Leap
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "6px" }}>
            Sign in to save circuit designs and sync learning progress.
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signing || isLoading}
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: signing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            fontSize: "0.97rem",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            cursor: signing ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => { if (!signing) e.currentTarget.style.background = "rgba(255,255,255,0.13)"; }}
          onMouseLeave={(e) => { if (!signing) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
        >
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {signing ? "Signing in…" : "Continue with Google"}
        </button>

        {/* Error */}
        {authError && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 14px", borderRadius: "8px",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", fontSize: "0.8rem", width: "100%",
          }}>
            <AlertCircle size={14} /> {authError}
          </div>
        )}

        {/* Anonymous note */}
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
          You can explore the Circuit Studio without signing in.<br />
          Progress saving and curriculum tracking require an account.
        </p>
      </div>
    </div>
  );
}
