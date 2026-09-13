from typing import List, Dict, Optional, Any
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

class SimulationRunResponse(BaseModel):
    success: bool
    execution_time_ms: float
    framework: str
    shots: int
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    qasm_export: str
    error: Optional[str] = None

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

class AITutorQueryRequest(BaseModel):
    user_query: str
    active_circuit_context: Optional[Dict[str, Any]] = None
    current_topic: Optional[str] = None

class AITutorQueryResponse(BaseModel):
    success: bool
    intent_classification: str
    vocal_prose_script: str
    mathematical_latex_formula: str
    qiskit_executable_code: str
    quiz_generation_object: Optional[QuizModel] = None
    is_cached_fallback: bool
    sources: Optional[List[str]] = None

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
