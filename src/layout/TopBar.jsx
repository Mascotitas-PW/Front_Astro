import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { CartModal } from '../components/CartModal';

export function TopBar() {
  const { busqueda, cambiarBusqueda, cambiarPantalla, pantalla, totalItemsCarrito, usuario, cerrarSesion } = useStore();
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const buscar = (valor) => {
    cambiarBusqueda(valor);
    if (pantalla !== 'HOME') cambiarPantalla('HOME');
  };

  return (
    <>
      <header className="topbar">
        {/* Un clic en "Mascotitas" lleva al inicio */}
        <button type="button" className="topbar-logo" onClick={() => cambiarPantalla('HOME')}>
          Mascotitas
        </button>

        <div className="topbar-search">
          <input
            aria-label="Buscar productos"
            value={busqueda}
            onChange={(e) => buscar(e.target.value)}
            placeholder="Buscar productos..."
          />
        </div>

        <nav className="topbar-nav" aria-label="Navegación principal">
          {usuario && (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('HISTORIAL')}>
              {esAdmin ? 'Historial de compras' : 'Mi historial de compras'}
            </button>
          )}
          {esAdmin && (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('DASHBOARD')}>
              Dashboard
            </button>
          )}
          <button type="button" className="neu-btn neu-btn-primary" onClick={() => setCarritoAbierto(true)}>
            Carrito ({totalItemsCarrito})
          </button>
          {usuario ? (
            <button type="button" className="neu-btn" onClick={cerrarSesion}>Salir</button>
          ) : (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('LOGIN')}>Iniciar sesión</button>
          )}
        </nav>
      </header>

      <CartModal
        isOpen={carritoAbierto}
        onClose={() => setCarritoAbierto(false)}
        onGoToCheckout={() => cambiarPantalla('CHECKOUT')}
      />
    </>
  );
}
