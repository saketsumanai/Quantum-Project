import React, { useState } from 'react';
import { BookOpen, ExternalLink, X, Bookmark, Quote, Copy, Check, Sparkles, Layers } from 'lucide-react';
import { LatexBlock } from './MathRenderer';

/**
 * CitationProjector — Projects exact academic textbook excerpts & formulas
 * whenever a user wants to inspect ground truth citations from the 150-book library.
 */
export default function CitationProjector({
  citation,
  onClose,
  onDeepDive,
  isModal = true,
}) {
  const [copied, setCopied] = useState(false);

  if (!citation) return null;

  const handleCopyCitation = () => {
    const text = `${citation.author} (${citation.year}). "${citation.title}". ${citation.chapter}, ${citation.section}, ${citation.pages}. ${citation.publisher}.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardContent = (
    <div style={{
      background: '#0d0d12',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      borderRadius: '16px',
      padding: '24px 28px',
      maxWidth: isModal ? '720px' : '100%',
      width: '100%',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
      fontFamily: "'Poppins', sans-serif",
      color: '#ffffff',
      position: 'relative',
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6ee7b7',
            fontWeight: 800,
          }}>
            <BookOpen size={19} />
          </div>
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6ee7b7',
              fontFamily: "'Times New Roman', Times, serif",
            }}>
              Authoritative Treatise Excerpt
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: 1.3,
              marginTop: 2,
            }}>
              {citation.title}
            </div>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            title="Close projection"
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Metadata Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px 16px',
        padding: '10px 14px',
        background: '#14141c',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.82rem',
        color: '#d4d4d8',
        marginBottom: 18,
      }}>
        <div>
          <span style={{ color: '#71717a' }}>Authors: </span>
          <b style={{ color: '#ffffff' }}>{citation.author}</b>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>Publisher: </span>
          <span>{citation.publisher} ({citation.year})</span>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>Location: </span>
          <b style={{ color: '#7dd3fc' }}>{citation.chapter}</b> · <span style={{ color: '#d4d4d8' }}>{citation.pages}</span>
        </div>
      </div>

      {/* Exact Projected Text Excerpt */}
      <div style={{
        position: 'relative',
        background: '#121218',
        borderLeft: '4px solid #34d399',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '0 10px 10px 0',
        padding: '18px 22px 18px 24px',
        marginBottom: 18,
      }}>
        <Quote size={24} color="rgba(52, 211, 153, 0.25)" style={{ position: 'absolute', top: 12, right: 14 }} />
        <div style={{ fontSize: '0.74rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
          {citation.section}
        </div>
        <p style={{
          fontSize: '1.04rem',
          color: '#ffffff',
          lineHeight: 1.8,
          margin: 0,
          fontStyle: 'normal',
        }}>
          "{citation.excerpt}"
        </p>
      </div>

      {/* Projected Formula */}
      {citation.key_formula && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.04)',
          border: '1px solid rgba(129, 140, 248, 0.22)',
          borderLeft: '4px solid #818cf8',
          borderRadius: '0 10px 10px 0',
          padding: '14px 20px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: '0.70rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
            Canonical Governing Equation
          </div>
          <LatexBlock tex={citation.key_formula} display={true} style={{ fontSize: '1.15rem' }} />
        </div>
      )}

      {/* Tags & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 6 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(citation.tags || []).map((tag, idx) => {
            const TAG_PALETTE = [
              { bg: 'rgba(56, 189, 248, 0.10)', border: 'rgba(56, 189, 248, 0.25)', text: '#7dd3fc' },
              { bg: 'rgba(129, 140, 248, 0.10)', border: 'rgba(129, 140, 248, 0.25)', text: '#a5b4fc' },
              { bg: 'rgba(52, 211, 153, 0.10)', border: 'rgba(52, 211, 153, 0.25)', text: '#6ee7b7' },
              { bg: 'rgba(251, 191, 36, 0.10)', border: 'rgba(251, 191, 36, 0.25)', text: '#fcd34d' },
              { bg: 'rgba(192, 132, 252, 0.10)', border: 'rgba(192, 132, 252, 0.25)', text: '#c084fc' },
            ];
            const p = TAG_PALETTE[idx % TAG_PALETTE.length];
            return (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  borderRadius: '4px',
                  padding: '3px 8px',
                  color: p.text,
                  fontWeight: 600,
                }}
              >
                #{tag}
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleCopyCitation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '6px',
              padding: '7px 12px',
              color: '#d4d4d8',
              fontSize: '0.80rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            <span style={{ color: copied ? '#34d399' : '#d4d4d8' }}>{copied ? 'Citation Copied' : 'Copy Citation'}</span>
          </button>

          {citation.doi && (
            <a
              href={citation.doi}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '6px',
                padding: '7px 12px',
                color: '#d4d4d8',
                fontSize: '0.80rem',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <ExternalLink size={14} /> DOI Ref
            </a>
          )}

          {onDeepDive && (
            <button
              onClick={() => onDeepDive(citation)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.25) 0%, rgba(99, 102, 241, 0.35) 100%)',
                border: '1px solid rgba(129, 140, 248, 0.45)',
                borderRadius: '6px',
                padding: '7px 14px',
                color: '#ffffff',
                fontSize: '0.80rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <Sparkles size={14} color="#a5b4fc" /> Deep Dive with AI Tutor
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return cardContent;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px',
    }}>
      {cardContent}
    </div>
  );
}
