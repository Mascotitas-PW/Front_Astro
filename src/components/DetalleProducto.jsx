import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { urlImagen, SIN_IMAGEN } from '../services/imagenes';
import { obtenerUsuarioSesion } from '../auth/auth';
import { dinero } from '../services/pedidos';
import { t } from '../i18n';

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

  if (!producto) return <main className="page">{t('Producto no encontrado.')}</main>;

  const src = urlImagen(producto.imagen) || SIN_IMAGEN;

  const manejarCantidad = (event) => {
    const n = parseInt(event.target.value, 10);
    cambiarCantidad(Math.min(Math.max(1, n || 1), Math.max(1, disponible)));
  };

  const claseStock = stock <= 0 ? 'badge-bad' : stock <= 5 ? 'badge-warn' : 'badge-ok';

  return (
    <main className="detalle neu-card">
      <button className="detalle-cerrar neu-btn" onClick={() => cambiarPantalla('HOME')} aria-label={t('Cerrar')}>✕</button>
      <img
        src={src}
        alt={producto.nombre}
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_IMAGEN; }}
      />
      <h2>{producto.nombre}</h2>
      <p className="detalle-precio">{dinero(producto.precio)} <small className="mas-iva">{t('+ IVA')}</small></p>
      <span className={`badge ${claseStock}`}>
        {stock <= 0 ? t('Agotado') : `${t('Stock')}: ${stock} ${t('disponibles')}`}
      </span>

      <div className="detalle-cantidad">
        <label htmlFor="cantidad">{t('Cantidad:')}</label>
        <input
          id="cantidad"
          type="number"
          min="1"
          max={Math.max(1, disponible)}
          value={cantidadSeleccionada}
          onChange={manejarCantidad}
          disabled={agotado}
        />
        <small>
          ({t('máx.')} {disponible}{enCarrito > 0 ? `, ${t('ya tienes')} ${enCarrito} ${t('en el carrito')}` : ''})
        </small>
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
          ? t('Inicia sesión para agregar')
          : agotado
            ? (stock <= 0 ? t('Agotado') : t('Ya tienes todo el stock en tu carrito'))
            : t('Agregar al carrito')}
      </button>

      <button className="neu-btn neu-btn-block" style={{ marginTop: '1rem' }} onClick={() => cambiarPantalla('HOME')}>
        {t('Volver al catálogo')}
      </button>
    </main>
  );
}