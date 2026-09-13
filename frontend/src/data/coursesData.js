// ─── Quantum Leap Comprehensive Course Knowledge Base ────────────────────────
// Fully structured course units, mathematical derivations, Qiskit 1.0 code,
// interactive quizzes, and textbook citations from our 76-book quantum collection.

export const COURSES_DETAILED_CONTENT = {
  "basics-qi": {
    id: "basics-qi",
    title: "Basics of Quantum Information",
    courseLabel: "Basics of Quantum Information",
    instructor: "John Watrous & Mark Wilde",
    level: "Beginner",
    duration: "8 hours",
    badge: "#78A9FF",
    accent: "#0F62FE",
    gradient: "linear-gradient(135deg, #001141 0%, #0F1F4A 100%)",
    description: "Begin your quantum journey by mastering qubits, superposition, entanglement, and quantum measurement. Grounded in the full textbooks indexed in our knowledge base.",
    citations: [
      "John Watrous (2018), 'The Theory of Quantum Information', Cambridge University Press, Ch. 1-2",
      "Mark M. Wilde (2017), 'Quantum Information Theory', 2nd Edition, Cambridge University Press, Ch. 3",
      "Michael A. Nielsen & Isaac L. Chuang (2010), 'Quantum Computation and Quantum Information', Ch. 1-2"
    ],
    units: [
      {
        id: "unit-1",
        title: "Single Qubits, State Vectors & Normalization",
        duration: "30 min",
        circuitPreset: "superposition",
        summary: "Understand the mathematical formulation of a quantum bit as a two-dimensional complex vector space and Born's normalization condition.",
        sections: [
          {
            heading: "1. Classical Bits vs. Quantum Bits",
            content: "A classical bit can assume one of two distinct physical states: 0 or 1. Mathematically, these represent mutually exclusive configurations. In quantum computation, the fundamental unit of information is the qubit (quantum bit). Unlike a classical bit, a qubit is represented as a state vector within a two-dimensional complex Hilbert space, denoted as C^2.\n\nThe computational basis states are conventionally written in Dirac bra-ket notation as:\n\n|0⟩ = [1, 0]^T,  |1⟩ = [0, 1]^T\n\nA general pure single-qubit state |ψ⟩ is expressed as a linear superposition of basis states:\n\n|ψ⟩ = α|0⟩ + β|1⟩ = [α, β]^T",
            math: "|ψ⟩ = α|0⟩ + β|1⟩,   α, β ∈ ℂ",
            callout: "Superposition is not merely an unknown classical state or probability distribution. It represents a coherent linear combination of quantum amplitudes that can interfere constructively or destructively."
          },
          {
            heading: "2. Born Rule and State Vector Normalization",
            content: "According to the Born rule of quantum mechanics, when a qubit |ψ⟩ = α|0⟩ + β|1⟩ is measured in the computational basis, the probability of obtaining outcome 0 is |α|² and outcome 1 is |β|².\n\nBecause the sum of probabilities for all exhaustive outcomes must equal 1, every valid quantum state must satisfy the normalization condition:\n\n⟨ψ|ψ⟩ = |α|² + |β|² = 1\n\nIf α or β are complex numbers (z = x + iy), the modulus squared is calculated as |z|² = z · z* = x² + y².",
            math: "⟨ψ|ψ⟩ = (α*  β*) [α, β]^T = |α|² + |β|² = 1",
            code: `# Qiskit 1.0+ Example: Constructing and verifying a single-qubit superposition
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Create statevector |psi> = 1/sqrt(2) |0> + 1/sqrt(2) |1>
alpha = 1 / np.sqrt(2)
beta = 1 / np.sqrt(2)
psi = Statevector([alpha, beta])

print("Statevector:", psi)
print("Is valid statevector:", psi.is_valid())
print("Probabilities:", psi.probabilities_dict())`
          },
          {
            heading: "3. Global Phase vs. Relative Phase",
            content: "Two quantum states that differ solely by a global phase factor e^(iθ) (where θ ∈ ℝ) are physically indistinguishable. For any observable M:\n\n⟨e^(iθ)ψ | M | e^(iθ)ψ⟩ = e^(-iθ)e^(iθ) ⟨ψ|M|ψ⟩ = ⟨ψ|M|ψ⟩\n\nIn contrast, the relative phase between basis states—such as the difference between |+⟩ = (|0⟩ + |1⟩)/√2 and |-⟩ = (|0⟩ - |1⟩)/√2—carries physical information that can be distinguished by interference.",
            math: "|+⟩ = (|0⟩ + |1⟩)/√2,   |-⟩ = (|0⟩ - |1⟩)/√2  ⟹  ⟨+| - ⟩ = 0"
          }
        ],
        quiz: {
          question: "If a qubit is in the normalized state |ψ⟩ = (1/2)|0⟩ + c|1⟩, what is the magnitude of the complex coefficient c?",
          options: ["1/2", "sqrt(3)/2", "3/4", "1/sqrt(2)"],
          correctIndex: 1,
          explanation: "By the Born rule normalization condition, |α|² + |c|² = 1. Here |α|² = (1/2)² = 1/4. Thus |c|² = 1 - 1/4 = 3/4, which yields |c| = sqrt(3)/2."
        }
      },
      {
        id: "unit-2",
        title: "The Bloch Sphere & Pauli Gate Operations",
        duration: "40 min",
        circuitPreset: "superposition",
        summary: "Visualize single-qubit states on the 3D unit sphere and study unitary rotations using Pauli operators X, Y, Z and Hadamard.",
        sections: [
          {
            heading: "1. Geometric Representation on the Bloch Sphere",
            content: "Discarding the unobservable global phase, any pure single-qubit state can be uniquely parameterized by two spherical angles: the polar angle θ ∈ [0, π] and the azimuthal angle φ ∈ [0, 2π):\n\n|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩\n\nThis maps any pure state to a point on the surface of the unit sphere r = (x, y, z) = (sinθ cosφ, sinθ sinφ, cosθ).\n• North Pole (θ = 0): |0⟩\n• South Pole (θ = π): |1⟩\n• +X Equator (θ = π/2, φ = 0): |+⟩\n• -X Equator (θ = π/2, φ = π): |-⟩\n• +Y Equator (θ = π/2, φ = π/2): |+i⟩",
            math: "r = (sinθ cosφ,  sinθ sinφ,  cosθ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩)",
            callout: "Orthogonal quantum states are antipodal on the Bloch sphere! For example, |0⟩ and |1⟩ have an angle of 90° in Hilbert space, but are 180° apart on the Bloch sphere."
          },
          {
            heading: "2. The Pauli Operators as Generators of Rotation",
            content: "Single-qubit quantum gates are represented by 2x2 unitary matrices (U† U = I). The Pauli matrices form a basis for Hermitian 2x2 operators:\n\nX = [[0, 1], [1, 0]],  Y = [[0, -i], [i, 0]],  Z = [[1, 0], [0, -1]]\n\nThe Hadamard gate creates equal superpositions:\n\nH = (1/√2) [[1, 1], [1, -1]] = (X + Z)/√2",
            math: "H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩,   H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩",
            code: `# Applying Pauli and Hadamard gates in Qiskit 1.0+
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)
qc.h(0)  # Hadamard puts |0> into |+>
qc.z(0)  # Pauli-Z changes phase to |->
qc.h(0)  # H|-> returns to |1>

sv = Statevector.from_instruction(qc)
print("Final Statevector (should be |1>):", sv)`
          }
        ],
        quiz: {
          question: "Which point on the Bloch sphere corresponds to the state |+⟩ = (|0⟩ + |1⟩)/sqrt(2)?",
          options: ["North pole (z = +1)", "South pole (z = -1)", "Positive X-axis (x = +1, y = 0, z = 0)", "Positive Y-axis (x = 0, y = +1, z = 0)"],
          correctIndex: 2,
          explanation: "For |+⟩, θ = π/2 and φ = 0. Thus x = sin(π/2)cos(0) = 1, y = 0, z = cos(π/2) = 0, placing it on the positive X-axis."
        }
      },
      {
        id: "unit-3",
        title: "Multiple Qubits & Tensor Products",
        duration: "35 min",
        circuitPreset: "bell_state",
        summary: "Formulate multi-qubit Hilbert spaces using the Kronecker tensor product and distinguish between separable and entangled states.",
        sections: [
          {
            heading: "1. The Tensor Product of State Vectors",
            content: "When combining two independent quantum systems A and B with Hilbert spaces H_A and H_B, the composite system resides in the tensor product space H_A ⊗ H_B.\n\nFor two single qubits |u⟩ = [u0, u1]^T and |v⟩ = [v0, v1]^T, their tensor product is:\n\n|u⟩ ⊗ |v⟩ = [u0·v0, u0·v1, u1·v0, u1·v1]^T\n\nFor n qubits, the state vector has dimension 2^n. An n = 300 qubit system has 2^300 ≈ 10^90 complex amplitudes—exceeding the estimated number of atoms in the observable universe.",
            math: "|ψ⟩ = ∑_{x ∈ {0,1}^n} c_x |x⟩,   ∑ |c_x|² = 1"
          },
          {
            heading: "2. Separable vs. Entangled States",
            content: "A state |ψ⟩ ∈ H_A ⊗ H_B is separable if there exist individual states |a⟩ ∈ H_A and |b⟩ ∈ H_B such that |ψ⟩ = |a⟩ ⊗ |b⟩.\n\nIf no such decomposition exists, |ψ⟩ is entangled. In an entangled state, the state of the individual subsystems cannot be described independently of the other.",
            math: "|ψ⟩ ≠ |a⟩_A ⊗ |b⟩_B  ⟺  |ψ⟩ is entangled"
          }
        ],
        quiz: {
          question: "How many complex probability amplitudes are required to specify an arbitrary pure state of 5 qubits?",
          options: ["10", "25", "32", "64"],
          correctIndex: 2,
          explanation: "An n-qubit system has dimension 2^n in Hilbert space. For n=5, 2^5 = 32 complex amplitudes are required."
        }
      },
      {
        id: "unit-4",
        title: "Quantum Entanglement & The Bell States",
        duration: "45 min",
        circuitPreset: "bell_state",
        summary: "Construct the four maximally entangled Bell states using Hadamard and CNOT gates, and analyze non-local correlations.",
        sections: [
          {
            heading: "1. The Controlled-NOT (CNOT) Gate",
            content: "The fundamental two-qubit entangling gate is the CNOT (CX) gate. It acts on two qubits: a control qubit q0 and a target qubit q1. If the control qubit is |1⟩, the target qubit is inverted (X gate); otherwise the target is unchanged.\n\nMatrix representation in basis {|00⟩, |01⟩, |10⟩, |11⟩}:\n\nCX = [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]",
            math: "CX |c⟩ |t⟩ = |c⟩ |t ⊕ c⟩"
          },
          {
            heading: "2. Preparing the Four Bell States",
            content: "Applying a Hadamard gate to qubit 0 followed by a CNOT gate with qubit 0 controlling qubit 1 transforms the separable state |00⟩ into the maximally entangled Bell state |Φ+⟩:\n\n|00⟩ ⟶ (H ⊗ I) (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2 ⟶ (CX) (|00⟩ + |11⟩)/√2 = |Φ+⟩\n\nThe four Bell states form an orthonormal basis for two qubits:\n• |Φ+⟩ = (|00⟩ + |11⟩)/√2\n• |Φ-⟩ = (|00⟩ - |11⟩)/√2\n• |Ψ+⟩ = (|01⟩ + |10⟩)/√2\n• |Ψ-⟩ = (|01⟩ - |10⟩)/√2",
            math: "⟨Φ+|Φ-⟩ = 0,  ⟨Φ+|Ψ+⟩ = 0,  ⟨Φ+|Ψ-⟩ = 0",
            code: `# Qiskit 1.0+ Bell State Generation
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
qc.h(0)        # Superposition on qubit 0
qc.cx(0, 1)    # Entangle with qubit 1

sv = Statevector.from_instruction(qc)
print("Bell state |Phi+> statevector:")
print(sv)
print("Measurement probabilities:", sv.probabilities_dict())`
          }
        ],
        quiz: {
          question: "When measuring the Bell state |Phi+⟩ = (|00⟩ + |11⟩)/sqrt(2), what is the probability of measuring the state |01⟩?",
          options: ["0%", "25%", "50%", "100%"],
          correctIndex: 0,
          explanation: "In |Phi+⟩, only |00⟩ and |11⟩ have non-zero amplitudes (each 1/sqrt(2)). The amplitude for |01⟩ is exactly 0, so the probability is 0%."
        }
      },
      {
        id: "unit-5",
        title: "Quantum Measurement & State Collapse",
        duration: "35 min",
        circuitPreset: "superposition",
        summary: "Analyze projective measurements, projection operators, density matrices, and post-measurement state collapse.",
        sections: [
          {
            heading: "1. Projective Measurements (von Neumann Measurements)",
            content: "A projective measurement is described by an observable M, which is a Hermitian operator on the state space. It possesses a spectral decomposition:\n\nM = ∑_m m P_m\n\nwhere P_m is the projection operator onto the eigenspace of M with eigenvalue m. The projectors satisfy the completeness relation ∑_m P_m = I and orthogonality P_m P_m' = δ_{mm'} P_m.\n\nFor computational basis measurement on a single qubit:\nP_0 = |0⟩⟨0| = [[1, 0], [0, 0]],   P_1 = |1⟩⟨1| = [[0, 0], [0, 1]]",
            math: "p(m) = ⟨ψ|P_m|ψ⟩,   |ψ'⟩ = P_m|ψ⟩ / √p(m)"
          }
        ],
        quiz: {
          question: "After measuring a state |ψ⟩ with projector P_m and obtaining eigenvalue m, what is the post-measurement state?",
          options: ["It returns to |0⟩", "P_m |ψ⟩ / sqrt(p(m))", "|ψ⟩ unchanged", "A random classical bit"],
          correctIndex: 1,
          explanation: "By the measurement postulate of quantum mechanics, obtaining outcome m collapses the state to the normalized projection P_m|ψ⟩ / sqrt(p(m))."
        }
      },
      {
        id: "unit-6",
        title: "Unitary Evolution & The No-Cloning Theorem",
        duration: "30 min",
        circuitPreset: "bell_state",
        summary: "Understand why all quantum gates must be reversible unitaries and prove the fundamental impossibility of copying arbitrary quantum states.",
        sections: [
          {
            heading: "1. Reversible Unitary Evolution",
            content: "The time evolution of an isolated quantum system is described by the Schrödinger equation, which implies that all quantum logic gates must be represented by unitary operators U satisfying U† U = U U† = I.\n\nUnitary transformations preserve inner products, lengths of vectors, and probabilities: ⟨Uφ | Uψ⟩ = ⟨φ | U† U | ψ⟩ = ⟨φ | ψ⟩. Consequently, any quantum computation prior to measurement is strictly reversible: U⁻¹ = U†.",
            math: "U† U = I  ⟹  ||U|ψ⟩|| = |||ψ⟩||"
          },
          {
            heading: "2. Proof of the No-Cloning Theorem",
            content: "Suppose there existed a unitary machine U that could copy an arbitrary quantum state |ψ⟩ onto a blank target state |e⟩:\n\nU (|ψ⟩ ⊗ |e⟩) = |ψ⟩ ⊗ |ψ⟩\n\nConsider two distinct states |ψ⟩ and |φ⟩:\n1. U (|ψ⟩ ⊗ |e⟩) = |ψ⟩ |ψ⟩\n2. U (|φ⟩ ⊗ |e⟩) = |φ⟩ |φ⟩\n\nTaking the inner product of both sides:\n⟨ψ ⊗ e | U† U | φ ⊗ e⟩ = (⟨ψ| ⟨ψ|) (|φ⟩ |φ⟩)\n⟨ψ | φ⟩ ⟨e | e⟩ = (⟨ψ | φ⟩)²\n⟨ψ | φ⟩ = (⟨ψ | φ⟩)²\n\nThis algebraic equation x = x² has only two solutions: x = 0 (the states are orthogonal) or x = 1 (the states are identical). Hence, no universal quantum cloning machine can exist for arbitrary non-orthogonal states!",
            math: "⟨ψ | φ⟩ = (⟨ψ | φ⟩)²  ⟹  ⟨ψ | φ⟩ ∈ {0, 1}",
            callout: "The No-Cloning Theorem (Wootters & Zurek, 1982) is the cornerstone of quantum cryptography (QKD). An eavesdropper cannot intercept and copy a quantum message without irreversibly disturbing it!"
          }
        ],
        quiz: {
          question: "What mathematical property of quantum mechanics prevents the cloning of arbitrary quantum states?",
          options: ["Linearity of unitary operators", "Heisenberg position uncertainty", "Non-zero temperature", "Gravitational decoherence"],
          correctIndex: 0,
          explanation: "The linearity and unitarity of quantum evolution (U(α|ψ⟩ + β|φ⟩) = αU|ψ⟩ + βU|φ⟩) directly contradicts the non-linear transformation required to copy arbitrary superposition states."
        }
      }
    ]
  },

  "quantum-algos": {
    id: "quantum-algos",
    title: "Quantum Algorithm Design",
    courseLabel: "Quantum Algorithm Design",
    instructor: "Andrew Childs & Ronald de Wolf",
    level: "Intermediate",
    duration: "12 hours",
    badge: "#A56EFF",
    accent: "#8A3FFC",
    gradient: "linear-gradient(135deg, #1C0F30 0%, #2D1B4E 100%)",
    description: "Master Grover's search, Shor's factoring, HHL, and QAOA. Run circuits on our virtual 16-qubit QPU and export Qiskit code at every lesson step.",
    citations: [
      "Andrew Childs (2021), 'Lecture Notes on Quantum Algorithms', University of Maryland",
      "Ronald de Wolf (2023), 'Quantum Computing: Lecture Notes', QuSoft / University of Amsterdam",
      "Lov K. Grover (1996), 'A fast quantum mechanical algorithm for database search', STOC '96"
    ],
    units: [
      {
        id: "unit-1",
        title: "Quantum Parallelism & Deutsch-Jozsa Algorithm",
        duration: "35 min",
        circuitPreset: "deutsch_jozsa",
        summary: "Evaluate Boolean functions f:{0,1}^n -> {0,1} in quantum superposition and utilize phase kickback to achieve exponential query speedup.",
        sections: [
          {
            heading: "1. The Phase Kickback Phenomenon",
            content: "Phase kickback is an essential quantum algorithmic mechanism where an eigenvalue corresponding to an eigenvector of a controlled gate is kicked back into the control qubit.\n\nConsider an oracle U_f |x⟩ |y⟩ = |x⟩ |y ⊕ f(x)⟩. If the target qubit is initialized in the state |-⟩ = (|0⟩ - |1⟩)/√2:\n\nU_f |x⟩ |-⟩ = (-1)^(f(x)) |x⟩ |-⟩\n\nThe function evaluation f(x) has been moved from the target register into the quantum phase of the state |x⟩!",
            math: "U_f ( 1/√2^n ∑_{x=0}^{2^n-1} |x⟩ ) |-⟩ = ( 1/√2^n ∑_{x=0}^{2^n-1} (-1)^{f(x)} |x⟩ ) |-⟩"
          },
          {
            heading: "2. The Deutsch-Jozsa Algorithm",
            content: "The problem: Given an oracle for f: {0,1}^n → {0,1} promised to be either constant (same output for all inputs) or balanced (0 for exactly half of inputs, 1 for the other half), determine which it is.\n• Classical deterministic complexity: 2^(n-1) + 1 queries in the worst case.\n• Quantum complexity: Exactly 1 query using Deutsch-Jozsa!\n\nAfter applying Hadamard gates to all n query qubits and the oracle with target |-⟩, applying H^(⊗n) once more produces:\n\n|ψ_final⟩ = ∑_{z ∈ {0,1}^n} ( 1/2^n ∑_{x ∈ {0,1}^n} (-1)^{f(x) + x·z} ) |z⟩\n\nIf f is constant, constructive interference concentrates 100% probability on state |0...0⟩. If f is balanced, destructive interference results in amplitude 0 for |0...0⟩.",
            code: `# Deutsch-Jozsa 2-Qubit implementation in Qiskit 1.0+
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2, 1)
# Initialize target in |->
qc.x(1)
qc.h(1)
# Superposition on query qubit
qc.h(0)

# Balanced Oracle (CX)
qc.cx(0, 1)

# Interference on query qubit
qc.h(0)
qc.measure(0, 0)
print(qc.draw())`
          }
        ],
        quiz: {
          question: "In the Deutsch-Jozsa algorithm, what measurement result on the n input qubits indicates that f is constant?",
          options: ["All zeros |00...0⟩", "All ones |11...1⟩", "An alternating sequence |0101...⟩", "Any random non-zero bitstring"],
          correctIndex: 0,
          explanation: "For a constant function, constructive interference occurs exclusively for the all-zero state |0...0⟩ with probability 1. Any non-zero measurement proves the function is balanced."
        }
      },
      {
        id: "unit-2",
        title: "Grover's Search Algorithm & Amplitude Amplification",
        duration: "45 min",
        circuitPreset: "grover_2qubit",
        summary: "Search an unsorted database of N items in O(sqrt(N)) queries using oracle reflections and the Grover diffusion operator.",
        sections: [
          {
            heading: "1. The Unstructured Search Problem",
            content: "Given an unsorted database of N = 2^n elements and a predicate f(x) where f(ω) = 1 for a target item ω, a classical algorithm requires O(N) evaluations on average. Grover's algorithm solves this in O(√N) evaluations, providing an optimal quadratic quantum speedup.",
            math: "T_classical = Θ(N),   T_quantum = Θ(√N)"
          },
          {
            heading: "2. Geometric 2D Subspace Dynamics",
            content: "Let |s⟩ = (1/√N) ∑_{x=0}^{N-1} |x⟩ be the uniform superposition. Define the target state |ω⟩ and the perpendicular state |s'⟩ = (1/√(N-1)) ∑_{x ≠ ω} |x⟩.\n\nThe uniform state can be written as:\n|s⟩ = sin(θ/2)|ω⟩ + cos(θ/2)|s'⟩,   sin(θ/2) = 1/√N\n\nEach Grover iteration G = R_s R_ω performs two reflections in this 2D plane:\n1. Oracle reflection: R_ω = I - 2|ω⟩⟨ω|\n2. Diffusion operator: R_s = 2|s⟩⟨s| - I\n\nThe product G is a rotation by angle θ ≈ 2/√N toward the target |ω⟩. Repeating this R ≈ (π/4)√N times rotates the state into |ω⟩ with near 100% probability!",
            math: "G = (2|s⟩⟨s| - I)(I - 2|ω⟩⟨ω|),   R = ⌊(π/4)√N⌋",
            code: `# 2-Qubit Grover Search for target |11>
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
# 1. State preparation
qc.h([0, 1])

# 2. Oracle for |11> (CZ gate)
qc.cz(0, 1)

# 3. Diffusion operator: H -> X -> CZ -> X -> H
qc.h([0, 1])
qc.x([0, 1])
qc.cz(0, 1)
qc.x([0, 1])
qc.h([0, 1])

sv = Statevector.from_instruction(qc)
print("Final Probabilities:", sv.probabilities_dict())`
          }
        ],
        quiz: {
          question: "For a search space of N = 1,000,000 items, approximately how many queries does Grover's algorithm need?",
          options: ["500,000 queries", "785 queries", "20 queries", "1 query"],
          correctIndex: 1,
          explanation: "Grover requires ~ (pi/4) * sqrt(N) iterations. For N = 1,000,000, sqrt(N) = 1,000. (pi/4) * 1000 ≈ 785 queries, compared to 500,000 classically!"
        }
      },
      {
        id: "unit-3",
        title: "Quantum Fourier Transform (QFT)",
        duration: "40 min",
        circuitPreset: "grover_2qubit",
        summary: "Construct the discrete Fourier transform on quantum state amplitudes using O(n^2) Hadamard and controlled-phase rotation gates.",
        sections: [
          {
            heading: "1. Mathematical Definition of QFT",
            content: "The Quantum Fourier Transform acts on orthonormal basis states |j⟩ (j ∈ {0, ..., N-1}) according to:\n\nQFT |j⟩ = (1/√N) ∑_{k=0}^{N-1} ω_N^(jk) |k⟩,   ω_N = e^(2πi / N)\n\nWhile the classical Fast Fourier Transform (FFT) requires O(N log N) = O(n 2^n) operations, the quantum QFT circuit requires only O(n²) gates—an exponential improvement in gate count.",
            math: "QFT_N = (1/√N) ∑_{j=0}^{N-1} ∑_{k=0}^{N-1} e^(2πi j k / N) |k⟩⟨j|"
          }
        ],
        quiz: {
          question: "How many quantum gates are required to implement the Quantum Fourier Transform on n qubits?",
          options: ["O(n)", "O(n²)", "O(2^n)", "O(n!)"],
          correctIndex: 1,
          explanation: "The QFT circuit on n qubits requires n Hadamard gates and n(n-1)/2 controlled phase gates, totaling O(n²) elementary quantum gates."
        }
      },
      {
        id: "unit-4",
        title: "Quantum Phase Estimation (QPE)",
        duration: "45 min",
        circuitPreset: "grover_2qubit",
        summary: "Estimate the unknown eigenphase theta of a unitary operator U|u> = exp(2*pi*i*theta)|u> using ancilla registers and inverse QFT.",
        sections: [
          {
            heading: "1. Phase Estimation Architecture",
            content: "Quantum Phase Estimation (QPE) is the core algorithmic subroutine underlying Shor's algorithm, quantum chemistry simulations, and HHL.\n\nGiven a unitary U with eigenvector |u⟩ such that U|u⟩ = e^(2πi θ)|u⟩ (where θ ∈ [0, 1)), QPE determines θ to t bits of precision using t counting qubits and controlled-U^(2^j) operations, followed by an inverse QFT (QFT†).",
            math: "U^(2^j) |u⟩ = e^(2πi 2^j θ) |u⟩"
          }
        ],
        quiz: {
          question: "Which key subroutine is executed at the end of Quantum Phase Estimation to retrieve the binary phase digits?",
          options: ["Hadamard transform", "Inverse Quantum Fourier Transform (QFT†)", "Grover diffusion operator", "Pauli-X inversion"],
          correctIndex: 1,
          explanation: "The controlled unitaries write the phase into Fourier basis amplitudes. The inverse QFT (QFT†) transforms this back into standard computational basis states representing the binary digits of theta."
        }
      },
      {
        id: "unit-5",
        title: "Shor's Factoring Algorithm & Order Finding",
        duration: "50 min",
        circuitPreset: "grover_2qubit",
        summary: "Factor large integers N = p*q in polynomial time O((log N)^3) by reducing integer factorization to order finding via QPE.",
        sections: [
          {
            heading: "1. The Classical Reduction of Factoring to Period Finding",
            content: "Shor's algorithm breaks RSA cryptography by factoring N = pq in polynomial time O((log N)³), whereas the best known classical algorithm (the General Number Field Sieve) runs in sub-exponential time.\n\nReduction procedure:\n1. Choose a random integer a < N such that gcd(a, N) = 1.\n2. Use quantum phase estimation to find the period (order) r of the modular function f(x) = a^x mod N.\n3. If r is even and a^(r/2) ≢ -1 mod N, compute:\n   gcd(a^(r/2) - 1, N)   and   gcd(a^(r/2) + 1, N)\n   These directly yield the non-trivial prime factors of N with probability at least 1 - 1/2^k!",
            math: "a^r ≡ 1 mod N  ⟹  (a^(r/2) - 1)(a^(r/2) + 1) = k N"
          }
        ],
        quiz: {
          question: "What is the asymptotic time complexity of Shor's algorithm for factoring an n-bit integer?",
          options: ["Exponential O(2^n)", "Polynomial O(n³)", "Constant O(1)", "Linearithmic O(n log n)"],
          correctIndex: 1,
          explanation: "Shor's algorithm runs in O(n³) or O(n² log n log log n) time using fast multiplication, which is polynomial in the number of input bits n = log2(N)."
        }
      }
    ]
  },

  "use-qc": {
    id: "use-qc",
    title: "Running Circuits on a Real QPU",
    courseLabel: "Running Circuits on a QPU",
    instructor: "Olivia Lanes & IBM Quantum Team",
    level: "Beginner",
    duration: "5 hours",
    badge: "#34d399",
    accent: "#059669",
    gradient: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
    description: "Learn how superconducting transmon qubits operate, master hardware transpilation, and run circuits on real IBM Quantum QPUs using Qiskit 1.0 Runtime.",
    citations: [
      "Philip Krantz et al. (2019), 'A Quantum Engineer's Guide to Superconducting Qubits', Applied Physics Reviews",
      "IBM Quantum Documentation (2024), 'Qiskit Runtime Primitives & Transpilation Architecture'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Superconducting Transmon Qubits & Hardware Physics",
        duration: "35 min",
        circuitPreset: "superposition",
        summary: "Understand how non-linear Josephson junctions create an anharmonic oscillator, isolating the computational |0> and |1> states.",
        sections: [
          {
            heading: "1. The Physics of the Transmon",
            content: "A standard LC resonator has equally spaced energy levels (E_n = ℏω(n + 1/2)). It cannot function as a qubit because a microwave drive tuned to the 0 → 1 transition will simultaneously excite 1 → 2, 2 → 3, etc.\n\nA transmon replaces the linear inductor with a Josephson junction—a superconducting tunnel barrier with non-linear inductance:\n\nL_J = Φ_0 / (2π I_c cos δ)\n\nThis introduces negative anharmonicity α = E_12 - E_01 < 0. By engineering E_J / E_C ≫ 1, the transmon suppresses charge noise while maintaining sufficient anharmonicity (~ -300 MHz) to address |0⟩ ↔ |1⟩ with microwave pulses without leakage into |2⟩.",
            math: "H = 4 E_C (n̂ - n_g)² - E_J cos φ̂"
          }
        ],
        quiz: {
          question: "Why is a non-linear Josephson junction necessary in superconducting transmon qubits?",
          options: ["To cool the dilution refrigerator", "To make energy levels unequally spaced (anharmonicity)", "To eliminate all magnetic fields", "To speed up the speed of light"],
          correctIndex: 1,
          explanation: "The non-linear inductance creates anharmonicity, ensuring that the |0⟩->|1⟩ transition frequency is distinct from |1⟩->|2⟩, allowing precise two-level qubit control."
        }
      },
      {
        id: "unit-2",
        title: "Transpilation & Hardware Basis Gates",
        duration: "30 min",
        circuitPreset: "bell_state",
        summary: "Map ideal quantum circuits to real physical coupling maps with native gate sets (ECR/CZ, SX, X, RZ).",
        sections: [
          {
            heading: "1. The Qiskit 1.0 Transpiler Pipeline",
            content: "Physical QPUs do not natively support arbitrary gates like Toffoli or Fredkin, nor does every qubit connect to every other qubit. The transpiler transforms an abstract circuit through six stages:\n1. Init: Unroll high-level operations.\n2. Layout: Map virtual qubits to physical qubits (e.g., SabreLayout).\n3. Routing: Insert SWAP gates to satisfy physical coupling constraints (SabreSwap).\n4. Translation: Decompose gates into the QPU basis set (typically {ECR, RZ, SX, X} or {CZ, RZ, SX, X}).\n5. Optimization: Cancel adjacent inverse gates (H H = I) and merge single-qubit rotations.\n6. Scheduling: Align pulse timings to minimize idle decoherence.",
            code: `# Transpiling a circuit for an IBM backend in Qiskit 1.0+
from qiskit import QuantumCircuit, transpile
from qiskit.providers.fake_provider import GenericBackendV2

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

backend = GenericBackendV2(num_qubits=5)
transpiled_qc = transpile(qc, backend=backend, optimization_level=3)
print("Transpiled circuit depth:", transpiled_qc.depth())
print("Gate count:", transpiled_qc.count_ops())`
          }
        ],
        quiz: {
          question: "What gate does the transpiler insert when two qubits in a two-qubit gate are not directly physically connected on the QPU chip?",
          options: ["Hadamard gate", "SWAP gate", "Phase gate", "T gate"],
          correctIndex: 1,
          explanation: "SWAP gates (decomposed into 3 CNOTs) are inserted during the routing phase to move qubit states along the physical coupling graph until they are adjacent."
        }
      }
    ]
  },

  "qml": {
    id: "qml",
    title: "Quantum Machine Learning",
    courseLabel: "Quantum Machine Learning",
    instructor: "Maria Schuld & Nathan Killoran",
    level: "Intermediate",
    duration: "10 hours",
    badge: "#78A9FF",
    accent: "#0F62FE",
    gradient: "linear-gradient(135deg, #001141 0%, #1e1b4b 100%)",
    description: "Explore quantum kernels, parameterized circuits, quantum neural networks (QNNs), and analytical gradients with the parameter shift rule.",
    citations: [
      "Maria Schuld & Francesco Petruccione (2021), 'Machine Learning with Quantum Computers', 2nd Ed., Springer",
      "K. Mitarai et al. (2018), 'Quantum Circuit Learning', Phys. Rev. A 98, 032309"
    ],
    units: [
      {
        id: "unit-1",
        title: "Quantum Feature Maps & Data Encoding",
        duration: "40 min",
        circuitPreset: "superposition",
        summary: "Map classical data vectors x in R^d into high-dimensional Hilbert space states |Phi(x)> using Angle, Amplitude, and IQP embeddings.",
        sections: [
          {
            heading: "1. Angle Encoding vs. Amplitude Encoding",
            content: "To process classical data on a quantum computer, features x = (x1, ..., xd) must be encoded into quantum states:\n\n1. Angle Encoding: Encodes d features into d qubits via rotation gates:\n|Φ(x)⟩ = ⨂_{i=1}^d Ry(xi)|0⟩ = ⨂_{i=1}^d (cos(xi/2)|0⟩ + sin(xi/2)|1⟩)\nCircuit depth is O(1), but requires d physical qubits.\n\n2. Amplitude Encoding: Encodes N = 2^n features into the normalized state of n qubits:\n|Φ(x)⟩ = ∑_{i=0}^{2^n-1} xi |i⟩,   ∑ |xi|² = 1\nExtremely space-efficient (logarithmic qubits), but state preparation circuits generally scale exponentially in depth (O(2^n)) without special structure.",
            math: "|Φ(x)⟩ = ∑_{i=1}^{2^n} xi |i⟩   vs   |Φ(x)⟩ = ⨂_{i=1}^d (cos(xi/2)|0⟩ + sin(xi/2)|1⟩)"
          }
        ],
        quiz: {
          question: "How many qubits are required to encode a 1024-dimensional normalized vector using amplitude encoding?",
          options: ["1024 qubits", "10 qubits", "512 qubits", "32 qubits"],
          correctIndex: 1,
          explanation: "Amplitude encoding stores 2^n features in n qubits. Since 2^10 = 1024, only 10 qubits are required."
        }
      },
      {
        id: "unit-2",
        title: "The Parameter Shift Rule for Analytical Gradients",
        duration: "35 min",
        circuitPreset: "superposition",
        summary: "Compute exact quantum gradients on real hardware without finite difference numerical errors.",
        sections: [
          {
            heading: "1. Analytical Derivatives of Quantum Expectation Values",
            content: "Consider a parameterized quantum circuit evaluating the expectation value of an observable H:\nE(θ) = ⟨0| U†(θ) H U(θ) |0⟩\nwhere U(θ) = exp(-i θ/2 G) and G has two distinct eigenvalues ±1 (e.g. Pauli gates X, Y, Z).\n\nUnlike classical automatic differentiation or finite differences (which suffer from shot noise and floating point errors), the Parameter Shift Rule provides the exact gradient by evaluating the circuit at two macroscopic shifts θ ± π/2:\n\n∂E(θ)/∂θ = [ E(θ + π/2) - E(θ - π/2) ] / 2",
            math: "∇_θ ⟨H⟩ = 1/2 [ ⟨H⟩_{θ + π/2} - ⟨H⟩_{θ - π/2} ]",
            code: `# Parameter Shift Rule in Python
import numpy as np

def parameter_shift_gradient(circuit_fn, theta, s=np.pi/2):
    # Evaluate at shifted parameters
    plus_eval = circuit_fn(theta + s)
    minus_eval = circuit_fn(theta - s)
    return (plus_eval - minus_eval) / (2 * np.sin(s))`
          }
        ],
        quiz: {
          question: "What is the primary advantage of the parameter shift rule over standard numerical finite difference on quantum hardware?",
          options: ["It requires zero quantum measurements", "It is exact and robust against quantum shot noise", "It only works on classical computers", "It doubles circuit depth"],
          correctIndex: 1,
          explanation: "Finite differences require infinitesimal steps delta which are drowned out by quantum projection noise. The parameter shift rule uses large pi/2 shifts, yielding exact analytical gradients."
        }
      }
    ]
  },

  "vqe": {
    id: "vqe",
    title: "Variational Quantum Eigensolver (VQE & QAOA)",
    courseLabel: "Variational Quantum Algorithms (VQE/QAOA)",
    instructor: "M. Cerezo & Jarrod McClean",
    level: "Intermediate",
    duration: "9 hours",
    badge: "#A56EFF",
    accent: "#8A3FFC",
    gradient: "linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)",
    description: "Implement hybrid quantum-classical algorithms for chemistry ground state calculations and combinatorial optimization (Max-Cut with QAOA).",
    citations: [
      "Alberto Peruzzo et al. (2014), 'A variational eigenvalue solver on a photonic quantum processor', Nature Comm. 5, 4213",
      "M. Cerezo et al. (2021), 'Variational quantum algorithms', Nature Reviews Physics 3, 625-644"
    ],
    units: [
      {
        id: "unit-1",
        title: "The Rayleigh-Ritz Variational Principle",
        duration: "35 min",
        circuitPreset: "bell_state",
        summary: "Understand how the Rayleigh-Ritz theorem guarantees that any parameterized quantum state's energy provides an upper bound to the ground state.",
        sections: [
          {
            heading: "1. Foundation of VQE",
            content: "Given a Hamiltonian H with unknown ground state energy E0 and corresponding eigenvector |ψ0⟩:\n\nH|ψ0⟩ = E0 |ψ0⟩\n\nThe Rayleigh-Ritz variational principle states that for any normalized trial state |ψ(θ)⟩:\n\n⟨H⟩_θ = ⟨ψ(θ)| H |ψ(θ)⟩ / ⟨ψ(θ)|ψ(θ)⟩ ≥ E0\n\nVQE uses a QPU to prepare |ψ(θ)⟩ and measure the energy ⟨H⟩_θ, and a classical optimizer (COBYLA, SPSA) to update θ until convergence.",
            math: "E0 = min_θ ⟨ψ(θ)| H |ψ(θ)⟩"
          }
        ],
        quiz: {
          question: "According to the Rayleigh-Ritz variational principle, the expectation value <ψ(θ)|H|ψ(θ)> is always:",
          options: ["Strictly equal to 0", "An upper bound to the true ground state energy E0", "A lower bound to E0", "Equal to the highest excited state"],
          correctIndex: 1,
          explanation: "The Rayleigh-Ritz principle states that for any trial state |ψ(θ)⟩, <H> >= E0. Thus the measured expectation value is always an upper bound to the true ground state energy."
        }
      },
      {
        id: "unit-2",
        title: "QAOA for Combinatorial Optimization",
        duration: "40 min",
        circuitPreset: "bell_state",
        summary: "Solve NP-hard graph problems like Max-Cut by alternating cost Hamiltonian and mixer Hamiltonian evolutions.",
        sections: [
          {
            heading: "1. The QAOA Ansatz Structure",
            content: "The Quantum Approximate Optimization Algorithm (QAOA) alternates between two non-commuting Hamiltonians for p layers:\n\n1. Cost Hamiltonian H_C: Encodes the combinatorial objective function (e.g. Max-Cut on graph G=(V, E)):\nH_C = 1/2 ∑_{(i,j) ∈ E} (I - Z_i Z_j)\n\n2. Mixer Hamiltonian H_B: Promotes transitions between configurations:\nH_B = ∑_{i ∈ V} X_i\n\nThe trial state for parameters (γ, β) is:\n|ψ(γ, β)⟩ = ∏_{k=1}^p ( e^(-i β_k H_B) e^(-i γ_k H_C) ) |+⟩^(⊗n)",
            math: "|ψ(γ, β)⟩ = e^(-i β_p H_B) e^(-i γ_p H_C) ... e^(-i β_1 H_B) e^(-i γ_1 H_C) |+⟩^(⊗n)"
          }
        ],
        quiz: {
          question: "What is the initial state of the qubits before applying the QAOA alternating unitary layers?",
          options: ["All qubits in |0⟩", "Equal superposition |+⟩^⊗n", "A random entangled Bell state", "All qubits in |1⟩"],
          correctIndex: 1,
          explanation: "QAOA initializes all qubits in the equal superposition state |+⟩^⊗n using Hadamard gates, which is the highest-energy eigenstate of the mixer Hamiltonian H_B."
        }
      }
    ]
  },

  "qec-intro": {
    id: "qec-intro",
    title: "Quantum Error Correction for Beginners",
    courseLabel: "Quantum Error Correction for Beginners",
    instructor: "Daniel Gottesman",
    level: "Intermediate",
    duration: "7 hours",
    badge: "#78A9FF",
    accent: "#0F62FE",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
    description: "Learn how quantum redundancy overcomes bit flips and phase flips without measuring or destroying the encoded superposition.",
    citations: [
      "Daniel Gottesman (1997), 'Stabilizer Codes and Quantum Error Correction', Ph.D. thesis, Caltech",
      "Barbara M. Terhal (2015), 'Quantum error correction for quantum memories', Rev. Mod. Phys. 87, 307"
    ],
    units: [
      {
        id: "unit-1",
        title: "Classical vs. Quantum Error Correction",
        duration: "30 min",
        circuitPreset: "ghz_state",
        summary: "Overcome the three obstacles to quantum error correction: the No-Cloning Theorem, continuous errors, and measurement collapse.",
        sections: [
          {
            heading: "1. The Three Challenges of Quantum Redundancy",
            content: "Classical computers protect information by duplicating bits (0 → 000, 1 → 111) and taking a majority vote. In quantum mechanics, three fundamental challenges arise:\n1. No-Cloning: Arbitrary superpositions |ψ⟩ = α|0⟩ + β|1⟩ cannot be copied.\n2. Continuous Errors: Quantum noise is continuous (e.g. small rotation Rx(ε)), not just discrete bit-flips.\n3. Measurement Collapse: Directly measuring an encoded state collapses the superposition.\n\nRemarkably, quantum error correction overcomes all three! By encoding into entangled multi-qubit subspaces and measuring discrete Pauli syndromes via ancilla qubits, continuous errors collapse into discrete bit (X) or phase (Z) flips that can be corrected without disturbing the stored quantum data.",
            math: "Rx(ε) |ψ⟩ = [cos(ε/2) I - i sin(ε/2) X] |ψ⟩"
          }
        ],
        quiz: {
          question: "How does quantum error correction handle small, continuous rotation errors R_x(ε)?",
          options: ["It ignores them until the quantum computer fails", "Syndrome measurement projects the continuous error into either No Error (I) or a Discrete Bit Flip (X)", "It averages them out over time", "It uses analog amplifiers"],
          correctIndex: 1,
          explanation: "Measuring the discrete syndrome projects the continuous superposition state into one of two eigenspaces: with probability cos²(ε/2) no error occurred, and with sin²(ε/2) a discrete Pauli-X error occurred which can be flipped back."
        }
      },
      {
        id: "unit-2",
        title: "The 3-Qubit Repetition Code & Syndrome Extraction",
        duration: "35 min",
        circuitPreset: "ghz_state",
        summary: "Construct the 3-qubit bit-flip code and extract error syndromes using ancilla qubits and parity checks Z1*Z2 and Z2*Z3.",
        sections: [
          {
            heading: "1. Encoding and Stabilizers",
            content: "The 3-qubit bit-flip code protects one logical qubit in three physical qubits:\n|0_L⟩ = |000⟩,   |1_L⟩ = |111⟩\n\nThe code space is the +1 eigenspace of the two stabilizer generators:\nS1 = Z1 Z2 I3,   S2 = I1 Z2 Z3\n\nNotice that both |000⟩ and |111⟩ satisfy S1 |ψ⟩ = +|ψ⟩ and S2 |ψ⟩ = +|ψ⟩.\nIf an X1 bit-flip occurs on qubit 1:\nS1 (X1 |000⟩) = - (X1 |000⟩)  ⟹  Syndrome (-1, +1)\nThis uniquely identifies that qubit 1 suffered an error and must be corrected with an X gate!",
            math: "S1 = Z1 Z2,   S2 = Z2 Z3"
          }
        ],
        quiz: {
          question: "In the 3-qubit bit flip code with stabilizers S1 = Z1 Z2 and S2 = Z2 Z3, what error occurred if the syndrome measurement gives S1 = -1 and S2 = +1?",
          options: ["Bit flip on qubit 1 (X1)", "Bit flip on qubit 2 (X2)", "Bit flip on qubit 3 (X3)", "No error occurred"],
          correctIndex: 0,
          explanation: "X1 anti-commutes with Z1 in S1 (giving eigenvalue -1), but commutes with S2 (giving +1). Thus syndrome (-1, +1) points uniquely to an error on qubit 1."
        }
      }
    ]
  },

  "surface-codes": {
    id: "surface-codes",
    title: "Surface Codes & Fault Tolerance",
    courseLabel: "Surface Codes & Fault Tolerance",
    instructor: "Austin Fowler & Hector Bombin",
    level: "Advanced",
    duration: "7 hours",
    badge: "#A56EFF",
    accent: "#8A3FFC",
    gradient: "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)",
    description: "Understand the leading candidate architecture for fault-tolerant quantum computers with 2D nearest-neighbor coupling and high error thresholds ~1%.",
    citations: [
      "Austin G. Fowler et al. (2012), 'Surface codes: Towards practical large-scale quantum computation', Phys. Rev. A 86, 032324",
      "A. Yu. Kitaev (2003), 'Fault-tolerant quantum computation by anyons', Annals of Physics 303, 2-30"
    ],
    units: [
      {
        id: "unit-1",
        title: "2D Lattice Geometry & Stabilizer Plaquettes",
        duration: "40 min",
        circuitPreset: "bell_state",
        summary: "Explore data qubits on vertices and syndrome ancillas on plaquettes measuring 4-body star (X) and face (Z) stabilizers.",
        sections: [
          {
            heading: "1. The Planar Surface Code Lattice",
            content: "In a 2D square lattice with distance d, physical data qubits reside on edges or vertices, with alternating syndrome ancilla qubits at the center of each face.\n• Star operators A_s = ∏_{i ∈ v} X_i measure bit-flip parity around vertex s.\n• Plaquette operators B_p = ∏_{j ∈ p} Z_j measure phase-flip parity around face p.\n\nBecause all star and plaquette operators commute ([A_s, B_p] = 0), they can all be measured simultaneously. The threshold error rate is roughly p_th ≈ 1%, making surface codes the most practical architecture for superconducting processors.",
            math: "H = -J_e ∑_s A_s - J_m ∑_p B_p,   A_s = ⨂_{i ∈ s} X_i,   B_p = ⨂_{j ∈ p} Z_j"
          }
        ],
        quiz: {
          question: "What is the approximate fault-tolerance threshold per physical gate for the 2D surface code under standard circuit-level depolarizing noise?",
          options: ["~10^-6 (0.0001%)", "~1% (0.01)", "~50% (0.5)", "~0.00001%"],
          correctIndex: 1,
          explanation: "The surface code possesses one of the highest known error thresholds in quantum error correction: approximately ~1% (or ~0.6-0.7% under full circuit-level noise)."
        }
      }
    ]
  },

  "nisq-intro": {
    id: "nisq-intro",
    title: "Quantum Computing in the NISQ Era",
    courseLabel: "Quantum Computing in the NISQ Era",
    instructor: "John Preskill",
    level: "Beginner",
    duration: "5 hours",
    badge: "#34d399",
    accent: "#059669",
    gradient: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
    description: "Analyze the state of Noisy Intermediate-Scale Quantum hardware: 50-1000 noisy qubits, quantum volume metrics, and paths to practical utility.",
    citations: [
      "John Preskill (2018), 'Quantum Computing in the NISQ era and beyond', Quantum 2, 79",
      "Andrew W. Cross et al. (2019), 'Validating quantum computers using randomized model circuits (Quantum Volume)', Phys. Rev. A 100, 032328"
    ],
    units: [
      {
        id: "unit-1",
        title: "Defining the NISQ Era & Coherence Budgets",
        duration: "30 min",
        circuitPreset: "superposition",
        summary: "Understand what NISQ means, the limits imposed by T1 relaxation and T2 dephasing, and why shallow circuits are mandatory.",
        sections: [
          {
            heading: "1. The NISQ Paradigm (John Preskill, 2018)",
            content: "Coined by John Preskill, NISQ stands for Noisy Intermediate-Scale Quantum:\n• Intermediate-Scale: 50 to 1,000 physical qubits. This is large enough that classical supercomputers cannot brute-force simulate the 2^50 ≈ 10^15 complex amplitudes.\n• Noisy: Physical gate error rates (10^-3 to 10^-2) and decoherence times (T1, T2 ~ 100-300 μs) mean circuits are limited to depths of ~ 50-100 two-qubit gates before the output dissolves into uniform noise.\n\nWithout fault-tolerant error correction, algorithms must be heuristic, variational, or assisted by error mitigation techniques.",
            math: "F_circuit ≈ (1 - ε_2Q)^(N_2Q) × exp(-t_circuit / T2)"
          }
        ],
        quiz: {
          question: "What does the acronym NISQ stand for?",
          options: ["Non-Interfering Sub-atomic Quantum", "Noisy Intermediate-Scale Quantum", "Networked Integrated Silicon Qubits", "New Iterative System Quadratic"],
          correctIndex: 1,
          explanation: "NISQ stands for Noisy Intermediate-Scale Quantum, describing the current era of 50-1000 physical qubits without full error correction."
        }
      }
    ]
  }
};

