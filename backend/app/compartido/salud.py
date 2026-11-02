from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.compartido.bd import engine

router = APIRouter(tags=["salud"])


@router.get("/health", summary="Estado del servicio y de la base de datos (E01)")
def salud() -> JSONResponse:
    try:
        with engine.connect() as conexion:
            conexion.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse({"estado": "degradado", "bd": "error"}, status_code=503)
    return JSONResponse({"estado": "ok", "bd": "ok"})
