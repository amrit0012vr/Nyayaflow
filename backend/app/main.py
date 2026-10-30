import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db, SessionLocal
from app.api import auth, cases, documents, triage, summary, schedule, legal_aid, audit, admin, evaluation
from scripts.seed_demo_data import seed_database_if_empty

# SEC-02: Fail fast on insecure config in non-dev environments
settings.validate_security()

# Initialize DB tables
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed on startup only if DEMO_MODE is true
    if settings.DEMO_MODE:
        db = SessionLocal()
        try:
            seed_database_if_empty(db)
        finally:
            db.close()
    yield

app = FastAPI(
    title="NyayaFlow Judicial Core API",
    description="Secure Agentic AI for Timely Justice — Bharat Agentic-AI Hackathon 2026 (Track 07)",
    version="1.0.0",
    lifespan=lifespan
)

# SEC-09: CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# SEC-09: Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response

# Mount Routers under /api/v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(cases.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(triage.router, prefix="/api/v1")
app.include_router(summary.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")
app.include_router(legal_aid.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(evaluation.router, prefix="/api/v1")

# OPS-09: Detailed Health Endpoint
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    db_ok = False
    try:
        db = SessionLocal()
        db.execute(cases.text("SELECT 1") if hasattr(cases, "text") else __import__("sqlalchemy").text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        db_ok = False

    storage_ok = settings.STORAGE_DIR.exists() and settings.STORAGE_DIR.is_dir()

    return {
        "status": "healthy" if (db_ok and storage_ok) else "degraded",
        "service": "NyayaFlow Judicial Core API",
        "version": "1.0.0",
        "environment": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
        "database_connected": db_ok,
        "storage_ready": storage_ok,
        "llm_provider": settings.LLM_PROVIDER,
        "track": "07 — Timely Justice: Legal Backlog"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
