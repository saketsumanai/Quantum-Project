import React from 'react';
import { Atom, Cpu, Sparkles, BookOpen, Code2, CheckCircle2 } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenExport, backendStatus }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px 0 24px', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.25))',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-cyan)'
        }}>
          <Atom className="animate-spin-slow" size={26} color="#00f0ff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #00f0ff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              QuantumForge
            </h1>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(0, 240, 255, 0.12)', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SIH 2026
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            AI-Powered Interactive Quantum Algorithm Learning Platform
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        <button
          className={`btn ${activeTab === 'studio' ? 'btn-primary' : 'btn-glass'}`}
          onClick={() => setActiveTab('studio')}
          style={{ padding: '7px 16px', fontSize: '0.82rem' }}
        >
          <Cpu size={15} /> Circuit Studio
        </button>
        <button
          className={`btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-glass'}`}
          onClick={() => setActiveTab('curriculum')}
          style={{ padding: '7px 16px', fontSize: '0.82rem' }}
        >
          <BookOpen size={15} /> Curriculum & Quizzes
        </button>
      </nav>

      {/* Right Controls & Telemetry Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
            {backendStatus ? 'Virtual QPU Active' : 'Connecting...'}
          </span>
        </div>

        <button className="btn btn-glass" onClick={onOpenExport} title="Export Code">
          <Code2 size={16} /> Export Code
        </button>
      </div>
    </header>
  );
}
