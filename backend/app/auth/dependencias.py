"""Dependencias de sesión y rol para los routers: usuario_actual, usuario_opcional, requiere_rol."""

from collections.abc import Callable

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.auth import seguridad
from app.auth.models import RolUsuario, Usuario
from app.auth.repository import RepositorioUsuarios
from app.compartido.bd import sesion_bd
from app.compartido.errores import NoAutenticado, SinPermiso


def _usuario_de_la_cookie(request: Request, sesion: Session) -> Usuario | None:
    token = request.cookies.get(seguridad.NOMBRE_COOKIE)
    if not token:
        return None
    claims = seguridad.leer_jwt(token)
    if claims is None:
        return None
    usuario = RepositorioUsuarios(sesion).por_id(int(claims["sub"]))
    # token_version distinto = la contraseña cambió después de emitir el JWT (BR-012)
    if usuario is None or not usuario.activo or usuario.token_version != int(claims["tv"]):
        return None
    request.state.usuario_id = usuario.id
    return usuario


def usuario_actual(request: Request, sesion: Session = Depends(sesion_bd)) -> Usuario:
    usuario = _usuario_de_la_cookie(request, sesion)
    if usuario is None:
        raise NoAutenticado()
    return usuario


def usuario_opcional(request: Request, sesion: Session = Depends(sesion_bd)) -> Usuario | None:
    """Si la cookie es inválida o venció, se trata la request como anónima."""
    return _usuario_de_la_cookie(request, sesion)


def requiere_rol(*roles: RolUsuario) -> Callable[..., Usuario]:
    def dependencia(usuario: Usuario = Depends(usuario_actual)) -> Usuario:
        if usuario.rol not in roles:
            raise SinPermiso()
        return usuario

    return dependencia


requiere_moderador = requiere_rol(RolUsuario.MODERADOR, RolUsuario.ADMIN)
