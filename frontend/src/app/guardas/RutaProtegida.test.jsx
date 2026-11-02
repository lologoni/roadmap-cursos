import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RutaConRol, RutaProtegida } from './RutaProtegida.jsx'

function UbicacionActual() {
  const { pathname, search } = useLocation()
  return <p data-testid="ubicacion">{pathname + search}</p>
}

function montar(rutaInicial, usuario) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    usuario
      ? new Response(JSON.stringify(usuario), { headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ status: 401, code: 'no_autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/problem+json' },
        }),
  )
  const router = createMemoryRouter(
    [
      { path: '/login', element: <UbicacionActual /> },
      {
        element: <RutaProtegida />,
        children: [
          { path: '/roadmap', element: <h1>Mi roadmap</h1> },
          {
            element: <RutaConRol roles={['moderador', 'admin']} />,
            children: [{ path: '/moderacion', element: <h1>Bandeja</h1> }],
          },
        ],
      },
    ],
    { initialEntries: [rutaInicial] },
  )
  const clienteQuery = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={clienteQuery}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

afterEach(() => vi.restoreAllMocks())

describe('guardas de ruta', () => {
  it('sin sesión redirige a /login con la ruta original en volver', async () => {
    montar('/roadmap?estado=pendiente', null)
    const ubicacion = await screen.findByTestId('ubicacion')
    expect(ubicacion).toHaveTextContent('/login?volver=%2Froadmap%3Festado%3Dpendiente')
  })

  it('con sesión muestra la pantalla protegida', async () => {
    montar('/roadmap', { id: 1, nombre: 'Lucía', rol: 'usuario' })
    expect(await screen.findByRole('heading', { name: 'Mi roadmap' })).toBeInTheDocument()
  })

  it('sin el rol necesario muestra "No tenés permiso"', async () => {
    montar('/moderacion', { id: 1, nombre: 'Lucía', rol: 'usuario' })
    expect(
      await screen.findByText('No tenés permiso para ver esta sección'),
    ).toBeInTheDocument()
  })

  it('con rol moderador entra a la bandeja', async () => {
    montar('/moderacion', { id: 2, nombre: 'Martín', rol: 'moderador' })
    expect(await screen.findByRole('heading', { name: 'Bandeja' })).toBeInTheDocument()
  })
})
