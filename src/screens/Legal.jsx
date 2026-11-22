import { useStore } from '../hooks/useStore';
import { t } from '../i18n';

const R = {
  nombre: 'Eduardo Chavarría',
  domicilio: 'Av. Reforma 123, Ciudad de México, C.P. 06600',
  correo: 'privacidad@mascotitas.com',
  ciudad: 'Ciudad de México (CDMX)',
};
const ACTUALIZACION = 'Noviembre de 2026';

function Pagina({ titulo, children }) {
  const { cambiarPantalla } = useStore();
  return (
    <main className="page legal">
      <button type="button" className="neu-btn neu-btn-sm" onClick={() => cambiarPantalla('HOME')}>← Volver a la tienda</button>
      <article className="neu-card">
        <h2>{titulo}</h2>
        <p className="nota">Última actualización: {ACTUALIZACION}</p>
        {children}
      </article>
    </main>
  );
}

export function Terminos() {
  return (
    <Pagina titulo="Términos y condiciones">
      <h3>1. Objeto</h3>
      <p>
        Estos términos regulan el uso de la tienda en línea Mascotitas y la compra de los productos que en ella se ofrecen.
        Al crear una cuenta o realizar un pedido aceptas estos términos.
      </p>
      <h3>2. Cuenta de usuario</h3>
      <p>
        Debes proporcionar datos verdaderos y mantener la confidencialidad de tu contraseña o de tu cuenta de Google.
        Eres responsable de la actividad realizada desde tu cuenta.
      </p>
      <h3>3. Productos y precios</h3>
      <p>
        Los precios se expresan en pesos mexicanos (MXN). La disponibilidad depende del inventario mostrado en el momento de la compra;
        si un producto se agota antes de confirmar tu pedido, no se podrá completar.
      </p>
      <h3>4. Pedidos y formas de pago</h3>
      <p>
        Puedes pagar con tarjeta (Mercado Pago), PayPal y efectivo contra entrega. Los pagos con tarjeta y PayPal los procesan
        directamente esos proveedores; esta tienda no almacena los datos de tu tarjeta. Los pedidos con efectivo o transferencia quedan pendientes
        de pago hasta su confirmación.
      </p>
      <h3>5. Envíos</h3>
      <p>
        Los pedidos se envían al domicilio que capturas al comprar, por medio de paqueterías. Eres responsable de que el domicilio, el teléfono
        y el código postal sean correctos. Los tiempos de entrega son estimados y pueden variar por causas ajenas a la tienda. Cuando el pedido se
        envíe recibirás tu número de guía para darle seguimiento.
      </p>
      <h3>6. Facturación (CFDI)</h3>
      <p>
        Una vez entregado tu pedido puedes solicitar tu factura electrónica (CFDI) capturando tus datos fiscales: RFC, nombre o razón social,
        código postal, régimen fiscal y uso del CFDI. Los datos deben coincidir con tu constancia de situación fiscal. Plazo para solicitarla:
        [PLAZO, por ejemplo: dentro del mes en que se realizó la compra].
      </p>
      <h3>7. Cancelaciones, cambios y devoluciones</h3>
      <p>
      Conforme a la Ley Federal de Protección al Consumidor y a la política vigente de Mascotitas, 
      puedes solicitar la cancelación de tu pedido antes de que sea despachado y gestionar cambios o devoluciones 
      dentro de los 5 días naturales posteriores a la entrega, siempre que el producto conserve su empaque original, etiquetas y buen estado. 
      Por razones de higiene y sanidad animal, los alimentos, premios y productos de uso sanitario o higiénico abiertos o manipulados no admiten devolución.
      </p>
      <h3>8. Propiedad intelectual</h3>
      <p>La marca, el diseño y el contenido de la tienda pertenecen a sus titulares y no pueden usarse sin autorización.</p>
      <h3>9. Limitación de responsabilidad</h3>
      <p>
        La tienda no es responsable por interrupciones del servicio, fallas de proveedores externos (pagos, paqueterías, internet)
        ni por el uso indebido de la cuenta por parte del usuario.
      </p>
      <h3>10. Cambios a estos términos</h3>
      <p>Podemos modificar estos términos. Cuando cambien de forma relevante se te pedirá aceptarlos de nuevo.</p>
      <h3>11. Ley aplicable y jurisdicción</h3>
      <p>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para su interpretación, las partes se someten a los tribunales
        de {R.ciudad}, sin perjuicio de los derechos que la ley otorga al consumidor.
      </p>
    </Pagina>
  );
}

