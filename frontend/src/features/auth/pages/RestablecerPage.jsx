import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function RestablecerPage() {
  useTituloPagina('Nueva contraseña')
  return (
    <section className="contenedor">
      <h1>Elegí una contraseña nueva</h1>
    </section>
  )
}
