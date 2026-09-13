"""
Quantum Mathematics Verification Service
=========================================
Owner: Manas Thakur (@heremanasthakur) — Quantum Mathematics, Theory & AI Co-Lead
Branch: feature/member-3-math-ai-manas
Task: TSK-10 — Mathematical Theory & Dirac Formalism Modeling

Validates AI-generated quantum mathematical content before it is emitted to the
frontend. Ensures LaTeX equations are syntactically well-formed, state vectors
satisfy normalization, unitary matrices pass U†U = I checks, and probability
distributions sum to 1.0 within floating-point tolerance.
"""

from __future__ import annotations

import cmath
import math
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

import numpy as np


# ---------------------------------------------------------------------------
# Result Types
# ---------------------------------------------------------------------------

class ValidationStatus(str, Enum):
    VALID = "valid"
    INVALID = "invalid"
    WARNING = "warning"


@dataclass
class ValidationResult:
    status: ValidationStatus
    message: str
    details: dict = field(default_factory=dict)

    @property
    def is_valid(self) -> bool:
        return self.status == ValidationStatus.VALID


# ---------------------------------------------------------------------------
# LaTeX Validator
# ---------------------------------------------------------------------------

class LatexValidator:
    """
    Validates LaTeX strings produced by the AI tutor for syntactic correctness
    against the subset of LaTeX used in quantum computing notation.
    """

    # Balanced delimiter patterns
    BALANCED_PAIRS = {"{": "}", "(": ")", "[": "]"}

    # Quantum-specific required commands
    QUANTUM_COMMANDS = frozenset([
        r"\ket", r"\bra", r"\braket", r"\langle", r"\rangle",
        r"\otimes", r"\oplus", r"\dagger", r"\psi", r"\phi",
        r"\alpha", r"\beta", r"\theta", r"\omega", r"\lambda",
        r"\frac", r"\sqrt", r"\sum", r"\prod", r"\int",
        r"\begin", r"\end", r"\left", r"\right",
    ])

    # Forbidden patterns indicating incomplete or broken LaTeX
    FORBIDDEN_PATTERNS = [
        r"\$\$\s*\$\$",           # empty display math
        r"\\[a-z]+\s*\n",         # command at line end without argument
        r"\^\{[^}]{50,}\}",       # suspiciously long superscript
    ]

    def validate(self, latex: str) -> ValidationResult:
        if not latex or not latex.strip():
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message="Empty LaTeX string.",
            )

        # Check delimiter balance
        balance_result = self._check_balance(latex)
        if not balance_result.is_valid:
            return balance_result

        # Check for forbidden patterns
        for pattern in self.FORBIDDEN_PATTERNS:
            if re.search(pattern, latex):
                return ValidationResult(
                    status=ValidationStatus.WARNING,
                    message=f"Suspicious LaTeX pattern detected: '{pattern}'",
                    details={"pattern": pattern},
                )

        return ValidationResult(
            status=ValidationStatus.VALID,
            message="LaTeX syntax appears well-formed.",
        )

    def _check_balance(self, latex: str) -> ValidationResult:
        """Verify curly braces and parentheses are balanced."""
        stack: list[str] = []
        for i, ch in enumerate(latex):
            if ch in self.BALANCED_PAIRS:
                stack.append(self.BALANCED_PAIRS[ch])
            elif ch in self.BALANCED_PAIRS.values():
                if not stack or stack[-1] != ch:
                    return ValidationResult(
                        status=ValidationStatus.INVALID,
                        message=f"Unbalanced delimiter '{ch}' at position {i}.",
                        details={"position": i, "character": ch},
                    )
                stack.pop()
        if stack:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=f"Unclosed delimiters remaining: {stack}",
                details={"unclosed": stack},
            )
        return ValidationResult(status=ValidationStatus.VALID, message="Balanced.")


# ---------------------------------------------------------------------------
# State Vector Validator
# ---------------------------------------------------------------------------

class StateVectorValidator:
    """
    Validates quantum state vectors for normalization:
        ∑|αᵢ|² = 1  within tolerance.

    Also verifies that the dimension is a power of 2 (valid qubit system).
    """

    NORM_TOLERANCE: float = 1e-6

    def validate(
        self,
        amplitudes: list[complex] | list[float],
        label: str = "state",
    ) -> ValidationResult:
        if not amplitudes:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message="Empty state vector.",
            )

        dim = len(amplitudes)
        if not self._is_power_of_two(dim):
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=f"State vector dimension {dim} is not a power of 2.",
                details={"dimension": dim},
            )

        norm_sq = sum(abs(a) ** 2 for a in amplitudes)
        error = abs(norm_sq - 1.0)

        if error > self.NORM_TOLERANCE:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=(
                    f"State vector '{label}' is not normalized: "
                    f"‖ψ‖² = {norm_sq:.8f}, expected 1.0 (error = {error:.2e})"
                ),
                details={
                    "norm_squared": norm_sq,
                    "error": error,
                    "tolerance": self.NORM_TOLERANCE,
                },
            )

        n_qubits = int(math.log2(dim))
        return ValidationResult(
            status=ValidationStatus.VALID,
            message=f"State vector '{label}' is normalized (‖ψ‖² = {norm_sq:.10f}).",
            details={"n_qubits": n_qubits, "dimension": dim, "norm_squared": norm_sq},
        )

    @staticmethod
    def _is_power_of_two(n: int) -> bool:
        return n > 0 and (n & (n - 1)) == 0


