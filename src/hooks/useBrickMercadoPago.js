import { useEffect, useRef } from 'react';

const MERCADOPAGO_PUBLIC_KEY = import.meta.env.PUBLIC_MP_KEY;

// Id del <div> donde se dibuja el formulario de tarjeta
export const BRICK_CONTAINER_ID = 'cardPaymentBrick_container';

function cargarSdkMercadoPago() {
  if (window.MercadoPago) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-mercadopago-sdk="true"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.dataset.mercadopagoSdk = 'true';
      document.head.appendChild(script);
    }

    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => reject(new Error('No se pudo cargar Mercado Pago.')), { once: true });
  });
}

/**
 * Monta el Brick de tarjeta mientras `activo` sea true.
 * - onSubmit(formData): debe devolver una promesa; si rechaza, el Brick muestra el fallo.
 * - onReady(): el formulario ya se dibujó.
 * - onError(mensaje): algo falló al cargar o dentro del formulario.
 */
export function useBrickMercadoPago({ activo, total, onSubmit, onReady, onError }) {
  // El Brick guarda sus callbacks al montarse; la ref evita usar datos viejos.
  const callbacks = useRef({});
  callbacks.current = { onSubmit, onReady, onError };

  useEffect(() => {
    if (!activo || !total) return undefined;

    if (!MERCADOPAGO_PUBLIC_KEY) {
      callbacks.current.onError('Configura PUBLIC_MP_KEY para habilitar el pago con tarjeta.');
      return undefined;
    }

    let cancelado = false;
    let brick;

    const montar = async () => {
      try {
        await cargarSdkMercadoPago();
        if (cancelado) return;

        const mercadoPago = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'es-MX' });
        const controlador = await mercadoPago.bricks().create('cardPayment', BRICK_CONTAINER_ID, {
          initialization: { amount: Number(total.toFixed(2)) },
          callbacks: {
            onReady: () => callbacks.current.onReady?.(),
            onSubmit: (formData) => callbacks.current.onSubmit(formData),
            onError: (error) => {
              console.error('Error en Mercado Pago Brick:', error);
              callbacks.current.onError('Ocurrió un error en el formulario de pago.');
            },
          },
        });

        if (cancelado) controlador.unmount();
        else brick = controlador;
      } catch (error) {
        if (!cancelado) callbacks.current.onError(error.message || 'No se pudo iniciar Mercado Pago.');
      }
    };

    montar();
    return () => {
      cancelado = true;
      brick?.unmount();
    };
  }, [activo, total]);
}