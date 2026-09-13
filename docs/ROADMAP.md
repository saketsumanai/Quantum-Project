# Development Roadmap & Execution Schedule
## AI-Powered Interactive Quantum Algorithm Learning Platform (SIH 2026)

---

## 1. Roadmap Principles & Methodology

To ensure all 5 team members execute in parallel without merge conflicts, blocking dependencies, or hackathon crunch failures, the development timeline is structured across **8 sequential, dependency-aware phases**.

```mermaid
gantt
    title SIH 2026 Quantum Learning Platform Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 0: Audit & Baseline
    Repo Audit & Tech Setup        :done, p0, 2026-09-14, 1d
    section Phase 1: Contracts
    API Contracts & Mock Server    :active, p1, 2026-09-15, 1d
    section Phase 2: Foundation
    Scaffolding & DB Models        :p2, 2026-09-16, 2d
    section Phase 3: Parallel Dev
    Frontend Circuit Builder       :p3a, 2026-09-18, 4d
    Quantum Simulation Engines     :p3b, 2026-09-18, 4d
    RAG & AI Educational Engine    :p3c, 2026-09-18, 4d
    3D Bloch & Assessment Engine   :p3d, 2026-09-18, 4d
    section Phase 4: Integration
    End-to-End Integration         :p4, 2026-09-22, 2d
    section Phase 5: Hardening
    Testing & Anti-RCE Security    :p5, 2026-09-24, 2d
    section Phase 6: Demo Polish
    SIH 3-5 Min Demo & Failsafe    :p6, 2026-09-26, 1d
    section Phase 7: Release
    Final Release & Tagging        :p7, 2026-09-27, 1d
```

---

## 2. Phase-by-Phase Breakdown

### Phase 0: Repository Audit & Baseline Setup (Day 1)
* **Objective**: Audit existing files, establish environment standards, lock dependencies, configure team repository access.
* **Duration**: 1 Day
* **Member Assignments**:
  * **Lead / Member 5 (Saket Suman)**: Git branch structure, `.gitignore`, `.env.example`, Docker setup, base issue templates.
  * **All Members**: Local environment verification (Node.js 20+, Python 3.10+, Docker), clone repository, configure git remotes.
* **Expected Output**: Clean baseline repository with complete documentation, branch protection, and shared conventions.
* **Acceptance Criteria**:
  - `git clone` works seamlessly for all 5 team members.
  - No secret keys or build artifacts committed.
  - Dedicated branches initialized.
* **Git Branch**: `docs/project-roadmap` $\rightarrow$ merged to `main` and `develop`.

---

### Phase 1: Architecture, API Contracts & Mock Gateway (Day 2)
* **Objective**: Define concrete OpenAPI specifications and spin up a lightweight mock server so the frontend team can build UI components immediately without waiting for quantum or AI backend logic.
* **Duration**: 1 Day
* **Member Assignments**:
  * **Member 5 (Saket Suman)**: Initialize FastAPI skeleton, configure CORS, implement mock endpoints returning sample circuit simulation results and sample AI tutor responses.
  * **Member 1 (Prateek Raj)**: Scaffold Vite + React + Tailwind frontend, set up Axios client pointing to mock endpoints.
  * **Member 2 (Jayesh Kapoor)**: Finalize Unified Circuit Intermediate Representation (CIR) schema for quantum circuits.
  * **Member 3 (Manas Thakur)**: Define structured JSON output schemas for RAG query and quiz generation.
  * **Member 4 (Apurva Sinha)**: Define telemetry and assessment data models.
* **Expected Output**: Runnable mock server at `http://localhost:8000/docs` with interactive Swagger UI.
* **Acceptance Criteria**:
  - Frontend makes test request to `/api/v1/simulation/run` and receives deterministic JSON payload.
  - All 5 team members sign off on API contracts.
* **Git Branch**: `feature/member-5-backend-devops`

---

### Phase 2: Foundational Scaffold & Core Pipeline (Days 3–4)
* **Objective**: Establish the database schema, user authentication, and basic visual layout.
* **Duration**: 2 Days
* **Member Assignments**:
  * **Member 5**: Implement SQLAlchemy models (Users, Circuits, Progress), JWT authentication endpoints (`/auth/register`, `/auth/login`), and SQLite session factory.
  * **Member 1**: Implement application shell, navigation bar, responsive layout, and authenticated route guards.
  * **Member 2**: Implement base quantum simulator abstraction and Qiskit 1.0+ Aer simulator wrapper.
  * **Member 3**: Ingest educational textbooks and set up local ChromaDB vector store.
  * **Member 4**: Implement Three.js canvas container and base Bloch Sphere mesh.
* **Expected Output**: Working login/signup, database persistence, and navigable app layout.
* **Acceptance Criteria**:
  - User can register, log in, and receive a signed JWT token.
  - Basic Bloch Sphere renders and rotates in the browser.
* **Git Branch**: `feature/*` branches merging into `develop`.

---

### Phase 3: Parallel Feature Development (Days 5–8)
* **Objective**: Core feature build-out across all 4 independent functional tracks.
* **Duration**: 4 Days
* **Member Assignments**:

