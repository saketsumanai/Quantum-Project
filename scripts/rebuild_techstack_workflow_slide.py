"""
QuantumLeap SIH 2026 — Slide 7 Rebuilder
Combines:
  1. Complete 14-Technology Stack Grid (Top Section)
  2. End-to-End Student Workflow Pipeline with Vector Arrows (Middle Section)
  3. National Scale & Architecture Metric Bar (Bottom Section)

Theme: High-contrast Monochrome Black & White (Deep Charcoal / Black Cards on Dark Canvas,
or White with Black Borders). Designed specifically for 20.0" x 11.25" 16:9 Presentation.
"""

import os, sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

BW_FILE = "QuantumLeap_SIH2026_BW_WINNER.pptx"
DESKTOP = "/Users/saketsmac/Desktop/QuantumLeap_SIH2026_BW_WINNER.pptx"
LOGO_DIR = "downloaded_logos/png_logos"

if not os.path.exists(BW_FILE):
    print(f"ERROR: {BW_FILE} not found."); sys.exit(1)

prs = pptx.Presentation(BW_FILE)
slide_w = prs.slide_width.inches
slide_h = prs.slide_height.inches
print(f"Presentation dimensions: {slide_w}\" x {slide_h}\", slides: {len(prs.slides)}")

# ── Color Palette (High-Contrast Black & White / Dark Mode) ────────────────
BG_COLOR    = RGBColor(10,  10,  12)    # Deep obsidian black
CARD_BG     = RGBColor(22,  22,  26)    # Elevated dark surface
CARD_BORDER = RGBColor(60,  60,  68)    # Crisp subtle edge
WHITE       = RGBColor(255, 255, 255)  # Pure crisp white
TEXT_WHITE  = RGBColor(245, 245, 247)  # Primary text
TEXT_MUTED  = RGBColor(160, 160, 168)  # Secondary description
TEXT_FAINT  = RGBColor(110, 110, 120)  # Labels / stats
PILL_BG     = RGBColor(36,  36,  42)    # Tag background
PURE_BLACK  = RGBColor(0,   0,   0)    # Deep black

RR    = MSO_SHAPE.ROUNDED_RECTANGLE
RECT  = MSO_SHAPE.RECTANGLE
ARROW = MSO_SHAPE.RIGHT_ARROW

def L(name):
    variants = {"threejs.png": "threejs_dark.png", "sarvam.png": "sarvam_dark.png"}
    target = variants.get(name, name)
    p = os.path.join(LOGO_DIR, target)
    if os.path.exists(p): return p
    p2 = os.path.join("downloaded_logos", target)
    if os.path.exists(p2): return p2
    return os.path.join(LOGO_DIR, name)

def set_bg(slide, color):
    bg = slide.background; fill = bg.fill
    fill.solid(); fill.fore_color.rgb = color

