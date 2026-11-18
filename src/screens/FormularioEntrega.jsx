import { MapaEntrega } from '../components/Mapa';

export default function FormularioEntrega({
  entrega, onCambiar, onUbicacion,
  domicilios = [], domicilioId = '', onElegirDomicilio,
  guardarDom, onGuardarDom, aliasDom, onAliasDom,
  metodoPago, onMetodoPago, onSubmit, deshabilitado, loading,
}) {
  const usandoGuardado = domicilioId !== '';

  return (
    <form onSubmit={onSubmit} className="neu-card form-grid">
      {domicilios.length > 0 && (
        <label className="field span-2">
          Mis domicilios
          <select value={domicilioId} onChange={(e) => onElegirDomicilio(e.target.value)}>
            {domicilios.map((d) => (
              <option key={d.id} value={d.id}>{d.alias} — {d.direccion}</option>
            ))}
            <option value="">➕ Usar otro domicilio</option>
          </select>
        </label>
      )}

      <label className="field span-2">
        Nombre completo
        <input required type="text" value={entrega.nombre} autoComplete="name"
          onChange={(e) => onCambiar('nombre', e.target.value)} placeholder="Ej. Juan Pérez" />
      </label>

      <label className="field span-2">
        Dirección de entrega
        <input required type="text" value={entrega.direccion} autoComplete="street-address"
          onChange={(e) => onCambiar('direccion', e.target.value)} placeholder="Calle, número, colonia, ciudad" />
      </label>

      <label className="field">
        Código postal
        <input type="text" inputMode="numeric" maxLength={5} value={entrega.cp} autoComplete="postal-code"
          onChange={(e) => onCambiar('cp', e.target.value.replace(/\D/g, ''))} placeholder="5 dígitos" />
      </label>

      <label className="field">
        Teléfono de contacto
        <input required type="tel" value={entrega.telefono} autoComplete="tel"
          onChange={(e) => onCambiar('telefono', e.target.value)} placeholder="10 dígitos" />
      </label>

      <MapaEntrega
        direccion={entrega.direccion}
        ubicacion={entrega.lat != null ? { lat: entrega.lat, lng: entrega.lng } : null}
        onUbicacion={onUbicacion}
        onDireccion={(texto) => onCambiar('direccion', texto)}
      />

      {!usandoGuardado && (
        <>
          <label className="consent-check span-2">
            <input type="checkbox" checked={!!guardarDom} onChange={(e) => onGuardarDom(e.target.checked)} />
            <span>Guardar este domicilio para mis próximas compras</span>
          </label>
          {guardarDom && (
            <label className="field span-2">
              Nombre del domicilio
              <input type="text" maxLength={40} value={aliasDom} onChange={(e) => onAliasDom(e.target.value)} placeholder="Casa, Trabajo..." />
            </label>
          )}
        </>
      )}

      <label className="field span-2">
        Método de pago
        <select value={metodoPago} onChange={(e) => onMetodoPago(e.target.value)}>
          <option value="Tarjeta">Tarjeta de crédito / débito</option>
          <option value="PayPal">PayPal</option>
          <option value="Efectivo">Efectivo contra entrega</option>
          <option value="Transferencia">Transferencia SPEI</option>
        </select>
      </label>

      {(metodoPago === 'Efectivo' || metodoPago === 'Transferencia') && (
        <button type="submit" disabled={deshabilitado} className="neu-btn neu-btn-primary span-2">
          {loading ? 'Procesando pedido...' : 'Confirmar y enviar pedido'}
        </button>
      )}
    </form>
  );
}

export { FormularioEntrega };
