/**
 * Cliente HTTP único (TRD §3.1): fetch con credenciales, parseo de problem+json en ErrorApi y
 * aviso global de sesión expirada cuando una llamada con sesión recibe 401.
 */

export const EVENTO_SESION_EXPIRADA = 'rumbo:sesion-expirada'

const BASE = '/api/v1'

export class ErrorApi extends Error {
  constructor({ status, code, title, detail, errors = [], datos = {} }) {
    super(detail || title || code)
    this.name = 'ErrorApi'
    this.status = status
    this.code = code
    this.title = title
    this.detail = detail
    this.errors = errors
    this.datos = datos
  }

  /** true si el servidor no respondió (sin conexión, DNS, CORS, etc.) */
  get esDeRed() {
    return this.status === 0
  }

  /** Mensaje de error del campo indicado, si el 422 lo trae */
  errorDeCampo(campo) {
    return this.errors.find((error) => error.campo === campo)?.mensaje
  }
}

function armarQuery(query) {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(query)) {
    if (valor === undefined || valor === null || valor === '') continue
    params.set(clave, String(valor))
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

/**
 * @param {string} ruta ruta relativa a /api/v1 (por ejemplo "/cursos")
 * @param {object} opciones { metodo, cuerpo, query, avisar401 }
 *   avisar401: si es false, un 401 no dispara el evento global (lo usan /auth/me y /auth/login)
 */
export async function pedir(ruta, { metodo = 'GET', cuerpo, query, avisar401 = true, signal } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE}${ruta}${armarQuery(query)}`, {
      method: metodo,
      credentials: 'include',
      headers: {
        Accept: 'application/json, application/problem+json',
        ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ErrorApi({
      status: 0,
      code: 'error_red',
      title: 'Sin conexión',
      detail: 'Sin conexión. Revisá tu internet.',
    })
  }

  if (respuesta.status === 204) return null

  const tipo = respuesta.headers.get('content-type') ?? ''
  const datos = tipo.includes('json') ? await respuesta.json().catch(() => null) : null

  if (!respuesta.ok) {
    const problema = datos ?? {}
    const { type: _tipo, title, status, detail, instance: _instancia, code, errors, ...extras } =
      problema
    const error = new ErrorApi({
      status: status ?? respuesta.status,
      code: code ?? 'error_desconocido',
      title,
      detail,
      errors: errors ?? [],
      datos: extras,
    })
    if (respuesta.status === 401 && avisar401) {
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA))
    }
    if (respuesta.status === 429) {
      const segundos = Number(extras.reintentar_en ?? respuesta.headers.get('Retry-After'))
      error.datos.reintentar_en = Number.isFinite(segundos) ? segundos : 60
    }
    throw error
  }

  return datos
}
