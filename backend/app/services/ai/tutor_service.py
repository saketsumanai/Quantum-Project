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

async def _query_groq_with_context(
    query: str,
    context_passages: List[Dict],
    circuit_ctx: Dict,
    current_course_unit: str = "",
    history: Optional[List[Dict[str, str]]] = None,
    language: str = "en",
    preferred_model: str = "auto",
    generate_diagram: bool = False,
) -> Optional[Dict]:
    import httpx
    from dotenv import load_dotenv
    load_dotenv(override=False)

    if preferred_model == "failsafe":
        return None

    groq_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not groq_key:
        return None

    # Build passage context block from RAG
    ctx_block = ""
    if context_passages:
        ctx_block = "\n\n".join([
            f"[Source: {p['source']}]\n{p['text'][:900]}"
            for p in context_passages[:5]
        ])

    INDIAN_LANG_MAP = {
        "hi": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in HINDI (हिंदी) using authentic Devanagari script for the entire vocal_prose_script and quiz questions/options/explanation. "
            "Keep technical quantum terms crystal clear (e.g. mention 'सुपरपोज़िशन (Superposition)', 'एंटैंगलमेंट (Entanglement)', 'क्यूबिट (Qubit)'). "
            "Preserve all mathematical formulas in proper LaTeX notation (e.g. |0\\rangle, |1\\rangle, matrices) and Python code standard."
        ),
        "hinglish": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond in natural, conversational HINGLISH (conversational Hindi written using the English/Latin alphabet, exactly as popular Indian tech and engineering educators speak, e.g., 'Quantum Superposition ka matlab hai ki ek qubit ek hi time par |0> aur |1> dono states ka linear combination hold karta hai...'). "
            "Preserve all mathematical formulas in proper LaTeX notation and keep Python code standard."
        ),
        "ta": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in TAMIL (தமிழ்) script for the entire vocal_prose_script and quiz. "
            "Explain quantum physics and computing concepts fluently in Tamil. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "te": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in TELUGU (తెలుగు) script for the entire vocal_prose_script and quiz. "
            "Explain quantum physics and computing concepts fluently in Telugu. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "bn": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in BENGALI (বাংলা) script for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Bengali. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "mr": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in MARATHI (मराठी) script for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Marathi. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "gu": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in GUJARATI (ગુજરાતી) script for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Gujarati. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "kn": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in KANNADA (ಕನ್ನಡ) script for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Kannada. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "ml": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in MALAYALAM (മലയാളം) script for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Malayalam. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "pa": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in PUNJABI (ਪੰਜਾਬੀ Gurmukhi script) for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Punjabi. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
        "or": (
            "CRITICAL LANGUAGE INSTRUCTION: You MUST explain and respond strictly in ODIA (ଓଡ଼ିଆ script) for the entire vocal_prose_script and quiz. "
            "Explain quantum computing concepts fluently in Odia. "
            "Preserve all mathematical formulas in proper LaTeX notation and Python code standard."
        ),
    }

    lang_instruction = INDIAN_LANG_MAP.get(
        (language or "en").lower(),
        "LANGUAGE INSTRUCTION: If the student asks in an Indian language (e.g. Hindi, Hinglish, Tamil, Telugu, Bengali, etc.), respond in that language with full fluency. Otherwise, provide your response in clear, lucid English."
    )

    visual_requested = generate_diagram or any(w in query.lower() for w in ["diagram", "circuit", "visualize", "visual", "image", "bloch", "sphere", "draw", "plot", "picture"])

    system_prompt = f"""You are Aura Quantum AI — an elite multilingual quantum computing scientist and conversational professor powering the Quantum Leap platform (combining the pedagogy of John Preskill, Scott Aaronson, and the IBM Quantum team).

The user can ask you ANY question — whether conceptual, mathematical, algorithmic, hardware-related, or code-related. You respond with the clarity, depth, and helpfulness of ChatGPT and Gemini, specialized for Quantum Computing.

{lang_instruction}

GUIDELINES FOR YOUR RESPONSE:
1. vocal_prose_script:
   - Provide a deep, lucid, and comprehensive explanation.
   - Begin with an intuitive conceptual analogy that builds intuition without dumbing down the physics.
   - Explain the underlying quantum mechanics or mathematics rigorously.
   - Use clear paragraphs and Markdown formatting (bold key terms, lists where helpful).
   - Answer the student's exact question directly and insightfully.
2. mathematical_latex_formula:
   - Provide the single most important mathematical formulation for the topic in proper LaTeX syntax (e.g., bra-ket Dirac notation |\\psi\\rangle, Pauli matrices, unitary operators U, expectation values \\langle A \\rangle, tensor products \\otimes).
   - If the topic does not involve a specific formula, provide the relevant state or Hamiltonian.
3. qiskit_executable_code:
   - If relevant to the question, provide complete, runnable Python code using the modern Qiskit 1.0+ API (e.g., using `from qiskit_aer import AerSimulator`, `QuantumCircuit`, `sim.run()`). If pure theory/conceptual and code is not applicable, provide a concise pedagogical snippet or set to "".
4. quiz:
   - Provide a probing multiple-choice question testing conceptual understanding.
   - Include 4 realistic options, the zero-based index of the correct answer, and an explanation.
5. diagram:
   - {"The student requested a visual diagram. You MUST generate a structured quantum diagram object." if visual_requested else "If a visual schematic, circuit, Bloch sphere, or probability distribution significantly aids understanding, provide a diagram object; otherwise set to null."}
   - Supported diagram formats:
     * Circuit Diagram: {{"type": "circuit", "title": "Circuit Title", "num_qubits": 2, "gates": [{{"gate": "H", "qubits": [0]}}, {{"gate": "CX", "qubits": [0, 1]}}]}}
     * Bloch Sphere: {{"type": "bloch_sphere", "title": "State on Bloch Sphere", "theta": 1.5708, "phi": 0.0, "state_label": "|+⟩"}}
     * State Histogram: {{"type": "histogram", "title": "Measurement Probabilities", "distribution": {{"00": 0.5, "11": 0.5}}}}

You MUST respond strictly in valid JSON format with EXACTLY these keys:
{{
  "intent_classification": "snake_case_topic",
  "vocal_prose_script": "detailed, rich explanation with intuitive analogy and physical depth",
  "mathematical_latex_formula": "LaTeX equation string",
  "qiskit_executable_code": "Python Qiskit 1.0+ code or empty string",
  "diagram": null or diagram_object,
  "quiz": {{
    "question": "Conceptual probe question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Why the correct answer is right and why others are wrong"
  }}
}}"""

    # Build messages array including conversation history if provided
    messages = [{"role": "system", "content": system_prompt}]

    # Include recent conversation turns (up to last 6 messages) for multi-turn conversational context
    if history:
        for turn in history[-6:]:
            r = turn.get("role", "user")
            c = turn.get("content", "")
            if c and r in ("user", "assistant"):
                messages.append({"role": r, "content": c})

    rag_section = f"RETRIEVED EXPERT LITERATURE:\n{ctx_block}\n\n" if ctx_block else ""
    course_ctx = f"Active Course Topic: {current_course_unit}\n" if current_course_unit else ""
    circuit_desc = f"Active Circuit Context: {json.dumps(circuit_ctx)}\n" if circuit_ctx else ""

    current_prompt = f"{rag_section}{course_ctx}{circuit_desc}Student Question: {query}"
    messages.append({"role": "user", "content": current_prompt})

    default_models = [
        "qwen/qwen3.8-27b",       # Qwen 27B — ultra fast, exceptional at physics/math
        "openai/gpt-oss-120b",    # 120B GPT-class model on Groq
        "groq/compound",          # Groq compound model
        "openai/gpt-oss-20b",     # Fast fallback
    ]
    if preferred_model and preferred_model != "auto" and preferred_model in default_models:
        candidate_models = [preferred_model] + [m for m in default_models if m != preferred_model]
    else:
        candidate_models = default_models

    models_to_try = list(dict.fromkeys(m for m in candidate_models if m))

    try:
        async with httpx.AsyncClient(timeout=18.0) as client:
            for model_name in models_to_try:
                try:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {groq_key}",
                            "User-Agent": "QuantumLeapAI/2.0",
                        },
                        json={
                            "model": model_name,
                            "response_format": {"type": "json_object"},
                            "messages": messages,
                            "temperature": 0.25,
                            "max_tokens": 2500,
                        },
                    )
                    if resp.status_code == 200:
                        raw_data = resp.json()
                        content_str = raw_data["choices"][0]["message"]["content"]
                        # Strip markdown if present
                        if "```json" in content_str:
                            content_str = content_str.split("```json")[1].split("```")[0].strip()
                        elif "```" in content_str:
                            content_str = content_str.split("```")[1].split("```")[0].strip()
                        res = json.loads(content_str)
                        display_name = (
                            model_name
                            .replace("openai/gpt-oss-120b", "GPT-OSS 120B (Groq)")
                            .replace("groq/compound", "Groq Compound")
                            .replace("qwen/qwen3.8-27b", "Qwen 3.8 27B")
                            .replace("openai/gpt-oss-20b", "GPT-OSS 20B")
                        )
                        res["_active_model"] = display_name
                        res["_rag_active"] = len(context_passages) > 0
                        print(f"[Groq] ✓ {model_name} generated response successfully")
                        return res
                    print(f"[Groq] {model_name} → {resp.status_code}: {resp.text[:200]}")
                except Exception as model_err:
                    print(f"[Groq] Error with {model_name}: {model_err}")
                    continue
    except Exception as e:
        print(f"[Groq] Connection error: {e}")
    return None


