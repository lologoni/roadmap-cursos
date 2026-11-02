import { useState } from 'react'
import { CampoTexto } from '../../../compartido/ui/CampoTexto.jsx'
import { Icono } from '../../../compartido/ui/Icono.jsx'
import estilos from './CampoContrasena.module.css'

const MINIMO = 10

/**
 * Contraseña con botón mostrar/ocultar (UX-UI §4.2). Con `conAyuda`, muestra "Mínimo 10
 * caracteres" (que pasa a verde al cumplirse) y un medidor de largo.
 */
export function CampoContrasena({ conAyuda = false, valor = '', ...resto }) {
  const [visible, setVisible] = useState(false)
  const largo = valor.length
  const cumple = largo >= MINIMO

  const ayuda = conAyuda ? (
    <span className={`${estilos.ayuda} ${cumple ? estilos.cumple : ''}`}>
      {cumple && <Icono nombre="check" tamano={16} />}
      Mínimo {MINIMO} caracteres
      <span className={estilos.medidor} aria-hidden="true">
        <span style={{ width: `${Math.min(100, (largo / 16) * 100)}%` }} />
      </span>
    </span>
  ) : undefined

  return (
    <CampoTexto
      type={visible ? 'text' : 'password'}
      ayuda={ayuda}
      sufijo={
        <button
          type="button"
          className={estilos.ojo}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <Icono nombre={visible ? 'visibility_off' : 'visibility'} />
        </button>
      }
      {...resto}
    />
  )
}
