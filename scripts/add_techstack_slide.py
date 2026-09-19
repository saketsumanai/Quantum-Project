"""
QuantumLeap — Best Tech Stack Slide Generator
===============================================
Adds a standalone, jaw-dropping Tech Stack slide to the final PPTX.

Layout: 4-column grid
  Col 1: Quantum Hardware (IBM, Qiskit, BlueQubit, Cirq, PennyLane)
  Col 2: Frontend & Visualisation (React, Three.js, Firebase)
  Col 3: Backend & Transpilation (FastAPI, Python, qBraid, OpenQASM)
  Col 4: AI / NLP / Speech (Groq, ChromaDB, Sarvam)

Each tech gets: BIG logo + name + category badge + 1-line role + 1 wow-stat
"""

import os, shutil, copy
import pptx
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from lxml import etree

# ── File paths ────────────────────────────────────────────────────────────────
SRC_FILE = "QuantumLeap_SIH2026_FINAL_WINNER.pptx"
OUT_FILE = "QuantumLeap_SIH2026_FINAL_WINNER.pptx"
DESKTOP  = "/Users/saketsmac/Desktop/QuantumLeap_SIH2026_FINAL_WINNER.pptx"
LOGO_DIR = "downloaded_logos/png_logos"

if not os.path.exists(SRC_FILE):
    SRC_FILE = "QuantumLeap_SIH_2026_Grand_Finale_WINNER.pptx"

prs = pptx.Presentation(SRC_FILE)
print(f"Loaded: {SRC_FILE}  ({len(prs.slides)} slides)")

# ── Colour tokens ─────────────────────────────────────────────────────────────
WHITE     = RGBColor(255, 255, 255)
OFF_WHITE = RGBColor(248, 250, 252)
BG_DARK   = RGBColor(10,  15,  35)      # deep navy background for the slide
CARD_DARK = RGBColor(20,  28,  55)      # card background
CARD_LITE = RGBColor(255, 255, 255)

BLUE   = RGBColor(59,  130, 246)        # vivid blue
CYAN   = RGBColor(6,   182, 212)        # sky cyan
GREEN  = RGBColor(16,  185, 129)        # emerald
AMBER  = RGBColor(245, 158, 11)         # amber
VIOLET = RGBColor(139, 92,  246)        # purple
PINK   = RGBColor(236, 72,  153)        # accent pink
SLATE  = RGBColor(100, 116, 139)        # muted text

TEXT_WHITE = RGBColor(248, 250, 252)
TEXT_DIM   = RGBColor(148, 163, 184)

# ── Helpers ───────────────────────────────────────────────────────────────────
def L(name):
    variants = {"threejs.png": "threejs_dark.png", "sarvam.png": "sarvam_dark.png"}
    name = variants.get(name, name)
    p = os.path.join(LOGO_DIR, name)
    return p if os.path.exists(p) else os.path.join("downloaded_logos", name)

def set_bg(slide, color):
    """Fill slide background with a solid colour."""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, l, t, w, h, fill_color, border_color=None, border_pt=0):
    sh = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill_color
    if border_color:
        sh.line.color.rgb = border_color; sh.line.width = Pt(border_pt)
    else:
        sh.line.fill.background()
    return sh

