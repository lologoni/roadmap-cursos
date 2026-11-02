import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icono } from './Icono.jsx'
import estilos from './Snackbar.module.css'

const ContextoSnackbar = createContext(null)

/**
 * Snackbar global (UX-UI §4.8): uno a la vez, 5 s (8 s con acción), se pausa con hover o foco.
 * Uso: const { mostrar } = useSnackbar(); mostrar({ mensaje, tipo, accion: { texto, alHacer } })
 */
export function ProveedorSnackbar({ children }) {
  const [actual, setActual] = useState(null)
  const [pausado, setPausado] = useState(false)
  const temporizador = useRef(null)

  const cerrar = useCallback(() => setActual(null), [])

  const mostrar = useCallback((datos) => {
    setActual({ tipo: 'info', ...datos, id: crypto.randomUUID?.() ?? String(Date.now()) })
  }, [])

  useEffect(() => {
    if (!actual || pausado) return undefined
    temporizador.current = setTimeout(cerrar, actual.accion ? 8000 : 5000)
    return () => clearTimeout(temporizador.current)
  }, [actual, pausado, cerrar])

  const valor = useMemo(() => ({ mostrar, cerrar }), [mostrar, cerrar])

  const esError = actual?.tipo === 'error'

  return (
    <ContextoSnackbar value={valor}>
      {children}
      <div
        className={estilos.region}
        role={esError ? 'alert' : 'status'}
        aria-live={esError ? 'assertive' : 'polite'}
      >
        {actual && (
          <div
            key={actual.id}
            className={estilos.snackbar}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)}
            onBlur={() => setPausado(false)}
          >
            {actual.tipo === 'exito' && (
              <Icono nombre="check_circle" tamano={20} className={estilos.iconoExito} />
            )}
            {esError && <Icono nombre="error" tamano={20} className={estilos.iconoError} />}
            <span className={estilos.mensaje}>{actual.mensaje}</span>
            {actual.accion && (
              <button
                type="button"
                className={estilos.accion}
                onClick={() => {
                  actual.accion.alHacer()
                  cerrar()
                }}
              >
                {actual.accion.texto}
              </button>
            )}
            {actual.accionSecundaria && (
              <button
                type="button"
                className={estilos.accion}
                onClick={() => {
                  actual.accionSecundaria.alHacer()
                  cerrar()
                }}
              >
                {actual.accionSecundaria.texto}
              </button>
            )}
            <button
              type="button"
              className={estilos.cerrar}
              aria-label="Cerrar aviso"
              onClick={cerrar}
            >
              <Icono nombre="close" tamano={20} />
            </button>
          </div>
        )}
      </div>
    </ContextoSnackbar>
  )
}

export function useSnackbar() {
  const contexto = use(ContextoSnackbar)
  if (!contexto) throw new Error('useSnackbar debe usarse dentro de ProveedorSnackbar')
  return contexto
}
