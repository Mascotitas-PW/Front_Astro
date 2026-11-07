import { urlImagen } from '../services/imagenes';

export default function ProductoCard({ producto, onVer, prioridad = false }) {
  const fallback = `${import.meta.env.BASE_URL}productos/cama.png`;
  const src = producto?.imagen ? urlImagen(producto.imagen) : fallback;

  return (
    <article className="producto-card">
      {producto.stock <= 0 && <span className="badge badge-bad">Agotado</span>}
      <img
        src={src}
        alt={producto.nombre}
        width="320"
        height="320"
        loading={prioridad ? 'eager' : 'lazy'}
        fetchPriority={prioridad ? 'high' : 'auto'}
        decoding="async"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
      />
      <div className="producto-info">
        <h3>
          <button type="button" className="producto-link" onClick={onVer}>
            {producto.nombre}
          </button>
        </h3>
        <p className="precio">${Number(producto.precio).toFixed(2)}</p>
      </div>
    </article>
  );
}