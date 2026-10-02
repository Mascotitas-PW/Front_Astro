export default function ProductoCard({ producto, onVer }) {
  // Carga directamente el archivo desde public/productos/
  const src = producto?.imagen ? `/productos/${producto.imagen}` : "/productos/correa.png";

  return (
    <article className="producto-card" onClick={onVer}>
      <img
        src={src}
        alt={producto.nombre}
        onError={(e) => {
          // Imagen por defecto si la ruta no existe o falla
          e.target.src = "/productos/correa.png";
        }}
      />
      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <p className="precio">${producto.precio}</p>
      </div>
    </article>
  );
}