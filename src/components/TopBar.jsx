import { useState } from 'react';
import { useStore } from '../store/useStore';
import { CartModal } from './CartModal';
import { obtenerUsuarioSesion } from '../auth/auth';


export function TopBar() {
  const { busqueda, cambiarBusqueda, cambiarPantalla, totalItemsCarrito } = useStore();
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // sessionStorage no es reactivo: se relee en cada render del TopBar
  const usuario = obtenerUsuarioSesion();
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const botonSecundario = {
    backgroundColor: 'transparent', color: '#4A3623', border: '2px solid #4A3623',
    padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold',
  };

  return <>
    <style>{`html, body, #root { margin: 0; padding: 0; min-height: 100vh; background: #FDF6E3; } *, *::before, *::after { box-sizing: border-box; }`}</style>
    <header style={{ backgroundColor: '#E8B93E', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <h1 onClick={() => cambiarPantalla('HOME')} style={{ color: '#4A3623', margin: 0, cursor: 'pointer' }}>🐾 Mascotitas</h1>
      <input type="text" placeholder=" Buscar productos..." value={busqueda} onChange={(event) => cambiarBusqueda(event.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #CCC', width: '250px' }} />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {usuario && (
          <button onClick={() => cambiarPantalla('HISTORIAL')} style={botonSecundario}>
             {esAdmin ? 'Todas las compras' : 'Mis compras'}
          </button>
        )}
        {esAdmin && (
          <button onClick={() => cambiarPantalla('DASHBOARD')} style={botonSecundario}>
           Dashboard
          </button>
        )}
        <button onClick={() => setCarritoAbierto(true)} style={botonSecundario}>
          🛒 Carrito ({totalItemsCarrito})
        </button>
        <button onClick={() => window.location.href = `${BASE_URL}/Login/`} style={botonSecundario}>
          Login 
        </button>
      </div>
    </header>
    <CartModal isOpen={carritoAbierto} onClose={() => setCarritoAbierto(false)} onGoToCheckout={() => cambiarPantalla('CHECKOUT')} />
  </>;
}