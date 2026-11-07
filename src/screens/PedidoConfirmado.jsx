import { dinero } from '../../services/pedidos';

export default function PedidoConfirmado({ pedido, pagado, onVolver }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10">
      <section className="neu-card w-full p-8 text-center sm:p-14">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Mascotitas"
          className="mx-auto mb-6 h-28 w-28 object-contain sm:h-36 sm:w-36"
        />
        <h2 className="text-3xl font-bold text-green-700 sm:text-5xl">¡Gracias por tu compra!</h2>
        <p className="mt-4 text-lg sm:text-xl">
          Tu pedido <strong>#{pedido.id}</strong> fue registrado correctamente.
        </p>

        <div className="neu-inset mx-auto mt-8 grid max-w-md gap-2 p-5 text-lg">
          <p>{pagado ? 'Total cobrado' : 'Total a pagar'}: <strong>{dinero(pedido.total)}</strong></p>
          <p>Estado: <strong>{pedido.status}</strong></p>
        </div>

        <button onClick={onVolver} className="neu-btn neu-btn-primary mt-8 px-8 py-3 text-lg">
          Volver a la tienda
        </button>
      </section>
    </main>
  );
}
