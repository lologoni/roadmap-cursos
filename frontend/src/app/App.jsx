import { RouterProvider } from 'react-router'
import { Proveedores } from './proveedores.jsx'
import { router } from './rutas.jsx'

export default function App() {
  return (
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>
  )
}
