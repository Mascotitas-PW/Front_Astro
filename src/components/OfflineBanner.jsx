import { useEffect, useState } from 'react';
import { t } from '../i18n';
export default function OfflineBanner() {
  const [off, setOff] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const a = () => setOff(true), b = () => setOff(false);
    addEventListener('offline', a); addEventListener('online', b);
    return () => { removeEventListener('offline', a); removeEventListener('online', b); };
  }, []);
  return off ? <div role="status" className="offline-banner">{t('offline')}</div> : null;
}