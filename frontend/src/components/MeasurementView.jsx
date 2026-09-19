import React from 'react';
import { BarChart3, Binary, Clock, Gauge, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MeasurementView({ simulationResult, statevectorData, noiseEnabled, noiseProfile }) {
  const counts = simulationResult?.counts || {};
  const probs = simulationResult?.probabilities || {};
  const shots = simulationResult?.shots || 1024;
  const executionTime = simulationResult?.execution_time_ms || 0;
  const statevector = statevectorData?.statevector || [];
  const noiseData = simulationResult?.noise_data;

  const maxProb = Math.max(...Object.values(probs), 0.01);

  // Combine all basis states from ideal and noisy
  const allBasisStates = Array.from(new Set([
    ...Object.keys(probs),
    ...(noiseData ? Object.keys(noiseData.noisy_probabilities || {}) : [])
  ])).sort();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* 1. Measurement Histogram (BKLIT Engine) */}
      <div className="liquid-glass-panel bklit-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} className="bklit-text-cyan" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 14px rgba(255,255,255,0.35)' }}>
              {noiseData ? 'NISQ vs Ideal Distribution' : 'Measurement Distribution'}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
            <span className="bklit-metric-card" style={{ padding: '2px 8px', borderRadius: '4px', color: '#ffffff', fontWeight: 600 }}>
              <Clock size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {executionTime}ms
            </span>
            <span className="bklit-metric-card" style={{ padding: '2px 8px', borderRadius: '4px', color: '#a1a1aa', fontWeight: 600 }}>
              <Gauge size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {shots} shots
            </span>
          </div>
        </div>

        {/* Hardware Noise Impact Banner if active */}
        {noiseData && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="#38bdf8" />
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{noiseData.profile}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>
                Fidelity: <b style={{ color: noiseData.fidelity_pct > 90 ? '#34d399' : '#f59e0b' }}>{noiseData.fidelity_pct}%</b>
              </span>
              <span>
                Purity: <b style={{ color: '#38bdf8' }}>{noiseData.purity}</b>
              </span>
            </div>
          </div>
        )}

        {/* Legend for Dual Bars */}
        {noiseData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.72rem', color: '#a1a1aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '2px' }} />
              <span>Ideal Statevector</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }} />
              <span>NISQ Hardware (Decohered)</span>
            </div>
          </div>
        )}

        {/* Dynamic Animated Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
          {allBasisStates.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '30px 0' }}>
              Run simulation to view projective measurement distribution.
            </div>
          ) : (
            allBasisStates.map((basis) => {
              const idealP = probs[basis] || 0;
              const noisyP = noiseData ? (noiseData.noisy_probabilities[basis] || 0) : null;
              const count = counts[basis] || (noiseData?.noisy_counts?.[basis] || 0);

              const idealPercent = (idealP * 100).toFixed(1);
              const noisyPercent = noisyP !== null ? (noisyP * 100).toFixed(1) : null;

              const idealBarWidth = `${(idealP / maxProb) * 100}%`;
              const noisyBarWidth = noisyP !== null ? `${(noisyP / maxProb) * 100}%` : null;

              return (
                <div key={basis} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

                    {/* Bar Track */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {/* Ideal Bar */}
                      <div style={{
                        height: noiseData ? '14px' : '24px',
                        background: 'rgba(10, 10, 10, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div
                          style={{
                            width: idealBarWidth,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                            borderRadius: '2px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>

                      {/* Noisy Bar (if active) */}
                      {noiseData && (
                        <div style={{
                          height: '14px',
                          background: 'rgba(10, 10, 10, 0.9)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          <div
                            style={{
                              width: noisyBarWidth,
                              height: '100%',
                              background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                              borderRadius: '2px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Percentage Values */}
                    <div style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                        {idealPercent}%
                      </div>
                      {noiseData && (
                        <div style={{ color: '#f59e0b', fontSize: '0.7rem' }}>
                          {noisyPercent}%
                        </div>
                      )}
                    </div>
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
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 14px rgba(255,255,255,0.35)' }}>
            Pure Statevector (|ψ⟩)
          </h3>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
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
