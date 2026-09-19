import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * MathBlock renders a pure LaTeX formula in block or inline mode.
 */
export default function MathBlock({ math, inline = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        let cleanMath = String(math).trim();

        if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
          cleanMath = cleanMath.slice(2, -2).trim();
        } else if (cleanMath.startsWith('\\[') && cleanMath.endsWith('\\]')) {
          cleanMath = cleanMath.slice(2, -2).trim();
        } else if (cleanMath.startsWith('\\(') && cleanMath.endsWith('\\)')) {
          cleanMath = cleanMath.slice(2, -2).trim();
        } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
          cleanMath = cleanMath.slice(1, -1).trim();
        }

        katex.render(cleanMath, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        if (containerRef.current) {
          containerRef.current.textContent = String(math);
        }
      }
    }
  }, [math, inline]);

  if (!math) return null;

  return (
    <div
      style={{
        marginTop: inline ? '0' : '8px',
        padding: inline ? '2px 6px' : '10px 14px',
        background: 'rgba(15, 98, 254, 0.08)',
        borderRadius: '6px',
        borderLeft: inline ? 'none' : '3px solid #38bdf8',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        overflowX: 'auto',
        color: '#38bdf8',
        fontSize: inline ? '0.88rem' : '0.95rem',
        display: inline ? 'inline-block' : 'block',
      }}
    >
      <span ref={containerRef} />
    </div>
  );
}

/**
 * LaTeXText parses mixed strings containing prose and embedded LaTeX formulas
 * (e.g. $...$ for inline math and $$...$$ for block math) and renders KaTeX properly.
 */
export function LaTeXText({ text, style, className }) {
  if (!text) return null;

  const rawStr = String(text);

  // Regex splits on $$...$$ OR $...$ OR \[...\] OR \(...\)
  const tokens = rawStr.split(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g);

  return (
    <span className={className} style={{ lineHeight: '1.75', ...style }}>
      {tokens.map((token, idx) => {
        if (!token) return null;

        // 1. Block Math: $$...$$ or \[...\]
        if (
          (token.startsWith('$$') && token.endsWith('$$') && token.length >= 4) ||
          (token.startsWith('\\[') && token.endsWith('\\]') && token.length >= 4)
        ) {
          const formula = token.startsWith('$$') ? token.slice(2, -2).trim() : token.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
              output: 'htmlAndMathml',
            });
            return (
              <span
                key={idx}
                style={{
                  display: 'block',
                  margin: '10px 0',
                  padding: '8px 14px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  overflowX: 'auto',
                  textAlign: 'center',
                  color: '#38bdf8',
                }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            return <code key={idx} style={{ color: '#38bdf8' }}>{token}</code>;
          }
        }

        // 2. Inline Math: $...$ or \(...\)
        if (
          (token.startsWith('$') && token.endsWith('$') && token.length >= 2) ||
          (token.startsWith('\\(') && token.endsWith('\\)') && token.length >= 4)
        ) {
          const formula = token.startsWith('$') ? token.slice(1, -1).trim() : token.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
              output: 'htmlAndMathml',
            });
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: '0 3px',
                  color: '#38bdf8',
                  verticalAlign: 'baseline',
                }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            return <code key={idx} style={{ color: '#38bdf8' }}>{token}</code>;
          }
        }

        // 3. Plain prose text
        return <span key={idx}>{token}</span>;
      })}
    </span>
  );
}
