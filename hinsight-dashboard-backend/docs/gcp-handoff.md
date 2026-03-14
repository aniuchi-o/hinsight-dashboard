# Sponsor Handoff — GCP Access Requirements

To proceed with real GCP setup, sponsor should provide:

## 1) Project details
- GCP Project ID: <SPONSOR_PROJECT_ID>
- Approved region: <REGION> (recommended: northamerica-northeast1)
- Confirm Cloud Run is approved for deployment

## 2) Access to grant
Add user: tonycliff2001@gmail.com

Minimum roles to unblock setup:
- Viewer (to see project)
- Service Usage Admin (or sponsor enables APIs)
- Cloud Run Admin/Developer (to deploy)
- Artifact Registry Admin/Writer (to push images)
- Secret Manager Secret Accessor (runtime secrets)

## 3) Optional
- Naming conventions for services and repositories
- Any org policy constraints (allowed regions, restricted APIs)
