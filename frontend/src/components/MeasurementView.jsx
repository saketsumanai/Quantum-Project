import React from 'react';

export default function MeasurementView({ simulationResult, statevectorData, simulationError, isSimulating }) {
  const counts = simulationResult?.counts || {};
  const probs = simulationResult?.probabilities || {};
  const shots = simulationResult?.shots || 1024;
  const executionTime = simulationResult?.execution_time_ms || 0;
  const statevector = statevectorData?.statevector || [];

  const maxProb = Math.max(...Object.values(probs), 0.01);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* 1. Measurement Histogram */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Measurement Distribution
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Projective probabilities &amp; shot counts
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{
              padding: '3px 10px', borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              {isSimulating ? 'SIMULATING...' : (simulationResult?.framework || 'auto')}
            </span>
            <span style={{ color: '#a1a1aa' }}>{executionTime}ms</span>
            <span style={{ color: '#a1a1aa' }}>{shots} shots</span>
          </div>
        </div>

        {/* Error Notification if any */}
        {simulationError && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.78rem',
            lineHeight: 1.4
          }}>
            <strong>Simulation Error:</strong> {simulationError}
          </div>
        )}

        {/* Clean, Non-Neon Measurement Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
          {Object.keys(probs).length === 0 ? (
            <div style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '0.82rem', padding: '24px 0' }}>
              {isSimulating ? 'Executing quantum simulation...' : 'Run circuit simulation to display projective measurement distribution.'}
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
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: '#ffffff'
                  }}>
                    |{basis}⟩
                  </span>

                  {/* Bar Track with LED Backlight */}
                  <div style={{
                    flex: 1,
                    height: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.9)'
                  }}>
                    <div style={{
                      width: barWidth,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ffffff 0%, #d4d4d8 100%)',
                      borderRadius: '6px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {/* Value */}
                  <div style={{ width: '80px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{percent}%</span>
                    <span style={{ color: '#a1a1aa', fontSize: '0.68rem', marginLeft: '4px' }}>({count})</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Statevector Complex Amplitudes Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Pure Statevector (|ψ⟩)
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Computational basis decomposition &amp; phases
          </span>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', textAlign: 'left', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
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
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    Statevector computes upon circuit execution.
                  </td>
                </tr>
              ) : (
                statevector.map((c) => (
                  <tr key={c.basis_state} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '6px 8px', color: '#78a9ff', fontWeight: 600 }}>|{c.basis_state}⟩</td>
                    <td style={{ padding: '6px 8px', color: '#e5e7eb' }}>{c.real.toFixed(4)}</td>
                    <td style={{ padding: '6px 8px', color: '#e5e7eb' }}>{c.imag.toFixed(4)}i</td>
                    <td style={{ padding: '6px 8px', color: '#f3f4f6', fontWeight: 600 }}>{c.amplitude_sq.toFixed(4)}</td>
                    <td style={{ padding: '6px 8px', color: '#9ca3af' }}>{c.phase_rad.toFixed(3)}</td>
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
