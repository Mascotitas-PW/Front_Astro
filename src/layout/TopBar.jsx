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

  const actual = (nombre) => (pantalla === nombre ? 'page' : undefined);

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="topbar">
        <button type="button" className="topbar-logo" onClick={() => cambiarPantalla('HOME')}>
          Mascotitas
        </button>

        <div className="topbar-search" role="search">
          <label htmlFor="buscador" className="sr-only">Buscar productos</label>
          <input
            id="buscador"
            type="search"
            name="busqueda"
            autoComplete="off"
            value={busqueda}
            onChange={(e) => buscar(e.target.value)}
            placeholder="Buscar productos..."
          />
        </div>

        <nav className="topbar-nav" aria-label="Navegación principal">
          {usuario && (
            <button
              type="button"
              className="neu-btn"
              aria-current={actual('HISTORIAL')}
              onClick={() => cambiarPantalla('HISTORIAL')}
            >
              {esAdmin ? 'Historial de compras' : 'Mi historial de compras'}
            </button>
          )}
          {esAdmin && (
            <button
              type="button"
              className="neu-btn"
              aria-current={actual('DASHBOARD')}
              onClick={() => cambiarPantalla('DASHBOARD')}
            >
              Dashboard
            </button>
          )}
          <button
            type="button"
            className="neu-btn neu-btn-primary"
            aria-haspopup="dialog"
            onClick={() => setCarritoAbierto(true)}
          >
            Carrito ({totalItemsCarrito})
          </button>
          {usuario ? (
            <button type="button" className="neu-btn" onClick={cerrarSesion}>Salir</button>
          ) : (
            <button type="button" className="neu-btn" aria-current={actual('LOGIN')} onClick={() => cambiarPantalla('LOGIN')}>
              Iniciar sesión
            </button>
          )}
        </nav>

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {totalItemsCarrito === 1 ? '1 producto en el carrito' : `${totalItemsCarrito} productos en el carrito`}
        </span>
      </header>

      <CartModal
        isOpen={carritoAbierto}
        onClose={() => setCarritoAbierto(false)}
        onGoToCheckout={() => cambiarPantalla('CHECKOUT')}
      />
    </>
  );
}