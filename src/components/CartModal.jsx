import { useStore } from '../hooks/useStore';
import { calcularEnvio, dinero } from '../services/pedidos';

export function CartModal({ isOpen, onClose, onGoToCheckout }) {
  const { carrito, eliminarDelCarrito, actualizarCantidad, totalCarrito } = useStore();

  if (!isOpen) return null;

  const envio = calcularEnvio(totalCarrito);
  const total = totalCarrito + envio;

  return (
    <div className="cart-fondo" onClick={onClose}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="cart-cab">
            <h2>Tu carrito</h2>
            <button className="neu-btn neu-btn-sm" onClick={onClose} aria-label="Cerrar carrito">✕</button>
          </div>

          {carrito.length === 0 ? (
            <p style={{ marginTop: '1.5rem' }}>El carrito está vacío.</p>
          ) : (
            <div className="cart-lista">
              {carrito.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <strong style={{ display: 'block' }}>{item.nombre}</strong>
                    <small>{dinero(item.precio)} c/u</small>
                  </div>
                  <div className="cart-cantidad">
                    <button className="neu-btn" onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} aria-label={`Reducir ${item.nombre}`}>−</button>
                    <strong>{item.cantidad}</strong>
                    <button className="neu-btn" onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} aria-label={`Aumentar ${item.nombre}`}>+</button>
                    <button className="neu-btn" onClick={() => eliminarDelCarrito(item.id)} aria-label={`Eliminar ${item.nombre}`}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {carrito.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="cart-linea"><span>Subtotal</span><span>{dinero(totalCarrito)}</span></div>
            <div className="cart-linea"><span>Envío</span><span>{envio === 0 ? '¡Envío gratis!' : dinero(envio)}</span></div>
            <div className="cart-linea cart-total"><span>Total</span><span>{dinero(total)}</span></div>
            <button
              className="neu-btn neu-btn-primary neu-btn-block"
              style={{ marginTop: '1.2rem' }}
              onClick={() => { onClose(); onGoToCheckout(); }}
            >
              Proceder al pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;
