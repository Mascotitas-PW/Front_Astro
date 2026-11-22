import { dinero } from '../services/pedidos';
import { t } from '../i18n';

export default function ResumenPedido({ carrito, subtotal, envio, iva, total }) {
  return (
    <aside className="neu-card resumen">
      <h3>{t('Resumen del pedido')}</h3>

      {carrito.length === 0 ? (
        <p>{t('Tu carrito está vacío.')}</p>
      ) : (
        carrito.map((item) => (
          <div key={item.id} className="resumen-linea">
            <span>{item.nombre} (x{item.cantidad})</span>
            <span>{dinero(item.precio * item.cantidad)}</span>
          </div>
        ))
      )}

      <hr />
      <div className="resumen-linea">
        <span>{t('Subtotal')}</span>
        <span>{dinero(subtotal)}</span>
      </div>
      <div className="resumen-linea">
        <span>{t('Envío')}</span>
        <span>{envio == null ? t('Cotiza para ver el costo') : dinero(envio)}</span>
      </div>
      <div className="resumen-linea">
        <span>{t('IVA (16%)')}</span>
        <span>{dinero(iva ?? Math.max(0, total - subtotal - (envio ?? 0)))}</span>
      </div>
      <div className="resumen-linea resumen-total">
        <span>{t('Total')}</span>
        <span>{dinero(total)}</span>
      </div>
    </aside>
  );
}

export { ResumenPedido };