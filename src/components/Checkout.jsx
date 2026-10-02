import { useStore } from '../store/useStore';
import { useState } from "react";

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
  const { cart, user, getTotalPrice, getSubtotal, getShippingCost, clearCart } = useStore();

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  
  // Estados para controlar carga, error y resultado
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    if (!user?.id) {
      alert('Inicia sesión para completar tu compra');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://localhost:5113/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: CREAR_PEDIDO_MUTATION,
          variables: {
            input: {
              usuarioId: Number(user.id),
              items: cart.map((item) => ({
                productoId: Number(item.id),
                cantidad: item.quantity,
              })),
            },
          },
        })
      });

      const result = await res.json();

      if (result.errors && result.errors.length > 0) {
        setErrorMsg(result.errors[0].message);
      } else if (result.data?.crearPedido) {
        clearCart();
        setPedidoCreado(result.data.crearPedido);
      } else {
        setErrorMsg("Ocurrió un error inesperado al procesar la orden.");
      }
    } catch (err) {
      console.error('Error de red al procesar el pedido:', err);
      setErrorMsg('Error de conexión con el servidor de Mascotitas.');
    } finally {
      setLoading(false);
    }
  };

  if (pedidoCreado) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#27ae60' }}>¡Gracias por tu compra! 🐾</h2>
        <p>Tu pedido #{pedidoCreado.id} ha sido registrado correctamente.</p>
        <button
          onClick={onBackToHome}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2980b9',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Volver a la Tienda
        </button>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const deshabilitado = loading || cart.length === 0;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Confirmar Compra (Checkout)</h2>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Resumen del Pedido</h3>
        {cart.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{item.nombre} (x{item.quantity})</span>
              <span>${(item.precio * item.quantity).toFixed(2)}</span>
            </div>
          ))
        )}
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>${getSubtotal().toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Envío:</span>
          <span>{getShippingCost() === 0 ? '¡Gratis!' : `$${getShippingCost()}`}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
          <span>Total Final:</span>
          <span style={{ color: '#27ae60' }}>${getTotalPrice().toFixed(2)}</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: '#c0392b', backgroundColor: '#f9d6d5', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            padding: '14px',
            backgroundColor: deshabilitado ? '#95a5a6' : '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: deshabilitado ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            marginTop: '10px',
          }}
        >
          {loading ? 'Procesando Pedido...' : 'Confirmar y Enviar Pedido'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;