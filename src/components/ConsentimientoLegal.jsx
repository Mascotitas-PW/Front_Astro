import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { terminosAceptados, aceptarTerminos } from '../services/legal';

// Pide aceptar términos y aviso de privacidad la primera vez que el usuario inicia sesión
// (correo o Google) y cada vez que cambia la versión de los textos.
export function ConsentimientoLegal() {
  const { usuario, pantalla, cambiarPantalla, cerrarSesion } = useStore();
  const usuarioId = usuario?.id ?? null;

  const [pendiente, setPendiente] = useState(false);
  const [acepto, setAcepto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPendiente(false);
    setAcepto(false);
    if (!usuarioId) return;
    let cancelado = false;
    terminosAceptados()
      .then((ok) => { if (!cancelado) setPendiente(!ok); })
      .catch(() => { /* si falla la consulta no se bloquea la tienda */ });
    return () => { cancelado = true; };
  }, [usuarioId]);

  const leyendo = pantalla === 'TERMINOS' || pantalla === 'PRIVACIDAD';
  if (!pendiente || leyendo) return null;

  const aceptar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await aceptarTerminos();
      setPendiente(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="titulo-legal">
      <div className="neu-card modal">
        <h3 id="titulo-legal">Antes de continuar</h3>
        <p>
          Para usar tu cuenta y comprar necesitas aceptar nuestros términos y el tratamiento de tus datos personales
          (nombre, contacto, domicilio, ubicación y datos fiscales).
        </p>
        <p>
          <button type="button" className="enlace" onClick={() => cambiarPantalla('TERMINOS')}>Leer términos y condiciones</button>
          {' · '}
          <button type="button" className="enlace" onClick={() => cambiarPantalla('PRIVACIDAD')}>Leer aviso de privacidad</button>
        </p>

        <label className="consent-check">
          <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span>He leído y acepto los términos y condiciones y el aviso de privacidad.</span>
        </label>

        {error && <div role="alert" className="alerta alerta-error" style={{ marginTop: '1rem' }}>{error}</div>}

        <div className="acciones">
          <button type="button" className="neu-btn" onClick={cerrarSesion}>No acepto</button>
          <button type="button" className="neu-btn neu-btn-primary" disabled={!acepto || guardando} onClick={aceptar}>
            {guardando ? 'Guardando...' : 'Aceptar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsentimientoLegal;
