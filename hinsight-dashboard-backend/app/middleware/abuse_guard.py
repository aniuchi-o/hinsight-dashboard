# app/middleware/abuse_guard.py

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class AbuseGuardMiddleware(BaseHTTPMiddleware):
    MAX_PATH_LEN = 2048
    MAX_QUERY_LEN = 2048

    # Common path probes / LFI targets we want to reject as "abuse"
    SUSPICIOUS_PATH_FRAGMENTS = (
        "/etc/passwd",
        "/proc/self",
        "/proc/version",
        "wp-admin",
        "phpmyadmin",
    )

    def _has_traversal(self, request: Request) -> bool:
        raw_path = (request.scope.get("raw_path") or b"").lower()
        bad = (b"/../", b"/..\\", b"%2e%2e")
        return any(token in raw_path for token in bad)

    def _too_long(self, request: Request) -> bool:
        raw_path = request.scope.get("raw_path") or b""
        query = request.scope.get("query_string") or b""
        return len(raw_path) > self.MAX_PATH_LEN or len(query) > self.MAX_QUERY_LEN

    def _suspicious_target(self, request: Request) -> bool:
        # Use the normalized path (what the app actually receives)
        path = (request.url.path or "").lower()
        return any(fragment in path for fragment in self.SUSPICIOUS_PATH_FRAGMENTS)

    async def dispatch(self, request: Request, call_next) -> Response:
        if (
            self._has_traversal(request)
            or self._too_long(request)
            or self._suspicious_target(request)
        ):
            return JSONResponse(
                status_code=400, content={"detail": "Blocked by abuse guard"}
            )
        return await call_next(request)
