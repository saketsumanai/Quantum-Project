import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import CircuitCanvas from "./components/CircuitCanvas";
import BlochSphere from "./components/BlochSphere";
import MeasurementView from "./components/MeasurementView";
import AITutorChat from "./components/AITutorChat";
import CurriculumView from "./components/CurriculumView";
import LearningHub from "./components/LearningHub";
import AssessmentCenter from "./components/AssessmentCenter";
import ExportModal from "./components/ExportModal";
import AuthModal from "./components/AuthModal";
import QuantumChatGPT from "./components/QuantumChatGPT";
import VideoLecturesHub from "./components/VideoLecturesHub";
import GatewayFlow from "./components/ui/gateway-flow";

const API = "http://localhost:8000/api/v1";

// ─── Main Application ─────────────────────────────────────────────────────────
function QuantumLeapApp() {
  const [activeTab, setActiveTab] = useState("landing");
  const [chatParams, setChatParams] = useState({ query: "", language: "en" });
  const [numQubits, setNumQubits] = useState(2);
  const [instructions, setInstructions] = useState([
    { gate: "h", qubits: [0], params: [] },
    { gate: "cx", qubits: [0, 1], params: [] },
  ]);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationError, setSimulationError] = useState(null);
  const [statevectorData, setStatevectorData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // ── Dark / Light theme ──
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ql-theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("ql-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // Check backend health
  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setBackendStatus(d.status === "healthy"))
      .catch(() => setBackendStatus(false));
  }, []);

  const executeSimulation = async (insts, qubits, framework = "auto") => {
    setIsSimulating(true);
    setSimulationError(null);
    const targetQubits = qubits ?? numQubits;
    const targetInsts = insts ?? instructions;
    const circ = { num_qubits: targetQubits, instructions: targetInsts };
    try {
      const [simRes, svRes] = await Promise.all([
        fetch(`${API}/simulation/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shots: 1024, framework: framework || "auto", circuit: circ }),
        }).then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data?.detail?.message || (typeof data?.detail === "string" ? data.detail : "Simulation failed"));
          return data;
        }),
        fetch(`${API}/simulation/statevector`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ circuit: circ }),
        }).then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data?.detail?.message || (typeof data?.detail === "string" ? data.detail : "Statevector calculation failed"));
          return data;
        }),
      ]);
      if (simRes.success) setSimulationResult(simRes);
      if (svRes.success) setStatevectorData(svRes);
    } catch (err) {
      console.error("Simulation error:", err);
      setSimulationError(err.message || "Failed to execute circuit simulation.");
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => { executeSimulation(); }, []); // eslint-disable-line

  const handleLoadPreset = async (presetKey) => {
    try {
      const preset = await fetch(`${API}/curriculum/presets/${presetKey}`).then((r) => r.json());
      setNumQubits(preset.num_qubits);
      setInstructions(preset.instructions);
      executeSimulation(preset.instructions, preset.num_qubits);
    } catch (err) {
      console.error("Preset load error:", err);
    }
  };

  const handleLoadCircuitFromCurriculum = (presetCircuit) => {
    setNumQubits(presetCircuit.num_qubits);
    setInstructions(presetCircuit.instructions);
    executeSimulation(presetCircuit.instructions, presetCircuit.num_qubits);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", gap: "0" }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        backendStatus={backendStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Landing Page (Overview) ── */}
      {activeTab === "landing" ? (
        <LandingPage onNavigate={setActiveTab} />

      /* ── AI Tutor (full-page ChatGPT) ── */
      ) : activeTab === "chat" ? (
        <QuantumChatGPT
          key={chatParams.query + chatParams.language}
          theme={theme}
          onToggleTheme={toggleTheme}
          initialQuery={chatParams.query}
          initialLanguage={chatParams.language}
          onNavigate={setActiveTab}
          onLoadCircuitIntoStudio={(circuit) => {
            if (circuit?.num_qubits) setNumQubits(circuit.num_qubits);
            if (circuit?.instructions) {
              setInstructions(circuit.instructions);
              executeSimulation(circuit.instructions, circuit.num_qubits || numQubits);
            }
            setActiveTab("studio");
          }}
        />

      /* ── Multilingual Video Lectures Hub ── */
      ) : activeTab === "videos" ? (
        <VideoLecturesHub
          onSwitchToChat={(params) => {
            setChatParams(params);
            setActiveTab("chat");
          }}
          onSwitchToAssessment={(topic) => {
            setActiveTab("assessment");
          }}
        />

      /* ── Learning Hub ── */
      ) : activeTab === "learning" ? (
        <LearningHub
          onSwitchToStudio={(presetKey) => {
            if (presetKey) handleLoadPreset(presetKey);
            setActiveTab("studio");
          }}
          onSwitchToAssessment={() => setActiveTab("assessment")}
          onSwitchToVideos={() => setActiveTab("videos")}
        />

      /* ── Assessment Center ── */
      ) : activeTab === "assessment" ? (
        <AssessmentCenter
          onSwitchToStudio={() => setActiveTab("studio")}
          onSwitchToLearning={() => setActiveTab("learning")}
        />

      /* ── Gateway Flow ── */
      ) : activeTab === "gateway" ? (
        <main style={{ padding: "0 24px 24px 24px", flex: 1, minHeight: "680px" }}>
          <div className="liquid-glass-panel" style={{ height: "100%", minHeight: "680px", width: "100%", overflow: "hidden", borderRadius: "8px" }}>
            <GatewayFlow style={{ width: "100%", height: "100%", minHeight: "680px" }} />
          </div>
        </main>

      /* ── Circuit Studio ── */
      ) : activeTab === "studio" ? (
        <main style={{
          display: "grid",
          gridTemplateColumns: "minmax(580px, 1fr) 380px",
          gap: "20px",
          padding: "20px 24px 24px 24px",
          flex: 1,
        }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <CircuitCanvas
              numQubits={numQubits}
              onUpdateNumQubits={(n) => {
                setNumQubits(n);
                if (selectedQubit >= n) setSelectedQubit(0);
                const filtered = instructions.filter((i) => i.qubits.every((q) => q < n));
                setInstructions(filtered);
                executeSimulation(filtered, n);
              }}
              instructions={instructions}
              onUpdateInstructions={(updated) => {
                setInstructions(updated);
                executeSimulation(updated, numQubits);
              }}
              onRunSimulation={(fw) => executeSimulation(instructions, numQubits, fw)}
              isSimulating={isSimulating}
              onLoadPreset={handleLoadPreset}
            />
            <MeasurementView
              simulationResult={simulationResult}
              statevectorData={statevectorData}
              simulationError={simulationError}
              isSimulating={isSimulating}
            />
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ height: "100%", minHeight: "560px" }}>
              <BlochSphere
                blochCoordinates={statevectorData?.bloch_coordinates || []}
                selectedQubit={selectedQubit}
                onSelectQubit={setSelectedQubit}
              />
            </div>
          </div>
        </main>

      /* ── Curriculum ── */
      ) : (
        <CurriculumView
          onLoadCircuitPreset={handleLoadCircuitFromCurriculum}
          onSwitchToStudio={() => setActiveTab("studio")}
        />
      )}

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        circuit={{ num_qubits: numQubits, instructions }}
        qasmExport={simulationResult?.qasm_export || ""}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Global Floating Quantum Chatbot Drawer (Accessible on ALL pages) */}
      <AITutorChat
        circuitContext={{ num_qubits: numQubits, gates_applied: instructions.map((i) => i.gate) }}
        activeTopic="entanglement"
      />
    </div>
  );
}

// ─── Auth Gate ─────────────────────────────────────────────────────────────────
function AuthGate() {
  const { firebaseUser, isGuest, isLoading, continueAsGuest } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{
        height: "100vh", display: "flex", background: "#0b0f19",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "16px", fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#0f62fe",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f3f4f6" }}>Quantum Leap</div>
        <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Initializing quantum session…</div>
      </div>
    );
  }

  if (!firebaseUser && !isGuest) {
    return (
      <>
        <LandingPage
          onNavigate={() => {
            continueAsGuest();
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  return <QuantumLeapApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
