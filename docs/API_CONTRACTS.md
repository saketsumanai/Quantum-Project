# API Contracts & Interface Specification
## AI-Powered Interactive Quantum Algorithm Learning Platform (SIH 2026)

---

## 1. Global API Standards

* **Base URL**: `http://localhost:8000/api/v1`
* **Data Format**: `application/json` (UTF-8)
* **Authentication**: Optional for anonymous exploration; Bearer JWT header (`Authorization: Bearer <token>`) required for progress saving and user profiles.
* **Standard Error Envelope**:
  ```json
  {
    "success": false,
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "Detailed human-readable explanation of error condition",
    "timestamp": "2026-09-13T15:30:00Z"
  }
  ```

---

## 2. Quantum Simulation Service (`/api/v1/simulation`)

### 2.1 Execute Circuit (`POST /simulation/run`)
* **Description**: Simulates an intermediate circuit representation (CIR) on the requested quantum framework.
* **Owner**: Member 2 (Jayesh Kapoor)
* **Primary Consumer**: Member 1 (Frontend Circuit Designer)
* **Auth Requirement**: Optional

#### Request Body
```json
{
  "framework": "qiskit",
  "shots": 1024,
  "circuit": {
    "num_qubits": 2,
    "num_clbits": 2,
    "instructions": [
      { "gate": "h", "qubits": [0], "params": [] },
      { "gate": "cx", "qubits": [0, 1], "params": [] },
      { "gate": "measure", "qubits": [0, 1], "clbits": [0, 1] }
    ]
  }
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "execution_time_ms": 14.2,
  "framework": "qiskit",
  "shots": 1024,
  "counts": {
    "00": 519,
    "11": 505
  },
  "probabilities": {
    "00": 0.5068,
    "11": 0.4932
  },
  "qasm_export": "OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];"
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "error_code": "INVALID_CIRCUIT_STRUCTURE",
  "message": "Qubit index 3 exceeds allocated wire count of 2.",
  "timestamp": "2026-09-13T15:30:00Z"
}
```

---

### 2.2 Calculate Statevector & Bloch Angles (`POST /simulation/statevector`)
* **Description**: Extracts the exact pure quantum statevector and calculates single-qubit Bloch sphere spherical angles $(\theta, \phi)$ before measurement.
* **Owner**: Member 2 (Jayesh Kapoor)
* **Primary Consumer**: Member 4 (Three.js 3D Visualization)
* **Auth Requirement**: Optional

#### Request Body
```json
{
  "circuit": {
    "num_qubits": 1,
    "instructions": [
      { "gate": "h", "qubits": [0], "params": [] }
    ]
  }
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "num_qubits": 1,
  "statevector": [
    { "real": 0.70710678, "imag": 0.0, "amplitude_sq": 0.5, "phase_rad": 0.0 },
    { "real": 0.70710678, "imag": 0.0, "amplitude_sq": 0.5, "phase_rad": 0.0 }
  ],
  "bloch_coordinates": [
    {
      "qubit_index": 0,
      "theta_rad": 1.570796,
      "phi_rad": 0.0,
      "x": 1.0,
      "y": 0.0,
      "z": 0.0
    }
  ]
}
```

---

## 3. AI Quantum Tutor & RAG Service (`/api/v1/ai-tutor`)

### 3.1 Conversational Context Query (`POST /ai-tutor/query`)
* **Description**: Queries the educational knowledge base using hybrid RAG to generate plain explanations, LaTeX formulas, and runnable code.
* **Owner**: Member 4 (Apurva Sinha - Main AI Lead) & Member 3 (Manas Thakur - Quantum Math & AI Co-Lead)
* **Primary Consumer**: Member 1 (AI Chat Drawer)
* **Auth Requirement**: Optional

#### Request Body
```json
{
  "user_query": "How does quantum entanglement work between two qubits?",
  "active_circuit_context": {
    "num_qubits": 2,
    "gates_applied": ["h", "cx"]
  },
  "current_topic": "entanglement"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "intent_classification": "entanglement",
  "vocal_prose_script": "When two qubits become entangled, measuring the state of the first qubit immediately determines the outcome of the second qubit regardless of the distance between them. This correlated pair is created by applying a Hadamard gate to place the control qubit into equal superposition, followed by a controlled not gate targeting the second qubit.",
  "mathematical_latex_formula": "|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)",
  "qiskit_executable_code": "from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])\n\nsimulator = AerSimulator()\nresult = simulator.run(qc, shots=1024).result()\nprint(result.get_counts())",
  "quiz_generation_object": {
    "question_string": "What quantum state is produced when a two-qubit system initialized to state zero zero undergoes a Hadamard gate on qubit zero followed by a controlled NOT gate?",
    "options_array": [
      "A product state of zero zero and zero one",
      "A maximally entangled Bell state where the qubits are correlated",
      "A completely decoherent mixed state",
      "An unentangled superposition state"
    ],
    "valid_index_pointer": 1
  },
  "is_cached_fallback": false
}
```

---

## 4. Assessment & Telemetry Service (`/api/v1/assessment`)

### 4.1 Submit Quiz Attempt (`POST /assessment/submit`)
* **Description**: Verifies a student's answer, calculates updated mastery telemetry, and records the attempt.
* **Owner**: Member 4 (Apurva Sinha)
* **Primary Consumer**: Member 1 (Assessment View)
* **Auth Requirement**: Optional (Recorded to session if unauthenticated)

#### Request Body
```json
{
  "quiz_id": "quiz_bell_state_01",
  "selected_option_index": 1,
  "time_taken_seconds": 24
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "is_correct": true,
  "points_earned": 50,
  "explanation": "Correct! Applying H to qubit 0 creates (|0>+|1>)/sqrt(2), and the subsequent CNOT flips qubit 1 only when qubit 0 is |1>, producing the maximally entangled Bell state (|00>+|11>)/sqrt(2).",
  "user_mastery": {
    "topic": "entanglement",
    "mastery_percentage": 85.0,
    "quizzes_completed": 4
  }
}
```

---

## 5. User Authentication & Progress Service (`/api/v1/auth`)

### 5.1 Student Registration (`POST /auth/register`)
* **Owner**: Member 5 (Saket Suman)
* **Consumer**: Member 1 (Login/Signup Modal)

#### Request Body
```json
{
  "email": "student@hackathon.org",
  "password": "SecurePassword123!",
  "display_name": "Quantum Explorer"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr_9a8b7c6d",
    "email": "student@hackathon.org",
    "display_name": "Quantum Explorer",
    "created_at": "2026-09-13T15:30:00Z"
  }
}
```

---

## 6. System Health & Failsafe Diagnostic (`GET /health`)
* **Description**: Verifies the operational status of all subsystems (Qiskit simulator, RAG vector store, database).

#### Success Response (`200 OK`)
```json
{
  "status": "healthy",
  "environment": "development",
  "services": {
    "qiskit_simulator": "available",
    "pennylane_simulator": "available",
    "cirq_simulator": "available",
    "rag_vector_store": "loaded_142_documents",
    "database": "connected_sqlite",
    "offline_failsafe_cache": "active_5_presets"
  },
  "version": "1.0.0-sih"
}
```
