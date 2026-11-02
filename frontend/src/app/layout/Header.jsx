import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useMediaQuery } from '../../compartido/hooks/useMediaQuery.js'
import { Icono } from '../../compartido/ui/Icono.jsx'
import estilos from './Header.module.css'
import { MenuLateral } from './MenuLateral.jsx'
import { itemsNavegacion } from './navegacion.js'

/**
 * Header sticky (UX-UI §5). Base: hamburguesa + logo + cuenta.
 * Desde 1024px: nav horizontal y el drawer deja de montarse.
 */
export function Header({ usuario, cargandoSesion, menuCuenta, alCerrarSesion }) {
  const esEscritorio = useMediaQuery('(min-width: 1024px)')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [conSombra, setConSombra] = useState(false)
  const refHamburguesa = useRef(null)
  const items = itemsNavegacion(usuario)

  useEffect(() => {
    const alScrollear = () => setConSombra(window.scrollY > 0)
    alScrollear()
    window.addEventListener('scroll', alScrollear, { passive: true })
    return () => window.removeEventListener('scroll', alScrollear)
  }, [])

  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false)
    // El foco vuelve al disparador (UX-UI §4.6)
    requestAnimationFrame(() => refHamburguesa.current?.focus())
  }, [])

  return (
    <header className={`${estilos.header} ${conSombra ? estilos.conSombra : ''}`}>
      <div className={`contenedor ${estilos.barra}`}>
        {!esEscritorio && (
          <button
            ref={refHamburguesa}
            type="button"
            className={estilos.hamburguesa}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            aria-controls="menu-lateral"
            onClick={() => setMenuAbierto(true)}
          >
            <Icono nombre="menu" />
          </button>
        )}

        <Link to="/" className={estilos.logo} aria-label="Rumbo, ir al inicio">
          <Icono nombre="explore" className={estilos.iconoLogo} />
          <span aria-hidden="true">Rumbo</span>
        </Link>

        {esEscritorio && (
          <nav className={estilos.nav} aria-label="Principal">
            <ul>
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.fin}
                    className={({ isActive }) =>
                      `${estilos.enlace} ${isActive ? estilos.activo : ''}`
                    }
                  >
                    {item.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={estilos.cuenta}>
          {cargandoSesion ? null : usuario ? (
            menuCuenta
          ) : (
            <Link to="/login" className={estilos.ingresar}>
              Ingresar
            </Link>
          )}
        </div>
      </div>

      {!esEscritorio && (
        <MenuLateral
          abierto={menuAbierto}
          alCerrar={cerrarMenu}
          items={items}
          usuario={usuario}
          cargandoSesion={cargandoSesion}
          alCerrarSesion={alCerrarSesion}
        />
      )}
    </header>
  )
}
