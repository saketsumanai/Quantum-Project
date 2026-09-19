import React, { useState } from "react";
import { ChevronDown, LogOut, Sun, Moon, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import UserProfileModal from "./UserProfileModal";

export default function Header({ activeTab, setActiveTab, onOpenExport, onOpenAuth, backendStatus, theme, onToggleTheme }) {
  const { user, signOut, isLoading, isGuest } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const isDark = theme === 'dark';

  const tabStyle = (id) => ({
    padding: "6px 12px",
    fontSize: "0.74rem",
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: "6px",
    border: "1px solid",
    background: activeTab === id ? (isDark ? "rgba(255,255,255,0.10)" : "rgba(15,98,254,0.1)") : "transparent",
    borderColor: activeTab === id ? (isDark ? "rgba(255,255,255,0.22)" : "rgba(15,98,254,0.3)") : "transparent",
    color: activeTab === id ? (isDark ? "#ffffff" : "#0f62fe") : "var(--text-secondary)",
    transition: "all 0.15s ease",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
  });

  return (
    <header style={{
      padding: "12px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(8, 8, 10, 0.90)",
      backdropFilter: "blur(14px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div
        onClick={() => setActiveTab("landing")}
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        title="Go to Quantum Leap Overview"
      >
        <span style={{ fontSize: "1.08rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.035em" }}>
          Quantum Leap
        </span>
        <span style={{
          fontSize: "0.68rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--border-subtle)",
          padding: "2px 8px",
          borderRadius: "9999px",
        }}>
          AI Quantum Studio
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {[
          { id: "landing", label: "Overview" },
          { id: "chat", label: "AI Tutor" },
          { id: "studio", label: "Circuit Studio" },
          { id: "dashboard", label: "Dashboard" },
          { id: "learning", label: "Learning Hub" },
          { id: "videos", label: "Video Lectures" },
          { id: "curriculum", label: "Curriculum" },
          { id: "assessment", label: "Assessments" },
          { id: "gateway", label: "Gateway Flow" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}
            onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}}
            onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
          >
            {tab.id === "chat" && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginRight: 5, verticalAlign: 'middle' }} />}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Backend status */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.72rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "3px 8px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "9999px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: backendStatus ? "#10b981" : "#eab308", display: "inline-block" }} />
          <span>{backendStatus ? "QPU Live" : "Connecting"}</span>
        </div>

        {/* Theme toggle */}
        <button onClick={onToggleTheme} title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: "6px",
            background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)",
            cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Export */}
        <button onClick={onOpenExport} style={{
          padding: "6px 14px",
          fontSize: "0.76rem",
          fontWeight: 600,
          borderRadius: "6px",
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          background: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        >
          Export
        </button>

        {/* Auth */}
        {isLoading ? (
          <div style={{ width: 28, height: 28, borderRadius: "4px", background: "var(--bg-surface-elevated)" }} />
        ) : user ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowUserMenu((v) => !v)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: "transparent", border: "1px solid var(--border-subtle)",
              borderRadius: "6px", padding: "5px 12px", cursor: "pointer",
              color: "var(--text-secondary)", fontSize: "0.76rem", fontWeight: 600,
              fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase",
              transition: "all 0.15s",
            }}>
              <span>{isGuest ? "Guest" : (user.display_name || user.full_name || "Account")}</span>
              <ChevronDown size={12} />
            </button>
            {showUserMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, width: 180,
                padding: "6px", zIndex: 50, background: "var(--bg-surface)",
                border: "1px solid var(--border-default)", borderRadius: "6px",
                boxShadow: "var(--shadow-lg)",
              }}>
                <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {isGuest ? "Guest Session" : (user.display_name || user.full_name || "User")}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{user.email || "Offline"}</div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: "100%", textAlign: "left", padding: "6px 8px", fontSize: "0.76rem",
                    background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px", borderRadius: "4px",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface-elevated)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  <User size={12} color="#60a5fa" /> Profile & Progress
                </button>
                <button onClick={() => { signOut(); setShowUserMenu(false); }} style={{
                  width: "100%", textAlign: "left", padding: "6px 8px", fontSize: "0.76rem",
                  background: "none", border: "none", color: "var(--quantum-rose)", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px", borderRadius: "4px",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  <LogOut size={12} /> {isGuest ? "Exit Guest Mode" : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onOpenAuth} style={{
            padding: "5px 14px", fontSize: "0.78rem", fontWeight: 500, borderRadius: "4px",
            background: "#0f62fe", border: "1px solid #0f62fe", color: "#fff", cursor: "pointer",
          }}>
            Sign In
          </button>
        )}
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
}
