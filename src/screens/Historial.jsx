import { useEffect, useState } from 'react';
import { fetchGraphQL } from "../graphql/client";        
import { obtenerUsuarioSesion } from '../auth/auth';  

const Q_MIS_PEDIDOS = `
  query MisPedidos($usuarioId: Int!) {
    pedidosPorUsuario(usuarioId: $usuarioId) { id fecha status total usuarioId }
  }`;
const Q_TODOS = `
  query TodosLosPedidos {
    pedidos { id fecha status total usuarioId }
  }`;
const Q_DETALLE = `
  query Detalle($pedidoId: Int!) {
    detallePedido(pedidoId: $pedidoId) { productoId cantidad precioUnitario }
  }`;
const Q_PRODUCTOS = `query { productos { id nombre } }`;

const dinero = (n) => Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const th = { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #E8B93E', color: '#4A3623' };
const td = { padding: '0.75rem', borderBottom: '1px solid #EEE' };

export function Historial() {
  const usuario = obtenerUsuarioSesion();
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const [pedidos, setPedidos] = useState([]);
  const [nombres, setNombres] = useState({});     
  const [detalles, setDetalles] = useState({});  
  const [abierto, setAbierto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    setCargando(true);
    const consulta = esAdmin
      ? fetchGraphQL(Q_TODOS)
      : fetchGraphQL(Q_MIS_PEDIDOS, { usuarioId: usuario.id });

    Promise.all([consulta, fetchGraphQL(Q_PRODUCTOS)])
      .then(([dPedidos, dProductos]) => {
        setPedidos(esAdmin ? dPedidos.pedidos : dPedidos.pedidosPorUsuario);
        setNombres(Object.fromEntries(dProductos.productos.map((p) => [p.id, p.nombre])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!usuario) return <p style={{ padding: '2rem' }}>Inicia sesión para ver tus compras.</p>;
  if (cargando) return <p style={{ padding: '2rem' }}>Cargando compras...</p>;

  return (
    <section style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ color: '#4A3623' }}>{esAdmin ? 'Todas las compras' : 'Mis compras'}</h2>
      {error && <p style={{ color: '#A32D2D' }}>{error}</p>}
      {pedidos.length === 0 ? (
        <p>Aún no hay compras registradas.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12 }}>
          <thead>
            <tr>
              <th style={th}>Pedido</th>
              <th style={th}>Fecha</th>
              {esAdmin && <th style={th}>Cliente (id)</th>}
              <th style={th}>Estatus</th>
              <th style={th}>Total</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <FilaPedido
                key={p.id} p={p} esAdmin={esAdmin}
                abierto={abierto === p.id} renglones={detalles[p.id]} nombres={nombres}
                onToggle={() => alternarDetalle(p.id)}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function FilaPedido({ p, esAdmin, abierto, renglones, nombres, onToggle }) {
  return (
    <>
      <tr>
        <td style={td}>#{p.id}</td>
        <td style={td}>{new Date(p.fecha).toLocaleString('es-MX')}</td>
        {esAdmin && <td style={td}>{p.usuarioId}</td>}
        <td style={td}>{p.status}</td>
        <td style={td}>{dinero(p.total)}</td>
        <td style={td}>
          <button onClick={onToggle} style={{ background: '#E8734A', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
            {abierto ? 'Ocultar' : 'Ver detalle'}
          </button>
        </td>
      </tr>
      {abierto && (
        <tr>
          <td style={{ ...td, background: '#FDF6E3' }} colSpan={esAdmin ? 6 : 5}>
            {!renglones ? 'Cargando detalle...' : renglones.map((r) => (
              <div key={r.productoId}>
                {nombres[r.productoId] ?? `Producto ${r.productoId}`} × {r.cantidad} — {dinero(r.precioUnitario)} c/u
              </div>
            ))}
          </td>
        </tr>
      )}
    </>
  );
}