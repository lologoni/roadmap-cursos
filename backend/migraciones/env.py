import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

import app.aportes.models  # noqa: F401  (registra los modelos en la metadata)
import app.auth.models  # noqa: F401
import app.catalogo.models  # noqa: F401
import app.roadmap.models  # noqa: F401
from app.compartido.bd import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Permite migrar otra base (por ejemplo rumbo_test) con ALEMBIC_DATABASE_URL
url = os.environ.get("ALEMBIC_DATABASE_URL") or os.environ["DATABASE_URL"]
config.set_main_option("sqlalchemy.url", url)

target_metadata = Base.metadata


def correr_offline() -> None:
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def correr_online() -> None:
    conectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with conectable.connect() as conexion:
        context.configure(connection=conexion, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    correr_offline()
else:
    correr_online()
