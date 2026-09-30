"""
Quantum Lecture Hindi & Indian Language Dubbing Router
======================================================
API Endpoints:
  POST /api/v1/dubbing/dub-quantum-lecture — Starts quantum-aware dubbing job
  GET  /api/v1/dubbing/status/{video_id}    — Polls real-time progress & video URL
  GET  /api/v1/dubbing/glossary             — Retrieves active quantum glossary terms
  GET  /api/v1/dubbing/list                 — Lists all pre-rendered dubbed lectures
"""

import os
import json
import time
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.app.services.ai.quantum_dubber import (
    extract_video_id,
    run_quantum_dubbing_pipeline,
    fetch_youtube_metadata,
    QUANTUM_GLOSSARY,
    DUBBING_JOBS,
    OUTPUT_DIR,
)

router = APIRouter(prefix="/dubbing", tags=["Quantum Video Dubbing"])

class DubLectureRequest(BaseModel):
    youtube_url: str
    target_language: Optional[str] = "hi"
    voice: Optional[str] = "hi-IN-MadhurNeural"
    custom_transcript: Optional[str] = None
    force_reprocess: Optional[bool] = False

class DubLectureResponse(BaseModel):
    status: str
    message: str
    video_id: str
    watch_url: str
    audio_url: str
    progress: int
    step: str
    glossary_terms_preserved: Optional[List[str]] = None
    video_title: Optional[str] = None
    author_name: Optional[str] = None
    thumbnail_url: Optional[str] = None
    translated_transcript: Optional[str] = None
    segments: Optional[List[Dict[str, Any]]] = None

@router.get("/metadata/{video_id}")
async def get_video_metadata_endpoint(video_id: str):
    """Fetches real YouTube title, author, and thumbnail via oEmbed."""
    return await fetch_youtube_metadata(video_id)

