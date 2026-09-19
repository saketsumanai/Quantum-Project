import math
import time
import numpy as np
from typing import List, Dict, Tuple, Optional
from backend.app.models.schemas import (
    CircuitModel,
    CircuitInstruction,
    SimulationRunResponse,
    StatevectorResponse,
    StatevectorComponent,
    BlochCoordinate,
)

# Standard Pauli and Elementary Gate Matrices (2x2)
GATE_MATRICES = {
    "h": (1.0 / math.sqrt(2.0)) * np.array([[1.0, 1.0], [1.0, -1.0]], dtype=complex),
    "x": np.array([[0.0, 1.0], [1.0, 0.0]], dtype=complex),
    "y": np.array([[0.0, -1.0j], [1.0j, 0.0]], dtype=complex),
    "z": np.array([[1.0, 0.0], [0.0, -1.0]], dtype=complex),
    "s": np.array([[1.0, 0.0], [0.0, 1.0j]], dtype=complex),
    "t": np.array([[1.0, 0.0], [0.0, np.exp(1.0j * np.pi / 4.0)]], dtype=complex),
    "id": np.eye(2, dtype=complex),
}

def get_rotation_matrix(gate: str, theta: float) -> np.ndarray:
    half = theta / 2.0
    if gate == "rx":
        return np.array([
            [np.cos(half), -1.0j * np.sin(half)],
            [-1.0j * np.sin(half), np.cos(half)]
        ], dtype=complex)
    elif gate == "ry":
        return np.array([
            [np.cos(half), -np.sin(half)],
            [np.sin(half), np.cos(half)]
        ], dtype=complex)
    elif gate == "rz":
        return np.array([
            [np.exp(-1.0j * half), 0.0],
            [0.0, np.exp(1.0j * half)]
        ], dtype=complex)
    return np.eye(2, dtype=complex)


