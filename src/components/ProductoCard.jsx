import { urlImagen, SIN_IMAGEN } from '../services/imagenes';
import { t } from '../i18n';

export default function ProductoCard({ producto, onVer, prioridad = false }) {
  const src = urlImagen(producto?.imagen) || SIN_IMAGEN;

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
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_IMAGEN; }}
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