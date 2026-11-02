"""Hash de contraseñas (Argon2id, TD-005), JWT de sesión (TD-001) y armado de la cookie."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Response
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.config import obtener_settings

NOMBRE_COOKIE = "rumbo_sesion"
RUTA_COOKIE = "/api"
ALGORITMO_JWT = "HS256"


def _crear_hasher() -> PasswordHash:
    if obtener_settings().hash_perfil == "tests":
        # Perfil reducido solo para pruebas automatizadas (riesgo R-03)
        return PasswordHash((Argon2Hasher(memory_cost=1024, time_cost=1, parallelism=1),))
    # Mínimo recomendado por OWASP: m=19456 KiB, t=2, p=1
    return PasswordHash((Argon2Hasher(memory_cost=19456, time_cost=2, parallelism=1),))


_hasher = _crear_hasher()
# Hash señuelo: se verifica cuando el email no existe para igualar el tiempo de respuesta
_HASH_SENUELO = _hasher.hash(secrets.token_urlsafe(16))


def hashear(password: str) -> str:
    return _hasher.hash(password)


def verificar(password: str, hash_guardado: str) -> tuple[bool, str | None]:
    """Devuelve (válida, hash_nuevo). hash_nuevo no es None si hay que re-hashear."""
    return _hasher.verify_and_update(password, hash_guardado)


def verificar_senuelo(password: str) -> None:
    _hasher.verify(password, _HASH_SENUELO)


def crear_jwt(usuario_id: int, token_version: int, ahora: datetime | None = None) -> str:
    settings = obtener_settings()
    ahora = ahora or datetime.now(UTC)
    claims = {
        "sub": str(usuario_id),
        "tv": token_version,
        "iat": int(ahora.timestamp()),
        "exp": int((ahora + timedelta(minutes=settings.jwt_expira_minutos)).timestamp()),
    }
    return jwt.encode(claims, settings.jwt_secret, algorithm=ALGORITMO_JWT)


def leer_jwt(token: str) -> dict | None:
    """Claims del token si la firma y el vencimiento son válidos; None en cualquier otro caso."""
    try:
        claims = jwt.decode(
            token,
            obtener_settings().jwt_secret,
            algorithms=[ALGORITMO_JWT],
            options={"require": ["sub", "tv", "exp", "iat"]},
        )
        int(claims["sub"])
        int(claims["tv"])
    except (jwt.PyJWTError, ValueError, TypeError):
        return None
    return claims


def poner_cookie_sesion(respuesta: Response, token: str) -> None:
    settings = obtener_settings()
    respuesta.set_cookie(
        NOMBRE_COOKIE,
        token,
        max_age=settings.jwt_expira_minutos * 60,
        path=RUTA_COOKIE,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
    )


def borrar_cookie_sesion(respuesta: Response) -> None:
    settings = obtener_settings()
    respuesta.delete_cookie(
        NOMBRE_COOKIE,
        path=RUTA_COOKIE,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
    )


def generar_token_recuperacion() -> tuple[str, str]:
    """Token aleatorio de 32 bytes para el enlace y su SHA-256 en hex para guardar en la BD."""
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
