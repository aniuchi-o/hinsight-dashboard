# app/security/mfa.py
from __future__ import annotations

import pyotp


def generate_secret() -> str:
    return pyotp.random_base32()


def build_otpauth_uri(secret: str, email: str, issuer: str = "Hinsight") -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer)


def verify_otp(secret: str, otp: str) -> bool:
    return pyotp.TOTP(secret).verify(otp, valid_window=1)
