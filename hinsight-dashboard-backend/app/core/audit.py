import logging
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from typing import Any, Literal

from app.core.request_id import request_id_ctx

logger = logging.getLogger("audit")

AuditAction = Literal[
    "AUTH_LOGIN",
    "AUTH_LOGOUT",
    "DATA_READ",
    "DATA_EXPORT",
    "DATA_WRITE",
    "CONFIG_CHANGE",
    "PERMISSION_CHANGE",
]


@dataclass(frozen=True)
class AuditEvent:
    action: AuditAction
    actor_id: str | None  # who did it (user/service)
    target_type: str | None  # e.g., "patient", "dataset", "user"
    target_id: str | None
    outcome: Literal["SUCCESS", "FAILURE"]
    reason: str | None  # for failures or justification
    ip: str | None
    user_agent: str | None
    metadata: dict[str, Any]
    request_id: str | None
    timestamp: str


def emit_audit_event(
    *,
    action: AuditAction,
    outcome: Literal["SUCCESS", "FAILURE"],
    actor_id: str | None = None,
    target_type: str | None = None,
    target_id: str | None = None,
    reason: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    event = AuditEvent(
        action=action,
        actor_id=actor_id,
        target_type=target_type,
        target_id=target_id,
        outcome=outcome,
        reason=reason,
        ip=ip,
        user_agent=user_agent,
        metadata=metadata or {},
        request_id=request_id_ctx.get(),
        timestamp=datetime.now(UTC).isoformat(),
    )

    # For now: log it (JSON formatter will handle structure)
    logger.info(asdict(event))
