# app/middleware/body_size.py
from __future__ import annotations

import os

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple abuse guardrail: reject large request bodies early.

    Env vars:
      - HINSIGHT_MAX_BODY_BYTES: default 100000 (100 KB)
      - HINSIGHT_BODY_LIMIT_ENABLED: "true"/"false" (default true)
    """

    def __init__(self, app):
        super().__init__(app)
        self.enabled = (
            os.getenv("HINSIGHT_BODY_LIMIT_ENABLED", "true").strip().lower()
        ) != "false"
        self.max_bytes = int(os.getenv("HINSIGHT_MAX_BODY_BYTES", "100000"))

    def _should_check(self, request: Request) -> bool:
        path = request.url.path
        # Only check API routes, and mainly where bodies exist
        if not path.startswith("/api/"):
            return False
        return request.method.upper() in {"POST", "PUT", "PATCH"}

    async def dispatch(self, request: Request, call_next) -> Response:
        if not self.enabled or not self._should_check(request):
            return await call_next(request)

        cl = request.headers.get("content-length")
        if cl is not None:
            try:
                if int(cl) > self.max_bytes:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": f"Request too large (max {self.max_bytes} bytes)"
                        },
                    )
            except ValueError:
                # ignore invalid content-length and continue to safe read below
                pass

        body = await request.body()
        if len(body) > self.max_bytes:
            return JSONResponse(
                status_code=413,
                content={"detail": f"Request too large (max {self.max_bytes} bytes)"},
            )

        # Put body back so downstream can read it
        async def receive():
            return {"type": "http.request", "body": body, "more_body": False}

        request._receive = (
            receive  # starlette internal override (acceptable for this use)
        )
        return await call_next(request)
