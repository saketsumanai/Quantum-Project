import math
import pytest
from backend.app.models.schemas import CircuitModel, CircuitInstruction
from backend.app.services.quantum.engine import QuantumSimulationEngine
from backend.app.services.quantum.sandbox import validate_python_quantum_code

@pytest.fixture
def engine():
    return QuantumSimulationEngine(max_qubits=16)

def test_hadamard_superposition(engine):
    circuit = CircuitModel(
        num_qubits=1,
        instructions=[CircuitInstruction(gate="h", qubits=[0])]
    )
    state, bloch = engine.simulate_statevector(circuit)
    # State should be [1/sqrt(2), 1/sqrt(2)]
    expected_amp = 1.0 / math.sqrt(2.0)
    assert abs(state[0].real - expected_amp) < 1e-5
    assert abs(state[1].real - expected_amp) < 1e-5

    # Bloch coords for |+> should point along +X axis (theta = pi/2, phi = 0)
    assert abs(bloch[0].x - 1.0) < 1e-5
    assert abs(bloch[0].y - 0.0) < 1e-5
    assert abs(bloch[0].z - 0.0) < 1e-5
    assert abs(bloch[0].theta_rad - math.pi / 2.0) < 1e-5

def test_bell_state_generation(engine):
    circuit = CircuitModel(
        num_qubits=2,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="cx", qubits=[0, 1])
        ]
    )
    state, _ = engine.simulate_statevector(circuit)
    expected_amp = 1.0 / math.sqrt(2.0)
    # |00> is index 0, |11> is index 3
    assert abs(state[0].real - expected_amp) < 1e-5
    assert abs(state[1].real) < 1e-5
    assert abs(state[2].real) < 1e-5
    assert abs(state[3].real - expected_amp) < 1e-5

    sim_res = engine.run_simulation(circuit, shots=2000)
    assert sim_res.success is True
    # Only 00 and 11 should have non-zero counts
    for outcome in sim_res.counts:
        assert outcome in ["00", "11"]
        assert sim_res.probabilities[outcome] > 0.40

def test_pauli_x_gate(engine):
    circuit = CircuitModel(
        num_qubits=1,
        instructions=[CircuitInstruction(gate="x", qubits=[0])]
    )
    state, bloch = engine.simulate_statevector(circuit)
    assert abs(state[0]) < 1e-5
    assert abs(state[1] - 1.0) < 1e-5
    # Points down on Bloch sphere (Z = -1, theta = pi)
    assert abs(bloch[0].z - (-1.0)) < 1e-5
    assert abs(bloch[0].theta_rad - math.pi) < 1e-5

def test_grover_search_amplification(engine):
    # 2-qubit Grover searching for |11>
    circuit = CircuitModel(
        num_qubits=2,
        instructions=[
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            # Oracle for |11>
            CircuitInstruction(gate="cz", qubits=[0, 1]),
            # Diffusion
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
            CircuitInstruction(gate="x", qubits=[0]),
            CircuitInstruction(gate="x", qubits=[1]),
            CircuitInstruction(gate="cz", qubits=[0, 1]),
            CircuitInstruction(gate="x", qubits=[0]),
            CircuitInstruction(gate="x", qubits=[1]),
            CircuitInstruction(gate="h", qubits=[0]),
            CircuitInstruction(gate="h", qubits=[1]),
        ]
    )
    state, _ = engine.simulate_statevector(circuit)
    # Target state |11> should have amplitude magnitude 1.0 (100% probability)
    assert abs(abs(state[3]) - 1.0) < 1e-5
    assert abs(state[0]) < 1e-5

def test_security_sandbox():
    safe_code = """
import numpy as np
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
"""
    is_safe, violations = validate_python_quantum_code(safe_code)
    assert is_safe is True
    assert len(violations) == 0

    dangerous_code = """
import os
os.system('rm -rf /')
"""
    is_safe, violations = validate_python_quantum_code(dangerous_code)
    assert is_safe is False
    assert any("os" in v for v in violations)
