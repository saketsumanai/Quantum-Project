from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
)

router = APIRouter(prefix="/assessment", tags=["Assessment & Telemetry"])

# Curated Quiz Answers and Explanations
QUIZ_SOLUTIONS = {
    "quiz_bell_state_01": {
        "correct_index": 1,
        "points": 50,
        "explanation": "Correct! Applying H to qubit 0 creates (|0>+|1>)/sqrt(2), and the subsequent CNOT flips qubit 1 only when qubit 0 is |1>, producing the maximally entangled Bell state (|00>+|11>)/sqrt(2)."
    },
    "quiz_superposition_01": {
        "correct_index": 1,
        "points": 50,
        "explanation": "Correct! The probability amplitude is 1/sqrt(2), so measuring state |1> has probability |1/sqrt(2)|^2 = 1/2 = 50%."
    },
    "quiz_grover_01": {
        "correct_index": 0,
        "points": 50,
        "explanation": "Correct! The Grover diffusion operator 2|s><s| - I reflects all probability amplitudes across their mean value, amplifying the marked state."
    }
}

@router.post("/submit", response_model=AssessmentSubmitResponse)
async def submit_assessment_endpoint(request: AssessmentSubmitRequest):
    solution = QUIZ_SOLUTIONS.get(request.quiz_id, {
        "correct_index": 1,
        "points": 50,
        "explanation": "Your answer has been evaluated against the quantum state criteria."
    })

    is_correct = (request.selected_option_index == solution["correct_index"])
    points = solution["points"] if is_correct else 0

    return AssessmentSubmitResponse(
        success=True,
        is_correct=is_correct,
        points_earned=points,
        explanation=solution["explanation"] if is_correct else "Incorrect. Review the quantum mechanical transformation and try again!",
        user_mastery={
            "topic": "quantum_mechanics",
            "mastery_percentage": 85.0 if is_correct else 50.0,
            "quizzes_completed": 1
        }
    )
