# Quantum Computing Knowledge Base & Reference Library
## SIH 2026 Educational RAG Training & Curriculum Reference

This directory stores the primary reference textbooks and survey papers indexed into the platform's local vector database (ChromaDB) for the AI Quantum Tutor and curriculum validation.

---

## 📚 Indexed Reference Library

### 1. Quantum Computing: Lecture Notes
* **Author**: Ronald de Wolf (CWI & University of Amsterdam)
* **Format**: Open Access (arXiv:1907.09415)
* **File**: [`Quantum_Computing_Lecture_Notes_Ronald_de_Wolf.pdf`](./Quantum_Computing_Lecture_Notes_Ronald_de_Wolf.pdf)
* **Core Topics Covered**:
  - Chapter 1: Qubits, Superposition & Quantum States
  - Chapter 2: Quantum Gates, Circuit Model & Reversible Computation
  - Chapter 3: Deutsch-Jozsa Algorithm (Exact Quantum Speedup)
  - Chapter 4: Simon's Algorithm (Exponential Separation)
  - Chapter 5: Quantum Fourier Transform & Shor's Factoring
  - Chapter 6: Grover's Quantum Search Algorithm & Amplitude Amplification

### 2. Quantum Algorithms: An Overview
* **Author**: Ashley Montanaro (University of Bristol)
* **Format**: Open Access (arXiv:1511.04206)
* **File**: [`Quantum_Algorithms_Overview_Ashley_Montanaro.pdf`](./Quantum_Algorithms_Overview_Ashley_Montanaro.pdf)
* **Core Topics Covered**:
  - Comprehensive survey of quantum algorithms across algebraic problems, quantum search, and NISQ applications.

### 3. Variational Quantum Algorithms (VQA)
* **Authors**: M. Cerezo, A. Arrasmith, R. Babbush, S. C. Benjamin, S. Endo, K. Fujii, J. R. McClean, K. Mitarai, X. Yuan, L. Cincio, P. J. Coles (Nature Reviews Physics)
* **Format**: Open Access (arXiv:2012.09265)
* **File**: [`Variational_Quantum_Algorithms_VQE_QAOA_Cerezo_et_al.pdf`](./Variational_Quantum_Algorithms_VQE_QAOA_Cerezo_et_al.pdf)
* **Core Topics Covered**:
  - Variational Quantum Eigensolver (VQE) for molecular ground state estimation.
  - Quantum Approximate Optimization Algorithm (QAOA) for combinatorial graph optimization.
  - Parameterized quantum circuits and optimization landscapes.

---

## 🤖 RAG Ingestion Pipeline
Text vectors are extracted, chunked into 500-token windows with 50-token overlap, and embedded using `sentence-transformers/all-MiniLM-L6-v2` into the local ChromaDB vector store.
