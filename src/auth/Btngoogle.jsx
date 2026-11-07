import { useEffect, useRef } from 'react';
import { fetchGraphQL } from '../graphql/client';

const CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
const MUTATION = `
  mutation ($idToken: String!) {
    loginGoogle(idToken: $idToken) { token usuario { id nombre email rol } }
  }`;

// Sirve igual para iniciar sesión y para registrarse (el back crea la cuenta si no existe)
export function BotonGoogle({ onLogin, onError }) {
  const ref = useRef(null);
  const cb = useRef({});
  cb.current = { onLogin, onError };

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return undefined;
    let cancelado = false;

    const iniciar = () => {
      if (cancelado || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const d = await fetchGraphQL(MUTATION, { idToken: credential });
            cb.current.onLogin(d.loginGoogle);
          } catch (e) {
            cb.current.onError(e.message);
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: 340,
      });
    };

    if (window.google?.accounts?.id) {
      iniciar();
    } else {
      let s = document.querySelector('script[data-google-gsi="true"]');
      if (!s) {
        s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.dataset.googleGsi = 'true';
        document.head.appendChild(s);
      }
      s.addEventListener('load', iniciar, { once: true });
    }
    return () => { cancelado = true; };
  }, []);

  if (!CLIENT_ID) return <p className="nota">Configura PUBLIC_GOOGLE_CLIENT_ID para habilitar Google.</p>;
  return <div ref={ref} className="google-btn" />;
}

export const Botongoogle = BotonGoogle;
export default BotonGoogle;