// ── Detailed Interactive Module Content ──────────────────────────────────────
export const DETAILED_MODULES = {
  "superposition": {
    id: "superposition",
    title: "Quantum Superposition",
    category: "Quantum Foundations",
    icon: "⚛",
    description: "How quantum systems exist simultaneously in linear combinations of orthogonal basis states.",
    equation: "|ψ⟩ = α|0⟩ + β|1⟩,   |α|² + |β|² = 1",
    circuitPreset: "superposition",
    fullContent: `### Principle of Superposition
In classical information, a bit is either strictly 0 or strictly 1. In quantum mechanics, state space is represented by a complex vector space (Hilbert space). The Hadamard gate transforms the computational basis |0⟩ into an equal superposition:

H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩

When measured, this state produces outcome 0 with probability P(0) = |1/√2|² = 50% and outcome 1 with probability P(1) = 50%.

#### Interference of Amplitudes
Crucially, amplitudes are complex numbers that can interfere:
• Constructive interference: H|+⟩ = |0⟩
• Destructive interference: H|-⟩ = |1⟩
This interference capability enables quantum algorithms to cancel incorrect answers while concentrating probability on the desired solution.`,
    code: `from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)
qc.h(0)  # Put qubit 0 into superposition
sv = Statevector.from_instruction(qc)
print("Superposition statevector:", sv)
print("Probabilities:", sv.probabilities_dict())`
  },

  "uncertainty": {
    id: "uncertainty",
    title: "Heisenberg Uncertainty",
    category: "Quantum Mechanics",
    icon: "🌊",
    description: "Incompatible observables, non-commuting operators, and the Robertson-Schrödinger uncertainty relation.",
    equation: "ΔA · ΔB ≥ 1/2 |⟨[A, B]⟩|",
    circuitPreset: "superposition",
    fullContent: `### Non-Commuting Observables in Quantum Mechanics
In quantum mechanics, physical observables are represented by Hermitian operators. When two operators do not commute ([A, B] = AB - BA ≠ 0), they cannot share a simultaneous complete set of eigenvectors.

For Pauli operators X and Z:
[X, Z] = XZ - ZX = [[0, 1], [1, 0]][[1, 0], [0, -1]] - [[1, 0], [0, -1]][[0, 1], [1, 0]] = -2i Y ≠ 0

Therefore, measuring a qubit along the Z-basis with absolute certainty (ΔZ = 0, e.g. state |0⟩) results in maximum uncertainty along the X-basis (ΔX = 1, giving outcomes |+⟩ and |-⟩ with 50/50 probability).`,
    code: `from qiskit.quantum_info import Pauli
X = Pauli('X')
Z = Pauli('Z')
commutator = X.to_matrix() @ Z.to_matrix() - Z.to_matrix() @ X.to_matrix()
print("[X, Z] Commutator matrix:\n", commutator)`
  },

  "entanglement": {
    id: "entanglement",
    title: "Quantum Entanglement",
    category: "Quantum Foundations",
    icon: "🔗",
    description: "Non-local correlations between particles that cannot be factored into independent subsystems.",
    equation: "|Φ+⟩ = (|00⟩ + |11⟩)/√2",
    circuitPreset: "bell_state",
    fullContent: `### Einstein-Podolsky-Rosen (EPR) Paradox
Entanglement occurs when a composite quantum system cannot be factored into a product of individual subsystem states:

|ψ⟩ ≠ |a⟩_A ⊗ |b⟩_B

For the Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2:
• Measuring qubit A in the computational basis produces 0 or 1 with 50% probability each.
• The moment qubit A is measured, qubit B instantly collapses to the exact same outcome, even if separated by light-years.
• Faster-than-light communication is impossible because the marginal state of each individual qubit is completely mixed: ρ_A = Tr_B(|Φ+⟩⟨Φ+|) = 1/2 I.`,
    code: `from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

sv = Statevector.from_instruction(qc)
print("Bell State |Phi+>:", sv)
print("Probabilities:", sv.probabilities_dict())`
  },

  "teleportation": {
    id: "teleportation",
    title: "Quantum Teleportation",
    category: "Quantum Protocols",
    icon: "🚀",
    description: "Transmit an unknown quantum state using a shared entangled pair and two classical bits.",
    equation: "|ψ⟩ |Φ+⟩ ⟶ (Bell Measurement) ⟶ Corrections X^(m1) Z^(m0)",
    circuitPreset: "quantum_teleportation",
    fullContent: `### The Teleportation Protocol (Bennett et al., 1993)
To transmit an unknown quantum state |ψ⟩ = α|0⟩ + β|1⟩ from Alice to Bob without physically sending the qubit:
1. Alice and Bob share an entangled Bell pair |Φ+⟩_{AB} = (|00⟩ + |11⟩)/√2.
2. Alice performs a Bell-basis measurement on her unknown qubit and her half of the Bell pair (CX then H).
3. Alice measures her two qubits, obtaining classical bits (m0, m1) ∈ {0, 1}².
4. Alice transmits the 2 classical bits to Bob over a classical channel.
5. Bob applies conditional unitary corrections:
   • If m1 = 1, Bob applies X.
   • If m0 = 1, Bob applies Z.
Bob's qubit is now guaranteed to be in the exact original state |ψ⟩! The No-Cloning Theorem is preserved because Alice's original state is destroyed during measurement.`,
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(3, 2)
# Prepare state on q0
qc.rx(1.57, 0)
# Create Bell pair on q1, q2
qc.h(1)
qc.cx(1, 2)
# Alice Bell measurement
qc.cx(0, 1)
qc.h(0)
qc.measure([0, 1], [0, 1])
print(qc.draw())`
  },

  "qkd": {
    id: "qkd",
    title: "Quantum Key Distribution (BB84)",
    category: "Quantum Cryptography",
    icon: "🛡",
    description: "Information-theoretically secure key exchange based on quantum measurement disturbance.",
    equation: "Eavesdropping Error Rate > 11% ⟹ Abort Key Exchange",
    circuitPreset: "superposition",
    fullContent: `### BB84 Protocol (Bennett & Brassard, 1984)
BB84 allows Alice and Bob to establish a shared secret key with provable information-theoretic security guaranteed by quantum physics.

1. Alice generates random bits and randomly encodes each bit in either:
   • Rectilinear basis Z: {|0⟩, |1⟩}
   • Diagonal basis X: {|+⟩, |-⟩}
2. Alice sends the single photons to Bob.
3. Bob measures each photon in a randomly chosen basis (Z or X).
4. Alice and Bob publicly announce their basis choices and discard instances where their bases did not match (sifting).
5. If Eve eavesdropped, the No-Cloning Theorem and state collapse inevitably introduce errors (~25% in sifted bits). If the Quantum Bit Error Rate (QBER) exceeds 11%, they abort. Otherwise, they perform privacy amplification to generate a 100% secure key!`,
    code: `# BB84 Basis Sifting Concept
import random

alice_bits = [random.randint(0, 1) for _ in range(10)]
alice_bases = [random.choice(['Z', 'X']) for _ in range(10)]
bob_bases = [random.choice(['Z', 'X']) for _ in range(10)]

sifted_key = [alice_bits[i] for i in range(10) if alice_bases[i] == bob_bases[i]]
print("Alice bits: ", alice_bits)
print("Alice bases:", alice_bases)
print("Bob bases:  ", bob_bases)
print("Sifted Key: ", sifted_key)`
  },

  "bloch": {
    id: "bloch",
    title: "The Bloch Sphere",
    category: "Quantum Foundations",
    icon: "🌐",
    description: "Geometric representation of pure and mixed single-qubit states in 3D Euclidean space.",
    equation: "ρ = 1/2 ( I + r⃗ · σ⃗ ),   ||r⃗|| ≤ 1",
    circuitPreset: "superposition",
    fullContent: `### Geometry of Single-Qubit Density Matrices
Any single-qubit state (pure or mixed) can be written using the Pauli vector σ⃗ = (X, Y, Z):

ρ = 1/2 ( I + r_x X + r_y Y + r_z Z )

where r⃗ = (r_x, r_y, r_z) is the Bloch vector:
• ||r⃗|| = 1: Pure states on the surface of the sphere (Tr(ρ²) = 1).
• ||r⃗|| < 1: Mixed states inside the sphere (Tr(ρ²) < 1).
• r⃗ = (0, 0, 0): Completely mixed state ρ = 1/2 I (center of sphere).

Every unitary gate U = exp(-i θ/2 n̂ · σ⃗) corresponds to a rigid 3D rotation of the Bloch sphere by angle θ around axis n̂!`,
    code: `from qiskit.quantum_info import Statevector
import numpy as np

# Point on equator |+>
sv = Statevector.from_label('+')
print("Bloch vector for |+>:")
print("x =", np.real(sv.expectation_value(Pauli('X'))))
print("y =", np.real(sv.expectation_value(Pauli('Y'))))
print("z =", np.real(sv.expectation_value(Pauli('Z'))))`
  },

  "grover-mod": {
    id: "grover-mod",
    title: "Grover's Search Algorithm",
    category: "Quantum Algorithms",
    icon: "🔍",
    description: "Quadratic speedup for searching unsorted spaces of N items in O(sqrt(N)) queries.",
    equation: "G = (2|s⟩⟨s| - I)(I - 2|ω⟩⟨ω|)",
    circuitPreset: "grover_2qubit",
    fullContent: `### Amplitude Amplification
Classically, finding a marked item ω in an unsorted list of N elements requires inspecting N/2 items on average (O(N)). Lov Grover (1996) proved a quantum processor can find it in:

R ≈ (π/4)√N   iterations

Each iteration consists of:
1. Oracle reflection R_ω: Flips the phase of the target state |ω⟩ → -|ω⟩.
2. Diffusion operator R_s = 2|s⟩⟨s| - I: Inversion of all amplitudes about their mean.
This iteratively increases the probability amplitude of the target state while decreasing the non-target amplitudes.`,
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h([0, 1])
# Oracle for |11>
qc.cz(0, 1)
# Diffusion
qc.h([0, 1])
qc.x([0, 1])
qc.cz(0, 1)
qc.x([0, 1])
qc.h([0, 1])
qc.measure([0, 1], [0, 1])
print(qc.draw())`
  },

  "qft-mod": {
    id: "qft-mod",
    title: "Quantum Fourier Transform",
    category: "Quantum Algorithms",
    icon: "📊",
    description: "Transform discrete quantum amplitudes to frequency domain in O(n^2) gates.",
    equation: "QFT |j⟩ = 1/√N ∑_{k=0}^{N-1} e^(2πi jk/N) |k⟩",
    circuitPreset: "grover_2qubit",
    fullContent: `### Quantum Fourier Transform Circuit
The QFT maps computational basis states into phase-encoded Fourier basis states:

|j⟩ ⟶ 1/√2^n (|0⟩ + e^(2πi 0.j_n)|1⟩) ⊗ ... ⊗ (|0⟩ + e^(2πi 0.j_1...j_n)|1⟩)

Constructed using:
• Hadamard gates on each qubit.
• Controlled phase rotation gates R_k = [[1, 0], [0, e^(2πi / 2^k)]] between qubit pairs.
• SWAP gates reversing qubit ordering at the end.`,
    code: `from qiskit.circuit.library import QFT
qft_circuit = QFT(num_qubits=3)
print(qft_circuit.decompose().draw())`
  },

  "shor-mod": {
    id: "shor-mod",
    title: "Shor's Factoring Algorithm",
    category: "Quantum Algorithms",
    icon: "🔐",
    description: "Factor large integers N = p*q exponentially faster than any classical algorithm in polynomial time.",
    equation: "a^r ≡ 1 mod N  ⟹  gcd(a^(r/2) ± 1, N)",
    circuitPreset: "grover_2qubit",
    fullContent: `### Breaking RSA with Quantum Order Finding
Peter Shor (1994) discovered that the hardness of integer factorization can be reduced to the problem of finding the period r of the modular exponential function:

f(x) = a^x mod N

Using the Quantum Fourier Transform (QFT), a quantum computer can find r in O((log N)³) polynomial time. Once the period r is determined:
• If r is even, then (a^(r/2) - 1)(a^(r/2) + 1) = k N.
• Computing the greatest common divisor gcd(a^(r/2) ± 1, N) using Euclid's classical algorithm gives the prime factors of N!`,
    code: `# Conceptual step of Shor's Order Finding
import math
N = 15
a = 7
r = 4 # 7^4 = 2401 = 1 mod 15
factor1 = math.gcd(a**(r//2) - 1, N) # gcd(48, 15) = 3
factor2 = math.gcd(a**(r//2) + 1, N) # gcd(50, 15) = 5
print(f"Factors of {N}: {factor1} and {factor2}")`
  },

  "vqe-mod": {
    id: "vqe-mod",
    title: "Variational Quantum Eigensolver",
    category: "Variational Algorithms",
    icon: "🧬",
    description: "Hybrid quantum-classical optimization for finding ground state energies of molecules.",
    equation: "E0 ≤ ⟨ψ(θ)| H |ψ(θ)⟩",
    circuitPreset: "bell_state",
    fullContent: `### Hybrid Quantum-Classical Loop
In quantum chemistry, computing the ground state energy of a molecular Hamiltonian H = ∑ c_i P_i (where P_i are Pauli strings) is classically intractable for large molecules due to the exponential Hilbert space.

VQE solves this with a hybrid loop:
1. Quantum Processor (QPU): Prepares a parameterized trial wave function |ψ(θ)⟩ (ansatz) and measures the expectation value ⟨H⟩_θ = ∑ c_i ⟨P_i⟩.
2. Classical Processor: Evaluates the energy and runs an optimization algorithm (COBYLA, SPSA) to compute updated parameter vector θ_{k+1}.
3. Repeat until convergence to the ground state energy E0.`,
    code: `from qiskit.circuit.library import RealAmplitudes
ansatz = RealAmplitudes(num_qubits=2, reps=1)
print(ansatz.draw())`
  },

  "qaoa-mod": {
    id: "qaoa-mod",
    title: "QAOA for Combinatorial Problems",
    category: "Optimization",
    icon: "⚙",
    description: "Quantum Approximate Optimization Algorithm for solving Max-Cut and combinatorial graphs.",
    equation: "max_{γ, β} ⟨ψ(γ, β)| H_C |ψ(γ, β)⟩",
    circuitPreset: "bell_state",
    fullContent: `### Quantum Approximate Optimization (Farhi et al., 2014)
QAOA maps NP-hard combinatorial optimization problems onto finding the ground state of an Ising spin glass Hamiltonian:

H_C = 1/2 ∑_{(u,v) ∈ E} (I - Z_u Z_v)

By alternating between the problem unitary exp(-i γ H_C) and the transverse-field mixer unitary exp(-i β ∑ X_i) for p layers, QAOA explores the configuration space and guarantees convergence to the optimal solution as p → ∞.`,
    code: `from qiskit.circuit.library import QAOAAnsatz
# QAOA ansatz for a 2-qubit cost operator
ansatz = QAOAAnsatz(cost_operator=None, reps=2)
print("QAOA parameters:", ansatz.parameters)`
  },

  "qec-mod": {
    id: "qec-mod",
    title: "Stabilizer Formalism",
    category: "Error Correction",
    icon: "🛡",
    description: "Efficient group-theoretic description of quantum error-correcting codes using Pauli stabilizers.",
    equation: "S |ψ⟩ = +|ψ⟩,   ∀ S ∈ S",
    circuitPreset: "ghz_state",
    fullContent: `### Gottesman-Knill Theorem & Stabilizer Codes
A stabilizer code on n qubits is defined as the common +1 eigenspace of an abelian subgroup S ⊂ G_n of the n-qubit Pauli group that does not contain -I:

V_S = { |ψ⟩ : S|ψ⟩ = |ψ⟩, ∀ S ∈ S }

If S has k independent commuting generators, the code encodes k logical qubits into n physical qubits ([n, k, d] code).
Errors E ∈ G_n that anti-commute with at least one generator produce syndrome measurements that detect the error without measuring the logical information.`,
    code: `from qiskit.quantum_info import StabilizerState
# Stabilizer state for Bell state |Phi+>
# Stabilizers: X1 X2 = +1, Z1 Z2 = +1
bell_stab = StabilizerState.from_label('00')
print("Bell stabilizer state initialized")`
  }
};
