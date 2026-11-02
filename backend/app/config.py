from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración del backend leída de variables de entorno (TRD §4.4)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    database_url_test: str | None = None

    jwt_secret: str = Field(min_length=32)
    jwt_expira_minutos: int = 60
    cookie_secure: bool = True

    frontend_url: str = "http://localhost:5173"
    recuperacion_expira_minutos: int = 30

    smtp_host: str = "mailpit"
    smtp_port: int = 1025
    smtp_remitente: str = "Rumbo <no-responder@rumbo.local>"

    admin_email: str | None = None
    admin_password: str | None = None

    cors_origins: str = ""
    log_level: str = "INFO"

    # "normal" = parámetros OWASP; "tests" = perfil reducido solo para pruebas (riesgo R-03)
    hash_perfil: str = "normal"

    @field_validator("jwt_secret")
    @classmethod
    def validar_largo_secreto(cls, valor: str) -> str:
        if len(valor.encode()) < 32:
            raise ValueError("JWT_SECRET debe tener al menos 32 bytes")
        return valor

    @property
    def lista_cors(self) -> list[str]:
        return [origen.strip() for origen in self.cors_origins.split(",") if origen.strip()]


@lru_cache
def obtener_settings() -> Settings:
    return Settings()
