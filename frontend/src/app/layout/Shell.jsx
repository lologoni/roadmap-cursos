import { useSyncExternalStore } from 'react'
import { Outlet } from 'react-router'
import { useFocoAlNavegar } from '../../compartido/hooks/useFocoAlNavegar.js'
import { Icono } from '../../compartido/ui/Icono.jsx'
import { Header } from './Header.jsx'
import estilos from './Shell.module.css'

function useEnLinea() {
  return useSyncExternalStore(
    (avisar) => {
      window.addEventListener('online', avisar)
      window.addEventListener('offline', avisar)
      return () => {
        window.removeEventListener('online', avisar)
        window.removeEventListener('offline', avisar)
      }
    },
    () => navigator.onLine,
    () => true,
  )
}

/** Shell presente en todas las pantallas (APPFlow §3.0). */
export function Shell({ usuario = null, cargandoSesion = false, menuCuenta, alCerrarSesion }) {
  useFocoAlNavegar()
  const enLinea = useEnLinea()

  return (
    <>
      <a href="#contenido" className={estilos.saltar}>
        Saltar al contenido
      </a>
      <Header
        usuario={usuario}
        cargandoSesion={cargandoSesion}
        menuCuenta={menuCuenta}
        alCerrarSesion={alCerrarSesion}
      />
      {!enLinea && (
        <div className={estilos.sinConexion} role="status">
          <Icono nombre="cloud_off" tamano={18} />
          Sin conexión. Reintentando…
        </div>
      )}
      <main id="contenido" className={estilos.principal} tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
