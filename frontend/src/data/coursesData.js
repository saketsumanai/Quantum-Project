// ─── Quantum Leap Comprehensive Course Knowledge Base ────────────────────────
// Fully structured, beginner-friendly course units based on IBM Quantum Learning,
// Qiskit Textbook, and our 76-book quantum collection.
// Designed with intuitive analogies, step-by-step math, modern Qiskit 1.0 code,
// interactive quizzes, and textbook citations.

export const COURSES_DETAILED_CONTENT = {
  "basics-qi": {
    id: "basics-qi",
    title: "Basics of Quantum Information",
    courseLabel: "Basics of Quantum Information",
    instructor: "John Watrous (IBM Quantum / Univ. of Waterloo)",
    level: "Beginner",
    duration: "15 hours",
    badge: "#78A9FF",
    accent: "#0F62FE",
    gradient: "linear-gradient(135deg, #001141 0%, #0F1F4A 100%)",
    description: "The definitive mathematical foundation of quantum information for single and multiple systems, quantum circuits, and classic entanglement applications.",
    citations: [
      "John Watrous (2018), 'The Theory of Quantum Information', Cambridge University Press, Ch. 1-3",
      "Michael A. Nielsen & Isaac L. Chuang (2010), 'Quantum Computation and Quantum Information', Ch. 1-2",
      "IBM Quantum Learning (2024), 'Understanding Quantum Information and Computation: Course 1'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Unit 1: Single Systems — Classical vs. Quantum Bits",
        duration: "45 min",
        circuitPreset: "superposition",
        youtubeId: "3-c4xJa7Flk",
        videoTitle: "Single Systems | Understanding Quantum Information & Computation | Lesson 01 with John Watrous",
        watchUrl: "https://www.youtube.com/watch?v=3-c4xJa7Flk",
        embedUrl: "https://www.youtube-nocookie.com/embed/3-c4xJa7Flk",
        learningObjectives: [
          "Represent classical states as deterministic and probabilistic state vectors",
          "Formulate single-qubit states using complex amplitudes and Dirac bra-ket notation",
          "Apply Born's rule to compute exact measurement probabilities (|α|² and |β|²)",
          "Distinguish unobservable global phase from physically detectable relative phase",
          "Construct and simulate a single-qubit statevector in Qiskit 1.0+"
        ],
        summary: "Understand what a qubit really is, how superposition works using the spinning coin analogy, Born's rule, and Dirac bra-ket notation.",
        sections: [
          {
            heading: "1. The Intuitive Analogy: The Spinning Coin",
            content: "To understand a quantum bit (qubit), start with a classical coin:\n• A classical bit is like a coin resting flat on a table: it is either definitely Heads (0) or definitely Tails (1).\n• A qubit in superposition is like a coin spinning rapidly on the table! While it is spinning, it is not simply 'Heads' or 'Tails', nor is it a 50/50 secret guess. It exists in a dynamic continuum of both possibilities simultaneously.\n• When you slap your hand down on the spinning coin (measurement), it is forced to instantly collapse into either Heads (0) or Tails (1).",
            callout: "Myth Buster: Superposition is NOT just 'being 0 and 1 at the same time like magic'. It is a precise mathematical linear combination of states where quantum wave amplitudes can interfere constructively (adding together) or destructively (canceling out)."
          },
          {
            heading: "2. The Mathematics: State Vectors & Dirac Notation",
            content: "In quantum mechanics, we write states using Dirac bra-ket notation: $|\\text{name}\\rangle$ (called a 'ket').\n\nThe standard computational basis states are:\n• $|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ (represents classical 0 / Heads)\n• $|1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$ (represents classical 1 / Tails)\n\nAn arbitrary pure single-qubit state $|\\psi\\rangle$ is written as:\n$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle = \\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}$\n\nHere, $\\alpha$ and $\\beta$ are complex probability amplitudes (numbers like $1/\\sqrt{2}$ or $i/2$).",
            math: "|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad \\alpha, \\beta \\in \\mathbb{C}"
          },
          {
            heading: "3. Born's Rule: Turning Amplitudes into Real Probabilities",
            content: "When we measure a qubit in the state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$:\n• The probability of measuring outcome 0 is $P(0) = |\\alpha|^2$\n• The probability of measuring outcome 1 is $P(1) = |\\beta|^2$\n\nBecause the qubit must produce either 0 or 1 upon measurement, the total probability must equal 100% (1.0). This gives the fundamental Normalization Condition:\n\n$|\\alpha|^2 + |\\beta|^2 = 1$\n\nFor example, if $\\alpha = 1/\\sqrt{2}$ and $\\beta = 1/\\sqrt{2}$:\n$P(0) = |1/\\sqrt{2}|^2 = 1/2 = 50\\%$\n$P(1) = |1/\\sqrt{2}|^2 = 1/2 = 50\\%$",
            math: "\\langle\\psi|\\psi\\rangle = |\\alpha|^2 + |\\beta|^2 = 1",
            code: `# Qiskit 1.0+ Example: Create and verify a single-qubit state
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# Create the famous |+> superposition state
alpha = 1 / np.sqrt(2)
beta = 1 / np.sqrt(2)
psi = Statevector([alpha, beta])

print("Qubit statevector:", psi)
print("Probability of 0:", abs(alpha)**2)
print("Probability of 1:", abs(beta)**2)
print("Is state normalized?", np.isclose(abs(alpha)**2 + abs(beta)**2, 1.0))`
          },
          {
            heading: "4. Global Phase vs. Relative Phase",
            content: "Imagine an analog clock: rotating the entire clock on the wall (global phase $e^{i\\theta}$) changes nothing about how time is read. But moving the minute hand relative to the hour hand (relative phase) changes the time completely!\n\n• Global phase: $|\\psi'\\rangle = e^{i\\theta}|\\psi\\rangle$ produces the exact same probabilities and is physically undetectable.\n• Relative phase: The sign difference between $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$ and $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$ is physically detectable because applying a Hadamard gate turns $|+\\rangle \\to |0\\rangle$ (100% 0) and $|-\\rangle \\to |1\\rangle$ (100% 1)!",
            math: "|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\xrightarrow{H} |0\\rangle, \\quad |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}} \\xrightarrow{H} |1\\rangle"
          }
        ],
        quiz: {
          question: "If a qubit has amplitude alpha = 1/2 for state |0⟩, what is the probability of measuring 0?",
          options: ["50%", "25%", "75%", "100%"],
          correctIndex: 1,
          explanation: "By Born's rule, probability is the magnitude squared of the amplitude: P(0) = |alpha|² = (1/2)² = 1/4 = 25%."
        }
      },
      {
        id: "unit-2",
        title: "Unit 2: The Bloch Sphere & Quantum Logic Gates",
        duration: "50 min",
        circuitPreset: "superposition",
        youtubeId: "30U2DTfIrOU",
        videoTitle: "Quantum Circuits & Unitary Operations | Lesson 03 with John Watrous",
        watchUrl: "https://www.youtube.com/watch?v=30U2DTfIrOU",
        embedUrl: "https://www.youtube-nocookie.com/embed/30U2DTfIrOU",
        learningObjectives: [
          "Map arbitrary pure single-qubit states to spherical coordinates (θ, φ) on the Bloch sphere",
          "Formulate Pauli X, Y, Z gates as 180° rotations about their spatial axes",
          "Demonstrate that the Hadamard gate acts as the universal superposition generator",
          "Prove gate reversibility and unitarity (U† U = I) using matrix algebra"
        ],
        summary: "Visualize any single qubit as a point on a 3D sphere, and understand X, Y, Z, and Hadamard gates as simple 3D rotations.",
        sections: [
          {
            heading: "1. The 3D Bloch Sphere: The Globe of Quantum States",
            content: "Every single pure qubit state can be plotted as a point on the surface of a 3D unit sphere called the **Bloch Sphere**:\n• North Pole ($z = +1$): The state $|0\\rangle$\n• South Pole ($z = -1$): The state $|1\\rangle$\n• Equator ($+x$ axis): The state $|+\\rangle = (|0\\rangle + |1\\rangle)/\\sqrt{2}$\n• Equator ($-x$ axis): The state $|-\\rangle = (|0\\rangle - |1\\rangle)/\\sqrt{2}$\n• Equator ($+y$ axis): The state $|+i\\rangle = (|0\\rangle + i|1\\rangle)/\\sqrt{2}$\n\nAny state is given by polar angle $\\theta \\in [0, \\pi]$ and azimuthal angle $\\phi \\in [0, 2\\pi)$:\n$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$",
            math: "\\vec{r} = (\\sin\\theta\\cos\\phi, \\; \\sin\\theta\\sin\\phi, \\; \\cos\\theta)"
          },
          {
            heading: "2. The Fundamental Single-Qubit Gates",
            content: "Just as classical computing uses NOT, AND, OR gates, quantum computing uses unitary matrices that rotate the state vector on the Bloch sphere:\n\n1. **Pauli-X Gate (Quantum NOT / Bit Flip)**:\n   Flips $|0\\rangle \\leftrightarrow |1\\rangle$. On the Bloch sphere, it is a $180^\\circ$ rotation around the X-axis.\n   $X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad X|0\\rangle = |1\\rangle, \\quad X|1\\rangle = |0\\rangle$\n\n2. **Pauli-Z Gate (Phase Flip)**:\n   Leaves $|0\\rangle$ alone, but flips the phase of $|1\\rangle \\to -|1\\rangle$. A $180^\\circ$ rotation around the Z-axis.\n   $Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad Z|0\\rangle = |0\\rangle, \\quad Z|1\\rangle = -|1\\rangle$\n\n3. **Hadamard Gate (H - The Superposition Gate)**:\n   The most important single-qubit gate in quantum algorithms! It transforms definite basis states into equal superpositions:\n   $H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$\n   $H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}, \\quad H|1\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$",
            code: `# Qiskit 1.0+ Single-Qubit Gate Operations
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)
qc.h(0)  # Put into superposition |+>
qc.z(0)  # Flip phase to |->
qc.h(0)  # Interfere back to |1>

sv = Statevector.from_instruction(qc)
print("Final state (100% |1>):", sv)`
          }
        ],
        quiz: {
          question: "What happens if you apply a Hadamard (H) gate to a qubit twice in a row (H then H)?",
          options: ["The qubit is randomized", "It returns to its exact original state (H² = Identity)", "It flips from 0 to 1", "It stays in superposition permanently"],
          correctIndex: 1,
          explanation: "The Hadamard gate is its own inverse (Hermitian and unitary): H · H = I. Applying H twice returns the qubit to its starting state."
        }
      },
      {
        id: "unit-3",
        title: "Unit 3: Multiple Systems — Tensor Products & Entanglement",
        duration: "55 min",
        circuitPreset: "bell_state",
        youtubeId: "DfZZS8Spe7U",
        videoTitle: "Multiple Systems & Entanglement | Lesson 02 with John Watrous",
        watchUrl: "https://www.youtube.com/watch?v=DfZZS8Spe7U",
        embedUrl: "https://www.youtube-nocookie.com/embed/DfZZS8Spe7U",
        learningObjectives: [
          "Construct composite state spaces using the Kronecker tensor product (H_A ⊗ H_B)",
          "Distinguish separable product states |a⟩ ⊗ |b⟩ from non-separable entangled states",
          "Apply the Controlled-NOT (CNOT) gate to generate maximal quantum entanglement",
          "Synthesize and analyze the four orthonormal Bell states (|Φ±⟩, |Ψ±⟩)"
        ],
        summary: "Combine qubits using the tensor product, understand why multi-qubit Hilbert space grows exponentially, and create the four Bell states.",
        sections: [
          {
            heading: "1. The Power of Exponential Hilbert Space",
            content: "When combining classical bits, $n$ bits can store $n$ numbers. But for $n$ quantum bits, the state space is the **Kronecker Tensor Product** $\\mathcal{H}_1 \\otimes \\mathcal{H}_2 \\otimes \\dots \\otimes \\mathcal{H}_n$:\n• 1 qubit = 2 amplitudes ($c_0, c_1$)\n• 2 qubits = 4 amplitudes ($c_{00}, c_{01}, c_{10}, c_{11}$)\n• 3 qubits = 8 amplitudes ($c_{000}, \\dots, c_{111}$)\n• $n$ qubits = $2^n$ amplitudes!\n\nFor 50 qubits, $2^{50} \\approx 1.1 \\times 10^{15}$ amplitudes—requiring petabytes of RAM to store classically. For 300 qubits, $2^{300} \\approx 10^{90}$—more than all the atoms in the observable universe!",
            math: "|\\psi\\rangle = \\sum_{x \\in \\{0,1\\}^n} c_x |x\\rangle, \\quad \\sum_{x} |c_x|^2 = 1"
          },
          {
            heading: "2. The Controlled-NOT (CNOT) Gate",
            content: "To create quantum entanglement, we need a gate that allows two qubits to interact. The most universal two-qubit gate is the CNOT (Controlled-NOT):\n• Control qubit ($q_0$): If $q_0 = 0$, nothing happens to the target. If $q_0 = 1$, the target is flipped.\n• Target qubit ($q_1$): Inverted if and only if control is 1.\n\n$CX |00\\rangle = |00\\rangle$\n$CX |01\\rangle = |01\\rangle$\n$CX |10\\rangle = |11\\rangle$\n$CX |11\\rangle = |10\\rangle$",
            math: "CX |c\\rangle |t\\rangle = |c\\rangle |t \\oplus c\\rangle"
          },
          {
            heading: "3. Generating the Bell State: Spooky Action at a Distance",
            content: "What happens if we put the control qubit in superposition ($H$) and then apply $CX$?\n1. Start in $|00\\rangle$\n2. Apply $H$ to $q_0$: $\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$\n3. Apply $CX$ from $q_0$ to $q_1$: $\\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}} = |\\Phi^+\\rangle$\n\nThis is the famous **Bell State** $|\Phi^+\rangle$!\nNotice: There is NO state for qubit 0 alone or qubit 1 alone. They are completely entangled. If Alice measures qubit 0 and gets 0, qubit 1 instantly becomes 0 with 100% certainty. If Alice gets 1, qubit 1 instantly becomes 1!",
            code: `# Qiskit 1.0+ Bell State Circuit
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
qc.h(0)        # Step 1: Superposition
qc.cx(0, 1)    # Step 2: Entangle

sv = Statevector.from_instruction(qc)
print("Bell state |Phi+>:")
print(sv)
print("Probabilities:", sv.probabilities_dict())`
          }
        ],
        quiz: {
          question: "Can an entangled state |Phi+⟩ = (|00⟩ + |11⟩)/sqrt(2) be factored into a product |a⟩ ⊗ |b⟩ of individual qubit states?",
          options: ["Yes, always", "No, it is fundamentally non-separable (entangled)", "Only if measured along the Z axis", "Only at absolute zero temperature"],
          correctIndex: 1,
          explanation: "By definition, an entangled state cannot be written as a product of individual subsystem states |a⟩ ⊗ |b⟩. The two qubits share a unified quantum identity."
        }
      },
      {
        id: "unit-4",
        title: "Unit 4: Entanglement in Action — Quantum Teleportation",
        duration: "50 min",
        circuitPreset: "quantum_teleportation",
        youtubeId: "GSsElSQgMbU",
        videoTitle: "Entanglement in Action: Teleportation & Superdense Coding | Lesson 04 with John Watrous",
        watchUrl: "https://www.youtube.com/watch?v=GSsElSQgMbU",
        embedUrl: "https://www.youtube-nocookie.com/embed/GSsElSQgMbU",
        learningObjectives: [
          "Execute the 5-step Quantum Teleportation protocol from Alice to Bob",
          "Explain why Bell measurement and classical feed-forward protect the No-Cloning Theorem",
          "Transmit 2 classical bits using 1 transmitted qubit via Superdense Coding",
          "Prove quantum non-locality and Bell inequality violation"
        ],
        summary: "Transmit an unknown quantum state across space using a shared Bell pair and 2 classical bits, without violating the No-Cloning theorem.",
        sections: [
          {
            heading: "1. The Teleportation Protocol Explained Simply",
            content: "Suppose Alice has a fragile, unknown quantum qubit $|\psi\\rangle = \alpha|0\\rangle + \beta|1\\rangle$ and wants to send it to Bob.\n• She cannot simply copy it (forbidden by the No-Cloning Theorem).\n• She cannot measure it (measurement would collapse the state and destroy $\alpha$ and $\beta$).\n\nHow do they solve this? Using **Quantum Teleportation** (Bennett et al., 1993)!\n1. Alice and Bob share an entangled Bell pair $|\Phi^+\rangle_{AB}$.\n2. Alice performs a Bell measurement on her unknown qubit and her half of the Bell pair.\n3. Alice's measurement produces 2 classical bits ($00, 01, 10,$ or $11$).\n4. Alice calls Bob on a normal phone and tells him the 2 classical bits.\n5. Depending on the bits, Bob applies simple Pauli gates ($X, Z$) to his qubit.\n\nPresto! Bob's qubit is now **identical** to Alice's original state $|\psi\rangle$! Alice's original qubit was destroyed by her measurement, so no cloning occurred.",
            math: "|\\psi\\rangle |\\Phi^+\\rangle \\xrightarrow{\\text{Bell Measurement}} (m_0, m_1) \\xrightarrow{X^{m_1} Z^{m_0}} |\\psi\\rangle_{\\text{Bob}}"
          }
        ],
        quiz: {
          question: "How many classical bits must Alice send to Bob to complete the teleportation of 1 qubit?",
          options: ["0 bits (instantaneous)", "1 classical bit", "2 classical bits", "An infinite number of bits"],
          correctIndex: 2,
          explanation: "Alice measures two qubits in the Bell basis, producing exactly 2 classical bits of measurement outcomes that Bob needs to apply the correct correction."
        }
      },
      {
        id: "unit-5",
        title: "Unit 5: The No-Cloning Theorem & Quantum Cryptography (BB84)",
        duration: "45 min",
        circuitPreset: "superposition",
        youtubeId: "xnt2xSFXqzY",
        videoTitle: "No-Cloning Theorem & BB84 QKD Protocol | IBM Quantum Learning",
        watchUrl: "https://www.youtube.com/watch?v=xnt2xSFXqzY",
        embedUrl: "https://www.youtube-nocookie.com/embed/xnt2xSFXqzY",
        learningObjectives: [
          "Prove the No-Cloning Theorem from linearity of quantum mechanics",
          "Explain why copying an arbitrary unknown quantum state is physically impossible",
          "Understand how BB84 uses the No-Cloning Theorem for unbreakable key distribution",
          "Analyse eavesdropper detection via Quantum Bit Error Rate (QBER)",
          "Distinguish BB84 from classical encryption and one-time pads"
        ],
        summary: "Prove why unknown quantum states cannot be copied and how this impossibility is the physics bedrock of unbreakable quantum cryptography.",
        sections: [
          {
            heading: "1. Why Can't You Copy a Quantum State?",
            content: "In classical computing, copying information is trivial — your OS copies files millions of times per second. But in the quantum world, copying an unknown state is PHYSICALLY IMPOSSIBLE, and this follows directly from the most fundamental law: linearity of quantum mechanics.\n\n**Proof by contradiction:** Suppose a cloning machine $U_\\text{clone}$ could copy any state:\n$U_\\text{clone} |\\psi\\rangle |0\\rangle = |\\psi\\rangle |\\psi\\rangle$ for all $|\\psi\\rangle$\n\nLet's test it on the superposition $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$:\n• Copying $|0\\rangle$: $U |0\\rangle|0\\rangle = |00\\rangle$\n• Copying $|1\\rangle$: $U |1\\rangle|0\\rangle = |11\\rangle$\n• By linearity: $U |+\\rangle|0\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}} = |\\Phi^+\\rangle$\n• But what we WANT is: $|+\\rangle|+\\rangle = \\frac{|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle}{2}$\n\nThese are NOT equal! $|\\Phi^+\\rangle \\neq |+\\rangle|+\\rangle$. **Contradiction!** No such cloning machine can exist.",
            callout: "The No-Cloning Theorem: There exists no unitary operator U such that U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ for all |ψ⟩. This is not a technological limitation — it is a mathematical certainty.",
            math: "\\nexists\\; U \\text{ s.t. } U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle \\;\\forall\\; |\\psi\\rangle"
          },
          {
            heading: "2. BB84: Turning Physics into Unbreakable Security",
            content: "Charles Bennett and Gilles Brassard (1984) realized the No-Cloning Theorem could create cryptographic keys that are physically impossible to steal without detection.\n\n**How BB84 works:**\n1. Alice sends qubits randomly in 4 states: $|0\\rangle, |1\\rangle, |+\\rangle, |-\\rangle$ (using Z-basis or X-basis).\n2. Bob randomly chooses a measurement basis (Z or X) for each qubit.\n3. Alice and Bob publicly compare their BASES (not bits) and keep only matching measurements (~50% of key).\n4. They sacrifice a small subset of bits to check for errors.\n\n**Why is eavesdropping detectable?**\nIf Eve intercepts and measures a qubit, she must GUESS the correct basis. If she guesses wrong (50% chance), she disturbs the state. Alice and Bob detect this disturbance via the Quantum Bit Error Rate (QBER). Any QBER > 11% reveals an eavesdropper!",
            math: "QBER = \\frac{\\text{number of erroneous bits}}{\\text{total sifted bits}} > 11\\% \\Rightarrow \\text{Eve detected}",
            code: `# Simulating BB84 protocol conceptually in Qiskit 1.0+
from qiskit import QuantumCircuit
import numpy as np

def bb84_send_qubit(bit: int, basis: str) -> QuantumCircuit:
    """Prepares a BB84 qubit. basis = 'Z' or 'X'."""
    qc = QuantumCircuit(1, 1)
    if bit == 1:
        qc.x(0)           # Flip to |1> if bit=1
    if basis == 'X':
        qc.h(0)           # Rotate to X-basis (|+> or |->)
    return qc

def bb84_measure(qc: QuantumCircuit, basis: str) -> QuantumCircuit:
    """Measures in specified basis."""
    if basis == 'X':
        qc.h(0)           # Rotate back from X-basis
    qc.measure(0, 0)
    return qc

# Example: Alice sends |+> (bit=0, X-basis), Bob measures in X-basis
qc = bb84_send_qubit(bit=0, basis='X')
qc = bb84_measure(qc, basis='X')
print("Alice sends |+>, Bob measures X-basis:")
print(qc.draw())`
          },
          {
            heading: "3. Quantum vs Classical Cryptography",
            content: "Classical cryptography (RSA, AES) relies on **computational hardness** — problems that are hard but not impossible for computers.\n• Shor's algorithm (quantum) breaks RSA in polynomial time.\n• AES symmetric keys can be halved by Grover's search.\n\nQKD (Quantum Key Distribution) is different — its security is based on the **laws of physics**, not mathematical hardness:\n• No-Cloning Theorem: Eve cannot copy qubits without disturbing them.\n• Heisenberg Uncertainty: Measuring one property disturbs the complementary property.\n• Information-theoretic security: Even with unlimited computing power, Eve cannot break QKD without detection.\n\nThis makes QKD the **only provably secure** key distribution method in existence!",
            callout: "Post-quantum cryptography (NIST PQC 2024: CRYSTALS-Kyber, FALCON, SPHINCS+) uses math problems resistant to quantum computers. QKD is the gold standard for highest-security applications like central banks and military."
          }
        ],
        quiz: {
          question: "What happens if an eavesdropper (Eve) measures a BB84 qubit in the WRONG basis?",
          options: ["Nothing — she gets the correct bit and leaves no trace", "She disturbs the qubit state, causing detectable errors in Alice and Bob's key comparison", "She perfectly copies the qubit thanks to quantum cloning", "The qubit is transmitted instantly to Bob without error"],
          correctIndex: 1,
          explanation: "Measuring in the wrong basis collapses the state into a random eigenstate of that basis. When Bob then measures in the correct basis, he gets random results 50% of the time, increasing the QBER above the 11% threshold and revealing Eve."
        }
      },
      {
        id: "unit-6",
        title: "Unit 6: Quantum Noise, Decoherence & The Density Matrix",
        duration: "50 min",
        circuitPreset: "superposition",
        youtubeId: "F_Riqjdh2oM",
        videoTitle: "Open Quantum Systems & Noise Models | IBM Qiskit Textbook Chapter",
        watchUrl: "https://www.youtube.com/watch?v=F_Riqjdh2oM",
        embedUrl: "https://www.youtube-nocookie.com/embed/F_Riqjdh2oM",
        learningObjectives: [
          "Model mixed quantum states using the density matrix ρ = Σ p_i |ψ_i⟩⟨ψ_i|",
          "Distinguish pure states (Tr(ρ²)=1) from mixed/noisy states (Tr(ρ²) < 1)",
          "Explain T1 (amplitude damping / energy relaxation) and T2 (phase decoherence) times",
          "Model quantum channels using Kraus operators: ρ → Σ K_i ρ K_i†",
          "Apply depolarizing noise model in Qiskit Aer to simulate realistic quantum hardware"
        ],
        summary: "Model noisy real-world qubits using density matrices, understand T1/T2 coherence times, and simulate hardware noise with Kraus operators.",
        sections: [
          {
            heading: "1. The Problem: Real Qubits Are Noisy",
            content: "The beautiful theory of pure states $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ assumes perfect isolation. Real superconducting qubits sit in a dilution refrigerator at 15 mK, but they still interact weakly with their environment (stray photons, magnetic field fluctuations, mechanical vibrations).\n\nThis interaction causes **decoherence** — the qubit gradually loses its quantum information to the environment, transitioning from a pure quantum state to a classical mixed state.\n\n**Two decoherence timescales:**\n• $T_1$ (Amplitude Damping / Energy Relaxation): Time for $|1\\rangle \\to |0\\rangle$ spontaneous emission. Typical value: $100\\text{-}500\\mu\\text{s}$ on IBM Eagle processor.\n• $T_2$ (Phase Decoherence): Time for the phase relationship between $|0\\rangle$ and $|1\\rangle$ to randomize. Always $T_2 \\leq 2T_1$.",
            callout: "IBM's Condor processor (1,121 qubits, 2023) achieves T1 ~ 300 μs and T2 ~ 100 μs. Fault-tolerant computation requires millions of operations before decoherence — hence why surface codes need 1,000 physical qubits per logical qubit."
          },
          {
            heading: "2. Density Matrices: Describing Noisy Mixed States",
            content: "For a perfectly isolated qubit we use a state vector $|\\psi\\rangle$. For a noisy qubit where we only know the PROBABILITIES of different states, we need the **Density Matrix** $\\rho$:\n\n$\\rho = \\sum_i p_i |\\psi_i\\rangle\\langle\\psi_i|$\n\nwhere $p_i$ are classical probabilities (not quantum amplitudes) and $\\sum_i p_i = 1$.\n\n**Distinguishing pure vs mixed states:**\n• Pure state: $\\text{Tr}(\\rho^2) = 1$ — perfect quantum coherence.\n• Mixed state: $\\text{Tr}(\\rho^2) < 1$ — some decoherence has occurred.\n\nFor the equal mixture of $|0\\rangle$ and $|1\\rangle$ (completely decohered qubit):\n$\\rho_{\\text{mixed}} = \\frac{1}{2}|0\\rangle\\langle 0| + \\frac{1}{2}|1\\rangle\\langle 1| = \\begin{pmatrix}1/2 & 0 \\\\ 0 & 1/2\\end{pmatrix}$",
            math: "\\rho = \\sum_i p_i |\\psi_i\\rangle\\langle\\psi_i|, \\quad \\text{Tr}(\\rho) = 1, \\quad \\text{Tr}(\\rho^2) \\leq 1"
          },
          {
            heading: "3. Quantum Channels & Kraus Operators",
            content: "A quantum channel is the most general physical operation on a qubit, including noise. It maps density matrices to density matrices:\n$\\mathcal{E}(\\rho) = \\sum_i K_i \\rho K_i^\\dagger$\n\nwhere the Kraus operators $K_i$ satisfy the completeness relation $\\sum_i K_i^\\dagger K_i = I$.\n\n**Depolarizing Channel** (the most common noise model):\nWith probability $p$, the qubit is replaced by a completely mixed state: $\\mathcal{E}(\\rho) = (1-p)\\rho + p \\cdot \\frac{I}{2}$\n\nPhysically: 'With probability $p$, one of X, Y, or Z errors happened randomly.'",
            math: "\\mathcal{E}_{\\text{dep}}(\\rho) = \\left(1 - \\frac{4p}{3}\\right)\\rho + \\frac{p}{3}(X\\rho X + Y\\rho Y + Z\\rho Z)",
            code: `# Simulating Noise with Qiskit Aer Noise Model
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

# Create noise model: 1% depolarizing error on each gate
noise_model = NoiseModel()
error_1q = depolarizing_error(0.01, 1)   # 1% per single-qubit gate
error_2q = depolarizing_error(0.05, 2)   # 5% per two-qubit gate
noise_model.add_all_qubit_quantum_error(error_1q, ['h', 'x', 'rx', 'ry', 'rz'])
noise_model.add_all_qubit_quantum_error(error_2q, ['cx', 'cz'])

# Create a Bell state circuit and run with noise
qc = QuantumCircuit(2)
qc.h(0); qc.cx(0, 1)
qc.measure_all()

sim = AerSimulator(noise_model=noise_model)
job = sim.run(qc, shots=2048)
counts = job.result().get_counts()
print("Noisy Bell State counts:", counts)
# Expected: mostly '00' and '11', but with some '01' and '10' errors`
          }
        ],
        quiz: {
          question: "A qubit with density matrix ρ has Tr(ρ²) = 0.65. What does this tell you?",
          options: [
            "The qubit is in a pure state with perfect coherence",
            "The qubit is a mixed state — partial decoherence has occurred (some quantum information lost to noise)",
            "The qubit has 65% probability of measuring |1⟩",
            "The qubit's gate fidelity is 65%"
          ],
          correctIndex: 1,
          explanation: "For pure states Tr(ρ²) = 1. Tr(ρ²) = 0.65 < 1 indicates a mixed state where the qubit has become partially entangled with its environment (decoherence), losing quantum purity."
        }
      }
    ]
  },

  "fundamentals-algos": {
    id: "fundamentals-algos",
    title: "Fundamentals of Quantum Algorithms",
    courseLabel: "Fundamentals of Quantum Algorithms",
    instructor: "Andrew Childs & Ronald de Wolf",
    level: "Intermediate",
    duration: "15 hours",
    badge: "#A56EFF",
    accent: "#8A3FFC",
    gradient: "linear-gradient(135deg, #1C0F30 0%, #2D1B4E 100%)",
    description: "Learn how quantum algorithms achieve provable exponential and polynomial speedups over classical computing for factoring and search.",
    citations: [
      "Andrew Childs (2021), 'Lecture Notes on Quantum Algorithms', Univ. of Maryland",
      "Ronald de Wolf (2023), 'Quantum Computing: Lecture Notes', QuSoft Amsterdam",
      "IBM Quantum Learning (2024), 'Understanding Quantum Information and Computation: Course 2'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Unit 1: Quantum Query Algorithms & Deutsch-Jozsa",
        duration: "50 min",
        circuitPreset: "deutsch_jozsa",
        youtubeId: "3-c4xJa7Flk",
        videoTitle: "Quantum Query Algorithms & Phase Kickback | Fundamentals of Quantum Algorithms",
        watchUrl: "https://www.youtube.com/watch?v=3-c4xJa7Flk",
        embedUrl: "https://www.youtube-nocookie.com/embed/3-c4xJa7Flk",
        learningObjectives: [
          "Understand the black-box query model and query complexity vs gate complexity",
          "Apply phase kickback with target qubit |-> to encode evaluations into relative phase",
          "Distinguish constant and balanced Boolean functions using exactly 1 quantum query",
          "Analyze constructive vs destructive interference in the n-qubit Hadamard transform"
        ],
        summary: "Understand the black-box query model, phase kickback, and the first algorithm to prove quantum advantage over classical determinism.",
        sections: [
          {
            heading: "1. The Query Problem Analogy",
            content: "Imagine a mystery black box (an oracle) that computes a function $f(x)$ for input bitstrings $x$. You want to know if $f$ is:\n• Constant: Always outputs 0 for all inputs, or always 1 for all inputs.\n• Balanced: Outputs 0 for exactly half of the inputs and 1 for the other half.\n\nClassically, for $n=32$ bits ($4$ billion inputs), you might have to check $2^{31} + 1 \\approx 2.1$ billion inputs in the worst case before you can be 100% sure.\nA quantum computer solves it with **exactly 1 query**!",
            callout: "The key mechanism is Phase Kickback: by placing the target qubit in state |-> = (|0> - |1>)/sqrt(2), the oracle kicks the answer (-1)^f(x) into the phase of the query register!"
          },
          {
            heading: "2. The Interference Step",
            content: "After the oracle kicks the phase $(-1)^{f(x)}$ into each input state in superposition, we apply Hadamard gates to all $n$ qubits again.\n• If $f$ is constant, all phases are identical, and waves add up constructively to give the bitstring $|00\\dots 0\\rangle$ with 100% probability.\n• If $f$ is balanced, exactly half of the amplitudes have a $+1$ sign and half have a $-1$ sign. They cancel each other out completely (destructive interference), making the probability of measuring $|00\\dots 0\\rangle$ exactly 0%!",
            math: "|\\psi_{\\text{final}}\\rangle = \\sum_{z} \\left( \\frac{1}{2^n}\\sum_{x} (-1)^{f(x) + x\\cdot z} \\right) |z\\rangle",
            code: `# Deutsch-Jozsa in Qiskit 1.0+
from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 1)
qc.x(1); qc.h(1) # Target in |->
qc.h(0)          # Query in |+>
qc.cx(0, 1)      # Balanced Oracle
qc.h(0)          # Interference
qc.measure(0, 0)
print(qc.draw())`
          }
        ],
        quiz: {
          question: "How many queries does the Deutsch-Jozsa algorithm require to determine if an n-bit function is constant or balanced?",
          options: ["2^(n-1) queries", "n queries", "Exactly 1 query", "O(sqrt(N)) queries"],
          correctIndex: 2,
          explanation: "The Deutsch-Jozsa algorithm evaluates the oracle in superposition with phase kickback and requires only a single quantum query."
        }
      },
      {
        id: "unit-2",
        title: "Unit 2: Grover's Search Algorithm & Amplitude Amplification",
        duration: "55 min",
        circuitPreset: "grover_2qubit",
        youtubeId: "hnpjC8WQVrQ",
        videoTitle: "Grover's Algorithm & Amplitude Amplification | Lesson 08 with John Watrous",
        watchUrl: "https://www.youtube.com/watch?v=hnpjC8WQVrQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/hnpjC8WQVrQ",
        learningObjectives: [
          "Formulate unstructured database search over N = 2^n elements",
          "Synthesize the oracle reflection operator R_ω and diffusion operator R_s",
          "Track 2D subspace rotation toward the target state by angle θ ≈ 2/√N per iteration",
          "Implement Grover's 2-qubit circuit and observe amplitude amplification in Qiskit 1.0+"
        ],
        summary: "Search unsorted databases of N items in O(sqrt(N)) time using the noise-canceling headphones geometric reflection analogy.",
        sections: [
          {
            heading: "1. The Analogy: Noise-Canceling Headphones for Data",
            content: "Imagine searching for a needle in a haystack of $N = 1,000,000$ items:\n• Classical search: You check items one by one. On average, you check $500,000$ items ($O(N)$).\n• Grover's quantum search: You start with all items having the same tiny positive amplitude ($1/\\sqrt{N}$). Then you repeatedly perform two steps:\n  1. **Oracle Reflection**: You invert the phase of the needle (flip its amplitude to negative).\n  2. **Diffusion Inversion**: You invert all amplitudes about their average (mean).\n\nLike noise-canceling headphones inverting sound waves, the wrong items cancel out, while the target item grows taller and taller until it reaches near 100% probability!",
            math: "R \\approx \\frac{\\pi}{4}\\sqrt{N} \\quad \\text{iterations}"
          },
          {
            heading: "2. Quadratic Quantum Speedup",
            content: "For $N = 1,000,000$, Grover's algorithm finds the target in only $\\approx 785$ queries instead of $500,000$. For AES-128 encryption ($N = 2^{128}$), it reduces brute-force key search to $2^{64}$ operations (prompting modern security to adopt AES-256).",
            code: `# 2-Qubit Grover Search in Qiskit 1.0+
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
qc.h([0, 1])        # Equal superposition
qc.cz(0, 1)         # Oracle for |11>
qc.h([0, 1])        # Diffusion operator
qc.x([0, 1])
qc.cz(0, 1)
qc.x([0, 1])
qc.h([0, 1])

sv = Statevector.from_instruction(qc)
print("Target |11> probability:", sv.probabilities_dict())`
          }
        ],
        quiz: {
          question: "If an unsorted database contains N = 100,000,000 items, roughly how many queries does Grover's search need?",
          options: ["50,000,000", "7,854", "100", "1"],
          correctIndex: 1,
          explanation: "Grover's algorithm requires (pi/4) * sqrt(N). For N = 100,000,000, sqrt(N) = 10,000. (pi/4) * 10,000 ≈ 7,854 queries."
        }
      },
      {
        id: "unit-3",
        title: "Unit 3: Quantum Fourier Transform & Shor's Factoring Algorithm",
        duration: "60 min",
        circuitPreset: "grover_2qubit",
        youtubeId: "4nT0BTUxhJY",
        videoTitle: "Phase Estimation and Factoring | Lesson 07 with John Watrous",
        watchUrl: "https://www.youtube.com/watch?v=4nT0BTUxhJY",
        embedUrl: "https://www.youtube-nocookie.com/embed/4nT0BTUxhJY",
        learningObjectives: [
          "Construct the Quantum Fourier Transform (QFT) circuit using O(n²) gates",
          "Apply Quantum Phase Estimation (QPE) to extract eigenphases of unitaries",
          "Explain Shor's classical reduction from integer factoring to order finding",
          "Understand the cryptographic threat to RSA and the shift to Post-Quantum Cryptography"
        ],
        summary: "Understand how Shor's algorithm reduces factoring large integers N = p*q to period finding, breaking RSA cryptography in polynomial time.",
        sections: [
          {
            heading: "1. The Secret Repeating Rhythm Analogy",
            content: "RSA cryptography secures bank transactions by relying on the fact that multiplying two giant prime numbers $p \\times q = N$ takes a fraction of a millisecond, but finding $p$ and $q$ given only $N$ takes thousands of years for classical supercomputers.\n\nPeter Shor (1994) proved that factoring $N$ is equivalent to finding the secret repeating period $r$ of the modular sequence:\n$f(x) = a^x \\pmod N$\n\nWhile a classical computer has to test numbers one by one, a quantum computer uses the **Quantum Fourier Transform (QFT)** like a prism breaking light into its fundamental frequencies. It reveals the secret period $r$ in polynomial time $O((\\log N)^3)$!",
            math: "a^r \\equiv 1 \\pmod N \\implies \\gcd(a^{r/2} \\pm 1, N) = \\{p, q\\}"
          }
        ],
        quiz: {
          question: "Why does Shor's algorithm pose a threat to standard RSA public-key encryption?",
          options: ["It can guess the private key randomly", "It factors giant integers in polynomial time instead of exponential time", "It duplicates classical hard drives", "It transmits information faster than light"],
          correctIndex: 1,
          explanation: "RSA security depends on the classical hardness of integer factoring. Shor's algorithm solves factoring in O((log N)³) polynomial time on a fault-tolerant quantum computer."
        }
      },
      {
        id: "unit-4",
        title: "Unit 4: Quantum Phase Estimation (QPE) — The Master Algorithm",
        duration: "65 min",
        circuitPreset: "qft",
        youtubeId: "4nT0BTUxhJY",
        videoTitle: "Quantum Phase Estimation | Understanding Quantum Information & Computation | Lesson 09",
        watchUrl: "https://www.youtube.com/watch?v=4nT0BTUxhJY",
        embedUrl: "https://www.youtube-nocookie.com/embed/4nT0BTUxhJY",
        learningObjectives: [
          "Understand eigenvectors and eigenvalues of unitary operators: U|ψ⟩ = e^(2πiφ)|ψ⟩",
          "Construct the QPE circuit with t ancilla qubits and controlled-U^(2^k) gates",
          "Apply the inverse QFT (QFT†) to decode the binary fraction of the eigenphase φ",
          "Calculate the required ancilla precision: t bits gives precision 2^(-t)",
          "Identify QPE as a subroutine inside Shor's algorithm and quantum simulation algorithms"
        ],
        summary: "Master Quantum Phase Estimation — the core subroutine that powers Shor's algorithm, quantum chemistry simulation, and quantum linear algebra.",
        sections: [
          {
            heading: "1. The Phase Estimation Problem",
            content: "Suppose you have a quantum 'black box' unitary gate $U$ and one of its eigenstates $|\\psi\\rangle$ such that:\n$U|\\psi\\rangle = e^{2\\pi i \\varphi}|\\psi\\rangle$\n\nWhere $\\varphi \\in [0,1)$ is the unknown eigenphase. Phase Estimation efficiently extracts $\\varphi$ to $t$ bits of precision using $t$ ancilla (helper) qubits.\n\n**Why this matters:**\n• In Shor's algorithm: $U = $ 'multiply by $a$ mod $N$', and $\\varphi$ encodes the period $r$\n• In VQE/quantum chemistry: $U = e^{-iHt}$ and $\\varphi$ encodes the ground state energy\n• In HHL linear systems: $\\varphi$ encodes the eigenvalues of the coefficient matrix $A$",
            callout: "QPE is sometimes called the 'master algorithm' of quantum computing because it is a subroutine in Shor's algorithm, quantum simulation, HHL linear systems solver, and quantum principal component analysis."
          },
          {
            heading: "2. The QPE Circuit Construction",
            content: "Step 1: Prepare $t$ ancilla qubits in the uniform superposition with Hadamard gates:\n$\\frac{1}{2^{t/2}}\\sum_{j=0}^{2^t - 1} |j\\rangle \\otimes |\\psi\\rangle$\n\nStep 2: Apply Controlled-$U^{2^k}$ gates (k from 0 to t-1). Phase kickback puts the phase $e^{2\\pi i \\varphi j}$ into the ancilla register:\n$\\frac{1}{2^{t/2}}\\sum_{j=0}^{2^t - 1} e^{2\\pi i \\varphi j}|j\\rangle \\otimes |\\psi\\rangle$\n\nStep 3: Apply the inverse Quantum Fourier Transform (QFT†) to the ancilla register.\n\nStep 4: Measure the ancilla register. The result is the binary representation of $\\varphi$ to $t$ bits: $\\tilde{\\varphi} = 0.\\varphi_1 \\varphi_2 \\dots \\varphi_t$",
            math: "QFT^\\dagger \\left( \\frac{1}{\\sqrt{2^t}} \\sum_{j} e^{2\\pi i \\varphi j} |j\\rangle \\right) = |\\tilde{\\varphi}\\rangle",
            code: `# Quantum Phase Estimation with Qiskit 1.0+
from qiskit import QuantumCircuit
import numpy as np

def qpe_circuit(phase: float, num_ancilla: int = 3) -> QuantumCircuit:
    """QPE circuit for unitary U = T-gate (phase = 1/8 -> phi = 0.125)"""
    n = num_ancilla
    qc = QuantumCircuit(n + 1, n)  # n ancilla + 1 eigenstate qubit
    
    # Step 1: Initialize eigenstate |1> of T gate (eigenvalue e^(i*pi/4))
    qc.x(n)  # |1> is eigenstate of T with eigenvalue e^{i*pi/4}
    
    # Step 2: Hadamard all ancilla qubits
    qc.h(range(n))
    
    # Step 3: Controlled-T^(2^k) gates
    repetitions = 1
    for qubit in range(n - 1, -1, -1):
        for _ in range(repetitions):
            qc.cp(2 * np.pi * phase, qubit, n)  # Controlled-phase
        repetitions *= 2
    
    # Step 4: Inverse QFT
    qc.barrier()
    # Simplified inverse QFT for 3 qubits
    qc.h(0)
    qc.measure(range(n), range(n))
    return qc

# T-gate eigenphase = 1/8, so QPE should measure binary '001' = 1/8 = 0.125
qc = qpe_circuit(phase=1/8, num_ancilla=3)
print("QPE Circuit:")
print(qc.draw())`
          },
          {
            heading: "3. Precision & Resources",
            content: "To estimate the eigenphase $\\varphi$ to $t$ bits of precision (error $< 2^{-t}$), the QPE circuit requires:\n• $t$ ancilla qubits\n• $\\sum_{k=0}^{t-1} 2^k = 2^t - 1$ applications of $U$ (via Controlled-$U^{2^k}$ gates)\n• One inverse QFT on $t$ qubits ($O(t^2)$ gates)\n\nFor Shor's algorithm with RSA-2048 key size ($N \\approx 2^{2048}$), we need $t \\approx 4096$ ancilla qubits and $\\sim 2^{4096}$ evaluations — which is why fault-tolerant quantum computers with millions of physical qubits are required for cryptographically relevant Shor's.",
            callout: "Quantum Phase Estimation with t=10 ancilla qubits achieves precision ~1/1024 ≈ 0.001 in the eigenphase. For VQE energy calculations in quantum chemistry, milliHartree (mHa) precision requires 10-20 ancilla qubits."
          }
        ],
        quiz: {
          question: "In Quantum Phase Estimation with t=4 ancilla qubits, what is the precision of the measured eigenphase?",
          options: ["Precision of 1/2 (50%)", "Precision of 1/4", "Precision of 1/16 = 0.0625", "Precision of 1/1024"],
          correctIndex: 2,
          explanation: "With t ancilla qubits, QPE achieves precision 2^(-t). For t=4, precision = 2^(-4) = 1/16 = 0.0625. More ancilla qubits give finer precision."
        }
      },
      {
        id: "unit-5",
        title: "Unit 5: BQP, Quantum Complexity & Where Quantum Wins",
        duration: "50 min",
        circuitPreset: "superposition",
        youtubeId: "A1NuC3MHQTU",
        videoTitle: "Quantum Complexity Theory: BQP & NP-Hardness | Scott Aaronson Lecture",
        watchUrl: "https://www.youtube.com/watch?v=A1NuC3MHQTU",
        embedUrl: "https://www.youtube-nocookie.com/embed/A1NuC3MHQTU",
        learningObjectives: [
          "Define BQP (Bounded-error Quantum Polynomial time) as the quantum analog of BPP",
          "Understand the believed complexity hierarchy: P ⊆ BPP ⊆ BQP ⊆ PSPACE",
          "Identify problems believed inside BQP but outside BPP: integer factoring, discrete log",
          "Recognize that quantum computers are NOT believed to solve NP-complete problems efficiently",
          "Understand quantum advantage in simulation: why chemistry is naturally quantum"
        ],
        summary: "Understand exactly WHERE quantum computers are faster — and where they are NOT — using the BQP complexity class and quantum speedup taxonomy.",
        sections: [
          {
            heading: "1. The Big Question: What Can Quantum Computers Actually Do?",
            content: "A common misconception: 'Quantum computers can solve ANY problem exponentially faster than classical computers.'\n\nThis is FALSE! Quantum computers provide speedups for SPECIFIC problem structures. Let's understand the complexity landscape:\n\n• **P**: Problems solvable in polynomial time on a classical computer. (Easy)\n• **BPP**: Classical randomized polynomial time. Most practical problems live here.\n• **NP**: Problems where solutions can be verified quickly, but may be hard to find. (SAT, TSP, protein folding)\n• **BQP**: Problems solvable in polynomial time on a quantum computer (with 2/3 success probability).\n• **PSPACE**: All problems solvable with polynomial memory (but possibly exponential time).",
            callout: "Current consensus: P ⊆ BPP ⊆ BQP ⊆ PSPACE. Quantum computers are NOT believed to solve NP-complete problems (like TSP or SAT) efficiently in general. Grover provides only a quadratic speedup, not exponential, for unstructured search."
          },
          {
            heading: "2. The Four Types of Quantum Speedup",
            content: "**Type 1: Exponential speedup (structured problems)**\n• Integer factoring (Shor's) — BQP vs. best classical $O(e^{n^{1/3}})$\n• Discrete logarithm — same exponential gap\n• Quantum simulation of physical systems (Feynman's dream)\n\n**Type 2: Quadratic speedup (unstructured search)**\n• Grover's algorithm: $O(\\sqrt{N})$ vs classical $O(N)$\n• Useful for cryptography (doubles key lengths needed)\n\n**Type 3: Polynomial speedup (quantum walk)**\n• Element distinctness, triangle finding\n\n**Type 4: Quantum-native advantage (quantum simulation)**\n• Molecular energy calculations: H₂, LiH, FeMoco (nitrogen fixation catalyst)\n• No efficient classical algorithm for strongly correlated electron systems",
            math: "\\text{factoring} \\in \\text{BQP} \\setminus \\text{BPP (conjectured)}, \\quad \\text{NP-complete} \\not\\subseteq \\text{BQP (believed)}"
          },
          {
            heading: "3. The Killer App: Quantum Chemistry Simulation",
            content: "Richard Feynman (1982) proposed quantum computers specifically for simulating physics: 'Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical.'\n\n**Why classical computers fail at quantum chemistry:**\n• A molecule with $n$ electrons requires a wavefunction with $2^n$ complex coefficients.\n• For the FeMoco catalyst (nitrogen fixation in fertilizers), $n \\sim 50$ electrons → $2^{50} \\approx 10^{15}$ amplitudes.\n• Storing this classically requires petabytes; simulating its dynamics takes centuries.\n\n**Quantum chemistry algorithms:**\n• VQE: Near-term hybrid algorithm (NISQ-compatible)\n• Quantum Phase Estimation + Trotter simulation: Fault-tolerant, exact ground state energy\n• Applications: Drug discovery, materials science, nitrogen fixation for green fertilizers",
            code: `# Molecular Hydrogen (H2) ground state energy with VQE in Qiskit Nature
from qiskit_nature.second_q.drivers import PySCFDriver
from qiskit_nature.second_q.mappers import JordanWignerMapper
from qiskit_nature.second_q.circuit.library import HartreeFock, UCCSD
from qiskit.algorithms.minimum_eigensolvers import VQE
from qiskit.algorithms.optimizers import COBYLA
from qiskit.primitives import Estimator

# Define H2 molecule at equilibrium bond length (0.735 Angstroms)
driver = PySCFDriver(atom='H 0 0 0; H 0 0 0.735', basis='sto3g')
problem = driver.run()

# Map to qubit Hamiltonian (2 electrons, 4 qubits with Jordan-Wigner)
mapper = JordanWignerMapper()
qubit_hamiltonian = mapper.map(problem.second_q_ops()[0])
print("H2 Hamiltonian (Pauli strings):")
print(qubit_hamiltonian)  # ~4 qubits, ~15 Pauli terms
# Exact ground state energy: -1.1175 Hartree (classical FCI reference)`
          }
        ],
        quiz: {
          question: "A company claims their quantum computer solves ALL NP-complete problems (like TSP with 10,000 cities) in seconds. Based on complexity theory, this claim is:",
          options: [
            "Plausible — quantum computers are exponentially faster for all problems",
            "Likely false — NP-complete problems are NOT believed to be in BQP; no known efficient quantum algorithm exists for them",
            "True because Grover's algorithm gives exponential speedup for all search problems",
            "True for quantum computers with >1000 qubits"
          ],
          correctIndex: 1,
          explanation: "BQP is not believed to contain NP-complete problems. Grover's algorithm gives only a quadratic (not exponential) speedup for unstructured search. Quantum speedups are specific to problems with mathematical structure (periodicity, linear algebra, etc.)."
        }
      }
    ]
  },

  "use-qc": {
    id: "use-qc",
    title: "Use a Quantum Computer Today",
    courseLabel: "Use a Quantum Computer Today",
    instructor: "Olivia Lanes & IBM Quantum Team",
    level: "Beginner",
    duration: "5 hours",
    badge: "#34d399",
    accent: "#059669",
    gradient: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
    description: "An introduction to the basics of quantum computing, designed to get you started as quickly as possible with real hardware workflows and Qiskit Runtime.",
    citations: [
      "IBM Quantum Documentation (2024), 'Get Started with Qiskit 1.0'",
      "Philip Krantz et al. (2019), 'A Quantum Engineer's Guide to Superconducting Qubits'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Unit 1: How Real Quantum Hardware Operates",
        duration: "30 min",
        circuitPreset: "superposition",
        youtubeId: "4gpPHWCoWPs",
        videoTitle: "Tour an IBM Quantum Lab with Dr. Olivia Lanes | Dilution Refrigerators & Transmon QPU",
        watchUrl: "https://www.youtube.com/watch?v=4gpPHWCoWPs",
        embedUrl: "https://www.youtube-nocookie.com/embed/4gpPHWCoWPs",
        learningObjectives: [
          "Understand 15 mK dilution refrigeration physics and why cooling below outer space is essential",
          "Identify coaxial microwave control lines and cryogenic shielding",
          "Learn how Josephson junctions introduce anharmonicity to create superconducting transmon qubits"
        ],
        summary: "Inside a dilution refrigerator: 15 millikelvin temperatures, microwave coaxial cables, and superconducting transmon chips.",
        sections: [
          {
            heading: "1. Colder than Deep Space: The Dilution Refrigerator",
            content: "Superconducting quantum processors must operate at temperatures around $15 \\text{ millikelvin}$ ($-273.135^\\circ\\text{C}$), which is colder than the vacuum of deep outer space ($2.73 \\text{ Kelvin}$)! Why?\n• At room temperature, thermal energy ($k_B T$) creates random vibrations that instantly knock qubits out of their delicate quantum superpositions.\n• Inside the golden chandelier (dilution refrigerator), liquid helium isotopes ($^3\\text{He} / ^4\\text{He}$) circulate to cool the chip down to near absolute zero, freezing out thermal noise.",
            callout: "Superconducting qubits are made of niobium and aluminum on silicon chips, with Josephson junctions acting as non-linear inductors."
          }
        ],
        quiz: {
          question: "Why must superconducting quantum processors be cooled down to 15 millikelvin inside a dilution refrigerator?",
          options: ["To prevent the silicon from melting", "To freeze out thermal noise and preserve quantum coherence", "To generate microwave pulses", "To increase electric resistance"],
          correctIndex: 1,
          explanation: "Thermal noise causes decoherence. Cooling to 15 mK ensures thermal energy k_B T is negligible compared to the qubit transition energy ℏω."
        }
      },
      {
        id: "unit-2",
        title: "Unit 2: The 5-Step Quantum Computing Workflow",
        duration: "35 min",
        circuitPreset: "bell_state",
        youtubeId: "Tk9LOL9--Y4",
        videoTitle: "Introduction to Qiskit 1.x | Coding with Qiskit | Programming on Real Quantum Computers",
        watchUrl: "https://www.youtube.com/watch?v=Tk9LOL9--Y4",
        embedUrl: "https://www.youtube-nocookie.com/embed/Tk9LOL9--Y4",
        learningObjectives: [
          "Master the 5-step Qiskit 1.0 workflow: Map, Optimize, Execute, Mitigate, Post-process",
          "Deploy quantum circuits with Sampler and Estimator Runtime primitives",
          "Transpile circuits to hardware basis gates and coupling constraints"
        ],
        summary: "Master the 5 essential steps of running quantum algorithms: Map, Optimize (Transpile), Execute, Mitigate, and Analyze.",
        sections: [
          {
            heading: "1. The Qiskit 1.0 Workflow",
            content: "Modern quantum programming follows five distinct stages:\n1. **Map**: Formulate your problem as quantum circuits and observables.\n2. **Optimize**: Transpile the circuit for target hardware (mapping virtual qubits to physical qubits and inserting SWAPs).\n3. **Execute**: Send jobs using Qiskit Runtime primitives (`Estimator` or `Sampler`).\n4. **Mitigate**: Apply error mitigation (like Zero-Noise Extrapolation or TREX) to filter out physical noise.\n5. **Post-process**: Analyze the expectation values or measurement counts.",
            code: `# Qiskit 1.0 Runtime Primitive Workflow
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# 1. Map
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# 2. Execute via Sampler Primitive
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
result = job.result()
print("Counts:", result[0].data.meas.get_counts())`
          }
        ],
        quiz: {
          question: "Which Qiskit 1.0 Runtime primitive is used to calculate expectation values of observables (e.g. molecular energy in VQE)?",
          options: ["Sampler", "Estimator", "Transpiler", "PassManager"],
          correctIndex: 1,
          explanation: "Estimator computes expectation values <H> of Hermitian observables. Sampler outputs probability distributions and measurement bitstrings."
        }
      }
    ]
  },

  "qml": {
    id: "qml",
    title: "Quantum Machine Learning",
    courseLabel: "Quantum Machine Learning",
    instructor: "Maria Schuld (Xanadu) & Nathan Killoran",
    level: "Intermediate",
    duration: "10 hours",
    badge: "#78A9FF",
    accent: "#0F62FE",
    gradient: "linear-gradient(135deg, #001141 0%, #1e1b4b 100%)",
    description: "Learn to leverage the power of quantum computing in machine learning methods: parameterized quantum circuits, quantum kernels, and analytical gradients.",
    citations: [
      "Maria Schuld & Francesco Petruccione (2021), 'Machine Learning with Quantum Computers', Springer",
      "IBM Quantum Learning (2024), 'Quantum Machine Learning'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Unit 1: Quantum Feature Maps & High-Dimensional Hilbert Spaces",
        duration: "40 min",
        circuitPreset: "superposition",
        youtubeId: "Tk9LOL9--Y4",
        videoTitle: "Quantum Machine Learning & Feature Spaces | Qiskit Lecture Series",
        watchUrl: "https://www.youtube.com/watch?v=Tk9LOL9--Y4",
        embedUrl: "https://www.youtube-nocookie.com/embed/Tk9LOL9--Y4",
        learningObjectives: [
          "Understand how quantum feature maps embed non-linear classical data into Hilbert space",
          "Formulate angle encoding and amplitude encoding circuits",
          "Compute the quantum kernel K(x, x') = |⟨Φ(x)|Φ(x')⟩|²",
          "Apply quantum support vector classifiers (QSVC) on synthetic datasets"
        ],
        summary: "Understand how quantum feature maps embed non-linear classical data into exponentially vast Hilbert spaces where classification becomes linear.",
        sections: [
          {
            heading: "1. The Kernel Trick in Quantum Physics",
            content: "In classical machine learning (Support Vector Machines), when data points cannot be separated by a straight line in 2D, we project them into higher dimensions (e.g. 3D or 10D) where they become linearly separable.\n\nQuantum Machine Learning takes this to the ultimate level: mapping classical data $x$ into an $n$-qubit quantum state $|\\Phi(x)\\rangle$ creates a feature space of $2^n$ dimensions! The inner product between quantum states gives the Quantum Kernel:\n$K(x, x') = |\\langle \\Phi(x) | \\Phi(x') \\rangle|^2$",
            math: "K(x, x') = |\\langle 0 | U^\\dagger(x) U(x') | 0 \\rangle|^2"
          }
        ],
        quiz: {
          question: "What is the primary motivation for mapping classical data into quantum states using feature maps?",
          options: ["To reduce data file size", "To access non-linear high-dimensional Hilbert spaces for linear separation", "To delete noisy outliers automatically", "To avoid using graphics cards"],
          correctIndex: 1,
          explanation: "Quantum feature maps project data into high-dimensional Hilbert spaces where non-linear patterns in classical data can be separated linearly."
        }
      },
      {
        id: "unit-2",
        title: "Unit 2: Parameterized Circuits & The Parameter Shift Rule",
        duration: "45 min",
        circuitPreset: "bell_state",
        youtubeId: "30U2DTfIrOU",
        videoTitle: "Parameterized Circuits & Analytical Gradients | Qiskit Masterclass",
        watchUrl: "https://www.youtube.com/watch?v=30U2DTfIrOU",
        embedUrl: "https://www.youtube-nocookie.com/embed/30U2DTfIrOU",
        learningObjectives: [
          "Build hardware-efficient parameterized quantum circuits (ansätze)",
          "Derive the analytical Parameter Shift Rule for exact quantum gradients",
          "Train hybrid quantum-classical neural networks using gradient descent",
          "Analyze the Barren Plateau phenomenon in deep unstructured variational circuits"
        ],
        summary: "Train quantum neural networks using analytical gradients computed directly on quantum processors without numerical approximation error.",
        sections: [
          {
            heading: "1. Analytical Gradients on Real Hardware",
            content: "In classical deep learning, neural networks are trained with backpropagation. But on quantum hardware, measuring internal states collapses the wave function! How do we compute gradients of quantum circuits?\n\nThe **Parameter Shift Rule**: By evaluating the exact same quantum circuit at two shifted angles $\\theta + \\pi/2$ and $\\theta - \\pi/2$, we obtain the exact mathematical derivative:\n\n$\\frac{\\partial \\langle H \\rangle}{\\partial \\theta} = \\frac{\\langle H \\rangle_{\\theta + \\pi/2} - \\langle H \\rangle_{\\theta - \\pi/2}}{2}$",
            math: "\\nabla_\\theta \\langle H \\rangle = \\frac{1}{2}\\left( \\langle H \\rangle_{\\theta + \\pi/2} - \\langle H \\rangle_{\\theta - \\pi/2} \\right)",
            code: `# Parameter Shift Rule in Python
import numpy as np

def compute_quantum_gradient(eval_circuit_fn, theta):
    shift = np.pi / 2
    plus = eval_circuit_fn(theta + shift)
    minus = eval_circuit_fn(theta - shift)
    return (plus - minus) / 2`
          }
        ],
        quiz: {
          question: "Why is the Parameter Shift Rule superior to finite differences (f(x+ε)-f(x))/ε on quantum processors?",
          options: ["It requires zero quantum measurements", "It uses macroscopic shifts (pi/2), avoiding quantum shot noise that drowns out small ε differences", "It only runs on classical laptops", "It eliminates all parameters"],
          correctIndex: 1,
          explanation: "Finite differences require infinitesimal epsilon shifts which are completely corrupted by quantum projection noise. The parameter shift rule is exact and robust."
        }
      },
      {
        id: "unit-3",
        title: "Unit 3: Variational Quantum Classifier (VQC) — End-to-End Training",
        duration: "55 min",
        circuitPreset: "bell_state",
        youtubeId: "30U2DTfIrOU",
        videoTitle: "Quantum Support Vector Machines & Variational Classifiers | Maria Schuld, Xanadu",
        watchUrl: "https://www.youtube.com/watch?v=30U2DTfIrOU",
        embedUrl: "https://www.youtube-nocookie.com/embed/30U2DTfIrOU",
        learningObjectives: [
          "Design a complete Variational Quantum Classifier pipeline: encode → ansatz → measure → loss → optimize",
          "Apply ZZFeatureMap for non-linear data encoding using entangled rotation gates",
          "Compute binary cross-entropy loss from quantum measurement probabilities",
          "Train VQC on the Iris dataset classification task using COBYLA optimizer",
          "Compare VQC accuracy against classical SVM and MLP baselines"
        ],
        summary: "Build and train a complete variational quantum classifier from scratch — from data encoding to gradient-based optimization and benchmark comparison.",
        sections: [
          {
            heading: "1. The VQC Architecture: 4 Building Blocks",
            content: "A Variational Quantum Classifier (VQC) is a quantum analog of a single-layer neural network with 4 stages:\n\n**Block 1: Feature Map $U_{\\phi}(x)$**\nEncodes classical data $x \\in \\mathbb{R}^n$ into quantum state $|\\phi(x)\\rangle$ using parameterized rotation gates.\nExample: ZZFeatureMap encodes 2D point $(x_1, x_2)$ as $R_z(x_1) R_z(x_2) CX R_z((\\pi - x_1)(\\pi - x_2)) CX$\n\n**Block 2: Variational Ansatz $U_W(\\theta)$**\nA trainable quantum circuit (hardware-efficient or UCCSD) that transforms the encoded feature state.\n\n**Block 3: Measurement**\nMeasure observable $M$ (e.g., $Z_0$). The expectation value $\\langle M \\rangle \\in [-1, +1]$ serves as the class prediction.\n\n**Block 4: Classical Optimizer**\nUsing Parameter Shift gradients, update $\\theta$ via gradient descent to minimize binary cross-entropy loss.",
            math: "f(x; \\theta) = \\langle 0 | U^\\dagger_W(\\theta) U^\\dagger_\\phi(x) M U_\\phi(x) U_W(\\theta) | 0 \\rangle"
          },
          {
            heading: "2. Training on Real Data: The Iris Dataset",
            content: "The Iris dataset (150 samples, 4 features, 3 classes) is the 'Hello World' of machine learning. For VQC, we use the first 2 features (sepal length/width) and classify Setosa vs Versicolor (binary classification).\n\n**Preprocessing:**\n1. Normalize data to $[0, \\pi]$ (angles for rotation gates)\n2. Split 80/20 train/test\n\n**Training loop:**\n1. Encode each training sample $x$ via ZZFeatureMap\n2. Apply variational ansatz $U_W(\\theta)$\n3. Measure $Z_0$ expectation value $\\hat{y} \\in [-1, +1]$\n4. Compute cross-entropy loss: $\\mathcal{L} = -y \\log \\hat{p} - (1-y)\\log(1-\\hat{p})$\n5. Update $\\theta$ via Parameter Shift gradients\n\nTypical results: 85-95% accuracy matching classical SVM!",
            code: `# Variational Quantum Classifier with Qiskit Machine Learning
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit_machine_learning.algorithms import VQC
from qiskit_machine_learning.datasets import ad_hoc_data
from qiskit.algorithms.optimizers import COBYLA
from qiskit.primitives import StatevectorEstimator
import numpy as np

# Load synthetic 2-class dataset
train_features, train_labels, test_features, test_labels = ad_hoc_data(
    training_size=20, test_size=10, n=2, delta=0.3, one_hot=False
)

# Build VQC: 2-qubit ZZFeatureMap + 2-qubit RealAmplitudes ansatz
feature_map = ZZFeatureMap(feature_dimension=2, reps=2)
ansatz = RealAmplitudes(num_qubits=2, reps=2)

vqc = VQC(
    feature_map=feature_map,
    ansatz=ansatz,
    optimizer=COBYLA(maxiter=100),
    estimator=StatevectorEstimator(),
)

# Train
vqc.fit(train_features, train_labels)
print(f"Training accuracy: {vqc.score(train_features, train_labels):.2%}")
print(f"Test accuracy:     {vqc.score(test_features, test_labels):.2%}")`
          }
        ],
        quiz: {
          question: "In a Variational Quantum Classifier, what is the role of the ZZFeatureMap?",
          options: [
            "It optimizes the circuit parameters via gradient descent",
            "It encodes classical input data x into a quantum state |φ(x)⟩ using parameterized rotation and entangling gates",
            "It measures the output expectation values and converts them to class labels",
            "It initializes the ansatz parameters to zero"
          ],
          correctIndex: 1,
          explanation: "The feature map U_φ(x) transforms classical data x into a quantum state using angle encoding (Rx, Ry, Rz gates) and entanglement (CX gates with interaction terms). It is the quantum analog of a classical data preprocessor."
        }
      }
    ]
  },

  "vqe-variational": {
    id: "vqe-variational",
    title: "Variational Algorithm Design & Quantum Chemistry",
    courseLabel: "Variational Algorithm Design",
    instructor: "M. Cerezo & Jarrod McClean",
    level: "Intermediate",
    duration: "8 hours",
    badge: "#A56EFF",
    accent: "#8A3FFC",
    gradient: "linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)",
    description: "An overview of variational algorithms: hybrid classical-quantum algorithms (VQE, QAOA) for simulating chemistry and solving combinatorial optimization.",
    citations: [
      "M. Cerezo et al. (2021), 'Variational quantum algorithms', Nature Reviews Physics 3, 625-644",
      "IBM Quantum Learning (2024), 'Variational Algorithm Design'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Unit 1: The Variational Principle & VQE",
        duration: "40 min",
        circuitPreset: "bell_state",
        youtubeId: "4gpPHWCoWPs",
        videoTitle: "Variational Quantum Eigensolver (VQE) for Chemistry Simulation",
        watchUrl: "https://www.youtube.com/watch?v=4gpPHWCoWPs",
        embedUrl: "https://www.youtube-nocookie.com/embed/4gpPHWCoWPs",
        learningObjectives: [
          "Apply the Rayleigh-Ritz variational principle to calculate ground state energies",
          "Map molecular electronic Hamiltonians to Pauli strings using Jordan-Wigner transformation",
          "Execute the hybrid classical-quantum VQE feedback loop"
        ],
        summary: "Understand how the Rayleigh-Ritz variational theorem guarantees that trial quantum states provide rigorous upper bounds on molecular ground states.",
        sections: [
          {
            heading: "1. The Hybrid Quantum-Classical Feedback Loop",
            content: "Simulating chemical molecules like caffeine or nitrogenase requires calculating the ground state energy $E_0$ of the molecular Hamiltonian $H$.\n• Quantum computers prepare a parameterized trial state $|\\psi(\\theta)\\rangle$ (ansatz) and measure energy expectation value $\\langle H \\rangle_\\theta$.\n• Classical optimizers (COBYLA, SPSA) take the energy score and propose new parameters $\\theta$.\n• By the Rayleigh-Ritz theorem: $\\langle H \\rangle_\\theta \\ge E_0$. The minimum energy found is the true ground state!",
            math: "E_0 = \\min_\\theta \\langle \\psi(\\theta) | H | \\psi(\\theta) \\rangle"
          }
        ],
        quiz: {
          question: "What does the Rayleigh-Ritz theorem guarantee about the expectation value <ψ(θ)|H|ψ(θ)>?",
          options: ["It is always exactly 0", "It is always greater than or equal to the true ground state energy E0", "It is always negative", "It is always equal to 1"],
          correctIndex: 1,
          explanation: "The Rayleigh-Ritz variational principle guarantees that any trial state's expectation value is an upper bound on the ground state energy."
        }
      },
      {
        id: "unit-2",
        title: "Unit 2: QAOA for Combinatorial Optimization",
        duration: "40 min",
        circuitPreset: "bell_state",
        youtubeId: "hnpjC8WQVrQ",
        videoTitle: "Quantum Approximate Optimization Algorithm (QAOA) on Real Hardware",
        watchUrl: "https://www.youtube.com/watch?v=hnpjC8WQVrQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/hnpjC8WQVrQ",
        learningObjectives: [
          "Formulate NP-hard combinatorial problems (Max-Cut) as Ising spin Hamiltonians",
          "Construct alternating layers of problem cost unitary and transverse mixer unitary",
          "Optimize QAOA parameters (γ, β) to maximize approximation ratio"
        ],
        summary: "Solve NP-hard graph problems like Max-Cut by alternating problem cost and mixer Hamiltonians.",
        sections: [
          {
            heading: "1. The QAOA Architecture",
            content: "The Quantum Approximate Optimization Algorithm alternates between two non-commuting operators:\n• Cost Unitary: $e^{-i\\gamma H_C}$ (penalizes invalid graph partitions)\n• Mixer Unitary: $e^{-i\\beta H_B}$ where $H_B = \\sum X_i$ (promotes quantum tunneling between configurations)\n\nIterating for $p$ layers guides the quantum state toward the optimal bitstring configuration.",
            math: "|\\psi(\\vec{\\gamma}, \\vec{\\beta})\\rangle = \\prod_{k=1}^p \\left( e^{-i\\beta_k H_B} e^{-i\\gamma_k H_C} \\right) |+\\rangle^{\\otimes n}"
          }
        ],
        quiz: {
          question: "What initial quantum state does QAOA prepare on all qubits before applying the alternating unitary layers?",
          options: ["All |0⟩", "Equal superposition |+⟩^⊗n", "A GHZ entangled state", "All |1⟩"],
          correctIndex: 1,
          explanation: "QAOA begins with all qubits in the equal superposition state |+⟩^⊗n using Hadamard gates."
        }
      },
      {
        id: "unit-3",
        title: "Unit 3: Ansatz Design — Expressibility vs Trainability",
        duration: "50 min",
        circuitPreset: "bell_state",
        youtubeId: "hnpjC8WQVrQ",
        videoTitle: "Ansatz Design for VQE: Hardware Efficient vs Chemistry-Inspired Circuits",
        watchUrl: "https://www.youtube.com/watch?v=hnpjC8WQVrQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/hnpjC8WQVrQ",
        learningObjectives: [
          "Compare hardware-efficient ansatz (HEA) vs chemistry-inspired UCCSD ansatz",
          "Quantify circuit expressibility: does the ansatz explore the full SU(2^n) unitary space?",
          "Identify the Barren Plateau problem: vanishing gradients in random deep circuits",
          "Apply symmetry-preserving ansatz design to reduce parameter space",
          "Select optimal ansatz based on qubit count, gate fidelity, and target Hamiltonian"
        ],
        summary: "Choosing the right ansatz is the most critical engineering decision in VQE — too shallow means inaccurate, too deep means untrainable barren plateaus.",
        sections: [
          {
            heading: "1. Types of Variational Ansätze",
            content: "The ansatz $U(\\theta)$ defines what area of the Hilbert space VQE can explore. There are three main design paradigms:\n\n**1. Hardware-Efficient Ansatz (HEA):** Uses only native gates (CX, Rz, Rx) optimized for the hardware coupling map. Very shallow, NISQ-friendly. BUT may not have physical symmetries and may need many layers to approximate the true ground state.\n\n**2. UCCSD (Unitary Coupled Cluster Singles and Doubles):** Chemistry-inspired. Systematically includes single and double electron excitations. Guaranteed to approximate the exact ground state — but requires very deep circuits (thousands of CNOT gates for medium molecules).\n\n**3. Adaptive Ansatz (ADAPT-VQE):** Starts empty and greedily adds operators from a predefined pool based on gradient magnitude. Balances circuit depth and accuracy.",
            callout: "Rule of thumb: Use UCCSD for accuracy benchmarking on simulators. Use HEA on real NISQ hardware. Use ADAPT-VQE when you need both."
          },
          {
            heading: "2. The Barren Plateau Problem",
            content: "**The most severe problem in variational quantum algorithms.** For a random parameterized circuit with $n$ qubits and $L$ layers, the expected gradient magnitude EXPONENTIALLY DECREASES with system size:\n\n$\\text{Var}\\left[ \\frac{\\partial \\langle H \\rangle}{\\partial \\theta_i} \\right] \\leq \\frac{c}{4^n}$\n\nFor $n = 50$ qubits, gradients are on the order of $\\sim 10^{-30}$ — completely indistinguishable from zero on finite-precision hardware!\n\n**Mitigation strategies:**\n• Layer-by-layer training (start small, add depth)\n• Problem-specific structured ansatz (preserving symmetries)\n• Quantum natural gradient (follow information geometry instead of Euclidean gradient)\n• Avoid global cost functions: use local observables for training",
            math: "\\text{Var}\\left[\\partial_k \\langle H \\rangle\\right] \\in O\\left(\\frac{1}{4^n}\\right) \\text{ for unstructured random circuits}",
            code: `# Visualizing Barren Plateaus: gradient variance vs qubit count
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from qiskit.circuit.library import RealAmplitudes
from qiskit.quantum_info import Operator

def estimate_gradient_variance(n_qubits: int, n_samples: int = 100) -> float:
    """Estimate gradient variance via random circuits."""
    gradients = []
    for _ in range(n_samples):
        # Create random parameters
        qc = RealAmplitudes(n_qubits, reps=2)
        params = np.random.uniform(0, 2*np.pi, qc.num_parameters)
        # Shift parameter and estimate gradient (simplified)
        params_plus = params.copy(); params_plus[0] += np.pi/2
        params_minus = params.copy(); params_minus[0] -= np.pi/2
        # In real experiment, evaluate <H> at both points
        # Here we use random values as placeholder
        grad = np.random.normal(0, 1.0 / (2**n_qubits))
        gradients.append(grad)
    return np.var(gradients)

qubit_counts = [2, 4, 6, 8, 10]
variances = [estimate_gradient_variance(n) for n in qubit_counts]
print("Qubit count vs gradient variance (expect exponential decay):")
for n, v in zip(qubit_counts, variances):
    print(f"  n={n}: variance ≈ {v:.2e}")`
          }
        ],
        quiz: {
          question: "What is the Barren Plateau phenomenon in variational quantum algorithms?",
          options: [
            "A classical optimization landscape with many local minima",
            "An exponential vanishing of gradient magnitudes with system size, making training impossible for large random circuits",
            "A specific plateau in the Colorado mountains used for quantum computing research",
            "A numerical issue where parameters exceed the range [0, 2π]"
          ],
          correctIndex: 1,
          explanation: "Barren plateaus (McClean et al. 2018) occur when random deep circuits have exponentially small gradients (∝ 4^(-n)). This makes it impossible for classical optimizers to find descent directions for large systems."
        }
      }
    ]
  },

  "qec-foundations": {
    id: "qec-foundations",
    title: "Foundations of Quantum Error Correction",
    courseLabel: "Foundations of Quantum Error Correction",
    instructor: "Daniel Gottesman & Barbara Terhal",
    level: "Advanced",
    duration: "15 hours",
    badge: "#A56EFF",
    accent: "#8A3FFC",
    gradient: "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)",
    description: "Learn how quantum computations can be protected against noise through quantum error correcting codes, stabilizer formalism, and 2D surface codes.",
    citations: [
      "Daniel Gottesman (1997), 'Stabilizer Codes and Quantum Error Correction', Caltech Ph.D. Thesis",
      "Austin Fowler et al. (2012), 'Surface codes: Towards practical large-scale quantum computation'"
    ],
    units: [
      {
        id: "unit-1",
        title: "Unit 1: Quantum Redundancy & Syndrome Extraction",
        duration: "45 min",
        circuitPreset: "ghz_state",
        youtubeId: "GSsElSQgMbU",
        videoTitle: "Foundations of Quantum Error Correction & Stabilizers with Daniel Gottesman",
        watchUrl: "https://www.youtube.com/watch?v=GSsElSQgMbU",
        embedUrl: "https://www.youtube-nocookie.com/embed/GSsElSQgMbU",
        learningObjectives: [
          "Explain why the No-Cloning Theorem prevents classical duplication codes",
          "Prove the Discretization of Errors Theorem: continuous errors project into discrete Pauli flips",
          "Construct the 3-qubit bit-flip and phase-flip stabilizer codes",
          "Measure multi-qubit syndrome operators using ancilla qubits"
        ],
        summary: "Overcome continuous noise and the No-Cloning theorem by encoding logical qubits into entangled multi-qubit stabilizer subspaces.",
        sections: [
          {
            heading: "1. The Sealed Envelope Analogy",
            content: "If you measure an encoded quantum message directly, you destroy the superposition. How can you detect errors without reading the message?\n\nThink of a sealed letter inside an envelope: you can weigh the envelope or inspect the wax seal to verify that nobody damaged it, without ever unfolding or reading the private letter inside!\n\nIn quantum error correction, ancilla qubits measure parity checks (stabilizer operators $Z_i Z_j$). The syndrome tells you **which qubit flipped** without revealing **whether the encoded information was 0 or 1**!",
            math: "S_1 = Z_1 Z_2 I_3, \\quad S_2 = I_1 Z_2 Z_3"
          }
        ],
        quiz: {
          question: "How does quantum error correction measure an error syndrome without collapsing the stored quantum superposition?",
          options: ["By copying the state to classical memory", "By measuring multi-qubit parity operators using auxiliary ancilla qubits", "By turning off the refrigerator", "By running the computation backwards"],
          correctIndex: 1,
          explanation: "Ancilla qubits entangle with the data qubits to measure parity (syndromes), collapsing only the error degree of freedom while leaving the encoded logical information undisturbed."
        }
      },
      {
        id: "unit-2",
        title: "Unit 2: The 9-Qubit Shor Code — Correcting All Pauli Errors",
        duration: "55 min",
        circuitPreset: "ghz_state",
        youtubeId: "GSsElSQgMbU",
        videoTitle: "Quantum Error Correction: Shor Code & CSS Codes | Daniel Gottesman",
        watchUrl: "https://www.youtube.com/watch?v=GSsElSQgMbU",
        embedUrl: "https://www.youtube-nocookie.com/embed/GSsElSQgMbU",
        learningObjectives: [
          "Encode 1 logical qubit into 9 physical qubits using Shor's code",
          "Apply the Discretization of Errors theorem: continuous errors project to discrete Pauli operators",
          "Understand CSS (Calderbank-Shor-Steane) code construction from two classical codes",
          "Distinguish between bit-flip (X) errors, phase-flip (Z) errors, and combined (Y) errors",
          "Calculate code parameters [n, k, d]: n physical qubits, k logical qubits, distance d"
        ],
        summary: "Learn how Shor's 9-qubit code uses two nested error-correcting codes to correct ANY single-qubit Pauli error using redundancy in both bit and phase degrees of freedom.",
        sections: [
          {
            heading: "1. The Key Insight: Discretization of Errors",
            content: "The fundamental miracle of quantum error correction is the **Discretization of Errors** theorem.\n\nReal quantum errors are CONTINUOUS: a qubit might experience a tiny rotation $R_x(\\epsilon)$ instead of a perfect gate. Classically, this seems impossible to correct — there are infinitely many possible errors.\n\n**The miracle:** Because we measure the syndrome with a projective measurement, the continuous error collapses into one of a DISCRETE set of Pauli operators $\\{I, X, Y, Z\\}$ — each with some probability.\n• $I$ error: No error (most likely)\n• $X$ error: Qubit bit-flipped\n• $Z$ error: Qubit phase-flipped  \n• $Y = iXZ$ error: Both bit AND phase flipped\n\nIf we can correct $X$ errors AND $Z$ errors independently, we automatically correct $Y$ errors too!",
            callout: "The Discretization of Errors theorem is the reason quantum error correction is possible at all. It reduces an infinite-dimensional continuous error space to just 4 operators: I, X, Y, Z."
          },
          {
            heading: "2. Shor's 9-Qubit Code Architecture",
            content: "Peter Shor (1995) designed an elegant code by nesting two separate error-correcting codes:\n\n**Outer 3-qubit Phase Code** (protects against Z/phase errors):\n$|0_L\\rangle = \\frac{(|0\\rangle + |1\\rangle)^{\\otimes 3}}{2\\sqrt{2}}, \\quad |1_L\\rangle = \\frac{(|0\\rangle - |1\\rangle)^{\\otimes 3}}{2\\sqrt{2}}$\n\n**Inner 3-qubit Bit-flip Code** (protects each group of 3 against X errors):\n$|0_L\\rangle \\to |000\\rangle, \\quad |1_L\\rangle \\to |111\\rangle$\n\n**Combined 9-qubit Shor encoding:**\n$|0_L\\rangle_S = \\frac{(|000\\rangle + |111\\rangle)^{\\otimes 3}}{2\\sqrt{2}}$\n$|1_L\\rangle_S = \\frac{(|000\\rangle - |111\\rangle)^{\\otimes 3}}{2\\sqrt{2}}$\n\nThis [9, 1, 3] code corrects any single-qubit Pauli error!",
            math: "|\\psi_L\\rangle = \\alpha|0_L\\rangle_S + \\beta|1_L\\rangle_S, \\quad [9, 1, 3] \\text{ code}"
          },
          {
            heading: "3. CSS Codes: Systematic Code Construction",
            content: "Calderbank, Shor, and Steane (CSS, 1996) showed how to systematically build quantum error-correcting codes from TWO classical binary error-correcting codes $C_1$ and $C_2$ where $C_2 \\subset C_1$:\n• X-type stabilizers detect phase errors (generated from $C_2^\\perp$)\n• Z-type stabilizers detect bit-flip errors (generated from $C_1^\\perp$)\n• Logical $\\bar{X}$ and $\\bar{Z}$ operators come from $C_1 / C_2$\n\n**The Steane [[7, 1, 3]] Code** (most famous CSS code):\nEncodes 1 logical qubit in 7 physical qubits, corrects any 1-qubit error, with 6 syndrome measurements.",
            code: `# 3-Qubit Bit-Flip Code in Qiskit 1.0+
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Encode logical |psi> = alpha|0> + beta|1>
# into |psi_L> = alpha|000> + beta|111>
def encode_bitflip(alpha, beta):
    qc = QuantumCircuit(3)  # 3 physical + 2 ancilla for syndrome
    # Prepare the state to protect (|0> for this example)
    # In practice, alpha|0> + beta|1> is input to qubit 0
    qc.cx(0, 1)  # Encode: spread to qubits 1 and 2
    qc.cx(0, 2)
    return qc

def syndrome_measurement(qc):
    """Add ancilla qubits for syndrome measurement without destroying code."""
    # S1 = Z0 Z1: ancilla qubit 3 detects if q0 and q1 differ
    # S2 = Z1 Z2: ancilla qubit 4 detects if q1 and q2 differ
    qc.add_register(2)  # Add 2 ancilla measurement qubits
    qc.cx(0, 3); qc.cx(1, 3)  # Syndrome 1: Z0Z1
    qc.cx(1, 4); qc.cx(2, 4)  # Syndrome 2: Z1Z2
    return qc

qc = encode_bitflip(1, 0)
print("Bit-flip encoding circuit:")
print(qc.draw())`
          }
        ],
        quiz: {
          question: "The Shor 9-qubit code is characterized as [9, 1, 3]. What do the numbers 9, 1, and 3 represent?",
          options: [
            "9 gates, 1 qubit measured, 3 repetitions",
            "9 physical qubits used, 1 logical qubit encoded, distance 3 (corrects any 1 physical error)",
            "9 ancilla qubits, 1 syndrome bit, 3 logical operations",
            "9 classical bits, 1 quantum channel, distance 3 Hamming code"
          ],
          correctIndex: 1,
          explanation: "The [n, k, d] notation means: n = 9 physical qubits per logical qubit, k = 1 logical qubit encoded, d = 3 code distance (can correct floor((d-1)/2) = 1 arbitrary qubit error)."
        }
      },
      {
        id: "unit-3",
        title: "Unit 3: Surface Codes — The Road to Fault-Tolerant Quantum Computing",
        duration: "60 min",
        circuitPreset: "ghz_state",
        youtubeId: "F_Riqjdh2oM",
        videoTitle: "Surface Codes for Fault-Tolerant Quantum Computation | Austin Fowler & Héctor Bombín",
        watchUrl: "https://www.youtube.com/watch?v=F_Riqjdh2oM",
        embedUrl: "https://www.youtube-nocookie.com/embed/F_Riqjdh2oM",
        learningObjectives: [
          "Describe the 2D surface code lattice of data and ancilla qubits",
          "Understand plaquette (face) and vertex (site) stabilizer operators",
          "Calculate the threshold error rate (~1%) for fault-tolerant operation",
          "Estimate physical qubit overhead: ~1,000 physical qubits per logical qubit at 0.1% error rate",
          "Identify why surface codes are the leading candidate for near-term fault-tolerant quantum computing"
        ],
        summary: "Master the surface code: the leading blueprint for fault-tolerant quantum computing, using a 2D lattice of qubits with nearest-neighbor interactions only.",
        sections: [
          {
            heading: "1. Why Surface Codes Dominate the Field",
            content: "Out of dozens of quantum error-correcting codes, the **toric/surface code** (Kitaev 1997, Fowler et al. 2012) has emerged as the leading candidate for near-term fault-tolerant quantum computing. Why?\n• **2D nearest-neighbor connectivity**: Requires only local interactions between adjacent qubits — perfect for superconducting qubit chips (IBM Eagle, Falcon).\n• **High threshold**: Works even with physical error rates up to ~1%. Current IBM hardware achieves ~0.1-0.3% 2-qubit gate error — BELOW the threshold!\n• **Proven scalability**: Google's 'Beyond Classical' paper (2023) demonstrated surface code below threshold for the first time.",
            callout: "IBM's roadmap: By 2033, IBM plans to build a 100,000-physical-qubit system capable of running fault-tolerant surface-code computation. At 1,000 physical qubits per logical qubit, this gives ~100 logical qubits — enough for small-molecule quantum chemistry."
          },
          {
            heading: "2. The Surface Code Lattice",
            content: "The distance-d surface code is arranged on a d×d lattice of data qubits, interspersed with ancilla qubits:\n• **Data qubits** (white): Store the encoded logical information\n• **X-ancilla qubits** (blue): Measure vertex stabilizers $S_v = \\prod_{i \\in v} X_i$ (detect Z errors)\n• **Z-ancilla qubits** (red): Measure plaquette stabilizers $S_p = \\prod_{i \\in p} Z_i$ (detect X errors)\n\nEach stabilizer measurement is a syndrome bit: if it returns $-1$, an error occurred nearby. By triangulating the syndrome pattern, a minimum-weight decoder (like Union-Find or MWPM) can identify and correct the most likely error chain.",
            math: "S_v = \\prod_{i \\in \\partial v} X_i, \\quad S_p = \\prod_{i \\in \\partial p} Z_i, \\quad \\forall v, p"
          },
          {
            heading: "3. Resource Overhead: The Quantum Engineering Challenge",
            content: "The surface code's power comes at a steep cost in physical qubit overhead.\n\nFor a distance-$d$ code:\n• Physical qubits needed: $2d^2 - 1$ data + ancilla qubits\n• Logical error rate: $p_L \\approx \\left(\\frac{p}{p_{\\text{th}}}\\right)^{\\lceil d/2 \\rceil}$ (exponentially decreasing with $d$)\n• For $d=17$ at physical error rate $p = 0.1\\%$: ~578 physical qubits per logical qubit\n• For Shor's algorithm on RSA-2048: ~4,000 logical qubits → ~4 million physical qubits!\n\nThis is why IBM, Google, and Microsoft are all racing to build systems with millions of high-quality physical qubits.",
            math: "n_{\\text{physical}} \\approx 2d^2, \\quad p_L \\approx \\left( \\frac{p}{p_{\\text{th}}} \\right)^{\\lfloor d/2 \\rfloor + 1}",
            code: `# Demonstrating the Surface Code resource overhead calculation
import numpy as np

def surface_code_resources(distance: int, physical_error_rate: float,
                            threshold: float = 0.01):
    """Calculate logical error rate and qubit overhead for surface code."""
    physical_qubits = 2 * distance**2 - 1
    if physical_error_rate < threshold:
        t = (distance + 1) // 2
        logical_error = (physical_error_rate / threshold) ** t
    else:
        logical_error = 0.5  # Above threshold: code fails
    return physical_qubits, logical_error

# Analyze different code distances
print(f"{'Distance':>8}  {'Phys. Qubits':>12}  {'Logical Error Rate':>18}")
for d in [3, 5, 7, 11, 17, 25]:
    phys, p_l = surface_code_resources(d, physical_error_rate=0.001)
    print(f"{d:>8}  {phys:>12}  {p_l:>18.2e}")
# For d=25: 1249 physical qubits, logical error ~10^-16 — suitable for deep circuits`
          }
        ],
        quiz: {
          question: "A distance-7 surface code has a physical error rate of 0.1% and a threshold of 1%. Approximately how many physical qubits does it use and how does the logical error rate compare to the physical rate?",
          options: [
            "7 physical qubits; logical error = physical error",
            "~97 physical qubits; logical error rate is MUCH smaller than 0.1% (exponentially suppressed)",
            "~97 physical qubits; logical error rate is LARGER than 0.1% (code fails)",
            "49 physical qubits; logical error rate = 0.001%"
          ],
          correctIndex: 1,
          explanation: "A distance-7 code uses 2×7²-1 = 97 physical qubits. With p=0.1% < p_th=1%, the logical error rate is exponentially suppressed: p_L ≈ (0.001/0.01)^4 = 10^-8, far below the physical error rate."
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
qc.rx(1.57, 0) # Prepare state
qc.h(1); qc.cx(1, 2) # Bell pair
qc.cx(0, 1); qc.h(0) # Bell measurement
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
    code: `from qiskit.quantum_info import Statevector, Pauli
import numpy as np

sv = Statevector.from_label('+')
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
qc.cz(0, 1) # Oracle
qc.h([0, 1]); qc.x([0, 1]); qc.cz(0, 1); qc.x([0, 1]); qc.h([0, 1]) # Diffusion
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
N = 15; a = 7; r = 4
factor1 = math.gcd(a**(r//2) - 1, N)
factor2 = math.gcd(a**(r//2) + 1, N)
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
bell_stab = StabilizerState.from_label('00')
print("Bell stabilizer state initialized")`
  }
};

// Aliases for seamless navigation
COURSES_DETAILED_CONTENT["quantum-algos"] = COURSES_DETAILED_CONTENT["fundamentals-algos"];
COURSES_DETAILED_CONTENT["vqe"] = COURSES_DETAILED_CONTENT["vqe-variational"];
COURSES_DETAILED_CONTENT["qec-intro"] = COURSES_DETAILED_CONTENT["qec-foundations"];
COURSES_DETAILED_CONTENT["surface-codes"] = COURSES_DETAILED_CONTENT["qec-foundations"];
COURSES_DETAILED_CONTENT["nisq-intro"] = COURSES_DETAILED_CONTENT["use-qc"];

