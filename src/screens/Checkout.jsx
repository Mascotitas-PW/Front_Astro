import { useState, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { obtenerUsuarioSesion } from '../auth/auth';
import {
  calcularEnvio, validarEntrega, itemsInput,
  procesarPagoMercadoPago, crearPedidoConPago, crearPedidoSinPago,
} from '../services/pedidos';
import { useBrickMercadoPago, BRICK_CONTAINER_ID } from '../hooks/useBrickMercadoPago';
import FormularioEntrega from './FormularioEntrega';
import ResumenPedido from './ResumenPedido';
import PedidoConfirmado from './PedidoConfirmado';
import PayPalButton from '../components/PayPalButton';

export const Checkout = ({ onBackToHome }) => {
  const store = useStore();
  const carrito = store.carrito || [];
  const subtotal = store.totalCarrito || 0;
  const envio = calcularEnvio(subtotal);
  const total = subtotal + envio;

  const usuario = obtenerUsuarioSesion();
  const usuarioId = usuario?.id ?? null;

  const [entrega, setEntrega] = useState({ nombre: '', direccion: '', telefono: '', lat: null, lng: null });
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // El Brick guarda su callback al montarse; la ref evita leer datos viejos
  const entregaRef = useRef(entrega);
  entregaRef.current = entrega;

  const cambiarEntrega = (campo, valor) => setEntrega((e) => ({ ...e, [campo]: valor }));
  const cambiarUbicacion = ({ lat, lng }) => setEntrega((e) => ({ ...e, lat, lng }));

  const cambiarMetodo = (metodo) => { setErrorMsg(null); setMetodoPago(metodo); };

  const finalizar = (pedido) => {
    setPedidoCreado(pedido);
    store.vaciarCarrito();
  };

  // Tarjeta: lo dispara el Brick de Mercado Pago
  const pagarConTarjeta = async (formData) => {
    const errEntrega = validarEntrega(entregaRef.current);
    if (errEntrega) { setErrorMsg(errEntrega); throw new Error(errEntrega); }

    setLoading(true);
    setErrorMsg(null);

    let pago = null;
    try {
      pago = await procesarPagoMercadoPago({ usuarioId, carrito, formData, email: usuario?.email });
      const pedido = await crearPedidoConPago({
        usuarioId, paymentId: pago.id, carrito, entrega: entregaRef.current,
      });
      finalizar(pedido);
      return pago;
    } catch (error) {
      console.error('Error procesando pago:', error);
      setErrorMsg(
        pago
          ? `El pago fue aprobado, pero no se pudo guardar el pedido: ${error.message}`
          : error.message || 'No se pudo procesar el pago.',
      );
      if (pago) return pago; // ya cobrado: no hacer fallar al Brick para que no reintente el cobro
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useBrickMercadoPago({
    activo: metodoPago === 'Tarjeta' && !pedidoCreado && !!usuarioId && carrito.length > 0,
    total,
    onSubmit: pagarConTarjeta,
    onReady: () => setErrorMsg(null),
    onError: setErrorMsg,
  });

  // PayPal: el back captura el pago y crea el pedido; aquí solo lo mostramos
  const pagoPayPalAprobado = async (resultado) => {
    finalizar(resultado.pedido);
  };

  // Efectivo / transferencia
  const confirmarSinPago = async (e) => {
    e.preventDefault();
    if (metodoPago !== 'Efectivo' && metodoPago !== 'Transferencia') return;

    setErrorMsg(null);
    if (carrito.length === 0) return setErrorMsg('El carrito está vacío.');
    if (!usuarioId) return setErrorMsg('Inicia sesión para completar tu compra.');

    const errEntrega = validarEntrega(entrega);
    if (errEntrega) return setErrorMsg(errEntrega);

    setLoading(true);
    try {
      finalizar(await crearPedidoSinPago({ usuarioId, metodoPago, carrito, entrega }));
    } catch (err) {
      console.error('Error al registrar el pedido:', err);
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const volverAlHome = () => (onBackToHome ? onBackToHome() : store.cambiarPantalla('HOME'));

  if (!usuario) {
    return (
      <main className="page" style={{ maxWidth: 560, textAlign: 'center' }}>
        <h2>Inicia sesión para pagar</h2>
        <p>Necesitas una cuenta para completar tu compra.</p>
        <button onClick={() => store.cambiarPantalla('LOGIN')} className="neu-btn neu-btn-primary">
          Ir a iniciar sesión
        </button>
      </main>
    );
  }

  if (pedidoCreado) {
    return (
      <PedidoConfirmado
        pedido={pedidoCreado}
        pagado={metodoPago === 'Tarjeta' || metodoPago === 'PayPal'}
        onVolver={volverAlHome}
      />
    );
  }

  return (
    <main className="page">
      <h2>Confirmar compra</h2>

      {errorMsg && <div role="alert" className="alerta alerta-error">{errorMsg}</div>}

      <div className="checkout-layout">
        <div className="checkout-col">
          <FormularioEntrega
            entrega={entrega}
            onCambiar={cambiarEntrega}
            onUbicacion={cambiarUbicacion}
            metodoPago={metodoPago}
            onMetodoPago={cambiarMetodo}
            onSubmit={confirmarSinPago}
            deshabilitado={loading || carrito.length === 0}
            loading={loading}
          />

          {metodoPago === 'Tarjeta' && <div id={BRICK_CONTAINER_ID} className="neu-card pago-bloque" />}

          {metodoPago === 'PayPal' && (
            <div className="neu-card pago-bloque">
              <h3>Pagar con PayPal</h3>
              <PayPalButton
                items={itemsInput(carrito)}
                usuarioId={usuarioId}
                nombreCompleto={entrega.nombre}
                direccionEntrega={entrega.direccion}
                telefono={entrega.telefono}
                latitud={entrega.lat}
                longitud={entrega.lng}
                onApproved={pagoPayPalAprobado}
                onError={(err) => setErrorMsg(err?.message || 'No se pudo completar el pago con PayPal.')}
                disabled={carrito.length === 0}
              />
            </div>
          )}
        </div>

        <ResumenPedido carrito={carrito} subtotal={subtotal} envio={envio} total={total} />
      </div>
    </main>
  );
};

export default Checkout;
