import React, { useState } from 'react';
import { Download, Sparkles, Maximize2, Minimize2, Eye } from 'lucide-react';

/**
 * QuantumVisualizer
 * Renders interactive SVG-based quantum circuit diagrams, Bloch spheres,
 * and state probability distributions inside the AI Chat message stream.
 */
export default function QuantumVisualizer({ diagram, onOpenInStudio }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!diagram) return null;

  const type = diagram.type || (diagram.gates ? 'circuit' : diagram.theta !== undefined ? 'bloch_sphere' : 'histogram');
  const title = diagram.title || 'Quantum Visual Diagram';

  const downloadSvg = () => {
    const svgEl = document.getElementById(`quantum-diagram-${title.replace(/\s+/g, '-')}`);
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      margin: '14px 0',
      borderRadius: '10px',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(10, 15, 29, 0.98))',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={12} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>{title}</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {type === 'circuit' ? 'Quantum Circuit Schematic' : type === 'bloch_sphere' ? 'Bloch Sphere Vector' : 'Probability Spectrum'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {type === 'circuit' && onOpenInStudio && (
            <button
              onClick={() => onOpenInStudio(diagram)}
              style={{
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Open in Studio
            </button>
          )}
          <button
            onClick={downloadSvg}
            title="Download SVG Diagram"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '4px 8px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
            }}
          >
            <Download size={12} /> SVG
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Visual Content Area */}
      <div style={{
        padding: isExpanded ? '28px' : '18px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at center, rgba(30, 58, 138, 0.12) 0%, rgba(10, 15, 29, 0) 75%)',
        overflowX: 'auto',
      }}>
        {type === 'circuit' ? (
          <CircuitSvgRenderer diagram={diagram} id={`quantum-diagram-${title.replace(/\s+/g, '-')}`} />
        ) : type === 'bloch_sphere' ? (
          <BlochSphereSvgRenderer diagram={diagram} id={`quantum-diagram-${title.replace(/\s+/g, '-')}`} />
        ) : (
          <HistogramSvgRenderer diagram={diagram} id={`quantum-diagram-${title.replace(/\s+/g, '-')}`} />
        )}
      </div>

      {diagram.description && (
        <div style={{
          padding: '8px 16px 12px 16px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontStyle: 'italic',
        }}>
          {diagram.description}
        </div>
      )}
    </div>
  );
}

