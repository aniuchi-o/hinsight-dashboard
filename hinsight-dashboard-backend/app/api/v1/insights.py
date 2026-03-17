# app/api/v1/insights.py
from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.data_region import data_region_ctx
from app.deps import get_db, get_tenant_id
from app.security.rbac import require_scope
from app.services.ingest_service import count_by_category, count_total_employees

router = APIRouter(prefix="/api/v1", tags=["insights"])

DB_DEP = Depends(get_db)
INSIGHTS_READ_DEP = require_scope("insights:read")
TENANT_DEP = Depends(get_tenant_id)


@router.get("/insights")
def insights(
    _: Annotated[object, Depends(INSIGHTS_READ_DEP)],
    tenant_id: Annotated[str, TENANT_DEP],
    db: Annotated[Session, DB_DEP],
) -> dict:
    _region = data_region_ctx.get()

    counts = count_by_category(db, tenant_id=tenant_id)
    total = count_total_employees(db, tenant_id=tenant_id)

    return {
        "total_employees": total,
        "by_category": counts,
        "last_updated_at": datetime.now(timezone.utc).isoformat(),
    }
