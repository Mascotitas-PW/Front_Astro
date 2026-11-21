import { useStore } from '../hooks/useStore';
import { t } from '../i18n';

export default function Footer() {
  const { cambiarPantalla } = useStore();
  return (
    <footer className="footer">
      <p className="footer-brand">Mascotitas</p>
      <nav aria-label={t('navLegal')}>
        <button type="button" className="enlace" onClick={() => cambiarPantalla('TERMINOS')}>{t('legalTerminos')}</button>
        {' · '}
        <button type="button" className="enlace" onClick={() => cambiarPantalla('PRIVACIDAD')}>{t('legalPrivacidad')}</button>
      </nav>
      <p className="footer-copy">© 2026 Mascotitas — {t('heroTitulo')}</p>
    </footer>
  );
}