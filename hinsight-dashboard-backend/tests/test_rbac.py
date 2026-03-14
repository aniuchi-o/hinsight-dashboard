# tests/test_rbac.py
from __future__ import annotations

import pytest
from starlette.testclient import TestClient

from app.main import app


@pytest.fixture(autouse=True)
def _rbac_env(monkeypatch: pytest.MonkeyPatch):
    # Admin/dev key (full scopes)
    monkeypatch.setenv("HINSIGHT_API_KEY", "dev-key")

    # Optional scoped keys
    monkeypatch.setenv("RBAC_KEYS", "read-key,write-key")
    monkeypatch.setenv("RBAC_KEY_read-key_SCOPES", "insights:read")
    monkeypatch.setenv("RBAC_KEY_write-key_SCOPES", "ingest:write")

    yield


@pytest.fixture()
def client():
    return TestClient(app)


def test_admin_key_can_read_and_write(client: TestClient):
    headers = {"X-Data-Region": "CA", "X-API-Key": "dev-key"}

    r = client.get("/api/v1/insights", headers=headers)
    assert r.status_code == 200

    payload = {
        "source": "survey",
        "category": "sleep",
        "value": 6.5,
        "unit": "hours",
        "subject_id": "user-123",
        "timestamp": "2026-02-01T10:00:00Z",
    }
    r = client.post("/api/v1/ingest", headers=headers, json=payload)
    assert r.status_code == 202


def test_read_key_can_read_but_cannot_write(client: TestClient):
    read_headers = {"X-Data-Region": "CA", "X-API-Key": "read-key"}

    r = client.get("/api/v1/insights", headers=read_headers)
    assert r.status_code == 200

    payload = {
        "source": "survey",
        "category": "sleep",
        "value": 6.5,
        "unit": "hours",
        "subject_id": "user-123",
        "timestamp": "2026-02-01T10:00:00Z",
    }
    r = client.post("/api/v1/ingest", headers=read_headers, json=payload)
    assert r.status_code == 403
    assert r.json()["detail"] == "Insufficient scope"


def test_write_key_can_write_but_cannot_read(client: TestClient):
    write_headers = {"X-Data-Region": "CA", "X-API-Key": "write-key"}

    payload = {
        "source": "survey",
        "category": "sleep",
        "value": 6.5,
        "unit": "hours",
        "subject_id": "user-123",
        "timestamp": "2026-02-01T10:00:00Z",
    }
    r = client.post("/api/v1/ingest", headers=write_headers, json=payload)
    assert r.status_code == 202

    r = client.get("/api/v1/insights", headers=write_headers)
    assert r.status_code == 403
    assert r.json()["detail"] == "Insufficient scope"


def test_missing_key_is_401(client: TestClient):
    r = client.get("/api/v1/insights", headers={"X-Data-Region": "CA"})
    assert r.status_code == 401
