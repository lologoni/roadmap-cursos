import { useCallback, useEffect, useState } from 'react'

/** Segundos restantes de una espera (rate limit). `iniciar(n)` arranca; llega a 0 y se detiene. */
export function useCuentaRegresiva() {
  const [restantes, setRestantes] = useState(0)

  useEffect(() => {
    if (restantes <= 0) return undefined
    const id = setTimeout(() => setRestantes((valor) => valor - 1), 1000)
    return () => clearTimeout(id)
  }, [restantes])

  const iniciar = useCallback((segundos) => setRestantes(Math.max(0, Math.ceil(segundos))), [])

  return { restantes, activa: restantes > 0, iniciar }
}
