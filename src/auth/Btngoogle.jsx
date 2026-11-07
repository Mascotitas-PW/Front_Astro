import { useEffect, useRef } from 'react';
import { fetchGraphQL } from '../graphql/client';

const CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
const MUTATION = `
  mutation ($idToken: String!) {
    loginGoogle(idToken: $idToken) { token usuario { id nombre email rol } }
  }`;

export function BotonGoogle({ onLogin, onError }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const iniciar = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const d = await fetchGraphQL(MUTATION, { idToken: credential });
            onLogin(d.loginGoogle);
          } catch (e) {
            onError(e.message);
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline', size: 'large', text: 'continue_with', width: 320,
      });
    };

    if (window.google?.accounts) return iniciar();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = iniciar;
    document.head.appendChild(s);
  }, []);

  return <div ref={ref} className="flex justify-center" />;
}