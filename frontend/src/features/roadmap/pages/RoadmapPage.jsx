import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function RoadmapPage() {
  useTituloPagina('Mi roadmap')
  return (
    <section className="contenedor">
      <h1>Mi roadmap</h1>
    </section>
  )
}
