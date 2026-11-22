import { useState } from 'react';
import { registrarVenta } from '../services/facturas';

const FORMAS = ['Efectivo', 'Tarjeta', 'PayPal'];
const deducir = (s = '') =>
  /paypal/i.test(s) ? 'PayPal' : /mercado/i.test(s) ? 'Tarjeta' : /efectivo/i.test(s) ? 'Efectivo' : 'Efectivo';

export function RegistrarVenta({ pedido, onRegistrada, onCerrar }) {
  const [cliente, setCliente] = useState(pedido?.nombreCompleto ?? '');
  const [forma, setForma] = useState(deducir(pedido?.status));
  const [obs, setObs] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      onRegistrada(await registrarVenta({
        pedidoId: pedido.id, cliente: cliente.trim() || null, formaPago: forma, observaciones: obs.trim() || null,
      }));
    } catch (err) { setError(err.message); } finally { setEnviando(false); }
  };

  return (
    <form onSubmit={enviar} className="neu-card form-grid" style={{ maxWidth: 700 }}>
      <h3 className="span-2">Facturar venta — Pedido #{pedido?.id}</h3>
      <label className="field span-2">Cliente (opcional)
        <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Público en general" />
      </label>
      <label className="field span-2">Forma de pago
        <select value={forma} onChange={(e) => setForma(e.target.value)}>
          {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>
      <label className="field span-2">Observaciones (opcional)
        <input value={obs} onChange={(e) => setObs(e.target.value)} maxLength={200} />
      </label>
      {error && <div role="alert" className="alerta alerta-error span-2">{error}</div>}
      <div className="acciones span-2">
        <button type="button" className="neu-btn" onClick={onCerrar}>Cancelar</button>
        <button type="submit" className="neu-btn neu-btn-primary" disabled={enviando}>
          {enviando ? 'Facturando…' : 'Facturar venta'}
        </button>
      </div>
    </form>
  );
}

export default RegistrarVenta;