# UX-UI — Guía visual de estilos — Rumbo

> **Qué es:** la gramática visual de la interfaz: tokens, componentes, estados y accesibilidad.
> No es un prototipo navegable (eso lo cubre el [APPFlow](APPFlow.md)); son las reglas con las que
> se construye cada pantalla **antes** de escribir CSS.
> **Inspiración fijada por la SPEC:** Google / Material — limpieza, espacio en blanco, azul
> primario de Google, sombras sutiles, bordes redondeados, componentes con estados definidos.
> **Contrastes:** todos los ratios de esta guía están calculados con la fórmula de luminancia
> relativa de WCAG 2.2 (la misma que usa el WebAIM Contrast Checker).

## 1. Principios

1. **Mobile primero, se mejora hacia arriba:** el layout base se diseña para 360px y funciona
   solo; los breakpoints agregan columnas y navegación, nunca reparan.
2. **El catálogo es el producto:** la información del curso (certificado, examen, aval) se lee de
   un vistazo con iconos y texto, no solo color. Si no comunica, sobra.
3. **Un solo color de acción por pantalla:** el azul primario marca la acción principal; el resto
   de las acciones son texto o contorno.
4. **Todo estado está diseñado:** loading, vacío, error, deshabilitado y "sin permiso" tienen
   diseño propio; ninguna pantalla queda en blanco.
5. **Accesible por defecto:** foco siempre visible, targets de 48px, nada depende solo del color.

## 2. Design tokens

### 2.1 Paleta de colores

| Token | Valor | Uso | Contraste (WCAG 2.2) |
|-------|-------|-----|----------------------|
| `--color-primary` | `#1a73e8` | fondo de botón primario, anillo de foco, borde de input en foco, indicador activo | blanco sobre él: **4.51:1 ✓ AA** · como borde/foco vs blanco: 4.51:1 ✓ (≥ 3:1) · vs `--color-background`: 4.27:1 ✓ (≥ 3:1) |
| `--color-primary-dark` | `#185abc` | hover/active del primario, **links de texto**, texto sobre `--color-primary-container` | vs blanco **6.51:1 ✓** · vs `#f8f9fa` **6.17:1 ✓** · vs `#e8f0fe` **5.68:1 ✓** |
| `--color-primary-container` | `#e8f0fe` | chips seleccionados, ítem activo del drawer, página actual del paginador | con `--color-text` 14.05:1 ✓ |
| `--color-on-primary` | `#ffffff` | texto e iconos sobre `--color-primary` | 4.51:1 ✓ AA |
| `--color-surface` | `#ffffff` | cards, header, drawer, modales, inputs | — |
| `--color-background` | `#f8f9fa` | fondo de página | — |
| `--color-text` | `#202124` | texto principal y títulos | vs blanco **16.1:1 ✓** · vs `#f8f9fa` **15.27:1 ✓** |
| `--color-text-muted` | `#5f6368` | metadatos, ayudas, placeholders | vs blanco **6.05:1 ✓** · vs `#f8f9fa` **5.74:1 ✓** · vs `#f1f3f4` **5.44:1 ✓** |
| `--color-outline` | `#80868b` | **borde de inputs, selects, radios y botón outlined** (componentes interactivos) | vs blanco **3.68:1 ✓** · vs `#f8f9fa` **3.49:1 ✓** (WCAG 1.4.11 exige ≥ 3:1) |
| `--color-divider` | `#dadce0` | divisores de filas y bordes de cards (decorativos) | 1.37:1 — **solo decorativo**, nunca como único límite de un control |
| `--color-hover` | `#f1f3f4` | hover de botones de texto, filas, ítems del drawer; fondo de skeleton | — |
| `--color-success` | `#188038` | icono y texto de éxito, chip "Publicado" (icono) | vs blanco **5.02:1 ✓** · vs `#e6f4ea` 4.42:1 (icono ✓ ≥ 3:1) |
| `--color-success-container` | `#e6f4ea` | fondo del chip "Publicado" / "Completado" | con `--color-text` 14.18:1 ✓ |
| `--color-warning` | `#b06000` | icono y texto de advertencia, chip "En revisión" (icono) | vs blanco **4.65:1 ✓** · vs `#fef7e0` 4.34:1 (icono ✓ ≥ 3:1; el texto del chip usa `--color-text`) |
| `--color-warning-container` | `#fef7e0` | fondo del chip "En revisión" / "En progreso" | con `--color-text` 15.02:1 ✓ |
| `--color-error` | `#d93025` | mensajes de error, borde de input con error, botón de peligro | vs blanco **4.77:1 ✓** |
| `--color-error-container` | `#fce8e6` | fondo del chip "Rechazado" y del bloque de motivo de rechazo | con `--color-text` 13.66:1 ✓ · icono `#d93025` 4.05:1 ✓ |
| `--color-snackbar` | `#323232` | fondo del snackbar | texto blanco **12.82:1 ✓** |
| `--color-snackbar-action` | `#8ab4f8` | botón de acción del snackbar ("Deshacer") | vs `#323232` **6.08:1 ✓** |
| `--color-scrim` | `rgba(32, 33, 36, 0.32)` | velo detrás de drawer y modales | — |

