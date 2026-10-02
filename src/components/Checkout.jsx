import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useCartStore } from '../useCartStore';

// Mutación GraphQL para crear el pedido
const CREAR_PEDIDO_MUTATION = gql`
  mutation CrearPedido($input: PedidoInput!) {
    crearPedido(input: $input) {
      id
      estado
      total
    }
  }
`;

export const Checkout = ({ onBackToHome }) => {
  const { cart, getTotalPrice, getSubtotal, getShippingCost, clearCart } = useCartStore();


  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [completado, setCompletado] = useState(false);


  const [crearPedido, { loading, error }] = useMutation(CREAR_PEDIDO_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Estructura de datos requerida para la mutación GraphQL
    const datosPedido = {
      cliente: nombre,
      direccion,
      telefono,
      metodoPago,
      total: getTotalPrice(),
      items: cart.map((item) => ({
        productoId: item.id,
        cantidad: item.quantity,
        precio: item.precio,
      })),
    };

    try {
      // Ejecución de la mutación GraphQL
      const { data } = await crearPedido({
        variables: {
          input: datosPedido,
        },
      });

      console.log('Pedido creado exitosamente:', data);

      // Vaciamos el carrito tras confirmar el pedido
      clearCart();
      setCompletado(true);
    } catch (err) {
      console.error('Error al procesar el pedido:', err);
    }
  };

  if (completado) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#27ae60' }}>¡Gracias por tu compra! 🐾</h2>
        <p>Tu pedido ha sido registrado correctamente.</p>
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

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Confirmar Compra (Checkout)</h2>

      {/* Resumen de Productos */}
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

      {/* Manejo de error de GraphQL */}
      {error && (
        <div style={{ color: '#c0392b', backgroundColor: '#f9d6d5', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          Hubo un problema al enviar tu pedido. Por favor, inténtalo de nuevo.
        </div>
      )}

      {/* Formulario de Datos del Cliente */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo:</label>
          <input
            required
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Juan Pérez"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dirección de Entrega:</label>
          <input
            required
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle, Número, Colonia, Ciudad"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono de Contacto:</label>
          <input
            required
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="10 dígitos"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          >
            <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
            <option value="Efectivo">Efectivo contra entrega</option>
            <option value="Transferencia">Transferencia SPEI</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          style={{
            padding: '14px',
            backgroundColor: loading || cart.length === 0 ? '#95a5a6' : '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || cart.length === 0 ? 'not-allowed' : 'pointer',
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