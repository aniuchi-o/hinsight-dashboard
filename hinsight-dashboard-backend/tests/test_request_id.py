from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_request_id_header_added() -> None:
    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert "X-Request-ID" in resp.headers
    assert resp.json()["request_id"] == resp.headers["X-Request-ID"]


def test_request_id_propagated_if_provided() -> None:
    rid = "my-client-request-id"
    resp = client.get("/healthz", headers={"X-Request-ID": rid})
    assert resp.headers["X-Request-ID"] == rid
    assert resp.json()["request_id"] == rid
