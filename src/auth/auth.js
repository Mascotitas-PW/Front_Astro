const CLAVES_SESION = ['token', 'usuarioId', 'adminemail', 'usuarioNombre', 'usuarioRol'];

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
