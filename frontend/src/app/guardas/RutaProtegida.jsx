import { Navigate, Outlet, useLocation } from 'react-router'
import { urlLogin } from '../../features/auth/hooks/useSesionExpirada.js'
import { useSesion } from '../../features/auth/hooks/useSesion.js'
import { Cargando, Skeleton } from '../../compartido/ui/Estados.jsx'
import SinPermiso from '../paginas/SinPermiso.jsx'

function EsperandoSesion() {
  return (
    <Cargando className="contenedor">
      <Skeleton ancho="40%" alto={32} />
    </Cargando>
  )
}

/**
 * Sin sesión → /login?volver=<ruta actual con query> (APPFlow §2).
 * Mientras se consulta la sesión no redirige: muestra un skeleton (APPFlow §5).
 */
export function RutaProtegida() {
  const { usuario, cargando } = useSesion()
  const { pathname, search } = useLocation()
  if (cargando) return <EsperandoSesion />
  if (!usuario) return <Navigate to={urlLogin(pathname + search)} replace />
  return <Outlet />
}

/** Sesión sin el rol necesario → pantalla "No tenés permiso". La seguridad real está en la API. */
export function RutaConRol({ roles }) {
  const { usuario, cargando } = useSesion()
  if (cargando) return <EsperandoSesion />
  if (!usuario || !roles.includes(usuario.rol)) return <SinPermiso />
  return <Outlet />
}
