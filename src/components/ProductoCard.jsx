export default function ProductoCard({ producto, onVer }) {
  const fallback = `${import.meta.env.BASE_URL}productos/cama.png`;
  const src = producto?.imagen
    ? `${import.meta.env.BASE_URL}productos/${producto.imagen}`
    : fallback;

  return (
    <article className="producto-card" onClick={onVer}>
      <img
        src={src}
        alt={producto.nombre}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallback;
        }}
      />
      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <p className="precio">${producto.precio}</p>
      </div>
    </article>
  );
}