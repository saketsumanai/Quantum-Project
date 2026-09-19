import React from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Sparkles, X } from 'lucide-react';
import { GATE_METADATA } from '../data/gateMetadata';

export default function GateTooltip({
  gateId,
  position,
  onClose,
  onMouseEnter,
  onMouseLeave
}) {
  const gate = GATE_METADATA[gateId?.toLowerCase()];
  if (!gate || !position || typeof document === 'undefined') return null;

  const handleAskTutor = (e) => {
    e.stopPropagation();
    if (gate.tutorPrompt) {
      window.dispatchEvent(new CustomEvent('ask-ai-tutor', {
        detail: { prompt: gate.tutorPrompt }
      }));
    }
  };

  // Dimensions & bounds
  const tooltipWidth = 370;
  const leftPos = Math.max(16, Math.min(position.x - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));

  const gateTop = position.top ?? position.y ?? 400;
  const gateBottom = position.bottom ?? position.y ?? 400;

  // Prefer opening ABOVE the gate ('upar se') when space is available
  const showAbove = gateTop >= 300;

  const verticalStyle = showAbove
    ? {
        bottom: `${Math.max(10, window.innerHeight - gateTop + 8)}px`,
        maxHeight: `${Math.min(gateTop - 16, 520)}px`
      }
    : {
        top: `${Math.max(10, gateBottom + 8)}px`,
        maxHeight: `${Math.min(window.innerHeight - gateBottom - 16, 520)}px`
      };

  const tooltipElement = (
    <div
      style={{
        position: 'fixed',
        left: `${leftPos}px`,
        ...verticalStyle,
        width: `${tooltipWidth}px`,
        background: '#09090d',
        border: '1px solid #2e2e38',
        borderRadius: '8px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.98), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        padding: '14px',
        color: '#f4f4f5',
        zIndex: 99999999,
        pointerEvents: 'auto',
        overflowY: 'auto',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
        lineHeight: 1.4
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                fontSize: '0.82rem',
                padding: '2px 7px',
                borderRadius: '4px',
                background: gate.badgeColor || '#3b82f6',
                color: '#ffffff'
              }}
            >
              {gate.symbol}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: '4px',
                background: '#181820',
                border: '1px solid #2e2e38',
                color: '#a1a1aa'
              }}
            >
              {gate.category}
            </span>
          </div>
          <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 700, color: '#fafafa' }}>
            {gate.name}
          </h4>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.68rem',
            color: '#a1a1aa',
            background: '#121218',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #2e2e38',
            whiteSpace: 'nowrap'
          }}
        >
          {gate.dimension}
        </span>
      </div>

      {/* Unitary Matrix & Dirac Equation */}
      <div
        style={{
          background: '#040406',
          border: '1px solid #272730',
          borderRadius: '6px',
          padding: '8px 10px',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
            Unitary Operator Matrix
          </span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.70rem', color: '#38bdf8' }}>
            {gate.equation}
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            borderLeft: '2px solid #52525b',
            borderRight: '2px solid #52525b',
            borderRadius: '4px',
            padding: '3px 8px',
            margin: '2px 0'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gate.matrix[0]?.length || 2}, auto)`,
              gap: '4px 12px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.76rem',
              color: '#f4f4f5',
              textAlign: 'center'
            }}
          >
            {gate.matrix.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <span key={`${rIdx}-${cIdx}`} style={{ minWidth: '28px' }}>
                  {val}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Physical Intuition & Bloch Action */}
      <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: '#d4d4d8' }}>
        <p style={{ margin: '0 0 3px 0', lineHeight: 1.35 }}>{gate.description}</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#a1a1aa', fontSize: '0.70rem' }}>
          <span style={{ color: '#e4e4e7', fontWeight: 600 }}>Bloch Sphere:</span>
          <span>{gate.blochAction}</span>
        </div>
      </div>

      {/* Textbook Citation Box */}
      <div
        style={{
          background: '#111219',
          border: '1px solid #272730',
          borderRadius: '6px',
          padding: '8px 10px',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <BookOpen size={12} color='#60a5fa' />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>
            Textbook Citation (data/books/)
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1px' }}>
          {gate.citation.author} — {gate.citation.title}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#a1a1aa', fontFamily: 'var(--font-mono, monospace)' }}>
          {gate.citation.chapter} • {gate.citation.section} ({gate.citation.pages})
        </div>
        <div style={{ fontSize: '0.64rem', color: '#71717a', marginTop: '2px', fontStyle: 'italic' }}>
          Archive file: {gate.citation.bookFile}
        </div>
      </div>

      {/* Bottom Action: Ask AI Tutor */}
      <button
        onClick={handleAskTutor}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '7px 10px',
          borderRadius: '6px',
          background: '#20212a',
          border: '1px solid #363744',
          color: '#ffffff',
          fontSize: '0.74rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2e303d';
          e.currentTarget.style.borderColor = '#60a5fa';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#20212a';
          e.currentTarget.style.borderColor = '#363744';
        }}
      >
        <Sparkles size={13} color='#38bdf8' />
        Ask AI Tutor about {gate.symbol}
      </button>
    </div>
  );

  return createPortal(tooltipElement, document.body);
}
