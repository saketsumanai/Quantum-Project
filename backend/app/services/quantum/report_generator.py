"""
Quantum Leap — Comprehensive Lab Report Generator (PDF & JSON)
==============================================================
Generates publication-quality quantum algorithm experiment reports:
1. PDF Lab Report (via ReportLab):
   - Document Title & SIH 2026 Gitwolves Identification
   - Execution Timestamp & Circuit UUID
   - Circuit Architecture & Instruction Matrix
   - Gate Telemetry & Circuit Depth Analytics
   - Quantum State Analysis: Basis States, Amplitudes (Real & Imag), Probabilities, Phases
   - Bloch Vector Coordinates (x, y, z, theta, phi) for each qubit
   - NISQ Hardware Noise & Decoherence Benchmark (Ideal vs Noisy Fidelity)
2. JSON Lab Report Bundle:
   - Full machine-readable export with raw state vectors, transpilation targets, and counts.
"""

import io
import time
import uuid
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)

from backend.app.models.schemas import CircuitModel
from backend.app.services.quantum.engine import QuantumSimulationEngine
from backend.app.services.quantum.transpiler import QuantumTranspiler
from backend.app.services.quantum.noise_engine import QuantumNoiseEngine


class QuantumReportGenerator:
    """Generates verifiable lab reports for quantum algorithms in PDF and JSON formats."""

    @classmethod
    def generate_pdf_bytes(
        cls,
        circuit: CircuitModel,
        algorithm_name: str = "Custom Quantum Circuit",
        author_name: str = "Team Gitwolves Researcher",
        include_noise: bool = True,
        noise_profile: str = "ibm_eagle",
        shots: int = 1024,
    ) -> bytes:
        """Render a formatted PDF lab report into a byte stream."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()

        # Custom academic styling in clean dark slate / monochrome palette
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Times-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#09090b"),
            spaceAfter=4,
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#52525b"),
            spaceAfter=12,
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Normal"],
            fontName="Times-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#18181b"),
            spaceBefore=10,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#27272a"),
        )
        mono_style = ParagraphStyle(
            "Mono",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#18181b"),
        )

        elements = []

        # Run simulations
        engine = QuantumSimulationEngine(max_qubits=16)
        flat_state, bloch_coords = engine.simulate_statevector(circuit)
        telemetry = QuantumTranspiler.analyze_circuit(circuit)

        noise_result = None
        if include_noise and circuit.num_qubits <= 8:
            noise_engine = QuantumNoiseEngine(max_qubits=8)
            noise_result = noise_engine.simulate_noisy_circuit(circuit, profile_key=noise_profile, shots=shots)

        report_id = str(uuid.uuid4())[:8].upper()
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. Header & Metadata
        elements.append(Paragraph("QUANTUM LEAP - LABORATORY BENCHMARK REPORT", title_style))
        elements.append(Paragraph(
            f"Smart India Hackathon 2026 | Team Gitwolves | Report ID: QL-{report_id} | Generated: {timestamp}",
            subtitle_style,
        ))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#18181b"), spaceAfter=10))

        # Metadata Table
        meta_data = [
            [
                Paragraph("<b>Algorithm / Experiment:</b>", body_style),
                Paragraph(algorithm_name, body_style),
                Paragraph("<b>Qubit Width:</b>", body_style),
                Paragraph(f"{circuit.num_qubits} Qubits", body_style),
            ],
            [
                Paragraph("<b>Principal Investigator:</b>", body_style),
                Paragraph(author_name, body_style),
                Paragraph("<b>Circuit Depth:</b>", body_style),
                Paragraph(f"{telemetry['circuit_depth']} Layers", body_style),
            ],
            [
                Paragraph("<b>Total Gate Operations:</b>", body_style),
                Paragraph(f"{telemetry['total_gates']} Gates", body_style),
                Paragraph("<b>Hardware Target:</b>", body_style),
                Paragraph(noise_result["profile"] if noise_result else "Ideal Statevector Simulator", body_style),
            ],
        ]
        t_meta = Table(meta_data, colWidths=[130, 160, 100, 150])
        t_meta.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f4f4f5")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d4d4d8")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e4e4e7")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_meta)
        elements.append(Spacer(1, 12))

        # 2. Gate Telemetry Breakdown Table
        elements.append(Paragraph("1. Hardware Telemetry & Gate Complexity", section_heading))
        gate_summary = [
            ["Metric", "Value", "Metric", "Value"],
            ["Total Gate Count", str(telemetry["total_gates"]), "Single-Qubit Gates", str(telemetry["single_qubit_gates"])],
            ["Two-Qubit (Entangling) Gates", str(telemetry["two_qubit_gates"]), "Rotation Gates (Rx, Ry, Rz, CP)", str(telemetry["rotation_gates"])],
            ["Circuit Depth", str(telemetry["circuit_depth"]), "Measurement Count", str(telemetry["measurement_count"])],
            ["Quantum Volume (Est.)", str(telemetry["quantum_volume_est"]), "Basis Gates Used", ", ".join(telemetry["basis_gates"])],
        ]
        t_gates = Table(gate_summary, colWidths=[150, 120, 150, 120])
        t_gates.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#27272a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d4d4d8")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_gates)
        elements.append(Spacer(1, 12))

        # 3. Quantum State Analysis (Statevector Table)
        elements.append(Paragraph("2. Mathematical Statevector & Amplitude Decomposition", section_heading))
        num_q = circuit.num_qubits
        basis_labels = [f"{i:0{num_q}b}" for i in range(2 ** num_q)]

        state_rows = [["Basis State |j>", "Real Amp", "Imag Amp", "Probability |c|^2", "Phase (rad)"]]
        for idx, amp in enumerate(flat_state):
            p = float(abs(amp) ** 2)
            if p > 0.0005 or len(flat_state) <= 8:  # Show non-negligible amplitudes or full basis for small systems
                real = float(amp.real)
                imag = float(amp.imag)
                phase = math.atan2(imag, real) if abs(real) > 1e-9 or abs(imag) > 1e-9 else 0.0
                state_rows.append([
                    f"|{basis_labels[idx]}>",
                    f"{real:+.5f}",
                    f"{imag:+.5f} j",
                    f"{p * 100.0:.2f} %",
                    f"{phase:+.4f}",
                ])

        t_state = Table(state_rows, colWidths=[100, 110, 110, 110, 110])
        t_state.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18181b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d4d4d8")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_state)
        elements.append(Spacer(1, 12))

        # 4. Bloch Coordinates Table
        elements.append(Paragraph("3. Reduced Density Matrix & Bloch Sphere Coordinates", section_heading))
        bloch_rows = [["Qubit Wire", "x = Tr(X rho)", "y = Tr(Y rho)", "z = Tr(Z rho)", "Theta (rad)", "Phi (rad)"]]
        for bc in bloch_coords:
            bloch_rows.append([
                f"Wire q[{bc.qubit_index}]",
                f"{bc.x:+.4f}",
                f"{bc.y:+.4f}",
                f"{bc.z:+.4f}",
                f"{bc.theta_rad:.4f}",
                f"{bc.phi_rad:.4f}",
            ])
        t_bloch = Table(bloch_rows, colWidths=[90, 90, 90, 90, 90, 90])
        t_bloch.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#27272a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d4d4d8")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_bloch)
        elements.append(Spacer(1, 12))

        # 5. Hardware Noise & Fidelity Impact (if enabled)
        if noise_result:
            elements.append(Paragraph("4. Physical NISQ Noise Impact & Decoherence Benchmark", section_heading))
            noise_summary = [
                ["Hardware Noise Parameter", "Target System Value", "Observed Impact", "State Quality"],
                [
                    "Architecture Profile",
                    noise_result["profile"],
                    f"Quantum State Fidelity F",
                    f"{noise_result['fidelity_pct']}%",
                ],
                [
                    "Thermal Relaxation (T1)",
                    f"{noise_result['t1_us']:.1f} microseconds",
                    f"State Purity Tr(rho^2)",
                    f"{noise_result['purity']:.4f}",
                ],
                [
                    "Dephasing Coherence (T2)",
                    f"{noise_result['t2_us']:.1f} microseconds",
                    f"Readout Error Rate",
                    f"{noise_result['readout_error_pct']}%",
                ],
            ]
            t_noise = Table(noise_summary, colWidths=[140, 130, 140, 130])
            t_noise.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#09090b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d4d4d8")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            elements.append(t_noise)

        # Build document
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @classmethod
    def generate_json_bundle(
        cls,
        circuit: CircuitModel,
        algorithm_name: str = "Custom Quantum Circuit",
        include_noise: bool = True,
        noise_profile: str = "ibm_eagle",
        shots: int = 1024,
    ) -> Dict[str, Any]:
        """Generate structured JSON lab bundle for automated testing and CI/CD pipelines."""
        engine = QuantumSimulationEngine(max_qubits=16)
        flat_state, bloch_coords = engine.simulate_statevector(circuit)
        telemetry = QuantumTranspiler.analyze_circuit(circuit)
        transpiled = QuantumTranspiler.transpile_all(circuit)

        num_q = circuit.num_qubits
        basis_labels = [f"{i:0{num_q}b}" for i in range(2 ** num_q)]

        statevector_list = []
        for idx, amp in enumerate(flat_state):
            real = float(amp.real)
            imag = float(amp.imag)
            p = float(abs(amp) ** 2)
            phase = math.atan2(imag, real) if abs(real) > 1e-9 or abs(imag) > 1e-9 else 0.0
            statevector_list.append({
                "basis_state": basis_labels[idx],
                "real": round(real, 6),
                "imag": round(imag, 6),
                "probability": round(p, 6),
                "phase_rad": round(phase, 6),
            })

        bloch_list = [
            {
                "qubit_index": bc.qubit_index,
                "x": bc.x,
                "y": bc.y,
                "z": bc.z,
                "theta_rad": bc.theta_rad,
                "phi_rad": bc.phi_rad,
            }
            for bc in bloch_coords
        ]

        noise_data = None
        if include_noise and circuit.num_qubits <= 8:
            noise_engine = QuantumNoiseEngine(max_qubits=8)
            noise_data = noise_engine.simulate_noisy_circuit(circuit, profile_key=noise_profile, shots=shots)

        return {
            "report_metadata": {
                "report_id": f"QL-{str(uuid.uuid4())[:8].upper()}",
                "timestamp": datetime.utcnow().isoformat(),
                "project": "Quantum Leap (SIH 2026)",
                "team": "Gitwolves",
                "algorithm_name": algorithm_name,
            },
            "circuit_ast": circuit.model_dump(),
            "telemetry": telemetry,
            "mathematical_state": {
                "num_qubits": num_q,
                "statevector": statevector_list,
                "bloch_coordinates": bloch_list,
            },
            "hardware_noise_simulation": noise_data,
            "transpiled_frameworks": {
                "qiskit": transpiled["qiskit"],
                "openqasm3": transpiled["openqasm3"],
                "openqasm2": transpiled["openqasm2"],
                "cirq": transpiled["cirq"],
                "pennylane": transpiled["pennylane"],
            },
        }
