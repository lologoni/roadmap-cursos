"""Endpoints de autenticación E02–E07 (BackendSchema §3.1)."""

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.auth import seguridad
from app.auth.correo import EmisorSmtp
from app.auth.dependencias import usuario_actual
from app.auth.models import Usuario
from app.auth.repository import RepositorioTokensRecuperacion, RepositorioUsuarios
from app.auth.schemas import (
    LoginIn,
    MensajeOut,
    RecuperarIn,
    RegistroIn,
    RestablecerIn,
    UsuarioOut,
)
from app.auth.service import ServicioAuth
from app.compartido.bd import sesion_bd
from app.compartido.limite_tasa import (
    LIMITE_LOGIN,
    LIMITE_RECUPERAR,
    LIMITE_REGISTRO,
    LIMITE_RESTABLECER,
    ip_cliente,
    limitador,
)
from app.config import obtener_settings

router = APIRouter(prefix="/auth", tags=["auth"])

MENSAJE_RECUPERAR = "Si el email está registrado, te enviamos un enlace."


def servicio_auth(sesion: Session = Depends(sesion_bd)) -> ServicioAuth:
    settings = obtener_settings()
    return ServicioAuth(
        usuarios=RepositorioUsuarios(sesion),
        tokens=RepositorioTokensRecuperacion(sesion),
        emisor=EmisorSmtp(),
        frontend_url=settings.frontend_url,
        minutos_recuperacion=settings.recuperacion_expira_minutos,
    )


@router.post(
    "/registro",
    status_code=status.HTTP_201_CREATED,
    response_model=UsuarioOut,
    summary="Registrar un usuario e iniciar sesión (E02)",
)
@limitador.limit(LIMITE_REGISTRO)
def registrar(
    request: Request,
    response: Response,
    datos: RegistroIn,
    servicio: ServicioAuth = Depends(servicio_auth),
) -> Usuario:
    usuario = servicio.registrar(datos.nombre, datos.email, datos.password)
    seguridad.poner_cookie_sesion(response, seguridad.crear_jwt(usuario.id, usuario.token_version))
    return usuario


@router.post("/login", response_model=UsuarioOut, summary="Iniciar sesión (E03)")
@limitador.limit(LIMITE_LOGIN)
def login(
    request: Request,
    response: Response,
    datos: LoginIn,
    servicio: ServicioAuth = Depends(servicio_auth),
) -> Usuario:
    usuario = servicio.autenticar(datos.email, datos.password, ip_cliente(request))
    seguridad.poner_cookie_sesion(response, seguridad.crear_jwt(usuario.id, usuario.token_version))
    return usuario


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Cerrar sesión (E04)")
def logout(_usuario: Usuario = Depends(usuario_actual)) -> Response:
    respuesta = Response(status_code=status.HTTP_204_NO_CONTENT)
    seguridad.borrar_cookie_sesion(respuesta)
    return respuesta


@router.get("/me", response_model=UsuarioOut, summary="Usuario de la sesión actual (E05)")
def yo(usuario: Usuario = Depends(usuario_actual)) -> Usuario:
    return usuario


@router.post(
    "/recuperar",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=MensajeOut,
    summary="Pedir un enlace de recuperación de contraseña (E06)",
)
@limitador.limit(LIMITE_RECUPERAR)
def recuperar(
    request: Request,
    response: Response,
    datos: RecuperarIn,
    servicio: ServicioAuth = Depends(servicio_auth),
) -> MensajeOut:
    servicio.solicitar_recuperacion(datos.email)
    # Misma respuesta exista o no el email (RNF-009)
    return MensajeOut(mensaje=MENSAJE_RECUPERAR)


@router.post(
    "/restablecer",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Restablecer la contraseña con el token del enlace (E07)",
)
@limitador.limit(LIMITE_RESTABLECER)
def restablecer(
    request: Request,
    response: Response,
    datos: RestablecerIn,
    servicio: ServicioAuth = Depends(servicio_auth),
) -> None:
    servicio.restablecer(datos.token, datos.password_nueva)
