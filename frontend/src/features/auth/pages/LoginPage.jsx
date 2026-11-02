import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function LoginPage() {
  useTituloPagina('Ingresar')
  return (
    <section className="contenedor">
      <h1>Ingresá a Rumbo</h1>
    </section>
  )
}
