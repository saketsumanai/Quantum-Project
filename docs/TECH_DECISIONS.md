# Architecture Decision Records (ADRs)
## AI-Powered Interactive Quantum Algorithm Learning Platform (SIH 2026)

---

## ADR 01: Simulation Engine Selection — Qiskit 1.0+ as Primary with Multi-Framework Adapters

### Context
The platform must simulate quantum circuits accurately and demonstrate multi-framework capability as per SIH Deliverable 3. The team evaluated **Qiskit**, **Cirq**, **PennyLane**, and custom NumPy statevector math.

### Decision
* **Primary Engine**: **Qiskit 1.0+** utilizing `qiskit-aer`'s `AerSimulator`.
* **Secondary Adapters**: **PennyLane** (for variational algorithms / VQE) and **Cirq** (for Google Quantum AI syntax interoperability).
* **Internal Representation**: A vendor-agnostic Circuit Intermediate Representation (CIR) JSON schema.

### Rationale
* **Industry Standard**: Qiskit is by far the most widely adopted open-source quantum SDK globally and within Indian academic institutions.
* **Modern Architecture**: Qiskit 1.0 provides significant performance optimizations, smaller dependency footprints, and stable C++ Aer simulation backends.
* **Educational Depth**: Supporting PennyLane allows us to teach quantum machine learning and variational optimization (VQE/QAOA) which Qiskit handles more verbosely.

---

## ADR 02: Backend Framework — FastAPI over Django / Flask

### Context
The backend must handle concurrent simulation requests, async streaming AI responses, and provide strict API contract validation.

### Decision
Adopt **FastAPI** (Python 3.11+) with **Uvicorn** ASGI server.

### Rationale
* **Async Native**: Ideal for handling non-blocking simulation execution and potential streaming RAG responses.
* **Automatic OpenAPI / Swagger Documentation**: Generates interactive Swagger docs at `/docs` automatically from Pydantic schemas, enabling Member 1 (Frontend) to build immediately without blocking on backend completion.
* **Type Safety**: Pydantic v2 guarantees compile-time and runtime payload verification.
* **Low Overhead**: Significantly faster and lighter than Django, with none of Django's unnecessary ORM/admin bloat for a hackathon timeline.

---

## ADR 03: Frontend Architecture — React + Vite over Next.js SSR

### Context
The frontend needs to render an interactive drag-and-drop circuit canvas, Three.js 3D Bloch Sphere, and dynamic charts.

### Decision
Adopt **React 18** with **Vite** as the build tool, deployed as a Single Page Application (SPA).

### Rationale
* **Development Speed**: Vite provides instantaneous Hot Module Replacement (HMR) and sub-second build times compared to Next.js Webpack.
* **Client-Heavy Interactive Nature**: The quantum circuit designer and Three.js 3D canvas require client-side `window` and WebGL context. Server-Side Rendering (SSR) in Next.js introduces hydration mismatches and unnecessary complexity for 3D graphics.
* **Zero-Configuration Static Serving**: An SPA can be built into a static `dist/` directory and served by Nginx or FastAPI directly during the offline hackathon demo.

---

## 4. ADR 04: 3D Visualization — Three.js over 2D SVG or Pure CSS

### Context
SIH Deliverable 4 mandates state visualization including the single-qubit Bloch Sphere.

### Decision
Implement the Bloch Sphere using **Three.js** (via React Three Fiber or direct canvas lifecycle).

### Rationale
* **Geometric Accuracy**: Quantum superposition is inherently spherical $(\theta, \phi)$. 2D projections fail to intuitively convey phase rotations around the $Z$-axis (such as the $S$ or $T$ gates).
* **Interactive Exploration**: Students can click and rotate the sphere from any angle, visually understanding how gates act as physical rotations in Hilbert space.
* **Judging "Wow" Factor**: A fluid, hardware-accelerated 3D sphere immediately establishes technical sophistication during a 3-minute hackathon pitch.

---

## ADR 05: Database & Persistence — SQLite Local with PostgreSQL Dual-Compatibility

### Context
The platform needs to store user accounts, custom circuits, and quiz telemetry. The team evaluated MongoDB, PostgreSQL, and SQLite.

### Decision
Use **SQLite** as the default local development and hackathon database, while maintaining strict **PostgreSQL** compatibility via SQLAlchemy ORM.

### Rationale
* **Zero Dependency Demo**: Venue Wi-Fi or cloud connection issues can prevent connection to remote databases (Supabase, AWS RDS). SQLite requires zero external services and guarantees 100% demo uptime.
* **Zero Data Loss**: In a hackathon, running a separate database container introduces another potential point of failure.
* **Seamless Scalability**: Because models are written in standard SQLAlchemy ORM, switching to production PostgreSQL simply requires updating `DATABASE_URL` in `.env`.

---

## ADR 06: AI & RAG Strategy — CPU-Friendly Local Sentence-Transformers with Deterministic Fallback

### Context
SIH Deliverable 1 requires an AI tutor. Reliance on external cloud LLM APIs (OpenAI, Gemini) during a hackathon introduces latency, rate limits, and failure risks if venue internet drops.

### Decision
1. Local lightweight embedding model: `all-MiniLM-L6-v2` running on CPU.
2. Local vector database: Embedded ChromaDB.
3. Hybrid LLM Gateway: Connects to Groq/Gemini when online, but automatically falls back to **pre-compiled deterministic JSON vectors** for all core demo topics if the external API is unreachable.

### Rationale
* **Zero Cloud Latency**: Local CPU embeddings run in $<50$ ms.
* **Failsafe Guarantee**: The team will never face a broken demo due to "API quota exceeded" or "Network timeout" during live judging.
