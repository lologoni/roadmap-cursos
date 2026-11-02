import { Link } from 'react-router'
import { Icono } from './Icono.jsx'
import estilos from './Boton.module.css'

/**
 * Botón de UX-UI §4.1. Variantes: filled, outlined, text, danger, icono.
 * Con `to` se renderiza como Link interno; con `href`, como enlace externo.
 */
export function Boton({
  variante = 'filled',
  icono,
  cargando = false,
  deshabilitado = false,
  anchoCompleto = false,
  to,
  href,
  children,
  className = '',
  type = 'button',
  onClick,
  ...resto
}) {
  const clases = [
    estilos.boton,
    estilos[variante],
    anchoCompleto ? estilos.anchoCompleto : '',
    cargando ? estilos.cargando : '',
    className,
  ].join(' ')

  const contenido = (
    <>
      {cargando ? (
        <span className={estilos.spinner} aria-hidden="true" />
      ) : (
        icono && <Icono nombre={icono} tamano={variante === 'icono' ? 24 : 18} />
      )}
      {children && <span>{children}</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={clases} onClick={onClick} {...resto}>
        {contenido}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={clases} onClick={onClick} {...resto}>
        {contenido}
      </a>
    )
  }

  const inactivo = deshabilitado || cargando
  return (
    <button
      type={type}
      className={clases}
      aria-disabled={inactivo || undefined}
      aria-busy={cargando || undefined}
      onClick={(evento) => {
        if (inactivo) {
          evento.preventDefault()
          return
        }
        onClick?.(evento)
      }}
      {...resto}
    >
      {contenido}
    </button>
  )
}
