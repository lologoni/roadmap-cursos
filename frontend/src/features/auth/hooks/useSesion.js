import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesion,
  pedirRecuperacion,
  registrarse,
  restablecerPassword,
} from '../api.js'

export const CLAVE_SESION = ['sesion']

/** Sesión actual: se consulta una vez al iniciar la app (E05). */
export function useSesion() {
  const { data, isPending } = useQuery({
    queryKey: CLAVE_SESION,
    queryFn: obtenerSesion,
    staleTime: Infinity,
    retry: false,
  })
  return { usuario: data ?? null, cargando: isPending }
}

/** Al iniciar o cerrar sesión cambian los datos personalizados: se descarta todo el cache. */
function reiniciarCache(clienteQuery, usuario) {
  clienteQuery.removeQueries({ predicate: (q) => q.queryKey[0] !== CLAVE_SESION[0] })
  clienteQuery.setQueryData(CLAVE_SESION, usuario)
}

export function useLogin() {
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: iniciarSesion,
    onSuccess: (usuario) => reiniciarCache(clienteQuery, usuario),
  })
}

export function useRegistro() {
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: registrarse,
    onSuccess: (usuario) => reiniciarCache(clienteQuery, usuario),
  })
}

export function useLogout() {
  const clienteQuery = useQueryClient()
  return useMutation({
    mutationFn: cerrarSesion,
    // Aunque la cookie ya no sea válida, del lado del cliente la sesión se cierra igual
    onSettled: () => reiniciarCache(clienteQuery, null),
  })
}

export function useRecuperar() {
  return useMutation({ mutationFn: pedirRecuperacion })
}

export function useRestablecer() {
  return useMutation({
    mutationFn: ({ token, passwordNueva }) => restablecerPassword(token, passwordNueva),
  })
}
