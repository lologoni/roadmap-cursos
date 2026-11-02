import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { EVENTO_SESION_EXPIRADA } from '../../../compartido/api/cliente.js'
import { useSnackbar } from '../../../compartido/ui/Snackbar.jsx'
import { CLAVE_SESION } from './useSesion.js'

/** Ruta a la que se vuelve después del login: solo rutas internas (APPFlow §2). */
export function rutaVolverSegura(valor, porDefecto = '/roadmap') {
  if (typeof valor !== 'string' || !valor.startsWith('/') || valor.startsWith('//')) {
    return porDefecto
  }
  return valor
}

export function urlLogin(ruta) {
  return `/login?volver=${encodeURIComponent(ruta)}`
}

/**
 * Manejo global del 401 (APPFlow §5): si había sesión, se limpia, se avisa con un snackbar y se
 * lleva al login conservando la ruta actual. Las pantallas que necesitan guardar algo antes
 * (borrador del aporte) escuchan el mismo evento.
 */
export function useSesionExpirada() {
  const clienteQuery = useQueryClient()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { mostrar } = useSnackbar()
  const refUbicacion = useRef(ubicacion)

  useEffect(() => {
    refUbicacion.current = ubicacion
  }, [ubicacion])

  useEffect(() => {
    const alExpirar = () => {
      if (!clienteQuery.getQueryData(CLAVE_SESION)) return
      clienteQuery.setQueryData(CLAVE_SESION, null)
      mostrar({ mensaje: 'Tu sesión expiró. Ingresá de nuevo', tipo: 'info' })
      const { pathname, search } = refUbicacion.current
      navegar(urlLogin(pathname + search), { replace: true })
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  }, [clienteQuery, navegar, mostrar])
}
