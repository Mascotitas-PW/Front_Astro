import { useStore } from '../hooks/useStore';
import { t } from '../i18n';
export default function Footer() {
  const { cambiarPantalla } = useStore();
  return (
    <footer className="footer">
      <p className="footer-brand">Mascotitas</p>
      <nav aria-label="Información legal">
        <button type="button" className="enlace" onClick={() => cambiarPantalla('TERMINOS')}>Términos y condiciones</button>
        {' · '}
        <button type="button" className="enlace" onClick={() => cambiarPantalla('PRIVACIDAD')}>Aviso de privacidad</button>
      </nav>
      <p className="footer-copy">© 2026 Mascotitas — Todo lo que necesita tu mascota</p>
    </footer>
  );
}
