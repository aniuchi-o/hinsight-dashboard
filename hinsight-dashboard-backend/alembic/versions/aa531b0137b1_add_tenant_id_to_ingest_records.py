"""add tenant_id to ingest_records

Revision ID: c2a1f0f5b3a1
Revises: aa531b0137b1
Create Date: 2026-02-23
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c2a1f0f5b3a1"
down_revision: str | Sequence[str] | None = "aa531b0137b1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("ingest_records") as batch:
        batch.add_column(
            sa.Column(
                "tenant_id",
                sa.String(length=128),
                nullable=False,
                server_default="default",
            )
        )
        batch.create_index("ix_ingest_records_tenant_id", ["tenant_id"])


def downgrade() -> None:
    with op.batch_alter_table("ingest_records") as batch:
        batch.drop_index("ix_ingest_records_tenant_id")
        batch.drop_column("tenant_id")
