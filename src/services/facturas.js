import { fetchGraphQL, GRAPHQL_ENDPOINT, obtenerToken } from '../graphql/client';

const BASE = GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, '');

const CAMPOS_FACTURA = `
  id pedidoId usuarioId serie folio estado uuid fechaEmision
  subtotal iva total rfcReceptor razonSocialReceptor usoCfdi
  tipoComprobante motivoError
`;

const CAMPOS_DATOS = `
  id alias rfc razonSocial regimenFiscal codigoPostalFiscal domicilioFiscal predeterminado
`;

// ── Queries ──────────────────────────────────────────────────────────────
export async function listarMisFacturas() {
  const d = await fetchGraphQL(`query { misFacturas { ${CAMPOS_FACTURA} } }`);
  return d.misFacturas;
}

export async function listarMisDatosFiscales() {
  const d = await fetchGraphQL(`query { misDatosFiscales { ${CAMPOS_DATOS} } }`);
  return d.misDatosFiscales;
}

export async function obtenerCatalogos() {
  const d = await fetchGraphQL(`
    query {
      catalogoUsosCfdi
      catalogoRegimenesFiscales
    }
  `);
  return {
    usosCfdi: d.catalogoUsosCfdi,
    regimenesFiscales: d.catalogoRegimenesFiscales,
  };
}

// ── Mutaciones ───────────────────────────────────────────────────────────
export async function guardarDatosFiscales(datos) {
  const d = await fetchGraphQL(
    `mutation ($input: DatosFiscalesInput!) {
       guardarDatosFiscales(input: $input) { ${CAMPOS_DATOS} }
     }`,
    { input: datos },
  );
  return d.guardarDatosFiscales;
}

export async function solicitarFactura(input) {
  const d = await fetchGraphQL(
    `mutation ($input: SolicitudFacturaInput!) {
       solicitarFactura(input: $input) { ${CAMPOS_FACTURA} }
     }`,
    { input },
  );
  return d.solicitarFactura;
}

// ── Descargas (REST) ─────────────────────────────────────────────────────
function descargar(url, nombre) {
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
}

export async function descargarXml(facturaId, folio) {
  const token = obtenerToken();
  const resp = await fetch(`${BASE}/api/facturas/${facturaId}/xml`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('No se pudo descargar el XML.');
  const blob = await resp.blob();
  descargar(URL.createObjectURL(blob), `factura-A${folio}.xml`);
}

export async function descargarPdf(facturaId, folio) {
  const token = obtenerToken();
  const resp = await fetch(`${BASE}/api/facturas/${facturaId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('No se pudo descargar la factura.');
  const blob = await resp.blob();
  const ext = blob.type === 'application/pdf' ? 'pdf' : 'html';
  descargar(URL.createObjectURL(blob), `factura-A${folio}.${ext}`);
}

export async function verHtml(facturaId) {
  const token = obtenerToken();
  const resp = await fetch(`${BASE}/api/facturas/${facturaId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('No se pudo abrir la factura.');
  const blob = await resp.blob();
  window.open(URL.createObjectURL(blob), '_blank');
}
