export function obtenerUsuarioSesion() {
  if (typeof window === 'undefined') return null;

  const id = sessionStorage.getItem('usuarioId') || sessionStorage.getItem('id');
  const email = sessionStorage.getItem('adminemail') || sessionStorage.getItem('email');
  const nombre = sessionStorage.getItem('usuarioNombre') || sessionStorage.getItem('adminNombre');
  const rol = sessionStorage.getItem('usuarioRol');

  if (id || email) {
    return { id: id ? Number(id) : null, email, nombre, rol };
  }
  return null;
}

// Guarda la sesión (login normal y Google devuelven { token, usuario })
export function guardarSesion(payload) {
  const u = payload.usuario ?? payload;
  sessionStorage.setItem('token', payload.token);
  sessionStorage.setItem('usuarioId', String(u.id));
  sessionStorage.setItem('adminemail', u.email);
  sessionStorage.setItem('usuarioNombre', u.nombre);
  sessionStorage.setItem('usuarioRol', u.rol);
}

export function cerrarSesion() {
  if (typeof window !== 'undefined') sessionStorage.clear();
}
