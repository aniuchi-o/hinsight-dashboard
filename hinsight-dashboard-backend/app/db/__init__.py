# app/db/__init__.py

from __future__ import annotations

from app.db.base import Base

from .session import ENGINES, SESSION_FACTORIES, get_session_for_region

# Backwards-compatible defaults (used by app.main and anything importing `engine`)
DEFAULT_REGION = "CA"
engine = ENGINES[DEFAULT_REGION]
SessionLocal = SESSION_FACTORIES[DEFAULT_REGION]


__all__ = [
    "ENGINES",
    "SESSION_FACTORIES",
    "Base",
    "engine_ca",
    "engine_us",
    "SessionLocalCA",
    "SessionLocalUS",
    "get_sessionmaker_for_region",
    "get_session_for_region",
]
