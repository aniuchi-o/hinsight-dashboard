# tests/test_insights.py
def test_insights_requires_auth(client):
    r = client.get("/api/v1/insights", headers={"X-Data-Region": "CA"})
    assert r.status_code == 401


def test_insights_wrong_scope(client):
    r = client.get(
        "/api/v1/insights",
        headers={"X-Data-Region": "CA", "X-API-Key": "read_only_key"},
    )
    assert r.status_code == 403


def test_insights_correct_scope(client):
    r = client.get(
        "/api/v1/insights",
        headers={"X-Data-Region": "CA", "X-API-Key": "dev-key"},
    )
    assert r.status_code == 200
