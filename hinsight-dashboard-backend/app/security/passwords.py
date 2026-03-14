# app/security/passwords.py
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

_pwd = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt", "argon2"],
    default="pbkdf2_sha256",
    deprecated="auto",
)


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _pwd.verify(password, password_hash)
    except UnknownHashError:
        return False
