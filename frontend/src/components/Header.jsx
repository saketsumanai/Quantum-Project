import React from "react";
import { Cpu, BookOpen, GraduationCap, Home, LayoutDashboard, UserCheck, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({ activeTab, setActiveTab, onOpenAuth }) {
  const { user } = useAuth();

  const getTabStyle = (tabKey) => {
    const isActive = activeTab === tabKey;
    if (!isActive) {
      return {
        padding: "8px 18px",
        fontSize: "0.82rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: "9999px",
        border: "1px solid transparent",
        background: "transparent",
        color: "#94a3b8",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      };
    }

    // Active style: Strict Black & Grey Pill with highlighted border
    return {
      padding: "8px 18px",
      fontSize: "0.82rem",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      borderRadius: "9999px",
      border: "1px solid rgba(255, 255, 255, 0.35)",
      background: "linear-gradient(135deg, #27272a 0%, #18181b 100%)",
      color: "#ffffff",
      boxShadow: "0 0 16px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    };
  };

  return (
    <header style={{
      margin: "20px auto 0 auto",
      width: "fit-content",
      maxWidth: "94%",
      zIndex: 50,
      position: "relative",
    }}>
      {/* Floating Pill Navigation Bar (Strict Black & Grey) */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        background: "rgba(10, 10, 10, 0.88)",
        padding: "6px 10px",
        borderRadius: "9999px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 14px 40px -6px rgba(0, 0, 0, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
      }}>
        <button
          onClick={() => setActiveTab("landing")}
          style={getTabStyle("landing")}
        >
          <Home size={14} /> Home
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          style={getTabStyle("studio")}
        >
          <Cpu size={14} /> Circuit Studio
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          style={getTabStyle("learning")}
        >
          <GraduationCap size={14} /> Learning
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          style={getTabStyle("curriculum")}
        >
          <BookOpen size={14} /> Curriculum
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          style={getTabStyle("dashboard")}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>

        {/* User Auth Trigger */}
        <div style={{ width: "1px", height: "18px", background: "rgba(255, 255, 255, 0.15)", margin: "0 4px" }} />

        <button
          onClick={onOpenAuth}
          style={{
            padding: "6px 14px",
            borderRadius: "9999px",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            background: "rgba(56, 189, 248, 0.08)",
            color: "#38bdf8",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s"
          }}
          title={user ? `Signed in as ${user.email}` : "Sign In with Google"}
        >
          {user ? (
            <>
              <UserCheck size={13} />
              <span>{user.display_name?.split(" ")[0] || "Account"}</span>
            </>
          ) : (
            <>
              <LogIn size={13} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </nav>
    </header>
  );
}
