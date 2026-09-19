"""
Quantum Leap — Realistic NISQ Hardware Noise Simulation Engine
==============================================================
Simulates open quantum system dynamics on NISQ hardware architectures
using density matrix evolution and Kraus operators:

1. Amplitude Damping (T1 energy relaxation towards |0>)
2. Phase Damping (T2 dephasing decoherence)
3. Depolarizing Channel (White noise on 1Q and 2Q gates)
4. Readout Error (Measurement confusion matrix)
5. Quantum State Fidelity F(rho_ideal, rho_noisy) and Purity Tr(rho^2)

Profiles:
- IBM Eagle 127-Qubit (Superconducting Transmon)
- Rigetti Aspen-M3 (Superconducting)
- IonQ Forte (Trapped Ion)
- Custom User Configuration
"""

import math
import time
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from backend.app.models.schemas import CircuitModel, CircuitInstruction


# Standard Pauli Matrices
PAULI_I = np.eye(2, dtype=complex)
PAULI_X = np.array([[0.0, 1.0], [1.0, 0.0]], dtype=complex)
PAULI_Y = np.array([[0.0, -1.0j], [1.0j, 0.0]], dtype=complex)
PAULI_Z = np.array([[1.0, 0.0], [0.0, -1.0]], dtype=complex)


# Predefined Industry NISQ Hardware Profiles
HARDWARE_NOISE_PROFILES = {
    "ibm_eagle": {
        "name": "IBM Eagle (127-Qubit Transmon)",
        "technology": "Superconducting Transmon",
        "t1_us": 120.0,
        "t2_us": 90.0,
        "gate_1q_time_ns": 35.0,
        "gate_2q_time_ns": 300.0,
        "gate_1q_error": 0.0003,
        "gate_2q_error": 0.0080,
        "readout_error": 0.018,
    },
    "rigetti_aspen": {
        "name": "Rigetti Aspen-M3",
        "technology": "Superconducting",
        "t1_us": 30.0,
        "t2_us": 25.0,
        "gate_1q_time_ns": 40.0,
        "gate_2q_time_ns": 200.0,
        "gate_1q_error": 0.0015,
        "gate_2q_error": 0.0190,
        "readout_error": 0.042,
    },
    "ionq_forte": {
        "name": "IonQ Forte (Trapped Ion)",
        "technology": "Trapped Ytterbium/Barium Ion",
        "t1_us": 10000.0,
        "t2_us": 1000.0,
        "gate_1q_time_ns": 10000.0,
        "gate_2q_time_ns": 200000.0,
        "gate_1q_error": 0.0005,
        "gate_2q_error": 0.0035,
        "readout_error": 0.003,
    },
}


