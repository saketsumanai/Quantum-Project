import React, { useState, useEffect, useRef, useMemo } from "react";
import { Cpu, GraduationCap, BookOpen, ArrowRight, ChevronRight, ChevronLeft, Zap, Globe, Activity, Layers, Award, Sparkles } from "lucide-react";
import { animate, stagger } from "animejs";
import WhyUsMetricsSection from "./WhyUsMetricsSection";

export default function LandingPage({ onNavigate }) {
  const titleRef = useRef(null);
  const quoteRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeBelief, setActiveBelief] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeLangIdx, setActiveLangIdx] = useState(0);
  const [ragMetricsData, setRagMetricsData] = useState(null);

  // Fetch live RAG benchmark metrics on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/ai-tutor/metrics")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch metrics");
      })
      .then((data) => setRagMetricsData(data))
      .catch((err) => {
        console.warn("Live metrics fetch notice:", err);
      });
  }, []);

  // Original Multilingual Quantum Principles
  const multilingualHeadlines = [
    { text: "Quantum discovery is global, coherence is key.", lang: "ENGLISH" },
    { text: "क्वांटम खोज वैश्विक है, सुसंगतता ही कुंजी है।", lang: "HINDI" },
    { text: "양자 발견은 세계적이며, 결맞음이 핵심입니다.", lang: "KOREAN" },
    { text: "Khám phá lượng tử mang tính toàn cầu, sự mạch lạc là then chốt.", lang: "VIETNAMESE" },
    { text: "量子探索遍布全球，相干性是关键", lang: "CHINESE" },
    { text: "A kvantum felfedezés globális, a koherencia a kulcs.", lang: "HUNGARIAN" },
  ];

  // Multilingual auto-rotation
  useEffect(() => {
    const langInterval = setInterval(() => {
      setActiveLangIdx((prev) => (prev + 1) % multilingualHeadlines.length);
    }, 3200);
    return () => clearInterval(langInterval);
  }, []);

  // Anime.js hero title entrance
  useEffect(() => {
    if (titleRef.current) {
      animate(titleRef.current.children, {
        translateY: [60, 0],
        opacity: [0, 1],
        ease: "outCubic",
        duration: 1200,
        delay: stagger(80, { start: 100 }),
      });
    }

    if (quoteRef.current) {
      animate(quoteRef.current, {
        translateY: [30, 0],
        opacity: [0, 1],
        ease: "outCubic",
        duration: 1000,
        delay: 600,
      });
    }
  }, []);

  // Background Flow Canvas Animation (Strict Monochrome Black & Grey + Gateway Flow)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width, height;
    let explosions = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      explosions.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        life: 1,
      });
    };

    canvas.addEventListener("click", handleClick);

    const paths = [];
    const numPaths = 70;

    for (let i = 0; i < numPaths; i++) {
      paths.push({
        isLeft: i % 2 === 0,
        startY: (i / numPaths) * height * 1.4 - height * 0.2,
        particles: [
          {
            t: Math.random(),
            speed: 0.0012 + Math.random() * 0.002,
          },
        ],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      explosions.forEach((exp) => {
        exp.radius += 12;
        exp.life -= 0.02;
      });
      explosions = explosions.filter((exp) => exp.life > 0);

      // Draw subtle grid overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Bezier Flow Lines (Monochrome Silver)
      paths.forEach((path) => {
        const p0 = { x: path.isLeft ? 0 : width, y: path.startY };
        const p1 = { x: path.isLeft ? centerX * 0.45 : width - centerX * 0.45, y: path.startY };
        const p2 = { x: path.isLeft ? centerX * 0.85 : width - centerX * 0.85, y: centerY };
        const p3 = { x: centerX, y: centerY };

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        path.particles.forEach((p) => {
          p.t += p.speed;
          if (p.t > 1) {
            p.t = 0;
            path.startY += (Math.random() - 0.5) * 8;
          }

          const u = 1 - p.t;
          const px = u ** 3 * p0.x + 3 * u ** 2 * p.t * p1.x + 3 * u * p.t ** 2 * p2.x + p.t ** 3 * p3.x;
          const py = u ** 3 * p0.y + 3 * u ** 2 * p.t * p1.y + 3 * u * p.t ** 2 * p2.y + p.t ** 3 * p3.y;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Explosion Ripple Effects
      explosions.forEach((exp) => {
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${exp.life * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToBeliefs = () => {
    document.getElementById("core-beliefs")?.scrollIntoView({ behavior: "smooth" });
  };

  const carouselSlides = [
    {
      id: "studio",
      title: "Circuit Studio Engine",
      subtitle: "Statevector Aer Simulation",
      description: "Build, evaluate, and inspect multi-qubit circuits on a high-performance C++ & Python Aer statevector simulator. Drag Pauli, Hadamard, and CNOT gates with real-time measurement distribution.",
      ctaText: "Launch Circuit Studio →",
      badge: "VIRTUAL QPU",
      metric: "16 Qubits Active",
    },
    {
      id: "learning",
      title: "RAG Quantum Knowledge Hub",
      subtitle: "76 Textbook Vector Indexes",
      description: "Explore deep quantum research paths built directly from 76 landmark textbooks and research papers indexed in ChromaDB. Access mathematical derivations, executable Qiskit 1.0 code, and theory.",
      ctaText: "Explore Learning Hub →",
      badge: "VECTOR DB",
      metric: "7,323 Chunks",
    },
    {
      id: "curriculum",
      title: "Structured Mastery Curriculum",
      subtitle: "Unit Progression & Concept Checks",
      description: "Navigate structured lesson units covering Superposition, Entanglement, Grover's Search, Shor's Algorithm, and Surface Codes. Test conceptual mastery via interactive verification.",
      ctaText: "Open Curriculum →",
      badge: "QISKIT 1.0",
      metric: "100% Verified",
    },
  ];

  return (
    <div style={{
      background: "#000000",
      color: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Global Dither Noise Overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.12,
        backgroundImage: "url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%202%202%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23ffffff%22%2F%3E%3Crect%20x%3D%221%22%20y%3D%221%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23ffffff%22%2F%3E%3C%2Fsvg%3E')",
        backgroundSize: "2px 2px",
      }} />

      {/* ── Section 1: Hero Container (Monochrome Gateway Flow) ── */}
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        zIndex: 2,
      }}>
        {/* Background Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            cursor: "crosshair",
          }}
        />

        {/* Ambient Center White Glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "650px",
          height: "650px",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }} />

        {/* Hero Main Content */}
        <div style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "22px",
        }}>
          {/* Top Pill Tag (Monochrome Black & Grey) */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 18px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#a1a1aa",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.6)",
          }}>
            <Zap size={13} color="#ffffff" />
            <span>QISKIT 1.0 • 16-QUBIT STATEVECTOR ENGINE</span>
          </div>

          {/* Main Title: QUANTUM LEAP */}
          <div ref={titleRef} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1 style={{
              fontSize: "clamp(3.2rem, 9vw, 6.5rem)",
              fontWeight: 200,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: "#ffffff",
              textTransform: "uppercase",
              margin: 0,
            }}>
              QUANTUM LEAP
            </h1>
          </div>

          {/* Quote directly below */}
          <p
            ref={quoteRef}
            style={{
              fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
              fontWeight: 300,
              color: "#d4d4d8",
              maxWidth: "740px",
              lineHeight: 1.6,
              fontStyle: "italic",
              margin: "0 auto",
            }}
          >
            “Where Classical Computation Ends and Infinite Possibilities Begin.”
          </p>

          <p style={{
            fontSize: "0.9rem",
            color: "#a1a1aa",
            maxWidth: "580px",
            lineHeight: 1.6,
            margin: 0,
          }}>
            An engineering framework for quantum algorithm synthesis, statevector simulation, and RAG-guided quantum theory.
          </p>

          {/* Primary Action Button (Monochrome Black & Grey Pill) */}
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => onNavigate("studio")}
              style={{
                padding: "16px 38px",
                background: "linear-gradient(135deg, #27272a 0%, #18181b 100%)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "9999px",
                fontSize: "0.88rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ffffff";
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#000000";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.background = "linear-gradient(135deg, #27272a 0%, #18181b 100%)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started <ArrowRight size={16} />
            </button>

            <button
              onClick={scrollToBeliefs}
              style={{
                padding: "16px 32px",
                background: "transparent",
                color: "#a1a1aa",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "9999px",
                fontSize: "0.88rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a1a1aa";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Explore Principles ↓
            </button>
          </div>
        </div>

        {/* Scroll Indicator Chevron */}
        <div
          onClick={scrollToBeliefs}
          style={{
            position: "absolute",
            bottom: "36px",
            cursor: "pointer",
            color: "#71717a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            zIndex: 10,
          }}
        >
          <span>Scroll Down</span>
          <div style={{ width: "2px", height: "18px", background: "linear-gradient(to bottom, #ffffff, transparent)", borderRadius: "1px" }} />
        </div>
      </div>

      {/* ── Section: Why Us? Live Empirical Evaluation Metrics ── */}
      <WhyUsMetricsSection telemetry={ragMetricsData} />

      {/* ── Section 2: Core Principles (Sticky Progress Navigation Sidebar) ── */}
      <div id="core-beliefs" style={{ position: "relative", zIndex: 2, padding: "100px 24px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "60px", alignItems: "start" }}>
          
          {/* Sticky Progress Indicator Navigation */}
          <div style={{ position: "sticky", top: "120px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              QUANTUM PRINCIPLES
            </div>

            {/* Vertical Progress Line & Menu Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", paddingLeft: "16px", borderLeft: "2px solid #27272a" }}>
              {[
                "Information is Quantum State",
                "Coherence drives progress",
                "Scale unlocks advantage",
                "Quantum discovery is global"
              ].map((label, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveBelief(idx)}
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: activeBelief === idx ? 600 : 400,
                    color: activeBelief === idx ? "#ffffff" : "#71717a",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{
                    width: activeBelief === idx ? "8px" : "0px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    boxShadow: activeBelief === idx ? "0 0 10px #ffffff" : "none",
                    transition: "all 0.2s ease",
                    display: "inline-block"
                  }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Principle Blocks Display */}
          <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
            
            {/* Principle 1 */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "48px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.8)",
            }}>
              <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.1em", marginBottom: "16px" }}>
                PRINCIPLE 01
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300, color: "#ffffff", lineHeight: 1.15, margin: "0 0 24px 0" }}>
                Information is <span style={{ fontWeight: 400, textDecoration: "underline", textDecorationColor: "#3f3f46", textUnderlineOffset: "8px" }}>Quantum State.</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "1.25rem", color: "#a1a1aa", fontWeight: 300 }}>
                <div>Superposition is information.</div>
                <div style={{ color: "#ffffff", fontWeight: 400 }}>Hilbert space opportunity is infinite.</div>
              </div>
            </div>

            {/* Principle 2 */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "48px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.8)",
            }}>
              <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.1em", marginBottom: "16px" }}>
                PRINCIPLE 02
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 300, lineHeight: 1.25 }}>
                <div style={{ color: "#71717a" }}>Noise isn't meant to be feared.</div>
                <div style={{ color: "#a1a1aa" }}>Decoherence is constant.</div>
                <div style={{ color: "#e4e4e7" }}>Fault-tolerance fuels innovation.</div>
                <div style={{ color: "#ffffff", fontWeight: 500 }}>Quantum algorithms empower researchers.</div>
                <div style={{ color: "#ffffff", fontWeight: 600 }}>Coherence is progress.</div>
              </div>
            </div>

            {/* Principle 3 */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "48px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.8)",
            }}>
              <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.1em", marginBottom: "16px" }}>
                PRINCIPLE 03
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300, color: "#ffffff", lineHeight: 1.15, margin: "0 0 24px 0" }}>
                Scale unlocks <span style={{ fontWeight: 400, textDecoration: "underline", textDecorationColor: "#3f3f46", textUnderlineOffset: "8px" }}>advantage.</span>
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {["Qubits", "Entanglement", "Statevectors"].map((item, idx) => (
                  <div key={idx} style={{
                    background: "#050505",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff" }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Principle 4 (Multilingual Headline + Stats Grid) */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "48px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.8)",
            }}>
              <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.1em", marginBottom: "16px" }}>
                PRINCIPLE 04
              </div>

              {/* Multilingual Rotating Headline */}
              <div style={{ minHeight: "100px" }}>
                <h2 style={{
                  fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)",
                  fontWeight: 300,
                  color: "#ffffff",
                  lineHeight: 1.25,
                  margin: "0 0 8px 0",
                  transition: "opacity 0.4s ease",
                }}>
                  {multilingualHeadlines[activeLangIdx].text}
                </h2>
                <div style={{ fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.1em" }}>
                  GLOBAL TRANSITION • {multilingualHeadlines[activeLangIdx].lang}
                </div>
              </div>

              {/* Stats Counters */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}>
                <div>
                  <div style={{ fontSize: "3rem", fontWeight: 200, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>16 Qubits</div>
                  <div style={{ fontSize: "0.85rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Simulated Real-Time</div>
                </div>
                <div>
                  <div style={{ fontSize: "3rem", fontWeight: 200, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>7,323</div>
                  <div style={{ fontSize: "0.85rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>RAG Chunks Indexed</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Section 3: Interactive Capabilities Carousel ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "80px 24px", background: "linear-gradient(180deg, #000000 0%, #09090b 100%)", borderTop: "1px solid #1c1c1c" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                PLATFORM CAPABILITIES
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "#ffffff", margin: 0 }}>
                Architected for <span style={{ fontWeight: 400, textDecoration: "underline", textDecorationColor: "#3f3f46", textUnderlineOffset: "8px" }}>Quantum Research</span>
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setActiveSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
                style={{
                  width: "44px", height: "44px", borderRadius: "50%", background: "#18181b", border: "1px solid #3f3f46", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#000000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3f3f46"; e.currentTarget.style.background = "#18181b"; e.currentTarget.style.color = "#ffffff"; }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setActiveSlide((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1))}
                style={{
                  width: "44px", height: "44px", borderRadius: "50%", background: "#18181b", border: "1px solid #3f3f46", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#000000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3f3f46"; e.currentTarget.style.background = "#18181b"; e.currentTarget.style.color = "#ffffff"; }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Active Carousel Slide Card */}
          <div
            onClick={() => onNavigate(carouselSlides[activeSlide].id)}
            style={{
              background: "linear-gradient(135deg, rgba(20, 20, 24, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: "24px",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              cursor: "pointer",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.9)",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.16)", padding: "4px 12px", borderRadius: "9999px", fontWeight: 700 }}>
                {carouselSlides[activeSlide].badge}
              </span>
              <span style={{ fontSize: "0.78rem", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa" }}>
                {carouselSlides[activeSlide].metric}
              </span>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {carouselSlides[activeSlide].subtitle}
              </div>
              <h3 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "#ffffff", margin: "8px 0 16px 0" }}>
                {carouselSlides[activeSlide].title}
              </h3>
              <p style={{ fontSize: "1rem", color: "#d4d4d8", lineHeight: 1.7, maxWidth: "780px", margin: 0 }}>
                {carouselSlides[activeSlide].description}
              </p>
            </div>

            <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.12)", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", fontWeight: 700, color: "#ffffff" }}>
              <span>{carouselSlides[activeSlide].ctaText}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: CTA Footer Section ── */}
      <div style={{
        padding: "80px 24px",
        background: "#000000",
        borderTop: "1px solid #1c1c1c",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}>
        <h3 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, color: "#ffffff", margin: 0 }}>
          Ready to Simulate <span style={{ fontWeight: 400, textDecoration: "underline", textDecorationColor: "#3f3f46", textUnderlineOffset: "8px" }}>Quantum Circuits?</span>
        </h3>
        <p style={{ fontSize: "0.95rem", color: "#a1a1aa", maxWidth: "580px", lineHeight: 1.6, margin: 0 }}>
          Launch the Circuit Studio, construct statevector transformations, or query the RAG-assisted Chatbot assistant.
        </p>
        <button
          onClick={() => onNavigate("studio")}
          style={{
            padding: "16px 40px",
            background: "linear-gradient(135deg, #27272a 0%, #18181b 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "9999px",
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.color = "#000000";
            e.currentTarget.style.borderColor = "#ffffff";
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #27272a 0%, #18181b 100%)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)";
          }}
        >
          Initialize Circuit Studio →
        </button>

        <div style={{ marginTop: "40px", fontSize: "0.78rem", color: "#71717a", fontFamily: "'JetBrains Mono', monospace" }}>
          QUANTUM LEAP • TEAM GITWOLVES • SIH 2026
        </div>
      </div>

    </div>
  );
}
