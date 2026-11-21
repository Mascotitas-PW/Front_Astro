import { useCallback, useEffect, useState } from 'react';
import { listarDomicilios, guardarDomicilio, eliminarDomicilio } from '../services/domicilios';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n';

export function Domicilios() {
  const { cambiarPantalla } = useStore();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try { setLista(await listarDomicilios()); setError(null); }
    catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const accion = async (fn) => {
    try { await fn(); await cargar(); } catch (e) { setError(e.message); }
  };

  const predeterminar = (d) => accion(() => guardarDomicilio({ ...d, predeterminado: true }));
  const quitar = (d) => {
    if (window.confirm(`¿Eliminar el domicilio "${d.alias}"?`)) accion(() => eliminarDomicilio(d.id));
  };

  return (
    <main className="page">
      <h2>Mis domicilios</h2>
      {error && <div role="alert" className="alerta alerta-error">{error}</div>}
      {cargando && <p>Cargando...</p>}
      {!cargando && lista.length === 0 && (
        <p>
          Aún no tienes domicilios guardados. Se guardan al comprar: marca “Guardar este domicilio” en el checkout.
        </p>
      )}

      <div className="domicilios-grid">
        {lista.map((d) => (
          <article key={d.id} className="neu-card domicilio">
            <h3>
              {d.alias} {d.predeterminado && <span className="badge badge-ok">Predeterminado</span>}
            </h3>
            <p>
              <strong>{d.nombreCompleto}</strong><br />
              {d.direccion}
              {d.colonia ? `, ${d.colonia}` : ''}{d.ciudad ? `, ${d.ciudad}` : ''}{d.estado ? `, ${d.estado}` : ''}
              {d.codigoPostal ? ` · C.P. ${d.codigoPostal}` : ''}<br />
              Tel. {d.telefono}
            </p>
            {d.latitud != null && <p className="nota nota-ok">✓ Con ubicación en el mapa</p>}
            <div className="acciones">
              {!d.predeterminado && <button type="button" className="neu-btn neu-btn-sm" onClick={() => predeterminar(d)}>Hacer predeterminado</button>}
              <button type="button" className="neu-btn neu-btn-sm neu-btn-danger" onClick={() => quitar(d)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <p style={{ marginTop: '1.5rem' }}>
        <button type="button" className="neu-btn neu-btn-primary" onClick={() => cambiarPantalla('HOME')}>Ir a la tienda</button>
      </p>
    </main>
  );
}

export default Domicilios;