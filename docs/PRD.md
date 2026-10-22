# PRD — Product Requirements Document — Rumbo

> **Qué es:** el QUÉ y el POR QUÉ. Para quién construimos, qué problema resuelve, qué hace y —
> con el mismo peso — qué **no** hace. No habla de tecnología ni de carpetas (eso es el
> [TRD](TRD.md)).

## 1. Resumen ejecutivo

Rumbo es una webapp donde una comunidad de estudiantes construye en conjunto un catálogo de
cursos gratuitos de cualquier plataforma y gestiona su aprendizaje con roadmaps personales.
Cualquier persona registrada aporta un curso con metadatos comparables (certificado, examen,
cuestionarios, aval, docentes, año) y declara si lo tomó. Un moderador verifica el aporte y lo
publica en el catálogo comunitario, que es público, paginado y filtrable. Desde ahí, cada usuario
agrega cursos a su roadmap privado, los ordena y registra su avance.

## 2. Objetivos y métricas de éxito

| Objetivo | Cómo sabemos que lo logramos |
|----------|------------------------------|
| O1 — Catálogo confiable y variado | ≥ 70 % de los aportes moderados terminan `publicado`; cursos publicados en ≥ 8 de las 13 categorías y de ≥ 5 plataformas distintas a los 3 meses |
| O2 — Moderación ágil | Mediana entre `creado_en` del aporte y la decisión del moderador ≤ 72 h |
| O3 — Catálogo sin duplicados | 0 cursos publicados con la misma URL normalizada (garantizado por constraint) y conteo de 409 por duplicado visible en logs |
| O4 — El roadmap se usa para planificar | ≥ 60 % de los usuarios activos con ≥ 3 ítems en su roadmap; ≥ 30 % con al menos un ítem `completado` a los 2 meses |
| O5 — Aportes con experiencia real | ≥ 50 % de los cursos publicados con declaración "lo tomé" = Sí |
| O6 — Acceso seguro | 0 contraseñas en claro (verificable en BD); 100 % de intentos de fuerza bruta por encima del límite responden 429 |

