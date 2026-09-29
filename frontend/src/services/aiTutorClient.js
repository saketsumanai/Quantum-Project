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
function safeJsonParse(text) {
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
 * Direct call to Groq LPU API as high-speed resilient fallback
 */
async function queryGroqDirectly({ userQuery, conversationHistory = [], language = "en" }) {
  if (!GROQ_API_KEY) return null;

  const systemPrompt = `You are QuantumLeap's expert Socratic AI Quantum Physics Tutor.
Target Language: ${language === "hi" ? "Hindi (हिंदी)" : language === "hinglish" ? "Hinglish (Hindi written in English alphabets)" : "English"}.
Explain concepts with scientific precision, physical intuition, and clear mathematics.
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
          max_tokens: 1024,
        }),
      });

      if (!response.ok) continue;

      const raw = await response.text();
      const completion = safeJsonParse(raw);
      const content = completion?.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = safeJsonParse(content);
      if (parsed && (parsed.vocal_prose_script || parsed.content)) {
        return {
          success: true,
          vocal_prose_script: parsed.vocal_prose_script || parsed.content,
          mathematical_latex_formula: parsed.mathematical_latex_formula || null,
          qiskit_executable_code: parsed.qiskit_executable_code || null,
          quiz_generation_object: parsed.quiz_generation_object || parsed.quiz || null,
          sources: parsed.sources || ["Groq LPU Quantum Engine"],
          model_used: `Groq LPU (${model})`,
          is_cached_fallback: false,
        };
      } else {
        // Return raw text wrapped nicely
        return {
          success: true,
          vocal_prose_script: content.replace(/```json[\s\S]*```/, "").trim() || content,
          mathematical_latex_formula: null,
          qiskit_executable_code: null,
          quiz_generation_object: null,
          sources: ["Groq LPU Quantum Engine"],
          model_used: `Groq LPU (${model})`,
          is_cached_fallback: false,
        };
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
function getOfflineKnowledge(query) {
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
  // ─── Step 1: Attempt Backend API Call Safely ──────────────────────────────
  try {
    const backendUrl = `${API_BASE}/ai-tutor/query`;
    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_query: userQuery,
        active_circuit_context: circuitContext,
        current_topic: currentTopic,
        user_level: userLevel,
        conversation_history: conversationHistory,
        language,
        model,
        generate_diagram: generateDiagram,
        video_context: videoContext,
      }),
    });

    const contentType = resp.headers.get("content-type") || "";
    if (resp.ok && contentType.includes("application/json")) {
      const rawText = await resp.text();
      if (rawText && rawText.trim().length > 0) {
        const parsed = safeJsonParse(rawText);
        if (parsed && parsed.success) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("[AI Tutor] Primary backend unreachable or returned non-JSON. Falling back to direct neural engine...", err.message);
  }

  // ─── Step 2: Direct Groq LPU Execution ────────────────────────────────────
  const groqResult = await queryGroqDirectly({
    userQuery,
    conversationHistory,
    language,
  });
  if (groqResult) {
    return groqResult;
  }

  // ─── Step 3: Verified Offline Knowledge Fallback ──────────────────────────
  return getOfflineKnowledge(userQuery);
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
        language,
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
          };
        }
      }
    }
  } catch (err) {
    console.warn("[AI Tutor Chat] Primary backend unreachable. Falling back...", err.message);
  }

  // ─── Step 2: Direct Groq Query ────────────────────────────────────────────
  const groqResult = await queryGroqDirectly({
    userQuery: query || (messages.length ? messages[messages.length - 1].content : ""),
    conversationHistory: messages,
    language,
  });
  if (groqResult) {
    return {
      success: true,
      content: groqResult.vocal_prose_script,
      latex: groqResult.mathematical_latex_formula,
      code: groqResult.qiskit_executable_code,
      sources: groqResult.sources,
      quiz: groqResult.quiz_generation_object,
    };
  }

  // ─── Step 3: Offline Fallback ─────────────────────────────────────────────
  const offline = getOfflineKnowledge(query || (messages.length ? messages[messages.length - 1].content : ""));
  return {
    success: true,
    content: offline.vocal_prose_script,
    latex: offline.mathematical_latex_formula,
    code: offline.qiskit_executable_code,
    sources: offline.sources,
    quiz: offline.quiz_generation_object,
  };
}
