import { useState } from "react";
import "../auth/auth.css";
import { GRAPHQL_ENDPOINT } from "../graphql/client";
import { useStore } from "../store/useStore";
import { useEffect } from "react";
import { obtenerUsuarioSesion } from "../auth/auth";

const MUTATION_LOGIN = `
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) { id nombre email rol }
  }`;

export function Login() {
  const { cambiarPantalla } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: MUTATION_LOGIN,
          variables: { email: email.trim(), password },
        }),
      });
      const result = await res.json();

      if (result.errors?.length) {
        setError(result.errors[0].message);
        return;
      }

      const usuario = result.data?.login;
      if (!usuario) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      sessionStorage.setItem("usuarioId", usuario.id);
      sessionStorage.setItem("adminemail", usuario.email);
      sessionStorage.setItem("usuarioNombre", usuario.nombre);
      sessionStorage.setItem("usuarioRol", usuario.rol);

      cambiarPantalla("HOME");
    } catch (e) {
      console.error("Error de conexión:", e);
      setError("Error de conexión con el servidor de Mascotitas.");
    } finally {
      setCargando(false);
    }
  };
const usuarioActual = obtenerUsuarioSesion();

useEffect(() => {
  if (usuarioActual) {
    alert('Ya has iniciado sesión.');
    cambiarPantalla('HOME');
  }
}, []);
  return (
    <div className="auth-page">
      <div className="card">
        <h1>Mascotitas</h1>
        <p className="tagline">Iniciar sesión</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="contraseña">Contraseña</label>
          <input
            type="password"
            id="contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={{ color: "#A32D2D", marginBottom: 12, fontSize: "0.85rem" }}>{error}</p>}

          <button type="submit" className="btn-main" disabled={cargando}>
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="divider">¿No tienes cuenta?</div>

        <button type="button" className="btn-sec" onClick={() => cambiarPantalla("REGISTER")}>
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Login;