"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Activity, Layers, Sparkles } from "lucide-react";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export interface FlipCardProps {
    src: string;
    index: number;
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
    metricLabel?: string;
    metricValue?: string;
}

// --- FlipCard Component ---
const IMG_WIDTH = 70;
const IMG_HEIGHT = 100;

function FlipCard({
    src,
    index,
    total,
    phase,
    target,
    metricLabel = "Quantum RAG",
    metricValue = "98.5%",
}: FlipCardProps) {
    return (
        <motion.div
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity ?? 1,
            }}
            transition={{
                type: "spring",
                stiffness: 45,
                damping: 18,
            }}
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -IMG_HEIGHT / 2,
                marginLeft: -IMG_WIDTH / 2,
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group select-none"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.5, type: "spring", stiffness: 240, damping: 20 }}
                whileHover={{ rotateY: 180, scale: 1.15 }}
            >
                {/* Front Face: High-contrast Dark Monochrome with Unsplash Texture */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-xl flex flex-col justify-between p-2"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`quantum-${index}`}
                        className="absolute inset-0 h-full w-full object-cover opacity-35 filter grayscale contrast-125"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                    {/* Card Header */}
                    <div className="relative z-10 w-full flex justify-between items-center text-[7px] font-mono text-zinc-400 font-bold uppercase">
                        <span>#{index + 1}</span>
                        <span className="text-zinc-200">QPU</span>
                    </div>

                    {/* Card Value */}
                    <div className="relative z-10 text-center my-auto">
                        <div className="text-[13px] font-black text-white font-mono tracking-tight leading-none">
                            {metricValue}
                        </div>
                        <div className="text-[7.5px] font-medium text-zinc-300 mt-1 leading-tight line-clamp-1">
                            {metricLabel}
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="relative z-10 text-[6.5px] font-mono text-zinc-400 bg-zinc-900/90 px-1 py-0.5 rounded border border-zinc-800 w-full text-center">
                        Flip 3D
                    </div>
                </div>

                {/* Back Face: Monochrome Grey Details */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-2xl bg-zinc-900 flex flex-col items-center justify-center p-2.5 border border-zinc-600 text-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Telemetry</p>
                    <p className="text-[11px] font-black text-white font-mono leading-none">{metricValue}</p>
                    <p className="text-[7px] text-zinc-300 mt-1.5 leading-snug line-clamp-2">{metricLabel}</p>
                    <div className="mt-2 text-[6px] text-zinc-200 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-700">
                        Verified Proof
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 2400; // Virtual scroll range

// 20 Verified, Highly Available Unsplash Stock Images
const IMAGES = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80",
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80",
    "https://images.unsplash.com/photo-1516116211227-bbc13c7a6367?w=400&q=80",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=400&q=80",
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
];

const METRIC_PRESETS = [
    { label: "Domain Accuracy", value: "98.5%" },
    { label: "Hallucination Rate", value: "0.3%" },
    { label: "Textbook Grounded", value: "89.6%" },
    { label: "Vector Latency", value: "35ms" },
    { label: "Groq Inference", value: "450ms" },
    { label: "Statevector Engine", value: "16 Qubits" },
    { label: "Verified Library", value: "76 Books" },
    { label: "Qiskit Standard", value: "1.0+ Native" },
    { label: "N-Gram BLEU", value: "0.81" },
    { label: "Sequence Recall", value: "89.6%" },
    { label: "Universal Gates", value: "13 Gates" },
    { label: "LaTeX Parser", value: "100% KaTeX" },
    { label: "Offline Failover", value: "100% Resilient" },
    { label: "Bloch Sphere", value: "3D Sphere" },
    { label: "Curriculum Units", value: "24 Lessons" },
    { label: "Zero Glass", value: "100% Solid" },
    { label: "Precision @ 3", value: "91.2%" },
    { label: "Quantum Circuits", value: "12,400+" },
    { label: "Hamiltonian Sim", value: "Trotterized" },
    { label: "Eastin-Knill", value: "Universal" },
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function ScrollMorphHero({
    title = "Why Quantum Leap?",
    subtitle = "Standard Vanilla LLMs hallucinate quantum equations. Scroll to morph the 3D telemetry circle into a panoramic arch.",
}: {
    title?: string;
    subtitle?: string;
}) {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    // Pre-seed containerSize so calculations never yield NaN or 0 on first paint
    const [containerSize, setContainerSize] = useState({ width: 1200, height: 680 });
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Container Size via ResizeObserver ---
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    setContainerSize({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height,
                    });
                }
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        if (containerRef.current.offsetWidth > 0 && containerRef.current.offsetHeight > 0) {
            setContainerSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }

        return () => observer.disconnect();
    }, []);

    // --- Virtual Scroll Logic ---
    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Only clamp scroll within virtual range; avoid trapping overall page scroll once at boundaries
            const targetScroll = scrollRef.current + e.deltaY;
            if (targetScroll >= 0 && targetScroll <= MAX_SCROLL) {
                e.preventDefault();
                scrollRef.current = targetScroll;
                virtualScroll.set(targetScroll);
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [virtualScroll]);

    // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 45, damping: 20 });

    // 2. Scroll Rotation: Continues after morph
    const scrollRotate = useTransform(virtualScroll, [600, 2400], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

    // --- Mouse Parallax ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 60);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence: Scatter -> Line -> Circle ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 400);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 1800);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return IMAGES.map(() => ({
            x: (Math.random() - 0.5) * 1200,
            y: (Math.random() - 0.5) * 700,
            rotation: (Math.random() - 0.5) * 180,
            scale: 0.7,
            opacity: 0.85,
        }));
    }, []);

    // --- Animation Values ---
    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubMorph = smoothMorph.on("change", setMorphValue);
        const unsubRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubMorph();
            unsubRotate();
            unsubParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    const contentOpacity = useTransform(smoothMorph, [0.75, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.75, 1], [20, 0]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[680px] bg-black border border-zinc-800/90 rounded-3xl overflow-hidden select-none shadow-2xl"
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            {/* Background Grid & Ambient Vignette (Matching Landing Page) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

            {/* Main Stage */}
            <div className="relative flex h-full w-full flex-col items-center justify-center">

                {/* Big Center Title: "Why Quantum Leap?" (Fades out when morphing) */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={
                            introPhase === "circle" && morphValue < 0.5
                                ? { opacity: 1 - morphValue * 2, y: 0 }
                                : { opacity: 0 }
                        }
                        transition={{ duration: 0.8 }}
                        className="flex items-center gap-2 mb-3 bg-zinc-900 border border-zinc-700 px-3.5 py-1 rounded-full text-zinc-300 text-xs font-mono font-semibold"
                    >
                        <Activity size={13} className="text-white animate-pulse" />
                        <span>QUANTUM BENCHMARK TELEMETRY</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={
                            introPhase === "circle" && morphValue < 0.5
                                ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                                : { opacity: 0, filter: "blur(10px)" }
                        }
                        transition={{ duration: 0.8 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-sans"
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={
                            introPhase === "circle" && morphValue < 0.5
                                ? { opacity: 0.7 - morphValue }
                                : { opacity: 0 }
                        }
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-3 text-xs md:text-sm text-zinc-400 max-w-lg"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in when morphValue > 0.75) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[8%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Why Quantum Leap?
                    </h2>

                    <p className="text-xs md:text-sm text-zinc-400 max-w-xl leading-relaxed mt-2">
                        Standard LLMs suffer from a 16.0% hallucination rate on quantum operators.
                        Our 3-tier RAG delivers 89.6% verified groundedness against 76 physical textbooks.
                    </p>
                </motion.div>

                {/* 3D Morphable Cards Canvas */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        if (introPhase === "scatter") {
                            target = scatterPositions[i] || { x: 0, y: 0, rotation: 0, scale: 0.7, opacity: 0.85 };
                        } else if (introPhase === "line") {
                            const lineSpacing = 74;
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            // Circle position
                            const circleRadius = Math.min(minDimension * 0.35, 290);
                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            // Rainbow Arch position
                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.35 : 1.15);
                            const arcApexY = containerSize.height * (isMobile ? 0.38 : 0.28);
                            const arcCenterY = arcApexY + arcRadius;

                            const spreadAngle = isMobile ? 110 : 140;
                            const startAngle = -90 - spreadAngle / 2;
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                            const maxRotation = spreadAngle * 0.8;
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + i * step + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.3 : 1.6,
                            };

                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(1, arcPos.scale, morphValue),
                                opacity: 1,
                            };
                        }

                        const preset = METRIC_PRESETS[i] || { label: "Quantum Metric", value: "98.5%" };

                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                total={TOTAL_IMAGES}
                                phase={introPhase}
                                target={target}
                                metricLabel={preset.label}
                                metricValue={preset.value}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
