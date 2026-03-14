# API Standards

## Versioning
All endpoints live under `/v1`.

## Naming
- JSON keys: snake_case
- Resources: plural nouns (e.g., /v1/users)

## Errors (standard)
Return:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "request_id": "string"
  }
}
