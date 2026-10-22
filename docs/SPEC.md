# SPEC — Rumbo

> **Qué es este documento:** la versión refinada de la SPEC de clase (WebApp de Gestión de
> Comunidad de Cursos, entregada el 21/10/2026). El primer commit del repo contiene la SPEC de
> clase **tal cual**; este archivo es su evolución: mismos requisitos, ambigüedades resueltas,
> decisiones incorporadas.
> **Regla:** todo lo que la SPEC de clase no decía y nosotros definimos queda acá con su porqué,
> o referenciado al documento donde se desarrolla (PRD para producto, TRD para técnica,
> BackendSchema para datos y API).

## 1. Identidad del producto

- **Nombre propio:** **Rumbo**
- **Una línea:** para estudiantes que aprenden con cursos gratuitos dispersos en la web, Rumbo es
  un catálogo validado por la propia comunidad y un roadmap personal para recorrerlo, porque
  elegir bien qué curso tomar (y en qué orden) ahorra semanas de esfuerzo.

## 2. Problema

Un estudiante que quiere complementar su carrera con cursos gratuitos hoy navega entre Coursera,
edX, YouTube, Google Skills, freeCodeCamp, plataformas de universidades y de organismos públicos.
Cada plataforma muestra la información a su manera: algunas esconden si el certificado es pago,
otras no dicen si hay examen, y casi ninguna dice si el curso sigue vigente o quién lo terminó.
El resultado es una lista de favoritos en el navegador y decisiones tomadas a ciegas.

Los agregadores existentes (buscadores de MOOCs, listas "awesome" en GitHub) resuelven parte del
descubrimiento pero no la confianza ni la planificación: no distinguen un curso que alguien tomó
de uno que alguien encontró, y no permiten armar un plan de estudio propio con seguimiento.

Una comunidad cambia la ecuación porque convierte la experiencia individual en dato compartido:
quien aporta declara si tomó el curso, un moderador verifica que el enlace y los metadatos sean
correctos antes de publicarlo, y cada curso del catálogo usa siempre los mismos campos
comparables (certificado, examen, cuestionarios, aval). Sobre ese catálogo confiable, cada persona
arma su roadmap y registra su avance.

## 3. Visión

En 12 meses Rumbo es el lugar al que vuelve un estudiante de UTN FRLP cuando quiere aprender algo
fuera del plan de estudios: encuentra en segundos cursos gratuitos comparables por los mismos
atributos, ve cuántas personas de la comunidad los tomaron, y sigue un roadmap propio que le
muestra qué terminó, qué está cursando y qué sigue. Los moderadores publican los aportes en menos
de 72 horas y el catálogo crece sin duplicados.

## 4. Alcance

### Dentro

- Registro, login con rate limiting, logout y recuperación de contraseña de ciclo completo
  (solicitud → enlace con token de un solo uso → nueva contraseña).
- Contraseñas cifradas con **Argon2id** (ver TRD TD-005).
- Roles `usuario`, `moderador` y `admin`.
- Aporte de cursos con los 10 campos mínimos de la SPEC + plataforma y descripción opcional,
  y declaración obligatoria "¿tomaste este curso?".
- Detección de URLs duplicadas por URL normalizada.
- Moderación: bandeja de aportes `en_revision` paginada, aprobar o rechazar con motivo.
- Seguimiento de "mis aportes" con su estado y, si fue rechazado, el motivo.
- Catálogo comunitario público y paginado con búsqueda por texto, filtro por categoría y filtros
  por atributos (certificado, examen, cuestionarios, aval).
- Detalle de curso público.
- Roadmap personal privado: agregar desde el catálogo, quitar, ordenar y marcar avance.
- Interfaz mobile-first con mejora progresiva, menú sándwich, estética Google/Material.

### Fuera (out of scope explícito)

- Comentarios, reseñas, puntajes o votos sobre cursos.
- Edición de un curso ya publicado (corrección se hace fuera de la app en esta versión) y
  re-envío de un aporte rechazado (se puede aportar de nuevo como aporte nuevo).
- Verificación automática de que el enlace esté activo (crawler, ping periódico, scraping de
  metadatos). La verificación es manual en la moderación.
- Login social (Google, GitHub), 2FA, verificación de email al registrarse.
- Panel de administración de usuarios y roles en la UI (los roles se asignan por comando).
- Roadmaps públicos, compartidos o colaborativos; seguir a otros usuarios.
- Notificaciones por email salvo la de recuperación de contraseña.
- Cursos pagos, pagos, emisión de certificados propios.
- App móvil nativa, PWA offline, internacionalización (la app es solo es-AR).
- Despliegue productivo (la SPEC fija Docker Compose para desarrollo).

## 5. Reglas de producto clave

