"""add audit_events

Revision ID: 35fb63a9269f
Revises: 341ca173cf74
Create Date: 2026-02-09
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "35fb63a9269f"
down_revision: str | Sequence[str] | None = "341ca173cf74"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
        sa.Column("request_id", sa.String(length=64), nullable=False),
        sa.Column("region", sa.String(length=10), nullable=False),
        sa.Column("actor_id", sa.String(length=64)),
        sa.Column("actor_type", sa.String(length=32)),
        sa.Column("tenant_id", sa.String(length=64)),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("resource", sa.String(length=128)),
        sa.Column("outcome", sa.String(length=32)),
        sa.Column("status_code", sa.Integer()),
        sa.Column("ip", sa.String(length=45)),
        sa.Column("user_agent", sa.String(length=256)),
        sa.Column("detail", sa.Text()),
    )


def downgrade() -> None:
    op.drop_table("audit_events")
