import os
import json
import httpx
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import (
    AITutorQueryRequest,
    AITutorQueryResponse,
    QuizModel
)

# Load the 150-source textbook catalog
CATALOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/books/quantum_library_150.json"))

def load_quantum_catalog() -> List[Dict[str, Any]]:
    if os.path.exists(CATALOG_PATH):
        try:
            with open(CATALOG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

KNOWLEDGE_CATALOG = load_quantum_catalog()

# Curated Fallback Domain Knowledge Bank
DOMAIN_KNOWLEDGE_BANK = {
    "entanglement": {
        "intent": "quantum_entanglement",
        "prose": "Quantum entanglement is a fundamental physical phenomenon where quantum states of two or more particles become mutually intertwined. Measuring one qubit instantaneously determines the state of the other, regardless of spatial separation. In our circuit, applying a Hadamard gate to qubit 0 creates equal superposition (|0> + |1>)/sqrt(2), and the subsequent CNOT gate targets qubit 1, producing the maximally entangled Bell state |Phi+>.",
        "latex": r"|\Phi^+\rangle = \frac{1}{\sqrt{2}}\left(|00\rangle + |11\rangle\right)",
        "code": "from qiskit import QuantumCircuit, Aer, execute\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)           # Place qubit 0 into superposition\nqc.cx(0, 1)       # Entangle qubit 1 conditionally on qubit 0\nqc.measure([0, 1], [0, 1])\n\nsim = Aer.get_backend('aer_simulator')\nresult = execute(qc, sim, shots=1024).result()\nprint('Counts:', result.get_counts())",
        "quiz": {
            "question": "What is the resulting state when qubit 0 in state |+> acts as control to flip target qubit 1 in state |0>?",
            "options": [
                "|00> state",
                "Maximally entangled Bell state (|00> + |11>)/sqrt(2)",
                "Separable state (|00> + |01>)/sqrt(2)",
                "Completely mixed thermal state"
            ],
            "answer": 1
        },
        "sources": [
            "Horodecki, R. et al. 'Quantum Entanglement' Rev. Mod. Phys. 81, 865 (2009)",
            "Wootters, W. K. 'Entanglement of Formation of an Arbitrary State of Two Qubits' PRL (1998)",
            "Nielsen & Chuang 'Quantum Computation and Quantum Information' (2010)"
        ]
    },
    "superposition": {
        "intent": "quantum_superposition",
        "prose": "Superposition allows a qubit to exist simultaneously as a linear combination of basis states |0> and |1>. The Hadamard gate H transforms the computational ground state |0> into |+>, creating an equal probability amplitude (1/sqrt(2)) for measuring either 0 or 1 upon projective collapse.",
        "latex": r"|\psi\rangle = \alpha |0\rangle + \beta |1\rangle \quad \text{with} \quad |\alpha|^2 + |\beta|^2 = 1, \quad H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}} = |+\rangle",
        "code": "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.h(0)            # Hadamard creates equal superposition\nqc.measure(0, 0)\n\n# Simulation results yield ~50% |0> and ~50% |1>",
        "quiz": {
            "question": "If state vector is |psi> = (1/sqrt(2))|0> + (1/sqrt(2))|1>, what is the probability of measuring |1>?",
            "options": ["25%", "50%", "70.7%", "100%"],
            "answer": 1
        },
        "sources": [
            "Thomas G. Wong 'Introduction to Classical and Quantum Computing' (2022)",
            "Ronald de Wolf 'Quantum Computing: Lecture Notes' (2023)"
        ]
    },
    "grover": {
        "intent": "grover_search",
        "prose": "Grover's Algorithm searches an unsorted database of N items in O(sqrt(N)) queries, providing a quadratic speedup over any classical algorithm. It operates by iteratively alternating between an Oracle reflection (which inverts the sign of the marked target state) and a Diffusion operator (which inverts all amplitudes about their mean).",
        "latex": r"G = (2|\psi\rangle\langle\psi| - I) \cdot O_f, \quad k \approx \left\lfloor \frac{\pi}{4}\sqrt{N} \right\rfloor \text{ iterations}",
        "code": "from qiskit import QuantumCircuit\n\n# 2-qubit Grover searching for |11>\nqc = QuantumCircuit(2, 2)\nqc.h([0, 1])      # Uniform superposition\n# Oracle: marks |11> with negative phase via CZ\nqc.cz(0, 1)\n# Diffusion operator\nqc.h([0, 1])\nqc.x([0, 1])\nqc.cz(0, 1)\nqc.x([0, 1])\nqc.h([0, 1])\nqc.measure([0, 1], [0, 1])",
        "quiz": {
            "question": "For an unstructured database of size N=1,000,000, roughly how many iterations does Grover search require?",
            "options": ["1,000,000 queries", "500,000 queries", "~785 queries", "20 queries"],
            "answer": 2
        },
        "sources": [
            "Grover, L. K. 'A fast quantum mechanical algorithm for database search' STOC (1996)",
            "Brassard, G. et al. 'Quantum Amplitude Amplification and Estimation' (2002)"
        ]
    },
    "teleportation": {
        "intent": "quantum_teleportation",
        "prose": "Quantum Teleportation transmits an unknown quantum state |psi> from Alice to Bob using a pre-shared entangled Bell pair and two classical bits of communication. Alice performs a Bell-basis measurement on her qubit and the state qubit, sending the two measurement outcomes to Bob, who applies conditional Pauli X and Z corrections to recover |psi> faithfully.",
        "latex": r"|\psi\rangle_A \otimes |\Phi^+\rangle_{AB} = \frac{1}{2} \left[ |\Phi^+\rangle (I|\psi\rangle) + |\Phi^-\rangle (Z|\psi\rangle) + |\Psi^+\rangle (X|\psi\rangle) + |\Psi^-\rangle (XZ|\psi\rangle) \right]",
        "code": "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 3)\n# Prepare state to teleport on q0\nqc.rx(1.2, 0)\n# Create Bell pair between q1 (Alice) and q2 (Bob)\nqc.h(1)\nqc.cx(1, 2)\n# Bell measurement by Alice\nqc.cx(0, 1)\nqc.h(0)\nqc.measure([0, 1], [0, 1])\n# Bob's conditional corrections\n# qc.x(2).c_if(c1, 1), qc.z(2).c_if(c0, 1)",
        "quiz": {
            "question": "Does quantum teleportation allow faster-than-light communication?",
            "options": [
                "Yes, because state transfer is instantaneous",
                "No, because Alice must transmit 2 classical bits at light speed or slower for Bob to reconstruct the state",
                "Yes, but only for pure states",
                "Only in superconducting quantum networks"
            ],
            "answer": 1
        },
        "sources": [
            "Bennett, C. H. et al. 'Teleporting an unknown quantum state via dual classical and EPR channels' PRL (1993)",
            "Mark M. Wilde 'Quantum Information Theory' Cambridge Univ Press (2017)"
        ]
    },
    "vqe": {
        "intent": "variational_quantum_eigensolver",
        "prose": "The Variational Quantum Eigensolver (VQE) is a hybrid quantum-classical NISQ algorithm that computes the ground state energy of a molecular or condensed matter Hamiltonian H. A parameterized quantum circuit (ansatz U(theta)) prepares candidate quantum states on a QPU, expectation values are measured, and a classical optimizer updates parameters theta until energy is minimized according to Rayleigh-Ritz variational principle.",
        "latex": r"\langle H \rangle(\vec{\theta}) = \langle 0 | U^\dagger(\vec{\theta}) H U(\vec{\theta}) | 0 \rangle \ge E_0",
        "code": "import numpy as np\nfrom qiskit.circuit.library import RealAmplitudes\n\n# Parameterized 2-qubit ansatz\nansatz = RealAmplitudes(num_qubits=2, reps=2)\nparams = np.random.rand(ansatz.num_parameters)\nbound_circuit = ansatz.assign_parameters(params)\nprint(bound_circuit.draw())",
        "quiz": {
            "question": "What mathematical principle guarantees that VQE energy estimates are always greater than or equal to true ground state energy?",
            "options": [
                "Heisenberg Uncertainty Principle",
                "Rayleigh-Ritz Variational Principle",
                "No-Cloning Theorem",
                "Eastin-Knill Theorem"
            ],
            "answer": 1
        },
        "sources": [
            "Peruzzo, A., McClean, J. et al. 'A variational eigenvalue solver on a photonic quantum processor' Nat. Comm. (2014)",
            "Cerezo, M. et al. 'Variational Quantum Algorithms' Nat. Rev. Phys. (2021)"
        ]
    }
}


class AITutorService:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.groq_key = os.getenv("GROQ_API_KEY", "").strip()
        self.openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    def _find_catalog_sources(self, query: str) -> List[str]:
        words = set(query.lower().split())
        matched = []
        for entry in KNOWLEDGE_CATALOG:
            title = entry.get("title", "").lower()
            author = entry.get("author", "")
            domain = entry.get("domain", "").lower()
            if any(w in title or w in domain for w in words if len(w) > 3):
                matched.append(f"{entry.get('title')} ({author}, {entry.get('year')})")
            if len(matched) >= 3:
                break
        return matched

    async def query(self, req: AITutorQueryRequest) -> AITutorQueryResponse:
        query_lower = req.user_query.lower()
        topic = (req.current_topic or "").lower()

        # Check external LLM if available
        if self.gemini_key:
            try:
                res = await self._query_gemini(req)
                if res:
                    return res
            except Exception:
                pass

        if self.groq_key:
            try:
                res = await self._query_groq(req)
                if res:
                    return res
            except Exception:
                pass

        # Fallback to local high-precision physics domain engine
        matched_domain = None
        for key in DOMAIN_KNOWLEDGE_BANK:
            if key in query_lower or key in topic:
                matched_domain = DOMAIN_KNOWLEDGE_BANK[key]
                break

        if not matched_domain:
            # Default to superposition / quantum foundation
            matched_domain = DOMAIN_KNOWLEDGE_BANK["superposition"]

        # Augment with dynamic sources from catalog
        extra_sources = self._find_catalog_sources(req.user_query)
        sources = matched_domain.get("sources", []) + extra_sources

        quiz_data = matched_domain["quiz"]
        quiz_obj = QuizModel(
            question_string=quiz_data["question"],
            options_array=quiz_data["options"],
            valid_index_pointer=quiz_data["answer"]
        )

        return AITutorQueryResponse(
            success=True,
            intent_classification=matched_domain["intent"],
            vocal_prose_script=matched_domain["prose"],
            mathematical_latex_formula=matched_domain["latex"],
            qiskit_executable_code=matched_domain["code"],
            quiz_generation_object=quiz_obj,
            is_cached_fallback=True,
            sources=sources[:4]
        )

    async def _query_gemini(self, req: AITutorQueryRequest) -> Optional[AITutorQueryResponse]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        prompt = f"""You are Aura Quantum AI, an elite quantum computing professor for Smart India Hackathon 2026.
Respond in strict JSON with keys:
"intent_classification": short string
"vocal_prose_script": clean 3-4 sentence scientific explanation
"mathematical_latex_formula": LaTeX equation representing the concept
"qiskit_executable_code": runnable python Qiskit code snippet
"quiz": {{"question": str, "options": [str, str, str, str], "answer": int}}

User Question: {req.user_query}
Circuit Context: {json.dumps(req.active_circuit_context or {})}
Topic: {req.current_topic}"""

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={
                "contents": [{"parts": [{"text": prompt}]}]
            })
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Clean possible markdown wrapping
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                parsed = json.loads(text)
                q = parsed.get("quiz", {})
                return AITutorQueryResponse(
                    success=True,
                    intent_classification=parsed.get("intent_classification", "quantum_query"),
                    vocal_prose_script=parsed.get("vocal_prose_script", ""),
                    mathematical_latex_formula=parsed.get("mathematical_latex_formula", ""),
                    qiskit_executable_code=parsed.get("qiskit_executable_code", ""),
                    quiz_generation_object=QuizModel(
                        question_string=q.get("question", ""),
                        options_array=q.get("options", []),
                        valid_index_pointer=q.get("answer", 0)
                    ) if q else None,
                    is_cached_fallback=False,
                    sources=["Live AI Studio (Gemini 1.5 Flash)", "Quantum Project Knowledge Base"]
                )
        return None

    async def _query_groq(self, req: AITutorQueryRequest) -> Optional[AITutorQueryResponse]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.groq_key}"}
        prompt = f"""You are Aura Quantum AI, elite quantum tutor for SIH 2026. Return strict JSON with:
"intent_classification", "vocal_prose_script", "mathematical_latex_formula", "qiskit_executable_code",
"quiz": {{"question": str, "options": [str, str, str, str], "answer": int}}
Query: {req.user_query}"""

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json={
                "model": "llama-3.1-8b-instant",
                "response_format": {"type": "json_object"},
                "messages": [{"role": "user", "content": prompt}]
            })
            if resp.status_code == 200:
                data = resp.json()
                parsed = json.loads(data["choices"][0]["message"]["content"])
                q = parsed.get("quiz", {})
                return AITutorQueryResponse(
                    success=True,
                    intent_classification=parsed.get("intent_classification", "quantum_query"),
                    vocal_prose_script=parsed.get("vocal_prose_script", ""),
                    mathematical_latex_formula=parsed.get("mathematical_latex_formula", ""),
                    qiskit_executable_code=parsed.get("qiskit_executable_code", ""),
                    quiz_generation_object=QuizModel(
                        question_string=q.get("question", ""),
                        options_array=q.get("options", []),
                        valid_index_pointer=q.get("answer", 0)
                    ) if q else None,
                    is_cached_fallback=False,
                    sources=["Live Groq Cloud Llama-3.1", "Quantum Project Knowledge Base"]
                )
        return None
