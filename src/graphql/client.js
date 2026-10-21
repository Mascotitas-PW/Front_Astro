export const GRAPHQL_ENDPOINT =
  import.meta.env.PUBLIC_GRAPHQL_URL ||
  "https://backastro-production.up.railway.app/graphql";

export function obtenerToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
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