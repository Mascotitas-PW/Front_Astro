import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { urlImagen } from '../services/imagenes';
import { obtenerUsuarioSesion } from '../auth/auth';
import { dinero } from '../services/pedidos';

export function DetalleProducto({ productoId }) {
  const { productos, carrito, cantidadSeleccionada, cambiarCantidad, agregarAlCarrito, cambiarPantalla } = useStore();
  const usuario = obtenerUsuarioSesion();
  const producto = productos.find((item) => item.id === productoId);

  const stock = producto?.stock ?? 0;
  const enCarrito = carrito.find((i) => i.id === productoId)?.cantidad ?? 0;
  const disponible = Math.max(0, stock - enCarrito);
  const agotado = disponible === 0;

  useEffect(() => {
    if (disponible > 0 && cantidadSeleccionada > disponible) cambiarCantidad(disponible);
  }, [disponible, cantidadSeleccionada]);

  if (!producto) return <main className="page">Producto no encontrado.</main>;

  const fallback = `${import.meta.env.BASE_URL}productos/cama.png`;
  const src = producto.imagen ? urlImagen(producto.imagen) : fallback;

  const manejarCantidad = (event) => {
    const n = parseInt(event.target.value, 10);
    cambiarCantidad(Math.min(Math.max(1, n || 1), Math.max(1, disponible)));
  };

  const claseStock = stock <= 0 ? 'badge-bad' : stock <= 5 ? 'badge-warn' : 'badge-ok';

  return (
    <main className="detalle neu-card">
      <button className="detalle-cerrar neu-btn" onClick={() => cambiarPantalla('HOME')} aria-label="Cerrar">✕</button>
      <img
        src={src}
        alt={producto.nombre}
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
      />
      <h2>{producto.nombre}</h2>
      <p className="detalle-precio">{dinero(producto.precio)}</p>
      <span className={`badge ${claseStock}`}>{stock <= 0 ? 'Agotado' : `Stock: ${stock} disponibles`}</span>

      <div className="detalle-cantidad">
        <label htmlFor="cantidad">Cantidad:</label>
        <input
          id="cantidad"
          type="number"
          min="1"
          max={Math.max(1, disponible)}
          value={cantidadSeleccionada}
          onChange={manejarCantidad}
          disabled={agotado}
        />
        <small>(máx. {disponible}{enCarrito > 0 ? `, ya tienes ${enCarrito} en el carrito` : ''})</small>
      </div>

      <button
        className="neu-btn neu-btn-primary neu-btn-block"
        disabled={!!usuario && agotado}
        onClick={() => {
          if (!usuario) { cambiarPantalla('LOGIN'); return; }
          agregarAlCarrito(producto, cantidadSeleccionada);
        }}
      >
        {!usuario
          ? 'Inicia sesión para agregar'
          : agotado
            ? (stock <= 0 ? 'Agotado' : 'Ya tienes todo el stock en tu carrito')
            : 'Agregar al carrito'}
      </button>

      <button className="neu-btn neu-btn-block" style={{ marginTop: '1rem' }} onClick={() => cambiarPantalla('HOME')}>
        Volver al catálogo
      </button>
    </main>
  );
}
