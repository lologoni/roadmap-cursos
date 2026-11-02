import { Icono } from './Icono.jsx'
import estilos from './Paginador.module.css'

/** Páginas visibles: primera, última y ±1 alrededor de la actual, con "…" en los saltos. */
export function paginasVisibles(actual, total) {
  const paginas = new Set([1, total, actual - 1, actual, actual + 1])
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const resultado = []
  for (const pagina of ordenadas) {
    const anterior = resultado.at(-1)
    if (typeof anterior === 'number' && pagina - anterior > 1) resultado.push(`salto-${pagina}`)
    resultado.push(pagina)
  }
  return resultado
}

/** Contador "1–20 de 137" para el encabezado de los listados. */
export function textoRango({ page, page_size: tamano, total }) {
  if (!total) return '0 resultados'
  const desde = (page - 1) * tamano + 1
  const hasta = Math.min(page * tamano, total)
  return `${desde}–${hasta} de ${total}`
}

/**
 * Paginador de UX-UI §4.4. En base es compacto (‹ Página X de Y ›);
 * desde 768px muestra los números de página.
 */
export function Paginador({ pagina, paginas, alCambiar }) {
  if (paginas <= 1) return null

  const irA = (destino) => {
    if (destino < 1 || destino > paginas || destino === pagina) return
    alCambiar(destino)
  }

  const flecha = (direccion) => {
    const destino = direccion === 'anterior' ? pagina - 1 : pagina + 1
    const inactivo = destino < 1 || destino > paginas
    return (
      <button
        type="button"
        className={estilos.flecha}
        aria-label={direccion === 'anterior' ? 'Página anterior' : 'Página siguiente'}
        aria-disabled={inactivo || undefined}
        onClick={() => irA(destino)}
      >
        <Icono nombre={direccion === 'anterior' ? 'chevron_left' : 'chevron_right'} />
      </button>
    )
  }

  return (
    <nav className={estilos.paginador} aria-label="Paginación">
      {flecha('anterior')}
      <span className={estilos.compacto}>
        Página {pagina} de {paginas}
      </span>
      <ol className={estilos.numeros}>
        {paginasVisibles(pagina, paginas).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`${estilos.numero} ${item === pagina ? estilos.actual : ''}`}
                aria-current={item === pagina ? 'page' : undefined}
                aria-label={`Página ${item}`}
                onClick={() => irA(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={estilos.salto} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ol>
      {flecha('siguiente')}
    </nav>
  )
}
