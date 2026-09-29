import React, { useState, useEffect, useRef, useMemo } from "react";
import { Cpu, GraduationCap, BookOpen, ArrowRight, ChevronRight, ChevronLeft, Zap, Globe, Activity, Layers, Award, Sparkles, Quote, Terminal, CheckCircle2 } from "lucide-react";
import { animate, stagger } from "animejs";
import WhyUsMetricsSection from "./WhyUsMetricsSection";
import { ContainerScroll, CardsContainer, CardTransformed, useContainerScrollContext } from "./ui/animated-cards-stack";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import API_BASE from "../config/api";

function PrinciplesScrollTracker({ onProgress }) {
  const { scrollYProgress } = useContainerScrollContext();
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      onProgress(latest);
    });
  }, [scrollYProgress, onProgress]);
  return null;
}

export default function LandingPage({ onNavigate = () => {}, onOpenAuth = () => {} }) {
  const titleRef = useRef(null);
  const quoteRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeBelief, setActiveBelief] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeLangIdx, setActiveLangIdx] = useState(0);
  const [ragMetricsData, setRagMetricsData] = useState(null);
  const coreBeliefsRef = useRef(null);

  const handleScrollToPrinciple = (idx) => {
    setActiveBelief(idx);
    if (coreBeliefsRef.current) {
      const rect = coreBeliefsRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const totalScrollable = Math.max(1, coreBeliefsRef.current.offsetHeight - window.innerHeight);
      const targetTop = scrollTop + rect.top + (idx / 3) * totalScrollable;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  };

  // Fetch live RAG benchmark metrics on mount
  useEffect(() => {
    fetch(`${API_BASE}/ai-tutor/metrics`)
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
      subtitle: "Multi-Qubit Statevector Simulation",
      description: "Build, evaluate, and inspect multi-qubit circuits on a high-performance quantum statevector simulator. Drag Pauli, Hadamard, and CNOT gates with real-time measurement distribution.",
      ctaText: "Launch Circuit Studio →",
      badge: "VIRTUAL QPU",
      metric: "16 Qubits Active",
    },
    {
      id: "learning",
      title: "Quantum Knowledge Hub",
      subtitle: "76 Verified Literature Indexes",
      description: "Explore deep quantum research paths built directly from 76 landmark textbooks and research papers. Access mathematical derivations, executable quantum code, and theory.",
      ctaText: "Explore Learning Hub →",
      badge: "KNOWLEDGE BASE",
      metric: "7,323 Chunks",
    },
    {
      id: "videos",
      title: "Multilingual Video Lectures",
      subtitle: "10 Indian Languages & NPTEL IIT Premier",
      description: "Watch authentic video lectures dubbed in Hindi, Tamil, Telugu, and more with AI live voiceover, contextual doubt-solving, and integrated note-taking.",
      ctaText: "Watch Video Lectures →",
      badge: "MULTILINGUAL",
      metric: "10 Languages",
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
      overflowX: "clip",
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

      {/* Top Header Navigation */}
      <header style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #0f62fe 0%, #8a3ffc 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "0.9rem", color: "#fff",
          }}>Q</div>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Quantum Leap</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => (typeof onOpenAuth === 'function' ? onOpenAuth() : (typeof onNavigate === 'function' && onNavigate('studio')))}
            style={{
              padding: "7px 18px",
              background: "#0f62fe",
              border: "1px solid #0f62fe",
              color: "#fff",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Sign In
          </button>
        </div>
      </header>
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
              onClick={() => {
                if (typeof onNavigate === 'function') onNavigate("studio");
                else if (typeof onOpenAuth === 'function') onOpenAuth();
              }}
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

      {/* ── Section 2: Core Principles (Animated 3D Cards Stack & Sticky Navigation) ── */}
      <div id="core-beliefs" ref={coreBeliefsRef} style={{
        position: "relative",
        zIndex: 2,
        padding: "80px 24px",
        maxWidth: "1360px",
        margin: "0 auto",
        width: "100%",
        fontFamily: "'Poppins', sans-serif",
      }}>
        <ContainerScroll className="relative min-h-[300vh] w-full">
          <PrinciplesScrollTracker onProgress={(p) => {
            if (p < 0.25) setActiveBelief(0);
            else if (p < 0.50) setActiveBelief(1);
            else if (p < 0.75) setActiveBelief(2);
            else setActiveBelief(3);
          }} />

          {/* Sticky Viewport with Dual-Column Layout */}
          <div style={{
            position: "sticky",
            top: "85px",
            height: "calc(100vh - 105px)",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "44px",
            alignItems: "center",
          }}>
            {/* Left Column: Sticky Progress Indicator Navigation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Poppins', sans-serif" }}>
              <div style={{ fontSize: "0.75rem", fontFamily: "'Poppins', sans-serif", color: "#a1a1aa", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
                QUANTUM PRINCIPLES
              </div>

              {/* Vertical Progress Line & Menu Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", position: "relative", paddingLeft: "16px", borderLeft: "2px solid #27272a" }}>
                {[
                  { label: "Information is Quantum State", pioneer: "Rolf Landauer & C. Bennett" },
                  { label: "Coherence drives progress", pioneer: "Richard Feynman & J. Preskill" },
                  { label: "Scale unlocks advantage", pioneer: "David Deutsch & Peter Shor" },
                  { label: "Quantum discovery is global", pioneer: "Lov Grover & Global Open Science" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleScrollToPrinciple(idx)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <span style={{
                      width: activeBelief === idx ? "8px" : "0px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      boxShadow: activeBelief === idx ? "0 0 10px rgba(255, 255, 255, 0.9)" : "none",
                      transition: "all 0.2s ease",
                      display: "inline-block",
                      marginTop: "7px",
                      flexShrink: 0
                    }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{
                        fontSize: "0.92rem",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: activeBelief === idx ? 600 : 400,
                        color: activeBelief === idx ? "#ffffff" : "#71717a",
                        transition: "color 0.2s ease",
                      }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontSize: "0.76rem",
                        fontFamily: "'Poppins', sans-serif",
                        color: activeBelief === idx ? "#d4d4d8" : "#52525b",
                        marginTop: "2px",
                        fontWeight: 400,
                        transition: "color 0.2s ease"
                      }}>
                        {item.pioneer}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll transformation indicator */}
              <div style={{
                marginTop: "16px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.74rem",
                color: "#a1a1aa",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}>
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff", boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)" }} />
                <span>SCROLL TO TRANSFORM CARDS</span>
              </div>
            </div>

            {/* Right Column: CardsContainer with 3D Transformed Stacking Cards */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <CardsContainer className="relative w-full max-w-[940px] h-[480px]">
                
                {/* ── CARD 1: Principle 01 ── */}
                <CardTransformed
                  arrayLength={4}
                  index={1}
                  incrementY={0}
                  incrementZ={25}
                  incrementRotation={0}
                  variant="dark"
                  className="!bg-[#0c0c10]/98 !border-white/14 !p-7 md:!p-8 !items-stretch !justify-between shadow-2xl backdrop-blur-2xl !rounded-2xl cursor-pointer group select-none"
                  style={{
                    background: "linear-gradient(145deg, rgba(22, 22, 28, 0.98) 0%, rgba(10, 10, 14, 0.99) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 28px 70px rgba(0, 0, 0, 0.95), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onClick={() => handleScrollToPrinciple(1)}
                  title="Click to peel card to Principle 02"
                >
                  <div className="flex items-center justify-between w-full border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                      <span className="font-semibold text-xs tracking-widest text-zinc-300 uppercase">
                        PRINCIPLE 01 • QUANTUM FOUNDATIONS
                      </span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-white/5 border border-white/12 text-zinc-200">
                      LANDAUER'S PRINCIPLE
                    </span>
                  </div>

                  <div className="my-1">
                    <h2 className="text-2xl md:text-[1.85rem] font-semibold text-white leading-tight tracking-tight">
                      Information is <span className="font-semibold underline decoration-zinc-600 underline-offset-8">Quantum State.</span>
                    </h2>
                    <p className="mt-2 text-[0.92rem] text-zinc-300 font-normal leading-relaxed">
                      Superposition is not an approximation — it is the fundamental information medium of the physical universe.
                    </p>
                  </div>

                  {/* Primary Quote: Rolf Landauer */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col gap-3">
                    <p className="text-[0.94rem] md:text-[0.98rem] text-zinc-100 font-normal italic leading-relaxed">
                      "Information is not a disembodied abstract entity; it is always tied to a physical representation. In a quantum mechanical universe, <strong className="text-white font-semibold not-italic">information is physical</strong>."
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Avatar className="size-9 border border-white/20">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Rolf Landauer" />
                        <AvatarFallback className="bg-zinc-800 text-white text-xs font-mono">RL</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-white">Rolf Landauer</div>
                        <div className="text-[11px] text-zinc-400">IBM Fellow • Formulator of Landauer's Principle of Information Physics (1927–1999)</div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Voice: Charles H. Bennett */}
                  <div className="flex items-center justify-between text-xs text-zinc-300 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Charles H. Bennett (IBM Fellow):</span>
                      <span className="italic text-zinc-400 hidden sm:inline">"Quantum states cannot be cloned, yet Hilbert space enables exponential parallel amplitude."</span>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">|ψ⟩ = α|0⟩ + β|1⟩</span>
                  </div>
                </CardTransformed>

                {/* ── CARD 2: Principle 02 ── */}
                <CardTransformed
                  arrayLength={4}
                  index={2}
                  incrementY={0}
                  incrementZ={25}
                  incrementRotation={-3}
                  variant="dark"
                  className="!bg-[#0c0c10]/98 !border-white/14 !p-7 md:!p-8 !items-stretch !justify-between shadow-2xl backdrop-blur-2xl !rounded-2xl cursor-pointer group select-none"
                  style={{
                    background: "linear-gradient(145deg, rgba(22, 22, 28, 0.98) 0%, rgba(10, 10, 14, 0.99) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 28px 70px rgba(0, 0, 0, 0.95), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onClick={() => handleScrollToPrinciple(2)}
                  title="Click to peel card to Principle 03"
                >
                  <div className="flex items-center justify-between w-full border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                      <span className="font-semibold text-xs tracking-widest text-zinc-300 uppercase">
                        PRINCIPLE 02 • COHERENCE & ERROR CORRECTION
                      </span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-white/5 border border-white/12 text-zinc-200">
                      FAULT-TOLERANT SUPREMACY
                    </span>
                  </div>

                  <div className="my-1">
                    <h2 className="text-2xl md:text-[1.85rem] font-semibold text-white leading-tight tracking-tight">
                      Noise Isn't Feared. <span className="font-semibold underline decoration-zinc-600 underline-offset-8">Coherence Is Progress.</span>
                    </h2>
                    <p className="mt-2 text-[0.92rem] text-zinc-300 font-normal leading-relaxed">
                      Decoherence is the price of quantum sensitivity; fault tolerance and stabilizer codes are our engineering bridge.
                    </p>
                  </div>

                  {/* Primary Quote: Richard Feynman */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col gap-3">
                    <p className="text-[0.94rem] md:text-[0.98rem] text-zinc-100 font-normal italic leading-relaxed">
                      "Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical, and by golly it's a wonderful problem, because it doesn't look so easy."
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Avatar className="size-9 border border-white/20">
                        <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Richard Feynman" />
                        <AvatarFallback className="bg-zinc-800 text-white text-xs font-mono">RF</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-white">Richard P. Feynman</div>
                        <div className="text-[11px] text-zinc-400">Nobel Laureate in Physics • Caltech (Proposed Quantum Computation, 1981)</div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Voice: John Preskill */}
                  <div className="flex items-center justify-between text-xs text-zinc-300 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">John Preskill (Caltech):</span>
                      <span className="italic text-zinc-400 hidden sm:inline">"We expect quantum computers will eventually outperform the best classical supercomputers."</span>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">T₁ / T₂ Coherence Threshold</span>
                  </div>
                </CardTransformed>

                {/* ── CARD 3: Principle 03 ── */}
                <CardTransformed
                  arrayLength={4}
                  index={3}
                  incrementY={0}
                  incrementZ={25}
                  incrementRotation={3}
                  variant="dark"
                  className="!bg-[#0c0c10]/98 !border-white/14 !p-7 md:!p-8 !items-stretch !justify-between shadow-2xl backdrop-blur-2xl !rounded-2xl cursor-pointer group select-none"
                  style={{
                    background: "linear-gradient(145deg, rgba(22, 22, 28, 0.98) 0%, rgba(10, 10, 14, 0.99) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 28px 70px rgba(0, 0, 0, 0.95), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onClick={() => handleScrollToPrinciple(3)}
                  title="Click to peel card to Principle 04"
                >
                  <div className="flex items-center justify-between w-full border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                      <span className="font-semibold text-xs tracking-widest text-zinc-300 uppercase">
                        PRINCIPLE 03 • ALGORITHMIC COMPLEXITY
                      </span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-white/5 border border-white/12 text-zinc-200">
                      EXPONENTIAL ADVANTAGE
                    </span>
                  </div>

                  <div className="my-1">
                    <h2 className="text-2xl md:text-[1.85rem] font-semibold text-white leading-tight tracking-tight">
                      Scale Unlocks <span className="font-semibold underline decoration-zinc-600 underline-offset-8">Algorithmic Advantage.</span>
                    </h2>
                    <p className="mt-2 text-[0.92rem] text-zinc-300 font-normal leading-relaxed">
                      Quantum speedup is achieved through destructive interference of incorrect states and constructive amplification of the true solution.
                    </p>
                  </div>

                  {/* Primary Quote: David Deutsch */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col gap-3">
                    <p className="text-[0.94rem] md:text-[0.98rem] text-zinc-100 font-normal italic leading-relaxed">
                      "Quantum computation is nothing less than a distinctly new way of harnessing nature... Quantum algorithms calculate solutions by constructive interference among parallel computational paths."
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Avatar className="size-9 border border-white/20">
                        <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="David Deutsch" />
                        <AvatarFallback className="bg-zinc-800 text-white text-xs font-mono">DD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-white">David Deutsch</div>
                        <div className="text-[11px] text-zinc-400">Pioneer of Quantum Computation • University of Oxford (Dirac Medalist)</div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Voice: Peter Shor */}
                  <div className="flex items-center justify-between text-xs text-zinc-300 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Peter W. Shor (M.I.T.):</span>
                      <span className="italic text-zinc-400 hidden sm:inline">"Can quantum mechanics calculate things exponentially faster? The answer is provably yes."</span>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">O(poly n) vs O(eⁿ)</span>
                  </div>
                </CardTransformed>

                {/* ── CARD 4: Principle 04 ── */}
                <CardTransformed
                  arrayLength={4}
                  index={4}
                  incrementY={0}
                  incrementZ={25}
                  incrementRotation={-2}
                  variant="dark"
                  className="!bg-[#0c0c10]/98 !border-white/14 !p-7 md:!p-8 !items-stretch !justify-between shadow-2xl backdrop-blur-2xl !rounded-2xl cursor-pointer group select-none"
                  style={{
                    background: "linear-gradient(145deg, rgba(22, 22, 28, 0.98) 0%, rgba(10, 10, 14, 0.99) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 28px 70px rgba(0, 0, 0, 0.95), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onClick={() => handleScrollToPrinciple(0)}
                  title="Click to reset stack to Principle 01"
                >
                  <div className="flex items-center justify-between w-full border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                      <span className="font-semibold text-xs tracking-widest text-zinc-300 uppercase">
                        PRINCIPLE 04 • GLOBAL DISCOVERY
                      </span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-white/5 border border-white/12 text-zinc-200">
                      OPEN QUANTUM SCIENCE
                    </span>
                  </div>

                  <div className="my-1">
                    <h2 className="text-2xl md:text-[1.85rem] font-semibold text-white leading-tight tracking-tight">
                      Quantum Discovery <span className="font-semibold underline decoration-zinc-600 underline-offset-8">Is Global.</span>
                    </h2>
                    <div className="mt-2 text-[0.92rem] text-zinc-100 font-normal transition-opacity duration-300">
                      "{multilingualHeadlines[activeLangIdx].text}"
                    </div>
                    <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">
                      GLOBAL TRANSITION • {multilingualHeadlines[activeLangIdx].lang}
                    </div>
                  </div>

                  {/* Primary Quote: Lov Grover */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col gap-3">
                    <p className="text-[0.94rem] md:text-[0.98rem] text-zinc-100 font-normal italic leading-relaxed">
                      "By designing algorithms that amplify the probability amplitude of target states, we rotate the statevector directly toward the solution in O(√N) queries — provable quadratic speedup over any classical search."
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Avatar className="size-9 border border-white/20">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" alt="Lov Grover" />
                        <AvatarFallback className="bg-zinc-800 text-white text-xs font-mono">LG</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-white">Lov K. Grover</div>
                        <div className="text-[11px] text-zinc-400">Bell Laboratories • Inventor of Grover's Quantum Search Algorithm</div>
                      </div>
                    </div>
                  </div>

                  {/* Live Platform Telemetry */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-semibold text-white">16 Qubits</span>
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">Simulated Real-Time</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-semibold text-white">7,323 Chunks</span>
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">RAG Textbooks Indexed</span>
                    </div>
                  </div>
                </CardTransformed>

              </CardsContainer>

              {/* Interactive Card Progression & Manual Controls */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "940px",
                marginTop: "12px",
                padding: "8px 14px",
                background: "rgba(14, 14, 18, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                fontFamily: "'Poppins', sans-serif",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {[
                    { idx: 0, label: "01 Landauer" },
                    { idx: 1, label: "02 Feynman" },
                    { idx: 2, label: "03 Deutsch" },
                    { idx: 3, label: "04 Grover" },
                  ].map((tab) => (
                    <button
                      key={tab.idx}
                      onClick={() => handleScrollToPrinciple(tab.idx)}
                      style={{
                        padding: "5px 14px",
                        fontSize: "0.76rem",
                        fontFamily: "'Poppins', sans-serif",
                        borderRadius: "9999px",
                        border: "1px solid",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: activeBelief === tab.idx ? "#ffffff" : "rgba(255, 255, 255, 0.04)",
                        color: activeBelief === tab.idx ? "#000000" : "#a1a1aa",
                        borderColor: activeBelief === tab.idx ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
                        fontWeight: activeBelief === tab.idx ? 600 : 400,
                        boxShadow: activeBelief === tab.idx ? "0 0 12px rgba(255, 255, 255, 0.35)" : "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => handleScrollToPrinciple(Math.max(0, activeBelief - 1))}
                    disabled={activeBelief === 0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "5px 12px",
                      fontSize: "0.76rem",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: activeBelief === 0 ? "#52525b" : "#ffffff",
                      cursor: activeBelief === 0 ? "not-allowed" : "pointer",
                      opacity: activeBelief === 0 ? 0.35 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <ChevronLeft size={13} /> PREV
                  </button>
                  <button
                    onClick={() => handleScrollToPrinciple(Math.min(3, activeBelief + 1))}
                    disabled={activeBelief === 3}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "5px 12px",
                      fontSize: "0.76rem",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: activeBelief === 3 ? "#52525b" : "#ffffff",
                      cursor: activeBelief === 3 ? "not-allowed" : "pointer",
                      opacity: activeBelief === 3 ? 0.35 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    NEXT <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
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
            onClick={() => {
              if (typeof onNavigate === 'function') onNavigate(carouselSlides[activeSlide].id);
              else if (typeof onOpenAuth === 'function') onOpenAuth();
            }}
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
          onClick={() => {
            if (typeof onNavigate === 'function') onNavigate("studio");
            else if (typeof onOpenAuth === 'function') onOpenAuth();
          }}
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