**Decisiones que surgen de los cálculos (difieren del ejemplo de cátedra):**
- `#1a73e8` como **texto** sobre el fondo de página `#f8f9fa` da 4.27:1 y **no** cumple AA para
  texto normal. Por eso los links de texto usan `--color-primary-dark` (`#185abc`, 6.17:1) y
  `#1a73e8` queda para fondos de botón, bordes y foco.
- El texto azul sobre `#e8f0fe` también usa `#185abc` (5.68:1); `#1a73e8` daría 3.93:1 ✗.
- `#dadce0` como borde de input da 1.37:1 y no cumple 1.4.11; los controles usan `#80868b` (3.68:1).
- El amarillo Google `#f9ab00` da 1.93:1 sobre blanco; se reemplaza por `#b06000` para iconos y
  texto de advertencia.

### 2.2 Tipografía

Familia: **Roboto** (self-hosted con `@fontsource/roboto`, pesos 400 y 500, `font-display: swap`),
con fallback `system-ui, -apple-system, "Segoe UI", Arial, sans-serif`. Escala tomada de Material 3.

| Token | Tamaño / line-height | Peso | Uso |
|-------|----------------------|------|-----|
| `--text-xs` | 12px / 16px | 500 | chips, badges, contador de caracteres |
| `--text-sm` | 14px / 20px | 400 | metadatos, ayudas, tabla, botones (500) |
| `--text-base` | 16px / 24px | 400 | cuerpo, inputs (16px evita el zoom automático de iOS) |
| `--text-lg` | 18px / 24px | 500 | título de card, título de ítem de roadmap |
| `--text-xl` | 22px / 28px | 400 | títulos de sección y de modal |
| `--text-2xl` | 24px / 32px → **28px / 36px** desde 1024px | 400 | `<h1>` de pantalla (mejora progresiva) |
| `--text-display` | 32px / 40px → **45px / 52px** desde 1024px | 400 | título del Home |

Reglas: un solo `<h1>` por pantalla; jerarquía `h1 > h2 > h3` sin saltos; números tabulares
(`font-variant-numeric: tabular-nums`) en contadores y paginador; largo de línea máximo 72ch en textos corridos.

