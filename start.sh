#!/bin/bash
# ==============================================================================
# Quantum Leap Platform — Production-Ready Startup Script
# SIH 2026 · Team Gitwolves
# ==============================================================================

set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          ⚛  QUANTUM LEAP — SIH 2026 · Team Gitwolves  ⚛        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Virtual Environment ────────────────────────────────────────────────────
if [ -d ".venv" ]; then
    echo "📦 Activating Python Virtual Environment..."
    source .venv/bin/activate
else
    echo "❌ .venv not found. Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# ─── 2. Environment File ───────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env from .env.example..."
    cp .env.example .env
fi

# ─── 3. ChromaDB RAG Index Check ──────────────────────────────────────────────
VECTOR_STORE="./data/vector_store/quantum_books/chroma.sqlite3"
if [ ! -f "$VECTOR_STORE" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📚 ChromaDB vector store not found — starting RAG indexing..."
    echo "  This indexes 76 quantum textbooks/papers into ChromaDB."
    echo "  First run takes 8-15 minutes. Subsequent starts are instant."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    PYTHONPATH=. python3 scripts/build_rag_index.py
    echo "  ✅ RAG indexing complete!"
    echo ""
else
    echo "✅ ChromaDB vector store found — skipping indexing."
fi

# ─── 4. SQLite Database Init (auto on first backend start) ─────────────────────
echo "🗄️  SQLite database will initialize on backend startup..."

# ─── 5. Start Backend ─────────────────────────────────────────────────────────
echo "⚡ Starting FastAPI backend on http://localhost:8000..."
PYTHONPATH=. ./.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cleanup() {
    echo ""
    echo "🛑 Shutting down Quantum Leap services..."
    kill -9 $BACKEND_PID 2>/dev/null || true
    kill -9 $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Backend warmup
sleep 2

# ─── 6. Start Frontend ─────────────────────────────────────────────────────────
echo "✨ Starting React frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🚀  Quantum Leap Platform is LIVE!                            ║"
echo "║                                                                  ║"
echo "║  🌐 Frontend:  http://localhost:5173                           ║"
echo "║  📡 API Docs:  http://localhost:8000/docs                      ║"
echo "║  ⚛  QPU:      Virtual 16-Qubit Simulator (Active)             ║"
echo "║  🧠 AI Tutor: ChromaDB RAG + Groq Llama-3.1                   ║"
echo "║  🔐 Auth:     Firebase Google Sign-In                          ║"
echo "║  💾 DB:       SQLite (quantum_leap.db)                         ║"
echo "║                                                                  ║"
echo "║  Press Ctrl+C to stop all services.                            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

wait
