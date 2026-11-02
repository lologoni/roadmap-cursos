from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.compartido import salud
from app.compartido.errores import registrar_handlers
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

    app.include_router(salud.router, prefix=PREFIJO_API)
    return app


app = crear_app()
