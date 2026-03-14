"""check autogen wiring

Revision ID: 86e716e20261
Revises: 97fc3ee2c418
Create Date: 2026-02-09 12:02:42.459625
"""

from collections.abc import Sequence

revision: str = "86e716e20261"
down_revision: str | Sequence[str] | None = "97fc3ee2c418"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # No-op: must not assume tables exist yet.
    pass


def downgrade() -> None:
    pass
