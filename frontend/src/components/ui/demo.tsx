"use client"

import React from "react";
import { SmokeCard } from "./smoke-card";

function SmokeCardDemo() {
    return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          gap: "16px",
          background: "rgba(10, 10, 12, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          margin: "40px auto",
          maxWidth: "500px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.8)",
        }}>
            <div style={{
              fontSize: "0.72rem",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#a1a1aa",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "9999px"
            }}>
              Interactive Canvas Visualizer
            </div>
            <h2 style={{
              fontSize: "1.8rem",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#ffffff",
              textAlign: "center",
              fontWeight: "700",
              letterSpacing: "-0.02em",
              margin: 0
            }}>
                QUANTUM SMOKE EFFECT
            </h2>
            <p style={{ fontSize: "0.84rem", color: "#a1a1aa", margin: 0, textAlign: "center" }}>
              Move cursor over the card below to generate real-time particle smoke vectors.
            </p>
            <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
                <SmokeCard style={{ width: "100%", maxWidth: "384px", height: "384px" }}>
                  <div style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#ffffff",
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    <span style={{ fontSize: "0.8rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Interactive Smoke Canvas</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Hover Cursor Here</span>
                  </div>
                </SmokeCard>
            </div>
        </div>
    );
}

export { SmokeCardDemo };
