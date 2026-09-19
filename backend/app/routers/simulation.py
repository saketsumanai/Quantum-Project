import math
import uuid
import numpy as np
from fastapi import APIRouter, HTTPException, Response
from backend.app.models.schemas import (
    SimulationRunRequest,
    SimulationRunResponse,
    StatevectorRequest,
    StatevectorResponse,
    StatevectorComponent,
    TranspileRequest,
    TranspileResponse,
    NoiseSimulationRequest,
    NoiseSimulationResponse,
    ReportGenerateRequest,
)
from backend.app.services.quantum.engine import QuantumSimulationEngine
from backend.app.services.quantum.transpiler import QuantumTranspiler
from backend.app.services.quantum.noise_engine import QuantumNoiseEngine
from backend.app.services.quantum.report_generator import QuantumReportGenerator

router = APIRouter(prefix="/simulation", tags=["Quantum Simulation"])
engine = QuantumSimulationEngine(max_qubits=16)
noise_engine = QuantumNoiseEngine(max_qubits=8)


@router.post("/run", response_model=SimulationRunResponse)
async def run_simulation_endpoint(request: SimulationRunRequest):
    try:
        shots = request.shots or 1024
        framework = request.framework or "qiskit"
        response = engine.run_simulation(request.circuit, shots=shots, framework=framework)

        # If hardware noise is requested and circuit fits in 8 qubits, compute physical decoherence
        if request.noise_enabled and request.circuit.num_qubits <= 8:
            try:
                profile = request.noise_profile or "ibm_eagle"
                noise_res = noise_engine.simulate_noisy_circuit(
                    request.circuit, profile_key=profile, shots=shots
                )
                response.noise_data = noise_res
            except Exception as ne:
                print(f"[Warning] Noise simulation skipped: {ne}")

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


@router.post("/transpile", response_model=TranspileResponse)
async def transpile_circuit_endpoint(request: TranspileRequest):
    try:
        opt_level = request.optimization_level if request.optimization_level is not None else 1
        result = QuantumTranspiler.transpile_all(request.circuit, optimization_level=opt_level)
        return TranspileResponse(
            success=True,
            telemetry=result["telemetry"],
            qiskit=result["qiskit"],
            openqasm3=result["openqasm3"],
            openqasm2=result["openqasm2"],
            cirq=result["cirq"],
            pennylane=result["pennylane"],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error_code": "TRANSPILATION_ERROR", "message": str(e)})


@router.post("/noise", response_model=NoiseSimulationResponse)
async def simulate_hardware_noise_endpoint(request: NoiseSimulationRequest):
    try:
        profile = request.profile_key or "ibm_eagle"
        shots = request.shots or 1024
        result = noise_engine.simulate_noisy_circuit(
            request.circuit,
            profile_key=profile,
            custom_params=request.custom_params,
            shots=shots,
        )
        return NoiseSimulationResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail={"error_code": "INVALID_NOISE_PARAM", "message": str(ve)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "NOISE_SIMULATION_ERROR", "message": str(e)})


@router.post("/report/pdf")
async def generate_pdf_report_endpoint(request: ReportGenerateRequest):
    try:
        pdf_bytes = QuantumReportGenerator.generate_pdf_bytes(
            circuit=request.circuit,
            algorithm_name=request.algorithm_name or "Custom Quantum Algorithm",
            author_name=request.author_name or "Team Gitwolves",
            include_noise=request.include_noise,
            noise_profile=request.noise_profile or "ibm_eagle",
            shots=request.shots or 1024,
        )
        filename = f"Quantum_Report_{str(uuid.uuid4())[:8].upper()}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "PDF_GENERATION_ERROR", "message": str(e)})


@router.post("/report/json")
async def generate_json_report_endpoint(request: ReportGenerateRequest):
    try:
        bundle = QuantumReportGenerator.generate_json_bundle(
            circuit=request.circuit,
            algorithm_name=request.algorithm_name or "Custom Quantum Algorithm",
            include_noise=request.include_noise,
            noise_profile=request.noise_profile or "ibm_eagle",
            shots=request.shots or 1024,
        )
        return bundle
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "JSON_REPORT_ERROR", "message": str(e)})

