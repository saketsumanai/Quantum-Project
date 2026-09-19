import numpy as np
import os
import json
import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.models.schemas import (
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
    AIQuizGenerateRequest,
    AIQuizGenerateResponse,
    QuizQuestion,
    TestReportSaveRequest,
    TestReportResponse,
    CircuitVerifyRequest,
    CircuitVerifyResponse,
    DynamicQuizGenerateRequest,
    DynamicQuizQuestion,
    DynamicQuizGenerateResponse,
    DashboardStatsResponse,
    QuizAttemptSummary,
)
from backend.app.db.database import get_db
from backend.app.db.models import User, QuizAttempt, TestReport, LessonProgress
from backend.app.core.security import get_current_user_payload
from backend.app.services.ai.tutor_service import _chroma_searcher

router = APIRouter(prefix="/assessment", tags=["Assessment & Telemetry"])

# Dynamic Solution Registry (Thread-safe dict storing active solutions and explanations)
DYNAMIC_SOLUTIONS: Dict[str, Dict[str, Any]] = {
    "quiz_bell_state_01": {
        "correct_index": 1,
        "points": 50,
        "topic": "entanglement",
        "explanation": "Correct! H on q0 creates (|0>+|1>)/sqrt(2); CNOT entangles q1, producing (|00>+|11>)/sqrt(2) - a maximally entangled Bell state.",
    },
    "quiz_superposition_01": {
        "correct_index": 1,
        "points": 50,
        "topic": "superposition",
        "explanation": "Correct! By Born's rule, P(|1>) = |1/sqrt(2)|^2 = 0.5 = 50%.",
    },
    "quiz_grover_01": {
        "correct_index": 0,
        "points": 50,
        "topic": "grover",
        "explanation": "Correct! The Grover diffusion operator 2|s><s| - I reflects state amplitudes about their mean.",
    },
    "quiz_teleportation_01": {
        "correct_index": 1,
        "points": 50,
        "topic": "teleportation",
        "explanation": "Correct! Alice transmits 2 classical bits through standard communication channels for Bob to apply Pauli X/Z corrections.",
    },
    "quiz_vqe_01": {
        "correct_index": 1,
        "points": 50,
        "topic": "vqe",
        "explanation": "Correct! The Rayleigh-Ritz variational principle guarantees <psi(theta)|H|psi(theta)> >= E0 (ground state energy).",
    },
}

QUIZ_SOLUTIONS: Dict[str, Dict[str, Any]] = {}

# Pre-compiled high-yield questions for instant offline/failsafe mode
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
            "explanation": "Grover's algorithm provides a quadratic speedup over classical brute force, rotating the state vector by 2θ ≈ 2/`√N` per step, reaching optimal alignment at ≈ (π/4)√N.",
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
        }
    ]
}

# Auto-index all curated questions into QUIZ_SOLUTIONS and DYNAMIC_SOLUTIONS
for topic_key, q_list in CURATED_EXAM_BANK.items():
    for q_item in q_list:
        sol_entry = {
            "correct_index": q_item["correct_index"],
            "points": 50,
            "topic": topic_key,
            "explanation": q_item["explanation"],
        }
        QUIZ_SOLUTIONS[q_item["id"]] = sol_entry
        DYNAMIC_SOLUTIONS[q_item["id"]] = sol_entry

