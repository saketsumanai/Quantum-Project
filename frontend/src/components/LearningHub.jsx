import React, { useState } from "react";
import { COURSES_DETAILED_CONTENT, DETAILED_MODULES } from "../data/coursesData";
import MathRenderer, { LatexBlock } from "./MathRenderer";
import { useAuth } from "../context/AuthContext";

// ─── Course Catalog & Paths ──────────────────────────────────────────────────

const FEATURED_COURSES = [
  {
    id: "basics-qi",
    title: "Start with the fundamentals",
    courseLabel: "Basics of Quantum Information",
    instructor: "John Watrous & Mark Wilde",
    description: "Begin your quantum journey by mastering qubits, superposition, entanglement, and quantum measurement. Grounded in the full textbooks indexed in our knowledge base.",
    level: "Beginner",
    lessons: 6,
    duration: "8 hours",
    topics: ["Qubits & States", "Superposition", "Entanglement", "Measurement", "Unitary Evolution", "No-Cloning"],
    gradient: "linear-gradient(135deg, #001141 0%, #0F1F4A 100%)",
    accent: "#0F62FE",
    badge: "#78A9FF",
  },
  {
    id: "quantum-algos",
    title: "Start building quantum algorithms",
    courseLabel: "Quantum Algorithm Design",
    instructor: "Andrew Childs & Ronald de Wolf",
    description: "Master Grover's search, Shor's factoring, Phase Estimation, and QFT. Run circuits on our virtual 16-qubit QPU and export Qiskit code at every lesson step.",
    level: "Intermediate",
    lessons: 5,
    duration: "12 hours",
    topics: ["Deutsch-Jozsa", "Grover Search", "Quantum Fourier Transform", "Phase Estimation", "Shor's Factoring"],
    gradient: "linear-gradient(135deg, #1C0F30 0%, #2D1B4E 100%)",
    accent: "#8A3FFC",
    badge: "#A56EFF",
  },
];

const LEARNING_PATHS = [
  { id: "intro", label: "Introduction to Quantum", description: "Superposition, entanglement, and foundational principles", modules: 6, courses: 2 },
  { id: "algorithms", label: "Quantum Algorithm Development", description: "Circuits that demonstrate verifiable quantum speedup", modules: 8, courses: 3 },
  { id: "ml", label: "Quantum Machine Learning", description: "Parameterized circuits, quantum kernels, and QNNs", modules: 7, courses: 2 },
  { id: "physics", label: "Physics & Chemistry Simulation", description: "VQE, molecular Hamiltonians, and Trotterization", modules: 5, courses: 2 },
  { id: "error", label: "Error Correction & Fault Tolerance", description: "Stabilizer codes, surface codes, and thresholds", modules: 6, courses: 2 },
  { id: "nisq", label: "NISQ Applications", description: "Near-term algorithms on noisy quantum processors", modules: 5, courses: 2 },
];

const ALL_COURSES = [
  { id: "basics-qi", title: "Basics of Quantum Information", instructor: "John Watrous & Mark Wilde", level: "Beginner", lessons: 6, path: "intro", duration: "8h", category: "Foundations" },
  { id: "use-qc", title: "Running Circuits on a Real QPU", instructor: "Olivia Lanes & IBM Quantum Team", level: "Beginner", lessons: 2, path: "intro", duration: "5h", category: "Hardware" },
  { id: "quantum-algos", title: "Quantum Algorithm Design", instructor: "Andrew Childs & Ronald de Wolf", level: "Intermediate", lessons: 5, path: "algorithms", duration: "12h", category: "Algorithms" },
  { id: "qml", title: "Quantum Machine Learning", instructor: "Maria Schuld & Nathan Killoran", level: "Intermediate", lessons: 2, path: "ml", duration: "10h", category: "Machine Learning" },
  { id: "vqe", title: "Variational Quantum Eigensolver (VQE/QAOA)", instructor: "M. Cerezo & Jarrod McClean", level: "Intermediate", lessons: 2, path: "physics", duration: "9h", category: "Variational" },
  { id: "qec-intro", title: "Quantum Error Correction for Beginners", instructor: "Daniel Gottesman", level: "Intermediate", lessons: 2, path: "error", duration: "7h", category: "Error Correction" },
  { id: "surface-codes", title: "Surface Codes & Fault Tolerance", instructor: "Austin Fowler & Hector Bombin", level: "Advanced", lessons: 1, path: "error", duration: "7h", category: "Fault Tolerance" },
  { id: "nisq-intro", title: "Quantum Computing in the NISQ Era", instructor: "John Preskill", level: "Beginner", lessons: 1, path: "nisq", duration: "5h", category: "NISQ" },
];