// ── Circuit SVG Renderer ───────────────────────────────────────────────────────
function CircuitSvgRenderer({ diagram, id }) {
  const numQubits = Math.max(2, diagram.num_qubits || 2);
  const rawGates = diagram.gates || [
    { gate: 'H', qubits: [0] },
    { gate: 'CX', qubits: [0, 1] },
  ];

  const wireStartX = 60;
  const wireSpacing = 50;
  const gateSpacing = 70;
  const wireLength = Math.max(380, wireStartX + (rawGates.length + 1) * gateSpacing);
  const svgHeight = numQubits * wireSpacing + 40;

  const getGateColor = (gate) => {
    const g = (gate || '').toUpperCase();
    if (g === 'H') return '#3b82f6';
    if (g === 'X') return '#ef4444';
    if (g === 'Y') return '#10b981';
    if (g === 'Z') return '#8b5cf6';
    if (g === 'S' || g === 'T') return '#f59e0b';
    if (g === 'CX' || g === 'CNOT') return '#6366f1';
    if (g === 'MEASURE' || g === 'M') return '#ec4899';
    return '#0284c7';
  };

  return (
    <svg id={id} width={wireLength} height={svgHeight} style={{ overflow: 'visible', maxWidth: '100%' }}>
      <defs>
        <filter id="gate-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Qubit Wires */}
      {Array.from({ length: numQubits }).map((_, q) => {
        const y = 30 + q * wireSpacing;
        return (
          <g key={q}>
            <text x="18" y={y + 4} fill="#94a3b8" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
              |q{q}⟩
            </text>
            <line x1={wireStartX} y1={y} x2={wireLength - 20} y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Gates */}
      {rawGates.map((gateItem, idx) => {
        const gName = (gateItem.gate || 'H').toUpperCase();
        const qubits = gateItem.qubits || [gateItem.qubit || 0];
        const x = wireStartX + 30 + idx * gateSpacing;

        // CNOT / Multi-qubit gate
        if (gName === 'CX' || gName === 'CNOT') {
          const ctrlQ = qubits[0] ?? 0;
          const tgtQ = qubits[1] ?? 1;
          const ctrlY = 30 + ctrlQ * wireSpacing;
          const tgtY = 30 + tgtQ * wireSpacing;

          return (
            <g key={idx}>
              {/* Connector line */}
              <line x1={x} y1={ctrlY} x2={x} y2={tgtY} stroke="#818cf8" strokeWidth="2" />
              {/* Control Dot */}
              <circle cx={x} cy={ctrlY} r="5" fill="#818cf8" />
              {/* Target Crosshair */}
              <circle cx={x} cy={tgtY} r="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
              <line x1={x - 8} y1={tgtY} x2={x + 8} y2={tgtY} stroke="#818cf8" strokeWidth="2" />
              <line x1={x} y1={tgtY - 8} x2={x} y2={tgtY + 8} stroke="#818cf8" strokeWidth="2" />
            </g>
          );
        }

        // Single Qubit Gate
        const q = qubits[0] ?? 0;
        const y = 30 + q * wireSpacing;
        const color = getGateColor(gName);

        return (
          <g key={idx} filter="url(#gate-glow)">
            <rect
              x={x - 16}
              y={y - 16}
              width="32"
              height="32"
              rx="6"
              fill={color}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.2"
            />
            <text
              x={x}
              y={y + 5}
              fill="#ffffff"
              fontSize="12"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              textAnchor="middle"
            >
              {gName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Bloch Sphere SVG Renderer ─────────────────────────────────────────────────
function BlochSphereSvgRenderer({ diagram, id }) {
  const theta = diagram.theta !== undefined ? diagram.theta : 1.5708; // default pi/2 (|+> state)
  const phi = diagram.phi !== undefined ? diagram.phi : 0.0;
  const label = diagram.state_label || '|ψ⟩';

  const cx = 130;
  const cy = 130;
  const r = 90;

  // Spherical to 2D projection
  // z points up, x points right-down, y points left-down
  const xCoord = Math.sin(theta) * Math.cos(phi);
  const yCoord = Math.sin(theta) * Math.sin(phi);
  const zCoord = Math.cos(theta);

  // Isometric-ish projection
  const tipX = cx + r * (xCoord * 0.85 - yCoord * 0.35);
  const tipY = cy - r * (zCoord * 0.85 + xCoord * 0.2);

  return (
    <svg id={id} width="280" height="270" style={{ overflow: 'visible' }}>
      {/* Outer Circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" />
      {/* Equator Ellipse */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.32} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
      
      {/* Axes */}
      {/* Z Axis */}
      <line x1={cx} y1={cy - r - 15} x2={cx} y2={cy + r + 15} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      <text x={cx + 8} y={cy - r - 10} fill="#60a5fa" fontSize="12" fontWeight="700">|0⟩ (+z)</text>
      <text x={cx + 8} y={cy + r + 16} fill="#94a3b8" fontSize="12" fontWeight="700">|1⟩ (-z)</text>

      {/* X Axis */}
      <line x1={cx - r * 0.8} y1={cy - r * 0.2} x2={cx + r * 0.8} y2={cy + r * 0.2} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x={cx + r * 0.8 + 6} y={cy + r * 0.2 + 4} fill="#a78bfa" fontSize="11">|+⟩ (x)</text>

      {/* State Vector Arrow */}
      <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={tipX} cy={tipY} r="4.5" fill="#38bdf8" />

      {/* Label of Vector Tip */}
      <text x={tipX + 8} y={tipY - 6} fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="'JetBrains Mono', monospace">
        {label}
      </text>

      {/* Angles metadata */}
      <text x="14" y="255" fill="#94a3b8" fontSize="10" fontFamily="'JetBrains Mono', monospace">
        θ = {Number(theta).toFixed(3)} rad · φ = {Number(phi).toFixed(3)} rad
      </text>
    </svg>
  );
}

// ── Histogram SVG Renderer ────────────────────────────────────────────────────
function HistogramSvgRenderer({ diagram, id }) {
  const rawDist = diagram.distribution || diagram.probabilities || { '00': 0.5, '11': 0.5 };
  const entries = Object.entries(rawDist);

  const width = 340;
  const height = 180;
  const barWidth = Math.min(48, Math.max(26, (width - 60) / (entries.length || 1) - 15));

  return (
    <svg id={id} width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Baseline */}
      <line x1="30" y1={height - 35} x2={width - 20} y2={height - 35} stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />

      {entries.map(([state, prob], i) => {
        const p = Math.max(0, Math.min(1, Number(prob)));
        const barHeight = p * 110;
        const x = 50 + i * (barWidth + 24);
        const y = height - 35 - barHeight;

        return (
          <g key={state}>
            {/* Probability Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              fill="url(#bar-gradient)"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="1"
            />
            {/* Value Label */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              fill="#93c5fd"
              fontSize="11"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
              textAnchor="middle"
            >
              {(p * 100).toFixed(1)}%
            </text>
            {/* State Label */}
            <text
              x={x + barWidth / 2}
              y={height - 18}
              fill="#f1f5f9"
              fontSize="12"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              textAnchor="middle"
            >
              |{state}⟩
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
