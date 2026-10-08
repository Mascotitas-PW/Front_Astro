import { useStore } from '../store/useStore';

const { cambiarPantalla } = useStore();

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

export const cerrarSesion = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }

  // igualo una funcion a mi useStore para poder salir de la sesión y el .getState es para 
  // poder usarlo fuera de un componente de tipo react
  const store = useStore.getState();
  
  if (store.cambiarPantalla) {
    store.cambiarPantalla('HOME');
  }
};