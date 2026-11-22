import { useCallback, useEffect, useState } from 'react';
import { obtenerUsuarioSesion } from '../auth/auth';
import {
  listarMisFacturas, descargarXml, descargarPdf, verHtml,
} from '../services/facturas';
import { dinero } from '../services/pedidos';
import { useStore } from '../hooks/useStore';
import { t, fechaLoc } from '../i18n';

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
    return <span className={`badge ${clase}`}>{t(estado)}</span>;
  };

  if (!usuario) return <main className="page">{t('Inicia sesión para ver tus facturas.')}</main>;
  if (cargando) return <main className="page">{t('Cargando facturas...')}</main>;

  return (
    <main className="page">
      <h2>{esAdmin ? t('Ventas facturadas') : t('Mis facturas')}</h2>

      {error && <div role="alert" className="alerta alerta-error">{error}</div>}

      {facturas.length === 0 ? (
        <div className="neu-card" style={{ padding: '2rem', textAlign: 'center' }}>
          {esAdmin ? (
            <>
              <p>{t('Aún no hay ventas facturadas.')}</p>
              <p className="nota">
                {t('Registra la venta de un pedido entregado desde')}{' '}
                <button type="button" className="enlace" onClick={() => cambiarPantalla('HISTORIAL')}>
                  {t('el historial de compras')}
                </button>.
              </p>
            </>
          ) : (
            <>
              <p>{t('Aún no hay facturas emitidas.')}</p>
              <p className="nota">
                {t('Puedes solicitar la factura de un pedido entregado desde')}{' '}
                <button type="button" className="enlace" onClick={() => cambiarPantalla('HISTORIAL')}>
                  {t('tu historial de compras')}
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
                <th>{t('Folio')}</th>
                <th>{t('Pedido')}</th>
                <th>{t('Fecha')}</th>
                {esAdmin && <th>{t('Cliente')}</th>}
                <th>{t('Total')}</th>
                <th>{t('Estado')}</th>
                <th>{t('Acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.serie}{f.folio}</strong></td>
                  <td>#{f.pedidoId}</td>
                  <td>{fechaLoc(f.fechaEmision)}</td>
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
                        {t('Ver')}
                      </button>
                      <button
                        type="button"
                        className="neu-btn neu-btn-sm"
                        disabled={descargando === f.id}
                        onClick={() => accion(() => descargarPdf(f.id, f.folio), f.id)}
                      >
                        {t('PDF / HTML')}
                      </button>
                      {f.origen !== 'Empresa' && (
                        <button
                          type="button"
                          className="neu-btn neu-btn-sm"
                          disabled={descargando === f.id}
                          onClick={() => accion(() => descargarXml(f.id, f.folio), f.id)}
                        >
                          {t('XML')}
                        </button>
                      )}
                    </div>
                    {f.estado === 'Borrador' && f.motivoError && (
                      <p className="nota" style={{ color: 'var(--neu-rojo)', marginTop: '.3rem' }}>
                        {t('Error')}: {f.motivoError}
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