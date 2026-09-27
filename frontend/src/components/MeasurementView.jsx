import React from 'react';
import { BarChart3, Binary, Clock, Gauge, Cpu, Play, ArrowRight } from 'lucide-react';
import { InteractiveHoverButton } from './ui/interactive-hover-button';

export default function MeasurementView({
  simulationResult,
  statevectorData,
  noiseEnabled,
  noiseProfile,
  hasSimulated = false,
  onRunSimulation,
  isSimulating = false
}) {
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

  // If user has not simulated yet, render sleek Obsidian awaiting execution panel
  if (!hasSimulated || !simulationResult) {
    return (
      <div
        className="liquid-glass-panel"
        style={{
          padding: '40px 28px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '16px',
          background: '#0c0c12',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BarChart3 size={24} color="#94a3b8" />
        </div>
        <div>
          <h3 style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            marginBottom: '6px'
          }}>
            QPU Execution Engine Ready
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.88rem',
            maxWidth: '520px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Click the <span style={{ color: '#ffffff', fontWeight: 600 }}>Simulate</span> button in the toolbar above to compile your quantum circuit, execute 1,024 projective measurement shots, and extract the statevector.
          </p>
        </div>
        {onRunSimulation && (
          <InteractiveHoverButton
            text={isSimulating ? 'Simulating...' : 'Simulate Circuit Now'}
            hoverText="Execute QPU"
            icon={<Play size={14} />}
            hoverIcon={<ArrowRight size={14} />}
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="w-48 h-9 py-1 px-4 text-xs font-semibold bg-zinc-900 border-zinc-700 text-white hover:border-zinc-500"
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* 1. Measurement Histogram */}
      <div className="liquid-glass-panel bklit-container" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#94a3b8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {noiseData ? 'NISQ vs Ideal Distribution' : 'Measurement Distribution'}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span className="bklit-metric-card" style={{ padding: '3px 10px', borderRadius: '4px', color: '#ffffff', fontWeight: 600 }}>
              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {executionTime}ms
            </span>
            <span className="bklit-metric-card" style={{ padding: '3px 10px', borderRadius: '4px', color: '#cbd5e1', fontWeight: 600 }}>
              <Gauge size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {shots} shots
            </span>
          </div>
        </div>

        {/* Hardware Noise Impact Banner if active */}
        {noiseData && (
          <div style={{
            background: 'rgba(20, 20, 26, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={15} color="#cbd5e1" />
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{noiseData.profile}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span>
                Fidelity: <b style={{ color: noiseData.fidelity_pct > 90 ? '#34d399' : '#f59e0b' }}>{noiseData.fidelity_pct}%</b>
              </span>
              <span>
                Purity: <b style={{ color: '#ffffff' }}>{noiseData.purity}</b>
              </span>
            </div>
          </div>
        )}

        {/* Legend for Dual Bars */}
        {noiseData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#ffffff', borderRadius: '2px' }} />
              <span>Ideal Statevector</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
              <span>NISQ Hardware (Decohered)</span>
            </div>
          </div>
        )}

        {/* Dynamic Animated Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
          {allBasisStates.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '30px 0' }}>
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
                <div key={basis} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Basis State Label */}
                    <span style={{
                      width: '48px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      color: '#ffffff',
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
                    }}>
                      |{basis}⟩
                    </span>

                    {/* Bar Track */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* Ideal Bar */}
                      <div style={{
                        height: noiseData ? '14px' : '26px',
                        background: 'rgba(10, 10, 14, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div
                          style={{
                            width: idealBarWidth,
                            height: '100%',
                            background: 'linear-gradient(90deg, #ffffff, #a1a1aa)',
                            borderRadius: '3px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>

                      {/* Noisy Bar (if active) */}
                      {noiseData && (
                        <div style={{
                          height: '14px',
                          background: 'rgba(10, 10, 14, 0.9)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          <div
                            style={{
                              width: noisyBarWidth,
                              height: '100%',
                              background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                              borderRadius: '3px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Percentage Values */}
                    <div style={{ width: '96px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.86rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 700 }}>
                        {idealPercent}%
                      </div>
                      {noiseData && (
                        <div style={{ color: '#f59e0b', fontSize: '0.76rem', fontWeight: 600 }}>
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
      <div className="liquid-glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Binary size={20} color="#cbd5e1" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 14px rgba(255,255,255,0.35)' }}>
            Pure Statevector (|ψ⟩)
          </h3>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.14)', color: '#cbd5e1', textAlign: 'left', fontWeight: 700 }}>
                <th style={{ padding: '10px 8px' }}>Basis</th>
                <th style={{ padding: '10px 8px' }}>Real (α)</th>
                <th style={{ padding: '10px 8px' }}>Imag (β)</th>
                <th style={{ padding: '10px 8px' }}>|Amplitude|²</th>
                <th style={{ padding: '10px 8px' }}>Phase (rad)</th>
              </tr>
            </thead>
            <tbody>
              {statevector.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Statevector will compute upon circuit execution.
                  </td>
                </tr>
              ) : (
                statevector.map((c) => (
                  <tr key={c.basis_state} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 8px', color: '#ffffff', fontWeight: 700, textShadow: '0 0 6px rgba(255, 255, 255, 0.5)' }}>|{c.basis_state}⟩</td>
                    <td style={{ padding: '10px 8px', color: '#f1f5f9' }}>{c.real.toFixed(4)}</td>
                    <td style={{ padding: '10px 8px', color: '#f1f5f9' }}>{c.imag.toFixed(4)}i</td>
                    <td style={{ padding: '10px 8px', color: '#ffffff', fontWeight: 700, textShadow: '0 0 6px rgba(255, 255, 255, 0.4)' }}>{c.amplitude_sq.toFixed(4)}</td>
                    <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>{c.phase_rad.toFixed(3)}</td>
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
