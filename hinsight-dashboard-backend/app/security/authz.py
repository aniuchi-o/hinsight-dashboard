# app/security/authz.py
from __future__ import annotations

from collections.abc import Callable

from fastapi import HTTPException
from starlette import status

from app.core.actor import actor_ctx


def require_scope(*required_scopes: str) -> Callable[[], None]:
    """
    FastAPI dependency for scoped access control.

    Usage:
        @router.get(...)
        def handler(..., _=Depends(require_scope("insights:read"))):
            ...

    Behavior:
      - If no actor is present -> 401
      - If actor has "admin" scope -> allow
      - If actor missing any required scope -> 403
    """

    required = set(s.strip() for s in required_scopes if s and s.strip())

    def _dep() -> None:
        actor = actor_ctx.get(None)
        if actor is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication context",
            )

        scopes = set(getattr(actor, "scopes", ()) or ())
        if "admin" in scopes:
            return

        if required and not required.issubset(scopes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient scope",
            )

    return _dep
