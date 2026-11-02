import { createBrowserRouter } from 'react-router'
import AportarPage from '../features/aportes/pages/AportarPage.jsx'
import BandejaModeracionPage from '../features/aportes/pages/BandejaModeracionPage.jsx'
import EstadoAportePage from '../features/aportes/pages/EstadoAportePage.jsx'
import MisAportesPage from '../features/aportes/pages/MisAportesPage.jsx'
import RevisionAportePage from '../features/aportes/pages/RevisionAportePage.jsx'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import RecuperarPage from '../features/auth/pages/RecuperarPage.jsx'
import RegistroPage from '../features/auth/pages/RegistroPage.jsx'
import RestablecerPage from '../features/auth/pages/RestablecerPage.jsx'
import CatalogoPage from '../features/catalogo/pages/CatalogoPage.jsx'
import DetalleCursoPage from '../features/catalogo/pages/DetalleCursoPage.jsx'
import HomePage from '../features/catalogo/pages/HomePage.jsx'
import RoadmapPage from '../features/roadmap/pages/RoadmapPage.jsx'
import { RutaConRol, RutaProtegida } from './guardas/RutaProtegida.jsx'
import { Shell } from './layout/Shell.jsx'
import NoEncontrado from './paginas/NoEncontrado.jsx'

/** Tabla de rutas de APPFlow §2. */
export const rutas = [
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalogo', element: <CatalogoPage /> },
      { path: '/catalogo/:cursoId', element: <DetalleCursoPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegistroPage /> },
      { path: '/recuperar', element: <RecuperarPage /> },
      { path: '/restablecer', element: <RestablecerPage /> },
      {
        element: <RutaProtegida />,
        children: [
          { path: '/roadmap', element: <RoadmapPage /> },
          { path: '/aportar', element: <AportarPage /> },
          { path: '/mis-aportes', element: <MisAportesPage /> },
          { path: '/mis-aportes/:aporteId', element: <EstadoAportePage /> },
          {
            element: <RutaConRol roles={['moderador', 'admin']} />,
            children: [
              { path: '/moderacion', element: <BandejaModeracionPage /> },
              { path: '/moderacion/:aporteId', element: <RevisionAportePage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NoEncontrado /> },
    ],
  },
]

export const router = createBrowserRouter(rutas)
