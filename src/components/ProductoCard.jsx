import shampoo from "../assets/shampoo.png";
import correa from "../assets/correa.png";
import pelota from "../assets/pelota.png";
import raton from "../assets/raton.png";
import cama from "../assets/cama.png";


const imagenes = {
  "croquetas.png": shampoo,
  "sobre.png": shampoo,
  "pelota.png": pelota,
  "raton.png": raton,
  "correa.png": correa,
  "cama.png": cama,
};

export default function ProductoCard({ producto, onVer }) {
  const src = imagenes[producto.imagen] || correa;

  return (
    <article className="producto-card" onClick={onVer}>
      <img
        src={src}
        alt={producto.nombre}
      />
      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <p className="precio">${producto.precio}</p>
      </div>
    </article>
  );
}