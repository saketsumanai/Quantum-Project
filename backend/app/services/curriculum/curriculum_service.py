from typing import List, Dict, Any
from backend.app.models.schemas import (
    CurriculumModule,
    CurriculumLesson,
    LessonChallenge,
    CircuitModel,
    CircuitInstruction,
    QuizModel,
)

PRESET_CIRCUITS: Dict[str, CircuitModel] = {
    "bell_state": CircuitModel(
        num_qubits=2,
        num_clbits=2,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1])
        ]
    ),
    "ghz_state": CircuitModel(
        num_qubits=3,
        num_clbits=3,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="cx", qubits=[1, 2]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1]),
            CircuitInstruction(gate="measure", qubits=[2], clbits=[2])
        ]
    ),
    "superposition": CircuitModel(
        num_qubits=1,
        num_clbits=1,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0])
        ]
    ),
    "quantum_teleportation": CircuitModel(
        num_qubits=3,
        num_clbits=3,
        instructions=[
            CircuitInstruction(gate="rx", qubits=[0], params=[1.57]),
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="cx", qubits=[1, 2]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1])
        ]
    ),
    "grover_2qubit": CircuitModel(
        num_qubits=2,
        num_clbits=2,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            # Oracle for |11>
            CircuitInstruction(gate="cz", qubits=[0, 1]),
            # Diffusion Operator
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="x", qubits=[0]),
            CircuitInstruction(gate="x", qubits=[1]),
            CircuitInstruction(gate="cz", qubits=[0, 1]),
            CircuitInstruction(gate="x", qubits=[0]),
            CircuitInstruction(gate="x", qubits=[1]),
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1])
        ]
    ),
    "deutsch_jozsa": CircuitModel(
        num_qubits=2,
        num_clbits=1,
        instructions=[
            CircuitInstruction(gate="x", qubits=[1]),
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            # Balanced Oracle: CNOT
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0])
        ]
    ),
    "qft": CircuitModel(
        num_qubits=3,
        num_clbits=3,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="cp", qubits=[1, 0], params=[1.57079632679]),
            CircuitInstruction(gate="cp", qubits=[2, 0], params=[0.78539816339]),
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="cp", qubits=[2, 1], params=[1.57079632679]),
            CircuitInstruction(gate="h", qubits=[2]),
            CircuitInstruction(gate="swap", qubits=[0, 2]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1]),
            CircuitInstruction(gate="measure", qubits=[2], clbits=[2])
        ]
    ),
    "shor_15": CircuitModel(
        num_qubits=4,
        num_clbits=2,
        instructions=[
            # Counting register in superposition
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            # Work register initialized to |1>
            CircuitInstruction(gate="x", qubits=[2]),
            # Controlled modular multiplication: 7^x mod 15
            CircuitInstruction(gate="cx", qubits=[0, 2]),
            CircuitInstruction(gate="cx", qubits=[0, 3]),
            CircuitInstruction(gate="cx", qubits=[1, 3]),
            # Inverse QFT on counting register
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="cp", qubits=[0, 1], params=[-1.57079632679]),
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="swap", qubits=[0, 1]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1])
        ]
    ),
    "vqe_h2": CircuitModel(
        num_qubits=2,
        num_clbits=2,
        instructions=[
            # Hartree-Fock initial state
            CircuitInstruction(gate="x", qubits=[0]),
            # Variational ansatz (Ry rotations and entangler)
            CircuitInstruction(gate="ry", qubits=[0], params=[0.785398]),
            CircuitInstruction(gate="ry", qubits=[1], params=[0.392699]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="rz", qubits=[0], params=[1.570796]),
            CircuitInstruction(gate="ry", qubits=[1], params=[0.785398]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1])
        ]
    ),
    "qml_kernel": CircuitModel(
        num_qubits=2,
        num_clbits=2,
        instructions=[
            # Feature map layer
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="rz", qubits=[0], params=[1.2]),
            CircuitInstruction(gate="rz", qubits=[1], params=[2.4]),
            # ZZ-entanglement kernel
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="rz", qubits=[1], params=[1.570796]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            # Variational classification layer
            CircuitInstruction(gate="ry", qubits=[0], params=[0.8]),
            CircuitInstruction(gate="ry", qubits=[1], params=[1.6]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1])
        ]
    ),
    "qec_bitflip": CircuitModel(
        num_qubits=3,
        num_clbits=3,
        instructions=[
            # Encode arbitrary logical state |psi> = Rx(pi/2)|0>
            CircuitInstruction(gate="rx", qubits=[0], params=[1.570796]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="cx", qubits=[0, 2]),
            # Simulated bit-flip error on qubit 1
            CircuitInstruction(gate="x", qubits=[1]),
            # Syndrome extraction & recovery
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="cx", qubits=[0, 2]),
            CircuitInstruction(gate="ccx", qubits=[1, 2, 0]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1]),
            CircuitInstruction(gate="measure", qubits=[2], clbits=[2])
        ]
    ),
    "surface_code": CircuitModel(
        num_qubits=5,
        num_clbits=5,
        instructions=[
            # Data qubits 0, 1, 2, 3 and ancilla qubit 4
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[2]),
            # Z-stabilizer plaquette check (Z0 Z1 Z2 Z3 on ancilla 4)
            CircuitInstruction(gate="cx", qubits=[0, 4]),
            CircuitInstruction(gate="cx", qubits=[1, 4]),
            CircuitInstruction(gate="cx", qubits=[2, 4]),
            CircuitInstruction(gate="cx", qubits=[3, 4]),
            # X-stabilizer check
            CircuitInstruction(gate="h", qubits=[4]),
            CircuitInstruction(gate="cz", qubits=[4, 0]),
            CircuitInstruction(gate="cz", qubits=[4, 1]),
            CircuitInstruction(gate="h", qubits=[4]),
            CircuitInstruction(gate="measure", qubits=[0], clbits=[0]),
            CircuitInstruction(gate="measure", qubits=[1], clbits=[1]),
            CircuitInstruction(gate="measure", qubits=[2], clbits=[2]),
            CircuitInstruction(gate="measure", qubits=[3], clbits=[3]),
            CircuitInstruction(gate="measure", qubits=[4], clbits=[4])
        ]
    )
}

