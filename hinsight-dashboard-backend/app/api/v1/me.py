from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.jwt_current_user import get_current_user
from app.core.data_region import data_region_ctx
from app.deps import get_db
from app.models.user import User
from app.models.user_preference import UserPreference

router = APIRouter(prefix="/api/v1", tags=["me"])

DEFAULT_PREFS: dict = {
	"defaultView": "overview",
	"chartAnimation": "ENABLED",
	"dataDisplayMode": "COUNTS_AND_PERCENTAGES",
	"highContrast": False,
	"reducedMotion": False,
	"alertDigestFrequency": "WEEKLY",
}

DEFAULT_COMPLIANCE: dict = {
	"hipaaNoticeAcceptedAt": None,
	"phipaNoticeAcceptedAt": None,
	"dataRetentionPolicyVersion": "2025-01",
	"lastPolicyReviewedAt": None,
	"requiresReacceptance": False,
}


def _now_iso() -> str:
	return datetime.now(timezone.utc).isoformat()


def _is_demo_account(user: User) -> bool:
	return user.email in {"admin@demo.com", "user@demo.com"}


def _default_compliance_for_user(user: User) -> dict:
	if _is_demo_account(user):
		demo_accepted_at = "2026-03-01T00:00:00+00:00"
		return {
			"hipaaNoticeAcceptedAt": demo_accepted_at,
			"phipaNoticeAcceptedAt": demo_accepted_at,
			"dataRetentionPolicyVersion": "2025-01",
			"lastPolicyReviewedAt": demo_accepted_at,
			"requiresReacceptance": False,
		}
	return {**DEFAULT_COMPLIANCE}


def _read_pref_payload(pref: UserPreference | None, current_user: User) -> tuple[dict, dict]:
	payload = json.loads(pref.preferences_json) if pref else {}
	prefs = {**DEFAULT_PREFS, **{k: v for k, v in payload.items() if not k.startswith("__")}}
	compliance = {**_default_compliance_for_user(current_user), **payload.get("__compliance", {})}
	if _is_demo_account(current_user):
		compliance = _default_compliance_for_user(current_user)
	return prefs, compliance


def _write_pref_payload(pref: UserPreference, prefs: dict, compliance: dict) -> None:
	pref.preferences_json = json.dumps({
		**prefs,
		"__compliance": compliance,
	})


@router.get("/me")
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> dict:
	return {
		"id": current_user.id,
		"email": current_user.email,
		"role": current_user.role,
		"tenant_id": current_user.tenant_id,
		"is_active": current_user.is_active,
		"mfa_enabled": current_user.mfa_enabled,
		"created_at": current_user.created_at.isoformat(),
	}


@router.get("/me/settings")
def get_settings(
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
) -> dict:
	pref = (
		db.query(UserPreference)
		.filter(UserPreference.user_id == current_user.id)
		.one_or_none()
	)
	prefs, compliance = _read_pref_payload(pref, current_user)
	now = _now_iso()
	region = data_region_ctx.get() or "CA"
	return {
		"userId": current_user.id,
		"preferences": prefs,
		"session": {
			"sessionId": current_user.id,
			"tenantId": current_user.tenant_id,
			"tenantRegion": region,
			"lastLoginAt": now,
			"sessionStartedAt": now,
			"sessionTimeoutMinutes": 60,
			"ipRegion": "Canada" if region == "CA" else "United States",
		},
		"compliance": compliance,
	}


@router.put("/me/settings")
def update_settings(
	payload: dict,
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
) -> dict:
	pref = (
		db.query(UserPreference)
		.filter(UserPreference.user_id == current_user.id)
		.one_or_none()
	)
	if pref is None:
		pref = UserPreference(
			user_id=current_user.id,
			preferences_json=json.dumps(DEFAULT_PREFS),
		)
		db.add(pref)
	current_prefs, compliance = _read_pref_payload(pref, current_user)
	current_prefs.update(payload)
	_write_pref_payload(pref, current_prefs, compliance)
	db.commit()
	return {"userId": current_user.id, "preferences": current_prefs}


@router.post("/me/compliance/accept")
def accept_compliance(
	payload: dict,
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
) -> dict:
	notice_type = str(payload.get("noticeType", "")).upper()
	accepted_at = str(payload.get("acceptedAt") or _now_iso())
	policy_version = str(payload.get("policyVersion") or "2025-01")

	if notice_type not in {"HIPAA", "PHIPA", "DATA_RETENTION"}:
		raise HTTPException(status_code=400, detail="Invalid noticeType")

	pref = (
		db.query(UserPreference)
		.filter(UserPreference.user_id == current_user.id)
		.one_or_none()
	)
	if pref is None:
		pref = UserPreference(
			user_id=current_user.id,
			preferences_json=json.dumps(DEFAULT_PREFS),
		)
		db.add(pref)

	current_prefs, compliance = _read_pref_payload(pref, current_user)
	if notice_type == "HIPAA":
		compliance["hipaaNoticeAcceptedAt"] = accepted_at
	elif notice_type == "PHIPA":
		compliance["phipaNoticeAcceptedAt"] = accepted_at
	else:
		compliance["lastPolicyReviewedAt"] = accepted_at

	compliance["dataRetentionPolicyVersion"] = policy_version
	compliance["requiresReacceptance"] = False

	_write_pref_payload(pref, current_prefs, compliance)
	db.commit()
	return {"status": "accepted", "compliance": compliance}


@router.get("/admin/users")
def list_tenant_users(
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
) -> dict:
	"""Returns all users in the caller's tenant. Restricted to role=admin."""
	if current_user.role != "admin":
		raise HTTPException(status_code=403, detail="Admin only")
	users = (
		db.query(User)
		.filter(User.tenant_id == current_user.tenant_id)
		.order_by(User.created_at)
		.all()
	)
	return {
		"users": [
			{
				"id": u.id,
				"email": u.email,
				"role": u.role,
				"is_active": u.is_active,
				"created_at": u.created_at.isoformat(),
			}
			for u in users
		],
		"total": len(users),
	}
