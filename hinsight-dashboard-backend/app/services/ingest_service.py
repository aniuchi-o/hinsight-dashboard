# app/services/ingest_service.py
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.ingest_orm import IngestRecord
from app.models.ingest import IngestPayload

# from app.models.ingest_orm import IngestRecord


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
    rows = (
        db.query(IngestRecord.category, func.count())
        .filter(IngestRecord.tenant_id == tenant_id)
        .group_by(IngestRecord.category)
        .all()
    )
    return {category: count for category, count in rows}
