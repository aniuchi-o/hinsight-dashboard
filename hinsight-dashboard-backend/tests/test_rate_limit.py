import os
import time

from fastapi.testclient import TestClient

from app.main import app


def _client() -> TestClient:
    # Ensure the API key expected by your AuthMiddleware is present for this process.
    os.environ["HINSIGHT_API_KEY"] = "dev-key"
    return TestClient(app)


def test_rate_limit_trips_and_includes_headers():
    client = _client()

    # Warm-up request should succeed
    r0 = client.get(
        "/api/v1/insights",
        headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
    )
    assert r0.status_code == 200

    # Burst requests; we expect at least one 429 in the batch
    seen_429 = False
    last_429 = None

    for _ in range(40):
        r = client.get(
            "/api/v1/insights",
            headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
        )
        if r.status_code == 429:
            seen_429 = True
            last_429 = r
            break

    assert seen_429 is True
    assert last_429 is not None
    assert last_429.json().get("detail") == "Rate limit exceeded"

    # Header contract (based on your curl output)
    assert "retry-after" in last_429.headers
    assert "x-ratelimit-limit" in last_429.headers
    assert "x-ratelimit-remaining" in last_429.headers
    assert "x-ratelimit-reset" in last_429.headers


def test_rate_limit_recovers_after_wait():
    client = _client()

    # Force a 429
    hit_429 = None
    for _ in range(60):
        r = client.get(
            "/api/v1/insights",
            headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
        )
        if r.status_code == 429:
            hit_429 = r
            break

    assert hit_429 is not None

    # Wait the server-advertised time, then request should work again
    retry_after = int(hit_429.headers.get("retry-after", "1"))
    time.sleep(retry_after + 0.2)

    r_ok = client.get(
        "/api/v1/insights",
        headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
    )
    assert r_ok.status_code == 200


def test_rate_limit_isolated_by_region_at_least_initially():
    client = _client()

    # CA: spam until we hit a 429 (or near it)
    for _ in range(60):
        r = client.get(
            "/api/v1/insights",
            headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
        )
        if r.status_code == 429:
            break

    # US should still succeed at least once (separate bucket in your observed behavior)
    r_us = client.get(
        "/api/v1/insights",
        headers={"X-Data-Region": "US", "X-API-Key": "dev-key"},
    )
    assert r_us.status_code == 200
