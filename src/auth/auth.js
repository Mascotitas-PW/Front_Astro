export function obtenerUsuarioSesion() {
  if (typeof window === 'undefined') return null;

  const id = sessionStorage.getItem("usuarioId") || sessionStorage.getItem("id");
  const email = sessionStorage.getItem("adminemail") || sessionStorage.getItem("email");
  const nombre = sessionStorage.getItem("usuarioNombre") || sessionStorage.getItem("adminNombre");
  const rol = sessionStorage.getItem("usuarioRol");

  if (id || email) {
    return {
      id: id ? Number(id) : null,
      email,
      nombre,
      rol
    };
  }

  return null;
}

export function cerrarSesion() {
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }
}