import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2, Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
      setLocalError("Please provide your email address and password.");
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
        setSuccessMsg("Signed in successfully. Entering workspace...");
        setTimeout(handleClose, 500);
      } else {
        await registerWithCredentials(email, password, displayName, age);
        setSuccessMsg("Account created successfully. Welcome to Quantum Leap!");
        setTimeout(handleClose, 600);
      }
    } catch (err) {
      setLocalError(err.message || "Unable to complete authentication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (preferRedirect = false) => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle(preferRedirect);
      handleClose();
    } catch (err) {
      setLocalError(err.message || "Google sign-in could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestExplore = () => {
    continueAsGuest();
    handleClose();
  };

  const handleQuickDemo = async (role) => {
    const isResearcher = role === "researcher";
    const demoEmail = isResearcher ? "researcher@quantumleap.edu" : "student@quantumleap.edu";
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await loginWithCredentials(demoEmail, "QuantumLeap#2026");
      setSuccessMsg(`Welcome, ${isResearcher ? "Dr. Ananya Sharma" : "Arjun Patel"}!`);
      setTimeout(handleClose, 400);
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || contextAuthError;
  const isUnauthorizedDomain =
    displayError &&
    (displayError.toLowerCase().includes("authoriz") ||
      displayError.toLowerCase().includes("unauthor") ||
      displayError.toLowerCase().includes("authorized domain"));

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 7, 14, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "linear-gradient(180deg, #131722 0%, #0d111a 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "32px 28px",
          boxShadow: "0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.04)",
          position: "relative",
          color: "#f3f4f6",
          fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#9ca3af",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9ca3af";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
          }}
        >
          <X size={15} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              color: "#a5b4fc",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.25)",
            }}
          >
            <Sparkles size={20} />
          </div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 6px 0",
              color: "#ffffff",
            }}
          >
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#9ca3af", lineHeight: 1.4 }}>
            {mode === "login"
              ? "Sign in to access your circuits, curriculum & AI tutor"
              : "Start learning quantum computing with AI-guided assistance"}
          </p>
        </div>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={() => handleGoogleSignIn(false)}
          disabled={isSubmitting || isLoading}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            color: "#1f2937",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.15s ease",
            marginBottom: "18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) e.currentTarget.style.backgroundColor = "#f9fafb";
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
            color: "#4b5563",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
          <span>or with email</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === "register" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#d1d5db", marginBottom: "5px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Richard Feynman"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 36px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#d1d5db", marginBottom: "5px" }}>
                  Age
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  placeholder="e.g. 21"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    outline: "none",
                    boxSizing: "border-box",
                    textAlign: "center",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 500, color: "#d1d5db", marginBottom: "5px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontSize: "0.74rem", fontWeight: 500, color: "#d1d5db" }}>
                Password
              </label>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 38px 9px 36px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {displayError && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#fca5a5",
                fontSize: "0.76rem",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span style={{ lineHeight: 1.4 }}>{displayError}</span>
              </div>
              {isUnauthorizedDomain && (
                <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("researcher")}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "rgba(99, 102, 241, 0.2)",
                      border: "1px solid rgba(99, 102, 241, 0.4)",
                      color: "#c7d2fe",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    Login as Researcher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("student")}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "#bfdbfe",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    Login as Student
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
                color: "#86efac",
                fontSize: "0.76rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              border: "none",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 2px 10px rgba(79, 70, 229, 0.3)",
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : mode === "login" ? (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.78rem", color: "#9ca3af" }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setLocalError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#818cf8",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setLocalError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#818cf8",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Discreet Quick Demos Footer */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontSize: "0.74rem",
            color: "#6b7280",
          }}
        >
          <span>Quick Access:</span>
          <button
            type="button"
            onClick={() => handleQuickDemo("researcher")}
            style={{
              background: "none",
              border: "none",
              color: "#a5b4fc",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.74rem",
            }}
          >
            Researcher Demo
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleQuickDemo("student")}
            style={{
              background: "none",
              border: "none",
              color: "#93c5fd",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.74rem",
            }}
          >
            Student Demo
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={handleGuestExplore}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.74rem",
            }}
          >
            Guest
          </button>
        </div>
      </div>
    </div>
  );
}
