import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { aplicarErroresApi } from '../../../compartido/utilidades/erroresFormulario.js'
import { Boton } from '../../../compartido/ui/Boton.jsx'
import { CampoTexto } from '../../../compartido/ui/CampoTexto.jsx'
import { BannerError } from '../../../compartido/ui/Estados.jsx'
import { useSnackbar } from '../../../compartido/ui/Snackbar.jsx'
import { esquemaRegistro } from '../esquemas.js'
import { useRegistro } from '../hooks/useSesion.js'
import { CampoContrasena } from './CampoContrasena.jsx'
import estilos from './TarjetaAcceso.module.css'

const CAMPOS = ['nombre', 'email', 'password']

/** Formulario de registro con los estados de APPFlow §3.5. */
export function FormRegistro({ alRegistrarse }) {
  const registro = useRegistro()
  const { mostrar } = useSnackbar()
  const [limiteSuperado, setLimiteSuperado] = useState(false)
  const refBanner = useRef(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(esquemaRegistro), mode: 'onTouched' })
  const passwordActual = useWatch({ control, name: 'password' }) ?? ''

  useEffect(() => {
    if (limiteSuperado) refBanner.current?.focus()
  }, [limiteSuperado])

  const enviar = (datos) => {
    setLimiteSuperado(false)
    registro.mutate(datos, {
      onSuccess: alRegistrarse,
      onError: (error) => {
        if (error.code === 'email_duplicado') {
          setError(
            'email',
            {
              type: 'servidor',
              message: (
                <>
                  Ya existe una cuenta con ese email. <Link to="/login">Ingresar</Link>
                </>
              ),
            },
            { shouldFocus: true },
          )
        } else if (error.status === 422) {
          aplicarErroresApi(error, setError, CAMPOS)
        } else if (error.status === 429) {
          setLimiteSuperado(true)
        } else if (error.esDeRed) {
          mostrar({
            mensaje: 'Sin conexión. Revisá tu internet',
            tipo: 'error',
            accion: { texto: 'Reintentar', alHacer: () => enviar(datos) },
          })
        } else {
          mostrar({ mensaje: 'Algo salió mal. Probá de nuevo en unos minutos', tipo: 'error' })
        }
      },
    })
  }

  return (
    <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
      {limiteSuperado && (
        <BannerError ref={refBanner}>
          Demasiados registros desde esta conexión. Probá más tarde.
        </BannerError>
      )}
      <fieldset disabled={registro.isPending} className="sinBorde">
        <div className={estilos.formulario}>
          <CampoTexto
            etiqueta="Nombre"
            autoComplete="name"
            obligatorio
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <CampoTexto
            etiqueta="Email"
            type="email"
            autoComplete="email"
            obligatorio
            error={errors.email?.message}
            {...register('email')}
          />
          <CampoContrasena
            etiqueta="Contraseña"
            autoComplete="new-password"
            obligatorio
            conAyuda
            valor={passwordActual}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
      </fieldset>
      <Boton type="submit" anchoCompleto cargando={registro.isPending}>
        {registro.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
      </Boton>
    </form>
  )
}
