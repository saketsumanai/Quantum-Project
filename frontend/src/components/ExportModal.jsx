import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, circuit, qasmExport }) {
  const [activeLang, setActiveLang] = useState('qiskit');
  const [copied, setCopied] = useState(false);
  const [exportedCodes, setExportedCodes] = useState({});
  const [optimalFramework, setOptimalFramework] = useState('qiskit');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && circuit) {
      setIsLoading(true);
      fetch('http://localhost:8000/api/v1/simulation/export-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuit),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.codes) {
            setExportedCodes(data.codes);
            if (data.optimal_framework) {
              setOptimalFramework(data.optimal_framework);
              setActiveLang(data.optimal_framework);
            }
          }
        })
        .catch((err) => {
          console.error('Export fetch error:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, circuit]);

  if (!isOpen) return null;

  const frameworks = [
    { id: 'qiskit', label: 'Qiskit 1.0+ (Aer)', desc: 'IBM Quantum SDK & Aer noise simulation' },
    { id: 'pennylane', label: 'PennyLane (QNode)', desc: 'Differentiable circuits & parameter-shift rule' },
    { id: 'cirq', label: 'Google Cirq', desc: 'Google Quantum AI Sycamore grid layout' },
    { id: 'qbraid', label: 'qBraid Transpiler', desc: 'Universal cross-framework transpiler script' },
    { id: 'qasm', label: 'OpenQASM 2.0/3.0', desc: 'Hardware-independent quantum assembly' },
  ];

  const getCodeSnippet = () => {
    if (exportedCodes[activeLang]) {
      return exportedCodes[activeLang];
    }
    if (activeLang === 'qasm') return qasmExport || '// OpenQASM 2.0 representation';
    return '// Generating framework code...';
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
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        width: '740px',
        maxWidth: '92vw',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              <Terminal size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                Multi-Framework Quantum Circuit Exporter
              </h3>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                Qiskit 1.0 · PennyLane · Google Cirq · qBraid Transpiler
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Framework Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {frameworks.map((f) => {
            const isOptimal = optimalFramework === f.id;
            const isActive = activeLang === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveLang(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  border: '1px solid',
                  background: isActive ? '#0f62fe' : 'rgba(255,255,255,0.04)',
                  borderColor: isActive ? '#0f62fe' : 'rgba(255,255,255,0.12)',
                  color: isActive ? '#fff' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
                {isOptimal && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.2)',
                    color: isActive ? '#fff' : '#34d399',
                    letterSpacing: '0.05em',
                  }}>
                    RECOMMENDED
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Framework description pill */}
        <div style={{ fontSize: '0.74rem', color: '#9ca3af', padding: '6px 10px', background: '#0e1422', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
          {frameworks.find((f) => f.id === activeLang)?.desc}
        </div>

        {/* Code View */}
        <div style={{
          position: 'relative',
          background: '#080c14',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          maxHeight: '340px',
          overflowY: 'auto',
        }}>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              padding: '5px 10px', borderRadius: 4,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
              color: copied ? '#34d399' : '#f3f4f6', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
          <pre style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.55 }}>
            {isLoading ? '// Generating multi-framework code…' : getCodeSnippet()}
          </pre>
        </div>
      </div>
    </div>
  );
}
