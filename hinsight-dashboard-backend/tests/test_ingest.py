# tests/test_ingest.py
def test_ingest_and_insights(client):
    payload = {
        "source": "survey",
        "category": "sleep",
        "value": 6.5,
        "unit": "hours",
        "subject_id": "user-123",
        "timestamp": "2026-02-01T10:00:00Z",
    }

    # ingest requires ingest:write
    resp = client.post(
        "/api/v1/ingest",
        headers={"X-Data-Region": "CA", "X-API-Key": "write-key"},
        json=payload,
    )
    assert resp.status_code == 202

    # insights requires insights:read
    resp = client.get(
        "/api/v1/insights",
        headers={"X-Data-Region": "CA", "X-API-Key": "read-key"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_records" in data
    assert "by_category" in data
