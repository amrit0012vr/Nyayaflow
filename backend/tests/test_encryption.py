import pytest
from app.core.encryption import encrypt_bytes, decrypt_bytes, encrypt_string, decrypt_string

def test_aes_256_encryption_decryption():
    secret_text = "CONFIDENTIAL: State of Delhi vs. Ramesh Kumar. Evidence File."
    encrypted_bytes = encrypt_bytes(secret_text.encode("utf-8"))
    assert encrypted_bytes != secret_text.encode("utf-8")
    assert len(encrypted_bytes) > 12  # Has 12-byte nonce
    
    decrypted_bytes = decrypt_bytes(encrypted_bytes)
    assert decrypted_bytes.decode("utf-8") == secret_text

def test_string_encryption_roundtrip():
    pii = "+91 9876543210 (Aadhaar: 4892-8192-1029)"
    cipher_b64 = encrypt_string(pii)
    assert cipher_b64 != pii
    
    restored = decrypt_string(cipher_b64)
    assert restored == pii

def test_tampered_ciphertext_fails_auth():
    encrypted = encrypt_bytes(b"Original Evidence")
    # Corrupt last byte
    tampered = bytearray(encrypted)
    tampered[-1] ^= 0xFF
    with pytest.raises(Exception):
        decrypt_bytes(bytes(tampered))

