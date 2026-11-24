import { useCallback, useEffect, useState } from 'react';
import { fetchGraphQL } from '../graphql/client';
import { obtenerUsuarioSesion } from '../auth/auth';
import { suscribirPedidos } from '../services/stockEnVivo';
import { dinero } from '../services/pedidos';
import { MapaSoloLectura } from '../components/Mapa';
import { SolicitarFactura } from '../components/SolicitarFactura';
import { RegistrarVenta } from '../components/RegistrarVenta';
import { t, estatus, formatoFecha } from '../i18n';

const CAMPOS = 'id numeroPedidoUsuario fecha status total usuarioId nombreCompleto direccionEntrega codigoPostalEntrega coloniaEntrega ciudadEntrega estadoEntrega telefono latitud longitud paqueteria servicioEnvio costoEnvio';
const Q_MIS_PEDIDOS = `query MisPedidos($usuarioId: Int!) { pedidosPorUsuario(usuarioId: $usuarioId) { ${CAMPOS} } }`;
const Q_TODOS = `query TodosLosPedidos { pedidos { ${CAMPOS} } }`;
const Q_DETALLE = `query Detalle($pedidoId: Int!) { detallePedido(pedidoId: $pedidoId) { productoId cantidad precioUnitario } }`;
const Q_PRODUCTOS = `query { productos { id nombre } }`;

const M_CAMBIAR_STATUS = `mutation CambiarStatus($pedidoId: Int!, $status: String!) { actualizarStatusPedido(pedidoId: $pedidoId, status: $status) { id status } }`;

const ESTADOS_PEDIDO = ['Pendiente', 'Enviado', 'Entregado'];

