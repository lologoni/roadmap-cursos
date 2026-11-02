import { useId } from 'react'
import { MensajeError } from './MensajeError.jsx'
import estilos from './Campo.module.css'

/**
 * Pregunta Sí/No sin selección inicial (UX-UI §4.2). `valor` es true, false o null.
 * Controlado: lo usa react-hook-form a través de `Controller`.
 */
export function GrupoSiNo({ pregunta, nombre, valor, alCambiar, error, deshabilitado, id, ref }) {
  const idGenerado = useId()
  const idGrupo = id ?? idGenerado
  const idError = `${idGrupo}-error`

  return (
    <fieldset
      id={idGrupo}
      className={`${estilos.grupo} ${error ? estilos.grupoError : ''}`}
      aria-describedby={error ? idError : undefined}
      aria-invalid={error ? true : undefined}
      tabIndex={-1}
      ref={ref}
      disabled={deshabilitado}
    >
      <legend className={estilos.etiqueta}>
        {pregunta}
        <span className={estilos.obligatorio} aria-hidden="true">
          *
        </span>
        <span className="visualmenteOculto"> (obligatorio)</span>
      </legend>
      <div className={estilos.opciones}>
        {[
          { etiqueta: 'Sí', v: true },
          { etiqueta: 'No', v: false },
        ].map(({ etiqueta, v }) => (
          <label key={etiqueta} className={estilos.opcion}>
            <input
              type="radio"
              name={nombre}
              value={String(v)}
              checked={valor === v}
              onChange={() => alCambiar(v)}
            />
            {etiqueta}
          </label>
        ))}
      </div>
      {error && <MensajeError id={idError}>{error}</MensajeError>}
    </fieldset>
  )
}
