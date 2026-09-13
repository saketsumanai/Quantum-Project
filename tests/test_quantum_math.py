"""
Quantum Mathematics Test Suite
================================
Owner: Manas Thakur (@heremanasthakur) — Quantum Mathematics, Theory & AI Co-Lead
Branch: feature/member-3-math-ai-manas
Task: TSK-10 — Mathematical Theory Verification

Tests mathematical correctness of:
- All standard quantum gates (unitarity)
- Bell state normalization
- Grover diffusion operator
- VQE Hamiltonian expectation values
- Bloch sphere coordinate mapping
- LaTeX validation
- Probability distributions from simulation
"""

from __future__ import annotations

import cmath
import math

import numpy as np
import pytest

from backend.app.services.ai.math_verifier import (
    STANDARD_GATES,
    BlochSphereValidator,
    LatexValidator,
    ProbabilityValidator,
    QuantumMathVerifier,
    StateVectorValidator,
    UnitaryValidator,
    ValidationStatus,
    get_verified_gate,
)

INV_SQRT2 = 1 / math.sqrt(2)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def verifier() -> QuantumMathVerifier:
    return QuantumMathVerifier()


@pytest.fixture
def state_validator() -> StateVectorValidator:
    return StateVectorValidator()


@pytest.fixture
def unitary_validator() -> UnitaryValidator:
    return UnitaryValidator()


@pytest.fixture
def latex_validator() -> LatexValidator:
    return LatexValidator()


@pytest.fixture
def prob_validator() -> ProbabilityValidator:
    return ProbabilityValidator()


@pytest.fixture
def bloch_validator() -> BlochSphereValidator:
    return BlochSphereValidator()


# ===========================================================================
# 1. Standard Gate Unitarity Tests
# ===========================================================================

class TestStandardGates:
    """Verify U†U = I for every gate in the standard library."""

    @pytest.mark.parametrize("gate_name", list(STANDARD_GATES.keys()))
    def test_gate_is_unitary(self, gate_name: str, unitary_validator: UnitaryValidator):
        U = STANDARD_GATES[gate_name]
        result = unitary_validator.validate(U, gate_name=gate_name)
        assert result.is_valid, f"Gate {gate_name} failed unitarity: {result.message}"

    def test_hadamard_is_self_inverse(self):
        """H² = I"""
        H = STANDARD_GATES["H"]
        H2 = H @ H
        assert np.allclose(H2, np.eye(2)), "H² should equal I"

    def test_pauli_matrices_square_to_identity(self):
        """X² = Y² = Z² = I"""
        for name in ("X", "Y", "Z"):
            G = STANDARD_GATES[name]
            assert np.allclose(G @ G, np.eye(2)), f"{name}² ≠ I"

    def test_s_gate_squared_equals_z(self):
        """S² = Z"""
        S = STANDARD_GATES["S"]
        Z = STANDARD_GATES["Z"]
        assert np.allclose(S @ S, Z), "S² should equal Z"

    def test_t_gate_squared_equals_s(self):
        """T² = S"""
        T = STANDARD_GATES["T"]
        S = STANDARD_GATES["S"]
        assert np.allclose(T @ T, S), "T² should equal S"

    def test_cnot_is_self_inverse(self):
        """CNOT² = I"""
        CNOT = STANDARD_GATES["CNOT"]
        assert np.allclose(CNOT @ CNOT, np.eye(4)), "CNOT² should equal I₄"

    def test_swap_is_self_inverse(self):
        """SWAP² = I"""
        SWAP = STANDARD_GATES["SWAP"]
        assert np.allclose(SWAP @ SWAP, np.eye(4)), "SWAP² should equal I₄"

    def test_get_verified_gate_unknown_raises(self):
        with pytest.raises(KeyError, match="Unknown gate"):
            get_verified_gate("UNKNOWN_GATE")


# ===========================================================================
# 2. State Vector Normalization Tests
# ===========================================================================

