import { useEffect, useId, useRef, useState } from 'react'
import { Icono } from '../../compartido/ui/Icono.jsx'
import estilos from './MenuCuenta.module.css'

/** Botón con la inicial del usuario que despliega nombre, email y "Cerrar sesión". */
export function MenuCuenta({ usuario, alCerrarSesion }) {
  const [abierto, setAbierto] = useState(false)
  const refContenedor = useRef(null)
  const refBoton = useRef(null)
  const idPanel = useId()

  useEffect(() => {
    if (!abierto) return undefined
    const alClickFuera = (evento) => {
      if (!refContenedor.current?.contains(evento.target)) setAbierto(false)
    }
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') {
        setAbierto(false)
        refBoton.current?.focus()
      }
    }
    document.addEventListener('mousedown', alClickFuera)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alClickFuera)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  return (
    <div className={estilos.contenedor} ref={refContenedor}>
      <button
        ref={refBoton}
        type="button"
        className={estilos.avatar}
        aria-label={`Cuenta de ${usuario.nombre}`}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span aria-hidden="true">{usuario.nombre.trim().charAt(0).toUpperCase()}</span>
      </button>
      {abierto && (
        <div id={idPanel} className={estilos.panel}>
          <p className={estilos.nombre}>{usuario.nombre}</p>
          <p className={estilos.email}>{usuario.email}</p>
          <button
            type="button"
            className={estilos.salir}
            onClick={() => {
              setAbierto(false)
              alCerrarSesion()
            }}
          >
            <Icono nombre="logout" tamano={20} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
