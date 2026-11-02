import { useTituloPagina } from '../../compartido/hooks/useFocoAlNavegar.js'
import { Boton } from '../../compartido/ui/Boton.jsx'
import { EstadoVacio } from '../../compartido/ui/Estados.jsx'

/** Sesión sin el rol necesario (APPFlow §5, 403 sin_permiso). */
export default function SinPermiso() {
  useTituloPagina('Sin permiso')
  return (
    <section className="contenedor">
      <h1 className="visualmenteOculto">Sin permiso</h1>
      <EstadoVacio icono="block" titulo="No tenés permiso para ver esta sección">
        <Boton to="/" variante="filled">
          Ir al inicio
        </Boton>
      </EstadoVacio>
    </section>
  )
}
