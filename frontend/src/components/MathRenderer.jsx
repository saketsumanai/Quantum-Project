import React, { useMemo, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Clean up LaTeX string for reliable KaTeX rendering
 */
function cleanLatex(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  // Remove wrapping \[ \] or $$ if present for display math
  if (s.startsWith('\\[') && s.endsWith('\\]')) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('$$') && s.endsWith('$$')) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('\\(') && s.endsWith('\\)')) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('$') && s.endsWith('$') && s.length > 2) {
    s = s.slice(1, -1).trim();
  }
  // Replace double backslashes in matrix environments if overly escaped
  s = s.replace(/\\\\\\\\/g, '\\\\');
  return s;
}

/**
 * Render pure LaTeX math formula block (display or inline)
 */
export function LatexBlock({ tex, display = true, className = '', style = {} }) {
  const html = useMemo(() => {
    const cleaned = cleanLatex(tex);
    if (!cleaned) return '';
    try {
      return katex.renderToString(cleaned, {
        throwOnError: false,
        displayMode: display,
        output: 'htmlAndMathml',
      });
    } catch {
      // Graceful fallback with styled mathematical symbols
      return `<span style="font-family: 'IBM Plex Mono', monospace; color: #78a9ff;">${cleaned}</span>`;
    }
  }, [tex, display]);

  if (!html) return null;

  return (
    <span
      className={`latex-math-container ${className}`}
      style={{
        display: display ? 'block' : 'inline-block',
        overflowX: display ? 'auto' : 'visible',
        maxWidth: '100%',
        margin: display ? '10px 0' : '0 2px',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Parses mixed text containing markdown formatting and LaTeX math:
 * Matches:
 *  - Display: $$...$$ or \[...\]
 *  - Inline: $...$ or \(...\)
 *  - Bold: **text**
 *  - Inline code: `code`
 */
export default function MathRenderer({ content, onSelectCitation, className = '', style = {} }) {
  const renderedElements = useMemo(() => {
    if (!content) return null;
    const text = String(content);

    // If the entire text is just a raw LaTeX formula (e.g. starts with \frac or |...>)
    if (
      (text.startsWith('\\') || text.startsWith('|') || text.startsWith('H^2') || text.startsWith('X =')) &&
      !text.includes('\n') &&
      !text.includes(' ')
    ) {
      return <LatexBlock tex={text} display={true} />;
    }

    // Split text into tokens by LaTeX math delimiters:
    // 1. $$ ... $$ (display)
    // 2. \[ ... \] (display)
    // 3. \( ... \) (inline)
    // 4. $ ... $ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Display math: $$...$$ or \[...\]
      if (
        (part.startsWith('$$') && part.endsWith('$$')) ||
        (part.startsWith('\\[') && part.endsWith('\\]'))
      ) {
        return <LatexBlock key={index} tex={part} display={true} />;
      }

      // Inline math: \(...\) or $...$
      if (
        (part.startsWith('\\(') && part.endsWith('\\)')) ||
        (part.startsWith('$') && part.endsWith('$') && part.length > 2)
      ) {
        return <LatexBlock key={index} tex={part} display={false} />;
      }

      // Regular prose — format markdown bold, inline code, paragraphs, and interactive citations
      return (
        <span key={index}>
          {renderMarkdownSegment(part, onSelectCitation)}
        </span>
      );
    });
  }, [content, onSelectCitation]);

  return (
    <div className={`math-rendered-text ${className}`} style={{ lineHeight: 1.85, fontSize: '1.18rem', color: '#ffffff', ...style }}>
      {renderedElements}
    </div>
  );
}

/**
 * Extract 11-char YouTube ID from various YouTube URL formats
 */
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Interactive link / YouTube inline player badge
 */
function InlineVideoBadge({ url, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const ytId = useMemo(() => extractYouTubeId(url), [url]);

  if (!ytId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: '#38bdf8',
          textDecoration: 'none',
          padding: '2px 8px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 5,
          fontWeight: 600,
          fontSize: '0.86em',
          margin: '0 3px',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)';
          e.currentTarget.style.borderColor = '#38bdf8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
        }}
      >
        <span>🌐 {title || url}</span>
        <span style={{ fontSize: '0.75em' }}>↗</span>
      </a>
    );
  }

  return (
    <span style={{ display: 'inline-block', margin: '4px 0', verticalAlign: 'middle', maxWidth: '100%' }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.38)',
        borderRadius: 6,
        margin: '0 4px',
      }}>
        <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.84em' }}>▶ YouTube</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in YouTube tab"
          style={{
            color: '#fca5a5',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.84em',
            maxWidth: '220px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title || "Watch Video"}
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(prev => !prev);
          }}
          style={{
            background: isPlaying ? '#374151' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: '0.72em',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
          }}
        >
          {isPlaying ? "✕ Close" : "▶️ Watch in Chat"}
        </button>
      </span>

      {isPlaying && (
        <span style={{
          display: 'block',
          marginTop: 8,
          marginBottom: 10,
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          paddingTop: '56.25%',
          background: '#09090d',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(239, 68, 68, 0.45)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            title={title || "YouTube Video"}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </span>
      )}
    </span>
  );
}

