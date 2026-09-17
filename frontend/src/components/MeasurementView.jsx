import React from 'react';
import { BarChart3, Binary, Clock, Gauge } from 'lucide-react';

export default function MeasurementView({ simulationResult, statevectorData }) {
  const counts = simulationResult?.counts || {};
  const probs = simulationResult?.probabilities || {};
  const shots = simulationResult?.shots || 1024;
  const executionTime = simulationResult?.execution_time_ms || 0;
  const statevector = statevectorData?.statevector || [];

  const maxProb = Math.max(...Object.values(probs), 0.01);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* 1. Measurement Histogram (BKLIT Engine) */}
      <div className="liquid-glass-panel bklit-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} className="bklit-text-cyan" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>
              Measurement Distribution
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem' }}>
            <span className="bklit-metric-card" style={{ padding: '3px 8px', borderRadius: '4px', color: '#ffffff', fontWeight: 600 }}>
              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {executionTime}ms
            </span>
            <span className="bklit-metric-card" style={{ padding: '3px 8px', borderRadius: '4px', color: '#a1a1aa', fontWeight: 600 }}>
              <Gauge size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {shots} shots
            </span>
          </div>
        </div>

        {/* Dynamic Backlit Animated Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
          {Object.keys(probs).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '30px 0' }}>
              Run simulation to view projective measurement distribution.
            </div>
          ) : (
            Object.entries(probs).map(([basis, p]) => {
              const count = counts[basis] || 0;
              const percent = (p * 100).toFixed(1);
              const barWidth = `${(p / maxProb) * 100}%`;

              return (
                <div key={basis} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Basis State Label */}
                  <span style={{
                    width: '45px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#ffffff',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
                  }}>
                    |{basis}⟩
                  </span>

                  {/* Bar Track with LED Backlight */}
                  <div style={{
                    flex: 1,
                    height: '26px',
                    background: 'rgba(10, 10, 10, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.9)'
                  }}>
                    <div
                      className="bklit-bar-glow"
                      style={{
                        width: barWidth,
                        height: '100%',
                        borderRadius: '3px',
                        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  </div>

                  {/* Value */}
                  <div style={{ width: '85px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    <span style={{ color: '#fff', fontWeight: 700, textShadow: '0 0 8px rgba(255,255,255,0.6)' }}>{percent}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: '4px' }}>({count})</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Statevector Complex Amplitudes Table */}
      <div className="liquid-glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Binary size={18} className="bklit-text-cyan" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>Pure Statevector (|ψ⟩)</h3>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Basis</th>
                <th style={{ padding: '8px' }}>Real (α)</th>
                <th style={{ padding: '8px' }}>Imag (β)</th>
                <th style={{ padding: '8px' }}>|Amplitude|²</th>
                <th style={{ padding: '8px' }}>Phase (rad)</th>
              </tr>
            </thead>
            <tbody>
              {statevector.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Statevector will compute upon circuit execution.
                  </td>
                </tr>
              ) : (
                statevector.map((c) => (
                  <tr key={c.basis_state} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', color: '#ffffff', fontWeight: 700, textShadow: '0 0 6px rgba(255, 255, 255, 0.5)' }}>|{c.basis_state}⟩</td>
                    <td style={{ padding: '8px', color: '#f1f5f9' }}>{c.real.toFixed(4)}</td>
                    <td style={{ padding: '8px', color: '#f1f5f9' }}>{c.imag.toFixed(4)}i</td>
                    <td style={{ padding: '8px', color: '#e4e4e7', fontWeight: 600, textShadow: '0 0 6px rgba(255, 255, 255, 0.4)' }}>{c.amplitude_sq.toFixed(4)}</td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{c.phase_rad.toFixed(3)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
