import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/** Actualiza document.title con el formato "Pantalla · Rumbo" (APPFlow §5). */
export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Rumbo` : 'Rumbo'
  }, [titulo])
}

/**
 * En cada cambio de ruta (no en la carga inicial) mueve el foco al <h1> de la pantalla,
 * para que los lectores de pantalla anuncien la página nueva (APPFlow §5).
 */
export function useFocoAlNavegar() {
  const { pathname } = useLocation()
  const primeraVez = useRef(true)

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    // Espera al render de la pantalla nueva
    const id = requestAnimationFrame(() => {
      const titulo = document.querySelector('main h1')
      if (titulo) {
        titulo.setAttribute('tabindex', '-1')
        titulo.focus({ preventScroll: false })
      }
    })
    window.scrollTo(0, 0)
    return () => cancelAnimationFrame(id)
  }, [pathname])
}
