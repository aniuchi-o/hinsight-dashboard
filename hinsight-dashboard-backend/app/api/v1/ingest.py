# app/api/v1/ingest.py
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_tenant_id
from app.models.ingest import IngestPayload
from app.security.rbac import require_scopes
from app.services.ingest_service import ingest_record

router = APIRouter(prefix="/api/v1", tags=["ingest"])

# Ruff B008-safe singletons
DB_DEP = Depends(get_db)
INGEST_WRITE_DEP = require_scopes("ingest:write")
TENANT_DEP = Depends(get_tenant_id)


@router.post("/ingest", status_code=status.HTTP_202_ACCEPTED)
def ingest(
    payload: IngestPayload,
    _: Annotated[object, Depends(INGEST_WRITE_DEP)],
    tenant_id: Annotated[str, TENANT_DEP],
    db: Annotated[Session, DB_DEP],
) -> dict:
    ingest_record(db, payload, tenant_id=tenant_id)
    return {"status": "accepted"}
