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
allowed_origins = list(settings.ALLOWED_ORIGINS)
for extra in [
    "https://nyayaflow-frontend.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]:
    if extra not in allowed_origins:
        allowed_origins.append(extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https:\/\/.*\.onrender\.com$",
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
    response.headers["Content-Security-Policy"] = (
        "default-src 'self' https: data:; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https: blob:; "
        "connect-src 'self' https: wss:; "
        "frame-ancestors 'none';"
    )
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

# Full-Stack SPA Mounting: Serve compiled React frontend if present
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from fastapi import HTTPException

    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend_assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API, health, docs, or openapi routes
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path == "openapi.json"
        ):
            raise HTTPException(status_code=404, detail="Not Found")

        file_candidate = FRONTEND_DIST / full_path
        if full_path and file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(FRONTEND_DIST / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
