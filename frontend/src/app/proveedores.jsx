import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProveedorSnackbar } from '../compartido/ui/Snackbar.jsx'

const ESPERAS_REINTENTO = [1000, 3000]

/**
 * Las consultas se reintentan 2 veces (1 s y 3 s) solo ante errores de red o 5xx;
 * los 4xx son respuestas válidas del dominio. Las mutaciones nunca se reintentan solas (APPFlow §5).
 */
export const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (intentos, error) =>
        intentos < 2 && (error?.status === 0 || error?.status >= 500),
      retryDelay: (intento) => ESPERAS_REINTENTO[intento] ?? 3000,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: { retry: false },
  },
})

export function Proveedores({ children }) {
  return (
    <QueryClientProvider client={clienteQuery}>
      <ProveedorSnackbar>{children}</ProveedorSnackbar>
    </QueryClientProvider>
  )
}
