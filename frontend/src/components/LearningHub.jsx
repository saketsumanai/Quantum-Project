import React, { useState } from "react";

// ─── Course Data (from our 76-book corpus) ───────────────────────────────────

const FEATURED_COURSES = [
  {
    id: "basics-quantum-information",
    title: "Start with the fundamentals",
    courseLabel: "Basics of Quantum Information",
    instructor: "John Watrous & Mark Wilde",
    description: "Begin your quantum journey by mastering qubits, superposition, entanglement, and quantum measurement. Grounded in the full textbooks indexed in our knowledge base.",
    level: "Beginner",
    lessons: 12,
    duration: "8 hours",
    topics: ["Qubits & States", "Superposition", "Entanglement", "Measurement", "Quantum Channels"],
    gradient: "linear-gradient(135deg, #001141 0%, #0F1F4A 100%)",
    accent: "#0F62FE",
    badge: "#78A9FF",
  },
  {
    id: "quantum-algorithms",
    title: "Start building quantum algorithms",
    courseLabel: "Quantum Algorithm Design",
    instructor: "Andrew Childs & Ronald de Wolf",
    description: "Master Grover's search, Shor's factoring, HHL, and QAOA. Run circuits on our virtual 16-qubit QPU and export Qiskit code at every lesson step.",
    level: "Intermediate",
    lessons: 16,
    duration: "12 hours",
    topics: ["Grover Search", "Shor's Algorithm", "QFT", "Phase Estimation", "HHL", "QAOA"],
    gradient: "linear-gradient(135deg, #1C0F30 0%, #2D1B4E 100%)",
    accent: "#8A3FFC",
    badge: "#A56EFF",
  },
];

const LEARNING_PATHS = [
  { id: "intro", label: "Introduction to Quantum", icon: "⚛", description: "Superposition, entanglement, and the basics", modules: 6, courses: 2 },
  { id: "algorithms", label: "Quantum Algorithm Development", icon: "⚙", description: "Build circuits that achieve quantum speedups", modules: 8, courses: 3 },
  { id: "ml", label: "Quantum Machine Learning", icon: "🧠", description: "Parameterized circuits, kernels, and QNNs", modules: 7, courses: 2 },
  { id: "physics", label: "Physics & Chemistry Simulation", icon: "⚗", description: "VQE, molecular Hamiltonians, and Trotterization", modules: 5, courses: 2 },
  { id: "error", label: "Error Correction & Fault Tolerance", icon: "🛡", description: "Stabilizer codes, surface codes, and thresholds", modules: 6, courses: 2 },
  { id: "nisq", label: "NISQ Applications", icon: "📡", description: "Near-term algorithms on noisy hardware", modules: 5, courses: 2 },
];

const ALL_COURSES = [
  { id: "basics-qi", title: "Basics of Quantum Information", instructor: "John Watrous", level: "Beginner", lessons: 12, path: "intro", duration: "8h" },
  { id: "use-qc", title: "Running Circuits on a QPU", instructor: "Olivia Lanes & IBM Team", level: "Beginner", lessons: 8, path: "intro", duration: "5h" },
  { id: "quantum-algos", title: "Quantum Algorithm Design", instructor: "Andrew Childs", level: "Intermediate", lessons: 16, path: "algorithms", duration: "12h" },
  { id: "grover-shor", title: "Grover Search & Shor's Algorithm", instructor: "Ronald de Wolf", level: "Intermediate", lessons: 10, path: "algorithms", duration: "7h" },
  { id: "phase-estimation", title: "Quantum Phase Estimation & Applications", instructor: "Andrew Childs", level: "Advanced", lessons: 9, path: "algorithms", duration: "6h" },
  { id: "qml", title: "Quantum Machine Learning", instructor: "Maria Schuld", level: "Intermediate", lessons: 14, path: "ml", duration: "10h" },
  { id: "qml-kernels", title: "Quantum Kernels & Feature Maps", instructor: "Maria Schuld", level: "Advanced", lessons: 8, path: "ml", duration: "6h" },
  { id: "vqe", title: "Variational Quantum Algorithms (VQE/QAOA)", instructor: "M. Cerezo et al.", level: "Intermediate", lessons: 12, path: "physics", duration: "9h" },
  { id: "quantum-chem", title: "Quantum Chemistry Simulation", instructor: "Bauer, Bravyi & Motta", level: "Advanced", lessons: 11, path: "physics", duration: "8h" },
  { id: "qec-intro", title: "Quantum Error Correction for Beginners", instructor: "Daniel Gottesman", level: "Intermediate", lessons: 10, path: "error", duration: "7h" },
  { id: "surface-codes", title: "Surface Codes & Fault Tolerance", instructor: "Bombin & Fowler", level: "Advanced", lessons: 9, path: "error", duration: "7h" },
  { id: "nisq-intro", title: "Quantum Computing in the NISQ Era", instructor: "John Preskill", level: "Beginner", lessons: 7, path: "nisq", duration: "5h" },
  { id: "barren", title: "Variational Circuits & Barren Plateaus", instructor: "M. Cerezo & McClean", level: "Advanced", lessons: 8, path: "nisq", duration: "6h" },
];

