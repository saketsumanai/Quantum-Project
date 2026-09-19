import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Upload, BookOpen, X,
  Sun, Moon, Cpu, Zap, Globe, AlertTriangle, Sparkles, Volume2, VolumeX, Edit2,
  Search, PanelLeftClose, PanelLeft, ArrowUpRight, ShieldCheck, Play, User, Terminal,
  Layers, Lightbulb, Compass, Award, ExternalLink, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MathRenderer, { LatexBlock } from './MathRenderer';
import QuantumVisualizer from './QuantumVisualizer';
import { INDIAN_LANGUAGES } from '../data/videoLecturesData';

const API = 'http://localhost:8000/api/v1';

// ── Models Supported ─────────────────────────────────────────────────────────
export const SUPPORTED_MODELS = [
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B Quantum',
    provider: 'Groq Cloud',
    description: 'Ultra-fast, high-precision physics, mathematical derivations & Qiskit 1.0 code.',
    badge: 'Fast & Precise',
    color: '#3b82f6',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B Reasoner',
    provider: 'Groq Cloud',
    description: '120 Billion parameter deep chain-of-thought model for complex multi-step proofs.',
    badge: 'Deep Reasoning',
    color: '#8b5cf6',
  },
  {
    id: 'groq/compound',
    name: 'Groq Compound Agent',
    provider: 'Groq Cloud',
    description: 'Compound multi-agent model optimized for quantum algorithms and tool routing.',
    badge: 'Agentic',
    color: '#10b981',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B Turbo',
    provider: 'Groq Cloud',
    description: 'Lightweight, near-instant responses for rapid Q&A and concept definitions.',
    badge: 'Turbo',
    color: '#f59e0b',
  },
  {
    id: 'failsafe',
    name: 'Gitwolves Physics Engine',
    provider: 'Deterministic Core',
    description: 'Guaranteed offline verified ground truth from 76 peer-reviewed quantum treatises.',
    badge: 'Verified Failsafe',
    color: '#ec4899',
  },
];

// ── Project Categories ────────────────────────────────────────────────────────
export const PROJECT_CATEGORIES = [
  { id: 'all', name: 'All Chats', icon: Compass },
  { id: 'algorithms', name: 'Quantum Algorithms', icon: Zap },
  { id: 'circuits', name: 'Circuit Design & Qiskit', icon: Terminal },
  { id: 'entanglement', name: 'Entanglement & Bell', icon: Layers },
  { id: 'hardware', name: 'Hardware & QPUs', icon: Cpu },
  { id: 'chemistry', name: 'VQE & Chemistry', icon: Lightbulb },
];

