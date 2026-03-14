# app/main.py
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.v1.ingest import router as ingest_router
from app.api.v1.insights import router as insights_router
from app.api.v1.routes_demo import router as demo_router
from app.core.logging import configure_logging
from app.core.middleware import RequestIdMiddleware
from app.core.request_id import request_id_ctx
from app.middleware.abuse_guard import AbuseGuardMiddleware
from app.middleware.audit import AuditMiddleware
from app.middleware.auth import AuthMiddleware
from app.middleware.body_size import BodySizeLimitMiddleware
from app.middleware.data_region import DataRegionMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.tenant import TenantMiddleware

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Hinsight Dashboard API", version="0.1.0")
app.include_router(auth_router)


@app.on_event("startup")
def _reset_test_state() -> None:
    # Prevent rate-limit state leaking across pytest tests / TestClient instances
    if hasattr(app.state, "rate_limit_windows"):
        app.state.rate_limit_windows.clear()


# Starlette/FastAPI middleware execution is:
#   outermost = last added
#
# Starlette middleware: last added runs first (outermost).
#
# Runtime order is:
#   RequestId
#   -> DataRegion
#   -> BodySize
#   -> Audit
#   -> AbuseGuard
#   -> RateLimit
#   -> Auth
#   -> route
#
# Therefore we add them in reverse order below.
# Add middlewares (last added runs first)

app.add_middleware(AuditMiddleware)  # inner
app.add_middleware(AuthMiddleware)  # runs before Audit
app.add_middleware(RateLimitMiddleware)
app.add_middleware(AbuseGuardMiddleware)
app.add_middleware(BodySizeLimitMiddleware)
app.add_middleware(TenantMiddleware)
app.add_middleware(DataRegionMiddleware)
app.add_middleware(RequestIdMiddleware)  # outer

_CORS_ORIGINS = [
    "https://hinsight-frontend-1046723962483.northamerica-northeast1.run.app",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
]
_extra = os.getenv("CORS_ORIGINS_EXTRA", "")
if _extra:
    _CORS_ORIGINS += [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key", "X-Data-Region", "X-Correlation-ID"],
    allow_credentials=True,
)


# Health endpoints (no auth, no audit)
@app.get("/healthz", tags=["health"])
def healthz() -> dict:
    rid = request_id_ctx.get()
    return {"status": "ok", "request_id": rid}


@app.get("/hinsight", tags=["health"])
def hinsight() -> dict:
    rid = request_id_ctx.get()
    return {"status": "ok", "request_id": rid}


# Routers (include ONCE)
app.include_router(demo_router)
app.include_router(ingest_router)
app.include_router(insights_router)

from app.api.v1.me import router as me_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.platform import router as platform_router

app.include_router(me_router)
app.include_router(alerts_router)
app.include_router(platform_router)
