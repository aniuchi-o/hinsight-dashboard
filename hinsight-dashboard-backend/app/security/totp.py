# app/security/totp.py
from __future__ import annotations

import pyotp


def generate_secret() -> str:
    # Base32 secret suitable for authenticator apps
    return pyotp.random_base32()


def build_otpauth_uri(*, secret: str, email: str, issuer: str) -> str:
    # Example: otpauth://totp/Issuer:email?secret=...&issuer=Issuer
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer)


def verify_otp(secret: str, otp: str) -> bool:
    otp = (otp or "").strip()
    if not otp.isdigit():
        return False

    # allow 1 step of clock drift (30s window) either side
    totp = pyotp.TOTP(secret)
    return bool(totp.verify(otp, valid_window=1))
