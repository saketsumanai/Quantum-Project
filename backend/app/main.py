import os
import sys

# Ensure UTF-8 output encoding on Windows terminals to prevent CP1252 charmap crashes
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import simulation, ai_tutor, curriculum, assessment, auth

# ─── Firebase Admin Init ──────────────────────────────────────────────────────
def _init_firebase():
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
    try:
        import firebase_admin
        from firebase_admin import credentials
        if not firebase_admin._apps:
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print("[Firebase] Initialized with service account.")
            else:
                # Attempt default credentials (Cloud Run / App Engine)
                firebase_admin.initialize_app()
                print("[Firebase] Initialized with application default credentials.")
    except Exception as e:
        print(f"[Firebase] Init skipped (auth will be unavailable): {e}")


# ─── SQLAlchemy DB Init ───────────────────────────────────────────────────────
def _init_db():
    from backend.app.db.database import engine, Base
    from backend.app.db import models  # noqa: F401 — imports trigger table registration
    Base.metadata.create_all(bind=engine)
    print("[Database] SQLite tables created / verified.")


# ─── App Factory ─────────────────────────────────────────────────────────────
_init_firebase()
_init_db()

app = FastAPI(
    title="Quantum Leap — AI Quantum Algorithm Learning Platform",
    description="Smart India Hackathon 2026 · Team Gitwolves · Production Backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
)
origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/api/v1")
app.include_router(simulation.router, prefix="/api/v1")
app.include_router(ai_tutor.router,   prefix="/api/v1")
app.include_router(curriculum.router, prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "project": "Quantum Leap",
        "team": "Gitwolves",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


@app.get("/api/v1/health")
def health():
    vector_store_path = os.getenv("VECTOR_DB_PATH", "./data/vector_store")
    rag_ready = os.path.exists(
        os.path.join(vector_store_path, "quantum_books", "chroma.sqlite3")
    )
    return {
        "status": "healthy",
        "project": "Quantum Leap",
        "version": "2.0.0",
        "quantum_engine": "active",
        "rag_vector_store": "indexed" if rag_ready else "not_indexed_run_build_rag_index.py",
        "max_qubits": 16,
        "firebase_auth": "enabled" if os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") else "pending_config",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
