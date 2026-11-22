import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { CartModal } from '../components/CartModal';
import { t, toggleLocale, otroIdioma } from '../i18n';

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
        <button type="button" className="topbar-logo" onClick={() => cambiarPantalla('HOME')} aria-label={t('inicio')}>
          <img src={`${import.meta.env.BASE_URL}icons/mascotitas-192.png`} alt="Mascotitas" />
        </button>

        <div className="topbar-search">
          <input
            aria-label={t('buscar')}
            value={busqueda}
            onChange={(e) => buscar(e.target.value)}
            placeholder={t('buscar')}
          />
        </div>

        <nav className="topbar-nav" aria-label={t('navPrincipal')}>
          {usuario && (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('HISTORIAL')}>
              {esAdmin ? t('historialAdmin') : t('historial')}
            </button>
          )}
          {usuario && (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('DOMICILIOS')}>
              {t('domicilios')}
            </button>
          )}
          {usuario && (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('FACTURAS')}>
              {t('facturas')}
            </button>
          )}
          {esAdmin && (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('DASHBOARD')}>
              {t('dashboard')}
            </button>
          )}
          <button type="button" className="neu-btn neu-btn-primary" onClick={() => setCarritoAbierto(true)}>
            {t('carrito')} ({totalItemsCarrito})
          </button>
          {usuario ? (
            <button type="button" className="neu-btn" onClick={cerrarSesion}>{t('salir')}</button>
          ) : (
            <button type="button" className="neu-btn" onClick={() => cambiarPantalla('LOGIN')}>{t('entrar')}</button>
          )}
         <button type="button" className="neu-btn" onClick={toggleLocale} lang={otroIdioma()}>{t('idioma')}</button>
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