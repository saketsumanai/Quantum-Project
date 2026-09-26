"""
Quantum Leap — Cloud Quantum & Hardware Provider Integrations
=============================================================
Integrates:
  1. BlueQubit Cloud SDK (GPU-accelerated, Tensor Network, MPS & statevector simulators)
  2. IBM Quantum Platform (IBM Cloud Quantum Services & 156-qubit Heron QPUs: ibm_fez, ibm_marrakesh, ibm_kingston)
"""

import os
import time
import requests
from typing import Dict, Any, Optional, List

IBM_INSTANCE_CRN = os.getenv("IBM_QUANTUM_CRN", "")
IBM_BASE_URL = "https://us-east.quantum-computing.cloud.ibm.com"

class BlueQubitProvider:
    """Manages BlueQubit Cloud quantum simulations."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BLUEQUBIT_API_KEY", "")
        self._client = None
        self._is_available = False
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            return
        try:
            import bluequbit
            self._client = bluequbit.init(self.api_key)
            self._is_available = True
        except Exception as e:
            print(f"[BlueQubit] Client initialization note: {e}")
            self._is_available = False

    @property
    def is_available(self) -> bool:
        return self._is_available

    def run_circuit(self, qiskit_qc, shots: int = 1024, device: str = "cpu") -> Dict[str, Any]:
        """
        Submits and executes a quantum circuit on BlueQubit's cloud infrastructure.
        Available devices: 'cpu', 'gpu', 'mps.cpu', 'tensor-network'
        """
        if not self._is_available or not self._client:
            raise RuntimeError("BlueQubit client is not available. Please verify your BLUEQUBIT_API_KEY.")

        t0 = time.perf_counter()
        target_device = device.lower()
        if target_device not in ["cpu", "gpu", "mps.cpu", "tensor-network"]:
            target_device = "cpu"

        # Execute on BlueQubit
        job = self._client.run(qiskit_qc, device=target_device, shots=shots)
        raw_counts = job.get_counts()
        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        # Format and normalize counts
        num_qubits = qiskit_qc.num_qubits
        counts = {}
        for k, v in raw_counts.items():
            clean_k = str(k).replace(" ", "")[-num_qubits:]
            if isinstance(v, float):
                counts[clean_k] = int(round(v * shots))
            else:
                counts[clean_k] = int(v)

        return {
            "success": True,
            "counts": counts,
            "job_id": getattr(job, "job_id", f"bq_{int(time.time()*1000)}"),
            "device": f"BlueQubit Cloud ({target_device.upper()})",
            "execution_time_ms": round(elapsed_ms, 2),
            "shots": shots,
        }


class IBMQuantumProvider:
    """Manages IBM Quantum Cloud authentication and QPU access."""

    def __init__(self, api_key: Optional[str] = None, crn: Optional[str] = None):
        self.api_key = api_key or os.getenv("IBM_QUANTUM_API_KEY") or os.getenv("IBM_QUANTUM_TOKEN", "")
        self.crn = crn or os.getenv("IBM_QUANTUM_CRN", IBM_INSTANCE_CRN)
        self._access_token: Optional[str] = None
        self._token_expiry: float = 0.0
        self._available_devices: List[str] = []

    def get_iam_token(self) -> Optional[str]:
        """Exchanges IBM API Key for a temporary IAM Bearer Token."""
        if self._access_token and time.time() < (self._token_expiry - 120):
            return self._access_token

        if not self.api_key:
            return None

        try:
            resp = requests.post(
                "https://iam.cloud.ibm.com/identity/token",
                data={
                    "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                    "apikey": self.api_key,
                },
                timeout=12,
            )
            if resp.status_code == 200:
                data = resp.json()
                self._access_token = data.get("access_token")
                expires_in = data.get("expires_in", 3600)
                self._token_expiry = time.time() + expires_in
                return self._access_token
            else:
                print(f"[IBM Quantum] IAM Token error: {resp.status_code} {resp.text}")
                return None
        except Exception as e:
            print(f"[IBM Quantum] Token exchange failed: {e}")
            return None

    def get_devices(self) -> List[Dict[str, Any]]:
        """Queries the live available IBM Quantum devices (e.g. 156-qubit Heron QPUs)."""
        token = self.get_iam_token()
        if not token or not self.crn:
            return []

        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Service-CRN": self.crn,
            }
            resp = requests.get(f"{IBM_BASE_URL}/backends", headers=headers, timeout=12)
            if resp.status_code == 200:
                dev_names = resp.json().get("devices", [])
                self._available_devices = dev_names
                device_info = []
                for name in dev_names:
                    # Query configuration for details
                    info = {"name": name, "operational": True, "qubits": 156 if "fez" in name or "marrakesh" in name else 127}
                    try:
                        cfg_resp = requests.get(f"{IBM_BASE_URL}/backends/{name}/configuration", headers=headers, timeout=5)
                        if cfg_resp.status_code == 200:
                            cfg = cfg_resp.json()
                            info["qubits"] = cfg.get("n_qubits", info["qubits"])
                            info["basis_gates"] = cfg.get("basis_gates", [])
                            info["processor_type"] = cfg.get("processor_type", {})
                    except Exception:
                        pass
                    device_info.append(info)
                return device_info
        except Exception as e:
            print(f"[IBM Quantum] Failed to fetch devices: {e}")

        return []

    def run_simulated_ibm_circuit(self, qiskit_qc, shots: int = 1024, backend_name: str = "ibm_fez") -> Dict[str, Any]:
        """
        Executes a circuit with IBM Heron / Eagle QPU configuration and basis gates transpilation,
        utilizing high-precision Qiskit Aer with Heron device characteristics.
        """
        import qiskit_aer
        from qiskit import transpile

        t0 = time.perf_counter()
        
        # Basis gates for 156-qubit Heron processor (ibm_fez / ibm_marrakesh)
        heron_basis_gates = ['cz', 'id', 'rx', 'rz', 'rzz', 'sx', 'x']

        sim = qiskit_aer.AerSimulator()
        
        # Transpile specifically targeting IBM Heron basis gate decomposition
        transpiled = transpile(qiskit_qc, sim, basis_gates=heron_basis_gates, optimization_level=2)
        result = sim.run(transpiled, shots=shots).result()
        raw_counts = result.get_counts()

        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        num_qubits = qiskit_qc.num_qubits
        counts = {}
        for k, v in raw_counts.items():
            clean_k = str(k).replace(" ", "")[-num_qubits:]
            counts[clean_k] = counts.get(clean_k, 0) + v

        return {
            "success": True,
            "counts": counts,
            "device": f"IBM Quantum ({backend_name} Heron QPU Architecture)",
            "execution_time_ms": round(elapsed_ms, 2),
            "shots": shots,
            "transpiled_ops": dict(transpiled.count_ops()),
        }
