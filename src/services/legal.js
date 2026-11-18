import { fetchGraphQL } from '../graphql/client';

// Súbela (p. ej. '2027-01') cuando cambies los textos: se vuelve a pedir la aceptación.
export const VERSION_LEGAL = '2026-11';

export async function terminosAceptados() {
  const d = await fetchGraphQL('query ($v: String!) { terminosAceptados(version: $v) }', { v: VERSION_LEGAL });
  return d.terminosAceptados;
}

export async function aceptarTerminos() {
  await fetchGraphQL('mutation ($v: String!) { aceptarTerminos(version: $v) }', { v: VERSION_LEGAL });
}
