import estilos from './TarjetaAcceso.module.css'

/** Card centrada de los formularios de acceso (UX-UI §5): ancho máx. 448px; en base sin borde. */
export function TarjetaAcceso({ titulo, bajada, children, pie }) {
  return (
    <section className={`contenedor ${estilos.envoltura}`}>
      <div className={estilos.tarjeta}>
        <h1 className={estilos.titulo}>{titulo}</h1>
        {bajada && <p className={estilos.bajada}>{bajada}</p>}
        {children}
        {pie && <div className={estilos.pie}>{pie}</div>}
      </div>
    </section>
  )
}
