import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Plus, Minus, Layers, Zap, Settings, Trash2, BookOpen } from 'lucide-react';
import GateTooltip from './GateTooltip';

const GATE_PALETTE = [
  { id: 'h', label: 'H', category: 'superposition', title: 'Hadamard (Superposition)' },
  { id: 'x', label: 'X', category: 'pauli', title: 'Pauli-X (Bit Flip)' },
  { id: 'y', label: 'Y', category: 'pauli', title: 'Pauli-Y' },
  { id: 'z', label: 'Z', category: 'pauli', title: 'Pauli-Z (Phase Flip)' },
  { id: 's', label: 'S', category: 'phase', title: 'Phase Gate (S)' },
  { id: 't', label: 'T', category: 'phase', title: 'T Gate (pi/4)' },
  { id: 'rx', label: 'Rx', category: 'rot', title: 'Rotation X(theta)' },
  { id: 'ry', label: 'Ry', category: 'rot', title: 'Rotation Y(theta)' },
  { id: 'rz', label: 'Rz', category: 'rot', title: 'Rotation Z(theta)' },
  { id: 'cx', label: 'CX', category: 'cnot', title: 'Controlled-NOT (CNOT)' },
  { id: 'cz', label: 'CZ', category: 'cnot', title: 'Controlled-Z' },
  { id: 'swap', label: 'SWAP', category: 'cnot', title: 'SWAP Qubits' },
  { id: 'measure', label: 'M', category: 'measure', title: 'Measurement' }
];

export default function CircuitCanvas({
  numQubits = 2,
  onUpdateNumQubits,
  instructions = [],
  onUpdateInstructions,
  onRunSimulation,
  isSimulating = false,
  onLoadPreset
}) {
  const [selectedGate, setSelectedGate] = useState('h');
  const [rotationAngle, setRotationAngle] = useState(1.5708); // pi/2
  const [cnotControl, setCnotControl] = useState(0);
  const [hoveredGate, setHoveredGate] = useState(null);
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

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Toolbar: Qubits count, Presets, Simulation Button */}
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
              <option value="" disabled>Load Algorithm...</option>
              <option value="bell_state">Bell State (|Phi+&gt;)</option>
              <option value="ghz_state">GHZ State (3-Qubit)</option>
              <option value="superposition">Single Qubit Superposition</option>
              <option value="grover_2qubit">Grover 2-Qubit Search</option>
              <option value="deutsch_jozsa">Deutsch-Jozsa Algorithm</option>
              <option value="quantum_teleportation">Quantum Teleportation</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-glass" onClick={handleClearAll} title="Clear all gates">
            <RotateCcw size={14} /> Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={onRunSimulation}
            disabled={isSimulating}
            style={{ minWidth: '140px' }}
          >
            <Play size={15} fill="#07090e" /> {isSimulating ? 'Simulating...' : 'Simulate Circuit'}
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
