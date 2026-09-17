import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, circuit, qasmExport }) {
  const [activeLang, setActiveLang] = useState('qasm');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Python Qiskit Code
  const generateQiskitCode = () => {
    const lines = [
      'from qiskit import QuantumCircuit, Aer, execute',
      '',
      `qc = QuantumCircuit(${circuit.num_qubits}, ${circuit.num_qubits})`,
    ];
    circuit.instructions.forEach((inst) => {
      const g = inst.gate.toLowerCase();
      const q = inst.qubits;
      const p = inst.params || [];
      if (g === 'h') lines.push(`qc.h(${q[0]})`);
      else if (g === 'x') lines.push(`qc.x(${q[0]})`);
      else if (g === 'y') lines.push(`qc.y(${q[0]})`);
      else if (g === 'z') lines.push(`qc.z(${q[0]})`);
      else if (g === 's') lines.push(`qc.s(${q[0]})`);
      else if (g === 't') lines.push(`qc.t(${q[0]})`);
      else if (g === 'cx' || g === 'cnot') lines.push(`qc.cx(${q[0]}, ${q[1]})`);
      else if (g === 'cz') lines.push(`qc.cz(${q[0]}, ${q[1]})`);
      else if (g === 'swap') lines.push(`qc.swap(${q[0]}, ${q[1]})`);
      else if (g === 'rx') lines.push(`qc.rx(${p[0]}, ${q[0]})`);
      else if (g === 'ry') lines.push(`qc.ry(${p[0]}, ${q[0]})`);
      else if (g === 'rz') lines.push(`qc.rz(${p[0]}, ${q[0]})`);
      else if (g === 'measure') lines.push(`qc.measure(${q[0]}, ${q[0]})`);
    });
    lines.push('');
    lines.push('# Run on local Aer simulator');
    lines.push("simulator = Aer.get_backend('aer_simulator')");
    lines.push("result = execute(qc, simulator, shots=1024).result()");
    lines.push("print('Counts:', result.get_counts())");
    return lines.join('\n');
  };

  const getCodeSnippet = () => {
    if (activeLang === 'qasm') return qasmExport || '// OpenQASM 2.0 representation';
    if (activeLang === 'qiskit') return generateQiskitCode();
    return '// Quantum framework exporter';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="liquid-glass-panel" style={{ width: '640px', maxWidth: '90vw', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} className="bklit-text-cyan" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>Export Quantum Algorithm</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Format Selectors */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['qasm', 'qiskit'].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`btn ${activeLang === lang ? 'btn-primary' : 'btn-glass'}`}
              style={{ padding: '6px 14px', fontSize: '0.78rem', textTransform: 'uppercase' }}
            >
              {lang === 'qasm' ? 'OpenQASM 2.0' : 'Qiskit Python'}
            </button>
          ))}
        </div>

        {/* Code View (BKLIT Container) */}
        <div className="bklit-container" style={{
          position: 'relative',
          borderRadius: '6px',
          padding: '18px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          maxHeight: '340px',
          overflowY: 'auto'
        }}>
          <button
            onClick={handleCopy}
            className="btn btn-glass"
            style={{ position: 'absolute', top: '10px', right: '10px', padding: '5px 10px', fontSize: '0.72rem' }}
          >
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <pre style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6 }}>{getCodeSnippet()}</pre>
        </div>
      </div>
    </div>
  );
}
