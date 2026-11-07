import { useEffect, useRef } from "react";
import { GRAPHQL_ENDPOINT, obtenerToken } from "../graphql/client";
import "./styles/Neumorfismo.css";
import "./styles/global.css";

const PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_ENVIRONMENT = import.meta.env.PUBLIC_PAYPAL_ENVIRONMENT || "sandbox";
const PAYPAL_SDK_URL =
  PAYPAL_ENVIRONMENT === "production"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";
const PAYPAL_API_URL =
  import.meta.env.PUBLIC_PAYPAL_API_URL ||
  GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, "");

function cargarSdkPayPal() {
  if (window.paypal?.createInstance) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-paypal-sdk="true"]');

    if (!script) {
      script = document.createElement("script");
      script.src = PAYPAL_SDK_URL;
      script.async = true;
      script.dataset.paypalSdk = "true";
      document.head.appendChild(script);
    }

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("No se pudo cargar PayPal.")),
      { once: true },
    );
  });
}

async function leerRespuesta(response) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = { message: "El servidor devolvió una respuesta inválida." };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error del servidor (${response.status}).`);
  }

  return data;
}

function validarEntrega({ nombreCompleto, direccionEntrega, telefono }) {
  if (nombreCompleto.trim().length < 3) return "Escribe tu nombre completo.";
  if (direccionEntrega.trim().length < 5) return "Escribe una dirección de entrega válida.";
  if (telefono.replace(/\D/g, "").length !== 10) return "El teléfono debe tener 10 dígitos.";
  return null;
}

export function PayPalButton({
  items,
  usuarioId,
  nombreCompleto,
  direccionEntrega,
  telefono,
  onApproved,
  onError,
  disabled,
}) {
  const containerRef = useRef(null);
  const capturaEnCursoRef = useRef(false);
  const callbacksRef = useRef({
    items,
    usuarioId,
    nombreCompleto,
    direccionEntrega,
    telefono,
    onApproved,
    onError,
  });
  callbacksRef.current = {
    items,
    usuarioId,
    nombreCompleto,
    direccionEntrega,
    telefono,
    onApproved,
    onError,
  };

  useEffect(() => {
    if (disabled || !PAYPAL_CLIENT_ID || !containerRef.current) return undefined;

    let cancelado = false;
    let paypalButton;
    let session;

    const crearOrden = async () => {
      const current = callbacksRef.current;
      const errorEntrega = validarEntrega(current);
      if (errorEntrega) throw new Error(errorEntrega);

      const token = obtenerToken();
      const response = await fetch(`${PAYPAL_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuarioId: Number(current.usuarioId),
          items: current.items,
          nombreCompleto: current.nombreCompleto,
          direccionEntrega: current.direccionEntrega,
          telefono: current.telefono,
        }),
      });
      const data = await leerRespuesta(response);
      if (!data.id) throw new Error("El servidor no devolvió el ID de la orden PayPal.");
      return { orderId: data.id };
    };

    const capturarOrden = async (paypalData) => {
      const orderID = paypalData?.orderID || paypalData?.orderId;
      if (!orderID) throw new Error("PayPal no devolvió el orderID.");
      if (capturaEnCursoRef.current) return null;

      capturaEnCursoRef.current = true;
      const current = callbacksRef.current;
      const token = obtenerToken();
      try {
        const response = await fetch(`${PAYPAL_API_URL}/api/orders/${orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuarioId: Number(current.usuarioId),
            items: current.items,
            nombreCompleto: current.nombreCompleto,
            direccionEntrega: current.direccionEntrega,
            telefono: current.telefono,
          }),
        });
        const data = await leerRespuesta(response);
        if (data.capture?.status !== "COMPLETED") {
          throw new Error(`PayPal no completó el pago (estado: ${data.capture?.status || "desconocido"}).`);
        }
        return data;
      } finally {
        capturaEnCursoRef.current = false;
      }
    };

    const montar = async () => {
      try {
        await cargarSdkPayPal();
        if (cancelado) return;

        const sdk = await window.paypal.createInstance({
          clientId: PAYPAL_CLIENT_ID,
          components: ["paypal-payments"],
        });
        const eligibility = await sdk.findEligibleMethods();

        if (!eligibility.isEligible("paypal")) {
          callbacksRef.current.onError(new Error("PayPal no está disponible para esta cuenta."));
          return;
        }

        session = await sdk.createPayPalOneTimePaymentSession({
          onApprove: async (data) => {
            try {
              const payment = await capturarOrden(data);
              if (payment) await callbacksRef.current.onApproved(payment);
            } catch (error) {
              callbacksRef.current.onError(error);
            }
          },
          onCancel: () => callbacksRef.current.onError(new Error("Pago cancelado.")),
          onError: (error) => callbacksRef.current.onError(error),
        });

        paypalButton = document.createElement("paypal-button");
        paypalButton.addEventListener("click", async () => {
          try {
            const createOrderPromise = crearOrden();
            await session.start({ presentationMode: "auto" }, createOrderPromise);
          } catch (error) {
            callbacksRef.current.onError(error);
          }
        });
        containerRef.current?.append(paypalButton);
      } catch (error) {
        if (!cancelado) callbacksRef.current.onError(error);
      }
    };

    montar();
    return () => {
      cancelado = true;
      paypalButton?.remove();
    };
  }, [disabled]);

  if (!PAYPAL_CLIENT_ID) {
    return <p>Configura PUBLIC_PAYPAL_CLIENT_ID para habilitar PayPal.</p>;
  }

  return <div ref={containerRef} aria-label="Pagar con PayPal" />;
}

export default PayPalButton;