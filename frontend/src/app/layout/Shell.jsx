import { useSyncExternalStore } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useFocoAlNavegar } from '../../compartido/hooks/useFocoAlNavegar.js'
import { Icono } from '../../compartido/ui/Icono.jsx'
import { useSnackbar } from '../../compartido/ui/Snackbar.jsx'
import { useLogout, useSesion } from '../../features/auth/hooks/useSesion.js'
import { useSesionExpirada } from '../../features/auth/hooks/useSesionExpirada.js'
import { Header } from './Header.jsx'
import { MenuCuenta } from './MenuCuenta.jsx'
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
export function Shell() {
  useFocoAlNavegar()
  useSesionExpirada()
  const enLinea = useEnLinea()
  const { usuario, cargando } = useSesion()
  const logout = useLogout()
  const navegar = useNavigate()
  const { mostrar } = useSnackbar()

  const alCerrarSesion = () => {
    // Primero se sale de la pantalla actual: si es protegida, no debe redirigir al login
    navegar('/')
    logout.mutate(undefined, { onSettled: () => mostrar({ mensaje: 'Cerraste sesión' }) })
  }

  return (
    <>
      <a href="#contenido" className={estilos.saltar}>
        Saltar al contenido
      </a>
      <Header
        usuario={usuario}
        cargandoSesion={cargando}
        menuCuenta={usuario && <MenuCuenta usuario={usuario} alCerrarSesion={alCerrarSesion} />}
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
