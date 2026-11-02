import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function RecuperarPage() {
  useTituloPagina('Recuperar contraseña')
  return (
    <section className="contenedor">
      <h1>Recuperar contraseña</h1>
    </section>
  )
}
