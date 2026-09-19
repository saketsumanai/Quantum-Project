from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field

# --- Circuit Representation ---
class CircuitInstruction(BaseModel):
    gate: str = Field(..., description="Gate name (e.g. h, x, y, z, s, t, rx, ry, rz, cx, cz, swap, ccx, measure)")
    qubits: List[int] = Field(..., description="Qubit wire indices target/control")
    params: Optional[List[float]] = Field(default_factory=list, description="Rotation gate parameters if applicable")
    clbits: Optional[List[int]] = Field(default=None, description="Classical bit indices for measurement")

class CircuitModel(BaseModel):
    num_qubits: int = Field(..., ge=1, le=16, description="Number of qubits in circuit (1-16)")
    num_clbits: Optional[int] = Field(default=None, description="Number of classical readout bits")
    instructions: List[CircuitInstruction] = Field(default_factory=list, description="Ordered gate sequence")

# --- Simulation Schemas ---
class SimulationRunRequest(BaseModel):
    framework: Optional[str] = Field(default="qiskit", description="Execution engine: qiskit | simulator | cirq | pennylane")
    shots: Optional[int] = Field(default=1024, ge=1, le=8192, description="Number of measurement shots")
    circuit: CircuitModel
    noise_enabled: Optional[bool] = Field(default=False, description="Whether to simulate physical NISQ hardware noise")
    noise_profile: Optional[str] = Field(default="ibm_eagle", description="ibm_eagle | rigetti_aspen | ionq_forte")

class NoiseSimulationResult(BaseModel):
    profile: str
    technology: str
    execution_time_ms: float
    fidelity: float
    fidelity_pct: float
    purity: float
    t1_us: float
    t2_us: float
    readout_error_pct: float
    ideal_probabilities: Dict[str, float]
    noisy_probabilities: Dict[str, float]
    noisy_counts: Dict[str, int]

class SimulationRunResponse(BaseModel):
    success: bool
    execution_time_ms: float
    framework: str
    shots: int
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    qasm_export: str
    noise_data: Optional[NoiseSimulationResult] = None
    error: Optional[str] = None

class TranspileRequest(BaseModel):
    circuit: CircuitModel
    optimization_level: Optional[int] = Field(default=1, ge=0, le=3)

class TranspileResponse(BaseModel):
    success: bool
    telemetry: Dict[str, Any]
    qiskit: str
    openqasm3: str
    openqasm2: str
    cirq: str
    pennylane: str

class NoiseSimulationRequest(BaseModel):
    circuit: CircuitModel
    profile_key: Optional[str] = Field(default="ibm_eagle")
    custom_params: Optional[Dict[str, float]] = None
    shots: Optional[int] = Field(default=1024, ge=1, le=8192)

class NoiseSimulationResponse(BaseModel):
    success: bool
    profile: str
    technology: str
    execution_time_ms: float
    fidelity: float
    fidelity_pct: float
    purity: float
    t1_us: float
    t2_us: float
    readout_error_pct: float
    shots: int
    ideal_probabilities: Dict[str, float]
    noisy_probabilities: Dict[str, float]
    noisy_counts: Dict[str, int]
    error: Optional[str] = None

class ReportGenerateRequest(BaseModel):
    circuit: CircuitModel
    algorithm_name: Optional[str] = Field(default="Custom Quantum Circuit")
    author_name: Optional[str] = Field(default="Team Gitwolves")
    include_noise: Optional[bool] = Field(default=True)
    noise_profile: Optional[str] = Field(default="ibm_eagle")
    shots: Optional[int] = Field(default=1024)

class StatevectorRequest(BaseModel):
    circuit: CircuitModel

class StatevectorComponent(BaseModel):
    basis_state: str
    real: float
    imag: float
    amplitude_sq: float
    phase_rad: float

class BlochCoordinate(BaseModel):
    qubit_index: int
    theta_rad: float
    phi_rad: float
    x: float
    y: float
    z: float

class StatevectorResponse(BaseModel):
    success: bool
    num_qubits: int
    statevector: List[StatevectorComponent]
    bloch_coordinates: List[BlochCoordinate]
    error: Optional[str] = None

