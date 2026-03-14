# app/middleware/region.py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.db.session import data_region_ctx  # this exists in your session module


class RegionContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        region = (request.headers.get("X-Data-Region") or "").strip().upper()
        data_region_ctx.set(region)  # must be CA/US, else downstream will fail
        return await call_next(request)
