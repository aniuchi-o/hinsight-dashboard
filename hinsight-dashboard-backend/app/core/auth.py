# app/core/auth.py
from __future__ import annotations

import os
from collections.abc import Iterable

from fastapi import HTTPException
from starlette import status
from starlette.requests import Request

from app.core.actor import Actor

API_KEY_HEADER = "X-API-Key"


def _get_api_key(request: Request) -> str | None:
    raw = request.headers.get(API_KEY_HEADER)
    if not raw:
        return None
    key = raw.strip()
    return key or None


def _actor_from_rbac(api_key: str) -> Actor | None:
    """
    Preferred path: resolve API key via app/security/rbac.py.

    Supports either:
      - rbac.API_KEYS (dict-like), or
      - rbac.lookup_api_key(api_key) helper (if you implemented one)
    """
    try:
        # IMPORTANT: keep this import inside the function to avoid circular imports
        from app.security import rbac  # type: ignore
    except Exception:
        return None

    # Option A: helper function
    lookup = getattr(rbac, "lookup_api_key", None)
    if callable(lookup):
        rec = lookup(api_key)
    else:
        # Option B: dict table
        table = getattr(rbac, "API_KEYS", None)
        if not isinstance(table, dict):
            return None
        rec = table.get(api_key)

    if not rec:
        return None

    # Accept either dict records or Actor records
    if isinstance(rec, Actor):
        return rec

    if isinstance(rec, dict):
        subject_id = str(rec.get("subject_id") or rec.get("subject") or "unknown")
        display = str(rec.get("display") or rec.get("name") or subject_id)

        scopes_raw = rec.get("scopes") or ()
        if isinstance(scopes_raw, str):
            scopes: Iterable[str] = [
                s.strip() for s in scopes_raw.split(",") if s.strip()
            ]
        else:
            scopes = list(scopes_raw)  # type: ignore[arg-type]

        tenant_id = rec.get("tenant_id")  # optional
        return Actor(
            subject_id=subject_id,
            display=display,
            scopes=tuple(scopes),
            tenant_id=tenant_id,
        )

    return None


def _actor_from_env(api_key: str) -> Actor | None:
    """
    Fallback path: single shared dev key via env var.
    (Keeps your local dev usable even before RBAC is fully wired.)
    """
    expected = (os.getenv("HINSIGHT_API_KEY") or "").strip()
    if not expected or api_key != expected:
        return None

    return Actor(
        subject_id="dev",
        display="dev",
        scopes=("admin",),  # env-key acts as admin in fallback mode
        tenant_id=None,
    )


def authenticate_request(request: Request) -> Actor:
    """
    Validate X-API-Key and return an Actor (identity + scopes).

    - If RBAC is present, it is authoritative.
    - Otherwise fall back to HINSIGHT_API_KEY.
    """
    api_key = _get_api_key(request)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )

    actor = _actor_from_rbac(api_key) or _actor_from_env(api_key)
    if actor is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )

    return actor
