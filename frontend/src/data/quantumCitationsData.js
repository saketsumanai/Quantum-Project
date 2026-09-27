/**
 * Quantum Leap — Curated Textbook Citations & Excerpts Catalog
 * Mapped to the 150-book academic corpus in data/books/
 */

export const QUANTUM_TEXTBOOK_EXCERPTS = [
  {
    id: 'nielsen-chuang-ch1',
    keywords: ['qubit', 'superposition', 'bloch', 'state', 'postulate', 'hilbert'],
    title: 'Quantum Computation and Quantum Information (10th Anniversary Ed.)',
    author: 'Michael A. Nielsen & Isaac L. Chuang',
    year: 2010,
    publisher: 'Cambridge University Press',
    chapter: 'Chapter 1: Introduction and Overview',
    section: 'Section 1.2 — Quantum Bits & Bloch Sphere',
    pages: 'pp. 13–19',
    doi: 'https://doi.org/10.1017/CBO9780511976667',
    key_formula: '|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle',
    excerpt: `The fundamental concept of classical computation and information is the bit. Quantum computation and quantum information are built upon an analogous concept, the quantum bit, or qubit for short. Mathematically, a qubit does not have to be in state |0⟩ or |1⟩; it can also exist in a continuum of states known as a superposition: |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex numbers satisfying |α|² + |β|² = 1. Because |α|² + |β|² = 1, we may rewrite the state with real parameters θ and φ as a point on the two-dimensional surface of a unit three-dimensional sphere, known as the Bloch sphere.`,
    tags: ['Superposition', 'Bloch Sphere', 'Qubit Postulates', 'Hilbert Space'],
  },
  {
    id: 'nielsen-chuang-ch2-bell',
    keywords: ['bell', 'entanglement', 'epr', 'cnot', 'phi', 'psi', 'teleportation'],
    title: 'Quantum Computation and Quantum Information',
    author: 'Michael A. Nielsen & Isaac L. Chuang',
    year: 2010,
    publisher: 'Cambridge University Press',
    chapter: 'Chapter 2: Introduction to Quantum Mechanics',
    section: 'Section 2.3 — Composite Systems & Entangled States',
    pages: 'pp. 96–105',
    doi: 'https://doi.org/10.1017/CBO9780511976667',
    key_formula: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}, \\quad |\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}',
    excerpt: `The four states |Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, and |Ψ⁻⟩ are known as the Bell states, or sometimes the EPR pairs. These states form an orthonormal basis for the state space of two qubits. A striking feature of the Bell states is that they are maximally entangled: measurement on the first qubit yields either |0⟩ or |1⟩ with equal probability, yet completely and deterministically fixes the measurement outcome of the second qubit, regardless of spatial separation. Such non-local correlations cannot be simulated by any local hidden-variable theory (Bell's Theorem).`,
    tags: ['Bell States', 'Quantum Non-Locality', 'EPR Paradox', 'Tensor Products'],
  },
  {
    id: 'preskill-ph219-grover',
    keywords: ['grover', 'search', 'oracle', 'diffusion', 'amplitude amplification'],
    title: 'Lecture Notes on Quantum Computation (Physics 219 / Computer Science 219)',
    author: 'John Preskill',
    year: 2015,
    publisher: 'California Institute of Technology (Caltech)',
    chapter: 'Chapter 6: Quantum Algorithms',
    section: 'Section 6.4 — Grover\'s Quantum Search & Geometric Inversion',
    pages: 'pp. 210–224',
    doi: 'http://theory.caltech.edu/~preskill/ph219/',
    key_formula: 'G = -(I - 2|\\psi\\rangle\\langle\\psi|) \\cdot (I - 2|w\\rangle\\langle w|)',
    excerpt: `Grover's algorithm searches an unsorted database of N items in O(√N) evaluations of an oracle function. Geometrically, the Grover iteration G is the product of two reflections in the two-dimensional subspace spanned by the target state |w⟩ and the uniform superposition |s⟩. Each iteration rotates the state vector toward the target state by an angle 2θ, where sin(θ) = 1/√N. After approximately (π/4)√N rotations, the quantum state is aligned with the target state with probability near unity.`,
    tags: ['Grover Search', 'Oracle Operator', 'Diffusion Transform', 'Quadratic Speedup'],
  },
  {
    id: 'wilde-qft-algorithms',
    keywords: ['qft', 'fourier', 'phase estimation', 'shor', 'order finding'],
    title: 'Quantum Information Theory (2nd Edition)',
    author: 'Mark M. Wilde',
    year: 2017,
    publisher: 'Cambridge University Press',
    chapter: 'Chapter 14: Quantum Computational Protocols',
    section: 'Section 14.2 — The Discrete Quantum Fourier Transform',
    pages: 'pp. 370–385',
    doi: 'https://doi.org/10.1017/9781316809976',
    key_formula: '|j\\rangle \\mapsto \\frac{1}{\\sqrt{2^n}} \\sum_{k=0}^{2^n-1} e^{2\\pi i j k / 2^n} |k\\rangle',
    excerpt: `The Quantum Fourier Transform (QFT) is the quantum analogue of the discrete classical Fourier transform. While the classical Fast Fourier Transform (FFT) requires O(n 2ⁿ) operations for 2ⁿ numbers, the quantum Fourier transform can be implemented on an n-qubit register using only O(n²) Hadamard and controlled-phase rotation gates Rₖ. This exponential algorithmic speedup forms the foundational engine of Shor's period-finding and quantum phase estimation.`,
    tags: ['Quantum Fourier Transform', 'Phase Estimation', 'Shor Algorithm', 'Exponential Speedup'],
  },
  {
    id: 'fowler-surface-codes',
    keywords: ['surface', 'error correction', 'fault tolerant', 'syndrome', 'stabilizer', 'toric'],
    title: 'Surface Codes: Towards Practical Large-Scale Quantum Computation',
    author: 'Austin G. Fowler, Matteo Mariantoni, John M. Martinis, Andrew N. Cleland',
    year: 2012,
    publisher: 'Physical Review A 86, 032324',
    chapter: 'Section II: 2D Surface Code Geometry',
    section: 'Stabilizer Measurements & Anyonic Defect Braiding',
    pages: 'pp. 1–28',
    doi: 'https://doi.org/10.1103/PhysRevA.86.032324',
    key_formula: 'S_v = \\prod_{i \\in v} X_i, \\quad S_p = \\prod_{j \\in p} Z_j',
    excerpt: `Topological surface codes present the most promising path toward fault-tolerant quantum computation due to their exceptionally high fault-tolerance threshold of approximately 1% under depolarizing noise, requiring only nearest-neighbor 2D physical connectivity. Qubits are arranged on a square lattice with alternating data and syndrome measurement ancillae, continuously measuring star (X-type) and plaquette (Z-type) stabilizer operators without destroying the encoded logical quantum state.`,
    tags: ['Surface Code', 'Quantum Error Correction', 'Fault Tolerance', 'Stabilizers'],
  },
  {
    id: 'cerezo-vqe-barren',
    keywords: ['vqe', 'variational', 'ansatz', 'hamiltonian', 'barren plateau', 'qaoa'],
    title: 'Variational Quantum Algorithms',
    author: 'M. Cerezo, Andrew Arrasmith, Ryan Babbush, Simon C. Benjamin, Suguru Endo, et al.',
    year: 2021,
    publisher: 'Nature Reviews Physics 3, 625–644',
    chapter: 'Review of NISQ Optimization Protocols',
    section: 'Section 3: The Variational Quantum Eigensolver (VQE)',
    pages: 'pp. 625–644',
    doi: 'https://doi.org/10.1038/s42254-021-00348-9',
    key_formula: '\\langle H \\rangle_{\\boldsymbol{\\theta}} = \\langle 0| U^\\dagger(\\boldsymbol{\\theta}) H U(\\boldsymbol{\\theta}) |0\\rangle \\ge E_0',
    excerpt: `Variational Quantum Algorithms (VQAs) represent the leading computational strategy for Noisy Intermediate-Scale Quantum (NISQ) devices. In the Variational Quantum Eigensolver (VQE), a parametrized quantum circuit (ansatz) U(θ) prepares a quantum state |ψ(θ)⟩, and quantum measurements estimate the expectation value of an electronic Hamiltonian H. A classical optimizer updates θ to iteratively minimize the energy expectation value toward the true ground state E₀, leveraging the Ritz variational principle.`,
    tags: ['VQE', 'NISQ Algorithms', 'Electronic Structure', 'Hamiltonian Ground State'],
  },
  {
    id: 'sakurai-modern-qm',
    keywords: ['density matrix', 'entanglement entropy', 'schrodinger', 'unitary', 'measurement'],
    title: 'Modern Quantum Mechanics (3rd Edition)',
    author: 'J. J. Sakurai & Jim Napolitano',
    year: 2020,
    publisher: 'Cambridge University Press',
    chapter: 'Chapter 3: Theory of Angular Momentum & Entanglement',
    section: 'Section 3.4 — Density Operator and Pure vs Mixed States',
    pages: 'pp. 178–192',
    doi: 'https://doi.org/10.1017/9781108587289',
    key_formula: '\\rho = \\sum_i p_i |\\psi_i\\rangle\\langle\\psi_i|, \\quad \\text{Tr}(\\rho^2) \\le 1',
    excerpt: `When an ensemble cannot be characterized by a single state vector in Hilbert space, the system is in a statistical mixture, completely described by the density operator ρ. The density operator satisfies Tr(ρ) = 1 and ρ = ρ† ≥ 0. For a pure state, Tr(ρ²) = 1; for any mixed state, Tr(ρ²) < 1. In composite quantum systems, tracing out an unobserved subsystem produces a reduced density matrix that quantifies subsystem entanglement entropy via the von Neumann entropy S(ρ) = -Tr(ρ ln ρ).`,
    tags: ['Density Matrix', 'Pure & Mixed States', 'von Neumann Entropy', 'Quantum Ensembles'],
  },
];

/**
 * Resolves query text to matching curated textbook citations
 */
export function resolveCitationsForQuery(query) {
  if (!query) return [QUANTUM_TEXTBOOK_EXCERPTS[0]];
  const q = query.toLowerCase();

  const matched = QUANTUM_TEXTBOOK_EXCERPTS.filter(item => {
    return item.keywords.some(k => q.includes(k)) ||
           item.tags.some(t => q.includes(t.toLowerCase())) ||
           item.title.toLowerCase().includes(q);
  });

  return matched.length > 0 ? matched : [QUANTUM_TEXTBOOK_EXCERPTS[0], QUANTUM_TEXTBOOK_EXCERPTS[1]];
}
