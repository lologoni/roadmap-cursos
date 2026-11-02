from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import obtener_settings


class Base(DeclarativeBase):
    """Base declarativa común a los modelos ORM de todos los dominios."""


engine = create_engine(obtener_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def sesion_bd() -> Iterator[Session]:
    """Una sesión por request: commit al final o rollback ante cualquier excepción."""
    sesion = SessionLocal()
    try:
        yield sesion
        sesion.commit()
    except Exception:
        sesion.rollback()
        raise
    finally:
        sesion.close()
