import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Plus, Minus, Info, Download, FileText, FileJson, Cpu, Share2 } from 'lucide-react';
import GateTooltip from './GateTooltip';
import { InteractiveHoverButton } from './ui/interactive-hover-button';

const GATE_PALETTE = [
  { id: 'h', label: 'H', desc: 'Hadamard: Creates equal superposition' },
  { id: 'x', label: 'X', desc: 'Pauli-X: Quantum NOT gate (bit flip)' },
  { id: 'y', label: 'Y', desc: 'Pauli-Y: Bit + phase flip' },
  { id: 'z', label: 'Z', desc: 'Pauli-Z: Phase flip gate' },
  { id: 's', label: 'S', desc: 'S Gate: Phase rotation by π/2' },
  { id: 't', label: 'T', desc: 'T Gate: Phase rotation by π/4 (non-Clifford)' },
  { id: 'rx', label: 'Rx(θ)', desc: 'Rotation around X-axis by angle θ' },
  { id: 'ry', label: 'Ry(θ)', desc: 'Rotation around Y-axis by angle θ' },
  { id: 'rz', label: 'Rz(θ)', desc: 'Rotation around Z-axis by angle θ' },
  { id: 'cx', label: 'CNOT', desc: 'Controlled-NOT: Entangles two qubits' },
  { id: 'cz', label: 'CZ', desc: 'Controlled-Z: Controlled phase flip' },
  { id: 'swap', label: 'SWAP', desc: 'SWAP: Exchanges quantum states' },
  { id: 'measure', label: 'M', desc: 'Measurement: Projects qubit into classical bit' }
];

