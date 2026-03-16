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
    Insert a realistic multi-employee demo dataset into ingest_records.

    Why this version is stronger:
    - Seeds 241 synthetic employees instead of a single demo subject.
    - Produces different factor prevalence per category, so overview cards do not all match.
    - Introduces realistic overlap between related factors (for example stress + sleep).
    - Adds 30 days of trend data so charts show change over time.
    - Keeps the seed idempotent through a seed marker.
    """

    # Skip if already seeded.
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

    # Standard library imports kept local so the rest of the file stays unchanged.
    import random
    from datetime import timedelta

    now = datetime.now(timezone.utc)
    rng = random.Random(42)  # fixed seed for repeatable demo data

    # Match the UI employee count already shown on the dashboard.
    employees = [f"emp-{i:03d}" for i in range(1, 242)]  # 241 employees

    # Each category has a different prevalence target so the cards and category pages diverge.
    # The counts below are intentionally uneven to create an executive-friendly story:
    # stress highest, then sleep/movement, then nutrition/obesity, with smoke smaller.
    factor_targets = {
        "stress": 68,
        "sleep": 54,
        "movement": 49,
        "nutrition": 43,
        "obesity": 39,
        "wellness": 34,
        "depression": 27,
        "smoke": 18,
    }

    categories = {
        "sleep": "hours",
        "nutrition": "score",
        "stress": "score",
        "depression": "score",
        "smoke": "cigs_per_day",
        "obesity": "bmi",
        "wellness": "score",
        "movement": "steps",
    }

    # Start by selecting a distinct employee cohort for each factor.
    cohorts = {
        factor: set(rng.sample(employees, target))
        for factor, target in factor_targets.items()
    }

    # Add realistic overlaps between related factors.
    # Stress and sleep problems often appear together.
    stress_sleep_overlap = set(rng.sample(list(cohorts["stress"]), 28))
    cohorts["sleep"].update(stress_sleep_overlap)

    # Nutrition and obesity commonly correlate.
    obesity_nutrition_overlap = set(rng.sample(list(cohorts["obesity"]), 20))
    cohorts["nutrition"].update(obesity_nutrition_overlap)

    # Low wellness and depression can overlap.
    depression_wellness_overlap = set(rng.sample(list(cohorts["depression"]), 12))
    cohorts["wellness"].update(depression_wellness_overlap)

    # Movement risk often overlaps with obesity.
    obesity_movement_overlap = set(rng.sample(list(cohorts["obesity"]), 16))
    cohorts["movement"].update(obesity_movement_overlap)

    rows = []

    # Build a 30-day time series from oldest -> newest so line/bar trends make sense.
    for day in range(30):
        ts = (now - timedelta(days=(29 - day))).isoformat()

        for emp in employees:
            for factor, unit in categories.items():
                in_cohort = emp in cohorts[factor]

                # The values below are chosen so the frontend can classify employees into
                # different dashboard states while still looking realistic in charts.
                if factor == "sleep":
                    # Risk cohort sleeps fewer hours; slight improvement across time.
                    value = rng.uniform(4.8, 6.1) if in_cohort else rng.uniform(6.8, 8.2)
                    value += 0.02 * day

                elif factor == "nutrition":
                    # Lower score means poorer nutrition; slight improvement over time.
                    value = rng.uniform(3.8, 5.8) if in_cohort else rng.uniform(6.2, 8.7)
                    value += 0.015 * day

                elif factor == "stress":
                    # High score is bad here; interventions reduce the average slightly.
                    value = rng.uniform(7.2, 9.4) if in_cohort else rng.uniform(2.4, 5.7)
                    value -= 0.03 * day

                elif factor == "depression":
                    # High score is bad; slight improvement over time.
                    value = rng.uniform(6.0, 8.3) if in_cohort else rng.uniform(1.8, 4.7)
                    value -= 0.015 * day

                elif factor == "smoke":
                    # Smokers show materially higher daily consumption and gradual reduction.
                    value = rng.uniform(6.0, 15.0) if in_cohort else rng.uniform(0.0, 1.0)
                    value -= 0.05 * day

                elif factor == "obesity":
                    # BMI higher in at-risk cohort; very small improvement over time.
                    value = rng.uniform(30.5, 37.5) if in_cohort else rng.uniform(21.0, 27.5)
                    value -= 0.03 * day

                elif factor == "wellness":
                    # Lower wellness score for the affected cohort; gradual recovery trend.
                    value = rng.uniform(3.8, 5.8) if in_cohort else rng.uniform(6.5, 8.8)
                    value += 0.02 * day

                elif factor == "movement":
                    # At-risk cohort has lower daily steps; steps rise over time.
                    value = rng.uniform(2500, 5200) if in_cohort else rng.uniform(7000, 11000)
                    value += 35 * day

                rows.append(
                    {
                        "source": "seed",
                        "category": factor,
                        "value": round(float(value), 2),
                        "unit": unit,
                        "subject_id": emp,
                        "timestamp": ts,
                        "tenant_id": tenant_id,
                    }
                )

    # Insert seed marker after building the rows.
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

    print(f"[seed] inserted ingest_records rows={len(rows)} for employees={len(employees)}")


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
            "id": str(uuid4()),
            "tenant_id": tenant_id,
            "alert_type": "THRESHOLD_BREACH",
            "severity": "CRITICAL",
            "title": "Stress concerns exceed 30% workforce threshold",
            "description": "The number of employees reporting high stress levels has surpassed the configured 30% population threshold.",
            "affected_metric": "CF_str_Count",
            "affected_value": 421.0,
            "threshold_value": 374.0,
            "percentage_of_workforce": 33.8,
            "related_view": "overview",
            "created_at": now.isoformat(),
            "expires_at": None,
        },
        {
            "id": str(uuid4()),
            "tenant_id": tenant_id,
            "alert_type": "RISK_SPIKE",
            "severity": "WARNING",
            "title": "Cardiovascular disease risk increased by 8% since last period",
            "description": "D_CVD_risk_Count has increased by 8.2 percentage points compared to the previous 30-day rolling average.",
            "affected_metric": "D_CVD_risk_Count",
            "affected_value": 143.0,
            "threshold_value": 132.0,
            "percentage_of_workforce": 11.5,
            "related_view": "lifestyle",
            "created_at": now.isoformat(),
            "expires_at": None,
        },
        {
            "id": str(uuid4()),
            "tenant_id": tenant_id,
            "alert_type": "IMPROVEMENT_REGRESSION",
            "severity": "WARNING",
            "title": "Obesity improvement rate dropped below 25% baseline",
            "description": "The tracked improvement rate for obesity-related metrics has declined to 22%.",
            "affected_metric": "D_obesity_improvement_rate",
            "affected_value": 22.0,
            "threshold_value": 25.0,
            "percentage_of_workforce": None,
            "related_view": "nutrition_obesity",
            "created_at": now.isoformat(),
            "expires_at": None,
        },
        {
            "id": str(uuid4()),
            "tenant_id": tenant_id,
            "alert_type": "COHORT_SUPPRESSION",
            "severity": "INFORMATIONAL",
            "title": "Cancer metrics suppressed - cohort below k-anonymity threshold",
            "description": "CF_CanC_Count contains fewer than 10 individuals. Suppressed per HIPAA/PHIPA k-anonymity requirements.",
            "affected_metric": "CF_CanC_Count",
            "affected_value": 7.0,
            "threshold_value": 10.0,
            "percentage_of_workforce": None,
            "related_view": "overview",
            "created_at": now.isoformat(),
            "expires_at": None,
        },
        {
            "id": str(uuid4()),
            "tenant_id": tenant_id,
            "alert_type": "DATA_STALENESS",
            "severity": "INFORMATIONAL",
            "title": "Feelings dashboard data is 26 hours old",
            "description": "The aggregated data for the Feelings dashboard view has not refreshed within the expected 24-hour window.",
            "affected_metric": None,
            "affected_value": None,
            "threshold_value": None,
            "percentage_of_workforce": None,
            "related_view": "feelings",
            "created_at": now.isoformat(),
            "expires_at": None,
        },
        # seed marker - always last
        {
            "id": str(uuid4()),
            "tenant_id": tenant_id,
            "alert_type": "seed_marker",
            "severity": "INFORMATIONAL",
            "title": "seed_marker",
            "description": "seed_marker",
            "affected_metric": None,
            "affected_value": None,
            "threshold_value": None,
            "percentage_of_workforce": None,
            "related_view": None,
            "created_at": now.isoformat(),
            "expires_at": None,
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
    """
    Check whether the alerts table exists before attempting alert seeding.

    This avoids rolling back the whole seed transaction in environments where
    the alerts table has not been created yet.
    """
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
            ucols = conn.execute(
                text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """)
            ).fetchall()
            print("[seed] users schema:")
            for r in ucols:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] users schema: SKIP ({e.__class__.__name__})")

        # --- Verify users constraints (to confirm UNIQUE email exists) ---
        try:
            constraints = conn.execute(
                text("""
                SELECT conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                WHERE t.relname = 'users'
            """)
            ).fetchall()

            print("[seed] users constraints:")
            for r in constraints:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] users constraints: SKIP ({e.__class__.__name__})")

        # --- Inspect ingest_records schema (Cloud Run-safe) ---
        try:
            cols = conn.execute(
                text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'ingest_records'
                ORDER BY ordinal_position
            """)
            ).fetchall()
            print("[seed] ingest_records schema:")
            for r in cols:
                print(f"[seed]   {r}")
        except Exception as e:
            print(f"[seed] ingest_records schema: SKIP ({e.__class__.__name__})")

        # --- Inspect ingest_records constraints (optional but useful for ON CONFLICT) ---
        try:
            csts = conn.execute(
                text("""
                SELECT conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_class t ON t.oid = c.conrelid
                WHERE t.relname = 'ingest_records'
                ORDER BY conname
            """)
            ).fetchall()
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