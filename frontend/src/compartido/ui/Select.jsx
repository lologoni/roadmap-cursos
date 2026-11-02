import { useId } from 'react'
import { MensajeError } from './MensajeError.jsx'
import estilos from './Campo.module.css'

/** Select nativo estilizado. `opciones` = [{ valor, etiqueta }]. */
export function Select({
  etiqueta,
  opciones,
  ayuda,
  error,
  obligatorio = false,
  placeholder,
  etiquetaOculta = false,
  id,
  ref,
  className = '',
  ...resto
}) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`
  const describe = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ')

  return (
    <div className={`${estilos.campo} ${className}`}>
      <label
        htmlFor={idCampo}
        className={etiquetaOculta ? 'visualmenteOculto' : estilos.etiqueta}
      >
        {etiqueta}
        {obligatorio && (
          <>
            <span className={estilos.obligatorio} aria-hidden="true">
              *
            </span>
            <span className="visualmenteOculto"> (obligatorio)</span>
          </>
        )}
      </label>
      <select
        id={idCampo}
        ref={ref}
        className={`${estilos.control} ${error ? estilos.controlError : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe || undefined}
        aria-required={obligatorio || undefined}
        {...resto}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error && <MensajeError id={idError}>{error}</MensajeError>}
      {ayuda && (
        <div className={estilos.pie}>
          <span id={idAyuda}>{ayuda}</span>
        </div>
      )}
    </div>
  )
}
