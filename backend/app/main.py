import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import simulation, ai_tutor, curriculum, assessment

app = FastAPI(
    title="AI-Powered Interactive Quantum Algorithm Learning Platform",
    description="Smart India Hackathon 2026 Backend Core - Team Gitwolves",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local React/Vite development
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]
if "*" not in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 routers
app.include_router(simulation.router, prefix="/api/v1")
app.include_router(ai_tutor.router, prefix="/api/v1")
app.include_router(curriculum.router, prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")

@app.get("/")
def root_endpoint():
    return {
        "project": "AI-Powered Interactive Quantum Algorithm Learning Platform",
        "team": "Gitwolves",
        "status": "online",
        "api_v1_docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "quantum_engine": "active",
        "offline_rag_engine": "ready",
        "max_qubits": 16,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=True)
