from __future__ import annotations

import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.auth.jwt_current_user import get_current_user
from app.core.data_region import data_region_ctx
from app.db.session import get_session_for_region
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.auth import (
    LoginIn,
    LoginOut,
    MfaSetupOut,
    MfaVerifyIn,
    PlatformSignupIn,
    PlatformSignupOut,
    TenantSignupIn,
    TenantSignupOut,
    UserSignupIn,
    UserSignupOut,
)
from app.security.jwt import create_access_token
from app.security.passwords import hash_password, verify_password
from app.security.totp import build_otpauth_uri, generate_secret, verify_otp

CurrentUser = Annotated[User, Depends(get_current_user)]
router = APIRouter(prefix="/auth", tags=["auth"])

PLATFORM_TENANT_SLUG = "platform"
PLATFORM_TENANT_REGION = "CA"


@router.post(
    "/platform-signup",
    response_model=PlatformSignupOut,
    status_code=status.HTTP_201_CREATED,
)
def platform_signup(payload: PlatformSignupIn) -> PlatformSignupOut:
    """Create a platform_admin account. Protected by PLATFORM_INVITE_KEY env var."""
    expected_key = os.getenv("PLATFORM_INVITE_KEY", "").strip()
    if not expected_key or payload.invite_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid invite key")

    token = data_region_ctx.set(PLATFORM_TENANT_REGION)
    try:
        db = get_session_for_region()
        try:
            platform_tenant = (
                db.query(Tenant).filter(Tenant.slug == PLATFORM_TENANT_SLUG).one_or_none()
            )
            if platform_tenant is None:
                platform_tenant = Tenant(
                    slug=PLATFORM_TENANT_SLUG,
                    name="Platform",
                    data_region=PLATFORM_TENANT_REGION,
                )
                db.add(platform_tenant)
                db.flush()

            user = User(
                tenant_id=platform_tenant.id,
                email=str(payload.email).lower(),
                password_hash=hash_password(payload.password),
                role="platform_admin",
                is_active=True,
            )
            db.add(user)
            db.commit()
            return PlatformSignupOut(
                user_id=user.id,
                role=user.role,
                tenant_id=platform_tenant.id,
            )
        except IntegrityError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Platform admin with this email already exists.",
            ) from err
        finally:
            db.close()
    finally:
        data_region_ctx.reset(token)


@router.post(
    "/tenant-signup",
    response_model=TenantSignupOut,
    status_code=status.HTTP_201_CREATED,
)
def tenant_signup(payload: TenantSignupIn) -> TenantSignupOut:
    region = payload.data_region.strip().upper()
    token = data_region_ctx.set(region)
    try:
        db = get_session_for_region()
        try:
            tenant = Tenant(
                slug=payload.tenant_slug,
                name=payload.tenant_name,
                data_region=region,
            )
            db.add(tenant)
            db.flush()

            admin = User(
                tenant_id=tenant.id,
                email=str(payload.admin_email).lower(),
                password_hash=hash_password(payload.admin_password),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()

            return TenantSignupOut(
                tenant_id=tenant.id,
                admin_user_id=admin.id,
                tenant_slug=tenant.slug,
                data_region=tenant.data_region,
            )
        except IntegrityError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tenant slug already exists (or duplicate user).",
            ) from err
        finally:
            db.close()
    finally:
        data_region_ctx.reset(token)


@router.post(
    "/user-signup", response_model=UserSignupOut, status_code=status.HTTP_201_CREATED
)
def user_signup(payload: UserSignupIn) -> UserSignupOut:
    region = payload.data_region.strip().upper()
    token = data_region_ctx.set(region)
    try:
        db = get_session_for_region()
        try:
            tenant = (
                db.query(Tenant)
                .filter(Tenant.slug == payload.tenant_slug)
                .one_or_none()
            )
            if tenant is None:
                raise HTTPException(status_code=404, detail="Tenant not found in this region.")

            user = User(
                tenant_id=tenant.id,
                email=str(payload.email).lower(),
                password_hash=hash_password(payload.password),
                role="viewer",
                is_active=True,
            )
            db.add(user)
            db.commit()
            return UserSignupOut(user_id=user.id, tenant_id=tenant.id, role=user.role)
        except IntegrityError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists in this tenant.",
            ) from err
        finally:
            db.close()
    finally:
        data_region_ctx.reset(token)


@router.post("/login", response_model=LoginOut)
def login(payload: LoginIn) -> LoginOut:
    region = payload.data_region.strip().upper()
    token = data_region_ctx.set(region)
    try:
        db = get_session_for_region()
        try:
            tenant = (
                db.query(Tenant)
                .filter(Tenant.slug == payload.tenant_slug)
                .one_or_none()
            )
            if tenant is None:
                raise HTTPException(status_code=401, detail="Invalid credentials")

            user = (
                db.query(User)
                .filter(
                    User.tenant_id == tenant.id,
                    User.email == str(payload.email).lower(),
                )
                .one_or_none()
            )
            if user is None or not user.is_active:
                raise HTTPException(status_code=401, detail="Invalid credentials")

            if not verify_password(payload.password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid credentials")

            if user.mfa_enabled:
                if not user.mfa_secret:
                    raise HTTPException(status_code=500, detail="MFA misconfigured")
                otp = (payload.otp or "").strip()
                if not otp:
                    raise HTTPException(status_code=401, detail="MFA required")
                if not verify_otp(user.mfa_secret, otp):
                    raise HTTPException(status_code=401, detail="Invalid OTP")

            jwt_token = create_access_token(
                {
                    "sub": user.id,
                    "tid": tenant.id,
                    "reg": tenant.data_region,
                    "role": user.role,
                }
            )
            return LoginOut(access_token=jwt_token)
        finally:
            db.close()
    finally:
        data_region_ctx.reset(token)


@router.post("/mfa/setup", response_model=MfaSetupOut)
def mfa_setup(current_user: CurrentUser) -> MfaSetupOut:
    if current_user.mfa_enabled:
        raise HTTPException(status_code=409, detail="MFA already enabled")

    secret = generate_secret()
    uri = build_otpauth_uri(secret=secret, email=current_user.email, issuer="Hinsight")

    db = get_session_for_region()
    try:
        user = db.query(User).filter(User.id == current_user.id).one()
        user.mfa_secret = secret
        user.mfa_enabled = False
        db.commit()
    finally:
        db.close()

    return MfaSetupOut(otpauth_uri=uri)


@router.post("/mfa/verify")
def mfa_verify(payload: MfaVerifyIn, current_user: CurrentUser) -> dict:
    if not current_user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA not initialized")

    if not verify_otp(current_user.mfa_secret, payload.otp):
        raise HTTPException(status_code=401, detail="Invalid OTP")

    db = get_session_for_region()
    try:
        user = db.query(User).filter(User.id == current_user.id).one()
        user.mfa_enabled = True
        db.commit()
    finally:
        db.close()

    return {"status": "mfa_enabled"}
