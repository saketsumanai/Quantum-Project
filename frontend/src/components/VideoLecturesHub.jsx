import React, { useState, useMemo, useEffect } from "react";
import {
  Play,
  Search,
  Globe,
  BookOpen,
  Award,
  Sparkles,
  ExternalLink,
  Clock,
  Filter,
  CheckCircle2,
  Video,
  PlusCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Mic,
  Radio,
  Sliders,
  Pause,
  RotateCcw,
  ShieldCheck,
  Languages,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { INDIAN_LANGUAGES, VIDEO_TOPICS, VIDEO_LECTURES } from "../data/videoLecturesData";
import { API_BASE, BACKEND_URL } from "../config/api";

export default function VideoLecturesHub({ onSwitchToChat, onSwitchToAssessment }) {
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState(VIDEO_LECTURES[0]);
  const [customUrl, setCustomUrl] = useState("");
  const [customError, setCustomError] = useState("");

  // ── Multilingual Audio Dubber State ──────────────────────────────────────────
  const [dubLanguage, setDubLanguage] = useState("hi");
  const [dubData, setDubData] = useState(null);
  const [isGeneratingDub, setIsGeneratingDub] = useState(false);
  const [isPlayingDub, setIsPlayingDub] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);
  const [dubRate, setDubRate] = useState(1.0);
  const [dubVolume, setDubVolume] = useState(1.0);
  const [showFullScript, setShowFullScript] = useState(false);
  const activeAudioRef = React.useRef(null);

  // ── Lecture Notes State ──────────────────────────────────────────────────────
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("ql_notes_" + VIDEO_LECTURES[0]?.id) || "");
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  useEffect(() => {
    if (activeVideo?.id) {
      setNotes(localStorage.getItem("ql_notes_" + activeVideo.id) || "");
    }
  }, [activeVideo?.id]);

  const handleNotesChange = (val) => {
    setNotes(val);
    if (activeVideo?.id) {
      localStorage.setItem("ql_notes_" + activeVideo.id, val);
    }
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 1500);
  };

  const handleInsertTimestamp = () => {
    const timestampTag = `\n[${activeVideo?.duration ? "Note @ " + activeVideo.duration : "Timestamp"}] `;
    handleNotesChange((notes || "") + timestampTag);
  };

  const handleCopyNotes = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadNotes = () => {
    if (!notes) return;
    const blob = new Blob([
      `Lecture: ${activeVideo.title}\nInstructor: ${activeVideo.instructor}\nTopic: ${activeVideo.topicLabel || activeVideo.topic}\nDate: ${new Date().toLocaleDateString()}\n\n--- NOTES ---\n${notes}`
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuantumLeap_Notes_${activeVideo.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stop any active speech on unmount or video change
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // ── Quantum-Aware Open-Source Dubber State ──────────────────────────────────
  const [quantumDubState, setQuantumDubState] = useState({
    isDubbing: false,
    progress: 0,
    step: "idle",
    message: "",
    watchUrl: null,
    audioUrl: null,
    preservedTerms: [],
    playerMode: "youtube", // "youtube" | "dubbed"
  });

  // Check if active video has pre-rendered dubbed MP4 on backend
  useEffect(() => {
    let isMounted = true;
    const checkPreRendered = async () => {
      try {
        const res = await fetch(`${API_BASE}/dubbing/status/${activeVideo.youtubeId}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.status === "completed" && data.watch_url) {
            setQuantumDubState({
              isDubbing: false,
              progress: 100,
              step: "completed",
              message: "Dubbed in Hindi (Quantum Glossary preserved)",
              watchUrl: `${BACKEND_URL}${data.watch_url}`,
              audioUrl: `${BACKEND_URL}${data.audio_url}`,
              preservedTerms: data.glossary_terms_preserved || ["qubit", "superposition", "entanglement"],
              playerMode: "youtube",
            });
          }
        }
      } catch (_) {}
    };
    checkPreRendered();
    return () => { isMounted = false; };
  }, [activeVideo.youtubeId]);

  const initiateQuantumDubbing = async (url) => {
    const videoId = extractYouTubeId(url) || activeVideo.youtubeId;
    setQuantumDubState(prev => ({
      ...prev,
      isDubbing: true,
      progress: 10,
      step: "initializing",
      message: "Starting Quantum-Aware Dubbing Pipeline...",
      preservedTerms: [],
    }));

    try {
      const res = await fetch(`${API_BASE}/dubbing/dub-quantum-lecture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_url: url || `https://www.youtube.com/watch?v=${videoId}`,
          target_language: dubLanguage || "hi",
          voice: undefined,
        }),
      });
      const data = await res.json();
      if (data.status === "completed") {
        setQuantumDubState({
          isDubbing: false,
          progress: 100,
          step: "completed",
          message: "Dubbed lecture ready for playback!",
          watchUrl: `${BACKEND_URL}${data.watch_url}`,
          audioUrl: `${BACKEND_URL}${data.audio_url}`,
          preservedTerms: data.glossary_terms_preserved || ["Qubit", "Superposition", "Entanglement"],
          playerMode: "dubbed",
        });
        return;
      }
      pollQuantumDubbingStatus(videoId);
    } catch (err) {
      console.error("Dubbing error:", err);
      setQuantumDubState(prev => ({ ...prev, isDubbing: false, message: "Dubbing failed to start." }));
    }
  };

  const pollQuantumDubbingStatus = (videoId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/dubbing/status/${videoId}`);
        if (!res.ok) return;
        const data = await res.json();
        setQuantumDubState(prev => ({
          ...prev,
          progress: data.progress || prev.progress,
          step: data.step || prev.step,
          message: data.message || prev.message,
          preservedTerms: data.glossary_terms_preserved || prev.preservedTerms,
          watchUrl: data.watch_url ? `${BACKEND_URL}${data.watch_url}` : prev.watchUrl,
          audioUrl: data.audio_url ? `${BACKEND_URL}${data.audio_url}` : prev.audioUrl,
        }));

        if (data.status === "completed") {
          clearInterval(interval);
          setQuantumDubState(prev => ({
            ...prev,
            isDubbing: false,
            progress: 100,
            step: "completed",
            playerMode: "dubbed",
          }));
        } else if (data.status === "failed") {
          clearInterval(interval);
          setQuantumDubState(prev => ({ ...prev, isDubbing: false }));
        }
      } catch (e) {
        console.warn("Poll error:", e);
      }
    }, 1200);
  };

  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingDub(false);
    setActiveSegmentIndex(null);
    setDubData(null);
  }, [activeVideo.youtubeId, activeVideo.id]);

  // Extract YouTube ID from any format (embed, watch, youtu.be, shorts)
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const clean = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = clean.match(regExp);
    return match ? match[1] : null;
  };

  const handleAddCustomVideo = (e) => {
    e.preventDefault();
    setCustomError("");
    const id = extractYouTubeId(customUrl);
    if (!id) {
      setCustomError("Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or 11-char ID)");
      return;
    }
    const newVideo = {
      id: `custom-${Date.now()}`,
      title: "Custom YouTube Quantum Lecture",
      englishTitle: "Custom Loaded Quantum Video",
      language: selectedLanguage !== "all" ? selectedLanguage : "hi",
      languageLabel: "Custom Selected",
      instructor: "YouTube Instructor",
      organization: "Web Lecture",
      duration: "Full Lecture",
      topic: selectedTopic !== "all" ? selectedTopic : "foundations",
      topicLabel: "Quantum Computing",
      level: "All Levels",
      youtubeId: id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      description: "Custom quantum computing lecture loaded directly from YouTube for multilingual study.",
      keyTakeaways: [
        "Analyzed with Quantum Leap Multilingual AI",
        "Use AI Tutor to ask questions in any Indian language",
        "Generate a diagnostic test directly on this topic",
      ],
    };
    setActiveVideo(newVideo);
    setCustomUrl("");
  };

  // Filter video list
  const filteredLectures = useMemo(() => {
    return VIDEO_LECTURES.filter((video) => {
      const matchLang = selectedLanguage === "all" || video.language === selectedLanguage;
      const matchTopic = selectedTopic === "all" || video.topic === selectedTopic;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        video.title.toLowerCase().includes(q) ||
        video.englishTitle.toLowerCase().includes(q) ||
        video.description.toLowerCase().includes(q) ||
        video.instructor.toLowerCase().includes(q) ||
        video.organization.toLowerCase().includes(q);
      return matchLang && matchTopic && matchSearch;
    });
  }, [selectedLanguage, selectedTopic, searchQuery]);

  // Count videos per language
  const countByLang = useMemo(() => {
    const map = { all: VIDEO_LECTURES.length };
    VIDEO_LECTURES.forEach((v) => {
      map[v.language] = (map[v.language] || 0) + 1;
    });
    return map;
  }, []);

  const handleOpenAITutorForLecture = (video) => {
    const target = video || activeVideo;
    const cleanLang = (target.languageLabel || "").replace(/[^a-zA-Z\s]/g, "").trim() || "English";
    window.dispatchEvent(
      new CustomEvent("ask-ai-tutor", {
        detail: {
          prompt: `I am studying "${target.englishTitle || target.title}" by ${target.instructor} (${target.organization}). Can you explain the core concepts and answer questions based on this lecture in ${cleanLang}?`,
          videoContext: {
            id: target.id,
            title: target.title,
            englishTitle: target.englishTitle,
            instructor: target.instructor,
            organization: target.organization,
            topic: target.topic,
            topicLabel: target.topicLabel,
            description: target.description,
            keyTakeaways: target.keyTakeaways || [],
            language: target.language,
          },
        },
      })
    );
  };

  // ─── Audio Dubbing Engine Handlers ──────────────────────────────────────────
  const handleGenerateDub = async () => {
    setIsGeneratingDub(true);
    try {
      const res = await fetch(`${API_BASE}/ai-tutor/dub-lecture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: activeVideo.youtubeId || activeVideo.id,
          title: activeVideo.title,
          topic: activeVideo.topic || "quantum_computing",
          description: activeVideo.description || activeVideo.title,
          target_language: dubLanguage,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate dub script");
      const data = await res.json();
      setDubData(data);
    } catch (err) {
      console.error("[Dubber Error]:", err);
    } finally {
      setIsGeneratingDub(false);
    }
  };

  const speakText = async (text, segIndex = null) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlayingDub(true);
    setActiveSegmentIndex(segIndex);

    // Try Sarvam AI neural voice via backend proxy first
    try {
      const res = await fetch(`${API_BASE}/ai-tutor/tts-sarvam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 350),
          target_language: dubLanguage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audio_base64) {
          const audio = new Audio("data:audio/wav;base64," + data.audio_base64);
          activeAudioRef.current = audio;
          audio.playbackRate = dubRate;
          audio.volume = dubVolume;
          audio.onended = () => {
            setIsPlayingDub(false);
            setActiveSegmentIndex(null);
            activeAudioRef.current = null;
          };
          audio.onerror = () => {
            playBrowserSpeech(text, segIndex);
          };
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("[Sarvam AI TTS] Notice, using local voice:", err);
    }

    // Fallback to local hardware speech synthesis
    playBrowserSpeech(text, segIndex);
  };

  const playBrowserSpeech = (text, segIndex) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setIsPlayingDub(false);
      setActiveSegmentIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langLocaleMap = {
      hi: "hi-IN",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      pa: "pa-IN",
      en: "en-IN",
    };
    const targetLocale = langLocaleMap[dubLanguage] || "hi-IN";
    utterance.lang = targetLocale;
    utterance.rate = dubRate;
    utterance.volume = dubVolume;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.startsWith(dubLanguage)
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => {
      setIsPlayingDub(true);
      setActiveSegmentIndex(segIndex);
    };
    utterance.onend = () => {
      setIsPlayingDub(false);
      setActiveSegmentIndex(null);
    };
    utterance.onerror = () => {
      setIsPlayingDub(false);
      setActiveSegmentIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayFullDub = () => {
    if (!dubData || !dubData.full_dub_script) return;
    speakText(dubData.full_dub_script, -1);
  };

  const handleStopDub = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingDub(false);
    setActiveSegmentIndex(null);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      {/* ── Header Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(15,98,254,0.12) 0%, rgba(138,63,252,0.10) 100%)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
        padding: "24px 28px",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
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
              color: "#38bdf8",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              <Sparkles size={12} />
              <span>MULTILINGUAL ACADEMY • 10+ INDIAN LANGUAGES</span>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              IIT NPTEL &amp; IBM QUANTUM
            </span>
          </div>
          <h1 style={{ margin: "6px 0 8px 0", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.035em" }}>
            Quantum Video Lectures in Indian Languages
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: "780px", lineHeight: 1.6 }}>
            Master quantum algorithms, qubits, circuits, and entanglement in your mother tongue — Hindi (हिंदी), Hinglish, Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Marathi, Kannada, Malayalam, Gujarati, and NPTEL IIT Premier lectures.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleOpenAITutorForLecture(activeVideo)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#0f62fe",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(15,98,254,0.3)",
              transition: "transform 0.1s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Sparkles size={14} />
            Ask AI Tutor on Lecture
          </button>

          <button
            onClick={() => setIsNotesOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: isNotesOpen ? "rgba(245, 166, 35, 0.15)" : "var(--bg-surface)",
              color: isNotesOpen ? "#f5a623" : "var(--text-primary)",
              border: "1px solid " + (isNotesOpen ? "rgba(245, 166, 35, 0.5)" : "var(--border-subtle)"),
              padding: "10px 18px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <FileText size={14} color={isNotesOpen ? "#f5a623" : "#d4d4d8"} />
            {isNotesOpen ? "Hide Notes" : "Take Notes"}
          </button>

          {onSwitchToAssessment && (
            <button
              onClick={() => onSwitchToAssessment(activeVideo.topic)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                padding: "10px 18px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              <Award size={14} color="#10b981" />
              Test on this Topic
            </button>
          )}
        </div>
      </div>

      {/* ── Active Video Theatre ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 380px",
        gap: "24px",
        marginBottom: "32px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
        overflow: "hidden",
      }}>
        {/* Left: Responsive Player & Quantum Dubber Controls */}
        <div style={{ display: "flex", flexDirection: "column", background: "#000" }}>
          {/* Audio/Video Source Toggle Bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            background: "#0b101f",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setQuantumDubState(p => ({ ...p, playerMode: "youtube" }))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "5px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: quantumDubState.playerMode === "youtube" ? "rgba(255,255,255,0.12)" : "transparent",
                  color: quantumDubState.playerMode === "youtube" ? "#fff" : "#94a3b8",
                  border: "1px solid " + (quantumDubState.playerMode === "youtube" ? "rgba(255,255,255,0.2)" : "transparent"),
                  cursor: "pointer",
                }}
              >
                <Video size={13} />
                <span>Original Lecture</span>
              </button>
              <button
                onClick={() => {
                  if (quantumDubState.watchUrl) {
                    setQuantumDubState(p => ({ ...p, playerMode: "dubbed" }));
                  } else {
                    initiateQuantumDubbing(activeVideo.youtubeUrl || `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 12px",
                  borderRadius: "5px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: quantumDubState.playerMode === "dubbed" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.12)",
                  color: quantumDubState.playerMode === "dubbed" ? "#60a5fa" : "#34d399",
                  border: "1px solid " + (quantumDubState.playerMode === "dubbed" ? "#3b82f6" : "rgba(16, 185, 129, 0.3)"),
                  cursor: "pointer",
                }}
              >
                <Sparkles size={12} />
                <span>{quantumDubState.watchUrl ? "Hindi Dubbed (Quantum-Aware)" : "Neural Dub into Hindi"}</span>
              </button>
            </div>

            {quantumDubState.watchUrl && (
              <span style={{ fontSize: "0.70rem", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> Glossary Intact
              </span>
            )}
          </div>

          {/* Player Container */}
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
            {quantumDubState.playerMode === "dubbed" && quantumDubState.watchUrl ? (
              <video
                controls
                autoPlay
                src={quantumDubState.watchUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "#000",
                }}
              />
            ) : (
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            )}
          </div>

          {/* Live Dubbing Progress Bar & Glossary Tags */}
          {(quantumDubState.isDubbing || (quantumDubState.preservedTerms && quantumDubState.preservedTerms.length > 0)) && (
            <div style={{
              padding: "12px 18px",
              background: "#0c1326",
              borderTop: "1px solid rgba(59, 130, 246, 0.2)",
            }}>
              {quantumDubState.isDubbing && (
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#60a5fa" }}>
                      {quantumDubState.message}
                    </span>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#93c5fd", fontFamily: "'JetBrains Mono', monospace" }}>
                      {quantumDubState.progress}%
                    </span>
                  </div>
                  {/* Progress track */}
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      width: `${quantumDubState.progress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #38bdf8)",
                      borderRadius: "3px",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              )}

              {/* Preserved Quantum Terms Badges */}
              {quantumDubState.preservedTerms && quantumDubState.preservedTerms.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Preserved Technical Terms (Quantum Glossary):
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {quantumDubState.preservedTerms.map((term, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "0.68rem",
                          background: "rgba(59, 130, 246, 0.12)",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                          color: "#93c5fd",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: 500,
                        }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Under Player Bar */}
          <div style={{
            padding: "16px 20px",
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  background: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "4px"
                }}>
                  {activeVideo.languageLabel}
                </span>
                <span style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text-muted)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: "4px"
                }}>
                  {activeVideo.level}
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> {activeVideo.duration}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {activeVideo.title}
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsNotesOpen((prev) => !prev)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.80rem",
                  background: isNotesOpen ? "rgba(245, 166, 35, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid " + (isNotesOpen ? "rgba(245, 166, 35, 0.5)" : "var(--border-subtle)"),
                  borderRadius: "4px",
                  padding: "6px 12px",
                  color: isNotesOpen ? "#f5a623" : "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                <FileText size={13} color={isNotesOpen ? "#f5a623" : "#d4d4d8"} />
                <span>{isNotesOpen ? "Hide Notes" : "Take Notes"}</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  color: "#78a9ff",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Watch on YouTube <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* ── Interactive Lecture Notes Drawer ── */}
          {isNotesOpen && (
            <div style={{
              padding: "16px 20px",
              background: "#08080c",
              borderTop: "1px solid rgba(245, 166, 35, 0.25)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={15} color="#f5a623" />
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#ffffff" }}>
                    Student Notebook
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>
                    — Notes auto-save in your browser
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {notesSavedNotice && (
                    <span style={{ fontSize: "0.72rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Check size={12} /> Auto-Saved
                    </span>
                  )}
                  <button
                    onClick={handleInsertTimestamp}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#18181b",
                      border: "1px solid #27272a",
                      color: "#e4e4e7",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                    title="Insert lecture duration tag"
                  >
                    <Clock size={12} />
                    <span>Insert Time</span>
                  </button>
                  <button
                    onClick={handleCopyNotes}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#18181b",
                      border: "1px solid #27272a",
                      color: "#e4e4e7",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    {copiedNotes ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedNotes ? "Copied" : "Copy Notes"}</span>
                  </button>
                  <button
                    onClick={handleDownloadNotes}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#18181b",
                      border: "1px solid #27272a",
                      color: "#e4e4e7",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    <Download size={12} />
                    <span>Export (.txt)</span>
                  </button>
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Type your lecture notes, equations, questions, or formulas here... They are automatically saved and persistent for this video."
                rows={5}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#030304",
                  border: "1px solid #27272a",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* ── Multilingual Neural Audio Dubber & Live Voiceover Engine ── */}
          <div style={{
            padding: "16px 20px",
            background: "linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}>
            {/* Dubber Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  padding: "6px",
                  borderRadius: "6px",
                  background: isPlayingDub ? "rgba(34, 197, 94, 0.2)" : "rgba(99, 102, 241, 0.2)",
                  color: isPlayingDub ? "#4ade80" : "#a5b4fc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Mic size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>AI Neural Audio Dubber & Live Voiceover</span>
                    {isPlayingDub && (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.68rem",
                        color: "#4ade80",
                        background: "rgba(34, 197, 94, 0.15)",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        fontWeight: 600,
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 1.5s infinite" }} />
                        Speaking
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                    Hardware-accelerated multilingual neural speech synthesis
                  </div>
                </div>
              </div>
            </div>

            {/* Language Selection & Action Controls */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.76rem", color: "#9ca3af", fontWeight: 500 }}>
                  Dub Language:
                </span>
                <select
                  value={dubLanguage}
                  onChange={(e) => setDubLanguage(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    background: "#1f2937",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                  <option value="en">English (Academic)</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateDub}
                  disabled={isGeneratingDub}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: isGeneratingDub ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={13} />
                  <span>{isGeneratingDub ? "Generating Neural Dub..." : "Generate AI Audio Dub"}</span>
                </button>
              </div>

              {/* Speed & Volume Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Speed:</span>
                <select
                  value={dubRate}
                  onChange={(e) => setDubRate(parseFloat(e.target.value))}
                  style={{
                    padding: "4px 6px",
                    borderRadius: "4px",
                    background: "#1f2937",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="0.8">0.8x</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="1.2">1.2x</option>
                  <option value="1.4">1.4x</option>
                </select>
              </div>
            </div>

            {/* Dub Controls Bar if generated */}
            {dubData && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "6px",
                padding: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={isPlayingDub ? handleStopDub : handlePlayFullDub}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "4px",
                        background: isPlayingDub ? "#dc2626" : "#16a34a",
                        border: "none",
                        color: "#ffffff",
                        fontSize: "0.80rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isPlayingDub ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                      <span>{isPlayingDub ? "Pause Voiceover" : `Play Full Dub in ${dubData.language_label.split(" ")[0]}`}</span>
                    </button>

                    {isPlayingDub && (
                      <button
                        type="button"
                        onClick={handleStopDub}
                        style={{
                          padding: "7px 10px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#cbd5e1",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <RotateCcw size={13} />
                        <span>Stop</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFullScript(!showFullScript)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#a5b4fc",
                      fontSize: "0.74rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {showFullScript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <span>{showFullScript ? "Hide Spoken Script" : "View Full Spoken Script"}</span>
                  </button>
                </div>

                {/* Spoken Text Script Drawer */}
                {showFullScript && (
                  <div style={{
                    padding: "10px 12px",
                    borderRadius: "4px",
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#e2e8f0",
                    fontSize: "0.80rem",
                    lineHeight: 1.6,
                    maxHeight: "140px",
                    overflowY: "auto",
                  }}>
                    {dubData.full_dub_script}
                  </div>
                )}

                {/* Timeline Segments with 1-Click Voiceover */}
                {dubData.segments && dubData.segments.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "0.70rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                      Synchronized Chapters · Click to Voiceover:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "6px" }}>
                      {dubData.segments.map((seg, idx) => {
                        const isThisPlaying = isPlayingDub && activeSegmentIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => speakText(seg.spoken_text, idx)}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "4px",
                              background: isThisPlaying ? "rgba(34, 197, 94, 0.18)" : "rgba(255, 255, 255, 0.04)",
                              border: isThisPlaying ? "1px solid rgba(34, 197, 94, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: isThisPlaying ? "#4ade80" : "#818cf8" }}>
                                {seg.timestamp}
                              </span>
                              <span style={{ fontSize: "0.68rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: "3px" }}>
                                {isThisPlaying ? <Volume2 size={12} color="#4ade80" /> : <Play size={10} fill="currentColor" />}
                                {isThisPlaying ? "Playing" : "Play"}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#ffffff", marginBottom: "2px" }}>
                              {seg.section_title}
                            </div>
                            <div style={{
                              fontSize: "0.72rem",
                              color: "#cbd5e1",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              lineHeight: 1.35,
                            }}>
                              {seg.spoken_text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Lecture Metadata & Multilingual AI Companion */}
        <div style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          borderLeft: "1px solid var(--border-subtle)",
          overflowY: "auto",
          maxHeight: "560px",
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "4px" }}>
              Instructor & Organization
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {activeVideo.instructor}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {activeVideo.organization}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "6px" }}>
              Lecture Overview
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {activeVideo.description}
            </p>
          </div>

          {activeVideo.keyTakeaways && activeVideo.keyTakeaways.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Key Concepts Covered
                </div>
                <button
                  type="button"
                  onClick={() => speakText(activeVideo.keyTakeaways.join(". "))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    color: "#78a9ff",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  title="Read Key Concepts Aloud"
                >
                  <Volume2 size={12} />
                  <span>Read Aloud</span>
                </button>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {activeVideo.keyTakeaways.map((item, i) => (
                  <li key={i} style={{ marginBottom: "3px" }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Multilingual AI Companion box */}
          <div style={{
            marginTop: "auto",
            padding: "14px",
            background: "linear-gradient(135deg, rgba(15,98,254,0.08) 0%, rgba(16,185,129,0.06) 100%)",
            border: "1px solid rgba(15,98,254,0.2)",
            borderRadius: "6px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#78a9ff", marginBottom: "6px" }}>
              <Sparkles size={14} /> AI Lecture Assistant
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: 1.4 }}>
              Have doubts about this lecture? Click below to chat with our 120B Quantum AI Tutor.
            </div>
            <button
              onClick={() => handleOpenAITutorForLecture(activeVideo)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "#0f62fe",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <HelpCircle size={14} /> Ask Doubts on Lecture
            </button>
          </div>
        </div>
      </div>

      {/* ── Custom YouTube Lecture Input ── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <PlusCircle size={20} color="#78a9ff" />
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Watch & Study Any YouTube Quantum Lecture
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Paste any YouTube video link from NPTEL, Qiskit India, or your regional educator to play it with multilingual AI notes
            </div>
          </div>
        </div>

        <form onSubmit={handleAddCustomVideo} style={{ display: "flex", gap: "8px", flex: "1", maxWidth: "540px" }}>
          <input
            type="text"
            placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 14px",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              fontSize: "0.82rem",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Load Video
          </button>
        </form>
        {customError && <div style={{ width: "100%", color: "#f87171", fontSize: "0.76rem" }}>{customError}</div>}
      </div>

      {/* ── Filters & Search ── */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Language Tabs */}
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Globe size={13} /> Select Indian Language
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {INDIAN_LANGUAGES.map((lang) => {
              const count = countByLang[lang.code] || 0;
              if (lang.code !== "all" && count === 0) return null;
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isSelected ? "#0f62fe" : "var(--border-subtle)",
                    background: isSelected ? "rgba(15,98,254,0.15)" : "var(--bg-surface)",
                    color: isSelected ? "#78a9ff" : "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{lang.native}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Filters + Search Box */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {VIDEO_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "4px",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--text-primary)" : "transparent",
                    background: isSelected ? "var(--bg-surface-elevated)" : "transparent",
                    color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search lectures, topics, IITs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                fontSize: "0.8rem",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Lectures Grid ── */}
      {filteredLectures.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
          <Video size={36} style={{ opacity: 0.3, marginBottom: "8px" }} />
          <div>No video lectures found matching the selected language and topic filters.</div>
          <button
            onClick={() => { setSelectedLanguage("all"); setSelectedTopic("all"); setSearchQuery(""); }}
            style={{
              marginTop: "12px",
              padding: "6px 14px",
              background: "none",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              color: "#78a9ff",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {filteredLectures.map((video) => {
            const isPlaying = activeVideo.id === video.id;
            return (
              <div
                key={video.id}
                onClick={() => {
                  setActiveVideo(video);
                  window.scrollTo({ top: 140, behavior: "smooth" });
                }}
                style={{
                  background: isPlaying ? "rgba(15,98,254,0.08)" : "var(--bg-surface)",
                  border: isPlaying ? "2px solid #0f62fe" : "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isPlaying) e.currentTarget.style.borderColor = "var(--text-muted)";
                }}
                onMouseLeave={(e) => {
                  if (!isPlaying) e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", width: "100%", height: "170px", background: "#111" }}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}>
                    {video.duration}
                  </div>
                  <div style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "rgba(15,98,254,0.9)",
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "3px",
                  }}>
                    {video.languageLabel}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    {video.organization} · {video.level}
                  </div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {video.title}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.4, flex: 1 }}>
                    {video.description.slice(0, 110)}...
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {video.instructor}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#78a9ff", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                      {isPlaying ? "Playing Now" : "Watch Lecture"} <Play size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
