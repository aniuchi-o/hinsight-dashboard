"""create ingest tables

Revision ID: 97fc3ee2c418
Revises:
Create Date: 2026-02-08 18:00:12.118924
"""

from collections.abc import Sequence

revision: str = "97fc3ee2c418"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Base revision must be replayable on an empty DB.
    # Actual tables are created in later revisions.
    pass


def downgrade() -> None:
    pass
