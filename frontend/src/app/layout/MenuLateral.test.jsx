import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header.jsx'

function simularAncho(esEscritorio) {
  window.matchMedia = vi.fn().mockImplementation((consulta) => ({
    matches: esEscritorio,
    media: consulta,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

function renderizarHeader() {
  const raiz = document.createElement('div')
  raiz.id = 'raiz'
  document.body.appendChild(raiz)
  return render(
    <MemoryRouter>
      <Header usuario={null} cargandoSesion={false} />
    </MemoryRouter>,
    { container: raiz },
  )
}

afterEach(() => {
  cleanup()
  document.getElementById('raiz')?.remove()
})

describe('MenuLateral (drawer del menú sándwich)', () => {
  it('abre, atrapa el foco, cierra con ESC y devuelve el foco al botón', async () => {
    simularAncho(false)
    renderizarHeader()
    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveAttribute('aria-controls', 'menu-lateral')

    act(() => boton.click())
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('raiz')).toHaveAttribute('inert')

    const dialogo = screen.getByRole('dialog', { name: 'Menú principal' })
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
    const enlaces = dialogo.querySelectorAll('nav a')
    expect(document.activeElement).toBe(enlaces[0])

    // Tab desde el último enfocable vuelve al primero (focus trap)
    const enfocables = dialogo.querySelectorAll('a[href], button:not([disabled])')
    enfocables[enfocables.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(enfocables[0])

    // Shift+Tab desde el primero va al último
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(enfocables[enfocables.length - 1])

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('raiz')).not.toHaveAttribute('inert')
    await waitFor(() => expect(document.activeElement).toBe(boton))
  })

  it('cierra al tocar el scrim y al elegir un ítem', () => {
    simularAncho(false)
    renderizarHeader()
    const boton = screen.getByRole('button', { name: 'Abrir menú' })

    act(() => boton.click())
    fireEvent.click(document.querySelector('[aria-hidden="true"][class*="scrim"]'))
    expect(boton).toHaveAttribute('aria-expanded', 'false')

    act(() => boton.click())
    fireEvent.click(screen.getByRole('dialog').querySelector('nav a[href="/catalogo"]'))
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('desde 1024px no monta el drawer y muestra la navegación horizontal', () => {
    simularAncho(true)
    renderizarHeader()
    expect(screen.queryByRole('button', { name: 'Abrir menú' })).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })
})
