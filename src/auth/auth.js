const CLAVES_SESION = ['token', 'usuarioId', 'adminemail', 'usuarioNombre', 'usuarioRol'];

// ¿El JWT sigue vigente? (30 s de margen)
export function tokenVigente(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !exp || exp * 1000 > Date.now() + 30000;
  } catch {
    return false;
  }
}

function migrarSesionCompartida() {
  if (localStorage.getItem('token') || !sessionStorage.getItem('token')) return;
  CLAVES_SESION.forEach((clave) => {
    const valor = sessionStorage.getItem(clave);
    if (valor !== null) localStorage.setItem(clave, valor);
  });
  CLAVES_SESION.forEach((clave) => sessionStorage.removeItem(clave));
}

export function obtenerUsuarioSesion() {
  if (typeof window === 'undefined') return null;

  migrarSesionCompartida();

  const token = localStorage.getItem('token');
  if (!token || !tokenVigente(token)) {
    if (token) cerrarSesion();
    return null;
  }

  const id = localStorage.getItem('usuarioId');
  const email = localStorage.getItem('adminemail');
  const nombre = localStorage.getItem('usuarioNombre');
  const rol = localStorage.getItem('usuarioRol');

  if (id || email) return { id: id ? Number(id) : null, email, nombre, rol };
  return null;
}

// Guarda la sesión (login normal y Google devuelven { token, usuario })
export function guardarSesion(payload) {
  if (typeof window === 'undefined') return;
  const u = payload.usuario ?? payload;
  localStorage.setItem('token', payload.token);
  localStorage.setItem('usuarioId', String(u.id));
  localStorage.setItem('adminemail', u.email);
  localStorage.setItem('usuarioNombre', u.nombre);
  localStorage.setItem('usuarioRol', u.rol);
  CLAVES_SESION.forEach((clave) => sessionStorage.removeItem(clave));
}

export function cerrarSesion() {
  if (typeof window !== 'undefined') {
    CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave));
    CLAVES_SESION.forEach((clave) => sessionStorage.removeItem(clave));
  }
}