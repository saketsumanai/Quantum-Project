from fastapi import APIRouter, HTTPException
from typing import List, Dict
from backend.app.models.schemas import CurriculumModule, CircuitModel
from backend.app.services.curriculum.curriculum_service import get_all_modules, PRESET_CIRCUITS, get_preset

router = APIRouter(prefix="/curriculum", tags=["Quantum Curriculum"])

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
