import { useEffect, useRef, useState } from 'react';

const KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;

function cargarMaps() {
  if (window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}`;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('No se pudo cargar Google Maps.'));
    document.head.appendChild(s);
  });
}

export function MapaEntrega({ direccion }) {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marca = useRef(null);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!KEY) return;
    cargarMaps()
      .then(() => {
        mapa.current = new window.google.maps.Map(contenedor.current, {
          center: { lat: 23.6, lng: -102.5 }, // centro de México
          zoom: 5,
        });
      })
      .catch((e) => setAviso(e.message));
  }, []);

  // Espera a que el usuario deje de escribir antes de buscar
  useEffect(() => {
    if (!mapa.current || direccion.trim().length < 8) return undefined;
    const t = setTimeout(() => {
      new window.google.maps.Geocoder().geocode(
        { address: direccion, region: 'MX' },
        (resultados, estado) => {
          if (estado !== 'OK' || !resultados[0]) {
            setAviso('No encontramos esa dirección en el mapa.');
            return;
          }
          setAviso(null);
          const pos = resultados[0].geometry.location;
          mapa.current.setCenter(pos);
          mapa.current.setZoom(16);
          if (!marca.current) marca.current = new window.google.maps.Marker({ map: mapa.current });
          marca.current.setPosition(pos);
        },
      );
    }, 900);
    return () => clearTimeout(t);
  }, [direccion]);

  if (!KEY) return null;

  return (
    <div className="grid gap-2 sm:col-span-2">
      <div ref={contenedor} className="neu-inset h-64 w-full overflow-hidden" />
      {aviso && <p className="text-sm opacity-70">{aviso}</p>}
    </div>
  );
}