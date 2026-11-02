import enum
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    SmallInteger,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.compartido.bd import Base


class EstadoCurso(enum.StrEnum):
    EN_REVISION = "en_revision"
    PUBLICADO = "publicado"
    RECHAZADO = "rechazado"


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=False)
    nombre: Mapped[str] = mapped_column(String(60))
    slug: Mapped[str] = mapped_column(String(60))
    orden: Mapped[int] = mapped_column(SmallInteger)


class Curso(Base):
    __tablename__ = "cursos"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    categoria_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("categorias.id", ondelete="RESTRICT")
    )
    url: Mapped[str] = mapped_column(String(2048))
    url_normalizada: Mapped[str] = mapped_column(String(2048))
    titulo: Mapped[str] = mapped_column(String(200))
    tema: Mapped[str] = mapped_column(String(120))
    plataforma: Mapped[str] = mapped_column(String(80))
    version: Mapped[str] = mapped_column(String(40))
    anio_edicion: Mapped[int] = mapped_column(SmallInteger)
    docentes: Mapped[list[str]] = mapped_column(ARRAY(String(120)))
    tiene_cuestionarios: Mapped[bool]
    requiere_examen: Mapped[bool]
    extiende_certificado: Mapped[bool]
    avalado_por_organizacion: Mapped[bool]
    organizacion_aval: Mapped[str | None] = mapped_column(String(160))
    descripcion: Mapped[str | None] = mapped_column(String(2000))
    estado: Mapped[EstadoCurso] = mapped_column(
        Enum(
            EstadoCurso,
            name="estado_curso",
            create_type=False,
            values_callable=lambda e: [m.value for m in e],
        ),
        server_default=EstadoCurso.EN_REVISION.value,
    )
    enlace_verificado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    publicado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    categoria: Mapped[Categoria] = relationship(lazy="joined")
