import React, { useState } from 'react';

/**
 * Clean, professional 2D Quantum State Visualizer (IBM Quantum style).
 * Replaces wireframe 3D holograms with a clean, scientific 2D polar projection
 * and exact statevector probability distribution.
 */
export default function BlochSphere({ blochCoordinates = [], selectedQubit = 0, onSelectQubit }) {
  const [viewMode, setViewMode] = useState('polar'); // 'polar' | 'amplitudes'

  const currentCoord = blochCoordinates.find(c => c.qubit_index === selectedQubit) || {
    x: 0, y: 0, z: 1, theta_rad: 0, phi_rad: 0
  };

  const theta = currentCoord.theta_rad || 0;
  const phi = currentCoord.phi_rad || 0;
  const prob0 = Math.cos(theta / 2) ** 2;
  const prob1 = Math.sin(theta / 2) ** 2;

  // 2D Projection coordinates on the unit circle (Z vertical, X horizontal)
  // Radius = 75px, Center = (100, 100)
  const radius = 72;
  const centerX = 100;
  const centerY = 100;
  // In Bloch coordinates: z is vertical (+z is |0> at top, -z is |1> at bottom)
  // x is horizontal (+x is |+> right, -x is |-> left)
  const tipX = centerX + currentCoord.x * radius;
  const tipY = centerY - currentCoord.z * radius; // inverted y for SVG

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Header with Qubit Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Qubit State Representation
          </div>
          <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Geometric state projection &amp; basis weights
          </div>
        </div>

        {/* Qubit Selector */}
        {blochCoordinates.length > 1 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {blochCoordinates.map((c) => (
              <button
                key={c.qubit_index}
                onClick={() => onSelectQubit && onSelectQubit(c.qubit_index)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: selectedQubit === c.qubit_index ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedQubit === c.qubit_index ? '#ffffff' : 'rgba(255,255,255,0.14)',
                  color: selectedQubit === c.qubit_index ? '#000000' : '#a1a1aa',
                  boxShadow: selectedQubit === c.qubit_index ? '0 0 14px rgba(255,255,255,0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                q[{c.qubit_index}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Visualizer Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px',
        position: 'relative',
      }}>
        {/* Clean 2D Polar State Diagram */}
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
          {/* Unit Circle Background */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />

          {/* Coordinate Axes */}
          <line
            x1={centerX - radius - 10} y1={centerY}
            x2={centerX + radius + 10} y2={centerY}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={centerX} y1={centerY - radius - 10}
            x2={centerX} y2={centerY + radius + 10}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Basis State Labels */}
          <text x={centerX} y={centerY - radius - 12} textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="var(--font-sans)" fontWeight="500">|0⟩</text>
          <text x={centerX} y={centerY + radius + 18} textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="var(--font-sans)" fontWeight="500">|1⟩</text>
          <text x={centerX + radius + 14} y={centerY + 4} textAnchor="start" fill="#a1a1aa" fontSize="12" fontFamily="var(--font-sans)" fontWeight="500">|+⟩</text>
          <text x={centerX - radius - 14} y={centerY + 4} textAnchor="end" fill="#a1a1aa" fontSize="12" fontFamily="var(--font-sans)" fontWeight="500">|−⟩</text>

          {/* State Vector Arrow */}
          <line
            x1={centerX}
            y1={centerY}
            x2={tipX}
            y2={tipY}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Center Origin Dot */}
          <circle cx={centerX} cy={centerY} r="3" fill="#71717a" />

          {/* State Vector Tip */}
          <circle
            cx={tipX}
            cy={tipY}
            r="5"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="1.5"
          />
        </svg>

        {/* Basis Probability Meters Below Diagram */}
        <div style={{ width: '100%', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
            <span style={{ width: '32px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>|0⟩:</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(prob0 * 100).toFixed(1)}%`, height: '100%', background: 'linear-gradient(90deg, #ffffff, #a1a1aa)', borderRadius: '3px' }} />
            </div>
            <span style={{ width: '42px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {(prob0 * 100).toFixed(1)}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
            <span style={{ width: '32px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>|1⟩:</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(prob1 * 100).toFixed(1)}%`, height: '100%', background: 'linear-gradient(90deg, #d4d4d8, #71717a)', borderRadius: '3px' }} />
            </div>
            <span style={{ width: '42px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {(prob1 * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Numeric Coordinate Readout */}
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        fontFamily: 'var(--font-mono)',
        color: '#a1a1aa',
      }}>
        <span>x: {currentCoord.x.toFixed(3)}</span>
        <span>y: {currentCoord.y.toFixed(3)}</span>
        <span>z: {currentCoord.z.toFixed(3)}</span>
        <span>θ: {((theta * 180) / Math.PI).toFixed(1)}°</span>
        <span>φ: {((phi * 180) / Math.PI).toFixed(1)}°</span>
      </div>
    </div>
  );
}
