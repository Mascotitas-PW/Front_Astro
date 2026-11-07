import { useEffect, useRef, useState } from 'react';

const KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;
const CENTRO_MX = { lat: 23.6, lng: -102.5 };

let promesaMaps = null;
function cargarMaps() {
  if (window.google?.maps) return Promise.resolve();
  if (!promesaMaps) {
    promesaMaps = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&language=es&region=MX`;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { promesaMaps = null; reject(new Error('No se pudo cargar Google Maps.')); };
      document.head.appendChild(s);
    });
  }
  return promesaMaps;
}

const geocode = (peticion, callback) => new window.google.maps.Geocoder().geocode(peticion, callback);

/**
 * Mapa para marcar la ubicación de entrega.
 * - Escribir la dirección mueve el pin.
 * - Tocar el mapa, arrastrar el pin o "Usar mi ubicación" fija la ubicación y rellena la dirección.
 * - onUbicacion({ lat, lng }) y onDireccion(texto) avisan al formulario.
 */
export function MapaEntrega({ direccion, ubicacion, onUbicacion, onDireccion }) {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marca = useRef(null);
  const saltarBusqueda = useRef(false);
  const cb = useRef({});
  cb.current = { onUbicacion, onDireccion };

  const [listo, setListo] = useState(false);
  const [aviso, setAviso] = useState(null);

  const colocar = (pos, zoom = 16) => {
    mapa.current.setCenter(pos);
    mapa.current.setZoom(zoom);
    if (!marca.current) {
      marca.current = new window.google.maps.Marker({ map: mapa.current, draggable: true });
      marca.current.addListener('dragend', (ev) =>
        elegir({ lat: ev.latLng.lat(), lng: ev.latLng.lng() }, true));
    }
    marca.current.setPosition(pos);
  };

  const elegir = (pos, rellenarDireccion) => {
    colocar(pos, Math.max(mapa.current.getZoom() || 0, 16));
    cb.current.onUbicacion?.(pos);
    setAviso(null);
    if (rellenarDireccion) {
      geocode({ location: pos }, (res, estado) => {
        if (estado === 'OK' && res[0]) {
          saltarBusqueda.current = true; // evita volver a buscar la dirección que acabamos de poner
          cb.current.onDireccion?.(res[0].formatted_address);
        }
      });
    }
  };

  // Crear el mapa una sola vez
  useEffect(() => {
    if (!KEY || !contenedor.current) return undefined;
    let cancelado = false;
    cargarMaps()
      .then(() => {
        if (cancelado) return;
        mapa.current = new window.google.maps.Map(contenedor.current, {
          center: ubicacion ?? CENTRO_MX,
          zoom: ubicacion ? 16 : 5,
          streetViewControl: false,
          mapTypeControl: false,
        });
        mapa.current.addListener('click', (ev) =>
          elegir({ lat: ev.latLng.lat(), lng: ev.latLng.lng() }, true));
        if (ubicacion) colocar(ubicacion);
        setListo(true);
      })
      .catch((e) => setAviso(e.message));
    return () => { cancelado = true; };
  }, []);

  // Al escribir la dirección, espera a que deje de teclear y busca
  useEffect(() => {
    if (!listo || direccion.trim().length < 8) return undefined;
    if (saltarBusqueda.current) { saltarBusqueda.current = false; return undefined; }
    const t = setTimeout(() => {
      geocode({ address: direccion, region: 'MX' }, (res, estado) => {
        if (estado !== 'OK' || !res[0]) {
          setAviso('No encontramos esa dirección. Toca el mapa para marcar tu ubicación.');
          return;
        }
        const loc = res[0].geometry.location;
        elegir({ lat: loc.lat(), lng: loc.lng() }, false);
      });
    }, 900);
    return () => clearTimeout(t);
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

  if (!KEY) {
    return <p className="nota span-2">Configura PUBLIC_GOOGLE_MAPS_KEY para marcar tu ubicación en el mapa.</p>;
  }

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
      {ubicacion && <p className="nota nota-ok">✓ La ubicación se guardará con tu pedido (puedes arrastrar el pin para ajustarla).</p>}
    </div>
  );
}

/** Mapa de solo lectura para el detalle de una compra. */
export function MapaSoloLectura({ lat, lng }) {
  const cont = useRef(null);

  useEffect(() => {
    if (!KEY || !cont.current) return undefined;
    let cancelado = false;
    cargarMaps()
      .then(() => {
        if (cancelado) return;
        const pos = { lat: Number(lat), lng: Number(lng) };
        const m = new window.google.maps.Map(cont.current, {
          center: pos, zoom: 16, streetViewControl: false, mapTypeControl: false,
        });
        new window.google.maps.Marker({ map: m, position: pos });
      })
      .catch(() => {});
    return () => { cancelado = true; };
  }, [lat, lng]);

  return (
    <div className="mapa-bloque">
      {KEY && <div ref={cont} className="mapa" />}
      <a
        className="neu-btn neu-btn-sm"
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir en Google Maps
      </a>
    </div>
  );
}

export default MapaEntrega;
