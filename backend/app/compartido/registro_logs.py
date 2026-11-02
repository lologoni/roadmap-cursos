"""Logging JSON a stdout y middleware que asigna un request_id a cada request (TRD §4.5)."""

import json
import logging
import sys
import time
import uuid
from contextvars import ContextVar
from datetime import UTC, datetime

from starlette.types import ASGIApp, Message, Receive, Scope, Send

request_id_actual: ContextVar[str | None] = ContextVar("request_id", default=None)

_CAMPOS_EXTRA = ("metodo", "ruta", "status", "duracion_ms", "usuario_id", "code", "ip")

logger = logging.getLogger("rumbo.http")


class FormatoJson(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        datos = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "nivel": record.levelname,
            "logger": record.name,
            "mensaje": record.getMessage(),
            "request_id": request_id_actual.get(),
        }
        for campo in _CAMPOS_EXTRA:
            if hasattr(record, campo):
                datos[campo] = getattr(record, campo)
        if record.exc_info:
            datos["traza"] = self.formatException(record.exc_info)
        return json.dumps(datos, ensure_ascii=False)


def configurar_logging(nivel: str) -> None:
    manejador = logging.StreamHandler(sys.stdout)
    manejador.setFormatter(FormatoJson())
    raiz = logging.getLogger()
    raiz.handlers = [manejador]
    raiz.setLevel(nivel.upper())
    # uvicorn escribe sus propios logs de acceso en texto plano; los reemplaza el middleware
    logging.getLogger("uvicorn.access").disabled = True
    for nombre in ("uvicorn", "uvicorn.error"):
        logging.getLogger(nombre).handlers = []
        logging.getLogger(nombre).propagate = True


class MiddlewareRequestId:
    """Genera el request_id, lo expone en X-Request-ID y loguea una línea JSON por request."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = uuid.uuid4().hex
        token = request_id_actual.set(request_id)
        scope.setdefault("state", {})
        inicio = time.perf_counter()
        status = 500

        async def enviar(mensaje: Message) -> None:
            nonlocal status
            if mensaje["type"] == "http.response.start":
                status = mensaje["status"]
                mensaje.setdefault("headers", [])
                mensaje["headers"].append((b"x-request-id", request_id.encode()))
            await send(mensaje)

        try:
            await self.app(scope, receive, enviar)
        finally:
            extra = {
                "metodo": scope["method"],
                "ruta": scope["path"],
                "status": status,
                "duracion_ms": round((time.perf_counter() - inicio) * 1000, 1),
            }
            usuario_id = scope["state"].get("usuario_id")
            if usuario_id is not None:
                extra["usuario_id"] = usuario_id
            logger.info("request", extra=extra)
            request_id_actual.reset(token)
