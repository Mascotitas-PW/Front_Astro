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

  return <>
    <style>{`html, body, #root { margin: 0; padding: 0; min-height: 100vh; background: #FDF6E3; } *, *::before, *::after { box-sizing: border-box; }`}</style>
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 bg-[#F5EBD1] px-4 py-3 shadow-[0_6px_14px_#D6C49A] lg:px-10">
  <a href="#" onClick={(e) => { e.preventDefault(); cambiarPantalla('HOME'); }} className="flex items-center gap-3">
    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Mascotitas" className="h-12 w-auto" />
    <span className="logo text-2xl text-[#4A3623]">Mascotitas</span>
  </a>
  <input className="neu-inset order-last w-full max-w-sm rounded-full px-5 py-2 sm:order-none" /* value/onChange como ya los tienes */ />
  <nav className="flex flex-wrap gap-3">
    {/* tus botones, cada uno con className="neu-btn" */}
  </nav>
</header>
    <CartModal isOpen={carritoAbierto} onClose={() => setCarritoAbierto(false)} onGoToCheckout={() => cambiarPantalla('CHECKOUT')} />
  </>;
}