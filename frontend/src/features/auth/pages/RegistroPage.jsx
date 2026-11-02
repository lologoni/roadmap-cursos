import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function RegistroPage() {
  useTituloPagina('Crear cuenta')
  return (
    <section className="contenedor">
      <h1>Creá tu cuenta</h1>
    </section>
  )
}