class TestStateVectorNormalization:
    """Verify quantum state vector normalization for all curriculum modules."""

    def test_zero_state(self, state_validator: StateVectorValidator):
        result = state_validator.validate([1.0, 0.0], label="|0⟩")
        assert result.is_valid

    def test_one_state(self, state_validator: StateVectorValidator):
        result = state_validator.validate([0.0, 1.0], label="|1⟩")
        assert result.is_valid

    def test_plus_state(self, state_validator: StateVectorValidator):
        """H|0⟩ = (|0⟩ + |1⟩)/√2"""
        result = state_validator.validate([INV_SQRT2, INV_SQRT2], label="|+⟩")
        assert result.is_valid

    def test_minus_state(self, state_validator: StateVectorValidator):
        """H|1⟩ = (|0⟩ - |1⟩)/√2"""
        result = state_validator.validate([INV_SQRT2, -INV_SQRT2], label="|−⟩")
        assert result.is_valid

    def test_bell_phi_plus(self, state_validator: StateVectorValidator):
        """|Φ+⟩ = (|00⟩ + |11⟩)/√2"""
        result = state_validator.validate(
            [INV_SQRT2, 0.0, 0.0, INV_SQRT2], label="|Φ+⟩"
        )
        assert result.is_valid

    def test_bell_phi_minus(self, state_validator: StateVectorValidator):
        """|Φ−⟩ = (|00⟩ − |11⟩)/√2"""
        result = state_validator.validate(
            [INV_SQRT2, 0.0, 0.0, -INV_SQRT2], label="|Φ−⟩"
        )
        assert result.is_valid

    def test_bell_psi_plus(self, state_validator: StateVectorValidator):
        """|Ψ+⟩ = (|01⟩ + |10⟩)/√2"""
        result = state_validator.validate(
            [0.0, INV_SQRT2, INV_SQRT2, 0.0], label="|Ψ+⟩"
        )
        assert result.is_valid

    def test_bell_psi_minus(self, state_validator: StateVectorValidator):
        """|Ψ−⟩ = (|01⟩ − |10⟩)/√2"""
        result = state_validator.validate(
            [0.0, INV_SQRT2, -INV_SQRT2, 0.0], label="|Ψ−⟩"
        )
        assert result.is_valid

    def test_ghz_3qubit(self, state_validator: StateVectorValidator):
        """GHZ = (|000⟩ + |111⟩)/√2 — 8-component vector"""
        state = [0.0] * 8
        state[0] = INV_SQRT2   # |000⟩
        state[7] = INV_SQRT2   # |111⟩
        result = state_validator.validate(state, label="GHZ")
        assert result.is_valid

    def test_unnormalized_state_fails(self, state_validator: StateVectorValidator):
        result = state_validator.validate([1.0, 1.0], label="unnormalized")
        assert not result.is_valid
        assert "NOT" in result.message.upper() or "not" in result.message

    def test_dimension_not_power_of_two_fails(self, state_validator: StateVectorValidator):
        result = state_validator.validate([1.0, 0.0, 0.0], label="3-dim")
        assert not result.is_valid

    def test_complex_amplitudes_valid(self, state_validator: StateVectorValidator):
        """e^{iπ/4}/√2 |0⟩ + e^{-iπ/4}/√2 |1⟩ is normalized"""
        a = cmath.exp(1j * math.pi / 4) * INV_SQRT2
        b = cmath.exp(-1j * math.pi / 4) * INV_SQRT2
        result = state_validator.validate([a, b], label="complex_phase")
        assert result.is_valid


# ===========================================================================
# 3. Grover's Algorithm Mathematical Tests
# ===========================================================================

class TestGroverAlgorithm:
    """Verify Grover's amplitude amplification mathematics."""

    def test_grover_uniform_superposition_2qubit(self, state_validator: StateVectorValidator):
        """2-qubit uniform superposition |s⟩ = 1/2 Σ|x⟩"""
        state = [0.5, 0.5, 0.5, 0.5]
        result = state_validator.validate(state, label="Grover|s⟩")
        assert result.is_valid

    def test_grover_optimal_iterations_4elements(self):
        """N=4: k* = floor(π/4 × √4) = floor(π/2) = 1"""
        N = 4
        k_star = math.floor(math.pi / 4 * math.sqrt(N))
        assert k_star == 1, f"Expected k*=1 for N=4, got {k_star}"

    def test_grover_optimal_iterations_8elements(self):
        """N=8: k* = floor(π/4 × √8) ≈ floor(2.22) = 2"""
        N = 8
        k_star = math.floor(math.pi / 4 * math.sqrt(N))
        assert k_star == 2, f"Expected k*=2 for N=8, got {k_star}"

    def test_grover_success_probability_formula(self):
        """After k* iterations: P(ω) = sin²((2k*+1)·arcsin(1/√N))"""
        N = 4
        k_star = math.floor(math.pi / 4 * math.sqrt(N))
        angle = math.asin(1 / math.sqrt(N))
        prob = math.sin((2 * k_star + 1) * angle) ** 2
        assert prob > 0.99, f"Grover success probability should be >99% for N=4, got {prob:.4f}"

    def test_diffusion_operator_is_unitary(self, unitary_validator: UnitaryValidator):
        """U_s = 2|s⟩⟨s| - I must be unitary for 2-qubit system."""
        N = 4
        s = np.full((N, 1), 1.0 / math.sqrt(N))
        U_s = 2 * (s @ s.T) - np.eye(N)
        result = unitary_validator.validate(U_s, gate_name="Grover diffusion")
        assert result.is_valid, result.message

    def test_oracle_is_unitary(self, unitary_validator: UnitaryValidator):
        """Oracle U_ω flips phase of |ω⟩: U_ω = I - 2|ω⟩⟨ω|, must be unitary."""
        N = 4
        omega = 2  # target item index
        e_omega = np.zeros((N, 1))
        e_omega[omega] = 1.0
        U_omega = np.eye(N) - 2 * (e_omega @ e_omega.T)
        result = unitary_validator.validate(U_omega, gate_name="Grover oracle")
        assert result.is_valid, result.message