# ---------------------------------------------------------------------------
# Unitary Matrix Validator
# ---------------------------------------------------------------------------

class UnitaryValidator:
    """
    Validates that a matrix U satisfies the unitary condition: U†U = I.
    Tolerance is configurable (default 1e-6).
    """

    def __init__(self, tolerance: float = 1e-6) -> None:
        self.tolerance = tolerance

    def validate(
        self,
        matrix: list[list[complex]] | np.ndarray,
        gate_name: str = "gate",
    ) -> ValidationResult:
        U = np.array(matrix, dtype=complex)
        rows, cols = U.shape

        if rows != cols:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=f"Matrix '{gate_name}' is not square: shape {U.shape}.",
                details={"shape": list(U.shape)},
            )

        if not self._is_power_of_two(rows):
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=f"Matrix '{gate_name}' dimension {rows} is not a power of 2.",
            )

        UdagU = U.conj().T @ U
        identity = np.eye(rows, dtype=complex)
        max_error = float(np.max(np.abs(UdagU - identity)))

        if max_error > self.tolerance:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=(
                    f"Matrix '{gate_name}' is NOT unitary: "
                    f"max |U†U - I| = {max_error:.4e} > tolerance {self.tolerance:.0e}"
                ),
                details={"max_error": max_error, "tolerance": self.tolerance},
            )

        return ValidationResult(
            status=ValidationStatus.VALID,
            message=f"Matrix '{gate_name}' is unitary (max |U†U - I| = {max_error:.2e}).",
            details={"max_error": max_error, "dimension": rows},
        )

    @staticmethod
    def _is_power_of_two(n: int) -> bool:
        return n > 0 and (n & (n - 1)) == 0


# ---------------------------------------------------------------------------
# Probability Distribution Validator
# ---------------------------------------------------------------------------

class ProbabilityValidator:
    """
    Validates that a probability distribution over measurement outcomes sums to 1.
    Each probability must be in [0, 1].
    """

    SUM_TOLERANCE: float = 1e-4

    def validate(
        self,
        distribution: dict[str, float],
        label: str = "distribution",
    ) -> ValidationResult:
        if not distribution:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message="Empty probability distribution.",
            )

        negative = {k: v for k, v in distribution.items() if v < 0}
        if negative:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=f"Negative probabilities in '{label}': {negative}",
                details={"negative_keys": negative},
            )

        over_one = {k: v for k, v in distribution.items() if v > 1 + self.SUM_TOLERANCE}
        if over_one:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=f"Probabilities > 1.0 in '{label}': {over_one}",
                details={"over_one_keys": over_one},
            )

        total = sum(distribution.values())
        error = abs(total - 1.0)

        if error > self.SUM_TOLERANCE:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=(
                    f"Probability distribution '{label}' does not sum to 1.0: "
                    f"sum = {total:.6f} (error = {error:.2e})"
                ),
                details={"total": total, "error": error},
            )

        return ValidationResult(
            status=ValidationStatus.VALID,
            message=f"Distribution '{label}' is valid (sum = {total:.8f}).",
            details={"total": total, "n_outcomes": len(distribution)},
        )


# ---------------------------------------------------------------------------
# Bloch Sphere Coordinate Validator
# ---------------------------------------------------------------------------

class BlochSphereValidator:
    """
    Validates that Bloch sphere coordinates (x, y, z) lie on the unit sphere:
        x² + y² + z² = 1  (pure state) or ≤ 1 (mixed state).
    """

    TOLERANCE: float = 1e-5

    def validate(
        self,
        x: float,
        y: float,
        z: float,
        allow_mixed: bool = False,
    ) -> ValidationResult:
        r_sq = x**2 + y**2 + z**2

        if allow_mixed:
            if r_sq > 1.0 + self.TOLERANCE:
                return ValidationResult(
                    status=ValidationStatus.INVALID,
                    message=f"Bloch vector outside unit sphere: r² = {r_sq:.6f} > 1.",
                    details={"r_squared": r_sq, "x": x, "y": y, "z": z},
                )
            return ValidationResult(
                status=ValidationStatus.VALID,
                message=f"Bloch vector is inside the unit sphere (r² = {r_sq:.6f}).",
            )

        error = abs(r_sq - 1.0)
        if error > self.TOLERANCE:
            return ValidationResult(
                status=ValidationStatus.INVALID,
                message=(
                    f"Bloch vector does not lie on unit sphere: "
                    f"r² = {r_sq:.6f}, expected 1.0 (error = {error:.2e})"
                ),
                details={"r_squared": r_sq, "error": error, "x": x, "y": y, "z": z},
            )

        theta = math.acos(max(-1.0, min(1.0, z)))
        phi = math.atan2(y, x)
        return ValidationResult(
            status=ValidationStatus.VALID,
            message=f"Valid pure-state Bloch vector (θ={math.degrees(theta):.2f}°, φ={math.degrees(phi):.2f}°).",
            details={"theta_rad": theta, "phi_rad": phi, "r_squared": r_sq},
        )


