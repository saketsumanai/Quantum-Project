"""
Comprehensive Curated Quantum Examination Bank.
Provides 10 high-caliber, peer-reviewed quantum questions per topic
with mathematical formulas (LaTeX), explanations, and Qiskit code snippets.
Guarantees reliable fallback, offline performance, and exact question count.
"""

CURATED_EXAM_BANK = {
    "gates": [
        {
            "id": "gate_q1",
            "question": "What is the matrix representation and action of the Pauli-X gate?",
            "options": [
                "It acts as a quantum NOT gate, mapping |0⟩ to |1⟩ and |1⟩ to |0⟩",
                "It introduces an arbitrary phase factor e^(iθ) to |1⟩",
                "It projects a state onto the equator of the Bloch sphere",
                "It entangles two adjacent qubits without classical control"
            ],
            "correct_index": 0,
            "explanation": "The Pauli-X gate corresponds to matrix [[0, 1], [1, 0]] and inverts the computational basis states |0⟩ ↔ |1⟩, acting as a quantum bit-flip.",
            "formula": "X = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}, \\quad X|0\\rangle = |1\\rangle",
            "code_snippet": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.x(0)  # Flips |0> to |1>"
        },
        {
            "id": "gate_q2",
            "question": "Applying a Hadamard gate twice (H·H) to any pure qubit state results in which state?",
            "options": [
                "The state is completely erased and collapses to |0⟩",
                "The original initial state unchanged (since H is Hermitian and unitary, H² = I)",
                "The orthogonal conjugate of the initial state",
                "A permanent 90-degree phase shift on the Z axis"
            ],
            "correct_index": 1,
            "explanation": "Because the Hadamard operator is both Hermitian (H = H†) and Unitary (H†H = I), it is an involution: H² = I. Applying it twice returns the original state.",
            "formula": "H^2 = H \\cdot H = I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}",
            "code_snippet": "# H applied twice returns original qubit state\nqc.h(0)\nqc.h(0)"
        },
        {
            "id": "gate_q3",
            "question": "What is the action of the Phase gate S on computational basis states?",
            "options": [
                "S|0⟩ = |0⟩ and S|1⟩ = i|1⟩ (a π/2 phase rotation around Z)",
                "S|0⟩ = -|0⟩ and S|1⟩ = -|1⟩",
                "S creates an equal superposition of |0⟩ and |1⟩",
                "S swaps the amplitudes of q₀ and q₁"
            ],
            "correct_index": 0,
            "explanation": "The S gate is the square root of Z (S² = Z). It leaves |0⟩ invariant and applies an e^(iπ/2) = i phase to |1⟩.",
            "formula": "S = \\begin{bmatrix} 1 & 0 \\\\ 0 & i \\end{bmatrix}, \\quad S|1\\rangle = i|1\\rangle",
            "code_snippet": "qc.s(0)  # S gate rotation"
        },
        {
            "id": "gate_q4",
            "question": "What is the phase angle shift implemented by the non-Clifford T gate?",
            "options": [
                "π/4 radians (e^(iπ/4)) on the state |1⟩",
                "π/2 radians (e^(iπ/2)) on the state |1⟩",
                "π radians (e^(iπ)) on the state |1⟩",
                "2π radians on both states"
            ],
            "correct_index": 0,
            "explanation": "The T gate (often called the π/8 gate due to its diagonal representation e^(±iπ/8)) adds a relative phase of e^(iπ/4) to |1⟩: T² = S.",
            "formula": "T = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{bmatrix}",
            "code_snippet": "qc.t(0)  # Non-Clifford T gate"
        },
        {
            "id": "gate_q5",
            "question": "How many 2-qubit CNOT gates are required to construct an exact SWAP gate between two qubits?",
            "options": [
                "3 alternating CNOT gates: CNOT(0,1), CNOT(1,0), CNOT(0,1)",
                "1 CNOT gate with Hadamard sandwiching",
                "2 identical CNOT gates in series",
                "4 CNOT gates with intermediate Pauli-Z gates"
            ],
            "correct_index": 0,
            "explanation": "Three alternating CNOT gates exchange quantum states: CNOT(0,1) · CNOT(1,0) · CNOT(0,1)|x, y⟩ = |y, x⟩.",
            "formula": "\\text{SWAP} = \\text{CNOT}_{01} \\cdot \\text{CNOT}_{10} \\cdot \\text{CNOT}_{01}",
            "code_snippet": "qc.cx(0, 1)\nqc.cx(1, 0)\nqc.cx(0, 1)"
        },
        {
            "id": "gate_q6",
            "question": "What is the action of the Pauli-Z gate on the Hadamard superposition basis states |+⟩ and |−⟩?",
            "options": [
                "Z|+⟩ = |−⟩ and Z|−⟩ = |+⟩ (it swaps the X-eigenstates)",
                "Z|+⟩ = |+⟩ and Z|−⟩ = |−⟩ (it leaves them invariant)",
                "Z collapses both states into the computational basis |0⟩",
                "Z rotates |+⟩ into the complex state |i⟩"
            ],
            "correct_index": 0,
            "explanation": "Since Z|0⟩ = |0⟩ and Z|1⟩ = −|1⟩, Z((|0⟩+|1⟩)/√2) = (|0⟩−|1⟩)/√2 = |−⟩, and vice-versa.",
            "formula": "Z|+\\rangle = |-\\rangle, \\quad Z|-\\rangle = |+\\rangle",
            "code_snippet": "qc.h(0)\nqc.z(0)  # Transforms |+> to |->"
        },
        {
            "id": "gate_q7",
            "question": "Why is the Toffoli (CCNOT) gate significant in both classical and quantum computing?",
            "options": [
                "It is a reversible gate that is universal for classical reversible logic",
                "It can create 3-qubit entanglement without any single-qubit gates",
                "It generates imaginary phase factors without using complex numbers",
                "It violates the quantum no-cloning theorem"
            ],
            "correct_index": 0,
            "explanation": "The Toffoli gate is a 3-qubit controlled-controlled-NOT gate. Any classical boolean function can be implemented reversibly using only Toffoli and ancilla bits.",
            "formula": "\\text{CCNOT}|c_1, c_2, t\\rangle = |c_1, c_2, t \\oplus (c_1 \\cdot c_2)\\rangle",
            "code_snippet": "qc.ccx(0, 1, 2)  # Toffoli gate"
        },
        {
            "id": "gate_q8",
            "question": "What is the commutator [X, Y] of the Pauli-X and Pauli-Y matrices?",
            "options": [
                "2i Z",
                "0 (they commute)",
                "−2i I",
                "i X"
            ],
            "correct_index": 0,
            "explanation": "The Pauli matrices satisfy the SU(2) Lie algebra commutation relations: [σ_a, σ_b] = 2i ε_abc σ_c. Hence [X, Y] = 2iZ.",
            "formula": "[X, Y] = XY - YX = 2i Z",
            "code_snippet": "# Lie algebra commutator: [X, Y] = 2i Z"
        },
        {
            "id": "gate_q9",
            "question": "What rotation angle θ around the Y-axis transforms |0⟩ into the equal superposition state |+⟩?",
            "options": [
                "θ = π/2 radians",
                "θ = π radians",
                "θ = π/4 radians",
                "θ = 2π radians"
            ],
            "correct_index": 0,
            "explanation": "R_y(θ) = cos(θ/2)I − i sin(θ/2)Y. For θ = π/2, R_y(π/2)|0⟩ = cos(π/4)|0⟩ + sin(π/4)|1⟩ = (|0⟩+|1⟩)/√2 = |+⟩.",
            "formula": "R_y(\\pi/2)|0\\rangle = \\frac{1}{\\sqrt{2}}|0\\rangle + \\frac{1}{\\sqrt{2}}|1\\rangle = |+\\rangle",
            "code_snippet": "import numpy as np\nqc.ry(np.pi / 2, 0)"
        },
        {
            "id": "gate_q10",
            "question": "According to the Solovay-Kitaev theorem, any single-qubit gate can be approximated to error ε using how many gates from a discrete universal set {H, S, T}?",
            "options": [
                "O(log^c(1/ε)) where c ≈ 3.97 (polylogarithmic scaling)",
                "O(1/ε) exponential scaling",
                "O(2^(1/ε)) double exponential",
                "Exactly 3 gates regardless of precision"
            ],
            "correct_index": 0,
            "explanation": "The Solovay-Kitaev theorem guarantees that any arbitrary SU(2) rotation can be approximated within distance ε using a sequence of O(log^c(1/ε)) gates from a discrete universal basis.",
            "formula": "L = O\\left(\\log^c\\left(\\frac{1}{\\varepsilon}\\right)\\right)",
            "code_snippet": "# Solovay-Kitaev gate synthesis"
        }
    ],
    "entanglement": [
        {
            "id": "ent_q1",
            "question": "Which quantum circuit prepares the canonical Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2?",
            "options": [
                "Apply H to q0, then CNOT with q0 as control and q1 as target",
                "Apply X to q0, then H to q1",
                "Apply CNOT(q0, q1), then H to q0",
                "Apply H to both q0 and q1 simultaneously"
            ],
            "correct_index": 0,
            "explanation": "H on q0 puts it in (|0⟩+|1⟩)/√2. The subsequent CNOT flips q1 only when q0 is |1⟩, producing (|00⟩+|11⟩)/√2.",
            "formula": "|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}",
            "code_snippet": "qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)"
        },
        {
            "id": "ent_q2",
            "question": "If Alice and Bob share a Bell state |Φ⁺⟩ and Alice measures her qubit and obtains outcome 0, what is the probability Bob measures 1?",
            "options": [
                "0% (Bob will measure 0 with 100% certainty)",
                "50% (Quantum measurements are always completely random)",
                "100% (The states are anti-correlated)",
                "25% (Subject to Born rule decoherence)"
            ],
            "correct_index": 0,
            "explanation": "Because |Φ⁺⟩ has only components |00⟩ and |11⟩, Alice obtaining 0 instantaneously projects the joint wavefunction to |00⟩, guaranteeing Bob measures 0.",
            "formula": "P(q_1 = 1 \\mid q_0 = 0) = 0",
            "code_snippet": "# Perfect correlation in Bell state measurement"
        },
        {
            "id": "ent_q3",
            "question": "What is the singlet Bell state |Ψ⁻⟩ and its defining symmetry property?",
            "options": [
                "(|01⟩ − |10⟩)/√2, invariant under simultaneous bilateral SU(2) rotations",
                "(|00⟩ − |11⟩)/√2, invariant only under Pauli-Z rotations",
                "(|01⟩ + |10⟩)/√2, symmetric under qubit permutation",
                "(|00⟩ + |11⟩)/√2, the ground state of any 2-qubit Hamiltonian"
            ],
            "correct_index": 0,
            "explanation": "|Ψ⁻⟩ = (|01⟩ − |10⟩)/√2 has total angular momentum J = 0 (spin singlet). It is completely rotationally invariant: (U ⊗ U)|Ψ⁻⟩ = det(U)|Ψ⁻⟩ = |Ψ⁻⟩.",
            "formula": "|\\Psi^-\\rangle = \\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}, \\quad (U \\otimes U)|\\Psi^-\\rangle = |\\Psi^-\\rangle",
            "code_snippet": "qc.x(0)\nqc.h(0)\nqc.cx(0, 1)\nqc.z(0)  # Prepares |Psi->"
        },
        {
            "id": "ent_q4",
            "question": "What is the Cirel'son bound for the CHSH inequality correlation parameter S?",
            "options": [
                "2√2 ≈ 2.828 (the maximum quantum mechanical violation)",
                "2.0 (the local realism classical limit)",
                "4.0 (the algebraic algebraic maximum)",
                "1.0 (the normalized correlation limit)"
            ],
            "correct_index": 0,
            "explanation": "Local hidden variable theories obey |S| ≤ 2. Quantum entangled states can violate this up to Cirel'son's bound 2√2 ≈ 2.828, but cannot reach 4 due to the uncertainty principle.",
            "formula": "|S_{\\text{CHSH}}| \\le 2\\sqrt{2} \\approx 2.828",
            "code_snippet": "# CHSH test: 2*sqrt(2) maximum quantum violation"
        },
        {
            "id": "ent_q5",
            "question": "If a partial trace Tr_B is performed on the pure Bell state |Φ⁺⟩⟨Φ⁺|, what is the resulting reduced density matrix ρ_A?",
            "options": [
                "ρ_A = I/2 = [[0.5, 0], [0, 0.5]] (a maximally mixed state)",
                "ρ_A = |0⟩⟨0| (a pure computational basis state)",
                "ρ_A = |+⟩⟨+| (a pure superposition state)",
                "ρ_A = 0 (the null matrix)"
            ],
            "correct_index": 0,
            "explanation": "Tracing out subsystem B from a maximally entangled 2-qubit state erases all phase coherence, yielding the maximally mixed state ρ_A = I/2 with von Neumann entropy S = 1.",
            "formula": "\\rho_A = \\text{Tr}_B(|\\Phi^+\\rangle\\langle\\Phi^+|) = \\frac{1}{2}|0\\rangle\\langle 0| + \\frac{1}{2}|1\\rangle\\langle 1| = \\frac{1}{2}I_2",
            "code_snippet": "# Partial trace yields maximally mixed state"
        },
        {
            "id": "ent_q6",
            "question": "What does the No-Cloning Theorem state regarding arbitrary quantum states?",
            "options": [
                "An unknown quantum state |ψ⟩ cannot be cloned identically using any unitary transformation",
                "Orthogonal states can never be distinguished with certainty",
                "Entanglement cannot be created between more than two particles",
                "Classical bits cannot be encoded into quantum states"
            ],
            "correct_index": 0,
            "explanation": "Unitary transformations preserve inner products. If U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ and U|φ⟩|0⟩ = |φ⟩|φ⟩, then ⟨ψ|φ⟩ = (⟨ψ|φ⟩)², which only holds for orthogonal or identical states.",
            "formula": "U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle \\implies \\langle\\psi|\\phi\\rangle = \\langle\\psi|\\phi\\rangle^2",
            "code_snippet": "# No-Cloning Theorem fundamentally prevents quantum copying"
        },
        {
            "id": "ent_q7",
            "question": "What is the 3-qubit Greenberger-Horne-Zeilinger (GHZ) state?",
            "options": [
                "(|000⟩ + |111⟩)/√2",
                "(|001⟩ + |010⟩ + |100⟩)/√3",
                "(|000⟩ − |011⟩ − |101⟩ − |110⟩)/2",
                "|+++⟩"
            ],
            "correct_index": 0,
            "explanation": "The GHZ state is the canonical tripartite maximally entangled state (|000⟩+|111⟩)/√2, demonstrating non-statistical violations of local realism.",
            "formula": "|\\text{GHZ}\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}",
            "code_snippet": "qc = QuantumCircuit(3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(1, 2)"
        },
        {
            "id": "ent_q8",
            "question": "How is the 3-qubit W state (|001⟩ + |010⟩ + |100⟩)/√3 fundamentally different from the GHZ state under particle loss?",
            "options": [
                "Tracing out one qubit from the W state leaves the remaining two qubits still entangled",
                "Tracing out one qubit from the GHZ state leaves the remaining qubits entangled",
                "The W state cannot be prepared using unitary gates",
                "The W state violates the CHSH inequality while the GHZ state does not"
            ],
            "correct_index": 0,
            "explanation": "The W state is highly robust against particle loss: losing one qubit leaves the remaining two in an entangled mixed state with concurrence 2/3, whereas losing a qubit from GHZ collapses it to a classical mixture.",
            "formula": "|W\\rangle = \\frac{|001\\rangle + |010\\rangle + |100\\rangle}{\\sqrt{3}}",
            "code_snippet": "# W state exhibits bipartite entanglement persistence"
        },
        {
            "id": "ent_q9",
            "question": "What does the Monogamy of Entanglement (CKW inequality) state for three qubits A, B, and C?",
            "options": [
                "The sum of squared concurrences C_AB² + C_AC² cannot exceed the concurrence C_A(BC)²",
                "Qubit A can be simultaneously maximally entangled with both B and C",
                "Entanglement can be freely distributed across infinite partners",
                "Entanglement decreases linearly with Euclidean distance"
            ],
            "correct_index": 0,
            "explanation": "The Coffman-Kundu-Wootters (CKW) inequality states C_AB² + C_AC² ≤ C_A(BC)². If A is maximally entangled with B, it cannot share ANY entanglement with C.",
            "formula": "C_{AB}^2 + C_{AC}^2 \\le C_{A(BC)}^2",
            "code_snippet": "# Entanglement monogamy bounds quantum correlations"
        },
        {
            "id": "ent_q10",
            "question": "What is the Schmidt rank of an unentangled (separable) pure bipartite state |ψ_AB⟩?",
            "options": [
                "Exactly 1",
                "Greater than or equal to 2",
                "0",
                "Infinity"
            ],
            "correct_index": 0,
            "explanation": "By Schmidt decomposition, |ψ_AB⟩ = Σ λ_i |i_A⟩|i_B⟩. A pure bipartite state is separable if and only if its Schmidt rank (number of non-zero Schmidt coefficients λ_i) is 1.",
            "formula": "\\text{Schmidt Rank}(\\sum_i \\lambda_i |i_A\\rangle|i_B\\rangle) = 1 \\iff |\\psi_{AB}\\rangle = |a\\rangle \\otimes |b\\rangle",
            "code_snippet": "# Separable state: Schmidt rank = 1; Entangled: Schmidt rank >= 2"
        }
    ],
    "grover": [
        {
            "id": "grv_q1",
            "question": "For an unsorted database with N = 2ⁿ items and M = 1 marked item, how many Grover iterations are required for maximum success probability?",
            "options": [
                "≈ (π/4) √N iterations",
                "O(N) iterations (same as classical)",
                "O(log N) iterations",
                "Exactly N/2 iterations"
            ],
            "correct_index": 0,
            "explanation": "Grover's algorithm provides a quadratic speedup over classical brute force, rotating the state vector by 2θ ≈ 2/√N per step, reaching optimal alignment at ≈ (π/4)√N.",
            "formula": "R \\approx \\left\\lfloor \\frac{\\pi}{4}\\sqrt{N} \\right\\rfloor",
            "code_snippet": "import math\niterations = int(math.pi / 4 * math.sqrt(2**num_qubits))"
        },
        {
            "id": "grv_q2",
            "question": "What is the geometric effect of the Grover Diffusion operator D = 2|s⟩⟨s| - I on quantum state amplitudes?",
            "options": [
                "It reflects all state amplitudes about their mean average amplitude",
                "It inverts the phase of only the marked target state",
                "It normalizes the quantum state to unity",
                "It applies a discrete Fourier transform to all basis states"
            ],
            "correct_index": 0,
            "explanation": "The diffusion operator, also known as inversion about the mean, amplifies amplitudes that are below the average and decreases those above it, selectively boosting the marked item.",
            "formula": "D = 2|s\\rangle\\langle s| - I, \\quad a_i \\to 2\\mu - a_i",
            "code_snippet": "# Grover Diffusion operator\nqc.h(range(n))\nqc.x(range(n))\nqc.mcx(control_qubits, target_qubit)\nqc.x(range(n))\nqc.h(range(n))"
        },
        {
            "id": "grv_q3",
            "question": "How does the phase oracle O_f act on a computational basis state |x⟩ in Grover's algorithm?",
            "options": [
                "O_f|x⟩ = (-1)^(f(x)) |x⟩, flipping the phase of marked items where f(x) = 1",
                "O_f|x⟩ = |x ⊕ 1⟩, flipping the bit value of all states",
                "O_f|x⟩ collapses the superposition to the marked state",
                "O_f|x⟩ measures the state in the computational basis"
            ],
            "correct_index": 0,
            "explanation": "The phase oracle marks target solutions by multiplying their amplitude by -1: O_f|x⟩ = (-1)^f(x)|x⟩, leaving unmarked states unaffected.",
            "formula": "O_f|x\\rangle = (-1)^{f(x)}|x\\rangle",
            "code_snippet": "# Phase oracle flips sign of marked state |w>"
        },
        {
            "id": "grv_q4",
            "question": "What happens if Grover's algorithm is run for significantly more iterations than the optimal count R ≈ (π/4)√N ('overcooking')?",
            "options": [
                "The success probability decreases as the state vector rotates past the marked state",
                "The success probability approaches 100% asymptotically",
                "The quantum computer overheats and decoheres",
                "The algorithm permanently locks onto the target state"
            ],
            "correct_index": 0,
            "explanation": "Grover's algorithm is an exact rotation in a 2D plane with angular velocity 2θ. Iterating beyond the optimal angle causes the state vector to rotate away from the marked target.",
            "formula": "P_{\\text{succ}}(k) = \\sin^2((2k + 1)\\theta)",
            "code_snippet": "# Overcooking oscillates success probability: sin^2((2k+1)*theta)"
        },
        {
            "id": "grv_q5",
            "question": "If there are M multiple marked items in a database of N items (M ≪ N), how does the optimal number of iterations scale?",
            "options": [
                "R ≈ (π/4) √(N/M)",
                "R ≈ (π/4) √(N · M)",
                "R ≈ (π/4) (N/M)",
                "R remains (π/4) √N independent of M"
            ],
            "correct_index": 0,
            "explanation": "With M marked items, the initial angle sin(θ) = √(M/N) is larger, so fewer rotations R ≈ (π/4)√(N/M) are needed to align with the target subspace.",
            "formula": "R \\approx \\frac{\\pi}{4}\\sqrt{\\frac{N}{M}}",
            "code_snippet": "# M marked items speedup: R ~ (pi/4)*sqrt(N/M)"
        },
        {
            "id": "grv_q6",
            "question": "For a 2-qubit database (N = 4 items) with 1 marked item, what is the exact success probability after exactly ONE Grover iteration?",
            "options": [
                "100% (Exact deterministic solution in 1 step)",
                "50%",
                "75%",
                "85.4%"
            ],
            "correct_index": 0,
            "explanation": "For N = 4, sin(θ) = 1/√4 = 1/2, giving θ = π/6. After one step, 2(1) + 1 = 3, so total angle is 3θ = π/2. sin²(π/2) = 1 (100% certainty).",
            "formula": "\\theta = \\arcsin(1/2) = \\frac{\\pi}{6} \\implies 3\\theta = \\frac{\\pi}{2} \\implies P = \\sin^2(\\pi/2) = 1.0",
            "code_snippet": "# 2-qubit Grover solves database in exactly 1 iteration with 100% fidelity"
        },
        {
            "id": "grv_q7",
            "question": "What did the BBBV (Bennett, Bernstein, Brassard, Vazirani) theorem prove regarding quantum unstructured search?",
            "options": [
                "Grover's algorithm is optimal: no quantum algorithm can search an unstructured database faster than Ω(√N)",
                "Quantum computers can solve NP-complete problems in polynomial time",
                "Grover's algorithm can be accelerated to O(log N) using entanglement",
                "Classical search can be modified to achieve O(√N) using randomized hashing"
            ],
            "correct_index": 0,
            "explanation": "The BBBV theorem established that any quantum algorithm querying a black-box oracle must perform at least Ω(√N) queries, proving Grover's speedup is asymptotically optimal.",
            "formula": "Q_{\\text{quantum}}(N) = \\Omega(\\sqrt{N})",
            "code_snippet": "# BBBV lower bound: Omega(sqrt(N))"
        },
        {
            "id": "grv_q8",
            "question": "In the geometric 2D picture of Grover's search, which two orthonormal vectors span the search plane?",
            "options": [
                "The marked state |w⟩ and the uniform superposition of unmarked states |w^⊥⟩",
                "The computational basis states |0...0⟩ and |1...1⟩",
                "The eigenstates of the Pauli-Z operator",
                "The Fourier basis vectors |k⟩ and |k+1⟩"
            ],
            "correct_index": 0,
            "explanation": "The entire Grover iteration occurs within the 2D plane spanned by the target state |w⟩ and the normalized superposition of all non-target states |w^⊥⟩ = (1/√(N-1)) Σ_{x≠w} |x⟩.",
            "formula": "|s\\rangle = \\sqrt{\\frac{N-1}{N}}|w^\\perp\\rangle + \\frac{1}{\\sqrt{N}}|w\\rangle",
            "code_snippet": "# 2D invariant subspace spanned by |w> and |w_perp>"
        },
        {
            "id": "grv_q9",
            "question": "How can Grover Amplitude Amplification be generalized beyond database search?",
            "options": [
                "To amplify the success probability of any quantum heuristic or Monte Carlo sampling algorithm from p to O(1) in O(1/√p) steps",
                "To factor prime numbers in polynomial time",
                "To simulate time travel via closed timelike curves",
                "To compress arbitrary classical video files quadratically"
            ],
            "correct_index": 0,
            "explanation": "Quantum Amplitude Amplification (Brassard et al.) amplifies any algorithm with success probability p to near unity using O(1/√p) queries, powering quantum Monte Carlo algorithms.",
            "formula": "T_{\\text{QAA}} = O\\left(\\frac{1}{\\sqrt{p}}\\right) \\quad \\text{vs} \\quad T_{\\text{classical}} = O\\left(\\frac{1}{p}\\right)",
            "code_snippet": "# Quantum Amplitude Amplification quadratic speedup for sampling"
        },
        {
            "id": "grv_q10",
            "question": "What is the role of an ancilla qubit initialized in |−⟩ = (|0⟩ − |1⟩)/√2 when implementing a standard phase oracle via a bit-flip oracle?",
            "options": [
                "Phase kickback: flipping the ancilla state applies a (−1)^f(x) phase shift to the control qubits",
                "It absorbs thermal noise and prevents decoherence",
                "It stores the classical output index of the target",
                "It performs measurement error mitigation"
            ],
            "correct_index": 0,
            "explanation": "When U_f|x⟩|−⟩ = |x⟩|− ⊕ f(x)⟩ is applied, the eigenvalue of |−⟩ under X is (−1)^f(x), kicking the phase factor into the input register |x⟩.",
            "formula": "U_f|x\\rangle|-\\rangle = (-1)^{f(x)}|x\\rangle|-\\rangle",
            "code_snippet": "qc.x(ancilla)\nqc.h(ancilla)\n# Phase kickback converts XOR bit flip into phase flip"
        }
    ],
    "qft": [
        {
            "id": "qft_q1",
            "question": "What is the computational circuit complexity of the Quantum Fourier Transform on n qubits compared to the classical FFT?",
            "options": [
                "O(n²) quantum gates vs O(n 2ⁿ) classical FFT operations (exponential speedup)",
                "O(2ⁿ) quantum gates vs O(n) classical operations",
                "Both require O(n log n) operations",
                "Quantum QFT requires O(n³) with classical overhead"
            ],
            "correct_index": 0,
            "explanation": "QFT requires only n(n+1)/2 Hadamard and controlled-phase gates, giving O(n²) quantum complexity, an exponential reduction over the classical FFT which takes O(N log N) where N = 2ⁿ.",
            "formula": "QFT|j\\rangle = \\frac{1}{\\sqrt{2^n}}\\sum_{k=0}^{2^n-1} e^{2\\pi i j k / 2^n}|k\\rangle",
            "code_snippet": "from qiskit.circuit.library import QFT\nqft_circ = QFT(num_qubits=3)"
        },
        {
            "id": "qft_q2",
            "question": "In Quantum Phase Estimation (QPE), what is the role of the inverse Quantum Fourier Transform (QFT†)?",
            "options": [
                "It transforms the phase information encoded in the Fourier basis into computational basis state readouts",
                "It creates equal superposition across the counting register",
                "It applies unitary Hamiltonian simulation to the eigenstate",
                "It prevents decoherence by correcting bit-flip noise"
            ],
            "correct_index": 0,
            "explanation": "Controlled-U operations encode phase θ into the Fourier amplitudes of the counting register; applying QFT† translates these Fourier phases into binary eigenvalues measurable in the computational basis.",
            "formula": "|\\tilde{\\theta}\\rangle = QFT^\\dagger \\left( \\frac{1}{\\sqrt{2^t}} \\sum_{k=0}^{2^t-1} e^{2\\pi i \\theta k} |k\\rangle \\right)",
            "code_snippet": "# Apply inverse QFT to readout register\nqc.append(QFT(t).inverse(), range(t))"
        },
        {
            "id": "qft_q3",
            "question": "Why are SWAP gates placed at the conclusion of a standard textbook QFT circuit?",
            "options": [
                "The gate construction naturally produces output qubits in bit-reversed order",
                "To entangle the counting register with the ancilla register",
                "To cancel out uncomputed global phases",
                "To ensure the circuit remains unitary under Hermiticity"
            ],
            "correct_index": 0,
            "explanation": "In standard gate-level QFT decomposition, qubit j receives controlled rotations from all higher qubits, resulting in the most significant bit being on qubit n-1. ⌊n/2⌋ SWAP gates restore the natural order.",
            "formula": "\\text{Reverse}(|b_0 b_1 \\dots b_{n-1}\\rangle) = |b_{n-1} \\dots b_1 b_0\\rangle",
            "code_snippet": "for i in range(n // 2):\n    qc.swap(i, n - 1 - i)"
        },
        {
            "id": "qft_q4",
            "question": "What is the angle of rotation for the controlled phase gate R_k used in the n-qubit QFT?",
            "options": [
                "2π / 2^k radians",
                "π / 2k radians",
                "2π · k radians",
                "π / k² radians"
            ],
            "correct_index": 0,
            "explanation": "The controlled-R_k gate imparts a phase factor diag(1, e^(2πi / 2^k)). As k increases, the phase shifts become exponentially finer.",
            "formula": "R_k = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 2^k} \\end{bmatrix}",
            "code_snippet": "# Controlled phase rotation in QFT: R_k = cp(2*pi / (2**k))"
        },
        {
            "id": "qft_q5",
            "question": "How does the QFT represent the transformation of a basis state |j⟩ in terms of product states?",
            "options": [
                "As an unentangled product state of n individual qubits, each with phase proportional to binary fractions of j",
                "As a maximally entangled GHZ-type state across all n qubits",
                "As a random Poisson distributed state vector",
                "As a localized Gaussian wave packet in real space"
            ],
            "correct_index": 0,
            "explanation": "The QFT maps |j⟩ to ⨂_{l=1}^n (|0⟩ + e^(2πi 0.j_l...j_n) |1⟩)/√2. Because it factorizes cleanly into single-qubit states, the output register contains no multi-qubit entanglement.",
            "formula": "|j\\rangle \\to \\frac{1}{\\sqrt{2^n}}\\bigotimes_{l=1}^n (|0\\rangle + e^{2\\pi i 0.j_l \\dots j_n}|1\\rangle)",
            "code_snippet": "# Product state formulation of QFT"
        },
        {
            "id": "qft_q6",
            "question": "In Shor's algorithm for factoring integer N, how does QFT contribute to breaking RSA cryptography?",
            "options": [
                "It extracts the period r of the modular exponential sequence f(x) = a^x mod N with high probability",
                "It performs classical trial division across all prime numbers in parallel",
                "It computes modular inverses using Shor's matrix factorization",
                "It decrypts the ciphertext directly without finding prime factors"
            ],
            "correct_index": 0,
            "explanation": "Modular exponentiation creates a periodic superposition |x⟩|a^x mod N⟩. Measuring the target register leaves the input register periodic with period r; QFT identifies r in polynomial time.",
            "formula": "f(x + r) = f(x) \\iff a^{x+r} \\equiv a^x \\pmod N",
            "code_snippet": "# Shor's algorithm period finding via QFT"
        },
        {
            "id": "qft_q7",
            "question": "To estimate an eigenvalue phase θ accurate to n bits with success probability 1 − ε in QPE, how many counting qubits t are required?",
            "options": [
                "t = n + ⌈log₂(2 + 1/(2ε))⌉",
                "t = n/2",
                "t = 2ⁿ",
                "t = n²"
            ],
            "correct_index": 0,
            "explanation": "To guarantee n bits of accuracy with failure probability at most ε, standard Phase Estimation requires t = n + ⌈log₂(2 + 1/(2ε))⌉ counting qubits to suppress phase leak.",
            "formula": "t = n + \\left\\lceil \\log_2\\left(2 + \\frac{1}{2\\varepsilon}\\right) \\right\\rceil",
            "code_snippet": "# QPE precision formula"
        },
        {
            "id": "qft_q8",
            "question": "What is the Semiclassical Quantum Fourier Transform (Griffiths-Niu approach)?",
            "options": [
                "A technique that replaces two-qubit quantum controlled gates with single-qubit measurements and classical feed-forward rotations",
                "An algorithm that mixes classical Fourier transforms with quantum annealing",
                "A QFT implementation that runs on classical supercomputers in O(n) time",
                "A continuous-variable Fourier transform on coherent photonic states"
            ],
            "correct_index": 0,
            "explanation": "Because QPE only requires measuring the counting register in the computational basis, one can reuse a single physical qubit, measuring it and classically conditioning subsequent single-qubit rotations.",
            "formula": "\\text{Qubit Reuse: } 1 \\text{ physical counting qubit replaces } t \\text{ parallel qubits}",
            "code_snippet": "# Semiclassical QFT with classical feed-forward"
        },
        {
            "id": "qft_q9",
            "question": "What is the Approximate Quantum Fourier Transform (AQFT) and why is it valuable for NISQ/fault-tolerant devices?",
            "options": [
                "It truncates controlled phase gates with angles smaller than a threshold, reducing circuit depth from O(n²) to O(n log n) with negligible error",
                "It replaces all phase gates with Clifford gates",
                "It runs without any single-qubit gates",
                "It eliminates all measurement operations"
            ],
            "correct_index": 0,
            "explanation": "Gates with k > log₂(n) impart negligible phase shifts. Discarding them reduces gate count to O(n log n) and decreases physical noise vulnerability while maintaining high algorithmic fidelity.",
            "formula": "k > \\log_2\\left(\\frac{n}{\\varepsilon}\\right) \\implies R_k \\approx I",
            "code_snippet": "# AQFT truncates tiny phase rotations"
        },
        {
            "id": "qft_q10",
            "question": "If QFT is applied to the uniform superposition state |s⟩ = (1/√2ⁿ) Σ |x⟩, what is the resulting state vector?",
            "options": [
                "The basis state |00...0⟩ (all amplitudes concentrate at frequency zero)",
                "The basis state |11...1⟩",
                "The state remains in the uniform superposition |s⟩",
                "A maximally entangled Bell state pair"
            ],
            "correct_index": 0,
            "explanation": "Uniform superposition corresponds to DC frequency k = 0. The QFT converts constant spatial amplitude into a delta function at zero frequency, which is |0⟩^⊗n.",
            "formula": "\\text{QFT}\\left(\\frac{1}{\\sqrt{2^n}}\\sum_{x=0}^{2^n-1}|x\\rangle\\right) = |0\\rangle^{\\otimes n}",
            "code_snippet": "# QFT of uniform superposition produces |0...0>"
        }
    ],
    "vqe": [
        {
            "id": "vqe_q1",
            "question": "What fundamental physical theorem guarantees that the VQE expectation value ⟨ψ(θ)|H|ψ(θ)⟩ is an upper bound on the ground state energy E₀?",
            "options": [
                "The Rayleigh-Ritz Variational Principle",
                "The No-Cloning Theorem",
                "The Quantum Adiabatic Theorem",
                "Bell's Inequality Theorem"
            ],
            "correct_index": 0,
            "explanation": "The Rayleigh-Ritz variational principle states that for any normalized trial state |ψ(θ)⟩, the expectation value ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀, where E₀ is the exact lowest eigenvalue (ground state energy).",
            "formula": "\\langle \\psi(\\theta)| H |\\psi(\\theta) \\rangle \\ge E_0",
            "code_snippet": "# VQE energy evaluation: <H> >= E_0\nenergy = estimator.run([ansatz], [hamiltonian], [optimal_params]).result().values[0]"
        },
        {
            "id": "vqe_q2",
            "question": "How does VQE divide computational work between classical and quantum processors in NISQ hardware?",
            "options": [
                "The quantum processor prepares ansatz states and measures Hamiltonian observables; a classical optimizer updates parameter angles θ",
                "The quantum processor performs gradient descent; the classical processor stores the wavefunction matrix",
                "The quantum processor runs Shor's algorithm; the classical processor performs error mitigation",
                "The classical computer prepares the physical qubits; the quantum chip only does readout"
            ],
            "correct_index": 0,
            "explanation": "VQE is a hybrid quantum-classical algorithm: short-depth parameter circuits U(θ) run on the quantum chip to estimate ⟨H⟩, and a classical routine (COBYLA, SPSA, Adam) searches for θ* that minimizes the energy.",
            "formula": "\\theta^* = \\arg\\min_\\theta \\langle \\psi(\\theta)| H |\\psi(\\theta) \\rangle",
            "code_snippet": "# Hybrid loop: classical optimizer updates parameter vector theta"
        },
        {
            "id": "vqe_q3",
            "question": "What is the Unitary Coupled Cluster with Singles and Doubles (UCCSD) ansatz commonly used for in quantum chemistry VQE?",
            "options": [
                "It parameterizes electronic wavefunctions by exponentiating single and double fermionic excitation operators (T₁ + T₂)",
                "It approximates nuclear magnetic resonance spins using classical vectors",
                "It compresses the Hamiltonian into a diagonal Pauli-Z matrix",
                "It eliminates electron-electron repulsion terms"
            ],
            "correct_index": 0,
            "explanation": "UCCSD defines |ψ(θ)⟩ = exp(T − T†)|Φ_HF⟩, where T = T₁ + T₂ represents single and double electron excitations from the Hartree-Fock reference state. It is chemically motivated and particle-number conserving.",
            "formula": "U(\\theta) = \\exp\\left( \\sum_{ia} \\theta_i^a (a_a^\\dagger a_i - a_i^\\dagger a_a) + \\sum_{ijab} \\theta_{ij}^{ab} (a_a^\\dagger a_b^\\dagger a_j a_i - \\text{h.c.}) \\right)",
            "code_snippet": "from qiskit_nature.second_q.circuit.library import UCCSD"
        },
        {
            "id": "vqe_q4",
            "question": "What is the 'Barren Plateau' problem in variational quantum algorithms?",
            "options": [
                "Gradients of the cost function vanish exponentially with the number of qubits for deep, randomly initialized ansatzes",
                "The quantum processor runs out of memory during state initialization",
                "The ground state energy drops below negative infinity",
                "Classical optimizers get stuck due to floating-point rounding errors"
            ],
            "correct_index": 0,
            "explanation": "McClean et al. (2018) showed that for Haar-random or deep ansatz circuits, the variance of the gradient Var[∂⟨H⟩/∂θ] ∈ O(1/2ⁿ), making gradient descent infeasible without informed initialization.",
            "formula": "\\text{Var}\\left[ \\frac{\\partial \\langle H \\rangle}{\\partial \\theta_k} \\right] \\in O\\left(\\frac{1}{2^n}\\right)",
            "code_snippet": "# Barren plateaus: gradient variance shrinks exponentially O(2^-n)"
        },
        {
            "id": "vqe_q5",
            "question": "How does the Parameter Shift Rule compute the exact analytical gradient of a quantum circuit on real hardware?",
            "options": [
                "By evaluating the cost function at parameter shifts of +π/2 and −π/2: ∂⟨H⟩/∂θ = (⟨H⟩_{θ+π/2} − ⟨H⟩_{θ−π/2}) / 2",
                "By using classical finite difference with infinitesimal shift h = 10⁻⁸",
                "By executing backpropagation through the quantum state vector",
                "By measuring the circuit depth and multiplying by Planck's constant"
            ],
            "correct_index": 0,
            "explanation": "For gates generated by Pauli operators G = exp(−i θ P / 2), the parameter shift rule yields the exact analytical gradient via two circuit evaluations shifted by ±π/2, without numerical finite-difference instability.",
            "formula": "\\frac{\\partial \\langle H \\rangle}{\\partial \\theta} = \\frac{\\langle H \\rangle_{\\theta + \\pi/2} - \\langle H \\rangle_{\\theta - \\pi/2}}{2}",
            "code_snippet": "# Exact analytical gradient on quantum hardware via parameter shift"
        },
        {
            "id": "vqe_q6",
            "question": "How is a fermionic molecular Hamiltonian mapped into a qubit Hamiltonian measurable on quantum hardware?",
            "options": [
                "Using the Jordan-Wigner, Bravyi-Kitaev, or Parity transformations",
                "Using the Fast Fourier Transform",
                "Using Gram-Schmidt orthogonalization",
                "Using Euler angle decomposition"
            ],
            "correct_index": 0,
            "explanation": "Fermionic creation/annihilation operators satisfy anti-commutation relations. Transformations like Jordan-Wigner map fermionic modes into non-local strings of Pauli matrices: H = Σ c_k P_k.",
            "formula": "a_j^\\dagger = \\left( \\bigotimes_{k=0}^{j-1} Z_k \\right) \\otimes \\left(\\frac{X_j - iY_j}{2}\\right)",
            "code_snippet": "from qiskit_nature.second_q.mappers import JordanWignerMapper"
        },
        {
            "id": "vqe_q7",
            "question": "Why is the SPSA (Simultaneous Perturbation Stochastic Approximation) optimizer preferred over Nelder-Mead for noisy quantum hardware?",
            "options": [
                "It approximates the entire gradient vector using only 2 function evaluations per iteration regardless of parameter dimension",
                "It guarantees finding the global minimum in 1 step",
                "It runs completely on the quantum processor without classical communication",
                "It eliminates the need for shot sampling"
            ],
            "correct_index": 0,
            "explanation": "Standard gradient descent requires 2p circuit evaluations for p parameters. SPSA perturbs all parameters simultaneously in random directions, needing only 2 evaluations per step and tolerating stochastic shot noise.",
            "formula": "\\hat{g}_k(\\theta_k) = \\frac{y(\\theta_k + c_k \\Delta_k) - y(\\theta_k - c_k \\Delta_k)}{2 c_k} \\Delta_k^{-1}",
            "code_snippet": "from qiskit_algorithms.optimizers import SPSA\noptimizer = SPSA(maxiter=100)"
        },
        {
            "id": "vqe_q8",
            "question": "What is the Hardware-Efficient Ansatz (HEA) in VQE and its main advantage on NISQ chips?",
            "options": [
                "It uses alternating layers of parameterized single-qubit rotations and native native 2-qubit entanglers matching the physical chip topology",
                "It encodes exact relativistic quantum chemistry orbitals",
                "It requires zero two-qubit entangling gates",
                "It eliminates all Barren Plateaus automatically"
            ],
            "correct_index": 0,
            "explanation": "Hardware-efficient ansatzes are tailored to the native connectivity (e.g. heavy-hex or grid) of specific QPUs, minimizing SWAP overhead and circuit depth in the presence of NISQ gate noise.",
            "formula": "U(\\vec{\\theta}) = \\prod_{l=1}^L \\left( \\prod_{j} R_y(\\theta_{l,j}) R_z(\\phi_{l,j}) \\right) U_{\\text{ent}}",
            "code_snippet": "from qiskit.circuit.library import EfficientSU2"
        },
        {
            "id": "vqe_q9",
            "question": "What is the primary source of statistical error in VQE energy estimation on ideal (noiseless) simulators?",
            "options": [
                "Shot noise (finite measurement sampling variance: Var(⟨H⟩) ∝ 1/N_shots)",
                "Thermal decoherence",
                "Phase damping noise",
                "Classical floating-point rounding errors"
            ],
            "correct_index": 0,
            "explanation": "Because quantum computers measure projective observable outcomes rather than continuous expectation values, N_shots sampling introduces standard deviation σ = √(Var(H)/N_shots).",
            "formula": "\\epsilon_{\\text{shot}} = \\frac{\\sigma_H}{\\sqrt{N_{\\text{shots}}}}",
            "code_snippet": "# Shot noise scaling: error ~ 1 / sqrt(shots)"
        },
        {
            "id": "vqe_q10",
            "question": "How does Quantum Subspace Expansion (QSE) extend standard VQE to calculate excited state energies?",
            "options": [
                "By projecting the Hamiltonian into a linear subspace spanned by excitation operators acting on the optimized ground state",
                "By running the algorithm at negative Kelvin temperatures",
                "By flipping all qubits with Pauli-X before measurement",
                "By increasing the learning rate of the classical optimizer"
            ],
            "correct_index": 0,
            "explanation": "QSE diagonalizes the generalized eigenvalue problem H_ij c_j = E S_ij c_j in the subspace generated by states |ψ_i⟩ = O_i |ψ_0⟩ (where O_i are Pauli or excitation operators), yielding excited eigenvalues.",
            "formula": "\\sum_j H_{ij} c_j^k = E_k \\sum_j S_{ij} c_j^k, \\quad H_{ij} = \\langle \\psi_0 | O_i^\\dagger H O_j | \\psi_0 \\rangle",
            "code_snippet": "# Quantum Subspace Expansion for excited molecular states"
        }
    ],
    "error_correction": [
        {
            "id": "qec_q1",
            "question": "What is the minimum number of physical qubits required to detect and correct ANY arbitrary single-qubit error (bit-flip, phase-flip, or combination)?",
            "options": [
                "5 physical qubits (the 5-qubit code establishes the quantum Hamming bound)",
                "3 physical qubits",
                "7 physical qubits (Steane code)",
                "9 physical qubits (Shor code)"
            ],
            "correct_index": 0,
            "explanation": "The 5-qubit code is the smallest quantum error-correcting code capable of protecting one logical qubit against arbitrary single-qubit errors (satisfying the quantum Hamming bound 2^k · (1 + 3n) ≤ 2^n for n=5, k=1).",
            "formula": "[[n, k, d]] = [[5, 1, 3]]",
            "code_snippet": "# 5-qubit perfect stabilizer code protects against X, Y, and Z errors"
        },
        {
            "id": "qec_q2",
            "question": "In quantum stabilizer error correction, why can syndrome measurements detect errors without collapsing the logical quantum data?",
            "options": [
                "Syndromes measure multi-qubit Pauli parity operators that commute with the logical codewords",
                "Syndrome measurements only measure classical readout bits",
                "Errors are detected via the no-cloning theorem without touching qubits",
                "Measurement collapse is delayed by quantum teleportation"
            ],
            "correct_index": 0,
            "explanation": "Stabilizer operators S_i commute with the logical Pauli operators L_X and L_Z. Measuring the eigenvalues of S_i collapses the error syndrome without distinguishing between logical states |0_L⟩ and |1_L⟩.",
            "formula": "[S_i, \\bar{X}] = [S_i, \\bar{Z}] = 0, \\quad S_i |\\psi_L\\rangle = +1 |\\psi_L\\rangle",
            "code_snippet": "# Stabilizer parity check preserves logical superposition"
        },
        {
            "id": "qec_q3",
            "question": "What are the two stabilizer generators for the 3-qubit bit-flip repetition code?",
            "options": [
                "S₁ = Z₀Z₁ and S₂ = Z₁Z₂",
                "S₁ = X₀X₁ and S₂ = X₁X₂",
                "S₁ = Y₀Y₁ and S₂ = Y₁Y₂",
                "S₁ = Z₀Z₁Z₂"
            ],
            "correct_index": 0,
            "explanation": "The logical codewords are |000⟩ and |111⟩. Z₀Z₁ and Z₁Z₂ both have eigenvalue +1 on these states. If an X error flips qubit 0, Z₀Z₁ yields eigenvalue −1.",
            "formula": "S_1 = Z_0 Z_1, \\quad S_2 = Z_1 Z_2",
            "code_snippet": "# 3-qubit repetition code parity checks"
        },
        {
            "id": "qec_q4",
            "question": "How does the 9-qubit Shor code correct both bit-flip (X) and phase-flip (Z) errors?",
            "options": [
                "By concatenating a 3-qubit phase-flip code with a 3-qubit bit-flip code",
                "By continuously measuring all 9 qubits in the Y-basis",
                "By duplicating the state 9 times using ancilla cloning",
                "By applying continuous dynamic decoupling pulses"
            ],
            "correct_index": 0,
            "explanation": "Shor (1995) encoded each qubit into (|000⟩+|111⟩)/√2 and (|000⟩−|111⟩)/√2, concatenating the 3-qubit bit-flip and phase-flip codes into the first [[9, 1, 3]] code.",
            "formula": "|0_L\\rangle = \\frac{1}{2\\sqrt{2}}(|000\\rangle + |111\\rangle)(|000\\rangle + |111\\rangle)(|000\\rangle + |111\\rangle)",
            "code_snippet": "# 9-qubit Shor code concatenation"
        },
        {
            "id": "qec_q5",
            "question": "What is the code distance d of the 7-qubit Steane code [[7, 1, 3]] and what does it imply?",
            "options": [
                "d = 3, allowing it to detect up to 2 errors and correct any 1 arbitrary error (t = ⌊(d−1)/2⌋ = 1)",
                "d = 7, allowing correction of all errors on all qubits",
                "d = 1, meaning it provides no protection against phase flips",
                "d = 5, requiring 5 syndrome measurements per cycle"
            ],
            "correct_index": 0,
            "explanation": "The Steane code is a CSS code derived from the classical [7, 4, 3] Hamming code. Its distance d = 3 satisfies t = ⌊(d−1)/2⌋ = 1, correcting any arbitrary single physical qubit error.",
            "formula": "t = \\left\\lfloor \\frac{d - 1}{2} \\right\\rfloor = 1",
            "code_snippet": "# Steane [[7, 1, 3]] CSS code"
        },
        {
            "id": "qec_q6",
            "question": "What do the Knill-Laflamme conditions state for a quantum code to correct error set {E_a}?",
            "options": [
                "P E_a† E_b P = C_ab P where C_ab is a Hermitian matrix independent of the logical state",
                "All error operators must commute with one another",
                "Errors must only act on unentangled ancilla qubits",
                "The fidelity of the logical state must equal 1 after each single gate"
            ],
            "correct_index": 0,
            "explanation": "The Knill-Laflamme theorem is the fundamental necessary and sufficient condition for quantum error correction: errors must act symmetrically on all codewords so that syndrome measurement reveals the error without extracting data.",
            "formula": "P E_a^\\dagger E_b P = C_{ab} P",
            "code_snippet": "# Knill-Laflamme QEC condition"
        },
        {
            "id": "qec_q7",
            "question": "What is the fault-tolerance threshold of the 2D Surface Code under phenomenological noise?",
            "options": [
                "≈ 1.0% physical error rate (significantly higher than concatenated codes)",
                "≈ 0.0001% (extremely stringent requirement)",
                "≈ 50% (majority voting threshold)",
                "≈ 10⁻⁸ per gate"
            ],
            "correct_index": 0,
            "explanation": "The surface code exhibits a remarkably high fault-tolerance threshold of ~1% under local gate noise with nearest-neighbor 2D grid connectivity, making it the leading architecture for superconducting QPUs.",
            "formula": "p_{\\text{th}} \\approx 1.0\\%",
            "code_snippet": "# Surface code threshold ~1%"
        },
        {
            "id": "qec_q8",
            "question": "What does the Eastin-Knill Theorem state regarding transversal quantum gates?",
            "options": [
                "No quantum error-correcting code can implement a universal set of logical gates transversally (fault-tolerantly without gate teleportation/magic states)",
                "Transversal gates are always prone to exponential error propagation",
                "Only Clifford gates can be implemented on physical qubits",
                "Surface codes cannot perform logical CNOT operations"
            ],
            "correct_index": 0,
            "explanation": "The Eastin-Knill theorem proves that any QEC code that can protect against errors cannot have a continuous group of transversal symmetries, forbidding universal transversal gate sets.",
            "formula": "\\text{No code can have universal transversal logical gates}",
            "code_snippet": "# Eastin-Knill theorem dictates magic state distillation"
        },
        {
            "id": "qec_q9",
            "question": "How are non-Clifford gates (such as the T gate) implemented in surface-code architectures?",
            "options": [
                "Via Magic State Distillation (Bravyi-Kitaev protocol) followed by gate teleportation",
                "By decreasing the physical temperature of the dilution refrigerator",
                "By measuring the stabilizers faster than the decoherence rate",
                "Using classical lookup tables without quantum operations"
            ],
            "correct_index": 0,
            "explanation": "Because Eastin-Knill forbids transversal T gates on CSS/surface codes, noisy copies of magic states |T⟩ = (|0⟩ + e^(iπ/4)|1⟩)/√2 are distilled to ultra-high fidelity and injected into the circuit via teleportation.",
            "formula": "|T\\rangle = \\cos\\left(\\frac{\\pi}{8}\\right)|0\\rangle + \\sin\\left(\\frac{\\pi}{8}\\right)|1\\rangle",
            "code_snippet": "# Magic state distillation protocol"
        },
        {
            "id": "qec_q10",
            "question": "In the planar surface code with code distance d, how many physical data and syndrome qubits are required?",
            "options": [
                "d² data qubits + (d² − 1) syndrome measurement qubits (total ≈ 2d² − 1)",
                "d qubits total",
                "2^d physical qubits",
                "d³ physical qubits"
            ],
            "correct_index": 0,
            "explanation": "A square planar surface code of distance d uses d² data qubits arranged on vertices/edges and d² − 1 ancilla qubits interleaved to measure X-face and Z-vertex stabilizer plaquettes.",
            "formula": "N_{\\text{physical}} = 2d^2 - 1",
            "code_snippet": "# Surface code scaling: N ~ 2*d^2"
        }
    ],
    "superposition": [
        {
            "id": "sup_q1",
            "question": "A single qubit is prepared in state |ψ⟩ = 1/2 |0⟩ + (√3/2) |1⟩. What is the probability of measuring state |1⟩ in the standard computational basis?",
            "options": [
                "75% (3/4)",
                "50% (1/2)",
                "25% (1/4)",
                "86.6% (√3/2)"
            ],
            "correct_index": 0,
            "explanation": "Born's rule states P(|1⟩) = |β|² = |√3/2|² = 3/4 = 0.75 (75%).",
            "formula": "P(|1\\rangle) = |\\beta|^2 = \\left| \\frac{\\sqrt{3}}{2} \\right|^2 = \\frac{3}{4} = 75\\%",
            "code_snippet": "# Born's rule: P(1) = 0.75"
        },
        {
            "id": "sup_q2",
            "question": "What is the inner product ⟨+|−⟩ between the two Hadamard superposition states |+⟩ and |−⟩?",
            "options": [
                "0 (they are orthonormal basis states)",
                "1",
                "−1",
                "1/√2"
            ],
            "correct_index": 0,
            "explanation": "⟨+|−⟩ = (1/2)(⟨0| + ⟨1|)(|0⟩ − |1⟩) = (1/2)(⟨0|0⟩ − ⟨0|1⟩ + ⟨1|0⟩ − ⟨1|1⟩) = (1/2)(1 − 0 + 0 − 1) = 0.",
            "formula": "\\langle + | - \\rangle = \\frac{1}{2}(\\langle 0| + \\langle 1|)(|0\\rangle - |1\\rangle) = 0",
            "code_snippet": "# Orthonormal Hadamard basis: <+|-> = 0"
        },
        {
            "id": "sup_q3",
            "question": "Why does a global phase factor e^(iθ) in |ψ⟩ = e^(iθ)(α|0⟩ + β|1⟩) have no observable physical consequence?",
            "options": [
                "The density matrix ρ = |ψ⟩⟨ψ| and all expectation values ⟨ψ|A|ψ⟩ are invariant under e^(iθ)",
                "Global phases are automatically eliminated by decoherence",
                "Measurement devices can only detect real numbers",
                "Global phases only affect classical bits"
            ],
            "correct_index": 0,
            "explanation": "Multiplying a state vector by e^(iθ) yields ρ' = (e^(iθ)|ψ⟩)(⟨ψ|e^(−iθ)) = |ψ⟩⟨ψ| = ρ. All physical observables Tr(ρA) are completely invariant.",
            "formula": "\\rho' = e^{i\\theta}|\\psi\\rangle\\langle\\psi|e^{-i\\theta} = |\\psi\\rangle\\langle\\psi| = \\rho",
            "code_snippet": "# Global phase is physically unobservable"
        },
        {
            "id": "sup_q4",
            "question": "What is the state of n qubits after applying a Hadamard gate to each qubit initialized in |0...0⟩?",
            "options": [
                "An equal superposition of all 2ⁿ computational basis states with amplitude 1/√(2ⁿ)",
                "A GHZ entangled state (|0...0⟩ + |1...1⟩)/√2",
                "The computational basis state |1...1⟩",
                "A completely random mixed state"
            ],
            "correct_index": 0,
            "explanation": "H^⊗n |0...0⟩ = ⨂_{i=1}^n (|0⟩+|1⟩)/√2 = (1/√(2ⁿ)) Σ_{x=0}^{2ⁿ−1} |x⟩, creating an equal superposition over all 2ⁿ states.",
            "formula": "H^{\\otimes n}|0\\rangle^{\\otimes n} = \\frac{1}{\\sqrt{2^n}}\\sum_{x=0}^{2^n-1}|x\\rangle",
            "code_snippet": "qc.h(range(n))  # Creates equal superposition of 2^n states"
        },
        {
            "id": "sup_q5",
            "question": "What distinguishes a pure quantum superposition from a classical statistical mixture?",
            "options": [
                "A pure superposition possesses off-diagonal phase coherence in its density matrix and can produce quantum interference",
                "A classical mixture has higher purity Tr(ρ²) than a pure state",
                "Superpositions can only exist at zero Kelvin",
                "Classical mixtures violate Bell's inequalities"
            ],
            "correct_index": 0,
            "explanation": "A pure state |+⟩ has density matrix ρ = [[0.5, 0.5], [0.5, 0.5]] with non-zero off-diagonal coherence terms, whereas a 50/50 classical mixture has ρ = [[0.5, 0], [0, 0.5]] with zero interference capability.",
            "formula": "\\rho_{\\text{pure}} = \\begin{bmatrix} 0.5 & 0.5 \\\\ 0.5 & 0.5 \\end{bmatrix} \\quad \\text{vs} \\quad \\rho_{\\text{mixed}} = \\begin{bmatrix} 0.5 & 0 \\\\ 0 & 0.5 \\end{bmatrix}",
            "code_snippet": "# Quantum coherence resides in off-diagonal density matrix elements"
        },
        {
            "id": "sup_q6",
            "question": "On the Bloch sphere, where does the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2 lie?",
            "options": [
                "On the equator at coordinates (x=1, y=0, z=0)",
                "At the North Pole (z=1)",
                "At the South Pole (z=−1)",
                "At the center of the sphere (0, 0, 0)"
            ],
            "correct_index": 0,
            "explanation": "State |+⟩ has polar angle θ = π/2 and azimuthal phase ϕ = 0. Its Bloch coordinates are (sin θ cos ϕ, sin θ sin ϕ, cos θ) = (1, 0, 0) along the positive X-axis.",
            "formula": "\\vec{r}_{|+\\rangle} = (1, 0, 0)",
            "code_snippet": "# |+> points along +X on the Bloch sphere"
        },
        {
            "id": "sup_q7",
            "question": "If a qubit in state |+⟩ is measured in the computational basis {|0⟩, |1⟩}, what is the state immediately following the measurement?",
            "options": [
                "It collapses irreversibly to either |0⟩ or |1⟩ with equal 50% probability",
                "It remains in |+⟩",
                "It transitions into the orthogonal state |−⟩",
                "It becomes entangled with the measurement apparatus without collapsing"
            ],
            "correct_index": 0,
            "explanation": "Von Neumann's projection postulate states that projective measurement collapses the wavefunction into the corresponding eigenstate |0⟩ or |1⟩.",
            "formula": "|\\psi\\rangle \\xrightarrow{\\text{measurement}} |k\\rangle \\quad \\text{with probability } P(k) = |\\langle k|\\psi\\rangle|^2",
            "code_snippet": "# Wavefunction collapse upon projective readout"
        },
        {
            "id": "sup_q8",
            "question": "What is the purity Tr(ρ²) of any pure state |ψ⟩?",
            "options": [
                "Exactly 1.0 (Tr(ρ²) = 1)",
                "0.5",
                "0.0",
                "Between 0 and 0.5"
            ],
            "correct_index": 0,
            "explanation": "For any pure state, ρ² = (|ψ⟩⟨ψ|)(|ψ⟩⟨ψ|) = |ψ⟩(⟨ψ|ψ⟩)⟨ψ| = |ψ⟩⟨ψ| = ρ. Therefore Tr(ρ²) = Tr(ρ) = 1. For mixed states, Tr(ρ²) < 1.",
            "formula": "\\text{Tr}(\\rho^2) = 1 \\iff \\rho \\text{ is pure}",
            "code_snippet": "# Purity of pure state is identically 1"
        },
        {
            "id": "sup_q9",
            "question": "What happens when two quantum paths with equal amplitude but opposite phases (relative phase of π) interfere?",
            "options": [
                "Destructive interference occurs, causing the probability amplitude of that outcome to vanish completely",
                "Constructive interference doubles the probability",
                "A spontaneous photon is emitted",
                "The qubit becomes entangled with the environment"
            ],
            "correct_index": 0,
            "explanation": "Amplitudes sum linearly: (1/√2) − (1/√2) = 0. The probability |0|² = 0. This destructive cancellation of unwanted computational paths is the basis of all quantum speedups.",
            "formula": "A_{\\text{total}} = A_1 + A_2 = \\frac{1}{\\sqrt{2}} + \\frac{e^{i\\pi}}{\\sqrt{2}} = 0 \\implies P = |A_{\\text{total}}|^2 = 0",
            "code_snippet": "# Destructive interference cancels amplitude"
        },
        {
            "id": "sup_q10",
            "question": "What is the physical significance of the Mach-Zehnder interferometer in demonstrating quantum superposition?",
            "options": [
                "A single photon traverses both optical arms simultaneously in a superposition of paths, exhibiting interference at the output detectors",
                "It proves light only behaves as a classical particle",
                "It generates entangled photon pairs via parametric down-conversion",
                "It violates energy conservation during destructive interference"
            ],
            "correct_index": 0,
            "explanation": "Even when photons are fired one at a time, each photon interferes with itself across the two spatial arms, demonstrating that the single photon exists in a coherent spatial superposition |path A⟩ + |path B⟩.",
            "formula": "|\\psi_{\\text{photon}}\\rangle = \\frac{1}{\\sqrt{2}}|\\text{Arm}_1\\rangle + \\frac{1}{\\sqrt{2}}|\\text{Arm}_2\\rangle",
            "code_snippet": "# Single-photon path superposition"
        }
    ],
    "teleportation": [
        {
            "id": "tel_q1",
            "question": "How many classical bits must Alice transmit to Bob to successfully complete quantum teleportation of an unknown single qubit state?",
            "options": [
                "Exactly 2 classical bits",
                "1 classical bit",
                "4 classical bits",
                "0 classical bits (instantaneous nonlocal transfer)"
            ],
            "correct_index": 0,
            "explanation": "Alice performs a Bell-basis measurement on her two qubits, yielding one of 4 possible 2-bit outcomes (00, 01, 10, 11). Bob requires these 2 classical bits to apply the matching Pauli correction.",
            "formula": "|\\psi\\rangle \\to \\text{Bell Measurement} \\to 2 \\text{ Classical Bits} \\to X^a Z^b |\\psi\\rangle",
            "code_snippet": "qc.measure(0, 0)\nqc.measure(1, 1)\n# Exactly 2 classical bits transmitted"
        },
        {
            "id": "tel_q2",
            "question": "Which quantum circuit sequence is performed by Alice to measure in the Bell basis?",
            "options": [
                "Apply CNOT with unknown qubit as control and her Bell-pair qubit as target, followed by Hadamard on the unknown qubit",
                "Apply Hadamard on both qubits, followed by CNOT",
                "Apply SWAP between the two qubits",
                "Measure both qubits directly in the Pauli-Y basis"
            ],
            "correct_index": 0,
            "explanation": "The Bell-basis measurement is the exact reverse of Bell state preparation: CNOT(q_unknown, q_shared) un-entangles the states, and H(q_unknown) rotates the basis into computational readouts.",
            "formula": "\\text{Bell Analyzer} = (H \\otimes I) \\cdot \\text{CNOT}",
            "code_snippet": "qc.cx(unknown_qubit, alice_bell_qubit)\nqc.h(unknown_qubit)\nqc.measure([unknown_qubit, alice_bell_qubit], [0, 1])"
        },
        {
            "id": "tel_q3",
            "question": "If Alice measures outcome (1, 1) [meaning q0=1 and q1=1], which Pauli correction operator must Bob apply to his qubit?",
            "options": [
                "X · Z (both Pauli-X and Pauli-Z)",
                "Identity operator I (no correction)",
                "Pauli-X only",
                "Pauli-Z only"
            ],
            "correct_index": 0,
            "explanation": "Outcome 00 corresponds to I, 01 corresponds to X, 10 corresponds to Z, and 11 corresponds to XZ (or ZX up to global phase). Bob applies both bit-flip and phase-flip corrections.",
            "formula": "\\text{Correction}(1, 1) = X Z",
            "code_snippet": "if c1 == 1: qc.x(bob_qubit)\nif c0 == 1: qc.z(bob_qubit)"
        },
        {
            "id": "tel_q4",
            "question": "Why does quantum teleportation NOT enable faster-than-light (superluminal) communication?",
            "options": [
                "Bob's qubit remains in a maximally mixed state ρ = I/2 with zero accessible information until Alice's classical bits arrive at or below light speed",
                "Quantum entanglement decays instantaneously over distances greater than 1 kilometer",
                "The no-cloning theorem blocks all signal propagation",
                "The speed of light increases inside quantum circuits"
            ],
            "correct_index": 0,
            "explanation": "Prior to receiving Alice's measurement outcomes, Bob's density matrix is ρ_Bob = (1/4)(|ψ⟩⟨ψ| + X|ψ⟩⟨ψ|X + Z|ψ⟩⟨ψ|Z + XZ|ψ⟩⟨ψ|ZX) = I/2. No local measurement can reveal any information until the classical bits arrive.",
            "formula": "\\rho_{\\text{Bob}}^{\\text{before classical info}} = \\frac{1}{2}I_2",
            "code_snippet": "# Causality preserved: classical bit transfer strictly obeys c"
        },
        {
            "id": "tel_q5",
            "question": "Why does quantum teleportation NOT violate the No-Cloning Theorem?",
            "options": [
                "Alice's original unknown quantum state is destroyed during her projective Bell measurement",
                "The state teleported is only an approximation with 50% fidelity",
                "No-cloning only applies to macroscopic particles",
                "The state is cloned in a parallel universe"
            ],
            "correct_index": 0,
            "explanation": "Alice's Bell-basis measurement projects and collapses her original qubit, destroying its quantum state. The state is reconstructed at Bob's end, not cloned.",
            "formula": "|\\psi\\rangle \\xrightarrow{\\text{teleport}} \\text{Destroyed at Alice} \\implies \\text{Reconstructed at Bob}",
            "code_snippet": "# Original state destroyed: no cloning violation"
        },
        {
            "id": "tel_q6",
            "question": "What is Entanglement Swapping (teleportation of entanglement)?",
            "options": [
                "Teleporting one half of an entangled pair to entangle two distant particles that have never directly interacted",
                "Exchanging classical bits for quantum bits in a repeater node",
                "Swapping qubit indices using classical SWAP gates",
                "Converting photon polarization into electron spin"
            ],
            "correct_index": 0,
            "explanation": "If Alice holds halves of two independent Bell pairs (A1-B1 and A2-B2) and performs a Bell measurement on A1 and A2, particles B1 and B2 become entangled without ever interacting directly.",
            "formula": "|\\Phi^+\\rangle_{A_1 B_1} \\otimes |\\Phi^+\\rangle_{A_2 B_2} \\xrightarrow{\\text{Bell}(A_1, A_2)} \\text{Entangles } B_1 \\text{ and } B_2",
            "code_snippet": "# Entanglement swapping creates remote entanglement without direct interaction"
        },
        {
            "id": "tel_q7",
            "question": "What is Gate Teleportation (Gottesman-Chuang protocol)?",
            "options": [
                "Applying a quantum gate to a target qubit by preparing an entangled ancilla state and teleporting the gate action fault-tolerantly",
                "Transmitting quantum gates via fiber optic cables",
                "Using classical internet routers to execute quantum algorithms",
                "Running gates backwards in time"
            ],
            "correct_index": 0,
            "explanation": "Gottesman & Chuang (1999) proved that non-Clifford gates (like the T gate) can be applied by preparing an offline resource state |ψ_T⟩ = T|+⟩ and executing teleportation with Clifford corrections, key to fault-tolerant computation.",
            "formula": "\\text{Gate Teleportation: Offline state preparation } + \\text{ Clifford corrections}",
            "code_snippet": "# Gottesman-Chuang gate teleportation"
        },
        {
            "id": "tel_q8",
            "question": "What is the maximum classical communication capacity of a single qubit via Dense Coding (the inverse of teleportation)?",
            "options": [
                "2 classical bits of information using 1 shared entangled pair and 1 transmitted qubit",
                "1 classical bit",
                "4 classical bits",
                "Infinite classical bits"
            ],
            "correct_index": 0,
            "explanation": "Superdense coding allows Alice to transmit 2 classical bits to Bob by sending just 1 physical qubit, made possible by their pre-shared entangled Bell state.",
            "formula": "1 \\text{ transmitted qubit} + 1 \\text{ Bell pair} = 2 \\text{ classical bits}",
            "code_snippet": "# Superdense coding transmits 2 bits per qubit"
        },
        {
            "id": "tel_q9",
            "question": "What quantum resource is primarily consumed during each execution of the standard teleportation protocol?",
            "options": [
                "1 ebit (one maximally entangled 2-qubit Bell state)",
                "1 classical megabyte of bandwidth",
                "1 cryogenic cooling cycle",
                "1 milliwatt of laser power"
            ],
            "correct_index": 0,
            "explanation": "An 'ebit' is the unit of bipartite entanglement. Teleporting one unknown qubit consumes exactly one ebit, destroying the entanglement between Alice and Bob.",
            "formula": "\\text{Resource cost: } 1 \\text{ ebit} + 2 \\text{ classical bits}",
            "code_snippet": "# Consumes exactly 1 ebit per teleportation"
        },
        {
            "id": "tel_q10",
            "question": "In a quantum repeater network, why is teleportation combined with entanglement purification/distillation essential?",
            "options": [
                "To overcome exponential photon loss and decoherence across long-distance optical fiber links",
                "To amplify the optical laser signal without using classical electricity",
                "To prevent hackers from reading the classical routing headers",
                "To synchronize atomic clocks across international borders"
            ],
            "correct_index": 0,
            "explanation": "Optical fibers attenuate signals exponentially (e.g. 0.2 dB/km). Classical amplifiers cannot clone quantum states. Quantum repeaters divide the distance into short segments, purify noisy entanglement, and swap it across the network.",
            "formula": "F_{\\text{purified}} > F_{\\text{raw}}, \\quad \\text{Overcomes exponential loss } e^{-\\alpha L}",
            "code_snippet": "# Quantum repeaters use entanglement purification and swapping"
        }
    ]
}
