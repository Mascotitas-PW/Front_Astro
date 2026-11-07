import { GRAPHQL_ENDPOINT, fetchGraphQL, obtenerToken } from '../graphql/client';

const MERCADOPAGO_PAYMENT_URL =
  GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, '') + '/process_order';

const CREAR_PEDIDO_MUTATION = `
  mutation CrearPedido($input: CrearPedidoInput!) {
    crearPedido(input: $input) { id status total }
  }`;

const CREAR_PEDIDO_SIN_PAGO_MUTATION = `
  mutation CrearPedidoSinPago($input: CrearPedidoSinPagoInput!) {
    crearPedidoSinPago(input: $input) { id status total }
  }`;

export const dinero = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// Misma regla que el back (Envio.cs): gratis arriba de $500, si no $99.
export const calcularEnvio = (subtotal) => (subtotal > 500 || subtotal === 0 ? 0 : 99);

// Misma validación que hace el back; así no se cobra con datos inválidos.
export function validarEntrega({ nombre, direccion, telefono }) {
  if (nombre.trim().length < 3) return 'Escribe tu nombre completo.';
  if (direccion.trim().length < 5) return 'Escribe una dirección de entrega válida.';
  if (telefono.replace(/\D/g, '').length !== 10) return 'El teléfono debe tener 10 dígitos.';
  return null;
}

export const itemsInput = (carrito) =>
  carrito.map((item) => ({
    productoId: Number(item.id),
    cantidad: Number(item.cantidad),
  }));

export const datosEntrega = ({ nombre, direccion, telefono, lat, lng }) => ({
  nombreCompleto: nombre.trim(),
  direccionEntrega: direccion.trim(),
  telefono: telefono.replace(/\D/g, ''),
  latitud: lat ?? null,
  longitud: lng ?? null,
});

// Cobra la tarjeta en el back (/process_order). Lanza Error si el pago no se aprueba.
export async function procesarPagoMercadoPago({ usuarioId, carrito, formData, email }) {
  const response = await fetch(MERCADOPAGO_PAYMENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({
      usuarioId: Number(usuarioId),
      items: itemsInput(carrito),
      token: formData.token,
      paymentMethodId: formData.payment_method_id,
      issuerId: formData.issuer_id ?? null,
      installments: Number(formData.installments || 1),
      payer: {
        email: formData.payer?.email || email || '',
        identification: formData.payer?.identification ?? null,
      },
    }),
  });

  const texto = await response.text();
  let pago;
  try {
    pago = JSON.parse(texto);
  } catch {
    pago = { message: texto || 'El servidor no devolvió información.' };
  }

  if (!response.ok) {
    throw new Error(pago.message || pago.error || `Error del servidor (${response.status})`);
  }
  if (pago.status !== 'approved') {
    throw new Error(
      pago.message || `El pago no fue aprobado (estado: ${pago.status || 'desconocido'}).`,
    );
  }
  return pago;
}

// Registra el pedido de un pago ya aprobado (el back lo vuelve a verificar con Mercado Pago).
export async function crearPedidoConPago({ usuarioId, paymentId, carrito, entrega }) {
  const data = await fetchGraphQL(CREAR_PEDIDO_MUTATION, {
    input: {
      usuarioId: Number(usuarioId),
      paymentId: Number(paymentId),
      items: itemsInput(carrito),
      ...datosEntrega(entrega),
    },
  });
  if (!data?.crearPedido) throw new Error('No se recibió confirmación del pedido.');
  return data.crearPedido;
}

// Efectivo o transferencia: el pedido queda pendiente de pago.
export async function crearPedidoSinPago({ usuarioId, metodoPago, carrito, entrega }) {
  const data = await fetchGraphQL(CREAR_PEDIDO_SIN_PAGO_MUTATION, {
    input: {
      usuarioId: Number(usuarioId),
      metodoPago,
      items: itemsInput(carrito),
      ...datosEntrega(entrega),
    },
  });
  if (!data?.crearPedidoSinPago) throw new Error('No se recibió confirmación del pedido.');
  return data.crearPedidoSinPago;
}
