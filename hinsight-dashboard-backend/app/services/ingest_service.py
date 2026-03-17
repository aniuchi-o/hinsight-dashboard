# app/services/ingest_service.py
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.ingest_orm import IngestRecord


def count_total_employees(db: Session, *, tenant_id: str) -> int:
    """
    Count DISTINCT employees (exclude seed marker).
    """
    total = (
        db.query(func.count(func.distinct(IngestRecord.subject_id)))
        .filter(
            IngestRecord.tenant_id == tenant_id,
            IngestRecord.subject_id != "seed"
        )
        .scalar()
    )
    return int(total or 0)


def count_by_category(db: Session, *, tenant_id: str) -> dict[str, int]:
    """
    FINAL VERSION:
    - Uses ONLY latest record per employee per category
    - Applies simple risk rules per category
    - Excludes seed marker
    """

    # Subquery: latest record per employee per category
    latest_subq = (
        db.query(
            IngestRecord.subject_id,
            IngestRecord.category,
            func.max(IngestRecord.timestamp).label("latest_ts")
        )
        .filter(
            IngestRecord.tenant_id == tenant_id,
            IngestRecord.subject_id != "seed"
        )
        .group_by(IngestRecord.subject_id, IngestRecord.category)
        .subquery()
    )

    # Join back to get latest values
    latest_records = (
        db.query(IngestRecord)
        .join(
            latest_subq,
            and_(
                IngestRecord.subject_id == latest_subq.c.subject_id,
                IngestRecord.category == latest_subq.c.category,
                IngestRecord.timestamp == latest_subq.c.latest_ts,
            )
        )
    ).all()

    # Risk rules (simple demo thresholds)
    def is_at_risk(category: str, value: float) -> bool:
        if category == "sleep":
            return value < 6
        if category == "stress":
            return value > 6
        if category == "nutrition":
            return value < 6
        if category == "movement":
            return value < 7000
        if category == "obesity":
            return value >= 30
        if category == "smoke":
            return value > 0
        if category == "depression":
            return value > 5
        if category == "wellness":
            return value < 6
        return False

    # Count distinct at-risk employees per category
    category_counts: dict[str, set] = {}

    for record in latest_records:
        if is_at_risk(record.category, float(record.value)):
            category_counts.setdefault(record.category, set()).add(record.subject_id)

    return {k: len(v) for k, v in category_counts.items()}
