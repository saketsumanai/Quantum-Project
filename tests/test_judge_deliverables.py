import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.schemas import CircuitModel, CircuitInstruction
from backend.app.services.quantum.debugger import QuantumCircuitDebugger

client = TestClient(app)


def test_dynamic_quiz_generation():
    """Verify dynamic quiz generation endpoint generates questions across topics with LaTeX."""
    topics = ["superposition", "entanglement", "grover", "teleportation", "qec", "vqe"]
    for topic in topics:
        res = client.post("/api/v1/assessment/generate-quiz", json={"topic": topic, "count": 2})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["questions"]) >= 1
        q = data["questions"][0]
        assert "id" in q
        assert len(q["options_array"]) >= 2
        assert q["points"] == 50


def test_dynamic_quiz_submission_and_mastery():
    """Verify quiz submission evaluates correctly and returns updated domain mastery."""
    # 1. Generate quiz
    gen_res = client.post("/api/v1/assessment/generate-quiz", json={"topic": "superposition", "count": 1})
    assert gen_res.status_code == 200
    question = gen_res.json()["questions"][0]
    quiz_id = question["id"]
    correct_idx = question["valid_index_pointer"]

    # 2. Submit correct option
    sub_res = client.post("/api/v1/assessment/submit", json={
        "quiz_id": quiz_id,
        "selected_option_index": correct_idx,
        "time_taken_seconds": 12,
    })
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["success"] is True
    assert sub_data["is_correct"] is True
    assert sub_data["points_earned"] == 50
    assert "user_mastery" in sub_data


def test_dashboard_stats_telemetry():
    """Verify Student Dashboard stats endpoint aggregates XP, streak, accuracy, and recent attempts."""
    res = client.get("/api/v1/assessment/dashboard-stats")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["total_xp"] >= 0
    assert "user_level" in data
    assert "current_streak_days" in data
    assert "accuracy_pct" in data
    assert "topic_mastery" in data
    assert isinstance(data["recent_attempts"], list)


def test_ai_circuit_debugger_redundant_gate_detection():
    """Verify AI Circuit Debugger detects redundant self-inverting gate cancellations."""
    circuit = CircuitModel(
        num_qubits=2,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0], params=[]),
            CircuitInstruction(gate="h", qubits=[0], params=[]),
            CircuitInstruction(gate="cx", qubits=[0, 1], params=[]),
        ]
    )
    res = client.post("/api/v1/simulation/debug", json={
        "circuit": circuit.model_dump(),
        "user_level": "beginner"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "Consecutive self-inverse gates" in data["diagnosis"]
    assert "Remove consecutive H pair" in data["suggested_fix_description"]
    # Redundant pair should be pruned in corrected circuit
    corrected_insts = data["corrected_circuit"]["instructions"]
    h_gates = [i for i in corrected_insts if i["gate"] == "h"]
    assert len(h_gates) == 0


def test_ai_circuit_debugger_uncomputed_ancilla():
    """Verify AI Circuit Debugger flags uncomputed ancilla registers."""
    circuit = CircuitModel(
        num_qubits=3,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0], params=[]),
            CircuitInstruction(gate="cx", qubits=[0, 2], params=[]),
        ]
    )
    res = QuantumCircuitDebugger.analyze_and_fix(circuit)
    assert res.success is True
    assert "uncomputed ancilla" in res.diagnosis.lower()
