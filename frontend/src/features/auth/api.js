import { ErrorApi, pedir } from '../../compartido/api/cliente.js'

/** Usuario de la sesión o null si es visitante (un 401 acá no es un error, APPFlow §3.0). */
export async function obtenerSesion() {
  try {
    return await pedir('/auth/me', { avisar401: false })
  } catch (error) {
    if (error instanceof ErrorApi && error.status === 401) return null
    throw error
  }
}

export const iniciarSesion = (datos) =>
  pedir('/auth/login', { metodo: 'POST', cuerpo: datos, avisar401: false })

export const registrarse = (datos) => pedir('/auth/registro', { metodo: 'POST', cuerpo: datos })

export const cerrarSesion = () => pedir('/auth/logout', { metodo: 'POST', avisar401: false })

export const pedirRecuperacion = (email) =>
  pedir('/auth/recuperar', { metodo: 'POST', cuerpo: { email } })

export const restablecerPassword = (token, passwordNueva) =>
  pedir('/auth/restablecer', {
    metodo: 'POST',
    cuerpo: { token, password_nueva: passwordNueva },
  })
