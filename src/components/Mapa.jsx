import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const CENTRO_MX = [23.6, -102.5];
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Leaflet se carga solo en el navegador (evita errores si Astro renderiza en el servidor)
let promesaLeaflet = null;
const cargarLeaflet = () => {
  if (!promesaLeaflet) promesaLeaflet = import('leaflet').then((m) => m.default ?? m);
  return promesaLeaflet;
};

// Nominatim permite 1 petición por segundo: se espacian para respetar su política
let ultimaPeticion = 0;
async function nominatim(ruta) {
  const espera = Math.max(0, ultimaPeticion + 1100 - Date.now());
  ultimaPeticion = Date.now() + espera;
  if (espera) await new Promise((r) => setTimeout(r, espera));
  const res = await fetch(`${NOMINATIM}${ruta}`);
  if (!res.ok) throw new Error('El buscador de direcciones no respondió.');
  return res.json();
}

// Pin como emoji: evita el problema de los iconos de Leaflet con los bundlers
const icono = (L) =>
  L.divIcon({
    className: 'pin-mapa',
    html: '<span style="font-size:34px;line-height:1;display:block">📍</span>',
    iconSize: [34, 34],
    iconAnchor: [17, 32],
  });

function crearMapa(L, contenedor, centro, zoom) {
  const mapa = L.map(contenedor, { center: centro, zoom });
  L.tileLayer(TILES, { maxZoom: 19, attribution: ATRIBUCION }).addTo(mapa);
  setTimeout(() => mapa.invalidateSize(), 200); // por si el contenedor aún no tenía tamaño
  return mapa;
}

/**
 * Mapa para marcar la ubicación de entrega (OpenStreetMap + Leaflet + Nominatim).
 * - Escribir la dirección mueve el pin.
 * - Tocar el mapa, arrastrar el pin o "Usar mi ubicación" fija la ubicación y rellena la dirección.
 * - onUbicacion({ lat, lng }) y onDireccion(texto) avisan al formulario.
 */
export function MapaEntrega({ direccion, ubicacion, onUbicacion, onDireccion }) {
  const contenedor = useRef(null);
  const leaflet = useRef(null);
  const mapa = useRef(null);
  const marca = useRef(null);
  const saltarBusqueda = useRef(false);
  const direccionRef = useRef(direccion);
  direccionRef.current = direccion;
  const cb = useRef({});
  cb.current = { onUbicacion, onDireccion };

  const [listo, setListo] = useState(false);
  const [aviso, setAviso] = useState(null);

  const colocar = (pos, zoom) => {
    const punto = [pos.lat, pos.lng];
    mapa.current.setView(punto, zoom);
    if (!marca.current) {
      marca.current = leaflet.current
        .marker(punto, { draggable: true, icon: icono(leaflet.current) })
        .addTo(mapa.current);
      marca.current.on('dragend', () => {
        const p = marca.current.getLatLng();
        elegir({ lat: p.lat, lng: p.lng }, true);
      });
    } else {
      marca.current.setLatLng(punto);
    }
  };

  const elegir = async (pos, rellenarDireccion) => {
    if (!mapa.current) return;
    colocar(pos, Math.max(mapa.current.getZoom(), 16));
    cb.current.onUbicacion?.(pos);
    setAviso(null);

    if (rellenarDireccion) {
      try {
        const d = await nominatim(
          `/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}&zoom=18&accept-language=es`,
        );
        if (d?.display_name && d.display_name !== direccionRef.current) {
          saltarBusqueda.current = true; // no volver a buscar la dirección que acabamos de poner
          cb.current.onDireccion?.(d.display_name);
        }
      } catch {
        /* si falla, la ubicación igual queda guardada */
      }
    }
  };

  // Crear el mapa una sola vez
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const L = await cargarLeaflet();
        if (cancelado || !contenedor.current) return;
        leaflet.current = L;
        mapa.current = crearMapa(
          L, contenedor.current,
          ubicacion ? [ubicacion.lat, ubicacion.lng] : CENTRO_MX,
          ubicacion ? 16 : 5,
        );
        mapa.current.on('click', (e) => elegir({ lat: e.latlng.lat, lng: e.latlng.lng }, true));
        if (ubicacion) colocar(ubicacion, 16);
        setListo(true);
      } catch {
        setAviso('No se pudo cargar el mapa.');
      }
    })();
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      marca.current = null;
      setListo(false);
    };
  }, []);

  // Al escribir la dirección, espera a que deje de teclear y la busca
  useEffect(() => {
    if (!listo || direccion.trim().length < 8) return undefined;
    if (saltarBusqueda.current) { saltarBusqueda.current = false; return undefined; }

    let cancelado = false;
    const t = setTimeout(async () => {
      try {
        const datos = await nominatim(
          `/search?format=jsonv2&limit=1&countrycodes=mx&accept-language=es&q=${encodeURIComponent(direccion)}`,
        );
        if (cancelado) return;
        if (!datos?.length) {
          setAviso('No encontramos esa dirección. Toca el mapa para marcar tu ubicación.');
          return;
        }
        elegir({ lat: Number(datos[0].lat), lng: Number(datos[0].lon) }, false);
      } catch {
        if (!cancelado) setAviso('No pudimos buscar la dirección. Toca el mapa para marcarla.');
      }
    }, 1200);
    return () => { cancelado = true; clearTimeout(t); };
  }, [direccion, listo]);

  const usarMiUbicacion = () => {
    if (!listo) return;
    if (!navigator.geolocation) { setAviso('Tu navegador no permite obtener la ubicación.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => elegir({ lat: p.coords.latitude, lng: p.coords.longitude }, true),
      () => setAviso('No pudimos obtener tu ubicación. Revisa los permisos o toca el mapa.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="span-2 mapa-bloque">
      <div className="mapa-barra">
        <strong>Marca tu ubicación de entrega</strong>
        <button type="button" className="neu-btn neu-btn-sm" onClick={usarMiUbicacion}>
          📍 Usar mi ubicación
        </button>
      </div>
      <div ref={contenedor} className="mapa" />
      {aviso && <p className="nota">{aviso}</p>}
      {ubicacion && (
        <p className="nota nota-ok">
          ✓ La ubicación se guardará con tu pedido (puedes arrastrar el pin para ajustarla).
        </p>
      )}
    </div>
  );
}

/** Mapa de solo lectura para el detalle de una compra. */
export function MapaSoloLectura({ lat, lng }) {
  const cont = useRef(null);

  useEffect(() => {
    let cancelado = false;
    let mapa = null;
    (async () => {
      const L = await cargarLeaflet();
      if (cancelado || !cont.current) return;
      const punto = [Number(lat), Number(lng)];
      mapa = crearMapa(L, cont.current, punto, 16);
      L.marker(punto, { icon: icono(L) }).addTo(mapa);
    })().catch(() => {});
    return () => { cancelado = true; mapa?.remove(); };
  }, [lat, lng]);

  return (
    <div className="mapa-bloque">
      <div ref={cont} className="mapa" />
      <a
        className="neu-btn neu-btn-sm"
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir en OpenStreetMap
      </a>
    </div>
  );
}

export default MapaEntrega;