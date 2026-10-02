export const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || "https://backastro-production.up.railway.app/graphql/";

export async function fetchGraphQL(query, variables = {}) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}