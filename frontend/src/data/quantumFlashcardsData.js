/**
 * Quantum Leap — Mastery Flashcard Decks
 * Spaced-Repetition Interactive Flashcards for Quantum Education
 */

export const QUANTUM_FLASHCARD_DECKS = [
  {
    id: 'qubit-superposition',
    category: 'Foundations',
    topic: 'Superposition & Qubit States',
    difficulty: 'Beginner',
    front: {
      title: 'The Superposition Principle',
      question: 'What is the mathematical condition for a 2-level quantum state |ψ⟩ = α|0⟩ + β|1⟩ to be physically valid?',
      hint: 'Think about total probability conservation across all measurement outcomes.',
    },
    back: {
      answer: 'Normalization Condition: |α|² + |β|² = 1',
      formula: '|\\alpha|^2 + |\\beta|^2 = 1 \\implies \\langle\\psi|\\psi\\rangle = 1',
      explanation: 'In quantum mechanics, Born’s rule states that |α|² is the probability of measuring |0⟩, and |β|² is the probability of measuring |1⟩. Since the total measurement probability must sum to 100%, the complex amplitudes must lie on the unit sphere in 2D complex space.',
      keyTakeaway: 'Superposition is a linear combination of basis vectors with conservation of total probability.',
    }
  },
  {
    id: 'bloch-sphere',
    category: 'Foundations',
    topic: 'Bloch Sphere Geometry',
    difficulty: 'Beginner',
    front: {
      title: 'Bloch Sphere Coordinates',
      question: 'What do the angles θ and φ represent when mapping a qubit to the Bloch sphere?',
      hint: 'Recall polar angle θ from the z-axis and azimuthal angle φ in the x-y plane.',
    },
    back: {
      answer: 'Polar angle θ controls relative amplitude; Azimuthal angle φ controls relative quantum phase.',
      formula: '|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle',
      explanation: 'θ ∈ [0, π] measures the angle from the North pole (|0⟩, θ=0) to the South pole (|1⟩, θ=π). φ ∈ [0, 2π) is the equatorial phase angle. The |+⟩ state corresponds to θ=π/2, φ=0.',
      keyTakeaway: 'Any single-qubit pure state corresponds to a unique point on the surface of the unit sphere S².',
    }
  },
  {
    id: 'bell-state-entanglement',
    category: 'Entanglement',
    topic: 'Bell States & Non-Locality',
    difficulty: 'Intermediate',
    front: {
      title: 'Constructing the Bell State |Φ⁺⟩',
      question: 'Which sequence of two quantum gates transforms the unentangled product state |00⟩ into the maximally entangled Bell state |Φ⁺⟩?',
      hint: 'First create an equal superposition on qubit 0, then entangle qubit 1 conditioned on qubit 0.',
    },
    back: {
      answer: 'Hadamard (H) on qubit 0, followed by CNOT with qubit 0 as control and qubit 1 as target.',
      formula: '|00\\rangle \\xrightarrow{H_0} \\frac{|0\\rangle+|1\\rangle}{\\sqrt{2}}|0\\rangle \\xrightarrow{CX_{0,1}} \\frac{|00\\rangle+|11\\rangle}{\\sqrt{2}} = |\\Phi^+\\rangle',
      explanation: 'The Hadamard gate creates the separable superposition (|00⟩ + |10⟩)/√2. The subsequent CNOT flips the target qubit if and only if the control qubit is |1⟩, entangling the pair so that their outcomes are perfectly correlated.',
      keyTakeaway: 'Entanglement cannot be created by single-qubit local unitary operations alone; a two-qubit entangling gate is strictly required.',
    }
  },
  {
    id: 'no-cloning-theorem',
    category: 'Entanglement',
    topic: 'No-Cloning Theorem',
    difficulty: 'Intermediate',
    front: {
      title: 'The No-Cloning Theorem',
      question: 'Why is it fundamentally impossible to build a universal quantum photocopier that copies an arbitrary unknown qubit |ψ⟩?',
      hint: 'Consider the requirement that quantum evolution must be represented by a linear unitary operator U.',
    },
    back: {
      answer: 'Lineary of Quantum Mechanics forbids copying arbitrary superpositions.',
      formula: 'U(|\\psi\\rangle|0\\rangle) = |\\psi\\rangle|\\psi\\rangle \\implies \\langle\\psi|\\phi\\rangle = (\\langle\\psi|\\phi\\rangle)^2',
      explanation: 'Suppose a unitary operator U clones both |0⟩ → |00⟩ and |1⟩ → |11⟩. By linearity, U(α|0⟩+β|1⟩)|0⟩ must equal α|00⟩ + β|11⟩. However, the true cloned state would require (α|0⟩+β|1⟩)⊗(α|0⟩+β|1⟩) = α²|00⟩ + αβ|01⟩ + βα|10⟩ + β²|11⟩. These two states are equal only if α=0 or β=0, proving that arbitrary superposition cloning is mathematically impossible.',
      keyTakeaway: 'No-cloning provides unconditional security in quantum key distribution (QKD) and makes quantum error correction much harder than classical repetition.',
    }
  },
  {
    id: 'grovers-speedup',
    category: 'Algorithms',
    topic: 'Grover Search Algorithm',
    difficulty: 'Advanced',
    front: {
      title: 'Grover\'s Algorithm Complexity',
      question: 'What is the asymptotic query complexity of Grover\'s algorithm to find an item in an unsorted database of N elements, and what is the classical bound?',
      hint: 'Classical brute-force requires O(N) evaluations.',
    },
    back: {
      answer: 'Grover Query Complexity: O(√N), achieving a quadratic speedup over the classical O(N) lower bound.',
      formula: 'T_{\\text{optimal}} \\approx \\frac{\\pi}{4}\\sqrt{N} \\quad \\text{iterations}',
      explanation: 'Grover achieves this by alternating between an Oracle reflection (which inverts the phase of the marked state) and a Diffusion operator (which inverts all amplitudes about their mean). This selectively amplifies the probability amplitude of the target state.',
      keyTakeaway: 'Grover provides a proven optimal quadratic speedup for any black-box unstructured search problem.',
    }
  },
  {
    id: 'qft-circuit',
    category: 'Algorithms',
    topic: 'Quantum Fourier Transform',
    difficulty: 'Advanced',
    front: {
      title: 'QFT Gate Scaling vs Classical FFT',
      question: 'How many quantum gates are needed to compute the QFT on n qubits (representing N = 2ⁿ states), and how does it compare to the classical Fast Fourier Transform (FFT)?',
      hint: 'Count the number of Hadamard gates and Controlled-Phase rotation gates in the ladder.',
    },
    back: {
      answer: 'Quantum QFT requires O(n²) = O((log N)²) gates, compared to Classical FFT which requires O(N log N) = O(n · 2ⁿ) operations.',
      formula: 'N_{\\text{gates}} = \\frac{n(n+1)}{2} \\in O(n^2)',
      explanation: 'The n-qubit QFT applies 1 Hadamard and (n-1) controlled phase gates R_k to the first qubit, and cascades down the register with a final SWAP permutation. This produces an exponential speedup in transforming amplitude spectra.',
      keyTakeaway: 'QFT is the mathematical engine enabling polynomial-time period finding in Shor\'s factoring algorithm.',
    }
  },
  {
    id: 'vqe-ansatz',
    category: 'NISQ & Algorithms',
    topic: 'Variational Quantum Eigensolver (VQE)',
    difficulty: 'Advanced',
    front: {
      title: 'The Ritz Variational Principle in VQE',
      question: 'What mathematical theorem guarantees that minimizing the expectation value ⟨ψ(θ)|H|ψ(θ)⟩ will converge toward the true ground state energy E₀?',
      hint: 'Ground state energy E₀ is the lowest eigenvalue of the electronic Hamiltonian H.',
    },
    back: {
      answer: 'Ritz Variational Theorem: The expectation value of a Hermitian operator H is always greater than or equal to its minimum eigenvalue.',
      formula: '\\langle H \\rangle_{\\boldsymbol{\\theta}} = \\frac{\\langle \\psi(\\boldsymbol{\\theta}) | H | \\psi(\\boldsymbol{\\theta}) \\rangle}{\\langle \\psi(\\boldsymbol{\\theta}) | \\psi(\\boldsymbol{\\theta}) \\rangle} \\ge E_0',
      explanation: 'Because the ground state |ψ₀⟩ has the lowest eigenvalue E₀, any parametrized trial state |ψ(θ)⟩ yields an expectation energy ⟨H⟩ ≥ E₀. A classical optimizer iteratively tunes parameter vector θ until the energy reaches a minimum, yielding the molecular ground state.',
      keyTakeaway: 'VQE distributes work: the quantum processor prepares states and measures expectation values, while classical processors perform parameter optimization.',
    }
  },
  {
    id: 'surface-code-threshold',
    category: 'Error Correction',
    topic: 'Fault Tolerance & Surface Codes',
    difficulty: 'Mastery',
    front: {
      title: 'Surface Code Fault-Tolerance Threshold',
      question: 'What makes the 2D surface code the leading architecture for fault-tolerant hardware, and what is its error threshold?',
      hint: 'Consider the physical layout (2D planar grid) and proximity of required two-qubit interactions.',
    },
    back: {
      answer: 'Threshold: ~1.0% error rate per gate; relies strictly on nearest-neighbor 2D planar connectivity.',
      formula: 'P_{\\text{logical}} \\propto \\left(\\frac{P_{\\text{physical}}}{P_{\\text{threshold}}}\\right)^{(d+1)/2}',
      explanation: 'Unlike non-local LDPC codes or older Concatenated Steane codes, the surface code requires only nearest-neighbor couplings on a 2D planar chip (ideal for superconducting transmons). By increasing code distance d, logical error rates decay exponentially as long as physical gate error is below ~1%.',
      keyTakeaway: 'Surface codes turn noisy physical qubits into near-perfect logical qubits via local syndrome stabilization.',
    }
  }
];

/**
 * Filter flashcards by category or query
 */
export function getFlashcardsByCategory(category = 'All') {
  if (category === 'All') return QUANTUM_FLASHCARD_DECKS;
  return QUANTUM_FLASHCARD_DECKS.filter(card => card.category === category);
}

/**
 * Generate dynamic flashcard deck based on a query/topic
 */
export function generateDynamicFlashcards(topic = '') {
  if (!topic) return QUANTUM_FLASHCARD_DECKS.slice(0, 5);
  const t = topic.toLowerCase();
  const matched = QUANTUM_FLASHCARD_DECKS.filter(c => 
    c.topic.toLowerCase().includes(t) ||
    c.category.toLowerCase().includes(t) ||
    c.front.question.toLowerCase().includes(t) ||
    c.back.explanation.toLowerCase().includes(t)
  );
  return matched.length > 0 ? matched : QUANTUM_FLASHCARD_DECKS.slice(0, 5);
}
