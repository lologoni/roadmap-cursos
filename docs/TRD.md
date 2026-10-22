# TRD — Technical Requirements Document — Rumbo

> **Qué es:** el CÓMO técnico. Decisiones de arquitectura, stack, estructura de carpetas y
> convenciones, cada una con sus alternativas y su porqué. No es el plan de tareas
> ([Implementation Plan](IMPLEMENTATION_PLAN.md)) ni el producto ([PRD](PRD.md)).

## 1. Stack y versiones exactas

### 1.1 Stack fijado por la SPEC

| Capa | Elección | Versión exacta | Por qué |
|------|----------|----------------|---------|
| Frontend — UI | React + React DOM | 19.2.6 | SPEC: React 19, última stable |
| Frontend — build/dev server | Vite | 8.1.3 | SPEC; HMR rápido y proxy de desarrollo integrado (TD-013) |
| Frontend — gestor de paquetes | pnpm | 11.18.0 | SPEC exige pnpm. Elegi la última de la línea 11 en lugar de 12.0.0 (publicada el 26/08/2026, reescritura completa): menor riesgo de incompatibilidades para un MVP con fecha. Se fija con `packageManager` en `package.json` y Corepack |
| Frontend — runtime | Node.js | 24 LTS (imagen `node:24-alpine`) | línea LTS activa; Vite 8 requiere Node moderno |
| Backend — framework | FastAPI | 0.158.2 | SPEC (versión de referencia del 21/10/2026) |
| Backend — gestor de proyecto | uv | 0.12.2 | SPEC; lockfile reproducible (`uv.lock`) y entornos en segundos |
| Backend — runtime | Python | 3.13 (imagen `python:3.13-slim`) | todas las dependencias (argon2-cffi, psycopg) publican wheels para 3.13; 3.14 se evalúa después del MVP |
| Base de datos | PostgreSQL | 18.6 (imagen `postgres:18.6`) | fijado por SPEC |
| Infra (dev) | Docker Engine + Docker Compose | 29.6.1 · 5.5.1 | SPEC: última stable |

