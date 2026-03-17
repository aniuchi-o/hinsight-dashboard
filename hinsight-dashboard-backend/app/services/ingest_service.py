# app/services/ingest_service.py
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.ingest_orm import IngestRecord
from app.models.ingest import IngestPayload


def ingest_record(db: Session, payload: IngestPayload, *, tenant_id: str) -> None:
    record = IngestRecord(
        source=payload.source,
        category=payload.category,
        value=payload.value,
        unit=payload.unit,
        tenant_id=tenant_id,
        subject_id=payload.subject_id,
        timestamp=payload.timestamp,
    )

    db.add(record)
    db.commit()


def count_by_category(db: Session, *, tenant_id: str) -> dict[str, int]:
    """
    Count DISTINCT employees (subject_id) per category instead of raw ingest rows.

    Why this fixes the dashboard:
    - The seeded dataset contains multiple rows per employee across many days.
    - Counting raw rows inflates the numbers and makes categories look identical.
    - Counting DISTINCT subject_id gives employee-level counts per category.
    """
    rows = (
        db.query(
            IngestRecord.category,
            func.count(func.distinct(IngestRecord.subject_id)),
        )
        .filter(IngestRecord.tenant_id == tenant_id)
        .group_by(IngestRecord.category)
        .all()
    )
    return {category: count for category, count in rows}


def count_total_employees(db: Session, *, tenant_id: str) -> int:
    """
    Count DISTINCT employees for the tenant.

    This should be used for the top-level total instead of summing category counts,
    because the same employee can appear in multiple categories.
    """
    total = (
        db.query(func.count(func.distinct(IngestRecord.subject_id)))
        .filter(IngestRecord.tenant_id == tenant_id)
        .scalar()
    )
    return int(total or 0)
