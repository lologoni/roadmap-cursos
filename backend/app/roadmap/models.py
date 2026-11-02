import enum
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.catalogo.models import Curso
from app.compartido.bd import Base


class EstadoAvance(enum.StrEnum):
    PENDIENTE = "pendiente"
    EN_PROGRESO = "en_progreso"
    COMPLETADO = "completado"


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.id", ondelete="CASCADE")
    )
    curso_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("cursos.id", ondelete="RESTRICT"))
    orden: Mapped[int] = mapped_column(Integer)
    estado: Mapped[EstadoAvance] = mapped_column(
        Enum(
            EstadoAvance,
            name="estado_avance",
            create_type=False,
            values_callable=lambda e: [m.value for m in e],
        ),
        server_default=EstadoAvance.PENDIENTE.value,
    )
    agregado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    curso: Mapped[Curso] = relationship(lazy="joined")
