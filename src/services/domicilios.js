import { fetchGraphQL } from '../graphql/client';

const CAMPOS = 'id alias nombreCompleto telefono direccion codigoPostal latitud longitud predeterminado';

export async function listarDomicilios() {
  const d = await fetchGraphQL(`query { misDomicilios { ${CAMPOS} } }`);
  return d.misDomicilios;
}

// Crea (sin id) o actualiza (con id) un domicilio del usuario
export async function guardarDomicilio(dom) {
  const d = await fetchGraphQL(
    `mutation ($input: DomicilioInput!) { guardarDomicilio(input: $input) { ${CAMPOS} } }`,
    {
      input: {
        id: dom.id ?? null,
        alias: dom.alias,
        nombreCompleto: dom.nombreCompleto,
        telefono: dom.telefono,
        direccion: dom.direccion,
        codigoPostal: dom.codigoPostal || null,
        latitud: dom.latitud ?? null,
        longitud: dom.longitud ?? null,
        predeterminado: !!dom.predeterminado,
      },
    },
  );
  return d.guardarDomicilio;
}

export async function eliminarDomicilio(id) {
  await fetchGraphQL('mutation ($id: Int!) { eliminarDomicilio(id: $id) }', { id });
}
