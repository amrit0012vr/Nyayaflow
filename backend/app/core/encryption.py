import os
import base64
import hashlib
from typing import Tuple, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidTag
from app.config import settings

HKDF_SALT = b"nyayaflow-secure-hkdf-salt-2026"

def derive_key(context: str = "nyayaflow-doc-core-v1") -> bytes:
    """SEC-03: Derive a 256-bit key using HKDF-SHA256 with specific context string."""
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=HKDF_SALT,
        info=context.encode("utf-8"),
    )
    return hkdf.derive(settings.MASTER_KEY.encode("utf-8"))

def _get_legacy_key() -> bytes:
    """Legacy SHA-256 derivation for backward compatibility."""
    return hashlib.sha256(settings.MASTER_KEY.encode("utf-8")).digest()

def generate_document_data_key() -> bytes:
    """Generate a fresh random 256-bit data encryption key for a document."""
    return os.urandom(32)

def wrap_data_key(data_key: bytes) -> str:
    """Wrap (encrypt) a document data key with the master key using HKDF context."""
    kek = derive_key("nyayaflow-kek-v1")
    aesgcm = AESGCM(kek)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, data_key, None)
    return base64.b64encode(nonce + ciphertext).decode("ascii")

def unwrap_data_key(wrapped_b64: str) -> bytes:
    """Unwrap a document data key using the master KEK."""
    raw = base64.b64decode(wrapped_b64.encode("ascii"))
    if len(raw) < 12:
        raise ValueError("Invalid wrapped key format")
    nonce = raw[:12]
    ciphertext = raw[12:]
    kek = derive_key("nyayaflow-kek-v1")
    aesgcm = AESGCM(kek)
    return aesgcm.decrypt(nonce, ciphertext, None)

def encrypt_bytes(data: bytes, key: Optional[bytes] = None) -> bytes:
    """Encrypt raw bytes using AES-256-GCM with a fresh 96-bit nonce."""
    k = key if key is not None else derive_key("nyayaflow-storage-v1")
    aesgcm = AESGCM(k)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext

def decrypt_bytes(encrypted_data: bytes, key: Optional[bytes] = None) -> bytes:
    """
    Decrypt ciphertext bytes with embedded nonce using AES-256-GCM.
    Supports backward compatibility: falls back to legacy key if needed.
    """
    if len(encrypted_data) < 12:
        raise ValueError("Encrypted data is too short to contain a valid nonce")
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    
    if key is not None:
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None)

    # Try modern HKDF derived key
    try:
        aesgcm = AESGCM(derive_key("nyayaflow-storage-v1"))
        return aesgcm.decrypt(nonce, ciphertext, None)
    except InvalidTag:
        # Fallback to legacy SHA-256 key for existing records
        legacy_aes = AESGCM(_get_legacy_key())
        return legacy_aes.decrypt(nonce, ciphertext, None)

def encrypt_string(plaintext: str, context: str = "nyayaflow-strings-v1") -> str:
    """Encrypt a string and return base64-encoded ciphertext."""
    key = derive_key(context)
    encrypted = encrypt_bytes(plaintext.encode("utf-8"), key=key)
    return base64.b64encode(encrypted).decode("ascii")

def decrypt_string(encrypted_b64: str, context: str = "nyayaflow-strings-v1") -> str:
    """Decrypt a base64-encoded ciphertext and return plaintext string with legacy fallback."""
    encrypted_bytes = base64.b64decode(encrypted_b64.encode("ascii"))
    key = derive_key(context)
    try:
        decrypted = decrypt_bytes(encrypted_bytes, key=key)
    except InvalidTag:
        # Try legacy decryption
        legacy_aes = AESGCM(_get_legacy_key())
        nonce = encrypted_bytes[:12]
        ciphertext = encrypted_bytes[12:]
        decrypted = legacy_aes.decrypt(nonce, ciphertext, None)
    return decrypted.decode("utf-8")
