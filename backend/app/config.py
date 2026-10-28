import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    APP_NAME: str = "NyayaFlow"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nyayaflow-super-secret-jwt-key-2026-bharat-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))
    
    # Database: fallback to high-performance local SQLite with JSON & vector compatibility
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'nyayaflow.db'}")
    
    # Encrypted Object Storage Directory
    STORAGE_DIR: Path = BASE_DIR / "storage"
    
    # 32-byte Base64/Hex Encryption Master Key (AES-256)
    MASTER_KEY: str = os.getenv("MASTER_KEY", "NyayaFlowMasterKeySecure202632B!")
    
    # LLM Settings (Open-weight or fallback deterministic pipeline)
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://localhost:11434")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3.2")
    USE_MOCK_LLM_FALLBACK: bool = True

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
