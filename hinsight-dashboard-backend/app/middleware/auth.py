# app/middleware/auth.py
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.security.jwt_principal import resolve_user_principal
from app.security.rbac import resolve_principal


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Let CORS middleware handle preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        if (
            path in ("/", "/healthz", "/hinsight")
            or path.startswith(("/docs", "/openapi"))
            or path.startswith("/auth/")
        ):
            return await call_next(request)

        if path.startswith("/api/"):
            authz = (request.headers.get("Authorization") or "").strip()
            if authz.lower().startswith("bearer "):
                token = authz.split(" ", 1)[1].strip()
                principal = resolve_user_principal(token)
                if principal is None:
                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Invalid or missing bearer token"},
                    )
                request.state.principal = principal
                request.state.actor_type = principal.actor_type
                request.state.actor_id = principal.actor_id
                request.state.tenant_id = getattr(principal, "tenant_id", None)
                return await call_next(request)

        api_key = request.headers.get("X-API-Key", "").strip()
        principal = resolve_principal(api_key)
        if principal is None:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing API key"},
            )

        request.state.principal = principal
        request.state.actor_type = principal.actor_type
        request.state.actor_id = principal.actor_id
        request.state.tenant_id = getattr(principal, "tenant_id", None)

        return await call_next(request)
