import "./auth.css";

function Registro() {

  const validarregistro = async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contraseña").value;
    const contraseña2 = document.getElementById("contraseña2").value;

    if (!nombre || !correo || !contraseña || !contraseña2) {
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
      const res = await fetch("guardar.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accion: "registro_admin",
          nombre: nombre,
          correo: correo,
          password: contraseña
        })
      });

      const data = await res.json();

      if (data.ok) {

        sessionStorage.setItem("adminNombre", nombre);

        alert("Cuenta creada correctamente.");

        window.location.href = "/Login";

      } else {

        alert(data.error || "Error al crear la cuenta.");

      }

    } catch (e) {
      alert("Error de conexión con el servidor.");
    }
  };

  const irALogin = () => {
    window.location.href = "/Login";
  };

  return (
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

        <label htmlFor="correo">
          Correo
        </label>

        <input
          type="email"
          id="correo"
          name="correo"
          placeholder="Correo"
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
        onClick={irALogin}
      >
        Iniciar sesión
      </button>

    </div>
  );
}

export default Registro;
```
