import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.auth.models import RolUsuario

_PATRON_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validar_email(valor: str) -> str:
    valor = valor.strip()
    if len(valor) > 254 or not _PATRON_EMAIL.match(valor):
        raise ValueError("El email no tiene un formato válido.")
    return valor


class RegistroIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    email: str
    password: str = Field(min_length=10, max_length=128)

    @field_validator("nombre")
    @classmethod
    def recortar_nombre(cls, valor: str) -> str:
        valor = valor.strip()
        if len(valor) < 2:
            raise ValueError("Debe tener al menos 2 caracteres.")
        return valor

    @field_validator("email")
    @classmethod
    def validar_email(cls, valor: str) -> str:
        return _validar_email(valor)


class LoginIn(BaseModel):
    # En login solo se valida presencia (BackendSchema §3.1)
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=1024)


class RecuperarIn(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validar_email(cls, valor: str) -> str:
        return _validar_email(valor)


class RestablecerIn(BaseModel):
    token: str = Field(min_length=1, max_length=200)
    password_nueva: str = Field(min_length=10, max_length=128)


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: str
    rol: RolUsuario
    creado_en: datetime


class MensajeOut(BaseModel):
    mensaje: str
