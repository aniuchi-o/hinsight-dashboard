# app/middleware/security.py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # Prevent caching of potentially sensitive data
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"

        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Clickjacking protection
        response.headers["X-Frame-Options"] = "DENY"

        # Basic XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        return response
