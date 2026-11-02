import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'

export default function BandejaModeracionPage() {
  useTituloPagina('Moderación')
  return (
    <section className="contenedor">
      <h1>Bandeja de moderación</h1>
    </section>
  )
}
