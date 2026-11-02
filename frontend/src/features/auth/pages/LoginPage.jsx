import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'
import { BannerInfo } from '../../../compartido/ui/Estados.jsx'
import { FormLogin } from '../components/FormLogin.jsx'
import { TarjetaAcceso } from '../components/TarjetaAcceso.jsx'
import { useSesion } from '../hooks/useSesion.js'
import { rutaVolverSegura } from '../hooks/useSesionExpirada.js'

/** Login (APPFlow §3.4). Con sesión redirige a `volver` o a /roadmap. */
export default function LoginPage() {
  useTituloPagina('Ingresar')
  const [parametros] = useSearchParams()
  const { state } = useLocation()
  const navegar = useNavigate()
  const { usuario, cargando } = useSesion()
  const volver = rutaVolverSegura(parametros.get('volver'))

  if (!cargando && usuario) return <Navigate to={volver} replace />

  return (
    <TarjetaAcceso
      titulo="Ingresá a Rumbo"
      pie={
        <>
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
          <span>
            ¿No tenés cuenta?{' '}
            <Link to={parametros.get('volver') ? `/registro?${parametros}` : '/registro'}>
              Crear cuenta
            </Link>
          </span>
        </>
      }
    >
      {state?.aviso === 'restablecida' && (
        <BannerInfo icono="check_circle">Contraseña actualizada, ingresá con la nueva.</BannerInfo>
      )}
      <FormLogin alIngresar={() => navegar(volver, { replace: true })} />
    </TarjetaAcceso>
  )
}