> Versiones verificadas contra las publicaciones oficiales el 22/10/2026. La tarea 0.1 del
> Implementation Plan las confirma en la máquina de desarrollo (`node -v`, `pnpm -v`,
> `uv --version`, `docker version`, `docker compose version`) y, si difieren, se actualizan esta
> tabla y [SPEC §6](SPEC.md#6-stack-registrado-versiones-exactas-con-las-que-se-va-a-desarrollar) en el mismo PR.

### 1.2 Dependencias principales

Las versiones exactas de estas dependencias quedan fijadas por los lockfiles (`uv.lock`,
`pnpm-lock.yaml`), que se versionan. Acá se fija la **línea mayor** permitida.

| Lado | Paquete | Línea | Rol |
|------|---------|-------|-----|
| Backend | `sqlalchemy` | 2.0.x | ORM, estilo 2.0 tipado (TD-006) |
| Backend | `alembic` | 1.x | migraciones |
| Backend | `psycopg[binary]` | 3.2.x | driver PostgreSQL |
| Backend | `pydantic` / `pydantic-settings` | 2.x | validación de schemas y configuración por entorno |
| Backend | `pwdlib[argon2]` | 0.2.x | hash Argon2id (TD-005) |
| Backend | `pyjwt` | 2.x | firma y verificación de JWT (TD-001) |
| Backend | `slowapi` | 0.1.x | rate limiting (TD-004) |
| Backend | `uvicorn[standard]` | 0.3x | servidor ASGI |
| Backend (dev) | `pytest`, `pytest-cov`, `httpx` | 8.x / 6.x / 0.28.x | tests (TestClient) |
| Backend (dev) | `ruff` | 0.x | lint + formato |
| Frontend | `react-router` | 7.x | ruteo en modo librería |
| Frontend | `@tanstack/react-query` | 5.x | cache y estado de servidor (TD-007) |
| Frontend | `react-hook-form` + `zod` + `@hookform/resolvers` | 7.x / 4.x / 5.x | formularios y validación (TD-011) |
| Frontend | `@fontsource/roboto` · `material-symbols` | 5.x · 0.x | tipografía e iconos self-hosted (UX-UI §2.2, §7) |
| Frontend (dev) | `vitest`, `@testing-library/react`, `jsdom` | 4.x / 16.x / 26.x | tests |
| Frontend (dev) | `eslint`, `stylelint` | 9.x / 16.x | lint de JS y de CSS (regla mobile-first, §5) |

## 2. Decisiones técnicas

| # | Decisión | Alternativas consideradas | Elegida | Por qué |
|---|----------|---------------------------|---------|---------|
| TD-001 | Estrategia de autenticación | (a) sesión server-side en tabla · (b) JWT stateless en `localStorage` + header `Authorization` · (c) JWT stateless en cookie HttpOnly · (d) OAuth externo | **(c)** JWT HS256 en cookie `rumbo_sesion` (HttpOnly, SameSite=Lax, `Path=/api`, `Secure` fuera de dev, 60 min) con claims `sub`, `tv` (token_version), `iat`, `exp` | (b) expone el token a XSS; (a) agrega tabla y limpieza; (d) está fuera de alcance. La cookie HttpOnly no es legible por JS y SameSite=Lax bloquea el envío en POST cross-site (CSRF). El "stateless puro" no permite revocar: lo resolvemos con `token_version`, que el backend compara en cada request contra el usuario (que igual se carga para conocer rol y `activo`). Sin refresh token: al vencer, se vuelve a ingresar (aceptable para el MVP) |
| TD-002 | Estrategia de paginación | offset + total · cursor (keyset) · sin total | **Offset** con `page`, `page_size` (default 20, máx 100) y respuesta `{items, total, page, page_size, pages}` en **todos** los listados | El paginador estilo Google ("1 2 3 … ›", "1–20 de N") necesita `total` y saltar a una página arbitraria, que cursor no ofrece. Con < 2.000 cursos y < 100 ítems por roadmap el costo de `COUNT(*)` y `OFFSET` es despreciable. Riesgo de inconsistencia si se publican cursos mientras se pagina: aceptado (orden estable con desempate por `id`) |
| TD-003 | Formato de errores de API | envelope propio `{error:{code,message}}` · RFC 9457 `application/problem+json` · default de FastAPI | **RFC 9457** con extensiones `code` (estable, para la UI) y `errors[]` (validación) | Estándar (sucesor de RFC 7807), autodescriptivo, un solo parser en el frontend. Se reemplaza el handler de `RequestValidationError` de FastAPI para traducir su formato a `errors[{campo, mensaje}]` en español |
| TD-004 | Rate limiting | middleware propio con dict · `slowapi` con almacenamiento en memoria · `slowapi` + Redis · límite en un proxy (nginx) | **`slowapi`** con almacenamiento en memoria, clave = IP del cliente. Login 5/min + 20/h; registro 10/h; recuperar 3/15 min; restablecer 10/h | Cumple la SPEC sin infraestructura extra. Es correcto mientras haya **un solo proceso** de uvicorn (así corre el entorno dev). Si se escala a varios workers se migra a Redis cambiando solo el `storage_uri` (riesgo R-01). `headers_enabled=True` agrega `X-RateLimit-*` y `Retry-After`; el handler de `RateLimitExceeded` responde en problem+json |
| TD-005 | Algoritmo de hash de contraseñas | bcrypt (cost 12) · scrypt · **Argon2id** | **Argon2id** vía `pwdlib` con `m=19456 KiB, t=2, p=1` (mínimo recomendado por OWASP) | La SPEC pide "bcrypt como mínimo" y permite uno más fuerte con justificación: Argon2id es memory-hard (encarece ataques con GPU/ASIC), es la primera recomendación de OWASP y no tiene el límite de 72 bytes de bcrypt. `pwdlib` es la librería que recomienda la documentación actual de FastAPI y soporta re-hash cuando cambian los parámetros |
| TD-006 | ORM y acceso a datos | SQLModel · SQLAlchemy 2.0 sync · SQLAlchemy 2.0 async · psycopg con SQL a mano | **SQLAlchemy 2.0 síncrono** + Alembic + psycopg 3; los endpoints son `def` (FastAPI los corre en threadpool) | SQLModel mezcla modelo de BD y schema de API, lo que choca con la separación de capas; async agrega complejidad (sesiones, tests) sin beneficio con esta carga. SQLAlchemy 2.0 da tipado, constraints e índices parciales declarativos y Alembic genera migraciones revisables |
| TD-007 | Estado de servidor en el frontend | `useEffect` + `fetch` a mano · SWR · **TanStack Query v5** | **TanStack Query** con `placeholderData: keepPreviousData` en listados paginados | Cache por clave (`['cursos', filtros, page]`), reintentos, invalidación tras mutaciones (agregar al roadmap invalida catálogo y roadmap) y estado `isPlaceholderData` para atenuar la página anterior sin saltos (APPFlow §3.2) |
| TD-008 | Modelo de roles y su asignación | tabla de permisos · columna enum + chequeo por dependencia · UI de administración | **Columna `rol` enum** + dependencia `requiere_rol("moderador", "admin")`; el primer admin se crea en el seed con `ADMIN_EMAIL`/`ADMIN_PASSWORD`; la promoción es un comando: `uv run python -m app.auth.cli promover <email> moderador` | Tres roles fijos no justifican un sistema de permisos. La UI de roles está fuera de alcance (PRD §8) |
| TD-009 | Verificación de enlaces aportados | HEAD request desde el backend al cargar · job periódico · **sin requests salientes + verificación manual** | **Sin requests salientes**: el backend valida formato y normaliza; el moderador confirma `enlace_verificado: true` al aprobar | Un fetch del servidor a URLs arbitrarias abre SSRF (acceso a `postgres:5432`, metadatos de nube) y agrega latencia y falsos negativos (sitios que bloquean bots). La verificación humana ya es parte de la moderación |
| TD-010 | Estrategia de estilos | Tailwind · CSS-in-JS · **CSS Modules + custom properties** | **CSS Modules** por componente + `styles/tokens.css` con las variables de UX-UI §2.4 | La regla mobile-first de la SPEC se audita mejor en CSS plano: `stylelint` con `media-feature-range-notation` y una regla que **prohíbe `max-width` en media queries** (§5). Tailwind permitiría `max-md:` y ocultaría el patrón. Sin dependencia de runtime |
| TD-011 | Formularios | estado controlado a mano · Formik · **react-hook-form + zod** | **react-hook-form + zod**; el esquema de `AporteNuevo` en zod refleja 1 a 1 las validaciones de BackendSchema §3.3 | El formulario de aporte tiene 15 campos, campos condicionales (organización) y arreglo dinámico (docentes). `useFieldArray` y `superRefine` lo resuelven; los errores del 422 del backend se mapean con `setError(campo)` |
| TD-012 | Envío de emails en desarrollo | SMTP real (Gmail) · servicio SaaS · imprimir en logs · **Mailpit** | **Mailpit** como servicio de Compose (SMTP `:1025`, UI `:8025`); el backend usa `smtplib` contra `SMTP_HOST`/`SMTP_PORT` | Prueba el ciclo completo de recuperación sin credenciales ni envíos reales. En producción solo cambian variables de entorno |
| TD-013 | Comunicación frontend → API | CORS entre `:5173` y `:8000` · **proxy de Vite (mismo origen)** | **Proxy de Vite**: el navegador solo habla con `:5173`; `/api/*` se reenvía a `http://backend:8000` | Mismo origen = cookie SameSite sin configuración CORS con credenciales, menos superficie de error. `CORS_ORIGINS` queda vacío en dev |
| TD-014 | Reordenar el roadmap | drag & drop (dnd-kit) · **botones Subir/Bajar** · campo numérico | **Botones Subir/Bajar** que envían `PATCH {orden}` | Accesible por teclado y lector de pantalla sin trabajo extra, usable en mobile con targets de 48px, sin dependencia. Drag & drop queda para v2 (PRD §8) |
| TD-015 | Seed de datos | SQL plano · fixtures en tests · **script idempotente** | Migración inicial carga las 13 categorías; script `uv run python -m app.semillas.cargar_demo` crea admin, 2 usuarios demo, 40 cursos publicados y 5 aportes en revisión; opción `--cursos 1000` para la prueba de rendimiento | Idempotente (no duplica si se corre dos veces); los datos de demo nunca están en la migración |

## 3. Arquitectura

### 3.1 Patrón y capas

Screaming Architecture (módulos por dominio) + arquitectura en capas **dentro** de cada módulo.

```mermaid
flowchart LR
    subgraph CLIENTE[Navegador]
        UI[features/*: pages y components] --> HOOKS[features/*/hooks: TanStack Query]
        HOOKS --> APIJS[features/*/api.js]
        APIJS --> HTTPC[compartido/api/cliente.js: fetch + problem+json]
    end
    HTTPC -- "HTTP JSON /api/v1" --> ROUTER
    subgraph BACKEND[FastAPI — por dominio: auth, catalogo, aportes, roadmap]
        ROUTER[router.py: HTTP, validación Pydantic, dependencias de sesión y rol] --> SVC[service.py: reglas de negocio puras]
        SVC --> REPOI[[Puertos: interfaz del repository]]
        REPOI --> REPO[repository.py: SQLAlchemy]
        SVC --> SCH[schemas.py: Pydantic]
        REPO --> MOD[models.py: entidades ORM]
    end
    REPO --> DB[(PostgreSQL 18.6)]
    SVC -. "solo auth" .-> SMTP[[Mailpit SMTP]]
```

- **Router (controller):** traduce HTTP ↔ dominio. Valida con Pydantic, obtiene el usuario con
  `Depends(usuario_actual)` / `Depends(requiere_rol(...))`, llama al service, devuelve el schema.
  Sin reglas de negocio ni SQL.
- **Service:** reglas de negocio puras (BR-xxx). Recibe sus dependencias por constructor
  (repository, reloj, generador de tokens, emisor de email) para poder testearse con fakes, sin BD
  ni HTTP. Lanza excepciones de dominio (`UrlDuplicada`, `AporteYaModerado`, …).
- **Repository:** única puerta a la BD; recibe la `Session` de SQLAlchemy; sin reglas de negocio.
  Las transacciones las abre la dependencia `sesion_bd` (una por request, commit al final o rollback ante excepción).
- **Excepciones de dominio → HTTP:** un único handler en `compartido/errores.py` mapea cada
  excepción a su `status` y `code` del catálogo de BackendSchema §3.0.
- **Frontend:** cada feature tiene sus pages, components, hooks y `api.js`; los hooks de una
  feature no importan internals de otra (solo su `api.js` o hooks públicos). Lo transversal vive en `compartido/`.

**Dependencias permitidas entre módulos del backend:** `aportes` → `catalogo` (categorías,
lectura) · `roadmap` → `catalogo` (verificar curso publicado) · todos → `auth` (usuario actual) ·
todos → `compartido`. Nunca al revés (`catalogo` no importa `aportes` ni `roadmap`).

### 3.2 Estructura de carpetas (Screaming Architecture)

```
rumbo/
├── .gitignore
├── README.md
├── docker-compose.yml
├── .env.example                       # variables de §4.4, sin secretos reales
├── docs/                              # los 7 documentos
├── backend/
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── migraciones/
│   │   ├── env.py
│   │   └── versions/                  # 0001_esquema_inicial.py (incluye 13 categorías)
│   ├── app/
│   │   ├── main.py                    # crea la app, registra routers, handlers y middleware
│   │   ├── config.py                  # Settings (pydantic-settings) desde variables de entorno
│   │   ├── auth/                      # registro, login, sesión, roles, recuperación
│   │   │   ├── router.py              # E02–E07
│   │   │   ├── service.py             # reglas BR-009, BR-012, BR-013
│   │   │   ├── repository.py          # usuarios y tokens_recuperacion
│   │   │   ├── models.py              # Usuario, TokenRecuperacion
│   │   │   ├── schemas.py             # RegistroIn, LoginIn, UsuarioOut…
│   │   │   ├── seguridad.py           # hash Argon2id, firma/verificación JWT, cookie
│   │   │   ├── dependencias.py        # usuario_actual, usuario_opcional, requiere_rol
│   │   │   ├── correo.py              # plantilla y envío del email de recuperación
│   │   │   └── cli.py                 # comando promover <email> <rol>
│   │   ├── catalogo/                  # categorías y cursos publicados
│   │   │   ├── router.py              # E08–E10
│   │   │   ├── service.py             # filtros, BR-010
│   │   │   ├── repository.py
│   │   │   ├── models.py              # Categoria, Curso
│   │   │   └── schemas.py             # CursoResumen, CursoDetalle, FiltrosCatalogo
│   │   ├── aportes/                   # aportes y moderación
│   │   │   ├── router.py              # E11–E13
│   │   │   ├── router_moderacion.py   # E14–E16
│   │   │   ├── service.py             # BR-001..003, 005..008, 014
│   │   │   ├── normalizacion_url.py   # función pura (BackendSchema §4)
│   │   │   ├── repository.py
│   │   │   ├── models.py              # Aporte
│   │   │   └── schemas.py             # AporteNuevo, AporteDetalle, AporteResumen, AporteEnRevision
│   │   ├── roadmap/                   # roadmap personal
│   │   │   ├── router.py              # E17–E20
│   │   │   ├── service.py             # BR-004, BR-011, BR-016, reordenamiento
│   │   │   ├── repository.py
│   │   │   ├── models.py              # RoadmapItem
│   │   │   └── schemas.py
│   │   ├── compartido/                # transversal, sin reglas de negocio
│   │   │   ├── bd.py                  # engine, SessionLocal, dependencia sesion_bd
│   │   │   ├── paginacion.py          # ParamsPaginacion, Pagina[T]
│   │   │   ├── errores.py             # excepciones base + handlers problem+json
│   │   │   ├── limite_tasa.py         # instancia de slowapi y handler 429
│   │   │   ├── registro_logs.py       # logging JSON + middleware request_id
│   │   │   └── salud.py               # E01
│   │   └── semillas/
│   │       └── cargar_demo.py         # TD-015
│   └── tests/
│       ├── conftest.py
│       ├── unitarios/                 # services y funciones puras, con fakes
│       │   ├── auth/  catalogo/  aportes/  roadmap/
│       └── integracion/               # routers + repositories contra Postgres (BD rumbo_test)
│           ├── auth/  catalogo/  aportes/  roadmap/
└── frontend/
    ├── package.json
    ├── pnpm-lock.yaml
    ├── vite.config.js                 # proxy /api + configuración de Vitest
    ├── stylelint.config.js            # regla: sin max-width en media queries
    ├── eslint.config.js
    ├── index.html
    ├── Dockerfile
    └── src/
        ├── main.jsx
        ├── app/                       # shell de la aplicación
        │   ├── App.jsx
        │   ├── rutas.jsx              # tabla de rutas de APPFlow §2
        │   ├── proveedores.jsx        # QueryClient, sesión, snackbar
        │   ├── layout/                # Shell, Header, MenuLateral (drawer), MenuCuenta
        │   ├── guardas/               # RutaProtegida, RutaConRol
        │   └── paginas/               # NoEncontrado, SinPermiso
        ├── features/
        │   ├── auth/
        │   │   ├── api.js
        │   │   ├── hooks/             # useSesion, useLogin, useRegistro, useRecuperar, useRestablecer
        │   │   ├── components/        # FormLogin, FormRegistro, CampoContrasena…
        │   │   └── pages/             # LoginPage, RegistroPage, RecuperarPage, RestablecerPage
        │   ├── catalogo/
        │   │   ├── api.js
        │   │   ├── hooks/             # useCursos, useCurso, useCategorias
        │   │   ├── components/        # CardCurso, FiltrosCatalogo, AtributosCurso
        │   │   └── pages/             # HomePage, CatalogoPage, DetalleCursoPage
        │   ├── aportes/
        │   │   ├── api.js
        │   │   ├── esquemas/          # aporteNuevo.js (zod)
        │   │   ├── hooks/             # useCrearAporte, useMisAportes, useAporte, useBandeja, useModerar
        │   │   ├── components/        # FormAporte, CampoDocentes, ChipEstadoAporte, ModalRechazo
        │   │   └── pages/             # AportarPage, MisAportesPage, EstadoAportePage, BandejaModeracionPage, RevisionAportePage
        │   └── roadmap/
        │       ├── api.js
        │       ├── hooks/             # useRoadmap, useAgregarAlRoadmap, useActualizarItem, useQuitarItem
        │       ├── components/        # ItemRoadmap, ResumenAvance, BotonAgregarRoadmap
        │       └── pages/             # RoadmapPage
        ├── compartido/                # transversal, sin conocimiento de dominio
        │   ├── api/cliente.js         # fetch con credentials, parseo de problem+json, 401 global
        │   ├── ui/                    # Boton, CampoTexto, Select, GrupoSiNo, Chip, Paginador, Modal, Snackbar, Skeleton, EstadoVacio, BannerError
        │   ├── hooks/                 # usePaginacionUrl, useFocoAlNavegar, useCuentaRegresiva
        │   └── utilidades/            # formatearFecha, construirQuery
        └── styles/
            ├── tokens.css             # :root de UX-UI §2.4
            ├── base.css               # reset, tipografía, :focus-visible
            └── fuentes.css            # @fontsource/roboto + Material Symbols
```

> Al abrir `backend/app/` o `frontend/src/features/` se lee el negocio: **auth, catálogo,
> aportes, roadmap**. Los términos técnicos (router, service, hooks) aparecen un nivel más abajo.

### 3.3 Servicios Docker (entorno de desarrollo)

| Servicio | Imagen / base | Puerto host | Rol | Detalles |
|----------|---------------|-------------|-----|----------|
| `postgres` | `postgres:18.6` | 5432 | base de datos | volumen `pgdata` montado en **`/var/lib/postgresql`** (cambio de la imagen 18: `PGDATA` pasa a `/var/lib/postgresql/18/docker`); healthcheck `pg_isready -U $POSTGRES_USER`; script de init crea la BD `rumbo_test` |
| `backend` | build `./backend` (base `python:3.13-slim` + binario `uv` copiado de `ghcr.io/astral-sh/uv:0.12.2`) | 8000 | API FastAPI | `depends_on: postgres (service_healthy), mailpit`; comando: `uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`; bind mount `./backend/app`; volumen anónimo para `.venv`; healthcheck `GET /api/v1/health` |
| `frontend` | build `./frontend` (base `node:24-alpine` + Corepack con pnpm 11.18.0) | 5173 | SPA Vite (dev server) | `depends_on: backend`; comando `pnpm dev --host 0.0.0.0`; bind mount `./frontend/src`; volumen anónimo para `node_modules`; `VITE_PROXY_TARGET=http://backend:8000` |
| `mailpit` | `axllent/mailpit` (tag fijo en la tarea 1.6) | 8025 (UI) · 1025 (SMTP) | captura de emails | sin persistencia |

```mermaid
flowchart LR
    BROWSER[Navegador :5173] --> FE[frontend — Vite dev server]
    FE -- "proxy /api/*" --> BE[backend — FastAPI :8000]
    BE --> PG[(postgres :5432)]
    BE -- "SMTP :1025" --> MP[mailpit]
    DEV[Dev: bandeja :8025] --> MP
```

> En la clase del 27/10 los Dockerfiles evolucionan a multi-stage. Por ahora, lo mínimo que levanta.

## 4. Convenciones

### 4.1 Commits y flujo de Git

- **Commits:** Conventional Commits 1.0 — `feat`, `fix`, `docs`, `test`, `refactor`, `chore`,
  `docker`, `style`; ámbitos `auth`, `catalogo`, `aportes`, `roadmap`, `compartido`, `infra`, `docs`.
- **Flujo:** GitHub Flow adaptado — `main` protegida, ramas cortas `docs/…`, `feat/<modulo>-<tarea>`,
  `fix/…`, `chore/…`, `docker/…`, `test/…`; PR con checklist; squash merge con título convencional;
  tags `v0.1.0-docs` y `v0.2.0-mvp`. Detalle completo en el [README § Versionado](../README.md#versionado).

### 4.2 Código

- **Idioma:** dominio en español (nombres de módulos, tablas, campos, endpoints); palabras
  reservadas y patrones técnicos en inglés cuando son estándar (`router`, `service`, `repository`, `hooks`).
- **Python:** `ruff` (lint + formato, línea 100), type hints obligatorios en services y repositories.
- **JavaScript:** ESLint con reglas de React Hooks; componentes en `PascalCase.jsx`, hooks `useAlgo.js`.
- **CSS:** un `*.module.css` por componente, solo variables de `tokens.css` para color, espacio,
  radio y sombra (sin valores hex sueltos fuera de `tokens.css`).

### 4.3 Errores de API

RFC 9457 (TD-003). Ejemplo:

```json
{
  "type": "/problemas/curso_ya_en_roadmap",
  "title": "El curso ya está en tu roadmap",
  "status": 409,
  "detail": "No se puede agregar dos veces el mismo curso.",
  "instance": "/api/v1/roadmap/items",
  "code": "curso_ya_en_roadmap",
  "item_id": 318
}
```

Catálogo completo de códigos en [BackendSchema §3.0](BackendSchema.md#catálogo-de-códigos-de-error).
El frontend decide qué mostrar por `code`, nunca por el texto de `title`.

### 4.4 Variables de entorno

| Variable | Ejemplo | Obligatoria | Descripción |
|----------|---------|-------------|-------------|
| `POSTGRES_USER` | `rumbo` | sí | usuario de Postgres (servicio `postgres`) |
| `POSTGRES_PASSWORD` | `cambiar-en-local` | sí | contraseña de Postgres |
| `POSTGRES_DB` | `rumbo` | sí | base de datos principal |
| `DATABASE_URL` | `postgresql+psycopg://rumbo:cambiar-en-local@postgres:5432/rumbo` | sí | conexión del backend |
| `DATABASE_URL_TEST` | `postgresql+psycopg://rumbo:cambiar-en-local@postgres:5432/rumbo_test` | sí (tests) | BD de tests de integración |
| `JWT_SECRET` | 64 caracteres aleatorios (`openssl rand -hex 32`) | sí | firma HS256; el backend no arranca si tiene menos de 32 bytes |
| `JWT_EXPIRA_MINUTOS` | `60` | no (default 60) | vida de la sesión |
| `COOKIE_SECURE` | `false` | no (default `true`) | `false` solo en dev (HTTP) |
| `FRONTEND_URL` | `http://localhost:5173` | sí | base del enlace de recuperación |
| `RECUPERACION_EXPIRA_MINUTOS` | `30` | no (default 30) | vida del token de recuperación |
| `SMTP_HOST` | `mailpit` | sí | servidor SMTP |
| `SMTP_PORT` | `1025` | sí | puerto SMTP |
| `SMTP_REMITENTE` | `Rumbo <no-responder@rumbo.local>` | sí | remitente del email |
| `ADMIN_EMAIL` | `admin@rumbo.local` | sí (seed) | admin inicial creado por `cargar_demo` |
| `ADMIN_PASSWORD` | `cambiar-en-local-2026` | sí (seed) | contraseña del admin inicial |
| `CORS_ORIGINS` | *(vacío)* | no | orígenes permitidos; vacío en dev por el proxy (TD-013) |
| `LOG_LEVEL` | `INFO` | no (default `INFO`) | nivel de logging |
| `VITE_PROXY_TARGET` | `http://backend:8000` | sí (frontend) | destino del proxy `/api` en Vite |

`.env` nunca se commitea (está en `.gitignore`); `.env.example` sí, con valores de ejemplo.

### 4.5 Logging y excepciones

- Logs en JSON a stdout (`timestamp`, `nivel`, `request_id`, `metodo`, `ruta`, `status`,
  `duracion_ms`, `usuario_id` si hay sesión). El middleware genera `request_id` y lo devuelve en
  el header `X-Request-ID`.
- **Nunca** se loguean contraseñas, hashes, tokens de recuperación, el JWT ni cuerpos de requests de `auth`.
- Se loguean como `WARNING`: logins fallidos (con IP, sin email en claro), 429, 403; como
  `INFO`: moderaciones (aporte, moderador, decisión); como `ERROR` con stack trace: excepciones no controladas.
- Las excepciones de dominio se capturan en el handler global de `compartido/errores.py`; las no
  controladas devuelven `500 error_interno` sin detalles internos.

## 5. Requisitos no funcionales técnicos (traducción de las restricciones)

| Restricción (SPEC / PRD) | Cómo se cumple | Dónde se verifica |
|--------------------------|----------------|-------------------|
| Paginación de listados (RNF-001) | TD-002; `ParamsPaginacion` y `Pagina[T]` genéricos en `compartido/paginacion.py`, usados por E08, E09, E12, E14, E17; `Paginador` único en `compartido/ui` | tests de integración por endpoint (`page_size=101` → 422; `total` correcto); pantallas Catálogo, Mis aportes, Bandeja, Roadmap |
| Mobile-first con mejora progresiva (RNF-002) | CSS base sin media queries; solo `@media (min-width: 768px)` y `@media (min-width: 1024px)`; `stylelint` falla ante `max-width` en media queries | `pnpm lint:css` en cada PR; revisión visual a 360, 768 y 1280 px (tarea 5.2) |
| Menú sándwich (RNF-003) | componente `MenuLateral` con `aria-expanded`, `aria-controls`, focus trap y `ESC` | APPFlow §3.0; test de componente en Vitest |
| Screaming Architecture | árbol §3.2; regla de dependencias entre módulos §3.1 | revisión del repo en cada PR |
| Estética Google (RNF-004) | tokens de UX-UI §2 en `styles/tokens.css` | revisión visual |
| Rate limiting en login (RNF-008) | TD-004 | test de integración: 6.º login en 1 min → 429 con `Retry-After` |
| Hash fuerte (RNF-008) | TD-005 | test: el hash guardado empieza con `$argon2id$` |
| Rendimiento del catálogo (RNF-006) | índices de BackendSchema §1.3 (parcial por estado, trigram); seed de 1.000 cursos | tarea 5.3: medición con `hey`/`curl` en loop y `EXPLAIN ANALYZE` sin seq scan sobre `cursos` |
| Accesibilidad AA (RNF-005) | UX-UI §6 | Lighthouse ≥ 95 en Accesibilidad y recorrido con teclado (tarea 5.2) |
| Entorno reproducible (RNF-013) | Compose de §3.3; lockfiles versionados; migraciones al arrancar | tarea 5.1: clon limpio + `docker compose up` |

## 6. Riesgos técnicos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| R-01 | El rate limit en memoria deja de ser correcto si se corre uvicorn con varios workers | baja (dev usa 1 proceso) | alto (se podría saltear el límite) | documentado en TD-004; `storage_uri` configurable para pasar a Redis sin tocar código |
| R-02 | Imagen `postgres:18` cambió la ruta de datos; montar el volumen en `/var/lib/postgresql/data` como en versiones anteriores pierde datos o falla | media | medio | volumen montado en `/var/lib/postgresql` (§3.3); DoD de la tarea 0.2 verifica que los datos sobreviven a `docker compose down && up` |
| R-03 | Argon2id con 19 MiB por hash hace lentos los tests de integración | media | bajo | en tests se usan parámetros reducidos por configuración (`HASH_PERFIL=tests`), nunca en dev/prod |
| R-04 | Bind mounts lentos o sin hot reload en Windows/WSL | media | medio | trabajar dentro del filesystem de WSL; `CHOKIDAR_USEPOLLING`/`server.watch.usePolling` en Vite y `--reload` con `WATCHFILES_FORCE_POLLING` como plan B |
| R-05 | La cookie de sesión no viaja por el proxy (path o dominio mal configurado) | media | alto | `Path=/api` y mismo origen (TD-013); test end-to-end manual en la tarea 1.10 antes de seguir con M2 |
| R-06 | La normalización de URL produce falsos duplicados o deja pasar duplicados reales | media | medio | función pura con ≥ 15 casos de test unitarios (tarea 3.2); los rechazados no bloquean (BR-003) |
| R-07 | Carrera entre dos moderadores sobre el mismo aporte | baja | medio | `UPDATE … WHERE estado = 'en_revision'` atómico + 409 (BackendSchema §2) y test de integración |
| R-08 | Reordenar el roadmap viola la unicidad de `orden` a mitad de transacción | media | medio | constraint `DEFERRABLE INITIALLY DEFERRED` + tests de mover arriba/abajo/extremos |
| R-09 | Librerías del ecosistema todavía no compatibles con React 19.2 o Vite 8 | baja | medio | dependencias mínimas (§1.2); verificación en la tarea 0.4 antes de agregar cada una |
| R-10 | `pg_trgm` no disponible o índices no usados con `ILIKE` corto | baja | bajo | la migración crea la extensión; `q` exige mínimo 2 caracteres; verificado con `EXPLAIN` en la tarea 5.3 |
| R-11 | Secretos commiteados por error | baja | alto | `.env` en `.gitignore`; `.env.example` sin valores reales; checklist del PR |

---

**Referencias:**
- Design Docs at Google: https://www.industrialempathy.com/posts/design-docs-at-google/
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP SSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- RFC 9457 — Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- FastAPI — Security / OAuth2 con JWT (pwdlib): https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- Imagen oficial de PostgreSQL (notas de la versión 18 sobre `PGDATA`): https://hub.docker.com/_/postgres
