"""
Quantum Leap — Production AI Quantum Tutor Service
===================================================
Architecture:
  1. Semantic search in ChromaDB (76-book local corpus)
  2. Retrieved passages injected into Groq Llama-3.1 prompt
  3. Failsafe offline domain engine if no Groq key
"""

import os
import json
from typing import Optional, List, Dict, Any

from backend.app.models.schemas import (
    AITutorQueryRequest,
    AITutorQueryResponse,
    QuizModel,
)

VECTOR_STORE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../data/vector_store/quantum_books")
)
COLLECTION_NAME = "quantum_books"
CATALOG_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../data/books/quantum_library_150.json")
)

# ─── Load 150-source catalog for metadata ─────────────────────────────────────
def _load_catalog() -> List[Dict[str, Any]]:
    if os.path.exists(CATALOG_PATH):
        try:
            with open(CATALOG_PATH, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

KNOWLEDGE_CATALOG = _load_catalog()

# ─── Domain Knowledge Fallback (when ChromaDB/Groq unavailable) ───────────────
DOMAIN_FALLBACK = {
    "entanglement": {
        "intent": "quantum_entanglement",
        "prose": "Quantum entanglement occurs when two qubits become quantum-mechanically correlated such that measuring one qubit instantly determines the state of the other. The canonical maximally entangled Bell state is prepared by applying Hadamard on q₀ followed by CNOT(q₀→q₁), yielding (|00⟩+|11⟩)/√2.",
        "latex": r"|\Phi^+\rangle = \frac{1}{\sqrt{2}}\left(|00\rangle + |11\rangle\right)",
        "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()",
        "quiz": {"question": "After applying H then CNOT, measuring q₀=1 means q₁=?", "options": ["Always 0", "Always 1", "Random", "Undefined"], "answer": 1},
        "sources": ["Wilde – Quantum Information Theory (Cambridge, 2017)", "Horodecki et al. – Rev. Mod. Phys. 81, 865 (2009)"],
    },
    "superposition": {
        "intent": "quantum_superposition",
        "prose": "Superposition allows a qubit to exist as a complex linear combination α|0⟩+β|1⟩ with |α|²+|β|²=1. The Hadamard gate H maps the computational basis state |0⟩ to the equal superposition |+⟩=(|0⟩+|1⟩)/√2.",
        "latex": r"H|0\rangle = |+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}},\quad |\alpha|^2+|\beta|^2=1",
        "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\nqc.h(0)\nqc.measure(0, 0)",
        "quiz": {"question": "What is P(measuring |1⟩) for state |+⟩?", "options": ["25%", "50%", "75%", "100%"], "answer": 1},
        "sources": ["Wong – Introduction to Classical and Quantum Computing (2022)", "de Wolf – Quantum Computing: Lecture Notes (2023)"],
    },
    "grover": {
        "intent": "grover_search",
        "prose": "Grover's algorithm searches N unordered items in O(√N) oracle queries—a quadratic speedup. It alternates a phase oracle (marking the target) with the Grover diffusion operator (inversion about the mean amplitude), amplifying the target state after ≈(π/4)√N iterations.",
        "latex": r"G = \left(2|\psi\rangle\langle\psi| - I\right) O_f,\quad k \approx \left\lfloor\frac{\pi}{4}\sqrt{N}\right\rfloor",
        "code": "# 2-qubit Grover targeting |11>\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h([0,1])\nqc.cz(0,1)         # Oracle\nqc.h([0,1])\nqc.x([0,1])\nqc.cz(0,1)         # Diffusion\nqc.x([0,1])\nqc.h([0,1])\nqc.measure_all()",
        "quiz": {"question": "For N=10^6, how many Grover iterations are needed?", "options": ["10^6", "5×10^5", "~785", "log₂(10^6)"], "answer": 2},
        "sources": ["Grover – STOC 1996", "Brassard et al. – Amplitude Amplification and Estimation (2002)"],
    },
    "vqe": {
        "intent": "variational_quantum_eigensolver",
        "prose": "VQE is a hybrid quantum-classical algorithm that estimates the ground-state energy of a Hamiltonian H. A parameterized ansatz U(θ) prepares a quantum state on a QPU; a classical optimizer minimises ⟨H⟩(θ) using the variational principle E₀ ≤ ⟨ψ(θ)|H|ψ(θ)⟩.",
        "latex": r"E(\vec\theta) = \langle 0|U^\dagger(\vec\theta)\,H\,U(\vec\theta)|0\rangle \;\geq\; E_0",
        "code": "from qiskit.circuit.library import RealAmplitudes\nimport numpy as np\nansatz = RealAmplitudes(num_qubits=2, reps=2)\nprint(ansatz.draw())",
        "quiz": {"question": "Which principle guarantees VQE energy ≥ true ground energy?", "options": ["Heisenberg uncertainty", "Variational principle", "No-cloning theorem", "Eastin-Knill theorem"], "answer": 1},
        "sources": ["Peruzzo et al. – Nat. Comm. 2014", "Cerezo et al. – Nat. Rev. Phys. 2021"],
    },
    "teleportation": {
        "intent": "quantum_teleportation",
        "prose": "Quantum teleportation transmits an unknown state |ψ⟩ from Alice to Bob using one pre-shared Bell pair and two classical bits. Alice performs a Bell-basis measurement, sends the two outcomes classically, and Bob applies conditional Pauli corrections to recover |ψ⟩ exactly.",
        "latex": r"|\psi\rangle_A \otimes |\Phi^+\rangle_{AB} \xrightarrow{\text{Bell meas.}} |\Phi^+\rangle \otimes |\psi\rangle_B \;\text{(after corrections)}",
        "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 3)\nqc.rx(1.2, 0)       # State to teleport\nqc.h(1); qc.cx(1,2) # Bell pair\nqc.cx(0,1); qc.h(0)\nqc.measure([0,1],[0,1])",
        "quiz": {"question": "Does quantum teleportation allow FTL communication?", "options": ["Yes—state transfer is instant", "No—2 classical bits must be sent first", "Yes, for pure states only", "Only with entangled networks"], "answer": 1},
        "sources": ["Bennett et al. – PRL 70, 1895 (1993)", "Wilde – Quantum Information Theory Ch. 6"],
    },
}


# ─── ChromaDB Semantic Search ─────────────────────────────────────────────────

class ChromaSearcher:
    """Lazy-loaded ChromaDB retriever. Handles missing vector store gracefully."""

    def __init__(self):
        self._collection = None
        self._model = None
        self._ready = False

    def _try_init(self):
        if self._ready:
            return True
        if not os.path.exists(VECTOR_STORE_DIR):
            return False
        try:
            import chromadb
            from sentence_transformers import SentenceTransformer
            client = chromadb.PersistentClient(path=VECTOR_STORE_DIR)
            self._collection = client.get_or_create_collection(COLLECTION_NAME)
            if self._collection.count() == 0:
                return False
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            self._ready = True
            print(f"[RAG] ChromaDB ready: {self._collection.count()} chunks indexed.")
            return True
        except Exception as e:
            print(f"[RAG] ChromaDB init failed: {e}")
            return False

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Returns list of {text, source, score} dicts for top_k relevant chunks."""
        if not self._try_init():
            return []
        try:
            embedding = self._model.encode([query]).tolist()
            results = self._collection.query(
                query_embeddings=embedding,
                n_results=top_k,
                include=["documents", "metadatas", "distances"],
            )
            hits = []
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            for doc, meta, dist in zip(docs, metas, distances):
                hits.append({
                    "text": doc,
                    "source": meta.get("source", "Unknown"),
                    "doc_name": meta.get("doc_name", ""),
                    "score": round(1.0 - dist, 4),
                })
            return hits
        except Exception as e:
            print(f"[RAG] Search error: {e}")
            return []


# Singleton instance
_chroma_searcher = ChromaSearcher()


# ─── Groq LLM Query ──────────────────────────────────────────────────────────

async def _query_groq_with_context(query: str, context_passages: List[Dict], circuit_ctx: Dict) -> Optional[Dict]:
    import httpx

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        return None

    # Build passage context block
    ctx_block = ""
    if context_passages:
        ctx_block = "\n\n".join([
            f"[Source: {p['source']}]\n{p['text'][:800]}"
            for p in context_passages[:4]
        ])

    system_prompt = """You are Aura Quantum AI, an elite quantum computing professor for Smart India Hackathon 2026 (Quantum Leap platform, Team Gitwolves).
You have access to retrieved passages from the 76-book quantum computing corpus below.
Use this knowledge to give precise, mathematically rigorous explanations.
Return ONLY valid JSON with exactly these keys:
- intent_classification (short string)
- vocal_prose_script (3-5 scientific sentences)
- mathematical_latex_formula (LaTeX string)
- qiskit_executable_code (runnable Python)
- quiz (object with: question str, options [4 strings], answer int 0-3)"""

    user_msg = f"""Retrieved Quantum Knowledge:
{ctx_block}

Circuit Context: {json.dumps(circuit_ctx or {})}

Student Question: {query}

Respond in JSON only."""

    model_name = os.getenv("GROQ_MODEL", "groq/compound-mini")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}"},
                json={
                    "model": model_name,
                    "response_format": {"type": "json_object"},
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1024,
                },
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                return json.loads(content)
            else:
                print(f"[Groq] Status {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"[Groq] Error: {e}")
    return None


# ─── Gemini fallback ──────────────────────────────────────────────────────────

async def _query_gemini_with_context(query: str, context_passages: List[Dict], circuit_ctx: Dict) -> Optional[Dict]:
    import httpx

    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not gemini_key:
        return None

    ctx_block = "\n\n".join([f"[Source: {p['source']}]\n{p['text'][:600]}" for p in context_passages[:3]])
    prompt = f"""You are Aura Quantum AI for Quantum Leap SIH 2026.
Knowledge: {ctx_block}
Question: {query}
Circuit: {json.dumps(circuit_ctx or {})}
Return JSON: intent_classification, vocal_prose_script, mathematical_latex_formula, qiskit_executable_code, quiz(question,options[4],answer)"""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            if resp.status_code == 200:
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                return json.loads(text)
    except Exception as e:
        print(f"[Gemini] Error: {e}")
    return None


# ─── Main Service ─────────────────────────────────────────────────────────────

class AITutorService:

    async def query(self, req: AITutorQueryRequest) -> AITutorQueryResponse:
        query_lower = req.user_query.lower()

        # 1. Semantic retrieval from ChromaDB
        passages = _chroma_searcher.search(req.user_query, top_k=5)
        rag_active = len(passages) > 0
        sources = list({p["source"] for p in passages}) if passages else []

        # 2. Try Groq (preferred) then Gemini with retrieved context
        parsed = await _query_groq_with_context(
            req.user_query, passages, req.active_circuit_context or {}
        )
        if parsed is None:
            parsed = await _query_gemini_with_context(
                req.user_query, passages, req.active_circuit_context or {}
            )

        if parsed:
            quiz_data = parsed.get("quiz", {})
            quiz_obj = None
            if quiz_data and quiz_data.get("question") and quiz_data.get("options"):
                quiz_obj = QuizModel(
                    question_string=quiz_data["question"],
                    options_array=quiz_data["options"],
                    valid_index_pointer=int(quiz_data.get("answer", 0)),
                )
            if not sources:
                sources = ["Quantum Leap 76-Book Corpus (Live RAG)", "Groq Llama-3.1-8B"]
            return AITutorQueryResponse(
                success=True,
                intent_classification=parsed.get("intent_classification", "quantum_query"),
                vocal_prose_script=parsed.get("vocal_prose_script", ""),
                mathematical_latex_formula=parsed.get("mathematical_latex_formula", ""),
                qiskit_executable_code=parsed.get("qiskit_executable_code", ""),
                quiz_generation_object=quiz_obj,
                is_cached_fallback=False,
                sources=sources[:4],
            )

        # 3. If LLM unavailable, return retrieved passages directly
        if passages:
            merged_text = " ".join(p["text"] for p in passages[:2])[:600]
            return AITutorQueryResponse(
                success=True,
                intent_classification="quantum_knowledge_retrieval",
                vocal_prose_script=f"From our quantum corpus: {merged_text}",
                mathematical_latex_formula=r"\text{Configure GROQ\_API\_KEY for full AI responses}",
                qiskit_executable_code="# Add GROQ_API_KEY to .env for Qiskit code generation",
                quiz_generation_object=None,
                is_cached_fallback=True,
                sources=sources[:4],
            )

        # 4. Final fallback: domain knowledge bank
        domain = None
        for key in DOMAIN_FALLBACK:
            if key in query_lower or key in (req.current_topic or "").lower():
                domain = DOMAIN_FALLBACK[key]
                break
        if domain is None:
            domain = DOMAIN_FALLBACK["superposition"]

        q = domain["quiz"]
        return AITutorQueryResponse(
            success=True,
            intent_classification=domain["intent"],
            vocal_prose_script=domain["prose"],
            mathematical_latex_formula=domain["latex"],
            qiskit_executable_code=domain["code"],
            quiz_generation_object=QuizModel(
                question_string=q["question"],
                options_array=q["options"],
                valid_index_pointer=q["answer"],
            ),
            is_cached_fallback=True,
            sources=domain["sources"],
        )
