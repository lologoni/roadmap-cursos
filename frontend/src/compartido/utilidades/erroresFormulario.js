/**
 * Lleva los errores por campo de un 422 (`errors[{campo, mensaje}]`) a react-hook-form.
 * Devuelve true si al menos un error se pudo ubicar en un campo del formulario.
 */
export function aplicarErroresApi(error, setError, campos) {
  const errores = error?.errors ?? []
  let ubicados = 0
  for (const { campo, mensaje } of errores) {
    const raiz = campo.split('.')[0]
    if (campos.includes(campo) || campos.includes(raiz)) {
      setError(campos.includes(campo) ? campo : raiz, { type: 'servidor', message: mensaje })
      ubicados += 1
    }
  }
  return ubicados > 0
}
