import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function AportarPage() {
  useTituloPagina('Aportar curso')
  return (
    <section className="contenedor">
      <h1>Aportar un curso</h1>
    </section>
  )
}
