import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Code, CheckCircle, XCircle, ChevronDown, ChevronUp, Bot } from 'lucide-react';

export default function AITutorChat({ circuitContext, activeTopic = "entanglement" }) {
  const [messages, setMessages] = useState([
    {
      sender: 'aura',
      text: "Hello! I am Aura Quantum AI, your intelligent co-pilot. Build any circuit on the canvas and ask me anything about state superposition, entanglement, Bloch angles, or algorithm proofs.",
      latex: null,
      code: null,
      quiz: null,
      sources: ["Gitwolves SIH 2026 Quantum Knowledge Base"]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);

    try {
      const resp = await fetch('http://localhost:8000/api/v1/ai-tutor/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: textToSend,
          active_circuit_context: circuitContext,
          current_topic: activeTopic
        })
      });

      const data = await resp.json();
      if (data && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'aura',
            text: data.vocal_prose_script,
            latex: data.mathematical_latex_formula,
            code: data.qiskit_executable_code,
            quiz: data.quiz_generation_object,
            sources: data.sources || []
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'aura',
            text: "I encountered a transient error querying the quantum reasoning service. Using verified offline heuristics to assist you.",
            latex: null,
            code: null,
            quiz: null,
            sources: []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'aura',
          text: "Quantum Tutor is currently operating in offline mode. Entangled qubits (|Phi+>) yield identical outcomes upon measurement with 100% correlation.",
          latex: "|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)",
          code: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)",
          quiz: null,
          sources: ["Local Quantum Physics Reference"]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerQuiz = (optionIdx, correctIdx) => {
    setSelectedQuizAnswer(optionIdx);
    if (optionIdx === correctIdx) {
      setQuizFeedback({ correct: true, text: "🎉 Outstanding! Correct quantum intuition." });
    } else {
      setQuizFeedback({ correct: false, text: "Incorrect. Re-examine the unitary transformation!" });
    }
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 18px',
          background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1), rgba(168, 85, 247, 0.15))',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '0.94rem', fontWeight: 700, background: 'linear-gradient(to right, #00f0ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Aura AI Quantum Tutor
          </h3>
          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', fontWeight: 600 }}>
            RAG Active
          </span>
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
          {/* Quick Prompt Chips */}
          <div style={{ padding: '8px 14px', display: 'flex', gap: '6px', overflowX: 'auto', borderBottom: '1px solid var(--border-subtle)' }}>
            {[
              "Explain current circuit",
              "Why is Bell State entangled?",
              "Grover quadratic speedup",
              "Bloch sphere coordinates"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(chip)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#00f0ff'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  background: m.sender === 'user' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(23, 29, 45, 0.85)',
                  border: `1px solid ${m.sender === 'user' ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.84rem',
                  lineHeight: '1.5'
                }}
              >
                {/* Message Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.72rem', color: m.sender === 'user' ? '#38bdf8' : '#a855f7', fontWeight: 700 }}>
                  {m.sender === 'user' ? 'You' : <><Bot size={13} /> Aura AI Tutor</>}
                </div>

                {/* Prose */}
                <p style={{ color: 'var(--text-primary)' }}>{m.text}</p>

                {/* LaTeX Formula */}
                {m.latex && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '6px',
                    borderLeft: '3px solid #00f0ff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#00f0ff'
                  }}>
                    {m.latex}
                  </div>
                )}

                {/* Executable Code */}
                {m.code && (
                  <div style={{
                    marginTop: '8px',
                    background: '#07090e',
                    borderRadius: '6px',
                    padding: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    overflowX: 'auto',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <pre style={{ margin: 0 }}>{m.code}</pre>
                  </div>
                )}

                {/* Generated Quiz */}
                {m.quiz && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: 'rgba(168, 85, 247, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px', color: '#e2e8f0' }}>
                      🧠 Quick Check: {m.quiz.question_string}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {m.quiz.options_array.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerQuiz(oIdx, m.quiz.valid_index_pointer)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            textAlign: 'left',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            background: selectedQuizAnswer === oIdx ?
                              (oIdx === m.quiz.valid_index_pointer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)') :
                              'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: '#fff'
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </button>
                      ))}
                    </div>
                    {quizFeedback && (
                      <div style={{ marginTop: '8px', fontSize: '0.76rem', color: quizFeedback.correct ? '#34d399' : '#f87171', fontWeight: 600 }}>
                        {quizFeedback.text}
                      </div>
                    )}
                  </div>
                )}

                {/* Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Sources: {m.sources.join(' • ')}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ fontSize: '0.78rem', color: '#00f0ff', padding: '6px', fontStyle: 'italic' }}>
                Aura AI is calculating state evolution & searching quantum literature...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask Aura AI about gates, math proofs, or algorithms..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                color: '#fff',
                outline: 'none'
              }}
            />
            <button className="btn btn-primary" onClick={() => handleSendQuery()} disabled={isLoading} style={{ padding: '8px 14px' }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