const MODULES = [
  { id: "superposition", title: "Superposition", category: "Quantum Foundations", desc: "Linear combinations of basis states in Hilbert space." },
  { id: "uncertainty", title: "Heisenberg Uncertainty", category: "Quantum Mechanics", desc: "Incompatible observables and non-commuting operators." },
  { id: "entanglement", title: "Quantum Entanglement", category: "Quantum Foundations", desc: "Bell states, EPR paradox, and non-local correlations." },
  { id: "teleportation", title: "Quantum Teleportation", category: "Quantum Protocols", desc: "Transmit unknown states using shared Bell pairs." },
  { id: "qkd", title: "Quantum Key Distribution (BB84)", category: "Quantum Cryptography", desc: "Unconditionally secure communication via physics." },
  { id: "bloch", title: "The Bloch Sphere", category: "Quantum Foundations", desc: "Geometric representation of single-qubit pure & mixed states." },
  { id: "grover-mod", title: "Grover's Search", category: "Quantum Algorithms", desc: "Quadratic speedup on N unsorted items in O(√N) queries." },
  { id: "qft-mod", title: "Quantum Fourier Transform", category: "Quantum Algorithms", desc: "Amplitude frequency transformation in O(n²) gates." },
  { id: "shor-mod", title: "Shor's Factoring Algorithm", category: "Quantum Algorithms", desc: "Exponential speedup for factoring N=pq via order finding." },
  { id: "vqe-mod", title: "Variational Quantum Eigensolver", category: "Variational Algorithms", desc: "Hybrid quantum-classical ground state energy estimation." },
  { id: "qaoa-mod", title: "QAOA for Optimization", category: "Optimization", desc: "Combinatorial Max-Cut solving via alternating unitaries." },
  { id: "qec-mod", title: "Stabilizer Formalism", category: "Error Correction", desc: "CSS codes, Pauli group, and +1 eigenspace syndromes." },
];

