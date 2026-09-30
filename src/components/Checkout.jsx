import { useStore } from '../store/useStore';

export function Checkout() {
  const { carrito, finalizarCompra } = useStore();

  const total = carrito.reduce((acc, item) => {
    const precio = Number(item.precio || item.Precio || 0);
    const cantidad = Number(item.cantidad || item.Cantidad || 1);
    return acc + (precio * cantidad);
  }, 0);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>💳 Checkout — Mascotitas</h2>

      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
        <h3>Resumen de Compra</h3>

        {carrito.map((item, index) => {
          const precio = Number(item.precio || item.Precio || 0);
          const cantidad = Number(item.cantidad || item.Cantidad || 1);
          const subtotal = precio * cantidad;

          return (
            <div key={item.id || index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{item.nombre || item.Nombre} (x{cantidad})</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
          );
        })}

        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1rem 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
          <strong>Total:</strong>
          <strong style={{ color: '#2EC4B6' }}>${total.toFixed(2)}</strong>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); finalizarCompra(); }}>
        <input type="text" placeholder="Nombre completo" required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Dirección de envío" required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Tarjeta de crédito (Demo)" required style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <button type="submit" style={{ width: '100%', padding: '1rem', background: '#FF7A00', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Confirmar Compra
        </button>
      </form>
    </div>
  );
}