### 2.3 Espaciado, radios, sombras, z-index, movimiento

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-1` … `--space-8` | 4, 8, 12, 16, 24, 32, 40, 48 px | escala de 4px: gaps, paddings, márgenes |
| `--radius-sm` | 4px | chips de estado chicos, skeleton de texto |
| `--radius-md` | 8px | inputs, selects, snackbar, chips de filtro |
| `--radius-lg` | 12px | cards de curso, ítems de roadmap |
| `--radius-xl` | 28px | modales (Material 3) |
| `--radius-full` | 999px | botones (pill), botones de icono, paginador |
| `--shadow-1` | `0 1px 2px rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15)` | cards en reposo, header al hacer scroll |
| `--shadow-2` | `0 1px 2px rgba(60, 64, 67, .3), 0 2px 6px 2px rgba(60, 64, 67, .15)` | hover de card, botón primario en hover |
| `--shadow-3` | `0 4px 8px 3px rgba(60, 64, 67, .15), 0 1px 3px rgba(60, 64, 67, .3)` | drawer, modal, snackbar |
| `--z-header` | 100 | header sticky |
| `--z-drawer` | 200 | drawer + su scrim |
| `--z-modal` | 300 | modal + su scrim |
| `--z-snackbar` | 400 | snackbar (sobre todo) |
| `--target-min` | 48px | alto/ancho mínimo de cualquier control táctil |
| `--duracion-corta` / `--duracion-media` | 150ms / 250ms | hover, foco / drawer, modal |
| `--curva-estandar` | `cubic-bezier(0.2, 0, 0, 1)` | curva "standard" de Material 3 |

### 2.4 Bloque de variables listo para copiar (`frontend/src/styles/tokens.css`)

```css
:root {
  /* Color */
  --color-primary: #1a73e8;
  --color-primary-dark: #185abc;
  --color-primary-container: #e8f0fe;
  --color-on-primary: #ffffff;
  --color-surface: #ffffff;
  --color-background: #f8f9fa;
  --color-text: #202124;
  --color-text-muted: #5f6368;
  --color-outline: #80868b;
  --color-divider: #dadce0;
  --color-hover: #f1f3f4;
  --color-success: #188038;
  --color-success-container: #e6f4ea;
  --color-warning: #b06000;
  --color-warning-container: #fef7e0;
  --color-error: #d93025;
  --color-error-container: #fce8e6;
  --color-snackbar: #323232;
  --color-snackbar-action: #8ab4f8;
  --color-scrim: rgba(32, 33, 36, 0.32);

  /* Tipografía */
  --font-family-base: "Roboto", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  --text-xs: 0.75rem;     --leading-xs: 1rem;
  --text-sm: 0.875rem;    --leading-sm: 1.25rem;
  --text-base: 1rem;      --leading-base: 1.5rem;
  --text-lg: 1.125rem;    --leading-lg: 1.5rem;
  --text-xl: 1.375rem;    --leading-xl: 1.75rem;
  --text-2xl: 1.5rem;     --leading-2xl: 2rem;
  --text-display: 2rem;   --leading-display: 2.5rem;
  --peso-regular: 400;
  --peso-medio: 500;

  /* Espaciado (escala 4px) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 40px; --space-8: 48px;

  /* Radios */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 28px;
  --radius-full: 999px;

  /* Elevación */
  --shadow-1: 0 1px 2px rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15);
  --shadow-2: 0 1px 2px rgba(60, 64, 67, .3), 0 2px 6px 2px rgba(60, 64, 67, .15);
  --shadow-3: 0 4px 8px 3px rgba(60, 64, 67, .15), 0 1px 3px rgba(60, 64, 67, .3);

  /* Capas */
  --z-header: 100;
  --z-drawer: 200;
  --z-modal: 300;
  --z-snackbar: 400;

  /* Interacción y movimiento */
  --target-min: 48px;
  --duracion-corta: 150ms;
  --duracion-media: 250ms;
  --curva-estandar: cubic-bezier(0.2, 0, 0, 1);

  /* Layout */
  --ancho-contenedor: 1140px;
  --gutter: var(--space-4);
  --alto-header: 56px;
}

/* Mejora progresiva de tokens: solo agrega, nunca corrige la base */
@media (min-width: 768px) {
  :root {
    --gutter: var(--space-5);
    --alto-header: 64px;
  }
}