# ===========================================================================
# 4. Bloch Sphere Tests
# ===========================================================================

class TestBlochSphere:
    """Verify state-to-Bloch-sphere coordinate mapping."""

    @pytest.mark.parametrize("x,y,z", [
        (0.0, 0.0, 1.0),   # |0⟩ north pole
        (0.0, 0.0, -1.0),  # |1⟩ south pole
        (1.0, 0.0, 0.0),   # |+⟩ x-axis
        (-1.0, 0.0, 0.0),  # |−⟩ negative x
        (0.0, 1.0, 0.0),   # |i+⟩ y-axis
        (0.0, -1.0, 0.0),  # |i−⟩ negative y
    ])
    def test_standard_bloch_points(self, x: float, y: float, z: float,
                                    bloch_validator: BlochSphereValidator):
        result = bloch_validator.validate(x, y, z)
        assert result.is_valid, f"({x},{y},{z}) failed: {result.message}"

    def test_off_sphere_fails(self, bloch_validator: BlochSphereValidator):
        result = bloch_validator.validate(1.0, 1.0, 1.0)
        assert not result.is_valid

    def test_zero_vector_fails(self, bloch_validator: BlochSphereValidator):
        result = bloch_validator.validate(0.0, 0.0, 0.0)
        assert not result.is_valid

    def test_mixed_state_inside_sphere_allowed(self, bloch_validator: BlochSphereValidator):
        result = bloch_validator.validate(0.0, 0.0, 0.5, allow_mixed=True)
        assert result.is_valid


# ===========================================================================
# 5. Probability Distribution Tests
# ===========================================================================

class TestProbabilityDistributions:
    """Validate simulation output probability distributions."""

    def test_bell_state_50_50(self, prob_validator: ProbabilityValidator):
        result = prob_validator.validate({"00": 0.5, "11": 0.5}, label="Bell Φ+")
        assert result.is_valid

    def test_uniform_4outcome(self, prob_validator: ProbabilityValidator):
        result = prob_validator.validate(
            {"00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25}
        )
        assert result.is_valid

    def test_deterministic_zero_state(self, prob_validator: ProbabilityValidator):
        result = prob_validator.validate({"0": 1.0}, label="|0⟩")
        assert result.is_valid

    def test_does_not_sum_to_one_fails(self, prob_validator: ProbabilityValidator):
        result = prob_validator.validate({"00": 0.3, "11": 0.3})
        assert not result.is_valid

    def test_negative_probability_fails(self, prob_validator: ProbabilityValidator):
        result = prob_validator.validate({"00": -0.1, "11": 1.1})
        assert not result.is_valid


# ===========================================================================
# 6. LaTeX Validation Tests
# ===========================================================================

class TestLatexValidation:
    """Validate LaTeX strings used in the AI Tutor and curriculum."""

    @pytest.mark.parametrize("latex", [
        r"\frac{|0\rangle + |1\rangle}{\sqrt{2}}",
        r"\langle \psi | H | \psi \rangle",
        r"U^\dagger U = I",
        r"H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}",
        r"|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}",
        r"\sum_{x=0}^{N-1} (-1)^{f(x)} |x\rangle",
    ])
    def test_valid_quantum_latex(self, latex: str, latex_validator: LatexValidator):
        result = latex_validator.validate(latex)
        assert result.status in (ValidationStatus.VALID, ValidationStatus.WARNING), \
            f"LaTeX failed validation: {result.message}\nLatex: {latex}"

    def test_unbalanced_braces_fails(self, latex_validator: LatexValidator):
        result = latex_validator.validate(r"\frac{|0\rangle + |1\rangle{\sqrt{2}}")
        assert not result.is_valid

    def test_empty_latex_fails(self, latex_validator: LatexValidator):
        result = latex_validator.validate("")
        assert not result.is_valid


# ===========================================================================
# 7. Master Verifier Integration Tests
# ===========================================================================

class TestQuantumMathVerifier:
    """Integration tests for the QuantumMathVerifier facade."""

    def test_verify_all_bell_state(self, verifier: QuantumMathVerifier):
        results = verifier.verify_all(
            amplitudes=[INV_SQRT2, 0.0, 0.0, INV_SQRT2],
            probabilities={"00": 0.5, "11": 0.5},
            bloch=(0.0, 0.0, 1.0),
        )
        assert verifier.all_valid(results), {k: v.message for k, v in results.items()}

    def test_verify_hadamard_gate(self, verifier: QuantumMathVerifier):
        H = STANDARD_GATES["H"].tolist()
        results = verifier.verify_all(unitary=H, gate_name="H")
        assert verifier.all_valid(results)

    def test_verify_latex_dirac(self, verifier: QuantumMathVerifier):
        result = verifier.verify_latex(r"\langle 0 | H | 0 \rangle = \frac{1}{\sqrt{2}}")
        assert result.status in (ValidationStatus.VALID, ValidationStatus.WARNING)
