import { MapaEntrega } from '../components/Mapa';
import { t } from '../i18n';


export default function FormularioEntrega({
  entrega, colonias = [], consultandoCodigoPostal = false, errorCodigoPostal = '', onCambiar, onUbicacion,
  domicilios = [], domicilioId = '', onElegirDomicilio,
  guardarDom, onGuardarDom, aliasDom, onAliasDom,
  metodoPago, onMetodoPago, onSubmit, deshabilitado, loading,
  tarifas = [], cotizacionEnvioId, rateId, onRateId, onCotizar, cotizando,
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
        <input required type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={entrega.cp} autoComplete="postal-code"
          onChange={(e) => onCambiar('cp', e.target.value.replace(/\D/g, ''))} placeholder="5 dígitos" />
        {consultandoCodigoPostal && <small>Buscando código postal…</small>}
        {errorCodigoPostal && <small role="status">{errorCodigoPostal}; completa los datos manualmente.</small>}
      </label>

      <label className="field">Estado
        <input required value={entrega.estado} readOnly={colonias.length > 0}
          onChange={(e) => onCambiar('estado', e.target.value)} />
      </label>
      <label className="field">Ciudad o municipio
        <input required value={entrega.ciudad} readOnly={colonias.length > 0}
          onChange={(e) => onCambiar('ciudad', e.target.value)} />
      </label>
      <label className="field">Colonia
        {colonias.length > 0 ? (
          <select required value={entrega.colonia} onChange={(e) => onCambiar('colonia', e.target.value)}>
            {colonias.length > 1 && <option value="">Selecciona una colonia</option>}
            {colonias.map((colonia) => <option key={colonia} value={colonia}>{colonia}</option>)}
          </select>
        ) : (
          <input required value={entrega.colonia} onChange={(e) => onCambiar('colonia', e.target.value)} />
        )}
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

      <button type="button" className="neu-btn span-2" onClick={onCotizar} disabled={cotizando || deshabilitado}>
        {cotizando ? 'Consultando tarifas…' : 'Cotizar envío'}
      </button>

      {cotizacionEnvioId && (
        <fieldset className="span-2" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>Paquetería y servicio</legend>
          {tarifas.length === 0 ? <p>No hay tarifas disponibles para esta dirección.</p> : tarifas.map((tarifa) => (
            <label key={tarifa.id} className="field">
              <span>
                <input type="radio" name="tarifaEnvio" checked={rateId === tarifa.id}
                  onChange={() => onRateId(tarifa.id)} />
                {tarifa.paqueteria} · {tarifa.servicio} · {Number(tarifa.importe).toLocaleString('es-MX', { style: 'currency', currency: tarifa.moneda || 'MXN' })}
                {tarifa.diasEntrega ? ` · ${tarifa.diasEntrega} días` : ''}
              </span>
            </label>
          ))}
        </fieldset>
      )}

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