# 📚 Quantum Computing Knowledge Base & Reference Library (150 Sources)
## SIH 2026 Educational AI RAG Training & Mathematical Research Corpus

This repository directory contains the comprehensive **150-Source Quantum Computing Knowledge Base** structured for local vector database embeddings (ChromaDB), automated prompt grounding, and mathematical verification for the AI Quantum Tutor.

The full structured dataset is cataloged in [`quantum_library_150.json`](./quantum_library_150.json) containing **exactly 150 foundational textbooks, seminal research papers, and technical lecture series** across 10 specialized domains (15 sources per domain).

---

## 🏛️ Domain Distribution Matrix (150 Sources)

| Category | Count | Primary Focus & Core Concepts |
| :--- | :---: | :--- |
| **1. Quantum Mechanics & Linear Algebra for QC** | 15 | Hilbert spaces, Dirac notation ($\lvert \psi \rangle$, $\langle \phi \rvert$), Unitary operators, Spectral decomposition, Density matrices |
| **2. Qubit States, Superposition & Bloch Sphere** | 15 | Single-qubit state space, Bloch vector geometry $(\theta, \phi)$, Geometric phase, State tomography, Coherence |
| **3. Quantum Gates & Circuit Theory** | 15 | Universal gate sets ($H, X, Y, Z, S, T, CX$), Solovay-Kitaev theorem, Toffoli/Fredkin gates, OpenQASM 3.0, Clifford synthesis |
| **4. Entanglement & Non-Locality** | 15 | Bell states ($\lvert \Phi^+ \rangle$), GHZ states, CHSH inequalities, Quantum Teleportation, Superdense Coding, Concurrence |
| **5. Oracle & Algebraic Algorithms** | 15 | **Deutsch-Jozsa**, Bernstein-Vazirani, Simon's Algorithm, HHL linear solver, Hidden Subgroup Problem |
| **6. Quantum Search & Amplitude Amplification** | 15 | **Grover's Algorithm**, Diffusion operator ($2\lvert s \rangle\langle s \rvert - I$), Fixed-point search, Quantum Random Walks |
| **7. Quantum Fourier Transform & Factoring** | 15 | **QFT**, Quantum Phase Estimation (QPE), **Shor's Factoring Algorithm**, Modular exponentiation circuits, Draper adder |
| **8. NISQ & Variational Quantum Algorithms** | 15 | **VQE** (molecular ground states), **QAOA** (MaxCut), Parameterized circuits, Barren Plateaus, Zero-Noise Extrapolation |
| **9. Quantum Error Correction & Fault Tolerance** | 15 | Shor 9-qubit code, Steane 7-qubit code, **Surface Codes**, Toric code, Stabilizer formalism, Magic State Distillation |
| **10. Quantum Cryptography & Hardware Architectures** | 15 | **BB84 protocol**, E91 protocol, No-Cloning theorem, Superconducting Transmons, Trapped Ions, Rydberg Atoms |

---

## 📁 Downloaded Seminal PDF References (`data/books/`)
The primary open-access seminal papers and full lecture notes are saved directly in this directory for offline reference:
1. `Quantum_Computing_Lecture_Notes_Ronald_de_Wolf.pdf` (Ronald de Wolf — Complete 160-page curriculum)
2. `Quantum_Algorithms_Overview_Ashley_Montanaro.pdf` (Ashley Montanaro — Comprehensive algorithmic survey)
3. `Variational_Quantum_Algorithms_VQE_QAOA_Cerezo_et_al.pdf` (M. Cerezo et al. — Nature Reviews Physics VQE/QAOA review)
4. `A_Fast_Quantum_Mechanical_Algorithm_for_Database_S.pdf` (Lov K. Grover — Original Grover search paper)
5. `A_Variational_Eigenvalue_Solver_on_a_Photonic_Quan.pdf` (A. Peruzzo et al. — Original VQE demonstration paper)
6. `Quantum_Approximate_Optimization_Algorithm__QAOA_.pdf` (Edward Farhi et al. — Original QAOA paper)
7. `Polynomial_Time_Algorithms_for_Prime_Factorization.pdf` (Peter W. Shor — Original Shor factoring paper)
8. `Quantum_Fourier_Transform_and_its_Applications.pdf` (L. Hales & U. Vazirani — QFT analysis)
9. `Fault_Tolerant_Quantum_Computation_with_Surface_Co.pdf` (Austin G. Fowler et al. — Surface code guide)
10. `Quantum_Error_Correction_for_Beginners.pdf` (Simon J. Devitt et al. — QEC introductory guide)
11. `Superconducting_Qubits__Current_State_of_Play.pdf` (Morten Kjaergaard et al. — Hardware Transmon review)
12. `Barren_Plateaus_in_Quantum_Neural_Network_Training.pdf` (J. R. McClean et al. — Variational gradient analysis)
13. `Quantum_Computing_in_the_NISQ_era_and_beyond.pdf` (John Preskill — Foundational NISQ paradigm)

---

## 🚀 How the AI Pipeline Uses This Library
1. **Catalog Ingestion**: `scripts/fetch_quantum_corpus.py` parses `quantum_library_150.json`.
2. **Chunking & Vectorization**: Extracted text vectors and mathematical formulas are split into 500-token chunks with 50-token overlap.
3. **Local Vector Search**: Embedded into ChromaDB via `all-MiniLM-L6-v2` for low-latency, zero-cost semantic retrieval by the AI Quantum Tutor.
