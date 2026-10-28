import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Optional

def compute_sha256(data: bytes) -> str:
    """Compute SHA-256 hex digest for byte data."""
    return hashlib.sha256(data).hexdigest()

def compute_file_sha256(file_path: Path) -> str:
    """Compute SHA-256 hex digest for a file on disk."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def compute_audit_entry_hash(
    prev_hash: str,
    timestamp_iso: str,
    actor_id: str,
    action: str,
    object_type: str,
    object_id: str,
    details: Optional[Dict[str, Any]] = None
) -> str:
    """
    Cryptographic hash-chain calculation:
    entry_hash_n = SHA256( prev_hash || timestamp || actor_id || action || object_type || object_id || sorted_details_json )
    """
    details_str = json.dumps(details or {}, sort_keys=True)
    raw = f"{prev_hash}|{timestamp_iso}|{actor_id}|{action}|{object_type}|{object_id}|{details_str}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

