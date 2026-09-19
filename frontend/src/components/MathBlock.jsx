import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathBlock({ math, inline = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        // Clean up unescaped single backslashes or formatting issues if any
        let cleanMath = math.trim();

        // Strip surrounding $$ or \[ \] if present
        if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
          cleanMath = cleanMath.slice(2, -2).trim();
        } else if (cleanMath.startsWith('\\[') && cleanMath.endsWith('\\]')) {
          cleanMath = cleanMath.slice(2, -2).trim();
        } else if (cleanMath.startsWith('\\(') && cleanMath.endsWith('\\)')) {
          cleanMath = cleanMath.slice(2, -2).trim();
        }

        katex.render(cleanMath, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        if (containerRef.current) {
          containerRef.current.textContent = math;
        }
      }
    }
  }, [math, inline]);

  if (!math) return null;

  return (
    <div
      style={{
        marginTop: '8px',
        padding: inline ? '2px 6px' : '10px 14px',
        background: 'rgba(15, 98, 254, 0.08)',
        borderRadius: '6px',
        borderLeft: '3px solid #38bdf8',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        overflowX: 'auto',
        color: '#38bdf8',
        fontSize: inline ? '0.88rem' : '0.95rem',
      }}
    >
      <span ref={containerRef} />
    </div>
  );
}
