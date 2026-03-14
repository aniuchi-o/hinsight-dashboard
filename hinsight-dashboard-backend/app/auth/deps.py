# app/auth/deps.py
from __future__ import annotations

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import data_region_ctx, get_session_for_region


def decode_and_validate_jwt() -> dict:
    """
    TODO: Implement real JWT decode+validation.
    This stub is here to keep structure stable while you build incrementally.
    """
    raise HTTPException(status_code=401, detail="JWT not implemented yet")


# --- Ruff B008-compliant dependency singletons ---
current_claims = Depends(decode_and_validate_jwt)


def get_current_claims(claims: dict = current_claims) -> dict:
    return claims


claims_dep = Depends(get_current_claims)


def get_user_db_from_token(claims: dict = claims_dep) -> Session:
    region = (claims.get("reg") or "").strip().upper()
    if region not in {"CA", "US"}:
        raise HTTPException(status_code=401, detail="Invalid region claim")

    token = data_region_ctx.set(region)
    try:
        db = get_session_for_region()
        try:
            yield db
        finally:
            db.close()
    finally:
        data_region_ctx.reset(token)
