# GCP Setup (One-time per Project) — Placeholder Mode

# GCP Setup – Phase 1 (No Credentials)

## Status
We are awaiting sponsor credentials / project access.

## Placeholders (to be replaced)
- PROJECT_ID: <SPONSOR_PROJECT_ID>
- REGION: northamerica-northeast1 (Toronto)
- SERVICE_NAME: hinsight-api

## Target Platform
- Cloud Run (container-based deployment)
- Service: Google Cloud Run
- Region: northamerica-northeast1 (Toronto)
- Runtime: Containerized FastAPI (Python 3.11)

## Assumptions
- Container listens on $PORT (default 8080)
- Logs are written to stdout (JSON structured)
- No secrets are committed to repo
- Environment variables provided by Cloud Run at runtime

## Required APIs (to enable once access is granted)
- run.googleapis.com (Cloud Run)
- artifactregistry.googleapis.com (Artifact Registry)
- cloudbuild.googleapis.com (Cloud Build)
- iam.googleapis.com (IAM)
- secretmanager.googleapis.com (Secret Manager)
- logging.googleapis.com (Cloud Logging)
- cloudmonitoring.googleapis.com (Cloud Monitoring)

## Expected Environment Variables
| Name | Purpose |
|----|----|
| APP_ENV | local / staging / prod |
| LOG_LEVEL | INFO / DEBUG |
| SERVICE_NAME | hinsight-dashboard-backend |
| PORT | Injected by Cloud Run |

## Deployment assumptions
- Container listens on $PORT (default 8080)
- Health endpoint: /healthz
- Logs go to stdout (JSON preferred)

## Deployment Model (Future)
- Build container image
- Push to Artifact Registry
- Deploy to Cloud Run using service account