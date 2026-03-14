# app/security/jwt_principal.py
from __future__ import annotations

from app.security.jwt import decode_access_token
from app.security.rbac import Principal

ROLE_SCOPES: dict[str, set[str]] = {
    "platform_admin": {"insights:read", "ingest:write", "platform:read"},
    "admin": {"insights:read", "ingest:write"},
    "tenant_admin": {"insights:read", "ingest:write"},
    "viewer": {"insights:read"},
}


def resolve_user_principal(token: str) -> Principal | None:
    try:
        claims = decode_access_token(token)
    except Exception:
        return None

    sub = str(claims.get("sub") or "").strip()
    role = str(claims.get("role") or "viewer").strip()
    tid = str(claims.get("tid") or "default").strip()

    if not sub:
        return None

    return Principal(
        actor_type="user",
        actor_id=sub,
        scopes=set(ROLE_SCOPES.get(role, set())),
        tenant_id=tid,
    )
