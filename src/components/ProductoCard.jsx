import { urlImagen } from '../services/imagenes';

export default function ProductoCard({ producto, onVer }) {
  const fallback = `${import.meta.env.BASE_URL}productos/cama.png`;
  const src = producto?.imagen ? urlImagen(producto.imagen) : fallback;

  return (
    <article className="producto-card" onClick={onVer}>
      {producto.stock <= 0 && <span className="badge badge-bad">Agotado</span>}
      <img
        src={src}
        alt={producto.nombre}
        loading="lazy"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
      />
      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <p className="precio">${Number(producto.precio).toFixed(2)}</p>
      </div>
    </article>
  );
}
