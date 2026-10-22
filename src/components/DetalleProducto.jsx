import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { obtenerUsuarioSesion } from '../auth/auth';

export function DetalleProducto({ productoId }) {
  const { productos, carrito, cantidadSeleccionada, cambiarCantidad, agregarAlCarrito, cambiarPantalla } = useStore();
  const usuario = obtenerUsuarioSesion();
  const producto = productos.find((item) => item.id === productoId);

  const stock = producto?.stock ?? 0;
  const enCarrito = carrito.find((i) => i.id === productoId)?.cantidad ?? 0;
  const disponible = Math.max(0, stock - enCarrito); // lo que aún se puede agregar
  const agotado = disponible === 0;

  // Si el stock baja en vivo, la cantidad elegida se ajusta sola
  useEffect(() => {
    if (disponible > 0 && cantidadSeleccionada > disponible) cambiarCantidad(disponible);
  }, [disponible, cantidadSeleccionada]);

  if (!producto) return <main style={{ padding: '2rem' }}>Producto no encontrado.</main>;

  const fallback = `${import.meta.env.BASE_URL}productos/cama.png`;
  const src = producto?.imagen ? `${import.meta.env.BASE_URL}productos/${producto.imagen}` : fallback;

  const manejarCantidad = (event) => {
    const n = parseInt(event.target.value, 10);
    cambiarCantidad(Math.min(Math.max(1, n || 1), Math.max(1, disponible)));
  };

  const colorStock = stock <= 0 ? '#A32D2D' : stock <= 5 ? '#C98A00' : '#3B7A3B';

  return (
    <main style={{ padding: '2rem' }}>
      <div style={{ backgroundColor: '#FFF', padding: '2.5rem', borderRadius: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <button
          onClick={() => cambiarPantalla('HOME')}
          style={{ background: 'none', border: 0, cursor: 'pointer', color: '#ff4800', fontSize: '2rem', position: 'relative', left: '-220px', top: '-35px' }}
        >
          ✕
        </button>
        <img
          src={src}
          alt={producto.nombre}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
          style={{ display: 'block', width: 'min(100%, 280px)', height: '280px', objectFit: 'contain', margin: '0 auto 1rem' }}
        />
        <h2 style={{ color: '#3A2E22' }}>{producto.nombre}</h2>
        <p style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>${producto.precio} MXN</p>

        <p style={{ color: colorStock, fontWeight: 600, margin: '0 0 1rem' }}>
          {stock <= 0 ? 'Agotado' : `Stock: ${stock} disponibles`} <small>● en vivo</small>
        </p>

        <label>
          Cantidad:{' '}
          <input
            type="number"
            min="1"
            max={Math.max(1, disponible)}
            value={cantidadSeleccionada}
            onChange={manejarCantidad}
            disabled={agotado}
            style={{ width: '60px', padding: '0.5rem' }}
          />
          <small style={{ marginLeft: 8, color: '#7A6A55' }}>
            (máx. {disponible}{enCarrito > 0 ? `, ya tienes ${enCarrito} en el carrito` : ''})
          </small>
        </label>

        <button
          disabled={!!usuario && agotado}
          onClick={() => {
            if (!usuario) { cambiarPantalla('LOGIN'); return; }
            agregarAlCarrito(producto, cantidadSeleccionada);
          }}
          style={{
            display: 'block', width: '100%', marginTop: '1.5rem',
            backgroundColor: usuario && agotado ? '#B8B0A2' : '#E8734A',
            color: '#FFF', border: 0, padding: '1rem', borderRadius: '8px',
            cursor: usuario && agotado ? 'not-allowed' : 'pointer',
          }}
        >
          {!usuario ? 'Inicia sesión para agregar' : agotado ? (stock <= 0 ? 'Agotado' : 'Ya tienes todo el stock en tu carrito') : 'Agregar al Carrito'}
        </button>

        <button
          onClick={() => cambiarPantalla('HOME')}
          style={{ marginTop: '1rem', background: 'none', border: 0, cursor: 'pointer' }}
        >
          Volver al catálogo
        </button>
      </div>
    </main>
  );
}