"use client";
import React from "react";
import { motion } from "framer-motion";
import { Cpu, BookOpen, GraduationCap, ArrowRight, CheckCircle2, Database, Activity } from "lucide-react";

export function BentoCard({
  eyebrow,
  title,
  description,
  graphic,
  onClick,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  graphic: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xl hover:border-zinc-500/80 hover:shadow-[0_0_30px_rgba(255,255,255,0.06)] cursor-pointer transition-all ${className}`}
    >
      {/* Top Visual Graphic Container */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-800/60 bg-black/60 p-4 mb-6 flex flex-col justify-center group-hover:border-zinc-700/80 transition-colors">
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute inset-0 bg-radial from-zinc-800/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 w-full h-full flex flex-col justify-center">
          {graphic}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col justify-between flex-1 space-y-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {eyebrow}
          </div>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-white group-hover:text-zinc-100 transition-colors flex items-center justify-between">
            {title}
          </h3>
          <p className="mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
            {description}
          </p>
        </div>

        {/* Action Link Footer */}
        <div className="pt-3 border-t border-zinc-900 flex items-center text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
          <span>Explore Module</span>
          <ArrowRight className="w-3.5 h-3.5 ml-2 transform group-hover:translate-x-1 transition-transform text-zinc-400 group-hover:text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function FUIBentoGridDark({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  return (
    <div className="py-12 container mx-auto px-4 max-w-7xl">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
          <Activity className="w-3 h-3 text-zinc-300" />
          <span>Platform Capabilities</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">
          Architected for <span className="font-normal text-white underline decoration-zinc-700 underline-offset-8">Quantum Research</span>
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          High-performance simulation, RAG-indexed literature, and structured learning units engineered entirely in monochrome.
        </p>
      </div>

      {/* 3-Column Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Circuit Simulation */}
        <BentoCard
          eyebrow="Module 01 • Engine"
          title="Circuit Studio"
          description="Build and evaluate multi-qubit circuits on a high-performance C++ & Python Aer statevector simulator. Drag Pauli, Hadamard, and CNOT gates with real-time measurement distribution."
          onClick={() => onNavigate && onNavigate("studio")}
          graphic={
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  QPU Aer Engine
                </span>
                <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">16 Qubits Active</span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-zinc-600 via-white to-zinc-600 w-3/4 rounded-full" />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="bg-zinc-900 border border-zinc-700 text-white font-mono text-center py-1.5 text-xs rounded font-semibold shadow-inner">H</div>
                <div className="bg-zinc-900 border border-zinc-700 text-white font-mono text-center py-1.5 text-xs rounded font-semibold shadow-inner">X</div>
                <div className="bg-zinc-800 border border-zinc-500 text-white font-mono text-center py-1.5 text-xs rounded font-semibold shadow-md">CX</div>
                <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-center py-1.5 text-xs rounded font-semibold shadow-inner">M</div>
              </div>
            </div>
          }
        />

        {/* Module 2: Learning Hub */}
        <BentoCard
          eyebrow="Module 02 • RAG Knowledge"
          title="Learning Hub"
          description="Explore deep learning paths built directly from 76 landmark textbooks and research papers indexed in ChromaDB. Access mathematical derivations, executable Qiskit 1.0 code, and theory."
          onClick={() => onNavigate && onNavigate("learning")}
          graphic={
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs text-zinc-300 border-b border-zinc-800 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-zinc-400" />
                  Vector DB
                </span>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">7,323 Chunks</span>
              </div>
              <div className="text-[11px] text-zinc-400 space-y-1 pt-1">
                <div className="truncate text-zinc-300">▸ Watrous: Quantum Info Theory</div>
                <div className="truncate text-zinc-400">▸ Nielsen & Chuang: Computation</div>
                <div className="truncate text-zinc-500">▸ Preskill: NISQ Architecture</div>
              </div>
            </div>
          }
        />

        {/* Module 3: Structured Curriculum */}
        <BentoCard
          eyebrow="Module 03 • Mastery"
          title="Curriculum"
          description="Navigate structured lesson units covering Superposition, Entanglement, Grover's Search, Shor's Algorithm, and Surface Codes. Test conceptual mastery via interactive verification."
          onClick={() => onNavigate && onNavigate("curriculum")}
          graphic={
            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                  Unit 02 Progress
                </span>
                <span className="text-[10px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-semibold">100% Verified</span>
              </div>
              <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full rounded-full" />
              </div>
              <div className="text-[11px] text-zinc-300 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Concept Check: Bell Pair |Φ+⟩</span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
