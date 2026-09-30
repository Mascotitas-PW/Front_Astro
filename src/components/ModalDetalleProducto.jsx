import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchGraphQL } from "../graphql/client";
import { useCarrito } from "../context/CarritoContext";

const QUERY_PRODUCTO = `
  query Producto($id: Int!) {
    producto(id: $id) { id nombre precio imagen stock }
  }
`;

export default function ModalDetalleProducto({ productoId, onClose, dispatch }) {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { agregar } = useCarrito();

  useEffect(() => {
    setCargando(true);
    fetchGraphQL(QUERY_PRODUCTO, { id: productoId })
      .then((d) => setProducto(d.producto))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [productoId]);

  // Cerrar con Escape — detalle chico que se agradece en cualquier modal
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onClose}>✕</button>

        {error && <p className="error">{error}</p>}
        {cargando ? (
          <p>Cargando...</p>
        ) : (
          <>
            <h2>{producto.nombre}</h2>
            <p>${producto.precio}</p>
            <input
              type="number" min="1" value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
            <button
              onClick={() => { agregar(producto, cantidad); dispatch({ tipo: "IR_A_CARRITO" }); }}
            >
              Agregar al carrito
            </button>
          </>
        )}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}