#### Track 1: Member 1 (Frontend Lead) — Circuit Designer & UI
* Build drag-and-drop circuit canvas with multi-qubit support (up to 4 qubits).
* Add gate palette: $H$, $X$, $Y$, $Z$, $S$, $T$, $CX$ (CNOT), $CZ$, $SWAP$, Measurement.
* Real-time QASM / Python code exporter view.
* Connect circuit state to global Zustand store.

#### Track 2: Member 2 (Quantum Lead) — Multi-Engine Simulation
* Implement Qiskit Aer simulator for shot execution and statevector extraction.
* Implement PennyLane wrapper for variational algorithms (VQE, QAOA parameter updates).
* Implement Cirq adapter demonstrating multi-framework compilation.
* Build AST-based Python code validator (blocking forbidden imports).

#### Track 3: Member 3 (AI / RAG Lead) — Educational Intelligence
* Implement CPU-friendly embedding pipeline (`all-MiniLM-L6-v2`).
* Build hybrid retrieval pipeline (semantic search + keyword matching).
* Implement prompt template strictly enforcing 2-sentence voice summary, LaTeX equations, and runnable code.
* Pre-compute deterministic fallback responses for all core hackathon algorithms.

#### Track 4: Member 4 (Visualization & Assessment Lead) — State Vis & Quizzes
* Animate Bloch Sphere vector based on simulation angles $(\theta, \phi)$.
* Build interactive measurement histogram displaying shot distribution.
* Implement gamified quiz engine with instant validation and telemetry logging.
* Connect score recording to backend progress API.

* **Expected Output**: Four feature-complete modules ready for end-to-end wiring.
* **Acceptance Criteria**:
  - Dragging gates generates valid CIR JSON.
  - Backend executes CIR on Qiskit Aer and returns counts + statevector.
  - AI tutor responds with accurate quantum physics explanations and LaTeX math.
  - Quizzes score and submit correctly.
* **Git Branches**: `feature/member-1-frontend`, `feature/member-2-quantum`, `feature/member-3-ai-rag`, `feature/member-4-visualization-assessment`.

---

### Phase 4: System Integration & End-to-End Pipeline (Days 9–10)
* **Objective**: Connect frontend controls to real backend services and verify the complete user journey.
* **Duration**: 2 Days
* **Member Assignments**:
  * **Member 5 & 1**: Wire Circuit Designer to `/api/v1/simulation/run`.
  * **Member 4 & 2**: Pipe simulation statevector directly into Three.js Bloch Sphere and histogram charts.
  * **Member 3 & 1**: Embed AI Quantum Tutor drawer alongside the circuit canvas.
  * **Member 5 & 4**: Connect quiz completion to user dashboard telemetry.
* **Expected Output**: Unified, fully interactive application executing live quantum circuits and rendering visual feedback in real time.
* **Acceptance Criteria**:
  - Modifying a circuit updates the Bloch sphere and histogram in $<500$ ms.
  - AI tutor answers questions about the active circuit state.
* **Git Branch**: Integration on `develop`.

---

### Phase 5: Verification, Testing & Security Hardening (Days 11–12)
* **Objective**: Comprehensive test execution, anti-RCE security audit, and performance tuning.
* **Duration**: 2 Days
* **Member Assignments**:
  * **Member 2**: Write unit tests for quantum circuits (Bell state, Superposition, Grover) verifying theoretical probabilities.
  * **Member 5**: Conduct penetration testing against code execution endpoints (verify malicious scripts like `import os` are blocked).
  * **Member 3**: Validate AI response formatting and latency.
  * **Member 1 & 4**: Cross-browser testing (Chrome, Firefox, Safari, Edge) and responsive layout checks.
* **Expected Output**: Clean Pytest report (>80% core backend coverage), green security audit, zero uncaught browser console errors.
* **Acceptance Criteria**:
  - All automated tests pass in CI (`pytest tests/`).
  - AST sandbox successfully intercepts and rejects unauthorized imports.
* **Git Branch**: `develop`.

---

### Phase 6: SIH 3–5 Minute Demo Polish & Offline Failsafe (Day 13)
* **Objective**: Optimize the end-to-end judging flow, script the presentation, and verify offline fallback resilience.
* **Duration**: 1 Day
* **Member Assignments**:
  * **Member 5 & 3**: Populate `./data/cached_simulations/` with pre-computed outputs for all 5 demo algorithms.
  * **All Members**: Dry-run the 3–5 minute presentation with network disabled to verify offline mode.
  * **Member 1**: Add quick-load "Preset Circuits" (Bell State, Grover Search, Deutsch-Jozsa) for 1-click demonstration during judging.
* **Expected Output**: Failsafe-enabled application guaranteed to function flawlessly under adverse network conditions.
* **Acceptance Criteria**:
  - Full demo runs from start to finish with Wi-Fi disabled without throwing any error pop-ups.
* **Git Branch**: `develop` $\rightarrow$ Pull Request to `main`.

---

### Phase 7: Final Release & Submission Readiness (Day 14)
* **Objective**: Merge release into `main`, tag version `v1.0.0-sih`, finalize video demonstrations and README documentation.
* **Duration**: 1 Day
* **Member Assignments**:
  * **Member 5**: Merge `develop` to `main`, tag `v1.0.0-sih`, verify Docker container build.
  * **All Members**: Final review of submission guidelines, PDF slide deck alignment, and repo cleanup.
* **Expected Output**: Production-ready GitHub repository tagged at `v1.0.0-sih`.
