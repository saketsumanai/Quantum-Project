// ==============================================================================
// Quantum Leap — Resilient AI Tutor Client
// Multi-Tier Fallback:
//   Tier 1: Local / Cloud FastAPI Backend (/api/v1/ai-tutor/query or /chat)
//   Tier 2: Direct High-Speed Groq LPU API (openai/gpt-oss-120b / qwen3.8-27b)
//   Tier 3: Built-in Deterministic Socratic Quantum Knowledge Engine
// Never throws "Unexpected end of JSON input" or crashes on empty/HTML responses.
// ==============================================================================

import { API_BASE } from "../config/api";

const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY || "").trim();

const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

// ─── Multilingual & Hinglish Neural Language Detector ─────────────────────────
export const HINGLISH_INDICATORS = new Set([
  "kya", "hai", "hain", "karo", "kare", "kaise", "hota", "hoti", "hote",
  "samjhao", "batao", "bataiye", "aur", "mein", "me", "hum", "yeh", "ye",
  "woh", "wo", "apna", "apni", "nahi", "kyun", "kyu", "bhi", "accha",
  "theek", "thik", "kardo", "samajh", "bolo", "mujhe", "tumhe", "aap",
  "karna", "wali", "wale", "wala", "kuch", "zyada", "kam", "pehle",
  "baad", "iska", "iski", "iske", "unka", "unki", "inke", "kab", "kahan",
  "kidhar", "kaun", "kaunsa", "kaunsi", "chahiye", "dekho", "suno",
  "samajhna", "sikhna", "sikhao", "padhao", "bhai", "bro", "dost", "samjha",
  "dijiye", "batao na", "bata do"
]);

export function detectLanguage(text, userPref = "") {
  if (userPref && userPref !== "auto" && userPref !== "all" && userPref !== "en") {
    return userPref.toLowerCase();
  }

  if (!text || typeof text !== "string") return "en";
  const clean = text.trim();
  if (!clean) return "en";

  // Check Indic scripts directly
  if (/[\u0B80-\u0BFF]/.test(clean)) return "ta"; // Tamil
  if (/[\u0C00-\u0C7F]/.test(clean)) return "te"; // Telugu
  if (/[\u0980-\u09FF]/.test(clean)) return "bn"; // Bengali
  if (/[\u0A80-\u0AFF]/.test(clean)) return "gu"; // Gujarati
  if (/[\u0C80-\u0CFF]/.test(clean)) return "kn"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(clean)) return "ml"; // Malayalam
  if (/[\u0A00-\u0A7F]/.test(clean)) return "pa"; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(clean)) return "or"; // Odia
  if (/[\u0900-\u097F]/.test(clean)) return "hi"; // Hindi / Devanagari

  // Check Hinglish (Hindi words written in Latin script)
  const words = clean.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  let hinglishHits = 0;
  for (const w of words) {
    if (HINGLISH_INDICATORS.has(w)) {
      hinglishHits++;
    }
  }

  if (hinglishHits >= 2 || (words.length <= 6 && hinglishHits >= 1)) {
    return "hinglish";
  }

  return userPref && userPref !== "auto" && userPref !== "all" ? userPref : "en";
}

