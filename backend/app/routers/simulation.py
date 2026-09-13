import math
import numpy as np
from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    SimulationRunRequest,
    SimulationRunResponse,
    StatevectorRequest,
    StatevectorResponse,
    StatevectorComponent,
)
from backend.app.services.quantum.engine import QuantumSimulationEngine

router = APIRouter(prefix="/simulation", tags=["Quantum Simulation"])
engine = QuantumSimulationEngine(max_qubits=16)

@router.post("/run", response_model=SimulationRunResponse)
async def run_simulation_endpoint(request: SimulationRunRequest):
    try:
        shots = request.shots or 1024
        framework = request.framework or "qiskit"
        response = engine.run_simulation(request.circuit, shots=shots, framework=framework)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail={"error_code": "INVALID_CIRCUIT", "message": str(ve)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "SIMULATION_ERROR", "message": str(e)})


@router.post("/statevector", response_model=StatevectorResponse)
async def calculate_statevector_endpoint(request: StatevectorRequest):
    try:
        flat_state, bloch_coords = engine.simulate_statevector(request.circuit)
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
