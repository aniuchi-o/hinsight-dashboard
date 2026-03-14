# app/db/urls.py
import os


def db_url_for_region(region: str) -> str:
    region = region.upper()
    if region == "CA":
        return os.getenv("DATABASE_URL_CA", "sqlite:///./hinsight_ca.db")
    if region == "US":
        return os.getenv("DATABASE_URL_US", "sqlite:///./hinsight_us.db")
    raise ValueError(f"Unsupported region: {region}")
