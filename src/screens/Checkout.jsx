import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { obtenerUsuarioSesion } from "../auth/auth";
import { GRAPHQL_ENDPOINT } from "../graphql/client";

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
const MERCADOPAGO_PAYMENT_URL = import.meta.env.VITE_MERCADOPAGO_PAYMENT_URL
  || GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, "/process_order");

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

// Llamada GraphQL que lanza error si el back responde con errores
async function llamarGraphQL(query, input) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { input } }),
  });
  const result = await res.json();
  if (!res.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.message || "No se pudo registrar el pedido.");
  }
  return result.data;
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
    });
    if (!data?.crearPedidoSinPago) throw new Error("No se recibió confirmación del pedido.");
    return data.crearPedidoSinPago;
  };

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
              setLoading(true);
              setErrorMsg(null);
              let pagoAprobado = false;
              let paymentData;

              try {
                const response = await fetch(MERCADOPAGO_PAYMENT_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    usuarioId: Number(usuarioIdActual),
                    items: itemsInput(),
                    token: formData.token,
                    paymentMethodId: formData.payment_method_id,
                    installments: Number(formData.installments || 1),
                    email: formData.payer?.email || usuario?.email,
                    transaction_amount: Number(formData.transaction_amount),
                  }),
                });
                paymentData = await response.json();

                if (!response.ok) {
                  throw new Error(paymentData.message || paymentData.error || "Mercado Pago rechazó la solicitud.");
                }
                if (paymentData.status !== "approved") {
                  throw new Error(paymentData.message || `El pago no fue aprobado (estado: ${paymentData.status || "desconocido"}).`);
                }

                pagoAprobado = true;
                const pedido = await registrarPedidoConPago(paymentData.id);
                setPedidoCreado(pedido);
                store.vaciarCarrito();
                return paymentData;
              } catch (error) {
                setErrorMsg(pagoAprobado
                  ? `El pago fue aprobado, pero no se pudo guardar el pedido: ${error.message}`
                  : error.message || "No se pudo procesar el pago.");
                if (pagoAprobado) return paymentData;
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
      <div style={{ padding: "40px", textAlign: "center", maxWidth: "500px", margin: "40px auto", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#27ae60" }}>¡Gracias por tu compra! 🐾</h2>
        <p>
          Tu pedido <strong>#{pedidoCreado.id}</strong> ha sido registrado correctamente.
        </p>
        <p>
          {pagado ? "Total cobrado" : "Total a pagar"}: <strong>${Number(pedidoCreado.total).toFixed(2)}</strong>
        </p>
        <p>
          Estado: <strong>{pedidoCreado.status}</strong>
        </p>
        <button
          onClick={handleVolverAlHome}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#E8734A",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Volver a la Tienda
        </button>
      </div>
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
    <div style={{ padding: "20px", maxWidth: "600px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Confirmar Compra (Checkout)</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Resumen del Pedido</h3>
        {carrito.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          carrito.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>
                {item.nombre} (x{item.cantidad})
              </span>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))
        )}
        <hr />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal:</span>
          <span>${totalCarrito.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Envío:</span>
          <span>{costoEnvio === 0 ? "¡Gratis!" : `$${costoEnvio}`}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", marginTop: "10px" }}>
          <span>Total Final:</span>
          <span style={{ color: "#27ae60" }}>${totalFinal.toFixed(2)}</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: "#c0392b", backgroundColor: "#f9d6d5", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label style={labelStyle}>Nombre Completo:</label>
          <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Dirección de Entrega:</label>
          <input required type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, Número, Colonia, Ciudad" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Teléfono de Contacto:</label>
          <input required type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="10 dígitos" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Método de Pago:</label>
          <select value={metodoPago} onChange={(e) => { setErrorMsg(null); setMetodoPago(e.target.value); }} style={inputStyle}>
            <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
            <option value="Efectivo">Efectivo contra entrega</option>
            <option value="Transferencia">Transferencia SPEI</option>
          </select>
        </div>

        {metodoPago !== "Tarjeta" && (
          <button
            type="submit"
            disabled={deshabilitado}
            style={{
              padding: "14px",
              backgroundColor: deshabilitado ? "#95a5a6" : "#27ae60",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: deshabilitado ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            {loading ? "Procesando Pedido..." : "Confirmar y Enviar Pedido"}
          </button>
        )}
      </form>

      {metodoPago === "Tarjeta" && <div id="cardPaymentBrick_container" />}
    </div>
  );
};

export default Checkout;