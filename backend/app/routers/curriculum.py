import os
import json
from datetime import datetime
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from backend.app.models.schemas import (
    CurriculumModule,
    CircuitModel,
    BookEntry,
    DiracBadge,
    UserProgressResponse,
    LessonCompletionRequest,
)
from backend.app.services.curriculum.curriculum_service import (
    get_all_modules,
    PRESET_CIRCUITS,
    get_preset,
)
from backend.app.db.database import get_db
from backend.app.db.models import User, LessonProgress, QuizAttempt
from backend.app.core.security import get_current_user_payload

router = APIRouter(prefix="/curriculum", tags=["Quantum Curriculum"])

# --- Lazy-loaded 150-Book Library ---
_BOOK_LIBRARY: List[Dict[str, Any]] = []

def _get_library() -> List[Dict[str, Any]]:
    global _BOOK_LIBRARY
    if not _BOOK_LIBRARY:
        possible_paths = [
            os.path.join(os.getcwd(), "data", "books", "quantum_library_150.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "books", "quantum_library_150.json"),
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        _BOOK_LIBRARY = data.get("library", [])
                        break
                except Exception as e:
                    print(f"[Curriculum Router] Error reading library file: {e}")
    return _BOOK_LIBRARY

DIRAC_BADGES_DEFINITIONS = [
    {
        "id": "superposition_apprentice",
        "title": "Superposition Apprentice",
        "symbol": "|0⟩ → |+⟩",
        "latex_verification": "\\langle\\psi|\\psi\\rangle = |\\alpha|^2 + |\\beta|^2 = 1.00",
        "description": "Mastered single-qubit statevectors and Hadamard basis transformations",
        "required_lessons": ["unit-1", "lesson_1_1"],
    },
    {
        "id": "epr_pioneer",
        "title": "Entanglement Pioneer",
        "symbol": "|Φ⁺⟩",
        "latex_verification": "|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)",
        "description": "Constructed maximally entangled Bell states and analyzed non-local correlation",
        "required_lessons": ["unit-3", "lesson_2_1"],
    },
    {
        "id": "oracle_seeker",
        "title": "Quantum Oracle Seeker",
        "symbol": "G_oracle",
        "latex_verification": "G = (2|s\\rangle\\langle s| - I) R_\\omega",
        "description": "Executed Grover amplitude amplification achieving quadratic quantum speedup",
        "required_lessons": ["unit-2", "lesson_3_1", "grover-mod"],
    },
    {
        "id": "fourier_analyst",
        "title": "Fourier Phase Analyst",
        "symbol": "QFT",
        "latex_verification": "|j\\rangle \\mapsto \\frac{1}{\\sqrt{N}} \\sum_{k=0}^{N-1} e^{2\\pi i j k / N}|k\\rangle",
        "description": "Transformed quantum amplitudes into relative phase frequency distributions",
        "required_lessons": ["qft-mod", "unit-3"],
    },
    {
        "id": "shor_cryptanalyst",
        "title": "Shor Factorization Analyst",
        "symbol": "aʳ ≡ 1",
        "latex_verification": "a^r \\equiv 1 \\pmod N \\implies \\gcd(a^{r/2} \\pm 1, N)",
        "description": "Executed polynomial-time order finding for modular exponential sequences",
        "required_lessons": ["shor-mod"],
    },
    {
        "id": "variational_solver",
        "title": "Variational Eigensolver",
        "symbol": "⟨H⟩_θ",
        "latex_verification": "\\langle\\psi(\\theta)| H |\\psi(\\theta)\\rangle \\ge E_0",
        "description": "Simulated molecular Hamiltonians via hybrid classical-quantum optimization",
        "required_lessons": ["vqe-mod"],
    },
    {
        "id": "stabilizer_guardian",
        "title": "Stabilizer Guardian",
        "symbol": "S|ψ⟩ = +|ψ⟩",
        "latex_verification": "S_i |\\psi_L\\rangle = +1 |\\psi_L\\rangle, \\quad \\forall S_i \\in \\mathcal{S}",
        "description": "Protected quantum superpositions using syndrome parity measurements",
        "required_lessons": ["qec-mod"],
    },
    {
        "id": "fault_tolerant_architect",
        "title": "Fault-Tolerant Architect",
        "symbol": "d = 3 Surface",
        "latex_verification": "H_X, H_Z \\text{ Plaquettes} \\implies P_L < 10^{-6}",
        "description": "Verified topological error suppression on 2D rotated surface codes",
        "required_lessons": ["surface-codes"],
    },
]

@router.get("/modules", response_model=List[CurriculumModule])
async def get_modules_endpoint():
    return get_all_modules()

@router.get("/presets", response_model=Dict[str, CircuitModel])
async def get_presets_endpoint():
    return PRESET_CIRCUITS

@router.get("/presets/{preset_key}", response_model=CircuitModel)
async def get_single_preset_endpoint(preset_key: str):
    if preset_key not in PRESET_CIRCUITS:
        raise HTTPException(status_code=404, detail="Preset circuit not found")
    return get_preset(preset_key)

@router.get("/library", response_model=List[BookEntry])
async def get_library_endpoint(
    category: Optional[str] = None,
    limit: int = Query(default=150, ge=1, le=150),
):
    books = _get_library()
    if category:
        books = [b for b in books if b.get("category", "").lower() == category.lower()]
    return books[:limit]

@router.get("/library/search", response_model=List[BookEntry])
async def search_library_endpoint(
    q: str = Query(..., min_length=1),
    category: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=150),
):
    query = q.lower().strip()
    results = []
    for b in _get_library():
        if category and b.get("category", "").lower() != category.lower():
            continue
        title = b.get("title", "").lower()
        author = b.get("author", "").lower()
        summary = b.get("training_vector_summary", "").lower()
        concepts = [c.lower() for c in b.get("key_concepts", [])]

        if query in title or query in author or query in summary or any(query in c for c in concepts):
            results.append(b)

    return results[:limit]

@router.get("/progress", response_model=UserProgressResponse)
async def get_user_progress_endpoint(
    db: Session = Depends(get_db),
    user_payload: Optional[dict] = Depends(get_current_user_payload),
):
    completed_lesson_ids = set()
    total_xp = 150

    if user_payload:
        uid = user_payload.get("sub")
        user = db.query(User).filter(User.id == uid).first()
        if user:
            total_xp = user.total_xp
            prog_entries = db.query(LessonProgress).filter(
                LessonProgress.user_id == uid,
                LessonProgress.is_completed == True,
            ).all()
            completed_lesson_ids = {p.lesson_id for p in prog_entries}

    badges = []
    for b_def in DIRAC_BADGES_DEFINITIONS:
        is_unlocked = any(r in completed_lesson_ids for r in b_def["required_lessons"]) or (total_xp >= 150 and b_def["id"] == "superposition_apprentice")
        badges.append(DiracBadge(
            id=b_def["id"],
            title=b_def["title"],
            symbol=b_def["symbol"],
            latex_verification=b_def["latex_verification"],
            description=b_def["description"],
            unlocked=is_unlocked,
            unlocked_at=datetime.utcnow().isoformat() if is_unlocked else None,
        ))

    mastery_pct = round((len(completed_lesson_ids) / max(len(DIRAC_BADGES_DEFINITIONS), 1)) * 100, 1)

    return UserProgressResponse(
        success=True,
        total_xp=total_xp,
        completed_lessons=list(completed_lesson_ids),
        badges=badges,
        overall_mastery_pct=mastery_pct,
    )

@router.post("/progress/complete", response_model=UserProgressResponse)
async def complete_lesson_endpoint(
    request: LessonCompletionRequest,
    db: Session = Depends(get_db),
    user_payload: Optional[dict] = Depends(get_current_user_payload),
):
    completed_lesson_ids = {request.lesson_id}
    total_xp = 150 + (request.score_delta or 50)

    if user_payload:
        uid = user_payload.get("sub")
        user = db.query(User).filter(User.id == uid).first()
        if user:
            user.total_xp += (request.score_delta or 50)
            existing = db.query(LessonProgress).filter(
                LessonProgress.user_id == uid,
                LessonProgress.lesson_id == request.lesson_id,
            ).first()
            if existing:
                existing.is_completed = True
                existing.completed_at = datetime.utcnow()
            else:
                new_prog = LessonProgress(
                    user_id=uid,
                    lesson_id=request.lesson_id,
                    module_id=request.module_id,
                    is_completed=True,
                    completion_percentage=100.0,
                    completed_at=datetime.utcnow(),
                )
                db.add(new_prog)
            db.commit()

            prog_entries = db.query(LessonProgress).filter(
                LessonProgress.user_id == uid,
                LessonProgress.is_completed == True,
            ).all()
            completed_lesson_ids = {p.lesson_id for p in prog_entries}
            total_xp = user.total_xp

    badges = []
    for b_def in DIRAC_BADGES_DEFINITIONS:
        is_unlocked = any(r in completed_lesson_ids for r in b_def["required_lessons"]) or (total_xp >= 150 and b_def["id"] == "superposition_apprentice")
        badges.append(DiracBadge(
            id=b_def["id"],
            title=b_def["title"],
            symbol=b_def["symbol"],
            latex_verification=b_def["latex_verification"],
            description=b_def["description"],
            unlocked=is_unlocked,
            unlocked_at=datetime.utcnow().isoformat() if is_unlocked else None,
        ))

    mastery_pct = round((len(completed_lesson_ids) / max(len(DIRAC_BADGES_DEFINITIONS), 1)) * 100, 1)

    return UserProgressResponse(
        success=True,
        total_xp=total_xp,
        completed_lessons=list(completed_lesson_ids),
        badges=badges,
        overall_mastery_pct=mastery_pct,
    )
