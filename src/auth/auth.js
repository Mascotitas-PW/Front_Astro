const CLAVES_SESION = ['token', 'usuarioId', 'adminemail', 'usuarioNombre', 'usuarioRol'];
const token = localStorage.getItem('token');
if (!token || !tokenVigente(token)) { cerrarSesion(); return null; }


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
  const id = localStorage.getItem('usuarioId') || sessionStorage.getItem('usuarioId') || sessionStorage.getItem('id');
  const email = localStorage.getItem('adminemail') || sessionStorage.getItem('adminemail') || sessionStorage.getItem('email');
  const nombre = localStorage.getItem('usuarioNombre') || sessionStorage.getItem('usuarioNombre') || sessionStorage.getItem('adminNombre');
  const rol = localStorage.getItem('usuarioRol') || sessionStorage.getItem('usuarioRol');

  if (id || email) {
    return { id: id ? Number(id) : null, email, nombre, rol };
  }
  return null;
  
}

export function tokenVigente(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !exp || exp * 1000 > Date.now() + 30000;
  } catch { return false; }
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