const MODULES = [
  { id: "superposition", title: "Superposition", category: "Quantum Mechanics", desc: "How quantum systems exist as linear combinations of basis states." },
  { id: "uncertainty", title: "Heisenberg Uncertainty", category: "Quantum Mechanics", desc: "Incompatible observables and the Robertson uncertainty principle." },
  { id: "entanglement", title: "Quantum Entanglement", category: "Quantum Mechanics", desc: "Bell states, EPR paradox, and applications in quantum info." },
  { id: "teleportation", title: "Quantum Teleportation", category: "Computer Science", desc: "Transmit unknown quantum states using shared entanglement." },
  { id: "qkd", title: "Quantum Key Distribution", category: "Computer Science", desc: "BB84 protocol and information-theoretically secure cryptography." },
  { id: "bloch", title: "The Bloch Sphere", category: "Quantum Mechanics", desc: "Geometric representation of single-qubit pure and mixed states." },
  { id: "grover-mod", title: "Grover's Search", category: "Algorithms", desc: "Quadratic speedup for unstructured search on N items in √N queries." },
  { id: "qft-mod", title: "Quantum Fourier Transform", category: "Algorithms", desc: "DFT over Z_N efficiently on a quantum computer in O(n²) gates." },
  { id: "shor-mod", title: "Shor's Factoring Algorithm", category: "Algorithms", desc: "Exponential speedup for integer factoring via period finding." },
  { id: "vqe-mod", title: "Variational Quantum Eigensolver", category: "Variational Methods", desc: "Hybrid quantum-classical ground state energy estimation." },
  { id: "qaoa-mod", title: "QAOA", category: "Variational Methods", desc: "Quantum Approximate Optimization Algorithm for combinatorial problems." },
  { id: "qec-mod", title: "Stabilizer Codes", category: "Error Correction", desc: "CSS codes, Pauli group, and the stabilizer formalism." },
];

