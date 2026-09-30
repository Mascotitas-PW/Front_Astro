import { useCartStore } from '../useCartStore';

export function CartModal({ isOpen, onClose, onGoToCheckout }) {
  const { cart, removeFromCart, updateQuantity, getSubtotal, getShippingCost, getTotalPrice } = useCartStore();

  if (!isOpen) return null;

  const envioTexto = getShippingCost() === 0 ? '¡Envío Gratis!' : '$80 MXN';

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(400px, 100vw)', backgroundColor: '#fff', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Tu Carrito</h2>
            <button onClick={onClose} aria-label="Cerrar carrito" style={{ cursor: 'pointer', fontSize: '18px', border: 'none', background: 'transparent' }}>✕</button>
          </div>
          <hr />

          {cart.length === 0 ? <p style={{ marginTop: '20px' }}>El carrito está vacío.</p> : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
                  <div><strong style={{ display: 'block' }}>{item.nombre}</strong><small>${item.precio} c/u</small></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} aria-label={`Reducir cantidad de ${item.nombre}`}>-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} aria-label={`Aumentar cantidad de ${item.nombre}`}>+</button>
                    <button onClick={() => removeFromCart(item.id)} aria-label={`Eliminar ${item.nombre}`} style={{ color: 'red', marginLeft: '10px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && <div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>${getSubtotal().toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Envío:</span><span>{envioTexto}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}><span>Total:</span><span>${getTotalPrice().toFixed(2)}</span></div>
          <button onClick={() => { onClose(); onGoToCheckout(); }} style={{ width: '100%', padding: '12px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Proceder al Pago</button>
        </div>}
      </div>
    </div>
  );
}

export default CartModal;