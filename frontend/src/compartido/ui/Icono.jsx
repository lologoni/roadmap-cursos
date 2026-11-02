/** Icono de Material Symbols Rounded. Decorativo por defecto (aria-hidden). */
export function Icono({ nombre, tamano = 24, relleno = false, className = '' }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      aria-hidden="true"
      style={{
        fontSize: tamano,
        fontVariationSettings: `"FILL" ${relleno ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" ${tamano}`,
      }}
    >
      {nombre}
    </span>
  )
}