# --- AI Tutor Schemas ---
class QuizModel(BaseModel):
    question_string: str
    options_array: List[str]
    valid_index_pointer: int

class RAGMetricsModel(BaseModel):
    retrieval_similarity_score: float = Field(default=0.88, description="Cosine similarity score of top retrieved passage")
    retrieval_latency_ms: float = Field(default=35.0, description="ChromaDB vector search time in ms")
    llm_generation_ms: float = Field(default=450.0, description="LLM round trip latency in ms")
    total_latency_ms: float = Field(default=485.0, description="Total processing time in ms")
    retrieved_chunks_count: int = Field(default=3, description="Number of textbook passages retrieved")
    groundedness_confidence_score: float = Field(default=0.94, description="Overlap ratio between retrieved source and LLM response")
    tokens_consumed: int = Field(default=620, description="Total prompt and completion tokens")

class AITutorQueryRequest(BaseModel):
    user_query: str
    active_circuit_context: Optional[Dict[str, Any]] = None
    current_topic: Optional[str] = None
    user_level: Optional[str] = Field(default="beginner", description="beginner | intermediate | advanced")

class AITutorQueryResponse(BaseModel):
    success: bool
    intent_classification: str
    vocal_prose_script: str
    mathematical_latex_formula: str
    qiskit_executable_code: str
    quiz_generation_object: Optional[QuizModel] = None
    is_cached_fallback: bool
    sources: Optional[List[str]] = None
    rag_metrics: Optional[RAGMetricsModel] = None
    reasoning_process: Optional[Union[str, Dict[str, Any], List[Any]]] = Field(
        default=None, description="Step-by-step chain-of-thought quantum reasoning and theorem verification"
    )

class AICircuitDebugRequest(BaseModel):
    circuit: CircuitModel
    error_message: Optional[str] = None
    user_level: Optional[str] = "beginner"

class AICircuitDebugResponse(BaseModel):
    success: bool
    diagnosis: str
    suggested_fix_description: str
    corrected_circuit: Optional[CircuitModel] = None
    qiskit_corrected_code: Optional[str] = None

# --- Assessment Schemas ---
class AssessmentSubmitRequest(BaseModel):
    quiz_id: str
    selected_option_index: int
    time_taken_seconds: Optional[int] = 0

class AssessmentSubmitResponse(BaseModel):
    success: bool
    is_correct: bool
    points_earned: int
    explanation: str
    user_mastery: Dict[str, Any]

# --- Curriculum Schemas ---
class LessonChallenge(BaseModel):
    id: str
    title: str
    description: str
    target_qubits: int
    target_state: Optional[str] = None
    expected_probabilities: Optional[Dict[str, float]] = None
    hint: str
    initial_circuit: CircuitModel

class CurriculumLesson(BaseModel):
    id: str
    title: str
    duration_min: int
    difficulty: str
    summary: str
    theory_md: str
    preset_circuit: Optional[CircuitModel] = None
    challenges: List[LessonChallenge] = []
    quiz: Optional[QuizModel] = None

class CurriculumModule(BaseModel):
    id: str
    title: str
    category: str
    icon: str
    description: str
    lessons: List[CurriculumLesson]

# --- Progress & Library Schemas ---
class LessonCompletionRequest(BaseModel):
    lesson_id: str
    module_id: str
    score_delta: Optional[int] = 50

class DiracBadge(BaseModel):
    id: str
    title: str
    symbol: str
    latex_verification: str
    description: str
    unlocked: bool
    unlocked_at: Optional[str] = None

class UserProgressResponse(BaseModel):
    success: bool
    total_xp: int
    completed_lessons: List[str]
    badges: List[DiracBadge]
    overall_mastery_pct: float

class BookEntry(BaseModel):
    id: int
    title: str
    author: str
    category: str
    year: Optional[int] = None
    reference: Optional[str] = None
    url: Optional[str] = None
    key_concepts: List[str] = []
    training_vector_summary: Optional[str] = None
