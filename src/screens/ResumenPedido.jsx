import { dinero } from '../services/pedidos';
import "./styles/Neumorfismo.css";
import "./styles/global.css";

export default function ResumenPedido({ carrito, subtotal, envio, total }) {
  return (
    <aside className="neu-card grid gap-3 p-6 lg:sticky lg:top-24">
      <h3 className="text-xl font-bold">Resumen del pedido</h3>

      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        carrito.map((item) => (
          <div key={item.id} className="flex justify-between gap-3">
            <span>{item.nombre} (x{item.cantidad})</span>
            <span>{dinero(item.precio * item.cantidad)}</span>
          </div>
        ))
      )}

      <hr className="border-[#D6C49A]" />

      <div className="flex justify-between"><span>Subtotal</span><span>{dinero(subtotal)}</span></div>
      <div className="flex justify-between">
        <span>Envío</span>
        <span>{envio === 0 ? '¡Gratis!' : dinero(envio)}</span>
      </div>
      <div className="flex justify-between text-xl font-bold text-green-700">
        <span>Total</span>
        <span>{dinero(total)}</span>
      </div>
    </aside>
  );
}
