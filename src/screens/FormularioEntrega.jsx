import { MapaEntrega } from '../components/Mapa';

export default function FormularioEntrega({
  entrega, onCambiar, onUbicacion,
  metodoPago, onMetodoPago, onSubmit, deshabilitado, loading,
}) {
  return (
    <form onSubmit={onSubmit} className="neu-card form-grid">
      <label className="field span-2">
        Nombre completo
        <input required type="text" value={entrega.nombre}
          onChange={(e) => onCambiar('nombre', e.target.value)} placeholder="Ej. Juan Pérez" />
      </label>

      <label className="field span-2">
        Dirección de entrega
        <input required type="text" value={entrega.direccion}
          onChange={(e) => onCambiar('direccion', e.target.value)} placeholder="Calle, número, colonia, ciudad" />
      </label>

      <MapaEntrega
        direccion={entrega.direccion}
        ubicacion={entrega.lat != null ? { lat: entrega.lat, lng: entrega.lng } : null}
        onUbicacion={onUbicacion}
        onDireccion={(texto) => onCambiar('direccion', texto)}
      />

      <label className="field">
        Teléfono de contacto
        <input required type="tel" value={entrega.telefono}
          onChange={(e) => onCambiar('telefono', e.target.value)} placeholder="10 dígitos" />
      </label>

      <label className="field">
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
