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
      {/* 1. Measurement Histogram */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#00f0ff" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Measurement Distribution</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {executionTime}ms</span>
            <span><Gauge size={12} style={{ verticalAlign: 'middle' }} /> {shots} shots</span>
          </div>
        </div>

        {/* Dynamic Animated Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
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
                    fontSize: '0.85rem',
                    color: '#38bdf8'
                  }}>
                    |{basis}⟩
                  </span>

                  {/* Bar Track */}
                  <div style={{
                    flex: 1,
                    height: '24px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: barWidth,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00f0ff 0%, #38bdf8 60%, #a855f7 100%)',
                      borderRadius: '6px',
                      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>

                  {/* Value */}
                  <div style={{ width: '85px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{percent}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '4px' }}>({count})</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Statevector Complex Amplitudes Table */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Binary size={18} color="#a855f7" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Pure Statevector (|ψ⟩)</h3>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Basis</th>
                <th style={{ padding: '6px 8px' }}>Real (α)</th>
                <th style={{ padding: '6px 8px' }}>Imag (β)</th>
                <th style={{ padding: '6px 8px' }}>|Amplitude|²</th>
                <th style={{ padding: '6px 8px' }}>Phase (rad)</th>
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
                  <tr key={c.basis_state} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px 8px', color: '#00f0ff', fontWeight: 700 }}>|{c.basis_state}⟩</td>
                    <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>{c.real.toFixed(4)}</td>
                    <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>{c.imag.toFixed(4)}i</td>
                    <td style={{ padding: '6px 8px', color: '#a855f7', fontWeight: 600 }}>{c.amplitude_sq.toFixed(4)}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{c.phase_rad.toFixed(3)}</td>
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
