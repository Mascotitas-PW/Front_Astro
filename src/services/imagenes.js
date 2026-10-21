import { GRAPHQL_ENDPOINT, obtenerToken } from '../graphql/client';

// https://servidor/graphql  ->  https://servidor
const BASE = GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, '');

// Las imágenes subidas desde el panel tienen nombre tipo "a1b2...(32 hex).png"
// y viven en el backend. Las demás (croquetas.png, etc.) se sirven desde /public del front.
// Si las tuyas están en otra ruta, cambia solo la línea marcada.
const SUBIDA = /^[0-9a-f]{32}\.(jpe?g|png|webp)$/i;

export function urlImagen(imagen) {
  if (!imagen) return '';
  if (/^(https?:)?\/\//.test(imagen) || imagen.startsWith('/')) return imagen;
  if (SUBIDA.test(imagen)) return `${BASE}/images/${imagen}`;
  return `/images/${imagen}`; // <- ruta de las imágenes que ya tenías en el front
}

// Sube un archivo (solo Admin) y devuelve el nombre guardado en el servidor.
export async function subirImagen(archivo) {
  const form = new FormData();
  form.append('file', archivo);

  const token = obtenerToken();
  const res = await fetch(`${BASE}/api/imagenes`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'No se pudo subir la imagen.');
  return json.nombre;
}
