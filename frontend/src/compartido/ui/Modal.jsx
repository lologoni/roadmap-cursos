import { useEffect, useId, useRef } from 'react'
import estilos from './Modal.module.css'

/**
 * Diálogo modal sobre <dialog> nativo con showModal() (UX-UI §4.7): el focus trap y ESC son
 * nativos. Mientras `procesando` es true, ESC se ignora. Al cerrar, el foco vuelve al disparador.
 */
export function Modal({ abierto, alCerrar, titulo, descripcion, children, acciones, procesando }) {
  const refDialogo = useRef(null)
  const refDisparador = useRef(null)
  const idTitulo = useId()
  const idDescripcion = useId()

  useEffect(() => {
    const dialogo = refDialogo.current
    if (!dialogo) return
    if (abierto && !dialogo.open) {
      refDisparador.current = document.activeElement
      dialogo.showModal?.()
    } else if (!abierto && dialogo.open) {
      dialogo.close()
      refDisparador.current?.focus?.()
    }
  }, [abierto])

  return (
    <dialog
      ref={refDialogo}
      className={estilos.modal}
      aria-labelledby={idTitulo}
      aria-describedby={descripcion ? idDescripcion : undefined}
      onCancel={(evento) => {
        evento.preventDefault()
        if (!procesando) alCerrar()
      }}
      onClick={(evento) => {
        // Click en el scrim (fuera del contenido) cierra, salvo que se esté procesando
        if (evento.target === refDialogo.current && !procesando) alCerrar()
      }}
    >
      <div className={estilos.contenido}>
        <h2 id={idTitulo} className={estilos.titulo}>
          {titulo}
        </h2>
        {descripcion && (
          <p id={idDescripcion} className={estilos.descripcion}>
            {descripcion}
          </p>
        )}
        {children}
        {acciones && <div className={estilos.acciones}>{acciones}</div>}
      </div>
    </dialog>
  )
}
