import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, CheckCircle2, RefreshCw, ChevronDown, ChevronRight, ChevronLeft,
  Code2, Brain, CheckCircle, XCircle, Lightbulb, Copy,
  Check, Terminal, BookOpen, Zap, BarChart2, AlertTriangle,
  Loader2, Download, Maximize2, Minimize2, Settings2, Sparkles,
  Layers, Plus, Trash2, Cpu, FileCode, HelpCircle, ShieldCheck, Send
} from "lucide-react";
import MathRenderer, { LatexBlock } from "./MathRenderer";
import API_BASE from "../config/api";
import { chatAiTutorSafe } from "../services/aiTutorClient";
import { simulateQuantumCodeClient, checkQuantumCodeClient } from "../services/quantumSimClient";

const API = API_BASE;

// ─── Curated Quantum Problems ────────────────────────────────────────────────
const PROBLEMS = [
  {
    id: "bell_state",
    title: "Create a Bell State (|Φ⁺⟩)",
    difficulty: "Beginner",
    diffColor: "#10b981",
    tags: ["Entanglement", "Hadamard", "CNOT"],
    description: "Create a maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 using Qiskit. When measured, both qubits must always collapse to the same state with ~50% probability each.",
    formula: "|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}",
    hints: [
      "Step 1: Apply a Hadamard gate (H) to qubit 0: `qc.h(0)`",
      "Step 2: Apply a CNOT gate with qubit 0 as control and qubit 1 as target: `qc.cx(0, 1)`",
      "Step 3: Measure both qubits: `qc.measure([0, 1], [0, 1])`",
    ],
    starterCode: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# 1. Initialize a 2-qubit, 2-classical-bit quantum circuit
qc = QuantumCircuit(2, 2)

# Step 1: Put qubit 0 into superposition
qc.h(0)

# Step 2: Entangle qubit 0 with qubit 1 using CNOT
# TODO: Enter the CNOT gate below:
# qc.cx(0, 1)

# Step 3: Measure both qubits
qc.measure([0, 1], [0, 1])

# Display circuit summary in terminal
print("Quantum Circuit Depth:", qc.depth())
print("Quantum Operations:", dict(qc.count_ops()))
`,
    expectedPatterns: ["00", "11"],
    theory: "The Bell state is the simplest bipartite maximally entangled state. Its measurement outcomes are completely correlated — verifying non-local quantum correlations and Bell's inequality.",
  },
  {
    id: "ghz_state",
    title: "3-Qubit GHZ State (|GHZ⟩)",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    tags: ["Multi-Qubit", "GHZ", "Entanglement"],
    description: "Prepare the 3-qubit Greenberger–Horne–Zeilinger (GHZ) state: (|000⟩ + |111⟩)/√2. All three qubits will be entangled such that measuring any one collapses the remaining two.",
    formula: "|\\text{GHZ}\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}",
    hints: [
      "Apply Hadamard on qubit 0: `qc.h(0)`",
      "Cascade CNOT gates: `qc.cx(0, 1)` followed by `qc.cx(1, 2)`",
      "Measure all three qubits into classical bits 0, 1, 2",
    ],
    starterCode: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# 3-qubit GHZ state circuit
qc = QuantumCircuit(3, 3)

# 1. Superposition on lead qubit
qc.h(0)

# 2. Entanglement cascade
qc.cx(0, 1)
# TODO: Entangle qubit 1 with qubit 2:
# qc.cx(1, 2)

# 3. Measurement
qc.measure([0, 1, 2], [0, 1, 2])

print("GHZ state prepared with 3 qubits.")
`,
    expectedPatterns: ["000", "111"],
    theory: "GHZ states exhibit non-local correlations that refute local hidden-variable theories more decisively than Bell states, without requiring statistical inequalities.",
  },
  {
    id: "grover_2qubit",
    title: "Grover's Search (Target: |11⟩)",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    tags: ["Grover", "Oracle", "Diffuser"],
    description: "Implement Grover's quantum search algorithm for 2 qubits to find the target state |11⟩. Grover's algorithm achieves a quadratic speedup O(√N) over classical unstructured search.",
    formula: "G = (2|\\psi\\rangle\\langle\\psi| - I) \\cdot U_f",
    hints: [
      "Step 1: Superposition with H on qubits 0 and 1: `qc.h([0, 1])`",
      "Step 2: Phase oracle for |11⟩ using CZ gate: `qc.cz(0, 1)`",
      "Step 3: Grover diffuser reflection: H on all, CZ, H on all",
      "Step 4: Measure both qubits",
    ],
    starterCode: `from qiskit import QuantumCircuit

# 2-qubit Grover's Search for marked state |11>
qc = QuantumCircuit(2, 2)

# Step 1: Initialize uniform superposition
qc.h([0, 1])

# Step 2: Phase Oracle (flips phase of |11>)
qc.cz(0, 1)

# Step 3: Grover Diffuser (reflection about the mean)
qc.h([0, 1])
# TODO: Add CZ and final H gates for diffuser:
# qc.cz(0, 1)
# qc.h([0, 1])

# Step 4: Measure outcomes
qc.measure([0, 1], [0, 1])

print("Grover iteration complete. Target state |11> should have ~100% probability.")
`,
    expectedPatterns: ["11"],
    theory: "For N=4 (2 qubits), exactly one Grover rotation rotates the state vector directly onto the marked state |11⟩, giving theoretically 100% success probability.",
  },
  {
    id: "teleportation",
    title: "Quantum Teleportation Protocol",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    tags: ["Teleportation", "EPR Pair", "Bell Measurement"],
    description: "Transfer an unknown quantum state |ψ⟩ from qubit 0 to qubit 2 using shared entanglement (an EPR pair between qubits 1 and 2) and 2 classical bits of communication.",
    formula: "|\\psi\\rangle_0 \\otimes |\\Phi^+\\rangle_{12} \\rightarrow |\\dots\\rangle \\otimes |\\psi\\rangle_2",
    hints: [
      "Prepare EPR pair between qubits 1 and 2 (H on 1, CX 1->2)",
      "Bell measurement on Alice's side: CX 0->1, then H on 0",
      "Measure Alice's qubits 0 and 1 to classical bits",
    ],
    starterCode: `from qiskit import QuantumCircuit

# Quantum Teleportation: 3 qubits, 3 classical bits
# q0: State to teleport (|psi>)
# q1: Alice's half of EPR pair
# q2: Bob's half of EPR pair
qc = QuantumCircuit(3, 3)

# 1. Prepare arbitrary state on qubit 0 (e.g., |1> or rotated)
qc.x(0)  # Teleporting state |1>

# 2. Create shared EPR Bell pair between Alice (q1) and Bob (q2)
qc.h(1)
qc.cx(1, 2)

# 3. Alice performs Bell-state measurement on q0 and q1
qc.cx(0, 1)
qc.h(0)
qc.measure([0, 1], [0, 1])

# 4. Measure Bob's qubit 2
qc.measure(2, 2)

print("Teleportation protocol circuit built.")
`,
    expectedPatterns: ["1"],
    theory: "Quantum teleportation does not transmit information faster than light because Bob cannot reconstruct the state until Alice sends her 2 classical measurement outcomes.",
  },
  {
    id: "superdense_coding",
    title: "Superdense Coding (2 Bits / 1 Qubit)",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    tags: ["Superdense", "Communication", "Bell Basis"],
    description: "Transmit 2 classical bits of information ('11') by physically sending only a single qubit, utilizing a pre-shared entangled Bell pair.",
    formula: "2 \\text{ classical bits transmitted via } 1 \\text{ physical qubit}",
    hints: [
      "EPR pair on qubits 0 and 1: H(0), CX(0, 1)",
      "To encode '11', Alice applies Z then X to qubit 0: `qc.z(0)` and `qc.x(0)`",
      "Bob decodes with CX(0, 1), H(0) and measures both qubits",
    ],
    starterCode: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)

# 1. Prepare entangled Bell pair
qc.h(0)
qc.cx(0, 1)

# 2. Alice encodes 2 classical bits ('11') into qubit 0
# For message '11', apply Z and X gates:
qc.z(0)
qc.x(0)

# 3. Bob decodes Bell state
qc.cx(0, 1)
qc.h(0)

# 4. Measure to retrieve classical message '11'
qc.measure([0, 1], [0, 1])

print("Superdense coding: Expected decoded output '11'")
`,
    expectedPatterns: ["11"],
    theory: "Superdense coding is the dual of quantum teleportation. It doubles the classical capacity of a quantum channel by leveraging pre-existing quantum entanglement.",
  },
  {
    id: "deutsch_jozsa",
    title: "Deutsch-Jozsa Algorithm",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    tags: ["Deutsch-Jozsa", "Oracle", "Quantum Speedup"],
    description: "Determine whether a hidden boolean function f(x) is constant (all 0s or all 1s) or balanced (half 0s, half 1s) in a single quantum query, whereas classically it requires 2^(n-1)+1 queries.",
    formula: "f: \\{0,1\\}^n \\rightarrow \\{0,1\\}",
    hints: [
      "Initialize input qubit in |0⟩, ancilla qubit in |1⟩",
      "Apply Hadamard to both qubits to create phase kickback",
      "Balanced oracle: CX gate between input and ancilla",
      "Hadamard on input qubit and measure",
    ],
    starterCode: `from qiskit import QuantumCircuit

# Deutsch-Jozsa with 1 input qubit and 1 ancilla qubit
qc = QuantumCircuit(2, 1)

# Prepare ancilla in |-> state for phase kickback
qc.x(1)
qc.h([0, 1])

# Oracle for balanced function f(x) = x
qc.cx(0, 1)

# Interference on input qubit
qc.h(0)

# Measure input qubit: 0 = Constant, 1 = Balanced
qc.measure(0, 0)

print("Balanced function: output will measure |1> with 100% certainty.")
`,
    expectedPatterns: ["1"],
    theory: "Deutsch-Jozsa was the first quantum algorithm demonstrating exponential separation in query complexity between deterministic classical computing and quantum computing.",
  },
  {
    id: "qft_2qubit",
    title: "2-Qubit Quantum Fourier Transform",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    tags: ["QFT", "Phase", "Fourier Transform"],
    description: "Implement the Quantum Fourier Transform (QFT) on 2 qubits using Hadamard, Controlled-Phase (CP) rotation, and SWAP gates.",
    formula: "|j\\rangle \\mapsto \\frac{1}{\\sqrt{N}} \\sum_{k=0}^{N-1} \\omega_N^{jk} |k\\rangle",
    hints: [
      "Hadamard on qubit 1",
      "Controlled Phase gate between 0 and 1 with angle π/2",
      "Hadamard on qubit 0",
      "SWAP qubits 0 and 1",
    ],
    starterCode: `from qiskit import QuantumCircuit
import numpy as np

qc = QuantumCircuit(2, 2)

# Initialize input state |01>
qc.x(0)

# 2-qubit QFT implementation
qc.h(1)
qc.cp(np.pi / 2, 0, 1)
qc.h(0)
qc.swap(0, 1)

qc.measure([0, 1], [0, 1])
print("Quantum Fourier Transform complete.")
`,
    expectedPatterns: [],
    theory: "QFT is the quantum analogue of the discrete Fourier transform and forms the algorithmic core of Shor's factoring algorithm and Quantum Phase Estimation.",
  },
  {
    id: "vqe_ansatz",
    title: "VQE Molecular Ansatz Circuit",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    tags: ["VQE", "Variational", "QML", "Ansatz"],
    description: "Construct a parameterized Variational Quantum Eigensolver (VQE) ansatz circuit for molecular ground state simulation (e.g. H₂ molecule).",
    formula: "E(\\vec{\\theta}) = \\langle\\psi(\\vec{\\theta})|\\hat{H}|\\psi(\\vec{\\theta})\\rangle \\geq E_0",
    hints: [
      "Layer 1: Parameterized RY rotations on both qubits",
      "Entanglement layer: CNOT between qubit 0 and 1",
      "Layer 2: Parameterized RZ rotations",
    ],
    starterCode: `from qiskit import QuantumCircuit
import numpy as np

# Variational parameter
theta = np.pi / 4

qc = QuantumCircuit(2, 2)

# Layer 1: Single-qubit parameterized rotations
qc.ry(theta, 0)
qc.ry(theta, 1)

# Entanglement layer
qc.cx(0, 1)

# Layer 2: RZ rotations
qc.rz(theta, 0)
qc.rz(theta, 1)

qc.measure([0, 1], [0, 1])
print("VQE Hardware-efficient ansatz generated.")
`,
    expectedPatterns: [],
    theory: "VQE is a flagship NISQ algorithm combining a parameterized quantum circuit with a classical optimizer to determine minimum eigenvalues of molecular Hamiltonians.",
  },
];

// ─── Quick Templates for Playground ───────────────────────────────────────────
const PLAYGROUND_TEMPLATES = [
  {
    name: "Blank Quantum Script",
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a quantum circuit with 2 qubits and 2 classical bits
qc = QuantumCircuit(2, 2)

# Write your quantum gates here:
qc.h(0)
qc.cx(0, 1)

# Measure
qc.measure_all()

# Print telemetry
print("Circuit summary:", qc)
`,
  },
  {
    name: "Quantum Random Number Generator (QRNG)",
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# True Quantum Random Number Generator using superposition
num_bits = 4
qc = QuantumCircuit(num_bits, num_bits)

# Apply Hadamard to all qubits for unbiased 50/50 superposition
qc.h(range(num_bits))
qc.measure(range(num_bits), range(num_bits))

print("QRNG circuit initialized for 4 random bits.")
`,
  },
  {
    name: "Quantum Phase Estimation (QPE)",
    code: `from qiskit import QuantumCircuit
import numpy as np

# Quantum Phase Estimation for T-gate (angle = pi/4)
qc = QuantumCircuit(4, 3)

# Prepare eigenstate |1> on target qubit 3
qc.x(3)

# Superposition on counting qubits
qc.h([0, 1, 2])

# Controlled unitary operations
qc.cp(np.pi / 4, 0, 3)
qc.cp(np.pi / 2, 1, 3)
qc.cp(np.pi, 2, 3)

# Inverse QFT on counting qubits
qc.swap(0, 2)
qc.h(0)
qc.cp(-np.pi / 2, 0, 1)
qc.h(1)
qc.cp(-np.pi / 4, 0, 2)
qc.cp(-np.pi / 2, 1, 2)
qc.h(2)

qc.measure([0, 1, 2], [0, 1, 2])
print("QPE circuit assembled.")
`,
  },
  {
    name: "Bernstein-Vazirani Algorithm",
    code: `from qiskit import QuantumCircuit

# Secret string: '101'
secret = '101'
n = len(secret)
qc = QuantumCircuit(n + 1, n)

# Ancilla in |-> state
qc.x(n)
qc.h(range(n + 1))

# Oracle for secret bitstring
for i, bit in enumerate(reversed(secret)):
    if bit == '1':
        qc.cx(i, n)

# Interfere and measure
qc.h(range(n))
qc.measure(range(n), range(n))

print(f"Bernstein-Vazirani secret string '{secret}' will be retrieved in 1 shot!")
`,
  },
];

// ─── Histogram Component ──────────────────────────────────────────────────────
function ResultsHistogram({ counts, shots = 1024 }) {
  if (!counts || Object.keys(counts).length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
        No measurement counts available yet. Click <strong>Run Code</strong> to simulate.
      </div>
    );
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || shots;
  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
      {entries.map(([state, count]) => {
        const pct = ((count / total) * 100).toFixed(1);
        const barW = (count / max) * 100;
        return (
          <div key={state} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.85rem",
                color: "#ffffff",
                width: 70,
                textAlign: "right",
                fontWeight: 600,
              }}
            >
              |{state}⟩
            </span>
            <div
              style={{
                flex: 1,
                height: 26,
                background: "rgba(255, 255, 255, 0.04)",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${barW}%`,
                  background: "linear-gradient(90deg, #27272a 0%, #52525b 100%)",
                  borderRadius: 3,
                  transition: "width 0.4s ease",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                }}
              >
                {barW > 25 && (
                  <span style={{ fontSize: "0.78rem", color: "#ffffff", fontFamily: "var(--font-mono, monospace)", fontWeight: 700 }}>
                    {pct}% ({count})
                  </span>
                )}
              </div>
              {barW <= 25 && (
                <span
                  style={{
                    position: "absolute",
                    left: `${barW + 2}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.78rem",
                    color: "#a1a1aa",
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 600,
                  }}
                >
                  {pct}% ({count})
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Quantum Code Lab Component ──────────────────────────────────────────
export default function QuantumCodeLab({ onNavigateToStudio }) {
  // Navigation & Mode
  const [mode, setMode] = useState("problem"); // "problem" | "playground"
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [code, setCode] = useState(PROBLEMS[0].starterCode);

  // Playground state
  const [playgroundTabs, setPlaygroundTabs] = useState([
    { id: "custom_1", name: "experiment_1.py", code: PLAYGROUND_TEMPLATES[0].code },
  ]);
  const [activePlaygroundTabId, setActivePlaygroundTabId] = useState("custom_1");

  // Execution & Check states
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [runError, setRunError] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState("histogram"); // "histogram" | "diagram" | "terminal" | "checks" | "telemetry"

  // Settings
  const [shots, setShots] = useState(1024);
  const [editorFontSize, setEditorFontSize] = useState(13);
  const [showMinimap, setShowMinimap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leftNavCollapsed, setLeftNavCollapsed] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(true);

  // Problem Guide & Hints
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("guide"); // "guide" | "theory"

  // AI Doubt Solver / Copilot
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  // Handle problem selection
  const selectProblem = (p) => {
    setMode("problem");
    setSelectedProblem(p);
    setCode(p.starterCode);
    setRunResult(null);
    setCheckResult(null);
    setRunError(null);
    setShowHint(false);
    setHintIndex(0);
  };

  // Switch to playground tab
  const selectPlaygroundTab = (tabId) => {
    setMode("playground");
    setActivePlaygroundTabId(tabId);
    const tab = playgroundTabs.find((t) => t.id === tabId);
    if (tab) {
      setCode(tab.code);
    }
    setRunResult(null);
    setCheckResult(null);
  };

  // Create new playground tab
  const createPlaygroundTab = () => {
    const newId = `custom_${Date.now()}`;
    const newName = `circuit_${playgroundTabs.length + 1}.py`;
    const newTab = { id: newId, name: newName, code: PLAYGROUND_TEMPLATES[0].code };
    setPlaygroundTabs((prev) => [...prev, newTab]);
    selectPlaygroundTab(newId);
  };

  // Update code when user types
  const handleEditorChange = (newCode) => {
    setCode(newCode || "");
    if (mode === "playground") {
      setPlaygroundTabs((prev) =>
        prev.map((t) => (t.id === activePlaygroundTabId ? { ...t, code: newCode || "" } : t))
      );
    }
  };

  // Load template into current playground tab
  const applyTemplate = (template) => {
    setCode(template.code);
    if (mode === "playground") {
      setPlaygroundTabs((prev) =>
        prev.map((t) => (t.id === activePlaygroundTabId ? { ...t, code: template.code } : t))
      );
    }
  };

  // ─── EXECUTE USER CODE ──────────────────────────────────────────────────────
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunError(null);
    try {
      let data = null;
      try {
        const resp = await fetch(`${API}/simulation/execute-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            framework: "qiskit",
            shots,
            timeout_seconds: 12,
          }),
        });
        const contentType = resp.headers.get("content-type") || "";
        if (resp.ok && contentType.includes("application/json")) {
          data = await resp.json();
        }
      } catch (networkErr) {
        console.warn("[Backend offline or Vercel]:", networkErr.message);
      }

      // If backend is unreachable or returned non-JSON (e.g. Vercel static hosting)
      if (!data) {
        data = simulateQuantumCodeClient(code, shots);
      }

      setRunResult(data);

      if (!data.success && data.error) {
        setRunError(data.error);
        setActiveConsoleTab("terminal");
      } else {
        // Switch to diagram or histogram
        if (data.counts && Object.keys(data.counts).length > 0) {
          setActiveConsoleTab("histogram");
        } else if (data.circuit_diagram) {
          setActiveConsoleTab("diagram");
        } else {
          setActiveConsoleTab("terminal");
        }
      }
    } catch (err) {
      setRunError(err.message);
      setActiveConsoleTab("terminal");
    } finally {
      setIsRunning(false);
    }
  };

  // ─── CHECK USER CODE ────────────────────────────────────────────────────────
  const handleCheckCode = async () => {
    setIsChecking(true);
    setRunError(null);
    try {
      let data = null;
      try {
        const resp = await fetch(`${API}/simulation/check-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            problem_id: mode === "problem" ? selectedProblem.id : null,
            framework: "qiskit",
          }),
        });
        const contentType = resp.headers.get("content-type") || "";
        if (resp.ok && contentType.includes("application/json")) {
          data = await resp.json();
        }
      } catch (networkErr) {
        console.warn("[Backend offline or Vercel]:", networkErr.message);
      }

      // If backend is unreachable or returned non-JSON (e.g. Vercel static hosting)
      if (!data) {
        data = checkQuantumCodeClient(code, mode === "problem" ? selectedProblem?.id : null);
      }

      setCheckResult(data);
      if (data.circuit_telemetry?.counts) {
        setRunResult({
          success: data.passed,
          counts: data.circuit_telemetry.counts,
          circuit_diagram: data.circuit_telemetry.diagram,
          num_qubits: data.circuit_telemetry.num_qubits,
          circuit_depth: data.circuit_telemetry.circuit_depth,
          gate_counts: data.circuit_telemetry.gate_counts,
          execution_time_ms: data.circuit_telemetry.execution_time_ms,
          stdout: data.stdout,
        });
      }
      setActiveConsoleTab("checks");

      // Auto-trigger AI Copilot if check failed
      if (!data.passed) {
        const failureDetails = data.test_results
          ?.filter((t) => !t.passed)
          .map((t) => `- ${t.test}: ${t.detail}`)
          .join("\n");

        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `**Quantum Code Checker Notice** (Score: ${data.score}/100)\n\n${data.summary}\n\n**Failing checks:**\n${failureDetails || "Circuit logic error"}\n\nWould you like me to inspect your code and show how to fix it?`,
            ts: Date.now(),
          },
        ]);
      }
    } catch (err) {
      setRunError(err.message);
      setActiveConsoleTab("terminal");
    } finally {
      setIsChecking(false);
    }
  };

  // ─── ASK AI DOUBT SOLVER ────────────────────────────────────────────────────
  const askAI = async (q) => {
    const question = (q || aiQuestion).trim();
    if (!question) return;
    setAiQuestion("");
    setAiMessages((prev) => [...prev, { role: "user", content: question, ts: Date.now() }]);
    setAiLoading(true);
    setAiError(null);

    const contextPayload = `
Quantum IDE Context:
Mode: ${mode}
${mode === "problem" ? `Problem: ${selectedProblem.title} (${selectedProblem.difficulty})` : "Custom Quantum Playground"}
User Code:
\`\`\`python
${code}
\`\`\`
${runResult ? `Execution Output / Counts: ${JSON.stringify(runResult.counts)}` : ""}
${runError ? `Error: ${runError}` : ""}
${checkResult ? `Check Score: ${checkResult.score}/100, Diagnostics: ${JSON.stringify(checkResult.diagnostics)}` : ""}
`;

    try {
      const data = await chatAiTutorSafe({
        query: question,
        messages: [
          ...aiMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: question },
        ],
        topic: mode === "problem" ? selectedProblem.title : "Quantum Programming & Qiskit",
        conversationHistory: aiMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        context: contextPayload,
      });

      const answer = data.content || data.response || data.answer || "Quantum AI Copilot response generated.";
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, model: data.model || data._active_model || "Groq LPU · GPT-OSS 120B", ts: Date.now() },
      ]);
    } catch (err) {
      setAiError("AI Copilot active in resilient mode.");
    } finally {
      setAiLoading(false);
    }
  };

  // Monaco Editor Configuration
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register custom Qiskit autocompletion provider
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "QuantumCircuit",
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: "QuantumCircuit(${1:num_qubits}, ${2:num_clbits})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Qiskit QuantumCircuit: Container for quantum gates and registers.",
            range,
          },
          {
            label: "AerSimulator",
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: "AerSimulator()",
            documentation: "Qiskit Aer high-performance noisy/ideal quantum simulator backend.",
            range,
          },
          {
            label: "qc.h",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.h(${1:qubit})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Hadamard gate: creates equal superposition (|0> + |1>)/sqrt(2).",
            range,
          },
          {
            label: "qc.cx",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.cx(${1:control}, ${2:target})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Controlled-NOT (CNOT) gate: entangles two qubits.",
            range,
          },
          {
            label: "qc.cz",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.cz(${1:control}, ${2:target})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Controlled-Z gate: flips phase when both qubits are |1>.",
            range,
          },
          {
            label: "qc.x",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.x(${1:qubit})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Pauli-X (NOT) gate: flips |0> to |1> and vice-versa.",
            range,
          },
          {
            label: "qc.ry",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.ry(${1:theta}, ${2:qubit})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Y-axis rotation gate by angle theta radians.",
            range,
          },
          {
            label: "qc.rz",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.rz(${1:theta}, ${2:qubit})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Z-axis rotation gate by angle theta radians.",
            range,
          },
          {
            label: "qc.measure_all",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.measure_all()",
            documentation: "Measures all qubits into automatically created classical registers.",
            range,
          },
          {
            label: "qc.measure",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "qc.measure([${1:qubits}], [${2:clbits}])",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Measures selected qubits into specific classical register indices.",
            range,
          },
          {
            label: "qc.draw",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "print(qc.draw(output='text'))",
            documentation: "Renders text-based ASCII circuit diagram.",
            range,
          },
        ];
        return { suggestions };
      },
    });

    // Keyboard Shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      handleCheckCode();
    });
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Python file
  const handleDownload = () => {
    const filename = mode === "problem" ? `${selectedProblem.id}.py` : "quantum_circuit.py";
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${leftNavCollapsed ? "48px" : "280px"} 1fr ${aiDrawerOpen ? "360px" : "48px"}`,
        height: "calc(100vh - 56px)",
        background: "#08080a",
        color: "var(--text-primary)",
        overflow: "hidden",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        transition: "grid-template-columns 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ═════════════════════════════════════════════════════════════════════════
          LEFT PANEL: Problems / Playgrounds & Problem Guide
      ═════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          background: "#0e0e12",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Left Header */}
        <div
          style={{
            padding: leftNavCollapsed ? "12px 8px" : "12px 14px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: leftNavCollapsed ? "center" : "space-between",
          }}
        >
          {!leftNavCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Cpu size={16} color="#ffffff" />
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono, monospace)",
                  color: "#ffffff",
                }}
              >
                Quantum Lab
              </span>
            </div>
          )}
          <button
            onClick={() => setLeftNavCollapsed(!leftNavCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#a1a1aa",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
            }}
            title={leftNavCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {leftNavCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {leftNavCollapsed && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 0", flex: 1 }}>
            <button
              onClick={() => {
                setMode("problem");
                setLeftNavCollapsed(false);
              }}
              style={{
                background: mode === "problem" ? "#18181b" : "transparent",
                border: "none",
                color: mode === "problem" ? "#ffffff" : "#71717a",
                cursor: "pointer",
                padding: "8px",
                borderRadius: 4,
              }}
              title="Problems"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => {
                setMode("playground");
                setLeftNavCollapsed(false);
              }}
              style={{
                background: mode === "playground" ? "#18181b" : "transparent",
                border: "none",
                color: mode === "playground" ? "#ffffff" : "#71717a",
                cursor: "pointer",
                padding: "8px",
                borderRadius: 4,
              }}
              title="Playground"
            >
              <Zap size={16} />
            </button>
          </div>
        )}

        {!leftNavCollapsed && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Top Switcher: Problems vs Custom Playground */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                padding: "6px 8px",
                gap: 6,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <button
                onClick={() => setMode("problem")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: mode === "problem" ? "1px solid rgba(255,255,255,0.16)" : "1px solid transparent",
                  background: mode === "problem" ? "#27272a" : "transparent",
                  color: mode === "problem" ? "#ffffff" : "#a1a1aa",
                  fontWeight: mode === "problem" ? 600 : 500,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <BookOpen size={13} />
                Problems ({PROBLEMS.length})
              </button>
              <button
                onClick={() => {
                  setMode("playground");
                  if (playgroundTabs.length > 0) {
                    selectPlaygroundTab(playgroundTabs[0].id);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: mode === "playground" ? "1px solid rgba(255,255,255,0.16)" : "1px solid transparent",
                  background: mode === "playground" ? "#27272a" : "transparent",
                  color: mode === "playground" ? "#ffffff" : "#a1a1aa",
                  fontWeight: mode === "playground" ? 600 : 500,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <Zap size={13} />
                Playground
              </button>
            </div>

            {/* List Content */}
            {mode === "problem" ? (
              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {PROBLEMS.map((p) => {
                  const isSelected = selectedProblem.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectProblem(p)}
                      style={{
                        padding: "10px 12px",
                        marginBottom: 6,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        border: isSelected ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? "#ffffff" : "#a1a1aa",
                          }}
                        >
                          {p.title}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "#d4d4d8",
                            fontFamily: "var(--font-mono, monospace)",
                            background: "#18181b",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {p.difficulty}
                        </span>
                        {p.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "0.65rem",
                              color: "#71717a",
                              fontFamily: "var(--font-mono, monospace)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 10px" }}>
                  <span style={{ fontSize: "0.72rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                    My Quantum Files
                  </span>
                  <button
                    onClick={createPlaygroundTab}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.72rem",
                      background: "#18181b",
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      color: "#ffffff",
                      padding: "4px 9px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <Plus size={12} /> New File
                  </button>
                </div>

                {playgroundTabs.map((tab) => {
                  const isActive = activePlaygroundTabId === tab.id;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => selectPlaygroundTab(tab.id)}
                      style={{
                        padding: "8px 10px",
                        marginBottom: 6,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: isActive ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        border: isActive ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FileCode size={13} color={isActive ? "#ffffff" : "#71717a"} />
                        <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: isActive ? "#ffffff" : "#a1a1aa" }}>
                          {tab.name}
                        </span>
                      </div>
                      {playgroundTabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = playgroundTabs.filter((t) => t.id !== tab.id);
                            setPlaygroundTabs(next);
                            if (tab.id === activePlaygroundTabId) {
                              selectPlaygroundTab(next[0].id);
                            }
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#71717a",
                            cursor: "pointer",
                            padding: 2,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Templates Section */}
                <div style={{ marginTop: 18, borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 12 }}>
                  <div style={{ fontSize: "0.7rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8, paddingLeft: 4 }}>
                    Quick-Load Templates
                  </div>
                  {PLAYGROUND_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      onClick={() => applyTemplate(tmpl)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "7px 9px",
                        marginBottom: 4,
                        borderRadius: 5,
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.04)",
                        color: "#a1a1aa",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        e.currentTarget.style.color = "#a1a1aa";
                      }}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Spec Card (when in problem mode) */}
            {mode === "problem" && (
              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "12px",
                  background: "#0a0a0d",
                  maxHeight: "40%",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", gap: 14, marginBottom: 10, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 6 }}>
                  <button
                    onClick={() => setActiveLeftTab("guide")}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: activeLeftTab === "guide" ? "2px solid #ffffff" : "2px solid transparent",
                      fontSize: "0.78rem",
                      fontWeight: activeLeftTab === "guide" ? 700 : 500,
                      color: activeLeftTab === "guide" ? "#ffffff" : "#71717a",
                      cursor: "pointer",
                      paddingBottom: 4,
                    }}
                  >
                    Instructions
                  </button>
                  <button
                    onClick={() => setActiveLeftTab("theory")}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: activeLeftTab === "theory" ? "2px solid #ffffff" : "2px solid transparent",
                      fontSize: "0.78rem",
                      fontWeight: activeLeftTab === "theory" ? 700 : 500,
                      color: activeLeftTab === "theory" ? "#ffffff" : "#71717a",
                      cursor: "pointer",
                      paddingBottom: 4,
                    }}
                  >
                    Physics Theory
                  </button>
                </div>

                {activeLeftTab === "guide" ? (
                  <div>
                    <p style={{ fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.55, margin: "0 0 10px 0" }}>
                      {selectedProblem.description}
                    </p>
                    {selectedProblem.formula && (
                      <div
                        style={{
                          background: "#141418",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          padding: "8px 10px",
                          borderRadius: 5,
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        <LatexBlock tex={selectedProblem.formula} display={true} />
                      </div>
                    )}
                    {/* Hints Accordion */}
                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => setShowHint(!showHint)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          width: "100%",
                          background: "#18181b",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          color: "#e4e4e7",
                          padding: "6px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <Lightbulb size={13} color="#ffffff" />
                        {showHint ? "Hide Step-by-Step Hint" : "Need a Hint?"}
                      </button>
                      {showHint && (
                        <div
                          style={{
                            background: "#141418",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 4,
                            padding: "10px",
                            marginTop: 6,
                          }}
                        >
                          <div style={{ fontSize: "0.76rem", color: "#a1a1aa", lineHeight: 1.5, marginBottom: 8 }}>
                            {selectedProblem.hints[hintIndex]}
                          </div>
                          {selectedProblem.hints.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <button
                                disabled={hintIndex === 0}
                                onClick={() => setHintIndex((i) => Math.max(0, i - 1))}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: hintIndex === 0 ? "rgba(255, 255, 255, 0.25)" : "#ffffff",
                                  cursor: hintIndex === 0 ? "default" : "pointer",
                                  fontSize: "0.72rem",
                                }}
                              >
                                ← Prev
                              </button>
                              <span style={{ fontSize: "0.68rem", color: "#71717a", fontFamily: "var(--font-mono, monospace)" }}>
                                {hintIndex + 1} / {selectedProblem.hints.length}
                              </span>
                              <button
                                disabled={hintIndex === selectedProblem.hints.length - 1}
                                onClick={() => setHintIndex((i) => Math.min(selectedProblem.hints.length - 1, i + 1))}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: hintIndex === selectedProblem.hints.length - 1 ? "rgba(255, 255, 255, 0.25)" : "#ffffff",
                                  cursor: hintIndex === selectedProblem.hints.length - 1 ? "default" : "pointer",
                                  fontSize: "0.72rem",
                                }}
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.6 }}>
                    {selectedProblem.theory}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          CENTER PANEL: Monaco Editor + Toolbar + Resizable Output Deck
      ═════════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#08080a" }}>
        {/* Editor Top Control Bar */}
        <div
          style={{
            padding: "8px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "#0e0e12",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {/* Active File / Problem Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#ffffff",
                background: "#18181b",
                padding: "3px 9px",
                borderRadius: 4,
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              {mode === "problem" ? `${selectedProblem.id}.py` : "playground.py"}
            </span>

            <span
              style={{
                fontSize: "0.7rem",
                color: "#a1a1aa",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#71717a", display: "inline-block" }} />
              Qiskit 2.2 · Python 3.10
            </span>
          </div>

          {/* Action Buttons: Run Code, Check Code, Shots, Settings */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Shots Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#18181b", padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <span style={{ fontSize: "0.7rem", color: "#71717a", fontFamily: "var(--font-mono, monospace)" }}>Shots:</span>
              <select
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-mono, monospace)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value={100} style={{ background: "#18181b" }}>100</option>
                <option value={512} style={{ background: "#18181b" }}>512</option>
                <option value={1024} style={{ background: "#18181b" }}>1024</option>
                <option value={4096} style={{ background: "#18181b" }}>4096</option>
                <option value={8192} style={{ background: "#18181b" }}>8192</option>
              </select>
            </div>

            {/* Check Code Button */}
            <button
              onClick={handleCheckCode}
              disabled={isChecking || isRunning}
              style={{
                background: "#18181b",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#ffffff",
                padding: "6px 14px",
                borderRadius: 5,
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: isChecking ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
              title="Runs static linting, quantum analysis, and grades against problem test-cases (Ctrl+Shift+Enter)"
            >
              {isChecking ? <Loader2 size={13} className="animate-spin" color="#ffffff" /> : <ShieldCheck size={14} color="#ffffff" />}
              {isChecking ? "Checking..." : "Check Code"}
            </button>

            {/* Run Code Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunning || isChecking}
              style={{
                background: "#ffffff",
                border: "none",
                color: "#000000",
                padding: "6px 16px",
                borderRadius: 5,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: isRunning ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
              title="Runs your code on the Python Qiskit engine and measures quantum states (Ctrl+Enter)"
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" color="#000000" /> : <Play size={13} fill="#000000" color="#000000" />}
              {isRunning ? "Simulating..." : "Run Code"}
            </button>

            {/* Utility icons: Copy, Download, Studio */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, borderLeft: "1px solid rgba(255, 255, 255, 0.1)", paddingLeft: 6 }}>
              <button
                onClick={handleCopyCode}
                style={{
                  background: "#18181b",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: copied ? "#ffffff" : "#a1a1aa",
                  padding: "5px 7px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                title={copied ? "Copied!" : "Copy Code"}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>

              <button
                onClick={handleDownload}
                style={{
                  background: "#18181b",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#a1a1aa",
                  padding: "5px 7px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                title="Download .py file"
              >
                <Download size={13} />
              </button>

              {onNavigateToStudio && (
                <button
                  onClick={() => onNavigateToStudio()}
                  style={{
                    background: "#18181b",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#ffffff",
                    padding: "5px 9px",
                    borderRadius: 4,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                  title="Open visual drag-and-drop circuit studio"
                >
                  <Cpu size={12} /> Studio
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div style={{ flex: "1 1 50%", position: "relative", minHeight: 200 }}>
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: editorFontSize,
              fontFamily: "var(--font-mono, JetBrains Mono, Fira Code, Consolas, monospace)",
              fontLigatures: true,
              minimap: { enabled: showMinimap },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              lineNumbers: "on",
              renderLineHighlight: "all",
              bracketPairColorization: { enabled: true },
              cursorBlinking: "smooth",
              smoothScrolling: true,
              folding: true,
              padding: { top: 10, bottom: 10 },
            }}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            OUTPUT DECK: Tabs for Histogram, ASCII Diagram, Terminal, Checks
        ═════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            flex: "1 1 50%",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "#08080a",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Deck Tab Bar */}
          <div
            style={{
              padding: "0 12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              background: "#0e0e12",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 38,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4, height: "100%" }}>
              {/* Histogram Tab */}
              <button
                onClick={() => setActiveConsoleTab("histogram")}
                style={{
                  height: "100%",
                  padding: "0 12px",
                  background: activeConsoleTab === "histogram" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  border: "none",
                  borderBottom: activeConsoleTab === "histogram" ? "2px solid #ffffff" : "2px solid transparent",
                  color: activeConsoleTab === "histogram" ? "#ffffff" : "#71717a",
                  fontSize: "0.78rem",
                  fontWeight: activeConsoleTab === "histogram" ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <BarChart2 size={13} color={activeConsoleTab === "histogram" ? "#ffffff" : "#71717a"} />
                Measurement Histogram
                {runResult?.counts && (
                  <span
                    style={{
                      background: "#18181b",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#e4e4e7",
                      fontSize: "0.62rem",
                      padding: "1px 5px",
                      borderRadius: 3,
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    {Object.keys(runResult.counts).length} states
                  </span>
                )}
              </button>

              {/* Circuit Diagram Tab */}
              <button
                onClick={() => setActiveConsoleTab("diagram")}
                style={{
                  height: "100%",
                  padding: "0 12px",
                  background: activeConsoleTab === "diagram" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  border: "none",
                  borderBottom: activeConsoleTab === "diagram" ? "2px solid #ffffff" : "2px solid transparent",
                  color: activeConsoleTab === "diagram" ? "#ffffff" : "#71717a",
                  fontSize: "0.78rem",
                  fontWeight: activeConsoleTab === "diagram" ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Code2 size={13} color={activeConsoleTab === "diagram" ? "#ffffff" : "#71717a"} />
                Circuit Diagram
              </button>

              {/* Code Check / Test Cases Tab */}
              <button
                onClick={() => setActiveConsoleTab("checks")}
                style={{
                  height: "100%",
                  padding: "0 12px",
                  background: activeConsoleTab === "checks" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  border: "none",
                  borderBottom: activeConsoleTab === "checks" ? "2px solid #ffffff" : "2px solid transparent",
                  color: activeConsoleTab === "checks" ? "#ffffff" : "#71717a",
                  fontSize: "0.78rem",
                  fontWeight: activeConsoleTab === "checks" ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldCheck size={13} color={activeConsoleTab === "checks" ? "#ffffff" : "#71717a"} />
                Check & Tests
                {checkResult && (
                  <span
                    style={{
                      background: "#18181b",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#e4e4e7",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 3,
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    {checkResult.score}/100
                  </span>
                )}
              </button>

              {/* Terminal / Stdout Tab */}
              <button
                onClick={() => setActiveConsoleTab("terminal")}
                style={{
                  height: "100%",
                  padding: "0 12px",
                  background: activeConsoleTab === "terminal" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  border: "none",
                  borderBottom: activeConsoleTab === "terminal" ? "2px solid #ffffff" : "2px solid transparent",
                  color: activeConsoleTab === "terminal" ? "#ffffff" : "#71717a",
                  fontSize: "0.78rem",
                  fontWeight: activeConsoleTab === "terminal" ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Terminal size={13} color={activeConsoleTab === "terminal" ? "#ffffff" : "#71717a"} />
                Terminal & Logs
                {runError && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                    }}
                  />
                )}
              </button>
            </div>

            {/* Execution Telemetry Badge */}
            {runResult && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.7rem", color: "#71717a", fontFamily: "var(--font-mono, monospace)" }}>
                {runResult.num_qubits > 0 && <span>Qubits: <strong style={{ color: "#e4e4e7" }}>{runResult.num_qubits}</strong></span>}
                {runResult.circuit_depth > 0 && <span>Depth: <strong style={{ color: "#e4e4e7" }}>{runResult.circuit_depth}</strong></span>}
                {runResult.execution_time_ms > 0 && <span>Time: <strong style={{ color: "#e4e4e7" }}>{runResult.execution_time_ms}ms</strong></span>}
              </div>
            )}
          </div>

          {/* Deck Body Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
            {/* 1. HISTOGRAM TAB */}
            {activeConsoleTab === "histogram" && (
              <div>
                {runResult?.counts ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: "0.78rem", color: "#a1a1aa", fontWeight: 600 }}>
                        Statistical Measurement Distribution ({shots} shots simulated)
                      </span>
                    </div>
                    <ResultsHistogram counts={runResult.counts} shots={shots} />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "35px 20px", color: "#71717a", fontSize: "0.82rem" }}>
                    Run your circuit to view measurement probabilities and state counts.
                  </div>
                )}
              </div>
            )}

            {/* 2. CIRCUIT DIAGRAM TAB */}
            {activeConsoleTab === "diagram" && (
              <div>
                {runResult?.circuit_diagram ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: "0.72rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                        Qiskit Text Circuit Representation
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(runResult.circuit_diagram);
                        }}
                        style={{
                          background: "#18181b",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#a1a1aa",
                          fontSize: "0.7rem",
                          padding: "4px 9px",
                          borderRadius: 4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Copy size={11} /> Copy Diagram
                      </button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        background: "#0a0a0d",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: 6,
                        padding: "16px",
                        fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                        fontSize: "0.8rem",
                        lineHeight: 1.4,
                        color: "#e4e4e7",
                        overflowX: "auto",
                        whiteSpace: "pre",
                      }}
                    >
                      {runResult.circuit_diagram}
                    </pre>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "35px 20px", color: "#71717a", fontSize: "0.82rem" }}>
                    No circuit diagram available. Define a <code>QuantumCircuit</code> and run your code.
                  </div>
                )}
              </div>
            )}

            {/* 3. CHECKS & TESTS TAB */}
            {activeConsoleTab === "checks" && (
              <div>
                {checkResult ? (
                  <div>
                    {/* Top Score Banner */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: 6,
                        background: "#141418",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {checkResult.passed ? (
                          <CheckCircle size={18} color="#ffffff" />
                        ) : (
                          <XCircle size={18} color="#71717a" />
                        )}
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
                            {checkResult.summary}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#71717a" }}>
                            {checkResult.passed ? "All quantum requirements verified." : "Some test assertions or quantum checks did not pass."}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 900,
                            fontFamily: "var(--font-mono, monospace)",
                            color: "#ffffff",
                          }}
                        >
                          {checkResult.score}%
                        </span>
                      </div>
                    </div>

                    {/* Test Case Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {checkResult.test_results?.map((t, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 5,
                            background: "#141418",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {t.passed ? <CheckCircle size={14} color="#ffffff" /> : <XCircle size={14} color="#71717a" />}
                            <span style={{ fontSize: "0.76rem", fontWeight: 600, color: t.passed ? "#e4e4e7" : "#a1a1aa" }}>
                              {t.test}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "#71717a", fontFamily: "var(--font-mono, monospace)" }}>
                            {t.detail}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Diagnostics / Deprecations */}
                    {checkResult.diagnostics?.length > 0 && (
                      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 12 }}>
                        <div style={{ fontSize: "0.74rem", color: "#e4e4e7", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                          <AlertTriangle size={13} color="#a1a1aa" />
                          Quantum Code Diagnostics & Suggestions
                        </div>
                        {checkResult.diagnostics.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 4,
                              background: "#141418",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              marginBottom: 6,
                              fontSize: "0.74rem",
                              color: "#a1a1aa",
                            }}
                          >
                            <div>{d.message}</div>
                            {d.suggestion && (
                              <pre style={{ margin: "6px 0 0 0", color: "#e4e4e7", fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem" }}>
                                {d.suggestion}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "35px 20px", color: "#71717a", fontSize: "0.82rem" }}>
                    Click <strong>Check Code</strong> to run the quantum linter, verify problem test-cases, and score your algorithm.
                  </div>
                )}
              </div>
            )}

            {/* 4. TERMINAL & LOGS TAB */}
            {activeConsoleTab === "terminal" && (
              <div>
                <div
                  style={{
                    background: "#0a0a0d",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 6,
                    padding: "14px",
                    fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                    fontSize: "0.78rem",
                    color: "#e4e4e7",
                    minHeight: 140,
                  }}
                >
                  <div style={{ color: "#71717a", marginBottom: 8 }}>
                    $ python user_quantum_code.py --shots {shots}
                  </div>
                  {runResult?.stdout && (
                    <div style={{ whiteSpace: "pre-wrap", color: "#e4e4e7", marginBottom: 8 }}>
                      {runResult.stdout}
                    </div>
                  )}
                  {runError && (
                    <div style={{ whiteSpace: "pre-wrap", color: "#f87171", background: "#18181b", border: "1px solid rgba(255, 255, 255, 0.15)", padding: 8, borderRadius: 4, marginTop: 8 }}>
                      [Error] {runError}
                    </div>
                  )}
                  {!runResult && !runError && (
                    <div style={{ color: "#71717a" }}>
                      Ready. Run your code to stream terminal standard output and logs.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          RIGHT PANEL: AI Quantum Doubt Solver / Copilot
      ═════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
          background: "#0e0e12",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* AI Header */}
        <div
          style={{
            padding: aiDrawerOpen ? "12px 14px" : "12px 8px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: aiDrawerOpen ? "space-between" : "center",
            background: "#0e0e12",
          }}
        >
          {aiDrawerOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Brain size={16} color="#ffffff" />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ffffff" }}>
                  Quantum AI Copilot
                </span>
                <span style={{ fontSize: "0.65rem", background: "#18181b", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#a1a1aa", padding: "2px 6px", borderRadius: 3, fontWeight: 600 }}>
                  RAG Active
                </span>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a1a1aa",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                }}
                title="Collapse AI Panel"
              >
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setAiDrawerOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
              title="Open AI Copilot"
            >
              <Brain size={18} color="#ffffff" />
              <ChevronLeft size={14} color="#a1a1aa" />
            </button>
          )}
        </div>

        {!aiDrawerOpen && (
          <div
            onClick={() => setAiDrawerOpen(true)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "12px 0",
              color: "#71717a",
            }}
            title="Click to open AI Copilot"
          >
            <span
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 600,
                color: "#71717a",
              }}
            >
              AI Copilot
            </span>
          </div>
        )}

        {aiDrawerOpen && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Quick Prompt Suggestions */}
            <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexWrap: "wrap", gap: 5, background: "#0a0a0d" }}>
              {[
                "Why did my circuit fail?",
                "How to add CNOT gate?",
                "Explain superposition",
                "Optimize circuit depth",
              ].map((pill) => (
                <button
                  key={pill}
                  onClick={() => askAI(pill)}
                  style={{
                    background: "#18181b",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#a1a1aa",
                    padding: "3px 9px",
                    borderRadius: 12,
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.color = "#a1a1aa";
                    e.currentTarget.style.background = "#18181b";
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
              {aiMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#71717a" }}>
                  <Sparkles size={22} color="#a1a1aa" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
                    AI Doubt Solver Ready
                  </div>
                  <div style={{ fontSize: "0.76rem", lineHeight: 1.5, color: "#71717a" }}>
                    Ask anything about your quantum circuit, Qiskit syntax, gates, or algorithm theory.
                  </div>
                </div>
              ) : (
                aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "92%",
                      background: msg.role === "user" ? "#27272a" : "#141418",
                      border: msg.role === "user" ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 8,
                      padding: "9px 13px",
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                      color: msg.role === "user" ? "#ffffff" : "#e4e4e7",
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    {msg.model && (
                      <div style={{ fontSize: "0.62rem", color: "#71717a", marginTop: 4, textAlign: "right" }}>
                        {msg.model}
                      </div>
                    )}
                  </div>
                ))
              )}
              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a1a1aa", fontSize: "0.76rem", padding: "6px" }}>
                  <Loader2 size={13} className="animate-spin" color="#ffffff" /> Analyzing quantum state & retrieving knowledge...
                </div>
              )}
              {aiError && (
                <div style={{ color: "#f87171", fontSize: "0.75rem", background: "#18181b", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "7px 10px", borderRadius: 4 }}>
                  {aiError}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", gap: 6, background: "#0e0e12" }}>
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askAI()}
                placeholder="Ask about your code or quantum algorithm..."
                style={{
                  flex: 1,
                  background: "#141418",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: 5,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  outline: "none",
                }}
              />
              <button
                onClick={() => askAI()}
                disabled={aiLoading || !aiQuestion.trim()}
                style={{
                  background: "#ffffff",
                  border: "none",
                  borderRadius: 5,
                  color: "#000000",
                  padding: "0 12px",
                  cursor: aiLoading || !aiQuestion.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: aiLoading || !aiQuestion.trim() ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <Send size={14} color="#000000" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