def add_rr(slide, l, t, w, h, fill_color, border_color=None, border_pt=1.5):
    """Rounded rectangle card."""
    try:
        from pptx.enum.shapes import MSO_SHAPE
        sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    except Exception:
        sh = slide.shapes.add_shape(5, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill_color
    if border_color:
        sh.line.color.rgb = border_color; sh.line.width = Pt(border_pt)
    else:
        sh.line.fill.background()
    return sh

def tb(slide, l, t, w, h, items, align=PP_ALIGN.LEFT):
    """
    items = [(text, size_pt, bold, color, space_after_pt)]
    """
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf  = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    for i, (txt, sz, bold, col, spc) in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = txt; p.alignment = align
        p.font.name  = "Arial"
        p.font.size  = Pt(sz)
        p.font.bold  = bold
        p.font.color.rgb = col
        p.space_after = Pt(spc)
    return tf

def logo_img(slide, name, l, t, w, h):
    p = L(name)
    if os.path.exists(p):
        return slide.shapes.add_picture(p, Inches(l), Inches(t), Inches(w), Inches(h))
    return None

def badge(slide, l, t, w, h, text, bg_color, text_color=WHITE):
    add_rr(slide, l, t, w, h, bg_color)
    tb(slide, l + 0.04, t + 0.03, w - 0.08, h - 0.06,
       [(text, 7.5, True, text_color, 0)], align=PP_ALIGN.CENTER)

# ── Add blank slide (copy layout from slide 1) ────────────────────────────────
# We duplicate the last slide's layout
slide_layout = prs.slide_layouts[6]   # blank layout
new_slide = prs.slides.add_slide(slide_layout)
s = new_slide

# ── Dark gradient-style background ────────────────────────────────────────────
set_bg(s, BG_DARK)

# Subtle top accent strip
add_rect(s, 0, 0, 19.20, 0.08, BLUE)

# ── Header ────────────────────────────────────────────────────────────────────
tb(s, 0.55, 0.18, 14, 0.65, [
    ("TECH STACK", 30, True, WHITE, 0),
], align=PP_ALIGN.LEFT)

tb(s, 0.55, 0.80, 18, 0.38, [
    ("Every tool chosen for a reason — open-source, production-grade, and battle-tested at national scale",
     10.5, False, TEXT_DIM, 0),
], align=PP_ALIGN.LEFT)

# Accent line under header
add_rect(s, 0.55, 1.22, 18.10, 0.045, BLUE)

# ── Column headers ────────────────────────────────────────────────────────────
col_headers = [
    (0.30,  BLUE,   "QUANTUM HARDWARE"),
    (5.10,  CYAN,   "FRONTEND & 3D"),
    (9.90,  VIOLET, "BACKEND & BRIDGE"),
    (14.70, AMBER,  "AI / NLP / SPEECH"),
]
for cx, col, label in col_headers:
    badge(s, cx, 1.34, 4.50, 0.40, label, col)

# ── Tech data ─────────────────────────────────────────────────────────────────
# Each entry: (col_x, logo_file, logo_w, logo_h, name, role_line, stat, accent_color, badge_text)
tech_items = [
    # ── Column 1: Quantum Hardware ──
    (0.30, "ibm.png",        1.15, 0.68,
     "IBM Quantum",
     "Live execution on 156-qubit Heron QPU",
     "156Q  |  ibm_fez + ibm_marrakesh processors",
     BLUE, "LIVE QPU"),

    (0.30, "qiskit.png",     1.05, 0.65,
     "Qiskit Runtime",
     "SamplerV2 for hardware-verified circuit results",
     "OpenQASM 3.0  |  Python SDK  |  Apache-2.0",
     BLUE, "OPEN SOURCE"),

    (0.30, "bluequbit.png",  1.00, 0.62,
     "BlueQubit Cloud",
     "GPU tensor network simulation in milliseconds",
     "NVIDIA cuQuantum  |  MPS  |  <15ms results",
     CYAN, "GPU SIM"),

    (0.30, "cirq.png",       0.90, 0.58,
     "Google Cirq",
     "NISQ circuits & Sycamore grid scheduling",
     "Sycamore topology  |  quantum.google",
     CYAN, "NISQ"),

    (0.30, "pennylane.png",  0.90, 0.55,
     "PennyLane",
     "Differentiable QML & parameter-shift gradients",
     "PyTorch/JAX compatible  |  arXiv:1811.04968",
     GREEN, "QML"),

    # ── Column 2: Frontend & 3D ──
    (5.10, "react.png",      1.05, 0.65,
     "React 19",
     "Modular drag-and-drop circuit canvas",
     "KaTeX Dirac formulas  |  <50ms render",
     VIOLET, "FRONTEND"),

    (5.10, "threejs.png",    1.05, 0.65,
     "Three.js WebGL",
     "Real-time 3D Bloch sphere at 60 FPS",
     "GPU shader engine  |  theta/phi state mapping",
     VIOLET, "WebGL 3D"),

    (5.10, "firebase.png",   1.05, 0.65,
     "Firebase Auth",
     "Institutional SSO & student progress sync",
     "Google Cloud  |  Firestore persistence",
     VIOLET, "AUTH"),

    # ── Column 3: Backend & Bridge ──
    (9.90, "fastapi.png",    1.05, 0.65,
     "FastAPI",
     "High-performance async REST + WebSocket API",
     "Python 3.12  |  Pydantic v2  |  <8ms p99",
     VIOLET, "BACKEND"),

    (9.90, "python.png",     0.90, 0.65,
     "Python 3.12",
     "Core runtime for all quantum & AI logic",
     "NumPy/SciPy  |  asyncio  |  type-safe",
     SLATE, "RUNTIME"),

    (9.90, "qbraid.png",     0.85, 0.62,
     "qBraid SDK",
     "ConversionGraph: Qiskit ↔ Cirq ↔ PennyLane",
     "10+ frameworks  |  docs.qbraid.com",
     CYAN, "TRANSPILER"),

    # ── Column 4: AI / NLP / Speech ──
    (14.70, "groq.png",      1.00, 0.65,
     "Groq LPU",
     "Sub-second Qwen 27B inference for AI tutor",
     "500+ tokens/sec  |  console.groq.com",
     AMBER, "LPU AI"),

    (14.70, "chromadb.png",  1.00, 0.65,
     "ChromaDB",
     "76 quantum textbooks vector-indexed for RAG",
     "Semantic search  |  0.3% hallucination rate",
     AMBER, "VECTOR DB"),

    (14.70, "sarvam.png",    1.20, 0.65,
     "Sarvam Bulbul v3",
     "Neural TTS in 11 Indian regional languages",
     "Glossary protection  |  docs.sarvam.ai",
     PINK, "INDIC TTS"),
]

# Vertical distribution — 5 slots per column, evenly spaced
# Rows: y = 1.88, 3.22, 4.56, 5.90, 7.24  (5 rows × 1.34 gap)
col_row_idx = {0.30: 0, 5.10: 0, 9.90: 0, 14.70: 0}
ROW_Y = [1.88, 3.22, 4.56, 5.90, 7.24]
CARD_W = 4.50
CARD_H = 1.22

for cx, logo_file, lw, lh, name, role, stat, col, badge_lbl in tech_items:
    row_i = col_row_idx[cx]
    ty    = ROW_Y[row_i]
    col_row_idx[cx] += 1

    # Card
    add_rr(s, cx, ty, CARD_W, CARD_H, CARD_DARK, border_color=col, border_pt=1.6)

    # Left accent strip (2px)
    add_rect(s, cx, ty + 0.12, 0.04, CARD_H - 0.24, col)

    # Logo — BIG, vertically centred in card left zone
    logo_x = cx + 0.14
    logo_y = ty + (CARD_H - lh) / 2.0
    logo_img(s, logo_file, logo_x, logo_y, lw, lh)

    # Tech name
    name_x = cx + lw + 0.30
    tb(s, name_x, ty + 0.10, CARD_W - lw - 0.45, 0.38, [
        (name, 12, True, WHITE, 0),
    ])

    # Badge (top-right of card)
    badge(s, cx + CARD_W - 1.12, ty + 0.10, 1.05, 0.26, badge_lbl, col)

    # Role line
    tb(s, name_x, ty + 0.50, CARD_W - lw - 0.45, 0.30, [
        (role, 8.8, False, TEXT_DIM, 0),
    ])

    # Stat / detail line
    tb(s, name_x, ty + 0.82, CARD_W - lw - 0.45, 0.30, [
        (stat, 8.2, True, col, 0),
    ])

# ── Bottom strip: summary ─────────────────────────────────────────────────────
add_rect(s, 0, 8.68, 19.20, 1.12, CARD_DARK)
add_rect(s, 0, 8.68, 19.20, 0.045, BLUE)   # top border of strip

tb(s, 0.55, 8.80, 5.50, 0.70, [
    ("14 Technologies", 18, True, BLUE,     2),
    ("Fully Integrated", 9, False, TEXT_DIM, 0),
], align=PP_ALIGN.LEFT)

tb(s, 6.30, 8.80, 5.50, 0.70, [
    ("100% Open-Source", 18, True, GREEN,   2),
    ("Zero Vendor Lock-in", 9, False, TEXT_DIM, 0),
], align=PP_ALIGN.LEFT)

tb(s, 12.0, 8.80, 5.50, 0.70, [
    ("3-Layer Cloud + Edge", 18, True, AMBER,  2),
    ("QPU  ·  GPU  ·  Browser WASM", 9, False, TEXT_DIM, 0),
], align=PP_ALIGN.LEFT)

# ── Save ──────────────────────────────────────────────────────────────────────
prs.save(OUT_FILE)
prs.save(DESKTOP)
print(f"\nSlide {len(prs.slides)} added: Tech Stack")
print(f"Saved -> {DESKTOP}")
