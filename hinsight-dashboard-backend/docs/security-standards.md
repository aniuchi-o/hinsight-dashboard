
### `docs/security-standards.md`
```md
# Security Standards (Baseline)

- Secrets: never stored in repo; `.env` is local only.
- Auth: default deny (all endpoints require auth unless explicitly public).
- Logging: do not log sensitive data (PII/PHI). Use request IDs for tracing.
- Audit events: auth events, exports, admin/config changes, permission changes.

## Request tracing
- Every request gets an `X-Request-ID` (propagated if client sends one).
- Logs must include `request_id` for traceability.

## Audit logging
Audit events are emitted via `emit_audit_event()` and must be used for:
- Authentication events
- Data export
- Permission/config changes
- Administrative actions
