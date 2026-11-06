import { createClient } from 'graphql-ws';
import { GRAPHQL_ENDPOINT } from '../graphql/client';

let cliente = null;

function obtenerCliente() {
  if (!cliente) {
    cliente = createClient({
      url: GRAPHQL_ENDPOINT.replace(/^http/, 'ws'), // http->ws, https->wss
      retryAttempts: Infinity,
    });
  }
  return cliente;
}

// Llama a onStock({ productoId, stock }) cada vez que cambia el stock de un producto.
// Devuelve la función para cancelar la suscripción (sirve directo en useEffect).
export function suscribirStock(onStock) {
  return obtenerCliente().subscribe(
    { query: 'subscription { onStockActualizado { productoId stock } }' },
    {
      next: ({ data }) => {
        if (data?.onStockActualizado) onStock(data.onStockActualizado);
      },
      error: (e) => console.error('Stock en vivo:', e),
      complete: () => {},
    },
  );
}
