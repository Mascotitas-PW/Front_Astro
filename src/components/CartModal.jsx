import { useStore } from '../hooks/useStore';
import { dinero } from '../services/pedidos';
import { t } from '../i18n';

export function CartModal({ isOpen, onClose, onGoToCheckout }) {
  const { carrito, eliminarDelCarrito, actualizarCantidad, totalCarrito } = useStore();

  if (!isOpen) return null;

  return (
    <div className="cart-fondo" onClick={onClose}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="cart-cab">
            <h2>{t('Tu carrito')}</h2>
            <button className="neu-btn neu-btn-sm" onClick={onClose} aria-label={t('Cerrar carrito')}>✕</button>
          </div>

          {carrito.length === 0 ? (
            <p style={{ marginTop: '1.5rem' }}>{t('El carrito está vacío.')}</p>
          ) : (
            <div className="cart-lista">
              {carrito.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <strong style={{ display: 'block' }}>{item.nombre}</strong>
                    <small>{dinero(item.precio)} {t('c/u')}</small>
                  </div>
                  <div className="cart-cantidad">
                    <button
                      className="neu-btn"
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      aria-label={`${t('Reducir')} ${item.nombre}`}
                    >
                      −
                    </button>
                    <strong>{item.cantidad}</strong>
                    <button
                      className="neu-btn"
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      aria-label={`${t('Aumentar')} ${item.nombre}`}
                    >
                      +
                    </button>
                    <button
                      className="neu-btn"
                      onClick={() => eliminarDelCarrito(item.id)}
                      aria-label={`${t('Eliminar')} ${item.nombre}`}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {carrito.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="cart-linea"><span>{t('Subtotal')}</span><span>{dinero(totalCarrito)}</span></div>
            <div className="cart-linea"><span>{t('Envío e IVA')}</span><span>{t('Se calculan en checkout')}</span></div>
            <button
              className="neu-btn neu-btn-primary neu-btn-block"
              style={{ marginTop: '1.2rem' }}
              onClick={() => { onClose(); onGoToCheckout(); }}
            >
              {t('Proceder al pago')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;