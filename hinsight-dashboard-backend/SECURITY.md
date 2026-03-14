
### `SECURITY.md`
```md
# Security Policy

## Rules
- Do not commit secrets (API keys, passwords, tokens).
- Use `.env` locally and GCP Secret Manager later.
- Avoid logging sensitive user data (PII/PHI).

## Reporting
Report security issues to the project lead/sponsor contact via private channel.

## Logging
- Application logs must not include:
  - Credentials
  - Tokens
  - Raw PII / PHI
- Structured JSON logs are written to stdout for Cloud Logging ingestion