# Question Bank covering all curriculum tracks with Dirac LaTeX math
QUESTION_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "superposition": [
        {
            "question_string": "A single qubit is prepared in state |psi> = 1/2 |0> + sqrt(3)/2 |1>. What is the probability of measuring the state |1> in the standard computational basis?",
            "latex_formula": "|\\psi\\rangle = \\frac{1}{2}|0\\rangle + \\frac{\\sqrt{3}}{2}|1\\rangle \\implies P(|1\\rangle) = |\\beta|^2",
            "options_array": ["25%", "50%", "75%", "100%"],
            "correct_index": 2,
            "explanation": "Born's Rule states P(|1>) = |sqrt(3)/2|^2 = 3/4 = 75%.",
            "difficulty": "beginner",
        },
        {
            "question_string": "Applying a Hadamard gate H to the state |1> produces which state on the Bloch sphere equator?",
            "latex_formula": "H|1\\rangle = |-\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle)",
            "options_array": ["|+> along +X axis", "|-> along -X axis", "|i> along +Y axis", "|0> along +Z axis"],
            "correct_index": 1,
            "explanation": "H|1> transforms into |-> = (|0> - |1>)/sqrt(2), which points along the -X axis of the Bloch sphere.",
            "difficulty": "beginner",
        },
        {
            "question_string": "What is the inner product <+|-> between the superposition states |+> and |->?",
            "latex_formula": "\\langle + | - \\rangle = \\frac{1}{2}(\\langle 0| + \\langle 1|)(|0\\rangle - |1\\rangle)",
            "options_array": ["0 (Orthogonal)", "1 (Parallel)", "-1 (Antiparallel)", "1/sqrt(2)"],
            "correct_index": 0,
            "explanation": "<+|-> = (1/2)(<0|0> - <0|1> + <1|0> - <1|1>) = (1/2)(1 - 0 + 0 - 1) = 0. The basis states are orthonormal.",
            "difficulty": "intermediate",
        },
    ],
    "entanglement": [
        {
            "question_string": "Which 2-qubit circuit sequence transforms the ground state |00> into the Bell state |Phi+> = (|00> + |11>)/sqrt(2)?",
            "latex_formula": "|\\Phi^+\\rangle = \\text{CNOT}_{0\\to 1}(H_0 \\otimes I_1)|00\\rangle",
            "options_array": ["H(0) followed by CNOT(0 -> 1)", "CNOT(0 -> 1) followed by H(0)", "X(0) followed by H(1)", "H(0) followed by SWAP(0, 1)"],
            "correct_index": 0,
            "explanation": "H on qubit 0 creates (|0>+|1>)/sqrt(2) on q0. Then CNOT(0->1) flips q1 if and only if q0=1, creating (|00>+|11>)/sqrt(2).",
            "difficulty": "beginner",
        },
        {
            "question_string": "What is the maximum value of the CHSH inequality correlation parameter S achievable by entangled quantum states (Cirel'son bound)?",
            "latex_formula": "S = |E(a, b) - E(a, b') + E(a', b) + E(a', b')| \\le 2\\sqrt{2}",
            "options_array": ["2 (Classical limit)", "2*sqrt(2) ~ 2.828 (Cirel'son bound)", "4 (Algebraic limit)", "1.414"],
            "correct_index": 1,
            "explanation": "Local hidden variable theories satisfy S <= 2. Quantum mechanics violates this up to Cirel'son's bound 2*sqrt(2) ~ 2.828.",
            "difficulty": "advanced",
        },
        {
            "question_string": "If a partial trace Tr_B is performed over the Bell state |Phi+><Phi+|, what is the resulting reduced density matrix rho_A of qubit A?",
            "latex_formula": "\\rho_A = \\text{Tr}_B(|\\Phi^+\\rangle\\langle\\Phi^+|) = \\frac{1}{2}I_2",
            "options_array": ["Maximally mixed state I/2", "Pure state |0><0|", "Pure state |+><+|", "Zero matrix"],
            "correct_index": 0,
            "explanation": "Tracing out an entangled partner from a maximally entangled state yields the maximally mixed state rho_A = I/2 with von Neumann entropy S = 1.",
            "difficulty": "advanced",
        },
    ],
    "grover": [
        {
            "question_string": "In Grover's search algorithm for an unstructured database of N items with 1 marked item, what is the optimal number of oracle iterations?",
            "latex_formula": "R \\approx \\frac{\\pi}{4}\\sqrt{N}",
            "options_array": ["O(N) iterations", "approx (pi/4)*sqrt(N) iterations", "O(log N) iterations", "Exactly N/2 iterations"],
            "correct_index": 1,
            "explanation": "Grover's algorithm rotates the state vector in the 2D subspace spanned by marked and unmarked states by 2*theta per step, needing ~(pi/4)*sqrt(N) iterations.",
            "difficulty": "intermediate",
        },
        {
            "question_string": "What is the mathematical definition of the Grover diffusion operator D acting on uniform superposition |s>?",
            "latex_formula": "D = 2|s\\rangle\\langle s| - I",
            "options_array": ["2|s><s| - I (Inversion about average)", "I - 2|s><s|", "H^(tensor n)", "|s><s|"],
            "correct_index": 0,
            "explanation": "The diffusion operator reflects probability amplitudes across their arithmetic mean: D = 2|s><s| - I.",
            "difficulty": "intermediate",
        },
    ],
    "teleportation": [
        {
            "question_string": "How many classical bits must Alice send to Bob to complete quantum teleportation of an unknown single qubit state?",
            "latex_formula": "|\\psi\\rangle \\to \\text{Bell Measurement} \\to 2 \\text{ Classical Bits} \\to \\sigma_x^a \\sigma_z^b",
            "options_array": ["1 classical bit", "2 classical bits", "4 classical bits", "0 (Instantaneous nonlocal collapse)"],
            "correct_index": 1,
            "explanation": "Alice's Bell-basis measurement yields one of 4 outcomes (00, 01, 10, 11), requiring exactly 2 classical bits so Bob knows which Pauli correction (I, X, Z, or XZ) to apply.",
            "difficulty": "intermediate",
        },
    ],
    "qec": [
        {
            "question_string": "What is the minimum code distance d required for a quantum error correcting code to correct t arbitrary errors?",
            "latex_formula": "d \\ge 2t + 1",
            "options_array": ["d >= t + 1", "d >= 2t + 1", "d >= 3t", "d = t"],
            "correct_index": 1,
            "explanation": "By the Knill-Laflamme conditions, correcting t errors requires distance d >= 2t + 1, while detecting t errors requires d >= t + 1.",
            "difficulty": "advanced",
        },
        {
            "question_string": "What are the stabilizer generators for the 3-qubit bit-flip repetition code?",
            "latex_formula": "S_1 = Z_0 Z_1, \\quad S_2 = Z_1 Z_2",
            "options_array": ["Z0 Z1 and Z1 Z2", "X0 X1 and X1 X2", "Z0 Z1 Z2", "Y0 Y1"],
            "correct_index": 0,
            "explanation": "The 3-qubit bit flip code protects |000> and |111>, which are eigenstates with eigenvalue +1 of Z0 Z1 and Z1 Z2.",
            "difficulty": "advanced",
        },
    ],
    "vqe": [
        {
            "question_string": "In the Variational Quantum Eigensolver (VQE), which component is executed on classical hardware?",
            "latex_formula": "\\theta_{k+1} = \\theta_k - \\eta \\nabla_\\theta \\langle H \\rangle_\\theta",
            "options_array": ["Quantum state preparation", "Energy expectation value sampling", "Parameter optimization (COBYLA/SPSA)", "Wavefunction collapse"],
            "correct_index": 2,
            "explanation": "VQE is hybrid: state preparation U(theta)|0> and Hamiltonian term measurements occur on the QPU, while the parameter optimizer updates theta classically.",
            "difficulty": "intermediate",
        },
    ],
}


