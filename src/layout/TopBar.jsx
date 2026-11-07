import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { CartModal } from '../components/CartModal';

export function TopBar() {
  const { busqueda, cambiarBusqueda, cambiarPantalla, totalItemsCarrito, usuario, cerrarSesion } = useStore();
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';
  const salir = () => cerrarSesion();

  const botonSecundario = {
    backgroundColor: 'transparent', color: '#4A3623', border: '2px solid #4A3623',
    padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold',
  };
  const botonPrimario = {
    backgroundColor: '#E8734A', color: '#fff', border: '2px solid #E8734A',
    padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold',
  };

  return <>
    <style>{`html, body, #root { margin: 0; padding: 0; min-height: 100vh; background: #FDF6E3; } *, *::before, *::after { box-sizing: border-box; }`}</style>
    <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.8rem 1.5rem', background: '#F5EBD1', boxShadow: '0 6px 14px #D6C49A' }}>
      <button type="button" onClick={() => cambiarPantalla('HOME')} style={{ border: 0, background: 'transparent', color: '#4A3623', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer' }}>
        Mascotitas
      </button>
      <input
        aria-label="Buscar productos"
        value={busqueda}
        onChange={(e) => cambiarBusqueda(e.target.value)}
        placeholder="Buscar productos..."
        style={{ flex: '1 1 220px', maxWidth: 380, minWidth: 180, border: '0', borderRadius: 999, padding: '0.65rem 1rem', color: '#4A3623', background: '#FDF6E3', boxShadow: 'inset 2px 2px 6px #D6C49A' }}
      />
      <nav aria-label="Navegación principal" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button type="button" onClick={() => cambiarPantalla('HOME')} style={botonSecundario}>Inicio</button>
        {usuario && <button type="button" onClick={() => cambiarPantalla('HISTORIAL')} style={botonSecundario}>Mis compras</button>}
        {esAdmin && <button type="button" onClick={() => cambiarPantalla('DASHBOARD')} style={botonSecundario}>Administrar</button>}
        <button type="button" onClick={() => setCarritoAbierto(true)} style={botonPrimario}>Carrito ({totalItemsCarrito})</button>
        {usuario ? (
          <button type="button" onClick={salir} style={botonSecundario}>Salir</button>
        ) : (
          <button type="button" onClick={() => cambiarPantalla('LOGIN')} style={botonSecundario}>Iniciar sesión</button>
        )}
      </nav>
    </header>
    <CartModal isOpen={carritoAbierto} onClose={() => setCarritoAbierto(false)} onGoToCheckout={() => cambiarPantalla('CHECKOUT')} />
  </>;
}