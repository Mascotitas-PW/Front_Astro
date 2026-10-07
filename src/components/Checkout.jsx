import { useStore } from "../store/useStore";
import { useState, useEffect } from "react";
import { obtenerUsuarioSesion } from "../utils/auth";
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

export const Checkout = ({ onBackToHome }) => {
  const store = useStore();
  const carrito = store.carrito || [];
  const totalCarrito = store.totalCarrito || 0;

  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Tarjeta");
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const sesion = obtenerUsuarioSesion();
    setUsuarioSesion(sesion);
  }, []);

  const usuarioId = typeof window !== "undefined" ? sessionStorage.getItem("usuarioId") : null;
  const costoEnvio = totalCarrito > 500 || totalCarrito === 0 ? 0 : 99;
  const totalFinal = totalCarrito + costoEnvio;

  const handleVolverAlHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else if (store.cambiarPantalla) {
      store.cambiarPantalla("HOME");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const usuarioIdActual = usuarioSesion?.id ?? (usuarioId ? Number(usuarioId) : null);
    if (!usuarioIdActual) {
      alert("Inicia sesión para completar tu compra");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: CREAR_PEDIDO_MUTATION,
          variables: {
            input: {
              usuarioId: Number(usuarioIdActual),
              items: carrito.map((item) => ({
                productoId: Number(item.id),
                cantidad: Number(item.cantidad),
              })),
            },
          },
        }),
      });

      const result = await res.json();

      if (result.errors && result.errors.length > 0) {
        const mensajeError = result.errors[0].message || "Error al procesar el pedido.";
        setErrorMsg(mensajeError);
        return;
      }

      if (result.data?.crearPedido) {
        setPedidoCreado(result.data.crearPedido);
        store.finalizarCompra();
        return;
      }

      setErrorMsg("No se recibió confirmación del pedido.");
    } catch (err) {
      console.error("Error en el catch del fetch:", err);
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (pedidoCreado) {
    return (
      <div style={{ padding: "40px", textAlign: "center", maxWidth: "500px", margin: "40px auto", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#27ae60" }}>¡Gracias por tu compra! 🐾</h2>
        <p>
          Tu pedido <strong>#{pedidoCreado.id}</strong> ha sido registrado correctamente.
        </p>
        <p>
          Total cobrado: <strong>${pedidoCreado.total?.toFixed(2)}</strong>
        </p>
        <p>
          Estado: <strong>{pedidoCreado.status}</strong>
        </p>
        <button
          onClick={handleVolverAlHome}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#2980b9",
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
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={inputStyle}>
            <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
            <option value="Efectivo">Efectivo contra entrega</option>
            <option value="Transferencia">Transferencia SPEI</option>
          </select>
        </div>

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
      </form>
    </div>
  );
};

export default Checkout;