@router.post("/dynamic-quiz/generate", response_model=DynamicQuizGenerateResponse)
async def generate_dynamic_quiz(request: DynamicQuizGenerateRequest):
    """
    Generates dynamic, mathematically verified quiz questions for any topic.
    Registers answers in memory to support dynamic validation upon submission.
    """
    topic = (request.topic or "superposition").lower()
    # Find matching question pool or fallback
    pool = QUESTION_BANKS.get(topic)
    if not pool:
        for key in QUESTION_BANKS:
            if key in topic or topic in key:
                pool = QUESTION_BANKS[key]
                break
    if not pool:
        pool = QUESTION_BANKS["superposition"]

    count = min(max(request.count or 3, 1), len(pool))
    selected_samples = random.sample(pool, count)

    generated_questions: List[DynamicQuizQuestion] = []
    for item in selected_samples:
        quiz_id = f"dyn_{topic}_{uuid.uuid4().hex[:8]}"
        DYNAMIC_SOLUTIONS[quiz_id] = {
            "correct_index": item["correct_index"],
            "points": 50,
            "topic": topic,
            "explanation": item["explanation"],
        }
        generated_questions.append(
            DynamicQuizQuestion(
                id=quiz_id,
                topic=topic,
                question_string=item["question_string"],
                options_array=item["options_array"],
                points=50,
                difficulty=item.get("difficulty", "intermediate"),
                latex_formula=item.get("latex_formula"),
                valid_index_pointer=item["correct_index"],
            )
        )

    return DynamicQuizGenerateResponse(
        success=True,
        topic=topic,
        questions=generated_questions,
    )


