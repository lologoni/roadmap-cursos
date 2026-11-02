import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router'
import { Icono } from '../../compartido/ui/Icono.jsx'
import estilos from './MenuLateral.module.css'

const ENFOCABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Drawer del menú sándwich (UX-UI §4.6): role="dialog" + aria-modal, focus trap, ESC, scrim,
 * resto de la página inerte y foco devuelto al botón hamburguesa al cerrar.
 */
export function MenuLateral({ abierto, alCerrar, items, usuario, cargandoSesion, alCerrarSesion }) {
  const refPanel = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined
    const raiz = document.getElementById('raiz')
    raiz?.setAttribute('inert', '')
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = refPanel.current
    panel?.querySelector('nav a, nav button')?.focus()

    const alPresionar = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        alCerrar()
        return
      }
      if (evento.key !== 'Tab' || !panel) return
      const enfocables = [...panel.querySelectorAll(ENFOCABLES)]
      if (enfocables.length === 0) return
      const primero = enfocables[0]
      const ultimo = enfocables.at(-1)
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alPresionar)

    return () => {
      document.removeEventListener('keydown', alPresionar)
      raiz?.removeAttribute('inert')
      document.body.style.overflow = overflowPrevio
    }
  }, [abierto, alCerrar])

  return createPortal(
    <div className={`${estilos.capa} ${abierto ? estilos.abierto : ''}`}>
      <div className={estilos.scrim} onClick={alCerrar} aria-hidden="true" />
      <div
        ref={refPanel}
        className={estilos.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        <div className={estilos.encabezado}>
          <span className={estilos.logo}>
            <Icono nombre="explore" className={estilos.iconoLogo} />
            Rumbo
          </span>
          <button
            type="button"
            className={estilos.cerrar}
            aria-label="Cerrar menú"
            onClick={alCerrar}
          >
            <Icono nombre="close" />
          </button>
        </div>

        <div className={estilos.cuenta}>
          {cargandoSesion ? null : usuario ? (
            <>
              <span className={estilos.nombre}>{usuario.nombre}</span>
              <span className={estilos.email}>{usuario.email}</span>
            </>
          ) : (
            <Link to="/login" className={estilos.ingresar} onClick={alCerrar}>
              <Icono nombre="login" tamano={18} />
              Ingresar
            </Link>
          )}
        </div>

        <nav id="menu-lateral" aria-label="Principal">
          <ul className={estilos.lista}>
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.fin}
                  className={({ isActive }) =>
                    `${estilos.item} ${isActive ? estilos.activo : ''}`
                  }
                  onClick={alCerrar}
                >
                  {({ isActive }) => (
                    <>
                      <Icono nombre={item.icono} relleno={isActive} />
                      {item.texto}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          {usuario && (
            <>
              <hr className={estilos.separador} />
              <button
                type="button"
                className={estilos.item}
                onClick={() => {
                  alCerrar()
                  alCerrarSesion?.()
                }}
              >
                <Icono nombre="logout" />
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </div>,
    document.body,
  )
}