export function Historial() {
  const usuario = obtenerUsuarioSesion();
  const usuarioId = usuario?.id ?? null;
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const [pedidos, setPedidos] = useState([]);
  const [nombres, setNombres] = useState({});
  const [detalles, setDetalles] = useState({});
  const [abierto, setAbierto] = useState(null);
  const [facturando, setFacturando] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);
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

  async function cambiarStatus(pedidoId, status) {
    setActualizandoId(pedidoId);
    try {
      await fetchGraphQL(M_CAMBIAR_STATUS, { pedidoId, status });
      setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, status } : p)));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setActualizandoId(null);
    }
  }

  if (!usuario) return <main className="page">{t('Inicia sesión para ver tus compras.')}</main>;
  if (cargando) return <main className="page">{t('Cargando compras...')}</main>;

  const columnas = esAdmin ? 6 : 5;

  return (
    <main className="page">
      <h2>{esAdmin ? t('Historial de compras') : t('Mi historial de compras')}</h2>
      {error && <div role="alert" className="alerta alerta-error">{error}</div>}

      {facturando && (
        <div className="modal-fondo" onClick={() => setFacturando(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 740, padding: '1rem' }}>
            {esAdmin ? (
              <RegistrarVenta
                pedido={pedidos.find((x) => x.id === facturando)}
                onRegistrada={(f) => {
                  setFacturando(null);
                  alert(`${t('Venta')} ${f.serie}${f.folio} ${t('facturada. Puedes verla en "Facturas".')}`);
                }}
                onCerrar={() => setFacturando(null)}
              />
            ) : (
              <SolicitarFactura
                pedidoId={facturando}
                numeroPedido={pedidos.find((x) => x.id === facturando)?.numeroPedidoUsuario}
                onFacturaEmitida={(f) => {
                  setFacturando(null);
                  alert(`${t('Factura')} ${f.serie}${f.folio} ${t('generada')} (${t('estado')}: ${estatus(f.estado)}). ${t('Puedes verla en "Facturas".')}`);
                }}
                onCerrar={() => setFacturando(null)}
              />
            )}
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <p>{t('Aún no hay compras registradas.')}</p>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>{t('Pedido')}</th>
                <th>{t('Fecha')}</th>
                {esAdmin && <th>{t('Cliente')}</th>}
                <th>{t('Estatus')}</th>
                <th>{t('Total')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <FilaPedido
                  key={p.id}
                  p={p}
                  esAdmin={esAdmin}
                  columnas={columnas}
                  abierto={abierto === p.id}
                  actualizando={actualizandoId === p.id}
                  renglones={detalles[p.id]}
                  nombres={nombres}
                  onToggle={() => alternarDetalle(p.id)}
                  onFacturar={() => setFacturando(p.id)}
                  onCambiarStatus={(nuevoStatus) => cambiarStatus(p.id, nuevoStatus)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function FilaPedido({ p, esAdmin, columnas, abierto, actualizando, renglones, nombres, onToggle, onFacturar, onCambiarStatus }) {
  const tieneMapa = p.latitud != null && p.longitud != null;
  const entregado = p.status?.toLowerCase().includes('entregado');

  const opciones = ESTADOS_PEDIDO.includes(p.status)
    ? ESTADOS_PEDIDO
    : [p.status, ...ESTADOS_PEDIDO].filter(Boolean);

  return (
    <>
      <tr>
        <td>
          {esAdmin
            ? <>#{p.id} <small>(cliente: #{p.numeroPedidoUsuario})</small></>
            : <>#{p.numeroPedidoUsuario}</>}
        </td>
        <td>{formatoFecha(p.fecha)}</td>
        {esAdmin && <td>{p.nombreCompleto || `${t('Usuario')} ${p.usuarioId}`}</td>}
        <td>
          {esAdmin ? (
            <select
              className="neu-input"
              value={p.status}
              disabled={actualizando}
              onChange={(e) => onCambiarStatus(e.target.value)}
            >
              {opciones.map((st) => (
                <option key={st} value={st}>{estatus(st)}</option>
              ))}
            </select>
          ) : (
            <div>{estatus(p.status)}</div>
          )}
        </td>
        <td>{dinero(p.total)}</td>
        <td>
          <div className="acciones" style={{ flexDirection: 'column', gap: '.4rem' }}>
            <button className="neu-btn neu-btn-sm neu-btn-primary" onClick={onToggle}>
              {abierto ? t('Ocultar') : t('Ver detalle')}
            </button>
            {entregado && (
              <button className="neu-btn neu-btn-sm" onClick={onFacturar}>
                {esAdmin ? t('Facturar venta') : t('Facturar pedido')}
              </button>
            )}
          </div>
        </td>
      </tr>

      {abierto && (
        <tr className="fila-detalle">
          <td colSpan={columnas}>
            <div className="historial-detalle">
              <div>
                <p><strong>{t('Nombre:')}</strong> {p.nombreCompleto || t('No registrado')}</p>
                <p><strong>{t('Dirección:')}</strong> {p.direccionEntrega || t('No registrada')}</p>
                <p><strong>{t('Teléfono:')}</strong> {p.telefono || t('No registrado')}</p>
                {p.paqueteria && (
                  <p><strong>{t('Paquetería:')}</strong> {p.paqueteria} — {p.servicioEnvio}</p>
                )}
                <hr style={{ margin: '.8rem 0' }} />
                <strong>{t('Productos')}</strong>
                {!renglones ? (
                  <p>{t('Cargando detalle...')}</p>
                ) : (
                  renglones.map((r) => (
                    <p key={r.productoId}>
                      {nombres[r.productoId] ?? `${t('Producto')} ${r.productoId}`} × {r.cantidad} — {dinero(r.precioUnitario)} {t('c/u')}
                    </p>
                  ))
                )}
              </div>
              <div>
                <strong>{t('Ubicación de entrega')}</strong>
                {tieneMapa
                  ? <MapaSoloLectura lat={p.latitud} lng={p.longitud} />
                  : <p className="nota">{t('Este pedido no tiene ubicación en el mapa.')}</p>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default Historial;