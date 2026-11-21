import './styles/global.css';
import './styles/Neumorfismo.css';
import './styles/fase1.css';
import { useStore } from './hooks/useStore';
import { TopBar } from './layout/TopBar';
import { Home } from './screens/Home';
import { DetalleProducto } from './components/DetalleProducto';
import { Checkout } from './screens/Checkout';
import { Login } from './screens/Login';
import { Registro } from './screens/Register';
import { Historial } from './screens/Historial';
import { Dashboard } from './screens/Dashboard';
import { Domicilios } from './screens/Domicilios';
import { Terminos, Privacidad } from './screens/Legal';
import { Facturas } from './screens/Facturas';
import { ConsentimientoLegal } from './components/ConsentimientoLegal';

export default function App() {
  const { pantalla, productoSeleccionadoId } = useStore();

  return (
    <div>
      <TopBar />
      {pantalla === 'HOME' && <Home />}
      {pantalla === 'LOGIN' && <Login />}
      {pantalla === 'REGISTER' && <Registro />}
      {pantalla === 'DETALLE_PRODUCTO' && <DetalleProducto productoId={productoSeleccionadoId} />}
      {pantalla === 'CHECKOUT' && <Checkout />}
      {pantalla === 'HISTORIAL' && <Historial />}
      {pantalla === 'DASHBOARD' && <Dashboard />}
      {pantalla === 'DOMICILIOS' && <Domicilios />}
      {pantalla === 'TERMINOS' && <Terminos />}
      {pantalla === 'PRIVACIDAD' && <Privacidad />}
      {pantalla === 'FACTURAS' && <Facturas />}
      <ConsentimientoLegal />
    </div>
  );
}
