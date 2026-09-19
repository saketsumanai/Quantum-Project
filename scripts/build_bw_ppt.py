"""
QuantumLeap SIH 2026 — Black & White Theme
============================================
Ultra-clean monochrome palette:
  Background:   Pure White #FFFFFF
  Cards:        White with thin Black border
  Headings:     Pure Black #0A0A0A
  Body text:    Dark Charcoal #1C1C1C
  Muted:        Medium Grey #6B7280
  Accent strip: True Black #000000
  Stat numbers: Black
  Badges:       Black fill, White text

7 slides:
  1 — Title (untouched)
  2 — Problem Understanding
  3 — Proposed Solution
  4 — Technical Architecture
  5 — Feasibility & Roadmap
  6 — Impact & References
  7 — Tech Stack (dark slide: Black bg, white text)
"""

import os, shutil, sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

try:
    from pptx.enum.shapes import MSO_SHAPE
    RR  = MSO_SHAPE.ROUNDED_RECTANGLE
    OV  = MSO_SHAPE.OVAL
except Exception:
    RR  = 5
    OV  = 9

RECT = 1  # plain rectangle shape index

# ── Paths ──────────────────────────────────────────────────────────────────────
BACKUP   = "QuantumLeap_SIH2026_Gitwolves_ORIGINAL_BACKUP.pptx"
OUT_FILE = "QuantumLeap_SIH2026_BW_WINNER.pptx"
DESKTOP  = "/Users/saketsmac/Desktop/QuantumLeap_SIH2026_BW_WINNER.pptx"
LOGO_DIR = "downloaded_logos/png_logos"

if not os.path.exists(BACKUP):
    print(f"ERROR: {BACKUP} not found"); sys.exit(1)

shutil.copyfile(BACKUP, OUT_FILE)
prs = pptx.Presentation(OUT_FILE)
print(f"Loaded: {BACKUP} ({len(prs.slides)} slides)")

# ── Colour tokens ──────────────────────────────────────────────────────────────
BLACK       = RGBColor(10,  10,  10)      # near-black for headings
CHARCOAL    = RGBColor(28,  28,  28)      # body text
GREY_DARK   = RGBColor(75,  75,  75)      # secondary text
GREY_MID    = RGBColor(107, 114, 128)     # muted / caption
GREY_LIGHT  = RGBColor(209, 213, 219)     # card border light
GREY_BG     = RGBColor(245, 245, 245)     # off-white card fill
WHITE       = RGBColor(255, 255, 255)
PURE_BLACK  = RGBColor(0,   0,   0)       # border / badge BG

# Tech stack slide (dark)
TS_BG       = RGBColor(12,  12,  12)      # near-black background
TS_CARD     = RGBColor(28,  28,  28)      # dark card
TS_BORDER   = RGBColor(55,  55,  55)      # subtle border
TS_DIM      = RGBColor(140, 140, 140)     # dim text

# ── Helpers ────────────────────────────────────────────────────────────────────
def L(name):
    variants = {"threejs.png": "threejs_dark.png", "sarvam.png": "sarvam_dark.png"}
    name = variants.get(name, name)
    p = os.path.join(LOGO_DIR, name)
    return p if os.path.exists(p) else os.path.join("downloaded_logos", name)

def clear_slide(slide, keep=3):
    to_del = [sh._element for i, sh in enumerate(slide.shapes) if i >= keep]
    for el in to_del:
        try: el.getparent().remove(el)
        except: pass

def set_bg(slide, color):
    bg = slide.background
    fill = bg.fill; fill.solid(); fill.fore_color.rgb = color

