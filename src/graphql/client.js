import { cerrarSesion, tokenVigente } from '../auth/auth';
import { t } from '../i18n';

const configuredGraphqlEndpoint =
  import.meta.env.PUBLIC_GRAPHQL_URL ||
  'https://back-astro.onrender.com/graphql';

const graphqlEndpointUrl = new URL(configuredGraphqlEndpoint);
if (graphqlEndpointUrl.hostname === 'back-astro.onrender.com') {
  graphqlEndpointUrl.protocol = 'https:';
}

export const GRAPHQL_ENDPOINT = graphqlEndpointUrl.toString().replace(/\/$/, '');
export const API_BASE_URL = GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, '');

export const MENSAJE_SESION_EXPIRADA = 'Tu sesión expiró. Vuelve a iniciar sesión.';

export function obtenerToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && !tokenVigente(token)) {
    cerrarSesion();
    window.dispatchEvent(new Event('sesion-expirada'));
    return null;
  }
  return token;
}

export function obtenerTokenRequerido(mensaje = 'Inicia sesión para continuar.') {
  const token = obtenerToken();
  if (!token) throw new Error(mensaje);
  return token;
}

export async function fetchGraphQL(query, variables = {}) {
  const token = obtenerToken();
  let res;
  try {
    res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new Error(t('sinRed'));
  }

  const json = await res.json();
  if (json.errors) {
    const e = json.errors[0];
    if (e.extensions?.code === 'AUTH_NOT_AUTHENTICATED') {
      cerrarSesion();
      window.dispatchEvent(new Event('sesion-expirada'));
      throw new Error(MENSAJE_SESION_EXPIRADA);
    }
    throw new Error(e.message);
  }
  return json.data;
}