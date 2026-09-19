#!/usr/bin/env python3
"""
Quantum Leap — Socratic Quantum Dataset Generator
===================================================
Generates high-fidelity, pedagogically structured training pairs for fine-tuning
Meta Llama-3.1-8B-Instruct (and DeepSeek/Qwen models) into an elite Quantum Algorithm AI Tutor.

Each example includes:
  - Intuitive real-world analogy (accessible to learners)
  - Rigorous mathematical formulation (Dirac / matrix LaTeX notation)
  - 100% runnable Qiskit 1.0+ code with explicit gate definitions
  - Diagnostic Socratic quiz probing typical student misconceptions
  - Direct academic citations from canonical literature (Nielsen & Chuang, Watrous, Preskill)
"""

import json
import os
from typing import List, Dict, Any

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data"))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "quantum_tutor_dataset.jsonl")

CORE_TOPICS = [
    {
        "topic": "Quantum Superposition & The Bloch Sphere",
        "instruction": "What is quantum superposition, and how does the Hadamard gate create it from a classical basis state?",
        "context": "Student is studying single-qubit gates on a 1-qubit circuit initialized to |0>.",
        "intent_classification": "quantum_superposition_hadamard",
        "vocal_prose_script": (
            "Think of a classical bit like a coin lying flat on a table—it is definitively heads (0) or tails (1). "
            "Superposition is like that coin spinning rapidly in mid-air: while in motion, it has a definite state described "
            "by quantum mechanics, but once you slap it onto the table (perform a measurement), it collapses into either 0 or 1. "
            "The Hadamard gate acts as this quantum 'flick', taking the computational basis state |0> and placing it into an equal "
            "linear combination |+> = (|0> + |1>)/sqrt(2), where measuring yields 0 or 1 with exactly 50% probability."
        ),
        "mathematical_latex_formula": (
            r"H|0\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}\begin{pmatrix} 1 \\ 0 \end{pmatrix} = "
            r"\frac{|0\rangle + |1\rangle}{\sqrt{2}} = |+\rangle,\quad P(0) = |\langle 0|+\rangle|^2 = \frac{1}{2}"
        ),
        "qiskit_executable_code": (
            "from qiskit import QuantumCircuit\n"
            "# Initialize 1-qubit circuit\n"
            "qc = QuantumCircuit(1, 1)\n"
            "qc.h(0)  # Apply Hadamard gate to put q0 in superposition\n"
            "qc.measure(0, 0)\n"
            "print(qc.draw(output='text'))"
        ),
        "quiz": {
            "question": "If you apply a Hadamard gate to the state |1>, what is the resulting state and measurement probability?",
            "options": [
                "State |-> = (|0> - |1>)/sqrt(2) with 50% probability of measuring 0 or 1",
                "State |+> = (|0> + |1>)/sqrt(2) with 100% probability of measuring 1",
                "State |0> deterministically with 0% chance of measuring 1",
                "State i|1> with a global imaginary phase"
            ],
            "answer": 0,
            "explanation": "H|1> = (|0> - |1>)/sqrt(2) (the |-> state). Its relative phase is -1, but the measurement probabilities are |1/sqrt(2)|^2 = 50% for 0 and |-1/sqrt(2)|^2 = 50% for 1."
        },
        "sources": [
            "Nielsen & Chuang – Quantum Computation and Quantum Information, Sec 1.2",
            "Watrous – Introduction to Quantum Information and Quantum Circuits, Lecture 1"
        ]
    },
    {
        "topic": "Quantum Entanglement & Bell State Generation",
        "instruction": "Explain how quantum entanglement works and show how to create the canonical Bell state |Phi+> using Qiskit.",
        "context": "Student has 2 qubits and wants to understand why measuring one affects the other instantaneously.",
        "intent_classification": "bell_state_entanglement",
        "vocal_prose_script": (
            "Imagine two magic dice separated by light-years. When rolled independently, each die lands on a completely random number. "
            "However, if the pair is quantumly entangled, whenever Alice looks at her die and sees a 6, Bob's die is guaranteed to show a 6 immediately, "
            "even without transmitting any signal between them. "
            "We engineer this state on a quantum computer by first putting the control qubit into superposition with a Hadamard gate, "
            "and then executing a CNOT gate targeting the second qubit. This creates the maximally entangled Bell pair (|00> + |11>)/sqrt(2)."
        ),
        "mathematical_latex_formula": (
            r"|\Phi^+\rangle = \text{CNOT}_{0 \to 1}(H \otimes I)|00\rangle = \text{CNOT}_{0 \to 1}\left(\frac{|00\rangle + |10\rangle}{\sqrt{2}}\right) = "
            r"\frac{|00\rangle + |11\rangle}{\sqrt{2}}"
        ),
        "qiskit_executable_code": (
            "from qiskit import QuantumCircuit\n"
            "# 2-qubit Bell State preparation circuit\n"
            "qc = QuantumCircuit(2, 2)\n"
            "qc.h(0)         # Put control qubit into superposition\n"
            "qc.cx(0, 1)     # Entangle qubit 0 with qubit 1\n"
            "qc.measure([0, 1], [0, 1])\n"
            "print(qc.draw(output='text'))"
        ),
        "quiz": {
            "question": "Does measuring an entangled Bell state allow faster-than-light (FTL) communication between Alice and Bob?",
            "options": [
                "No, because Alice's individual measurement outcome is completely random, so no message is transmitted without classical communication.",
                "Yes, because the state reduction occurs instantaneously across arbitrary spatial distances.",
                "Yes, but only if both qubits use superconducting transmon hardware.",
                "No, because entanglement breaks down after 1 millisecond due to relativistic time dilation."
            ],
            "answer": 0,
            "explanation": "No-communication theorem: Individual reduced density matrices remain maximally mixed (rho_A = I/2), so Bob cannot distinguish whether Alice measured her qubit without receiving classical information."
        },
        "sources": [
            "Bennett et al. – Teleporting an Unknown Quantum State via Dual Classical and Einstein-Podolsky-Rosen Channels (PRL 1993)",
            "Preskill – Quantum Information Lecture Notes, Ch. 2 (Foundations of Entanglement)"
        ]
    },
    {
        "topic": "Grover's Search Algorithm & Phase Kickback",
        "instruction": "Why does Grover's search algorithm provide a quadratic speedup, and how does the diffusion operator amplify the target state?",
        "context": "Student wants to search an unstructured database of N items in O(sqrt(N)) oracle evaluations.",
        "intent_classification": "grover_search_diffusion",
        "vocal_prose_script": (
            "Imagine a crowd where only one person knows a secret code. In classical computing, you must ask every person one-by-one, taking on average N/2 questions. "
            "Grover's algorithm treats the probability amplitudes of all candidates like ocean waves. First, a phase oracle marks the correct item by flipping its wave upside-down (negative amplitude). "
            "Then, the Grover diffusion operator acts like an 'inversion about the average': since the marked item is below the mean, inverting everyone about the average dramatically boosts its crest while suppressing all wrong items. "
            "Repeating this cycle approximately (pi/4)*sqrt(N) times concentrates nearly 100% of the probability on the target."
        ),
        "mathematical_latex_formula": (
            r"U_s = 2|s\rangle\langle s| - I,\quad O_f|x\rangle = (-1)^{f(x)}|x\rangle,\quad k_{\text{opt}} \approx \left\lfloor \frac{\pi}{4}\sqrt{N} \right\rfloor"
        ),
        "qiskit_executable_code": (
            "from qiskit import QuantumCircuit\n"
            "# 2-qubit Grover Search targeting state |11>\n"
            "qc = QuantumCircuit(2, 2)\n"
            "# 1. Initialize equal superposition\n"
            "qc.h([0, 1])\n"
            "# 2. Phase Oracle marking |11> (CZ gate)\n"
            "qc.cz(0, 1)\n"
            "# 3. Grover Diffusion Operator\n"
            "qc.h([0, 1])\n"
            "qc.x([0, 1])\n"
            "qc.cz(0, 1)\n"
            "qc.x([0, 1])\n"
            "qc.h([0, 1])\n"
            "qc.measure_all()\n"
            "print(qc.draw(output='text'))"
        ),
        "quiz": {
            "question": "What happens if you run Grover's algorithm for significantly more than (pi/4)*sqrt(N) iterations?",
            "options": [
                "The target probability over-rotates past 100% and begins to decrease back toward zero.",
                "The target probability saturates at exactly 100% and remains there indefinitely.",
                "The quantum state automatically collapses into the ground state |00...0>.",
                "The circuit undergoes exponential decoherence regardless of error rates."
            ],
            "answer": 0,
            "explanation": "Grover's algorithm performs a rotation in a 2D subspace spanned by the target and orthogonal states. Over-rotating past the target state causes the amplitude to swing away from the solution."
        },
        "sources": [
            "Grover – A Fast Quantum Mechanical Algorithm for Database Search (STOC 1996)",
            "Boyer, Brassard, Høyer, Tapp – Tight Bounds on Quantum Searching (Fortschritte der Physik 1998)"
        ]
    },
    {
        "topic": "Quantum Teleportation Protocol",
        "instruction": "Explain the step-by-step mechanism of quantum teleportation and why the no-cloning theorem is respected.",
        "context": "Student wants to transfer an unknown quantum state |psi> from Alice to Bob using pre-shared entanglement.",
        "intent_classification": "quantum_teleportation_protocol",
        "vocal_prose_script": (
            "Quantum teleportation does not physically transport matter like science fiction; it transfers the exact quantum state information of a qubit. "
            "Alice and Bob first share an entangled Bell pair. Alice brings her unknown qubit |psi> together with her half of the Bell pair, "
            "and performs a joint Bell-basis measurement. This measurement destroys the original state on Alice's side (respecting the no-cloning theorem) "
            "and produces two classical bits. Once Alice sends these two bits to Bob via an everyday classical channel, Bob applies a specific Pauli correction (X, Z, or both) "
            "to reconstitute |psi> with 100% fidelity."
        ),
        "mathematical_latex_formula": (
            r"|\psi\rangle_A \otimes |\Phi^+\rangle_{AB} = \frac{1}{2}\sum_{i=0}^3 |\Phi_i\rangle_A \otimes \sigma_i |\psi\rangle_B "
            r"\xrightarrow{\text{Alice measures } i} \text{Bob applies } \sigma_i^\dagger \implies |\psi\rangle_B"
        ),
        "qiskit_executable_code": (
            "from qiskit import QuantumCircuit\n"
            "# 3-qubit Teleportation Circuit (q0: State, q1: Alice EPR, q2: Bob EPR)\n"
            "qc = QuantumCircuit(3, 2)\n"
            "# Prepare state |psi> to teleport on q0 (e.g. Rx rotation)\n"
            "qc.rx(1.2, 0)\n"
            "# Create Bell pair between q1 and q2\n"
            "qc.h(1)\n"
            "qc.cx(1, 2)\n"
            "# Alice Bell-basis measurement on (q0, q1)\n"
            "qc.cx(0, 1)\n"
            "qc.h(0)\n"
            "qc.measure([0, 1], [0, 1])\n"
            "# Bob applies conditional Pauli corrections\n"
            "qc.cx(1, 2)\n"
            "qc.cz(0, 2)\n"
            "print(qc.draw(output='text'))"
        ),
        "quiz": {
            "question": "Why does quantum teleportation not violate the No-Cloning Theorem?",
            "options": [
                "Because Alice's Bell-basis measurement completely destroys her original qubit state during the protocol.",
                "Because teleportation only works on orthogonal classical bits.",
                "Because Bob's qubit is only an approximate mixed-state copy.",
                "Because the speed of light limits the duration of the entanglement channel."
            ],
            "answer": 0,
            "explanation": "The No-Cloning Theorem forbids creating identical copies of an arbitrary unknown quantum state. Teleportation transfers the state while destroying the original source state."
        },
        "sources": [
            "Wootters & Zurek – A Single Quantum Cannot Be Cloned (Nature 1982)",
            "Bennett et al. – Teleporting an Unknown Quantum State via EPR Channels (PRL 1993)"
        ]
    },
    {
        "topic": "Quantum Fourier Transform (QFT) & Phase Estimation",
        "instruction": "How does the Quantum Fourier Transform work, and how does it relate to classical FFT?",
        "context": "Student is learning algorithm acceleration for period finding and Shor's algorithm.",
        "intent_classification": "quantum_fourier_transform",
        "vocal_prose_script": (
            "Classical Fast Fourier Transform (FFT) converts discrete time signals into frequency components in O(N log N) steps. "
            "The Quantum Fourier Transform performs the exact same mathematical transformation directly on the amplitude vector of a quantum state, "
            "but achieves an exponential speedup: it requires only O(n^2) quantum gates for n qubits (where N = 2^n states!). "
            "It decomposes the global transformation into a cascading sequence of Hadamard gates followed by controlled phase rotation gates (CPHASE) "
            "with angles halving at each qubit level, concluded by wire swap operations."
        ),
        "mathematical_latex_formula": (
            r"\text{QFT}|j\rangle = \frac{1}{\sqrt{2^n}}\sum_{k=0}^{2^n-1} \omega_n^{jk}|k\rangle,\quad \omega_n = e^{2\pi i / 2^n},\quad \text{Gate Complexity } O(n^2)"
        ),
        "qiskit_executable_code": (
            "from qiskit import QuantumCircuit\n"
            "import numpy as np\n"
            "# 3-qubit Quantum Fourier Transform\n"
            "qc = QuantumCircuit(3)\n"
            "# Qubit 0\n"
            "qc.h(0)\n"
            "qc.cp(np.pi / 2, 1, 0)\n"
            "qc.cp(np.pi / 4, 2, 0)\n"
            "# Qubit 1\n"
            "qc.h(1)\n"
            "qc.cp(np.pi / 2, 2, 1)\n"
            "# Qubit 2\n"
            "qc.h(2)\n"
            "# Swap outer qubits for standard endianness\n"
            "qc.swap(0, 2)\n"
            "print(qc.draw(output='text'))"
        ),
        "quiz": {
            "question": "Can we directly read out all 2^n Fourier frequency amplitudes in a single run of QFT?",
            "options": [
                "No; measurement collapses the state, yielding only a single sample according to its probability distribution.",
                "Yes; quantum parallelism allows simultaneous classical readout of all Fourier coefficients.",
                "Yes; by applying the conjugate transpose QFT gate.",
                "No; because QFT only operates on Hermitian matrix observables."
            ],
            "answer": 0,
            "explanation": "Even though QFT computes the full Fourier spectrum across all 2^n basis states in quantum superposition, measurement collapses the wavefunction to one eigenvalue. Algorithms like Phase Estimation extract specific global properties like periodicity."
        },
        "sources": [
            "Coppersmith – An Approximate Fourier Transform Useful in Quantum Factoring (IBM Tech Report 1994)",
            "Shor – Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer (SIAM 1997)"
        ]
    },
    {
        "topic": "Variational Quantum Eigensolver (VQE) for Chemistry",
        "instruction": "Explain how VQE finds ground-state molecular energies on near-term NISQ quantum computers.",
        "context": "Student wants to understand hybrid quantum-classical algorithms and molecular simulation.",
        "intent_classification": "vqe_molecular_simulation",
        "vocal_prose_script": (
            "Simulating electron interactions in complex molecules requires classical supercomputers to store exponentially large matrices. "
            "The Variational Quantum Eigensolver (VQE) circumvents this by splitting the workload: a quantum processor prepares a parameterized ansatz state U(theta)|0> "
            "and measures the expected energy <H>, while a classical optimizer adjusts the rotation parameters theta in a closed loop to minimize this energy. "
            "The Rayleigh-Ritz variational principle guarantees that the measured energy is always greater than or equal to the true molecular ground state energy E0."
        ),
        "mathematical_latex_formula": (
            r"\langle H \rangle(\vec{\theta}) = \langle 0| U^\dagger(\vec{\theta}) H U(\vec{\theta}) |0\rangle \;\ge\; E_0,\quad "
            r"\vec{\theta}_{k+1} = \vec{\theta}_k - \eta \nabla_{\vec{\theta}} \langle H \rangle"
        ),
        "qiskit_executable_code": (
            "from qiskit.circuit.library import EfficientSU2\n"
            "import numpy as np\n"
            "# 2-qubit parameterized hardware-efficient ansatz for VQE\n"
            "ansatz = EfficientSU2(num_qubits=2, reps=1, entanglement='linear')\n"
            "ansatz = ansatz.decompose()\n"
            "# Bind sample parameters\n"
            "params = {p: 0.5 for p in ansatz.parameters}\n"
            "bound_circuit = ansatz.assign_parameters(params)\n"
            "print(bound_circuit.draw(output='text'))"
        ),
        "quiz": {
            "question": "What is the primary cause of 'barren plateaus' in deep parameterized quantum circuits during VQE training?",
            "options": [
                "The gradients of the cost function vanish exponentially with the number of qubits due to concentration of measure.",
                "The classical optimizer converges prematurely into the absolute minimum.",
                "Qubit coupling errors cause hardware cross-talk exclusively on linear topologies.",
                "The variational principle ceases to hold for non-Hermitian observables."
            ],
            "answer": 0,
            "explanation": "McClean et al. (2018) proved that for sufficiently expressive random parameterized circuits, the variance of gradients decays exponentially as O(2^-n), rendering standard gradient descent ineffective without localized cost functions."
        },
        "sources": [
            "Peruzzo et al. – A Variational Eigenvalue Solver on a Photonic Quantum Processor (Nat. Commun. 2014)",
            "McClean et al. – Barren Plateaus in Quantum Neural Network Training Landscapes (Nat. Commun. 2018)"
        ]
    },
    {
        "topic": "Quantum Error Correction & The Shor 9-Qubit Code",
        "instruction": "Why can quantum computers not use simple classical repetition codes, and how does Shor's code protect against both bit-flip and phase-flip errors?",
        "context": "Student wants to understand how quantum information survives environmental noise.",
        "intent_classification": "quantum_error_correction_shor",
        "vocal_prose_script": (
            "In classical storage, if a bit flips from 0 to 1, you can simply keep 3 copies (000) and take a majority vote. "
            "In quantum computing, this fails for two profound reasons: the No-Cloning theorem forbids copying an unknown state |psi>, "
            "and directly measuring qubits destroys delicate superpositions. "
            "Quantum error correction solves this using entanglement and syndrome measurements. Shor's 9-qubit code protects a single logical qubit "
            "by nesting a 3-qubit phase-flip code inside three 3-qubit bit-flip codes. Ancilla qubits measure error syndromes (parity checks) "
            "without ever measuring the logical data itself, detecting and correcting any arbitrary single-qubit Pauli error (X, Z, or Y)."
        ),
        "mathematical_latex_formula": (
            r"|0_L\rangle = \frac{(|000\rangle+|111\rangle)(|000\rangle+|111\rangle)(|000\rangle+|111\rangle)}{2\sqrt{2}},\quad "
            r"|1_L\rangle = \frac{(|000\rangle-|111\rangle)(|000\rangle-|111\rangle)(|000\rangle-|111\rangle)}{2\sqrt{2}}"
        ),
        "qiskit_executable_code": (
            "from qiskit import QuantumCircuit\n"
            "# Encoding step of the 3-qubit bit-flip repetition code\n"
            "qc = QuantumCircuit(3, 2)\n"
            "qc.cx(0, 1)  # Entangle data qubit 0 with ancilla 1\n"
            "qc.cx(0, 2)  # Entangle data qubit 0 with ancilla 2\n"
            "# Parity syndrome measurements\n"
            "qc.cx(0, 1)\n"
            "qc.cx(2, 1)\n"
            "qc.measure(1, 0)\n"
            "print(qc.draw(output='text'))"
        ),
        "quiz": {
            "question": "In the stabilizer formalism, why do syndrome measurements not collapse the protected quantum information?",
            "options": [
                "Because stabilizers commute with the logical operators and measure only the error subspace eigenvalue, leaving the encoded state intact.",
                "Because ancilla qubits are kept at absolute zero Kelvin.",
                "Because phase errors do not alter the computational basis probabilities.",
                "Because quantum repeaters restore the wavefunction before measurement finishes."
            ],
            "answer": 0,
            "explanation": "Stabilizer operators S_i commute with the encoded logical Pauli operators X_L and Z_L. Measuring S_i projects the system onto an error eigenspace without revealing any information about the superposition coefficients alpha and beta."
        },
        "sources": [
            "Shor – Scheme for Reducing Decoherence in Quantum Computer Memory (Phys. Rev. A 1995)",
            "Gottesman – Stabilizer Codes and Quantum Error Correction (Caltech PhD Thesis 1997)"
        ]
    }
]

