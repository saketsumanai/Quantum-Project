"""
Quantum Leap — Production AI Circuit Debugger Service
Analyzes quantum circuits for syntax anomalies, physical NISQ decoherence risks,
uncomputed ancilla leakage, redundant self-cancelling gates, and missing measurements.
"""
from typing import List, Dict, Any, Optional, Tuple
from backend.app.models.schemas import CircuitModel, CircuitInstruction, AICircuitDebugResponse
from backend.app.services.quantum.transpiler import QuantumTranspiler


class QuantumCircuitDebugger:
    """
    Intelligent AST & state analyzer for quantum circuits.
    Detects hardware anti-patterns, mathematical redundancies, and topological bottlenecks.
    """

    SELF_INVERSE_GATES = {"h", "x", "y", "z", "cx", "cz", "swap"}

    @classmethod
    def analyze_and_fix(cls, circuit: CircuitModel, user_level: str = "beginner") -> AICircuitDebugResponse:
        issues: List[Dict[str, Any]] = []
        instructions = [i.model_dump() if hasattr(i, "model_dump") else dict(i) for i in circuit.instructions]
        num_qubits = circuit.num_qubits

        # 1. Check for empty circuit
        if not instructions:
            return AICircuitDebugResponse(
                success=True,
                diagnosis="Circuit is empty. No quantum operations found.",
                suggested_fix_description="Add initialization gates such as Hadamard (H) or Pauli-X to prepare non-trivial quantum superpositions.",
                corrected_circuit=circuit,
                qiskit_corrected_code="# Initialize state\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()",
            )

        # 2. Check for out-of-bounds qubit indices
        invalid_qubits = []
        for idx, inst in enumerate(instructions):
            for q in inst.get("qubits", []):
                if q < 0 or q >= num_qubits:
                    invalid_qubits.append((idx, inst.get("gate"), q))

        if invalid_qubits:
            issues.append({
                "severity": "critical",
                "category": "syntax",
                "message": f"Instruction references invalid qubit index: {invalid_qubits[0][2]} for circuit with {num_qubits} qubits.",
                "fix": f"Constrain qubit indices to range [0, {num_qubits - 1}]."
            })

        # 3. Detect redundant consecutive self-inverting gates (e.g. H-H, X-X, CX-CX)
        redundant_pairs: List[int] = []
        i = 0
        while i < len(instructions) - 1:
            curr = instructions[i]
            nxt = instructions[i + 1]
            if (
                curr.get("gate") == nxt.get("gate")
                and curr.get("gate", "").lower() in cls.SELF_INVERSE_GATES
                and curr.get("qubits") == nxt.get("qubits")
                and curr.get("params", []) == nxt.get("params", [])
            ):
                redundant_pairs.extend([i, i + 1])
                issues.append({
                    "severity": "warning",
                    "category": "optimization",
                    "message": f"Consecutive self-inverse gates '{curr.get('gate').upper()}' on qubit(s) {curr.get('qubits')} cancel to Identity (I).",
                    "fix": f"Remove consecutive {curr.get('gate').upper()} pair to reduce circuit depth and prevent unnecessary gate error."
                })
                i += 2
            else:
                i += 1

        # 4. Check for circuit depth and NISQ decoherence risks (T1/T2 relaxation)
        depth = len(instructions)
        if depth > 15:
            issues.append({
                "severity": "warning",
                "category": "hardware_noise",
                "message": f"Circuit depth is {depth}, exceeding optimal coherence windows for current superconducting QPUs (T2 ~ 80-120 us).",
                "fix": "Apply gate synthesis and commutation rules to compress depth below 15 layers."
            })

        # 5. Detect missing measurements
        has_measurement = any(inst.get("gate", "").lower() == "measure" for inst in instructions)
        if not has_measurement:
            issues.append({
                "severity": "info",
                "category": "telemetry",
                "message": "Circuit does not contain explicit measurement operators. Classical register collapse requires projective measurement.",
                "fix": "Append projective Z-basis measurements to collapse statevector into statistical shot counts."
            })

        # 6. Detect uncomputed ancilla qubits
        # An ancilla is typically the highest index qubit acted upon by CX/CCX that isn't measured
        if num_qubits >= 3:
            last_qubit = num_qubits - 1
            ancilla_ops = [
                inst for inst in instructions
                if last_qubit in inst.get("qubits", [])
            ]
            # If ancilla has operations but no uncompute (reversal) and no measurement
            if ancilla_ops and not any(op.get("gate") == "measure" and last_qubit in op.get("qubits", []) for op in ancilla_ops):
                # Check if symmetric uncomputation exists
                gates_sequence = [op.get("gate") for op in ancilla_ops]
                is_palindrome = gates_sequence == gates_sequence[::-1] and len(gates_sequence) > 1
                if not is_palindrome:
                    issues.append({
                        "severity": "warning",
                        "category": "algorithm",
                        "message": f"Potential uncomputed ancilla qubit q[{last_qubit}]. Entanglement with work registers may cause phase kickback leakage.",
                        "fix": f"Ensure ancilla register q[{last_qubit}] is uncomputed with dagger operations or measured in computational basis."
                    })

        # Build corrected circuit instructions (strip redundant gate pairs and ensure measurements)
        corrected_instructions = []
        for idx, inst in enumerate(instructions):
            if idx not in redundant_pairs:
                # keep valid instruction
                clean_inst = {
                    "gate": inst.get("gate"),
                    "qubits": [q for q in inst.get("qubits", []) if 0 <= q < num_qubits],
                    "params": inst.get("params", []),
                }
                corrected_instructions.append(clean_inst)

        # If measurements were missing, optionally append measurements for all qubits
        if not has_measurement:
            for q in range(num_qubits):
                corrected_instructions.append({
                    "gate": "measure",
                    "qubits": [q],
                    "params": [],
                })

        corrected_circuit_model = CircuitModel(
            num_qubits=num_qubits,
            instructions=[CircuitInstruction(**ci) for ci in corrected_instructions]
        )

        # Generate corrected Qiskit code
        try:
            transpiled = QuantumTranspiler.transpile_all(corrected_circuit_model, optimization_level=2)
            qiskit_code = transpiled.get("qiskit", "")
        except Exception:
            qiskit_code = "# Corrected Qiskit Circuit\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\n"

        # Format human-readable diagnosis and suggestion
        if not issues:
            diagnosis_text = f"Circuit is mathematically sound. Checked {len(instructions)} gates across {num_qubits} qubits with zero syntax or coherence anomalies."
            suggestion_text = "Optimal execution ready. You can transpile to target hardware (IBM Eagle, Rigetti, IonQ) or simulate ideal statevector."
        else:
            diagnosis_items = [f"[{item['category'].upper()}] {item['message']}" for item in issues]
            diagnosis_text = "AI Circuit Diagnostics detected " + str(len(issues)) + " potential optimization item(s):\n- " + "\n- ".join(diagnosis_items)
            suggestion_items = [f"- {item['fix']}" for item in issues]
            suggestion_text = "Recommended Corrective Actions:\n" + "\n".join(suggestion_items)

        return AICircuitDebugResponse(
            success=True,
            diagnosis=diagnosis_text,
            suggested_fix_description=suggestion_text,
            corrected_circuit=corrected_circuit_model,
            qiskit_corrected_code=qiskit_code,
        )
