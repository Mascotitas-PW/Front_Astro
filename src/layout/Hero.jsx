import { t } from '../i18n';

export default function Hero() {
  return (
    <section className="hero">
      <h1>{t('heroTitulo')}</h1>
      <p>{t('heroSub')}</p>
    </section>
  );
}