export default function CircuitCanvas({
  numQubits = 2,
  onUpdateNumQubits,
  instructions = [],
  onUpdateInstructions,
  onRunSimulation,
  isSimulating = false,
  onLoadPreset,
  noiseEnabled = false,
  onToggleNoise,
  noiseProfile = 'ibm_eagle',
  onSelectNoiseProfile,
  onOpenExport,
}) {
  const [selectedGate, setSelectedGate] = useState('h');
  const [rotationAngle, setRotationAngle] = useState(1.5708); // pi/2
  const [cnotControl, setCnotControl] = useState(0);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleGateMouseEnter = (gateId, event) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredGate({
      id: gateId,
      position: {
        x: rect.left + rect.width / 2,
        top: rect.top,
        bottom: rect.bottom
      }
    });
  };

  const handleGateMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredGate(null);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredGate(null);
    }, 150);
  };

  // Add gate to target qubit wire
  const handleAddGate = (wireIdx) => {
    let newInst;
    if (selectedGate === 'cx' || selectedGate === 'cz' || selectedGate === 'swap') {
      const target = wireIdx;
      const control = cnotControl === target ? (target === 0 ? 1 : 0) : cnotControl;
      if (numQubits < 2) return;
      newInst = { gate: selectedGate, qubits: [control, target], params: [] };
    } else if (selectedGate === 'rx' || selectedGate === 'ry' || selectedGate === 'rz') {
      newInst = { gate: selectedGate, qubits: [wireIdx], params: [parseFloat(rotationAngle)] };
    } else if (selectedGate === 'measure') {
      newInst = { gate: 'measure', qubits: [wireIdx], clbits: [wireIdx] };
    } else {
      newInst = { gate: selectedGate, qubits: [wireIdx], params: [] };
    }

    onUpdateInstructions([...instructions, newInst]);
  };

  const handleRemoveInstruction = (index) => {
    const updated = [...instructions];
    updated.splice(index, 1);
    onUpdateInstructions(updated);
  };

  const handleClearAll = () => {
    onUpdateInstructions([]);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/simulation/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circuit: { num_qubits: numQubits, instructions: instructions },
          algorithm_name: 'Quantum Algorithm Experiment',
          author_name: 'Team Gitwolves',
          include_noise: noiseEnabled,
          noise_profile: noiseProfile,
          shots: 1024,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quantum_Lab_Report_${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('PDF report failed:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadJson = async () => {
    setDownloadingJson(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/simulation/report/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circuit: { num_qubits: numQubits, instructions: instructions },
          algorithm_name: 'Quantum Algorithm Experiment',
          author_name: 'Team Gitwolves',
          include_noise: noiseEnabled,
          noise_profile: noiseProfile,
          shots: 1024,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quantum_Lab_Report_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('JSON report failed:', err);
    } finally {
      setDownloadingJson(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Toolbar: Qubits count, Presets, Reset, Simulate */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Qubits:</span>
            <button
              className="btn btn-glass"
              style={{ width: '28px', height: '28px', padding: 0 }}
              disabled={numQubits <= 1}
              onClick={() => onUpdateNumQubits(Math.max(1, numQubits - 1))}
            >
              <Minus size={14} />
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', minWidth: '20px', textAlign: 'center' }}>
              {numQubits}
            </span>
            <button
              className="btn btn-glass"
              style={{ width: '28px', height: '28px', padding: 0 }}
              disabled={numQubits >= 16}
              onClick={() => onUpdateNumQubits(Math.min(16, numQubits + 1))}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Algorithm Presets Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Preset:</span>
            <select
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                cursor: 'pointer'
              }}
              onChange={(e) => {
                if (e.target.value) onLoadPreset(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>Load Algorithm Track...</option>
              <optgroup label="Foundations & Entanglement">
                <option value="superposition">1-Qubit Superposition (H)</option>
                <option value="bell_state">Bell State (|Φ+⟩ EPR Pair)</option>
                <option value="ghz_state">3-Qubit GHZ Entangled State</option>
                <option value="quantum_teleportation">Quantum State Teleportation</option>
              </optgroup>
              <optgroup label="Quantum Algorithms">
                <option value="deutsch_jozsa">Deutsch-Jozsa Algorithm</option>
                <option value="grover_2qubit">Grover 2-Qubit Search</option>
                <option value="qft">Quantum Fourier Transform (QFT)</option>
                <option value="shor_15">Shor Factorization (N=15)</option>
              </optgroup>
              <optgroup label="Variational & QML">
                <option value="vqe_h2">VQE Molecular H2 Ansatz</option>
                <option value="qml_kernel">QML Parameterized Feature Map</option>
              </optgroup>
              <optgroup label="Fault Tolerance & QEC">
                <option value="qec_bitflip">3-Qubit Bit-Flip Code</option>
                <option value="surface_code">Rotated Surface Code Plaquette</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-glass" onClick={handleClearAll} title="Clear all gates">
            <RotateCcw size={14} /> Reset
          </button>
          <InteractiveHoverButton
            text={isSimulating ? 'Simulating...' : 'Simulate'}
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="w-36 h-9 py-1 px-3 text-xs bg-zinc-900 border-zinc-700 text-white hover:border-zinc-500"
          />
        </div>
      </div>

      {/* NISQ Hardware Noise & Export Toolbar Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 12px',
        background: '#0c0c0e',
        border: '1px solid #27272a',
        borderRadius: '6px',
      }}>
        {/* Left: Hardware Noise Toggle & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onToggleNoise}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              border: noiseEnabled ? '1px solid #38bdf8' : '1px solid #27272a',
              background: noiseEnabled ? '#18181b' : 'transparent',
              color: noiseEnabled ? '#38bdf8' : '#71717a',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Cpu size={13} />
            NISQ Hardware Noise: {noiseEnabled ? 'ON' : 'OFF'}
          </button>

          {noiseEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={noiseProfile}
                onChange={(e) => onSelectNoiseProfile && onSelectNoiseProfile(e.target.value)}
                style={{
                  background: '#18181b',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ibm_eagle">IBM Eagle 127Q (Superconducting)</option>
                <option value="rigetti_aspen">Rigetti Aspen-M3</option>
                <option value="ionq_forte">IonQ Forte (Trapped Ion)</option>
              </select>
              <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>
                {noiseProfile === 'ibm_eagle' && 'T1: 120µs | T2: 90µs | Readout Err: 1.8%'}
                {noiseProfile === 'rigetti_aspen' && 'T1: 30µs | T2: 25µs | Readout Err: 4.2%'}
                {noiseProfile === 'ionq_forte' && 'T1: 10ms | T2: 1ms | Readout Err: 0.3%'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Export Code & Download Reports */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #27272a',
                background: '#18181b',
                color: '#ffffff',
                fontSize: '0.74rem',
                cursor: 'pointer',
              }}
            >
              <Share2 size={12} />
              Export Code
            </button>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #27272a',
              background: '#18181b',
              color: '#38bdf8',
              fontSize: '0.74rem',
              cursor: 'pointer',
            }}
          >
            <FileText size={12} />
            {downloadingPdf ? 'Generating...' : 'Report (PDF)'}
          </button>
          <button
            onClick={handleDownloadJson}
            disabled={downloadingJson}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #27272a',
              background: '#18181b',
              color: '#a1a1aa',
              fontSize: '0.74rem',
              cursor: 'pointer',
            }}
          >
            <FileJson size={12} />
            {downloadingJson ? 'Bundling...' : 'Report (JSON)'}
          </button>
        </div>
      </div>

      {/* Gate Palette Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(0, 0, 0, 0.35)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginRight: '6px' }}>
          Gates:
        </span>
        {GATE_PALETTE.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGate(g.id)}
            onMouseEnter={(e) => handleGateMouseEnter(g.id, e)}
            onMouseLeave={handleGateMouseLeave}
            className={`gate-badge ${
              g.id === 'h' ? 'gate-h' :
              ['x', 'y', 'z'].includes(g.id) ? 'gate-pauli' :
              ['s', 't'].includes(g.id) ? 'gate-phase' :
              ['rx', 'ry', 'rz'].includes(g.id) ? 'gate-rot' :
              ['cx', 'cz', 'swap'].includes(g.id) ? 'gate-cnot' : 'gate-measure'
            }`}
            style={{
              outline: selectedGate === g.id ? '2px solid #ffffff' : 'none',
              outlineOffset: '2px',
              transform: selectedGate === g.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {g.label}
          </button>
        ))}

        {/* Context parameters for rotation gates */}
        {['rx', 'ry', 'rz'].includes(selectedGate) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>θ:</span>
            <input
              type="range"
              min="0"
              max="6.283"
              step="0.05"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(e.target.value)}
              style={{ width: '80px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {parseFloat(rotationAngle).toFixed(2)}
            </span>
          </div>
        )}

        {/* Control qubit selector for multi-qubit gates */}
        {['cx', 'cz', 'swap'].includes(selectedGate) && numQubits > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Control:</span>
            <select
              value={cnotControl}
              onChange={(e) => setCnotControl(parseInt(e.target.value))}
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.75rem'
              }}
            >
              {Array.from({ length: numQubits }).map((_, idx) => (
                <option key={idx} value={idx}>q[{idx}]</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Circuit Grid Canvas (Backlit QPU Engine) */}
      <div className="bklit-container" style={{
        borderRadius: '8px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        overflowX: 'auto'
      }}>
        {Array.from({ length: numQubits }).map((_, wireIdx) => {
          // Find instructions targeting this wire
          const wireInstructions = instructions.map((inst, index) => ({ inst, index }))
            .filter(({ inst }) => inst.qubits.includes(wireIdx));

          return (
            <div key={wireIdx} style={{ display: 'flex', alignItems: 'center', position: 'relative', minHeight: '44px' }}>
              {/* Qubit Wire Label (BKLIT Readout) */}
              <div style={{
                width: '64px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: '#ffffff',
                fontWeight: 700,
                textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
              }}>
                <span>q[{wireIdx}]</span>
                <span style={{ color: 'var(--text-muted)' }}>|0⟩</span>
              </div>

              {/* Wire Line (Illuminated LED Fiber) */}
              <div style={{
                flex: 1,
                height: '3px',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.2) 100%)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px'
              }}>
                {/* Gate Drop Slot Trigger on Wire (BKLIT LED Button) */}
                <button
                  onClick={() => handleAddGate(wireIdx)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 0 12px rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(8px)',
                    textShadow: '0 0 6px rgba(255, 255, 255, 0.6)'
                  }}
                  title={`Click to place selected ${selectedGate.toUpperCase()} gate on q[${wireIdx}]`}
                >
                  <Plus size={12} /> Place {selectedGate.toUpperCase()}
                </button>

                {/* Placed Gates along the wire */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 2 }}>
                  {instructions.map((inst, instIdx) => {
                    const isTarget = inst.qubits[0] === wireIdx;
                    const isMulti = inst.qubits.length > 1;
                    const isControl = isMulti && inst.qubits[0] === wireIdx;
                    const isControlledTarget = isMulti && inst.qubits[1] === wireIdx;

                    if (!isTarget && !isControlledTarget) {
                      // Spacer to align columns
                      return <div key={instIdx} style={{ width: '42px', height: '42px' }} />;
                    }

                    return (
                      <div
                        key={instIdx}
                        onClick={() => handleRemoveInstruction(instIdx)}
                        onMouseEnter={(e) => handleGateMouseEnter(inst.gate, e)}
                        onMouseLeave={handleGateMouseLeave}
                        title="Click to remove gate"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          boxShadow: '0 0 14px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: isControl ? 'linear-gradient(135deg, #52525b, #27272a)' :
                            inst.gate === 'h' ? 'linear-gradient(135deg, #27272a, #18181b)' :
                            ['x', 'y', 'z'].includes(inst.gate) ? 'linear-gradient(135deg, #3f3f46, #27272a)' :
                            ['cx', 'cz', 'swap'].includes(inst.gate) ? 'linear-gradient(135deg, #52525b, #27272a)' :
                            'linear-gradient(135deg, #18181b, #09090b)',
                          color: '#fff'
                        }}
                      >
                        {isControl ? '●' : isControlledTarget && inst.gate === 'cx' ? '⊕' : inst.gate.toUpperCase()}
                        {inst.params && inst.params.length > 0 && (
                          <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>
                            {inst.params[0].toFixed(1)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive High-Contrast Solid-Dark Gate Tooltip with data/books/ Citations */}
      <GateTooltip
        gateId={hoveredGate?.id}
        position={hoveredGate?.position}
        onClose={() => setHoveredGate(null)}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
    </div>
  );
}