const LEVEL_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
  Intermediate: { bg: "rgba(120,169,255,0.12)", text: "#78A9FF", border: "rgba(120,169,255,0.3)" },
  Advanced: { bg: "rgba(165,110,255,0.12)", text: "#A56EFF", border: "rgba(165,110,255,0.3)" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelBadge({ level }) {
  const c = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
  return (
    <span style={{
      fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: "0.04em", textTransform: "uppercase",
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
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: hovered ? "var(--ql-layer-hover)" : "var(--ql-layer-02)",
        cursor: "pointer", transition: "background 0.15s ease", minHeight: "280px",
        border: "1px solid var(--ql-border)",
      }}
    >
      {/* Text side */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Course
        </div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 400, lineHeight: 1.3, color: "var(--ql-text-primary)", margin: 0 }}>
          {course.title}
        </h3>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--ql-text-primary)" }}>{course.courseLabel}</div>
          <div style={{ fontSize: "0.82rem", color: "var(--ql-text-helper)", marginTop: "4px" }}>with {course.instructor}</div>
        </div>
        <p style={{ fontSize: "0.83rem", color: "var(--ql-text-secondary)", lineHeight: 1.6, margin: 0, flexGrow: 1 }}>
          {course.description}
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <LevelBadge level={course.level} />
          <span style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)" }}>
            {course.lessons} lessons · {course.duration}
          </span>
        </div>
        <button
          style={{
            marginTop: "auto", alignSelf: "flex-start",
            padding: "10px 20px",
            background: hovered ? course.accent : "transparent",
            color: hovered ? "#fff" : course.badge,
            border: `1px solid ${hovered ? course.accent : course.badge}`,
            fontSize: "0.83rem", fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s ease", letterSpacing: "0.02em",
          }}
        >
          Start this course →
        </button>
      </div>
      {/* Visual side */}
      <div style={{
        background: course.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.08,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 70%)",
        }} />
        {/* Quantum circuit visualization */}
        <svg width="220" height="180" viewBox="0 0 220 180" style={{ opacity: 0.9 }}>
          {/* Qubit lines */}
          {[40, 80, 120, 160].map((y, i) => (
            <g key={i}>
              <line x1="10" y1={y} x2="210" y2={y} stroke={course.badge} strokeWidth="1.5" strokeOpacity="0.6" />
              <text x="14" y={y - 6} fill={course.badge} fontSize="10" fontFamily="monospace" opacity="0.8">q{i}</text>
              {/* Gate boxes */}
              {[40, 90, 140].map((x, j) => (
                Math.random() > 0.4 && (
                  <rect key={j} x={x} y={y - 12} width="22" height="22" fill="none"
                    stroke={course.badge} strokeWidth="1.5" rx="2" opacity="0.8" />
                )
              ))}
            </g>
          ))}
          {/* CNOT connections */}
          <line x1="51" y1="80" x2="51" y2="120" stroke={course.badge} strokeWidth="1.5" strokeOpacity="0.7" />
          <circle cx="51" cy="120" r="8" fill="none" stroke={course.badge} strokeWidth="1.5" opacity="0.8" />
          <circle cx="51" cy="80" r="4" fill={course.badge} opacity="0.8" />
          <line x1="101" y1="40" x2="101" y2="80" stroke={course.badge} strokeWidth="1.5" strokeOpacity="0.7" />
          <circle cx="101" cy="80" r="8" fill="none" stroke={course.badge} strokeWidth="1.5" opacity="0.8" />
          <circle cx="101" cy="40" r="4" fill={course.badge} opacity="0.8" />
          {/* Gate labels */}
          <text x="44" y="56" fill={course.badge} fontSize="9" fontFamily="monospace" opacity="0.9">H</text>
          <text x="137" y="94" fill={course.badge} fontSize="9" fontFamily="monospace" opacity="0.9">X</text>
          <text x="137" y="134" fill={course.badge} fontSize="9" fontFamily="monospace" opacity="0.9">Z</text>
          {/* Measurement symbols */}
          {[40, 80, 120, 160].map((y, i) => (
            <g key={i}>
              <rect x="185" y={y - 10} width="20" height="20" fill="none" stroke={course.badge} strokeWidth="1" rx="1" opacity="0.6" />
              <path d={`M 188 ${y + 2} Q 195 ${y - 5} 202 ${y + 2}`} fill="none" stroke={course.badge} strokeWidth="1" opacity="0.6" />
              <line x1="195" y1={y - 1} x2="200" y2={y - 6} stroke={course.badge} strokeWidth="1" opacity="0.6" />
            </g>
          ))}
        </svg>
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
        background: hovered ? "var(--ql-layer-hover)" : "var(--ql-layer-02)",
        padding: "16px 40px 16px 16px",
        display: "flex", flexDirection: "column", gap: "8px",
        cursor: "pointer", transition: "background 0.15s ease",
        position: "relative", border: "1px solid var(--ql-border)",
        minHeight: "100px",
      }}
    >
      <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{path.icon}</span>
      <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--ql-text-primary)", lineHeight: 1.3 }}>
        {path.label}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)" }}>
        {path.courses} courses · {path.modules} modules
      </div>
      <span style={{
        position: "absolute", bottom: "14px", right: "14px",
        color: "var(--ql-text-secondary)", fontSize: "1rem",
      }}>→</span>
    </div>
  );
}

