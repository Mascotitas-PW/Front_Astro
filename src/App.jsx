import { useStore } from './store/useStore';
import { TopBar } from './layout/TopBar';
import { Home } from './screens/Home';
import { DetalleProducto } from './components/DetalleProducto';
import { Checkout } from './screens/Checkout';
import {Login} from './screens/Login';
import { Registro } from './screens/Register';

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
    </div>
  );
}