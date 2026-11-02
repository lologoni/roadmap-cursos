"""Reglas de negocio de autenticación: BR-009, BR-012, BR-013."""

import logging
from collections.abc import Callable
from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import IntegrityError

from app.auth import seguridad
from app.auth.correo import EmisorCorreo
from app.auth.models import Usuario
from app.auth.repository import RepositorioTokensRecuperacion, RepositorioUsuarios
from app.compartido.errores import ErrorDominio, ValidacionFallida

logger = logging.getLogger("rumbo.auth")


class EmailDuplicado(ErrorDominio):
    status = 409
    code = "email_duplicado"
    title = "Ya existe una cuenta con ese email"
    detail = "Ingresá con tu contraseña o recuperala."


class CredencialesInvalidas(ErrorDominio):
    status = 401
    code = "credenciales_invalidas"
    title = "Email o contraseña incorrectos"
    detail = "Revisá los datos e intentá de nuevo."


class TokenInvalido(ErrorDominio):
    status = 400
    code = "token_invalido"
    title = "El enlace venció o ya fue usado"
    detail = "Pedí un enlace nuevo para restablecer la contraseña."


def _ahora() -> datetime:
    return datetime.now(UTC)


def _validar_password_distinta_del_email(password: str, email: str, campo: str) -> None:
    if password.strip().lower() == email.strip().lower():
        raise ValidacionFallida(
            [{"campo": campo, "mensaje": "La contraseña no puede ser igual al email."}]
        )


class ServicioAuth:
    def __init__(
        self,
        usuarios: RepositorioUsuarios,
        tokens: RepositorioTokensRecuperacion,
        emisor: EmisorCorreo,
        frontend_url: str,
        minutos_recuperacion: int,
        reloj: Callable[[], datetime] = _ahora,
    ) -> None:
        self.usuarios = usuarios
        self.tokens = tokens
        self.emisor = emisor
        self.frontend_url = frontend_url.rstrip("/")
        self.minutos_recuperacion = minutos_recuperacion
        self.reloj = reloj

    def registrar(self, nombre: str, email: str, password: str) -> Usuario:
        _validar_password_distinta_del_email(password, email, "password")
        if self.usuarios.por_email(email) is not None:
            raise EmailDuplicado()
        try:
            return self.usuarios.crear(nombre, email, seguridad.hashear(password))
        except IntegrityError as error:
            # Carrera entre dos registros simultáneos: lo resuelve el índice único
            raise EmailDuplicado() from error

    def autenticar(self, email: str, password: str, ip: str) -> Usuario:
        usuario = self.usuarios.por_email(email)
        if usuario is None:
            seguridad.verificar_senuelo(password)
            self._registrar_fallo(ip)
            raise CredencialesInvalidas()
        valida, hash_nuevo = seguridad.verificar(password, usuario.password_hash)
        if not valida or not usuario.activo:
            self._registrar_fallo(ip)
            raise CredencialesInvalidas()
        if hash_nuevo is not None:
            self.usuarios.actualizar_hash(usuario, hash_nuevo)
        return usuario

    def solicitar_recuperacion(self, email: str) -> None:
        usuario = self.usuarios.por_email(email)
        if usuario is None or not usuario.activo:
            return
        ahora = self.reloj()
        self.tokens.invalidar_vigentes(usuario.id, ahora)
        token, token_hash = seguridad.generar_token_recuperacion()
        self.tokens.crear(
            usuario.id, token_hash, ahora + timedelta(minutes=self.minutos_recuperacion)
        )
        enlace = f"{self.frontend_url}/restablecer?token={token}"
        self.emisor.enviar_recuperacion(usuario.email, usuario.nombre, enlace)

    def restablecer(self, token: str, password_nueva: str) -> None:
        ahora = self.reloj()
        registro = self.tokens.por_hash_para_usar(seguridad.hash_token(token))
        if registro is None or registro.usado_en is not None or registro.expira_en <= ahora:
            raise TokenInvalido()
        usuario = self.usuarios.por_id(registro.usuario_id)
        if usuario is None or not usuario.activo:
            raise TokenInvalido()
        _validar_password_distinta_del_email(password_nueva, usuario.email, "password_nueva")
        self.usuarios.cambiar_password_e_invalidar_sesiones(
            usuario, seguridad.hashear(password_nueva)
        )
        self.tokens.marcar_usado(registro, ahora)

    @staticmethod
    def _registrar_fallo(ip: str) -> None:
        # Nunca se loguea el email ni la contraseña (TRD §4.5)
        logger.warning("login fallido", extra={"ip": ip})
