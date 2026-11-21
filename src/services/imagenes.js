import { GRAPHQL_ENDPOINT, obtenerToken } from '../graphql/client';
const BASE = GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, '');

const SUBIDA = /^[0-9a-f]{32}\.(jpe?g|png|webp)$/i;

// Imagen de respaldo (existe en public/icons)
export const SIN_IMAGEN = `${import.meta.env.BASE_URL}icons/mascotitas-192.png`;

export function urlImagen(imagen) {
  if (!imagen) return '';
  if (/^(https?:)?\/\//.test(imagen) || imagen.startsWith('/')) return imagen;
  if (SUBIDA.test(imagen)) return `${BASE}/images/${imagen}`;
  return '';
}

// Sube un archivo (solo Admin) y devuelve la URL (Cloudinary) o el nombre guardado en el servidor.
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