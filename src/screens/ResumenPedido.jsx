import { dinero } from '../services/pedidos';

export default function ResumenPedido({ carrito, subtotal, envio, total }) {
  return (
    <aside className="neu-card resumen">
      <h3>Resumen del pedido</h3>

      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        carrito.map((item) => (
          <div key={item.id} className="resumen-linea">
            <span>{item.nombre} (x{item.cantidad})</span>
            <span>{dinero(item.precio * item.cantidad)}</span>
          </div>
        ))
      )}

      <hr />
      <div className="resumen-linea"><span>Subtotal</span><span>{dinero(subtotal)}</span></div>
      <div className="resumen-linea"><span>Envío</span><span>{envio === 0 ? '¡Gratis!' : dinero(envio)}</span></div>
      <div className="resumen-linea resumen-total"><span>Total</span><span>{dinero(total)}</span></div>
    </aside>
  );
}

export { ResumenPedido };
