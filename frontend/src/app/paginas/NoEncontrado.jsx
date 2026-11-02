import { useTituloPagina } from '../../compartido/hooks/useFocoAlNavegar.js'
import { Boton } from '../../compartido/ui/Boton.jsx'
import { EstadoVacio } from '../../compartido/ui/Estados.jsx'

/** Pantalla "*" (APPFlow §3.14). */
export default function NoEncontrado() {
  useTituloPagina('Página no encontrada')
  return (
    <section className="contenedor">
      <h1 className="visualmenteOculto">Página no encontrada</h1>
      <EstadoVacio icono="explore_off" titulo="No encontramos esta página">
        <Boton to="/" variante="filled">
          Ir al inicio
        </Boton>
        <Boton to="/catalogo" variante="outlined">
          Ver el catálogo
        </Boton>
      </EstadoVacio>
    </section>
  )
}