CURRICULUM_MODULES: List[CurriculumModule] = [
    CurriculumModule(
        id="mod_01",
        title="Qubit Superposition & Single-Qubit Gates",
        category="Foundations",
        icon="Atom",
        description="Master the fundamental building blocks: the state vector, the Bloch sphere, and unitary single-qubit transformations.",
        lessons=[
            CurriculumLesson(
                id="lesson_1_1",
                title="The Quantum State Vector & The Bloch Sphere",
                duration_min=15,
                difficulty="Beginner",
                summary="Understand statevectors |psi> = alpha|0> + beta|1>, normalization conditions, and spherical Bloch coordinates (theta, phi).",
                theory_md="In quantum information, a qubit lives in a 2-dimensional Hilbert space. The state is represented as $|\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$ where $\\alpha, \\beta \\in \\mathbb{C}$ and $|\\alpha|^2 + |\\beta|^2 = 1$. The Bloch Sphere parameterizes this pure state using spherical polar angles $\\theta \\in [0, \\pi]$ and $\\phi \\in [0, 2\\pi)$ as: $|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle$.",
                preset_circuit=PRESET_CIRCUITS["superposition"],
                challenges=[
                    LessonChallenge(
                        id="chal_1_1",
                        title="Create an Equal Superposition",
                        description="Apply a single Hadamard gate to qubit 0 starting from ground state |0> to produce state |+>.",
                        target_qubits=1,
                        target_state="|+>",
                        expected_probabilities={"0": 0.5, "1": 0.5},
                        hint="Drag a Hadamard (H) gate onto line q[0].",
                        initial_circuit=CircuitModel(num_qubits=1, instructions=[])
                    )
                ],
                quiz=QuizModel(
                    question_string="What are the Bloch sphere coordinates (x, y, z) of the |+> state created by applying H to |0>?",
                    options_array=["(0, 0, 1)", "(1, 0, 0)", "(0, 1, 0)", "(0, 0, -1)"],
                    valid_index_pointer=1
                )
            )
        ]
    ),
    CurriculumModule(
        id="mod_02",
        title="Quantum Entanglement & Bell States",
        category="Multi-Qubit Systems",
        icon="Network",
        description="Explore Einstein-Podolsky-Rosen (EPR) correlations, non-local quantum channels, and the construction of all 4 Bell states.",
        lessons=[
            CurriculumLesson(
                id="lesson_2_1",
                title="Creating the Maximally Entangled Bell Pair |Phi+>",
                duration_min=20,
                difficulty="Intermediate",
                summary="Build the famous Bell state (|00> + |11>)/sqrt(2) using a Hadamard gate and a Controlled-NOT (CNOT) gate.",
                theory_md="A two-qubit state is entangled if it cannot be factored into the tensor product of two independent single-qubit states: $|\\psi\\rangle \\ne |\\psi_A\\rangle \\otimes |\\psi_B\\rangle$. Applying $H$ to $q_0$ followed by $CNOT(q_0 \\to q_1)$ creates: $|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$. Measuring $q_0$ collapses $q_1$ instantly to the same value with 100% correlation.",
                preset_circuit=PRESET_CIRCUITS["bell_state"],
                challenges=[
                    LessonChallenge(
                        id="chal_2_1",
                        title="Construct the |Phi-> Bell State",
                        description="Modify the circuit to produce the state (|00> - |11>)/sqrt(2).",
                        target_qubits=2,
                        target_state="|Phi->",
                        expected_probabilities={"00": 0.5, "11": 0.5},
                        hint="Apply a Pauli-Z or Phase gate on the control qubit, or initialize with an X gate.",
                        initial_circuit=CircuitModel(num_qubits=2, instructions=[CircuitInstruction(gate="h", qubits=[0]), CircuitInstruction(gate="cx", qubits=[0, 1])])
                    )
                ],
                quiz=QuizModel(
                    question_string="If two qubits are in state (|00> + |11>)/sqrt(2) and qubit 0 is measured to be 1, what is the probability of measuring qubit 1 as 0?",
                    options_array=["50%", "100%", "0%", "25%"],
                    valid_index_pointer=2
                )
            )
        ]
    ),
    CurriculumModule(
        id="mod_03",
        title="Grover's Quantum Search Algorithm",
        category="Algorithms",
        icon="Search",
        description="Achieve provable quadratic speedup over classical brute-force search using quantum amplitude amplification.",
        lessons=[
            CurriculumLesson(
                id="lesson_3_1",
                title="The 2-Qubit Grover Search Engine",
                duration_min=25,
                difficulty="Advanced",
                summary="Search a 4-item database in a single query! Learn how the Phase Oracle and the Grover Diffusion Operator rotate the state vector toward the target.",
                theory_md="Classical search over $N$ unordered elements requires $O(N)$ trials. Grover's algorithm achieves this in $O(\\sqrt{N})$ queries. It consists of: (1) Initialization in uniform superposition $H^{\\otimes n}|0\\rangle$, (2) Phase Oracle $O_f$ marking target $|w\\rangle$ by inverting its sign, (3) Diffusion operator $D = 2|s\\rangle\\langle s| - I$ reflecting all amplitudes across the mean.",
                preset_circuit=PRESET_CIRCUITS["grover_2qubit"],
                challenges=[],
                quiz=QuizModel(
                    question_string="What does the Grover diffusion operator do to the probability amplitudes?",
                    options_array=[
                        "Inverts all amplitudes about their mean value",
                        "Sets all non-target states to zero directly",
                        "Multiplies all amplitudes by -1",
                        "Rotates the statevector by 90 degrees on the Z-axis"
                    ],
                    valid_index_pointer=0
                )
            )
        ]
    )
]

def get_preset(preset_key: str) -> CircuitModel:
    return PRESET_CIRCUITS.get(preset_key, PRESET_CIRCUITS["bell_state"])

def get_all_modules() -> List[CurriculumModule]:
    return CURRICULUM_MODULES
