"""
Quantum Leap — Production Quantum Code Runner & Checker Engine
Safely executes and validates user-submitted quantum code in Python (Qiskit 2.x, Cirq, PennyLane),
capturing stdout/stderr, circuit diagrams, gate telemetry, and measurement statistics.
"""

import sys
import os
import ast
import json
import time
import tempfile
import subprocess
from typing import Dict, Any, Optional

from backend.app.services.quantum.sandbox import validate_python_quantum_code

# Path to current virtual environment python executable
PYTHON_EXE = sys.executable

RUNNER_WRAPPER = '''# -*- coding: utf-8 -*-
import sys
import io
import json
import traceback

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

stdout_capture = io.StringIO()
sys_stdout_orig = sys.stdout
sys.stdout = stdout_capture

result_payload = {
    "success": False,
    "stdout": "",
    "stderr": "",
    "counts": {},
    "shots": 1024,
    "num_qubits": 0,
    "circuit_depth": 0,
    "gate_counts": {},
    "circuit_diagram": "",
    "error": None
}

user_scope = {}

try:
    with open(__USER_CODE_FILE__, 'r', encoding='utf-8') as f:
        user_code = f.read()

    # Execute user code in dedicated scope
    exec(compile(user_code, '<quantum_code>', 'exec'), user_scope)

    result_payload["success"] = True
    result_payload["stdout"] = stdout_capture.getvalue()

    # 1. Search for any QuantumCircuit in user scope
    found_qc = None
    for name, val in user_scope.items():
        if val.__class__.__name__ == 'QuantumCircuit':
            found_qc = val
            break

    # 2. Search for explicit counts dictionary
    if "counts" in user_scope and isinstance(user_scope["counts"], dict):
        result_payload["counts"] = {str(k): int(v) for k, v in user_scope["counts"].items()}

    # 3. If QuantumCircuit found, extract telemetry and draw diagram
    if found_qc is not None:
        try:
            result_payload["num_qubits"] = found_qc.num_qubits
            result_payload["circuit_depth"] = found_qc.depth()
            result_payload["gate_counts"] = dict(found_qc.count_ops())
            # Generate ASCII text circuit diagram
            result_payload["circuit_diagram"] = str(found_qc.draw(output='text'))
        except Exception as draw_err:
            result_payload["circuit_diagram"] = f"Diagram error: {draw_err}"

        # 4. If counts not yet obtained, simulate automatically using AerSimulator or Statevector
        if not result_payload["counts"]:
            try:
                from qiskit_aer import AerSimulator
                has_meas = any(inst.operation.name == 'measure' for inst in found_qc.data)
                sim_qc = found_qc.copy()
                if not has_meas:
                    sim_qc.measure_all()
                backend = AerSimulator()
                job = backend.run(sim_qc, shots=__SHOTS__)
                counts = job.result().get_counts()
                result_payload["counts"] = {str(k): int(v) for k, v in counts.items()}
                result_payload["shots"] = __SHOTS__
            except Exception as sim_err:
                try:
                    from qiskit.quantum_info import Statevector
                    sv = Statevector.from_instruction(found_qc)
                    probs = sv.probabilities_dict()
                    result_payload["counts"] = {k: int(round(p * __SHOTS__)) for k, p in probs.items() if p > 0.0001}
                    result_payload["shots"] = __SHOTS__
                except Exception:
                    pass

except Exception as ex:
    result_payload["success"] = False
    result_payload["error"] = str(ex)
    result_payload["stderr"] = traceback.format_exc()
    result_payload["stdout"] = stdout_capture.getvalue()

finally:
    sys.stdout = sys_stdout_orig
    print("===QUANTUM_RESULT_START===")
    print(json.dumps(result_payload))
    print("===QUANTUM_RESULT_END===")
'''


