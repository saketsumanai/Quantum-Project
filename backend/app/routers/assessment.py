from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.models.schemas import (
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
)
from backend.app.db.database import get_db
from backend.app.db.models import User, QuizAttempt
from backend.app.core.security import get_current_user_payload

router = APIRouter(prefix="/assessment", tags=["Assessment & Telemetry"])

QUIZ_SOLUTIONS = {
    "quiz_bell_state_01":       {"correct_index": 1, "points": 50, "topic": "entanglement",   "explanation": "Correct! H on q₀ creates (|0⟩+|1⟩)/√2; CNOT entangles q₁, producing (|00⟩+|11⟩)/√2 — a maximally entangled Bell state."},
    "quiz_superposition_01":    {"correct_index": 1, "points": 50, "topic": "superposition",  "explanation": "Correct! P(|1⟩) = |1/√2|² = 0.5 = 50%."},
    "quiz_grover_01":           {"correct_index": 0, "points": 50, "topic": "grover",         "explanation": "Correct! The diffusion operator 2|s⟩⟨s|−I reflects all amplitudes about their mean."},
    "quiz_teleportation_01":    {"correct_index": 1, "points": 50, "topic": "teleportation",  "explanation": "Correct! Alice must transmit 2 classical bits (at light speed) for Bob to apply corrections."},
    "quiz_vqe_01":              {"correct_index": 1, "points": 50, "topic": "vqe",            "explanation": "Correct! The Rayleigh-Ritz variational principle guarantees the VQE energy estimate is always ≥ true ground state energy."},
}

@router.post("/submit", response_model=AssessmentSubmitResponse)
async def submit_assessment(
    request: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload),
):
    solution = QUIZ_SOLUTIONS.get(request.quiz_id, {
        "correct_index": 1,
        "points": 50,
        "topic": "quantum_mechanics",
        "explanation": "Your answer has been recorded.",
    })

    is_correct = request.selected_option_index == solution["correct_index"]
    points = solution["points"] if is_correct else 0
    topic = solution["topic"]

    # Save to DB if user is authenticated
    if user_payload:
        uid = user_payload.get("sub")
        user = db.query(User).filter(User.id == uid).first()
        if user:
            attempt = QuizAttempt(
                user_id=uid,
                quiz_id=request.quiz_id,
                selected_option=request.selected_option_index,
                is_correct=is_correct,
                points_earned=points,
                time_taken_seconds=request.time_taken_seconds or 0,
                topic=topic,
            )
            db.add(attempt)
            user.total_xp += points
            db.commit()

    # Calculate mastery from DB if authenticated
    mastery_pct = 85.0 if is_correct else 50.0
    quizzes_done = 1
    if user_payload:
        uid = user_payload.get("sub")
        correct_count = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == uid,
            QuizAttempt.topic == topic,
            QuizAttempt.is_correct == True,
        ).count()
        total_count = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == uid,
            QuizAttempt.topic == topic,
        ).count()
        quizzes_done = total_count
        mastery_pct = round((correct_count / max(total_count, 1)) * 100, 1)

    return AssessmentSubmitResponse(
        success=True,
        is_correct=is_correct,
        points_earned=points,
        explanation=solution["explanation"] if is_correct else "Incorrect — re-examine the state transformation!",
        user_mastery={"topic": topic, "mastery_percentage": mastery_pct, "quizzes_completed": quizzes_done},
    )