@media (min-width: 1024px) {
  :root {
    --text-2xl: 1.75rem;      --leading-2xl: 2.25rem;
    --text-display: 2.8125rem; --leading-display: 3.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duracion-corta: 0ms;
    --duracion-media: 0ms;
  }
}
```

## 3. Estrategia mobile-first con mejora progresiva

> Regla de la SPEC: la base **no** usa media queries; `@media (min-width: …)` solo agrega o mejora.
> Se prohíbe `max-width` en media queries (lo valida `stylelint`, ver TRD §5). Breakpoints únicos:
> **768px** (tablet) y **1024px** (desktop).

| Capa | Dónde aplica | Qué define |
|------|--------------|------------|
| **Base (sin media queries)** | todos los viewports, diseñado a 360px | 1 columna; header de 56px con hamburguesa + logo + acción de cuenta; drawer como navegación; grid de cards en 1 columna con gap `--space-4`; listados (mis aportes, bandeja) como **cards apiladas**; filtros del catálogo en un bloque colapsable "Filtros (n)"; paginador compacto (‹ página X de Y ›); formularios a ancho completo; botones primarios de formulario a ancho completo; snackbar inferior a ancho completo menos `--space-2`; targets ≥ 48px; `h1` 24px |
| `@media (min-width: 768px)` | tablet | header 64px; grid de cards en **2 columnas**; listados de mis aportes y bandeja como **tabla real** (`<table>` con encabezados); filtros del catálogo visibles en una fila con chips; paginador completo (‹ 1 2 3 … 9 ›); formularios en 2 columnas para campos cortos (versión + año, plataforma + categoría); botones de formulario alineados a la derecha con ancho natural; gutter 24px |
| `@media (min-width: 1024px)` | desktop | **nav horizontal** visible en el header y botón hamburguesa oculto (el drawer deja de montarse); grid de cards en **3 columnas**; contenedor `max-width: var(--ancho-contenedor)` centrado; detalle de curso en 2 columnas (contenido 2/3 + panel lateral con acciones 1/3, `position: sticky`); snackbar abajo a la izquierda con ancho 344–560px; `h1` 28px y display 45px |

**Ejemplo de patrón correcto** (tarjetas del catálogo):

```css
.grilla {                      /* base: 1 columna, sin media query */
  display: grid;
  gap: var(--space-4);
}
@media (min-width: 768px) {    /* mejora: 2 columnas */
  .grilla { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {   /* mejora: 3 columnas */
  .grilla { grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
}
```

## 4. Componentes (anatomía + estados)

> Estados transversales: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`
> para controles; `loading`, `empty`, `error` para contenedores de datos.
> **Foco universal:** `outline: 2px solid var(--color-primary); outline-offset: 2px;` en
> `:focus-visible` (nunca `outline: none` sin reemplazo).

### 4.1 Botón

| Variante | Anatomía | Uso |
|----------|----------|-----|
| **Filled (primario)** | fondo `--color-primary`, texto `--color-on-primary`, `--text-sm` peso 500, alto 40px (área táctil 48px con margen), padding `0 var(--space-5)`, `--radius-full`, icono opcional 18px a la izquierda con gap 8px | una por pantalla: "Ingresar", "Enviar a revisión", "Aprobar y publicar" |
| **Outlined (secundario)** | fondo transparente, borde 1px `--color-outline`, texto `--color-primary-dark` | "Agregar a mi roadmap", "Ver todo el catálogo" |
| **Text (terciario)** | sin fondo ni borde, texto `--color-primary-dark`, padding `0 var(--space-3)` | "Cancelar", "Limpiar filtros", links de acción |
| **Danger** | variante text u outlined con texto/borde `--color-error`; siempre con confirmación (modal) | "Rechazar", "Quitar" |
| **Icon button** | 48×48, icono 24px `--color-text-muted`, `--radius-full`, `aria-label` obligatorio | hamburguesa, cerrar, Subir/Bajar |

| Estado | Filled | Outlined / Text | Danger |
|--------|--------|-----------------|--------|
| `default` | como anatomía | como anatomía | como anatomía |
| `hover` | fondo `--color-primary-dark` + `--shadow-1` | fondo `--color-hover` | fondo `--color-error-container` |
| `focus-visible` | anillo de foco universal | ídem | ídem |
| `active` | fondo `--color-primary-dark`, sin sombra | fondo `--color-primary-container` | fondo `--color-error-container` |
| `disabled` | fondo `rgba(32,33,36,.12)`, texto `rgba(32,33,36,.38)`, `cursor: not-allowed`, `aria-disabled="true"` y sigue siendo enfocable si tiene tooltip explicativo | texto `rgba(32,33,36,.38)`, borde `rgba(32,33,36,.12)` | ídem outlined |
| `loading` | spinner circular 18px blanco en lugar del icono, texto se mantiene ("Enviando…"), `aria-busy="true"`, no clickeable | spinner `--color-primary` | spinner `--color-error` |

Transiciones de fondo y sombra en `--duracion-corta` con `--curva-estandar`.

### 4.2 Campos de formulario

**Input / textarea / select (outlined):**
- Anatomía: label **siempre visible** arriba del campo (`--text-sm` peso 500, `--color-text`;
  `*` + texto "obligatorio" para lectores en los requeridos), campo de alto 48px (textarea mín.
  120px) con fondo `--color-surface`, borde 1px `--color-outline`, `--radius-md`, padding
  `0 var(--space-4)`, texto `--text-base`; ayuda debajo en `--text-sm --color-text-muted`;
  contador a la derecha cuando hay máximo.
- Mensaje de error: debajo del campo, icono `error` 16px + texto `--text-sm --color-error`,
  vinculado con `aria-describedby` y `aria-invalid="true"` en el campo.

| Estado | Visual |
|--------|--------|
| `default` | borde 1px `--color-outline` |
| `hover` | borde 1px `--color-text` |
| `focus` | borde 2px `--color-primary` (padding compensado 1px para que no salte), label en `--color-primary-dark` |
| `filled` | igual a default, con valor en `--color-text` |
| `error` | borde 2px `--color-error`, label y mensaje `--color-error`; al enviar, foco en el resumen de errores |
| `disabled` | fondo `--color-hover`, borde `rgba(32,33,36,.12)`, texto `rgba(32,33,36,.38)` |
| `readonly` | sin borde, fondo transparente, texto `--color-text` (pantallas de estado de aporte) |

**Grupo Sí/No** (características del curso y "¿Tomaste este curso?"):
- `<fieldset>` con `<legend>` como pregunta; dos radios "Sí" y "No" **sin selección inicial**,
  cada opción con área táctil de 48px; radio de 20px con borde 2px `--color-outline`, seleccionado
  con relleno `--color-primary`.
- Estado `error` ("Elegí una opción") en el `fieldset` con `aria-describedby`.
- En ≥ 768px las opciones van en línea; en base, apiladas.

**Campo de docentes (lista dinámica):** un input por docente con icon button "Quitar" (deshabilitado
si queda uno); botón text "+ Agregar otro docente" (deshabilitado al llegar a 10, con ayuda "Máximo 10").

**Campo de contraseña:** icon button "Mostrar contraseña" / "Ocultar contraseña" (`aria-pressed`)
dentro del campo; en registro y restablecer, ayuda "Mínimo 10 caracteres" que pasa a
`--color-success` con icono `check` al cumplirse.

### 4.3 Card de curso

- **Anatomía** (de arriba hacia abajo): chip de categoría (`--color-primary-container`, texto
  `--color-primary-dark`, `--text-xs`) · título (`--text-lg`, máx. 2 líneas con
  `line-clamp`, es el link al detalle y su área cubre la card con el patrón "pseudo-elemento
  `::after` absoluto") · línea de metadatos `--text-sm --color-text-muted`: "Plataforma · Año" ·
  docentes (máx. 1 línea, "y 2 más") · fila de atributos con icono + texto `--text-xs`:
  `workspace_premium` "Certificado", `quiz` "Examen", `checklist` "Cuestionarios",
  `verified` "Aval" (solo los que son `true`; si ninguno, "Sin certificado ni examen") ·
  pie con botón outlined "Agregar a mi roadmap" o indicador.
- **Superficie:** `--color-surface`, borde 1px `--color-divider`, `--radius-lg`, `--shadow-1`
  desde 768px (en base solo borde, para reducir ruido visual), padding `--space-4`.

| Estado | Visual |
|--------|--------|
| `default` | como anatomía |
| `hover` (dispositivos con `hover: hover`) | `--shadow-2`, título subrayado |
| `focus-visible` (en el link del título) | anillo de foco universal alrededor de toda la card (`:focus-within`) |
| `en mi roadmap` | borde 2px `--color-primary`, pie con icono `check_circle` `--color-primary-dark` + "En tu roadmap" (texto, no botón) |
| `agregando` | botón en estado `loading` |
| `skeleton` | bloques `--color-hover` con las mismas medidas (chip 80×20, título 2 líneas, metadatos 1 línea, atributos 1 línea), sin botón |

### 4.4 Lista/tabla paginada y paginador

- **Base (< 768px):** cada fila es una card apilada con los mismos datos en formato
  "etiqueta: valor"; acción principal como botón text al pie. Nunca scroll horizontal.
- **≥ 768px:** `<table>` con `<caption>` (visualmente oculto si el `h1` ya lo dice), encabezados
  `<th scope="col">` en `--text-sm` peso 500 `--color-text-muted`, filas de 52px con divisor
  `--color-divider`, hover `--color-hover`; la columna de acción alineada a la derecha.
- **Contador:** "1–20 de 137" (`--text-sm --color-text-muted`) arriba a la derecha del listado.
- **Paginador** (`<nav aria-label="Paginación">`):
  - Base: icon button "Página anterior", texto "Página 3 de 7", icon button "Página siguiente".
  - ≥ 768px: ‹ 1 … 4 **5** 6 … 9 › con botones circulares de 40px (área 48px); página actual
    con fondo `--color-primary-container`, texto `--color-primary-dark`, `aria-current="page"`;
    se muestran primera, última y ±1 alrededor de la actual.
  - Extremos deshabilitados (`aria-disabled`); al cambiar de página, scroll al inicio del listado
    y foco en su encabezado.
- **Estados del contenedor:** `loading` (skeleton de 5 filas/cards) · `cargando otra página`
  (contenido anterior con `opacity: .6` + barra de progreso lineal de 4px `--color-primary` bajo
  el header) · `empty` (§4.9) · `error` (§4.9) · `fuera de rango` ("Esta página no existe" + "Ir a la página 1").

### 4.5 Chips y badges

| Tipo | Anatomía | Estados |
|------|----------|---------|
| **Chip de filtro** (catálogo, roadmap, mis aportes) | alto 32px (área táctil 48px), borde 1px `--color-outline`, `--radius-md`, `--text-sm` peso 500, `<button aria-pressed>` | `default` · `hover` fondo `--color-hover` · `seleccionado` fondo `--color-primary-container`, sin borde, texto `--color-primary-dark`, icono `check` 18px · `focus-visible` · `disabled` |
| **Chip de categoría** | `--color-primary-container` + `--color-primary-dark`, `--text-xs`, `--radius-sm`, no interactivo | — |
| **Chip de estado de aporte** | icono 16px + texto `--text-xs` peso 500 `--color-text`, `--radius-sm` | `En revisión`: fondo `--color-warning-container`, icono `schedule` `--color-warning` · `Publicado`: `--color-success-container`, icono `check_circle` `--color-success` · `Rechazado`: `--color-error-container`, icono `cancel` `--color-error` |
| **Chip de estado de avance** | igual al anterior | `Pendiente`: fondo `--color-hover`, icono `radio_button_unchecked` `--color-text-muted` · `En progreso`: `--color-warning-container`, icono `timelapse` `--color-warning` · `Completado`: `--color-success-container`, icono `task_alt` `--color-success` |

El estado siempre se comunica con **icono + texto**, nunca solo con color.

### 4.6 Menú sándwich (drawer)

- **Disparador:** icon button `menu` 48×48 a la izquierda del header, visible en < 1024px,
  `aria-label="Abrir menú"`, `aria-expanded="false|true"`, `aria-controls="menu-lateral"`.
- **Panel:** `<nav id="menu-lateral" aria-label="Principal">` dentro de un contenedor con
  `role="dialog"` y `aria-modal="true"`; ancho `min(320px, 85vw)`, alto 100dvh, fondo
  `--color-surface`, `--shadow-3`, radio `0 16px 16px 0`, entra desde la izquierda con
  `transform: translateX(-100%) → 0` en `--duracion-media`; scrim `--color-scrim` detrás.
- **Contenido:** encabezado con logo + icon button `close` ("Cerrar menú"); bloque de cuenta
  (nombre y email, o botón "Ingresar"); ítems de navegación de APPFlow §3.0 con icono 24px +
  texto `--text-sm` peso 500, alto 56px, `--radius-full` en el fondo del ítem activo
  (`--color-primary-container`, texto e icono `--color-primary-dark`, `aria-current="page"`);
  separador `--color-divider`; "Cerrar sesión" al final.

| Estado | Comportamiento |
|--------|----------------|
| `cerrado` | panel fuera de pantalla con `visibility: hidden` (no recibe foco ni lo lee el lector), `aria-expanded="false"` |
| `abriendo / abierto` | `aria-expanded="true"`; foco al primer ítem; **focus trap** (Tab y Shift+Tab ciclan dentro del panel); `inert` en el resto de la página; scroll del body bloqueado |
| `cerrando` | se dispara con: click/tap en un ítem, botón cerrar, tecla `ESC`, click en el scrim; el foco vuelve al botón hamburguesa |
| `≥ 1024px` | el disparador y el drawer no se renderizan; la nav es horizontal en el header |

### 4.7 Modal (diálogo)

- Elemento `<dialog>` nativo abierto con `showModal()` (focus trap y `ESC` nativos), con
  `aria-labelledby` (título) y `aria-describedby` (texto).
- Anatomía: ancho `min(560px, calc(100vw - 32px))`, padding `--space-5`, `--radius-xl`,
  `--shadow-3`, scrim `--color-scrim`; título `--text-xl`; cuerpo `--text-base --color-text-muted`;
  acciones alineadas a la derecha: text "Cancelar" + acción (filled, o danger en confirmaciones destructivas).
- **Usos:** "¿Quitar de tu roadmap?", "¿Descartar el aporte?", "Rechazar aporte" (con textarea de motivo).
- Estados: `cerrado` · `abierto` (foco en el primer control; en confirmaciones destructivas, foco
  en "Cancelar") · `procesando` (acción en `loading`, "Cancelar" deshabilitado, `ESC` ignorado) ·
  `error` (mensaje de error dentro del modal, sin cerrarlo). Al cerrar, el foco vuelve al disparador.

### 4.8 Snackbar

- Fondo `--color-snackbar`, texto blanco `--text-sm`, `--radius-md`, `--shadow-3`, padding
  `--space-3 --space-4`, alto mín. 48px; acción opcional en botón text `--color-snackbar-action`;
  icono de cierre opcional.
- Posición: base → abajo, ancho completo con margen `--space-2`, por encima de la barra de gestos
  (`env(safe-area-inset-bottom)`); ≥ 1024px → abajo a la izquierda, ancho 344–560px.
- Región `role="status"` y `aria-live="polite"` (éxito/info); los errores usan `role="alert"`.
- Tipos: **éxito** (icono `check_circle` `#81c995` sobre oscuro), **error** (icono `error`
  `#f28b82`), **info** (sin icono). Duración: 5 s; 8 s si tiene acción; se pausa con hover o foco.
- Uno a la vez: uno nuevo reemplaza al anterior.

### 4.9 Skeleton, empty state y banner de error

- **Skeleton:** bloques `--color-hover` con `--radius-sm`, misma geometría que el contenido final
  (evita saltos de layout); animación shimmer de 1.5 s desactivada con `prefers-reduced-motion`;
  contenedor con `aria-busy="true"` y texto oculto "Cargando…".
- **Empty state:** centrado, icono Material Symbols 48px `--color-text-muted`, título `--text-lg`,
  bajada `--text-sm --color-text-muted` (máx. 2 líneas), CTA filled o outlined. Textos por pantalla
  en APPFlow §3 (ej. "Tu roadmap está vacío" → "Explorar el catálogo").
- **Banner de error:** bloque a ancho completo del contenedor, fondo `--color-error-container`,
  icono `error` `--color-error`, texto `--color-text`, botón text "Reintentar"; `role="alert"`.
  Variante de formulario (login, rate limit) con cuenta regresiva "Probá de nuevo en 42 s".

### 4.10 Ítem de roadmap

- Card horizontal: número de orden en círculo de 32px (`--color-primary-container` /
  `--color-primary-dark`) · título (link al detalle) + "Plataforma · Categoría" · select de estado
  (`<select>` nativo estilizado, label "Estado de {título}" para lectores) · grupo de icon buttons
  `arrow_upward` "Subir {título}", `arrow_downward` "Bajar {título}", `delete` "Quitar {título}".
- Base: el bloque de controles va debajo del título, en una fila; ≥ 768px: todo en una fila.
- Estados: `default` · `actualizando` (select deshabilitado + spinner 16px) · `completado` (chip
  "Completado" y fecha "Terminado el 12/11/2026") · `moviendo` (botones deshabilitados) ·
  extremos (Subir deshabilitado en el 1.º, Bajar en el último) · `filtro activo` (Subir/Bajar
  deshabilitados con tooltip "Quitá el filtro para reordenar").
- Tras mover, un `aria-live="polite"` anuncia "{título} movido a la posición {n}".

## 5. Layout y navegación

- **Header:** `position: sticky; top: 0`, fondo `--color-surface`, alto `--alto-header`,
  `--z-header`; sin sombra en reposo y `--shadow-1` al hacer scroll. Base: hamburguesa + logo
  "Rumbo" (wordmark `--text-xl` peso 500 con icono `explore` `--color-primary`) + a la derecha
  icon button de cuenta (avatar con inicial) o botón text "Ingresar". ≥ 1024px: logo + nav
  horizontal (links `--text-sm` peso 500 con indicador inferior de 3px `--color-primary` en la
  ruta activa) + menú de cuenta.
- **Contenedor:** `width: 100%; max-width: var(--ancho-contenedor); margin-inline: auto;
  padding-inline: var(--gutter)`; separación vertical entre secciones `--space-6` (base) /
  `--space-7` (≥ 1024px).
- **Fondo de página:** `--color-background`; las superficies blancas (cards, formularios) crean la jerarquía.
- **Formularios centrados** (login, registro, recuperar, restablecer): card de ancho máx. 448px
  centrada; en base ocupa todo el ancho sin borde ni sombra.
- **Pantallas** (detalle en APPFlow §3): Home con display + buscador grande estilo Google
  (input de 48px con `--radius-full`, icono `search`); Catálogo con barra de filtros + grilla;
  Detalle con layout de 1 columna → 2 columnas en desktop; Aportar como formulario de 4 secciones
  (cada una con `h2`) de ancho máx. 720px; Roadmap como lista; Moderación como tabla.
- **Skip link:** "Saltar al contenido" como primer elemento enfocable, visible solo con foco.

## 6. Accesibilidad mínima (WCAG 2.2 AA, no negociable)

- [x] Contraste de texto ≥ 4.5:1: verificado en §2.1 para todas las combinaciones de texto
      (`#202124` 16.1:1, `#5f6368` 6.05:1, links `#185abc` 6.51:1, blanco sobre `#1a73e8` 4.51:1).
- [x] Contraste de componentes ≥ 3:1 (1.4.11): bordes de control `#80868b` 3.68:1; foco `#1a73e8` 4.51:1.
- [ ] `:focus-visible` con anillo de 2px y offset en todo elemento interactivo; nunca `outline: none` sin reemplazo.
- [ ] Targets táctiles ≥ 48×48 px (2.5.8 pide 24px; adoptamos 48px de Material).
- [ ] Menú sándwich con `aria-expanded` / `aria-controls`, focus trap, `ESC` y foco restaurado.
- [ ] Modales con `<dialog>` + `showModal()`, `aria-labelledby` y foco restaurado.
- [ ] Formularios: label visible en todo campo, `fieldset/legend` en grupos Sí/No, errores con
      `aria-describedby` + `aria-invalid`, resumen de errores enfocable al enviar.
- [ ] Ninguna información solo por color (estados con icono + texto).
- [ ] `prefers-reduced-motion: reduce` anula transiciones y shimmer (tokens de duración a 0ms).
- [ ] Iconos decorativos con `aria-hidden="true"`; icon buttons con `aria-label` descriptivo e
      incluyendo el objeto ("Quitar Docker desde cero").
- [ ] Un `<h1>` por pantalla; al navegar, foco al `<h1>` y `document.title` actualizado.
- [ ] Regiones `aria-live` para snackbar, resultados de búsqueda ("37 cursos encontrados") y reordenamiento.
- [ ] `lang="es-AR"` en `<html>`; zoom al 200 % sin pérdida de contenido; sin scroll horizontal a 320px (1.4.10).
- [ ] Links externos ("Ir al curso") con texto que indica que abren en pestaña nueva (icono `open_in_new` + texto oculto).

## 7. Iconografía y assets

- **Set:** **Material Symbols Rounded** (el set de Google, coherente con la inspiración),
  self-hosted con el paquete `material-symbols` como fuente variable; ejes `FILL 0`, `wght 400`,
  `GRAD 0`, `opsz 24`; `FILL 1` solo para el ítem activo del drawer y estados seleccionados.
- **Por qué:** coherencia visual con Material, un único asset (fuente variable) en lugar de
  decenas de SVG, y self-host para no depender de CDN ni filtrar visitas a terceros.
- **Tamaños:** 18px en botones y chips, 24px en navegación, icon buttons y listas, 48px en empty states.
- **Color:** hereda `currentColor`; `--color-text-muted` para iconos informativos.
- **Iconos del dominio:** `explore` (logo), `school` (curso), `workspace_premium` (certificado),
  `quiz` (examen), `checklist` (cuestionarios), `verified` (aval), `route` (roadmap),
  `add_circle` (aportar), `fact_check` (moderación), `open_in_new` (enlace externo).
- **Imágenes:** sin fotos de stock ni thumbnails de cursos (no se scrapea nada, TRD TD-009);
  favicon y logo en SVG; empty states solo con icono.

---

**Referencias:**
- Material Design 3: https://m3.material.io/
- Material Symbols: https://fonts.google.com/icons
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- NN/g — Front-End Style Guides: https://www.nngroup.com/articles/front-end-style-guides/
