import { Icono } from './Icono.jsx'
import estilos from './Chip.module.css'

/** Chip de filtro (UX-UI §4.5): botón con aria-pressed. */
export function ChipFiltro({ seleccionado, onClick, children, deshabilitado = false }) {
  return (
    <button
      type="button"
      className={`${estilos.filtro} ${seleccionado ? estilos.seleccionado : ''}`}
      aria-pressed={seleccionado}
      disabled={deshabilitado}
      onClick={onClick}
    >
      {seleccionado && <Icono nombre="check" tamano={18} />}
      {children}
    </button>
  )
}

/** Chip de categoría, no interactivo. */
export function ChipCategoria({ children }) {
  return <span className={estilos.categoria}>{children}</span>
}

const ESTADOS = {
  en_revision: { texto: 'En revisión', icono: 'schedule', tono: 'advertencia' },
  publicado: { texto: 'Publicado', icono: 'check_circle', tono: 'exito' },
  rechazado: { texto: 'Rechazado', icono: 'cancel', tono: 'error' },
  pendiente: { texto: 'Pendiente', icono: 'radio_button_unchecked', tono: 'neutro' },
  en_progreso: { texto: 'En progreso', icono: 'timelapse', tono: 'advertencia' },
  completado: { texto: 'Completado', icono: 'task_alt', tono: 'exito' },
}

/** Chip de estado de aporte o de avance: siempre icono + texto. */
export function ChipEstado({ estado, grande = false }) {
  const datos = ESTADOS[estado] ?? { texto: estado, icono: 'help', tono: 'neutro' }
  return (
    <span className={`${estilos.estado} ${estilos[datos.tono]} ${grande ? estilos.grande : ''}`}>
      <Icono nombre={datos.icono} tamano={grande ? 20 : 16} className={estilos.iconoEstado} />
      {datos.texto}
    </span>
  )
}
