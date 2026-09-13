from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.models.schemas import (
    AITutorQueryRequest,
    AITutorQueryResponse,
)
from backend.app.services.ai.tutor_service import AITutorService, KNOWLEDGE_CATALOG

router = APIRouter(prefix="/ai-tutor", tags=["AI Quantum Tutor"])
tutor_service = AITutorService()

@router.post("/query", response_model=AITutorQueryResponse)
async def query_ai_tutor_endpoint(request: AITutorQueryRequest):
    try:
        response = await tutor_service.query(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "AI_TUTOR_ERROR", "message": str(e)})

@router.get("/library", response_model=List[Dict[str, Any]])
async def get_library_catalog_endpoint():
    return KNOWLEDGE_CATALOG
