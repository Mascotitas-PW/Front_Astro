import { useState, useRef, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { obtenerUsuarioSesion } from '../auth/auth';
import {
  validarEntrega, itemsInput, cotizarEnvio,
  procesarPagoMercadoPago, crearPedidoConPago, crearPedidoSinPago,
} from '../services/pedidos';
import { useBrickMercadoPago, BRICK_CONTAINER_ID } from '../hooks/useBrickMercadoPago';
import FormularioEntrega from './FormularioEntrega';
import ResumenPedido from './ResumenPedido';
import PedidoConfirmado from './PedidoConfirmado';
import PayPalButton from '../components/PayPalButton';
import { listarDomicilios, guardarDomicilio } from '../services/domicilios';
import { API_BASE_URL } from '../graphql/client';
import { t } from '../i18n';

export const Checkout = ({ onBackToHome }) => {
  const store = useStore();
  const carrito = store.carrito || [];
  const subtotal = store.totalCarrito || 0;
  const [cotizacion, setCotizacion] = useState(null);
  const [rateId, setRateId] = useState('');
  const [cotizando, setCotizando] = useState(false);
  const tarifaSeleccionada = cotizacion?.tarifas?.find((rate) => rate.id === rateId) ?? null;
  const envio = tarifaSeleccionada ? Number(tarifaSeleccionada.importe) : null;
  const total = subtotal + (envio ?? 0);

  const usuario = obtenerUsuarioSesion();
  const usuarioId = usuario?.id ?? null;

  const [entrega, setEntrega] = useState({
    nombre: '', direccion: '', telefono: '', cp: '', estado: '', ciudad: '', colonia: '', lat: null, lng: null,
  });
  const [colonias, setColonias] = useState([]);
  const [consultandoCodigoPostal, setConsultandoCodigoPostal] = useState(false);
  const [errorCodigoPostal, setErrorCodigoPostal] = useState('');
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Domicilios guardados del usuario
  const [domicilios, setDomicilios] = useState([]);
  const [domicilioId, setDomicilioId] = useState('');
  const [guardarDom, setGuardarDom] = useState(false);
  const [aliasDom, setAliasDom] = useState('Casa');

  useEffect(() => {
    if (!usuarioId) return;
    listarDomicilios()
      .then((lista) => {
        setDomicilios(lista);
        const pred = lista.find((d) => d.predeterminado) ?? lista[0];
        if (pred) elegirDomicilio(String(pred.id), lista);
      })
      .catch(() => { /* sin domicilios guardados: el formulario manual sigue funcionando */ });
  }, [usuarioId]);

  useEffect(() => {
    const codigoPostal = entrega.cp;
    if (!/^\d{5}$/.test(codigoPostal)) {
      setColonias([]);
      setConsultandoCodigoPostal(false);
      setErrorCodigoPostal('');
      setEntrega((actual) => ({ ...actual, estado: '', ciudad: '', colonia: '' }));
      return undefined;
    }

    const controller = new AbortController();
    setConsultandoCodigoPostal(true);
    setErrorCodigoPostal('');

    fetch(`${API_BASE_URL}/api/codigos-postales/${codigoPostal}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 404) throw new Error('Código postal no encontrado.');
        if (response.status === 400) throw new Error(data.message || 'Código postal inválido.');
        if (!response.ok) throw new Error(data.message || `No se pudo consultar el código postal (${response.status}).`);
        return data;
      })
      .then((data) => {
        const opcionesColonia = Array.isArray(data.colonias) ? data.colonias : [];
        setColonias(opcionesColonia);
        setErrorCodigoPostal(opcionesColonia.length ? '' : 'El código postal no tiene colonias disponibles.');
        setEntrega((actual) => ({
          ...actual,
          estado: data.estado ?? '',
          ciudad: data.ciudad ?? '',
          colonia: opcionesColonia.includes(actual.colonia)
            ? actual.colonia
            : opcionesColonia.length === 1 ? opcionesColonia[0] : '',
        }));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setColonias([]);
          setErrorCodigoPostal(error.message || 'No se pudo consultar el código postal.');
          setEntrega((actual) => ({ ...actual, estado: '', ciudad: '', colonia: '' }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setConsultandoCodigoPostal(false);
      });

    return () => controller.abort();
  }, [entrega.cp]);

  const elegirDomicilio = (id, lista = domicilios) => {
    setDomicilioId(id);
    const d = lista.find((x) => String(x.id) === String(id));
    if (!d) return;
    setGuardarDom(false);
    setEntrega({
      nombre: d.nombreCompleto,
      direccion: d.direccion,
      telefono: d.telefono,
      cp: d.codigoPostal ?? '',
      estado: d.estado ?? '',
      ciudad: d.ciudad ?? '',
      colonia: d.colonia ?? '',
      lat: d.latitud,
      lng: d.longitud,
    });
    setCotizacion(null);
    setRateId('');
  };

  // El Brick guarda su callback al montarse; la ref evita leer datos viejos
  const entregaRef = useRef(entrega);
  entregaRef.current = entrega;

  const cambiarEntrega = (campo, valor) => {
    setEntrega((e) => campo === 'cp'
      ? { ...e, cp: valor, estado: '', ciudad: '', colonia: '' }
      : { ...e, [campo]: valor });
    if (campo === 'cp') setColonias([]);
    setCotizacion(null);
    setRateId('');
  };
  const cambiarUbicacion = ({ lat, lng }) => setEntrega((e) => ({ ...e, lat, lng }));

  const solicitarCotizacion = async () => {
    const error = validarEntrega(entrega);
    if (error) return setErrorMsg(error);
    if (carrito.length === 0) return setErrorMsg('El carrito está vacío.');

    setCotizando(true);
    setErrorMsg(null);
    try {
      const resultado = await cotizarEnvio({ carrito, entrega });
      setCotizacion(resultado);
      setRateId('');
      if (!resultado.tarifas?.length) setErrorMsg('No hay tarifas para esta dirección.');
    } catch (errorCotizacion) {
      setCotizacion(null);
      setRateId('');
      setErrorMsg(errorCotizacion.message || 'No se pudo cotizar el envío.');
    } finally {
      setCotizando(false);
    }
  };

  const cambiarMetodo = (metodo) => { setErrorMsg(null); setMetodoPago(metodo); };

  const finalizar = (pedido) => {
    setPedidoCreado(pedido);
    store.vaciarCarrito();

    // Si el usuario lo pidió, guarda el domicilio para futuras compras (sin bloquear el pedido)
    const e = entregaRef.current;
    if (guardarDom && !domicilioId) {
      guardarDomicilio({
        alias: aliasDom.trim() || 'Casa',
        nombreCompleto: e.nombre.trim(),
        telefono: e.telefono.replace(/\D/g, ''),
        direccion: e.direccion.trim(),
        codigoPostal: e.cp,
        estado: e.estado,
        ciudad: e.ciudad,
        colonia: e.colonia,
        latitud: e.lat,
        longitud: e.lng,
        predeterminado: domicilios.length === 0,
      }).catch(() => {});
    }
  };

  // Tarjeta: lo dispara el Brick de Mercado Pago
  const pagarConTarjeta = async (formData) => {
    const errEntrega = validarEntrega(entregaRef.current);
    if (errEntrega) { setErrorMsg(errEntrega); throw new Error(errEntrega); }

    if (!tarifaSeleccionada || !cotizacion) {
      const error = new Error('Cotiza el envío y selecciona una tarifa antes de pagar.');
      setErrorMsg(error.message);
      throw error;
    }

    setLoading(true);
    setErrorMsg(null);

    let pago = null;
    try {
      pago = await procesarPagoMercadoPago({
        usuarioId, carrito, formData, email: usuario?.email,
        cotizacionEnvioId: cotizacion.id, rateId: tarifaSeleccionada.id,
      });
      const pedido = await crearPedidoConPago({
        usuarioId, paymentId: pago.id, carrito,
        entrega: { ...entregaRef.current, cotizacionEnvioId: cotizacion.id, rateId: tarifaSeleccionada.id },
      });
      finalizar(pedido);
      return pago;
    } catch (error) {
      console.error('Error procesando pago:', error);
      setErrorMsg(
        pago
          ? `El pago fue aprobado, pero no se pudo guardar el pedido: ${error.message}`
          : error.message || 'No se pudo procesar el pago.',
      );
      if (pago) return pago; // ya cobrado: no hacer fallar al Brick para que no reintente el cobro
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useBrickMercadoPago({
    activo: metodoPago === 'Tarjeta' && !pedidoCreado && !!usuarioId && carrito.length > 0 && !!tarifaSeleccionada,
    total,
    onSubmit: pagarConTarjeta,
    onReady: () => setErrorMsg(null),
    onError: setErrorMsg,
  });

  // PayPal: el back captura el pago y crea el pedido; aquí solo lo mostramos
  const pagoPayPalAprobado = async (resultado) => {
    finalizar(resultado.pedido);
  };

  // Efectivo / transferencia
  const confirmarSinPago = async (e) => {
    e.preventDefault();
    if (metodoPago !== 'Efectivo' && metodoPago !== 'Transferencia') return;

    setErrorMsg(null);
    if (carrito.length === 0) return setErrorMsg('El carrito está vacío.');
    if (!usuarioId) return setErrorMsg('Inicia sesión para completar tu compra.');

    const errEntrega = validarEntrega(entrega);
    if (errEntrega) return setErrorMsg(errEntrega);
    if (!cotizacion || !tarifaSeleccionada) return setErrorMsg('Cotiza el envío y selecciona una tarifa.');

    setLoading(true);
    try {
      finalizar(await crearPedidoSinPago({
        usuarioId, metodoPago, carrito,
        entrega: { ...entrega, cotizacionEnvioId: cotizacion.id, rateId: tarifaSeleccionada.id },
      }));
    } catch (err) {
      console.error('Error al registrar el pedido:', err);
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const volverAlHome = () => (onBackToHome ? onBackToHome() : store.cambiarPantalla('HOME'));

  if (!usuario) {
    return (
      <main className="page" style={{ maxWidth: 560, textAlign: 'center' }}>
        <h2>Inicia sesión para pagar</h2>
        <p>Necesitas una cuenta para completar tu compra.</p>
        <button onClick={() => store.cambiarPantalla('LOGIN')} className="neu-btn neu-btn-primary">
          Ir a iniciar sesión
        </button>
      </main>
    );
  }

  if (pedidoCreado) {
    return (
      <PedidoConfirmado
        pedido={pedidoCreado}
        pagado={metodoPago === 'Tarjeta' || metodoPago === 'PayPal'}
        onVolver={volverAlHome}
      />
    );
  }

  return (
    <main className="page">
      <h2>Confirmar compra</h2>

      {errorMsg && <div role="alert" className="alerta alerta-error">{errorMsg}</div>}

      <div className="checkout-layout">
        <div className="checkout-col">
          <FormularioEntrega
            entrega={entrega}
            colonias={colonias}
            consultandoCodigoPostal={consultandoCodigoPostal}
            errorCodigoPostal={errorCodigoPostal}
            onCambiar={cambiarEntrega}
            onUbicacion={cambiarUbicacion}
            domicilios={domicilios}
            domicilioId={domicilioId}
            onElegirDomicilio={(id) => (id ? elegirDomicilio(id) : setDomicilioId(''))}
            guardarDom={guardarDom}
            onGuardarDom={setGuardarDom}
            aliasDom={aliasDom}
            onAliasDom={setAliasDom}
            metodoPago={metodoPago}
            onMetodoPago={cambiarMetodo}
            onSubmit={confirmarSinPago}
            deshabilitado={loading || carrito.length === 0}
            loading={loading}
            tarifas={cotizacion?.tarifas ?? []}
            cotizacionEnvioId={cotizacion?.id}
            rateId={rateId}
            onRateId={setRateId}
            onCotizar={solicitarCotizacion}
            cotizando={cotizando}
          />

          {metodoPago === 'Tarjeta' && <div id={BRICK_CONTAINER_ID} className="neu-card pago-bloque" />}

          {metodoPago === 'PayPal' && (
            <div className="neu-card pago-bloque">
              <h3>Pagar con PayPal</h3>
              <PayPalButton
                items={itemsInput(carrito)}
                usuarioId={usuarioId}
                nombreCompleto={entrega.nombre}
                direccionEntrega={entrega.direccion}
                telefono={entrega.telefono}
                codigoPostal={entrega.cp}
                estado={entrega.estado}
                ciudad={entrega.ciudad}
                colonia={entrega.colonia}
                latitud={entrega.lat}
                longitud={entrega.lng}
                cotizacionEnvioId={cotizacion?.id}
                rateId={tarifaSeleccionada?.id}
                onApproved={pagoPayPalAprobado}
                onError={(err) => setErrorMsg(err?.message || 'No se pudo completar el pago con PayPal.')}
                disabled={carrito.length === 0 || !tarifaSeleccionada}
              />
            </div>
          )}
        </div>

        <ResumenPedido carrito={carrito} subtotal={subtotal} envio={envio} total={total} />
      </div>
    </main>
  );
};

export default Checkout;