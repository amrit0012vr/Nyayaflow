import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    APP_NAME: str = "NyayaFlow"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nyayaflow-super-secret-jwt-key-2026-bharat-hackathon-sec")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_EXPIRE_DAYS", "7"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'nyayaflow.db'}")
    
    # Encrypted Object Storage Directory
    STORAGE_DIR: Path = BASE_DIR / "storage"
    
    # Master Key (AES-256)
    MASTER_KEY: str = os.getenv("MASTER_KEY", "NyayaFlowMasterKeySecure202632B!")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none") # none, ollama, openai_compatible
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://localhost:11434")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3.2")
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", None)
    LLM_TIMEOUT_S: int = int(os.getenv("LLM_TIMEOUT_S", "30"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.2"))
    USE_MOCK_LLM_FALLBACK: bool = True
    
    # Security & Policies
    ALLOWED_ORIGINS: List[str] = [
        orig.strip() for orig in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
        ).split(",")
        if orig.strip()
    ]
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "25"))
    ALLOW_GUEST_LEGAL_AID: bool = os.getenv("ALLOW_GUEST_LEGAL_AID", "false").lower() in ("true", "1")
    CITIZEN_OTP_ENABLED: bool = os.getenv("CITIZEN_OTP_ENABLED", "false").lower() in ("true", "1")
    ANTIVIRUS_ENABLED: bool = os.getenv("ANTIVIRUS_ENABLED", "false").lower() in ("true", "1")
    DEMO_PASSWORD: str = os.getenv("DEMO_PASSWORD", "NyayaDemo@2026")
    CHAT_RETENTION_DAYS: int = int(os.getenv("CHAT_RETENTION_DAYS", "30"))

    def validate_security(self):
        """SEC-02: Fail fast on insecure config when not development."""
        if self.APP_ENV != "development":
            if self.DEMO_MODE:
                raise RuntimeError("DEMO_MODE cannot be enabled in non-development environment!")
            default_secrets = [
                "nyayaflow-super-secret-jwt-key-2026-bharat-hackathon-sec",
                "NyayaFlowMasterKeySecure202632B!",
                "nyayaflow-super-secret-jwt-key-2026-bharat-hackathon"
            ]
            if self.SECRET_KEY in default_secrets or len(self.SECRET_KEY) < 32:
                raise RuntimeError("Insecure SECRET_KEY configured for non-development environment!")
            if self.MASTER_KEY in default_secrets or len(self.MASTER_KEY) < 32:
                raise RuntimeError("Insecure MASTER_KEY configured for non-development environment!")

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