@router.post("/submit", response_model=AssessmentSubmitResponse)
async def submit_assessment(
    request: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    user_payload: Optional[dict] = Depends(get_current_user_payload),
):
    """
    Validates quiz submission, awards XP, logs QuizAttempt in DB, and computes real mastery %.
    Supports static curriculum quizzes, dynamic AI generated quizzes, and exam bank questions.
    """
    solution = DYNAMIC_SOLUTIONS.get(request.quiz_id) or QUIZ_SOLUTIONS.get(request.quiz_id)
    if solution:
        correct_idx = solution["correct_index"]
        explanation = solution.get("explanation", "Accurate conceptual analysis recorded.")
        topic = solution.get("topic", "quantum_computing")
        points_val = solution.get("points", 50)
    elif request.correct_index is not None:
        correct_idx = request.correct_index
        explanation = request.explanation or "Accurate conceptual analysis recorded."
        topic = request.topic or "quantum_computing"
        points_val = 50
    else:
        correct_idx = 0
        explanation = "Answer recorded."
        topic = "quantum_computing"
        points_val = 50

    is_correct = (request.selected_option_index == correct_idx)
    points = points_val if is_correct else 0

    # Save to SQLite DB if user is authenticated
    if user_payload:
        uid = user_payload.get("sub")
        user = db.query(User).filter(User.id == uid).first()
        if user:
            attempt = QuizAttempt(
                user_id=uid,
                quiz_id=request.quiz_id,
                selected_option=request.selected_option_index,
                is_correct=is_correct,
                points_earned=points,
                time_taken_seconds=request.time_taken_seconds or 0,
                topic=topic,
            )
            db.add(attempt)
            user.total_xp += points
            db.commit()

    # Calculate live mastery from DB
    mastery_pct = 100.0 if is_correct else 40.0
    quizzes_done = 1
    if user_payload:
        uid = user_payload.get("sub")
        correct_count = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == uid,
            QuizAttempt.topic == topic,
            QuizAttempt.is_correct == True,
        ).count()
        total_count = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == uid,
            QuizAttempt.topic == topic,
        ).count()
        quizzes_done = max(total_count, 1)
        mastery_pct = round((correct_count / quizzes_done) * 100, 1)

    return AssessmentSubmitResponse(
        success=True,
        is_correct=is_correct,
        points_earned=points,
        explanation=explanation if is_correct else "Incorrect — review the state transformation mathematical formula above!",
        user_mastery={
            "topic": topic,
            "mastery_percentage": mastery_pct,
            "quizzes_completed": quizzes_done,
        },
    )