function CourseRow({ course }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid", gridTemplateColumns: "1fr auto auto auto",
        alignItems: "center", gap: "16px",
        padding: "16px 20px",
        background: hovered ? "var(--ql-layer-hover)" : "var(--ql-layer-02)",
        cursor: "pointer", transition: "background 0.15s ease",
        borderBottom: "1px solid var(--ql-border)",
      }}
    >
      <div>
        <div style={{ fontSize: "0.92rem", fontWeight: 500, color: "var(--ql-text-primary)" }}>{course.title}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--ql-text-helper)", marginTop: "3px" }}>by {course.instructor}</div>
      </div>
      <LevelBadge level={course.level} />
      <div style={{ fontSize: "0.78rem", color: "var(--ql-text-helper)", textAlign: "right", whiteSpace: "nowrap" }}>
        {course.lessons} lessons · {course.duration}
      </div>
      <span style={{ color: "#78A9FF", fontSize: "1.1rem" }}>→</span>
    </div>
  );
}

function ModuleTile({ mod }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--ql-layer-hover)" : "var(--ql-layer-02)",
        padding: "16px",
        display: "flex", flexDirection: "column", gap: "8px",
        cursor: "pointer", transition: "background 0.15s ease",
        minHeight: "140px", border: "1px solid var(--ql-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.7rem", color: "#78A9FF", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          {mod.category}
        </span>
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ql-text-primary)", lineHeight: 1.3 }}>
        {mod.title}
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--ql-text-secondary)", lineHeight: 1.5, margin: 0, marginTop: "auto" }}>
        {mod.desc}
      </p>
    </div>
  );
}

// ─── Course Viewer (expanded lesson view) ─────────────────────────────────────

