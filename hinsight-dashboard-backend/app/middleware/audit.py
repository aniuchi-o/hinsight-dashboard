# app/middleware/audit.py
from __future__ import annotations

import logging
from contextlib import suppress
from typing import Any

from starlette.concurrency import run_in_threadpool
from starlette.requests import Request

from app.services.audit import write_audit_event

logger = logging.getLogger("hinsight.audit")


class AuditMiddleware:
    """
    Writes one audit row for every API request after response status is known.
    Must run AFTER AuthMiddleware so request.state.principal is available.
    """

    def __init__(self, app: Any):
        self.app = app

    async def __call__(self, scope: dict, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path: str = scope.get("path", "")

        if (
            path.startswith("/health")
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path == "/openapi.json"
        ):
            await self.app(scope, receive, send)
            return

        if not path.startswith("/api/"):
            await self.app(scope, receive, send)
            return

        status_code_holder = {"code": 500}

        async def send_wrapper(message: dict):
            if message["type"] == "http.response.start":
                status_code_holder["code"] = int(message["status"])
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            # Endpoint crashed → record 500
            request = Request(scope)
            with suppress(Exception):
                await run_in_threadpool(
                    write_audit_event,
                    request,
                    action=request.method.lower(),
                    resource=path,
                    outcome="error",
                    status_code=500,
                    detail="internal_error",
                )
            raise
        else:
            request = Request(scope)
            code = status_code_holder["code"]

            if code < 400:
                outcome = "success"
            elif code in (401, 403):
                outcome = "denied"
            else:
                outcome = "failure"

            with suppress(Exception):
                await run_in_threadpool(
                    write_audit_event,
                    request,
                    action=request.method.lower(),
                    resource=path,
                    outcome=outcome,
                    status_code=code,
                    detail=None,
                )
