import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'
import { aplicarErroresApi } from '../../../compartido/utilidades/erroresFormulario.js'
import { Boton } from '../../../compartido/ui/Boton.jsx'
import { BannerError, EstadoVacio } from '../../../compartido/ui/Estados.jsx'
import { CampoContrasena } from '../components/CampoContrasena.jsx'
import { TarjetaAcceso } from '../components/TarjetaAcceso.jsx'
import estilos from '../components/TarjetaAcceso.module.css'
import { esquemaRestablecer } from '../esquemas.js'
import { useRestablecer } from '../hooks/useSesion.js'

/** Lee el token una sola vez, antes de limpiarlo de la barra de direcciones. */
function leerToken() {
  return new URLSearchParams(window.location.search).get('token')
}

/** Nueva contraseña (APPFlow §3.7). */
export default function RestablecerPage() {
  useTituloPagina('Nueva contraseña')
  const navegar = useNavigate()
  const restablecer = useRestablecer()
  const [token] = useState(leerToken)
  const [tokenInvalido, setTokenInvalido] = useState(!token)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(esquemaRestablecer), mode: 'onTouched' })
  const passwordActual = useWatch({ control, name: 'password_nueva' }) ?? ''

  useEffect(() => {
    // El token no queda en el historial ni en la barra de direcciones
    if (window.location.search.includes('token=')) {
      window.history.replaceState(window.history.state, '', window.location.pathname)
    }
  }, [])

  const enviar = ({ password_nueva: passwordNueva }) => {
    setErrorGeneral(null)
    restablecer.mutate(
      { token, passwordNueva },
      {
        onSuccess: () => navegar('/login', { replace: true, state: { aviso: 'restablecida' } }),
        onError: (error) => {
          if (error.code === 'token_invalido') setTokenInvalido(true)
          else if (error.status === 422) aplicarErroresApi(error, setError, ['password_nueva'])
          else if (error.status === 429) setErrorGeneral('Demasiados intentos. Probá más tarde.')
          else if (error.esDeRed) setErrorGeneral('Sin conexión. Revisá tu internet.')
          else setErrorGeneral('Algo salió mal. Probá de nuevo en unos minutos.')
        },
      },
    )
  }

  if (tokenInvalido) {
    return (
      <section className="contenedor">
        <h1 className="visualmenteOculto">Enlace inválido</h1>
        <EstadoVacio
          icono="link_off"
          titulo="El enlace venció o ya fue usado"
          bajada="Los enlaces de recuperación sirven una sola vez y vencen a los 30 minutos."
        >
          <Boton to="/recuperar">Pedir un enlace nuevo</Boton>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <TarjetaAcceso titulo="Elegí una contraseña nueva">
      <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        {errorGeneral && <BannerError>{errorGeneral}</BannerError>}
        <fieldset disabled={restablecer.isPending} className="sinBorde">
          <div className={estilos.formulario}>
            <CampoContrasena
              etiqueta="Nueva contraseña"
              autoComplete="new-password"
              obligatorio
              conAyuda
              valor={passwordActual}
              error={errors.password_nueva?.message}
              {...register('password_nueva')}
            />
            <CampoContrasena
              etiqueta="Repetir contraseña"
              autoComplete="new-password"
              obligatorio
              error={errors.repetir?.message}
              {...register('repetir')}
            />
          </div>
        </fieldset>
        <Boton type="submit" anchoCompleto cargando={restablecer.isPending}>
          {restablecer.isPending ? 'Guardando…' : 'Guardar contraseña'}
        </Boton>
      </form>
    </TarjetaAcceso>
  )
}
