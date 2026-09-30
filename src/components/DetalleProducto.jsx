import { useStore } from '../store/useStore';
import shampoo from '../assets/shampoo.png';
import correa from '../assets/correa.png';
import pelota from '../assets/pelota.png';
import raton from "../assets/raton.png";
import cama from "../assets/cama.png";



const imagenes = {
  'croquetas.png': shampoo,
  'sobre.png': shampoo,
  'pelota.png': pelota,
  'raton.png': raton,
  'correa.png': correa,
  'cama.png': cama,
};

export function DetalleProducto({ productoId }) {
  const { productos, cantidadSeleccionada, cambiarCantidad, agregarAlCarrito, cambiarPantalla } = useStore();
  const producto = productos.find((item) => item.id === productoId);
  if (!producto) return <main style={{ padding: '2rem' }}>Producto no encontrado.</main>;
  const src = imagenes[producto.imagen] || correa;
  return <main style={{ padding: '2rem' }}><div style={{ backgroundColor: '#FFF', padding: '2.5rem', borderRadius: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
    <img src={src} alt={producto.nombre} style={{ display: 'block', width: 'min(100%, 280px)', height: '280px', objectFit: 'contain', margin: '0 auto 1rem' }} /><h2 style={{ color: '#3A2E22' }}>{producto.nombre}</h2><p style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>${producto.precio} MXN</p>
    <label>Cantidad: <input type="number" min="1" value={cantidadSeleccionada} onChange={(event) => cambiarCantidad(parseInt(event.target.value, 10))} style={{ width: '60px', padding: '0.5rem' }} /></label>
    <button onClick={() => agregarAlCarrito(producto, cantidadSeleccionada)} style={{ display: 'block', width: '100%', marginTop: '1.5rem', backgroundColor: '#E8734A', color: '#FFF', border: 0, padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}>Agregar al Carrito</button>
    <button onClick={() => cambiarPantalla('HOME')} style={{ marginTop: '1rem', background: 'none', border: 0, cursor: 'pointer' }}>Volver al catálogo</button>
  </div></main>;
}