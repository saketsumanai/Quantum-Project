import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, BookOpen, Bot, X, MessageSquare, ChevronRight, HelpCircle, Trash2 } from 'lucide-react';
import MathRenderer, { LatexBlock } from './MathRenderer';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AURA_MSG = {
  sender: 'aura',
  text: "Hello! I am your Quantum Chatbot co-pilot. Build any circuit on the canvas or explore modules, and ask me anything about state superposition, entanglement, Bloch angles, or Qiskit proofs.",
  latex: null,
  code: null,
  quiz: null,
  sources: ["Gitwolves SIH 2026 Quantum Knowledge Base"]
};

export default function AITutorChat({ circuitContext, activeTopic = "entanglement" }) {
  const { user, deleteUserChatHistory } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ql_copilot_chats_' + (user?.id || 'guest'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [DEFAULT_AURA_MSG];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const chatEndRef = useRef(null);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ql_copilot_chats_' + (user?.id || 'guest'), JSON.stringify(messages));
    } catch (_) {}
  }, [messages, user?.id]);

  // Sync on user change
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ql_copilot_chats_' + (user?.id || 'guest'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (_) {}
    setMessages([DEFAULT_AURA_MSG]);
  }, [user?.id]);

  // Listen for global chat history clear event
  useEffect(() => {
    const handleGlobalClear = () => {
      setMessages([DEFAULT_AURA_MSG]);
    };
    window.addEventListener('ql_chat_history_cleared', handleGlobalClear);
    return () => window.removeEventListener('ql_chat_history_cleared', handleGlobalClear);
  }, []);

  const handleClearCopilotChat = () => {
    deleteUserChatHistory();
    setMessages([DEFAULT_AURA_MSG]);
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
  };

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
          text: "Chatbot is operating in offline mode. Entangled qubits (|Φ+⟩) yield identical outcomes upon measurement with 100% correlation.",
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
      setQuizFeedback({ correct: true, text: "Outstanding! Correct quantum intuition." });
    } else {
      setQuizFeedback({ correct: false, text: "Incorrect. Re-examine the unitary transformation!" });
    }
  };

  return (
    <>
      {/* ── Global Floating Trigger Button (Bottom Right) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
        {/* Floating Tooltip Bubble */}
        {showTooltip && !isOpen && (
          <div
            style={{
              position: 'relative',
              background: 'rgba(10, 14, 23, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(15, 98, 254, 0.3)',
              borderRadius: '12px',
              padding: '10px 14px',
              maxWidth: '240px',
              backdropFilter: 'blur(16px)',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Quantum Chatbot
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
            <p
              onClick={() => setIsOpen(true)}
              style={{ fontSize: "0.82rem", color: "#ffffff", margin: 0, cursor: "pointer", lineHeight: 1.4 }}
            >
              If you need help, I am there to help you!
            </p>
          </div>
        )}

        {/* Round Floating Action Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isOpen ? 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' : 'linear-gradient(135deg, #0F62FE 0%, #0353e9 100%)',
            border: isOpen ? '1px solid rgba(255, 255, 255, 0.3)' : '2px solid #38bdf8',
            boxShadow: isOpen ? '0 4px 20px rgba(0, 0, 0, 0.8)' : '0 0 25px rgba(15, 98, 254, 0.6), 0 8px 24px rgba(0,0,0,0.8)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            if (!isOpen) e.currentTarget.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            if (!isOpen) e.currentTarget.style.boxShadow = '0 0 25px rgba(15, 98, 254, 0.6), 0 8px 24px rgba(0,0,0,0.8)';
          }}
        >
          {isOpen ? <X size={24} /> : <Bot size={26} />}
        </button>
      </div>

      {/* ── Slide-Over Drawer Panel (Takes 1/4 Screen on Right) ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            width: 'min(420px, 90vw)',
            height: '100vh',
            zIndex: 10000,
            background: 'rgba(10, 10, 12, 0.95)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(18, 18, 22, 0.9)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(15, 98, 254, 0.2)', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#38bdf8" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    Chatbot
                  </h3>
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(15, 98, 254, 0.2)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    RAG Active
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                  Quantum Intelligence Co-pilot
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleClearCopilotChat}
                title="Clear Chat History"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  color: '#f87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; }}
              >
                <Trash2 size={14} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', width: '32px', height: '32px', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#050505' }}>
            {[
              "Explain current circuit",
              "Why is Bell State entangled?",
              "Grover algorithm",
              "Bloch sphere coordinates"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(chip)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.color = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Scrollable Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#000000' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  background: m.sender === 'user' ?
                    'linear-gradient(135deg, #27272a 0%, #18181b 100%)' :
                    'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
                  border: `1px solid ${m.sender === 'user' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '0.86rem',
                  lineHeight: '1.55',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
                }}
              >
                {/* Message Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.72rem', color: m.sender === 'user' ? '#ffffff' : '#38bdf8', fontWeight: 700 }}>
                  {m.sender === 'user' ? 'You' : <><Bot size={13} color="#38bdf8" /> Chatbot AI</>}
                </div>

                {/* Prose Text */}
                <div style={{ color: m.sender === 'user' ? '#ffffff' : '#e2e8f0', margin: 0 }}>
                  <MathRenderer text={m.text} />
                </div>

                {/* LaTeX Formula */}
                {m.latex && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#050505',
                    borderRadius: '6px',
                    borderLeft: '3px solid #38bdf8',
                    color: '#38bdf8',
                  }}>
                    <LatexBlock math={m.latex} />
                  </div>
                )}

                {/* Executable Qiskit Code */}
                {m.code && (
                  <div style={{
                    marginTop: '8px',
                    background: '#05070c',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.76rem',
                    color: '#e2e8f0',
                    overflowX: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}>
                    <pre style={{ margin: 0 }}>{m.code}</pre>
                  </div>
                )}

                {/* Quiz Verification */}
                {m.quiz && (
                  <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(15, 98, 254, 0.1)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '8px', color: '#f8fafc' }}>
                      Concept Check: {m.quiz.question_string}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {m.quiz.options_array.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerQuiz(oIdx, m.quiz.valid_index_pointer)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            textAlign: 'left',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            background: selectedQuizAnswer === oIdx ?
                              (oIdx === m.quiz.valid_index_pointer ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)') :
                              'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${selectedQuizAnswer === oIdx ? (oIdx === m.quiz.valid_index_pointer ? '#34d399' : '#f87171') : 'rgba(255, 255, 255, 0.12)'}`,
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
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#71717a' }}>
                    <BookOpen size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Sources: {m.sources.join(' • ')}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', padding: '6px', fontStyle: 'italic' }}>
                Chatbot is searching literature & computing quantum state evolution...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Drawer Input Bar */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', gap: '8px', background: '#050505' }}>
            <input
              type="text"
              placeholder="Ask Chatbot about gates, formulas, code..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              style={{
                flex: 1,
                background: 'rgba(20, 20, 24, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.86rem',
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #0F62FE 0%, #0353e9 100%)',
                border: '1px solid #38bdf8',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
