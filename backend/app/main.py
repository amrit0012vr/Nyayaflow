from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db, SessionLocal
from app.api import auth, cases, documents, triage, summary, schedule, legal_aid, audit
from scripts.seed_demo_data import seed_database_if_empty

# Initialize DB tables
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed on server startup if database is empty
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="NyayaFlow API",
    description="Secure Agentic AI for Timely Justice — Bharat Agentic-AI Hackathon 2026 (Track 07)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(cases.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(triage.router, prefix="/api/v1")
app.include_router(summary.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")
app.include_router(legal_aid.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NyayaFlow Judicial Core API",
        "version": "1.0.0",
        "environment": settings.APP_ENV,
        "track": "07 — Timely Justice: Legal Backlog"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
