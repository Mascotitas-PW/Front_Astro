import { useState } from 'react';
import '../auth/auth.css';
import { useStore } from '../hooks/useStore';
import { GRAPHQL_ENDPOINT } from '../graphql/client';
import { guardarSesion } from '../auth/auth';
import { BotonGoogle } from '../auth/Btngoogle';
import { t } from '../i18n';

const MUTATION_REGISTRO = `
  mutation ($nombre: String!, $email: String!, $password: String!) {
    registrar(nombre: $nombre, email: $email, password: $password)
  }`;

export function Registro() {
  const { cambiarPantalla, refrescarUsuario } = useStore();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', password2: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // Registro con Google: el back crea la cuenta si no existe y devuelve la sesión
  const entrarConGoogle = (payload) => {
    guardarSesion(payload);
    refrescarUsuario();
    cambiarPantalla('HOME');
  };

  const enviar = async (event) => {
    event.preventDefault();
    setError(null);

    const nombre = form.nombre.trim();
    const email = form.email.trim();
    if (!nombre || !email || !form.password || !form.password2) return setError(t('Todos los campos son obligatorios.'));
    if (form.password !== form.password2) return setError(t('Las contraseñas no coinciden.'));
    if (form.password.length < 6) return setError(t('La contraseña debe tener al menos 6 caracteres.'));

    setCargando(true);
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: MUTATION_REGISTRO, variables: { nombre, email, password: form.password } }),
      });
      const response = await res.json();

      if (response.errors?.length) return setError(response.errors[0].message);
      if (!response.data?.registrar) return setError(t('El servidor no confirmó la creación de la cuenta.'));

      alert(t('Cuenta creada correctamente. Ahora inicia sesión.'));
      cambiarPantalla('LOGIN');
    } catch {
      setError(t('Error de conexión con el servidor.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h1>Mascotitas</h1>
        <p className="tagline">{t('Crear cuenta')}</p>

        <form onSubmit={enviar}>
          <label htmlFor="nombre">{t('Nombre de usuario')}</label>
          <input
            type="text"
            id="nombre"
            placeholder={t('Nombre de usuario')}
            value={form.nombre}
            onChange={cambiar('nombre')}
          />

          <label htmlFor="email">{t('Email')}</label>
          <input
            type="email"
            id="email"
            placeholder={t('Email')}
            value={form.email}
            onChange={cambiar('email')}
          />

          <label htmlFor="password">{t('Contraseña')}</label>
          <input
            type="password"
            id="password"
            placeholder={t('Crea una contraseña')}
            value={form.password}
            onChange={cambiar('password')}
          />

          <label htmlFor="password2">{t('Confirmar contraseña')}</label>
          <input
            type="password"
            id="password2"
            placeholder={t('Repite tu contraseña')}
            value={form.password2}
            onChange={cambiar('password2')}
          />

          {error && <div role="alert" className="alerta alerta-error">{error}</div>}

          <button type="submit" className="neu-btn neu-btn-primary neu-btn-block" disabled={cargando}>
            {cargando ? t('Creando cuenta...') : t('Crear cuenta')}
          </button>
        </form>

        <div className="divider">{t('o regístrate con')}</div>
        <BotonGoogle onLogin={entrarConGoogle} onError={setError} />

        <div className="divider">{t('¿Ya tienes cuenta?')}</div>
        <button type="button" className="neu-btn neu-btn-block" onClick={() => cambiarPantalla('LOGIN')}>
          {t('Iniciar sesión')}
        </button>
      </div>
    </div>
  );
}

export default Registro;