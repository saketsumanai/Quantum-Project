# ⚛️ AI-Powered Interactive Quantum Algorithm Learning Platform
### Smart India Hackathon (SIH 2026) | Team: Gitwolves

An interactive, multi-framework educational web platform designed to bridge abstract quantum mechanics and practical quantum computing. Built strictly according to the Smart India Hackathon official delivery guidelines, the platform combines an intuitive visual circuit designer, real-time multi-framework simulation (Qiskit, PennyLane, Cirq), interactive 3D state visualization (Three.js Bloch Sphere), and an embedded AI Quantum Tutor powered by hybrid Retrieval-Augmented Generation (RAG).

---

## 👥 Engineering Team (Gitwolves)

| Member | GitHub Handle | Role & Ownership | Primary Focus Areas |
| :--- | :--- | :--- | :--- |
| **Saket Suman** (Lead) | [@saketsumanai](https://github.com/saketsumanai) | Senior Architect & DevOps Lead | FastAPI Core, DB Models, JWT Auth, Docker, CI/CD |
| **Prateek Raj** | [@prs-24](https://github.com/prs-24) | Frontend & Product UI Lead | React/Vite UI, Drag-Drop Circuit Designer, Code Export |
| **Jayesh Kapoor** | [@jayeshxgit](https://github.com/jayeshxgit) | Quantum Engine & Simulation Lead | Qiskit 1.0+ Aer, PennyLane, Cirq, AST Anti-RCE Sandbox |
| **Manas Thakur** | [@heremanasthakur](https://github.com/heremanasthakur) | AI, RAG & Educational Lead | Textbook RAG, ChromaDB, Voice Synthesis, Offline Fallback |
| **Apurva Sinha** | [@apurvafx](https://github.com/apurvafx) | Visualization & Assessment Lead | Three.js 3D Bloch Sphere, Histograms, Gamified Quizzes |

---

## 🚀 Key Deliverables & System Capabilities

1. **Learning Content & Curriculum Module**: Structured educational progression through 6 key domains: Qubits, Superposition, Entanglement, Deutsch-Jozsa, Grover's Algorithm, and Variational Quantum Eigensolver (VQE).
2. **Quantum Circuit Designer**: Multi-qubit visual drag-and-drop canvas supporting single-qubit ($H, X, Y, Z, S, T$) and multi-qubit ($CX, CZ, SWAP$) gates with synchronized live Qiskit Python and OpenQASM 2.0 code generation.
3. **Multi-Framework Simulation Engine**: Vendor-agnostic quantum abstraction layer executing circuits across **Qiskit Aer**, **PennyLane**, and **Google Cirq** in sub-50ms runtime.
4. **Quantum State & Result Visualization**: Interactive 3D Bloch Sphere rendered in Three.js with real-time vector rotations, complex statevector amplitudes, and measurement probability histograms.
5. **AI Quantum Tutor & RAG**: Context-aware educational assistant generating natural vocal prose, verified LaTeX equations ($\LaTeX$), runnable Qiskit code blocks, and dynamic comprehension quizzes.
6. **Failsafe Offline Demo Engine**: Fully self-contained local caching architecture enabling complete 5-minute live hackathon presentations even if the presentation laptop is entirely offline.

---

## 📚 Project Documentation Hub

Complete technical documentation is available in the [`docs/`](./docs/) directory:

* 🏛️ **[System Architecture](docs/ARCHITECTURE.md)**: High-level diagrams, layer-by-layer technical breakdown, security sandbox, and component topology.
* 🗺️ **[Development Roadmap](docs/ROADMAP.md)**: 8-phase execution roadmap detailing daily schedules, milestones, deliverables, and acceptance criteria.
* 👥 **[Team Execution Plan](docs/TEAM_PLAN.md)**: 5-member role division, folder ownership, and P0/P1/P2/P3 task breakdown matrix.
* 🔌 **[API Contracts](docs/API_CONTRACTS.md)**: Fully typed OpenAPI REST specifications for simulations, AI tutor, curriculum, and telemetry.
* 💾 **[Database Schema](docs/DATABASE_SCHEMA.md)**: Entity-Relationship Diagram (ERD), table definitions, and dual SQLite/PostgreSQL compatibility.
* 🌿 **[Git Workflow Protocol](docs/GIT_WORKFLOW.md)**: Branching rules, conventional commits, PR guidelines, and conflict resolution strategy.
* 🧪 **[Testing Strategy](docs/TESTING_STRATEGY.md)**: Quantum mathematical validation, AST anti-RCE tests, API integration tests, and QA benchmarks.
* 🐳 **[Deployment Guide](docs/DEPLOYMENT.md)**: Multi-stage Docker containerization and Docker Compose orchestration.
* ⏱️ **[SIH 3–5 Minute Demo Flow](docs/DEMO_FLOW.md)**: Minute-by-minute judging presentation script, visual click-through guide, and emergency failsafe checklist.
* ⚖️ **[Architecture Decisions (ADRs)](docs/TECH_DECISIONS.md)**: Technical rationale behind technology selections.
* 🤝 **[Contributing Guidelines](docs/CONTRIBUTING.md)**: Developer onboarding, virtual environment setup, and formatting guidelines.

---

## 🛠️ Quick Start (Local Run)

### Using Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/saketsumanai/Quantum-Project.git
cd Quantum-Project

# 2. Copy environment template
cp .env.example .env

# 3. Launch full stack via Docker
docker compose up --build -d

# 4. Open in browser:
# Frontend: http://localhost:3000
# Backend API Docs: http://localhost:8000/docs
```

### Manual Local Development
```bash
# Backend setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000

# Frontend setup (in a separate terminal)
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Code Sandbox
Arbitrary user-submitted Python code is **never executed directly on the host operating system**. Code submitted to the Code Editor passes through an AST (Abstract Syntax Tree) validator that intercepts and rejects unauthorized imports (`os`, `sys`, `subprocess`, `open`, `__import__`) before running within a sandboxed worker with strict timeout and memory ceilings.

---

## 📄 License
This project is developed for the Smart India Hackathon (SIH 2026) under the MIT License.