/**
 * Format markdown headings, bold, code, citations, links, and lists inside plain text segments
 */
function renderMarkdownSegment(segment, onSelectCitation) {
  // Split lines
  const lines = segment.split('\n');
  return lines.map((line, lIdx) => {
    const trimmed = line.trim();

    // Check for markdown headings (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const fontSize = level === 1 ? '1.9rem' : level === 2 ? '1.6rem' : level === 3 ? '1.38rem' : '1.22rem';
      return (
        <div
          key={lIdx}
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontWeight: 800,
            fontSize,
            color: '#ffffff',
            marginTop: lIdx === 0 ? '8px' : '22px',
            marginBottom: '10px',
            paddingBottom: '6px',
            borderBottom: level <= 2 ? '1px solid rgba(255, 255, 255, 0.18)' : 'none',
            letterSpacing: '-0.01em',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
          }}
        >
          {headingText}
        </div>
      );
    }

    // Check if bullet point
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const displayLine = isBullet ? trimmed.replace(/^[-*]\s+/, '') : line;

    // Parse inline markdown links [Title](url), standalone URLs, bold, inline code, and bracket citations
    const tokens = displayLine.split(/(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s\)]+|\*\*.*?\*\*|`.*?`|\[(?:Source:[^\]]+|\d+|[A-Z][a-zA-Z\s&]+(?:,\s*\d{4}|,\s*Ch\.\s*\d+)?|Ch\.\s*\d+)\])/g);

    const formattedLine = tokens.map((tok, tIdx) => {
      if (!tok) return null;

      // 1. Markdown link: [Title](url)
      const mdLinkMatch = tok.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (mdLinkMatch) {
        return (
          <InlineVideoBadge
            key={tIdx}
            url={mdLinkMatch[2]}
            title={mdLinkMatch[1]}
          />
        );
      }

      // 2. Standalone URL: https://...
      if (tok.startsWith('http://') || tok.startsWith('https://')) {
        return (
          <InlineVideoBadge
            key={tIdx}
            url={tok}
            title={tok}
          />
        );
      }

      // 3. Bold text: **text**
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
        return (
          <strong key={tIdx} style={{ color: '#ffffff', fontWeight: 700 }}>
            {tok.slice(2, -2)}
          </strong>
        );
      }

      // 4. Inline code: `code`
      if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
        return (
          <code
            key={tIdx}
            style={{
              padding: '2px 7px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              fontSize: '0.88em',
              color: '#f4f4f5',
            }}
          >
            {tok.slice(1, -1)}
          </code>
        );
      }

      // 5. NotebookLM citation chip [1], [Nielsen & Chuang, 2010], etc.
      if (tok.startsWith('[') && tok.endsWith(']') && tok.length > 2) {
        const citContent = tok.slice(1, -1).trim();
        return (
          <span
            key={tIdx}
            onClick={() => onSelectCitation && onSelectCitation(citContent)}
            title={`Project source citation: ${citContent}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '1px 6px',
              margin: '0 3px',
              borderRadius: '5px',
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#6ee7b7',
              fontSize: '0.78em',
              fontWeight: 700,
              cursor: onSelectCitation ? 'pointer' : 'default',
              verticalAlign: 'baseline',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (onSelectCitation) {
                e.currentTarget.style.background = 'rgba(52, 211, 153, 0.25)';
                e.currentTarget.style.borderColor = '#34d399';
              }
            }}
            onMouseLeave={(e) => {
              if (onSelectCitation) {
                e.currentTarget.style.background = 'rgba(52, 211, 153, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.35)';
              }
            }}
          >
            <span>{tok}</span>
            <span style={{ fontSize: '0.72em', opacity: 0.8 }}>↗</span>
          </span>
        );
      }

      return tok;
    });

    if (isBullet) {
      return (
        <div key={lIdx} style={{ display: 'flex', gap: 10, margin: '6px 0', paddingLeft: 10 }}>
          <span style={{ color: '#ffffff', fontWeight: 'bold' }}>•</span>
          <div style={{ flex: 1 }}>{formattedLine}</div>
        </div>
      );
    }

    return (
      <React.Fragment key={lIdx}>
        {formattedLine}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