// ── Multilingual Starters ────────────────────────────────────────────────────
export const MULTILINGUAL_STARTERS = {
  en: [
    { title: "Superposition with Analogy & Circuit", query: "Explain quantum superposition with an intuitive analogy, Qiskit 1.0+ code, and generate a circuit diagram" },
    { title: "Bell State & Entanglement Proof", query: "What are Bell states? Explain quantum entanglement, mathematical formulation, and draw the Bell state circuit" },
    { title: "Grover's Search Step-by-Step", query: "Walk me through Grover's algorithm with oracle and diffusion operator, and draw the circuit schematic" },
    { title: "Quantum Fourier Transform (QFT)", query: "Derive the Quantum Fourier Transform (QFT) mathematically and show its circuit implementation" },
    { title: "VQE for Molecular Ground State", query: "How does the Variational Quantum Eigensolver (VQE) work for finding molecular ground states?" },
    { title: "Bloch Sphere State Visualization", query: "Explain how single-qubit states are mapped on the Bloch sphere and generate a Bloch sphere diagram for |+⟩" },
  ],
  hi: [
    { title: "सुपरपोज़िशन और क्वांटम सर्किट", query: "क्वांटम सुपरपोज़िशन (Superposition) को एक सरल उदाहरण, Qiskit कोड और सर्किट डायग्राम के साथ समझाएं" },
    { title: "बेल स्टेट्स और एंटैंगलमेंट", query: "बेल स्टेट्स (Bell States) क्या हैं? क्वांटम एंटैंगलमेंट कैसे काम करता है? सर्किट डायग्राम भी बनाएं" },
    { title: "ग्रोवर का सर्च एल्गोरिदम", query: "ग्रोवर का सर्च एल्गोरिदम (Grover's Search Algorithm) चरण-दर-चरण समझाएं और इसका सर्किट दिखाएं" },
    { title: "बलोच स्फीयर का सिद्धांत", query: "बलोच स्फीयर (Bloch Sphere) पर क्यूबिट स्टेट्स कैसे दर्शाई जाती हैं? बलोच स्फीयर डायग्राम बनाएं" },
  ],
  hinglish: [
    { title: "Superposition & Entanglement Guide", query: "Superposition aur Entanglement simple words me explain karo with Qiskit 1.0 code and circuit diagram" },
    { title: "Bell States & EPR Paradox", query: "Bell states kya hoti hain aur Einstein ka EPR paradox kya hai? Draw circuit diagram" },
    { title: "Grover's Algorithm with Circuit", query: "Grover's search algorithm step-by-step explain karo with oracle and diffusion operator circuit" },
    { title: "Bloch Sphere Visualization", query: "Bloch sphere par qubit states aur rotations kaise visualize hoti hain? Generate diagram for |+> state" },
  ],
  ta: [
    { title: "குவாண்டம் சூப்பர்பொசிஷன்", query: "குவாண்டம் சூப்பர்பொசிஷன் (Superposition) என்றால் என்ன? எளிய தமிழில் விளக்கி சர்க்யூட் வரைபடம் உருவாக்கவும்" },
    { title: "குவாண்டம் என்டேங்கிள்மென்ட்", query: "குவாண்டம் என்டேங்கிள்மென்ட் மற்றும் பெல் நிலைகள் பற்றி விளக்கி வரைபடம் காட்டவும்" },
  ],
  te: [
    { title: "క్వాంటమ్ సూపర్ పొజిషన్", query: "క్వాంటమ్ సూపర్ పొజిషన్ (Superposition) అంటే ఏమిటి? ఉదాహరణతో సర్క్యూట్ రేఖాచిత్రం చూపించండి" },
    { title: "క్వాంటమ్ ఎంటాంగిల్మెంట్", query: "క్వాంటమ్ ఎంటాంగిల్మెంట్ మరియు బెల్ స్థితులు (Bell States) ఎలా పనిచేస్తాయి?" },
  ],
  bn: [
    { title: "কোয়ান্টাম সুপারপজিশন", query: "কোয়ান্টাম সুপারপজিশন সহজ ভাষায় উদাহরণসহ ব্যাখ্যা করুন এবং সার্কিট ডায়াগ্রাম তৈরি করুন" },
  ],
  mr: [
    { title: "क्वांटम सुपरपोझिशन", query: "क्वांटम सुपरपोझिशन सोप्या मराठीत उदाहरणासह स्पष्ट करा आणि सर्किट डायग्राम दाखवा" },
  ],
  gu: [
    { title: "ક્વોન્ટમ સુપરપોઝિશન", query: "ક્વોન્ટમ સુપરપોઝિશન સરળ ગુજરાતીમાં સમજાવો અને સર્કિટ ડાયાગ્રામ બનાવો" },
  ],
  kn: [
    { title: "ಕ್ವಾಂಟಮ್ ಸೂಪರ್‌ಪೊಸಿಷನ್", query: "ಕ್ವಾಂಟಮ್ ಸೂಪರ್‌ಪೊಸಿಷನ್ ಪರಿಕಲ್ಪನೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ ಮತ್ತು ಸರ್ಕ್ಯೂಟ್ ರೇಖಾಚಿತ್ರ ತೋರಿಸಿ" },
  ],
  ml: [
    { title: "ക്വാണ്ടം സൂപ്പർപോസിഷൻ", query: "ക്വാണ്ടം സൂപ്പർപോസിഷൻ മലയാളത്തിൽ ലളിതമായി വിശദീകരിക്കുക" },
  ],
  pa: [
    { title: "ਕੁਆਂਟਮ ਸੁਪਰਪੋਜ਼ੀਸ਼ਨ", query: "ਕੁਆਂਟਮ ਸੁਪਰਪੋਜ਼ੀਸ਼ਨ ਨੂੰ ਸਰਲ ਸ਼ਬਦਾਂ ਵਿੱਚ ਸਮਝਾਓ ਅਤੇ ਸਰਕਟ ਡਾਇਗ੍ਰਾਮ ਬਣਾਓ" },
  ],
};

