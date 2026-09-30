import { useState } from 'react';
import { useStore } from '../store/useStore';
import { CartModal } from './CartModal';

export function TopBar() {
  const { busqueda, cambiarBusqueda, cambiarPantalla, totalItemsCarrito } = useStore();
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  return <>
    <style>{`html, body, #root { margin: 0; padding: 0; min-height: 100vh; background: #FDF6E3; } *, *::before, *::after { box-sizing: border-box; }`}</style>
    <header style={{ backgroundColor: '#E8B93E', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <h1 onClick={() => cambiarPantalla('HOME')} style={{ color: '#4A3623', margin: 0, cursor: 'pointer' }}>🐾 Mascotitas</h1>
      <input type="text" placeholder="🔍 Buscar productos..." value={busqueda} onChange={(event) => cambiarBusqueda(event.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #CCC', width: '250px' }} />
      <button onClick={() => setCarritoAbierto(true)} style={{ backgroundColor: '#E8734A', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>🛒 Carrito ({totalItemsCarrito})</button>
    </header>
    <CartModal isOpen={carritoAbierto} onClose={() => setCarritoAbierto(false)} onGoToCheckout={() => cambiarPantalla('CHECKOUT')} />
  </>;
}