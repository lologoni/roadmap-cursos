import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function HomePage() {
  useTituloPagina('Inicio')
  return (
    <section className="contenedor">
      <h1>Cursos gratuitos curados por la comunidad</h1>
    </section>
  )
}
