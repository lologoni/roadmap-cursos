import { Icono } from './Icono.jsx'
import estilos from './Estados.module.css'

/** Bloque gris con la geometría del contenido final (UX-UI §4.9). */
export function Skeleton({ ancho = '100%', alto = 16, redondeo = 'var(--radius-sm)', className = '' }) {
  return (
    <span
      className={`${estilos.skeleton} ${className}`}
      style={{ width: ancho, height: alto, borderRadius: redondeo }}
      aria-hidden="true"
    />
  )
}

/** Contenedor de skeletons con aria-busy y texto para lectores. */
export function Cargando({ children, className = '' }) {
  return (
    <div className={className} aria-busy="true">
      <span className="visualmenteOculto">Cargando…</span>
      {children}
    </div>
  )
}

export function EstadoVacio({ icono = 'inbox', titulo, bajada, children }) {
  return (
    <div className={estilos.vacio}>
      <Icono nombre={icono} tamano={48} className={estilos.iconoVacio} />
      <h2 className={estilos.tituloVacio}>{titulo}</h2>
      {bajada && <p className={estilos.bajada}>{bajada}</p>}
      {children && <div className={estilos.accionesVacio}>{children}</div>}
    </div>
  )
}

export function BannerError({ children, alReintentar, textoReintentar = 'Reintentar', ref }) {
  return (
    <div className={estilos.banner} role="alert" tabIndex={-1} ref={ref}>
      <Icono nombre="error" className={estilos.iconoBanner} />
      <div className={estilos.textoBanner}>{children}</div>
      {alReintentar && (
        <button type="button" className={estilos.reintentar} onClick={alReintentar}>
          {textoReintentar}
        </button>
      )}
    </div>
  )
}

/** Aviso informativo o de éxito con el mismo formato que el banner de error. */
export function BannerInfo({ children, icono = 'info' }) {
  return (
    <div className={`${estilos.banner} ${estilos.info}`} role="status">
      <Icono nombre={icono} className={estilos.iconoInfo} />
      <div className={estilos.textoBanner}>{children}</div>
    </div>
  )
}
