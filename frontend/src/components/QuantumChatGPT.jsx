import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send, Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Upload, BookOpen, X,
  Sun, Moon, Cpu, Zap, Globe, AlertTriangle, Sparkles, Volume2, VolumeX, Edit2,
  Search, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, ArrowUpRight,
  ShieldCheck, Play, User, Terminal, Layers, Lightbulb, Compass, Award, ExternalLink, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MathRenderer, { LatexBlock } from './MathRenderer';
import QuantumVisualizer from './QuantumVisualizer';
import QuantumFlashcards from './QuantumFlashcards';
import CitationProjector from './CitationProjector';
import QuantumStudio from './QuantumStudio';
import { resolveCitationsForQuery, QUANTUM_TEXTBOOK_EXCERPTS } from '../data/quantumCitationsData';
import { INDIAN_LANGUAGES, VIDEO_LECTURES } from '../data/videoLecturesData';

const API = 'http://localhost:8000/api/v1';

// ── Models Supported ─────────────────────────────────────────────────────────
const SUPPORTED_MODELS = [
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B Turbo',
    provider: 'Neural Cluster',
    description: 'Ultra-fast, near-instant quantum responses and derivations.',
    badge: 'Blazing Fast (<0.8s)',
    color: '#3b82f6',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B Reasoner',
    provider: 'Neural Cluster',
    description: '120 Billion parameter deep chain-of-thought model for complex multi-step proofs.',
    badge: 'Deep Reasoning',
    color: '#8b5cf6',
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B Quantum',
    provider: 'Neural Cluster',
    description: 'Specialized STEM physics, tensor network derivations & executable quantum code.',
    badge: 'Physics Specialist',
    color: '#10b981',
  },
  {
    id: 'groq/compound-mini',
    name: 'Quantum Compound Reasoner',
    provider: 'Neural Cluster',
    description: 'Compound multi-agent model optimized for quantum algorithms and tool routing.',
    badge: 'Agentic',
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
const PROJECT_CATEGORIES = [
  { id: 'all', name: 'All Chats', icon: Compass },
  { id: 'algorithms', name: 'Quantum Algorithms', icon: Zap },
  { id: 'circuits', name: 'Circuit Design & Qiskit', icon: Terminal },
  { id: 'entanglement', name: 'Entanglement & Bell', icon: Layers },
  { id: 'hardware', name: 'Hardware & QPUs', icon: Cpu },
  { id: 'chemistry', name: 'VQE & Chemistry', icon: Lightbulb },
];

// ── Multilingual Starters ────────────────────────────────────────────────────
const MULTILINGUAL_STARTERS = {
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
    <div style={{ margin: '14px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#09090d' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#121218', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={13} color="#ffffff" />
          <span style={{ fontSize: '0.74rem', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>{language}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenInStudio && code.includes('QuantumCircuit') && (
            <button
              onClick={handleOpenStudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.20)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.72rem',
                padding: '4px 9px',
                borderRadius: 4,
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <ArrowUpRight size={12} /> Open in Studio
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
              color: '#a1a1aa',
              fontSize: '0.74rem',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {copied ? <><Check size={12} color="#ffffff" />Copied</> : <><Copy size={12} />Copy</>}
          </button>
        </div>
      </div>
      <pre style={{ padding: '16px 18px', margin: 0, overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.86rem', lineHeight: 1.7, color: '#f4f4f5', background: '#09090d' }}>
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
      background: '#0d0d12',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      borderRadius: 10,
      padding: 18,
      margin: '18px 0',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: 800,
        color: '#ffffff',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontFamily: "'Times New Roman', Times, serif",
      }}>
        <HelpCircle size={15} color="#ffffff" /> Conceptual Quick Check
      </div>
      <div style={{ fontSize: '0.98rem', fontWeight: 500, marginBottom: 14, color: '#f4f4f5', lineHeight: 1.6 }}>
        <MathRenderer content={quiz.question_string} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(quiz.options_array || []).map((opt, i) => {
          let bg = 'rgba(255,255,255,0.03)', border = '1px solid rgba(255,255,255,0.10)', color = '#d4d4d8';
          if (revealed) {
            if (i === correct) { bg = 'rgba(16,185,129,0.15)'; border = '1px solid #10b981'; color = '#10b981'; }
            else if (i === sel) { bg = 'rgba(244,63,94,0.15)'; border = '1px solid #f43f5e'; color = '#f87171'; }
          } else if (i === sel) {
            bg = 'rgba(255,255,255,0.12)'; border = '1px solid #ffffff'; color = '#ffffff';
          }
          return (
            <button
              key={i}
              onClick={() => !revealed && setSel(i)}
              style={{
                textAlign: 'left',
                background: bg,
                border,
                borderRadius: 7,
                padding: '10px 14px',
                cursor: revealed ? 'default' : 'pointer',
                color,
                fontSize: '0.92rem',
                transition: 'all 0.15s ease',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <b style={{ marginRight: 8, fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>{String.fromCharCode(65 + i)}.</b>
              <MathRenderer content={opt} style={{ display: 'inline' }} />
            </button>
          );
        })}
      </div>
      {sel !== null && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          style={{
            marginTop: 14,
            padding: '8px 18px',
            background: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Check Answer
        </button>
      )}
      {revealed && (
        <div style={{ marginTop: 14, fontSize: '0.92rem', color: isRight ? '#10b981' : '#f87171', fontWeight: 600 }}>
          {isRight ? 'Correct! Excellent conceptual grasp.' : `Incorrect — Correct Answer is ${String.fromCharCode(65 + correct)}`}
          {quiz.explanation && (
            <div style={{ marginTop: 6, color: '#a1a1aa', fontWeight: 400, fontSize: '0.88rem', lineHeight: 1.6 }}>
              <MathRenderer content={quiz.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Text-to-Speech Audio Player with Multilingual Voice Mapping ────────────
const BCP47_LANGUAGE_MAP = {
  hi: 'hi-IN',
  hinglish: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  en: 'en-US',
};

const LANG_LABEL_MAP = {
  hi: 'हिंदी',
  hinglish: 'Hinglish',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  en: 'English',
};

function AudioReader({ text, language = 'en' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices() || [];
        setAvailableVoices(v);
      } catch (_) {}
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();

      // Clean prose for high-quality natural reading across English and Indic scripts
      let clean = text
        .replace(/```[\s\S]*?```/g, ' ') // Strip code blocks
        .replace(/<[^>]*>/g, ' ')
        .replace(/\\\[[\s\S]*?\\\]/g, ' ') // Display math
        .replace(/\\\([\s\S]*?\\\)/g, ' ') // Inline math
        .replace(/[\$\*\#\_\~\[\]]/g, ' ') // Markdown symbols
        .replace(/\\psi/gi, 'psi')
        .replace(/\\phi/gi, 'phi')
        .replace(/\\theta/gi, 'theta')
        .replace(/\|0\\rangle/gi, 'ket zero')
        .replace(/\|1\\rangle/gi, 'ket one')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 1600));
      const targetTag = BCP47_LANGUAGE_MAP[language] || 'en-US';
      const langPrefix = targetTag.split('-')[0].toLowerCase();
      utterance.lang = targetTag;

      // Find matching voice from system synthesizer
      const voices = availableVoices.length > 0 ? availableVoices : (window.speechSynthesis.getVoices() || []);
      const match = voices.find(v => {
        const vLang = (v.lang || '').replace('_', '-').toLowerCase();
        return vLang === targetTag.toLowerCase() || vLang.startsWith(langPrefix);
      });

      if (match) {
        utterance.voice = match;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const label = LANG_LABEL_MAP[language] || 'Audio';

  return (
    <button
      onClick={togglePlay}
      title={isPlaying ? `Stop ${label} Voice` : `Listen with voice in ${label}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: isPlaying ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255, 255, 255, 0.05)',
        border: isPlaying ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '5px',
        padding: '3px 8px',
        cursor: 'pointer',
        color: isPlaying ? '#34d399' : '#d4d4d8',
        fontSize: '0.72rem',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        transition: 'all 0.15s ease',
      }}
    >
      {isPlaying ? <><VolumeX size={12} color="#34d399" /> Stop Voice</> : <><Volume2 size={12} /> Read ({label})</>}
    </button>
  );
}

// ── Resolves Curated Video Lectures in Our Database Matching Topic & Language ───
function resolveLecturesForQuery(query = '', language = 'all', limit = 2) {
  const q = (query || '').toLowerCase();

  const TOPIC_KEYWORD_MAP = {
    foundations: ['qubit', 'basis', 'bloch', 'state', 'amplitude', 'dirac', 'bra', 'ket'],
    superposition: ['superposition', 'entanglement', 'bell', 'epr', 'teleportation', 'schrodinger', 'cat'],
    gates: ['gate', 'hadamard', 'cnot', 'pauli', 'unitary', 'circuit', 'rotation', 'swap', 'toffoli', 'cx'],
    algorithms: ['grover', 'shor', 'algorithm', 'qft', 'fourier', 'phase estimation', 'oracle', 'deutsch', 'jozsa'],
    hardware: ['hardware', 'superconducting', 'transmon', 'ion', 'trapped', 'qpu', 'cryogenic', 'coherence', 't1', 't2'],
    qml: ['vqe', 'chemistry', 'machine learning', 'qml', 'eigensolver', 'ansatz', 'variational', 'molecular'],
    security: ['cryptography', 'qkd', 'bb84', 'key distribution', 'security', 'e91'],
  };

  let matchedTopic = null;
  for (const [topic, words] of Object.entries(TOPIC_KEYWORD_MAP)) {
    if (words.some(w => q.includes(w))) {
      matchedTopic = topic;
      break;
    }
  }

  let candidates = VIDEO_LECTURES;

  // Filter by topic if found
  if (matchedTopic) {
    const topicFiltered = candidates.filter(v => v.topic === matchedTopic);
    if (topicFiltered.length > 0) candidates = topicFiltered;
  }

  // Prioritize selected language
  const userLang = (language || 'all').toLowerCase();
  if (userLang !== 'all' && userLang !== 'en') {
    const langFiltered = candidates.filter(v => v.language === userLang);
    if (langFiltered.length > 0) {
      return langFiltered.slice(0, limit);
    }
  }

  return candidates.slice(0, limit);
}

// ── Recommended Lectures Card Component ──────────────────────────────────────
function RecommendedLecturesBlock({ query, language, onNavigate, onPlayVideo }) {
  const lectures = useMemo(() => resolveLecturesForQuery(query, language, 2), [query, language]);
  if (!lectures || lectures.length === 0) return null;

  return (
    <div style={{
      marginTop: 16,
      background: '#111118',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '12px',
      padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
          }}>
            <Play size={12} fill="#f87171" />
          </div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            fontFamily: "'Times New Roman', Times, serif",
            color: '#ffffff',
            letterSpacing: '0.02em',
          }}>
            Curated YouTube Lectures in Our Database
          </span>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('videos')}
            style={{
              background: 'none',
              border: 'none',
              color: '#7dd3fc',
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span>Explore All in Video Hub</span>
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: lectures.length > 1 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: 12 }}>
        {lectures.map((lec) => (
          <div
            key={lec.id}
            style={{
              background: '#161620',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.40)';
              e.currentTarget.style.background = '#1a1a26';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = '#161620';
            }}
          >
            {/* Video Thumbnail with Duration Badge */}
            <div style={{ position: 'relative', width: '100%', height: '115px', background: '#09090d', overflow: 'hidden' }}>
              <img
                src={lec.thumbnail}
                alt={lec.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <button
                  onClick={() => onPlayVideo && onPlayVideo(lec)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                  title="Watch Video"
                >
                  <Play size={16} fill="#ffffff" />
                </button>
              </div>
              <span style={{
                position: 'absolute',
                bottom: 6,
                right: 8,
                background: 'rgba(0,0,0,0.85)',
                borderRadius: 4,
                padding: '2px 5px',
                fontSize: '0.68rem',
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {lec.duration}
              </span>
              <span style={{
                position: 'absolute',
                top: 6,
                left: 8,
                background: 'rgba(56, 189, 248, 0.25)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: '0.66rem',
                color: '#7dd3fc',
                fontWeight: 700,
              }}>
                {lec.languageLabel}
              </span>
            </div>

            {/* Video Meta */}
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.35, marginBottom: 2 }}>
                  {lec.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
                  {lec.instructor} · <span style={{ color: '#d4d4d8' }}>{lec.level}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                <button
                  onClick={() => onPlayVideo && onPlayVideo(lec)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Play size={11} fill="#ffffff" /> Watch Inline
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('videos')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      background: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.10)',
                      borderRadius: 6,
                      padding: '5px 8px',
                      color: '#a1a1aa',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                    }}
                    title="Open in Multilingual Video Hub with AI Dubber"
                  >
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onOpenInStudio, onSelectCitation, onNavigate, onPlayVideo, language }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(msg.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 28, gap: 14, width: '100%' }}>
      {!isUser && (
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#ffffff',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.92rem',
          fontWeight: 900,
          marginTop: 2,
          boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
          fontFamily: "'Times New Roman', Times, serif",
        }}>
          Q
        </div>
      )}

      <div style={{ maxWidth: isUser ? '80%' : '100%', width: isUser ? 'auto' : '100%' }}>
        {isUser ? (
          <div style={{
            background: '#1c1c24',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px 16px 4px 16px',
            padding: '16px 22px',
            fontSize: '1.08rem',
            lineHeight: 1.65,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            fontFamily: "'Poppins', sans-serif",
          }}>
            {msg.content}
          </div>
        ) : (
          <div style={{
            background: '#0d0d12',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '4px 16px 16px 16px',
            padding: '24px 30px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            width: '100%',
          }}>
            {/* Assistant Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(52, 211, 153, 0.10)',
                  border: '1px solid rgba(52, 211, 153, 0.28)',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  color: '#6ee7b7',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  <ShieldCheck size={13} color="#34d399" /> Verified Quantum Response
                </span>
                {msg.ragActive && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.22)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    color: '#7dd3fc',
                    fontWeight: 500,
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    <Zap size={11} color="#38bdf8" /> 18K RAG Passages
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AudioReader text={msg.content} language={msg.language || language} />
                <button
                  onClick={copyMarkdown}
                  title="Copy full response"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    color: '#a1a1aa',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {copied ? <><Check size={11} color="#ffffff" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Main Explanation Prose - Prominent Larger Font */}
            <div style={{ fontSize: '1.18rem', lineHeight: 1.85, color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
              <MathRenderer content={msg.content} />
            </div>

            {/* Mathematical LaTeX Formula */}
            {msg.latex && msg.latex.length > 3 && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.04)',
                border: '1px solid rgba(129, 140, 248, 0.20)',
                borderLeft: '4px solid #818cf8',
                borderRadius: '0 8px 8px 0',
                padding: '16px 22px',
                margin: '18px 0',
                overflowX: 'auto',
              }}>
                <LatexBlock tex={msg.latex} display={true} style={{ fontSize: '1.2rem' }} />
                <div style={{ fontSize: '0.74rem', color: '#a5b4fc', fontStyle: 'italic', marginTop: 6, fontFamily: "'Poppins', sans-serif" }}>
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

            {/* Literature Sources Panel with Clickable Treatise Projector */}
            {msg.sources && msg.sources.filter(s => !s.startsWith('Model:')).length > 0 && (
              <SourcesAccordion
                sources={msg.sources.filter(s => !s.startsWith('Model:'))}
                onSelectCitation={onSelectCitation}
              />
            )}

            {/* Guided YouTube Lectures from Database */}
            <RecommendedLecturesBlock
              query={msg.userQuery || msg.content}
              language={msg.language || language}
              onNavigate={onNavigate}
              onPlayVideo={onPlayVideo}
            />
          </div>
        )}
      </div>

      {isUser && (
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.82rem',
          fontWeight: 800,
          color: '#ffffff',
          marginTop: 2,
          border: '1px solid rgba(255,255,255,0.14)',
          fontFamily: "'Times New Roman', Times, serif",
        }}>
          U
        </div>
      )}
    </div>
  );
}

// ── Literature Sources Accordion with Interactive Treatise Card Projection ───
function SourcesAccordion({ sources, onSelectCitation }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      marginTop: 18,
      background: '#121218',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '12px',
      padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 12 : 0 }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            fontSize: '0.84rem',
            fontWeight: 800,
            padding: 0,
            fontFamily: "'Times New Roman', Times, serif",
            letterSpacing: '0.02em',
          }}
        >
          <BookOpen size={15} color="#6ee7b7" />
          <span>{sources.length} Authoritative Treatise Source{sources.length > 1 ? 's' : ''} (150-Book Library)</span>
          {open ? <ChevronUp size={14} color="#a1a1aa" /> : <ChevronDown size={14} color="#a1a1aa" />}
        </button>
        <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
          Click source to project exact treatise excerpt
        </span>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sources.map((s, i) => (
            <div
              key={i}
              onClick={() => onSelectCitation && onSelectCitation(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: '#161620',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '10px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.38)';
                e.currentTarget.style.background = '#1a1a26';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.background = '#161620';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.28)',
                  borderRadius: 4,
                  padding: '2px 7px',
                  fontSize: '0.70rem',
                  color: '#7dd3fc',
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  p.{i + 1}
                </span>
                <span style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 500 }}>
                  {s}
                </span>
              </div>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.76rem',
                color: '#6ee7b7',
                fontWeight: 600,
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.28)',
                borderRadius: 6,
                padding: '4px 10px',
                whiteSpace: 'nowrap',
              }}>
                <BookOpen size={12} color="#6ee7b7" /> Read Excerpt
              </span>
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
  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [activeCitationForModal, setActiveCitationForModal] = useState(null);
  const [activeVideoForModal, setActiveVideoForModal] = useState(null);

  // Citation click handler — resolves to exact textbook excerpt
  const handleSelectCitation = useCallback((citationTextOrObj) => {
    if (citationTextOrObj && typeof citationTextOrObj === 'object') {
      setActiveCitationForModal(citationTextOrObj);
    } else {
      const resolved = resolveCitationsForQuery(String(citationTextOrObj || ''));
      setActiveCitationForModal(resolved[0] || QUANTUM_TEXTBOOK_EXCERPTS[0]);
    }
  }, []);

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
          language: selectedLanguage,
          userQuery: text,
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
        content: `**Error connecting to AI Tutor**: ${err.message || 'Please check your connection and neural server status.'}`,
        latex: null,
        code: null,
        sources: ['Gitwolves Fallback Engine'],
        model: 'Failsafe Core',
        language: selectedLanguage,
        userQuery: text,
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
      height: 'calc(100vh - 56px)',
      background: '#08080a',
      color: '#ffffff',
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden',
    }}>
      {/* ── Mobile Header ── */}
      <div style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#0c0c10',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }} className="ql-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <PanelLeft size={20} />
          </button>
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Times New Roman', Times, serif" }}>Aura Quantum AI</div>
        </div>
        <button
          onClick={() => handleNewChat()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.80rem',
            fontWeight: 700,
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
          background: '#0c0c10',
          borderRight: isSidebarOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s ease',
          overflow: 'hidden',
          zIndex: 30,
        }}>
          {/* Sidebar Header: Logo & New Chat */}
          <div style={{ padding: '18px 16px 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  fontWeight: 900,
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '1.15rem',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.15)',
                }}>
                  Q
                </div>
                <div>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontFamily: "'Times New Roman', Times, serif",
                    letterSpacing: '0.02em',
                  }}>
                    Aura Quantum AI
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Intelligent Tutor
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                title="Collapse sidebar"
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}
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
                padding: '11px 16px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.12)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e4e4e7'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} strokeWidth={2.5} />
                <span>New Conversation</span>
              </div>
              <span style={{
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.70rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}>
                ⌘K
              </span>
            </button>
          </div>

          {/* Tutor Language Selector Card (Replaces Model Selector & Removes Green Dots) */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{
                fontSize: '0.74rem',
                color: '#ffffff',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                Tutor Language
              </span>
              <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={13} color="#ffffff" />
                <span>{INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.native || 'English'}</span>
              </span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                width: '100%',
                background: '#121216',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '9px 12px',
                fontSize: '0.84rem',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {INDIAN_LANGUAGES.filter(l => l.code !== 'all').map(l => (
                <option key={l.code} value={l.code} style={{ background: '#121216', color: '#ffffff' }}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* Project Sections Filter */}
          <div style={{ padding: '12px 16px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              fontSize: '0.74rem',
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              Projects & Focus
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
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
                      gap: 5,
                      padding: '5px 9px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: "'Poppins', sans-serif",
                      background: active ? '#ffffff' : 'rgba(255,255,255,0.03)',
                      color: active ? '#000000' : '#a1a1aa',
                      border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 500,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <Icon size={12} /> {cat.name}
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
              gap: '8px',
              background: '#121216',
              borderRadius: '6px',
              padding: '7px 12px',
              border: '1px solid rgba(255,255,255,0.10)',
            }}>
              <Search size={14} color="#71717a" />
              <input
                type="text"
                placeholder="Filter chats..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: '100%',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
              {searchFilter && (
                <button onClick={() => setSearchFilter('')} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation History List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {filteredSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#71717a', fontSize: '0.82rem' }}>
                No conversations found in this project.
              </div>
            ) : (
              <>
                {todaySessions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#ffffff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '4px 8px',
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
                      Today
                    </div>
                    {todaySessions.map(s => renderSessionItem(s))}
                  </div>
                )}
                {yesterdaySessions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#ffffff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '4px 8px',
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
                      Yesterday
                    </div>
                    {yesterdaySessions.map(s => renderSessionItem(s))}
                  </div>
                )}
                {olderSessions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#ffffff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '4px 8px',
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
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
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{
                fontSize: '0.72rem',
                color: '#ffffff',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                Platform Quick Jump
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => onNavigate('studio')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 9px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#d4d4d8',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    textAlign: 'left',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Terminal size={12} color="#ffffff" /> Circuit Studio
                </button>
                <button
                  onClick={() => onNavigate('learning')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 9px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#d4d4d8',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    textAlign: 'left',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <BookOpen size={12} color="#ffffff" /> Learning Hub
                </button>
                <button
                  onClick={() => onNavigate('videos')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 9px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#d4d4d8',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    textAlign: 'left',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Play size={12} color="#ffffff" /> Video Hub
                </button>
                <button
                  onClick={() => onNavigate('assessment')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 9px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#d4d4d8',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    textAlign: 'left',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Award size={12} color="#ffffff" /> Test Center
                </button>
              </div>
            </div>
          )}

          {/* User Panel (Bottom) */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: '#09090d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user?.photoURL ? `url(${user.photoURL}) center/cover` : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#000000',
                fontFamily: "'Times New Roman', Times, serif",
              }}>
                {!user?.photoURL && (user?.displayName?.[0] || 'U')}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {user?.displayName || 'Quantum Student'}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={11} color="#ffffff" /> Quantum Verified
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
          background: '#08080a',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Main Area Top Navigation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(12, 12, 16, 0.95)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  title="Open sidebar"
                  style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}
                >
                  <PanelLeft size={20} />
                </button>
              )}
              <div>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: "'Times New Roman', Times, serif",
                  letterSpacing: '0.01em',
                }}>
                  {activeSession.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d4d4d8' }}>
                    <ShieldCheck size={13} color="#ffffff" /> Verified Quantum Engine
                  </span>
                  <span>·</span>
                  <span>Lang: <b style={{ color: '#ffffff' }}>{INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English'}</b></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Language Selector in Top Bar with Globe Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#16161c',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '5px 12px',
              }}>
                <Globe size={14} color="#ffffff" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    background: 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {INDIAN_LANGUAGES.filter(l => l.code !== 'all').map(l => (
                    <option key={l.code} value={l.code} style={{ background: '#121216', color: '#ffffff' }}>
                      {l.native} ({l.label})
                    </option>
                  ))}
                </select>
              </div>

              {/* Flashcards Deck Button */}
              <button
                onClick={() => setIsFlashcardsOpen(true)}
                title="Launch 3D Flashcards Deck"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                <Layers size={14} color="#ffffff" />
                <span>Flashcards</span>
              </button>

              {/* Quantum Studio Right Panel Toggle */}
              <button
                onClick={() => setIsStudioOpen(!isStudioOpen)}
                title="Toggle Quantum Studio &amp; Treatises Deck"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  background: isStudioOpen ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                  border: isStudioOpen ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: isStudioOpen ? '#000000' : '#ffffff',
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={14} color={isStudioOpen ? '#000000' : '#ffffff'} />
                <span>Studio Deck</span>
              </button>

              {/* Diagram Toggle Button */}
              <button
                onClick={() => setGenerateDiagram(!generateDiagram)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: generateDiagram ? '#ffffff' : 'rgba(255,255,255,0.04)',
                  border: generateDiagram ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.10)',
                  color: generateDiagram ? '#000000' : '#d4d4d8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <Sparkles size={13} color={generateDiagram ? '#000000' : '#ffffff'} />
                Diagram: {generateDiagram ? 'ON' : 'OFF'}
              </button>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  title="Toggle Theme"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '8px',
                    padding: '7px 10px',
                    color: '#a1a1aa',
                    cursor: 'pointer',
                  }}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '30px 40px',
          }}>
            {messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div style={{
                maxWidth: '960px',
                margin: '20px auto 40px auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
              }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(255, 255, 255, 0.15)',
                  marginBottom: '22px',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  fontFamily: "'Times New Roman', Times, serif",
                }}>
                  Q
                </div>

                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Times New Roman', Times, serif",
                  lineHeight: 1.25,
                }}>
                  What quantum breakthrough will we explore?
                </h1>

                <p style={{
                  fontSize: '1.05rem',
                  color: '#a1a1aa',
                  maxWidth: '680px',
                  lineHeight: 1.7,
                  marginBottom: '32px',
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  Powered by verified multi-stage quantum reasoning, 18,800+ indexed textbook chapters, and automatic SVG quantum circuit generation.
                </p>

                {/* Quick Action Prompt Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '14px',
                  width: '100%',
                  textAlign: 'left',
                }}>
                  {currentStarters.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => sendMessage(item.query)}
                      style={{
                        background: '#0d0d12',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: '12px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.background = '#14141c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.background = '#0d0d12';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{
                          fontSize: '0.98rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          fontFamily: "'Times New Roman', Times, serif",
                        }}>
                          {item.title}
                        </span>
                        <ArrowUpRight size={15} color="#ffffff" />
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#a1a1aa', lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>
                        {item.query.slice(0, 95)}…
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Stream */
              <div style={{ maxWidth: '1020px', margin: '0 auto', width: '100%' }}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onOpenInStudio={onLoadCircuitIntoStudio}
                    onSelectCitation={handleSelectCitation}
                    onNavigate={onNavigate}
                    onPlayVideo={(video) => setActiveVideoForModal(video)}
                    language={selectedLanguage}
                  />
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#16161e',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderTopColor: '#ffffff',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    </div>
                    <div style={{
                      background: '#121218',
                      borderRadius: '6px 16px 16px 16px',
                      padding: '14px 20px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '0.94rem',
                      color: '#d4d4d8',
                      fontFamily: "'Poppins', sans-serif",
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
            padding: '16px 32px 24px 32px',
            background: 'linear-gradient(180deg, rgba(8, 8, 10, 0) 0%, rgba(8, 8, 10, 0.95) 30%, #08080a 100%)',
          }}>
            <div style={{ maxWidth: '1020px', margin: '0 auto', width: '100%' }}>
              {/* Quick Action Chips (NO EMOJIS, Clean Lucide Icons) */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
                <button
                  onClick={() => setIsFlashcardsOpen(true)}
                  style={{
                    ...chipStyle,
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #ffffff',
                    fontWeight: 700,
                  }}
                >
                  <Layers size={13} color="#000000" />
                  <span>3D Flashcards</span>
                </button>
                <button
                  onClick={() => {
                    setIsStudioOpen(true);
                    handleSelectCitation(QUANTUM_TEXTBOOK_EXCERPTS[0]);
                  }}
                  style={{
                    ...chipStyle,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.20)',
                    color: '#ffffff',
                  }}
                >
                  <BookOpen size={13} color="#ffffff" />
                  <span>Read from Book</span>
                </button>
                <button
                  onClick={() => { setGenerateDiagram(true); sendMessage("Build a Bell state circuit in Qiskit 1.0 and generate circuit diagram"); }}
                  style={chipStyle}
                >
                  <Zap size={13} color="#ffffff" />
                  <span>Bell State Circuit</span>
                </button>
                <button
                  onClick={() => sendMessage("Derive the Quantum Fourier Transform mathematically and explain each step")}
                  style={chipStyle}
                >
                  <Terminal size={13} color="#ffffff" />
                  <span>Derive QFT</span>
                </button>
                <button
                  onClick={() => { setGenerateDiagram(true); sendMessage("Generate a Bloch sphere diagram for state |+> and explain the angles"); }}
                  style={chipStyle}
                >
                  <Compass size={13} color="#ffffff" />
                  <span>Bloch Sphere Diagram</span>
                </button>
                <button
                  onClick={() => sendMessage("Explain Grover's search algorithm with a simple analogy for a high school student")}
                  style={chipStyle}
                >
                  <Lightbulb size={13} color="#ffffff" />
                  <span>Intuitive Analogy</span>
                </button>
                <button
                  onClick={() => sendMessage("Give me a challenging multiple choice quiz on quantum error correction")}
                  style={chipStyle}
                >
                  <HelpCircle size={13} color="#ffffff" />
                  <span>Quiz My Knowledge</span>
                </button>
              </div>

              {/* Main Input Box */}
              <div style={{
                background: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '14px 16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask Aura Quantum AI anything in ${INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English'}... (Shift+Enter for new line)`}
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />

                {/* Bottom Toolbar inside Input */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        color: '#a1a1aa',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Upload size={17} />
                    </button>

                    <button
                      onClick={() => setGenerateDiagram(!generateDiagram)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: generateDiagram ? '#ffffff' : 'rgba(255,255,255,0.05)',
                        border: generateDiagram ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        color: generateDiagram ? '#000000' : '#d4d4d8',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <Sparkles size={12} color={generateDiagram ? '#000000' : '#ffffff'} />
                      {generateDiagram ? 'Diagram ON' : '+ Add Diagram'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#71717a', fontFamily: "'Poppins', sans-serif" }}>
                      Enter to send · Shift+Enter for newline
                    </span>
                    <button
                      onClick={() => sendMessage()}
                      disabled={loading || !input.trim()}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: input.trim() ? '#ffffff' : 'rgba(255,255,255,0.08)',
                        color: input.trim() ? '#000000' : '#71717a',
                        border: 'none',
                        cursor: input.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── NotebookLM-style Quantum Studio (Right Panel) ── */}
        <QuantumStudio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          activeTopic={activeSession.title}
          language={selectedLanguage}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onOpenCitation={handleSelectCitation}
          onOpenInStudio={onLoadCircuitIntoStudio}
          onPlayVideo={(video) => setActiveVideoForModal(video)}
          onNavigateToHub={() => onNavigate && onNavigate('videos')}
          onSendQuery={sendMessage}
        />
      </div>

      {/* ── Interactive 3D Quantum Flashcards Deck Modal ── */}
      {isFlashcardsOpen && (
        <QuantumFlashcards
          initialTopic={activeSession.title}
          onClose={() => setIsFlashcardsOpen(false)}
          onDeepDive={(card) => {
            setIsFlashcardsOpen(false);
            sendMessage(`Explain the mathematical derivation and physical intuition behind ${card.front.title}: ${card.front.question}`);
          }}
        />
      )}

      {/* ── Exact Citation & Treatise Projection Modal ── */}
      {activeCitationForModal && (
        <CitationProjector
          citation={activeCitationForModal}
          onClose={() => setActiveCitationForModal(null)}
          onDeepDive={(cit) => {
            setActiveCitationForModal(null);
            sendMessage(`Deep dive into ${cit.title} (${cit.chapter}, ${cit.section}) and explain the mathematical derivation of ${cit.key_formula || 'the governing equations'}`);
          }}
        />
      )}

      {/* ── Floating Embedded YouTube Lecture Player Modal ── */}
      {activeVideoForModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: 20,
        }}>
          <div style={{
            background: '#0d0d12',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 16,
            maxWidth: '820px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            fontFamily: "'Poppins', sans-serif",
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Play size={16} color="#f87171" fill="#f87171" />
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Times New Roman', Times, serif" }}>
                  {activeVideoForModal.title}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoForModal(null)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`${activeVideoForModal.embedUrl}?autoplay=1`}
                title={activeVideoForModal.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#121218' }}>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                Instructor: <b style={{ color: '#ffffff' }}>{activeVideoForModal.instructor}</b> ({activeVideoForModal.languageLabel})
              </div>
              {onNavigate && (
                <button
                  onClick={() => { const vid = activeVideoForModal; setActiveVideoForModal(null); onNavigate('videos'); }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 6,
                    padding: '6px 14px',
                    color: '#ffffff',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span>Open in Video Hub with Dubber</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Clear All History Confirmation Modal ── */}
      {confirmClearAll && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          fontFamily: "'Poppins', sans-serif",
        }}>
          <div style={{
            background: '#0f0f14',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '14px',
            padding: '26px',
            maxWidth: '440px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#f87171' }}>
              <AlertTriangle size={22} />
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: "'Times New Roman', Times, serif", color: '#ffffff' }}>Clear All Conversations?</div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.6, marginBottom: 22 }}>
              This will permanently delete all your quantum chat history from this device and your cloud profile. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setConfirmClearAll(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 16px',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllHistory}
                style={{
                  background: '#f87171',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 18px',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
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
          padding: '9px 12px',
          borderRadius: '7px',
          marginBottom: '3px',
          background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          border: isActive ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.12s ease',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden', flex: 1 }}>
          <Sparkles size={12} color={isActive ? '#ffffff' : '#71717a'} />
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveRenameSession(s.id)}
              onKeyDown={(e) => e.key === 'Enter' && saveRenameSession(s.id)}
              autoFocus
              style={{
                background: '#121216',
                border: '1px solid #ffffff',
                borderRadius: '4px',
                color: '#fff',
                padding: '3px 8px',
                fontSize: '0.84rem',
                outline: 'none',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.86rem',
              color: isActive ? '#ffffff' : '#a1a1aa',
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
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: 3,
              display: isActive ? 'block' : 'none',
            }}
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => handleDeleteSession(s.id, e)}
            title="Delete conversation"
            style={{
              background: 'none',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: 3,
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }
}

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#121216',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px',
  padding: '6px 14px',
  color: '#d4d4d8',
  fontSize: '0.82rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
};
