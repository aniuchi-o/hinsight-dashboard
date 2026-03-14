from sqlalchemy.orm import Session

from app.services.ingest_service import count_by_category


def compute_insights(db: Session, *, tenant_id: str) -> dict:
    counts = count_by_category(db, tenant_id=tenant_id)
    return {
        "total_records": sum(counts.values()),
        "by_category": counts,
    }
