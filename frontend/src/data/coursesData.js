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
        summary: "Transmit an unknown quantum state across space using a shared Bell pair and 2 classical bits, without violating the No-Cloning theorem.",
        sections: [
          {
            heading: "1. The Teleportation Protocol Explained Simply",
            content: "Suppose Alice has a fragile, unknown quantum qubit $|\psi\\rangle = \alpha|0\rangle + \beta|1\rangle$ and wants to send it to Bob.\n• She cannot simply copy it (forbidden by the No-Cloning Theorem).\n• She cannot measure it (measurement would collapse the state and destroy $\alpha$ and $\beta$).\n\nHow do they solve this? Using **Quantum Teleportation** (Bennett et al., 1993)!\n1. Alice and Bob share an entangled Bell pair $|\Phi^+\rangle_{AB}$.\n2. Alice performs a Bell measurement on her unknown qubit and her half of the Bell pair.\n3. Alice's measurement produces 2 classical bits ($00, 01, 10,$ or $11$).\n4. Alice calls Bob on a normal phone and tells him the 2 classical bits.\n5. Depending on the bits, Bob applies simple Pauli gates ($X, Z$) to his qubit.\n\nPresto! Bob's qubit is now **identical** to Alice's original state $|\psi\rangle$! Alice's original qubit was destroyed by her measurement, so no cloning occurred.",
            math: "|\\psi\\rangle |\\Phi^+\\rangle \\xrightarrow{\\text{Bell Measurement}} (m_0, m_1) \\xrightarrow{X^{m_1} Z^{m_0}} |\\psi\\rangle_{\\text{Bob}}"
          }
        ],
        quiz: {
          question: "How many classical bits must Alice send to Bob to complete the teleportation of 1 qubit?",
          options: ["0 bits (instantaneous)", "1 classical bit", "2 classical bits", "An infinite number of bits"],
          correctIndex: 2,
          explanation: "Alice measures two qubits in the Bell basis, producing exactly 2 classical bits of measurement outcomes that Bob needs to apply the correct correction."
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

