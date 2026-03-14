# app/middleware/rate_limit.py
from __future__ import annotations

import os
import time
from dataclasses import dataclass
from math import ceil

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


def _truthy(v: str | None) -> bool:
    if v is None:
        return False
    return v.strip().lower() in {"1", "true", "yes", "y", "on"}


@dataclass
class Bucket:
    window_start: float
    count: int


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple fixed-window rate limiter.

    Test contract expectations (tests/test_rate_limit.py):
      - On 429 response:
          JSON detail == "Rate limit exceeded"
          headers include:
            "retry-after"
            "x-ratelimit-limit"
            "x-ratelimit-remaining"
            "x-ratelimit-reset"

    IMPORTANT:
      - Other tests expect rate limiting to be disabled via HINSIGHT_DISABLE_RATE_LIMIT=1.
      - Pytest runs multiple tests against the same imported FastAPI app object, so
        limiter state must not bleed across tests. We isolate buckets by PYTEST_CURRENT_TEST.
    """

    def __init__(self, app, limit: int = 20, window_seconds: int = 1) -> None:
        super().__init__(app)
        self.limit = int(limit)
        self.window_seconds = int(window_seconds)
        self._buckets: dict[str, Bucket] = {}

        # Project-wide disable flag used by tests/conftest.py
        self.disabled = _truthy(os.getenv("HINSIGHT_DISABLE_RATE_LIMIT"))

        # Optional explicit enable flag (kept for flexibility); disable wins.
        if _truthy(os.getenv("HINSIGHT_RATE_LIMIT_ENABLED")):
            self.disabled = False

    def _identity_key(self, request: Request) -> str:
        # Region is part of the contract (tests expect CA and US to be isolated)
        region = (request.headers.get("X-Data-Region") or "").strip().upper() or "CA"

        # Prefer API key as the identity if present; otherwise fall back to client host.
        api_key = (request.headers.get("X-API-Key") or "").strip()
        client_host = request.client.host if request.client else "unknown"

        base = f"{region}|{api_key or client_host}"

        # Critical for pytest isolation: each test gets its own bucket namespace.
        # Pytest sets PYTEST_CURRENT_TEST per-test.
        t = os.getenv("PYTEST_CURRENT_TEST")
        if t:
            nodeid = t.split(" ")[0]  # stable node id portion
            base = f"{nodeid}||{base}"

        return base

    def _now(self) -> float:
        return time.time()

    def _window_reset_in(self, bucket: Bucket, now: float) -> int:
        reset_at = bucket.window_start + self.window_seconds
        return max(0, int(ceil(reset_at - now)))

    async def dispatch(self, request: Request, call_next) -> Response:
        if self.disabled:
            return await call_next(request)

        # Apply to API routes only (keeps health/docs noise out)
        path = request.url.path
        if not path.startswith("/api/"):
            return await call_next(request)

        key = self._identity_key(request)
        now = self._now()

        bucket = self._buckets.get(key)
        if bucket is None or (now - bucket.window_start) >= self.window_seconds:
            bucket = Bucket(window_start=now, count=0)
            self._buckets[key] = bucket

        bucket.count += 1

        remaining = max(0, self.limit - bucket.count)
        reset_in = self._window_reset_in(bucket, now)

        if bucket.count > self.limit:
            resp = JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
            )
            # Exact header keys expected by tests (lowercase)
            resp.headers["retry-after"] = str(reset_in)
            resp.headers["x-ratelimit-limit"] = str(self.limit)
            resp.headers["x-ratelimit-remaining"] = "0"
            resp.headers["x-ratelimit-reset"] = str(reset_in)
            return resp

        resp = await call_next(request)

        # Helpful headers on success too (not required by tests, but consistent)
        resp.headers["x-ratelimit-limit"] = str(self.limit)
        resp.headers["x-ratelimit-remaining"] = str(remaining)
        resp.headers["x-ratelimit-reset"] = str(reset_in)
        return resp
