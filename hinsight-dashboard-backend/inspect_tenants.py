import os
from sqlalchemy import create_engine, text

db_url = os.environ["DATABASE_URL_CA"]
engine = create_engine(db_url)

with engine.begin() as conn:
    rows = conn.execute(text("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'tenants'
        ORDER BY ordinal_position
    """)).fetchall()

for r in rows:
    print(r)