const FORMATO = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
})

/** ISO 8601 de la API → "dd/mm/aaaa" (RNF-012). */
export function formatearFecha(iso) {
  if (!iso) return ''
  return FORMATO.format(new Date(iso))
}
