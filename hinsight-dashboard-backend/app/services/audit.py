# app/services/audit.py
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.audit_event import AuditEvent


def write_audit(
    db: Session,
    *,
    tenant_id: str | None,
    user_id: str | None,
    action: str,
    outcome: str,
    reason: str | None = None,
    request_id: str | None = None,
    ip: str | None = None,
) -> None:
    event = AuditEvent(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        outcome=outcome,
        reason=reason,
        request_id=request_id,
        ip=ip,
    )
    db.add(event)
    db.commit()


# Backwards-compatible wrapper expected by middleware
def write_audit_event(
    request, *, action: str, outcome: str, reason: str | None = None
) -> None:
    """
    Compatibility layer: middleware calls write_audit_event(request, ...).
    This function derives region/tenant/user/request metadata from request
    and writes via SQLAlchemy (works for SQLite locally + Cloud SQL in prod).
    """
    # Import inside to avoid import cycles
    from app.db.session import get_session_for_region
    from app.middleware.data_region import (
        get_region_from_request,  # or wherever you store it
    )

    region = get_region_from_request(request)  # returns "CA" / "US"
    db = get_session_for_region(region)
    try:
        tenant_id = getattr(request.state, "tenant_id", None)
        user_id = getattr(request.state, "user_id", None)
        request_id = getattr(request.state, "request_id", None)
        ip = getattr(request.client, "host", None) if request.client else None

        write_audit(
            db,
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            outcome=outcome,
            reason=reason,
            request_id=request_id,
            ip=ip,
        )
    finally:
        db.close()