export function Privacidad() {
  return (
    <Pagina titulo="Aviso de privacidad integral">
      <h3>1. Responsable</h3>
      <p>{R.nombre}, con domicilio en {R.domicilio}, es responsable del tratamiento de tus datos personales. Contacto: {R.correo}.</p>

      <h3>2. Datos personales que recabamos</h3>
      <ul>
        <li><strong>Identificación y contacto:</strong> nombre, correo electrónico y teléfono.</li>
        <li><strong>Entrega:</strong> domicilio, código postal y la ubicación en el mapa que marcas para tu pedido.</li>
        <li><strong>Fiscales</strong> (solo si pides factura): RFC, nombre o razón social, código postal, régimen fiscal y uso del CFDI.</li>
        <li><strong>Compra:</strong> historial de pedidos, productos, montos y estado de envío.</li>
        <li><strong>Cuenta con Google:</strong> nombre y correo que Google nos comparte al iniciar sesión.</li>
      </ul>
      <p>
        <strong>Datos de tarjeta:</strong> no los recibimos ni almacenamos; los captura y procesa directamente Mercado Pago o PayPal.
        No recabamos datos personales sensibles.
      </p>

      <h3>3. Finalidades</h3>
      <p><strong>Necesarias:</strong> crear y administrar tu cuenta, procesar y cobrar tus pedidos, entregarlos, generarte la guía de seguimiento,
        emitir y conservar tus facturas, atender aclaraciones y cumplir obligaciones legales y fiscales.</p>
      <p><strong>Adicionales:</strong> por ahora no usamos tus datos para publicidad ni promociones.</p>

      <h3>4. Con quién compartimos tus datos</h3>
      <table className="tabla">
        <thead><tr><th scope="col">Destinatario</th><th scope="col">Para qué</th></tr></thead>
        <tbody>
          <tr><td>Mercado Pago y PayPal</td><td>Cobrar tu pedido</td></tr>
          <tr><td>Paquetería (Estafeta, FedEx u otras, mediante un agregador de envíos)</td><td>Cotizar, generar la guía y entregar tu pedido (nombre, teléfono y domicilio)</td></tr>
          <tr><td>Proveedor autorizado de certificación (PAC)</td><td>Timbrar tu factura electrónica ante el SAT</td></tr>
          <tr><td>Google</td><td>Inicio de sesión con tu cuenta de Google</td></tr>
          <tr><td>OpenStreetMap / Nominatim</td><td>Ubicar en el mapa la dirección que escribes (el texto de la dirección se envía a su servicio)</td></tr>
          <tr><td>Autoridades</td><td>Cuando la ley lo exija, incluido el SAT</td></tr>
        </tbody>
      </table>
      <p>Las imágenes de productos se alojan en un servicio de almacenamiento externo y no contienen datos personales.</p>

      <h3>5. Derechos ARCO y revocación</h3>
      <p>
        Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus datos, o revocar tu consentimiento, escribiendo a
        {' '}{R.correo} con tu nombre, el derecho que ejerces y una forma de contactarte. Responderemos en los plazos que marca la ley. Algunos datos
        (por ejemplo, facturas) deben conservarse por el tiempo que exijan las disposiciones fiscales aplicables.
      </p>

      <h3>6. Almacenamiento en tu navegador</h3>
      <p>
        Usamos el almacenamiento del navegador para mantener tu sesión y guardar temporalmente el catálogo y que cargue más rápido. No usamos cookies
        de rastreo publicitario propias; los servicios de pago e inicio de sesión de terceros pueden usar las suyas.
      </p>

      <h3>7. Cambios al aviso</h3>
      <p>Si este aviso cambia, lo publicaremos aquí y te pediremos aceptar la nueva versión.</p>
    </Pagina>
  );
}

export default Terminos;
