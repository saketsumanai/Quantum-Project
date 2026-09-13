#!/bin/bash
# ==============================================================================
# QuantumForge Platform Startup Script - SIH 2026
# Launches FastAPI Backend (port 8000) and Vite React Frontend (port 5173)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================================"
echo "🚀 Starting QuantumForge AI Learning Platform (Team Gitwolves)"
echo "======================================================================"

# 1. Activate Python virtual environment
if [ -d ".venv" ]; then
    echo "📦 Activating Python Virtual Environment..."
    source .venv/bin/activate
else
    echo "❌ Error: Virtual environment .venv not found. Run python3 -m venv .venv"
    exit 1
fi

# 2. Check environment file
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
fi

# 3. Start Backend
echo "⚡ Starting FastAPI Simulation & AI Backend on http://localhost:8000..."
PYTHONPATH=. ./.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap signals to cleanly shutdown both servers on Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down QuantumForge services..."
    kill -9 $BACKEND_PID 2>/dev/null || true
    kill -9 $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Give backend a moment to boot
sleep 2

# 4. Start Frontend
echo "✨ Starting Vite React Web Interface on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "======================================================================"
echo "🎉 QuantumForge Platform is LIVE!"
echo "👉 Frontend Interface: http://localhost:5173"
echo "👉 Backend API Docs:   http://localhost:8000/docs"
echo "👉 Virtual QPU Engine: Active (16 Qubits Max)"
echo "Press Ctrl+C to stop all servers."
echo "======================================================================"

wait