def build_dataset() -> List[Dict[str, Any]]:
    dataset = []
    
    for item in CORE_TOPICS:
        system_prompt = (
            "You are Aura Quantum AI — an elite quantum computing professor and world-class researcher "
            "powering the Quantum Leap learning platform. Respond strictly in valid JSON format with keys: "
            "intent_classification, vocal_prose_script, mathematical_latex_formula, qiskit_executable_code, quiz, sources."
        )
        user_prompt = (
            f"Context: {item['context']}\n"
            f"Topic: {item['topic']}\n"
            f"Question: {item['instruction']}"
        )
        assistant_response = json.dumps({
            "intent_classification": item["intent_classification"],
            "vocal_prose_script": item["vocal_prose_script"],
            "mathematical_latex_formula": item["mathematical_latex_formula"],
            "qiskit_executable_code": item["qiskit_executable_code"],
            "quiz": item["quiz"],
            "sources": item["sources"]
        }, indent=2)

        llama_formatted = {
            "instruction": item["instruction"],
            "input": f"{item['context']} (Topic: {item['topic']})",
            "output": assistant_response,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": assistant_response}
            ]
        }
        dataset.append(llama_formatted)

    algorithmic_extras = [
        {
            "instruction": "How does Deutsch-Jozsa determine if a function is constant or balanced in a single evaluation?",
            "input": "Algorithm design query comparing classical N/2+1 queries vs quantum 1 query.",
            "intent": "deutsch_jozsa_algorithm",
            "analogy": "Imagine a coin that is either regular (heads on one side, tails on the other) or fraudulent (heads on both sides). Classically, you must inspect both sides. Deutsch-Jozsa uses quantum interference to test the global property across all inputs simultaneously with a single query.",
            "latex": r"|\psi_3\rangle = \sum_{x \in \{0,1\}^n} \left( \sum_{z \in \{0,1\}^n} (-1)^{x \cdot z + f(x)} \right) |z\rangle,\quad P(0^{\otimes n}) = 1 \iff f \text{ is constant}",
            "code": "from qiskit import QuantumCircuit\n# 2-input Deutsch-Jozsa (constant oracle)\nqc = QuantumCircuit(3, 2)\nqc.x(2); qc.h([0,1,2])\n# Identity oracle (f(x)=0 constant)\nqc.h([0,1])\nqc.measure([0,1], [0,1])",
            "quiz": {
                "question": "If measuring all input qubits after Deutsch-Jozsa produces |00...0>, what is the function?",
                "options": ["Guaranteed constant", "Guaranteed balanced", "50% chance of either", "Indeterminate without ancilla readout"],
                "answer": 0,
                "explanation": "Constructive interference on the all-zero state |0...0> occurs if and only if f(x) is constant. If balanced, destructive interference cancels |0...0> completely."
            },
            "sources": ["Deutsch & Jozsa – Rapid Solution of Problems by Quantum Computation (Proc. R. Soc. Lond. 1992)"]
        },
        {
            "instruction": "What is Phase Kickback and why is it essential for quantum algorithms?",
            "input": "Quantum gate mechanics explaining eigenvalue kickback from target to control qubit.",
            "intent": "phase_kickback_mechanism",
            "analogy": "Imagine pushing against a heavy stone wall while standing on roller skates: instead of the wall moving, the push kicks you backward. In phase kickback, when a controlled gate acts on an eigenvector of the target qubit, the resulting eigenvalue phase is kicked back onto the control qubit.",
            "latex": r"U|u\rangle = e^{i\theta}|u\rangle \implies C(U)\left( \frac{|0\rangle + |1\rangle}{\sqrt{2}} \otimes |u\rangle \right) = \frac{|0\rangle + e^{i\theta}|1\rangle}{\sqrt{2}} \otimes |u\rangle",
            "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)  # Control qubit in |+>\nqc.x(1); qc.h(1)  # Target qubit in |-> (eigenstate of X with eigenvalue -1)\nqc.cx(0, 1)  # Phase -1 kicks back to control qubit q0\nqc.h(0)  # q0 becomes |1>",
            "quiz": {
                "question": "What state must the target qubit be in for phase kickback to occur with a unitary operator U?",
                "options": [
                    "An eigenstate |u> of U such that U|u> = e^(i theta)|u>",
                    "The computational ground state |0> exclusively",
                    "A maximally entangled Bell state with the control qubit",
                    "Any mixed state with non-zero trace distance"
                ],
                "answer": 0,
                "explanation": "Phase kickback relies directly on the target being an eigenvector |u> of U. The eigenvalue e^(i theta) factors out and modifies the relative phase of the control qubit."
            },
            "sources": ["Cleve, Ekert, Macchiavello, Mosca – Quantum Algorithms Revisited (Proc. R. Soc. 1998)"]
        }
    ]

    for extra in algorithmic_extras:
        assistant_resp = json.dumps({
            "intent_classification": extra["intent"],
            "vocal_prose_script": extra["analogy"],
            "mathematical_latex_formula": extra["latex"],
            "qiskit_executable_code": extra["code"],
            "quiz": extra["quiz"],
            "sources": extra["sources"]
        }, indent=2)
        dataset.append({
            "instruction": extra["instruction"],
            "input": extra["input"],
            "output": assistant_resp,
            "messages": [
                {"role": "system", "content": "You are Aura Quantum AI. Output valid JSON."},
                {"role": "user", "content": f"{extra['input']}: {extra['instruction']}"},
                {"role": "assistant", "content": assistant_resp}
            ]
        })

    return dataset

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    records = build_dataset()
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"[Dataset] Successfully generated {len(records)} Socratic Quantum training examples -> {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
