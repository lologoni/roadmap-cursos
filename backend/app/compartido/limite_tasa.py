"""Rate limiting por IP con slowapi (TD-004) y su respuesta 429 en problem+json."""

import ipaddress
import logging
import time

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.compartido.errores import respuesta_problema

logger = logging.getLogger("rumbo.limite_tasa")

LIMITE_REGISTRO = "10/hour"
LIMITE_LOGIN = "5/minute;20/hour"
LIMITE_RECUPERAR = "3 per 15 minutes"
LIMITE_RESTABLECER = "10/hour"


def ip_cliente(request: Request) -> str:
    """
    IP del cliente. Detrás del proxy de Vite todas las requests llegan desde la IP del contenedor
    frontend, así que se usa X-Forwarded-For solo cuando el par directo es una IP privada (TD-018).
    """
    directa = get_remote_address(request)
    reenviada = request.headers.get("x-forwarded-for")
    if reenviada:
        try:
            if ipaddress.ip_address(directa).is_private:
                return reenviada.split(",")[0].strip()
        except ValueError:
            pass
    return directa


limitador = Limiter(key_func=ip_cliente, headers_enabled=True, storage_uri="memory://")

_UNIDADES = {
    "second": ("segundo", "segundos"),
    "minute": ("minuto", "minutos"),
    "hour": ("hora", "horas"),
    "day": ("día", "días"),
}


def describir_limite(limite) -> str:
    """'5 intentos por minuto' o '3 intentos cada 15 minutos'."""
    singular, plural = _UNIDADES.get(limite.GRANULARITY.name, ("período", "períodos"))
    if limite.multiples == 1:
        return f"{limite.amount} intentos por {singular}"
    return f"{limite.amount} intentos cada {limite.multiples} {plural}"


def manejar_limite_excedido(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    limite_actual = getattr(request.state, "view_rate_limit", None)
    reintentar_en = 60
    if limite_actual is not None:
        reinicio, _ = limitador.limiter.get_window_stats(limite_actual[0], *limite_actual[1])
        reintentar_en = max(1, int(reinicio + 1 - time.time()))
    logger.warning("límite de intentos superado", extra={"ruta": request.url.path, "status": 429})
    respuesta = respuesta_problema(
        request,
        429,
        "demasiados_intentos",
        "Demasiados intentos",
        f"Superaste el límite de {describir_limite(exc.limit.limit)}. "
        f"Probá de nuevo en {reintentar_en} segundos.",
        reintentar_en=reintentar_en,
    )
    return limitador._inject_headers(respuesta, limite_actual)
