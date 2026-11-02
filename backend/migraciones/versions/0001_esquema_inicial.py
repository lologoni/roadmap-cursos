"""esquema inicial: enums, tablas, constraints, índices y 13 categorías (BackendSchema §1)

Revision ID: 0001
Revises:
Create Date: 2026-11-01
"""

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


CATEGORIAS = [
    (1, "Programación y Desarrollo", "programacion-desarrollo"),
    (2, "Datos e Inteligencia Artificial", "datos-ia"),
    (3, "Bases de Datos", "bases-de-datos"),
    (4, "Infraestructura y Cloud", "infraestructura-cloud"),
    (5, "Ciberseguridad", "ciberseguridad"),
    (6, "Diseño UX/UI", "diseno-ux-ui"),
    (7, "Gestión de Proyectos y Agilidad", "gestion-proyectos"),
    (8, "Matemática y Ciencias", "matematica-ciencias"),
    (9, "Idiomas", "idiomas"),
    (10, "Negocios y Emprendimiento", "negocios-emprendimiento"),
    (11, "Marketing Digital", "marketing-digital"),
    (12, "Habilidades Blandas", "habilidades-blandas"),
    (13, "Otra", "otra"),
]


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.execute("CREATE TYPE rol_usuario AS ENUM ('usuario', 'moderador', 'admin')")
    op.execute("CREATE TYPE estado_curso AS ENUM ('en_revision', 'publicado', 'rechazado')")
    op.execute("CREATE TYPE estado_avance AS ENUM ('pendiente', 'en_progreso', 'completado')")

    op.execute(
        """
        CREATE TABLE usuarios (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            email varchar(254) NOT NULL,
            nombre varchar(80) NOT NULL,
            password_hash varchar(255) NOT NULL,
            rol rol_usuario NOT NULL DEFAULT 'usuario',
            token_version integer NOT NULL DEFAULT 0,
            activo boolean NOT NULL DEFAULT true,
            creado_en timestamptz NOT NULL DEFAULT now(),
            actualizado_en timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT ck_usuarios_nombre CHECK (length(trim(nombre)) >= 2),
            CONSTRAINT ck_usuarios_token_version CHECK (token_version >= 0)
        )
        """
    )
    op.execute("CREATE UNIQUE INDEX uq_usuarios_email_lower ON usuarios (lower(email))")

    op.execute(
        """
        CREATE TABLE categorias (
            id smallint PRIMARY KEY,
            nombre varchar(60) NOT NULL,
            slug varchar(60) NOT NULL,
            orden smallint NOT NULL,
            CONSTRAINT uq_categorias_nombre UNIQUE (nombre),
            CONSTRAINT uq_categorias_slug UNIQUE (slug),
            CONSTRAINT ck_categorias_slug CHECK (slug ~ '^[a-z0-9-]+$')
        )
        """
    )

    op.execute(
        """
        CREATE TABLE cursos (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            categoria_id smallint NOT NULL,
            url varchar(2048) NOT NULL,
            url_normalizada varchar(2048) NOT NULL,
            titulo varchar(200) NOT NULL,
            tema varchar(120) NOT NULL,
            plataforma varchar(80) NOT NULL,
            version varchar(40) NOT NULL,
            anio_edicion smallint NOT NULL,
            docentes varchar(120)[] NOT NULL,
            tiene_cuestionarios boolean NOT NULL,
            requiere_examen boolean NOT NULL,
            extiende_certificado boolean NOT NULL,
            avalado_por_organizacion boolean NOT NULL,
            organizacion_aval varchar(160),
            descripcion varchar(2000),
            estado estado_curso NOT NULL DEFAULT 'en_revision',
            enlace_verificado_en timestamptz,
            publicado_en timestamptz,
            creado_en timestamptz NOT NULL DEFAULT now(),
            actualizado_en timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT fk_cursos_categoria_id FOREIGN KEY (categoria_id)
                REFERENCES categorias (id) ON DELETE RESTRICT,
            CONSTRAINT ck_cursos_url CHECK (url ~* '^https?://'),
            CONSTRAINT ck_cursos_titulo CHECK (length(trim(titulo)) >= 3),
            CONSTRAINT ck_cursos_tema CHECK (length(trim(tema)) >= 2),
            CONSTRAINT ck_cursos_anio_edicion CHECK (anio_edicion BETWEEN 1990 AND 2100),
            CONSTRAINT ck_cursos_docentes CHECK (cardinality(docentes) BETWEEN 1 AND 10),
            CONSTRAINT ck_cursos_organizacion_aval CHECK (
                (avalado_por_organizacion AND organizacion_aval IS NOT NULL)
                OR (NOT avalado_por_organizacion AND organizacion_aval IS NULL)
            ),
            CONSTRAINT ck_cursos_publicado_en CHECK ((estado = 'publicado') = (publicado_en IS NOT NULL))
        )
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_cursos_url_vigente ON cursos (url_normalizada) "
        "WHERE estado IN ('en_revision', 'publicado')"
    )
    op.execute(
        "CREATE INDEX ix_cursos_estado_publicado_en ON cursos (estado, publicado_en DESC)"
    )
    op.execute("CREATE INDEX ix_cursos_categoria ON cursos (categoria_id)")
    op.execute("CREATE INDEX ix_cursos_titulo_trgm ON cursos USING gin (titulo gin_trgm_ops)")
    op.execute("CREATE INDEX ix_cursos_tema_trgm ON cursos USING gin (tema gin_trgm_ops)")

    op.execute(
        """
        CREATE TABLE aportes (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            curso_id bigint NOT NULL,
            autor_id bigint NOT NULL,
            lo_tome boolean NOT NULL,
            revisado_por_id bigint,
            revisado_en timestamptz,
            motivo_rechazo varchar(500),
            creado_en timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_aportes_curso_id UNIQUE (curso_id),
            CONSTRAINT fk_aportes_curso_id FOREIGN KEY (curso_id)
                REFERENCES cursos (id) ON DELETE CASCADE,
            CONSTRAINT fk_aportes_autor_id FOREIGN KEY (autor_id)
                REFERENCES usuarios (id) ON DELETE RESTRICT,
            CONSTRAINT fk_aportes_revisado_por_id FOREIGN KEY (revisado_por_id)
                REFERENCES usuarios (id) ON DELETE SET NULL,
            CONSTRAINT ck_aportes_sin_autovalidacion CHECK (
                revisado_por_id IS NULL OR revisado_por_id <> autor_id
            ),
            CONSTRAINT ck_aportes_motivo_rechazo CHECK (
                motivo_rechazo IS NULL OR length(trim(motivo_rechazo)) >= 10
            )
        )
        """
    )
    op.execute("CREATE INDEX ix_aportes_autor_creado ON aportes (autor_id, creado_en DESC)")
    op.execute("CREATE INDEX ix_aportes_creado ON aportes (creado_en)")

    op.execute(
        """
        CREATE TABLE roadmap_items (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            usuario_id bigint NOT NULL,
            curso_id bigint NOT NULL,
            orden integer NOT NULL,
            estado estado_avance NOT NULL DEFAULT 'pendiente',
            agregado_en timestamptz NOT NULL DEFAULT now(),
            actualizado_en timestamptz NOT NULL DEFAULT now(),
            completado_en timestamptz,
            CONSTRAINT fk_roadmap_items_usuario_id FOREIGN KEY (usuario_id)
                REFERENCES usuarios (id) ON DELETE CASCADE,
            CONSTRAINT fk_roadmap_items_curso_id FOREIGN KEY (curso_id)
                REFERENCES cursos (id) ON DELETE RESTRICT,
            CONSTRAINT ck_roadmap_items_orden CHECK (orden >= 1),
            CONSTRAINT ck_roadmap_items_completado_en CHECK (
                (estado = 'completado') = (completado_en IS NOT NULL)
            ),
            CONSTRAINT uq_roadmap_usuario_curso UNIQUE (usuario_id, curso_id),
            CONSTRAINT uq_roadmap_usuario_orden UNIQUE (usuario_id, orden)
                DEFERRABLE INITIALLY DEFERRED
        )
        """
    )
    op.execute("CREATE INDEX ix_roadmap_usuario_estado ON roadmap_items (usuario_id, estado)")
    op.execute("CREATE INDEX ix_roadmap_curso ON roadmap_items (curso_id)")

    op.execute(
        """
        CREATE TABLE tokens_recuperacion (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            usuario_id bigint NOT NULL,
            token_hash char(64) NOT NULL,
            expira_en timestamptz NOT NULL,
            usado_en timestamptz,
            creado_en timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_tokens_recuperacion_token_hash UNIQUE (token_hash),
            CONSTRAINT fk_tokens_recuperacion_usuario_id FOREIGN KEY (usuario_id)
                REFERENCES usuarios (id) ON DELETE CASCADE
        )
        """
    )
    op.execute(
        "CREATE INDEX ix_tokens_usuario_vigentes ON tokens_recuperacion (usuario_id) "
        "WHERE usado_en IS NULL"
    )

    valores = ", ".join(
        f"({id_}, '{nombre}', '{slug}', {id_})" for id_, nombre, slug in CATEGORIAS
    )
    op.execute(f"INSERT INTO categorias (id, nombre, slug, orden) VALUES {valores}")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS tokens_recuperacion")
    op.execute("DROP TABLE IF EXISTS roadmap_items")
    op.execute("DROP TABLE IF EXISTS aportes")
    op.execute("DROP TABLE IF EXISTS cursos")
    op.execute("DROP TABLE IF EXISTS categorias")
    op.execute("DROP TABLE IF EXISTS usuarios")
    op.execute("DROP TYPE IF EXISTS estado_avance")
    op.execute("DROP TYPE IF EXISTS estado_curso")
    op.execute("DROP TYPE IF EXISTS rol_usuario")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
