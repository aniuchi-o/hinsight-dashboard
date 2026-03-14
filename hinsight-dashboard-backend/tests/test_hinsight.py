from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_hinsight() -> None:
    resp = client.get("/hinsight")
    assert resp.status_code == 200

    data = resp.json()
    assert data["status"] == "ok"
    assert "request_id" in data
    assert isinstance(data["request_id"], str)
    assert len(data["request_id"]) > 0
