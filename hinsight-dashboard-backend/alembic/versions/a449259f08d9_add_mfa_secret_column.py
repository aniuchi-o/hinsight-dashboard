"""add mfa_secret column

Revision ID: a449259f08d9
Revises: ee8ef3a2fe88
Create Date: 2026-02-25 08:48:00.828225

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = "a449259f08d9"
down_revision: str | Sequence[str] | None = "ee8ef3a2fe88"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    insp = inspect(bind)
    cols = [c["name"] for c in insp.get_columns(table)]
    return column in cols


def upgrade() -> None:
    if not _has_column("users", "mfa_secret"):
        with op.batch_alter_table("users", schema=None) as batch_op:
            batch_op.add_column(
                sa.Column("mfa_secret", sa.String(length=64), nullable=True)
            )


def downgrade() -> None:
    # Drop only if it exists (so downgrade doesn't crash in mixed states)
    if _has_column("users", "mfa_secret"):
        with op.batch_alter_table("users", schema=None) as batch_op:
            batch_op.drop_column("mfa_secret")
