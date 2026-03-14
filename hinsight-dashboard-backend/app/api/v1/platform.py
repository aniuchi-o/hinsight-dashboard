from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.jwt_current_user import get_current_user
from app.db.session import SessionLocalCA, SessionLocalUS
from app.models.tenant import Tenant
from app.models.user import User

router = APIRouter(prefix="/api/v1/platform", tags=["platform"])


def require_platform_admin(
	current_user: Annotated[User, Depends(get_current_user)],
) -> User:
	if current_user.role != "platform_admin":
		raise HTTPException(status_code=403, detail="Platform admin only")
	return current_user


@router.get("/tenants")
def list_all_tenants(
	_admin: Annotated[User, Depends(require_platform_admin)],
) -> dict:
	"""
	Returns all tenants across both CA and US regions, each with their admin users.
	Queries both region databases directly since platform_admin has cross-region scope.
	"""
	result = []

	for region, SessionClass in [("CA", SessionLocalCA), ("US", SessionLocalUS)]:
		db = SessionClass()
		try:
			tenants = db.query(Tenant).order_by(Tenant.created_at).all()
			for tenant in tenants:
				if tenant.slug == "platform":
					continue  # exclude the platform sentinel tenant itself
				admins = (
					db.query(User)
					.filter(User.tenant_id == tenant.id, User.role == "admin")
					.all()
				)
				result.append({
					"id": tenant.id,
					"slug": tenant.slug,
					"name": tenant.name,
					"data_region": tenant.data_region,
					"created_at": tenant.created_at.isoformat(),
					"admins": [
						{
							"id": u.id,
							"email": u.email,
							"role": u.role,
							"is_active": u.is_active,
							"created_at": u.created_at.isoformat(),
						}
						for u in admins
					],
				})
		finally:
			db.close()

	return {"tenants": result, "total": len(result)}
