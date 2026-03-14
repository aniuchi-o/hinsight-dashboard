# app/security/deps.py
from fastapi import HTTPException, Request, status


def get_tenant_id(request: Request) -> str:
    """Return tenant id. Backward compatible defaults to 'default'."""
    tenant = getattr(request.state, "tenant_id", None)
    if tenant:
        return str(tenant)

    header_val = (request.headers.get("X-Tenant-ID") or "").strip()
    return header_val or "default"


def require_scopes(required_scopes: list[str]):
    def dependency(request: Request):
        principal = getattr(request.state, "principal", None)

        if not principal:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )

        principal_scopes = principal.get("scopes", [])

        for scope in required_scopes:
            if scope not in principal_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient scope",
                )

        return principal

    return dependency