> Para la demo del MVP, O1–O6 se verifican con el seed de datos y consultas SQL documentadas en
> el [Implementation Plan §5](IMPLEMENTATION_PLAN.md#5-estrategia-de-testing).

## 3. Personas

### Persona 1 — Lucía, estudiante que aprende por su cuenta

- **Contexto:** 21 años, cursa 2.º año de Ingeniería en Sistemas en UTN FRLP. Estudia desde el
  celular en el tren La Plata–Constitución y desde la notebook a la noche. Usa cursos gratuitos
  para reforzar materias y aprender temas que no están en el plan (Git, React, inglés técnico).
- **Motivaciones:** encontrar rápido cursos que valgan la pena, con certificado gratuito para
  sumar al CV, y tener un orden claro de qué hacer primero.
- **Frustraciones hoy:** guarda links en favoritos y en chats de WhatsApp; descubre a mitad de un
  curso que el certificado es pago; no sabe si alguien de su entorno lo terminó; pierde el hilo de
  qué cursos empezó.
- **Historias tipo:**
  - "Quiero ver solo cursos de bases de datos que den certificado gratis."
  - "Quiero tener en una sola lista los cursos que voy a hacer este cuatrimestre y marcar cuáles terminé."
  - "Encontré un curso buenísimo en YouTube, quiero sumarlo para que lo vean mis compañeros."

### Persona 2 — Martín, desarrollador y ayudante de cátedra (moderador)

- **Contexto:** 34 años, desarrollador backend semi-senior y ayudante en una cátedra de la
  facultad. Tomó decenas de cursos y suele recomendarlos. Usa Rumbo desde la notebook en el
  trabajo; tiene rol `moderador`.
- **Motivaciones:** que los estudiantes encuentren material bueno sin depender de su
  recomendación personal; mantener el catálogo limpio de spam, links rotos y duplicados.
- **Frustraciones hoy:** recibe la misma pregunta ("¿qué curso de Docker me recomendás?") muchas
  veces por cuatrimestre; las listas compartidas se llenan de links muertos y repetidos.
- **Historias tipo:**
  - "Quiero una bandeja con los aportes pendientes, del más viejo al más nuevo."
  - "Si rechazo un aporte, quiero dejar el motivo para que quien lo cargó aprenda qué falta."
  - "No quiero que nadie, ni yo, publique sus propios aportes sin otra mirada."

### Persona 3 — Visitante sin cuenta (secundaria)

- **Contexto:** llega por un link compartido. Quiere mirar el catálogo antes de registrarse.
- **Historia tipo:** "Quiero buscar cursos sin crear una cuenta; si me sirve, me registro para armar mi roadmap."

## 4. User stories

> P0 = el producto no funciona sin esto el día del MVP. P1 = valor alto, entra si el tiempo lo
> permite. Criterios en formato Dado / Cuando / Entonces.

| ID | Prioridad | Historia | Criterios de aceptación |
|----|-----------|----------|-------------------------|
| US-001 | P0 | **Como** visitante, **quiero** registrarme con nombre, email y contraseña, **para** tener una cuenta propia y armar mi roadmap | - [ ] Dado el formulario `/registro` válido, cuando lo envío, entonces se crea la cuenta con rol `usuario`, quedo con sesión iniciada y voy a `/roadmap`<br>- [ ] Dado un email ya registrado (sin importar mayúsculas), cuando envío, entonces veo "Ya existe una cuenta con ese email" junto al campo email<br>- [ ] Dada una contraseña de menos de 10 caracteres o igual al email, cuando envío, entonces veo el error junto al campo y no se crea la cuenta<br>- [ ] Dado que la cuenta se creó, entonces la contraseña nunca se guarda en claro |
| US-002 | P0 | **Como** usuario registrado, **quiero** iniciar y cerrar sesión, **para** acceder a mis datos de forma segura | - [ ] Dadas credenciales válidas, cuando ingreso en `/login`, entonces vuelvo a la ruta desde la que me pidieron login (o a `/roadmap`)<br>- [ ] Dadas credenciales inválidas, entonces veo "Email o contraseña incorrectos" sin indicar cuál de los dos falló<br>- [ ] Dado que hice 5 intentos en el último minuto desde la misma IP, cuando intento el 6.º, entonces veo "Demasiados intentos. Probá de nuevo en N segundos" y el botón queda deshabilitado esos N segundos<br>- [ ] Dado que tengo sesión, cuando elijo "Cerrar sesión", entonces se borra la sesión y vuelvo a `/` |
| US-003 | P0 | **Como** visitante, **quiero** explorar el catálogo comunitario paginado con búsqueda y filtro por categoría, **para** descubrir cursos sin registrarme | - [ ] Dado que visito `/catalogo`, entonces veo la primera página de 20 cursos publicados, ordenados del más reciente al más antiguo<br>- [ ] Dado que hay más de 20 resultados, entonces aparece el paginador con la página actual marcada y el texto "1–20 de N"<br>- [ ] Dado que escribo "docker" y elijo la categoría "Infraestructura y Cloud", entonces solo veo cursos que cumplen ambas condiciones y la URL refleja `?q=docker&categoria_id=4&page=1`<br>- [ ] Dado que no hay resultados, entonces veo un empty state con "Limpiar filtros" y, si tengo sesión, "Aportar un curso"<br>- [ ] Dado que nunca veo cursos `en_revision` ni `rechazado` en el catálogo |
| US-004 | P0 | **Como** visitante, **quiero** ver el detalle completo de un curso, **para** decidir si me conviene antes de abrir la plataforma | - [ ] Dado un curso publicado, cuando abro `/catalogo/:id`, entonces veo título, categoría, tema, plataforma, versión, año, docentes, cuestionarios, examen, certificado, aval (con organización), descripción, si quien lo aportó lo tomó y cuántas personas lo tienen en su roadmap<br>- [ ] Dado el botón "Ir al curso", entonces abre la URL en una pestaña nueva con `rel="noopener noreferrer"`<br>- [ ] Dado un id inexistente o no publicado, entonces veo la pantalla "Curso no encontrado" con link al catálogo |
| US-005 | P0 | **Como** usuario, **quiero** aportar un curso con todos sus metadatos y declarar si lo tomé, **para** enriquecer el catálogo comunitario | - [ ] Dado el formulario `/aportar` completo y válido, cuando envío, entonces el aporte queda `en_revision`, veo el snackbar "Aporte enviado a revisión" y voy a `/mis-aportes/:id`<br>- [ ] Dado que dejo sin responder "¿Tomaste este curso?" o cualquier Sí/No obligatorio, entonces veo el error en ese grupo y el foco va al primer campo con error<br>- [ ] Dado que marco "Avalado por una organización = Sí" sin nombre de organización, entonces veo el error en ese campo<br>- [ ] Dado una URL cuya versión normalizada ya existe publicada, entonces veo "Este curso ya está en el catálogo" con link a su detalle y mis datos no se pierden<br>- [ ] Dado una URL que ya está en revisión, entonces veo "Ya hay un aporte en revisión con esta URL"<br>- [ ] Dado un año de edición fuera de 1990…año actual + 1, entonces veo el error de rango |
| US-006 | P0 | **Como** moderador, **quiero** revisar los aportes pendientes y aprobarlos o rechazarlos con motivo, **para** que solo lleguen al catálogo cursos correctos | - [ ] Dado que tengo rol `moderador` o `admin`, cuando entro a `/moderacion`, entonces veo los aportes `en_revision` paginados, del más antiguo al más nuevo<br>- [ ] Dado un aporte ajeno, cuando confirmo "Aprobar" tras abrir el enlace, entonces el curso pasa a `publicado`, aparece en el catálogo y se registra quién y cuándo lo aprobó<br>- [ ] Dado un aporte ajeno, cuando elijo "Rechazar", entonces debo escribir un motivo de 10 a 500 caracteres y el curso pasa a `rechazado`<br>- [ ] Dado un aporte propio, entonces los botones aparecen deshabilitados con el texto "No podés moderar tus propios aportes"<br>- [ ] Dado que otro moderador ya decidió ese aporte, cuando confirmo, entonces veo "Este aporte ya fue moderado" y la bandeja se actualiza<br>- [ ] Dado un usuario sin rol, cuando entra a `/moderacion`, entonces ve "No tenés permiso para ver esta sección" |
| US-007 | P0 | **Como** usuario, **quiero** agregar un curso del catálogo a mi roadmap, **para** planificar qué voy a estudiar | - [ ] Dado un curso publicado que no está en mi roadmap, cuando presiono "Agregar a mi roadmap", entonces se agrega al final con estado `pendiente`, el botón cambia a "En tu roadmap" y veo un snackbar con acción "Deshacer"<br>- [ ] Dado que ya está en mi roadmap, entonces la card muestra el indicador "En tu roadmap" y no se puede agregar dos veces<br>- [ ] Dado que no tengo sesión, cuando presiono "Agregar", entonces voy a `/login` y al ingresar vuelvo al curso |
| US-008 | P0 | **Como** usuario, **quiero** ver mi roadmap paginado, cambiar el estado de avance de cada curso y quitarlo, **para** saber qué terminé, qué estoy haciendo y qué sigue | - [ ] Dado que entro a `/roadmap`, entonces veo mis ítems en el orden que definí, 20 por página, con su estado y resumen de avance ("3 de 8 completados")<br>- [ ] Dado un ítem, cuando cambio su estado a `en_progreso` o `completado`, entonces se guarda y el resumen se actualiza; al pasar a `completado` se registra la fecha<br>- [ ] Dado que filtro por estado `pendiente`, entonces solo veo esos ítems y el paginador se recalcula<br>- [ ] Dado que quito un ítem y confirmo, entonces desaparece y los demás conservan su orden relativo<br>- [ ] Dado que mi roadmap está vacío, entonces veo un empty state con "Explorar el catálogo" |
| US-009 | P0 | **Como** usuario que olvidó su contraseña, **quiero** recuperarla por email, **para** volver a entrar sin ayuda | - [ ] Dado que pido recuperación en `/recuperar` con cualquier email, entonces siempre veo "Si el email está registrado, te enviamos un enlace" (no se revela si existe)<br>- [ ] Dado un email registrado, entonces recibo un enlace `/restablecer?token=…` válido por 30 minutos<br>- [ ] Dado el enlace válido y una contraseña nueva válida, cuando la confirmo, entonces se actualiza, todas mis sesiones abiertas se cierran y voy a `/login` con el aviso "Contraseña actualizada"<br>- [ ] Dado un enlace vencido o ya usado, entonces veo "El enlace venció o ya fue usado" con botón para pedir uno nuevo<br>- [ ] Dado que pido más de 3 enlaces en 15 minutos desde la misma IP, entonces veo el aviso de demasiados intentos |
| US-010 | P0 | **Como** usuario que aportó cursos, **quiero** ver el estado de mis aportes, **para** saber si fueron publicados o por qué se rechazaron | - [ ] Dado que entro a `/mis-aportes`, entonces veo mis aportes paginados del más nuevo al más viejo con chip de estado (`En revisión`, `Publicado`, `Rechazado`)<br>- [ ] Dado un aporte rechazado, cuando abro `/mis-aportes/:id`, entonces veo el motivo del rechazo y la fecha<br>- [ ] Dado un aporte publicado, entonces veo el link "Ver en el catálogo"<br>- [ ] Dado el id de un aporte ajeno, entonces veo "Aporte no encontrado" |
| US-011 | P1 | **Como** usuario, **quiero** reordenar los cursos de mi roadmap, **para** reflejar el orden en que los voy a hacer | - [ ] Dado un ítem, cuando presiono "Subir" o "Bajar", entonces intercambia posición con el vecino y el nuevo orden persiste al recargar<br>- [ ] Dado el primer ítem, entonces "Subir" está deshabilitado; dado el último, "Bajar" está deshabilitado<br>- [ ] Dado que uso solo teclado, entonces puedo reordenar con los mismos botones y el foco queda en el ítem movido |
| US-012 | P1 | **Como** visitante, **quiero** filtrar el catálogo por certificado, examen, cuestionarios y aval, **para** encontrar cursos que se ajusten a lo que necesito | - [ ] Dado que activo el chip "Con certificado", entonces solo veo cursos con `extiende_certificado = true`<br>- [ ] Dado que combino varios chips, entonces se aplican todos a la vez (AND) junto con `q` y categoría<br>- [ ] Dado que recargo la página, entonces los filtros persisten porque viven en la URL |

## 5. Requisitos funcionales

| ID | Requisito | Historia relacionada |
|----|-----------|----------------------|
| RF-001 | El sistema permite registrar usuarios con nombre, email único (case-insensitive) y contraseña | US-001 |
| RF-002 | El sistema autentica con email y contraseña y mantiene la sesión mediante cookie HttpOnly | US-002 |
| RF-003 | El sistema limita los intentos de login por IP y responde con un error que indica el tiempo de espera | US-002 |
| RF-004 | El sistema permite cerrar sesión | US-002 |
| RF-005 | El sistema expone el usuario de la sesión actual (nombre, email, rol) | US-002, US-006 |
| RF-006 | El sistema permite solicitar un enlace de recuperación de contraseña, enviarlo por email y restablecerla con un token de un solo uso | US-009 |
| RF-007 | El sistema lista los cursos publicados de forma paginada, con búsqueda por texto y filtro por categoría | US-003 |
| RF-008 | El sistema permite filtrar cursos publicados por certificado, examen, cuestionarios y aval | US-012 |
| RF-009 | El sistema muestra el detalle de un curso publicado, incluida la declaración de toma del aportante y la cantidad de roadmaps que lo incluyen | US-004 |
| RF-010 | El sistema lista las categorías de la lista cerrada de forma paginada | US-003, US-005 |
| RF-011 | El sistema permite a un usuario aportar un curso con los campos obligatorios de la SPEC y la declaración de toma | US-005 |
| RF-012 | El sistema rechaza aportes cuya URL normalizada ya existe en un curso `en_revision` o `publicado`, informando el curso existente | US-005 |
| RF-013 | El sistema lista los aportes del usuario con su estado, de forma paginada, y muestra el detalle con motivo de rechazo | US-010 |
| RF-014 | El sistema lista a moderadores los aportes `en_revision`, paginados, del más antiguo al más nuevo | US-006 |
| RF-015 | El sistema permite a un moderador aprobar o rechazar (con motivo) un aporte ajeno en `en_revision` | US-006 |
| RF-016 | El sistema permite agregar un curso publicado al roadmap del usuario, al final y en estado `pendiente` | US-007 |
| RF-017 | El sistema lista el roadmap del usuario paginado y ordenado, con filtro por estado y resumen de avance | US-008 |
| RF-018 | El sistema permite cambiar el estado de avance de un ítem y quitarlo del roadmap | US-008 |
| RF-019 | El sistema permite cambiar la posición de un ítem del roadmap | US-011 |
| RF-020 | El catálogo y el detalle indican si el curso ya está en el roadmap del usuario con sesión | US-003, US-004, US-007 |

## 6. Requisitos no funcionales

| ID | Requisito | Notas |
|----|-----------|-------|
| RNF-001 | Todos los listados (API y UI) están paginados por offset con `page`, `page_size` y `total`; `page_size` por defecto 20, máximo 100 | heredado de SPEC clase · TRD TD-002 |
| RNF-002 | Mobile-first con mejora progresiva: estilos base sin media queries, mejoras con `@media (min-width: 768px)` y `@media (min-width: 1024px)` | heredado de SPEC clase · UX-UI §3 |
| RNF-003 | Menú sándwich accesible en viewports < 1024px | heredado de SPEC clase · UX-UI §4.6 |
| RNF-004 | Estética inspirada en Google/Material con tokens concretos | heredado de SPEC clase · UX-UI §2 |
| RNF-005 | Accesibilidad WCAG 2.2 nivel AA en todas las pantallas | decisión propia · UX-UI §6 |
| RNF-006 | `GET /api/v1/cursos` responde en p95 < 300 ms con 1.000 cursos publicados en el entorno Docker local | decisión propia · verificado en tarea 5.3 |
| RNF-007 | El catálogo muestra contenido útil (skeleton → datos) en < 2 s en una red "Fast 4G" simulada | decisión propia |
| RNF-008 | Contraseñas con Argon2id; rate limiting en login, registro y recuperación; tokens de recuperación guardados como hash | heredado de SPEC clase (bcrypt mínimo) · TRD TD-004, TD-005 |
| RNF-009 | Los mensajes de error de autenticación no revelan si un email existe | decisión propia (OWASP) |
| RNF-010 | Layout usable desde 360px de ancho sin scroll horizontal | decisión propia |
| RNF-011 | Navegadores soportados: últimas 2 versiones de Chrome, Firefox, Safari y Edge (incluidos móviles) | decisión propia |
| RNF-012 | Idioma de la interfaz: español rioplatense (es-AR); fechas en formato `dd/mm/aaaa` en la UI e ISO 8601 UTC en la API | decisión propia |
| RNF-013 | El entorno completo se levanta con `docker compose up` en una máquina limpia | heredado de SPEC clase · Implementation Plan §1 |

## 7. Reglas de negocio

| ID | Regla | Fuente |
|----|-------|--------|
| BR-001 | Un curso aportado entra en `en_revision` y no aparece en el catálogo comunitario hasta que un moderador lo aprueba (`publicado`) | SPEC clase |
| BR-002 | Quien aporta un curso declara obligatoriamente si lo tomó (Sí/No, sin valor por defecto) | SPEC clase |
| BR-003 | No pueden existir dos cursos con la misma URL normalizada en estado `en_revision` o `publicado`. Un curso `rechazado` no bloquea un nuevo aporte de la misma URL | decisión propia |
| BR-004 | El roadmap es privado: cada usuario solo ve y modifica sus ítems; un mismo curso aparece como máximo una vez por roadmap | SPEC clase + decisión propia |
| BR-005 | Un moderador o admin no puede aprobar ni rechazar sus propios aportes | decisión propia |
| BR-006 | Si el curso está avalado por una organización, el nombre de la organización es obligatorio; si no, debe quedar vacío | decisión propia |
| BR-007 | La URL debe usar `http` o `https`. La verificación de que el enlace está activo es manual: el moderador lo abre antes de aprobar y se registra la fecha de verificación | decisión propia |
| BR-008 | Todo rechazo requiere un motivo de 10 a 500 caracteres, visible para el autor del aporte | decisión propia |
| BR-009 | Roles: `usuario` (por defecto al registrarse), `moderador` (modera aportes) y `admin` (modera y promueve moderadores por comando). No hay cambio de rol desde la UI | decisión propia |
| BR-010 | El catálogo y el detalle de curso son públicos y solo muestran cursos `publicado` | SPEC clase + decisión propia |
| BR-011 | Estados de avance de un ítem: `pendiente`, `en_progreso`, `completado`. Se puede pasar de cualquier estado a cualquier otro; al pasar a `completado` se registra la fecha y al salir de `completado` se borra | decisión propia |
| BR-012 | El enlace de recuperación vence a los 30 minutos, es de un solo uso, y pedir uno nuevo invalida los anteriores. Restablecer la contraseña cierra todas las sesiones del usuario | SPEC clase (ciclo completo) + decisión propia |
| BR-013 | Contraseña: entre 10 y 128 caracteres y distinta del email. Sin reglas de composición obligatoria (NIST SP 800-63B) | decisión propia |
| BR-014 | Una moderación es definitiva: si dos moderadores deciden el mismo aporte, gana la primera decisión registrada y la segunda recibe un conflicto | decisión propia |
| BR-015 | Un curso publicado no se edita ni se borra desde la app en el MVP | decisión propia |
| BR-016 | Los ítems nuevos del roadmap se agregan al final (mayor `orden` + 1) | decisión propia |

## 8. Fuera de alcance (out of scope)

- Comentarios, reseñas, valoraciones con estrellas o votos sobre cursos.
- Edición o eliminación de cursos publicados; re-envío de aportes rechazados (se aporta de nuevo).
- Verificación automática de enlaces activos, scraping de metadatos o previsualización de la página del curso.
- Login con Google/GitHub, autenticación de dos factores, verificación de email al registrarse.
- Edición de perfil, cambio de email, eliminación de cuenta desde la UI.
- UI de administración de usuarios y roles.
- Roadmaps públicos, compartidos, clonables o colaborativos; seguir a otros usuarios.
- Arrastrar y soltar para reordenar (se reordena con botones Subir/Bajar).
- Notificaciones (email, push o in-app) salvo el email de recuperación de contraseña.
- Cursos pagos, pagos, emisión de certificados propios.
- App móvil nativa, PWA, funcionamiento offline.
- Internacionalización (solo es-AR) y modo oscuro.
- Despliegue en producción.

## 9. Supuestos y decisiones sobre la SPEC de clase

- **Supuesto:** la comunidad inicial son estudiantes y docentes de UTN FRLP; el volumen esperado
  en el primer año es < 5.000 usuarios y < 2.000 cursos, por lo que la paginación offset es
  suficiente (ver [TRD TD-002](TRD.md#2-decisiones-técnicas)).
- **Supuesto:** hay al menos un moderador disponible desde el día uno (el admin creado por seed).
- **Supuesto:** "incluir en su catálogo" de la SPEC significa lo mismo que "agregar a su roadmap".
- **Decisión:** la validación es humana y por rol, no por votos (comunidad todavía chica).
- **Decisión:** se agregan dos campos que la SPEC no pedía y aportan valor: `plataforma`
  (obligatorio, p. ej. "Coursera") y `descripcion` (opcional). La SPEC dice "como mínimo".
- Todas las decisiones sobre vacíos, con alternativas y origen, están en
  [SPEC §8](SPEC.md#8-vacíos-de-la-spec-de-clase-y-decisiones-tomadas).

## 10. Preguntas abiertas

| Pregunta | Impacto | Estado |
|----------|---------|--------|
| ¿Los aportes `en_revision` expiran si nadie los modera? | medio | **Decidida:** no expiran en el MVP; la bandeja ordena del más antiguo al más nuevo para que no se olviden. Revisar con métrica O2 |
| ¿Se avisa por email al autor cuando su aporte se publica o rechaza? | bajo | **Decidida:** no en el MVP; el estado se consulta en `/mis-aportes` (ver §8) |
| ¿Qué pasa con un curso publicado cuyo enlace deja de funcionar? | medio | **Abierta** para la versión 2: candidato "reportar enlace roto" + estado `archivado`. En el MVP se corrige por base de datos |
| ¿Un curso puede pertenecer a más de una categoría? | bajo | **Decidida:** no, una sola categoría (la SPEC dice "seleccionado de una lista") |
| ¿Se muestra el nombre de quien aportó el curso? | bajo | **Decidida:** sí, se muestra el nombre (no el email) en el detalle |

---

**Referencias:**
- Atlassian — Plantilla PRD: https://www.atlassian.com/software/confluence/templates/product-requirements
- NIST SP 800-63B — Digital Identity Guidelines (contraseñas): https://pages.nist.gov/800-63-4/sp800-63b.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
