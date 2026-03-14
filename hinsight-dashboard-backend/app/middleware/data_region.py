# app/middleware/data_region.py
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.data_region import data_region_ctx

VALID_REGIONS = {"CA", "US"}


class DataRegionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        if request.method == "OPTIONS":
            return await call_next(request)

        token = None
        try:
            # Enforce region for both /api/* and /auth/* because both hit the DB
            if path.startswith("/api/") or path.startswith("/auth/"):
                region = (request.headers.get("X-Data-Region") or "").strip().upper()
                if region not in VALID_REGIONS:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "detail": "Missing or invalid X-Data-Region header (must be CA or US)."
                        },
                    )
                token = data_region_ctx.set(region)
            else:
                token = data_region_ctx.set("")

            return await call_next(request)
        finally:
            if token is not None:
                data_region_ctx.reset(token)
