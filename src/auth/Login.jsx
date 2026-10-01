import "./auth.css";

function Login() {

  const LOGIN = async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contraseña").value;

    if (!correo || !contraseña) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const res = await fetch("guardar.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accion: "login_admin",
          correo: correo,
          password: contraseña
        })
      });

      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem("adminCorreo", correo);

        alert("Sesión iniciada correctamente");

        window.location.href = "/panpri.html";
      } else {
        alert(data.error || "Usuario o contraseña incorrectos.");
      }

    } catch (e) {
      alert("Error de conexión con el servidor.");
    }
  };

  const irARegister = () => {
    window.location.href = "/Registro";
  };

  return (
    <div className="card">

      <h1>Mascotitas</h1>

      <p className="tagline">
        Iniciar sesión
      </p>

      <form onSubmit={LOGIN}>

        <label htmlFor="correo">
          Correo
        </label>

        <input
          type="email"
          id="correo"
          name="correo"
          placeholder="Ingresa tu correo"
        />

        <label htmlFor="contraseña">
          Contraseña
        </label>

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

      <div className="divider">
        ¿No tienes cuenta?
      </div>

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
```