def shape(slide, stype, l, t, w, h, fill, border=None, bpt=1.0):
    sh = slide.shapes.add_shape(stype, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if border:
        sh.line.color.rgb = border
        sh.line.width = Pt(bpt)
    else:
        sh.line.fill.background()
    return sh

def tb(slide, l, t, w, h, items, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    for i, (txt, sz, bold, col, spc) in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = txt; p.alignment = align
        p.font.name = "Arial"; p.font.size = Pt(sz)
        p.font.bold = bold; p.font.color.rgb = col; p.space_after = Pt(spc)
    return tf

def badge(slide, l, t, w, h, text, bg=WHITE, fg=PURE_BLACK, sz=7.5):
    shape(slide, RR, l, t, w, h, bg)
    tb(slide, l, t + (h - 0.20)/2, w, 0.22, [(text, sz, True, fg, 0)], align=PP_ALIGN.CENTER)

# ── Ensure Slide 7 Exists and Clear it ─────────────────────────────────────
while len(prs.slides) < 7:
    prs.slides.add_slide(prs.slide_layouts[6])

s = prs.slides[6]
sp_tree = s.shapes._spTree
for sp in list(sp_tree):
    tag = sp.tag.split('}')[-1] if '}' in sp.tag else sp.tag
    if tag in ('sp', 'pic', 'grpSp', 'cxnSp', 'graphicFrame'):
        sp_tree.remove(sp)

set_bg(s, BG_COLOR)

# ═════════════════════════════════════════════════════════════════════════════
# TOP ACCENT & HEADER
# ═════════════════════════════════════════════════════════════════════════════
shape(s, RECT, 0, 0, 20.0, 0.08, WHITE)

tb(s, 0.50, 0.16, 12.0, 0.50, [
    ("TECH STACK & END-TO-END WORKFLOW", 24, True, WHITE, 0)
])
tb(s, 0.50, 0.66, 19.0, 0.30, [
    ("14 integrated technologies powering every student session — from browser circuit canvas to live Heron QPU & Indic AI tutor",
     9.5, False, TEXT_MUTED, 0)
])
shape(s, RECT, 0.50, 1.02, 19.0, 0.025, WHITE)

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 1: TECH STACK GRID (4 Columns x 5 Rows max)
# ═════════════════════════════════════════════════════════════════════════════
# Total width = 19.0 inches. 4 columns of 4.45 in, 3 gaps of 0.40 in.
COL_W = 4.45
COL_GAP = 0.40
MARGIN_L = 0.50
COL_X = [MARGIN_L + i * (COL_W + COL_GAP) for i in range(4)]

col_headers = [
    ("QUANTUM HARDWARE & ENGINES", COL_X[0]),
    ("FRONTEND & 3D INTERACTION",   COL_X[1]),
    ("BACKEND & TRANSPILATION",      COL_X[2]),
    ("AI REASONING & INDIC VOICE",   COL_X[3]),
]

for title, cx in col_headers:
    badge(s, cx, 1.12, COL_W, 0.32, title, bg=PURE_BLACK, fg=WHITE, sz=8.0)
    shape(s, RR, cx, 1.12, COL_W, 0.32, PURE_BLACK, border=WHITE, bpt=1.0)
    tb(s, cx, 1.17, COL_W, 0.24, [(title, 8.0, True, WHITE, 0)], align=PP_ALIGN.CENTER)

tech_items = [
    # (col_idx, logo, lw, lh, name, role, stat, badge_lbl)
    (0, "ibm.png",       0.95, 0.48, "IBM Quantum",     "156Q Heron QPU live runtime", "quantum.cloud.ibm.com", "LIVE QPU"),
    (0, "qiskit.png",    0.88, 0.48, "Qiskit Runtime",  "SamplerV2 hardware execution", "OpenQASM 3.0  ·  Apache-2", "OPEN SRC"),
    (0, "bluequbit.png", 0.88, 0.46, "BlueQubit Cloud", "GPU tensor network simulation", "NVIDIA cuQuantum  ·  <15ms", "GPU SIM"),
    (0, "cirq.png",      0.80, 0.45, "Google Cirq",     "NISQ optimization & scheduling", "quantumai.google/cirq", "NISQ"),
    (0, "pennylane.png", 0.80, 0.42, "PennyLane",       "Differentiable QML gradients", "arxiv:1811.04968  ·  Xanadu", "QML"),

    (1, "react.png",     0.88, 0.48, "React 19",        "Drag-and-drop circuit canvas", "KaTeX Dirac  ·  <50ms render", "FRONTEND"),
    (1, "threejs.png",   0.88, 0.48, "Three.js WebGL",  "Interactive 3D Bloch sphere", "60 FPS  ·  GPU Shaders", "WebGL 3D"),
    (1, "firebase.png",  0.88, 0.48, "Firebase Auth",   "SSO, RBAC & progress storage", "Google Cloud  ·  JWT Sync", "AUTH"),

    (2, "fastapi.png",   0.88, 0.48, "FastAPI",         "High-throughput async gateway", "Python 3.12  ·  <8ms p99", "BACKEND"),
    (2, "python.png",    0.80, 0.48, "Python 3.12",     "Quantum math & microservices", "NumPy / SciPy / asyncio", "RUNTIME"),
    (2, "qbraid.png",    0.78, 0.46, "qBraid SDK",      "Cross-framework transpiler", "Qiskit ↔ Cirq ↔ PennyLane", "TRANSPILER"),

    (3, "groq.png",      0.88, 0.48, "Groq LPU",        "Sub-second AI tutor reasoning", "500+ tok/s  ·  Qwen 2.5 72B", "LPU AI"),
    (3, "chromadb.png",  0.88, 0.48, "ChromaDB",        "76 quantum textbooks indexed", "Local Vector RAG  ·  0.3% err", "VECTOR DB"),
    (3, "sarvam.png",    1.02, 0.48, "Sarvam Bulbul v3", "Neural Indic speech synthesis", "11 Indian languages  ·  API", "INDIC TTS"),
]

CARD_H = 0.76
ROW_GAP = 0.08
ROW_Y = [1.52 + r * (CARD_H + ROW_GAP) for r in range(5)]
col_counters = [0, 0, 0, 0]

for c_idx, logo_file, lw, lh, name, role, stat, b_lbl in tech_items:
    cx = COL_X[c_idx]
    r_idx = col_counters[c_idx]
    ty = ROW_Y[r_idx]
    col_counters[c_idx] += 1

    # Card background
    shape(s, RR, cx, ty, COL_W, CARD_H, CARD_BG, border=CARD_BORDER, bpt=0.8)
    # White left indicator strip
    shape(s, RECT, cx, ty + 0.10, 0.035, CARD_H - 0.20, WHITE)

    # Logo vertically centered on left
    lp = L(logo_file)
    if os.path.exists(lp):
        logo_y = ty + (CARD_H - lh) / 2.0
        s.shapes.add_picture(lp, Inches(cx + 0.12), Inches(logo_y), Inches(lw), Inches(lh))

    nx = cx + lw + 0.24
    avail_w = COL_W - lw - 0.36

    # Tech Name
    tb(s, nx, ty + 0.06, avail_w - 0.95, 0.25, [(name, 9.8, True, TEXT_WHITE, 0)])
    # Badge
    badge(s, cx + COL_W - 0.96, ty + 0.06, 0.88, 0.20, b_lbl, bg=WHITE, fg=PURE_BLACK, sz=6.8)
    # Role description
    tb(s, nx, ty + 0.32, avail_w, 0.20, [(role, 7.5, False, TEXT_MUTED, 0)])
    # Stat spec
    tb(s, nx, ty + 0.52, avail_w, 0.20, [(stat, 7.2, True, TEXT_WHITE, 0)])

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 2: END-TO-END STUDENT WORKFLOW PIPELINE
# ═════════════════════════════════════════════════════════════════════════════
WF_Y = 5.92
shape(s, RECT, 0.50, WF_Y, 19.0, 0.025, WHITE)

tb(s, 0.50, WF_Y + 0.08, 6.0, 0.35, [
    ("END-TO-END EXECUTION WORKFLOW", 12.5, True, WHITE, 0)
])
tb(s, 6.20, WF_Y + 0.12, 13.3, 0.30, [
    ("Complete execution trace: Every user session flows across all 4 architectural tiers (<50ms UI → QPU/GPU → AI reasoning → Indic voice)",
     8.8, False, TEXT_MUTED, 0)
])

# 7 Step Cards symmetrically distributed
# Total width: 19.0 in. 7 cards + 6 arrows.
STEP_W = 2.30
NUM_STEPS = 7
TOTAL_CARDS_W = NUM_STEPS * STEP_W  # 16.10
ARROW_SPACE = 19.0 - TOTAL_CARDS_W  # 2.90
ARROW_GAP = ARROW_SPACE / (NUM_STEPS - 1)  # ~0.483 in
STEP_H = 2.85
STEP_Y = WF_Y + 0.46

steps_data = [
    # (num, pill_lbl, title, bullets, logo, lw, latency)
    ("01", "AUTH & PROFILE", "Student Login",
     ["Google & College SSO", "RBAC & Role tracking", "Cloud progress store"],
     "firebase.png", 0.70, "<180ms SSO"),

    ("02", "CIRCUIT CANVAS", "Build Circuit",
     ["Drag & drop gates", "KaTeX Dirac preview", "1-to-16 qubit grid"],
     "react.png", 0.70, "<50ms Render"),

    ("03", "AST & NORMALISE", "Validate & Transpile",
     ["OpenQASM 3.0 AST parse", "qBraid intermediate rep", "Syntax & bounds check"],
     "fastapi.png", 0.68, "<8ms Validation"),

    ("04", "QPU / GPU RUN", "Quantum Execution",
     ["IBM 156Q Heron QPU", "NVIDIA cuQuantum GPU", "Multi-backend router"],
     "ibm.png", 0.80, "<15ms GPU / QPU"),

    ("05", "3D VISUALISE", "Bloch Sphere Sync",
     ["Three.js 60 FPS WebGL", "Statevector (θ, φ) map", "Interactive phase rotation"],
     "threejs.png", 0.70, "60 FPS 3D"),

    ("06", "AI PEDAGOGY", "Ask AI Tutor",
     ["Groq LPU ultra-fast", "76 textbook ChromaDB RAG", "0.3% hallucination rate"],
     "groq.png", 0.70, "500+ tok/sec"),

    ("07", "MULTILINGUAL", "Hear in Native Voice",
     ["Sarvam Bulbul v3 TTS", "11 Indian languages", "Preserved quantum math"],
     "sarvam.png", 0.90, "Real-time TTS"),
]

for i, (num, pill_lbl, stitle, bullets, logo_f, lw, lat) in enumerate(steps_data):
    sx = MARGIN_L + i * (STEP_W + ARROW_GAP)

    # Step Box
    shape(s, RR, sx, STEP_Y, STEP_W, STEP_H, CARD_BG, border=CARD_BORDER, bpt=1.0)
    # White top highlight strip
    shape(s, RECT, sx + 0.20, STEP_Y, STEP_W - 0.40, 0.03, WHITE)

    # Step Number Pill (top-left)
    shape(s, RR, sx + 0.10, STEP_Y + 0.10, 0.44, 0.24, WHITE)
    tb(s, sx + 0.10, STEP_Y + 0.11, 0.44, 0.22, [(num, 8.5, True, PURE_BLACK, 0)], align=PP_ALIGN.CENTER)

    # Logo (top-right)
    lp = L(logo_f)
    if os.path.exists(lp):
        s.shapes.add_picture(lp, Inches(sx + STEP_W - lw - 0.10), Inches(STEP_Y + 0.10), Inches(lw), Inches(0.40))

    # Phase Badge
    badge(s, sx + 0.10, STEP_Y + 0.48, STEP_W - 0.20, 0.22, pill_lbl, bg=PILL_BG, fg=TEXT_MUTED, sz=6.5)

    # Step Title
    tb(s, sx + 0.08, STEP_Y + 0.78, STEP_W - 0.16, 0.32, [(stitle, 10.0, True, WHITE, 0)], align=PP_ALIGN.CENTER)

    # Bullets
    bl_text = "\n".join(f"•  {b}" for b in bullets)
    tb(s, sx + 0.10, STEP_Y + 1.18, STEP_W - 0.20, 1.15, [(bl_text, 7.6, False, TEXT_WHITE, 1)], align=PP_ALIGN.LEFT)

    # Latency / SLA Tag (bottom pill)
    shape(s, RR, sx + 0.12, STEP_Y + STEP_H - 0.36, STEP_W - 0.24, 0.24, PURE_BLACK, border=WHITE, bpt=0.8)
    tb(s, sx + 0.12, STEP_Y + STEP_H - 0.34, STEP_W - 0.24, 0.20, [(lat, 7.2, True, WHITE, 0)], align=PP_ALIGN.CENTER)

    # Real Right Arrow Connector between boxes
    if i < NUM_STEPS - 1:
        arr_x = sx + STEP_W + 0.04
        arr_y = STEP_Y + STEP_H / 2.0 - 0.12
        arr_w = ARROW_GAP - 0.08
        arr_h = 0.24
        shape(s, ARROW, arr_x, arr_y, arr_w, arr_h, WHITE)

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 3: BOTTOM SUMMARY / ARCHITECTURE METRICS STRIP
# ═════════════════════════════════════════════════════════════════════════════
BOT_Y = 9.58
shape(s, RECT, 0, BOT_Y, 20.0, 0.03, WHITE)
shape(s, RECT, 0, BOT_Y + 0.03, 20.0, 11.25 - (BOT_Y + 0.03), RGBColor(16, 16, 18))

summary_cols = [
    ("14 Technologies", "100% open-source & enterprise cloud stack with zero proprietary lock-in", 0.50, 4.50),
    ("3-Layer Hybrid Architecture", "Browser WASM (Edge) → FastAPI Cluster → Cloud QPU & cuQuantum GPU", 5.35, 4.50),
    ("Sub-Second Latency Pipeline", "<8ms AST validation → <50ms UI render → 500+ tok/s LPU AI inference", 10.20, 4.50),
    ("NEP 2020 & NQM Ready", "11 Indian languages via Sarvam AI, bridging Tier-2/3 national quantum divide", 15.05, 4.45),
]

for title, desc, x, w in summary_cols:
    tb(s, x, BOT_Y + 0.20, w, 0.35, [(title, 14.5, True, WHITE, 1)], align=PP_ALIGN.LEFT)
    tb(s, x, BOT_Y + 0.58, w, 0.80, [(desc, 8.5, False, TEXT_MUTED, 0)], align=PP_ALIGN.LEFT)

# ── Save Presentation ────────────────────────────────────────────────────────
prs.save(BW_FILE)
prs.save(DESKTOP)
print(f"\nSUCCESS: Built Slide 7 (Tech Stack + Workflow) at {DESKTOP}")
