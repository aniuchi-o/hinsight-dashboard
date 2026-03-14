from fastapi import APIRouter, Request

from app.core.audit import emit_audit_event
from app.core.request_utils import client_ip, user_agent

router = APIRouter(prefix="/v1/demo", tags=["demo"])


@router.get("/export")
def demo_export(request: Request) -> dict:
    emit_audit_event(
        action="DATA_EXPORT",
        outcome="SUCCESS",
        actor_id="user-123",  # later from auth context
        target_type="report",
        target_id="wellbeing-summary",
        ip=client_ip(request),
        user_agent=user_agent(request),
        metadata={"format": "csv"},
    )
    return {"export": "started"}
