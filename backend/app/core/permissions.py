from typing import Dict, Set, List

# Single source of truth for role-based permissions (RBAC-01, Appendix B)
PERMISSIONS: Dict[str, Set[str]] = {
    "judge": {
        "case:list", "case:read", "case:process", "doc:download", "triage:read",
        "summary:read:judge", "summary:read:lawyer", "review:write",
        "schedule:suggest", "schedule:accept", "hearing:read", "evaluation:read"
    },
    "clerk": {
        "case:list", "case:read", "case:create", "case:process", "doc:upload", "doc:download",
        "triage:read", "triage:override", "summary:read:judge", "summary:read:lawyer",
        "review:write", "schedule:suggest", "schedule:accept", "hearing:read", "redaction:reveal"
    },
    "lawyer": {
        "case:list", "case:read", "doc:upload", "doc:download", "triage:read",
        "summary:read:lawyer", "hearing:read"
    },
    "police": {
        "case:list", "case:read", "doc:upload", "doc:download", "evidence:read",
        "triage:read", "summary:read:lawyer"
    },
    "citizen": {
        "me:cases", "summary:read:citizen", "legalaid:chat", "legalaid:eligibility"
    },
    "auditor": {
        "audit:read", "audit:verify", "audit:simulate", "evaluation:read"
    },
    "admin": {
        "users:manage", "audit:read", "audit:verify", "audit:simulate", "evaluation:read"
    },
}

def get_role_permissions(role: str) -> List[str]:
    """Return all permissions granted to a role."""
    return sorted(list(PERMISSIONS.get(role.lower(), set())))

def has_permission(role: str, permission: str) -> bool:
    """Check if a given role possesses a specific permission."""
    return permission in PERMISSIONS.get(role.lower(), set())

