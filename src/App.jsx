import { useStore } from './store/useStore';
import { TopBar } from './layout/TopBar';
import { Home } from './screens/Home';
import { DetalleProducto } from './components/DetalleProducto';
import { Checkout } from './screens/Checkout';
import {Login} from './screens/Login';
import { Register } from './screens/Register';

export default function App() {
  const { pantalla, productoSeleccionadoId } = useStore();

  return (
    <div>
      <TopBar />
      {pantalla === 'HOME' && <Home />}
      {pantalla === 'LOGIN' && <Login />}
      {pantalla === 'REGISTER' && <Register />} 
      {pantalla === 'DETALLE_PRODUCTO' && <DetalleProducto productoId={productoSeleccionadoId} />}
      {pantalla === 'CHECKOUT' && <Checkout />}
    </div>
  );
}