function CourseViewer({ course, onBack, onOpenStudio }) {
  const [activeLesson, setActiveLesson] = useState(0);

  const lessons = course.topics?.map((topic, i) => ({
    id: i,
    title: topic,
    duration: `${8 + i * 3} min`,
    completed: i < 2,
  })) || [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "600px", border: "1px solid var(--ql-border)" }}>
      {/* Sidebar */}
      <div style={{ background: "var(--ql-layer-02)", borderRight: "1px solid var(--ql-border)" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--ql-border)" }}>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", color: "#78A9FF", cursor: "pointer", fontSize: "0.83rem", padding: 0, marginBottom: "12px" }}
          >
            ← Back to courses
          </button>
          <div style={{ fontSize: "0.72rem", color: "var(--ql-text-helper)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Course
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ql-text-primary)", marginTop: "4px" }}>
            {course.courseLabel}
          </div>
        </div>
        <div style={{ padding: "8px 0" }}>
          {lessons.map((lesson, i) => (
            <div
              key={i}
              onClick={() => setActiveLesson(i)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", cursor: "pointer",
                background: activeLesson === i ? "var(--ql-layer-hover)" : "transparent",
                borderLeft: activeLesson === i ? "3px solid #78A9FF" : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                background: lesson.completed ? "#24a148" : activeLesson === i ? "#78A9FF" : "transparent",
                border: `1px solid ${lesson.completed ? "#24a148" : activeLesson === i ? "#78A9FF" : "var(--ql-border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem", color: "#fff",
              }}>
                {lesson.completed ? "✓" : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.83rem", color: activeLesson === i ? "var(--ql-text-primary)" : "var(--ql-text-secondary)", fontWeight: activeLesson === i ? 600 : 400, lineHeight: 1.3 }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--ql-text-helper)" }}>{lesson.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ background: "var(--ql-layer-01)", padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <LevelBadge level={course.level} />
          <span style={{ fontSize: "0.78rem", color: "var(--ql-text-helper)" }}>Lesson {activeLesson + 1} of {lessons.length}</span>
        </div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 300, color: "var(--ql-text-primary)", margin: 0, lineHeight: 1.3 }}>
          {lessons[activeLesson]?.title}
        </h2>
        <div style={{
          padding: "20px 24px",
          background: "var(--ql-layer-02)",
          border: "1px solid var(--ql-border)",
          borderLeft: "3px solid #78A9FF",
          fontSize: "0.9rem", color: "var(--ql-text-secondary)", lineHeight: 1.8,
        }}>
          <strong style={{ color: "#78A9FF" }}>From the Quantum Leap Knowledge Base</strong><br /><br />
          This lesson draws from textbooks and research papers indexed in our 76-book corpus — including works by Watrous, Wilde, Childs, de Wolf, and Nielsen & Chuang. Use the <strong>Aura AI Tutor</strong> to ask questions in natural language, and the <strong>Circuit Studio</strong> to run interactive examples.
        </div>

        {/* Interactive CTA */}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={onOpenStudio}
            style={{
              padding: "11px 20px",
              background: "#0F62FE",
              border: "none",
              color: "#fff",
              fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            Open Circuit Studio →
          </button>
          <button style={{
            padding: "11px 20px",
            background: "transparent",
            border: "1px solid #78A9FF",
            color: "#78A9FF",
            fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
          }}>
            Ask AI Tutor
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid var(--ql-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--ql-text-helper)" }}>Course Progress</span>
            <span style={{ fontSize: "0.78rem", color: "#78A9FF", fontWeight: 600 }}>
              {Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100)}%
            </span>
          </div>
          <div style={{ height: "4px", background: "var(--ql-border)", borderRadius: "2px" }}>
            <div style={{
              height: "100%", borderRadius: "2px", background: "#78A9FF",
              width: `${(lessons.filter(l => l.completed).length / lessons.length) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Learning Hub ────────────────────────────────────────────────────────

export default function LearningHub({ onSwitchToStudio }) {
  const [activeTab, setActiveTab] = useState("home"); // home | courses | modules
  const [activePathFilter, setActivePathFilter] = useState("all");
  const [activeCourse, setActiveCourse] = useState(null);

  const handleEnroll = (course) => setActiveCourse(course);
  const handlePathSelect = (path) => {
    setActivePathFilter(path.id);
    setActiveTab("courses");
  };

  const filteredCourses = activePathFilter === "all"
    ? ALL_COURSES
    : ALL_COURSES.filter(c => c.path === activePathFilter);

  // ── Course Viewer mode ────
  if (activeCourse) {
    return (
      <div style={{ padding: "24px 32px", minHeight: "100vh", background: "var(--ql-bg)" }}>
        <CourseViewer course={activeCourse} onBack={() => setActiveCourse(null)} onOpenStudio={onSwitchToStudio} />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--ql-bg)", color: "var(--ql-text-primary)", fontFamily: "'IBM Plex Sans', 'Inter', sans-serif", minHeight: "100vh" }}>

      {/* ── Inner Nav ─────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--ql-border)", background: "var(--ql-layer-01)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: "0" }}>
          {["home", "courses", "modules"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "16px 20px",
                background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #78A9FF" : "2px solid transparent",
                color: activeTab === tab ? "var(--ql-text-primary)" : "var(--ql-text-secondary)",
                fontSize: "0.9rem", fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s ease", textTransform: "capitalize",
              }}
            >
              {tab === "home" ? "Learning" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── HOME TAB ─────────────────────────────── */}
      {activeTab === "home" && (
        <div>
          {/* Hero Banner */}
          <div style={{ background: "var(--ql-layer-01)", borderBottom: "1px solid var(--ql-border)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", minHeight: "280px" }}>
              <div style={{ maxWidth: "560px" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 300, lineHeight: 1.2, margin: "0 0 16px 0", color: "var(--ql-text-primary)" }}>
                  Learn quantum computing
                </h1>
                <p style={{ fontSize: "1rem", color: "var(--ql-text-secondary)", lineHeight: 1.7, margin: "0 0 28px 0" }}>
                  Master quantum algorithms, circuits, and error correction through structured courses built from 76 landmark textbooks and research papers — with an AI tutor trained on the full corpus.
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setActiveTab("courses")}
                    style={{
                      padding: "11px 32px 11px 16px", background: "#0F62FE",
                      border: "none", color: "#fff", fontSize: "0.88rem", fontWeight: 600,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                    }}
                  >
                    View all courses →
                  </button>
                  <button
                    onClick={() => setActiveTab("modules")}
                    style={{
                      padding: "11px 20px", background: "transparent",
                      border: "1px solid var(--ql-text-secondary)", color: "var(--ql-text-secondary)",
                      fontSize: "0.88rem", cursor: "pointer",
                    }}
                  >
                    Browse modules
                  </button>
                </div>
              </div>
              {/* Hero illustration */}
              <div style={{ flexShrink: 0 }}>
                <svg width="480" height="200" viewBox="0 0 480 200" style={{ opacity: 0.85 }}>
                  {/* Background grid */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={`v${i}`} x1={60 * i} y1="0" x2={60 * i} y2="200" stroke="#393939" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={40 * i} x2="480" y2={40 * i} stroke="#393939" strokeWidth="0.5" />
                  ))}
                  {/* Quantum wave / superposition */}
                  <path d="M 0 100 Q 60 40 120 100 Q 180 160 240 100 Q 300 40 360 100 Q 420 160 480 100"
                    fill="none" stroke="#0F62FE" strokeWidth="2.5" opacity="0.8" />
                  <path d="M 0 100 Q 60 160 120 100 Q 180 40 240 100 Q 300 160 360 100 Q 420 40 480 100"
                    fill="none" stroke="#8A3FFC" strokeWidth="2.5" opacity="0.8" />
                  {/* Bloch sphere */}
                  <circle cx="400" cy="100" r="60" fill="none" stroke="#78A9FF" strokeWidth="1.5" opacity="0.6" />
                  <ellipse cx="400" cy="100" rx="60" ry="18" fill="none" stroke="#78A9FF" strokeWidth="1" opacity="0.4" />
                  <line x1="400" y1="40" x2="400" y2="160" stroke="#78A9FF" strokeWidth="1" opacity="0.5" />
                  <line x1="400" y1="100" x2="440" y2="72" stroke="#A56EFF" strokeWidth="2.5" markerEnd="url(#arrow)" opacity="0.9" />
                  <circle cx="400" cy="100" r="3" fill="#78A9FF" />
                  {/* Node points */}
                  {[60, 180, 300].map((x, i) => (
                    <circle key={i} cx={x} cy={100} r="6" fill={["#0F62FE", "#8A3FFC", "#0F62FE"][i]} opacity="0.9" />
                  ))}
                  <text x="80" y="32" fill="#c6c6c6" fontSize="12" fontFamily="IBM Plex Mono, monospace" opacity="0.7">|ψ⟩ = α|0⟩ + β|1⟩</text>
                  <text x="260" y="170" fill="#78A9FF" fontSize="11" fontFamily="IBM Plex Mono, monospace" opacity="0.7">7,323 chunks indexed</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Featured Courses */}
          <div style={{ background: "var(--ql-layer-01)", padding: "0 0 56px 0" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 400, margin: "0 0 20px 0", color: "var(--ql-text-primary)", paddingTop: "32px" }}>
                Featured courses
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--ql-border)" }}>
                {FEATURED_COURSES.map(c => (
                  <FeaturedCourseCard key={c.id} course={c} onEnroll={handleEnroll} />
                ))}
              </div>
            </div>
          </div>

          {/* Learning Paths */}
          <div style={{ background: "var(--ql-layer-01)", padding: "0 0 56px 0", borderTop: "1px solid var(--ql-border)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 32px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px", alignItems: "start" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--ql-text-primary)", margin: "0 0 12px 0" }}>
                    Multi-resource learning paths
                  </h2>
                  <p style={{ fontSize: "0.88rem", color: "var(--ql-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    Curated sequences of courses, modules, and interactive circuit exercises designed for specific areas of quantum computing.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--ql-border)" }}>
                  {LEARNING_PATHS.map(p => <PathTile key={p.id} path={p} onSelect={handlePathSelect} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Modules */}
          <div style={{ background: "var(--ql-layer-01)", borderTop: "1px solid var(--ql-border)", padding: "0 0 56px 0" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 32px 0" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--ql-text-primary)", margin: "0 0 20px 0" }}>
                Featured modules
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--ql-border)" }}>
                {MODULES.slice(0, 8).map(m => <ModuleTile key={m.id} mod={m} />)}
              </div>
            </div>
          </div>

          {/* Studio CTA Banner */}
          <div style={{ background: "#262626", borderTop: "1px solid var(--ql-border)", borderBottom: "1px solid var(--ql-border)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--ql-text-primary)", margin: "0 0 8px 0" }}>
                  Build circuits in the Circuit Studio
                </h2>
                <button
                  onClick={onSwitchToStudio}
                  style={{
                    background: "none", border: "none", color: "#78A9FF",
                    fontSize: "0.92rem", cursor: "pointer", padding: 0,
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  Open Circuit Studio ↗
                </button>
              </div>
              <div style={{ opacity: 0.6 }}>
                <svg width="200" height="60" viewBox="0 0 200 60">
                  {[15, 30, 45].map((y, i) => (
                    <g key={i}>
                      <line x1="10" y1={y} x2="190" y2={y} stroke="#78A9FF" strokeWidth="1" opacity="0.5" />
                      {[40, 90, 140].map((x, j) => (
                        <rect key={j} x={x - 8} y={y - 8} width="16" height="16" fill="none" stroke="#78A9FF" strokeWidth="1" rx="1" opacity="0.7" />
                      ))}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 32px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--ql-text-primary)", margin: "0 0 28px 0" }}>
              Additional resources
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
              {[
                { icon: "▶", title: "Video Lectures", desc: "Recorded walkthroughs of circuit building, algorithm design, and error correction with live Qiskit demonstrations.", link: "Browse videos →" },
                { icon: "📄", title: "Research Papers", desc: "Direct access to the 76 landmark papers and textbooks indexed in our vector knowledge base — searchable via AI Tutor.", link: "Search papers →" },
                { icon: "🔬", title: "Interactive Tutorials", desc: "Step-by-step exercises running on the virtual 16-qubit QPU. Each tutorial exports executable Qiskit code.", link: "View tutorials →" },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{
                    width: "40px", height: "40px", background: "var(--ql-layer-02)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", marginBottom: "16px", borderRadius: "4px",
                    border: "1px solid var(--ql-border)",
                  }}>
                    {r.icon}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ql-text-primary)", margin: "0 0 8px 0" }}>{r.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--ql-text-secondary)", lineHeight: 1.6, margin: "0 0 12px 0" }}>{r.desc}</p>
                  <button style={{ background: "none", border: "none", color: "#78A9FF", fontSize: "0.85rem", cursor: "pointer", padding: 0 }}>{r.link}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COURSES TAB ──────────────────────────── */}
      {activeTab === "courses" && (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 300, margin: 0 }}>All Courses</h1>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--ql-text-helper)" }}>Filter by path:</span>
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
          <div style={{ border: "1px solid var(--ql-border)" }}>
            {/* Header row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto auto auto",
              gap: "16px", padding: "12px 20px",
              background: "var(--ql-layer-02)",
              borderBottom: "1px solid var(--ql-border)",
              fontSize: "0.75rem", color: "var(--ql-text-helper)", textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              <span>Course</span><span>Level</span><span>Duration</span><span></span>
            </div>
            {filteredCourses.map(c => <CourseRow key={c.id} course={c} />)}
          </div>
          <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--ql-text-helper)" }}>
            Showing {filteredCourses.length} of {ALL_COURSES.length} courses
          </div>
        </div>
      )}

      {/* ── MODULES TAB ─────────────────────────── */}
      {activeTab === "modules" && (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 300, margin: "0 0 8px 0" }}>Modules</h1>
          <p style={{ color: "var(--ql-text-secondary)", margin: "0 0 28px 0", fontSize: "0.92rem" }}>
            Short, focused lessons on individual quantum concepts. Each includes an interactive circuit example.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--ql-border)" }}>
            {MODULES.map(m => <ModuleTile key={m.id} mod={m} />)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "20px 32px", borderTop: "1px solid var(--ql-border)", marginTop: "auto" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--ql-text-helper)", margin: 0 }}>
          Quantum Leap · Team Gitwolves · SIH 2026 · Course content sourced from 76 peer-reviewed textbooks &amp; papers
        </p>
      </div>
    </div>
  );
}
