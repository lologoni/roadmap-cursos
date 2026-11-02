import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'
import { useSnackbar } from '../../../compartido/ui/Snackbar.jsx'
import { FormRegistro } from '../components/FormRegistro.jsx'
import { TarjetaAcceso } from '../components/TarjetaAcceso.jsx'
import { useSesion } from '../hooks/useSesion.js'
import { rutaVolverSegura } from '../hooks/useSesionExpirada.js'

/** Registro (APPFlow §3.5). Con sesión redirige a /roadmap. */
export default function RegistroPage() {
  useTituloPagina('Crear cuenta')
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const { mostrar } = useSnackbar()
  const { usuario, cargando } = useSesion()
  const volver = rutaVolverSegura(parametros.get('volver'))

  if (!cargando && usuario) return <Navigate to={volver} replace />

  return (
    <TarjetaAcceso
      titulo="Creá tu cuenta"
      bajada="Armá tu roadmap y aportá cursos a la comunidad."
      pie={
        <span>
          ¿Ya tenés cuenta? <Link to="/login">Ya tengo cuenta</Link>
        </span>
      }
    >
      <FormRegistro
        alRegistrarse={() => {
          mostrar({ mensaje: '¡Bienvenida/o a Rumbo!', tipo: 'exito' })
          navegar(volver, { replace: true })
        }}
      />
    </TarjetaAcceso>
  )
}
