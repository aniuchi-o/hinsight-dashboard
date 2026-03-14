# Hinsight Dashboard Backend (FastAPI)

A secure, region-aware, auditable backend platform that aggregates health-related data from multiple sources, normalizes it into consistent measures across 8 well-being factors, and serves decision-support dashboards and insights for authorized users.

## Local setup
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -e ".[dev]"

Well-being Factors Supported

Sleep

Nutrition

Stress

Depression

Smoking

Obesity

Wellness

Movement

Architecture Overview

This backend is built using:

FastAPI (API framework)

SQLAlchemy + Alembic (ORM + migrations)

Multi-region database separation (CA / US)

Structured logging

Request ID tracing

Audit logging

Rate limiting

Abuse guard (basic probe blocking)

API key authentication

RBAC (Role-Based Access Control)

The system enforces:

Region isolation via X-Data-Region

Auth via X-API-Key

Scoped endpoint access via RBAC

Audit logging for all outcomes (success, denied, rate-limited, blocked)

Local Setup
python -m venv .venv

# Windows:
.venv\Scripts\activate

# macOS/Linux:
source .venv/bin/activate

pip install -e ".[dev]"

uvicorn app.main:app --reload

Server will run at:

http://127.0.0.1:8001

Required Request Headers

All /api/v1/* endpoints require:

Header	Required	Description
X-Data-Region		CA or US
X-API-Key		API key (default dev key: dev-key)

API Endpoints
1. POST /api/v1/ingest

Ingest a new health record.

Required Scope
ingest:write
Example Request
curl -X POST "http://127.0.0.1:8001/api/v1/ingest" \
  -H "X-Data-Region: CA" \
  -H "X-API-Key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "survey",
    "category": "sleep",
    "value": 7.5,
    "unit": "hours",
    "subject_id": "user-123",
    "timestamp": "2026-02-01T10:00:00Z"
  }'
Response
{
  "status": "accepted"
}

Status: 202 Accepted

2. GET /api/v1/insights

Returns aggregated insight summary by category.

Required Scope
insights:read
Example Request
curl "http://127.0.0.1:8001/api/v1/insights" \
  -H "X-Data-Region: CA" \
  -H "X-API-Key: dev-key"
Response
{
  "total_records": 12,
  "by_category": {
    "sleep": 4,
    "nutrition": 3,
    "stress": 5
  }
}

Status: 200 OK

Error Handling

Frontend should handle the following:

401 Unauthorized

Missing or invalid API key

{
  "detail": "Invalid or missing API key"
}
403 Forbidden

Authenticated but missing required scope

{
  "detail": "Missing required scopes: [...]"
}
429 Too Many Requests

Rate limit exceeded

Headers returned:

x-ratelimit-limit
x-ratelimit-remaining
x-ratelimit-reset
retry-after

Body:

{
  "detail": "Rate limit exceeded"
}

Frontend should retry after retry-after seconds.

400 Bad Request

Blocked by abuse guard (rare in UI use)

{
  "detail": "Blocked by abuse guard"
}
Region Handling

Data is fully isolated by region.

Example:

X-Data-Region: CA

Data written to CA will not appear in US and vice versa.

Security Features Implemented

Request ID tracing (X-Request-Id)

Structured logging

Audit event recording (success, denied, failure)

Abuse guard for path traversal & common probe patterns

Rate limiting

API key authentication

RBAC scope enforcement

Region-based data separation

Testing

Run:

python -m pytest

All tests should pass.

Frontend Integration Guide

Frontend must:

Always send X-Data-Region

Always send X-API-Key

Handle 401 / 403 / 429 gracefully

Retry after 429 if necessary

Never hardcode region; allow switching (CA/US)

Capstone Scope Status
Completed (MVP Production-Ready Backend)

Secure API layer

Multi-region architecture

Data ingestion pipeline

Insights aggregation

Authentication + RBAC

Audit logging

Abuse protection

Rate limiting

Automated tests

Future Improvements (Phase 2)

Database-backed API key management

Key rotation & hashing

Per-role rate limits

Per-tenant isolation

Advanced abuse detection (IP reputation / bot detection)

Metrics & observability (Prometheus / OpenTelemetry)

Fine-grained regional scopes (e.g., insights:read:CA)

JWT-based auth for user sessions

Project Status

Backend is stable and ready for frontend integration.

