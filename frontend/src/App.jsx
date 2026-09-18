import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import CircuitCanvas from "./components/CircuitCanvas";
import BlochSphere from "./components/BlochSphere";
import MeasurementView from "./components/MeasurementView";
import AITutorChat from "./components/AITutorChat";
import CurriculumView from "./components/CurriculumView";
import LearningHub from "./components/LearningHub";
import ExportModal from "./components/ExportModal";
import AuthModal from "./components/AuthModal";
import GatewayFlow from "./components/ui/gateway-flow";

const API = "http://localhost:8000/api/v1";

function QuantumLeapApp() {
  const [activeTab, setActiveTab] = useState("landing");
  const [numQubits, setNumQubits] = useState(2);
  const [instructions, setInstructions] = useState([
    { gate: "h", qubits: [0], params: [] },
    { gate: "cx", qubits: [0, 1], params: [] },
  ]);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [statevectorData, setStatevectorData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check backend health
  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setBackendStatus(d.status === "healthy"))
      .catch(() => setBackendStatus(false));
  }, []);

  const executeSimulation = async (insts, qubits) => {
    setIsSimulating(true);
    const circ = { num_qubits: qubits ?? numQubits, instructions: insts ?? instructions };
    try {
      const [simRes, svRes] = await Promise.all([
        fetch(`${API}/simulation/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shots: 1024, circuit: circ }),
        }).then((r) => r.json()),
        fetch(`${API}/simulation/statevector`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ circuit: circ }),
        }).then((r) => r.json()),
      ]);
      if (simRes.success) setSimulationResult(simRes);
      if (svRes.success) setStatevectorData(svRes);
    } catch (err) {
      console.error("Simulation error:", err);
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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", gap: "20px" }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        backendStatus={backendStatus}
      />

      {activeTab === "landing" ? (
        <LandingPage onNavigate={setActiveTab} />
      ) : activeTab === "learning" ? (
        <LearningHub onSwitchToStudio={(presetKey) => {
          if (presetKey) handleLoadPreset(presetKey);
          setActiveTab("studio");
        }} />
      ) : activeTab === "studio" ? (
        <main style={{
          display: "grid",
          gridTemplateColumns: "minmax(580px, 1fr) 380px",
          gap: "20px",
          padding: "0 24px 24px 24px",
          flex: 1,
        }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <CircuitCanvas
              numQubits={numQubits}
              onUpdateNumQubits={(n) => {
                setNumQubits(n);
                setInstructions((prev) => prev.filter((i) => i.qubits.every((q) => q < n)));
              }}
              instructions={instructions}
              onUpdateInstructions={(updated) => {
                setInstructions(updated);
                executeSimulation(updated, numQubits);
              }}
              onRunSimulation={() => executeSimulation()}
              isSimulating={isSimulating}
              onLoadPreset={handleLoadPreset}
            />
            <MeasurementView simulationResult={simulationResult} statevectorData={statevectorData} />
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ height: "100%", minHeight: "580px" }}>
              <BlochSphere
                blochCoordinates={statevectorData?.bloch_coordinates || []}
                selectedQubit={selectedQubit}
                onSelectQubit={setSelectedQubit}
              />
            </div>
          </div>
        </main>
      ) : activeTab === "gateway" ? (
        <main style={{ padding: "0 24px 24px 24px", flex: 1, minHeight: "680px" }}>
          <div className="liquid-glass-panel" style={{ height: "100%", minHeight: "680px", width: "100%", overflow: "hidden", borderRadius: "8px" }}>
            <GatewayFlow style={{ width: "100%", height: "100%", minHeight: "680px" }} />
          </div>
        </main>
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

      {/* Global Floating Chatbot Drawer (Present on ALL pages) */}
      <AITutorChat
        circuitContext={{ num_qubits: numQubits, gates_applied: instructions.map((i) => i.gate) }}
        activeTopic="entanglement"
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QuantumLeapApp />
    </AuthProvider>
  );
}
