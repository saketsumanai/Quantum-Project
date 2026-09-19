import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  BookOpen,
  Award,
  Trash2,
  Save,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UserProfileModal({ isOpen, onClose }) {
  const {
    user,
    isGuest,
    signOut,
    updateUserProfile,
    deleteUserChatHistory,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.display_name || user?.full_name || "");
  const [ageInput, setAgeInput] = useState(user?.age ? String(user.age) : "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (!isOpen) return null;

  const topicsCovered = Array.isArray(user?.topics_covered) ? user.topics_covered : [];
  const testsCount = user?.tests_count || 0;
  const testsHistory = Array.isArray(user?.tests_history) ? user.tests_history : [];

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateUserProfile({
        displayName: nameInput,
        age: ageInput,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistory = () => {
    deleteUserChatHistory();
    setShowDeleteConfirm(false);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 3000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11, 15, 25, 0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--bg-card, #111827)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          width: "560px",
          maxWidth: "96vw",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
          color: "var(--text-main, #f3f4f6)",
        }}
      >
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0f62fe 0%, #8a3ffc 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              {(user?.display_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {user?.display_name || user?.full_name || (isGuest ? "Guest Learner" : "Learner Profile")}
                </h2>
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                    background: isGuest ? "rgba(234, 179, 8, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    border: isGuest ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                    color: isGuest ? "#facc15" : "#34d399",
                    fontWeight: 600,
                  }}
                >
                  {isGuest ? "Guest Mode" : "Firebase Cloud Synced"}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#9ca3af" }}>
                {user?.email || "Local offline session"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {saveSuccess && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34d399",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} /> Profile information updated and synchronized properly.
          </div>
        )}

        {deleteSuccess && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#fca5a5",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} /> All AI Tutor chat history successfully deleted.
          </div>
        )}

        {/* User Identity Details Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Account & Credentials
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  fontSize: "0.74rem",
                  color: "#60a5fa",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Edit Details
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* User Name */}
            <div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <User size={13} /> User Name
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Full Name"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "#1f2937",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.82rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "#f3f4f6" }}>
                  {user?.display_name || user?.full_name || (isGuest ? "Guest User" : "Anonymous")}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={13} /> Age
              </div>
              {isEditing ? (
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="e.g. 21"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "#1f2937",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.82rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "#f3f4f6" }}>
                  {user?.age ? `${user.age} Years` : "Not specified"}
                </div>
              )}
            </div>

            {/* Email / Mail ID */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Mail size={13} /> Mail ID (Email)
              </div>
              <div style={{ fontSize: "0.84rem", color: "#e5e7eb", fontFamily: "var(--font-mono, monospace)" }}>
                {user?.email || (isGuest ? "guest@quantumleap.local" : "None")}
              </div>
            </div>
          </div>

          {isEditing && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: "#0f62fe",
                  border: "none",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Save size={14} /> {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}
        </div>

        {/* Learning Progress & Topics Covered Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <BookOpen size={14} /> Topics Covered ({topicsCovered.length})
            </div>
            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
              Mastery Progress
            </span>
          </div>

          {topicsCovered.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {topicsCovered.map((topic, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(139, 92, 246, 0.12)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    color: "#c4b5fd",
                    fontSize: "0.74rem",
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle2 size={12} color="#a78bfa" />
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.78rem", color: "#9ca3af", fontStyle: "italic", padding: "4px 0" }}>
              No topics completed yet. Explore the Curriculum or Learning Hub to begin mastering quantum algorithms!
            </div>
          )}
        </div>

        {/* Tests Given & Diagnostic Assessments */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 600, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Award size={14} /> Tests Given & Assessments ({testsCount})
            </div>
            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
              {testsCount > 0 ? `${testsCount} Completed` : "No tests yet"}
            </span>
          </div>

          {testsHistory.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {testsHistory.slice(0, 4).map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: "0.76rem",
                  }}
                >
                  <span style={{ color: "#e0f2fe", fontWeight: 500 }}>
                    {t.test_name || `Assessment #${idx + 1}`}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                      Score: {t.score !== undefined ? `${t.score}%` : "Completed"}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.68rem" }}>
                      {t.date ? new Date(t.date).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.78rem", color: "#9ca3af", fontStyle: "italic", padding: "4px 0" }}>
              Take diagnostic tests in the Assessment Center to benchmark your quantum computing proficiency.
            </div>
          )}
        </div>

        {/* AI Chats & Privacy Management Card */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 600, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <BrainCircuit size={14} /> AI Tutor Chat History
            </div>
            <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
              Stored in Cloud & Local
            </span>
          </div>

          <p style={{ margin: 0, fontSize: "0.76rem", color: "#cbd5e1", lineHeight: 1.4 }}>
            All conversations with the Quantum ChatGPT Tutor and Co-pilot are stored with your profile. You can permanently wipe this AI conversation history at any time.
          </p>

          {!showDeleteConfirm ? (
            <div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "6px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  color: "#fca5a5",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s",
                }}
              >
                <Trash2 size={13} /> Delete AI Chat History
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "#fca5a5", fontWeight: 600 }}>
                <AlertTriangle size={14} /> Are you sure you want to permanently delete all AI chat history?
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleDeleteHistory}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    background: "#ef4444",
                    border: "none",
                    color: "#fff",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Yes, Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#e5e7eb",
                    fontSize: "0.74rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <button
            type="button"
            onClick={() => {
              signOut();
              onClose();
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              background: "transparent",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.76rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isGuest ? "Exit Guest Mode" : "Sign Out"}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 18px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#f3f4f6",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
