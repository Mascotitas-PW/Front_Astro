import { lazy, Suspense, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { TopBar } from './layout/TopBar';
import { Home } from './screens/Home';
import Skeleton from './components/Skeleton';

const DetalleProducto = lazy(() => import('./components/DetalleProducto').then((m) => ({ default: m.DetalleProducto })));
const Checkout  = lazy(() => import('./screens/Checkout').then((m) => ({ default: m.Checkout })));
const Login     = lazy(() => import('./screens/Login').then((m) => ({ default: m.Login })));
const Registro  = lazy(() => import('./screens/Register').then((m) => ({ default: m.Registro })));
const Historial = lazy(() => import('./screens/Historial').then((m) => ({ default: m.Historial })));
const Dashboard = lazy(() => import('./screens/Dashboard').then((m) => ({ default: m.Dashboard })));

const TITULOS = {
  HOME: 'Mascotitas | Alimento, juguetes y accesorios para mascotas',
  LOGIN: 'Iniciar sesión | Mascotitas',
  REGISTER: 'Crear cuenta | Mascotitas',
  DETALLE_PRODUCTO: 'Detalle de producto | Mascotitas',
  CHECKOUT: 'Finalizar compra | Mascotitas',
  HISTORIAL: 'Historial de compras | Mascotitas',
  DASHBOARD: 'Dashboard | Mascotitas',
};

export default function App() {
  const { pantalla, productoSeleccionadoId } = useStore();

  useEffect(() => {
    document.title = TITULOS[pantalla] ?? TITULOS.HOME;
  }, [pantalla]);

  return (
    <div>
      <TopBar />
      {}
      {pantalla === 'HOME' ? (
        <Home />
      ) : (
        <main id="contenido">
          <Suspense fallback={<Skeleton />}>
            {pantalla === 'LOGIN' && <Login />}
            {pantalla === 'REGISTER' && <Registro />}
            {pantalla === 'DETALLE_PRODUCTO' && <DetalleProducto productoId={productoSeleccionadoId} />}
            {pantalla === 'CHECKOUT' && <Checkout />}
            {pantalla === 'HISTORIAL' && <Historial />}
            {pantalla === 'DASHBOARD' && <Dashboard />}
          </Suspense>
        </main>
      )}
    </div>
  );
}