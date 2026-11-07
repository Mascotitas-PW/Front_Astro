import { useEffect, useState } from "react";
import "../auth/auth.css";
import { GRAPHQL_ENDPOINT } from "../graphql/client";
import { useStore } from "../hooks/useStore";
import { obtenerUsuarioSesion } from "../auth/auth";
import { Botongoogle } from "../auth/Btngoogle";

const MUTATION_LOGIN = `
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      usuario { id nombre email rol }
    }
  }`;

// Guarda la sesión en sessionStorage (lo lee obtenerUsuarioSesion y fetchGraphQL)
function guardarEnSessionStorage(payload) {
  const u = payload.usuario;
  sessionStorage.setItem("token", payload.token);
  sessionStorage.setItem("usuarioId", u.id);
  sessionStorage.setItem("adminemail", u.email);
  sessionStorage.setItem("usuarioNombre", u.nombre);
  sessionStorage.setItem("usuarioRol", u.rol);
}

export function Login() {
  const { cambiarPantalla, refrescarUsuario } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión, no tiene caso mostrar el login
  useEffect(() => {
    if (obtenerUsuarioSesion()) cambiarPantalla("HOME");
  }, []);

  // Se usa tanto con correo/contraseña como con Google
  const iniciarSesion = (payload) => {
    guardarEnSessionStorage(payload);
    refrescarUsuario();
    cambiarPantalla("HOME");
  };

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

      const payload = result.data?.login;
      if (!payload) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      iniciarSesion(payload);
    } catch (e) {
      console.error("Error de conexión:", e);
      setError("Error de conexión con el servidor de Mascotitas.");
    } finally {
      setCargando(false);
    }
  };

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

          {error && (
            <p role="alert" style={{ color: "#A32D2D", marginBottom: 12, fontSize: "0.85rem" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-main" disabled={cargando}>
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="divider">o</div>

        <BotonGoogle onLogin={iniciarSesion} onError={setError} />

        <div className="divider">¿No tienes cuenta?</div>

        <button type="button" className="btn-sec" onClick={() => cambiarPantalla("REGISTER")}>
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Login;