class QuantumNoiseEngine:
    """Density matrix open quantum system simulator with physical decoherence channels."""

    def __init__(self, max_qubits: int = 8):
        # Full density matrix simulation scales as 4^n; cap at 8 qubits for real-time interactivity
        self.max_qubits = max_qubits

    @staticmethod
    def get_kraus_amplitude_damping(gamma: float) -> List[np.ndarray]:
        """Kraus operators for amplitude damping (T1 decay towards ground state)."""
        gamma = min(max(gamma, 0.0), 1.0)
        e0 = np.array([[1.0, 0.0], [0.0, math.sqrt(1.0 - gamma)]], dtype=complex)
        e1 = np.array([[0.0, math.sqrt(gamma)], [0.0, 0.0]], dtype=complex)
        return [e0, e1]

    @staticmethod
    def get_kraus_phase_damping(lambda_param: float) -> List[np.ndarray]:
        """Kraus operators for phase damping (T2 dephasing decoherence)."""
        lambda_param = min(max(lambda_param, 0.0), 1.0)
        e0 = np.array([[1.0, 0.0], [0.0, math.sqrt(1.0 - lambda_param)]], dtype=complex)
        e1 = np.array([[0.0, 0.0], [0.0, math.sqrt(lambda_param)]], dtype=complex)
        return [e0, e1]

    @classmethod
    def apply_single_qubit_channel(
        cls, rho: np.ndarray, kraus_ops: List[np.ndarray], target_qubit: int, num_qubits: int
    ) -> np.ndarray:
        """Apply a 1-qubit quantum channel given by Kraus operators to a full density matrix."""
        # Reshape rho into tensor of shape (2, 2, ..., 2, 2, 2, ..., 2) with 2*num_qubits indices
        # First num_qubits are row indices, second num_qubits are column indices
        shape = [2] * (2 * num_qubits)
        rho_tensor = rho.reshape(shape)

        new_rho_tensor = np.zeros_like(rho_tensor)
        target_row = target_qubit
        target_col = num_qubits + target_qubit

        for k in kraus_ops:
            # E_k * rho: tensordot k with rho along target_row
            # k is shape (2, 2). k[i, j] multiplies row j of rho.
            temp = np.tensordot(k, rho_tensor, axes=([1], [target_row]))
            temp = np.moveaxis(temp, 0, target_row)

            # (E_k * rho) * E_k_dagger: tensordot with E_k_dagger along target_col
            # E_dagger is k.conj().T
            k_dag = k.conj().T
            temp2 = np.tensordot(temp, k_dag, axes=([target_col], [0]))
            temp2 = np.moveaxis(temp2, -1, target_col)

            new_rho_tensor += temp2

        dim = 2 ** num_qubits
        return new_rho_tensor.reshape((dim, dim))

    @classmethod
    def apply_depolarizing_1q(cls, rho: np.ndarray, p: float, target_qubit: int, num_qubits: int) -> np.ndarray:
        """Apply symmetric 1-qubit depolarizing error."""
        if p <= 1e-7:
            return rho
        p = min(p, 0.75)
        # Kraus representation: sqrt(1 - p) I, sqrt(p/3) X, sqrt(p/3) Y, sqrt(p/3) Z
        kraus = [
            math.sqrt(1.0 - p) * PAULI_I,
            math.sqrt(p / 3.0) * PAULI_X,
            math.sqrt(p / 3.0) * PAULI_Y,
            math.sqrt(p / 3.0) * PAULI_Z,
        ]
        return cls.apply_single_qubit_channel(rho, kraus, target_qubit, num_qubits)

    def simulate_noisy_circuit(
        self,
        circuit: CircuitModel,
        profile_key: str = "ibm_eagle",
        custom_params: Optional[Dict[str, float]] = None,
        shots: int = 1024,
    ) -> Dict[str, Any]:
        """
        Execute density matrix evolution under thermal relaxation (T1),
        dephasing (T2), gate depolarizing errors, and readout fidelity.
        """
        t0 = time.perf_counter()
        num_qubits = circuit.num_qubits
        if num_qubits > self.max_qubits:
            raise ValueError(f"Noisy density matrix simulation is capped at {self.max_qubits} qubits (requested {num_qubits}).")

        # Select profile parameters
        if profile_key in HARDWARE_NOISE_PROFILES:
            prof = HARDWARE_NOISE_PROFILES[profile_key].copy()
        else:
            prof = HARDWARE_NOISE_PROFILES["ibm_eagle"].copy()

        if custom_params:
            prof.update(custom_params)

        t1_ns = prof["t1_us"] * 1000.0
        t2_ns = prof["t2_us"] * 1000.0
        g1_time = prof["gate_1q_time_ns"]
        g2_time = prof["gate_2q_time_ns"]
        p1_depol = prof["gate_1q_error"]
        p2_depol = prof["gate_2q_error"]
        readout_err = prof["readout_error"]

        # Effective pure dephasing rate: 1/T_phi = 1/T2 - 1/(2*T1)
        inv_t1 = 1.0 / t1_ns if t1_ns > 0 else 0.0
        inv_t2 = 1.0 / t2_ns if t2_ns > 0 else 0.0
        inv_tphi = max(0.0, inv_t2 - 0.5 * inv_t1)
        tphi_ns = 1.0 / inv_tphi if inv_tphi > 0 else 1e9

        dim = 2 ** num_qubits
        # Initial state |0...0><0...0|
        rho = np.zeros((dim, dim), dtype=complex)
        rho[0, 0] = 1.0 + 0.0j

        # Import unitary engine for ideal statevector & unitary gate generation
        from backend.app.services.quantum.engine import QuantumSimulationEngine, GATE_MATRICES, get_rotation_matrix
        ideal_engine = QuantumSimulationEngine(max_qubits=16)
        ideal_statevector, _ = ideal_engine.simulate_statevector(circuit)
        rho_ideal = np.outer(ideal_statevector, ideal_statevector.conj())

        # Gate-by-gate noisy evolution
        for inst in circuit.instructions:
            g = inst.gate.lower().strip()
            qubits = inst.qubits
            params = inst.params or []

            if g in ["measure", "barrier"]:
                continue

            # 1. Apply coherent unitary rotation U * rho * U_dag
            if g in GATE_MATRICES or g in ["rx", "ry", "rz"]:
                q = qubits[0]
                U = GATE_MATRICES[g] if g in GATE_MATRICES else get_rotation_matrix(g, params[0] if params else 0.0)
                rho = self.apply_single_qubit_channel(rho, [U], q, num_qubits)

                # 2. Apply single-qubit decoherence (T1 and T2)
                gamma_1 = 1.0 - math.exp(-g1_time / t1_ns) if t1_ns > 0 else 0.0
                lambda_phi = 1.0 - math.exp(-g1_time / tphi_ns) if tphi_ns > 0 else 0.0

                kraus_t1 = self.get_kraus_amplitude_damping(gamma_1)
                kraus_t2 = self.get_kraus_phase_damping(lambda_phi)

                rho = self.apply_single_qubit_channel(rho, kraus_t1, q, num_qubits)
                rho = self.apply_single_qubit_channel(rho, kraus_t2, q, num_qubits)
                rho = self.apply_depolarizing_1q(rho, p1_depol, q, num_qubits)

            elif g in ["cx", "cnot", "cz", "swap"]:
                c, t = qubits[0], qubits[1]
                # Construct 2-qubit unitary gate
                if g in ["cx", "cnot"]:
                    u_2q = np.array([
                        [1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 1],
                        [0, 0, 1, 0]
                    ], dtype=complex)
                elif g == "cz":
                    u_2q = np.diag([1, 1, 1, -1]).astype(complex)
                else:  # swap
                    u_2q = np.array([
                        [1, 0, 0, 0],
                        [0, 0, 1, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 1]
                    ], dtype=complex)

                # Apply 2-qubit unitary evolution via basis permutation
                rho = self._apply_two_qubit_gate(rho, u_2q, c, t, num_qubits)

                # 2-qubit gate decoherence duration
                gamma_1 = 1.0 - math.exp(-g2_time / t1_ns) if t1_ns > 0 else 0.0
                lambda_phi = 1.0 - math.exp(-g2_time / tphi_ns) if tphi_ns > 0 else 0.0

                for q_target in [c, t]:
                    k_t1 = self.get_kraus_amplitude_damping(gamma_1)
                    k_t2 = self.get_kraus_phase_damping(lambda_phi)
                    rho = self.apply_single_qubit_channel(rho, k_t1, q_target, num_qubits)
                    rho = self.apply_single_qubit_channel(rho, k_t2, q_target, num_qubits)
                    rho = self.apply_depolarizing_1q(rho, p2_depol * 0.5, q_target, num_qubits)

        # Enforce Hermiticity and trace normalization = 1.0
        rho = 0.5 * (rho + rho.conj().T)
        tr = float(np.real(np.trace(rho)))
        if tr > 0:
            rho /= tr

        # 3. Compute Quantum State Fidelity & Purity
        # F(rho_ideal, rho_noisy) = <psi_ideal | rho_noisy | psi_ideal>
        fidelity = float(np.real(np.vdot(ideal_statevector, rho @ ideal_statevector)))
        fidelity = max(0.0, min(1.0, fidelity))

        # Purity = Tr(rho^2)
        purity = float(np.real(np.trace(rho @ rho)))
        purity = max(0.0, min(1.0, purity))

        # 4. Extract raw diagonal probabilities
        raw_noisy_probs = np.real(np.diag(rho))
        raw_noisy_probs = np.maximum(0.0, raw_noisy_probs)
        raw_noisy_probs /= np.sum(raw_noisy_probs)

        # 5. Apply Readout Confusion Matrix
        # M_ij = prob of reading i given true state j
        measured_probs = self._apply_readout_error(raw_noisy_probs, readout_err, num_qubits)

        # Ideal probabilities
        ideal_probs = np.abs(ideal_statevector) ** 2
        ideal_probs /= np.sum(ideal_probs)

        basis_labels = [f"{i:0{num_qubits}b}" for i in range(dim)]

        ideal_prob_dict = {basis_labels[i]: round(float(ideal_probs[i]), 5) for i in range(dim) if ideal_probs[i] > 1e-5}
        noisy_prob_dict = {basis_labels[i]: round(float(measured_probs[i]), 5) for i in range(dim) if measured_probs[i] > 1e-5}

        # Sample measurement shots
        sampled_indices = np.random.choice(dim, size=shots, p=measured_probs)
        noisy_counts = {}
        for idx in sampled_indices:
            lbl = basis_labels[idx]
            noisy_counts[lbl] = noisy_counts.get(lbl, 0) + 1
        noisy_counts = dict(sorted(noisy_counts.items(), key=lambda x: x[1], reverse=True))

        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        return {
            "success": True,
            "profile": prof["name"],
            "technology": prof["technology"],
            "execution_time_ms": round(elapsed_ms, 2),
            "fidelity": round(fidelity, 4),
            "fidelity_pct": round(fidelity * 100.0, 2),
            "purity": round(purity, 4),
            "t1_us": prof["t1_us"],
            "t2_us": prof["t2_us"],
            "readout_error_pct": round(prof["readout_error"] * 100.0, 2),
            "shots": shots,
            "ideal_probabilities": ideal_prob_dict,
            "noisy_probabilities": noisy_prob_dict,
            "noisy_counts": noisy_counts,
        }

    @staticmethod
    def _apply_readout_error(probs: np.ndarray, error_rate: float, num_qubits: int) -> np.ndarray:
        """Simulate symmetric bit-flip readout errors across all qubit measurement lines."""
        if error_rate <= 1e-7:
            return probs

        dim = len(probs)
        new_probs = np.zeros(dim)

        # Single-qubit confusion matrix: [[1 - e, e], [e, 1 - e]]
        p00 = 1.0 - error_rate
        p01 = error_rate
        p10 = error_rate
        p11 = 1.0 - error_rate

        for state_idx in range(dim):
            p_state = probs[state_idx]
            if p_state <= 0.0:
                continue

            # Decompose state_idx into bits
            bits = [(state_idx >> (num_qubits - 1 - b)) & 1 for b in range(num_qubits)]

            for measured_idx in range(dim):
                m_bits = [(measured_idx >> (num_qubits - 1 - b)) & 1 for b in range(num_qubits)]
                prob_transition = 1.0
                for b, m in zip(bits, m_bits):
                    if b == 0 and m == 0:
                        prob_transition *= p00
                    elif b == 0 and m == 1:
                        prob_transition *= p01
                    elif b == 1 and m == 0:
                        prob_transition *= p10
                    elif b == 1 and m == 1:
                        prob_transition *= p11
                new_probs[measured_idx] += p_state * prob_transition

        new_probs /= np.sum(new_probs)
        return new_probs

    @staticmethod
    def _apply_two_qubit_gate(rho: np.ndarray, u_2q: np.ndarray, c: int, t: int, num_qubits: int) -> np.ndarray:
        """Apply a 2-qubit gate U_2q to control c and target t on full density matrix rho."""
        dim = 2 ** num_qubits
        shape = [2] * (2 * num_qubits)
        rho_tensor = rho.reshape(shape)

        # Reshape U_2q as (2, 2, 2, 2): U[c_out, t_out, c_in, t_in]
        u_tensor = u_2q.reshape((2, 2, 2, 2))

        # Contract U with rho along row indices c and t
        # In tensordot: u_tensor axes (2, 3) contract with rho_tensor axes (c, t)
        temp = np.tensordot(u_tensor, rho_tensor, axes=([2, 3], [c, t]))
        # Reorder axes back: indices 0 and 1 are new c and t
        current_axes = list(range(2 * num_qubits))
        current_axes.pop(c)
        current_axes.pop(t if t < c else t - 1)
        # Place new c and t at positions c and t
        # For simplicity and robustness on arbitrary wires:
        # Construct full unitary in matrix form
        I = np.eye(2, dtype=complex)
        ops = [I] * num_qubits

        # Direct matrix expansion fallback for fast accurate multiplication
        full_u = np.zeros((dim, dim), dtype=complex)
        for i in range(dim):
            # Extract control and target bits of basis vector |i>
            c_bit = (i >> (num_qubits - 1 - c)) & 1
            t_bit = (i >> (num_qubits - 1 - t)) & 1
            in_2q = (c_bit << 1) | t_bit

            for out_2q in range(4):
                amp = u_2q[out_2q, in_2q]
                if abs(amp) > 1e-9:
                    out_c = (out_2q >> 1) & 1
                    out_t = out_2q & 1
                    # Form output index j
                    j = i
                    if c_bit != out_c:
                        j ^= (1 << (num_qubits - 1 - c))
                    if t_bit != out_t:
                        j ^= (1 << (num_qubits - 1 - t))
                    full_u[j, i] = amp

        return full_u @ rho @ full_u.conj().T
