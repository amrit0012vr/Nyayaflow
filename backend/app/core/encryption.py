import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings

def _get_derived_key() -> bytes:
    """Derive a 256-bit (32-byte) key from the master key string using SHA-256."""
    return hashlib.sha256(settings.MASTER_KEY.encode("utf-8")).digest()

def encrypt_bytes(data: bytes) -> bytes:
    """Encrypt raw bytes using AES-256-GCM with a fresh 96-bit nonce."""
    key = _get_derived_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit standard nonce for GCM
    ciphertext = aesgcm.encrypt(nonce, data, None)
    # Prefix nonce to ciphertext
    return nonce + ciphertext

def decrypt_bytes(encrypted_data: bytes) -> bytes:
    """Decrypt ciphertext bytes with embedded nonce using AES-256-GCM."""
    if len(encrypted_data) < 12:
        raise ValueError("Encrypted data is too short to contain a valid nonce")
    key = _get_derived_key()
    aesgcm = AESGCM(key)
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)

def encrypt_string(plaintext: str) -> str:
    """Encrypt a string and return base64-encoded ciphertext."""
    encrypted = encrypt_bytes(plaintext.encode("utf-8"))
    return base64.b64encode(encrypted).decode("ascii")

def decrypt_string(encrypted_b64: str) -> str:
    """Decrypt a base64-encoded ciphertext and return plaintext string."""
    encrypted_bytes = base64.b64decode(encrypted_b64.encode("ascii"))
    decrypted = decrypt_bytes(encrypted_bytes)
    return decrypted.decode("utf-8")
