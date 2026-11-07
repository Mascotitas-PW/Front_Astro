import { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { obtenerUsuarioSesion } from "../auth/auth";
import { GRAPHQL_ENDPOINT, fetchGraphQL, obtenerToken } from "../graphql/client";
import PayPalButton from "../components/PayPalButton";
import { MapaEntrega } from '../components/MapaEntrega';

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
  const totalCarrito = store.totalCarrito || 0;

  // La sesión vive en sessionStorage; se relee en cada render
  const usuario = obtenerUsuarioSesion();
  const usuarioIdActual = usuario?.id ?? null;

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Tarjeta");
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // El Brick de Mercado Pago guarda su callback al montarse; la ref evita leer datos viejos
  const entregaRef = useRef({ nombre: "", direccion: "", telefono: "" });
  entregaRef.current = { nombre, direccion, telefono };

  const costoEnvio = totalCarrito > 500 || totalCarrito === 0 ? 0 : 99;
  const totalFinal = totalCarrito + costoEnvio;

  const itemsInput = () =>
    carrito.map((item) => ({
      productoId: Number(item.id),
      cantidad: Number(item.cantidad),
    }));

  // Pedido pagado con tarjeta (el back valida el pago contra Mercado Pago)
  const registrarPedidoConPago = async (paymentId) => {
    const data = await llamarGraphQL(CREAR_PEDIDO_MUTATION, {
      usuarioId: Number(usuarioIdActual),
      paymentId: Number(paymentId),
      items: itemsInput(),
      nombreCompleto: entregaRef.current.nombre.trim(),
      direccionEntrega: entregaRef.current.direccion.trim(),
      telefono: entregaRef.current.telefono.trim(),
    });
    if (!data?.crearPedido) throw new Error("No se recibió confirmación del pedido.");
    return data.crearPedido;
  };

  // Pedido en efectivo / transferencia (queda pendiente de pago)
  const registrarPedidoSinPago = async () => {
    const data = await llamarGraphQL(CREAR_PEDIDO_SIN_PAGO_MUTATION, {
      usuarioId: Number(usuarioIdActual),
      metodoPago,
      items: itemsInput(),
      nombreCompleto: nombre.trim(),
      direccionEntrega: direccion.trim(),
      telefono: telefono.trim(),
    });
    if (!data?.crearPedidoSinPago) throw new Error("No se recibió confirmación del pedido.");
    return data.crearPedidoSinPago;
  };

  const registrarPedidoPayPal = async (payment) => {
    const pedido = payment.pedido || payment.order || payment.crearPedido;
    if (!pedido) {
      throw new Error(
        "PayPal capturó el pago, pero el backend no devolvió el pedido. Configura el endpoint de captura para registrar también el pedido PayPal.",
      );
    }

    setPedidoCreado(pedido);
    store.vaciarCarrito();
  };

  const manejarErrorPayPal = (error) => {
    if (error?.message === "Pago cancelado.") return;
    setErrorMsg(error?.message || "No se pudo procesar el pago con PayPal.");
  };
const dinero = (n) => Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const Campo = ({ etiqueta, ancho, children }) => (
  <label className={`grid gap-2 font-semibold ${ancho ? 'sm:col-span-2' : ''}`}>{etiqueta}{children}</label>
);
  // Brick de Mercado Pago (solo con tarjeta)
  useEffect(() => {
    if (metodoPago !== "Tarjeta" || !totalFinal || pedidoCreado) return;
    if (!MERCADOPAGO_PUBLIC_KEY) {
      setErrorMsg("Configura PUBLIC_MP_KEY para habilitar el pago con tarjeta.");
      return;
    }
    if (!usuarioIdActual) return;

    let cancelado = false;
    let brickController;

    const montarBrick = async () => {
      try {
        await cargarSdkMercadoPago();
        if (cancelado) return;

        const mercadoPago = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: "es-MX" });
        brickController = await mercadoPago.bricks().create("cardPayment", "cardPaymentBrick_container", {
          initialization: { amount: Number(totalFinal.toFixed(2)) },
          callbacks: {
            onReady: () => setErrorMsg(null),
            onSubmit: async (formData) => {
  const errEntrega = validarEntrega(entregaRef.current);
  if (errEntrega) {
    setErrorMsg(errEntrega);
    throw new Error(errEntrega);
  }

  setLoading(true);
  setErrorMsg(null);

  let pagoAprobado = false;
  let paymentData;

  try {
   const response = await fetch(MERCADOPAGO_PAYMENT_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obtenerToken()}`,
  },
  body: JSON.stringify({
    usuarioId: Number(usuarioIdActual),

    items: carrito.map((item) => ({
      productoId: Number(item.id),
      cantidad: Number(item.cantidad),
    })),

    token: formData.token,

    paymentMethodId: formData.payment_method_id,

    installments: Number(formData.installments || 1),

    payer: {
      email: formData.payer?.email || usuario?.email || "",
    },
  }),
});

const responseText = await response.text();

console.log("STATUS BACKEND:", response.status);
console.log("RESPUESTA BACKEND:", responseText);

try {
  paymentData = JSON.parse(responseText);
} catch {
  paymentData = {
    message: responseText || "El servidor no devolvió información."
  };
}

if (!response.ok) {
  throw new Error(
    paymentData.message ||
    paymentData.error ||
    `Error del servidor (${response.status})`
  );
}

if (paymentData.status !== "approved") {
  throw new Error(
    paymentData.message ||
    `El pago no fue aprobado (estado: ${
      paymentData.status || "desconocido"
    }).`
  );
}
    pagoAprobado = true;

    const pedido = await registrarPedidoConPago(paymentData.id);

    setPedidoCreado(pedido);

    store.vaciarCarrito();

    return paymentData;

  } catch (error) {

    console.error("Error procesando pago:", error);

    setErrorMsg(
      pagoAprobado
        ? `El pago fue aprobado, pero no se pudo guardar el pedido: ${error.message}`
        : error.message || "No se pudo procesar el pago."
    );

    if (pagoAprobado) {
      return paymentData;
    }

    throw error;

  } finally {
    setLoading(false);
  }
            },
            onError: (error) => {
              console.error("Error en Mercado Pago Brick:", error);
              setErrorMsg("Ocurrió un error en el formulario de pago.");
            },
          },
        });
      } catch (error) {
        if (!cancelado) setErrorMsg(error.message || "No se pudo iniciar Mercado Pago.");
      }
    };

    montarBrick();
    return () => {
      cancelado = true;
      brickController?.unmount();
    };
  }, [metodoPago, totalFinal, usuarioIdActual, pedidoCreado]);

  const handleVolverAlHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      store.cambiarPantalla("HOME");
    }
  };

  // Submit del formulario: solo aplica para efectivo / transferencia
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (metodoPago === "Tarjeta") return; // la tarjeta se envía desde el Brick

    setErrorMsg(null);

    if (carrito.length === 0) {
      setErrorMsg("El carrito está vacío.");
      return;
    }
    if (!usuarioIdActual) {
      setErrorMsg("Inicia sesión para completar tu compra.");
      return;
    }

    const errEntrega = validarEntrega({ nombre, direccion, telefono });
    if (errEntrega) {
      setErrorMsg(errEntrega);
      return;
    }

    setLoading(true);
    try {
      const pedido = await registrarPedidoSinPago();
      setPedidoCreado(pedido);
      store.vaciarCarrito();
    } catch (err) {
      console.error("Error al registrar el pedido:", err);
      setErrorMsg(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Sin sesión no se puede comprar
  if (!usuario) {
    return (
      <div style={{ padding: "40px", textAlign: "center", maxWidth: "500px", margin: "40px auto" }}>
        <h2>Inicia sesión para pagar</h2>
        <p>Necesitas una cuenta para completar tu compra.</p>
        <button
          onClick={() => store.cambiarPantalla("LOGIN")}
          style={{ marginTop: "20px", padding: "10px 20px", fontWeight: "bold" }}
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

if (pedidoCreado) {
  const pagado = metodoPago === "Tarjeta";
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10">
      <section className="neu-card w-full p-8 text-center sm:p-14">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Mascotitas" className="mx-auto mb-6 h-28 w-28 object-contain sm:h-36 sm:w-36" />
        <h2 className="text-3xl font-bold text-green-700 sm:text-5xl">¡Gracias por tu compra!</h2>
        <p className="mt-4 text-lg sm:text-xl">Tu pedido <strong>#{pedidoCreado.id}</strong> fue registrado correctamente.</p>
        <div className="neu-inset mx-auto mt-8 grid max-w-md gap-2 p-5 text-lg">
          <p>{pagado ? "Total cobrado" : "Total a pagar"}: <strong>{dinero(pedidoCreado.total)}</strong></p>
          <p>Estado: <strong>{pedidoCreado.status}</strong></p>
        </div>
        <button onClick={handleVolverAlHome} className="neu-btn neu-btn-primary mt-8 px-8 py-3 text-lg">
          Volver a la tienda
        </button>
      </section>
    </main>
  );
}
  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  };
  const labelStyle = { display: "block", marginBottom: "5px", fontWeight: "bold" };
  const deshabilitado = loading || carrito.length === 0;

return (
  <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-10">
    <h2 className="mb-6 text-3xl font-bold">Confirmar compra</h2>

    {errorMsg && <div role="alert" className="neu-inset mb-6 p-4 font-semibold text-red-700">{errorMsg}</div>}

    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-8">
        <form onSubmit={handleSubmit} className="neu-card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <Campo etiqueta="Nombre completo" ancho>
            <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="neu-inset w-full px-4 py-3" />
          </Campo>
          <Campo etiqueta="Dirección de entrega" ancho>
            <input required type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia, ciudad" className="neu-inset w-full px-4 py-3" />
          </Campo>
          <MapaEntrega direccion={direccion} />
          <Campo etiqueta="Teléfono de contacto">
            <input required type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="10 dígitos" className="neu-inset w-full px-4 py-3" />
          </Campo>
          <Campo etiqueta="Método de pago">
            <select value={metodoPago} onChange={(e) => { setErrorMsg(null); setMetodoPago(e.target.value); }} className="neu-inset w-full px-4 py-3">
              <option value="Tarjeta">Tarjeta de crédito / débito</option>
              <option value="Efectivo">Efectivo contra entrega</option>
              <option value="Transferencia">Transferencia SPEI</option>
            </select>
          </Campo>
          {metodoPago !== "Tarjeta" && (
            <button type="submit" disabled={deshabilitado} className="neu-btn neu-btn-primary py-4 text-lg sm:col-span-2">
              {loading ? "Procesando pedido..." : "Confirmar y enviar pedido"}
            </button>
          )}
        </form>

        {metodoPago === "Tarjeta" && <div id="cardPaymentBrick_container" className="neu-card p-4 sm:p-6" />}
      </div>

      <aside className="neu-card grid gap-3 p-6 lg:sticky lg:top-24">
        <h3 className="text-xl font-bold">Resumen del pedido</h3>
        {carrito.length === 0 ? <p>Tu carrito está vacío.</p> : carrito.map((item) => (
          <div key={item.id} className="flex justify-between gap-3">
            <span>{item.nombre} (x{item.cantidad})</span>
            <span>{dinero(item.precio * item.cantidad)}</span>
          </div>
        ))}
        <hr className="border-[#D6C49A]" />
        <div className="flex justify-between"><span>Subtotal</span><span>{dinero(totalCarrito)}</span></div>
        <div className="flex justify-between"><span>Envío</span><span>{costoEnvio === 0 ? "¡Gratis!" : dinero(costoEnvio)}</span></div>
        <div className="flex justify-between text-xl font-bold text-green-700"><span>Total</span><span>{dinero(totalFinal)}</span></div>
      </aside>
    </div>
  </main>
)
}
export default Checkout;