# ─── Custom Fine-Tuned LLaMA Endpoint (Ollama / vLLM / Colab ngrok) ───────────

async def _query_custom_llm_with_context(query: str, context_passages: List[Dict], circuit_ctx: Dict, current_course_unit: str = "") -> Optional[Dict]:
    import httpx

    custom_url = os.getenv("CUSTOM_LLM_URL") or os.getenv("OLLAMA_BASE_URL")
    if not custom_url:
        return None

    # Normalize url to include chat/completions if not present
    endpoint = custom_url.rstrip("/")
    if not endpoint.endswith("/chat/completions"):
        if endpoint.endswith("/v1"):
            endpoint = f"{endpoint}/chat/completions"
        else:
            endpoint = f"{endpoint}/v1/chat/completions"

    model_name = os.getenv("CUSTOM_LLM_MODEL", "quantum-llama3-tutor")
    api_key = os.getenv("CUSTOM_LLM_API_KEY", "ollama")

    ctx_block = ""
    if context_passages:
        ctx_block = "\n\n".join([f"[Source: {p['source']}]\n{p['text'][:800]}" for p in context_passages[:4]])

    system_prompt = (
        "You are Aura Quantum AI — an elite quantum computing professor and world-class researcher powering Quantum Leap.\n"
        "Explain concepts using clear intuitive analogies, exact LaTeX Dirac formulas, 100% runnable Qiskit 1.0+ code, "
        "and a diagnostic Socratic quiz. Respond strictly in valid JSON format with keys: "
        "intent_classification, vocal_prose_script, mathematical_latex_formula, qiskit_executable_code, quiz(question,options[4],answer,explanation)."
    )
    user_msg = f"Knowledge Passages:\n{ctx_block}\n\nCircuit Context: {json.dumps(circuit_ctx or {})}\nTopic: {current_course_unit}\nQuestion: {query}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {"Content-Type": "application/json"}
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
            resp = await client.post(
                endpoint,
                headers=headers,
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_msg},
                    ],
                    "temperature": 0.25,
                    "max_tokens": 1500,
                },
            )
            if resp.status_code == 200:
                content_str = resp.json()["choices"][0]["message"]["content"]
                if "```json" in content_str:
                    content_str = content_str.split("```json")[1].split("```")[0].strip()
                elif "```" in content_str:
                    content_str = content_str.split("```")[1].split("```")[0].strip()
                res = json.loads(content_str)
                res["_active_model"] = f"Fine-Tuned Llama ({model_name})"
                return res
    except Exception as e:
        print(f"[Custom LLM] Failed: {e}, falling back to cloud providers...")
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

        # 1. Semantic retrieval with expanded candidates for re-ranking
        candidates = _chroma_searcher.search(req.user_query, top_k=15)
        
        # --- RAG Optimization: Keyword-Based Re-ranking ---
        # We boost passages that contain key technical terms found in the user query
        # to ensure mathematical precision over generic semantic similarity.
        if candidates:
            query_words = set(req.user_query.lower().split())
            # Technical keywords that should trigger a boost
            tech_keywords = {"qubit", "hadamard", "entanglement", "grover", "vqe", "bloch", "statevector", "unitary", "phase", "superposition"}
            
            scored_candidates = []
            for p in candidates:
                text_lower = p["text"].lower()
                # Start with the semantic score from ChromaDB
                score = p.get("score", 0.0)
                
                # Boost based on technical keyword overlap
                overlap = len(query_words.intersection(set(text_lower.split())))
                tech_overlap = len(tech_keywords.intersection(set(text_lower.split())))
                
                # Final score: semantic + technical weight
                final_score = score + (overlap * 0.05) + (tech_overlap * 0.1)
                scored_candidates.append((final_score, p))
            
            # Sort by new score and take top 5
            scored_candidates.sort(key=lambda x: x[0], reverse=True)
            passages = [p for score, p in scored_candidates[:5]]
        else:
            passages = []

        rag_active = len(passages) > 0
        sources = list({p["source"] for p in passages}) if passages else []

        # 2. Try Custom Fine-Tuned Llama, then Groq, then Gemini
        parsed = None
        course_unit_ctx = req.current_topic or ""
        req_model = getattr(req, "model", "auto") or "auto"
        req_diagram = bool(getattr(req, "generate_diagram", False))

        if req_model != "failsafe":
            parsed = await _query_custom_llm_with_context(
                req.user_query, passages, req.active_circuit_context or {},
                current_course_unit=course_unit_ctx
            )
            if parsed is None:
                parsed = await _query_groq_with_context(
                    req.user_query, passages, req.active_circuit_context or {},
                    current_course_unit=course_unit_ctx,
                    history=req.conversation_history,
                    language=getattr(req, "language", "en") or "en",
                    preferred_model=req_model,
                    generate_diagram=req_diagram,
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
            active_model_name = parsed.get("_active_model", "Qwen 3.8 27B")
            tutor_sources = [f"Model: {active_model_name}"]
            if sources:
                tutor_sources.extend(sources[:3])
            else:
                tutor_sources.append("Quantum Leap 76-Book Corpus (RAG)")

            return AITutorQueryResponse(
                success=True,
                intent_classification=parsed.get("intent_classification", "quantum_query"),
                vocal_prose_script=parsed.get("vocal_prose_script", ""),
                mathematical_latex_formula=parsed.get("mathematical_latex_formula", ""),
                qiskit_executable_code=parsed.get("qiskit_executable_code", ""),
                quiz_generation_object=quiz_obj,
                is_cached_fallback=False,
                sources=tutor_sources[:4],
                diagram=parsed.get("diagram"),
                model_used=active_model_name,
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
