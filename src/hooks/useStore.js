import { useSyncExternalStore } from 'react';
import { GRAPHQL_ENDPOINT } from '../graphql/client';
import { obtenerUsuarioSesion, cerrarSesion as limpiarSesion } from '../auth/auth';
import { suscribirStock, suscribirProductos } from '../services/stockEnVivo';

const enNavegador = typeof window !== 'undefined';
const CACHE = 'mascotitas:productos';
const URLS = import.meta.env.DEV
  ? [GRAPHQL_ENDPOINT, 'http://localhost:5097/graphql']
  : [GRAPHQL_ENDPOINT];

// Caché local: el catálogo aparece al instante y se actualiza en segundo plano
function leerCache() {
  if (!enNavegador) return [];
  try { return JSON.parse(localStorage.getItem(CACHE) || '[]'); } catch { return []; }
}
function guardarCache(productos) {
  try { localStorage.setItem(CACHE, JSON.stringify(productos)); } catch { /* sin espacio */ }
}

const cacheInicial = leerCache();
let state = {
  productos: cacheInicial,
  cargando: cacheInicial.length === 0,
  error: null,
  pantalla: 'HOME',
  categoriaSeleccionada: null,
  productoSeleccionadoId: null,
  cantidadSeleccionada: 1,
  busqueda: '',
  carrito: [],
  usuario: obtenerUsuarioSesion(),
};
const listeners = new Set();

function actualizarState(cambios) {
  state = { ...state, ...cambios };
  listeners.forEach((listener) => listener());
}

// Lee el usuario de sessionStorage, lo sincroniza con el state y lo devuelve
function sincronizarUsuarioDesdeSesion() {
  const usuario = obtenerUsuarioSesion() || null;
  const actual = state.usuario || null;
  if (JSON.stringify(usuario) !== JSON.stringify(actual)) {
    actualizarState({ usuario, ...(usuario ? {} : { carrito: [] }) });
  }
  return usuario;
}

let cargandoAhora = null;
let pendiente = false;

function cargarProductos() {
  if (cargandoAhora) { pendiente = true; return cargandoAhora; }

  cargandoAhora = (async () => {
    for (const url of URLS) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ productos { id nombre precio categoria categoriaId imagen stock } }' }),
        });
        const data = await response.json();
        if (data.errors) throw new Error(data.errors[0].message);
        const productos = data.data?.productos || [];
        guardarCache(productos);
        actualizarState({ productos, cargando: false, error: null });
        return;
      } catch (error) {
        console.warn(`No se pudo conectar con ${url}:`, error.message);
      }
    }
    actualizarState({
      cargando: false,
      error: state.productos.length
        ? null
        : 'No se pudo conectar con el servidor. Si acaba de despertar, espera unos segundos y recarga.',
    });
  })().finally(() => {
    cargandoAhora = null;
    if (pendiente) { pendiente = false; cargarProductos(); }
  });

  return cargandoAhora;
}

if (enNavegador) {
  cargarProductos();
  suscribirStock(({ productoId, stock }) => {
    const productos = state.productos.map((p) => (p.id === productoId ? { ...p, stock } : p));
    guardarCache(productos);
    actualizarState({ productos });
  });
  suscribirProductos(() => cargarProductos());
}

const acciones = {
  refrescarUsuario() { return sincronizarUsuarioDesdeSesion(); },
  seleccionarCategoria(categoria) { actualizarState({ categoriaSeleccionada: categoria, pantalla: 'HOME' }); },
  seleccionarProducto(producto) {
    actualizarState({ productoSeleccionadoId: producto.id, cantidadSeleccionada: 1, pantalla: 'DETALLE_PRODUCTO' });
  },
  cambiarPantalla(pantalla) {
    const usuarioActual = sincronizarUsuarioDesdeSesion();
    if (pantalla === 'CHECKOUT' && !usuarioActual) {
      alert('Inicia sesión para continuar con tu compra.');
      actualizarState({ pantalla: 'LOGIN' });
      return;
    }
    actualizarState({ pantalla });
    if (enNavegador) window.scrollTo({ top: 0 });
  },
  recargarProductos() { return cargarProductos(); },
  cambiarBusqueda(busqueda) { actualizarState({ busqueda }); },
  cambiarCantidad(cantidad) { actualizarState({ cantidadSeleccionada: Math.max(1, cantidad || 1) }); },
  agregarAlCarrito(producto, cantidad) {
    const usuarioActual = sincronizarUsuarioDesdeSesion();
    if (!usuarioActual) {
      alert('Inicia sesión para agregar productos al carrito.');
      actualizarState({ pantalla: 'LOGIN' });
      return;
    }
    const actual = state.productos.find((p) => p.id === producto.id) ?? producto;
    const enCarrito = state.carrito.find((i) => i.id === producto.id)?.cantidad ?? 0;
    if (enCarrito + cantidad > actual.stock) {
      alert(`Solo hay ${actual.stock} disponibles (ya tienes ${enCarrito} en el carrito).`);
      return;
    }
    const carrito = enCarrito
      ? state.carrito.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item))
      : [...state.carrito, { ...producto, cantidad }];
    actualizarState({ usuario: usuarioActual, carrito, pantalla: 'HOME' });
  },
  cerrarSesion() {
    limpiarSesion(); // borra token y datos del usuario
    actualizarState({ usuario: null, carrito: [], pantalla: 'HOME', productoSeleccionadoId: null });
  },
  eliminarDelCarrito(id) { actualizarState({ carrito: state.carrito.filter((item) => item.id !== id) }); },
  actualizarCantidad(id, cantidad) {
    if (cantidad <= 0) { acciones.eliminarDelCarrito(id); return; }
    const stock = state.productos.find((p) => p.id === id)?.stock ?? Infinity;
    const limitada = Math.min(cantidad, stock);
    actualizarState({ carrito: state.carrito.map((item) => (item.id === id ? { ...item, cantidad: limitada } : item)) });
  },
  vaciarCarrito() { actualizarState({ carrito: [] }); },
};

export function useStore() {
  const snapshot = useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => state,
    () => state,
  );
  const categorias = [...new Set(snapshot.productos.map((p) => p.categoria))];
  const productoSeleccionado = snapshot.productos.find((p) => p.id === snapshot.productoSeleccionadoId);
  const totalCarrito = snapshot.carrito.reduce((t, p) => t + p.precio * p.cantidad, 0);
  const totalItemsCarrito = snapshot.carrito.reduce((t, p) => t + p.cantidad, 0);
  return { ...snapshot, ...acciones, categorias, productoSeleccionado, totalCarrito, totalItemsCarrito };
}
