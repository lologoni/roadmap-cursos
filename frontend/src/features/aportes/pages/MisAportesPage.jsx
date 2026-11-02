import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function MisAportesPage() {
  useTituloPagina('Mis aportes')
  return (
    <section className="contenedor">
      <h1>Mis aportes</h1>
    </section>
  )
}
