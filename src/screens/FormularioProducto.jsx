import { useState } from 'react';
import { subirImagen, urlImagen } from '../services/imagenes';

const campo = { display: 'grid', gap: 4, marginBottom: '0.9rem' };
const entrada = { padding: '0.6rem', borderRadius: 8, border: '1px solid #D9C9A0', fontSize: '1rem' };
const boton = { border: 0, borderRadius: 8, padding: '0.6rem 1.2rem', cursor: 'pointer', color: '#fff', fontWeight: 600 };

const VACIO = { nombre: '', precio: '', stock: '', categoriaId: '', imagen: '' };

export function FormularioProducto({
  inicial = null, categorias = [], guardando = false,
  textoBoton = 'Guardar', onGuardar, onCancelar,
}) {
  const [datos, setDatos] = useState(
    inicial
      ? {
          nombre: inicial.nombre ?? '',
          precio: inicial.precio ?? '',
          stock: inicial.stock ?? '',
          categoriaId: inicial.categoriaId ?? '',
          imagen: inicial.imagen ?? '',
        }
      : VACIO,
  );
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));

  function elegirArchivo(e) {
    const f = e.target.files?.[0];
    setArchivo(f ?? null);
    setVista(f ? URL.createObjectURL(f) : null);
  }

  async function enviar(e) {
    e.preventDefault();
    setError(null);

    if (datos.nombre.trim().length < 2) return setError('Escribe el nombre del producto.');
    if (!(Number(datos.precio) > 0)) return setError('El precio debe ser mayor a 0.');
    if (!Number.isInteger(Number(datos.stock)) || Number(datos.stock) < 0)
      return setError('El stock debe ser un entero de 0 o más.');
    if (!datos.categoriaId) return setError('Elige una categoría.');
    if (!archivo && !datos.imagen) return setError('Sube una imagen del producto.');

    try {
      let imagen = datos.imagen;
      if (archivo) {
        setSubiendo(true);
        imagen = await subirImagen(archivo);
      }

      const ok = await onGuardar({ ...datos, imagen });

      if (ok && !inicial) {
        setDatos(VACIO);
        setArchivo(null);
        setVista(null);
        e.target.reset();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  const ocupado = guardando || subiendo;
  const previa = vista || (datos.imagen ? urlImagen(datos.imagen) : null);

  return (
    <form onSubmit={enviar} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 520 }}>
      <label style={campo}>
        Nombre
        <input style={entrada} name="nombre" value={datos.nombre} onChange={cambiar} />
      </label>

      <label style={campo}>
        Precio (MXN)
        <input style={entrada} name="precio" type="number" step="0.01" min="0" value={datos.precio} onChange={cambiar} />
      </label>

      <label style={campo}>
        Stock
        <input style={entrada} name="stock" type="number" step="1" min="0" value={datos.stock} onChange={cambiar} />
      </label>

      <label style={campo}>
        Categoría
        <select style={entrada} name="categoriaId" value={datos.categoriaId} onChange={cambiar}>
          <option value="">Selecciona…</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </label>

      <label style={campo}>
        Imagen (JPG, PNG o WEBP, máx. 5 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirArchivo} />
      </label>

      {previa && (
        <img src={previa} alt="Vista previa" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: '0.9rem' }} />
      )}

      {error && <p style={{ color: '#A32D2D', margin: '0 0 0.9rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button type="submit" disabled={ocupado} style={{ ...boton, background: '#E8734A', opacity: ocupado ? 0.6 : 1 }}>
          {subiendo ? 'Subiendo imagen…' : guardando ? 'Guardando…' : textoBoton}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} style={{ ...boton, background: '#888' }}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

export default FormularioProducto;
