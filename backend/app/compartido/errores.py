"""Excepciones de dominio y su traducción a RFC 9457 (application/problem+json), TD-003."""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("rumbo.errores")

TIPO_PROBLEM = "application/problem+json"


class ErrorDominio(Exception):
    """Base de las excepciones de dominio: cada subclase fija su status, code y título."""

    status: int = 400
    code: str = "error"
    title: str = "Error"
    detail: str | None = None

    def __init__(self, detail: str | None = None, **extras: Any) -> None:
        super().__init__(detail or self.detail or self.title)
        if detail is not None:
            self.detail = detail
        self.extras = extras


class NoAutenticado(ErrorDominio):
    status = 401
    code = "no_autenticado"
    title = "Necesitás iniciar sesión"
    detail = "La sesión no existe o venció."


class SinPermiso(ErrorDominio):
    status = 403
    code = "sin_permiso"
    title = "No tenés permiso"
    detail = "Tu rol no alcanza para esta acción."


class NoEncontrado(ErrorDominio):
    status = 404
    code = "no_encontrado"
    title = "No encontrado"
    detail = "El recurso no existe."


class ValidacionFallida(ErrorDominio):
    """422 lanzado desde un service con errores por campo (mismo formato que el de Pydantic)."""

    status = 422
    code = "validacion_fallida"
    title = "Los datos enviados no son válidos"
    detail = "Revisá los campos marcados."

    def __init__(self, errores: list[dict[str, str]]) -> None:
        super().__init__(errors=errores)


def respuesta_problema(
    request: Request,
    status: int,
    code: str,
    title: str,
    detail: str | None = None,
    headers: dict[str, str] | None = None,
    **extras: Any,
) -> JSONResponse:
    cuerpo: dict[str, Any] = {
        "type": f"/problemas/{code}",
        "title": title,
        "status": status,
        "detail": detail,
        "instance": request.url.path,
        "code": code,
        **extras,
    }
    return JSONResponse(cuerpo, status_code=status, media_type=TIPO_PROBLEM, headers=headers)


# Mensajes en español para los tipos de error de Pydantic más comunes
_MENSAJES = {
    "missing": "Este campo es obligatorio.",
    "string_too_short": "Debe tener al menos {min_length} caracteres.",
    "string_too_long": "Debe tener como máximo {max_length} caracteres.",
    "too_short": "Debe tener al menos {min_length} elementos.",
    "too_long": "Debe tener como máximo {max_length} elementos.",
    "greater_than_equal": "Debe ser mayor o igual a {ge}.",
    "less_than_equal": "Debe ser menor o igual a {le}.",
    "greater_than": "Debe ser mayor a {gt}.",
    "less_than": "Debe ser menor a {lt}.",
    "int_parsing": "Debe ser un número entero.",
    "int_type": "Debe ser un número entero.",
    "int_from_float": "Debe ser un número entero.",
    "bool_parsing": "Debe ser verdadero o falso.",
    "bool_type": "Debe ser verdadero o falso.",
    "string_type": "Debe ser un texto.",
    "list_type": "Debe ser una lista.",
    "enum": "Valor no permitido.",
    "literal_error": "Valor no permitido.",
    "json_invalid": "El cuerpo no es un JSON válido.",
    "model_attributes_type": "El cuerpo debe ser un objeto JSON.",
    "dict_type": "El cuerpo debe ser un objeto JSON.",
    "value_error": "{error}",
    "assertion_error": "{error}",
}

_PREFIJOS_LOC = {"body", "query", "path", "header", "cookie"}


def _traducir(error: dict[str, Any]) -> dict[str, str]:
    loc = [str(parte) for parte in error.get("loc", ())]
    if loc and loc[0] in _PREFIJOS_LOC:
        loc = loc[1:]
    campo = ".".join(loc) or "body"
    tipo = error.get("type", "")
    contexto = dict(error.get("ctx") or {})
    if "error" in contexto:
        contexto["error"] = str(contexto["error"])
    plantilla = _MENSAJES.get(tipo)
    if tipo == "email" or tipo.startswith("value_error.email"):
        plantilla = "El email no tiene un formato válido."
    try:
        mensaje = plantilla.format(**contexto) if plantilla else "Valor inválido."
    except (KeyError, IndexError):
        mensaje = "Valor inválido."
    if tipo == "value_error" and mensaje.startswith("Value error, "):
        mensaje = mensaje.removeprefix("Value error, ")
    return {"campo": campo, "mensaje": mensaje}


def registrar_handlers(app: FastAPI) -> None:
    @app.exception_handler(ErrorDominio)
    async def manejar_dominio(request: Request, exc: ErrorDominio) -> JSONResponse:
        if exc.status in (401, 403):
            logger.warning("acceso denegado", extra={"code": exc.code, "status": exc.status})
        return respuesta_problema(
            request, exc.status, exc.code, exc.title, exc.detail, **exc.extras
        )

    @app.exception_handler(RequestValidationError)
    async def manejar_validacion(request: Request, exc: RequestValidationError) -> JSONResponse:
        errores = [_traducir(error) for error in exc.errors()]
        return respuesta_problema(
            request,
            422,
            "validacion_fallida",
            "Los datos enviados no son válidos",
            "Revisá los campos marcados.",
            errors=errores,
        )

    @app.exception_handler(StarletteHTTPException)
    async def manejar_http(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        if exc.status_code == 404:
            return respuesta_problema(request, 404, "no_encontrado", "No encontrado")
        return respuesta_problema(
            request,
            exc.status_code,
            "error_http",
            str(exc.detail),
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(Exception)
    async def manejar_no_controlada(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("excepción no controlada")
        return respuesta_problema(
            request,
            500,
            "error_interno",
            "Error interno",
            "Algo salió mal. Probá de nuevo en unos minutos.",
        )
