import os
from pydantic import BaseModel, EmailStr, Field


class PlatformSignupIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    invite_key: str


class PlatformSignupOut(BaseModel):
    user_id: str
    role: str
    tenant_id: str


class TenantSignupIn(BaseModel):
    tenant_name: str = Field(min_length=2, max_length=255)
    tenant_slug: str = Field(min_length=2, max_length=255)
    data_region: str = Field(pattern="^(CA|US)$")
    admin_email: EmailStr
    admin_password: str = Field(min_length=8, max_length=128)


class TenantSignupOut(BaseModel):
    tenant_id: str
    admin_user_id: str
    tenant_slug: str
    data_region: str


class UserSignupIn(BaseModel):
    tenant_slug: str = Field(min_length=2, max_length=255)
    data_region: str = Field(pattern="^(CA|US)$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserSignupOut(BaseModel):
    user_id: str
    tenant_id: str
    role: str


class LoginIn(BaseModel):
    tenant_slug: str = Field(min_length=2, max_length=255)
    data_region: str = Field(pattern="^(CA|US)$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    otp: str | None = None


class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MfaSetupOut(BaseModel):
    otpauth_uri: str


class MfaVerifyIn(BaseModel):
    otp: str = Field(min_length=6, max_length=8)
