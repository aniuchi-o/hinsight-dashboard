# app/security/jwt.py
from __future__ import annotations

import os
import time
from typing import Any

from jose import JWTError, jwt

ALGORITHM = "HS256"
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")  # local only
ACCESS_TTL_SECONDS = int(os.getenv("JWT_ACCESS_TTL_SECONDS", "900"))  # 15 min


def create_access_token(claims: dict[str, Any]) -> str:
    now = int(time.time())
    payload = dict(claims)
    payload.update({"iat": now, "exp": now + ACCESS_TTL_SECONDS})
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError("Invalid token") from e
