from __future__ import annotations

import datetime as dt
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.jwt_current_user import get_current_user
from app.deps import get_db
from app.models.alert import Alert
from app.models.alert_acknowledgement import AlertAcknowledgement
from app.models.user import User

router = APIRouter(prefix="/api/v1", tags=["alerts"])


@router.get("/alerts")
def list_alerts(
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
	severity: str = Query("ALL"),
	show_acknowledged: bool = Query(False),
) -> dict:
	query = db.query(Alert).filter(
		Alert.tenant_id == current_user.tenant_id,
		Alert.alert_type != "seed_marker",
	)
	if severity != "ALL":
		query = query.filter(Alert.severity == severity)
	alerts = query.order_by(Alert.created_at.desc()).all()

	acked_ids: set[str] = {
		a.alert_id
		for a in db.query(AlertAcknowledgement)
		.filter(AlertAcknowledgement.user_id == current_user.id)
		.all()
	}

	result = []
	for alert in alerts:
		is_acked = alert.id in acked_ids
		if not show_acknowledged and is_acked:
			continue
		result.append({
			"id": alert.id,
			"type": alert.alert_type,
			"severity": alert.severity,
			"title": alert.title,
			"description": alert.description,
			"affectedMetric": alert.affected_metric,
			"affectedValue": alert.affected_value,
			"thresholdValue": alert.threshold_value,
			"percentageOfWorkforce": alert.percentage_of_workforce,
			"relatedView": alert.related_view,
			"tenantId": alert.tenant_id,
			"isAcknowledged": is_acked,
			"acknowledgedByRole": current_user.role if is_acked else None,
			"acknowledgedAt": None,
			"isDismissed": False,
			"createdAt": alert.created_at.isoformat(),
			"expiresAt": alert.expires_at.isoformat() if alert.expires_at else None,
		})

	unread = sum(1 for a in result if not a["isAcknowledged"])
	return {
		"alerts": result,
		"totalCount": len(result),
		"unreadCount": unread,
		"page": 1,
		"pageSize": 50,
		"lastRefreshedAt": dt.datetime.utcnow().isoformat(),
	}


@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
	alert_id: str,
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
) -> dict:
	alert = (
		db.query(Alert)
		.filter(Alert.id == alert_id, Alert.tenant_id == current_user.tenant_id)
		.one_or_none()
	)
	if alert is None:
		raise HTTPException(status_code=404, detail="Alert not found")

	existing = (
		db.query(AlertAcknowledgement)
		.filter(
			AlertAcknowledgement.user_id == current_user.id,
			AlertAcknowledgement.alert_id == alert_id,
		)
		.one_or_none()
	)
	if existing is None:
		db.add(AlertAcknowledgement(
			user_id=current_user.id,
			alert_id=alert_id,
			tenant_id=current_user.tenant_id,
		))
		db.commit()
	return {"status": "acknowledged"}


@router.delete("/alerts/{alert_id}/acknowledge")
def unacknowledge_alert(
	alert_id: str,
	current_user: Annotated[User, Depends(get_current_user)],
	db: Annotated[Session, Depends(get_db)],
) -> dict:
	db.query(AlertAcknowledgement).filter(
		AlertAcknowledgement.user_id == current_user.id,
		AlertAcknowledgement.alert_id == alert_id,
	).delete()
	db.commit()
	return {"status": "unacknowledged"}
