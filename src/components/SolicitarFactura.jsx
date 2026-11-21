import { useEffect, useState } from 'react';
import {
  listarMisDatosFiscales, guardarDatosFiscales,
  obtenerCatalogos, solicitarFactura,
} from '../services/facturas';
import { t } from '../i18n';

const VACIO = {
  alias: 'Principal', rfc: '', razonSocial: '', regimenFiscal: '',
  codigoPostalFiscal: '', domicilioFiscal: '', predeterminado: false,
};

export function SolicitarFactura({ pedidoId, onFacturaEmitida, onCerrar }) {
  const [catalogos, setCatalogos] = useState({ usosCfdi: {}, regimenesFiscales: {} });
  const [datosFiscales, setDatosFiscales] = useState([]);
  const [perfilId, setPerfilId] = useState('');       // '' = nuevo perfil
  const [form, setForm] = useState(VACIO);
  const [usoCfdi, setUsoCfdi] = useState('G03');
  const [guardar, setGuardar] = useState(true);       // guardar el perfil para próximas veces
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([listarMisDatosFiscales(), obtenerCatalogos()])
      .then(([perfiles, cats]) => {
        setDatosFiscales(perfiles);
        setCatalogos(cats);
        const pred = perfiles.find((p) => p.predeterminado) ?? perfiles[0];
        if (pred) {
          setPerfilId(String(pred.id));
          setForm({ ...VACIO, ...pred });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const cambiar = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const usandoPerfil = perfilId !== '' && datosFiscales.find((p) => String(p.id) === perfilId);

  const elegirPerfil = (id) => {
    setPerfilId(id);
    if (id === '') { setForm(VACIO); return; }
    const p = datosFiscales.find((x) => String(x.id) === id);
    if (p) setForm({ ...VACIO, ...p });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      // Si eligió un perfil guardado y no editó, usar el id; si es nuevo o editó, mandar los datos
      const input = usandoPerfil && !form._editado
        ? { pedidoId, datosFiscalesId: Number(perfilId), usoCfdi }
        : {
            pedidoId,
            rfc: form.rfc.trim().toUpperCase(),
            razonSocial: form.razonSocial.trim().toUpperCase(),
            regimenFiscal: form.regimenFiscal,
            codigoPostalFiscal: form.codigoPostalFiscal.trim(),
            domicilioFiscal: form.domicilioFiscal.trim() || null,
            usoCfdi,
          };

      // Si marcó "guardar este perfil" y no es perfil ya guardado, guardarlo primero
      if (guardar && !usandoPerfil) {
        await guardarDatosFiscales({
          id: null, alias: form.alias.trim() || 'Principal',
          rfc: form.rfc.trim().toUpperCase(),
          razonSocial: form.razonSocial.trim().toUpperCase(),
          regimenFiscal: form.regimenFiscal,
          codigoPostalFiscal: form.codigoPostalFiscal.trim(),
          domicilioFiscal: form.domicilioFiscal.trim() || null,
          predeterminado: datosFiscales.length === 0,
        });
      }

      const factura = await solicitarFactura(input);
      onFacturaEmitida(factura);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="neu-card" style={{ padding: '2rem' }}>Cargando catálogos...</div>;

  return (
    <form onSubmit={enviar} className="neu-card form-grid" style={{ maxWidth: 700 }}>
      <h3 className="span-2">Solicitar factura — Pedido #{pedidoId}</h3>

      {datosFiscales.length > 0 && (
        <label className="field span-2">
          Mis datos fiscales guardados
          <select value={perfilId} onChange={(e) => elegirPerfil(e.target.value)}>
            {datosFiscales.map((p) => (
              <option key={p.id} value={p.id}>{p.alias} — {p.rfc}</option>
            ))}
            <option value="">➕ Usar otros datos</option>
          </select>
        </label>
      )}

      {/* Cuando no hay perfil guardado o eligió "usar otros datos" */}
      {!usandoPerfil && (
        <>
          <label className="field">
            RFC *
            <input required type="text" maxLength={13} value={form.rfc}
              onChange={cambiar('rfc')} placeholder="XAXX010101000" />
          </label>
          <label className="field">
            Razón social o nombre *
            <input required type="text" value={form.razonSocial}
              onChange={cambiar('razonSocial')} placeholder="JUAN PEREZ GARCIA" />
          </label>
          <label className="field">
            Régimen fiscal *
            <select required value={form.regimenFiscal} onChange={cambiar('regimenFiscal')}>
              <option value="">Selecciona…</option>
              {Object.entries(catalogos.regimenesFiscales).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Código postal fiscal *
            <input required type="text" inputMode="numeric" maxLength={5}
              value={form.codigoPostalFiscal} onChange={cambiar('codigoPostalFiscal')}
              placeholder="44100" />
          </label>
          <label className="field span-2">
            Domicilio fiscal (opcional)
            <input type="text" value={form.domicilioFiscal} onChange={cambiar('domicilioFiscal')}
              placeholder="Calle, número, colonia, ciudad" />
          </label>
          <label className="consent-check span-2">
            <input type="checkbox" checked={guardar} onChange={(e) => setGuardar(e.target.checked)} />
            <span>Guardar estos datos para mis próximas facturas</span>
          </label>
          {guardar && (
            <label className="field span-2">
              Nombre de este perfil fiscal
              <input type="text" maxLength={40} value={form.alias}
                onChange={cambiar('alias')} placeholder="Mi empresa, RFC personal…" />
            </label>
          )}
        </>
      )}

      <label className="field span-2">
        Uso del CFDI *
        <select required value={usoCfdi} onChange={(e) => setUsoCfdi(e.target.value)}>
          {Object.entries(catalogos.usosCfdi).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>

      {error && <div role="alert" className="alerta alerta-error span-2">{error}</div>}

      <div className="acciones span-2">
        <button type="button" className="neu-btn" onClick={onCerrar}>Cancelar</button>
        <button type="submit" className="neu-btn neu-btn-primary" disabled={enviando}>
          {enviando ? 'Generando factura…' : 'Generar factura'}
        </button>
      </div>
    </form>
  );
}

export default SolicitarFactura;
