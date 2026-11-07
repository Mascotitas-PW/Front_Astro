import { useCallback, useEffect, useState } from 'react';
import { fetchGraphQL } from '../graphql/client';
import { obtenerUsuarioSesion } from '../auth/auth';
import { suscribirPedidos } from '../services/stockEnVivo';
import { dinero } from '../services/pedidos';
import { MapaSoloLectura } from '../components/Mapa';

const CAMPOS = 'id fecha status total usuarioId nombreCompleto direccionEntrega telefono latitud longitud';
const Q_MIS_PEDIDOS = `query MisPedidos($usuarioId: Int!) { pedidosPorUsuario(usuarioId: $usuarioId) { ${CAMPOS} } }`;
const Q_TODOS = `query TodosLosPedidos { pedidos { ${CAMPOS} } }`;
const Q_DETALLE = `query Detalle($pedidoId: Int!) { detallePedido(pedidoId: $pedidoId) { productoId cantidad precioUnitario } }`;
const Q_PRODUCTOS = `query { productos { id nombre } }`;

export function Historial() {
  const usuario = obtenerUsuarioSesion();
  const usuarioId = usuario?.id ?? null;
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const [pedidos, setPedidos] = useState([]);
  const [nombres, setNombres] = useState({});
  const [detalles, setDetalles] = useState({});
  const [abierto, setAbierto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const [dPedidos, dProductos] = await Promise.all([
        esAdmin ? fetchGraphQL(Q_TODOS) : fetchGraphQL(Q_MIS_PEDIDOS, { usuarioId }),
        fetchGraphQL(Q_PRODUCTOS),
      ]);
      setPedidos(esAdmin ? dPedidos.pedidos : dPedidos.pedidosPorUsuario);
      setNombres(Object.fromEntries(dProductos.productos.map((p) => [p.id, p.nombre])));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [usuarioId, esAdmin]);

  // Carga inicial y actualización en vivo cuando entra un pedido nuevo
  useEffect(() => {
    cargar();
    return suscribirPedidos((evento) => {
      if (esAdmin || evento.usuarioId === usuarioId) cargar();
    });
  }, [cargar, esAdmin, usuarioId]);

  async function alternarDetalle(pedidoId) {
    if (abierto === pedidoId) return setAbierto(null);
    setAbierto(pedidoId);
    if (detalles[pedidoId]) return;
    try {
      const d = await fetchGraphQL(Q_DETALLE, { pedidoId });
      setDetalles((prev) => ({ ...prev, [pedidoId]: d.detallePedido }));
    } catch (e) {
      setError(e.message);
    }
  }

  if (!usuario) return <main className="page">Inicia sesión para ver tus compras.</main>;
  if (cargando) return <main className="page">Cargando compras...</main>;

  const columnas = esAdmin ? 6 : 5;

  return (
    <main className="page">
      <h2>{esAdmin ? 'Historial de compras' : 'Mi historial de compras'}</h2>
      {error && <div className="alerta alerta-error">{error}</div>}

      {pedidos.length === 0 ? (
        <p>Aún no hay compras registradas.</p>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                {esAdmin && <th>Cliente</th>}
                <th>Estatus</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <FilaPedido
                  key={p.id} p={p} esAdmin={esAdmin} columnas={columnas}
                  abierto={abierto === p.id} renglones={detalles[p.id]} nombres={nombres}
                  onToggle={() => alternarDetalle(p.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function FilaPedido({ p, esAdmin, columnas, abierto, renglones, nombres, onToggle }) {
  const tieneMapa = p.latitud != null && p.longitud != null;
  return (
    <>
      <tr>
        <td>#{p.id}</td>
        <td>{new Date(p.fecha).toLocaleString('es-MX')}</td>
        {esAdmin && <td>{p.nombreCompleto || `Usuario ${p.usuarioId}`}</td>}
        <td>{p.status}</td>
        <td>{dinero(p.total)}</td>
        <td>
          <button className="neu-btn neu-btn-sm neu-btn-primary" onClick={onToggle}>
            {abierto ? 'Ocultar' : 'Ver detalle'}
          </button>
        </td>
      </tr>
      {abierto && (
        <tr className="fila-detalle">
          <td colSpan={columnas}>
            <div className="historial-detalle">
              <div>
                <p><strong>Nombre completo:</strong> {p.nombreCompleto || 'No registrado'}</p>
                <p><strong>Dirección de entrega:</strong> {p.direccionEntrega || 'No registrada'}</p>
                <p><strong>Teléfono:</strong> {p.telefono || 'No registrado'}</p>
                <hr />
                <strong>Productos</strong>
                {!renglones ? <p>Cargando detalle...</p> : renglones.map((r) => (
                  <p key={r.productoId}>
                    {nombres[r.productoId] ?? `Producto ${r.productoId}`} × {r.cantidad} — {dinero(r.precioUnitario)} c/u
                  </p>
                ))}
              </div>
              <div>
                <strong>Ubicación de entrega</strong>
                {tieneMapa
                  ? <MapaSoloLectura lat={p.latitud} lng={p.longitud} />
                  : <p className="nota">Este pedido no tiene ubicación en el mapa.</p>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default Historial;
