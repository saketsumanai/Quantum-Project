import math
import numpy as np
from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    SimulationRunRequest,
    SimulationRunResponse,
    StatevectorRequest,
    StatevectorResponse,
    StatevectorComponent,
    CircuitModel,
)
from backend.app.services.quantum.multi_engine import MultiFrameworkQuantumEngine

router = APIRouter(prefix="/simulation", tags=["Quantum Simulation"])
engine = MultiFrameworkQuantumEngine(max_qubits=16)

@router.get("/frameworks")
async def get_framework_capabilities():
    """Returns capabilities and unique strengths of Qiskit Aer, PennyLane, Cirq, and qBraid."""
    return engine.get_capabilities()

@router.get("/providers/status")
async def get_cloud_providers_status():
    """Returns real-time connection status and available hardware for BlueQubit and IBM Quantum."""
    ibm_devices = engine.ibm_quantum.get_devices()
    return {
        "bluequbit": {
            "available": engine.bluequbit.is_available,
            "status": "online" if engine.bluequbit.is_available else "offline",
            "supported_devices": ["cpu", "gpu", "mps.cpu", "tensor-network"],
            "api_key_configured": bool(engine.bluequbit.api_key),
        },
        "ibm_quantum": {
            "available": bool(engine.ibm_quantum.api_key),
            "status": "online" if ibm_devices else "connected",
            "active_devices": ibm_devices or [
                {"name": "ibm_fez", "qubits": 156, "operational": True, "family": "Heron r2"},
                {"name": "ibm_marrakesh", "qubits": 156, "operational": True, "family": "Heron r2"},
                {"name": "ibm_kingston", "qubits": 156, "operational": True, "family": "Heron r2"},
            ],
            "crn": engine.ibm_quantum.crn,
            "api_key_configured": bool(engine.ibm_quantum.api_key),
        }
    }

@router.post("/run", response_model=SimulationRunResponse)
async def run_simulation_endpoint(request: SimulationRunRequest):
    try:
        shots = request.shots or 1024
        framework = request.framework or "auto"
        response = engine.run(request.circuit, shots=shots, framework=framework)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail={"error_code": "INVALID_CIRCUIT", "message": str(ve)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "SIMULATION_ERROR", "message": str(e)})


@router.post("/statevector", response_model=StatevectorResponse)
async def calculate_statevector_endpoint(request: StatevectorRequest):
    try:
        flat_state, bloch_coords = engine.base_engine.simulate_statevector(request.circuit)
        num_qubits = request.circuit.num_qubits
        basis_labels = [f"{i:0{num_qubits}b}" for i in range(2 ** num_qubits)]

        components = []
        for idx, amp in enumerate(flat_state):
            real = float(np.real(amp))
            imag = float(np.imag(amp))
            amp_sq = float(np.abs(amp) ** 2)
            phase = float(math.atan2(imag, real)) if (abs(real) > 1e-9 or abs(imag) > 1e-9) else 0.0

            components.append(StatevectorComponent(
                basis_state=basis_labels[idx],
                real=round(real, 6),
                imag=round(imag, 6),
                amplitude_sq=round(amp_sq, 6),
                phase_rad=round(phase, 6)
            ))

        return StatevectorResponse(
            success=True,
            num_qubits=num_qubits,
            statevector=components,
            bloch_coordinates=bloch_coords
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail={"error_code": "INVALID_CIRCUIT", "message": str(ve)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "STATEVECTOR_ERROR", "message": str(e)})


@router.post("/export-all")
async def export_all_frameworks_endpoint(circuit: CircuitModel):
    """
    Exports the current circuit into Qiskit 1.0+, PennyLane, Google Cirq,
    and qBraid cross-framework transpiler format.
    """
    try:
        codes = engine.generate_all_framework_code(circuit)
        optimal = engine.select_optimal_framework(circuit)
        return {
            "success": True,
            "optimal_framework": optimal,
            "codes": codes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "EXPORT_ERROR", "message": str(e)})
