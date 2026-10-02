export function obtenerUsuarioSesion() {
  if (typeof window === 'undefined') return null;


  const id = sessionStorage.getItem("usuarioId") || sessionStorage.getItem("id");
  const email = sessionStorage.getItem("adminemail") || sessionStorage.getItem("email");
  const nombre = sessionStorage.getItem("usuarioNombre") || sessionStorage.getItem("adminNombre");
  const rol = sessionStorage.getItem("usuarioRol");

  // Si existe al menos un email o ID, consideramos que la sesión está activa
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