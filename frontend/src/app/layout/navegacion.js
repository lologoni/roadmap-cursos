/** Ítems de navegación del shell (APPFlow §3.0) según la sesión y el rol. */
export function itemsNavegacion(usuario) {
  const items = [
    { to: '/', texto: 'Inicio', icono: 'home', fin: true },
    { to: '/catalogo', texto: 'Catálogo', icono: 'school' },
  ]
  if (usuario) {
    items.push(
      { to: '/roadmap', texto: 'Mi roadmap', icono: 'route' },
      { to: '/aportar', texto: 'Aportar curso', icono: 'add_circle' },
      { to: '/mis-aportes', texto: 'Mis aportes', icono: 'list_alt' },
    )
    if (usuario.rol === 'moderador' || usuario.rol === 'admin') {
      items.push({ to: '/moderacion', texto: 'Moderación', icono: 'fact_check' })
    }
  }
  return items
}
