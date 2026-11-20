const configuredGraphqlEndpoint =
  import.meta.env.PUBLIC_GRAPHQL_URL ||
  "https://back-astro.onrender.com/graphql";

const graphqlEndpointUrl = new URL(configuredGraphqlEndpoint);
if (graphqlEndpointUrl.hostname === "back-astro.onrender.com") {
  graphqlEndpointUrl.protocol = "https:";
}

export const GRAPHQL_ENDPOINT = graphqlEndpointUrl.toString().replace(/\/$/, "");
export const API_BASE_URL = GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, "");

export const GRAPHQL_ENDPOINT =
  import.meta.env.PUBLIC_GRAPHQL_URL ||
  "https://back-astro.onrender.com/graphql";

export function obtenerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export const MENSAJE_SESION_EXPIRADA = "Tu sesión expiró. Cierra sesión y vuelve a iniciar sesión.";

export function obtenerTokenRequerido(mensaje = "Inicia sesión para continuar.") {
  const token = obtenerToken();
  if (!token) throw new Error(mensaje);
  return token;
}

export async function fetchGraphQL(query, variables = {}) {
  const token = obtenerToken();
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}