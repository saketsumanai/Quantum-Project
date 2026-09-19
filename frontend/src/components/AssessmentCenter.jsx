import React, { useState, useEffect } from "react";
import {
  Award,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  BrainCircuit,
  FileText,
  ChevronRight,
  ChevronLeft,
  Filter,
  BarChart3,
  Flame,
  Bookmark,
  ExternalLink,
  Zap,
  Check,
  HelpCircle,
  AlertCircle,
  Download,
  Eye,
  Sliders,
  Compass
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MathRenderer, { LatexBlock } from "./MathRenderer";

const API = "http://localhost:8000/api/v1";

const TOPIC_PRESETS = [
  { id: "Quantum Gates & Circuit Basics", label: "Quantum Gates & Circuits", description: "Pauli X/Y/Z, Hadamard, Phase, CNOT & Reversibility" },
  { id: "Bell States & Quantum Entanglement", label: "Bell States & Entanglement", description: "Bell state synthesis, non-locality, CHSH, teleportation" },
  { id: "Grover Algorithm & Quantum Search", label: "Grover Search Algorithm", description: "Phase inversion oracles, diffusion operators, O(√N) speedup" },
  { id: "Quantum Fourier Transform & QPE", label: "QFT & Phase Estimation", description: "Vandermonde matrices, quantum phase estimation, Shor's algorithm" },
  { id: "Variational Quantum Eigensolver (VQE)", label: "VQE & Variational Algorithms", description: "Ansatz design, Hamiltonian mapping, molecular ground states" },
  { id: "Quantum Error Correction & Decaherence", label: "Error Correction & Noise", description: "Bit-flip/Phase-flip codes, Shor 9-qubit code, Surface codes" },
];

export default function AssessmentCenter({ onSwitchToStudio, onSwitchToLearning }) {
  const { user, token, recordTest, updateUserTopics } = useAuth();

  // Top-level views: 'overview' | 'test_runner' | 'report_detail'
  const [view, setView] = useState("overview");

  // Generator parameters
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_PRESETS[0].id);
  const [customTopic, setCustomTopic] = useState("");
  const [inputMode, setInputMode] = useState("topic"); // "topic" | "notes"
  const [customNotes, setCustomNotes] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Curated tests
  const [curatedExams, setCuratedExams] = useState([]);

  // Active quiz session
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: option_index }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [question_id]: bool }
  const [timeRemaining, setTimeRemaining] = useState(600); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);

  // Stored reports
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Load curated exams & past reports on mount
  useEffect(() => {
    fetchCuratedExams();
    fetchReports();
  }, [user]);

  // Timer countdown hook
  useEffect(() => {
    let timer = null;
    if (view === "test_runner" && isTimerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, isTimerActive, timeRemaining]);

  const fetchCuratedExams = async () => {
    try {
      const res = await fetch(`${API}/assessment/curated-quizzes`);
      if (res.ok) {
        const data = await res.json();
        setCuratedExams(data);
      }
    } catch (err) {
      console.warn("Could not load curated exams:", err);
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/assessment/reports`, { headers });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      } else {
        // Fallback to localStorage
        loadLocalReports();
      }
    } catch (err) {
      console.warn("Error fetching backend reports, using local storage:", err);
      loadLocalReports();
    } finally {
      setIsLoadingReports(false);
    }
  };

  const loadLocalReports = () => {
    try {
      const local = localStorage.getItem("quantum_test_reports");
      if (local) {
        setReports(JSON.parse(local));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveReportLocallyAndRemote = async (reportPayload) => {
    setIsSavingReport(true);
    let savedData = null;
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/assessment/save-report`, {
        method: "POST",
        headers,
        body: JSON.stringify(reportPayload),
      });
      if (res.ok) {
        savedData = await res.json();
      }
    } catch (err) {
      console.warn("Remote save failed, keeping local report:", err);
    }

    const finalReport = savedData || {
      ...reportPayload,
      id: `local_rep_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Update state & local storage
    setReports((prev) => {
      const updated = [finalReport, ...prev.filter((r) => r.id !== finalReport.id)];
      try {
        localStorage.setItem("quantum_test_reports", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setIsSavingReport(false);
    return finalReport;
  };

  // Generate a new test via Groq AI
  const handleGenerateTest = async (overrideParams = null) => {
    setIsGenerating(true);
    setGenerationError(null);
    const targetTopic = overrideParams?.topic || customTopic.trim() || selectedTopic;
    const targetDiff = overrideParams?.difficulty || difficulty;
    const targetCount = overrideParams?.count || parseInt(numQuestions);
    const hasNotes = inputMode === "notes" && customNotes.trim();
    const customContent = overrideParams?.custom_content || (hasNotes ? customNotes.trim() : null);

    try {
      const res = await fetch(`${API}/assessment/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: targetTopic,
          difficulty: targetDiff,
          num_questions: targetCount,
          include_code: true,
          custom_content: customContent,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const quizData = await res.json();

      if (quizData && quizData.questions && quizData.questions.length > 0) {
        startQuizSession(quizData);
      } else {
        throw new Error("No questions were generated by the examination engine.");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      setGenerationError("Examiner engine temporarily busy. Loading pre-verified questions from curriculum pool.");
      // Fallback request
      try {
        const fallbackRes = await fetch(`${API}/assessment/generate-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: targetTopic,
            difficulty: targetDiff,
            num_questions: targetCount,
          }),
        });
        const fbData = await fallbackRes.json();
        startQuizSession(fbData);
      } catch (e) {
        setGenerationError("Failed to initialize test. Please check backend connection.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Launch a curated mock exam
  const handleLaunchCurated = (exam) => {
    setSelectedTopic(exam.topic);
    setDifficulty(exam.difficulty);
    setNumQuestions(exam.question_count);
    handleGenerateTest({
      topic: exam.topic,
      difficulty: exam.difficulty,
      count: exam.question_count,
    });
  };


  const startQuizSession = (quizData) => {
    setActiveQuiz(quizData);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setTimeRemaining((quizData.estimated_minutes || 10) * 60);
    setIsTimerActive(true);
    setTestStartTime(Date.now());
    setView("test_runner");
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    setIsTimerActive(false);
    if (!activeQuiz) return;

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - testStartTime) / 1000));
    let correctCount = 0;

    const questionReviews = activeQuiz.questions.map((q) => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected !== undefined && selected === q.correct_index;
      if (isCorrect) correctCount++;
      return {
        question_id: q.id,
        question: q.question,
        options: q.options,
        selected_index: selected !== undefined ? selected : null,
        correct_index: q.correct_index,
        is_correct: isCorrect,
        explanation: q.explanation,
        topic: q.topic || activeQuiz.topic,
      };
    });

    const totalQuestions = activeQuiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 1000) / 10;

    const reportPayload = {
      quiz_id: activeQuiz.quiz_id || `quiz_${Date.now()}`,
      title: activeQuiz.title || `${activeQuiz.topic} Assessment`,
      topic: activeQuiz.topic,
      difficulty: activeQuiz.difficulty || difficulty,
      total_questions: totalQuestions,
      correct_count: correctCount,
      score_percentage: scorePercentage,
      time_taken_seconds: timeSpentSeconds,
      question_reviews: questionReviews,
    };

    if (recordTest) {
      recordTest({
        test_name: reportPayload.title,
        score: reportPayload.score_percentage,
        topic: reportPayload.topic,
        date: new Date().toISOString(),
      });
    }
    if (updateUserTopics && reportPayload.topic) {
      updateUserTopics(reportPayload.topic, reportPayload.score_percentage);
    }

    const saved = await saveReportLocallyAndRemote(reportPayload);
    setSelectedReport(saved);
    setView("report_detail");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Helper stats
  const totalTestsTaken = reports.length;
  const avgScore = totalTestsTaken > 0
    ? Math.round(reports.reduce((acc, r) => acc + (r.score_percentage || 0), 0) / totalTestsTaken)
    : 0;
  const highestScore = totalTestsTaken > 0
    ? Math.max(...reports.map((r) => r.score_percentage || 0))
    : 0;

  return (
    <div style={{
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "0 24px 40px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}>
      {/* ─── Top Banner ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "28px 32px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
      }}>
        <div>
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
            marginBottom: "10px",
          }}>
            <Sparkles size={12} color="#ffffff" />
            <span>DIAGNOSTIC SUITE • RIGOROUS ASSESSMENT</span>
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 400, color: "#ffffff", letterSpacing: "-0.035em", margin: 0, textTransform: "uppercase" }}>
            Quantum Knowledge Assessment
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#a1a1aa", marginTop: "6px", lineHeight: 1.5 }}>
            Rigorous evaluation of quantum mechanics, circuit transformation, and complexity theory.
          </p>
        </div>

        {/* Global Summary Stats */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{
            padding: "12px 20px", borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.10)",
            textAlign: "center", minWidth: "105px"
          }}>
            <span style={{ fontSize: "0.68rem", color: "#a1a1aa", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tests Taken</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 400, color: "#ffffff", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{totalTestsTaken}</div>
          </div>
          <div style={{
            padding: "12px 20px", borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.10)",
            textAlign: "center", minWidth: "105px"
          }}>
            <span style={{ fontSize: "0.68rem", color: "#a1a1aa", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Avg Score</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 400, color: "#ffffff", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{avgScore}%</div>
          </div>
          <div style={{
            padding: "12px 20px", borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.10)",
            textAlign: "center", minWidth: "105px"
          }}>
            <span style={{ fontSize: "0.68rem", color: "#a1a1aa", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>High Score</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 400, color: "#10b981", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{highestScore}%</div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs within Assessment ─────────────────────────────── */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          className={view === "overview" ? "btn-overview-primary" : "btn-overview-secondary"}
          onClick={() => setView("overview")}
        >
          Test Generator &amp; Benchmark Exams
        </button>

        <button
          className={view === "report_detail" ? "btn-overview-primary" : "btn-overview-secondary"}
          onClick={() => {
            if (reports.length > 0) {
              setSelectedReport(reports[0]);
              setView("report_detail");
            }
          }}
          disabled={reports.length === 0}
        >
          <FileText size={14} /> Performance Reports ({reports.length})
        </button>

        {view === "test_runner" && (
          <span style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.16)",
            padding: "6px 16px", borderRadius: "9999px", color: "#ffffff", fontSize: "0.78rem", fontWeight: 600,
            fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em"
          }}>
            <Clock size={14} /> In Progress · {formatTime(timeRemaining)}
          </span>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 1: OVERVIEW & GENERATOR
      ──────────────────────────────────────────────────────────────────────── */}
      {view === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(360px, 1fr)", gap: "24px" }}>
          {/* Left Column: AI Test Customizer */}
          <div style={{
            background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ffffff" }}>Diagnostic Exam Generator</h3>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "2px" }}>
                Targeted evaluation questions generated from canonical quantum physics literature.
              </p>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setInputMode("topic")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: inputMode === "topic" ? "rgba(15, 98, 254, 0.2)" : "transparent",
                  border: inputMode === "topic" ? "1px solid #0f62fe" : "1px solid rgba(255,255,255,0.08)",
                  color: inputMode === "topic" ? "#78a9ff" : "#9ca3af",
                }}
              >
                1. Select Topic or Algorithm
              </button>
              <button
                type="button"
                onClick={() => setInputMode("notes")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: inputMode === "notes" ? "rgba(168, 85, 247, 0.2)" : "transparent",
                  border: inputMode === "notes" ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                  color: inputMode === "notes" ? "#c084fc" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileText size={14} /> 2. Paste Notes / PDF / Screenshot Text
              </button>
            </div>

            {inputMode === "topic" ? (
              <>
                {/* Topic Selection Chips */}
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", display: "block" }}>
                    Select Core Quantum Topic:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                    {TOPIC_PRESETS.map((p) => {
                      const isSelected = selectedTopic === p.id && !customTopic;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedTopic(p.id);
                            setCustomTopic("");
                          }}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "6px",
                            background: isSelected ? "rgba(15, 98, 254, 0.15)" : "rgba(255,255,255,0.03)",
                            border: isSelected ? "1px solid #0f62fe" : "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "0.84rem", color: isSelected ? "#78a9ff" : "#fff" }}>
                            {p.label}
                          </div>
                          <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "4px", lineHeight: 1.35 }}>
                            {p.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Topic Input */}
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                    Or Enter Custom Topic / Quantum Algorithm:
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Quantum Teleportation Protocol, Simon's Algorithm, Qiskit Transpiler Optimization..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.4)",
                      border: customTopic ? "1px solid #a855f7" : "1px solid var(--border-subtle)",
                      color: "#fff",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </>
            ) : (
              /* Custom Notes / Document Content */
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c084fc", marginBottom: "6px", display: "block" }}>
                  Paste Document Text / Screenshot Notes / Syllabus:
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your quantum lecture notes, textbook excerpt, homework prompt, or OCR text from a screenshot here. The AI will generate custom multiple choice questions testing this exact content..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(168,85,247,0.3)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "4px" }}>
                  The AI examiner will extract key theorems, matrices, and concepts from your text to build your quiz.
                </div>
              </div>
            )}

            {/* Difficulty & Number of Questions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
                  Difficulty Tier:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["beginner", "intermediate", "advanced"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`btn ${difficulty === d ? "btn-primary" : "btn-glass"}`}
                      style={{
                        flex: 1,
                        padding: "7px 0",
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                        borderRadius: "8px",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
                  Question Count:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[3, 5, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumQuestions(n)}
                      className={`btn ${numQuestions === n ? "btn-primary" : "btn-glass"}`}
                      style={{
                        flex: 1,
                        padding: "7px 0",
                        fontSize: "0.75rem",
                        borderRadius: "8px",
                      }}
                    >
                      {n} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {generationError && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <AlertCircle size={16} />
                <span>{generationError}</span>
              </div>
            )}

            <button
              className="btn-overview-primary"
              onClick={handleGenerateTest}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.84rem",
                marginTop: "8px",
              }}
            >
              {isGenerating ? (
                "Synthesizing Questions from Quantum Corpus..."
              ) : (
                `Start Examination (${numQuestions} Questions)`
              )}
            </button>
          </div>

          {/* Right Column: Instant Curated Mock Certification Exams */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
              padding: "24px"
            }}>
              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 500, color: "#ffffff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Curated Certification Exams
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#a1a1aa", marginTop: "4px" }}>
                  Standard benchmark exams calibrated for university-level evaluation.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {curatedExams.map((exam) => (
                  <div
                    key={exam.id}
                    style={{
                      padding: "16px 18px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.10)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{
                        fontSize: "0.68rem", padding: "3px 8px", borderRadius: "9999px",
                        background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#ffffff", fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase"
                      }}>
                        {exam.badge}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#a1a1aa", fontFamily: "var(--font-mono)" }}>
                        {exam.estimated_minutes} mins · {exam.question_count} Qs
                      </span>
                    </div>

                    <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "#ffffff" }}>
                      {exam.title}
                    </div>

                    <p style={{ fontSize: "0.80rem", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
                      {exam.description}
                    </p>

                    <button
                      onClick={() => handleLaunchCurated(exam)}
                      className="btn-overview-secondary"
                      style={{
                        alignSelf: "flex-end",
                        padding: "6px 14px",
                        fontSize: "0.74rem",
                        marginTop: "4px"
                      }}
                    >
                      Start Exam →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stored Reports Quick Preview Card */}
            <div className="glass-panel" style={{ padding: "20px", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={16} color="#00f0ff" /> Recent Saved Reports
                </h4>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {reports.length} total
                </span>
              </div>

              {reports.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
                  No past test reports yet. Take your first exam to see automated AI diagnostic reports here!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                  {reports.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReport(r);
                        setView("report_detail");
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>
                          {r.title}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          {new Date(r.created_at).toLocaleDateString()} · {r.total_questions} Qs
                        </div>
                      </div>
                      <span style={{
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        color: r.score_percentage >= 80 ? "#10b981" : r.score_percentage >= 60 ? "#38bdf8" : "#f59e0b"
                      }}>
                        {r.score_percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 2: ACTIVE TEST RUNNER
      ──────────────────────────────────────────────────────────────────────── */}
      {view === "test_runner" && activeQuiz && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "24px" }}>
          {/* Main Question Card */}
          <div className="glass-panel" style={{ padding: "32px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Question Top Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Question {currentQIndex + 1} of {activeQuiz.questions.length} · {activeQuiz.difficulty.toUpperCase()}
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#00f0ff", marginTop: "2px" }}>
                  {activeQuiz.topic}
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => toggleFlagQuestion(activeQuiz.questions[currentQIndex]?.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "5px 12px", borderRadius: "20px",
                    background: flaggedQuestions[activeQuiz.questions[currentQIndex]?.id] ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                    border: flaggedQuestions[activeQuiz.questions[currentQIndex]?.id] ? "1px solid #f59e0b" : "1px solid var(--border-subtle)",
                    color: flaggedQuestions[activeQuiz.questions[currentQIndex]?.id] ? "#f59e0b" : "var(--text-muted)",
                    fontSize: "0.74rem", cursor: "pointer",
                  }}
                >
                  <Bookmark size={13} />
                  {flaggedQuestions[activeQuiz.questions[currentQIndex]?.id] ? "Flagged for Review" : "Flag"}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div style={{ fontSize: "1.08rem", fontWeight: 500, color: "#fff", lineHeight: 1.6 }}>
              <MathRenderer content={activeQuiz.questions[currentQIndex]?.question} />
            </div>

            {/* Formula if present */}
            {activeQuiz.questions[currentQIndex]?.formula && (
              <div style={{
                padding: "12px 18px",
                background: "rgba(15,98,254,0.08)",
                border: "1px solid rgba(15,98,254,0.25)",
                borderRadius: "8px",
                overflowX: "auto"
              }}>
                <LatexBlock tex={activeQuiz.questions[currentQIndex]?.formula} display={true} />
              </div>
            )}

            {/* Code Snippet if present */}
            {activeQuiz.questions[currentQIndex]?.code_snippet && (
              <pre style={{
                padding: "14px 18px",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                fontFamily: "monospace",
                fontSize: "0.82rem",
                color: "#e2e8f0",
                overflowX: "auto",
              }}>
                <code>{activeQuiz.questions[currentQIndex]?.code_snippet}</code>
              </pre>
            )}

            {/* Options list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
              {activeQuiz.questions[currentQIndex]?.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[activeQuiz.questions[currentQIndex]?.id] === oIdx;
                const optLetter = ["A", "B", "C", "D"][oIdx] || `${oIdx + 1}`;
                return (
                  <div
                    key={oIdx}
                    onClick={() => handleSelectOption(activeQuiz.questions[currentQIndex]?.id, oIdx)}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "12px",
                      background: isSelected ? "rgba(15,98,254,0.2)" : "rgba(255,255,255,0.03)",
                      border: isSelected ? "1.5px solid #0f62fe" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: isSelected ? "#0f62fe" : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "0.82rem",
                      flexShrink: 0,
                    }}>
                      {optLetter}
                    </div>
                    <div style={{ fontSize: "0.92rem", color: isSelected ? "#fff" : "var(--text-primary)" }}>
                      <MathRenderer content={opt} style={{ display: 'inline' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigator */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                className="btn btn-glass"
                onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                disabled={currentQIndex === 0}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQIndex < activeQuiz.questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentQIndex((i) => i + 1)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={handleSubmitTest}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #00f0ff)",
                    color: "#000",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle2 size={16} /> Finish & Submit Test
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar: Question Grid Navigator & Timer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Timer Card */}
            <div className="glass-panel" style={{ padding: "18px", borderRadius: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Time Left</span>
              <div style={{
                fontSize: "1.7rem", fontWeight: 800,
                color: timeRemaining < 120 ? "#ef4444" : "#00f0ff",
                fontFamily: "monospace", marginTop: "4px"
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Question Grid */}
            <div className="glass-panel" style={{ padding: "18px", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Questions Navigator:
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {activeQuiz.questions.map((q, idx) => {
                  const isCurrent = currentQIndex === idx;
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions[q.id];

                  let bg = "rgba(255,255,255,0.05)";
                  let border = "1px solid var(--border-subtle)";
                  let color = "var(--text-muted)";

                  if (isCurrent) {
                    border = "1.5px solid #00f0ff";
                    color = "#00f0ff";
                  } else if (isFlagged) {
                    bg = "rgba(245,158,11,0.2)";
                    border = "1px solid #f59e0b";
                    color = "#f59e0b";
                  } else if (isAnswered) {
                    bg = "rgba(16,185,129,0.2)";
                    border = "1px solid rgba(16,185,129,0.4)";
                    color = "#10b981";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      style={{
                        padding: "10px 0",
                        borderRadius: "8px",
                        background: bg,
                        border: border,
                        color: color,
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "2px", background: "rgba(16,185,129,0.5)" }} /> Answered
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "2px", background: "rgba(245,158,11,0.5)" }} /> Flagged for review
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "2px", border: "1px solid #00f0ff" }} /> Current
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSubmitTest}
                style={{ width: "100%", marginTop: "10px", padding: "10px", fontSize: "0.82rem" }}
              >
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          VIEW 3: PERFORMANCE REPORT CARD & AI DIAGNOSIS
      ──────────────────────────────────────────────────────────────────────── */}
      {view === "report_detail" && selectedReport && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Score Banner */}
          <div className="glass-panel" style={{
            padding: "32px",
            borderRadius: "16px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: "32px",
            background: "linear-gradient(135deg, rgba(0,240,255,0.06), rgba(168,85,247,0.1), rgba(15,23,42,0.8))",
            border: "1px solid var(--border-glow)",
          }}>
            {/* Score Ring */}
            <div style={{
              width: "120px", height: "120px", borderRadius: "50%",
              background: `conic-gradient(#00f0ff ${selectedReport.score_percentage}%, rgba(255,255,255,0.08) 0)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(0,240,255,0.25)",
            }}>
              <div style={{
                width: "98px", height: "98px", borderRadius: "50%",
                background: "#07090e",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>
                  {Math.round(selectedReport.score_percentage)}%
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Accuracy
                </span>
              </div>
            </div>

            {/* Assessment Meta & Proficiency Tier */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontSize: "0.72rem", padding: "3px 10px", borderRadius: "14px",
                  background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)",
                  color: "#c084fc", fontWeight: 700
                }}>
                  {selectedReport.ai_feedback?.proficiency_level || "Quantum Assessment"}
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  {new Date(selectedReport.created_at).toLocaleString()}
                </span>
              </div>

              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#fff", marginTop: "6px" }}>
                {selectedReport.title}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                {selectedReport.ai_feedback?.performance_summary}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedTopic(selectedReport.topic);
                  setView("overview");
                }}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "0.84rem" }}
              >
                <RotateCcw size={15} /> Retake Test
              </button>

              <button
                className="btn btn-glass"
                onClick={() => setView("overview")}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "0.84rem" }}
              >
                <ChevronLeft size={15} /> Back to Exams
              </button>
            </div>
          </div>

          {/* AI Tutor Diagnostic Recommendations */}
          {selectedReport.ai_feedback && (
            <div className="glass-panel" style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(168,85,247,0.3)",
              background: "rgba(168,85,247,0.05)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#c084fc", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <BrainCircuit size={18} /> Recommended Study Focus Areas:
                </h4>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(selectedReport.ai_feedback.recommended_focus_areas || []).map((area, idx) => (
                    <li key={idx} style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f0ff" }} /> {area}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Suggested Curriculum Follow-Up:</span>
                <div style={{
                  padding: "10px 16px", borderRadius: "10px",
                  background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-glow)",
                  fontWeight: 600, fontSize: "0.86rem", color: "#00f0ff"
                }}>
                  {selectedReport.ai_feedback.suggested_lesson || "Unit 1: Quantum Bits & Gates"}
                </div>
                {onSwitchToLearning && (
                  <button
                    className="btn btn-glass"
                    onClick={onSwitchToLearning}
                    style={{ fontSize: "0.78rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <BookOpen size={14} color="#00f0ff" /> Open in Learning Hub
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Detailed Question Review List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} color="#00f0ff" /> Question-by-Question Diagnostic Review:
            </h3>

            {(selectedReport.question_reviews || []).map((rev, qIdx) => {
              const isCorrect = rev.is_correct;
              return (
                <div
                  key={rev.question_id || qIdx}
                  className="glass-panel"
                  style={{
                    padding: "20px 24px",
                    borderRadius: "14px",
                    borderLeft: isCorrect ? "4px solid #10b981" : "4px solid #ef4444",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      Question {qIdx + 1}
                    </span>
                    <span style={{
                      fontSize: "0.72rem", padding: "2px 8px", borderRadius: "12px",
                      background: isCorrect ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: isCorrect ? "#34d399" : "#f87171",
                      fontWeight: 700,
                      display: "flex", alignItems: "center", gap: "4px"
                    }}>
                      {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {isCorrect ? "Correct (+50 XP)" : "Incorrect"}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "#fff" }}>
                    <MathRenderer content={rev.question} />
                  </div>

                  {/* Formula if present */}
                  {rev.formula && (
                    <div style={{
                      padding: "10px 14px",
                      background: "rgba(15,98,254,0.08)",
                      border: "1px solid rgba(15,98,254,0.25)",
                      borderRadius: "6px",
                      overflowX: "auto"
                    }}>
                      <LatexBlock tex={rev.formula} display={true} />
                    </div>
                  )}

                  {/* Options with student and correct indicator */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {rev.options?.map((optText, oIdx) => {
                      const isStudentSelected = rev.selected_index === oIdx;
                      const isAnswerCorrect = rev.correct_index === oIdx;

                      let borderStyle = "1px solid var(--border-subtle)";
                      let bgStyle = "rgba(255,255,255,0.02)";
                      let badge = null;

                      if (isAnswerCorrect) {
                        borderStyle = "1.5px solid #10b981";
                        bgStyle = "rgba(16,185,129,0.1)";
                        badge = <span style={{ color: "#10b981", fontSize: "0.68rem", fontWeight: 700 }}>✓ Correct</span>;
                      } else if (isStudentSelected && !isCorrect) {
                        borderStyle = "1.5px solid #ef4444";
                        bgStyle = "rgba(239,68,68,0.1)";
                        badge = <span style={{ color: "#ef4444", fontSize: "0.68rem", fontWeight: 700 }}>✗ Your Choice</span>;
                      }

                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: bgStyle,
                            border: borderStyle,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.82rem",
                            color: "#fff",
                          }}
                        >
                          <MathRenderer content={optText} style={{ display: 'inline' }} />
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rigorous physical explanation */}
                  <div style={{
                    padding: "12px 16px",
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}>
                    <div style={{ color: "#78a9ff", fontWeight: 600, marginBottom: "4px" }}>Physical Mechanism & Explanation:</div>
                    <MathRenderer content={rev.explanation} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