class QuantumSimulationEngine:
    """
    High-precision Quantum Statevector Simulation Engine.
    Executes full multi-qubit unitary evolution via tensor contraction,
    computes exact statevectors, reduced density matrices, and Bloch coordinates.
    """

    def __init__(self, max_qubits: int = 16):
        self.max_qubits = max_qubits

    def simulate_statevector(self, circuit: CircuitModel) -> Tuple[np.ndarray, List[BlochCoordinate]]:
        num_qubits = circuit.num_qubits
        if num_qubits > self.max_qubits:
            raise ValueError(f"Circuit requires {num_qubits} qubits, exceeding max limit of {self.max_qubits}")

        # Initialize state |0...0> as tensor of shape (2, 2, ..., 2)
        # Note: Index 0 is qubit 0, index 1 is qubit 1, ..., index N-1 is qubit N-1
        state_tensor = np.zeros([2] * num_qubits, dtype=complex)
        zero_index = tuple([0] * num_qubits)
        state_tensor[zero_index] = 1.0 + 0.0j

        for inst in circuit.instructions:
            gate = inst.gate.lower().strip()
            qubits = inst.qubits
            params = inst.params or []

            if gate in ["measure", "barrier"]:
                continue

            if gate in GATE_MATRICES or gate in ["rx", "ry", "rz"]:
                if len(qubits) < 1:
                    continue
                q = qubits[0]
                if q >= num_qubits:
                    raise ValueError(f"Qubit index {q} exceeds circuit size {num_qubits}")

                if gate in GATE_MATRICES:
                    U = GATE_MATRICES[gate]
                else:
                    theta = params[0] if len(params) > 0 else 0.0
                    U = get_rotation_matrix(gate, theta)

                # Tensordot over axis q
                state_tensor = np.tensordot(U, state_tensor, axes=([1], [q]))
                state_tensor = np.moveaxis(state_tensor, 0, q)

            elif gate in ["cx", "cnot"]:
                if len(qubits) < 2:
                    continue
                c, t = qubits[0], qubits[1]
                state_tensor = self._apply_cnot(state_tensor, c, t, num_qubits)

            elif gate == "cz":
                if len(qubits) < 2:
                    continue
                c, t = qubits[0], qubits[1]
                state_tensor = self._apply_cz(state_tensor, c, t, num_qubits)

            elif gate in ["cp", "crz", "cu1"]:
                if len(qubits) < 2:
                    continue
                c, t = qubits[0], qubits[1]
                theta = params[0] if len(params) > 0 else (math.pi / 2.0)
                state_tensor = self._apply_cp(state_tensor, c, t, theta, num_qubits)

            elif gate == "swap":
                if len(qubits) < 2:
                    continue
                q1, q2 = qubits[0], qubits[1]
                state_tensor = np.swapaxes(state_tensor, q1, q2)

            elif gate in ["ccx", "toffoli"]:
                if len(qubits) < 3:
                    continue
                c1, c2, t = qubits[0], qubits[1], qubits[2]
                state_tensor = self._apply_toffoli(state_tensor, c1, c2, t, num_qubits)

        # Flatten into 1D statevector of size 2^N
        # In standard quantum mechanics, basis state |b_{N-1}...b_0> has index sum_{k} b_k * 2^k
        # Our tensor index (i_0, i_1, ..., i_{N-1}) has qubit k at index i_k.
        flat_state = np.zeros(2 ** num_qubits, dtype=complex)
        for idx in np.ndindex(*([2] * num_qubits)):
            # compute integer index: qubit 0 is least significant bit
            int_idx = sum(idx[k] * (2 ** k) for k in range(num_qubits))
            flat_state[int_idx] = state_tensor[idx]

        # Calculate Bloch coordinates for each qubit
        bloch_coords = self._calculate_all_bloch_coordinates(state_tensor, num_qubits)

        return flat_state, bloch_coords

    def _apply_cnot(self, state: np.ndarray, c: int, t: int, num_qubits: int) -> np.ndarray:
        # Flip target qubit t whenever control qubit c == 1
        slices_0 = [slice(None)] * num_qubits
        slices_1 = [slice(None)] * num_qubits
        slices_0[c] = 1
        slices_0[t] = 0
        slices_1[c] = 1
        slices_1[t] = 1

        temp = state[tuple(slices_0)].copy()
        state[tuple(slices_0)] = state[tuple(slices_1)]
        state[tuple(slices_1)] = temp
        return state

    def _apply_cz(self, state: np.ndarray, c: int, t: int, num_qubits: int) -> np.ndarray:
        slices = [slice(None)] * num_qubits
        slices[c] = 1
        slices[t] = 1
        state[tuple(slices)] *= -1.0
        return state

    def _apply_cp(self, state: np.ndarray, c: int, t: int, theta: float, num_qubits: int) -> np.ndarray:
        slices = [slice(None)] * num_qubits
        slices[c] = 1
        slices[t] = 1
        state[tuple(slices)] *= np.exp(1.0j * theta)
        return state

    def _apply_toffoli(self, state: np.ndarray, c1: int, c2: int, t: int, num_qubits: int) -> np.ndarray:
        slices_0 = [slice(None)] * num_qubits
        slices_1 = [slice(None)] * num_qubits
        slices_0[c1] = 1
        slices_0[c2] = 1
        slices_0[t] = 0

        slices_1[c1] = 1
        slices_1[c2] = 1
        slices_1[t] = 1

        temp = state[tuple(slices_0)].copy()
        state[tuple(slices_0)] = state[tuple(slices_1)]
        state[tuple(slices_1)] = temp
        return state

    def _calculate_all_bloch_coordinates(self, state_tensor: np.ndarray, num_qubits: int) -> List[BlochCoordinate]:
        coords = []
        for q in range(num_qubits):
            # Partial trace over all qubits except q to get reduced density matrix rho (2x2)
            # Flatten other axes
            other_axes = [i for i in range(num_qubits) if i != q]
            if not other_axes:
                # 1 qubit only
                psi = state_tensor
                rho = np.outer(psi, np.conj(psi))
            else:
                # Density matrix rho = sum_{others} |psi><psi|
                rho = np.zeros((2, 2), dtype=complex)
                for i0 in (0, 1):
                    for i1 in (0, 1):
                        slice_0 = [slice(None)] * num_qubits
                        slice_1 = [slice(None)] * num_qubits
                        slice_0[q] = i0
                        slice_1[q] = i1
                        rho[i0, i1] = np.sum(state_tensor[tuple(slice_0)] * np.conj(state_tensor[tuple(slice_1)]))

            # Bloch sphere expectation values:
            # x = 2 * Re(rho[0, 1])
            # y = 2 * Im(rho[1, 0]) = -2 * Im(rho[0, 1])
            # z = rho[0, 0] - rho[1, 1]
            x = float(2.0 * np.real(rho[0, 1]))
            y = float(2.0 * np.imag(rho[1, 0]))
            z = float(np.real(rho[0, 0] - rho[1, 1]))

            r = math.sqrt(x * x + y * y + z * z)
            if r > 1e-7:
                norm_x = x / r
                norm_y = y / r
                norm_z = max(-1.0, min(1.0, z / r))
                theta = float(math.acos(norm_z))
                phi = float(math.atan2(norm_y, norm_x))
            else:
                theta = float(math.pi / 2.0)
                phi = 0.0

            coords.append(BlochCoordinate(
                qubit_index=q,
                theta_rad=round(theta, 6),
                phi_rad=round(phi, 6),
                x=round(x, 6),
                y=round(y, 6),
                z=round(z, 6)
            ))
        return coords

    def run_simulation(self, circuit: CircuitModel, shots: int = 1024, framework: str = "qiskit") -> SimulationRunResponse:
        t0 = time.perf_counter()
        flat_state, _ = self.simulate_statevector(circuit)

        # Compute probabilities
        probs_array = np.abs(flat_state) ** 2
        norm = np.sum(probs_array)
        if norm > 0:
            probs_array /= norm

        num_qubits = circuit.num_qubits
        basis_labels = [f"{i:0{num_qubits}b}" for i in range(2 ** num_qubits)]

        probabilities_dict = {}
        for idx, p in enumerate(probs_array):
            if p > 1e-6:
                probabilities_dict[basis_labels[idx]] = round(float(p), 6)

        # Monte Carlo shot sampling
        sampled_indices = np.random.choice(len(basis_labels), size=shots, p=probs_array)
        counts_dict: Dict[str, int] = {}
        for idx in sampled_indices:
            key = basis_labels[idx]
            counts_dict[key] = counts_dict.get(key, 0) + 1

        # Sort counts descending
        counts_dict = dict(sorted(counts_dict.items(), key=lambda item: item[1], reverse=True))

        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        qasm = self.generate_qasm2(circuit)

        return SimulationRunResponse(
            success=True,
            execution_time_ms=round(elapsed_ms, 2),
            framework=framework,
            shots=shots,
            counts=counts_dict,
            probabilities=probabilities_dict,
            qasm_export=qasm
        )

    def generate_qasm2(self, circuit: CircuitModel) -> str:
        lines = [
            'OPENQASM 2.0;',
            'include "qelib1.inc";',
            f'qreg q[{circuit.num_qubits}];',
            f'creg c[{circuit.num_qubits}];'
        ]
        for inst in circuit.instructions:
            g = inst.gate.lower().strip()
            q = inst.qubits
            p = inst.params or []
            if g in ["measure"]:
                lines.append(f"measure q[{q[0]}] -> c[{q[0]}];")
            elif g in ["cx", "cnot"]:
                lines.append(f"cx q[{q[0]}],q[{q[1]}];")
            elif g in ["cz"]:
                lines.append(f"cz q[{q[0]}],q[{q[1]}];")
            elif g in ["swap"]:
                lines.append(f"swap q[{q[0]}],q[{q[1]}];")
            elif g in ["ccx", "toffoli"]:
                lines.append(f"ccx q[{q[0]}],q[{q[1]}],q[{q[2]}];")
            elif g in ["rx", "ry", "rz"] and p:
                lines.append(f"{g}({p[0]}) q[{q[0]}];")
            elif g in ["h", "x", "y", "z", "s", "t"]:
                lines.append(f"{g} q[{q[0]}];")
        return "\n".join(lines)
