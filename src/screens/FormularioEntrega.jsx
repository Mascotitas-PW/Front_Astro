import { MapaEntrega } from '../Mapa';

// Va fuera del componente: si se define dentro, React lo recrea en cada tecla
// y el input pierde el foco.
const Campo = ({ etiqueta, ancho, children }) => (
  <label className={`grid gap-2 font-semibold ${ancho ? 'sm:col-span-2' : ''}`}>
    {etiqueta}
    {children}
  </label>
);

export default function FormularioEntrega({
  entrega,
  onCambiar,
  metodoPago,
  onMetodoPago,
  onSubmit,
  deshabilitado,
  loading,
}) {
  return (
    <form onSubmit={onSubmit} className="neu-card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <Campo etiqueta="Nombre completo" ancho>
        <input
          required
          type="text"
          value={entrega.nombre}
          onChange={(e) => onCambiar('nombre', e.target.value)}
          placeholder="Ej. Juan Pérez"
          className="neu-inset w-full px-4 py-3"
        />
      </Campo>

      <Campo etiqueta="Dirección de entrega" ancho>
        <input
          required
          type="text"
          value={entrega.direccion}
          onChange={(e) => onCambiar('direccion', e.target.value)}
          placeholder="Calle, número, colonia, ciudad"
          className="neu-inset w-full px-4 py-3"
        />
      </Campo>

      <MapaEntrega direccion={entrega.direccion} />

      <Campo etiqueta="Teléfono de contacto">
        <input
          required
          type="tel"
          value={entrega.telefono}
          onChange={(e) => onCambiar('telefono', e.target.value)}
          placeholder="10 dígitos"
          className="neu-inset w-full px-4 py-3"
        />
      </Campo>

      <Campo etiqueta="Método de pago">
        <select
          value={metodoPago}
          onChange={(e) => onMetodoPago(e.target.value)}
          className="neu-inset w-full px-4 py-3"
        >
          <option value="Tarjeta">Tarjeta de crédito / débito</option>
          <option value="Efectivo">Efectivo contra entrega</option>
          <option value="Transferencia">Transferencia SPEI</option>
        </select>
      </Campo>

      {metodoPago !== 'Tarjeta' && (
        <button
          type="submit"
          disabled={deshabilitado}
          className="neu-btn neu-btn-primary py-4 text-lg sm:col-span-2"
        >
          {loading ? 'Procesando pedido...' : 'Confirmar y enviar pedido'}
        </button>
      )}
    </form>
  );
}
