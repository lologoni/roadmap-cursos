import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { useCuentaRegresiva } from '../../../compartido/hooks/useCuentaRegresiva.js'
import { useTituloPagina } from '../../../compartido/hooks/useFocoAlNavegar.js'
import { Boton } from '../../../compartido/ui/Boton.jsx'
import { CampoTexto } from '../../../compartido/ui/CampoTexto.jsx'
import { BannerError, BannerInfo } from '../../../compartido/ui/Estados.jsx'
import { TarjetaAcceso } from '../components/TarjetaAcceso.jsx'
import estilos from '../components/TarjetaAcceso.module.css'
import { esquemaRecuperar } from '../esquemas.js'
import { useRecuperar } from '../hooks/useSesion.js'

/** Pedido de enlace de recuperación (APPFlow §3.6). El mensaje nunca revela si el email existe. */
export default function RecuperarPage() {
  useTituloPagina('Recuperar contraseña')
  const recuperar = useRecuperar()
  const cuenta = useCuentaRegresiva()
  const [estado, setEstado] = useState('default')
  const refAviso = useRef(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(esquemaRecuperar), mode: 'onTouched' })

  useEffect(() => {
    if (estado !== 'default') refAviso.current?.focus()
  }, [estado])

  const enviar = ({ email }) => {
    recuperar.mutate(email, {
      onSuccess: () => setEstado('enviado'),
      onError: (error) => {
        if (error.status === 429) {
          cuenta.iniciar(error.datos.reintentar_en)
          setEstado('limite')
        } else {
          setEstado(error.esDeRed ? 'red' : 'error')
        }
      },
    })
  }

  if (estado === 'enviado') {
    return (
      <TarjetaAcceso
        titulo="Revisá tu email"
        pie={<Link to="/login">Volver a ingresar</Link>}
      >
        <div ref={refAviso} tabIndex={-1}>
          <BannerInfo icono="mark_email_read">
            Si el email está registrado, te enviamos un enlace. Revisá tu bandeja y el spam. El
            enlace vence en 30 minutos.
          </BannerInfo>
        </div>
      </TarjetaAcceso>
    )
  }

  return (
    <TarjetaAcceso
      titulo="Recuperar contraseña"
      bajada="Te enviamos un enlace para elegir una contraseña nueva."
      pie={<Link to="/login">Volver a ingresar</Link>}
    >
      <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        {estado === 'limite' && cuenta.activa && (
          <BannerError ref={refAviso}>
            Demasiados intentos. Probá de nuevo en {cuenta.restantes} segundos.
          </BannerError>
        )}
        {(estado === 'red' || estado === 'error') && (
          <BannerError ref={refAviso}>
            {estado === 'red'
              ? 'Sin conexión. Revisá tu internet.'
              : 'Algo salió mal. Probá de nuevo en unos minutos.'}
          </BannerError>
        )}
        <CampoTexto
          etiqueta="Email"
          type="email"
          autoComplete="email"
          obligatorio
          disabled={recuperar.isPending}
          error={errors.email?.message}
          {...register('email')}
        />
        <Boton
          type="submit"
          anchoCompleto
          cargando={recuperar.isPending}
          deshabilitado={cuenta.activa}
        >
          {recuperar.isPending ? 'Enviando…' : 'Enviar enlace'}
        </Boton>
      </form>
    </TarjetaAcceso>
  )
}
