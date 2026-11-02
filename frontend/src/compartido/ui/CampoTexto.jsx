import { useId } from 'react'
import { MensajeError } from './MensajeError.jsx'
import estilos from './Campo.module.css'

/**
 * Input o textarea outlined (UX-UI §4.2) con label visible, ayuda, error y contador.
 * Acepta `ref` y el resto de props del control, así funciona con `register` de react-hook-form.
 */
export function CampoTexto({
  etiqueta,
  ayuda,
  error,
  obligatorio = false,
  multilinea = false,
  contador,
  sufijo,
  id,
  ref,
  className = '',
  ...resto
}) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idAyuda = `${idCampo}-ayuda`
  const idError = `${idCampo}-error`
  const describe = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ')

  const Control = multilinea ? 'textarea' : 'input'
  const clasesControl = [
    estilos.control,
    sufijo ? estilos.conSufijo : '',
    error ? estilos.controlError : '',
  ].join(' ')

  return (
    <div className={`${estilos.campo} ${className}`}>
      <label htmlFor={idCampo} className={estilos.etiqueta}>
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
      <div className={estilos.envoltura}>
        <Control
          id={idCampo}
          ref={ref}
          className={clasesControl}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe || undefined}
          aria-required={obligatorio || undefined}
          {...resto}
        />
        {sufijo && <span className={estilos.sufijo}>{sufijo}</span>}
      </div>
      {error && <MensajeError id={idError}>{error}</MensajeError>}
      {(ayuda || contador) && (
        <div className={estilos.pie}>
          {ayuda && <span id={idAyuda}>{ayuda}</span>}
          {contador && (
            <span className={estilos.contador} aria-live="polite">
              {contador.actual}/{contador.max}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