// Offline verified quantum knowledge dictionary for instantaneous zero-latency responses
const OFFLINE_KNOWLEDGE = {
  superposition: {
    intent: "superposition",
    vocal_prose_script:
      "Quantum superposition is the fundamental quantum mechanical principle where a system exists simultaneously in a linear combination of multiple basis states until measurement. Unlike a classical bit restricted strictly to binary state 0 or 1, a qubit's statevector |ψ⟩ is represented geometrically as a point on the surface of the Bloch sphere.",
    mathematical_latex_formula: "|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle \\quad \\text{where } |\\alpha|^2 + |\\beta|^2 = 1",
    qiskit_executable_code: `from qiskit import QuantumCircuit
import numpy as np

# Prepare an equal superposition state (|0> + |1>)/sqrt(2)
qc = QuantumCircuit(1, 1)
qc.h(0)            # Apply Hadamard gate
qc.measure(0, 0)   # Measure in computational basis
print(qc.draw(output='text'))`,
    quiz: {
      question: "What is the probability of measuring state |0⟩ for state |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩?",
      options: ["25%", "50%", "75%", "100%"],
      answer: 1,
      explanation: "By Born's rule, P(0) = |α|² = |1/√2|² = 1/2 = 50%.",
    },
    sources: ["Nielsen & Chuang - Quantum Computation and Quantum Information (Ch. 1)"],
  },
  entanglement: {
    intent: "entanglement",
    vocal_prose_script:
      "Quantum entanglement describes a non-separable composite quantum state where the quantum properties of two or more particles are correlated such that the state of one cannot be described independently of the other, regardless of spatial separation. The canonical example is the maximally entangled Bell pair |Φ⁺⟩.",
    mathematical_latex_formula: "|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}",
    qiskit_executable_code: `from qiskit import QuantumCircuit

# Create canonical Bell State |Phi+>
qc = QuantumCircuit(2, 2)
qc.h(0)          # Superposition on control qubit
qc.cx(0, 1)      # CNOT entangles qubit 0 and 1
qc.measure([0, 1], [0, 1])
print(qc.draw(output='text'))`,
    quiz: {
      question: "Which quantum gate pair generates the maximally entangled Bell state |Φ⁺⟩ from |00⟩?",
      options: ["Hadamard + Pauli-X", "Hadamard + CNOT", "Phase Gate + SWAP", "Two Pauli-Z gates"],
      answer: 1,
      explanation: "Applying H on qubit 0 gives (|0⟩+|1⟩)/√2. Applying CNOT(0,1) flips qubit 1 if qubit 0 is 1, creating (|00⟩+|11⟩)/√2.",
    },
    sources: ["Nielsen & Chuang (Ch. 1.3 - Bell States)", "Einstein-Podolsky-Rosen (1935)"],
  },
  hadamard: {
    intent: "hadamard_gate",
    vocal_prose_script:
      "The Hadamard gate (H) is a single-qubit unitary transformation that maps the computational basis states |0⟩ and |1⟩ into equal superposition states |+⟩ and |-⟩. Geometrically on the Bloch sphere, it performs a 180° rotation around the (X + Z)/√2 diagonal axis.",
    mathematical_latex_formula: "H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}, \\quad H|0\\rangle = |+\\rangle, \\quad H|1\\rangle = |-\\rangle",
    qiskit_executable_code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
qc.h(0)
print(qc.draw(output='text'))`,
    quiz: {
      question: "What is the result of applying two consecutive Hadamard gates (H · H) to a qubit?",
      options: ["Inversion to |1⟩", "Identity operation (returns to original state)", "Phase shift of π", "State collapse"],
      answer: 1,
      explanation: "The Hadamard gate is Hermitian and unitary, meaning H = H† and H² = I.",
    },
    sources: ["Mike & Ike (Quantum Computation)", "Preskill Quantum Lecture Notes"],
  },
  grover: {
    intent: "grover_search",
    vocal_prose_script:
      "Grover's algorithm provides a quadratic speedup for searching an unstructured database of N items in O(√N) evaluations compared to classical O(N). It achieves this by iteratively applying an Oracle phase inversion followed by a Grover Diffusion Operator (inversion about the average).",
    mathematical_latex_formula: "G = (2|\\psi\\rangle\\langle\\psi| - I) \\cdot O_f, \\quad \\mathcal{O}(\\sqrt{N}) \\text{ queries}",
    qiskit_executable_code: `from qiskit import QuantumCircuit

# 2-Qubit Grover Search for target state |11>
qc = QuantumCircuit(2, 2)
qc.h([0, 1])     # Initialization in uniform superposition
# Oracle for |11>: Controlled-Z
qc.cz(0, 1)
# Grover Diffusion Operator
qc.h([0, 1])
qc.x([0, 1])
qc.cz(0, 1)
qc.x([0, 1])
qc.h([0, 1])
qc.measure([0, 1], [0, 1])
print(qc.draw(output='text'))`,
    quiz: {
      question: "What is the asymptotic speedup offered by Grover's search algorithm?",
      options: ["Exponential O(2^N)", "Quadratic O(√N)", "Logarithmic O(log N)", "Polynomial O(N^2)"],
      answer: 1,
      explanation: "Grover's search performs amplitude amplification in O(√N) iterations compared to classical O(N).",
    },
    sources: ["Lov K. Grover (1996) - A fast quantum mechanical algorithm for database search"],
  },
};
/**
 * Robustly parses text into JSON without throwing.
 */
export function safeJsonParse(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Attempt markdown code block extraction
    try {
      if (trimmed.includes("```json")) {
        const inner = trimmed.split("```json")[1].split("```")[0].trim();
        return JSON.parse(inner);
      }
      if (trimmed.includes("```")) {
        const inner = trimmed.split("```")[1].split("```")[0].trim();
        return JSON.parse(inner);
      }
      // Regex match outermost curly braces
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Safely extracts a string field value from potentially malformed or truncated JSON text.
 * Correctly handles escaped quotes (\"), single quotes (\'), newlines (\n), backslashes (\\), etc.
 */
function safeExtractString(text, key) {
  if (!text || typeof text !== "string") return null;
  const pattern = new RegExp(`"${key}"\\s*:\\s*"`, "i");
  const match = text.search(pattern);
  if (match === -1) return null;

  const start = match + text.match(pattern)[0].length;
  let result = "";
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      if (ch === "n") result += "\n";
      else if (ch === "t") result += "\t";
      else if (ch === "r") result += "\r";
      else if (ch === '"') result += '"';
      else if (ch === "\\") result += "\\";
      else if (ch === "'") result += "'";
      else result += ch;
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else if (ch === '"') {
      return result;
    } else {
      result += ch;
    }
  }
  return result.trim() ? result : null;
}

/**
 * Extracts a quiz object from text, returning both schema variants:
 * { question, question_string, options, options_array, answer, valid_index_pointer, explanation }
 */
function extractQuizObject(text) {
  if (!text || typeof text !== "string") return null;
  const qStart = text.search(/"quiz(?:_generation_object)?"\s*:\s*\{/i);
  if (qStart === -1) return null;
  const slice = text.slice(qStart);

  const question = safeExtractString(slice, "question") || safeExtractString(slice, "question_string");

  let options = [];
  const optMatch = slice.match(/"(?:options|options_array)"\s*:\s*\[([\s\S]*?)(\]|$)/);
  if (optMatch && optMatch[1]) {
    const items = optMatch[1].match(/"((?:[^"\\]|\\.)*)"/g);
    if (items) {
      options = items.map((s) =>
        s.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, "\n")
      );
    }
  }

  const ansMatch = slice.match(/"(?:answer|valid_index_pointer)"\s*:\s*(\d+)/);
  const answer = ansMatch ? parseInt(ansMatch[1], 10) : 0;
  const explanation = safeExtractString(slice, "explanation");

  if (question || options.length > 0) {
    return {
      question: question || "Quantum Knowledge Check",
      question_string: question || "Quantum Knowledge Check",
      options: options.length ? options : ["A", "B", "C", "D"],
      options_array: options.length ? options : ["A", "B", "C", "D"],
      answer,
      valid_index_pointer: answer,
      explanation: explanation || "",
    };
  }
  return null;
}