const LEVEL_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
  Intermediate: { bg: "rgba(120,169,255,0.12)", text: "#78A9FF", border: "rgba(120,169,255,0.3)" },
  Advanced: { bg: "rgba(165,110,255,0.12)", text: "#A56EFF", border: "rgba(165,110,255,0.3)" },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function LevelBadge({ level }) {
  const c = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
  return (
    <span style={{
      fontSize: "0.72rem",
      fontFamily: "var(--font-mono)",
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: "9999px",
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {level}
    </span>
  );
}

function FeaturedCourseCard({ course, onEnroll }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEnroll(course)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(28, 28, 34, 0.98) 0%, rgba(16, 16, 20, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        minHeight: "250px",
        border: hovered ? "1px solid rgba(255, 255, 255, 0.28)" : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "16px",
        boxShadow: hovered ? "0 16px 40px rgba(0, 0, 0, 0.8)" : "0 10px 30px rgba(0, 0, 0, 0.5)",
        transform: hovered ? "translateY(-2px)" : "none",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "18px",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            STRUCTURED COURSE
          </span>
          <LevelBadge level={course.level} />
        </div>

        <h3 style={{ fontSize: "1.3rem", fontWeight: 500, lineHeight: 1.3, color: "#ffffff", margin: "0 0 6px 0" }}>
          {course.courseLabel || course.title}
        </h3>

        <div style={{ fontSize: "0.82rem", color: "#a1a1aa", marginBottom: "12px" }}>
          Syllabus by {course.instructor}
        </div>

        <p style={{ fontSize: "0.88rem", color: "#d4d4d8", lineHeight: 1.6, margin: "0 0 16px 0" }}>
          {course.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {course.topics?.slice(0, 4).map((topic, tIdx) => (
            <span
              key={tIdx}
              style={{
                fontSize: "0.72rem",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#a1a1aa",
                fontFamily: "var(--font-mono)",
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(255, 255, 255, 0.10)",
        paddingTop: "16px",
        marginTop: "8px",
      }}>
        <span style={{ fontSize: "0.76rem", color: "#a1a1aa", fontFamily: "var(--font-mono)" }}>
          {course.lessons} units · {course.duration}
        </span>
        <button
          style={{
            padding: "8px 18px",
            background: hovered ? "#ffffff" : "rgba(255, 255, 255, 0.05)",
            color: hovered ? "#000000" : "#ffffff",
            border: hovered ? "1px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.14)",
            fontSize: "0.76rem",
            fontWeight: 700,
            cursor: "pointer",
            borderRadius: "8px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: hovered ? "0 0 16px rgba(255, 255, 255, 0.25)" : "none",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          View Syllabus →
        </button>
      </div>
    </div>
  );
}

function PathTile({ path, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(path)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(28, 28, 34, 0.98) 0%, rgba(16, 16, 20, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
        padding: "20px 22px",
        display: "flex", flexDirection: "column", gap: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        border: hovered ? "1px solid rgba(255, 255, 255, 0.24)" : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "14px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        transform: hovered ? "translateY(-1px)" : "none",
        minHeight: "90px",
      }}
    >
      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>
        {path.label}
      </div>
      <div style={{ fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.4 }}>
        {path.description}
      </div>
      <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
        {path.courses} courses · {path.modules} modules
      </div>
      <span style={{ position: "absolute", top: "20px", right: "20px", color: "#ffffff", fontSize: "0.95rem" }}>
        →
      </span>
    </div>
  );
}

function CourseRow({ course, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(course)}
      style={{
        display: "grid", gridTemplateColumns: "1fr auto auto auto",
        alignItems: "center", gap: "16px",
        padding: "16px 20px",
        background: hovered
          ? "linear-gradient(135deg, rgba(28, 28, 34, 0.95) 0%, rgba(16, 16, 20, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
        cursor: "pointer", transition: "all 0.15s ease",
        border: hovered ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid rgba(255, 255, 255, 0.10)",
        borderRadius: "12px",
        marginBottom: "8px",
      }}
    >
      <div>
        <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "#ffffff" }}>{course.title}</div>
        <div style={{ fontSize: "0.78rem", color: "#a1a1aa", marginTop: "3px" }}>by {course.instructor}</div>
      </div>
      <LevelBadge level={course.level} />
      <div style={{ fontSize: "0.78rem", color: "#a1a1aa", textAlign: "right", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
        {course.lessons} units · {course.duration}
      </div>
      <span style={{ color: "#ffffff", fontSize: "1.1rem" }}>→</span>
    </div>
  );
}

function ModuleTile({ mod, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(mod)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(28, 28, 34, 0.98) 0%, rgba(16, 16, 20, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
        padding: "20px",
        display: "flex", flexDirection: "column", gap: "10px",
        cursor: "pointer", transition: "all 0.2s ease",
        minHeight: "150px",
        border: hovered ? "1px solid rgba(255, 255, 255, 0.28)" : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "16px",
        boxShadow: hovered ? "0 12px 32px rgba(0, 0, 0, 0.7)" : "0 8px 24px rgba(0, 0, 0, 0.4)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.7rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
          {mod.category}
        </span>
      </div>
      <div style={{ fontSize: "1.05rem", fontWeight: 500, color: "#ffffff", lineHeight: 1.3 }}>
        {mod.title}
      </div>
      <p style={{ fontSize: "0.82rem", color: "#a1a1aa", lineHeight: 1.5, margin: 0, marginTop: "auto" }}>
        {mod.desc}
      </p>
      <span style={{ color: "#ffffff", fontSize: "0.8rem", fontWeight: 600, marginTop: "6px" }}>Explore Module →</span>
    </div>
  );
}

// ─── Module Detail Modal ──────────────────────────────────────────────────────

function ModuleDetailModal({ module, onClose, onOpenStudio }) {
  const [copied, setCopied] = useState(false);
  if (!module) return null;

  const detail = DETAILED_MODULES[module.id] || {
    title: module.title,
    category: module.category,
    equation: "|\\psi\\rangle",
    description: module.desc,
    fullContent: module.desc,
    code: `# Qiskit code for ${module.title}\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nprint(qc)`,
    circuitPreset: "superposition"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(detail.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "var(--ql-layer-01)", border: "1px solid var(--ql-border)",
        maxWidth: "680px", width: "100%", maxHeight: "85vh", overflowY: "auto",
        borderRadius: "2px", boxShadow: "0 24px 48px rgba(0,0,0,0.6)"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "24px", borderBottom: "1px solid var(--ql-border)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          background: "var(--ql-layer-02)"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#78A9FF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {detail.category}
            </span>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--ql-text-primary)", margin: "6px 0 0 0" }}>
              {detail.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", color: "var(--ql-text-secondary)",
              fontSize: "1.4rem", cursor: "pointer", lineHeight: 1, padding: "4px"
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Equation Box */}
          {detail.equation && (
            <div style={{
              padding: "16px 20px", background: "var(--ql-layer-02)",
              border: "1px solid rgba(120,169,255,0.3)", borderLeft: "4px solid #78A9FF",
              borderRadius: "4px", overflowX: "auto"
            }}>
              <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>
                Key Mathematical Formulation
              </div>
              <LatexBlock tex={detail.equation} display={true} />
            </div>
          )}

          {/* Description / Theory */}
          <div style={{ fontSize: "0.92rem", color: "var(--ql-text-secondary)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {detail.fullContent}
          </div>

          {/* Code Section */}
          {detail.code && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ql-text-helper)", textTransform: "uppercase" }}>Qiskit 1.0+ Example</span>
                <button
                  onClick={handleCopy}
                  style={{ background: "var(--ql-layer-02)", border: "1px solid var(--ql-border)", color: "#78A9FF", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  {copied ? "Copied" : "Copy Code"}
                </button>
              </div>
              <pre style={{
                background: "#000", padding: "16px", borderRadius: "2px",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem",
                color: "#f4f4f4", overflowX: "auto", border: "1px solid var(--ql-border)"
              }}>
                {detail.code}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid var(--ql-border)", display: "flex", justifyContent: "flex-end", gap: "12px", background: "var(--ql-layer-02)" }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 18px", background: "transparent", border: "1px solid var(--ql-border)", color: "var(--ql-text-secondary)", cursor: "pointer" }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              if (onOpenStudio) onOpenStudio(detail.circuitPreset || "superposition");
            }}
            style={{ padding: "10px 20px", background: "#0F62FE", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Open in Circuit Studio →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Comprehensive Course Viewer (Full Lesson Study Hall) ───────────────────────

function CourseViewer({ course, onBack, onOpenStudio, onSwitchToVideos }) {
  const { updateUserTopics } = useAuth();
  const courseDetails = COURSES_DETAILED_CONTENT[course.id] || COURSES_DETAILED_CONTENT["basics-qi"];
  const units = courseDetails.units || [];

  const [activeUnitIdx, setActiveUnitIdx] = useState(0);
  const [completedUnits, setCompletedUnits] = useState(new Set([0]));
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const activeUnit = units[activeUnitIdx] || units[0];

  const handleToggleComplete = (idx) => {
    setCompletedUnits(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        const unit = units[idx];
        if (unit?.title && updateUserTopics) {
          updateUserTopics(unit.title, Math.round(((next.size) / units.length) * 100));
        }
      }
      return next;
    });
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelectQuizOption = (unitId, optionIdx) => {
    if (quizSubmitted[unitId]) return; // already locked
    setQuizAnswers(prev => ({ ...prev, [unitId]: optionIdx }));
  };

  const handleSubmitQuiz = (unitId) => {
    setQuizSubmitted(prev => ({ ...prev, [unitId]: true }));
    // Automatically mark unit complete if answered correctly
    if (quizAnswers[unitId] === activeUnit.quiz?.correctIndex) {
      setCompletedUnits(prev => {
        const next = new Set(prev).add(activeUnitIdx);
        if (activeUnit?.title && updateUserTopics) {
          updateUserTopics(activeUnit.title, Math.round(((next.size) / units.length) * 100));
        }
        return next;
      });
    }
  };

  const progressPercent = Math.round((completedUnits.size / units.length) * 100);

  return (
    <div style={{ border: "1px solid var(--ql-border)", display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "850px", background: "var(--ql-layer-01)" }}>
      {/* ── Left Sidebar (Syllabus) ── */}
      <div style={{ background: "var(--ql-layer-02)", borderRight: "1px solid var(--ql-border)", display: "flex", flexDirection: "column" }}>
        {/* Course Header */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--ql-border)" }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", color: "#78A9FF",
              cursor: "pointer", fontSize: "0.85rem", padding: 0, marginBottom: "14px",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            ← Back to All Courses
          </button>
          <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Course Syllabus
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--ql-text-primary)", margin: "6px 0 2px 0" }}>
            {courseDetails.courseLabel || courseDetails.title}
          </h3>
          <div style={{ fontSize: "0.8rem", color: "var(--ql-text-secondary)" }}>
            with {courseDetails.instructor}
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "6px" }}>
              <span style={{ color: "var(--ql-text-helper)" }}>Course Progress</span>
              <span style={{ color: "#78A9FF", fontWeight: 600 }}>{progressPercent}%</span>
            </div>
            <div style={{ height: "4px", background: "var(--ql-border)", borderRadius: "2px" }}>
              <div style={{
                height: "100%", background: "#78A9FF", borderRadius: "2px",
                width: `${progressPercent}%`, transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        </div>

        {/* Units Navigation List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {units.map((unit, i) => {
            const isSelected = activeUnitIdx === i;
            const isCompleted = completedUnits.has(i);
            return (
              <div
                key={unit.id}
                onClick={() => setActiveUnitIdx(i)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "12px",
                  padding: "16px 20px", cursor: "pointer",
                  background: isSelected ? "var(--ql-layer-hover)" : "transparent",
                  borderLeft: isSelected ? "3px solid #78A9FF" : "3px solid transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                  background: isCompleted ? "#24a148" : isSelected ? "#0F62FE" : "transparent",
                  border: `1px solid ${isCompleted ? "#24a148" : isSelected ? "#78A9FF" : "var(--ql-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.72rem", color: "#fff", fontWeight: 600, marginTop: "2px"
                }}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "0.88rem", fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--ql-text-primary)" : "var(--ql-text-secondary)",
                    lineHeight: 1.4
                  }}>
                    {unit.title}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)", marginTop: "4px" }}>
                    {unit.duration}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Lesson Reader ── */}
      <div style={{ background: "var(--ql-layer-01)", padding: "40px 48px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Breadcrumb & Header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "var(--ql-text-helper)", marginBottom: "12px" }}>
            <span>Courses</span> <span>/</span>
            <span>{courseDetails.courseLabel}</span> <span>/</span>
            <span style={{ color: "var(--ql-text-primary)" }}>Unit {activeUnitIdx + 1}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ql-text-primary)", margin: 0, lineHeight: 1.3 }}>
              {activeUnit.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LevelBadge level={courseDetails.level} />
              <button
                onClick={() => handleToggleComplete(activeUnitIdx)}
                style={{
                  padding: "6px 14px",
                  background: completedUnits.has(activeUnitIdx) ? "#24a148" : "transparent",
                  border: `1px solid ${completedUnits.has(activeUnitIdx) ? "#24a148" : "var(--ql-border)"}`,
                  color: completedUnits.has(activeUnitIdx) ? "#fff" : "var(--ql-text-secondary)",
                  fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", borderRadius: "2px"
                }}
              >
                {completedUnits.has(activeUnitIdx) ? "✓ Completed" : "Mark as Completed"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Callout */}
        <div style={{
          padding: "18px 24px", background: "var(--ql-layer-02)",
          borderLeft: "4px solid #78A9FF", border: "1px solid var(--ql-border)",
          fontSize: "0.95rem", color: "var(--ql-text-secondary)", lineHeight: 1.7
        }}>
          <strong style={{ color: "var(--ql-text-primary)" }}>Unit Overview: </strong>
          {activeUnit.summary}
        </div>

        {/* ── IBM Quantum Official Video Lecture Embed ── */}
        {activeUnit.embedUrl && (
          <div style={{ background: "#000", border: "1px solid var(--ql-border)", borderRadius: "2px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={activeUnit.embedUrl}
                title={activeUnit.videoTitle || activeUnit.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <div style={{ padding: "14px 20px", background: "var(--ql-layer-02)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--ql-border)", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.05em" }}>
                  LECTURE
                </span>
                <span style={{ fontSize: "0.86rem", color: "var(--ql-text-primary)", fontWeight: 500 }}>
                  {activeUnit.videoTitle || activeUnit.title}
                </span>
              </div>
              {activeUnit.watchUrl && (
                <a
                  href={activeUnit.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#78A9FF", fontSize: "0.82rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}
                >
                  Watch on YouTube ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Multilingual Video Lectures Callout ── */}
        {onSwitchToVideos && (
          <div style={{
            padding: "12px 18px",
            background: "rgba(15,98,254,0.08)",
            border: "1px solid rgba(15,98,254,0.2)",
            borderRadius: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.74rem", background: "rgba(15,98,254,0.2)", color: "#78A9FF", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>
                INDIAN LANGUAGES
              </span>
              <span style={{ fontSize: "0.82rem", color: "var(--ql-text-secondary)" }}>
                Watch quantum lectures in Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, or Kannada.
              </span>
            </div>
            <button
              onClick={onSwitchToVideos}
              style={{
                padding: "6px 14px",
                background: "#0f62fe",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Multilingual Lectures Hub →
            </button>
          </div>
        )}

        {/* ── Learning Objectives Checklist ── */}
        {activeUnit.learningObjectives && activeUnit.learningObjectives.length > 0 && (
          <div style={{ padding: "20px 24px", background: "var(--ql-layer-02)", border: "1px solid var(--ql-border)" }}>
            <div style={{ fontSize: "0.75rem", color: "#78A9FF", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "8px" }}>
              Learning Objectives
            </div>
            <div style={{ fontSize: "0.84rem", color: "var(--ql-text-helper)", marginBottom: "14px" }}>
              By the end of this lesson, you will be able to:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              {activeUnit.learningObjectives.map((obj, oIdx) => (
                <div key={oIdx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.88rem", color: "var(--ql-text-primary)", lineHeight: 1.5 }}>
                  <span style={{ color: "#34d399", fontWeight: 700, fontSize: "0.95rem" }}>✓</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-depth Content Sections */}
        {activeUnit.sections?.map((sec, sIdx) => (
          <div key={sIdx} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 500, color: "var(--ql-text-primary)", margin: "8px 0 0 0" }}>
              {sec.heading}
            </h2>
            <div style={{ fontSize: "0.94rem", color: "var(--ql-text-secondary)", lineHeight: 1.85 }}>
              <MathRenderer content={sec.content} />
            </div>

            {/* Formula Block */}
            {sec.math && (
              <div style={{
                padding: "16px 20px", background: "#0a0a0a",
                border: "1px solid rgba(120,169,255,0.25)",
                borderRadius: "6px", overflowX: "auto"
              }}>
                <LatexBlock tex={sec.math} display={true} />
              </div>
            )}

            {/* Key Callout Block */}
            {sec.callout && (
              <div style={{
                padding: "16px 20px", background: "rgba(15,98,254,0.08)",
                borderLeft: "4px solid #0F62FE", border: "1px solid rgba(15,98,254,0.2)",
                fontSize: "0.88rem", color: "#c6c6c6", lineHeight: 1.7, borderRadius: "4px"
              }}>
                <strong style={{ color: "#78A9FF" }}>Key Concept: </strong>
                <MathRenderer content={sec.callout} style={{ display: "inline" }} />
              </div>
            )}

            {/* Code Block */}
            {sec.code && (
              <div style={{ marginTop: "8px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 16px", background: "var(--ql-layer-02)", border: "1px solid var(--ql-border)", borderBottom: "none"
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--ql-text-helper)", fontFamily: "monospace" }}>Python · Qiskit 1.0+</span>
                  <button
                    onClick={() => handleCopyCode(sec.code, `${sIdx}`)}
                    style={{
                      background: "transparent", border: "none", color: "#78A9FF",
                      cursor: "pointer", fontSize: "0.78rem"
                    }}
                  >
                    {copiedIndex === `${sIdx}` ? "Copied" : "Copy Code"}
                  </button>
                </div>
                <pre style={{
                  background: "#000", padding: "18px", margin: 0,
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.86rem",
                  color: "#d4d4d4", overflowX: "auto", border: "1px solid var(--ql-border)"
                }}>
                  {sec.code}
                </pre>
              </div>
            )}
          </div>
        ))}

        {/* ── Interactive Knowledge Check (Quiz) ── */}
        {activeUnit.quiz && (
          <div style={{
            padding: "24px 28px", background: "var(--ql-layer-02)",
            border: "1px solid var(--ql-border)", borderLeft: "4px solid #8A3FFC",
            display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.72rem", color: "#A56EFF", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                Knowledge Check
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)" }}>· Test your conceptual mastery</span>
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--ql-text-primary)", lineHeight: 1.5 }}>
              <MathRenderer content={activeUnit.quiz.question} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeUnit.quiz.options.map((opt, oIdx) => {
                const isSelected = quizAnswers[activeUnit.id] === oIdx;
                const isSubmitted = quizSubmitted[activeUnit.id];
                const isCorrect = oIdx === activeUnit.quiz.correctIndex;

                let borderCol = "var(--ql-border)";
                let bgCol = "transparent";
                if (isSelected) {
                  borderCol = "#78A9FF";
                  bgCol = "rgba(120,169,255,0.08)";
                }
                if (isSubmitted) {
                  if (isCorrect) {
                    borderCol = "#24a148";
                    bgCol = "rgba(36,161,72,0.15)";
                  } else if (isSelected) {
                    borderCol = "#da1e28";
                    bgCol = "rgba(218,30,40,0.15)";
                  }
                }

                return (
                  <div
                    key={oIdx}
                    onClick={() => handleSelectQuizOption(activeUnit.id, oIdx)}
                    style={{
                      padding: "12px 18px", border: `1px solid ${borderCol}`,
                      background: bgCol, cursor: isSubmitted ? "default" : "pointer",
                      fontSize: "0.9rem", color: "var(--ql-text-primary)",
                      display: "flex", alignItems: "center", gap: "12px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#78A9FF" : "var(--ql-text-helper)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {isSelected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#78A9FF" }} />}
                    </div>
                    <MathRenderer content={opt} style={{ display: 'inline' }} />
                    {isSubmitted && isCorrect && <span style={{ marginLeft: "auto", color: "#34d399", fontWeight: 600 }}>✓ Correct</span>}
                    {isSubmitted && isSelected && !isCorrect && <span style={{ marginLeft: "auto", color: "#f87171" }}>✗ Incorrect</span>}
                  </div>
                );
              })}
            </div>

            {/* Submit / Feedback */}
            {!quizSubmitted[activeUnit.id] ? (
              <button
                disabled={quizAnswers[activeUnit.id] === undefined}
                onClick={() => handleSubmitQuiz(activeUnit.id)}
                style={{
                  alignSelf: "flex-start", padding: "10px 22px",
                  background: quizAnswers[activeUnit.id] !== undefined ? "#8A3FFC" : "var(--ql-layer-hover)",
                  border: "none", color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                  cursor: quizAnswers[activeUnit.id] !== undefined ? "pointer" : "not-allowed",
                  marginTop: "4px"
                }}
              >
                Submit Answer
              </button>
            ) : (
              <div style={{
                padding: "14px 18px", background: "var(--ql-layer-01)",
                border: "1px solid var(--ql-border)", fontSize: "0.88rem",
                lineHeight: 1.6, color: "var(--ql-text-secondary)"
              }}>
                <strong style={{ color: "#A56EFF" }}>Explanation: </strong>
                {activeUnit.quiz.explanation}
              </div>
            )}
          </div>
        )}

        {/* ── Hands-on Lab & AI Integration ── */}
        <div style={{
          padding: "24px 28px", background: "#1c1c1c",
          border: "1px solid var(--ql-border)", display: "flex",
          alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#78A9FF", textTransform: "uppercase", fontWeight: 600 }}>
              Hands-On Interactive Circuit
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--ql-text-primary)", marginTop: "4px" }}>
              Run the code for {activeUnit.title} in the virtual QPU
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => onOpenStudio(activeUnit.circuitPreset || "superposition")}
              style={{
                padding: "12px 24px", background: "#0F62FE", border: "none",
                color: "#fff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer"
              }}
            >
              Open in Circuit Studio →
            </button>
          </div>
        </div>

        {/* ── Lesson Navigation (Prev / Next) ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid var(--ql-border)" }}>
          <button
            disabled={activeUnitIdx === 0}
            onClick={() => setActiveUnitIdx(prev => Math.max(0, prev - 1))}
            style={{
              padding: "10px 18px", background: "transparent",
              border: "1px solid var(--ql-border)", color: activeUnitIdx === 0 ? "var(--ql-text-helper)" : "var(--ql-text-secondary)",
              cursor: activeUnitIdx === 0 ? "not-allowed" : "pointer"
            }}
          >
            ← Previous Unit
          </button>
          <span style={{ fontSize: "0.82rem", color: "var(--ql-text-helper)" }}>
            Unit {activeUnitIdx + 1} of {units.length}
          </span>
          <button
            disabled={activeUnitIdx === units.length - 1}
            onClick={() => setActiveUnitIdx(prev => Math.min(units.length - 1, prev + 1))}
            style={{
              padding: "10px 18px", background: activeUnitIdx === units.length - 1 ? "transparent" : "#0F62FE",
              border: "1px solid var(--ql-border)", color: activeUnitIdx === units.length - 1 ? "var(--ql-text-helper)" : "#fff",
              cursor: activeUnitIdx === units.length - 1 ? "not-allowed" : "pointer", fontWeight: 600
            }}
          >
            Next Unit →
          </button>
        </div>

        {/* ── Textbook Citations ── */}
        {courseDetails.citations && (
          <div style={{ marginTop: "16px", padding: "16px 20px", background: "var(--ql-layer-02)", border: "1px solid var(--ql-border)" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              Textbook References (Indexed in ChromaDB RAG Corpus)
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "var(--ql-text-secondary)", lineHeight: 1.7 }}>
              {courseDetails.citations.map((cite, cIdx) => (
                <li key={cIdx}>{cite}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Learning Hub Component ──────────────────────────────────────────────

export default function LearningHub({ onSwitchToStudio, onSwitchToAssessment, onSwitchToVideos }) {
  const [activeTab, setActiveTab] = useState("home"); // home | courses | modules
  const [activePathFilter, setActivePathFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeModuleModal, setActiveModuleModal] = useState(null);

  const handleEnroll = (course) => setActiveCourse(course);
  const handlePathSelect = (path) => {
    setActivePathFilter(path.id);
    setActiveTab("courses");
  };

  const filteredCourses = ALL_COURSES.filter(c => {
    const matchesPath = activePathFilter === "all" || c.path === activePathFilter;
    const matchesQuery = searchQuery.trim() === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPath && matchesQuery;
  });

  // ── Course Viewer mode ────
  if (activeCourse) {
    return (
      <div style={{ padding: "24px 32px", minHeight: "100vh", background: "var(--ql-bg)" }}>
        <CourseViewer
          course={activeCourse}
          onBack={() => setActiveCourse(null)}
          onOpenStudio={onSwitchToStudio}
          onSwitchToVideos={onSwitchToVideos}
        />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--ql-bg)", color: "var(--ql-text-primary)", fontFamily: "var(--font-sans)", minHeight: "100vh" }}>
      {/* Module Detail Modal */}
      {activeModuleModal && (
        <ModuleDetailModal
          module={activeModuleModal}
          onClose={() => setActiveModuleModal(null)}
          onOpenStudio={onSwitchToStudio}
        />
      )}

      {/* ── Inner Navigation Bar ── */}
      <div style={{ borderBottom: "1px solid var(--ql-border)", background: "var(--ql-layer-01)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: "8px" }}>
          {["home", "courses", "modules"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "16px 20px",
                background: "none", border: "none",
                borderBottom: activeTab === tab ? "2px solid #78A9FF" : "2px solid transparent",
                color: activeTab === tab ? "var(--ql-text-primary)" : "var(--ql-text-secondary)",
                fontSize: "0.82rem",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {tab === "home" ? "Learning" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── HOME TAB ── */}
      {activeTab === "home" && (
        <div>
          {/* Hero Banner */}
          <div style={{ background: "var(--ql-layer-01)", borderBottom: "1px solid var(--ql-border)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "52px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", minHeight: "280px" }}>
              <div style={{ maxWidth: "620px" }}>
                {/* Eyebrow Tag */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 14px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "9999px",
                  fontSize: "0.74rem",
                  fontFamily: "var(--font-mono)",
                  color: "#a1a1aa",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}>
                  <span>76 INDEXED TEXTBOOKS • VIRTUAL QPU LABS</span>
                </div>

                <h1 style={{
                  fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  margin: "0 0 16px 0",
                  color: "var(--ql-text-primary)",
                  letterSpacing: "-0.035em",
                  textTransform: "uppercase"
                }}>
                  Learn Quantum Computing
                </h1>
                <p style={{ fontSize: "0.95rem", color: "var(--ql-text-secondary)", lineHeight: 1.7, margin: "0 0 28px 0" }}>
                  Master quantum algorithms, circuits, and error correction through complete, in-depth courses built from 76 landmark textbooks and research papers — with mathematical derivations, runnable Qiskit 1.0 code, and interactive quizzes.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="btn-overview-primary"
                  >
                    View all courses →
                  </button>
                  <button
                    onClick={() => setActiveTab("modules")}
                    className="btn-overview-secondary"
                  >
                    Browse modules
                  </button>
                  {onSwitchToAssessment && (
                    <button
                      onClick={onSwitchToAssessment}
                      className="btn-overview-secondary"
                    >
                      Assessment &amp; Exams
                    </button>
                  )}
                </div>
              </div>

              {/* Institutional Platform Overview Box */}
              <div style={{
                flexShrink: 0,
                background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "16px",
                padding: "28px",
                width: "360px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
              }}>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 300, color: "#ffffff", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                    76
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "4px", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Indexed Textbooks
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 300, color: "#ffffff", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                    16
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "4px", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Qubits Real-Time QPU
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 300, color: "#ffffff", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                    4
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "4px", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Simulation Engines
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 300, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                    100%
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "4px", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Qiskit 1.2+ Verified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Courses Grid */}
          <div style={{ background: "transparent", padding: "0 0 56px 0" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 400, margin: "0 0 24px 0", color: "#ffffff", paddingTop: "32px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Featured courses
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "transparent" }}>
                {FEATURED_COURSES.map(c => (
                  <FeaturedCourseCard key={c.id} course={c} onEnroll={handleEnroll} />
                ))}
              </div>
            </div>
          </div>

          {/* Multi-resource learning paths */}
          <div style={{ background: "transparent", padding: "0 0 56px 0", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 32px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px", alignItems: "start" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "#ffffff", margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Learning Paths
                  </h2>
                  <p style={{ fontSize: "0.88rem", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                    Curated sequences of courses, modules, and interactive circuit exercises designed for specific quantum computing domains.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", background: "transparent" }}>
                  {LEARNING_PATHS.map(p => <PathTile key={p.id} path={p} onSelect={handlePathSelect} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Modules Section */}
          <div style={{ background: "transparent", borderTop: "1px solid rgba(255, 255, 255, 0.08)", padding: "0 0 56px 0" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 32px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "#ffffff", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Featured modules
                </h2>
                <button
                  onClick={() => setActiveTab("modules")}
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: "0.84rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  View all 12 modules →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", background: "transparent" }}>
                {MODULES.slice(0, 8).map(m => (
                  <ModuleTile key={m.id} mod={m} onSelect={(mod) => setActiveModuleModal(mod)} />
                ))}
              </div>
            </div>
          </div>

          {/* Studio CTA Banner */}
          <div style={{ background: "linear-gradient(135deg, rgba(20, 20, 24, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%)", borderTop: "1px solid rgba(255, 255, 255, 0.12)", borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "#ffffff", margin: "0 0 8px 0" }}>
                  Build circuits in the Circuit Studio
                </h2>
                <button
                  onClick={() => onSwitchToStudio("superposition")}
                  style={{
                    background: "none", border: "none", color: "#a1a1aa",
                    fontSize: "0.92rem", cursor: "pointer", padding: 0,
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  Open Circuit Studio ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSES TAB ── */}
      {activeTab === "courses" && (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 300, margin: 0 }}>All Courses</h1>
              <p style={{ fontSize: "0.88rem", color: "var(--ql-text-secondary)", margin: "6px 0 0 0" }}>
                Select any course to view full lesson units, mathematical derivations, and Qiskit code.
              </p>
            </div>

            {/* Search and Filters */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search courses or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "var(--ql-layer-02)", border: "1px solid var(--ql-border)",
                  color: "#fff", padding: "6px 14px", fontSize: "0.85rem", outline: "none",
                  width: "220px"
                }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                {[{ id: "all", label: "All" }, ...LEARNING_PATHS].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePathFilter(p.id)}
                    style={{
                      padding: "5px 12px", background: activePathFilter === p.id ? "#0F62FE" : "transparent",
                      border: `1px solid ${activePathFilter === p.id ? "#0F62FE" : "var(--ql-border)"}`,
                      color: activePathFilter === p.id ? "#fff" : "var(--ql-text-secondary)",
                      fontSize: "0.78rem", cursor: "pointer", borderRadius: "3px", transition: "all 0.15s ease",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid var(--ql-border)" }}>
            {/* Table Header Row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto auto auto",
              gap: "16px", padding: "12px 20px",
              background: "var(--ql-layer-02)",
              borderBottom: "1px solid var(--ql-border)",
              fontSize: "0.75rem", color: "var(--ql-text-helper)", textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              <span>Course Name</span><span>Level</span><span>Units &amp; Duration</span><span></span>
            </div>
            {filteredCourses.map(c => (
              <CourseRow key={c.id} course={c} onSelect={handleEnroll} />
            ))}
          </div>

          <div style={{ marginTop: "14px", fontSize: "0.8rem", color: "var(--ql-text-helper)" }}>
            Showing {filteredCourses.length} of {ALL_COURSES.length} courses
          </div>
        </div>
      )}

      {/* ── MODULES TAB ── */}
      {activeTab === "modules" && (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 300, margin: "0 0 8px 0" }}>Interactive Modules</h1>
          <p style={{ color: "var(--ql-text-secondary)", margin: "0 0 28px 0", fontSize: "0.92rem" }}>
            Click on any module to open in-depth theoretical analysis, mathematical formulation, and runnable Qiskit 1.0 code.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--ql-border)" }}>
            {MODULES.map(m => (
              <ModuleTile key={m.id} mod={m} onSelect={(mod) => setActiveModuleModal(mod)} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "24px 32px", borderTop: "1px solid var(--ql-border)", marginTop: "auto", background: "var(--ql-layer-01)" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--ql-text-helper)", margin: 0 }}>
          Quantum Leap · Team Gitwolves · SIH 2026 · Course content sourced from 76 peer-reviewed textbooks &amp; papers in our ChromaDB knowledge base
        </p>
      </div>
    </div>
  );
}