// ── Code Block with Copy & Studio Action ─────────────────────────────────────
function CodeBlock({ code, language = 'python', onOpenInStudio }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenStudio = () => {
    if (!onOpenInStudio) return;
    // Basic parser for quick circuit loading if Qiskit
    const hMatches = [...code.matchAll(/qc\.h\((\d+)\)/g)].map(m => ({ gate: 'h', qubits: [parseInt(m[1])], params: [] }));
    const cxMatches = [...code.matchAll(/qc\.cx\((\d+),\s*(\d+)\)/g)].map(m => ({ gate: 'cx', qubits: [parseInt(m[1]), parseInt(m[2])], params: [] }));
    const xMatches = [...code.matchAll(/qc\.x\((\d+)\)/g)].map(m => ({ gate: 'x', qubits: [parseInt(m[1])], params: [] }));
    const zMatches = [...code.matchAll(/qc\.z\((\d+)\)/g)].map(m => ({ gate: 'z', qubits: [parseInt(m[1])], params: [] }));
    const insts = [...hMatches, ...cxMatches, ...xMatches, ...zMatches];
    if (insts.length > 0) {
      const maxQ = Math.max(...insts.flatMap(i => i.qubits)) + 1;
      onOpenInStudio({ num_qubits: Math.max(2, maxQ), instructions: insts });
    }
  };

  return (
    <div style={{ margin: '14px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0b0f19' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={12} color="#38bdf8" />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>{language}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenInStudio && code.includes('QuantumCircuit') && (
            <button
              onClick={handleOpenStudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '0.7rem',
                padding: '3px 8px',
                borderRadius: 4,
                fontWeight: 500,
              }}
            >
              <ArrowUpRight size={11} /> Open in Studio
            </button>
          )}
          <button
            onClick={copy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '0.72rem',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {copied ? <><Check size={12} color="#10b981" />Copied</> : <><Copy size={12} />Copy</>}
          </button>
        </div>
      </div>
      <pre style={{ padding: '14px 16px', margin: 0, overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.80rem', lineHeight: 1.65, color: '#e2e8f0', background: '#0a0f1d' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Inline Quiz Widget ─────────────────────────────────────────────────────────
function InlineQuiz({ quiz }) {
  const [sel, setSel] = useState(null);
  const [revealed, setRevealed] = useState(false);
  if (!quiz?.question_string) return null;
  const correct = quiz.valid_index_pointer;
  const isRight = sel === correct;

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.12), rgba(15, 23, 42, 0.3))',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      borderRadius: 10,
      padding: 16,
      margin: '16px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <HelpCircle size={13} /> Conceptual Quick Check
      </div>
      <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
        <MathRenderer content={quiz.question_string} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(quiz.options_array || []).map((opt, i) => {
          let bg = 'rgba(255,255,255,0.03)', border = '1px solid rgba(255,255,255,0.08)', color = 'var(--text-secondary)';
          if (revealed) {
            if (i === correct) { bg = 'rgba(16,185,129,0.15)'; border = '1px solid #10b981'; color = '#10b981'; }
            else if (i === sel) { bg = 'rgba(244,63,94,0.15)'; border = '1px solid #f43f5e'; color = '#f87171'; }
          } else if (i === sel) {
            bg = 'rgba(59,130,246,0.18)'; border = '1px solid #3b82f6'; color = '#93c5fd';
          }
          return (
            <button
              key={i}
              onClick={() => !revealed && setSel(i)}
              style={{
                textAlign: 'left',
                background: bg,
                border,
                borderRadius: 6,
                padding: '9px 12px',
                cursor: revealed ? 'default' : 'pointer',
                color,
                fontSize: '0.84rem',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <b style={{ marginRight: 8, fontFamily: "'JetBrains Mono', monospace" }}>{String.fromCharCode(65 + i)}.</b>
              <MathRenderer content={opt} style={{ display: 'inline' }} />
            </button>
          );
        })}
      </div>
      {sel !== null && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          style={{
            marginTop: 12,
            padding: '7px 16px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          Check Answer
        </button>
      )}
      {revealed && (
        <div style={{ marginTop: 12, fontSize: '0.84rem', color: isRight ? '#10b981' : '#f87171', fontWeight: 600 }}>
          {isRight ? '✓ Correct! Excellent conceptual grasp.' : `✗ Incorrect — Correct Answer is ${String.fromCharCode(65 + correct)}`}
          {quiz.explanation && (
            <div style={{ marginTop: 6, color: '#94a3b8', fontWeight: 400, fontSize: '0.8rem', lineHeight: 1.5 }}>
              <MathRenderer content={quiz.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Text-to-Speech Audio Player ────────────────────────────────────────────────
function AudioReader({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const clean = text.replace(/<[^>]*>/g, '').replace(/[\$\*\#]/g, '').slice(0, 1000);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={togglePlay}
      title={isPlaying ? 'Stop Voice' : 'Listen with Voice'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: isPlaying ? 'rgba(59, 130, 246, 0.2)' : 'none',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '5px',
        padding: '3px 8px',
        cursor: 'pointer',
        color: isPlaying ? '#60a5fa' : '#94a3b8',
        fontSize: '0.72rem',
      }}
    >
      {isPlaying ? <><VolumeX size={12} /> Stop</> : <><Volume2 size={12} /> Read</>}
    </button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onOpenInStudio }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(msg.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 22, gap: 12 }}>
      {!isUser && (
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#fff',
          marginTop: 2,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
        }}>
          Q
        </div>
      )}

      <div style={{ maxWidth: isUser ? '72%' : '88%' }}>
        {isUser ? (
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            color: '#ffffff',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 18px',
            fontSize: '0.90rem',
            lineHeight: 1.6,
            boxShadow: '0 4px 16px rgba(29, 78, 216, 0.25)',
          }}>
            {msg.content}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-surface-elevated, #111827)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px 16px 16px 16px',
            padding: '18px 20px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          }}>
            {/* Assistant Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {msg.model && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    color: '#60a5fa',
                    fontWeight: 600,
                  }}>
                    <Cpu size={10} /> {msg.model}
                  </span>
                )}
                {msg.ragActive && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    color: '#34d399',
                    fontWeight: 600,
                  }}>
                    <Zap size={10} /> 18K RAG Passages
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AudioReader text={msg.content} />
                <button
                  onClick={copyMarkdown}
                  title="Copy full response"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '5px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copied ? <><Check size={11} color="#10b981" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Main Explanation Prose */}
            <div style={{ fontSize: '0.90rem', lineHeight: 1.7, color: 'var(--text-primary, #f3f4f6)' }}>
              <MathRenderer content={msg.content} />
            </div>

            {/* Mathematical LaTeX Formula */}
            {msg.latex && msg.latex.length > 3 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '0 8px 8px 0',
                padding: '12px 16px',
                margin: '14px 0',
                overflowX: 'auto',
              }}>
                <LatexBlock tex={msg.latex} display={true} />
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                  Exact Mathematical Formulation
                </div>
              </div>
            )}

            {/* Interactive Quantum Diagram / Image Generation */}
            {msg.diagram && (
              <QuantumVisualizer
                diagram={msg.diagram}
                onOpenInStudio={(diag) => {
                  if (onOpenInStudio && diag.gates) {
                    onOpenInStudio({
                      num_qubits: diag.num_qubits || 2,
                      instructions: diag.gates.map(g => ({
                        gate: (g.gate || 'h').toLowerCase(),
                        qubits: g.qubits || [g.qubit || 0],
                        params: [],
                      })),
                    });
                  }
                }}
              />
            )}

            {/* Qiskit Executable Code */}
            {msg.code && msg.code.trim().length > 10 && (
              <CodeBlock code={msg.code} onOpenInStudio={onOpenInStudio} />
            )}

            {/* Quick Check Socratic Quiz */}
            {msg.quiz && <InlineQuiz quiz={msg.quiz} />}

            {/* Literature Sources Panel */}
            {msg.sources && msg.sources.filter(s => !s.startsWith('Model:')).length > 0 && (
              <SourcesAccordion sources={msg.sources.filter(s => !s.startsWith('Model:'))} />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#94a3b8',
          marginTop: 2,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          U
        </div>
      )}
    </div>
  );
}

// ── Literature Sources Accordion ──────────────────────────────────────────────
function SourcesAccordion({ sources }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          fontSize: '0.72rem',
          padding: 0,
        }}
      >
        <BookOpen size={12} color="#60a5fa" />
        <span>{sources.length} Literature Source{sources.length > 1 ? 's' : ''} (76-Book Library)</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid rgba(59, 130, 246, 0.3)' }}>
          {sources.map((s, i) => (
            <div key={i} style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '3px 0' }}>
              · {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main QuantumChatGPT Component ─────────────────────────────────────────────
export default function QuantumChatGPT({
  theme,
  onToggleTheme,
  initialQuery = '',
  initialLanguage = 'en',
  onNavigate,
  onLoadCircuitIntoStudio,
}) {
  const { user, deleteUserChatHistory } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [selectedModel, setSelectedModel] = useState(SUPPORTED_MODELS[0].id);
  const [generateDiagram, setGenerateDiagram] = useState(false);
  const [activeProject, setActiveProject] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Conversation Sessions (per user ID)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('ql_ai_chats_' + (user?.id || 'guest'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [{ id: '1', title: 'New conversation', project: 'all', messages: [], ts: Date.now() }];
  });

  const [activeId, setActiveId] = useState(() => sessions[0]?.id || '1');
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ql_ai_chats_' + (user?.id || 'guest'), JSON.stringify(sessions));
    } catch (_) {}
  }, [sessions, user?.id]);

  // Handle user change
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ql_ai_chats_' + (user?.id || 'guest'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      }
    } catch (_) {}
    const initial = [{ id: '1', title: 'New conversation', project: 'all', messages: [], ts: Date.now() }];
    setSessions(initial);
    setActiveId('1');
  }, [user?.id]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, loading]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];
  const messages = activeSession?.messages || [];

  const handleNewChat = (proj = 'all') => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: 'New conversation',
      project: proj,
      messages: [],
      ts: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveId(newId);
    setInput('');
    setIsMobileMenuOpen(false);
  };

  const handleDeleteSession = (id, e) => {
    e?.stopPropagation();
    if (sessions.length <= 1) {
      handleClearAllHistory();
      return;
    }
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeId === id) {
      setActiveId(filtered[0].id);
    }
  };

  const handleClearAllHistory = () => {
    deleteUserChatHistory();
    const fresh = [{ id: '1', title: 'New conversation', project: 'all', messages: [], ts: Date.now() }];
    setSessions(fresh);
    setActiveId('1');
    setConfirmClearAll(false);
  };

  const startRenameSession = (s, e) => {
    e?.stopPropagation();
    setEditingSessionId(s.id);
    setEditingTitle(s.title);
  };

  const saveRenameSession = (id) => {
    if (editingTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editingTitle.trim() } : s));
    }
    setEditingSessionId(null);
  };

  const sendMessage = useCallback(async (textOverride) => {
    const text = textOverride || input.trim();
    if (!text) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg = { role: 'user', content: text, id: Date.now() };
    const updatedMessages = [...messages, userMsg];

    // Determine auto-title if first message
    const newTitle = messages.length === 0 ? (text.slice(0, 36) + (text.length > 36 ? '…' : '')) : activeSession.title;

    setSessions(prev => prev.map(s => s.id === activeId ? {
      ...s,
      messages: updatedMessages,
      title: newTitle,
      ts: Date.now(),
    } : s));

    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || '',
      }));

      const resp = await fetch(`${API}/ai-tutor/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: text,
          active_circuit_context: {},
          current_topic: '',
          conversation_history: history,
          language: selectedLanguage,
          model: selectedModel,
          generate_diagram: generateDiagram,
        }),
      });

      const data = await resp.json();

      if (data?.success) {
        const assistantMsg = {
          role: 'assistant',
          id: Date.now() + 1,
          content: data.vocal_prose_script || 'I have analyzed your quantum question.',
          latex: data.mathematical_latex_formula || null,
          code: data.qiskit_executable_code || null,
          diagram: data.diagram || null,
          quiz: data.quiz_generation_object || null,
          sources: data.sources || [],
          model: data.model_used || (SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || 'Qwen 3.8 27B'),
          ragActive: !data.is_cached_fallback,
        };

        setSessions(prev => prev.map(s => s.id === activeId ? {
          ...s,
          messages: [...updatedMessages, assistantMsg],
          ts: Date.now(),
        } : s));
      } else {
        throw new Error(data?.detail?.message || 'Failed to query quantum model');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        role: 'assistant',
        id: Date.now() + 1,
        content: `**Error connecting to AI Tutor**: ${err.message || 'Please check your connection and Groq API key.'}`,
        latex: null,
        code: null,
        sources: ['Gitwolves Fallback Engine'],
        model: 'Failsafe Core',
      };
      setSessions(prev => prev.map(s => s.id === activeId ? {
        ...s,
        messages: [...updatedMessages, errorMsg],
      } : s));
    } finally {
      setLoading(false);
    }
  }, [input, messages, activeId, activeSession, selectedLanguage, selectedModel, generateDiagram]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    const matchesProject = activeProject === 'all' || s.project === activeProject;
    const matchesSearch = !searchFilter || s.title.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Group by Time: Today, Yesterday, Older
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const todaySessions = filteredSessions.filter(s => (now - s.ts) < ONE_DAY);
  const yesterdaySessions = filteredSessions.filter(s => (now - s.ts) >= ONE_DAY && (now - s.ts) < (2 * ONE_DAY));
  const olderSessions = filteredSessions.filter(s => (now - s.ts) >= (2 * ONE_DAY));

  const currentStarters = MULTILINGUAL_STARTERS[selectedLanguage] || MULTILINGUAL_STARTERS.en;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      background: '#0a0f1d',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)',
      overflow: 'hidden',
    }}>
      {/* ── Mobile Header ── */}
      <div style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }} className="ql-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#f3f4f6', cursor: 'pointer' }}
          >
            <PanelLeft size={20} />
          </button>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f3f4f6' }}>Aura Quantum AI</div>
        </div>
        <button
          onClick={() => handleNewChat()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <Plus size={14} /> New
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: isSidebarOpen ? '320px' : '0px',
          minWidth: isSidebarOpen ? '320px' : '0px',
          background: '#0d1326',
          borderRight: isSidebarOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s ease',
          overflow: 'hidden',
          zIndex: 30,
        }}>
          {/* Sidebar Header: Logo & New Chat */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Aura Quantum AI
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 600, letterSpacing: '0.04em' }}>
                    MULTI-MODEL TUTOR
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                title="Collapse sidebar"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            {/* Primary New Chat Button */}
            <button
              onClick={() => handleNewChat(activeProject)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.84rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                <span>New Conversation</span>
              </div>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.68rem',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                ⌘K
              </span>
            </button>
          </div>

          {/* Model Selector Card */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active Quantum Model
              </span>
              <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Live
              </span>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                background: '#161f38',
                color: '#f3f4f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.80rem',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              {SUPPORTED_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 5, lineHeight: 1.4 }}>
              {SUPPORTED_MODELS.find(m => m.id === selectedModel)?.description}
            </div>
          </div>

          {/* Project Sections Filter */}
          <div style={{ padding: '12px 16px 6px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Projects &amp; Focus
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {PROJECT_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const active = activeProject === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveProject(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      background: active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#60a5fa' : '#94a3b8',
                      border: active ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                  >
                    <Icon size={11} /> {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search History */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#161f38',
              borderRadius: '6px',
              padding: '6px 10px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Search size={13} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter chats..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f3f4f6',
                  fontSize: '0.78rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
              {searchFilter && (
                <button onClick={() => setSearchFilter('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation History List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {filteredSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.78rem' }}>
                No conversations found in this project.
              </div>
            ) : (
              <>
                {todaySessions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px' }}>
                      Today
                    </div>
                    {todaySessions.map(s => renderSessionItem(s))}
                  </div>
                )}
                {yesterdaySessions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px' }}>
                      Yesterday
                    </div>
                    {yesterdaySessions.map(s => renderSessionItem(s))}
                  </div>
                )}
                {olderSessions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px' }}>
                      Older
                    </div>
                    {olderSessions.map(s => renderSessionItem(s))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Quick Navigation Links */}
          {onNavigate && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                Platform Quick Jump
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => onNavigate('studio')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    textAlign: 'left',
                  }}
                >
                  <Terminal size={11} color="#60a5fa" /> Circuit Studio
                </button>
                <button
                  onClick={() => onNavigate('learning')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    textAlign: 'left',
                  }}
                >
                  <BookOpen size={11} color="#34d399" /> Learning Hub
                </button>
                <button
                  onClick={() => onNavigate('videos')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    textAlign: 'left',
                  }}
                >
                  <Play size={11} color="#f59e0b" /> Video Hub
                </button>
                <button
                  onClick={() => onNavigate('assessment')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    textAlign: 'left',
                  }}
                >
                  <Award size={11} color="#ec4899" /> Test Center
                </button>
              </div>
            </div>
          )}

          {/* User Panel (Bottom) */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: '#090d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user?.photoURL ? `url(${user.photoURL}) center/cover` : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fff',
              }}>
                {!user?.photoURL && (user?.displayName?.[0] || 'U')}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {user?.displayName || 'Quantum Student'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={10} /> Quantum Scholar Pro
                </div>
              </div>
            </div>

            {/* Clear History Trigger */}
            <button
              onClick={() => setConfirmClearAll(true)}
              title="Clear all conversation history"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </aside>

        {/* ── Main Chat Area ── */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: '#0a0f1d',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Main Area Top Navigation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(11, 15, 29, 0.8)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  title="Open sidebar"
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                >
                  <PanelLeft size={18} />
                </button>
              )}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f3f4f6' }}>
                  {activeSession.title}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Model: <b style={{ color: '#60a5fa' }}>{SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name}</b></span>
                  <span>·</span>
                  <span>Lang: <b style={{ color: '#34d399' }}>{INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English'}</b></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Selector Pill */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {INDIAN_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} style={{ background: '#111827', color: '#f3f4f6' }}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>

              {/* Diagram Toggle Button */}
              <button
                onClick={() => setGenerateDiagram(!generateDiagram)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  background: generateDiagram ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: generateDiagram ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                  color: generateDiagram ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={12} color={generateDiagram ? '#60a5fa' : '#94a3b8'} />
                Diagram: {generateDiagram ? 'ON' : 'OFF'}
              </button>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  title="Toggle Theme"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
          }}>
            {messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div style={{
                maxWidth: '820px',
                margin: '30px auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(37, 99, 235, 0.45)',
                  marginBottom: '18px',
                }}>
                  <Sparkles size={28} color="#fff" />
                </div>

                <h1 style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '8px',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #ffffff 40%, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  What quantum breakthrough will we explore?
                </h1>

                <p style={{
                  fontSize: '0.92rem',
                  color: '#94a3b8',
                  maxWidth: '560px',
                  lineHeight: 1.6,
                  marginBottom: '26px',
                }}>
                  Powered by multi-model quantum reasoning (Qwen 3.8 27B &amp; GPT-OSS 120B), 18,800+ indexed textbook chapters, and automatic SVG quantum circuit generation.
                </p>

                {/* Quick Action Prompt Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                  width: '100%',
                  textAlign: 'left',
                }}>
                  {currentStarters.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => sendMessage(item.query)}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f3f4f6' }}>{item.title}</span>
                        <ArrowUpRight size={14} color="#60a5fa" />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {item.query.slice(0, 75)}…
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Stream */
              <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onOpenInStudio={onLoadCircuitIntoStudio}
                  />
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderTopColor: '#fff',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    </div>
                    <div style={{
                      background: 'var(--bg-surface-elevated, #111827)',
                      borderRadius: '4px 14px 14px 14px',
                      padding: '12px 18px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: '0.84rem',
                      color: '#94a3b8',
                    }}>
                      Aura is formulating quantum proof, synthesizing Qiskit circuit &amp; diagram…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Chat Input Area ── */}
          <div style={{
            padding: '16px 24px 20px 24px',
            background: 'linear-gradient(180deg, rgba(10, 15, 29, 0) 0%, rgba(10, 15, 29, 0.95) 30%, #0a0f1d 100%)',
          }}>
            <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
              {/* Quick Action Chips */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
                <button
                  onClick={() => { setGenerateDiagram(true); sendMessage("Build a Bell state circuit in Qiskit 1.0 and generate circuit diagram"); }}
                  style={chipStyle}
                >
                  ⚡ Bell State Circuit
                </button>
                <button
                  onClick={() => sendMessage("Derive the Quantum Fourier Transform mathematically and explain each step")}
                  style={chipStyle}
                >
                  📐 Derive QFT
                </button>
                <button
                  onClick={() => { setGenerateDiagram(true); sendMessage("Generate a Bloch sphere diagram for state |+> and explain the angles"); }}
                  style={chipStyle}
                >
                  🖼️ Bloch Sphere Diagram
                </button>
                <button
                  onClick={() => sendMessage("Explain Grover's search algorithm with a simple analogy for a high school student")}
                  style={chipStyle}
                >
                  💡 Intuitive Analogy
                </button>
                <button
                  onClick={() => sendMessage("Give me a challenging multiple choice quiz on quantum error correction")}
                  style={chipStyle}
                >
                  ❓ Quiz My Knowledge
                </button>
              </div>

              {/* Main Input Box */}
              <div style={{
                background: '#111827',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask Aura Quantum AI anything in ${INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English'}... (Shift+Enter for new line)`}
                  rows={1}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#f3f4f6',
                    fontSize: '0.90rem',
                    lineHeight: 1.5,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Bottom Toolbar inside Input */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setInput(prev => `${prev} [Attached File: ${file.name}] `);
                        }
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach notes or circuit diagram image"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      <Upload size={16} />
                    </button>

                    <button
                      onClick={() => setGenerateDiagram(!generateDiagram)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: generateDiagram ? 'rgba(59, 130, 246, 0.2)' : 'none',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: generateDiagram ? '#60a5fa' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      <Sparkles size={11} />
                      {generateDiagram ? 'Diagram ON' : '+ Add Diagram'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Enter to send · Shift+Enter for newline
                    </span>
                    <button
                      onClick={() => sendMessage()}
                      disabled={loading || !input.trim()}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: input.trim() ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(255,255,255,0.06)',
                        color: input.trim() ? '#fff' : '#64748b',
                        border: 'none',
                        cursor: input.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Clear All History Confirmation Modal ── */}
      {confirmClearAll && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#ef4444' }}>
              <AlertTriangle size={22} />
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Clear All Conversations?</div>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 20 }}>
              This will permanently delete all your quantum chat history from this device and your cloud profile. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setConfirmClearAll(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllHistory}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Style */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .ql-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );

  // Helper function to render a session in sidebar list
  function renderSessionItem(s) {
    const isActive = s.id === activeId;
    const isEditing = editingSessionId === s.id;

    return (
      <div
        key={s.id}
        onClick={() => {
          if (!isEditing) {
            setActiveId(s.id);
            setIsMobileMenuOpen(false);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '6px',
          marginBottom: '3px',
          background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.1s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
          <Sparkles size={12} color={isActive ? '#60a5fa' : '#64748b'} />
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveRenameSession(s.id)}
              onKeyDown={(e) => e.key === 'Enter' && saveRenameSession(s.id)}
              autoFocus
              style={{
                background: '#161f38',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                color: '#fff',
                padding: '2px 6px',
                fontSize: '0.78rem',
                outline: 'none',
                width: '100%',
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.80rem',
              color: isActive ? '#ffffff' : '#94a3b8',
              fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {s.title}
            </span>
          )}
        </div>

        {/* Action icons on hover or active */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={(e) => startRenameSession(s, e)}
            title="Rename"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 2,
              display: isActive ? 'block' : 'none',
            }}
          >
            <Edit2 size={11} />
          </button>
          <button
            onClick={(e) => handleDeleteSession(s.id, e)}
            title="Delete conversation"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 2,
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }
}

const chipStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '4px 12px',
  color: '#94a3b8',
  fontSize: '0.72rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};
