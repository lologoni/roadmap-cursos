import { Icono } from './Icono.jsx'
import estilos from './Campo.module.css'

export function MensajeError({ id, children }) {
  return (
    <p id={id} className={estilos.error}>
      <Icono nombre="error" tamano={16} />
      <span>{children}</span>
    </p>
  )
}
