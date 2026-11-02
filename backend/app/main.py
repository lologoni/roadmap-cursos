from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.auth import router as auth
from app.compartido import salud
from app.compartido.errores import registrar_handlers
from app.compartido.limite_tasa import limitador, manejar_limite_excedido
from app.compartido.registro_logs import MiddlewareRequestId, configurar_logging
from app.config import obtener_settings

PREFIJO_API = "/api/v1"


def crear_app() -> FastAPI:
    settings = obtener_settings()
    configurar_logging(settings.log_level)

    app = FastAPI(
        title="Rumbo API",
        version="0.1.0",
        docs_url=f"{PREFIJO_API}/docs",
        openapi_url=f"{PREFIJO_API}/openapi.json",
        redoc_url=None,
    )

    if settings.lista_cors:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.lista_cors,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    app.add_middleware(MiddlewareRequestId)

    registrar_handlers(app)
    app.state.limiter = limitador
    app.add_exception_handler(RateLimitExceeded, manejar_limite_excedido)

    app.include_router(salud.router, prefix=PREFIJO_API)
    app.include_router(auth.router, prefix=PREFIJO_API)
    return app


app = crear_app()