| # | Regla | Origen |
|---|-------|--------|
| BR-001 | Un curso aportado entra `en_revision` y solo aparece en el catálogo comunitario cuando un moderador lo aprueba (`publicado`) | SPEC clase ("todo curso aportado y **validado** pasa al catálogo") + decisión propia sobre quién valida |
| BR-002 | Quien aporta un curso declara explícitamente si lo tomó (Sí/No, sin valor por defecto); la declaración se muestra en el detalle del curso | SPEC clase ("declaración de toma") |
| BR-003 | No pueden coexistir dos cursos con la misma URL normalizada en estado `en_revision` o `publicado` | decisión propia (calidad del catálogo) |
| BR-004 | El roadmap es personal y privado: cada usuario ve y modifica solo sus propios ítems; un curso aparece una sola vez por roadmap | SPEC clase ("su propio roadmap") + decisión propia |
| BR-005 | Un moderador no puede aprobar ni rechazar sus propios aportes | decisión propia (evitar autovalidación) |

> El detalle completo de reglas vive en [PRD §7](PRD.md#7-reglas-de-negocio).

## 6. Stack registrado (versiones exactas con las que se va a desarrollar)

| Capa | Tecnología | Versión exacta |
|------|------------|----------------|
| Frontend | React + Vite + pnpm | react 19.2.6 · react-dom 19.2.6 · vite 8.1.3 · pnpm 11.18.0 · Node.js 24 LTS |
| Backend | FastAPI + uv | fastapi 0.158.2 · uv 0.12.2 · Python 3.13 |
| Base de datos | PostgreSQL | 18.6 (imagen `postgres:18.6`) |
| Infra (dev) | Docker + Docker Compose | Docker Engine 29.6.1 · Docker Compose 5.5.1 |

> Versiones verificadas contra las publicaciones oficiales el 22/10/2026. En la tarea 0.1 del
> Implementation Plan se confirman con `node -v`, `pnpm -v`, `uv --version`, `python --version`,
> `docker version` y `docker compose version`; si la instalación real difiere, se actualiza esta
> tabla y el TRD §1 en el mismo PR. Justificación de cada elección en [TRD §1](TRD.md#1-stack-y-versiones-exactas).

## 7. Restricciones técnicas heredadas de la SPEC de clase

| # | Restricción | Cómo la vamos a cumplir |
|---|-------------|-------------------------|
| 1 | Mobile-first con mejora progresiva: base sin media queries; `@media (min-width: …)` solo para agregar/mejorar | CSS base diseñado a 360px; dos breakpoints de mejora (768px y 1024px) definidos en [UX-UI §3](UX-UI.md#3-estrategia-mobile-first-con-mejora-progresiva); revisión en PR: cero `max-width` en media queries |
| 2 | Paginación de todas las consultas de listado y de sus tablas | Offset con `page`, `page_size` y `total` en toda ruta de listado, incluidas categorías ([TRD TD-002](TRD.md#2-decisiones-técnicas)); componente `Paginador` único en la UI |
| 3 | Menú sándwich en mobile | Header con botón hamburguesa < 1024px que abre un drawer con `aria-expanded`, `aria-controls`, focus trap y cierre con `ESC` ([UX-UI §4.6](UX-UI.md#46-menú-sándwich-drawer)) |
| 4 | Screaming Architecture | Carpetas por dominio `auth/`, `catalogo/`, `aportes/`, `roadmap/` en backend y frontend; lo transversal en `compartido/` ([TRD §3.2](TRD.md#32-estructura-de-carpetas-screaming-architecture)) |
| 5 | Apariencia inspirada en Google | Tokens Material con valores concretos y contrastes calculados ([UX-UI §2](UX-UI.md#2-design-tokens)) |
| 6 | Login con rate limiting | `slowapi` en `POST /api/v1/auth/login` (5/min y 20/h por IP) y también en registro y recuperación ([TRD TD-004](TRD.md#2-decisiones-técnicas)) |
| 7 | Contraseñas con bcrypt como mínimo | Argon2id vía `pwdlib` con parámetros OWASP ([TRD TD-005](TRD.md#2-decisiones-técnicas)) |
| 8 | Recuperación de contraseña de ciclo completo | Token aleatorio de un uso, guardado como hash SHA-256, vence a los 30 min ([BackendSchema §3.1](BackendSchema.md#31-autenticación-auth)) |

## 8. Vacíos de la SPEC de clase y decisiones tomadas

> La SPEC de clase fue escrita a propósito incompleta. Esta tabla documenta cómo resolvimos cada
> hueco.

| # | Vacío detectado en la SPEC | Opciones consideradas | Decisión | Dónde se desarrolla |
|---|----------------------------|-----------------------|----------|---------------------|
| 1 | ¿Quién valida los cursos aportados? | (a) auto-publicación sin validación · (b) votos de la comunidad con umbral · (c) usuarios con rol moderador | **(c)** Rol `moderador` aprueba o rechaza. (a) contradice "validados"; (b) necesita masa crítica de usuarios que el MVP no tiene | PRD BR-001, BR-008 · BackendSchema §2 |
| 2 | ¿Hay roles? ¿Cómo se asignan? | sin roles · `usuario`/`admin` · `usuario`/`moderador`/`admin` | Tres roles. `admin` se crea por seed con variables de entorno; `admin` promueve moderadores con un comando de consola. Sin UI de gestión de roles en el MVP | PRD BR-009 · TRD TD-008 |
| 3 | ¿Qué es "incluir en mi catálogo"? | copiar el curso al usuario · lista de favoritos · ítem de roadmap con estado | Relación n-a-n `roadmap_items` (usuario, curso) con `orden` y estado de avance `pendiente`/`en_progreso`/`completado`. "Mi catálogo" y "mi roadmap" son lo mismo | PRD BR-004, BR-011 · BackendSchema §1.2 |
| 4 | ¿Se pueden aportar URLs repetidas? | permitir duplicados · URL única absoluta · URL única por normalización salvo rechazados | URL única **normalizada** entre cursos `en_revision` y `publicado`; un rechazado no bloquea un nuevo aporte de la misma URL | PRD BR-003 · BackendSchema §4 |
| 5 | ¿Cómo se garantiza el "enlace web activo"? ¿Cada cuánto se refresca? | verificación al cargar (HTTP HEAD desde el server) · crawler periódico · verificación manual | Validación de formato `http(s)` al cargar + **verificación manual del moderador** al aprobar (se guarda `enlace_verificado_en`). Sin pedidos HTTP salientes desde el backend (evita SSRF). Sin refresco periódico en el MVP | PRD BR-007 · TRD TD-009 |
| 6 | ¿Con qué tasa se limita el login? ¿Solo login? | solo login · login + registro + recuperación | Login 5/min y 20/h por IP; registro 10/h; solicitud de recuperación 3 cada 15 min; restablecer 10/h. Respuesta 429 con `Retry-After` | TRD TD-004 · BackendSchema §3.1 |
| 7 | ¿bcrypt u otro algoritmo? | bcrypt cost 12 · scrypt · Argon2id | Argon2id (OWASP recomendado, memory-hard, sin límite de 72 bytes de bcrypt) | TRD TD-005 |
| 8 | ¿Cómo funciona exactamente la recuperación? | enviar contraseña nueva por mail · enlace con token · código numérico | Enlace con token aleatorio (32 bytes) de un solo uso, 30 min de vida, guardado como hash; al restablecer se invalidan todas las sesiones | PRD BR-012 · BackendSchema §3.1 |
| 9 | ¿Cómo se envían emails en desarrollo? | servicio externo (SendGrid) · imprimir en consola · SMTP falso | Contenedor **Mailpit** en Docker Compose: SMTP en `:1025`, bandeja web en `:8025` | TRD §3.3 |
| 10 | ¿La búsqueda es por texto, filtro o ambos? | solo texto · solo categoría · ambos | Ambos: `q` sobre título, tema y plataforma + filtros por categoría y por atributos (P1) | PRD US-003, US-012 · BackendSchema §3.2 |
| 11 | ¿Qué es "versión" de un curso? | número semántico · texto libre | Texto libre corto (máx. 40), p. ej. "2024", "v3", "2.ª edición" | BackendSchema §1.2 |
| 12 | ¿Cómo se cargan varios docentes? | un texto libre · tabla `docentes` · arreglo | Arreglo `varchar(120)[]` de 1 a 10 nombres | BackendSchema §4 |
| 13 | ¿Qué incluye "¿lo avala una organización?" | booleano solo · booleano + nombre | Booleano + nombre de la organización obligatorio cuando es `true` | PRD BR-006 · BackendSchema §1.2 |
| 14 | ¿La lista de categorías es editable? | editable por admin · lista cerrada | Lista cerrada de 13 categorías cargada por seed/migración | BackendSchema §1.2 |
| 15 | ¿El roadmap es público? | público · privado · configurable | Privado. Compartir queda fuera de alcance | PRD BR-004 |
| 16 | Versión de FastAPI: el borrador del aula decía 0.143.3 y la SPEC oficial dice 0.158.2 | 0.143.3 · 0.158.2 | **0.158.2**: la SPEC oficial entregada reemplaza al borrador | TRD §1 |
| 17 | ¿"Paginación de todas las consultas" incluye listas cortas como categorías? | excepción para listas cortas · paginar todo | Paginar todo, sin excepciones (categorías usa `page_size` hasta 100) | TRD TD-002 |

## 9. Historia de la SPEC (autoregistro de cambios)

| Fecha | Cambio | Por qué |
|-------|--------|---------|
| 20/10/2026 | SPEC de clase redactada en el aula (borrador) | — |
| 21/10/2026 | SPEC oficial entregada; primer commit con la SPEC de clase tal cual | regla de la consigna |
| 22/10/2026 | Nombre propio "Rumbo", identidad, problema, visión y alcance (§1–§4) | dar carácter al producto y fijar el "no" |
| 22/10/2026 | Reglas clave BR-001 a BR-005 (§5) | fijar el carácter del producto antes del PRD |
| 22/10/2026 | Stack con versiones exactas (§6) y restricciones con su cumplimiento (§7) | requisito de la SPEC: registrar versiones reales |
| 22/10/2026 | Tabla de 17 vacíos resueltos (§8) | la SPEC era intencionalmente incompleta |
