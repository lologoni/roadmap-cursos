import math
from dataclasses import dataclass

from fastapi import Query
from pydantic import BaseModel


@dataclass(frozen=True)
class ParamsPaginacion:
    """Parámetros de paginación offset comunes a todos los listados (TD-002)."""

    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def params_paginacion(
    page: int = Query(1, ge=1, description="Número de página, desde 1"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página, de 1 a 100"),
) -> ParamsPaginacion:
    return ParamsPaginacion(page=page, page_size=page_size)


class Pagina[T](BaseModel):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def crear(cls, items: list[T], total: int, params: ParamsPaginacion) -> "Pagina[T]":
        return cls(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            pages=math.ceil(total / params.page_size) if total else 0,
        )
