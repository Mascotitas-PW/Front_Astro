import "../auth/auth.css";
import { GRAPHQL_ENDPOINT } from "../graphql/client";

export function Registro({ cambiarPantalla }) {

  const validarregistro = async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const contraseña = document.getElementById("contraseña").value;
    const contraseña2 = document.getElementById("contraseña2").value;

    if (!nombre || !email || !contraseña || !contraseña2) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (contraseña !== contraseña2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (contraseña.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
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
            mutation ($nombre: String!, $email: String!, $password: String!) {
              registrar(nombre: $nombre, email: $email, password: $password)
            }
          `,
          variables: {
            nombre: nombre,
            email: email,
            password: contraseña
          }
        })
      });

      const response = await res.json();

      if (!res.ok || response.errors?.length) {
        alert(response.errors?.[0]?.message || "Error al crear la cuenta.");
        return;
      }

      if (response.data?.registrar) {
        sessionStorage.setItem("adminNombre", nombre);
        alert("Cuenta creada correctamente.");

        // Redirección usando la función cambiarPantalla de tu SPA
        if (cambiarPantalla) {
          cambiarPantalla("LOGIN");
        }
      } else {
        alert("El servidor no confirmó la creación de la cuenta.");
      }

    } catch (e) {
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="auth-page">
      <div className="card">

        <h1>Mascotitas</h1>

        <p className="tagline">
          Crear cuenta
        </p>

        <form onSubmit={validarregistro}>

          <label htmlFor="nombre">
            Nombre de usuario
          </label>

          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Nombre de usuario"
          />

          <label htmlFor="email">
            Email
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
          />

          <label htmlFor="contraseña">
            Contraseña
          </label>

          <input
            type="password"
            id="contraseña"
            name="contraseña"
            placeholder="Crea una contraseña"
          />

          <label htmlFor="contraseña2">
            Confirmar contraseña
          </label>

          <input
            type="password"
            id="contraseña2"
            name="contraseña2"
            placeholder="Repite tu contraseña"
          />

          <button type="submit" className="btn-main">
            Crear cuenta
          </button>

        </form>

        <div className="divider">
          ¿Ya tienes cuenta?
        </div>

        <button 
          type="button" 
          className="btn-sec" 
          onClick={() => cambiarPantalla && cambiarPantalla("LOGIN")}
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

export default Registro;