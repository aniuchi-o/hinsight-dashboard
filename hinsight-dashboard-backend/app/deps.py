# app/deps.py
from __future__ import annotations

from collections.abc import Generator

from fastapi import Request
from sqlalchemy.orm import Session

from app.db.session import get_session_for_region


def get_db() -> Generator[Session, None, None]:
    db = get_session_for_region()
    try:
        yield db
    finally:
        db.close()


def get_tenant_id(request: Request) -> str:
    tenant = getattr(request.state, "tenant_id", None)
    if tenant:
        return str(tenant)

    header_val = (request.headers.get("X-Tenant-ID") or "").strip()
    return header_val or "default"
