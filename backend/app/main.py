import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables from root .env are loaded first
_root_env = Path(__file__).resolve().parents[2] / ".env"
if not _root_env.exists():
    _root_env = Path(__file__).resolve().parents[3] / ".env"

if _root_env.exists():
    load_dotenv(dotenv_path=_root_env, override=True)
else:
    load_dotenv(override=True)
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

# Ensure UTF-8 output encoding on Windows terminals to prevent CP1252 charmap crashes
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.routers import simulation, ai_tutor, curriculum, assessment, auth, dubbing

# ─── Firebase Admin Init ──────────────────────────────────────────────────────
def _init_firebase():
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
    project_id = os.getenv("FIREBASE_PROJECT_ID", "")
    try:
        import firebase_admin
        from firebase_admin import credentials
        if not firebase_admin._apps:
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print("[Firebase] ✅ Initialized with service account.")
            elif project_id:
                # Dev mode: no service account needed — just pass the project ID
                # Firebase Admin will verify tokens using Google's public JWKS endpoint
                firebase_admin.initialize_app(options={"projectId": project_id})
                print(f"[Firebase] ✅ Initialized with project ID: {project_id}")
            else:
                # Attempt application default credentials (Cloud Run / App Engine)
                firebase_admin.initialize_app()
                print("[Firebase] Initialized with application default credentials.")
    except Exception as e:
        print(f"[Firebase] Init skipped (auth will be unavailable): {e}")


# ─── SQLAlchemy DB Init ───────────────────────────────────────────────────────
def _init_db():
    from sqlalchemy import text
    from backend.app.db.database import engine, Base
    from backend.app.db import models  # noqa: F401 — imports trigger table registration
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate columns for SQLite compatibility if table was created previously
    try:
        with engine.connect() as conn:
            cursor = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in cursor.fetchall()]
            if cols:
                if "age" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER"))
                if "topics_covered" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN topics_covered TEXT DEFAULT '[]'"))
                if "tests_count" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN tests_count INTEGER DEFAULT 0"))
                conn.commit()
    except Exception as err:
        print(f"[Database] Migration note: {err}")

    print("[Database] ✅ SQLite tables created / verified.")


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

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enforces strict enterprise security headers on all incoming API requests:
    - Protection against MIME sniffing
    - Clickjacking prevention via X-Frame-Options
    - Referrer leakage protection
    - Device capability lock-down
    - XSS filtering
    """
    async def dispatch(self, request: Request, call_next):
        # Enforce maximum payload size (15MB) to protect against DoS attacks
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 15 * 1024 * 1024:
            return Response(
                content='{"error": "Payload Too Large", "detail": "Request payload exceeds the 15MB security threshold."}',
                status_code=413,
                media_type="application/json"
            )

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        # CSP allowing required external services (YouTube, Firebase, KaTeX, Google Fonts)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; "
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com; "
            "img-src 'self' data: blob: https: https://img.youtube.com https://lh3.googleusercontent.com; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://api.groq.com https://api.sarvam.ai https://api.elevenlabs.io;"
        )
        return response

app.add_middleware(SecurityHeadersMiddleware)

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
app.include_router(dubbing.router,    prefix="/api/v1")

# ─── Static files for dubbed video lectures ───────────────────────────────────
_dubs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../platform_dubs"))
os.makedirs(_dubs_dir, exist_ok=True)
app.mount("/platform_dubs", StaticFiles(directory=_dubs_dir), name="platform_dubs")


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
        "firebase_auth": (
            "service_account" if (os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") and os.path.exists(os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")))
            else ("project_id_jwks" if os.getenv("FIREBASE_PROJECT_ID") else "pending_config")
        ),
        "firebase_project_id": os.getenv("FIREBASE_PROJECT_ID", ""),
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
