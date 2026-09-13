import React, { useState } from "react";
import { Atom, Cpu, BookOpen, Code2, GraduationCap, LogIn, LogOut, Award, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({ activeTab, setActiveTab, onOpenExport, onOpenAuth, backendStatus }) {
  const { user, signOut, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="glass-panel" style={{
      margin: "16px 24px 0 24px",
      padding: "14px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 10,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(168,85,247,0.25))",
          border: "1px solid var(--border-glow)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--shadow-glow-cyan)",
        }}>
          <Atom className="animate-spin-slow" size={26} color="#00f0ff" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{
              fontSize: "1.3rem", fontWeight: 800,
              background: "linear-gradient(to right, #00f0ff, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Quantum Leap
            </h1>
            <span style={{
              fontSize: "0.65rem", padding: "2px 7px", borderRadius: "20px",
              background: "rgba(0,240,255,0.12)", border: "1px solid rgba(0,240,255,0.3)",
              color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              SIH 2026
            </span>
          </div>
          <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
            AI Quantum Algorithm Studio · Team Gitwolves
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{
        display: "flex", alignItems: "center", gap: "6px",
        background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "10px",
        border: "1px solid var(--border-subtle)",
      }}>
        <button
          className={`btn ${activeTab === "studio" ? "btn-primary" : "btn-glass"}`}
          onClick={() => setActiveTab("studio")}
          style={{ padding: "7px 16px", fontSize: "0.82rem" }}
        >
          <Cpu size={15} /> Circuit Studio
        </button>
        <button
          className={`btn ${activeTab === "learning" ? "btn-primary" : "btn-glass"}`}
          onClick={() => setActiveTab("learning")}
          style={{ padding: "7px 16px", fontSize: "0.82rem" }}
        >
          <GraduationCap size={15} /> Learning
        </button>
        <button
          className={`btn ${activeTab === "curriculum" ? "btn-primary" : "btn-glass"}`}
          onClick={() => setActiveTab("curriculum")}
          style={{ padding: "7px 16px", fontSize: "0.82rem" }}
        >
          <BookOpen size={15} /> Curriculum
        </button>
      </nav>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* QPU Status */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "5px 12px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "20px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", display: "inline-block" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#34d399" }}>
            {backendStatus ? "Virtual QPU Active" : "Connecting…"}
          </span>
        </div>

        <button className="btn btn-glass" onClick={onOpenExport} style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
          <Code2 size={15} /> Export
        </button>

        {/* Auth Controls */}
        {isLoading ? (
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid var(--border-subtle)" }} />
        ) : user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)",
                borderRadius: "24px", padding: "5px 12px 5px 5px",
                cursor: "pointer", color: "#fff",
              }}
            >
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.display_name}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid var(--q-cyan)" }}
                />
              ) : (
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #00f0ff, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, color: "#000",
                }}>
                  {(user.display_name || user.email || "U")[0].toUpperCase()}
                </div>
              )}
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.2 }}>
                  {user.display_name?.split(" ")[0] || "Student"}
                </div>
                <div style={{ fontSize: "0.66rem", color: "#f59e0b", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                  <Award size={10} /> {user.total_xp} XP
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="glass-panel" style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: "200px", padding: "8px", zIndex: 50,
              }}>
                <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "6px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>{user.display_name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{user.email}</div>
                </div>
                <button
                  className="btn btn-danger"
                  style={{ width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: "0.8rem" }}
                  onClick={() => { signOut(); setShowUserMenu(false); }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn btn-accent"
            onClick={onOpenAuth}
            style={{ padding: "8px 16px", fontSize: "0.82rem" }}
          >
            <LogIn size={15} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