class QuantumCodeRunner:
    """Safe runner for quantum python code with subprocess isolation."""

    @classmethod
    def execute_code(
        cls,
        code: str,
        framework: str = "qiskit",
        shots: int = 1024,
        timeout_seconds: int = 12,
    ) -> Dict[str, Any]:
        start_time = time.time()

        # 1. Security static check
        is_safe, violations = validate_python_quantum_code(code)
        if not is_safe:
            return {
                "success": False,
                "error": f"Security Policy Violation: {'; '.join(violations)}",
                "stdout": "",
                "stderr": "\n".join(f"[Security Check Failed] {v}" for v in violations),
                "counts": {},
                "shots": shots,
                "num_qubits": 0,
                "circuit_depth": 0,
                "gate_counts": {},
                "circuit_diagram": "",
                "execution_time_ms": round((time.time() - start_time) * 1000, 2),
            }

        # 2. Write code to temp file and run wrapper
        with tempfile.TemporaryDirectory() as tmpdir:
            user_code_path = os.path.join(tmpdir, "user_quantum_code.py")
            runner_script_path = os.path.join(tmpdir, "runner.py")

            with open(user_code_path, "w", encoding="utf-8") as f:
                f.write(code)

            wrapper_code = (
                RUNNER_WRAPPER
                .replace("__USER_CODE_FILE__", repr(user_code_path))
                .replace("__SHOTS__", str(shots))
            )

            with open(runner_script_path, "w", encoding="utf-8") as f:
                f.write(wrapper_code)

            try:
                # Clean, isolated environment — strictly prevent secret keys or DB URLs leakage
                clean_env = {
                    "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
                    "VIRTUAL_ENV": os.environ.get("VIRTUAL_ENV", ""),
                    "PYTHONPATH": ".",
                    "LANG": "en_US.UTF-8",
                    "LC_ALL": "en_US.UTF-8",
                    "QISKIT_SETTINGS_DIR": tmpdir,
                    "PYTHONIOENCODING": "utf-8",
                    "HOME": tmpdir,
                    "TMPDIR": tmpdir,
                    "TEMP": tmpdir,
                }

                proc = subprocess.run(
                    [PYTHON_EXE, runner_script_path],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=timeout_seconds,
                    cwd=tmpdir,
                    env=clean_env,
                )
                duration_ms = round((time.time() - start_time) * 1000, 2)
                raw_out = proc.stdout

                if "===QUANTUM_RESULT_START===" in raw_out and "===QUANTUM_RESULT_END===" in raw_out:
                    json_str = raw_out.split("===QUANTUM_RESULT_START===")[1].split("===QUANTUM_RESULT_END===")[0].strip()
                    try:
                        res = json.loads(json_str)
                        res["execution_time_ms"] = duration_ms
                        return res
                    except json.JSONDecodeError:
                        pass

                return {
                    "success": proc.returncode == 0,
                    "stdout": raw_out,
                    "stderr": proc.stderr,
                    "counts": {},
                    "shots": shots,
                    "num_qubits": 0,
                    "circuit_depth": 0,
                    "gate_counts": {},
                    "circuit_diagram": "",
                    "error": proc.stderr.strip() if proc.stderr else None,
                    "execution_time_ms": duration_ms,
                }

            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "error": f"Execution timed out ({timeout_seconds}s limit). Check for infinite loops or oversized circuits.",
                    "stdout": "",
                    "stderr": f"TimeoutExpired: Subprocess exceeded {timeout_seconds} seconds.",
                    "counts": {},
                    "shots": shots,
                    "num_qubits": 0,
                    "circuit_depth": 0,
                    "gate_counts": {},
                    "circuit_diagram": "",
                    "execution_time_ms": round((time.time() - start_time) * 1000, 2),
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"System error executing quantum script: {str(e)}",
                    "stdout": "",
                    "stderr": str(e),
                    "counts": {},
                    "shots": shots,
                    "num_qubits": 0,
                    "circuit_depth": 0,
                    "gate_counts": {},
                    "circuit_diagram": "",
                    "execution_time_ms": round((time.time() - start_time) * 1000, 2),
                }