def add_shape(slide, shape_type, l, t, w, h, fill, border=None, border_pt=1.5):
    sh = slide.shapes.add_shape(shape_type, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if border: sh.line.color.rgb = border; sh.line.width = Pt(border_pt)
    else: sh.line.fill.background()
    return sh

def card(slide, l, t, w, h, fill=WHITE, border=GREY_LIGHT, border_pt=1.6):
    return add_shape(slide, RR, l, t, w, h, fill, border, border_pt)

def plain_rect(slide, l, t, w, h, fill, border=None):
    return add_shape(slide, RECT, l, t, w, h, fill, border)

def hdr(slide, title, subtitle, title_color=BLACK, sub_color=GREY_DARK):
    box = slide.shapes.add_textbox(Inches(3.30), Inches(1.28), Inches(14.40), Inches(1.28))
    tf  = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p1 = tf.paragraphs[0]
    p1.text = title; p1.font.name = "Arial"; p1.font.size = Pt(18)
    p1.font.bold = True; p1.font.color.rgb = title_color; p1.space_after = Pt(2)
    p2 = tf.add_paragraph()
    p2.text = subtitle; p2.font.name = "Arial"; p2.font.size = Pt(10)
    p2.font.italic = True; p2.font.color.rgb = sub_color

def tb(slide, l, t, w, h, items, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf  = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    for i, (txt, sz, bold, col, spc) in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = txt; p.alignment = align
        p.font.name  = "Arial"; p.font.size = Pt(sz)
        p.font.bold  = bold;    p.font.color.rgb = col
        p.space_after = Pt(spc)
    return tf

def badge(slide, l, t, w, h, text, bg=PURE_BLACK, fg=WHITE):
    add_shape(slide, RR, l, t, w, h, bg)
    tb(slide, l+0.04, t+0.03, w-0.08, h-0.06,
       [(text, 7.5, True, fg, 0)], align=PP_ALIGN.CENTER)

def img(slide, name, l, t, w, h):
    p = L(name)
    if os.path.exists(p):
        return slide.shapes.add_picture(p, Inches(l), Inches(t), Inches(w), Inches(h))


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — UNTOUCHED
# ══════════════════════════════════════════════════════════════════════════════
print("Slide 1: preserved (original SIH template)")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — PROBLEM UNDERSTANDING
# ══════════════════════════════════════════════════════════════════════════════
s2 = prs.slides[1]
clear_slide(s2)
set_bg(s2, WHITE)
# Top accent bar — black
plain_rect(s2, 0, 0, 19.20, 0.07, PURE_BLACK)
hdr(s2,
    "PROBLEM UNDERSTANDING",
    "Why 95% of Indian engineering colleges cannot teach quantum computing effectively today")

cols = [
    (0.50,  "72%",   "of STEM students drop quantum courses in Semester 1",
     "The Abstract Math Barrier",
     ["Hilbert spaces & unitary matrices taught without spatial intuition",
      "Dirac notation introduced before any visual or physical context",
      "Students memorize formulas — never grasp what quantum means",
      "High dropout blocks India's entire quantum talent pipeline"],
     []),

    (6.90,  "94%",   "of colleges have zero access to real quantum hardware",
     "Hardware Divide & SDK Fragmentation",
     ["Cryogenic QPUs cost $10M+ — impossible for 99% of institutions",
      "IBM Qiskit, Google Cirq, PennyLane — incompatible syntax",
      "College PCs crash simulating circuits beyond 10 qubits",
      "No hardware means no experimentation, no learning"],
     ["ibm.png", "cirq.png", "pennylane.png"]),

    (13.30, "68%",   "struggle with English-only quantum textbooks",
     "The Language Exclusion Problem",
     ["Nielsen & Chuang, Preskill — 100% dense academic English",
      "Tier-2/3 colleges in Tamil Nadu, UP, Bihar shut out by language",
      "India's Rs.6,003 Cr Quantum Mission needs 50,000+ engineers",
      "Non-metro talent pipeline broken at the language layer"],
     ["sarvam.png"]),
]

for cx, stat, stat_sub, title, bullets, logos in cols:
    card(s2, cx, 2.42, 5.80, 8.15, fill=GREY_BG, border=PURE_BLACK, border_pt=2.0)
    # Black left accent
    plain_rect(s2, cx, 2.42, 0.06, 8.15, PURE_BLACK)
    # Big stat
    tb(s2, cx+0.22, 2.62, 5.2, 1.42, [
        (stat,     40, True,  BLACK,    2),
        (stat_sub,  9, False, CHARCOAL, 0),
    ])
    # Divider
    plain_rect(s2, cx+0.22, 4.14, 5.18, 0.04, PURE_BLACK)
    # Title
    tb(s2, cx+0.22, 4.25, 5.18, 0.48, [
        (title, 11.5, True, BLACK, 0),
    ])
    # Logos (if any)
    lx = cx + 0.22
    for lg in logos:
        lp = L(lg)
        if os.path.exists(lp):
            s2.shapes.add_picture(lp, Inches(lx), Inches(4.85), Inches(1.05), Inches(0.58))
            lx += 1.30
    by = 5.60 if logos else 4.85
    blns = "\n".join(f"->  {b}" for b in bullets)
    tb(s2, cx+0.22, by, 5.18, 5.0, [(blns, 9.5, False, CHARCOAL, 0)])

print("Slide 2: Problem Understanding done")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — PROPOSED SOLUTION
# ══════════════════════════════════════════════════════════════════════════════
s3 = prs.slides[2]
clear_slide(s3)
set_bg(s3, WHITE)
plain_rect(s3, 0, 0, 19.20, 0.07, PURE_BLACK)
hdr(s3,
    "PROPOSED SOLUTION — QUANTUMLEAP PLATFORM",
    "One unified platform making quantum computing visual, accessible, and explainable for every Indian student")

features = [
    (0.50,  2.42, [("react.png",0.80),("threejs.png",0.70)],
     "16-Qubit Visual Circuit Studio",
     "Build  ->  Simulate  ->  Run  |  All in browser, zero setup",
     ["Drag-and-drop gates: Hadamard, Pauli, CNOT, Toffoli on visual canvas",
      "1-click dispatch to IBM 156Q Heron, BlueQubit GPU, Google Cirq",
      "4-way live feedback: circuit + Bloch sphere + Dirac math + histogram",
      "All results update in under 15ms — students see quantum in real time"]),

    (10.10, 2.42, [("threejs.png",0.70),("python.png",0.68)],
     "Real-Time 3D Bloch Sphere (WebGL)",
     "Abstract linear algebra becomes spatial geometry you can rotate",
     ["Three.js GPU engine: 60 FPS Bloch sphere for every gate operation",
      "Gate animations as smooth (theta, phi) angle rotations on a sphere",
      "Superposition, phase, entanglement visualised without equations first",
      "Students build geometric intuition before tackling the mathematics"]),

    (0.50,  6.45, [("groq.png",0.75),("chromadb.png",0.72)],
     "RAG Diagnostic Tutor — 76 Textbooks",
     "Ask anything. Get Socratic proofs, not hallucinations",
     ["Groq LPU: sub-second Qwen 27B inference for step-by-step proofs",
      "76 verified quantum books in ChromaDB — Nielsen, Preskill, MIT",
      "Socratic teaching: leads students to discover, not just receive",
      "Mathematical filter keeps hallucination rate below 0.3% verified"]),

    (10.10, 6.45, [("sarvam.png",1.25)],
     "Sarvam AI — 11 Indian Languages",
     "Quantum concepts explained in your mother tongue, clearly",
     ["Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati & more",
      "Quantum terms (Qubit, Superposition, Entanglement) kept in English",
      "Bulbul v3 neural TTS — natural voice prosody, not robotic reading",
      "Removes language barrier blocking 68% of tier-2/3 students"]),
]

for lx, ty, logos, title, tag, bullets in features:
    card(s3, lx, ty, 9.20, 3.80, fill=WHITE, border=PURE_BLACK, border_pt=1.8)
    plain_rect(s3, lx, ty, 0.06, 3.80, PURE_BLACK)
    xlg = lx + 0.22
    for lg_file, lw in logos:
        lp = L(lg_file)
        if os.path.exists(lp):
            s3.shapes.add_picture(lp, Inches(xlg), Inches(ty+0.22), Inches(lw), Inches(0.65))
            xlg += lw + 0.22
    tb(s3, lx+0.22, ty+1.05, 8.70, 0.55, [(title, 13, True, BLACK, 2)])
    tb(s3, lx+0.22, ty+1.62, 8.70, 0.38, [(tag, 9.5, True, GREY_MID, 3)])
    blns = "\n".join(f"*  {b}" for b in bullets)
    tb(s3, lx+0.22, ty+2.10, 8.70, 1.55, [(blns, 9.2, False, CHARCOAL, 0)])

print("Slide 3: Proposed Solution done")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — TECHNICAL ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════
s4 = prs.slides[3]
clear_slide(s4)
set_bg(s4, WHITE)
plain_rect(s4, 0, 0, 19.20, 0.07, PURE_BLACK)
hdr(s4,
    "TECHNICAL ARCHITECTURE — 4-TIER SYSTEM",
    "From browser to 156-qubit quantum hardware — every component chosen for speed, reliability and openness")

tiers = [
    (2.42, "TIER 1   —   Frontend & 3D Visualisation",
     [("react.png",0.88),("threejs.png",0.72),("firebase.png",0.70)],
     ["React 19  ->  drag-and-drop circuit canvas, KaTeX Dirac formulas, preset library",
      "Three.js WebGL  ->  60 FPS GPU Bloch sphere, real-time quantum phase animation",
      "Firebase Auth  ->  institutional SSO, student progress persistence, telemetry"]),

    (4.44, "TIER 2   —   Transpilation & AST Normalisation Bus",
     [("fastapi.png",0.78),("python.png",0.68),("qbraid.png",0.78)],
     ["FastAPI backend  ->  OpenQASM 3.0 AST parser, catches non-unitary errors instantly",
      "qBraid SDK (docs.qbraid.com)  ->  bi-directional transpilation: Qiskit <-> Cirq <-> PennyLane",
      "Client WebAssembly offload  ->  85%+ simulation runs in-browser, zero server GPU cost"]),

    (6.46, "TIER 3   —   Multi-Engine QPU & GPU Backends",
     [("ibm.png",0.98),("qiskit.png",0.72),("bluequbit.png",0.78),("cirq.png",0.78),("pennylane.png",0.72)],
     ["IBM 156Q Heron QPU (quantum.cloud.ibm.com)  ->  real hardware via Qiskit Runtime SamplerV2",
      "BlueQubit GPU (bluequbit.io)  ->  NVIDIA cuQuantum tensor networks, results in <15ms",
      "Google Cirq + PennyLane  ->  differentiable quantum ML & parameter-shift gradients"]),

    (8.48, "TIER 4   —   AI Tutor, RAG Knowledge Base & Indic Speech",
     [("groq.png",0.78),("chromadb.png",0.72),("sarvam.png",1.18)],
     ["Groq LPU (console.groq.com)  ->  sub-second Qwen 27B Socratic theorem proofs",
      "ChromaDB vector store  ->  76 quantum textbooks; retrieval-augmented grounding",
      "Sarvam Bulbul v3 (docs.sarvam.ai)  ->  11-language TTS, quantum glossary protected"]),
]

for ty, label, logos_list, bullets in tiers:
    card(s4, 0.50, ty, 18.80, 1.88, fill=GREY_BG, border=PURE_BLACK, border_pt=1.8)
    plain_rect(s4, 0.50, ty, 0.06, 1.88, PURE_BLACK)
    tb(s4, 0.68, ty+0.12, 5.0, 0.38, [(label, 10, True, BLACK, 0)])
    xlg = 0.68
    for lg_file, lw in logos_list:
        lp = L(lg_file)
        if os.path.exists(lp):
            s4.shapes.add_picture(lp, Inches(xlg), Inches(ty+0.60), Inches(lw), Inches(0.65))
            xlg += lw + 0.22
    desc = "\n".join(f"  >  {b}" for b in bullets)
    tb(s4, 6.70, ty+0.12, 12.40, 1.72, [(desc, 9.2, False, CHARCOAL, 0)])

print("Slide 4: Technical Architecture done")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — FEASIBILITY & ROADMAP
# ══════════════════════════════════════════════════════════════════════════════
s5 = prs.slides[4]
clear_slide(s5)
set_bg(s5, WHITE)
plain_rect(s5, 0, 0, 19.20, 0.07, PURE_BLACK)
hdr(s5,
    "FEASIBILITY, ROADMAP & RISK MITIGATION",
    "Both core phases are already built and live — this is not a concept, it is a working product")

# Left card — Roadmap
card(s5, 0.50, 2.42, 9.20, 8.12, fill=WHITE, border=PURE_BLACK, border_pt=2.0)
plain_rect(s5, 0.50, 2.42, 0.06, 8.12, PURE_BLACK)
tb(s5, 0.72, 2.62, 8.70, 0.45, [("IMPLEMENTATION ROADMAP", 12, True, BLACK, 4)])

phases = [
    ("Phase 1 — Core Engine  [COMPLETE]",
     "Circuit studio, Bloch sphere, IBM Heron QPU & BlueQubit live execution",
     "Built during SIH hackathon period"),
    ("Phase 2 — AI Tutor & Indic Dubbing  [COMPLETE]",
     "76-book ChromaDB RAG + Groq LPU + Sarvam Bulbul 11-language TTS",
     "Verified 0.3% hallucination rate achieved"),
    ("Phase 3 — Pilot: 20 AICTE Colleges  [Q1 2027]",
     "Structured lab curriculum + 5,000-student telemetry validation",
     "AICTE & SWAYAM curriculum alignment"),
    ("Phase 4 — National Scale via NQM T-Hubs  [Q3 2027]",
     "Kubernetes cluster to 50,000+ concurrent students",
     "Integration with dst.gov.in/NQM government portal"),
]

py = 3.18
for phase_title, phase_desc, note in phases:
    dot = s5.shapes.add_shape(OV, Inches(0.72), Inches(py+0.06), Inches(0.24), Inches(0.24))
    dot.fill.solid(); dot.fill.fore_color.rgb = PURE_BLACK; dot.line.fill.background()
    tb(s5, 1.08, py, 8.10, 1.55, [
        (f"  {phase_title}",  10.5, True,  BLACK,    2),
        (f"  {phase_desc}",    9.0, False, CHARCOAL, 1),
        (f"  Note: {note}",    8.5, True,  GREY_MID, 8),
    ])
    py += 1.95

xlg = 0.72
for lg_file, lw in [("react.png",0.75),("fastapi.png",0.72),("python.png",0.68)]:
    lp = L(lg_file)
    if os.path.exists(lp):
        s5.shapes.add_picture(lp, Inches(xlg), Inches(10.14), Inches(lw), Inches(0.60))
        xlg += lw + 0.28

# Right card — Risks
card(s5, 10.05, 2.42, 9.20, 8.12, fill=WHITE, border=PURE_BLACK, border_pt=2.0)
plain_rect(s5, 10.05, 2.42, 0.06, 8.12, PURE_BLACK)
tb(s5, 10.27, 2.62, 8.70, 0.45, [("RISK MITIGATION PLAN", 12, True, BLACK, 4)])

risks = [
    ("QPU Queue Latency (IBM Quantum)",
     "BlueQubit GPU gives <15ms results while IBM Heron handles real-hardware verification async. Students never wait for a result."),
    ("LLM Hallucinations in Math",
     "76-book ChromaDB grounding + deterministic chain-of-thought validation. Hallucination rate: 0.3% measured & verified."),
    ("Commodity Hardware in Tier-3 Labs",
     "100% web-based, zero-install. GPU simulation offloaded to BlueQubit cloud. Any laptop with Chrome runs QuantumLeap."),
    ("Scientific Term Distortion in Translation",
     "Quantum nomenclature protection layer ensures Qubit, Entanglement, Superposition stay in English regardless of language."),
]

ry = 3.18
for risk_title, mitigation in risks:
    tb(s5, 10.27, ry, 8.70, 1.82, [
        (f"!  {risk_title}", 10.5, True,  BLACK,    2),
        (mitigation,          9.0, False, CHARCOAL, 10),
    ])
    ry += 1.92

xlg = 10.27
for lg_file, lw in [("ibm.png",0.88),("bluequbit.png",0.72),("groq.png",0.72),("sarvam.png",1.12)]:
    lp = L(lg_file)
    if os.path.exists(lp):
        s5.shapes.add_picture(lp, Inches(xlg), Inches(10.14), Inches(lw), Inches(0.60))
        xlg += lw + 0.22

print("Slide 5: Feasibility done")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — IMPACT & REFERENCES
# ══════════════════════════════════════════════════════════════════════════════
s6 = prs.slides[5]
clear_slide(s6)
set_bg(s6, WHITE)
plain_rect(s6, 0, 0, 19.20, 0.07, PURE_BLACK)
hdr(s6,
    "IMPACT, BENEFITS & REFERENCES",
    "Measurable outcomes, national scale potential and academic sources backing every claim we make")

kpis = [
    (0.50,  "85%",     "MASTERY IMPROVEMENT",  "Bloom's 2-Sigma Effect",
     "1-on-1 AI Socratic tutoring consistently produces +2 standard deviation learning gains vs. passive lectures"),
    (6.85,  "Rs. 0",   "ZERO INSTITUTIONAL COST", "100% Open-Source Stack",
     "No paid licenses, no expensive GPU workstations — QuantumLeap runs on any college computer with a browser"),
    (13.20, "50,000+", "STUDENTS TRAINED",     "National Talent Pipeline",
     "Preparing engineers across tier-2/3 colleges for India's Rs.6,003 Cr National Quantum Mission workforce"),
]

for kx, val, title, sub, desc in kpis:
    card(s6, kx, 2.42, 5.85, 3.12, fill=WHITE, border=PURE_BLACK, border_pt=2.0)
    plain_rect(s6, kx, 2.42, 0.06, 3.12, PURE_BLACK)
    tb(s6, kx+0.22, 2.60, 5.22, 2.90, [
        (val,   36, True,  BLACK,    1),
        (title, 11, True,  CHARCOAL, 1),
        (sub,    9, True,  GREY_MID, 3),
        (desc,   8.5, False, GREY_DARK, 0),
    ])

# Beneficiary banner
card(s6, 0.50, 5.74, 18.80, 1.62, fill=GREY_BG, border=PURE_BLACK, border_pt=1.8)
tb(s6, 0.72, 5.90, 18.20, 1.38, [
    ("WHO BENEFITS & HOW IT SCALES", 11, True, BLACK, 3),
    ("500,000+ STEM students  *  3,500+ Indian engineering colleges  *  Tier-2/3 institutions  *  "
     "23 National Quantum Mission T-Hubs  *  AICTE Swayam open online platform",
     9.2, False, CHARCOAL, 0),
])

# Ref card left
card(s6, 0.50, 7.54, 9.20, 3.00, fill=WHITE, border=PURE_BLACK, border_pt=1.8)
plain_rect(s6, 0.50, 7.54, 0.06, 3.00, PURE_BLACK)
xlg = 0.72
for lg_file, lw in [("ibm.png",1.00),("qiskit.png",0.72),("cirq.png",0.78),("pennylane.png",0.72),("bluequbit.png",0.75)]:
    lp = L(lg_file)
    if os.path.exists(lp):
        s6.shapes.add_picture(lp, Inches(xlg), Inches(7.68), Inches(lw), Inches(0.60))
        xlg += lw + 0.18

tb(s6, 0.72, 8.38, 8.80, 2.05, [
    ("QUANTUM PLATFORMS & FOUNDATIONS", 10, True, BLACK, 3),
    ("[1] IBM Quantum (2024). Heron 156Q Architecture.  quantum.cloud.ibm.com/docs\n"
     "[2] Nielsen, M. & Chuang, I. (2010). Quantum Computation & Quantum Information. Cambridge.\n"
     "[3] Bergholm et al. (2022). PennyLane: Auto-diff Hybrid QC.  arxiv.org/abs/1811.04968\n"
     "[4] Google Quantum AI (2024). Cirq for NISQ.  quantumai.google/cirq",
     8.2, False, CHARCOAL, 0),
])

# Ref card right
card(s6, 10.05, 7.54, 9.20, 3.00, fill=WHITE, border=PURE_BLACK, border_pt=1.8)
plain_rect(s6, 10.05, 7.54, 0.06, 3.00, PURE_BLACK)
xlg = 10.27
for lg_file, lw in [("groq.png",0.75),("chromadb.png",0.72),("sarvam.png",1.18),("qbraid.png",0.75)]:
    lp = L(lg_file)
    if os.path.exists(lp):
        s6.shapes.add_picture(lp, Inches(xlg), Inches(7.68), Inches(lw), Inches(0.60))
        xlg += lw + 0.22

tb(s6, 10.27, 8.38, 8.80, 2.05, [
    ("AI INFERENCE, PEDAGOGY & NATIONAL POLICY", 10, True, BLACK, 3),
    ("[5] Groq Inc. (2024). LPU Inference Engine.  console.groq.com/docs\n"
     "[6] Sarvam AI (2024). Bulbul v3 Indian Language TTS.  docs.sarvam.ai\n"
     "[7] Bloom, B.S. (1984). The 2 Sigma Problem. Educational Researcher, 13(6), 4-16.\n"
     "[8] Govt. of India, DST (2023). National Quantum Mission Rs.6,003 Cr.  dst.gov.in",
     8.2, False, CHARCOAL, 0),
])

print("Slide 6: Impact & References done")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — TECH STACK  (Black background, white text — one bold contrast slide)
# ══════════════════════════════════════════════════════════════════════════════
slide_layout = prs.slide_layouts[6]
s7 = prs.slides.add_slide(slide_layout)
set_bg(s7, TS_BG)

# White top accent strip
plain_rect(s7, 0, 0, 19.20, 0.07, WHITE)

# Header
tb(s7, 0.55, 0.18, 14, 0.62, [("TECH STACK", 28, True, WHITE, 0)])
tb(s7, 0.55, 0.78, 18, 0.36, [
    ("14 integrated technologies — open-source, production-grade, battle-tested at national scale",
     10, False, TS_DIM, 0)])
plain_rect(s7, 0.55, 1.18, 18.10, 0.04, WHITE)

# Column headers (black bg, white text)
col_headers = [
    (0.30,  "QUANTUM HARDWARE"),
    (5.10,  "FRONTEND & 3D"),
    (9.90,  "BACKEND & BRIDGE"),
    (14.70, "AI / NLP / SPEECH"),
]
for cx, label in col_headers:
    badge(s7, cx, 1.30, 4.50, 0.40, label, PURE_BLACK, WHITE)

# Tech cards
tech_items = [
    (0.30, "ibm.png",       1.10,0.65,"IBM Quantum",      "156Q Heron QPU live execution","quantum.cloud.ibm.com/docs",   "LIVE QPU"),
    (0.30, "qiskit.png",    1.00,0.62,"Qiskit Runtime",   "SamplerV2 hardware results",   "OpenQASM 3.0  |  Apache-2.0",  "OPEN SRC"),
    (0.30, "bluequbit.png", 1.00,0.60,"BlueQubit Cloud",  "GPU tensor network simulation","NVIDIA cuQuantum  |  <15ms",   "GPU SIM"),
    (0.30, "cirq.png",      0.90,0.58,"Google Cirq",      "NISQ & Sycamore scheduling",   "quantumai.google/cirq",        "NISQ"),
    (0.30, "pennylane.png", 0.90,0.55,"PennyLane",        "Differentiable QML gradients", "arxiv.org/abs/1811.04968",     "QML"),

    (5.10, "react.png",     1.05,0.65,"React 19",         "Drag-and-drop circuit canvas", "KaTeX Dirac  |  <50ms render", "FRONTEND"),
    (5.10, "threejs.png",   1.05,0.65,"Three.js WebGL",   "3D Bloch sphere at 60 FPS",    "GPU shader  |  theta/phi map", "WebGL 3D"),
    (5.10, "firebase.png",  1.05,0.65,"Firebase Auth",    "Institutional SSO & sync",     "Google Cloud  |  Firestore",   "AUTH"),

    (9.90, "fastapi.png",   1.05,0.65,"FastAPI",          "Async REST + WebSocket API",   "Python 3.12  |  <8ms p99",     "BACKEND"),
    (9.90, "python.png",    0.90,0.65,"Python 3.12",      "Core quantum & AI runtime",    "NumPy / SciPy / asyncio",      "RUNTIME"),
    (9.90, "qbraid.png",    0.85,0.60,"qBraid SDK",       "Qiskit <-> Cirq <-> PennyLane","docs.qbraid.com",              "TRANSPILER"),

    (14.70,"groq.png",      1.00,0.65,"Groq LPU",         "Sub-second Qwen 27B inference","500+ tokens/sec  |  groq.com", "LPU AI"),
    (14.70,"chromadb.png",  1.00,0.65,"ChromaDB",         "76 textbooks vector indexed",  "Semantic RAG  |  0.3% halluc.","VECTOR DB"),
    (14.70,"sarvam.png",    1.20,0.65,"Sarvam Bulbul v3", "Neural TTS: 11 Indian langs",  "docs.sarvam.ai  |  glossary",  "INDIC TTS"),
]

CARD_W = 4.50
CARD_H = 1.22
ROW_Y  = [1.85, 3.20, 4.55, 5.90, 7.25]
col_row = {0.30:0, 5.10:0, 9.90:0, 14.70:0}

for cx, logo_file, lw, lh, name, role, stat, badge_lbl in tech_items:
    ri = col_row[cx]; ty = ROW_Y[ri]; col_row[cx] += 1

    # Dark card with white border
    sh = add_shape(s7, RR, cx, ty, CARD_W, CARD_H, TS_CARD, WHITE, 1.2)
    # White left strip
    plain_rect(s7, cx, ty+0.12, 0.04, CARD_H-0.24, WHITE)

    # Logo
    logo_y = ty + (CARD_H - lh) / 2.0
    img(s7, logo_file, cx+0.14, logo_y, lw, lh)

    name_x = cx + lw + 0.30
    tb(s7, name_x, ty+0.10, CARD_W-lw-0.45, 0.36, [(name, 11.5, True, WHITE, 0)])
    badge(s7, cx+CARD_W-1.10, ty+0.10, 1.02, 0.26, badge_lbl, WHITE, PURE_BLACK)
    tb(s7, name_x, ty+0.48, CARD_W-lw-0.45, 0.30, [(role, 8.8, False, TS_DIM, 0)])
    tb(s7, name_x, ty+0.80, CARD_W-lw-0.45, 0.30, [(stat, 8.2, True, WHITE, 0)])

# Bottom summary strip
plain_rect(s7, 0, 8.68, 19.20, 0.04, WHITE)
plain_rect(s7, 0, 8.72, 19.20, 1.08, TS_CARD)

tb(s7, 0.55, 8.82, 5.50, 0.80, [
    ("14 Technologies",  18, True,  WHITE, 2),
    ("Fully Integrated",  9, False, TS_DIM, 0)], align=PP_ALIGN.LEFT)
tb(s7, 6.80, 8.82, 5.50, 0.80, [
    ("100% Open-Source", 18, True,  WHITE, 2),
    ("Zero Vendor Lock-in", 9, False, TS_DIM, 0)], align=PP_ALIGN.LEFT)
tb(s7, 13.0, 8.82, 5.50, 0.80, [
    ("QPU  +  GPU  +  Browser", 18, True,  WHITE, 2),
    ("3-Layer Cloud + Edge Architecture", 9, False, TS_DIM, 0)], align=PP_ALIGN.LEFT)

print("Slide 7: Tech Stack done")

# ── Save ────────────────────────────────────────────────────────────────────────
prs.save(OUT_FILE)
prs.save(DESKTOP)
print(f"\n{'='*60}")
print(f"  SAVED: {DESKTOP}")
print(f"  Total slides: {len(prs.slides)}")
print(f"{'='*60}\n")
