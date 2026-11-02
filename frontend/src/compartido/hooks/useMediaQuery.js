import { useSyncExternalStore } from 'react'

/** true mientras la media query se cumple; se actualiza al redimensionar. */
export function useMediaQuery(consulta) {
  return useSyncExternalStore(
    (avisar) => {
      const lista = window.matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}
