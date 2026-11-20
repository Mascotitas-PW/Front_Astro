import { createClient } from 'graphql-ws';
import { GRAPHQL_ENDPOINT } from '../graphql/client';

let cliente = null;
function obtenerCliente() {
  if (!cliente) {
    cliente = createClient({
      url: GRAPHQL_ENDPOINT.replace(/^http/, 'ws'),
      retryAttempts: Infinity,
      keepAlive: 20000,            // evita que el proxy cierre el socket por inactividad
      shouldRetry: () => true,
    });
  }
  return cliente;
}

// Devuelve la función para cancelar la suscripción
function suscribir(query, campo, onEvento) {
  return obtenerCliente().subscribe({ query }, {
    next: ({ data }) => { if (data?.[campo]) onEvento(data[campo]); },
    error: (e) => console.error(`En vivo (${campo}):`, e),
    complete: () => {},
  });
}

export const suscribirStock = (cb) =>
  suscribir('subscription { onStockActualizado { productoId stock } }', 'onStockActualizado', cb);
export const suscribirProductos = (cb) =>
  suscribir('subscription { onProductoCambiado { tipo productoId } }', 'onProductoCambiado', cb);
export const suscribirPedidos = (cb) =>
  suscribir('subscription { onPedidoCreado { pedidoId usuarioId } }', 'onPedidoCreado', cb);
