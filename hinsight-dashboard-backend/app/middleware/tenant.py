# app/middleware/tenant.py
from __future__ import annotations

import os

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class TenantMiddleware(BaseHTTPMiddleware):
    """Attach tenant context to the request.

    Backward-compatible by default:
      - If X-Tenant-ID is missing, we set tenant_id="default".
      - If TENANT_REQUIRED=1, missing tenant becomes a 400.
    """

    def __init__(self, app, *, header_name: str = "X-Tenant-ID"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if path.startswith("/api/"):
            required = (os.getenv("TENANT_REQUIRED") or "0").strip() in {
                "1",
                "true",
                "TRUE",
            }
            tenant = (request.headers.get(self.header_name) or "").strip()

            if not tenant:
                if required:
                    return JSONResponse(
                        status_code=400,
                        content={"detail": f"Missing {self.header_name} header."},
                    )
                tenant = "default"

            request.state.tenant_id = tenant

        return await call_next(request)
