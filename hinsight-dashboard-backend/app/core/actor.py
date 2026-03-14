from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass


@dataclass(frozen=True)
class Actor:
    actor_id: str
    actor_type: str  # "user" | "service"
    tenant_id: str | None = None
    scopes: tuple[str, ...] = ()


actor_ctx: ContextVar[Actor | None] = ContextVar("actor", default=None)
