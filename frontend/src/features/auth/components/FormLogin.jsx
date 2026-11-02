import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Boton } from '../../../compartido/ui/Boton.jsx'
import { CampoTexto } from '../../../compartido/ui/CampoTexto.jsx'
import { BannerError } from '../../../compartido/ui/Estados.jsx'
import { useCuentaRegresiva } from '../../../compartido/hooks/useCuentaRegresiva.js'
import { esquemaLogin } from '../esquemas.js'
import { useLogin } from '../hooks/useSesion.js'
import { CampoContrasena } from './CampoContrasena.jsx'
import estilos from './TarjetaAcceso.module.css'

/** Formulario de login con todos los estados de APPFlow §3.4. */
export function FormLogin({ alIngresar }) {
  const login = useLogin()
  const cuenta = useCuentaRegresiva()
  const [errorGeneral, setErrorGeneral] = useState(null)
  const refBanner = useRef(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(esquemaLogin), mode: 'onTouched' })

  useEffect(() => {
    if (errorGeneral) refBanner.current?.focus()
  }, [errorGeneral])

  const enviar = (datos) => {
    setErrorGeneral(null)
    login.mutate(datos, {
      onSuccess: alIngresar,
      onError: (error) => {
        if (error.status === 429) {
          cuenta.iniciar(error.datos.reintentar_en)
          setErrorGeneral('limite')
        } else if (error.status === 401) {
          setErrorGeneral('credenciales')
        } else if (error.esDeRed) {
          setErrorGeneral('red')
        } else {
          setErrorGeneral('otro')
        }
      },
    })
  }

  const mensajes = {
    credenciales: 'Email o contraseña incorrectos.',
    limite: `Demasiados intentos. Probá de nuevo en ${cuenta.restantes} segundos.`,
    red: 'Sin conexión. Revisá tu internet.',
    otro: 'Algo salió mal. Probá de nuevo en unos minutos.',
  }
  const mostrarBanner = errorGeneral && (errorGeneral !== 'limite' || cuenta.activa)

  return (
    <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
      {mostrarBanner && <BannerError ref={refBanner}>{mensajes[errorGeneral]}</BannerError>}
      <fieldset disabled={login.isPending} className="sinBorde">
        <div className={estilos.formulario}>
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
            autoComplete="current-password"
            obligatorio
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
      </fieldset>
      <Boton
        type="submit"
        anchoCompleto
        cargando={login.isPending}
        deshabilitado={cuenta.activa}
      >
        {login.isPending ? 'Ingresando…' : 'Ingresar'}
      </Boton>
    </form>
  )
}
