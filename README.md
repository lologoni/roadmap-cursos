# Rumbo

> **Cursos gratuitos curados por la comunidad + tu roadmap personal para recorrerlos.**
> WebApp de gestión de comunidad de cursos: cualquier estudiante aporta un curso gratuito de
> cualquier plataforma; un moderador lo valida; desde el catálogo comunitario cada persona arma
> y sigue su propio roadmap de aprendizaje.
>
> **Estado:** 📚 Documentación (Instancia A) — desarrollo pendiente de aprobación docente.

**Stack:** React 19.2 + Vite 8.1 + pnpm 11 · FastAPI 0.158.2 + uv 0.12 · PostgreSQL 18.6 · Docker Compose (dev)

---

## Qué hace

Los cursos gratuitos están dispersos en decenas de plataformas y es difícil saber, antes de
invertir horas, si un curso certifica, si tiene examen o si alguien realmente lo terminó.
Rumbo resuelve eso con tres piezas:

1. **Aportes:** un usuario registrado carga un curso (URL activa, categoría, tema, título, versión,
   año, docentes, cuestionarios, examen, certificado, aval) y declara si lo tomó.
2. **Moderación:** el aporte queda `en_revision`; un usuario con rol `moderador` lo aprueba
   (pasa a `publicado`) o lo rechaza con motivo.
3. **Roadmap personal:** desde el catálogo comunitario (público y paginado) cada usuario agrega
   cursos a su roadmap, los ordena y marca su avance (`pendiente` → `en_progreso` → `completado`).

## Documentación

| Documento | Responde la pregunta | Link |
|-----------|----------------------|------|
| SPEC | ¿Qué nos pidieron construir y qué decidimos nosotros sobre los huecos? | [docs/SPEC.md](docs/SPEC.md) |
| PRD | ¿Para quién, qué problema resuelve, qué hace y qué NO hace? | [docs/PRD.md](docs/PRD.md) |
| TRD | ¿Cómo lo construimos técnicamente y por qué? | [docs/TRD.md](docs/TRD.md) |
| UX-UI | ¿Cómo se ve, se siente y se comporta? | [docs/UX-UI.md](docs/UX-UI.md) |
| APPFlow | ¿Qué pantallas hay y cómo se navega? | [docs/APPFlow.md](docs/APPFlow.md) |
| BackendSchema | ¿Qué datos persistimos y qué API expone? | [docs/BackendSchema.md](docs/BackendSchema.md) |
| Implementation Plan | ¿En qué orden construimos y qué significa "hecho"? | [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) |

**Orden de lectura sugerido:** SPEC → PRD → APPFlow → BackendSchema → TRD → UX-UI → Implementation Plan.

### Trazabilidad entre documentos

| Desde | Hacia | Cómo se enlaza |
|-------|-------|----------------|
| SPEC §8 (vacíos) | PRD BR-xxx / TRD TD-xxx | columna "Dónde se desarrolla" |
| PRD US-xxx | APPFlow (fichas de pantalla) | cada ficha lista las historias que cubre |
| APPFlow (APIs consumidas) | BackendSchema §3 | mismo verbo y misma ruta, sin excepciones |
| PRD US-xxx (P0) | IMPLEMENTATION_PLAN §3 | columna "US" en cada tarea |

## Cómo revisar este repo

- Los `.md` se renderizan solos en GitHub.
- Los diagramas Mermaid (`erDiagram`, `flowchart`, `stateDiagram-v2`) también se renderizan en
  GitHub. Si los ves como texto crudo, falta el bloque de apertura con la palabra `mermaid`.
- Preview local: VS Code con `Ctrl+Shift+V` y las extensiones *Markdown All in One* y
  *Markdown Preview Mermaid Support*.
- Validar un diagrama aislado: copiarlo en https://mermaid.live.

## Estado del trabajo

