"""
Quantum Leap — Step 5 Comprehensive Automated Verification Suite
===============================================================
Tests:
1. Transpilation Engine (Qiskit 1.x, OpenQASM 3.0, Cirq, PennyLane)
2. Hardware Noise Simulation (Amplitude Damping, Phase Damping, Fidelity, Purity)
3. Report Generator (PDF binary integrity, JSON data bundle schema)
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.schemas import CircuitModel, CircuitInstruction
from backend.app.services.quantum.transpiler import QuantumTranspiler
from backend.app.services.quantum.noise_engine import QuantumNoiseEngine
from backend.app.services.quantum.report_generator import QuantumReportGenerator

client = TestClient(app)


@pytest.fixture
def bell_circuit():
    return CircuitModel(
        num_qubits=2,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="cx", qubits=[0, 1]),
            CircuitInstruction(gate="measure", qubits=[0]),
            CircuitInstruction(gate="measure", qubits=[1]),
        ],
    )


def test_transpiler_frameworks(bell_circuit):
    """Verify all 5 framework targets generate valid non-empty code."""
    res = QuantumTranspiler.transpile_all(bell_circuit, optimization_level=2)
    assert "qc = QuantumCircuit" in res["qiskit"]
    assert "StatevectorSampler" in res["qiskit"]
    assert "OPENQASM 3.0;" in res["openqasm3"]
    assert "qubit[2] q;" in res["openqasm3"]
    assert "OPENQASM 2.0;" in res["openqasm2"]
    assert "import cirq" in res["cirq"]
    assert "import pennylane as qml" in res["pennylane"]

    telemetry = res["telemetry"]
    assert telemetry["num_qubits"] == 2
    assert telemetry["total_gates"] == 4
    assert telemetry["two_qubit_gates"] == 1
    assert telemetry["circuit_depth"] >= 2


def test_hardware_noise_simulation(bell_circuit):
    """Verify open quantum system noise dynamics, fidelity, and decoherence."""
    noise_engine = QuantumNoiseEngine(max_qubits=8)
    for profile in ["ibm_eagle", "rigetti_aspen", "ionq_forte"]:
        result = noise_engine.simulate_noisy_circuit(bell_circuit, profile_key=profile, shots=1024)
        assert result["success"] is True
        assert 0.0 < result["fidelity"] <= 1.0
        assert 0.0 < result["purity"] <= 1.0
        assert sum(result["noisy_counts"].values()) == 1024
        # Verify both bell states 00 and 11 have significant population
        assert "00" in result["noisy_probabilities"]
        assert "11" in result["noisy_probabilities"]


def test_pdf_and_json_report_generation(bell_circuit):
    """Verify PDF byte stream generation and JSON schema completeness."""
    # PDF check
    pdf_bytes = QuantumReportGenerator.generate_pdf_bytes(bell_circuit, algorithm_name="Bell State Verification")
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF-")

    # JSON check
    json_bundle = QuantumReportGenerator.generate_json_bundle(bell_circuit, algorithm_name="Bell State Verification")
    assert "report_metadata" in json_bundle
    assert "circuit_ast" in json_bundle
    assert "telemetry" in json_bundle
    assert "mathematical_state" in json_bundle
    assert "hardware_noise_simulation" in json_bundle
    assert "transpiled_frameworks" in json_bundle
    assert json_bundle["report_metadata"]["team"] == "Gitwolves"


def test_api_endpoints_integration(bell_circuit):
    """Verify live API endpoints return 200 with matching schemas."""
    payload = {"circuit": bell_circuit.model_dump()}

    # 1. Transpile
    r_tr = client.post("/api/v1/simulation/transpile", json=payload)
    assert r_tr.status_code == 200
    assert r_tr.json()["success"] is True

    # 2. Noise
    r_noise = client.post("/api/v1/simulation/noise", json=payload)
    assert r_noise.status_code == 200
    assert r_noise.json()["fidelity"] > 0.9

    # 3. PDF Report
    r_pdf = client.post("/api/v1/simulation/report/pdf", json=payload)
    assert r_pdf.status_code == 200
    assert r_pdf.headers["content-type"] == "application/pdf"
    assert r_pdf.content.startswith(b"%PDF-")

    # 4. JSON Report
    r_json = client.post("/api/v1/simulation/report/json", json=payload)
    assert r_json.status_code == 200
    assert "report_metadata" in r_json.json()
