import { useSyncExternalStore } from 'react';
import { GRAPHQL_ENDPOINT } from '../graphql/client';
import { obtenerUsuarioSesion } from '../utils/auth';

const graphqlUrls = [GRAPHQL_ENDPOINT, 'http://localhost:5097/graphql'];
let state = { productos: [], cargando: true, error: null, pantalla: 'HOME', categoriaSeleccionada: null, productoSeleccionadoId: null, cantidadSeleccionada: 1, busqueda: '', carrito: [], usuario: obtenerUsuarioSesion() };
const listeners = new Set();

function actualizarState(cambios) {
  state = { ...state, ...cambios };
  listeners.forEach((listener) => listener());
}

async function cargarProductos() {
  for (const url of graphqlUrls) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '{ productos { id nombre precio categoria imagen stock } }' }) });
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      actualizarState({ productos: data.data?.productos || [], cargando: false });
      return;
    } catch (error) {
      console.warn(`No se pudo conectar con ${url}:`, error.message);
    }
  }
  actualizarState({ cargando: false, error: 'No se pudo conectar con el backend C# GraphQL. Revisa que esté corriendo en https://backastro-production.up.railway.app/graphql/ o http://localhost:5097/graphql.' });
}

if (typeof window !== 'undefined') cargarProductos();

const acciones = {
  seleccionarCategoria(categoria) { actualizarState({ categoriaSeleccionada: categoria, pantalla: 'HOME' }); },
  seleccionarProducto(producto) { actualizarState({ productoSeleccionadoId: producto.id, cantidadSeleccionada: 1, pantalla: 'DETALLE_PRODUCTO' }); },
  cambiarPantalla(pantalla) {
    if (pantalla === 'CHECKOUT' && !state.usuario) {
      alert('Inicia sesión para continuar con tu compra.');
      window.location.href = `${import.meta.env.BASE_URL}Login/`;
      return;
    }
    actualizarState({ pantalla });
  },
  cambiarBusqueda(busqueda) { actualizarState({ busqueda }); },
  cambiarCantidad(cantidad) { actualizarState({ cantidadSeleccionada: Math.max(1, cantidad || 1) }); },
  agregarAlCarrito(producto, cantidad) {
    if (!state.usuario) {
      alert('Inicia sesión para agregar productos al carrito.');
      window.location.href = `${import.meta.env.BASE_URL}Login/`;
      return;
    }
    const itemExistente = state.carrito.find((item) => item.id === producto.id);
    const carrito = itemExistente
      ? state.carrito.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item)
      : [...state.carrito, { ...producto, cantidad }];
    actualizarState({ carrito, pantalla: 'HOME' });
  },
  cerrarSesion() {
    if (typeof window !== 'undefined') {
      ['usuarioId', 'id', 'adminemail', 'email', 'usuarioNombre', 'usuarioRol', 'adminNombre'].forEach((key) => sessionStorage.removeItem(key));
    }
    actualizarState({ usuario: null, carrito: [], pantalla: 'HOME', productoSeleccionadoId: null });
  },
  eliminarDelCarrito(id) { actualizarState({ carrito: state.carrito.filter((item) => item.id !== id) }); },
  actualizarCantidad(id, cantidad) {
    if (cantidad <= 0) {
      acciones.eliminarDelCarrito(id);
      return;
    }
    actualizarState({ carrito: state.carrito.map((item) => item.id === id ? { ...item, cantidad } : item) });
  },
  finalizarCompra() { alert('¡Pedido registrado exitosamente en el flujo!'); actualizarState({ carrito: [], pantalla: 'HOME', productoSeleccionadoId: null }); }
};

export function useStore() {
  const snapshot = useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => state, () => state);
  const categorias = [...new Set(snapshot.productos.map((producto) => producto.categoria))];
  const productoSeleccionado = snapshot.productos.find((producto) => producto.id === snapshot.productoSeleccionadoId);
  const totalCarrito = snapshot.carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
  const totalItemsCarrito = snapshot.carrito.reduce((total, producto) => total + producto.cantidad, 0);
  return { ...snapshot, ...acciones, categorias, productoSeleccionado, totalCarrito, totalItemsCarrito };
}