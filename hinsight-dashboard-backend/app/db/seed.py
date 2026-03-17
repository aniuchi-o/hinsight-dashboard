# app/db/seed.py

"""
Seed script for Hinsight DB.

Goal:
- Safe to run multiple times (idempotent).
- Region-aware: uses DATA_REGION to pick DATABASE_URL_CA or DATABASE_URL_US.

Run locally (optional):
  DATA_REGION=CA DATABASE_URL_CA=... python -m app.db.seed

Run in Cloud Run Job:
  python -m app.db.seed
"""

import os

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import create_engine, text

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256", "argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_ingest_records(conn, tenant_id: str) -> None:
    """
    Insert deterministic demo data aligned to the user requirement sample.

    This version is intentionally strict and non-random:
    - Uses exactly 241 employees.
    - Uses the provided sample counts for the overview factors.
    - Keeps all 241 employees represented in ingest_records so total_employees stays 241.
    - Creates only one latest record per employee per category, which matches the
      current backend aggregation logic.

    Sample counts applied exactly:
    - sleep: 10 at risk
    - nutrition: 7 at risk
    - smoke: 6 at risk
    - stress: 5 at risk
    - depression: 3 at risk

    Categories not explicitly specified in the sample are seeded as non-risk only,
    so they appear as 0 until business-approved counts are provided.
    """

    marker = conn.execute(
        text("""
        SELECT 1 FROM ingest_records
        WHERE tenant_id=:tid
          AND source='seed'
          AND category='seed_marker'
        LIMIT 1
        """),
        {"tid": tenant_id},
    ).first()

    if marker:
        print("[seed] ingest_records already seeded -> skipping")
        return

    from datetime import timedelta

    now = datetime.now(timezone.utc)
    employees = [f"emp-{i:03d}" for i in range(1, 242)]  # exactly 241 employees

    # Exact counts from the requirement sample.
    target_counts = {
        "sleep": 10,
        "nutrition": 7,
        "smoke": 6,
        "stress": 5,
        "depression": 3,
        # Business sample did not provide approved top-level counts for these yet.
        "wellness": 0,
        "movement": 0,
        "obesity": 0,
    }

    units = {
        "sleep": "hours",
        "nutrition": "score",
        "stress": "score",
        "depression": "score",
        "smoke": "cigs_per_day",
        "obesity": "bmi",
        "wellness": "score",
        "movement": "steps",
    }

    # Values aligned to the CURRENT backend risk rules.
    # At-risk rules in backend:
    # sleep < 6, nutrition < 6, stress > 6, depression > 5,
    # smoke > 0, obesity >= 30, wellness < 6, movement < 7000
    risk_values = {
        "sleep": 5.0,
        "nutrition": 5.0,
        "stress": 8.0,
        "depression": 7.0,
        "smoke": 3.0,
        "obesity": 32.0,
        "wellness": 4.0,
        "movement": 5000.0,
    }

    safe_values = {
        "sleep": 7.5,
        "nutrition": 8.0,
        "stress": 3.0,
        "depression": 2.0,
        "smoke": 0.0,
        "obesity": 24.0,
        "wellness": 8.0,
        "movement": 9000.0,
    }

    # Deterministic employee allocation. No randomness.
    # We intentionally use disjoint slices so the counts are exact and explainable.
    at_risk_cohorts = {
        "sleep": set(employees[0:10]),
        "nutrition": set(employees[10:17]),
        "smoke": set(employees[17:23]),
        "stress": set(employees[23:28]),
        "depression": set(employees[28:31]),
        "wellness": set(),
        "movement": set(),
        "obesity": set(),
    }

    rows = []

    # 1) Ensure every employee exists in ingest_records at least once so total_employees = 241.
    # We use a safe wellness baseline for everyone. This will not count as at-risk.
    baseline_ts = (now - timedelta(days=2)).isoformat()
    for emp in employees:
        rows.append(
            {
                "source": "seed",
                "category": "wellness",
                "value": safe_values["wellness"],
                "unit": units["wellness"],
                "subject_id": emp,
                "timestamp": baseline_ts,
                "tenant_id": tenant_id,
            }
        )

    # 2) Seed exact requested factor counts using one latest record per employee/category.
    category_order = [
        "sleep",
        "nutrition",
        "smoke",
        "stress",
        "depression",
        "movement",
        "obesity",
    ]

    for idx, category in enumerate(category_order, start=1):
        ts = (now - timedelta(days=1, minutes=idx)).isoformat()

        # Add at-risk rows only for the exact approved employees in this factor.
        for emp in at_risk_cohorts.get(category, set()):
            rows.append(
                {
                    "source": "seed",
                    "category": category,
                    "value": risk_values[category],
                    "unit": units[category],
                    "subject_id": emp,
                    "timestamp": ts,
                    "tenant_id": tenant_id,
                }
            )

    # 3) Insert seed marker last.
    conn.execute(
        text("""
        INSERT INTO ingest_records
        (source, category, value, unit, subject_id, timestamp, tenant_id)
        VALUES
        ('seed','seed_marker',1,'marker','seed',:ts,:tid)
        """),
        {"ts": now.isoformat(), "tid": tenant_id},
    )

    conn.execute(
        text("""
        INSERT INTO ingest_records
        (source, category, value, unit, subject_id, timestamp, tenant_id)
        VALUES
        (:source,:category,:value,:unit,:subject_id,:timestamp,:tenant_id)
        """),
        rows,
    )

    summary = {category: len(at_risk_cohorts.get(category, set())) for category in category_order}
    print(f"[seed] inserted ingest_records rows={len(rows)} for employees={len(employees)}")
    print(f"[seed] exact factor counts={summary}")


