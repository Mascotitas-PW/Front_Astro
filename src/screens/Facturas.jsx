import { useCallback, useEffect, useState } from 'react';
import { obtenerUsuarioSesion } from '../auth/auth';
import {
  listarMisFacturas, descargarXml, descargarPdf, verHtml,
} from '../services/facturas';
import { dinero } from '../services/pedidos';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n';

const dineroLocal = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export function Facturas() {
  const usuario = obtenerUsuarioSesion();
  const { cambiarPantalla } = useStore();
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [descargando, setDescargando] = useState(null); // id de la factura que se está descargando

  const cargar = useCallback(async () => {
    try {
      setFacturas(await listarMisFacturas());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const accion = async (fn, id) => {
    setDescargando(id);
    try { await fn(); } catch (e) { alert(e.message); } finally { setDescargando(null); }
  };

  const badgeEstado = (estado) => {
    const clase = estado === 'Timbrada' || estado === 'Registrada' ? 'badge-ok'
      : estado === 'Cancelada' ? 'badge-bad'
      : 'badge-warn';
    return <span className={`badge ${clase}`}>{estado}</span>;
  };

  if (!usuario) return <main className="page">Inicia sesión para ver tus facturas.</main>;
  if (cargando) return <main className="page">Cargando facturas...</main>;

  return (
    <main className="page">
      <h2>{esAdmin ? 'Ventas registradas' : 'Mis facturas'}</h2>

      {error && <div role="alert" className="alerta alerta-error">{error}</div>}

      {facturas.length === 0 ? (
        <div className="neu-card" style={{ padding: '2rem', textAlign: 'center' }}>
          {esAdmin ? (
            <>
              <p>Aún no hay ventas registradas para facturar.</p>
              <p className="nota">
                Registra la venta de un pedido entregado desde{' '}
                <button type="button" className="enlace" onClick={() => cambiarPantalla('HISTORIAL')}>
                  el historial de compras
                </button>.
              </p>
            </>
          ) : (
            <>
              <p>Aún no hay facturas emitidas.</p>
              <p className="nota">
                Puedes solicitar la factura de un pedido entregado desde{' '}
                <button type="button" className="enlace" onClick={() => cambiarPantalla('HISTORIAL')}>
                  tu historial de compras
                </button>.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Pedido</th>
                <th>Fecha</th>
                {esAdmin && <th>Cliente</th>}
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.serie}{f.folio}</strong></td>
                  <td>#{f.pedidoId}</td>
                  <td>{new Date(f.fechaEmision).toLocaleDateString('es-MX')}</td>
                  {esAdmin && <td>{f.razonSocialReceptor}</td>}
                  <td>{dineroLocal(f.total)}</td>
                  <td>{badgeEstado(f.estado)}</td>
                  <td>
                    <div className="acciones" style={{ flexWrap: 'wrap', gap: '.5rem' }}>
                      <button
                        type="button"
                        className="neu-btn neu-btn-sm"
                        disabled={descargando === f.id}
                        onClick={() => accion(() => verHtml(f.id), f.id)}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="neu-btn neu-btn-sm"
                        disabled={descargando === f.id}
                        onClick={() => accion(() => descargarPdf(f.id, f.folio), f.id)}
                      >
                        PDF / HTML
                      </button>
                      {f.origen !== 'Empresa' && (
                        <button
                          type="button"
                          className="neu-btn neu-btn-sm"
                          disabled={descargando === f.id}
                          onClick={() => accion(() => descargarXml(f.id, f.folio), f.id)}
                        >
                          XML
                        </button>
                      )}
                    </div>
                    {f.estado === 'Borrador' && f.motivoError && (
                      <p className="nota" style={{ color: 'var(--neu-rojo)', marginTop: '.3rem' }}>
                        Error: {f.motivoError}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Facturas;