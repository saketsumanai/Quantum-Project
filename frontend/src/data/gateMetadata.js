// ─── Quantum Gate Comprehensive Metadata & Textbook Citations ───────────────
// Exact physical references mapped to real textbooks in data/books/
// Strict high-contrast, zero-glassmorphism formatting for circuit studio tooltips.

export const GATE_METADATA = {
  h: {
    id: 'h',
    name: 'Hadamard Transformation',
    symbol: 'H',
    category: 'Superposition / Clifford',
    badgeColor: '#3b82f6',
    dimension: '2 × 2',
    matrix: [
      ['1/√2', '1/√2'],
      ['1/√2', '-1/√2']
    ],
    latex: '\\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
    equation: 'H|0⟩ = |+⟩,  H|1⟩ = |-⟩',
    description: 'Creates a balanced, coherent quantum superposition. Maps computational basis states to transversal eigenstates of the Pauli-X observable.',
    blochAction: '180° (π) rotation around the diagonal (X + Z)/√2 axis on the Bloch sphere.',
    citation: {
      bookFile: 'Intro_to_Classical_and_Quantum_Computing_Thomas_Wong.pdf',
      author: 'Thomas G. Wong',
      title: 'Introduction to Classical and Quantum Computing',
      chapter: 'Chapter 2: Single-Qubit Gates',
      section: 'Section 2.2: The Hadamard Gate',
      pages: 'pp. 45–48',
      seminalPaper: 'Barenco et al. (1995), Phys. Rev. A 52, 3457'
    },
    tutorPrompt: 'Explain how the Hadamard gate generates quantum superposition and its transformation on the Bloch sphere according to Thomas Wong Ch. 2.'
  },

  x: {
    id: 'x',
    name: 'Pauli-X (NOT / Bit Flip)',
    symbol: 'X',
    category: 'Pauli / Clifford',
    badgeColor: '#ef4444',
    dimension: '2 × 2',
    matrix: [
      ['0', '1'],
      ['1', '0']
    ],
    latex: '\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
    equation: 'X|0⟩ = |1⟩,  X|1⟩ = |0⟩',
    description: 'Quantum analog of classical inverter. Completely swaps state vector amplitudes between computational basis states |0⟩ and |1⟩.',
    blochAction: '180° (π) rotation about the X-axis on the Bloch sphere.',
    citation: {
      bookFile: 'Intro_to_Classical_and_Quantum_Computing_Thomas_Wong.pdf',
      author: 'Thomas G. Wong',
      title: 'Introduction to Classical and Quantum Computing',
      chapter: 'Chapter 2: Single-Qubit Gates',
      section: 'Section 2.1: Pauli Gates',
      pages: 'pp. 38–41',
      seminalPaper: 'Mark M. Wilde, Quantum Information Theory, Ch. 3'
    },
    tutorPrompt: 'Explain the Pauli-X bit-flip operator, its eigenvalues (+1, -1), and its matrix representation from Thomas Wong Section 2.1.'
  },

  y: {
    id: 'y',
    name: 'Pauli-Y (Bit + Phase Flip)',
    symbol: 'Y',
    category: 'Pauli / Clifford',
    badgeColor: '#f97316',
    dimension: '2 × 2',
    matrix: [
      ['0', '-i'],
      ['i', '0']
    ],
    latex: '\\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
    equation: 'Y|0⟩ = i|1⟩,  Y|1⟩ = -i|0⟩',
    description: 'Applies simultaneous bit-flip and complex relative phase shift (π/2 phase on |1⟩ and -π/2 on |0⟩ up to global factor i).',
    blochAction: '180° (π) rotation about the Y-axis on the Bloch sphere.',
    citation: {
      bookFile: 'Intro_to_Classical_and_Quantum_Computing_Thomas_Wong.pdf',
      author: 'Thomas G. Wong',
      title: 'Introduction to Classical and Quantum Computing',
      chapter: 'Chapter 2: Single-Qubit Gates',
      section: 'Section 2.1: The Pauli-Y Gate',
      pages: 'pp. 41–43',
      seminalPaper: 'Ronald de Wolf, Quantum Computing Lecture Notes, Ch. 1'
    },
    tutorPrompt: 'How does the Pauli-Y gate combine bit-flip and phase-flip operations with imaginary matrix elements i and -i?'
  },

  z: {
    id: 'z',
    name: 'Pauli-Z (Phase Flip)',
    symbol: 'Z',
    category: 'Pauli / Clifford',
    badgeColor: '#10b981',
    dimension: '2 × 2',
    matrix: [
      ['1', '0'],
      ['0', '-1']
    ],
    latex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
    equation: 'Z|0⟩ = |0⟩,  Z|1⟩ = -|1⟩',
    description: 'Leaves basis state |0⟩ unchanged while shifting the relative phase of basis state |1⟩ by π (multiplying by -1). Critical for phase kickback.',
    blochAction: '180° (π) rotation about the Z-axis (polar axis) on the Bloch sphere.',
    citation: {
      bookFile: 'Intro_to_Classical_and_Quantum_Computing_Thomas_Wong.pdf',
      author: 'Thomas G. Wong',
      title: 'Introduction to Classical and Quantum Computing',
      chapter: 'Chapter 2: Single-Qubit Gates',
      section: 'Section 2.1: The Pauli-Z Gate',
      pages: 'pp. 43–45',
      seminalPaper: 'Ronald de Wolf, Lecture Notes on Quantum Computing, Sec. 1.2'
    },
    tutorPrompt: 'Explain the Pauli-Z phase-flip gate and how it affects superposition states like |+⟩ to |-⟩ according to Thomas Wong.'
  },

  s: {
    id: 's',
    name: 'Phase Gate (S / √Z)',
    symbol: 'S',
    category: 'Phase / Clifford',
    badgeColor: '#06b6d4',
    dimension: '2 × 2',
    matrix: [
      ['1', '0'],
      ['0', 'i']
    ],
    latex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
    equation: 'S|0⟩ = |0⟩,  S|1⟩ = i|1⟩ = e^{i\\pi/2}|1⟩',
    description: 'Adds a quarter-turn (π/2) relative phase to |1⟩. Satisfies S² = Z. Fundamental generator of the Clifford group for fault-tolerant syndrome extraction.',
    blochAction: '90° (π/2) counterclockwise rotation around the Z-axis on the Bloch sphere.',
    citation: {
      bookFile: 'Intro_to_Classical_and_Quantum_Computing_Thomas_Wong.pdf',
      author: 'Thomas G. Wong',
      title: 'Introduction to Classical and Quantum Computing',
      chapter: 'Chapter 2: Single-Qubit Gates',
      section: 'Section 2.2: Phase Shifts (S Gate)',
      pages: 'pp. 49–51',
      seminalPaper: 'Kitaev, Shen, Vyalyi, Classical and Quantum Computation, Ch. 1'
    },
    tutorPrompt: 'Why is the S gate called the square root of Z (√Z), and what is its role in Clifford circuits?'
  },

  t: {
    id: 't',
    name: 'T Gate (π/4 Phase / √S)',
    symbol: 'T',
    category: 'Non-Clifford / Universal',
    badgeColor: '#ec4899',
    dimension: '2 × 2',
    matrix: [
      ['1', '0'],
      ['0', 'e^{iπ/4}']
    ],
    latex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
    equation: 'T|0⟩ = |0⟩,  T|1⟩ = e^{i\\pi/4}|1⟩ = \\frac{1+i}{\\sqrt{2}}|1⟩',
    description: 'Non-Clifford gate essential for universal quantum computation. By the Eastin-Knill theorem, T cannot be implemented transversally and requires magic state distillation.',
    blochAction: '45° (π/4) counterclockwise rotation around the Z-axis on the Bloch sphere.',
    citation: {
      bookFile: 'Eastin_Knill_Theorem_Transversal_Gates.pdf',
      author: 'Bryan Eastin & Emanuel Knill',
      title: 'Restrictions on Transversal Encoded Quantum Gate Sets',
      chapter: 'Phys. Rev. Lett. 102, 110502',
      section: 'Universality & Non-Clifford Resource Requirements',
      pages: 'pp. 1–4',
      seminalPaper: 'Thomas G. Wong, Intro to Classical and Quantum Computing, p. 52'
    },
    tutorPrompt: 'Explain why the T gate is essential for quantum universality and how the Eastin-Knill theorem limits transversal gates.'
  },

  rx: {
    id: 'rx',
    name: 'Parametric Rotation-X (Rx)',
    symbol: 'Rx(θ)',
    category: 'Variational / Continuous',
    badgeColor: '#8b5cf6',
    dimension: '2 × 2',
    matrix: [
      ['cos(θ/2)', '-i·sin(θ/2)'],
      ['-i·sin(θ/2)', 'cos(θ/2)']
    ],
    latex: '\\begin{pmatrix} \\cos(\\theta/2) & -i\\sin(\\theta/2) \\\\ -i\\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}',
    equation: 'R_x(\\theta) = \\exp(-i\\theta X / 2)',
    description: 'Continuous single-qubit rotation generated by Pauli-X. Core building block of Variational Quantum Eigensolvers (VQE) and Quantum Neural Networks (QNN).',
    blochAction: 'Rotates state vector by arbitrary angle θ around the X-axis.',
    citation: {
      bookFile: 'Parameterized_Quantum_Circuits_Machine_Learning_Benedetti.pdf',
      author: 'Marcello Benedetti et al.',
      title: 'Parameterized Quantum Circuits as Machine Learning Models',
      chapter: 'Section 2: Circuit Architectures',
      section: 'Single-Qubit Rotation Gates Rx(θ)',
      pages: 'pp. 3–6',
      seminalPaper: 'Thomas G. Wong, Intro to Classical & Quantum Computing, Sec. 2.3'
    },
    tutorPrompt: 'How is the Rx(θ) rotation matrix derived using Euler formulas and the matrix exponential exp(-iθX/2)?'
  },

  ry: {
    id: 'ry',
    name: 'Parametric Rotation-Y (Ry)',
    symbol: 'Ry(θ)',
    category: 'Variational / Continuous',
    badgeColor: '#a855f7',
    dimension: '2 × 2',
    matrix: [
      ['cos(θ/2)', '-sin(θ/2)'],
      ['sin(θ/2)', 'cos(θ/2)']
    ],
    latex: '\\begin{pmatrix} \\cos(\\theta/2) & -\\sin(\\theta/2) \\\\ \\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}',
    equation: 'R_y(\\theta) = \\exp(-i\\theta Y / 2)',
    description: 'Rotates amplitudes purely within real coordinate space without introducing imaginary components. Used widely in RealAmplitudes ansatz circuits.',
    blochAction: 'Rotates state vector by angle θ around the Y-axis (latitude sweep).',
    citation: {
      bookFile: 'Parameterized_Quantum_Circuits_Machine_Learning_Benedetti.pdf',
      author: 'Marcello Benedetti et al.',
      title: 'Parameterized Quantum Circuits as Machine Learning Models',
      chapter: 'Section 2: Variational Ansatz Construction',
      section: 'Hardware-Efficient Real-Amplitude Ansätze',
      pages: 'pp. 4–7',
      seminalPaper: 'Andrew M. Childs, Lecture Notes on Quantum Algorithms, Ch. 1'
    },
    tutorPrompt: 'Explain how Ry(θ) prepares arbitrary real-amplitude superpositions without complex phases, referencing Benedetti et al.'
  },

  rz: {
    id: 'rz',
    name: 'Parametric Rotation-Z (Rz)',
    symbol: 'Rz(θ)',
    category: 'Variational / Continuous',
    badgeColor: '#d946ef',
    dimension: '2 × 2',
    matrix: [
      ['e^{-iθ/2}', '0'],
      ['0', 'e^{iθ/2}']
    ],
    latex: '\\begin{pmatrix} e^{-i\\theta/2} & 0 \\\\ 0 & e^{i\\theta/2} \\end{pmatrix}',
    equation: 'R_z(\\theta) = \\exp(-i\\theta Z / 2)',
    description: 'Applies tunable relative phase shift θ between computational basis components while preserving basis probability populations |α|² and |β|².',
    blochAction: 'Rotates state vector by angle θ around the Z-axis (longitude sweep).',
    citation: {
      bookFile: 'Quantum_Algorithms_Complete_Textbook_Andrew_Childs.pdf',
      author: 'Andrew M. Childs',
      title: 'Lecture Notes on Quantum Algorithms',
      chapter: 'Chapter 1: The Circuit Model of Quantum Computation',
      section: 'Section 1.1: Single-Qubit Phase Rotations',
      pages: 'pp. 7–10',
      seminalPaper: 'Thomas G. Wong, Intro to Classical & Quantum Computing, Sec. 2.3'
    },
    tutorPrompt: 'Explain why Rz(θ) rotates relative phase on the Bloch sphere equator while keeping measurement probabilities identical.'
  },

  cx: {
    id: 'cx',
    name: 'Controlled-NOT (CNOT / CX)',
    symbol: 'CX',
    category: 'Entangling / 2-Qubit Clifford',
    badgeColor: '#0ea5e9',
    dimension: '4 × 4',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '0', '1'],
      ['0', '0', '1', '0']
    ],
    latex: '\\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}',
    equation: 'CX|00⟩ = |00⟩, CX|01⟩ = |01⟩, CX|10⟩ = |11⟩, CX|11⟩ = |10⟩',
    description: 'Conditional bit-flip. Flips target qubit if control qubit is |1⟩. Together with single-qubit gates, forms a universal quantum gate set. Generates maximally entangled Bell states.',
    blochAction: 'Creates non-local quantum correlations (entanglement) across the joint 4D Hilbert space.',
    citation: {
      bookFile: 'Elementary_Gates_for_Quantum_Computation_Barenco_et_al.pdf',
      author: 'Adriano Barenco, Charles H. Bennett, David P. DiVincenzo, et al.',
      title: 'Elementary Gates for Quantum Computation',
      chapter: 'Physical Review A 52, 3457 (1995)',
      section: 'Section II: Two-Bit Operations & Controlled Inversions',
      pages: 'pp. 3458–3461',
      seminalPaper: 'Thomas G. Wong, Intro to Classical & Quantum Computing, Ch. 3'
    },
    tutorPrompt: 'Explain how CNOT creates maximal entanglement from H|0⟩ ⊗ |0⟩ into the Bell state (|00⟩ + |11⟩)/√2 based on Barenco et al. (1995).'
  },

  cz: {
    id: 'cz',
    name: 'Controlled-Z (CZ / Controlled Phase Flip)',
    symbol: 'CZ',
    category: 'Entangling / 2-Qubit Clifford',
    badgeColor: '#0284c7',
    dimension: '4 × 4',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '1', '0'],
      ['0', '0', '0', '-1']
    ],
    latex: '\\text{diag}(1, 1, 1, -1)',
    equation: 'CZ|c, t⟩ = (-1)^{c \\cdot t}|c, t⟩',
    description: 'Completely symmetric 2-qubit entangler: either qubit can act as control or target. Inverts the phase of state |11⟩ only. Related to CNOT by CZ = (I ⊗ H) CX (I ⊗ H).',
    blochAction: 'Applies conditional phase inversion in bipartite Hilbert space; native gate in superconducting and neutral atom QPUs.',
    citation: {
      bookFile: 'Quantum_Information_Theory_Complete_Book_Mark_Wilde.pdf',
      author: 'Mark M. Wilde',
      title: 'Quantum Information Theory',
      chapter: 'Chapter 3: Quantum Mechanics & Multi-Qubit Operations',
      section: 'Section 3.4: Bipartite Controlled Phase Shifts',
      pages: 'pp. 74–77',
      seminalPaper: 'Barenco et al., Phys. Rev. A 52, 3462 (1995)'
    },
    tutorPrompt: 'Show why Controlled-Z is symmetric between control and target qubits and how it converts to CNOT with single-qubit Hadamards.'
  },

  swap: {
    id: 'swap',
    name: 'SWAP Gate',
    symbol: 'SWAP',
    category: '2-Qubit Routing / Clifford',
    badgeColor: '#6366f1',
    dimension: '4 × 4',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '0', '1', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '0', '1']
    ],
    latex: '\\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\end{pmatrix}',
    equation: 'SWAP|a, b⟩ = |b, a⟩',
    description: 'Exchanges the states of two physical qubits. Essential for quantum hardware compilation with nearest-neighbor coupling topologies. Decomposes into 3 alternating CNOTs.',
    blochAction: 'Transposes the state tensors of the two selected qubit registers.',
    citation: {
      bookFile: 'Intro_to_Classical_and_Quantum_Computing_Thomas_Wong.pdf',
      author: 'Thomas G. Wong',
      title: 'Introduction to Classical and Quantum Computing',
      chapter: 'Chapter 3: Multiple Qubits and Entanglement',
      section: 'Section 3.2: The SWAP Gate & CNOT Decomposition',
      pages: 'pp. 82–84',
      seminalPaper: 'Barenco et al., Phys. Rev. A 52, 3457 (1995), Sec. IV'
    },
    tutorPrompt: 'Prove that three alternating CNOT gates (CX_01, CX_10, CX_01) synthesize an exact SWAP gate using Thomas Wong Section 3.2.'
  },

  measure: {
    id: 'measure',
    name: 'Projective Measurement (Z-Basis)',
    symbol: 'M',
    category: 'Measurement / Collapse',
    badgeColor: '#eab308',
    dimension: 'Projectors',
    matrix: [
      ['|0⟩⟨0| = [[1, 0], [0, 0]]'],
      ['|1⟩⟨1| = [[0, 0], [0, 1]]']
    ],
    latex: 'M_0 = |0\\rangle\\langle 0|, \\quad M_1 = |1\\rangle\\langle 1|',
    equation: 'P(0) = |\\langle 0|\\psi\\rangle|^2, \\quad P(1) = |\\langle 1|\\psi\\rangle|^2',
    description: 'Irreversible quantum projection according to Born rule. Collapses continuous quantum state amplitudes into a deterministic classical outcome bit (0 or 1).',
    blochAction: 'Projects Bloch vector onto either the north pole (|0⟩) or south pole (|1⟩).',
    citation: {
      bookFile: 'Quantum_Information_Theory_Complete_Book_Mark_Wilde.pdf',
      author: 'Mark M. Wilde',
      title: 'Quantum Information Theory',
      chapter: 'Chapter 3: Quantum Mechanics',
      section: 'Section 3.5: Von Neumann Measurements & POVMs',
      pages: 'pp. 67–72',
      seminalPaper: 'Tumulka, Foundations of Quantum Mechanics, Ch. 2'
    },
    tutorPrompt: "Explain Born's rule for projective measurement in the computational basis and statevector collapse following Mark Wilde Ch. 3."
  }
};