class QuantumCodeChecker:
    """Performs quantum linting, deprecation checks, and problem verification."""

    PROBLEM_SPECS = {
        "bell_state": {
            "title": "Create a Bell State",
            "required_qubits": 2,
            "expected_patterns": ["00", "11"],
            "forbidden_patterns": ["01", "10"],
            "min_shots_threshold": 0.35,
        },
        "ghz_state": {
            "title": "Create a GHZ State (3-Qubit)",
            "required_qubits": 3,
            "expected_patterns": ["000", "111"],
            "forbidden_patterns": ["001", "010", "100", "011", "101", "110"],
            "min_shots_threshold": 0.35,
        },
        "grover_2qubit": {
            "title": "Grover's Search (2-qubit)",
            "required_qubits": 2,
            "expected_patterns": ["11"],
            "min_shots_threshold": 0.80,
        },
        "teleportation": {
            "title": "Quantum Teleportation",
            "required_qubits": 3,
            "expected_patterns": ["0", "1"],
            "min_shots_threshold": 0.0,
        },
        "superdense_coding": {
            "title": "Superdense Coding",
            "required_qubits": 2,
            "expected_patterns": ["11", "00", "01", "10"],
            "min_shots_threshold": 0.80,
        },
        "deutsch_jozsa": {
            "title": "Deutsch-Jozsa Algorithm",
            "required_qubits": 2,
            "expected_patterns": ["1", "0"],
            "min_shots_threshold": 0.85,
        },
        "qft_2qubit": {
            "title": "2-Qubit Quantum Fourier Transform",
            "required_qubits": 2,
            "expected_patterns": [],
            "min_shots_threshold": 0.0,
        },
        "vqe_ansatz": {
            "title": "VQE Ansatz Circuit",
            "required_qubits": 2,
            "expected_patterns": [],
            "min_shots_threshold": 0.0,
        },
    }

    @classmethod
    def check_code(cls, code: str, problem_id: Optional[str] = None) -> Dict[str, Any]:
        diagnostics = []
        is_safe, violations = validate_python_quantum_code(code)
        if not is_safe:
            return {
                "passed": False,
                "score": 0,
                "status": "error",
                "summary": "Security validation failed",
                "diagnostics": [{"severity": "critical", "message": v} for v in violations],
                "circuit_telemetry": {},
                "test_results": [],
            }

        try:
            tree = ast.parse(code)
            code_lower = code.lower()

            if "from qiskit import execute" in code or "execute(" in code:
                diagnostics.append({
                    "severity": "warning",
                    "category": "deprecation",
                    "message": "qiskit.execute is deprecated in Qiskit 1.0+. Use AerSimulator().run(qc) instead.",
                    "suggestion": "from qiskit_aer import AerSimulator\nbackend = AerSimulator()\njob = backend.run(qc, shots=1024)",
                })
            if "aer.get_backend" in code_lower or "qiskit.aer" in code_lower:
                diagnostics.append({
                    "severity": "warning",
                    "category": "deprecation",
                    "message": "Aer.get_backend() is legacy syntax. Use `AerSimulator()` directly from `qiskit_aer`.",
                })

            has_measure_call = ("measure" in code_lower or "measure_all" in code_lower)
            if not has_measure_call:
                diagnostics.append({
                    "severity": "info",
                    "category": "measurement",
                    "message": "No explicit measurement found. QuantumLeap auto-samples statevector or attaches measurements for simulation.",
                })

        except SyntaxError as syn_err:
            return {
                "passed": False,
                "score": 0,
                "status": "error",
                "summary": f"Python Syntax Error on line {syn_err.lineno}: {syn_err.msg}",
                "diagnostics": [{
                    "severity": "critical",
                    "category": "syntax",
                    "line": syn_err.lineno,
                    "message": syn_err.msg,
                }],
                "circuit_telemetry": {},
                "test_results": [],
            }

        run_res = QuantumCodeRunner.execute_code(code, shots=1024)
        if not run_res.get("success"):
            return {
                "passed": False,
                "score": 0,
                "status": "error",
                "summary": f"Runtime Exception: {run_res.get('error', 'Execution failed')}",
                "diagnostics": diagnostics + [{
                    "severity": "critical",
                    "category": "runtime",
                    "message": run_res.get("error", "Runtime error"),
                    "traceback": run_res.get("stderr"),
                }],
                "circuit_telemetry": {},
                "test_results": [],
                "stdout": run_res.get("stdout", ""),
            }

        counts = run_res.get("counts", {})
        total_shots = sum(counts.values()) or 1024
        telemetry = {
            "num_qubits": run_res.get("num_qubits", 0),
            "circuit_depth": run_res.get("circuit_depth", 0),
            "gate_counts": run_res.get("gate_counts", {}),
            "diagram": run_res.get("circuit_diagram", ""),
            "counts": counts,
            "execution_time_ms": run_res.get("execution_time_ms", 0),
        }

        test_results = []
        overall_passed = True
        score = 100

        if problem_id and problem_id in cls.PROBLEM_SPECS:
            spec = cls.PROBLEM_SPECS[problem_id]
            req_qubits = spec.get("required_qubits", 0)

            qubits_ok = telemetry["num_qubits"] >= req_qubits
            test_results.append({
                "test": f"Qubit Allocation Check (>= {req_qubits} qubits)",
                "passed": qubits_ok,
                "detail": f"Allocated: {telemetry['num_qubits']} qubits, Expected: >= {req_qubits}",
            })
            if not qubits_ok:
                overall_passed = False
                score -= 30

            expected_patterns = spec.get("expected_patterns", [])
            forbidden_patterns = spec.get("forbidden_patterns", [])
            min_thresh = spec.get("min_shots_threshold", 0.0)

            if expected_patterns and counts:
                observed_states = set(counts.keys())
                for exp in expected_patterns:
                    matching = [k for k in observed_states if exp in k or k == exp]
                    matched_shots = sum(counts[k] for k in matching)
                    ratio = matched_shots / total_shots
                    passed_test = (ratio >= min_thresh) if min_thresh > 0 else (len(matching) > 0)
                    test_results.append({
                        "test": f"Target Quantum State |{exp}⟩ Produced",
                        "passed": passed_test,
                        "detail": f"Measured in {round(ratio * 100, 1)}% of shots (target threshold: {round(min_thresh * 100, 1)}%)",
                    })
                    if not passed_test:
                        overall_passed = False
                        score -= 35

                for forb in forbidden_patterns:
                    matching = [k for k in observed_states if forb in k or k == forb]
                    matched_shots = sum(counts[k] for k in matching)
                    ratio = matched_shots / total_shots
                    is_leakage = ratio > 0.05
                    test_results.append({
                        "test": f"No Unwanted Leakage into |{forb}⟩",
                        "passed": not is_leakage,
                        "detail": f"Measured {round(ratio * 100, 1)}% leakage into non-target basis",
                    })
                    if is_leakage:
                        overall_passed = False
                        score -= 20
        else:
            test_results.append({
                "test": "Quantum Execution & Simulation",
                "passed": True,
                "detail": f"Compiled and simulated cleanly with {telemetry['num_qubits']} qubits across {total_shots} shots.",
            })

        score = max(0, min(100, score))
        summary = (
            f"All tests passed ({score}/100) — Quantum circuit executed with high fidelity!"
            if overall_passed
            else f"Checks found issues ({score}/100). Review the diagnostics below to refine your circuit."
        )

        return {
            "passed": overall_passed,
            "score": score,
            "status": "success" if overall_passed else "warning",
            "summary": summary,
            "diagnostics": diagnostics,
            "circuit_telemetry": telemetry,
            "test_results": test_results,
            "stdout": run_res.get("stdout", ""),
            "diagram": telemetry["diagram"],
            "counts": counts,
        }
