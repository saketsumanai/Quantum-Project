import React from "react";
import { Cpu, BookOpen, Code2, GraduationCap, Home } from "lucide-react";

export default function Header({ activeTab, setActiveTab }) {
  const getTabStyle = (tabKey) => {
    const isActive = activeTab === tabKey;
    if (!isActive) {
      return {
        padding: "8px 20px",
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

    // Active style: Always Strict Black & Grey Pill across all pages
    return {
      padding: "8px 20px",
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
      maxWidth: "92%",
      zIndex: 50,
      position: "relative",
    }}>
      {/* Floating Pill Navigation Bar (Strict Black & Grey) */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
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
          onMouseEnter={(e) => {
            if (activeTab !== "landing") {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "landing") {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <Home size={14} /> Home
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          style={getTabStyle("studio")}
          onMouseEnter={(e) => {
            if (activeTab !== "studio") {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "studio") {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <Cpu size={14} /> Circuit Studio
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          style={getTabStyle("learning")}
          onMouseEnter={(e) => {
            if (activeTab !== "learning") {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "learning") {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <GraduationCap size={14} /> Learning
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          style={getTabStyle("curriculum")}
          onMouseEnter={(e) => {
            if (activeTab !== "curriculum") {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "curriculum") {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <BookOpen size={14} /> Curriculum
        </button>
      </nav>
    </header>
  );
}
