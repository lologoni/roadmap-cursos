from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.auth.models import Usuario
from app.catalogo.models import Curso
from app.compartido.bd import Base


class Aporte(Base):
    __tablename__ = "aportes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    curso_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("cursos.id", ondelete="CASCADE"))
    autor_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.id", ondelete="RESTRICT")
    )
    lo_tome: Mapped[bool]
    revisado_por_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("usuarios.id", ondelete="SET NULL")
    )
    revisado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    motivo_rechazo: Mapped[str | None] = mapped_column(String(500))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    curso: Mapped[Curso] = relationship(lazy="joined")
    autor: Mapped[Usuario] = relationship(foreign_keys=[autor_id], lazy="joined")