# ---------------------------------------------------------------------------
# Master Math Verifier (Facade)
# ---------------------------------------------------------------------------

class QuantumMathVerifier:
    """
    Facade combining all validators. Called by the AI Tutor service before
    emitting any mathematical content to the frontend.

    Usage::

        verifier = QuantumMathVerifier()

        # Check a state vector
        result = verifier.verify_state_vector([1/√2, 1/√2])

        # Check a gate matrix
        result = verifier.verify_unitary(hadamard_matrix, gate_name="H")

        # Check AI-generated LaTeX
        result = verifier.verify_latex(r"\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}")

        # Check simulation output probabilities
        result = verifier.verify_probabilities({"00": 0.5, "11": 0.5})

        # Check Bloch sphere coordinates
        result = verifier.verify_bloch(x=0.0, y=0.0, z=1.0)
    """

    def __init__(self, unitary_tolerance: float = 1e-6) -> None:
        self._latex = LatexValidator()
        self._state = StateVectorValidator()
        self._unitary = UnitaryValidator(tolerance=unitary_tolerance)
        self._prob = ProbabilityValidator()
        self._bloch = BlochSphereValidator()

    def verify_latex(self, latex: str) -> ValidationResult:
        return self._latex.validate(latex)

    def verify_state_vector(
        self,
        amplitudes: list[complex] | list[float],
        label: str = "ψ",
    ) -> ValidationResult:
        return self._state.validate(amplitudes, label=label)

    def verify_unitary(
        self,
        matrix: list[list[complex]] | np.ndarray,
        gate_name: str = "gate",
    ) -> ValidationResult:
        return self._unitary.validate(matrix, gate_name=gate_name)

    def verify_probabilities(
        self,
        distribution: dict[str, float],
        label: str = "simulation",
    ) -> ValidationResult:
        return self._prob.validate(distribution, label=label)

    def verify_bloch(
        self,
        x: float,
        y: float,
        z: float,
        allow_mixed: bool = False,
    ) -> ValidationResult:
        return self._bloch.validate(x, y, z, allow_mixed=allow_mixed)

    def verify_all(
        self,
        *,
        latex: Optional[str] = None,
        amplitudes: Optional[list[complex]] = None,
        unitary: Optional[list[list[complex]]] = None,
        gate_name: str = "gate",
        probabilities: Optional[dict[str, float]] = None,
        bloch: Optional[tuple[float, float, float]] = None,
    ) -> dict[str, ValidationResult]:
        """Run all applicable validators and return a results dict."""
        results: dict[str, ValidationResult] = {}

        if latex is not None:
            results["latex"] = self.verify_latex(latex)
        if amplitudes is not None:
            results["state_vector"] = self.verify_state_vector(amplitudes)
        if unitary is not None:
            results["unitary"] = self.verify_unitary(unitary, gate_name=gate_name)
        if probabilities is not None:
            results["probabilities"] = self.verify_probabilities(probabilities)
        if bloch is not None:
            results["bloch"] = self.verify_bloch(*bloch)

        return results

    def all_valid(self, results: dict[str, ValidationResult]) -> bool:
        """Returns True only if every result in the dict is VALID."""
        return all(r.is_valid for r in results.values())


# ---------------------------------------------------------------------------
# Pre-validated Standard Gate Library (Manas's verified constants)
# ---------------------------------------------------------------------------

INV_SQRT2 = 1 / math.sqrt(2)

STANDARD_GATES: dict[str, np.ndarray] = {
    "I": np.eye(2, dtype=complex),
    "X": np.array([[0, 1], [1, 0]], dtype=complex),
    "Y": np.array([[0, -1j], [1j, 0]], dtype=complex),
    "Z": np.array([[1, 0], [0, -1]], dtype=complex),
    "H": np.array([[INV_SQRT2, INV_SQRT2], [INV_SQRT2, -INV_SQRT2]], dtype=complex),
    "S": np.array([[1, 0], [0, 1j]], dtype=complex),
    "T": np.array([[1, 0], [0, cmath.exp(1j * math.pi / 4)]], dtype=complex),
    "CNOT": np.array(
        [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], dtype=complex
    ),
    "CZ": np.array(
        [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]], dtype=complex
    ),
    "SWAP": np.array(
        [[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]], dtype=complex
    ),
}


def get_verified_gate(name: str) -> np.ndarray:
    """Return a pre-validated standard gate matrix by name."""
    if name not in STANDARD_GATES:
        raise KeyError(
            f"Unknown gate '{name}'. Available: {list(STANDARD_GATES.keys())}"
        )
    return STANDARD_GATES[name].copy()
