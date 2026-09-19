import React, { useMemo } from 'react';
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
export default function MathRenderer({ content, className = '', style = {} }) {
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

      // Regular prose — format markdown bold, inline code, paragraphs
      return (
        <span key={index}>
          {renderMarkdownSegment(part)}
        </span>
      );
    });
  }, [content]);

  return (
    <div className={`math-rendered-text ${className}`} style={{ lineHeight: 1.65, ...style }}>
      {renderedElements}
    </div>
  );
}

/**
 * Format markdown bold, code, and lists inside plain text segments
 */
function renderMarkdownSegment(segment) {
  // Split lines
  const lines = segment.split('\n');
  return lines.map((line, lIdx) => {
    // Check if bullet point
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    const displayLine = isBullet ? line.trim().replace(/^[-*]\s+/, '') : line;

    // Parse inline bold and inline code
    const tokens = displayLine.split(/(\*\*.*?\*\*|`.*?`)/g);

    const formattedLine = tokens.map((tok, tIdx) => {
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
        return (
          <strong key={tIdx} style={{ color: 'var(--text-primary, #ffffff)', fontWeight: 600 }}>
            {tok.slice(2, -2)}
          </strong>
        );
      }
      if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
        return (
          <code
            key={tIdx}
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.08)',
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              fontSize: '0.85em',
              color: '#78a9ff',
            }}
          >
            {tok.slice(1, -1)}
          </code>
        );
      }
      return tok;
    });

    if (isBullet) {
      return (
        <div key={lIdx} style={{ display: 'flex', gap: 8, margin: '4px 0', paddingLeft: 12 }}>
          <span style={{ color: '#0f62fe', fontWeight: 'bold' }}>•</span>
          <div>{formattedLine}</div>
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
