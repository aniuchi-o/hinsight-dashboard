import os

from fastapi.testclient import TestClient

from app.main import app


def _client() -> TestClient:
    os.environ["HINSIGHT_API_KEY"] = "dev-key"
    return TestClient(app)


def test_abuse_guard_blocks_suspicious_path():
    client = _client()
    r = client.get(
        "/api/v1/insights/../etc/passwd",
        headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Blocked by abuse guard"


def test_abuse_guard_blocks_very_long_url():
    client = _client()
    long_q = "x" * 5000
    r = client.get(
        f"/api/v1/insights?q={long_q}",
        headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Blocked by abuse guard"
