import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function CatalogoPage() {
  useTituloPagina('Catálogo')
  return (
    <section className="contenedor">
      <h1>Catálogo comunitario</h1>
    </section>
  )
}
