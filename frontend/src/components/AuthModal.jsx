import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2, Lock, Mail, User, ShieldCheck, Sparkles, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const {
    signInWithGoogle,
    loginWithCredentials,
    registerWithCredentials,
    continueAsGuest,
    isLoading,
    authError: contextAuthError,
  } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setAge("");
    setLocalError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithCredentials(email, password);
        setSuccessMsg("Signed in successfully! Loading environment...");
        setTimeout(handleClose, 600);
      } else {
        await registerWithCredentials(email, password, displayName, age);
        setSuccessMsg("Account created successfully! Welcome to Quantum Leap.");
        setTimeout(handleClose, 800);
      }
    } catch (err) {
      setLocalError(err.message || "Authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err) {
      setLocalError(err.message || "Google authentication could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestExplore = () => {
    continueAsGuest();
    handleClose();
  };

  const fillResearcherDemo = () => {
    setMode("login");
    setEmail("researcher@quantumleap.edu");
    setPassword("QuantumLeap#2026");
    setLocalError(null);
  };

  const fillStudentDemo = () => {
    setMode("login");
    setEmail("student@quantumleap.edu");
    setPassword("QuantumLeap#2026");
    setLocalError(null);
  };

  const displayError = localError || contextAuthError;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(11, 15, 25, 0.82)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 250,
      padding: "16px",
    }}>
      <div style={{
        background: "var(--bg-card, #111827)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "12px",
        width: "440px",
        maxWidth: "94vw",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        position: "relative",
        boxShadow: "0 20px 48px rgba(0, 0, 0, 0.6)",
        color: "var(--text-main, #f3f4f6)",
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "transparent", border: "none", color: "#9ca3af",
            cursor: "pointer", padding: "4px", borderRadius: "4px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>

        {/* Typographic Brand Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "3px 10px", borderRadius: "12px",
            background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#818cf8", fontSize: "0.72rem", fontWeight: 600, marginBottom: "8px",
          }}>
            <ShieldCheck size={13} />
            <span>Secure Academic Authentication</span>
          </div>
          <h2 style={{
            fontSize: "1.35rem", fontWeight: 700, color: "#ffffff",
            letterSpacing: "-0.02em", margin: "0 0 6px 0"
          }}>
            Quantum Leap Portal
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.45, margin: 0 }}>
            {mode === "login"
              ? "Sign in to access your saved circuits, research telemetry, and AI tutor history."
              : "Register your research account to track mastery progress and certification exams."}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px",
          background: "rgba(255, 255, 255, 0.04)", padding: "4px", borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <button
            type="button"
            onClick={() => { setMode("login"); setLocalError(null); }}
            style={{
              padding: "8px 12px", border: "none", borderRadius: "6px",
              background: mode === "login" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: mode === "login" ? "#ffffff" : "#9ca3af",
              fontWeight: mode === "login" ? 600 : 400,
              fontSize: "0.82rem", cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setLocalError(null); }}
            style={{
              padding: "8px 12px", border: "none", borderRadius: "6px",
              background: mode === "register" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: mode === "register" ? "#ffffff" : "#9ca3af",
              fontWeight: mode === "register" ? 600 : 400,
              fontSize: "0.82rem", cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Credentials Banner */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px dashed rgba(99, 102, 241, 0.35)",
          borderRadius: "8px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#a5b4fc", fontWeight: 600 }}>
            <Sparkles size={12} />
            <span>Instant Access · Pre-Configured Demo Credentials:</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={fillResearcherDemo}
              style={{
                flex: 1, padding: "5px 8px", background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "4px",
                color: "#c7d2fe", fontSize: "0.72rem", fontWeight: 500, cursor: "pointer",
                textAlign: "center",
              }}
            >
              Fill Researcher (Faculty)
            </button>
            <button
              type="button"
              onClick={fillStudentDemo}
              style={{
                flex: 1, padding: "5px 8px", background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "4px",
                color: "#bfdbfe", fontSize: "0.72rem", fontWeight: 500, cursor: "pointer",
                textAlign: "center",
              }}
            >
              Fill Student (Learner)
            </button>
          </div>
        </div>

        {/* Main Email / Password Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === "register" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#cbd5e1", marginBottom: "4px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Richard Feynman"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: "100%", padding: "9px 12px 9px 34px",
                      background: "#1f2937", border: "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "6px", color: "#ffffff", fontSize: "0.82rem", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#cbd5e1", marginBottom: "4px" }}>
                  Age (Years)
                </label>
                <div style={{ position: "relative" }}>
                  <Calendar size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                  <input
                    type="number"
                    min="10"
                    max="120"
                    placeholder="e.g. 21"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{
                      width: "100%", padding: "9px 12px 9px 34px",
                      background: "#1f2937", border: "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "6px", color: "#ffffff", fontSize: "0.82rem", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#cbd5e1", marginBottom: "4px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  background: "#1f2937", border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "6px", color: "#ffffff", fontSize: "0.82rem", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#cbd5e1", marginBottom: "4px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  background: "#1f2937", border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "6px", color: "#ffffff", fontSize: "0.82rem", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <div style={{
              padding: "8px 12px", borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{displayError}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div style={{
              padding: "8px 12px", borderRadius: "6px",
              background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#86efac", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              border: "none",
              color: "#ffffff",
              fontSize: "0.86rem",
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "opacity 0.15s ease",
              opacity: isSubmitting ? 0.75 : 1,
              marginTop: "4px",
            }}
          >
            {isSubmitting
              ? (mode === "login" ? "Authenticating Credentials..." : "Creating Account...")
              : (mode === "login" ? "Sign In to Workspace" : "Complete Registration")}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          color: "#6b7280", fontSize: "0.70rem", textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span>or sign in with</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Secondary Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isLoading}
            style={{
              width: "100%",
              padding: "9px 14px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1px solid #d1d5db",
              color: "#1f2937",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          {/* Guest Mode */}
          <button
            type="button"
            onClick={handleGuestExplore}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#9ca3af",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Explore as Anonymous Guest Researcher
          </button>
        </div>

        <div style={{ fontSize: "0.70rem", color: "#6b7280", textAlign: "center", marginTop: "2px" }}>
          Protected by SHA-256 PBKDF2 Password Encryption & JWT Standard Tokens
        </div>
      </div>
    </div>
  );
}
