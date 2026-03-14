"""create ingest tables

Revision ID: 341ca173cf74
Revises: 001ef74a7d34
Create Date: 2026-02-09 13:14:54.576845
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "341ca173cf74"
down_revision: str | Sequence[str] | None = "001ef74a7d34"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ingest_records",
        sa.Column(
            "id", sa.Integer(), primary_key=True, nullable=False, autoincrement=True
        ),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("subject_id", sa.String(length=100), nullable=False),
        sa.Column("timestamp", sa.String(length=40), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ingest_records")
