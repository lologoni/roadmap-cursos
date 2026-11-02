import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function DetalleCursoPage() {
  useTituloPagina('Detalle de curso')
  return (
    <section className="contenedor">
      <h1>Detalle de curso</h1>
    </section>
  )
}
