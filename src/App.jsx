import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { Home } from './components/Home';
import { DetalleProducto } from './components/DetalleProducto';
import { Checkout } from './components/Checkout';

export default function App() {
  const { pantalla, productoSeleccionadoId } = useStore();

  return (
    <div>
      <TopBar />
      {pantalla === 'HOME' && <Home />}
      {pantalla === 'DETALLE_PRODUCTO' && <DetalleProducto productoId={productoSeleccionadoId} />}
      {pantalla === 'CHECKOUT' && <Checkout />}
    </div>
  );
}