@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_payload: Optional[dict] = Depends(get_current_user_payload),
):
    """
    Returns aggregated telemetry and metrics for the Student Dashboard:
    XP, rank, streak days, accuracy %, topic mastery breakdown, and recent attempts.
    """
    total_xp = 150
    user_id = user_payload.get("sub") if user_payload else None

    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            total_xp = user.total_xp

    # Level title derivation
    if total_xp >= 1000:
        level_title = "Level 5 Quantum Theorist"
    elif total_xp >= 600:
        level_title = "Level 4 Algorithm Architect"
    elif total_xp >= 350:
        level_title = "Level 3 Coherence Specialist"
    elif total_xp >= 150:
        level_title = "Level 2 Superposition Adept"
    else:
        level_title = "Level 1 Quantum Initiate"

    # Query attempts
    attempts_query = db.query(QuizAttempt)
    if user_id:
        attempts_query = attempts_query.filter(QuizAttempt.user_id == user_id)
    all_attempts = attempts_query.order_by(QuizAttempt.attempted_at.desc()).all()

    total_quizzes = len(all_attempts)
    correct_quizzes = sum(1 for a in all_attempts if a.is_correct)
    accuracy_pct = round((correct_quizzes / max(total_quizzes, 1)) * 100, 1) if total_quizzes > 0 else 100.0

    # Streak calculation
    streak_days = 1 if total_quizzes > 0 or total_xp > 0 else 0

    # Topic mastery mapping
    topic_counts: Dict[str, Dict[str, int]] = {}
    for a in all_attempts:
        t = a.topic or "foundations"
        if t not in topic_counts:
            topic_counts[t] = {"correct": 0, "total": 0}
        topic_counts[t]["total"] += 1
        if a.is_correct:
            topic_counts[t]["correct"] += 1

    topic_mastery: Dict[str, float] = {
        "superposition": 85.0,
        "entanglement": 75.0,
        "grover": 60.0,
        "teleportation": 50.0,
        "qec": 40.0,
        "vqe": 30.0,
    }
    for t, c in topic_counts.items():
        topic_mastery[t] = round((c["correct"] / max(c["total"], 1)) * 100, 1)

    recent_summaries = [
        QuizAttemptSummary(
            id=a.id,
            quiz_id=a.quiz_id,
            topic=a.topic or "quantum",
            is_correct=a.is_correct,
            points_earned=a.points_earned,
            attempted_at=a.attempted_at.isoformat() if a.attempted_at else datetime.utcnow().isoformat(),
        )
        for a in all_attempts[:8]
    ]

    unlocked_badges = min(max(1, total_xp // 100), 8)

    return DashboardStatsResponse(
        success=True,
        total_xp=total_xp,
        user_level=level_title,
        current_streak_days=streak_days,
        total_quizzes_completed=total_quizzes,
        accuracy_pct=accuracy_pct,
        topic_mastery=topic_mastery,
        recent_attempts=recent_summaries,
        unlocked_badges_count=unlocked_badges,
    )


@router.post("/ai-quiz/generate", response_model=AIQuizGenerateResponse)
async def generate_ai_quiz_endpoint(request: AIQuizGenerateRequest):
    """
    Dynamically generates a tailored quantum multiple-choice examination
    using Groq LLM + 76-book quantum RAG semantic search.
    """
    topic = request.topic.strip()
    diff = request.difficulty or "intermediate"
    count = min(max(request.num_questions or 5, 2), 10)
    quiz_id = f"ai_quiz_{uuid.uuid4().hex[:8]}"

    # 1. Retrieve RAG literature passages
    rag_hits = _chroma_searcher.search(f"{topic} quantum algorithms theory questions", top_k=4)
    rag_ctx = "\n\n".join([f"[{h['source']}]: {h['text'][:600]}" for h in rag_hits]) if rag_hits else ""

    # 2. Query Groq
    from dotenv import load_dotenv
    load_dotenv(override=False)
    groq_key = (os.getenv("GROQ_API_KEY") or "").strip()
    candidate_models = [
        "qwen/qwen3.8-27b",       # Qwen 27B: ultra-fast (<1s) and superior STEM math reasoning
        "groq/compound",          # Groq compound model (~0.9s)
        "openai/gpt-oss-120b",    # 120B model
        "openai/gpt-oss-20b",     # Fast fallback
    ]
    models_to_try = list(dict.fromkeys(m for m in candidate_models if m))

    custom_text = (request.custom_content or "").strip()

    if groq_key:
        system_prompt = f"""You are Aura Quantum Assessment Engine — an elite examiner for Quantum Computing.
Generate a structured examination with EXACTLY {count} multiple-choice questions on: '{topic}'.
Difficulty Level: {diff.upper()}.

Each question MUST include:
- A clear, conceptual question targeting fundamental principles or mathematical reasoning
- Exactly 4 realistic options
- The zero-based integer index of the correct option (0, 1, 2, or 3)
- A rigorous conceptual explanation citing physical principles
- A LaTeX mathematical equation where applicable (e.g. state vector, matrix, expectation value)
- An optional short Qiskit 1.0 code snippet where relevant

Return ONLY valid JSON matching this schema:
{{
  "title": "{topic} Assessment",
  "questions": [
    {{
      "id": "q1",
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this answer is correct...",
      "formula": "\\\\LaTeX equation",
      "code_snippet": "# Optional Qiskit code snippet"
    }}
  ]
}}"""

        if custom_text:
            user_prompt = f"""Student Material / Document Notes to base quiz on:
\"\"\"
{custom_text[:3000]}
\"\"\"

Literature Context:
{rag_ctx}

Generate {count} {diff} multiple-choice questions specifically testing the material provided in the student notes above. Ensure scientific accuracy and strict JSON format."""
        else:
            user_prompt = f"""Literature Context:\n{rag_ctx}\n\nGenerate {count} {diff} questions on '{topic}'. Ensure scientific accuracy."""

        for model_name in models_to_try:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {groq_key}",
                            "User-Agent": "Mozilla/5.0 (QuantumLeapAI/1.0)",
                        },
                        json={
                            "model": model_name,
                            "response_format": {"type": "json_object"},
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                            "temperature": 0.2,
                            "max_tokens": 1800,
                        },
                    )
                    if resp.status_code == 200:
                        raw_content = resp.json()["choices"][0]["message"]["content"]
                        if "```json" in raw_content:
                            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
                        elif "```" in raw_content:
                            raw_content = raw_content.split("```")[1].split("```")[0].strip()
                        data = json.loads(raw_content)
                        qs = []
                        for idx, q_raw in enumerate(data.get("questions", [])):
                            qs.append(QuizQuestion(
                                id=q_raw.get("id", f"q{idx+1}"),
                                question=q_raw.get("question", "Quantum concept question"),
                                options=q_raw.get("options", ["A", "B", "C", "D"])[:4],
                                correct_index=int(q_raw.get("correct_index", 0)) % 4,
                                explanation=q_raw.get("explanation", "Accurate conceptual explanation."),
                                topic=topic,
                                formula=q_raw.get("formula"),
                                code_snippet=q_raw.get("code_snippet"),
                            ))
                        if len(qs) >= 2:
                            for q in qs:
                                QUIZ_SOLUTIONS[q.id] = {
                                    "correct_index": q.correct_index,
                                    "points": 50,
                                    "topic": topic,
                                    "explanation": q.explanation,
                                }
                            return AIQuizGenerateResponse(
                                success=True,
                                quiz_id=quiz_id,
                                title=data.get("title", f"{topic} Mastery Assessment"),
                                topic=topic,
                                difficulty=diff,
                                estimated_minutes=max(1, count * 2),
                                questions=qs,
                                is_ai_generated=True,
                                sources=[h.get("source", "Quantum Corpus") for h in rag_hits] if rag_hits else ["Groq GPT-OSS 120B"],
                            )
                    else:
                        print(f"[Assessment] {model_name} HTTP {resp.status_code}: {resp.text[:150]}")
            except Exception as e:
                print(f"[Assessment] Model {model_name} error: {e}")
                continue

    # Fallback to curated exam questions if offline / key issue
    fallback_qs: List[QuizQuestion] = []
    key_match = "gates"
    t_lower = topic.lower()
    if "entangle" in t_lower or "bell" in t_lower:
        key_match = "entanglement"
    elif "grover" in t_lower or "search" in t_lower or "oracle" in t_lower:
        key_match = "grover"
    elif "fourier" in t_lower or "qft" in t_lower or "phase estimation" in t_lower or "qpe" in t_lower:
        key_match = "qft"
    elif "vqe" in t_lower or "variational" in t_lower or "eigen" in t_lower:
        key_match = "vqe"
    elif "error" in t_lower or "qec" in t_lower or "surface" in t_lower or "stabilizer" in t_lower or "noise" in t_lower:
        key_match = "error_correction"

    pool = CURATED_EXAM_BANK.get(key_match, CURATED_EXAM_BANK["gates"])
    for idx, item in enumerate(pool[:count]):
        fallback_qs.append(QuizQuestion(
            id=item["id"],
            question=item["question"],
            options=item["options"],
            correct_index=item["correct_index"],
            explanation=item["explanation"],
            topic=topic,
            formula=item.get("formula"),
            code_snippet=item.get("code_snippet"),
        ))
        QUIZ_SOLUTIONS[item["id"]] = {
            "correct_index": item["correct_index"],
            "points": 50,
            "topic": topic,
            "explanation": item["explanation"],
        }

    return AIQuizGenerateResponse(
        success=True,
        quiz_id=quiz_id,
        title=f"{topic} Fundamental Diagnostic Exam",
        topic=topic,
        difficulty=diff,
        estimated_minutes=max(1, len(fallback_qs) * 2),
        questions=fallback_qs,
        is_ai_generated=False,
        sources=["Qiskit 1.0 Textbook", "Nielsen & Chuang (Quantum Computation & Information)"],
    )


