# app/middleware/abuse.py
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.services.audit import write_audit_event


class AbuseGuardMiddleware(BaseHTTPMiddleware):
    """
    Cheap, local abuse guardrails (NOT a WAF):
    - blocks suspicious path tokens
    - blocks extremely long URLs (common scan/abuse signal)
    """

    def __init__(
        self,
        app,
        *,
        max_url_len: int = 2048,
    ) -> None:
        super().__init__(app)
        self.max_url_len = max_url_len

    async def dispatch(self, request: Request, call_next):
        path = request.url.path.lower()
        raw_url = str(request.url)

        suspicious_tokens = (
            "..",
            "<script",
            "%3cscript",
            "union select",
            "information_schema",
            "or 1=1",
            "drop table",
        )

        if len(raw_url) > self.max_url_len or any(t in path for t in suspicious_tokens):
            outcome = "denied"
            status_code = 400

            write_audit_event(
                request=request,
                actor_type=getattr(request.state, "actor_type", "anonymous"),
                actor_id=getattr(request.state, "actor_id", "anonymous"),
                action=request.method.lower(),
                resource=request.url.path,
                outcome=outcome,
                status_code=status_code,
            )

            return JSONResponse(
                status_code=status_code,
                content={"detail": "Blocked by abuse guard"},
            )

        return await call_next(request)
