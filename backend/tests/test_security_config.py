import pytest
from app.config import Settings

def test_security_validation_passes_in_development():
    # In development with DEMO_MODE, settings should pass or warn
    dev_settings = Settings(
        APP_ENV="development",
        DEMO_MODE=True,
        SECRET_KEY="nyayaflow-super-secret-jwt-key-2026-bharat-hackathon-sec",
        MASTER_KEY="NyayaFlowMasterKeySecure202632B!"
    )
    # Should not raise RuntimeError in dev
    dev_settings.validate_security()

def test_security_validation_fails_in_production_with_short_key():
    prod_settings = Settings(
        APP_ENV="production",
        DEMO_MODE=False,
        SECRET_KEY="short",
        MASTER_KEY="NyayaFlowMasterKeySecure202632B!"
    )
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        prod_settings.validate_security()

def test_security_validation_fails_in_production_with_demo_mode_true():
    prod_settings = Settings(
        APP_ENV="production",
        DEMO_MODE=True,
        SECRET_KEY="a" * 32,
        MASTER_KEY="b" * 32
    )
    with pytest.raises(RuntimeError, match="DEMO_MODE"):
        prod_settings.validate_security()

