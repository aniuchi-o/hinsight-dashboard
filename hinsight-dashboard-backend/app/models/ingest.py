from typing import Literal

from pydantic import BaseModel, Field


class IngestPayload(BaseModel):
    source: str = Field(..., examples=["survey", "wearable", "manual"])
    category: Literal[
        "sleep",
        "nutrition",
        "stress",
        "depression",
        "smoke",
        "obesity",
        "wellness",
        "movement",
    ]
    value: float
    unit: str
    subject_id: str
    timestamp: str  # ISO 8601 for now
