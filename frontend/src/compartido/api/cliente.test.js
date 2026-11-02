import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, EVENTO_SESION_EXPIRADA, pedir } from './cliente.js'

function respuesta(status, cuerpo, headers = {}) {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/problem+json', ...headers },
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('cliente HTTP', () => {
  it('envía credenciales y devuelve el JSON en respuestas ok', async () => {
    const espia = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response('{"estado":"ok"}', { headers: { 'Content-Type': 'application/json' } }),
      )
    const datos = await pedir('/health', { query: { page: 1, q: '' } })
    expect(datos).toEqual({ estado: 'ok' })
    const [url, opciones] = espia.mock.calls[0]
    expect(url).toBe('/api/v1/health?page=1')
    expect(opciones.credentials).toBe('include')
  })

  it('un 422 expone status, code y errors por campo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      respuesta(422, {
        status: 422,
        code: 'validacion_fallida',
        title: 'Los datos enviados no son válidos',
        errors: [{ campo: 'page_size', mensaje: 'Debe ser menor o igual a 100.' }],
      }),
    )
    const error = await pedir('/categorias').catch((e) => e)
    expect(error).toBeInstanceOf(ErrorApi)
    expect(error.status).toBe(422)
    expect(error.code).toBe('validacion_fallida')
    expect(error.errorDeCampo('page_size')).toBe('Debe ser menor o igual a 100.')
  })

  it('un 401 dispara el evento global de sesión expirada, salvo que se pida lo contrario', async () => {
    const oyente = vi.fn()
    window.addEventListener(EVENTO_SESION_EXPIRADA, oyente)
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      respuesta(401, { status: 401, code: 'no_autenticado' }),
    )

    await pedir('/roadmap/items').catch(() => {})
    expect(oyente).toHaveBeenCalledTimes(1)

    await pedir('/auth/me', { avisar401: false }).catch(() => {})
    expect(oyente).toHaveBeenCalledTimes(1)
    window.removeEventListener(EVENTO_SESION_EXPIRADA, oyente)
  })

  it('distingue un error de red de un error HTTP', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await pedir('/cursos').catch((e) => e)
    expect(error.esDeRed).toBe(true)
    expect(error.status).toBe(0)
    expect(error.code).toBe('error_red')
  })

  it('un 429 trae reintentar_en en segundos', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      respuesta(429, { status: 429, code: 'demasiados_intentos', reintentar_en: 42 }),
    )
    const error = await pedir('/auth/login', { metodo: 'POST', cuerpo: {} }).catch((e) => e)
    expect(error.status).toBe(429)
    expect(error.datos.reintentar_en).toBe(42)
  })

  it('204 devuelve null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    expect(await pedir('/auth/logout', { metodo: 'POST' })).toBeNull()
  })
})