| Instancia | Contenido | Estado |
|-----------|-----------|--------|
| A — Documentación | repo + `.gitignore` + 7 documentos | ✅ enviada a aprobación el 22/10/2026 |
| B — Desarrollo del MVP | ejecución del Implementation Plan (M0 → M5) | ⏳ pendiente de aprobación |
| C — Clase 27/10 | testing, Docker multi-stage, gestión del cambio | ⏳ |

> **Gate de documentación:** hasta la aprobación de la Instancia A este repo no contiene código
> fuente ejecutable. Solo Markdown, diagramas Mermaid y el `.gitignore` ya preparado para
> React/Vite/pnpm + FastAPI/uv.

## Versionado

### Flujo de Git — GitHub Flow adaptado

- `main` es la única rama de larga vida, siempre desplegable y **protegida**: no se pushea
  directo; todo entra por Pull Request.
- Una rama corta por documento o por tarea del Implementation Plan, creada desde `main`
  actualizado:

  | Tipo | Patrón | Ejemplo |
  |------|--------|---------|
  | Documento | `docs/<documento>` | `docs/backend-schema` |
  | Feature | `feat/<modulo>-<tarea>` | `feat/m2-listado-cursos` |
  | Corrección | `fix/<modulo>-<descripcion>` | `fix/m1-rate-limit-login` |
  | Infra / tooling | `chore/<descripcion>` o `docker/<descripcion>` | `docker/compose-postgres` |
  | Tests | `test/<modulo>-<descripcion>` | `test/m3-reglas-moderacion` |

- **Merge:** *squash merge* a `main`; el título del PR es el mensaje final y debe cumplir
  Conventional Commits. La rama se borra al mergear.
- **Revisión:** cada PR usa el checklist de la plantilla (DoD de la tarea cumplido, docs
  actualizadas, sin secretos commiteados). Si el equipo tiene más de un integrante, se requiere
  1 aprobación de otro integrante.
- **Tags:** `v0.1.0-docs` al aprobarse la Instancia A; `v0.2.0-mvp` al cerrar la Instancia B.

### Convención de commits — Conventional Commits 1.0

```
<tipo>(<ámbito opcional>): <descripción en imperativo, minúscula, sin punto final>
```

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `docker`, `style`.
Ámbitos: `auth`, `catalogo`, `aportes`, `roadmap`, `compartido`, `infra`, `docs`.

Ejemplos: `docs(prd): agregar historias P0 de moderación` ·
`feat(roadmap): permitir cambiar estado de avance` · `fix(auth): devolver 429 con Retry-After`.

## Estructura del repo (Instancia A)

```
rumbo/
├── .gitignore
├── README.md
└── docs/
    ├── SPEC.md
    ├── PRD.md
    ├── TRD.md
    ├── UX-UI.md
    ├── APPFlow.md
    ├── BackendSchema.md
    └── IMPLEMENTATION_PLAN.md
```

La estructura de `backend/` y `frontend/` que se crea en la Instancia B está definida en
[TRD §3.2](docs/TRD.md#32-estructura-de-carpetas-screaming-architecture).

---

## Referencias de aprendizaje

| Tema | Recurso |
|------|---------|
| Markdown | [Markdown Guide](https://www.markdownguide.org/basic-syntax/) · [GitHub — Writing on GitHub](https://docs.github.com/en/get-started/writing-on-github) |
| Mermaid | [GitHub — Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) · [Mermaid — ER Diagrams](https://mermaid.js.org/syntax/entityRelationshipDiagram.html) |
| PRD | [Atlassian — Plantilla PRD](https://www.atlassian.com/software/confluence/templates/product-requirements) |
| TRD | [Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/) |
| UX-UI | [NN/g — Front-End Style Guides](https://www.nngroup.com/articles/front-end-style-guides/) · [Material Design 3](https://m3.material.io/) |
| APPFlow | [NN/g — User Journeys vs. User Flows](https://www.nngroup.com/articles/user-journeys-vs-user-flows/) |
| Git | [Conventional Commits 1.0](https://www.conventionalcommits.org/es/v1.0.0/) · [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) |

## Licencia / uso

Trabajo Práctico — Desarrollo de Software, UTN FR La Plata, 2026.
