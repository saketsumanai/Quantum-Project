import React, { useState } from 'react';
import { Play, RotateCcw, Plus, Minus } from 'lucide-react';

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
  const [selectedFramework, setSelectedFramework] = useState('auto');

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
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {/* Top Toolbar: Qubits count, Engine Selector, Presets, Simulation Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Qubit Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#a1a1aa', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Qubits:
            </span>
            <button
              onClick={() => onUpdateNumQubits(Math.max(1, numQubits - 1))}
              disabled={numQubits <= 1}
              style={{
                width: '28px', height: '28px', padding: 0,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '6px', color: '#fff', cursor: numQubits <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Minus size={12} />
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9rem', minWidth: '20px', textAlign: 'center', color: '#fff' }}>
              {numQubits}
            </span>
            <button
              onClick={() => onUpdateNumQubits(Math.min(5, numQubits + 1))}
              disabled={numQubits >= 5}
              style={{
                width: '28px', height: '28px', padding: 0,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '6px', color: '#fff', cursor: numQubits >= 5 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Engine Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#a1a1aa', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Engine:
            </span>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="auto" style={{ background: '#0e0e12', color: '#fff' }}>Auto (Optimal Engine)</option>
              <option value="bluequbit" style={{ background: '#0e0e12', color: '#fff' }}>BlueQubit Cloud (GPU / CPU)</option>
              <option value="ibm_quantum" style={{ background: '#0e0e12', color: '#fff' }}>IBM Quantum (156Q Heron QPU)</option>
              <option value="qiskit_aer" style={{ background: '#0e0e12', color: '#fff' }}>Qiskit Aer (Local)</option>
              <option value="pennylane" style={{ background: '#0e0e12', color: '#fff' }}>PennyLane (QML)</option>
              <option value="cirq" style={{ background: '#0e0e12', color: '#fff' }}>Google Cirq</option>
              <option value="qbraid" style={{ background: '#0e0e12', color: '#fff' }}>qBraid Transpiler</option>
            </select>
          </div>

          {/* Algorithm Presets Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#a1a1aa', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Preset:
            </span>
            <select
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                cursor: 'pointer'
              }}
              onChange={(e) => {
                if (e.target.value) onLoadPreset(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled style={{ background: '#0e0e12', color: '#fff' }}>Select Algorithm...</option>
              <option value="bell_state" style={{ background: '#0e0e12', color: '#fff' }}>Bell State (|Φ+⟩)</option>
              <option value="ghz_state" style={{ background: '#0e0e12', color: '#fff' }}>GHZ State (3-Qubit)</option>
              <option value="superposition" style={{ background: '#0e0e12', color: '#fff' }}>Superposition (|+⟩)</option>
              <option value="grover_2qubit" style={{ background: '#0e0e12', color: '#fff' }}>Grover 2-Qubit Search</option>
              <option value="deutsch_jozsa" style={{ background: '#0e0e12', color: '#fff' }}>Deutsch-Jozsa</option>
              <option value="quantum_teleportation" style={{ background: '#0e0e12', color: '#fff' }}>Quantum Teleportation</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleClearAll}
            className="btn-overview-secondary"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={() => onRunSimulation(selectedFramework)}
            disabled={isSimulating}
            className="btn-overview-primary"
          >
            <Play size={13} fill="#000000" /> {isSimulating ? 'Simulating…' : 'Simulate Circuit'}
          </button>
        </div>
      </div>

      {/* Gate Palette Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '6px' }}>
          Gates:
        </span>
        {GATE_PALETTE.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGate(g.id)}
            title={g.title}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: selectedGate === g.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.12)',
              background:
                g.id === 'h' ? '#0f62fe' :
                ['x', 'y', 'z'].includes(g.id) ? '#b45309' :
                ['s', 't'].includes(g.id) ? '#047857' :
                ['rx', 'ry', 'rz'].includes(g.id) ? '#be185d' :
                ['cx', 'cz', 'swap'].includes(g.id) ? '#6d28d9' : '#374151',
              color: '#ffffff',
              transform: selectedGate === g.id ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.1s ease',
            }}
          >
            {g.label}
          </button>
        ))}

        {/* Context parameters for rotation gates */}
        {['rx', 'ry', 'rz'].includes(selectedGate) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>θ:</span>
            <input
              type="range"
              min="0"
              max="6.283"
              step="0.05"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(e.target.value)}
              style={{ width: '80px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
              {parseFloat(rotationAngle).toFixed(2)}
            </span>
          </div>
        )}

        {/* Control qubit selector for multi-qubit gates */}
        {['cx', 'cz', 'swap'].includes(selectedGate) && numQubits > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Control:</span>
            <select
              value={cnotControl}
              onChange={(e) => setCnotControl(parseInt(e.target.value))}
              style={{
                background: '#0b0f19',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
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

      {/* Circuit Grid Canvas */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        overflowX: 'auto'
      }}>
        {Array.from({ length: numQubits }).map((_, wireIdx) => {
          return (
            <div key={wireIdx} style={{ display: 'flex', alignItems: 'center', position: 'relative', minHeight: '42px' }}>
              {/* Qubit Wire Label */}
              <div style={{
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                color: '#f3f4f6',
                fontWeight: 600
              }}>
                <span>q[{wireIdx}]</span>
                <span style={{ color: '#6b7280', fontSize: '0.74rem' }}>|0⟩</span>
              </div>

              {/* Wire Line */}
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px'
              }}>
                {/* Gate Drop Slot Trigger on Wire (Clean, no neon border) */}
                <button
                  onClick={() => handleAddGate(wireIdx)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px dashed rgba(255, 255, 255, 0.25)',
                    color: '#d1d5db',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={`Place ${selectedGate.toUpperCase()} on q[${wireIdx}]`}
                >
                  <Plus size={11} /> Place {selectedGate.toUpperCase()}
                </button>

                {/* Placed Gates along the wire */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
                  {instructions.map((inst, instIdx) => {
                    const isTarget = inst.qubits[0] === wireIdx;
                    const isMulti = inst.qubits.length > 1;
                    const isControl = isMulti && inst.qubits[0] === wireIdx;
                    const isControlledTarget = isMulti && inst.qubits[1] === wireIdx;

                    if (!isTarget && !isControlledTarget) {
                      return <div key={instIdx} style={{ width: '38px', height: '38px' }} />;
                    }

                    return (
                      <div
                        key={instIdx}
                        onClick={() => handleRemoveInstruction(instIdx)}
                        title="Click to remove gate"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: isControl ? (inst.gate === 'swap' ? '#6d28d9' : '#1e1b4b') :
                            inst.gate === 'h' ? '#0f62fe' :
                            ['x', 'y', 'z'].includes(inst.gate) ? '#b45309' :
                            ['s', 't'].includes(inst.gate) ? '#047857' :
                            ['rx', 'ry', 'rz'].includes(inst.gate) ? '#be185d' :
                            ['cx', 'cz', 'swap'].includes(inst.gate) ? '#6d28d9' :
                            '#334155',
                          color: '#fff'
                        }}
                      >
                        {inst.gate === 'swap' ? '✕' : isControl ? '●' : isControlledTarget && inst.gate === 'cx' ? '⊕' : isControlledTarget && inst.gate === 'cz' ? 'Z' : inst.gate.toUpperCase()}
                        {inst.params && inst.params.length > 0 && (
                          <span style={{ fontSize: '0.52rem', opacity: 0.8 }}>
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
    </div>
  );
}
