"""Comandos de consola para roles (TD-008).

uv run python -m app.auth.cli crear-admin
uv run python -m app.auth.cli promover <email> <rol>
"""

import argparse
import sys

from app.auth import seguridad
from app.auth.models import RolUsuario
from app.auth.repository import RepositorioUsuarios
from app.compartido.bd import SessionLocal
from app.config import obtener_settings


def crear_admin() -> int:
    """Crea el admin inicial con ADMIN_EMAIL/ADMIN_PASSWORD. Idempotente."""
    settings = obtener_settings()
    if not settings.admin_email or not settings.admin_password:
        print("Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD en el entorno.", file=sys.stderr)
        return 1
    with SessionLocal.begin() as sesion:
        usuarios = RepositorioUsuarios(sesion)
        existente = usuarios.por_email(settings.admin_email)
        if existente is not None:
            if existente.rol != RolUsuario.ADMIN:
                usuarios.cambiar_rol(existente, RolUsuario.ADMIN)
            print(f"El admin {settings.admin_email} ya existe.")
            return 0
        usuarios.crear(
            "Administración",
            settings.admin_email,
            seguridad.hashear(settings.admin_password),
            RolUsuario.ADMIN,
        )
    print(f"Admin creado: {settings.admin_email}")
    return 0


def promover(email: str, rol: str) -> int:
    try:
        rol_nuevo = RolUsuario(rol)
    except ValueError:
        validos = ", ".join(r.value for r in RolUsuario)
        print(f"Rol inválido: {rol}. Valores posibles: {validos}.", file=sys.stderr)
        return 1
    with SessionLocal.begin() as sesion:
        usuarios = RepositorioUsuarios(sesion)
        usuario = usuarios.por_email(email)
        if usuario is None:
            print(f"No existe un usuario con el email {email}.", file=sys.stderr)
            return 1
        usuarios.cambiar_rol(usuario, rol_nuevo)
    print(f"{email} ahora tiene el rol {rol_nuevo.value}.")
    return 0


def main(argumentos: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="app.auth.cli", description="Gestión de roles de Rumbo")
    comandos = parser.add_subparsers(dest="comando", required=True)
    comandos.add_parser("crear-admin", help="crea el admin inicial (ADMIN_EMAIL, ADMIN_PASSWORD)")
    promover_cmd = comandos.add_parser("promover", help="cambia el rol de un usuario existente")
    promover_cmd.add_argument("email")
    promover_cmd.add_argument("rol", help="usuario, moderador o admin")
    args = parser.parse_args(argumentos)

    if args.comando == "crear-admin":
        return crear_admin()
    return promover(args.email, args.rol)


if __name__ == "__main__":
    sys.exit(main())
