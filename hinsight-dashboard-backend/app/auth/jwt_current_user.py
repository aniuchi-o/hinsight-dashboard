# app/auth/jwt_current_user.py
from __future__ import annotations

from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from app.db.session import get_session_for_region
from app.models.user import User
from app.security.jwt import decode_access_token


def get_current_user(request: Request) -> User:
    authz = (request.headers.get("Authorization") or "").strip()
    if not authz.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authz.split(" ", 1)[1].strip()
    try:
        claims = decode_access_token(token)
    except Exception as err:
        raise HTTPException(status_code=401, detail="Invalid token") from err

    user_id = str(claims.get("sub") or "").strip()
    reg = str(claims.get("reg") or "").strip().upper()
    if not user_id or reg not in {"CA", "US"}:
        raise HTTPException(status_code=401, detail="Invalid token claims")

    # Middleware enforces region header; ensure it matches token
    hdr_reg = (request.headers.get("X-Data-Region") or "").strip().upper()
    if hdr_reg and hdr_reg != reg:
        raise HTTPException(status_code=401, detail="Region mismatch")

    db: Session = get_session_for_region()
    try:
        user = db.query(User).filter(User.id == user_id).one_or_none()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    finally:
        db.close()
