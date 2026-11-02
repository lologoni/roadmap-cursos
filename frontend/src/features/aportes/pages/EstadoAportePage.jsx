import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function EstadoAportePage() {
  useTituloPagina('Estado de mi aporte')
  return (
    <section className="contenedor">
      <h1>Estado de mi aporte</h1>
    </section>
  )
}
