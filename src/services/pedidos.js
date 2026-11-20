import {
  GRAPHQL_ENDPOINT, API_BASE_URL, fetchGraphQL, obtenerTokenRequerido, MENSAJE_SESION_EXPIRADA,
} from '../graphql/client';

const MERCADOPAGO_PAYMENT_URL = `${API_BASE_URL}/process_order`;
const ENVIO_QUOTES_URL = `${API_BASE_URL}/api/envios/cotizaciones`;

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

export function validarEntrega({ nombre, direccion, telefono, cp, estado, ciudad, colonia }) {
  if ((nombre ?? '').trim().length < 3) return 'Escribe tu nombre completo.';
  if ((direccion ?? '').trim().length < 5) return 'Escribe una dirección de entrega válida.';
  if ((telefono ?? '').replace(/\D/g, '').length !== 10) return 'El teléfono debe tener 10 dígitos.';
  if (!/^\d{5}$/.test(String(cp ?? ''))) return 'El código postal debe tener 5 dígitos.';
  if (!estado?.trim() || !ciudad?.trim() || !colonia?.trim())
    return 'Completa estado, ciudad y colonia.';
  return null;
}

export const itemsInput = (carrito) =>
  carrito.map((item) => ({
    productoId: Number(item.id),
    cantidad: Number(item.cantidad),
  }));

export const datosEntrega = ({
  nombre, direccion, telefono, lat, lng, cp, estado, ciudad, colonia,
  cotizacionEnvioId, rateId,
}) => ({
  nombreCompleto: nombre.trim(),
  direccionEntrega: direccion.trim(),
  telefono: telefono.replace(/\D/g, ''),
  codigoPostal: String(cp ?? '').replace(/\D/g, ''),
  estado: estado.trim(),
  ciudad: ciudad.trim(),
  colonia: colonia.trim(),
  latitud: lat ?? null,
  longitud: lng ?? null,
  cotizacionEnvioId,
  rateId,
});

export async function cotizarEnvio({ carrito, entrega }) {
  const token = obtenerTokenRequerido('Inicia sesión para cotizar el envío.');
  const response = await fetch(ENVIO_QUOTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: itemsInput(carrito),
      codigoPostal: entrega.cp,
      estado: entrega.estado,
      ciudad: entrega.ciudad,
      colonia: entrega.colonia,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error(MENSAJE_SESION_EXPIRADA);
  if (response.status === 404) throw new Error('Código postal no encontrado.');
  if (response.status === 400) throw new Error(data.message || data.error || 'No se pudo cotizar el envío. Verifica los datos de entrega.');
  if (!response.ok) throw new Error(data.message || `Error al cotizar (${response.status}).`);
  return data;
}

export async function procesarPagoMercadoPago({
  usuarioId, carrito, formData, email, cotizacionEnvioId, rateId,
}) {
  const token = obtenerTokenRequerido('Inicia sesión para continuar con el pago.');
  const response = await fetch(MERCADOPAGO_PAYMENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      usuarioId: Number(usuarioId),
      items: itemsInput(carrito),
      cotizacionEnvioId,
      rateId,
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

  if (response.status === 401) throw new Error(MENSAJE_SESION_EXPIRADA);
  if (!response.ok) throw new Error(pago.message || pago.error || `Error del servidor (${response.status})`);
  if (pago.status !== 'approved') {
    throw new Error(pago.message || `El pago no fue aprobado (estado: ${pago.status || 'desconocido'}).`);
  }
  return pago;
}

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