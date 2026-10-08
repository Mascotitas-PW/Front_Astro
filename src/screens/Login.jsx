import "../auth/auth.css";
import { GRAPHQL_ENDPOINT } from "../graphql/client";

const BASE_URL = import.meta.env.BASE_URL;

function Login() {

  const LOGIN = async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const contraseña = document.getElementById("contraseña").value;

    if (!email || !contraseña) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `
            mutation ($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                id
                nombre
                email
                rol
              }
            }
          `,
          variables: {
            email: email,
            password: contraseña
          }
        })
      });

      const result = await res.json();

      // Verificar si GraphQL devolvió errores de validación o contraseña incorrecta
      if (result.errors && result.errors.length > 0) {
        alert(result.errors[0].message);
      } else if (result.data && result.data.login) {
        const usuario = result.data.login;

        // Guardar sesión del usuario en sessionStorage
        sessionStorage.setItem("usuarioId", usuario.id);
        sessionStorage.setItem("adminemail", usuario.email);
        sessionStorage.setItem("usuarioNombre", usuario.nombre);
        sessionStorage.setItem("usuarioRol", usuario.rol);

        alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);

        // Redirigir al panel principal de Mascotitas
        window.location.href = `BASE_URL`;
      } else {
        alert("Usuario o contraseña incorrectos.");
      }
    } catch (e) {
      console.error("Error de conexión:", e);
      alert("Error de conexión con el servidor de Mascotitas.");
    }
  };

  const irARegister = () => {
    window.location.href = `${BASE_URL}/Registro/`;
  };

  return (
    <div className="card">
      <h1>Mascotitas</h1>

      <p className="tagline">Iniciar sesión</p>

      <form onSubmit={LOGIN}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Ingresa tu email"
        />

        <label htmlFor="contraseña">Contraseña</label>
        <input
          type="password"
          id="contraseña"
          name="contraseña"
          placeholder="Ingresa tu contraseña"
        />

        <button type="submit" className="btn-main">
          Iniciar sesión
        </button>
      </form>

      <div className="divider">¿No tienes cuenta?</div>

      <button
        type="button"
        className="btn-sec"
        onClick={irARegister}
      >
        Registrarse
      </button>
    </div>
  );
}

export default Login;