import { dinero } from '../services/pedidos';

export default function PedidoConfirmado({ pedido, pagado, onVolver }) {
  return (
    <main className="confirmado neu-card">
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Mascotitas" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      <h2>¡Gracias por tu compra!</h2>
      <p style={{ fontSize: '1.2rem' }}>
        Tu pedido <strong>#{pedido.id}</strong> fue registrado correctamente.
      </p>

      <div className="neu-inset">
        <p style={{ margin: 0 }}>{pagado ? 'Total cobrado' : 'Total a pagar'}: <strong>{dinero(pedido.total)}</strong></p>
        <p style={{ margin: 0 }}>Estado: <strong>{pedido.status}</strong></p>
      </div>

      <button onClick={onVolver} className="neu-btn neu-btn-primary">Volver a la tienda</button>
    </main>
  );
}

export { PedidoConfirmado };