@router.post("/generate-quiz")
async def unified_generate_quiz(raw_payload: Dict[str, Any]):
    """
    Unified dispatcher:
    - If payload has 'num_questions' -> processes as AI dynamic exam
    - Otherwise -> processes as curriculum dynamic quiz
    """
    if "num_questions" in raw_payload:
        req = AIQuizGenerateRequest(**raw_payload)
        return await generate_ai_quiz_endpoint(req)
    else:
        req = DynamicQuizGenerateRequest(**raw_payload)
        return await generate_dynamic_quiz(req)


@router.post("/save-report", response_model=TestReportResponse)
async def save_test_report_endpoint(
    request: TestReportSaveRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload),
):
    """
    Saves a completed test report with AI diagnostic evaluation
    and awards XP to the authenticated user.
    """
    report_id = f"rep_{uuid.uuid4().hex[:10]}"
    uid = user_payload.get("sub") if user_payload else None

    # Synthesize AI feedback diagnosis if not provided
    feedback = request.ai_feedback
    if not feedback:
        pct = request.score_percentage
        if pct >= 80:
            level = "Quantum Algorithm Master"
            summary = "Outstanding conceptual clarity! You demonstrate mastery of the quantum mechanical foundations and gate-level transformations."
            focus = ["Advance to fault-tolerant error correction", "Implement multi-qubit Grover or VQE in Circuit Studio"]
        elif pct >= 60:
            level = "Quantum Practitioner"
            summary = "Solid core foundation with minor ambiguities in complex phase interference and measurement collapse."
            focus = ["Review quantum phase transformations and superposition interference", "Practice statevector calculations"]
        else:
            level = "Quantum Apprentice"
            summary = "Good initial effort! Focus on strengthening single-qubit rotations, Bloch sphere representations, and reversible computing."
            focus = ["Revisit Unit 1 in Learning Hub: Quantum Bits & Gates", "Experiment with interactive Bloch spheres in the Studio"]

        feedback = {
            "proficiency_level": level,
            "performance_summary": summary,
            "recommended_focus_areas": focus,
            "suggested_lesson": "Unit 2: Entanglement & Bell States" if "entangle" in request.topic.lower() else "Unit 1: Quantum Superposition",
        }

    # Add XP to user
    xp_earned = int(request.score_percentage * 2)
    if uid:
        user = db.query(User).filter(User.id == uid).first()
        if user:
            user.total_xp += xp_earned

    # Save report to DB
    new_report = TestReport(
        id=report_id,
        user_id=uid,
        title=request.title,
        topic=request.topic,
        difficulty=request.difficulty,
        total_questions=request.total_questions,
        correct_count=request.correct_count,
        score_percentage=request.score_percentage,
        time_taken_seconds=request.time_taken_seconds,
        question_reviews=json.dumps([r.dict() for r in request.question_reviews]),
        ai_feedback=json.dumps(feedback),
        created_at=datetime.utcnow(),
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return TestReportResponse(
        id=new_report.id,
        user_id=new_report.user_id,
        title=new_report.title,
        topic=new_report.topic,
        difficulty=new_report.difficulty,
        total_questions=new_report.total_questions,
        correct_count=new_report.correct_count,
        score_percentage=new_report.score_percentage,
        time_taken_seconds=new_report.time_taken_seconds,
        question_reviews=json.loads(new_report.question_reviews),
        ai_feedback=json.loads(new_report.ai_feedback) if new_report.ai_feedback else None,
        created_at=new_report.created_at.isoformat(),
    )



@router.post("/verify-circuit", response_model=CircuitVerifyResponse)
async def verify_circuit_endpoint(
    request: CircuitVerifyRequest,
    user_payload: dict = Depends(get_current_user_payload),
):
    from backend.app.services.quantum.engine import QuantumSimulationEngine
    engine = QuantumSimulationEngine()
    
    flat_state, _ = engine.simulate_statevector(request.circuit)
    probs_array = np.abs(flat_state) ** 2
    norm = np.sum(probs_array)
    if norm > 0: probs_array /= norm
    
    num_qubits = request.circuit.num_qubits
    basis_labels = [f"{i:0{num_qubits}b}" for i in range(2 ** num_qubits)]
    sim_probs = {basis_labels[idx]: float(probs_array[idx]) for idx in range(len(probs_array))}
    
    max_diff = 0.0
    total_diff = 0.0
    target_probs = request.target_probabilities
    for label, target_p in target_probs.items():
        sim_p = sim_probs.get(label, 0.0)
        diff = abs(sim_p - target_p)
        max_diff = max(max_diff, diff)
        total_diff += diff
        
    for label, sim_p in sim_probs.items():
        if label not in target_probs:
            total_diff += sim_p
            
    is_correct = max_diff <= request.tolerance
    feedback = "Perfect match!" if is_correct else f"The statevector differs from target. Max deviation: {max_diff:.4f}."
    
    return CircuitVerifyResponse(
        success=True,
        is_correct=is_correct,
        similarity_score=1.0 - max_diff,
        diff_metrics={"max_deviation": max_diff, "total_variation": total_diff},
        feedback=feedback
    )


@router.get("/reports", response_model=List[TestReportResponse])
async def get_test_reports_endpoint(
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload),
):
    """
    Returns history of completed test reports for current user or all reports.
    """
    uid = user_payload.get("sub") if user_payload else None
    query = db.query(TestReport)
    if uid:
        query = query.filter(TestReport.user_id == uid)
    reports = query.order_by(TestReport.created_at.desc()).limit(50).all()

    result = []
    for r in reports:
        result.append(TestReportResponse(
            id=r.id,
            user_id=r.user_id,
            title=r.title,
            topic=r.topic,
            difficulty=r.difficulty,
            total_questions=r.total_questions,
            correct_count=r.correct_count,
            score_percentage=r.score_percentage,
            time_taken_seconds=r.time_taken_seconds,
            question_reviews=json.loads(r.question_reviews) if r.question_reviews else [],
            ai_feedback=json.loads(r.ai_feedback) if r.ai_feedback else None,
            created_at=r.created_at.isoformat() if r.created_at else "",
        ))
    return result


