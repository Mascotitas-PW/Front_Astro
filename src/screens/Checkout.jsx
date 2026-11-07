import { useState, useRef } from "react";
import { useStore } from "../hooks/useStore";
import { obtenerUsuarioSesion } from "../auth/auth";
import {
  calcularEnvio,
  procesarPagoMercadoPago,
  crearPedidoConPago,
  crearPedidoSinPago,
} from "../services/pedidos";
import { useBrickMercadoPago, BRICK_CONTAINER_ID } from "../hooks/useBrickMercadoPago";
import { FormularioEntrega } from "./FormularioEntrega";
import { ResumenPedido } from "./ResumenPedido";
import { PedidoConfirmado } from "./PedidoConfirmado";
import { fetchGraphQL, GRAPHQL_ENDPOINT } from "../services/graphql";
import "./styles/Neumorfismo.css";
import "./styles/global.css";

const CREAR_PEDIDO_MUTATION = `
  mutation CrearPedido($input: CrearPedidoInput!) {
    crearPedido(input: $input) {
      id
      status
      total
    }
  }
`;

const CREAR_PEDIDO_SIN_PAGO_MUTATION = `
  mutation CrearPedidoSinPago($input: CrearPedidoSinPagoInput!) {
    crearPedidoSinPago(input: $input) {
      id
      status
      total
    }
  }
`;

const MERCADOPAGO_PUBLIC_KEY = import.meta.env.PUBLIC_MP_KEY;
const MERCADOPAGO_PAYMENT_URL = GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, "") + "/process_order";

function cargarSdkMercadoPago() {
  if (window.MercadoPago) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-mercadopago-sdk="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.dataset.mercadopagoSdk = "true";
      document.head.appendChild(script);
    }

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error("No se pudo cargar Mercado Pago.")), { once: true });
  });
}

// Llamada GraphQL con el token de la sesión (lanza error si el back responde con errores)
function llamarGraphQL(query, input) {
  return fetchGraphQL(query, { input });
}

// Misma validación que hace el back; así no se cobra una tarjeta con datos inválidos
function validarEntrega({ nombre, direccion, telefono }) {
  if (nombre.trim().length < 3) return "Escribe tu nombre completo.";
  if (direccion.trim().length < 5) return "Escribe una dirección de entrega válida.";
  if (telefono.replace(/\D/g, "").length !== 10) return "El teléfono debe tener 10 dígitos.";
  return null;
}

export const Checkout = ({ onBackToHome }) => {
  const store = useStore();
  const carrito = store.carrito || [];
  const subtotal = store.totalCarrito || 0;
  const envio = calcularEnvio(subtotal);
  const total = subtotal + envio;

  // La sesión vive en sessionStorage; se relee en cada render
  const usuario = obtenerUsuarioSesion();
  const usuarioId = usuario?.id ?? null;

  const [entrega, setEntrega] = useState({ nombre: '', direccion: '', telefono: '' });
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // El Brick guarda su callback al montarse; la ref evita leer datos viejos
  const entregaRef = useRef(entrega);
  entregaRef.current = entrega;

  const cambiarEntrega = (campo, valor) => setEntrega((e) => ({ ...e, [campo]: valor }));

  const cambiarMetodo = (metodo) => {
    setErrorMsg(null);
    setMetodoPago(metodo);
  };

  const finalizar = (pedido) => {
    setPedidoCreado(pedido);
    store.vaciarCarrito();
  };

  // Pago con tarjeta: lo dispara el Brick de Mercado Pago
  const pagarConTarjeta = async (formData) => {
    const errEntrega = validarEntrega(entregaRef.current);
    if (errEntrega) {
      setErrorMsg(errEntrega);
      throw new Error(errEntrega);
    }

    setLoading(true);
    setErrorMsg(null);

    let pago = null;
    try {
      pago = await procesarPagoMercadoPago({ usuarioId, carrito, formData, email: usuario?.email });
      const pedido = await crearPedidoConPago({
        usuarioId,
        paymentId: pago.id,
        carrito,
        entrega: entregaRef.current,
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
      // Con el pago ya aprobado, no se hace fallar al Brick para que no reintente el cobro
      if (pago) return pago;
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useBrickMercadoPago({
    activo: metodoPago === 'Tarjeta' && !pedidoCreado && !!usuarioId,
    total,
    onSubmit: pagarConTarjeta,
    onReady: () => setErrorMsg(null),
    onError: setErrorMsg,
  });

  // Efectivo / transferencia: se envía desde el formulario
  const confirmarSinPago = async (e) => {
    e.preventDefault();
    if (metodoPago === 'Tarjeta') return; // la tarjeta se envía desde el Brick

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

  // Sin sesión no se puede comprar
  if (!usuario) {
    return (
      <main className="mx-auto grid max-w-md gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Inicia sesión para pagar</h2>
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
        pagado={metodoPago === 'Tarjeta'}
        onVolver={volverAlHome}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-10">
      <h2 className="mb-6 text-3xl font-bold">Confirmar compra</h2>

      {errorMsg && (
        <div role="alert" className="neu-inset mb-6 p-4 font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-8">
          <FormularioEntrega
            entrega={entrega}
            onCambiar={cambiarEntrega}
            metodoPago={metodoPago}
            onMetodoPago={cambiarMetodo}
            onSubmit={confirmarSinPago}
            deshabilitado={loading || carrito.length === 0}
            loading={loading}
          />

          {metodoPago === 'Tarjeta' && (
            <div id={BRICK_CONTAINER_ID} className="neu-card p-4 sm:p-6" />
          )}
        </div>

        <ResumenPedido carrito={carrito} subtotal={subtotal} envio={envio} total={total} />
      </div>
    </main>
  );
};

export default Checkout;