/**
 * Normalizes an existing quiz object into both schema keys so any component can read it.
 */
function normalizeQuizObject(quiz) {
  if (!quiz || typeof quiz !== "object") return null;
  const question = quiz.question || quiz.question_string || "Quantum Knowledge Check";
  const options = quiz.options || quiz.options_array || [];
  const answer =
    quiz.answer !== undefined
      ? quiz.answer
      : quiz.valid_index_pointer !== undefined
      ? quiz.valid_index_pointer
      : 0;
  const explanation = quiz.explanation || "";

  return {
    question,
    question_string: question,
    options,
    options_array: options,
    answer,
    valid_index_pointer: answer,
    explanation,
  };
}

/**
 * Strips raw JSON syntax if prose was contaminated with raw JSON strings.
 */
function sanitizeProseText(prose) {
  if (!prose || typeof prose !== "string") return "Quantum state evaluated.";
  let s = prose.trim();

  // If it starts with JSON curly bracket or contains JSON structure
  if (s.startsWith("{") && (s.includes('"vocal_prose_script"') || s.includes('"success"'))) {
    const extracted =
      safeExtractString(s, "vocal_prose_script") ||
      safeExtractString(s, "content") ||
      safeExtractString(s, "response");
    if (extracted) return extracted.trim();
  }

  // Remove markdown code fences if wrapped
  s = s.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/i, "").trim();

  // If it still has JSON key quotes at the start
  s = s.replace(/^\{?\s*"vocal_prose_script"\s*:\s*"?/, "");
  s = s.replace(/"?\s*,\s*"mathematical_latex_formula"[\s\S]*$/, "");
  s = s.replace(/"?\s*\}\s*$/, "");

  return s.trim() || "Quantum state evaluated.";
}

/**
 * Robustly parses text into clean quantum tutor structure without ever exposing raw JSON.
 */
export function parseQuantumAiResponse(raw, fallbackModel = "Groq LPU (GPT-OSS 120B)") {
  if (!raw) {
    return {
      success: true,
      vocal_prose_script: "I have analyzed your quantum question.",
      mathematical_latex_formula: null,
      qiskit_executable_code: null,
      quiz_generation_object: null,
      sources: ["Gitwolves Quantum Knowledge Base"],
      model_used: fallbackModel,
    };
  }

  // If already an object
  if (typeof raw === "object") {
    let prose = raw.vocal_prose_script || raw.content || raw.response || "";
    // If the prose itself is a stringified JSON
    if (typeof prose === "string" && (prose.includes('"vocal_prose_script"') || prose.trim().startsWith("{"))) {
      const inner = parseQuantumAiResponse(prose, fallbackModel);
      return {
        success: true,
        vocal_prose_script: inner.vocal_prose_script,
        mathematical_latex_formula: raw.mathematical_latex_formula || inner.mathematical_latex_formula,
        qiskit_executable_code: raw.qiskit_executable_code || inner.qiskit_executable_code,
        quiz_generation_object: normalizeQuizObject(raw.quiz_generation_object || raw.quiz || inner.quiz_generation_object),
        sources: raw.sources || inner.sources || ["Gitwolves Quantum Knowledge Base"],
        model_used: raw.model_used || inner.model_used || fallbackModel,
      };
    }
    const rawQuiz = raw.quiz_generation_object || raw.quiz || null;
    return {
      success: true,
      vocal_prose_script: sanitizeProseText(prose),
      mathematical_latex_formula: raw.mathematical_latex_formula || raw.latex || null,
      qiskit_executable_code: raw.qiskit_executable_code || raw.code || null,
      quiz_generation_object: normalizeQuizObject(rawQuiz),
      sources: raw.sources || ["Gitwolves Quantum Knowledge Base"],
      model_used: raw.model_used || raw.model || fallbackModel,
    };
  }

  const text = String(raw).trim();

  // Try direct clean JSON parse first
  try {
    const obj = JSON.parse(text);
    return parseQuantumAiResponse(obj, fallbackModel);
  } catch (_) {}

  // Try extracting from markdown code block
  if (text.includes("```json")) {
    try {
      const inner = text.split("```json")[1].split("```")[0].trim();
      const obj = JSON.parse(inner);
      return parseQuantumAiResponse(obj, fallbackModel);
    } catch (_) {}
  }

  // Safe extraction for truncated or invalidly-escaped JSON
  const extractedProse =
    safeExtractString(text, "vocal_prose_script") ||
    safeExtractString(text, "content") ||
    safeExtractString(text, "response");
  const extractedLatex =
    safeExtractString(text, "mathematical_latex_formula") || safeExtractString(text, "latex");
  const extractedCode =
    safeExtractString(text, "qiskit_executable_code") || safeExtractString(text, "code");
  const extractedQuiz = extractQuizObject(text);

  if (extractedProse) {
    return {
      success: true,
      vocal_prose_script: sanitizeProseText(extractedProse),
      mathematical_latex_formula: extractedLatex,
      qiskit_executable_code: extractedCode,
      quiz_generation_object: extractedQuiz,
      sources: ["Gitwolves Quantum Knowledge Base"],
      model_used: fallbackModel,
    };
  }

  // Clean raw text if not JSON
  return {
    success: true,
    vocal_prose_script: sanitizeProseText(text),
    mathematical_latex_formula: null,
    qiskit_executable_code: null,
    quiz_generation_object: null,
    sources: ["Gitwolves Quantum Knowledge Base"],
    model_used: fallbackModel,
  };
}

/**
 * Comprehensive System Prompts for Multi-Language Socratic Quantum Tutor
 */
const LANGUAGE_PROMPTS = {
  hinglish: `Target Language: Hinglish (Conversational Hindi written in English / Latin script).
CRITICAL RULES FOR HINGLISH:
1. You MUST answer in natural, engaging conversational Hinglish (e.g. "Imagine karo ek spinning coin hai... Jab tak aap measure nahi karte, qubit simultaneously |0> aur |1> dono states me hota hai.").
2. Strictly keep ALL core scientific & mathematical quantum terms in English: Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Unitary, Ket |0>, Ket |1>, Qiskit.
3. Do NOT output Devanagari script for Hinglish. Use clean Latin script.`,

  hi: `Target Language: Hindi (हिंदी).
CRITICAL RULES FOR HINDI:
1. Explain fluently and naturally in Hindi (हिंदी).
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside clear Hindi explanations.`,

  ta: `Target Language: Tamil (தமிழ்).
CRITICAL RULES FOR TAMIL:
1. Explain fluently and accurately in Tamil (தமிழ்) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Tamil explanations.`,

  te: `Target Language: Telugu (తెలుగు).
CRITICAL RULES FOR TELUGU:
1. Explain fluently and accurately in Telugu (తెలుగు) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Telugu explanations.`,

  bn: `Target Language: Bengali (বাংলা).
CRITICAL RULES FOR BENGALI:
1. Explain fluently and accurately in Bengali (বাংলা) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Bengali explanations.`,

  mr: `Target Language: Marathi (मराठी).
CRITICAL RULES FOR MARATHI:
1. Explain fluently and accurately in Marathi (मराठी) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Marathi explanations.`,

  gu: `Target Language: Gujarati (ગુજરાતી).
CRITICAL RULES FOR GUJARATI:
1. Explain fluently and accurately in Gujarati (ગુજરાતી) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Gujarati explanations.`,

  kn: `Target Language: Kannada (ಕನ್ನಡ).
CRITICAL RULES FOR KANNADA:
1. Explain fluently and accurately in Kannada (ಕನ್ನಡ) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Kannada explanations.`,

  ml: `Target Language: Malayalam (മലയാളം).
CRITICAL RULES FOR MALAYALAM:
1. Explain fluently and accurately in Malayalam (മലയാളം) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Malayalam explanations.`,

  pa: `Target Language: Punjabi (ਪੰਜਾਬੀ).
CRITICAL RULES FOR PUNJABI:
1. Explain fluently and accurately in Punjabi (ਪੰਜਾਬੀ) script.
2. Keep core technical terms (Qubit, Superposition, Bloch Sphere, Hadamard gate, Entanglement, Measurement, Statevector, Qiskit) in English alongside Punjabi explanations.`,

  en: `Target Language: English (Academic, pedagogical, authoritative).`,
};

/**
 * Direct call to Groq LPU API as high-speed resilient fallback
 */
async function queryGroqDirectly({ userQuery, conversationHistory = [], language = "en" }) {
  if (!GROQ_API_KEY) return null;

  const targetLang = detectLanguage(userQuery, language);
  const langPromptRule = LANGUAGE_PROMPTS[targetLang] || LANGUAGE_PROMPTS.en;

  const systemPrompt = `You are QuantumLeap's expert Socratic AI Quantum Physics Tutor.
${langPromptRule}
Explain concepts with scientific precision, physical intuition, and clear mathematics.
Keep your explanation focused, comprehensive yet concise (under 250 words for vocal_prose_script).
You MUST output valid, parseable JSON with NO commentary outside JSON.
Expected JSON format:
{
  "success": true,
  "vocal_prose_script": "detailed explanation...",
  "mathematical_latex_formula": "LaTeX formula (e.g., |\\\\psi\\\\rangle = \\\\alpha|0\\\\rangle + \\\\beta|1\\\\rangle)",
  "qiskit_executable_code": "Python Qiskit 1.0+ code...",
  "quiz_generation_object": {
    "question": "probe question...",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "why A is correct..."
  },
  "sources": ["Nielsen & Chuang (Quantum Computation)", "IBM Quantum Learning"],
  "model_used": "Groq LPU (GPT-OSS 120B)"
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-4).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.slice(0, 500) : "",
    })),
    { role: "user", content: userQuery },
  ];

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) continue;

      const raw = await response.text();
      const parsedCompletion = safeJsonParse(raw);
      const rawContent = parsedCompletion?.choices?.[0]?.message?.content;
      if (!rawContent) continue;

      // Extract and unmarshal clean fields from Groq response
      const extracted = parseQuantumAiResponse(rawContent, `Groq LPU (${model})`);
      if (extracted && extracted.vocal_prose_script) {
        extracted.language_detected = targetLang;
        return extracted;
      }
    } catch (e) {
      console.warn(`[Groq Direct fallback notice for ${model}]:`, e.message);
    }
  }
  return null;
}

/**
 * Offline heuristic match
 */
function getOfflineKnowledge(query, language = "en") {
  const q = (query || "").toLowerCase();
  for (const [key, data] of Object.entries(OFFLINE_KNOWLEDGE)) {
    if (q.includes(key)) {
      return {
        success: true,
        vocal_prose_script: data.vocal_prose_script,
        mathematical_latex_formula: data.mathematical_latex_formula,
        qiskit_executable_code: data.qiskit_executable_code,
        quiz_generation_object: data.quiz,
        sources: data.sources,
        model_used: "Gitwolves Deterministic Quantum Kernel",
        is_cached_fallback: true,
        language_detected: language,
      };
    }
  }

  // Generic fallback if no specific keyword matches
  return {
    success: true,
    vocal_prose_script: `In quantum computing, **${query.slice(0, 40)}** operates within a complex Hilbert state space governed by unitary transformations ($U^\\dagger U = I$). Qubits maintain coherence through linear superposition and phase relationships before computational projective measurement.`,
    mathematical_latex_formula: "U = \\exp(-i \\hat{H} t / \\hbar), \\quad U^\\dagger U = \\mathbb{I}",
    qiskit_executable_code: `# Quantum Leap verification circuit
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
print(qc.draw(output='text'))`,
    quiz_generation_object: {
      question: "Which mathematical condition guarantees the reversibility and probability conservation of a quantum gate?",
      options: ["Determinant = 0", "Unitary condition: U†U = I", "Trace = 1", "Hermitian condition: H = H†"],
      answer: 1,
      explanation: "A matrix U is unitary if its conjugate transpose equals its inverse (U†U = I), ensuring that the sum of measurement probabilities always equals 1.",
    },
    sources: ["Nielsen & Chuang - Quantum Computation and Quantum Information"],
    model_used: "Gitwolves Deterministic Quantum Kernel",
    is_cached_fallback: true,
    language_detected: language,
  };
}

/**
 * Universal safe query function for AI Tutor
 */
export async function queryAiTutorSafe({
  userQuery,
  circuitContext = {},
  currentTopic = "",
  userLevel = "beginner",
  conversationHistory = [],
  language = "en",
  model = "openai/gpt-oss-120b",
  generateDiagram = false,
  videoContext = undefined,
}) {
  const effectiveLang = detectLanguage(userQuery, language);

  // ─── Step 1: Attempt Backend API Call Safely ──────────────────────────────
  const endpointsToTry = [
    `${API_BASE}/ai-tutor/query`,
    "/api/v1/ai-tutor/query",
  ];

  for (const backendUrl of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const resp = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          user_query: userQuery,
          active_circuit_context: circuitContext,
          current_topic: currentTopic,
          user_level: userLevel,
          conversation_history: conversationHistory,
          language: effectiveLang,
          model,
          generate_diagram: generateDiagram,
          video_context: videoContext,
        }),
      });

      clearTimeout(timeoutId);

      const contentType = resp.headers.get("content-type") || "";
      if (resp.ok && contentType.includes("application/json")) {
        const rawText = await resp.text();
        if (rawText && rawText.trim().length > 0) {
          const parsed = safeJsonParse(rawText);
          if (parsed && (parsed.success || parsed.vocal_prose_script || parsed.content)) {
            parsed.success = true;
            parsed.language_detected = parsed.language_detected || effectiveLang;
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn(`[AI Tutor] Attempt on ${backendUrl} notice:`, err.message);
    }
  }

  // ─── Step 2: Direct Groq LPU Execution ────────────────────────────────────
  const groqResult = await queryGroqDirectly({
    userQuery,
    conversationHistory,
    language: effectiveLang,
  });
  if (groqResult) {
    groqResult.language_detected = effectiveLang;
    return groqResult;
  }

  // ─── Step 3: Verified Offline Knowledge Fallback ──────────────────────────
  return getOfflineKnowledge(userQuery, effectiveLang);
}

/**
 * Universal safe multi-turn chat function for Quantum ChatGPT / CodeLab
 */
export async function chatAiTutorSafe({
  query,
  messages = [],
  topic = "",
  context = "",
  conversationHistory = [],
  language = "en",
}) {
  const promptText = query || (messages.length ? messages[messages.length - 1].content : "");
  const effectiveLang = detectLanguage(promptText, language);

  // ─── Step 1: Attempt Backend API Call Safely ──────────────────────────────
  try {
    const backendUrl = `${API_BASE}/ai-tutor/chat`;
    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        messages,
        topic,
        context,
        conversation_history: conversationHistory,
        language: effectiveLang,
      }),
    });

    const contentType = resp.headers.get("content-type") || "";
    if (resp.ok && contentType.includes("application/json")) {
      const rawText = await resp.text();
      if (rawText && rawText.trim().length > 0) {
        const parsed = safeJsonParse(rawText);
        if (parsed && (parsed.content || parsed.response)) {
          return {
            success: true,
            content: parsed.content || parsed.response,
            latex: parsed.latex || null,
            code: parsed.code || null,
            sources: parsed.sources || ["Gitwolves Neural Core"],
            language_detected: parsed.language || effectiveLang,
          };
        }
      }
    }
  } catch (err) {
    console.warn("[AI Tutor Chat] Primary backend unreachable. Falling back...", err.message);
  }

  // ─── Step 2: Direct Groq Query ────────────────────────────────────────────
  const groqResult = await queryGroqDirectly({
    userQuery: promptText,
    conversationHistory: messages,
    language: effectiveLang,
  });
  if (groqResult) {
    return {
      success: true,
      content: groqResult.vocal_prose_script,
      latex: groqResult.mathematical_latex_formula,
      code: groqResult.qiskit_executable_code,
      sources: groqResult.sources,
      quiz: groqResult.quiz_generation_object,
      language_detected: effectiveLang,
    };
  }

  // ─── Step 3: Offline Fallback ─────────────────────────────────────────────
  const offline = getOfflineKnowledge(promptText, effectiveLang);
  return {
    success: true,
    content: offline.vocal_prose_script,
    latex: offline.mathematical_latex_formula,
    code: offline.qiskit_executable_code,
    sources: offline.sources,
    quiz: offline.quiz_generation_object,
    language_detected: effectiveLang,
  };
}