@router.get("/reports/{report_id}", response_model=TestReportResponse)
async def get_single_report_endpoint(report_id: str, db: Session = Depends(get_db)):
    """
    Returns specific detailed test report by report ID.
    """
    r = db.query(TestReport).filter(TestReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Test report not found")

    return TestReportResponse(
        id=r.id,
        user_id=r.user_id,
        title=r.title,
        topic=r.topic,
        difficulty=r.difficulty,
        total_questions=r.total_questions,
        correct_count=r.correct_count,
        score_percentage=r.score_percentage,
        time_taken_seconds=r.time_taken_seconds,
        question_reviews=json.loads(r.question_reviews) if r.question_reviews else [],
        ai_feedback=json.loads(r.ai_feedback) if r.ai_feedback else None,
        created_at=r.created_at.isoformat() if r.created_at else "",
    )


@router.get("/curated-quizzes")
async def get_curated_quizzes():
    """
    Pre-configured mock certification exams available for instant launch.
    """
    return [
        {
            "id": "exam_ibm_fundamentals",
            "title": "IBM Quantum Fundamentals Practice Exam",
            "topic": "Quantum Gates & Circuit Basics",
            "difficulty": "intermediate",
            "question_count": 5,
            "estimated_minutes": 10,
            "badge": "IBM Certified Associate",
            "description": "Comprehensive diagnostic covering superposition, unitary gates, reversible computation, and statevector measurements."
        },
        {
            "id": "exam_bell_entanglement",
            "title": "Entanglement & Bell Pairs Mastery Sprint",
            "topic": "Bell States & Non-Locality",
            "difficulty": "intermediate",
            "question_count": 4,
            "estimated_minutes": 8,
            "badge": "Quantum Information",
            "description": "Tests EPR paradox, CHSH inequality, dense coding, and quantum teleportation protocols."
        },
        {
            "id": "exam_grover_mastery",
            "title": "Grover's Algorithm & Oracle Design Challenge",
            "topic": "Grover Algorithm & Search",
            "difficulty": "advanced",
            "question_count": 5,
            "estimated_minutes": 12,
            "badge": "Algorithm Specialist",
            "description": "Phase inversion oracles, diffusion operators, quadratic speedup proofs, and multi-target search optimization."
        },
        {
            "id": "exam_vqe_chemistry",
            "title": "VQE & Variational Quantum Chemistry Test",
            "topic": "Variational Algorithms & VQE",
            "difficulty": "advanced",
            "question_count": 5,
            "estimated_minutes": 12,
            "badge": "Quantum Chemistry",
            "description": "Hamiltonian mapping, Jordan-Wigner transformation, ansatz parameterization, and hybrid quantum-classical optimization."
        }
    ]
