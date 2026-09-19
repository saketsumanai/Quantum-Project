
import React from "react";

/**
 * StatevectorMap: Visualizes the complete quantum state for multi-qubit systems.
 * Each cell represents a basis state |00...0> through |11...1>.
 * Cell Size/Opacity = Probability (|c_k|^2)
 * Cell Color = Phase (arg(c_k))
 */
export default function StatevectorMap({ probabilities = {}, statevector = [] }) {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return (
      <div style={{
        background: "#0b0f19",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "20px",
        color: "#9ca3af",
        textAlign: "center",
        fontSize: "0.8rem",
        fontFamily: "var(--font-sans)"
      }}>
        No simulation results to visualize. Run a circuit to see the statevector map.
      </div>
    );
  }

  const basisStates = Object.keys(probabilities).sort();
  const maxProb = Math.max(...Object.values(probabilities));

  return (
    <div style={{
      background: "#111827",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      padding: "16px",
      color: "#f3f4f6",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#ffffff" }}>Statevector Probability Map</div>
          <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Amplitude distribution across basis states</div>
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "0.7rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "10px", height: "10px", background: "#0f62fe", borderRadius: "2px" }}></div>
            <span>High Prob</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "10px", height: "10px", background: "rgba(15, 98, 254, 0.2)", borderRadius: "2px" }}></div>
            <span>Low Prob</span>
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: "10px",
        background: "#0b0f19",
        padding: "15px",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        {basisStates.map(state => {
          const prob = probabilities[state];
          const opacity = prob / maxProb;
          
          return (
            <div 
              key={state} 
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                background: `rgba(15, 98, 254, ${opacity})`,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              title={`State |${state}⟩: Prob ${ (prob * 100).toFixed(2) }%`}
            >
              <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 600, color: "#fff" }}>
                |{state}⟩
              </span>
              <span style={{ fontSize: "0.6rem", fontFamily: "var(--font-mono)", color: "#9ca3af" }}>
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
