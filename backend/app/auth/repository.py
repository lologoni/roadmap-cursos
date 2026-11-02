from datetime import datetime

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.auth.models import RolUsuario, TokenRecuperacion, Usuario


class RepositorioUsuarios:
    def __init__(self, sesion: Session) -> None:
        self.sesion = sesion

    def por_id(self, usuario_id: int) -> Usuario | None:
        return self.sesion.get(Usuario, usuario_id)

    def por_email(self, email: str) -> Usuario | None:
        consulta = select(Usuario).where(func.lower(Usuario.email) == email.strip().lower())
        return self.sesion.scalars(consulta).first()

    def crear(
        self, nombre: str, email: str, password_hash: str, rol: RolUsuario = RolUsuario.USUARIO
    ) -> Usuario:
        usuario = Usuario(nombre=nombre, email=email, password_hash=password_hash, rol=rol)
        self.sesion.add(usuario)
        self.sesion.flush()
        self.sesion.refresh(usuario)
        return usuario

    def actualizar_hash(self, usuario: Usuario, password_hash: str) -> None:
        usuario.password_hash = password_hash
        usuario.actualizado_en = func.now()
        self.sesion.flush()

    def cambiar_password_e_invalidar_sesiones(self, usuario: Usuario, password_hash: str) -> None:
        usuario.password_hash = password_hash
        usuario.token_version = Usuario.token_version + 1
        usuario.actualizado_en = func.now()
        self.sesion.flush()

    def cambiar_rol(self, usuario: Usuario, rol: RolUsuario) -> None:
        usuario.rol = rol
        usuario.actualizado_en = func.now()
        self.sesion.flush()


class RepositorioTokensRecuperacion:
    def __init__(self, sesion: Session) -> None:
        self.sesion = sesion

    def invalidar_vigentes(self, usuario_id: int, ahora: datetime) -> None:
        self.sesion.execute(
            update(TokenRecuperacion)
            .where(TokenRecuperacion.usuario_id == usuario_id, TokenRecuperacion.usado_en.is_(None))
            .values(usado_en=ahora)
        )

    def crear(self, usuario_id: int, token_hash: str, expira_en: datetime) -> None:
        self.sesion.add(
            TokenRecuperacion(usuario_id=usuario_id, token_hash=token_hash, expira_en=expira_en)
        )
        self.sesion.flush()

    def por_hash_para_usar(self, token_hash: str) -> TokenRecuperacion | None:
        """Bloquea la fila para que dos pedidos simultáneos no usen el mismo token."""
        consulta = (
            select(TokenRecuperacion)
            .where(TokenRecuperacion.token_hash == token_hash)
            .with_for_update()
        )
        return self.sesion.scalars(consulta).first()

    def marcar_usado(self, token: TokenRecuperacion, ahora: datetime) -> None:
        token.usado_en = ahora
        self.sesion.flush()
