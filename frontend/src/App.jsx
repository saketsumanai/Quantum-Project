import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CircuitCanvas from './components/CircuitCanvas';
import BlochSphere from './components/BlochSphere';
import MeasurementView from './components/MeasurementView';
import AITutorChat from './components/AITutorChat';
import CurriculumView from './components/CurriculumView';
import ExportModal from './components/ExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [numQubits, setNumQubits] = useState(2);
  const [instructions, setInstructions] = useState([
    { gate: 'h', qubits: [0], params: [] },
    { gate: 'cx', qubits: [0, 1], params: [] }
  ]);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [statevectorData, setStatevectorData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Check backend health
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') setBackendStatus(true);
      })
      .catch((err) => {
        console.warn("Backend offline or booting...", err);
      });
  }, []);

  // Run simulation & compute statevector
  const executeSimulation = async (customInstructions = null, customQubits = null) => {
    setIsSimulating(true);
    const activeInstructions = customInstructions || instructions;
    const activeQubits = customQubits || numQubits;

    const circuitPayload = {
      num_qubits: activeQubits,
      instructions: activeInstructions
    };

    try {
      // 1. Run shots simulation
      const simResp = await fetch('http://localhost:8000/api/v1/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shots: 1024, circuit: circuitPayload })
      });
      const simData = await simResp.json();
      if (simData.success) {
        setSimulationResult(simData);
      }

      // 2. Compute pure statevector & Bloch coordinates
      const svResp = await fetch('http://localhost:8000/api/v1/simulation/statevector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit: circuitPayload })
      });
      const svData = await svResp.json();
      if (svData.success) {
        setStatevectorData(svData);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run on mount
  useEffect(() => {
    executeSimulation();
  }, []);

  // Load preset algorithms
  const handleLoadPreset = (presetKey) => {
    fetch(`http://localhost:8000/api/v1/curriculum/presets/${presetKey}`)
      .then((res) => res.json())
      .then((presetCircuit) => {
        setNumQubits(presetCircuit.num_qubits);
        setInstructions(presetCircuit.instructions);
        executeSimulation(presetCircuit.instructions, presetCircuit.num_qubits);
      })
      .catch((err) => console.error("Error loading preset:", err));
  };

  const handleLoadCircuitFromCurriculum = (presetCircuit) => {
    setNumQubits(presetCircuit.num_qubits);
    setInstructions(presetCircuit.instructions);
    executeSimulation(presetCircuit.instructions, presetCircuit.num_qubits);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', gap: '20px' }}>
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        backendStatus={backendStatus}
      />

      {/* Main View Switching */}
      {activeTab === 'studio' ? (
        <main style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(600px, 1fr) 380px',
          gap: '20px',
          padding: '0 24px 24px 24px',
          flex: 1
        }}>
          {/* Left Column: Circuit Canvas & Measurements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CircuitCanvas
              numQubits={numQubits}
              onUpdateNumQubits={(n) => {
                setNumQubits(n);
                // Remove instructions targeting deleted qubits
                setInstructions(prev => prev.filter(inst => inst.qubits.every(q => q < n)));
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

            <MeasurementView
              simulationResult={simulationResult}
              statevectorData={statevectorData}
            />
          </div>

          {/* Right Column: 3D Bloch Sphere & AI Tutor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ height: '380px' }}>
              <BlochSphere
                blochCoordinates={statevectorData?.bloch_coordinates || []}
                selectedQubit={selectedQubit}
                onSelectQubit={setSelectedQubit}
              />
            </div>

            <AITutorChat
              circuitContext={{
                num_qubits: numQubits,
                gates_applied: instructions.map(i => i.gate)
              }}
              activeTopic="entanglement"
            />
          </div>
        </main>
      ) : (
        <CurriculumView
          onLoadCircuitPreset={handleLoadCircuitFromCurriculum}
          onSwitchToStudio={() => setActiveTab('studio')}
        />
      )}

      {/* Code Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        circuit={{ num_qubits: numQubits, instructions }}
        qasmExport={simulationResult?.qasm_export || ''}
      />
    </div>
  );
}
