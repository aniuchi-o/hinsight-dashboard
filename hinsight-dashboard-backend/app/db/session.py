# app/db/session.py

from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.data_region import data_region_ctx

DATABASE_URL_CA = os.getenv("DATABASE_URL_CA", "sqlite:///./hinsight_ca.db")
DATABASE_URL_US = os.getenv("DATABASE_URL_US", "sqlite:///./hinsight_us.db")

engine_ca = create_engine(
    DATABASE_URL_CA,
    connect_args={"check_same_thread": False}
    if DATABASE_URL_CA.startswith("sqlite")
    else {},  # SQLite only
)

engine_us = create_engine(
    DATABASE_URL_US,
    connect_args={"check_same_thread": False}
    if DATABASE_URL_US.startswith("sqlite")
    else {},  # SQLite only
)

SessionLocalCA = sessionmaker(autocommit=False, autoflush=False, bind=engine_ca)
SessionLocalUS = sessionmaker(autocommit=False, autoflush=False, bind=engine_us)

# Exported maps (used elsewhere in the app)
ENGINES = {"CA": engine_ca, "US": engine_us}
SESSION_FACTORIES = {"CA": SessionLocalCA, "US": SessionLocalUS}


def get_engine_for_region():
    region = data_region_ctx.get()
    try:
        return ENGINES[region]
    except KeyError:
        raise RuntimeError(f"Unsupported data region: {region}") from None


def get_session_for_region():
    region = data_region_ctx.get()
    try:
        return SESSION_FACTORIES[region]()
    except KeyError:
        raise RuntimeError(f"Unsupported data region: {region}") from None
