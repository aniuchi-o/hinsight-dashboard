# alembic/env.py
import os
from logging.config import fileConfig

from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory

import app.db.ingest_orm  # noqa: F401

# Ensure models are imported so Base.metadata is populated.
# Keep whichever imports your project uses to register ORM models.
import app.db.models  # noqa: F401
from alembic import context
from app.db.base import Base  # noqa: F401
from app.db.session import ENGINES  # noqa: E402

config = context.config

db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _region_from_env() -> str:
    region = (os.getenv("DATA_REGION") or "").strip().upper()
    if region in ENGINES:
        return region
    raise RuntimeError(
        f"Alembic: unsupported DATA_REGION={region!r}. Use 'CA' or 'US'."
    ) from None


def _engine_for_region():
    return ENGINES[_region_from_env()]


def _assert_db_is_at_head(connection) -> None:
    """
    Prevent autogenerate unless the database revision == script head.

    This avoids Alembic trying to "repair" history by recreating tables
    when DB and metadata are out of sync.
    """
    script = ScriptDirectory.from_config(context.config)
    head = script.get_current_head()

    mc = MigrationContext.configure(connection)
    current = mc.get_current_revision()

    # Allow brand-new DB only for upgrade/downgrade, never for autogen
    if current != head:
        raise RuntimeError(
            f"Alembic autogenerate refused: DB revision={current}, script head={head}. "
            "Run `alembic upgrade head` first."
        )


def run_migrations_offline() -> None:
    engine = _engine_for_region()
    url = str(engine.url)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        render_as_batch=True,  # SQLite migrations safety
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = _engine_for_region()

    with connectable.connect() as connection:
        # 🔒 Guard: autogenerate only allowed when DB is at head
        if context.config.cmd_opts and getattr(
            context.config.cmd_opts, "autogenerate", False
        ):
            _assert_db_is_at_head(connection)

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_as_batch=True,  # SQLite migrations safety
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
