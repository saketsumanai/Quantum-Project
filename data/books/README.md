# 📚 Quantum Computing Knowledge Base & Full Textbook Library
## SIH 2026 Educational AI RAG Training & Mathematical Research Corpus

This repository directory contains the comprehensive **150-Source Quantum Computing Knowledge Base** structured for local vector database embeddings (ChromaDB), automated prompt grounding, and mathematical verification for the AI Quantum Tutor.

---

## 📖 Major Complete Original Textbooks & Monographs Downloaded (`data/books/`)

| Textbook / Monograph Title | Author(s) | Pages | File Size | Core Coverage |
| :--- | :--- | :---: | :---: | :--- |
| **Introduction to Classical and Quantum Computing** | **Thomas G. Wong** | **400 pages** | **16 MB** | Comprehensive modern textbook: Qubits, Gates, Bell States, Deutsch-Jozsa, Grover, Shor, Qiskit code |
| **Quantum Information Theory** | **Mark M. Wilde** | **750 pages** | **8.4 MB** | Cambridge University Press classic: Density matrices, Von Neumann entropy, Quantum channels, Entanglement |
| **Supervised Learning with Quantum Computers** | **Maria Schuld & Francesco Petruccione** | **300 pages** | **8.3 MB** | Quantum Machine Learning (QML), Quantum kernels, Parameterized circuits, Quantum feature spaces |
| **The Theory of Quantum Information** | **John Watrous** | **420 pages** | **2.3 MB** | Cambridge University Press: Mathematical foundations, POVMs, Superoperators, Quantum complexity |
| **Lecture Notes on Quantum Algorithms** | **Andrew M. Childs** | **191 pages** | **1.4 MB** | University of Maryland textbook: Quantum Walks, HHL algorithm, Grover search, Hamiltonian simulation |
| **Quantum Computing: Lecture Notes** | **Ronald de Wolf** | **160 pages** | **1.4 MB** | CWI / University of Amsterdam: Qubit mechanics, Circuit complexity, Shor factoring, Error correction |
| **Noisy Intermediate-Scale Quantum (NISQ) Algorithms** | **Kishore Bharti et al.** | **100+ pages** | **3.3 MB** | Reviews of Modern Physics: Complete VQE, QAOA, Quantum chemistry, Barren Plateaus, Error mitigation |
| **Fault-Tolerant Quantum Computation with Surface Codes** | **Austin G. Fowler et al.** | **100+ pages** | **2.4 MB** | Definitive guide to Surface Codes, 2D lattice geometry, Defect braiding, Stabilizers, Syndrome extraction |
| **Variational Quantum Algorithms** | **M. Cerezo, P. J. Coles et al.** | **80+ pages** | **6.1 MB** | Nature Reviews Physics: Optimization landscapes, Cost functions, Ansatz design, Hybrid execution |
| **Superconducting Qubits: Current State of Play** | **Morten Kjaergaard et al.** | **75+ pages** | **4.1 MB** | Physical hardware: Transmons, Josephson junctions, Microwave control, Coherence times ($T_1, T_2$) |
| **Total Downloaded Volume** | **Seminal Authors** | **> 2,500 pages** | **~55 MB** | **All 10 Core Quantum Domains** |

---

## 🏛️ Domain Distribution Matrix (150 Cataloged Sources)

The complete index of all 150 textbooks, seminal papers, and course notes is cataloged in [`quantum_library_150.json`](./quantum_library_150.json):

1. **Quantum Mechanics & Linear Algebra for QC** (15 sources): Hilbert spaces, Dirac notation ($\lvert \psi \rangle$, $\langle \phi \rvert$), Unitary operators, Density matrices
2. **Qubit States, Superposition & Bloch Sphere** (15 sources): Single-qubit state space, Bloch vector geometry $(\theta, \phi)$, Geometric phase, State tomography
3. **Quantum Gates & Circuit Theory** (15 sources): Universal gate sets ($H, X, Y, Z, S, T, CX$), Solovay-Kitaev theorem, Toffoli/Fredkin gates, OpenQASM 3.0
4. **Entanglement & Non-Locality** (15 sources): Bell states ($\lvert \Phi^+ \rangle$), GHZ states, CHSH inequalities, Quantum Teleportation, Superdense Coding
5. **Oracle & Algebraic Algorithms** (15 sources): **Deutsch-Jozsa**, Bernstein-Vazirani, Simon's Algorithm, HHL linear solver
6. **Quantum Search & Amplitude Amplification** (15 sources): **Grover's Algorithm**, Diffusion operator ($2\lvert s \rangle\langle s \rvert - I$), Fixed-point search, Quantum Random Walks
7. **Quantum Fourier Transform & Factoring** (15 sources): **QFT**, Quantum Phase Estimation (QPE), **Shor's Factoring Algorithm**, Modular exponentiation
8. **NISQ & Variational Quantum Algorithms** (15 sources): **VQE** (molecular ground states), **QAOA** (MaxCut), Parameterized circuits, Barren Plateaus
9. **Quantum Error Correction & Fault Tolerance** (15 sources): Shor 9-qubit code, Steane 7-qubit code, **Surface Codes**, Toric code, Stabilizer formalism
10. **Quantum Cryptography & Hardware Architectures** (15 sources): **BB84 protocol**, E91 protocol, No-Cloning theorem, Superconducting Transmons, Trapped Ions

---

## 🤖 AI Ingestion & RAG Pipeline
* **Text Extraction**: Uses `pypdf` / `pdfplumber` to extract pure text from the downloaded books.
* **Vector Chunking**: 500-token chunks with 50-token overlap, preserving LaTeX mathematical equations.
* **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` locally on CPU.
* **Vector Storage**: Ingested directly into local ChromaDB for sub-millisecond retrieval by the AI Quantum Tutor.