def seed_platform_admin(conn, platform_tenant_id: str) -> None:
    """Seed the platform tenant and its admin account."""
    platform_email = os.getenv("PLATFORM_ADMIN_EMAIL", "platform@hinsight.dev").strip().lower()
    platform_password = os.getenv("PLATFORM_ADMIN_PASSWORD", "PlatformPass123!").strip()

    conn.execute(
        text("""
            INSERT INTO users
                (id, tenant_id, email, password_hash, role, is_active, created_at, mfa_enabled, mfa_secret)
            VALUES
                (:id, :tenant_id, :email, :password_hash, 'platform_admin', TRUE, :created_at, FALSE, NULL)
            ON CONFLICT (tenant_id, email) DO NOTHING
        """),
        {
            "id": str(uuid4()),
            "tenant_id": platform_tenant_id,
            "email": platform_email,
            "password_hash": hash_password(platform_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    print(f"[seed] ensured platform_admin user {platform_email}")


def seed_alerts(conn, tenant_id: str) -> None:
    marker = conn.execute(
        text("SELECT 1 FROM alerts WHERE tenant_id=:tid AND alert_type='seed_marker' LIMIT 1"),
        {"tid": tenant_id},
    ).first()
    if marker:
        print("[seed] alerts already seeded -> skipping")
        return

    now = datetime.now(timezone.utc)
    alerts = [
        {
            "id": str(uuid4()), "tenant_id": tenant_id,
            "alert_type": "THRESHOLD_BREACH", "severity": "CRITICAL",
            "title": "Stress concerns exceed 30% workforce threshold",
            "description": "The number of employees reporting high stress levels has surpassed the configured 30% population threshold.",
            "affected_metric": "CF_str_Count", "affected_value": 421.0,
            "threshold_value": 374.0, "percentage_of_workforce": 33.8,
            "related_view": "overview", "created_at": now.isoformat(), "expires_at": None,
        },
        {
            "id": str(uuid4()), "tenant_id": tenant_id,
            "alert_type": "RISK_SPIKE", "severity": "WARNING",
            "title": "Cardiovascular disease risk increased by 8% since last period",
            "description": "D_CVD_risk_Count has increased by 8.2 percentage points compared to the previous 30-day rolling average.",
            "affected_metric": "D_CVD_risk_Count", "affected_value": 143.0,
            "threshold_value": 132.0, "percentage_of_workforce": 11.5,
            "related_view": "lifestyle", "created_at": now.isoformat(), "expires_at": None,
        },
        {
            "id": str(uuid4()), "tenant_id": tenant_id,
            "alert_type": "IMPROVEMENT_REGRESSION", "severity": "WARNING",
            "title": "Obesity improvement rate dropped below 25% baseline",
            "description": "The tracked improvement rate for obesity-related metrics has declined to 22%.",
            "affected_metric": "D_obesity_improvement_rate", "affected_value": 22.0,
            "threshold_value": 25.0, "percentage_of_workforce": None,
            "related_view": "nutrition_obesity", "created_at": now.isoformat(), "expires_at": None,
        },
        {
            "id": str(uuid4()), "tenant_id": tenant_id,
            "alert_type": "COHORT_SUPPRESSION", "severity": "INFORMATIONAL",
            "title": "Cancer metrics suppressed - cohort below k-anonymity threshold",
            "description": "CF_CanC_Count contains fewer than 10 individuals. Suppressed per HIPAA/PHIPA k-anonymity requirements.",
            "affected_metric": "CF_CanC_Count", "affected_value": 7.0,
            "threshold_value": 10.0, "percentage_of_workforce": None,
            "related_view": "overview", "created_at": now.isoformat(), "expires_at": None,
        },
        {
            "id": str(uuid4()), "tenant_id": tenant_id,
            "alert_type": "DATA_STALENESS", "severity": "INFORMATIONAL",
            "title": "Feelings dashboard data is 26 hours old",
            "description": "The aggregated data for the Feelings dashboard view has not refreshed within the expected 24-hour window.",
            "affected_metric": None, "affected_value": None,
            "threshold_value": None, "percentage_of_workforce": None,
            "related_view": "feelings", "created_at": now.isoformat(), "expires_at": None,
        },
        # seed marker - always last
        {
            "id": str(uuid4()), "tenant_id": tenant_id,
            "alert_type": "seed_marker", "severity": "INFORMATIONAL",
            "title": "seed_marker", "description": "seed_marker",
            "affected_metric": None, "affected_value": None,
            "threshold_value": None, "percentage_of_workforce": None,
            "related_view": None, "created_at": now.isoformat(), "expires_at": None,
        },
    ]
    conn.execute(
        text("""
            INSERT INTO alerts
              (id, tenant_id, alert_type, severity, title, description,
               affected_metric, affected_value, threshold_value,
               percentage_of_workforce, related_view, created_at, expires_at)
            VALUES
              (:id, :tenant_id, :alert_type, :severity, :title, :description,
               :affected_metric, :affected_value, :threshold_value,
               :percentage_of_workforce, :related_view, :created_at, :expires_at)
        """),
        alerts,
    )
    print(f"[seed] inserted {len(alerts) - 1} alerts for tenant {tenant_id}")




def alerts_table_exists(conn) -> bool:
    """Return True only when the alerts table exists in the current database."""
    return bool(
        conn.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = 'alerts'
                )
            """)
        ).scalar()
    )


def seed(db_url: str, region: str) -> None:
    engine = create_engine(db_url, pool_pre_ping=True)

    with engine.begin() as conn:
        # 1) Confirm DB connection
        conn.execute(text("SELECT 1"))

        # 2) Confirm alembic table exists + show current revision
        try:
            rev = conn.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
        except Exception as e:
            raise SystemExit(
                f"alembic_version missing or unreadable. Run migrations first. ({e.__class__.__name__})"
            ) from e
        print(f"[seed] alembic_version={rev}")

        # ---- Minimal seed marker (safe, non-destructive) ----
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(text("SELECT :msg"), {"msg": f"seed ran at {now}"})
        print(f"[seed] marker ok: {now}")

        # --- Inspect tenants schema (Cloud Run-safe) ---
        try:
            cols = conn.execute(
                text(
                    """
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = 'tenants'
                    ORDER BY ordinal_position
                    """
                )
            ).fetchall()
            print("[seed] tenants schema:")
            for r in cols:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] tenants schema: SKIP ({e.__class__.__name__})")
            
        # --- Inspect users schema (Cloud Run-safe) ---
        try:
            ucols = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """)).fetchall()
            print("[seed] users schema:")
            for r in ucols:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] users schema: SKIP ({e.__class__.__name__})")

        # --- Verify users constraints (to confirm UNIQUE email exists) ---
        try:
            constraints = conn.execute(text("""
                SELECT conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                WHERE t.relname = 'users'
            """)).fetchall()

            print("[seed] users constraints:")
            for r in constraints:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] users constraints: SKIP ({e.__class__.__name__})")

        # --- Inspect ingest_records schema (Cloud Run-safe) ---
        try:
            cols = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'ingest_records'
                ORDER BY ordinal_position
            """)).fetchall()
            print("[seed] ingest_records schema:")
            for r in cols:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] ingest_records schema: SKIP ({e.__class__.__name__})")

        # --- Inspect ingest_records constraints (optional but useful for ON CONFLICT) ---
        try:
            csts = conn.execute(text("""
                SELECT conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_class t ON t.oid = c.conrelid
                WHERE t.relname = 'ingest_records'
                ORDER BY conname
            """)).fetchall()
            print("[seed] ingest_records constraints:")
            for r in csts:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] ingest_records constraints: SKIP ({e.__class__.__name__})")
        
        # Optional: stop here if INSPECT_ONLY=1
        if os.getenv("INSPECT_ONLY", "") == "1":
            print("[seed] INSPECT_ONLY=1 -> exiting before inserts")
            return

        # ---- Seed platform tenant (idempotent) ----
        conn.execute(
            text("""
                INSERT INTO tenants (id, slug, name, data_region, created_at)
                VALUES (:id, 'platform', 'Platform', :data_region, :created_at)
                ON CONFLICT (slug) DO NOTHING
            """),
            {
                "id": str(uuid4()),
                "data_region": region,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        print("[seed] ensured platform tenant")

        platform_tenant_id = conn.execute(
            text("SELECT id FROM tenants WHERE slug='platform'")
        ).scalar_one()
        print(f"[seed] platform_tenant_id={platform_tenant_id}")

        seed_platform_admin(conn, platform_tenant_id)

        # ---- Seed tenant (idempotent) ----
        # Your tenants table requires BOTH id and data_region (both NOT NULL),
        # so we provide them explicitly.
        conn.execute(
            text(
                """
                INSERT INTO tenants (id, slug, name, data_region, created_at)
                VALUES (:id, :slug, :name, :data_region, :created_at)
                ON CONFLICT (slug) DO NOTHING
                """
            ),
            {
                "id": str(uuid4()),
                "slug": "demo",
                "name": "Demo Tenant",
                "data_region": region,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        print("[seed] ensured tenant demo")


# ---- Fetch demo tenant_id (no guessing) ----
        tenant_id = conn.execute(
            text("SELECT id FROM tenants WHERE slug=:slug"),
            {"slug": "demo"},
        ).scalar_one()
        print(f"[seed] demo tenant_id={tenant_id}")

# ---- Seed demo user (idempotent) ----
        demo_email = os.getenv("DEMO_ADMIN_EMAIL", "admin@demo.com").strip().lower()
        demo_password = os.getenv("DEMO_ADMIN_PASSWORD", "DemoPass123!").strip()

        conn.execute(
            text("""
                INSERT INTO users
                    (id, tenant_id, email, password_hash, role, is_active, created_at, mfa_enabled, mfa_secret)
                VALUES
                    (:id, :tenant_id, :email, :password_hash, :role, TRUE, :created_at, FALSE, NULL)
                ON CONFLICT (tenant_id, email) DO NOTHING
            """),
            {
                "id": str(uuid4()),
                "tenant_id": tenant_id,
                "email": demo_email,
                "password_hash": hash_password(demo_password),
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        print(f"[seed] ensured demo user {demo_email}")

        viewer_email = "user@demo.com"
        conn.execute(
            text("""
                INSERT INTO users
                    (id, tenant_id, email, password_hash, role, is_active, created_at, mfa_enabled, mfa_secret)
                VALUES
                    (:id, :tenant_id, :email, :password_hash, 'viewer', TRUE, :created_at, FALSE, NULL)
                ON CONFLICT (tenant_id, email) DO NOTHING
            """),
            {
                "id": str(uuid4()),
                "tenant_id": tenant_id,
                "email": viewer_email,
                "password_hash": hash_password("DemoPass123!"),
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        print(f"[seed] ensured viewer user {viewer_email}")

        print(f"[seed] ensured demo user {demo_email}")

        # ---- Seed demo dashboard dataset ----
        seed_ingest_records(conn, tenant_id)

        # Seed alerts only if the alerts table exists in this environment.
        if alerts_table_exists(conn):
            seed_alerts(conn, tenant_id)
        else:
            print("[seed] alerts table not found -> skipping alert seeding")
               
        # ---- Verification counts (safe) ----
        def _count(table: str) -> int:
            return int(conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0)

        for t in ["tenants", "users", "audit_events", "ingest_records"]:
            try:
                print(f"[seed] count {t}={_count(t)}")
            except Exception as e:
                print(f"[seed] count {t}=SKIP ({e.__class__.__name__})")

    print("[seed] done")

def main() -> None:
    region = os.getenv("DATA_REGION", "").strip().upper()
    url_ca = os.getenv("DATABASE_URL_CA", "")
    url_us = os.getenv("DATABASE_URL_US", "")

    if region not in {"CA", "US"}:
        raise SystemExit("DATA_REGION must be CA or US")

    db_url = url_ca if region == "CA" else url_us
    if not db_url:
        raise SystemExit(f"Missing DATABASE_URL for region {region}")

    print(f"[seed] region={region}")
    seed(db_url, region)


if __name__ == "__main__":
    main()