@router.post("/dub-quantum-lecture", response_model=DubLectureResponse)
async def dub_quantum_lecture_endpoint(
    request: DubLectureRequest,
    background_tasks: BackgroundTasks
):
    if not request.youtube_url:
        raise HTTPException(status_code=400, detail="Missing YouTube URL or video ID")

    video_id = extract_video_id(request.youtube_url)
    target_lang = (request.target_language or "hi").lower()
    final_output_file = os.path.join(OUTPUT_DIR, f"{video_id}_{target_lang}.mp4")
    final_audio_file = os.path.join(OUTPUT_DIR, f"{video_id}_{target_lang}.mp3")
    sidecar_file = os.path.join(OUTPUT_DIR, f"{video_id}_{target_lang}.json")

    # Fast cache check: If already processed and not forced reprocess, return immediately!
    if os.path.exists(final_output_file) and not request.force_reprocess:
        if os.path.exists(sidecar_file):
            try:
                with open(sidecar_file, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    return DubLectureResponse(**cached_data)
            except Exception:
                pass

        meta = await fetch_youtube_metadata(video_id)
        return DubLectureResponse(
            status="completed",
            message="Lecture is already pre-rendered and ready for instant playback!",
            video_id=video_id,
            video_title=meta.get("title", f"Quantum Computing Lecture ({video_id})"),
            author_name=meta.get("author_name", "Quantum Educator"),
            thumbnail_url=meta.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
            watch_url=f"/platform_dubs/{video_id}_{target_lang}.mp4",
            audio_url=f"/platform_dubs/{video_id}_{target_lang}.mp3",
            progress=100,
            step="completed",
            glossary_terms_preserved=["qubit", "superposition", "entanglement", "circuit", "gate", "decoherence"],
        )

    # Initialize job entry in registry
    meta = await fetch_youtube_metadata(video_id)
    DUBBING_JOBS[video_id] = {
        "video_id": video_id,
        "youtube_url": request.youtube_url,
        "status": "processing",
        "step": "initializing",
        "progress": 5,
        "message": f"Quantum dubbing worker initiated for '{meta.get('title')}'...",
        "video_title": meta.get("title", f"Quantum Computing Lecture ({video_id})"),
        "author_name": meta.get("author_name", "Quantum Educator"),
        "thumbnail_url": meta.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
        "watch_url": f"/platform_dubs/{video_id}_{target_lang}.mp4",
        "audio_url": f"/platform_dubs/{video_id}_{target_lang}.mp3",
        "created_at": time.time(),
        "glossary_terms_preserved": [],
        "translated_transcript": "",
        "segments": [],
    }

    # Queue background processing
    background_tasks.add_task(
        run_quantum_dubbing_pipeline,
        video_id=video_id,
        youtube_url=request.youtube_url,
        target_language=target_lang,
        voice=request.voice,
        custom_transcript=request.custom_transcript,
    )

    return DubLectureResponse(
        status="processing",
        message="The Quantum Lecture is being converted with technical terms preserved.",
        video_id=video_id,
        video_title=meta.get("title", f"Quantum Computing Lecture ({video_id})"),
        author_name=meta.get("author_name", "Quantum Educator"),
        thumbnail_url=meta.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
        watch_url=f"/platform_dubs/{video_id}_{target_lang}.mp4",
        audio_url=f"/platform_dubs/{video_id}_{target_lang}.mp3",
        progress=5,
        step="initializing",
        glossary_terms_preserved=[],
        segments=[],
    )

@router.get("/status/{video_id}")
async def get_dubbing_status_endpoint(video_id: str):
    """Real-time status check endpoint for frontend progress bar polling."""
    # Check memory registry first
    if video_id in DUBBING_JOBS:
        return DUBBING_JOBS[video_id]

    # Check disk cache
    for ext in ["hi", "hin", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "en"]:
        sidecar_path = os.path.join(OUTPUT_DIR, f"{video_id}_{ext}.json")
        if os.path.exists(sidecar_path):
            try:
                with open(sidecar_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass

        mp4_path = os.path.join(OUTPUT_DIR, f"{video_id}_{ext}.mp4")
        if os.path.exists(mp4_path):
            meta = await fetch_youtube_metadata(video_id)
            return {
                "video_id": video_id,
                "video_title": meta.get("title", f"Quantum Computing Lecture ({video_id})"),
                "author_name": meta.get("author_name", "Quantum Educator"),
                "thumbnail_url": meta.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
                "status": "completed",
                "step": "completed",
                "progress": 100,
                "message": "Dubbed lecture available from platform cache.",
                "watch_url": f"/platform_dubs/{video_id}_{ext}.mp4",
                "audio_url": f"/platform_dubs/{video_id}_{ext}.mp3",
                "glossary_terms_preserved": ["qubit", "superposition", "entanglement", "quantum circuit"],
            }

    raise HTTPException(status_code=404, detail=f"No dubbing job found for video ID: {video_id}")

@router.get("/glossary")
async def get_quantum_glossary_endpoint():
    """Returns all protected quantum terms and their Hinglish representations."""
    return {
        "count": len(QUANTUM_GLOSSARY),
        "description": "Technical quantum terminology preserved during multilingual lecture dubbing.",
        "glossary": QUANTUM_GLOSSARY,
    }

@router.get("/list")
async def list_dubbed_lectures_endpoint():
    """Lists all available dubbed lectures on the platform."""
    files = []
    if os.path.exists(OUTPUT_DIR):
        for f in os.listdir(OUTPUT_DIR):
            if f.endswith(".mp4"):
                vid = f.split("_")[0]
                lang = f.split("_")[1].replace(".mp4", "") if "_" in f else "hi"
                files.append({
                    "video_id": vid,
                    "language": lang,
                    "filename": f,
                    "watch_url": f"/platform_dubs/{f}",
                    "size_mb": round(os.path.getsize(os.path.join(OUTPUT_DIR, f)) / (1024 * 1024), 2),
                })
    return {"total": len(files), "lectures": files}
